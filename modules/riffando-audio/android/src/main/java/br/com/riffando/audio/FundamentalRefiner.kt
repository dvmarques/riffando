package br.com.riffando.audio

import kotlin.math.PI
import kotlin.math.cos
import kotlin.math.hypot
import kotlin.math.ln
import kotlin.math.max
import kotlin.math.min
import kotlin.math.pow
import kotlin.math.sin

/**
 * Refina a estimativa do período medindo a frequência da própria fundamental (primeiro parcial) por DFT com
 * janela de Hann: o período de cordas reais é puxado para cima pela inarmonicidade dos harmônicos. Só
 * devolve valor quando a fundamental se destaca do entorno e é comparável aos harmônicos 2 e 3; caso
 * contrário o chamador mantém a estimativa do período. Mesmo algoritmo de `experiments/gc-014/refine-fundamental.mjs`.
 */
internal class FundamentalRefiner(private val sampleRate: Int, private val size: Int) {
  private val hann = DoubleArray(size) { 0.5 - 0.5 * cos(2 * PI * it / (size - 1)) }

  fun refine(window: DoubleArray, f0: Double): Double? {
    require(window.size == size)
    val lo = f0 * 2.0.pow(-SEARCH_CENTS / 1200.0)
    val hi = f0 * 2.0.pow(SEARCH_CENTS / 1200.0)
    val step = (hi - lo) / (STEPS - 1)
    val magnitudes = DoubleArray(STEPS) { magnitude(window, lo + step * it) }
    var best = 0
    for (index in 1 until STEPS) if (magnitudes[index] > magnitudes[best]) best = index
    if (best == 0 || best == STEPS - 1) return null // pico na borda: ambíguo

    val bin = sampleRate.toDouble() / size
    var floorSum = 0.0
    var floorCount = 0
    for (delta in doubleArrayOf(-3.0, 3.0, -4.0, 4.0)) {
      val frequency = f0 + delta * bin
      if (frequency > 40.0) {
        floorSum += magnitude(window, frequency)
        floorCount++
      }
    }
    val floor = if (floorCount > 0) floorSum / floorCount else 0.0
    if (magnitudes[best] < PROMINENCE * floor) return null
    val harmonic = max(magnitude(window, 2 * f0), magnitude(window, 3 * f0))
    if (magnitudes[best] < MIN_RATIO * harmonic) return null
    if (magnitudes[best - 1] <= 0.0 || magnitudes[best + 1] <= 0.0) return null

    val a = ln(magnitudes[best - 1])
    val b = ln(magnitudes[best])
    val c = ln(magnitudes[best + 1])
    val denominator = a - 2 * b + c
    val offset = if (denominator != 0.0) min(1.0, max(-1.0, 0.5 * (a - c) / denominator)) else 0.0
    return lo + step * (best + offset)
  }

  /** |DFT| com janela de Hann em [frequency]; fasor rotativo evita trigonometria por amostra. */
  private fun magnitude(window: DoubleArray, frequency: Double): Double {
    val omega = 2 * PI * frequency / sampleRate
    val cosOmega = cos(omega)
    val sinOmega = sin(omega)
    var cr = 1.0
    var ci = 0.0
    var re = 0.0
    var im = 0.0
    for (index in 0 until size) {
      val value = window[index] * hann[index]
      re += value * cr
      im -= value * ci
      val nextReal = cr * cosOmega - ci * sinOmega
      ci = cr * sinOmega + ci * cosOmega
      cr = nextReal
    }
    return hypot(re, im)
  }

  private companion object {
    const val SEARCH_CENTS = 15.0
    const val STEPS = 31
    const val PROMINENCE = 6.0
    const val MIN_RATIO = 0.3
  }
}
