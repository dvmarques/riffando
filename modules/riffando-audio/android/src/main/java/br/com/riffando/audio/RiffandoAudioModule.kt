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
import kotlin.math.max

/**
 * Captura exclusiva em memória; JS recebe métricas a no máximo 5 Hz.
 * O gravador só é liberado pelo worker, depois da última chamada read().
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
    lateinit var worker: Thread
  }

  override fun definition() = ModuleDefinition {
    Name("RiffandoAudio")
    Events("onMetrics", "onCaptureError")

    AsyncFunction("startCapture") { startCaptureInternal() }
    AsyncFunction("stopCapture") { stopCaptureInternal(waitForRelease = true) }
    AsyncFunction("getCaptureStatus") {
      synchronized(lock) {
        mapOf("state" to when {
          current == null -> "idle"
          current?.active?.get() == true -> "recording"
          else -> "stopping"
        })
      }
    }

    // OnAppContextDestroys não existe na DSL Android do SDK atual.
    OnActivityEntersBackground { stopCaptureInternal() }
    OnActivityDestroys { stopCaptureInternal() }
  }

  private fun startCaptureInternal(): Map<String, Any> = synchronized(lock) {
    current?.let { session ->
      if (session.active.get()) return@synchronized describe(session)
      throw IllegalStateException("AUDIO_STOPPING")
    }

    val context = appContext.reactContext
      ?: throw IllegalStateException("AUDIO_CONTEXT_UNAVAILABLE")
    if (ContextCompat.checkSelfPermission(
        context, Manifest.permission.RECORD_AUDIO
      ) != PackageManager.PERMISSION_GRANTED) {
      throw SecurityException("AUDIO_PERMISSION_DENIED")
    }

    val manager = context.getSystemService(android.content.Context.AUDIO_SERVICE) as AudioManager
    val unprocessed = Build.VERSION.SDK_INT >= Build.VERSION_CODES.N &&
      manager.getProperty(AudioManager.PROPERTY_SUPPORT_AUDIO_SOURCE_UNPROCESSED) == "true"
    val sources = if (unprocessed) {
      intArrayOf(MediaRecorder.AudioSource.UNPROCESSED, MediaRecorder.AudioSource.MIC)
    } else {
      intArrayOf(MediaRecorder.AudioSource.MIC)
    }

    for (source in sources) {
      for (rate in intArrayOf(48000, 44100, 16000)) {
        val minimum = AudioRecord.getMinBufferSize(
          rate, AudioFormat.CHANNEL_IN_MONO, AudioFormat.ENCODING_PCM_16BIT
        )
        if (minimum <= 0) continue
        val size = max(minimum * 2, rate / 5 * 2)
        var recorder: AudioRecord? = null
        try {
          recorder = AudioRecord.Builder()
            .setAudioSource(source)
            .setAudioFormat(
              AudioFormat.Builder()
                .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
                .setChannelMask(AudioFormat.CHANNEL_IN_MONO)
                .setSampleRate(rate)
                .build()
            )
            .setBufferSizeInBytes(size)
            .build()

          if (recorder.state != AudioRecord.STATE_INITIALIZED) continue
          recorder.startRecording()
          if (recorder.recordingState != AudioRecord.RECORDSTATE_RECORDING) continue

          val session = Session(
            recorder, recorder.sampleRate, source, size, minOf(2048, max(256, size / 2))
          )
          session.worker = Thread({ readLoop(session) }, "riffando-pcm")
          current = session
          try {
            session.worker.start()
          } catch (failure: Exception) {
            current = null
            session.active.set(false)
            throw failure
          }
          recorder = null // O worker é o único responsável pela liberação.
          return@synchronized describe(session)
        } catch (error: SecurityException) {
          throw error
        } catch (_: IllegalArgumentException) {
          // Formato/fonte recusados: tentar alternativa documentada.
        } catch (_: IllegalStateException) {
          // Dispositivo ocupado ou estado inválido: tentar alternativa.
        } finally {
          recorder?.let {
            try {
              if (it.recordingState == AudioRecord.RECORDSTATE_RECORDING) it.stop()
            } catch (_: IllegalStateException) {
              // release deve ocorrer também na falha de stop.
            }
            it.release()
          }
        }
      }
    }
    throw IllegalStateException("AUDIO_INITIALIZATION_FAILED")
  }

  private fun describe(session: Session): Map<String, Any> = mapOf(
    "sampleRate" to session.sampleRate,
    "channels" to 1,
    "encoding" to "pcm16",
    "bufferBytes" to session.bufferBytes,
    "source" to if (session.source == MediaRecorder.AudioSource.UNPROCESSED) "unprocessed" else "mic"
  )

  /**
   * Mantém a sessão no slot até o worker liberar o AudioRecord.
   * Não bloqueia o thread principal ao receber callbacks de lifecycle.
   */
  private fun stopCaptureInternal(waitForRelease: Boolean = false) {
    val session = synchronized(lock) { current } ?: return
    session.active.set(false)
    try {
      if (session.recorder.recordingState == AudioRecord.RECORDSTATE_RECORDING) {
        session.recorder.stop() // Pode desbloquear read(READ_BLOCKING).
      }
    } catch (_: IllegalStateException) {
      // O worker tentará liberar o gravador em finally.
    }
    if (waitForRelease && Thread.currentThread() !== session.worker) {
      session.worker.join(2000L)
      if (session.worker.isAlive) throw IllegalStateException("AUDIO_STOP_TIMEOUT")
    }
  }

  private fun readLoop(session: Session) {
    val buffer = ShortArray(session.readSamples)
    val clock = AudioTimestamp()
    val statistics = PcmSignalAccumulator()
    var frames = 0L
    var lastReport = System.nanoTime()
    var errorCode: String? = null

    try {
      while (session.active.get()) {
        val context = appContext.reactContext
        if (context == null || ContextCompat.checkSelfPermission(
            context, Manifest.permission.RECORD_AUDIO
          ) != PackageManager.PERMISSION_GRANTED) {
          errorCode = "AUDIO_PERMISSION_REVOKED"
          break
        }

        val samples = session.recorder.read(buffer, 0, buffer.size, AudioRecord.READ_BLOCKING)
        if (!session.active.get()) break
        if (samples < 0) {
          errorCode = "AUDIO_READ_FAILED"
          break
        }
        if (samples == 0) continue
        frames += samples.toLong()
        statistics.add(buffer, samples)
        val now = System.nanoTime()
        if (now - lastReport < 200_000_000L) continue
        lastReport = now

        val signal = statistics.snapshotAndReset() ?: continue
        val audioTimestampAvailable = try {
          session.recorder.getTimestamp(clock, AudioTimestamp.TIMEBASE_MONOTONIC) ==
            AudioRecord.SUCCESS
        } catch (_: IllegalStateException) {
          false
        }

        // AudioTimestamp é tempo de captura fornecido por AudioRecord; não mede
        // necessariamente hardware timestamp nem latência ponta a ponta.
        try {
          sendEvent("onMetrics", mapOf(
            "rmsDbfs" to signal.rmsDbfs,
            "peakDbfs" to signal.peakDbfs,
            "clipping" to signal.clipping,
            "framesRead" to frames.toDouble(),
            "timestampOrigin" to if (audioTimestampAvailable) "audio-record" else "unavailable",
            "timestampNanos" to if (audioTimestampAvailable) clock.nanoTime.toString() else "",
            "timestampFrame" to if (audioTimestampAvailable) clock.framePosition.toDouble() else -1.0,
            "observedAtNanos" to now.toString()
          ))
        } catch (_: Exception) {
          // A desmontagem da bridge não deve deixar o microfone capturando.
          errorCode = "AUDIO_CONTEXT_UNAVAILABLE"
          break
        }
      }
    } catch (_: SecurityException) {
      errorCode = "AUDIO_PERMISSION_REVOKED"
    } catch (_: Exception) {
      errorCode = "AUDIO_READ_FAILED"
    } finally {
      session.active.set(false)
      try {
        if (session.recorder.recordingState == AudioRecord.RECORDSTATE_RECORDING) {
          session.recorder.stop()
        }
      } catch (_: IllegalStateException) {
        // Sempre liberar mesmo que stop() falhe.
      } finally {
        session.recorder.release()
        synchronized(lock) { if (current === session) current = null }
      }
      if (errorCode != null) {
        try {
          sendEvent("onCaptureError", mapOf("code" to errorCode))
        } catch (_: Exception) {
          // JS pode já ter sido desmontado.
        }
      }
    }
  }
}
