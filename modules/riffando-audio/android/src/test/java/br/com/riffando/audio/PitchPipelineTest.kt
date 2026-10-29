package br.com.riffando.audio

import kotlin.math.PI
import kotlin.math.abs
import kotlin.math.roundToInt
import kotlin.math.sin
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/** Vetores em forma fechada; os valores esperados vêm de `node experiments/gc-014/gen-parity-vectors.mjs`. */
class PitchPipelineTest {
  private val rate = 48_000

  private fun tone(hz: Double, samples: Int, level: Double = 0.15, offset: Int = 0): ShortArray =
    ShortArray(samples) { i ->
      var v = 0.0
      for (k in 1..4) v += sin(2 * PI * k * hz * (i + offset) / rate) / k
      (level * v * 32768).roundToInt().coerceIn(-32768, 32767).toShort()
    }

  private fun normalized(pcm: ShortArray) = DoubleArray(pcm.size) { pcm[it] / 32768.0 }

  private fun run(pipeline: PitchPipeline, pcm: ShortArray, chunk: Int = 1920): List<PitchOutput> {
    val outputs = mutableListOf<PitchOutput>()
    var start = 0
    while (start < pcm.size) {
      val part = pcm.copyOfRange(start, minOf(start + chunk, pcm.size))
      pipeline.push(part, part.size) { outputs += it }
      start += chunk
    }
    return outputs
  }

  @Test
  fun paridadeComPocParaCordasSoltasEDesafinacao() {
    val detector = MpmPitchDetector(rate)
    assertEquals(3072, detector.windowSize)
    val expected = listOf(
      82.406889 to 82.406848, 110.0 to 109.999887, 146.832384 to 146.831977, 195.997718 to 195.996958,
      246.941651 to 246.941125, 329.627557 to 329.626094, 111.085475 to 111.085289, 523.251131 to 523.247924,
    )
    for ((nominal, poc) in expected) {
      val estimate = requireNotNull(detector.detect(normalized(tone(nominal, detector.windowSize))))
      assertTrue("$nominal Hz: Δ ${absCents(estimate.frequencyHz, poc)} c", absCents(estimate.frequencyHz, poc) <= 0.5)
      assertTrue(estimate.confidence >= 0.99)
    }
  }

  @Test
  fun taxasAlternativasUsamLagsEJanelaDaTaxaEfetiva() {
    for ((sampleRate, hz) in listOf(44_100 to 110.0, 16_000 to 110.0)) {
      val detector = MpmPitchDetector(sampleRate)
      val pcm = DoubleArray(detector.windowSize) { i ->
        var v = 0.0
        for (k in 1..4) v += sin(2 * PI * k * hz * i / sampleRate) / k
        0.15 * v
      }
      val estimate = requireNotNull(detector.detect(pcm))
      assertTrue("$sampleRate Hz", absCents(estimate.frequencyHz, hz) <= 5.0)
    }
    assertEquals(988.0, PitchConfig.operationalMaxHz(48_000), 0.0)
    assertEquals(988.0, PitchConfig.operationalMaxHz(44_100), 0.0)
    assertEquals(523.0, PitchConfig.operationalMaxHz(16_000), 0.0)
  }

  @Test
  fun notaEstavelLidaApenasDepoisDeTresQuadros() {
    val outputs = run(PitchPipeline(rate), tone(110.0, rate / 2))
    val firstReading = outputs.indexOfFirst { it.state == PitchState.READING }
    assertTrue("sem leitura", firstReading >= 0)
    assertTrue("leitura antes de K=3 quadros: $firstReading", firstReading >= PitchConfig.STABILITY_FRAMES - 1)
    assertTrue(outputs.take(firstReading).all { it.frequencyHz == null })
    for (output in outputs.drop(firstReading)) {
      assertEquals(PitchState.READING, output.state)
      assertTrue(absCents(output.frequencyHz!!, 110.0) <= 5.0)
    }
  }

