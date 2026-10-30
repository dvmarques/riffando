package br.com.riffando.audio

import kotlin.math.log10
import kotlin.math.max
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
  private val ring = DoubleArray(size)
  private val window = DoubleArray(size)
  private var next = 0
  private var filled = 0
  private var sinceLast = 0
  private val history = arrayOfNulls<Double>(PitchConfig.STABILITY_FRAMES)
  private var historyCount = 0
  private var historyHead = 0
  private var gateOpen = false

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
    val threshold = if (gateOpen) PitchConfig.GATE_DBFS else PitchConfig.GATE_REOPEN_DBFS
    if (rmsDbfs < threshold) {
      gateOpen = false
      remember(null)
      return PitchOutput(PitchState.NO_SIGNAL, null, 0.0, rmsDbfs)
    }
    gateOpen = true
    val estimate = detector.detect(window)
    val accepted = estimate != null &&
      estimate.confidence >= PitchConfig.MIN_CONFIDENCE &&
      estimate.frequencyHz >= PitchConfig.OPERATIONAL_MIN_HZ &&
      estimate.frequencyHz <= PitchConfig.operationalMaxHz(sampleRate)
    if (!accepted) {
      remember(null)
      return PitchOutput(PitchState.UNRELIABLE, null, estimate?.confidence ?: 0.0, rmsDbfs)
    }
    remember(estimate!!.frequencyHz)
    val stable = stableFrequency()
    return if (stable == null) {
      PitchOutput(PitchState.UNSTABLE, null, estimate.confidence, rmsDbfs)
    } else {
      PitchOutput(PitchState.READING, stable, estimate.confidence, rmsDbfs)
    }
  }

  private fun remember(hz: Double?) {
    history[historyHead] = hz
    historyHead = (historyHead + 1) % history.size
    if (historyCount < history.size) historyCount++
  }

  private fun stableFrequency(): Double? {
    if (historyCount < history.size) return null
    val values = history.map { it ?: return null }.sorted()
    return if (centsBetween(values.last(), values.first()) <= PitchConfig.MAX_SPREAD_CENTS) values[values.size / 2] else null
  }
}
