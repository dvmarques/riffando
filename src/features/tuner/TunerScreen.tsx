import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GUITAR_STRINGS, compareToTarget, tuningStatus, type GuitarString, type TuningStatus } from '@/domain/tuning/guitar';
import { frequencyToNote, noteLabel, type NoteReading } from '@/domain/tuning/notes';
import { tunerMessages as t } from '@/shared/i18n/pt-BR';
import { Action } from '@/shared/ui/Action';
import { Screen } from '@/shared/ui/Screen';
import { useThrottledValue, useTuner, type TunerStatus } from './useTuner';

type Mode = 'chromatic' | 'guitar';

/** Abaixo deste nível (RMS, dBFS) a ausência de nota é tratada como silêncio ambiente. */
const QUIET_DBFS = -40;
/** Intervalo mínimo entre atualizações do número de cents e do estado em texto. */
const DISPLAY_INTERVAL_MS = 400;

const statusText: Record<Exclude<TunerStatus, 'listening' | 'error'>, string> = {
  idle: t.idle,
  requestingPermission: t.requestingPermission,
  starting: t.starting,
  stopping: t.stopping,
};

const statusLabel = (value: TuningStatus) => value === 'in-tune' ? t.inTune : value === 'flat' ? t.flat : t.sharp;
const formatHz = (hz: number) => `${hz.toFixed(2).replace('.', ',')} Hz`;
const signed = (cents: number) => `${cents > 0 ? '+' : cents < 0 ? '−' : ''}${Math.abs(cents).toFixed(0)}`;

type View_ = {
  note: NoteReading | null;
  cents: number | null;
  status: TuningStatus | null;
  message: string;
  deviationLabel: string;
  /** Leitura mantida após perder o sinal: exibida como “última leitura”, nunca como ao vivo. */
  held: boolean;
  /** Frequência detectada (mediana das últimas leituras), em Hz. */
  hz: number | null;
};

/** Combina estado nativo, modo e corda-alvo; sem leitura confiável, nada de nota nem ponteiro. */
function present(state: ReturnType<typeof useTuner>, mode: Mode, target: GuitarString | null): View_ {
  const none = (message: string): View_ => ({ note: null, cents: null, status: null, message, deviationLabel: '', held: false, hz: null });
  const { pitch } = state;
  // Ao vivo: mediana das últimas leituras (≈ 0,8 s). Sem leitura ao vivo, mantém a última por alguns segundos.
  const live = pitch?.state === 'reading' ? state.smoothedHz : null;
  const held = live === null && state.heldHz !== null;
  const hz = live ?? state.heldHz;
  if (hz === null) {
    if (!pitch) return none(t.listening);
    if (pitch.state === 'no-signal') return none(t.noSignal);
    // Nível muito baixo é ambiente silencioso, não “nota pouco clara”: evita alternar mensagens.
    if (pitch.state === 'unreliable') return none(pitch.rmsDbfs < QUIET_DBFS ? t.noSignal : t.unreliable);
    return none(t.unstable);
  }
  const note = frequencyToNote(hz);
  if (!note) return none(t.unreliable);
  if (mode === 'chromatic' || !target) {
    const status = tuningStatus(note.cents);
    return { note, cents: note.cents, status, message: mode === 'guitar' ? t.guitarHint : statusLabel(status), deviationLabel: 'em relação à nota mais próxima', held, hz };
  }
  const comparison = compareToTarget(hz, target);
  if (comparison.kind === 'target') {
    return { note, cents: comparison.cents, status: comparison.status, message: statusLabel(comparison.status), deviationLabel: `em relação à corda ${target.number}, ${noteLabel(target)}`, held, hz };
  }
  const message = comparison.kind === 'octave-above' ? t.octaveAbove : comparison.kind === 'octave-below' ? t.octaveBelow : t.otherNote;
  return { note, cents: null, status: null, message, deviationLabel: '', held, hz };
}

