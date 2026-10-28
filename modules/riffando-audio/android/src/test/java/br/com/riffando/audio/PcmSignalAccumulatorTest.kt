package br.com.riffando.audio

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class PcmSignalAccumulatorTest {
  @Test fun silenceHasSafeFloor() {
    val stats = PcmSignalAccumulator()
    stats.add(shortArrayOf(0, 0, 0), 3)
    val result = stats.snapshotAndReset()!!
    assertEquals(-120.0, result.rmsDbfs, 0.0)
    assertEquals(-120.0, result.peakDbfs, 0.0)
    assertFalse(result.clipping)
    assertEquals(3L, result.sampleCount)
    assertNull(stats.snapshotAndReset())
  }

  @Test fun aggregatesAllBuffersAndResets() {
    val stats = PcmSignalAccumulator()
    stats.add(shortArrayOf(16384, 0), 2)
    stats.add(shortArrayOf(0, 0), 2)
    val result = stats.snapshotAndReset()!!
    assertEquals(-12.0412, result.rmsDbfs, 0.001)
    assertEquals(-6.0206, result.peakDbfs, 0.001)
    assertFalse(result.clipping)
    assertEquals(4L, result.sampleCount)
    assertNull(stats.snapshotAndReset())
  }

  @Test fun negativeFullScaleDoesNotOverflowAndDetectsClipping() {
    val stats = PcmSignalAccumulator()
    stats.add(shortArrayOf(Short.MIN_VALUE, Short.MAX_VALUE), 2)
    val result = stats.snapshotAndReset()!!
    assertTrue(result.rmsDbfs <= 0.0)
    assertEquals(0.0, result.peakDbfs, 0.001)
    assertTrue(result.clipping)
  }

  @Test(expected = IllegalArgumentException::class)
  fun refusesInvalidSampleCount() {
    PcmSignalAccumulator().add(shortArrayOf(1), 2)
  }
}
