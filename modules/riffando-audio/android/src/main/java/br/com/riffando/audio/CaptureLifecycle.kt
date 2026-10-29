package br.com.riffando.audio

/** Estados observáveis pela UI; o fio usa os mesmos nomes do contrato TypeScript. */
internal enum class CaptureState(val wire: String) {
  IDLE("idle"),
  RECORDING("recording"),
  STOPPING("stopping"),
}

internal fun captureStateOf(hasSession: Boolean, active: Boolean): CaptureState = when {
  !hasSession -> CaptureState.IDLE
  active -> CaptureState.RECORDING
  else -> CaptureState.STOPPING
}

internal enum class StartDecision { CREATE, REUSE_ACTIVE, REJECT_STOPPING }

/**
 * Start idempotente: sessão ativa é reaproveitada; sessão encerrando ainda segura o
 * AudioRecord e bloqueia novo start até o worker liberar o gravador.
 */
internal fun decideStart(hasSession: Boolean, active: Boolean): StartDecision = when {
  !hasSession -> StartDecision.CREATE
  active -> StartDecision.REUSE_ACTIVE
  else -> StartDecision.REJECT_STOPPING
}

internal const val TIMESTAMP_ORIGIN_AUDIO_RECORD = "audio-record"
internal const val TIMESTAMP_ORIGIN_UNAVAILABLE = "unavailable"

internal data class TimestampReading(val origin: String, val nanos: String, val frame: Double)

/** Sem leitura válida do AudioRecord, nenhum tempo ou frame é inventado. */
internal fun timestampReading(available: Boolean, nanoTime: Long, framePosition: Long): TimestampReading =
  if (available) {
    TimestampReading(TIMESTAMP_ORIGIN_AUDIO_RECORD, nanoTime.toString(), framePosition.toDouble())
  } else {
    TimestampReading(TIMESTAMP_ORIGIN_UNAVAILABLE, "", -1.0)
  }
