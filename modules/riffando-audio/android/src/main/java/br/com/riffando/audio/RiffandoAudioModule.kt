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
 * Com o afinador (GC-014) o mesmo worker alimenta [PitchPipeline] e o JS recebe estados/frequências
 * estabilizados a no máximo 10 Hz; nenhum PCM cru cruza a ponte e nenhum segundo AudioRecord é aberto.
 * O gravador só é liberado pelo worker, depois da última chamada read().
 */
class RiffandoAudioModule : Module() {
  private val lock = Any()
  private var current: Session? = null
  private var lastSessionId = 0

  private class Session(
    val recorder: AudioRecord,
    val sampleRate: Int,
    val source: Int,
    val bufferBytes: Int,
    val readSamples: Int,
    val id: Int,
    val pitch: PitchPipeline?,
  ) {
    val active = AtomicBoolean(true)
    lateinit var worker: Thread
  }

  override fun definition() = ModuleDefinition {
    Name("RiffandoAudio")
    Events("onMetrics", "onCaptureError", "onPitch")

    AsyncFunction("startCapture") { startCaptureInternal(withPitch = false) }
    AsyncFunction("startTuner") { startCaptureInternal(withPitch = true) }
    AsyncFunction("stopCapture") { stopCaptureInternal(waitForRelease = true) }
    AsyncFunction("getCaptureStatus") {
      synchronized(lock) {
        mapOf("state" to captureStateOf(current != null, current?.active?.get() == true).wire)
      }
    }

    // OnAppContextDestroys não existe na DSL Android do SDK atual.
    OnActivityEntersBackground { stopCaptureInternal() }
    OnActivityDestroys { stopCaptureInternal() }
  }

  private fun startCaptureInternal(withPitch: Boolean): Map<String, Any> = synchronized(lock) {
    val existing = current
    when (decideStart(existing != null, existing?.active?.get() == true)) {
      StartDecision.REUSE_ACTIVE -> {
        // Diagnóstico e afinador não dividem sessão: um segundo modo nunca abre outro AudioRecord.
        if ((existing!!.pitch != null) != withPitch) throw IllegalStateException("AUDIO_MODE_CONFLICT")
        return@synchronized describe(existing)
      }
      StartDecision.REJECT_STOPPING -> throw IllegalStateException("AUDIO_STOPPING")
      StartDecision.CREATE -> Unit
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
            recorder, recorder.sampleRate, source, size, minOf(2048, max(256, size / 2)),
            id = ++lastSessionId,
            pitch = if (withPitch) PitchPipeline(recorder.sampleRate) else null,
          )
          session.worker = Thread({ readLoop(session) }, "riffando-pcm")
          current = session
          try {
            session.worker.start()
          } catch (failure: Throwable) {
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
    "source" to if (session.source == MediaRecorder.AudioSource.UNPROCESSED) "unprocessed" else "mic",
    "sessionId" to session.id
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
    var lastPitchEmit = 0L
    var sequence = 0
    var latestPitch: PitchOutput? = null
    var analysisNanos = 0L
    var analysisFrames = 0L
    var errorCode: String? = null

    try {
      while (session.active.get()) {
        val context = appContext.reactContext
        if (context == null) {
          errorCode = "AUDIO_CONTEXT_UNAVAILABLE"
          break
        }
        if (ContextCompat.checkSelfPermission(
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
        val pitch = session.pitch
        if (pitch != null) {
          val started = System.nanoTime()
          pitch.push(buffer, samples) { latestPitch = it; analysisFrames++ }
          analysisNanos += System.nanoTime() - started
          val output = latestPitch
          if (output != null && now - lastPitchEmit >= PitchConfig.EMIT_INTERVAL_NANOS) {
            lastPitchEmit = now
            try {
              sendEvent("onPitch", mapOf(
                "sessionId" to session.id,
                "sequence" to ++sequence,
                "state" to output.state.wire,
                "frequencyHz" to output.frequencyHz,
                "confidence" to output.confidence,
                "rmsDbfs" to output.rmsDbfs,
                "windowMs" to (PitchConfig.WINDOW_SECONDS * 1000).toInt(),
                "sampleRateHz" to session.sampleRate,
                "observedAtNanos" to now.toString(),
                // Custo médio por quadro (µs) no próprio aparelho, para a tarefa 2.4; não é latência.
                "analysisMicros" to if (analysisFrames > 0) analysisNanos / analysisFrames / 1000 else 0L
              ))
            } catch (_: Exception) {
              errorCode = "AUDIO_CONTEXT_UNAVAILABLE"
              break
            }
          }
        }
        if (now - lastReport < 200_000_000L) continue
        lastReport = now

        val signal = statistics.snapshotAndReset() ?: continue
        val audioTimestampAvailable = try {
          session.recorder.getTimestamp(clock, AudioTimestamp.TIMEBASE_MONOTONIC) ==
            AudioRecord.SUCCESS
        } catch (_: IllegalStateException) {
          false
        }
        val reading = timestampReading(audioTimestampAvailable, clock.nanoTime, clock.framePosition)

        // AudioTimestamp é tempo de captura fornecido por AudioRecord; não mede
        // necessariamente hardware timestamp nem latência ponta a ponta.
        try {
          sendEvent("onMetrics", mapOf(
            "rmsDbfs" to signal.rmsDbfs,
            "peakDbfs" to signal.peakDbfs,
            "clipping" to signal.clipping,
            "framesRead" to frames.toDouble(),
            "timestampOrigin" to reading.origin,
            "timestampNanos" to reading.nanos,
            "timestampFrame" to reading.frame,
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
