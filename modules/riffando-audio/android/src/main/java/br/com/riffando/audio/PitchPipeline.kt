package br.com.riffando.audio

import kotlin.math.log10
import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToInt
import kotlin.math.sqrt

/** Estados sem frequência ou nota fictícias, exceto [READING]. */
internal enum class PitchState(val wire: String) {
  READING("reading"),
  NO_SIGNAL("no-signal"),
  UNSTABLE("unstable"),
  UNRELIABLE("unreliable"),
}

internal data class PitchOutput(
  val state: PitchState,
  val frequencyHz: Double?,
  val confidence: Double,
  val rmsDbfs: Double,
  /** true quando a frequência vem da fundamental medida; false quando vem do período (MPM). */
  val refined: Boolean = false,
)

/**
 * Janela deslizante sobre PCM16 mono: gate de nível → MPM → limiar de confiança → estabilizador
 * (K quadros aceitos consecutivos, dispersão ≤ 50 cents, mediana). Usado somente pelo worker de captura.
 * Nenhuma amostra é retida além do anel de [windowSize] amostras e nada é gravado.
 */
internal class PitchPipeline(
  private val sampleRate: Int,
  private val detector: MpmPitchDetector = MpmPitchDetector(sampleRate),
) {
  private val size = detector.windowSize
  private val hop = max(1, (sampleRate * PitchConfig.HOP_SECONDS).roundToInt())
  private val refiner = FundamentalRefiner(sampleRate, size)
  private val ring = DoubleArray(size)
  private val window = DoubleArray(size)
  private var next = 0
  private var filled = 0
  private var sinceLast = 0
  private val history = arrayOfNulls<Double>(PitchConfig.STABILITY_WINDOW)
  private var historyCount = 0
  private var historyHead = 0
  private var gateOpen = false
  private val levels = DoubleArray(PitchConfig.ONSET_LOOKBACK_FRAMES)
  private var levelCount = 0
  private var levelHead = 0
  private var attackFramesLeft = 0

  /** Informa um [PitchOutput] por quadro analisado (hop de ~20 ms). */
  fun push(buffer: ShortArray, count: Int, onFrame: (PitchOutput) -> Unit) {
    require(count in 0..buffer.size)
    for (index in 0 until count) {
      ring[next] = buffer[index] / 32768.0
      next = (next + 1) % size
      if (filled < size) filled++
      sinceLast++
      if (filled == size && sinceLast >= hop) {
        sinceLast = 0
        onFrame(analyze())
      }
    }
  }

  fun reset() {
    next = 0; filled = 0; sinceLast = 0; historyCount = 0; historyHead = 0; gateOpen = false
    levelCount = 0; levelHead = 0; attackFramesLeft = 0
    history.fill(null)
  }

  private fun analyze(): PitchOutput {
    var squared = 0.0
    for (index in 0 until size) {
      val value = ring[(next + index) % size]
      window[index] = value
      squared += value * value
    }
    val rms = sqrt(squared / size)
    val rmsDbfs = if (rms == 0.0) -120.0 else max(-120.0, 20 * log10(rms))
    // Ataque: subida brusca de nível indica nota nova; a afinação do início da nota não é lida.
    var lowest = rmsDbfs
    for (index in 0 until levelCount) lowest = min(lowest, levels[index])
    if (levelCount > 0 && rmsDbfs - lowest >= PitchConfig.ONSET_RISE_DB && attackFramesLeft == 0) {
      attackFramesLeft = PitchConfig.ATTACK_HOLD_FRAMES
    }
    levels[levelHead] = rmsDbfs
    levelHead = (levelHead + 1) % levels.size
    if (levelCount < levels.size) levelCount++
    val threshold = if (gateOpen) PitchConfig.GATE_DBFS else PitchConfig.GATE_REOPEN_DBFS
    if (rmsDbfs < threshold) {
      gateOpen = false
      remember(null)
      return PitchOutput(PitchState.NO_SIGNAL, null, 0.0, rmsDbfs)
    }
    gateOpen = true
    if (attackFramesLeft > 0) {
      attackFramesLeft--
      remember(null)
      return PitchOutput(PitchState.UNSTABLE, null, 0.0, rmsDbfs)
    }
    val estimate = detector.detect(window)
    val accepted = estimate != null &&
      estimate.confidence >= PitchConfig.MIN_CONFIDENCE &&
      estimate.frequencyHz >= PitchConfig.OPERATIONAL_MIN_HZ &&
      estimate.frequencyHz <= PitchConfig.operationalMaxHz(sampleRate)
    if (!accepted) {
      remember(null)
      // Falha curta entre leituras aceitas não derruba a leitura (até 2 quadros); sem nota recente, vira não confiável.
      val held = stableFrequency()
      return if (held != null) {
        PitchOutput(PitchState.READING, held, estimate?.confidence ?: 0.0, rmsDbfs)
      } else {
        PitchOutput(PitchState.UNRELIABLE, null, estimate?.confidence ?: 0.0, rmsDbfs)
      }
    }
    // Fundamental medida (sem o viés de inarmonicidade do período) quando for confiável; senão o período.
    val refinedHz = refiner.refine(window, estimate!!.frequencyHz)
    remember(refinedHz ?: estimate.frequencyHz)
    val stable = stableFrequency()
    return if (stable == null) {
      PitchOutput(PitchState.UNSTABLE, null, estimate.confidence, rmsDbfs)
    } else {
      PitchOutput(PitchState.READING, stable, estimate.confidence, rmsDbfs, refined = refinedHz != null)
    }
  }

  private fun remember(hz: Double?) {
    history[historyHead] = hz
    historyHead = (historyHead + 1) % history.size
    if (historyCount < history.size) historyCount++
  }

  /** Mediana das [PitchConfig.STABILITY_FRAMES] leituras aceitas mais recentes da janela, se concordarem (≤ 50 cents). */
  private fun stableFrequency(): Double? {
    val recent = ArrayList<Double>(PitchConfig.STABILITY_FRAMES)
    for (offset in 1..historyCount) {
      val value = history[(historyHead - offset + history.size) % history.size] ?: continue
      recent += value
      if (recent.size == PitchConfig.STABILITY_FRAMES) break
    }
    if (recent.size < PitchConfig.STABILITY_FRAMES) return null
    val sorted = recent.sorted()
    return if (centsBetween(sorted.last(), sorted.first()) <= PitchConfig.MAX_SPREAD_CENTS) sorted[sorted.size / 2] else null
  }
}
