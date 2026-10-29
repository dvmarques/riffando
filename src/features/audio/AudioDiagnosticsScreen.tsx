import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { AppState, PermissionsAndroid, Platform, StyleSheet, Text, View } from 'react-native';
import { nativeCapture, type CaptureConfig, type CaptureMetrics, type CaptureStatus } from '@/infrastructure/audio/nativeCapture';
import { Action } from '@/shared/ui/Action';
import { Screen } from '@/shared/ui/Screen';

const statusLabels: Record<CaptureStatus, string> = {
  idle: 'Captura parada',
  requestingPermission: 'Aguardando permissão do microfone',
  starting: 'Iniciando captura',
  recording: 'Captura ativa',
  stopping: 'Interrompendo captura',
  error: 'Captura indisponível',
};

const errorLabels: Record<string, string> = {
  AUDIO_PERMISSION_DENIED: 'O acesso ao microfone não foi autorizado.',
  AUDIO_PERMISSION_REVOKED: 'O acesso ao microfone foi interrompido ou revogado.',
  AUDIO_INITIALIZATION_FAILED: 'Não foi possível iniciar o microfone neste aparelho.',
  AUDIO_READ_FAILED: 'A leitura do microfone foi interrompida.',
  AUDIO_CONTEXT_UNAVAILABLE: 'O microfone não está disponível neste momento.',
  AUDIO_STOPPING: 'O microfone ainda está sendo liberado. Tente novamente.',
  AUDIO_STOP_TIMEOUT: 'O microfone demorou para encerrar. Tente novamente ou reinicie o aplicativo.',
};