  @Test
  fun silencioEBaixoNivelNaoGeramNotaFicticia() {
    val silent = run(PitchPipeline(rate), ShortArray(rate / 2))
    assertTrue(silent.isNotEmpty())
    assertTrue(silent.all { it.state == PitchState.NO_SIGNAL && it.frequencyHz == null })
    val quiet = run(PitchPipeline(rate), tone(110.0, rate / 2, level = 0.0004)) // ≈ −66 dBFS, abaixo do gate
    assertTrue(quiet.all { it.state == PitchState.NO_SIGNAL && it.frequencyHz == null })
  }

  @Test
  fun ruidoDeBandaLargaEhRejeitado() {
    var seed = 12345L
    val noise = ShortArray(rate) {
      seed = (seed * 1103515245L + 12345L) and 0x7fffffffL
      (((seed / 2147483648.0) * 2 - 1) * 0.1 * 32768).roundToInt().toShort() // ≈ −23 dBFS
    }
    val outputs = run(PitchPipeline(rate), noise)
    assertTrue(outputs.none { it.state == PitchState.READING })
    assertTrue(outputs.all { it.frequencyHz == null })
  }

  @Test
  fun trocaDeNotaNaoExibeNotaAntigaComoNovaEEstabilizaRapido() {
    val before = tone(110.0, rate / 4)
    val after = tone(146.832384, rate / 2)
    val outputs = run(PitchPipeline(rate), before + after, chunk = 960)
    // O quadro i termina na amostra windowSize + i·hop; a troca ocorre na amostra rate/4.
    val hop = (rate * PitchConfig.HOP_SECONDS).roundToInt()
    val changeFrame = (rate / 4 - MpmPitchDetector(rate).windowSize) / hop + 1
    val readings = outputs.withIndex().filter { it.index >= changeFrame && it.value.state == PitchState.READING }
    val firstNew = readings.first { absCents(it.value.frequencyHz!!, 146.832384) <= 5.0 }
    assertTrue("estabilização lenta: ${firstNew.index - changeFrame} quadros", firstNew.index - changeFrame <= 9)
    // nenhuma leitura estável intermediária que não seja a nota antiga (antes da troca refletir) ou a nova
    for (reading in readings) {
      val hz = reading.value.frequencyHz!!
      assertTrue(absCents(hz, 110.0) <= 5.0 || absCents(hz, 146.832384) <= 5.0)
    }
    assertTrue(readings.dropWhile { absCents(it.value.frequencyHz!!, 146.832384) > 5.0 }.all { absCents(it.value.frequencyHz!!, 146.832384) <= 5.0 })
  }

  @Test
  fun foraDaFaixaOperacionalEmTaxaBaixaNaoEhLeituraConfiavel() {
    val pipeline = PitchPipeline(16_000)
    val pcm = ShortArray(8000) { i -> (0.2 * sin(2 * PI * 784.0 * i / 16_000) * 32768).roundToInt().toShort() }
    val outputs = run(pipeline, pcm, chunk = 640)
    assertTrue(outputs.none { it.state == PitchState.READING })
  }

  @Test
  fun resetDescartaHistoricoEExigeNovosQuadros() {
    val pipeline = PitchPipeline(rate)
    run(pipeline, tone(110.0, rate / 2))
    pipeline.reset()
    val again = run(pipeline, tone(110.0, rate / 2))
    assertTrue(again.take(PitchConfig.STABILITY_FRAMES - 1).none { it.state == PitchState.READING })
    assertTrue(again.any { it.state == PitchState.READING })
  }

  @Test
  fun estimativaNuncaExcedeLimitesDeConfianca() {
    val detector = MpmPitchDetector(rate)
    val estimate = requireNotNull(detector.detect(normalized(tone(246.941651, detector.windowSize))))
    assertTrue(estimate.confidence in 0.0..1.0)
    assertTrue(abs(estimate.frequencyHz - 246.941125) < 0.01)
  }
}
