package br.com.riffando.audio

import kotlin.math.abs
import kotlin.math.ceil
import kotlin.math.floor
import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToInt

/** Parâmetros iniciais do afinador (GC-014); hipóteses sustentadas por benchmark sintético, a validar no aparelho. */
internal object PitchConfig {
  const val WINDOW_SECONDS = 0.064
  const val HOP_SECONDS = 0.02
  const val SEARCH_MIN_HZ = 70.0
  const val SEARCH_MAX_HZ = 1000.0
  const val PEAK_RATIO_K = 0.9
  const val MIN_CONFIDENCE = 0.90
  const val GATE_DBFS = -50.0
  const val STABILITY_FRAMES = 3
  const val MAX_SPREAD_CENTS = 50.0
  const val EMIT_INTERVAL_NANOS = 100_000_000L
  const val OPERATIONAL_MIN_HZ = 73.0

  /** A 16 kHz notas a partir de ~784 Hz excederam ±5 cents no benchmark sintético. */
  fun operationalMaxHz(sampleRate: Int): Double = if (sampleRate >= 44_100) 988.0 else 523.0
}

internal data class PitchEstimate(val frequencyHz: Double, val confidence: Double)

/**
 * MPM: NSDF (autocorrelação normalizada), máximos-chave entre cruzamentos por zero, primeiro máximo
 * ≥ k × maior e interpolação parabólica. Mesmo algoritmo do benchmark `experiments/gc-014/lib/detectors.mjs`.
 */
internal class MpmPitchDetector(private val sampleRate: Int, private val peakRatio: Double = PitchConfig.PEAK_RATIO_K) {
  val tauMin: Int = floor(sampleRate / PitchConfig.SEARCH_MAX_HZ).toInt()
  val tauMax: Int = ceil(sampleRate / PitchConfig.SEARCH_MIN_HZ).toInt()
  val windowSize: Int = (sampleRate * PitchConfig.WINDOW_SECONDS).roundToInt()
  private val nsdf = DoubleArray(tauMax + 2)

  init {
    require(windowSize - tauMax - 1 >= 8) { "janela curta demais para $sampleRate Hz" }
  }

  /** [window] deve ter exatamente [windowSize] amostras normalizadas em [-1, 1]. */
  fun detect(window: DoubleArray): PitchEstimate? {
    require(window.size == windowSize)
    val integration = window.size - tauMax - 1
    var head = 0.0
    for (i in 0 until integration) head += window[i] * window[i]
    var tail = head
    for (tau in 0..tauMax + 1) {
      if (tau > 0) {
        val entering = window[integration - 1 + tau]
        val leaving = window[tau - 1]
        tail += entering * entering - leaving * leaving
      }
      var correlation = 0.0
      for (i in 0 until integration) correlation += window[i] * window[i + tau]
      val energy = head + tail
      nsdf[tau] = if (energy > 0.0) 2.0 * correlation / energy else 0.0
    }

    var highest = Double.NEGATIVE_INFINITY
    var firstKey = -1
    val keys = IntArray(tauMax)
    var count = 0
    var t = 1
    while (t <= tauMax && nsdf[t] > 0.0) t++ // ignora o lóbulo inicial em τ = 0
    while (t <= tauMax) {
      while (t <= tauMax && nsdf[t] <= 0.0) t++
      var best = -1
      while (t <= tauMax && nsdf[t] > 0.0) {
        if (t >= tauMin && (best < 0 || nsdf[t] > nsdf[best])) best = t
        t++
      }
      if (best > tauMin && best < tauMax) {
        keys[count++] = best
        highest = max(highest, nsdf[best])
      }
    }
    if (count == 0) return null
    for (index in 0 until count) {
      if (nsdf[keys[index]] >= peakRatio * highest) {
        firstKey = keys[index]
        break
      }
    }
    if (firstKey < 0) firstKey = keys[0]

    val offset = parabolicOffset(-nsdf[firstKey - 1], -nsdf[firstKey], -nsdf[firstKey + 1])
    val peak = nsdf[firstKey] - 0.25 * (nsdf[firstKey - 1] - nsdf[firstKey + 1]) * offset
    return PitchEstimate(sampleRate / (firstKey + offset), min(1.0, max(0.0, peak)))
  }

  private fun parabolicOffset(a: Double, b: Double, c: Double): Double {
    val denominator = a - 2 * b + c
    return if (denominator != 0.0) min(1.0, max(-1.0, 0.5 * (a - c) / denominator)) else 0.0
  }
}

internal fun centsBetween(hz: Double, referenceHz: Double): Double =
  1200.0 * kotlin.math.ln(hz / referenceHz) / kotlin.math.ln(2.0)

internal fun absCents(a: Double, b: Double): Double = abs(centsBetween(a, b))