export default function AudioDiagnosticsScreen() {
  const router = useRouter();
  const [status, setStatus] = useState<CaptureStatus>('idle');
  const [error, setError] = useState('');
  const [moduleUnavailable, setModuleUnavailable] = useState(false);
  const [config, setConfig] = useState<CaptureConfig | null>(null);
  const [metrics, setMetrics] = useState<CaptureMetrics | null>(null);
  const operation = useRef(0);
  const awaitingPermission = useRef(false);
  const mounted = useRef(true);
  const busy = status === 'starting' || status === 'requestingPermission' || status === 'stopping';
  const startPending = useRef(false);

  const stop = useCallback(async () => {
    operation.current++;
    // Manter o bloqueio do start pendente até a promessa antiga finalizar.
    setStatus('stopping');
    try {
      await nativeCapture.stop();
      if (mounted.current) {
        setMetrics(null);
        setConfig(null);
        setError('');
        setStatus('idle');
      }
    } catch {
      if (mounted.current) {
        setStatus('error');
        setError('Não foi possível encerrar a captura. Feche e abra o aplicativo.');
      }
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    let metricsSubscription: { remove: () => void } | undefined;
    let errorSubscription: { remove: () => void } | undefined;
    try {
      if (Platform.OS !== 'android') throw new Error('PLATFORM_UNSUPPORTED');
      metricsSubscription = nativeCapture.onMetrics((value) => {
        if (mounted.current) setMetrics(value);
      });
      errorSubscription = nativeCapture.onError(({ code }) => {
        operation.current++;
        if (mounted.current) {
          setError(errorLabels[code] ?? 'Ocorreu um erro ao capturar áudio.');
          setStatus('error');
          setMetrics(null);
          setConfig(null);
        }
      });
    } catch {
      // A falha é propagada fora da fase síncrona de configuração do efeito.
      void Promise.resolve().then(() => {
        if (mounted.current) {
          setModuleUnavailable(true);
          setError(Platform.OS === 'android'
            ? 'O módulo nativo exige o aplicativo Android compilado, não o Expo Go.'
            : 'O diagnóstico de áudio está disponível apenas no Android.');
          setStatus('error');
        }
      });
    }

    const appStateListener = AppState.addEventListener('change', (state) => {
      if (state !== 'active' && !awaitingPermission.current) {
        operation.current++;
        void nativeCapture.stop().catch(() => {});
        if (mounted.current) {
          setStatus('idle');
          setMetrics(null);
          setConfig(null);
        }
      }
    });
    return () => {
      mounted.current = false;
      startPending.current = false;
      metricsSubscription?.remove();
      errorSubscription?.remove();
      appStateListener.remove();
      void nativeCapture.stop().catch(() => {});
    };
  }, []);

  const start = async () => {
    if (moduleUnavailable || busy || status === 'recording' || startPending.current) return;
    startPending.current = true;
    const id = ++operation.current;
    setError('');
    setMetrics(null);

    if (Platform.OS !== 'android') {
      startPending.current = false;
      setStatus('error');
      setError('O diagnóstico de áudio está disponível apenas no Android.');
      return;
    }
    try {
      setStatus('requestingPermission');
      awaitingPermission.current = true;
      let granted: string;
      try {
        granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
      } finally {
        awaitingPermission.current = false;
      }
      if (!mounted.current || id !== operation.current || AppState.currentState === 'background') return;
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        setStatus('error');
        setError(granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
          ? 'O microfone está bloqueado para o Riffando. Ative-o em Configurações > Apps > Riffando > Permissões > Microfone e tente de novo.'
          : 'O microfone precisa de autorização para iniciar a captura.');
        return;
      }

      setStatus('starting');
      const selected = await nativeCapture.start();
      if (!mounted.current || id !== operation.current) {
        await nativeCapture.stop();
        return;
      }
      setConfig(selected);
      setStatus('recording');
    } catch (failure) {
      if (!mounted.current || id !== operation.current) return;
      const message = failure instanceof Error ? failure.message : '';
      const code = Object.keys(errorLabels).find((key) => message.includes(key));
      setStatus('error');
      setError(code ? errorLabels[code] ?? '' : 'Não foi possível iniciar a captura. Tente novamente.');
    } finally {
      startPending.current = false;
    }
  };

  const back = () => {
    void stop();
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  const format = (value: number | undefined) => value === undefined ? '—' : Number.isFinite(value) ? value.toFixed(1).replace('.', ',') : '—';

  return (
    <Screen>
      <Text accessibilityRole="header" style={styles.title}>Diagnóstico de áudio</Text>
      <Text style={styles.body}>
        Teste técnico de captura pelo microfone. Não é um afinador e não reconhece notas.
      </Text>
      <View style={styles.card}>
        <Text accessibilityRole="header" style={styles.heading}>Estado do microfone</Text>
        <Text accessibilityRole="text" accessibilityLiveRegion="polite" style={styles.value}>{statusLabels[status]}</Text>
        {error ? <Text accessibilityRole="alert" accessibilityLiveRegion="assertive" style={styles.warning}>{error}</Text> : null}
        <Text style={styles.body}>
          Ao iniciar, o aplicativo solicita acesso ao microfone. O áudio não é gravado nem enviado.
        </Text>
      </View>
      {config ? (
        <View style={styles.card}>
          <Text accessibilityRole="header" style={styles.heading}>Configuração real</Text>
          <Text style={styles.body}>Entrada: {config.source === 'unprocessed' ? 'Microfone sem processamento (quando suportado)' : 'Microfone padrão'}</Text>
          <Text style={styles.body}>Formato: mono · PCM 16-bit</Text>
          <Text style={styles.body}>Frequência: {config.sampleRate} Hz</Text>
          <Text style={styles.body}>Buffer nativo: {config.bufferBytes} bytes</Text>
        </View>
      ) : null}
      <View style={styles.card}>
        <Text accessibilityRole="header" style={styles.heading}>Medições de sinal</Text>
        <Text style={styles.body}>RMS: {format(metrics?.rmsDbfs)} dBFS</Text>
        <Text style={styles.body}>Pico: {format(metrics?.peakDbfs)} dBFS</Text>
        <Text style={styles.body}>Saturação detectada: {metrics ? metrics.clipping ? 'Sim' : 'Não' : '—'}</Text>
        <Text style={styles.body}>Frames observados: {metrics?.framesRead ?? '—'}</Text>
        <Text style={styles.body}>Timestamp do áudio: {metrics?.timestampOrigin === 'audio-record' ? 'AudioRecord (monotônico)' : 'Indisponível'}</Text>
        <Text style={styles.note}>
          dBFS indica nível digital, não volume acústico nem latência. Não há medição exata de buffers perdidos.
        </Text>
      </View>
      {moduleUnavailable ? (
        <Text style={styles.note}>A captura não está disponível nesta instalação.</Text>
      ) : status === 'recording' ? (
        <Action label="Parar captura" onPress={() => { void stop(); }} />
      ) : !busy ? (
        <Action label="Iniciar captura" onPress={() => { void start(); }} />
      ) : (
        <Text style={styles.note}>Aguarde a conclusão da operação.</Text>
      )}
      <Action label="Voltar ao início" onPress={back} />
      <Text style={styles.note}>A captura é encerrada ao sair desta tela ou colocar o app em segundo plano.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: '#F5F7F8', fontSize: 30, fontWeight: '800' },
  heading: { color: '#F5F7F8', fontSize: 20, fontWeight: '700' },
  value: { color: '#5EE0B5', fontSize: 20, fontWeight: '700' },
  body: { color: '#CBD5DF', fontSize: 16, lineHeight: 24 },
  note: { color: '#CBD5DF', fontSize: 14, lineHeight: 22 },
  warning: { color: '#F4B860', fontSize: 16, lineHeight: 24 },
  card: { padding: 20, gap: 10, borderWidth: 1, borderColor: '#45515E', borderRadius: 16, backgroundColor: '#18232E' },
});