function Pointer({ cents }: { cents: number | null }) {
  const clamped = cents === null ? null : Math.max(-50, Math.min(50, cents));
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.track}>
      <View style={styles.center} />
      {clamped !== null ? <View style={[styles.needle, { left: `${50 + clamped}%` }]} /> : null}
    </View>
  );
}

export default function TunerScreen() {
  const router = useRouter();
  const tuner = useTuner();
  const [mode, setMode] = useState<Mode>('chromatic');
  const [target, setTarget] = useState<GuitarString | null>(null);
  const view = useMemo(() => present(tuner, mode, target), [tuner, mode, target]);
  const shownCents = useThrottledValue(view.cents === null ? null : Math.round(view.cents), DISPLAY_INTERVAL_MS);
  const shownStatus = view.status === null || shownCents === null ? null : tuningStatus(shownCents);

  const summary = view.note && !view.held
    ? `${noteLabel(view.note)}${shownStatus ? `, ${statusLabel(shownStatus).split(' — ')[0]}` : ''}`
    : '';
  // Anúncio por leitor de tela espaçado: muda só com a nota/estado e no máximo a cada 2 s.
  const announced = useThrottledValue(summary, 2000);
  const listening = tuner.status === 'listening';
  const back = () => {
    void tuner.stop();
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  return (
    <Screen>
      <Text accessibilityRole="header" style={styles.title}>{t.title}</Text>
      <Text style={styles.body}>{t.intro}</Text>
      <Text style={styles.note}>{t.validation}</Text>

      <View accessibilityRole="radiogroup" accessibilityLabel={t.modeLabel} style={styles.row}>
        {([['chromatic', t.modeChromatic], ['guitar', t.modeGuitar]] as const).map(([value, label]) => (
          <Pressable key={value} accessibilityRole="radio" accessibilityLabel={label} accessibilityState={{ selected: mode === value }}
            onPress={() => setMode(value)} style={[styles.chip, mode === value && styles.chipOn]}>
            <Text style={[styles.chipText, mode === value && styles.chipTextOn]}>{label}</Text>
          </Pressable>
        ))}
      </View>

      {mode === 'guitar' ? (
        <View accessibilityRole="radiogroup" accessibilityLabel={t.stringsLabel} style={styles.strings}>
          {GUITAR_STRINGS.map((string) => {
            const selected = target?.number === string.number;
            const label = `Corda ${string.number}, ${noteLabel(string)}`;
            return (
              <Pressable key={string.number} accessibilityRole="radio" accessibilityLabel={label} accessibilityState={{ selected }}
                onPress={() => setTarget(selected ? null : string)} style={[styles.string, selected && styles.chipOn]}>
                <Text style={[styles.chipText, selected && styles.chipTextOn]}>{string.solfege}{string.octave}</Text>
                <Text style={[styles.stringSub, selected && styles.chipTextOn]}>{string.letter}{string.octave} · {string.number}ª</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      <View style={[styles.card, view.held && styles.dim]}>
        {listening || view.note ? (
          <>
            <Text accessibilityLabel={view.note ? `Nota ${noteLabel(view.note)}` : 'Nenhuma nota identificada'} style={styles.bigNote}>
              {view.note ? `${view.note.solfege}${view.note.octave}` : '—'}
            </Text>
            <Text style={styles.noteSub}>{view.note && view.hz !== null ? `${view.note.letter}${view.note.octave} · ${formatHz(view.hz)}` : ' '}</Text>
            <Pointer cents={view.cents} />
            <Text accessibilityLabel={shownCents === null ? 'Desvio indisponível' : `Desvio de ${signed(shownCents)} cents ${view.deviationLabel}`} style={styles.cents}>
              {shownCents === null ? '— cents' : `${signed(shownCents)} cents`}
            </Text>
            {shownCents !== null && Math.abs(shownCents) > 50 ? <Text style={styles.note}>{t.beyond}</Text> : null}
            <Text style={[styles.status, shownStatus === 'in-tune' && !view.held && styles.statusOk]}>
              {view.held ? `${t.lastReading} — ` : ''}{shownStatus ? statusLabel(shownStatus) : view.message}
            </Text>
          </>
        ) : (
          <Text style={styles.body}>{tuner.status === 'error' ? '' : statusText[tuner.status as keyof typeof statusText] ?? t.idle}</Text>
        )}
        {/* Região viva única e espaçada para TalkBack; não repete cada leitura. */}
        <Text accessibilityLiveRegion="polite" style={styles.hidden}>{announced}</Text>
      </View>

      {listening ? (
        <Text style={styles.note}>
          {tuner.pitch
            ? `Detalhes técnicos: nível ${tuner.pitch.rmsDbfs.toFixed(0)} dBFS · confiança ${tuner.pitch.confidence.toFixed(2)} · ${tuner.pitch.sampleRateHz} Hz · ${tuner.pitch.analysisMicros} µs/quadro`
            : 'Detalhes técnicos: aguardando leitura'}
        </Text>
      ) : null}
      {tuner.error ? <Text accessibilityRole="alert" accessibilityLiveRegion="assertive" style={styles.warning}>{tuner.error}</Text> : null}
      {tuner.moduleUnavailable ? (
        <Text style={styles.note}>O afinador não está disponível nesta instalação.</Text>
      ) : listening ? (
        <Action label={t.stop} onPress={() => { void tuner.stop(); }} />
      ) : !tuner.busy ? (
        <Action label={t.start} onPress={() => { void tuner.start(); }} />
      ) : (
        <Text style={styles.note}>{t.waiting}</Text>
      )}
      <Action label={t.back} onPress={back} />
      <Text style={styles.note}>{t.footer}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: '#F5F7F8', fontSize: 30, fontWeight: '800' },
  body: { color: '#CBD5DF', fontSize: 16, lineHeight: 24 },
  note: { color: '#CBD5DF', fontSize: 14, lineHeight: 22 },
  warning: { color: '#F4B860', fontSize: 16, lineHeight: 24 },
  row: { flexDirection: 'row', gap: 12 },
  chip: { flex: 1, minHeight: 52, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#45515E', borderRadius: 12, backgroundColor: '#18232E' },
  chipOn: { backgroundColor: '#5EE0B5', borderColor: '#5EE0B5' },
  chipText: { color: '#F5F7F8', fontSize: 18, fontWeight: '700' },
  chipTextOn: { color: '#101820' },
  strings: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  string: { minWidth: 96, minHeight: 56, flexGrow: 1, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#45515E', borderRadius: 12, backgroundColor: '#18232E', paddingVertical: 6 },
  stringSub: { color: '#CBD5DF', fontSize: 12 },
  card: { padding: 20, gap: 8, alignItems: 'center', borderWidth: 1, borderColor: '#45515E', borderRadius: 16, backgroundColor: '#18232E' },
  bigNote: { color: '#F5F7F8', fontSize: 72, fontWeight: '800' },
  noteSub: { color: '#CBD5DF', fontSize: 18 },
  track: { width: '100%', height: 36, justifyContent: 'center', borderRadius: 18, backgroundColor: '#101820', borderWidth: 1, borderColor: '#45515E' },
  center: { position: 'absolute', left: '50%', width: 2, height: 36, backgroundColor: '#5EE0B5' },
  needle: { position: 'absolute', width: 8, height: 28, marginLeft: -4, borderRadius: 4, backgroundColor: '#F5F7F8' },
  cents: { color: '#F5F7F8', fontSize: 28, fontWeight: '700' },
  status: { color: '#F4B860', fontSize: 20, fontWeight: '700', textAlign: 'center' },
  statusOk: { color: '#5EE0B5' },
  dim: { opacity: 0.6 },
  hidden: { height: 0, width: 0, opacity: 0 },
});
