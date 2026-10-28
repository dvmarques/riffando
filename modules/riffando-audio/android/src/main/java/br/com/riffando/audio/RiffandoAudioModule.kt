package br.com.riffando.audio

import android.Manifest
import android.content.pm.PackageManager
import android.media.AudioFormat
import android.media.AudioManager
import android.media.AudioRecord
import android.media.AudioTimestamp
import android.media.MediaRecorder
import android.os.Build
import androidx.core.content.ContextCompat
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.util.concurrent.atomic.AtomicBoolean
import kotlin.math.abs
import kotlin.math.log10
import kotlin.math.max
import kotlin.math.sqrt

/**
 * Captura somente em memória. Nunca encaminha amostras PCM para JavaScript.
 *
 * O worker publica apenas estatísticas em intervalos limitados. Nenhuma medida de
 * latência é inferida a partir do horário de entrega dos eventos à interface.
 */
class RiffandoAudioModule : Module() {
  private val lock = Any()
  private var current: Session? = null

  private class Session(
    val recorder: AudioRecord,
    val sampleRate: Int,
    val source: Int,
    val bufferBytes: Int,
    val readSamples: Int,
  ) {
    val active = AtomicBoolean(true)
    var worker: Thread? = null
  }

  override fun definition() = ModuleDefinition {
    Name("RiffandoAudio")
    Events("onMetrics", "onCaptureError")

    AsyncFunction("startCapture") {
      startCaptureInternal()
    }

    AsyncFunction("stopCapture") {
      stopCaptureInternal()
    }

    AsyncFunction("getCaptureStatus") {
      synchronized(lock) {
        mapOf("state" to if (current?.active?.get() == true) "recording" else "idle")
      }
    }

    OnActivityEntersBackground { stopCaptureInternal() }
    OnActivityDestroys { stopCaptureInternal() }
    OnAppContextDestroys { stopCaptureInternal() }
  }

