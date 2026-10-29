package br.com.riffando.audio

import java.util.concurrent.CountDownLatch
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicInteger
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class CaptureLifecycleTest {
  @Test fun stateFollowsSessionAndWorkerRelease() {
    assertEquals("idle", captureStateOf(hasSession = false, active = false).wire)
    assertEquals("recording", captureStateOf(hasSession = true, active = true).wire)
    // Parada solicitada, mas o worker ainda não liberou o AudioRecord.
    assertEquals("stopping", captureStateOf(hasSession = true, active = false).wire)
  }

  @Test fun startIsIdempotentAndBlockedWhileStopping() {
    assertEquals(StartDecision.CREATE, decideStart(hasSession = false, active = false))
    assertEquals(StartDecision.REUSE_ACTIVE, decideStart(hasSession = true, active = true))
    assertEquals(StartDecision.REJECT_STOPPING, decideStart(hasSession = true, active = false))
  }

  @Test fun startStopCyclesAlwaysReleaseBeforeNextStart() {
    var hasSession = false
    var active = false
    repeat(20) {
      assertEquals(StartDecision.CREATE, decideStart(hasSession, active))
      hasSession = true; active = true
      assertEquals(StartDecision.REUSE_ACTIVE, decideStart(hasSession, active))
      active = false // stop solicitado
      assertEquals(StartDecision.REJECT_STOPPING, decideStart(hasSession, active))
      hasSession = false // worker liberou
    }
  }

  @Test fun concurrentStartsCreateOnlyOneSession() {
    // Contrato do módulo: decisão e criação sob o mesmo lock.
    val lock = Any()
    var hasSession = false
    val created = AtomicInteger()
    val pool = Executors.newFixedThreadPool(8)
    val ready = CountDownLatch(8)
    val go = CountDownLatch(1)
    repeat(8) {
      pool.execute {
        ready.countDown(); go.await()
        synchronized(lock) {
          if (decideStart(hasSession, active = true) == StartDecision.CREATE) {
            created.incrementAndGet(); hasSession = true
          }
        }
      }
    }
    ready.await(); go.countDown()
    pool.shutdown()
    assertTrue(pool.awaitTermination(5, TimeUnit.SECONDS))
    assertEquals(1, created.get())
  }

  @Test fun unavailableTimestampNeverInventsValues() {
    val reading = timestampReading(available = false, nanoTime = 123L, framePosition = 456L)
    assertEquals(TIMESTAMP_ORIGIN_UNAVAILABLE, reading.origin)
    assertEquals("", reading.nanos)
    assertEquals(-1.0, reading.frame, 0.0)
  }

  @Test fun availableTimestampIsReportedFromAudioRecordUnchanged() {
    val reading = timestampReading(available = true, nanoTime = 9_000_000_123L, framePosition = 48_000L)
    assertEquals(TIMESTAMP_ORIGIN_AUDIO_RECORD, reading.origin)
    assertEquals("9000000123", reading.nanos)
    assertEquals(48_000.0, reading.frame, 0.0)
  }
}
