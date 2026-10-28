package br.com.riffando.audio

import kotlin.math.abs
import kotlin.math.log10
import kotlin.math.max
import kotlin.math.sqrt

/** Estatística digital de todos os frames desde o último relatório. */
internal data class PcmSignalSnapshot(
  val rmsDbfs: Double,
  val peakDbfs: Double,
  val clipping: Boolean,
  val sampleCount: Long,
)

internal class PcmSignalAccumulator {
  private var squared = 0.0
  private var peak = 0
  private var clipped = false
  private var samples = 0L

  fun add(buffer: ShortArray, count: Int) {
    require(count in 0..buffer.size)
    for (index in 0 until count) {
      val level = abs(buffer[index].toInt()) // -32768 não estoura Int.
      squared += level.toDouble() * level.toDouble()
      peak = max(peak, level)
      if (level >= 32760) clipped = true
    }
    samples += count
  }

  fun snapshotAndReset(): PcmSignalSnapshot? {
    if (samples == 0L) return null
    val normalizedRms = sqrt(squared / samples) / 32768.0
    val normalizedPeak = peak / 32768.0
    val snapshot = PcmSignalSnapshot(
      rmsDbfs = if (normalizedRms == 0.0) -120.0 else max(-120.0, 20 * log10(normalizedRms)),
      peakDbfs = if (normalizedPeak == 0.0) -120.0 else 20 * log10(normalizedPeak),
      clipping = clipped,
      sampleCount = samples
    )
    squared = 0.0
    peak = 0
    clipped = false
    samples = 0L
    return snapshot
  }
}