  private fun startCaptureInternal(): Map<String, Any> = synchronized(lock) {
    current?.takeIf { it.active.get() }?.let { return@synchronized describe(it) }

    val context = appContext.reactContext
      ?: throw IllegalStateException("AUDIO_CONTEXT_UNAVAILABLE")
    if (ContextCompat.checkSelfPermission(context, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
      throw SecurityException("AUDIO_PERMISSION_DENIED")
    }

    val manager = context.getSystemService(android.content.Context.AUDIO_SERVICE) as AudioManager
    val supportsUnprocessed = Build.VERSION.SDK_INT >= Build.VERSION_CODES.N &&
      manager.getProperty(AudioManager.PROPERTY_SUPPORT_AUDIO_SOURCE_UNPROCESSED) == "true"
    val source = if (supportsUnprocessed) MediaRecorder.AudioSource.UNPROCESSED else MediaRecorder.AudioSource.MIC

    var started: Session? = null
    for (rate in intArrayOf(48000, 44100, 16000)) {
      val minSize = AudioRecord.getMinBufferSize(
        rate, AudioFormat.CHANNEL_IN_MONO, AudioFormat.ENCODING_PCM_16BIT
      )
      if (minSize <= 0) continue
      val size = max(minSize * 2, (rate / 10) * 2)
      var record: AudioRecord? = null
      try {
        record = AudioRecord.Builder()
          .setAudioSource(source)
          .setAudioFormat(
            AudioFormat.Builder()
              .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
              .setSampleRate(rate)
              .setChannelMask(AudioFormat.CHANNEL_IN_MONO)
              .build()
          )
          .setBufferSizeInBytes(size)
          .build()

        if (record.state != AudioRecord.STATE_INITIALIZED) {
          record.release()
          continue
        }
        record.startRecording()
        if (record.recordingState != AudioRecord.RECORDSTATE_RECORDING) {
          record.release()
          continue
        }
        val actualRate = record.sampleRate
        val session = Session(record, actualRate, source, size, max(256, minOf(size / 2, 2048)))
        current = session
        session.worker = Thread({ readLoop(session) }, "riffando-pcm").apply {
          isDaemon = true
          start()
        }
        started = session
        break
      } catch (security: SecurityException) {
        record?.release()
        throw security
      } catch (_: IllegalArgumentException) {
        record?.release()
      } catch (_: IllegalStateException) {
        record?.release()
      }
    }
    val session = started ?: throw IllegalStateException("AUDIO_INITIALIZATION_FAILED")
    describe(session)
  }

  private fun describe(session: Session): Map<String, Any> = mapOf(
    "sampleRate" to session.sampleRate,
    "channels" to 1,
    "encoding" to "pcm16",
    "bufferBytes" to session.bufferBytes,
    "source" to if (session.source == MediaRecorder.AudioSource.UNPROCESSED) "unprocessed" else "mic"
  )

  /**
   * stop() pode desbloquear um read() pendente. A liberação ocorre ao final do
   * worker, evitando release concorrente durante a leitura.
   */
  private fun stopCaptureInternal() {
    val session = synchronized(lock) {
      val old = current
      current = null
      old
    } ?: return
    session.active.set(false)
    try {
      if (session.recorder.recordingState == AudioRecord.RECORDSTATE_RECORDING) {
        session.recorder.stop()
      }
    } catch (_: IllegalStateException) {
      // O worker libera o recurso inclusive quando a parada falha.
    }
  }

  private fun readLoop(session: Session) {
    val data = ShortArray(session.readSamples)
    val timestamp = AudioTimestamp()
    var frames: Long = 0
    var lastReportNs = System.nanoTime()
    var errorCode: String? = null
    try {
      while (session.active.get()) {
        val count = session.recorder.read(
          data, 0, data.size, AudioRecord.READ_BLOCKING
        )
        if (!session.active.get()) break
        if (count < 0) {
          errorCode = "AUDIO_READ_FAILED"
          break
        }
        if (count == 0) continue

        frames += count.toLong()
        val now = System.nanoTime()
        if (now - lastReportNs < 200_000_000L) continue
        lastReportNs = now

        var sum = 0.0
        var peak = 0
        var clipped = 0
        for (i in 0 until count) {
          val level = abs(data[i].toInt())
          peak = max(peak, level)
          if (level >= 32760) clipped++
          sum += level.toDouble() * level.toDouble()
        }
        val rms = sqrt(sum / count) / 32768.0
        val rmsDbfs = if (rms == 0.0) -120.0 else max(-120.0, 20.0 * log10(rms))
        val peakDbfs = if (peak == 0) -120.0 else 20.0 * log10(peak / 32768.0)

        val hasHardwareTimestamp = try {
          session.recorder.getTimestamp(timestamp, AudioTimestamp.TIMEBASE_MONOTONIC) ==
            AudioRecord.SUCCESS
        } catch (_: IllegalStateException) {
          false
        }

        // NanoTime usa a mesma base monotônica de TIMEBASE_MONOTONIC.
        sendEvent("onMetrics", mapOf(
          "rmsDbfs" to rmsDbfs,
          "peakDbfs" to peakDbfs,
          "clipping" to (clipped > 0),
          "framesRead" to frames.toDouble(),
          "timestampOrigin" to if (hasHardwareTimestamp) "hardware" else "unavailable",
          "timestampNanos" to if (hasHardwareTimestamp) timestamp.nanoTime.toString() else "",
          "timestampFrame" to if (hasHardwareTimestamp) timestamp.framePosition.toDouble() else -1.0,
          "observedAtNanos" to now.toString()
        ))
      }
    } catch (_: SecurityException) {
      errorCode = "AUDIO_PERMISSION_REVOKED"
    } catch (_: Exception) {
      errorCode = "AUDIO_READ_FAILED"
    } finally {
      session.active.set(false)
      synchronized(lock) {
        if (current === session) current = null
      }
      try {
        if (session.recorder.recordingState == AudioRecord.RECORDSTATE_RECORDING) session.recorder.stop()
      } catch (_: IllegalStateException) {
        // Falha de parada não impede liberação.
      }
      session.recorder.release()
      if (errorCode != null) sendEvent("onCaptureError", mapOf("code" to errorCode))
    }
  }
}
