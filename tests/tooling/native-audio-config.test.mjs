import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read = (path) => fs.readFileSync(path, 'utf8');

test('o app declara microfone contextual sem desproteger permissões não relacionadas', () => {
  const app = JSON.parse(read('app.json')).expo;
  assert.deepEqual(app.android.permissions, ['android.permission.RECORD_AUDIO']);
  assert.ok(!app.android.blockedPermissions.includes('android.permission.RECORD_AUDIO'));
  for (const permission of ['android.permission.CAMERA', 'android.permission.READ_MEDIA_AUDIO']) {
    assert.ok(app.android.blockedPermissions.includes(permission));
  }
  assert.ok(!app.plugins.includes('expo-audio'));
});

test('o autolinking do módulo aponta para implementação Kotlin local', () => {
  const config = JSON.parse(read('modules/riffando-audio/expo-module.config.json'));
  assert.deepEqual(config.platforms, ['android']);
  assert.deepEqual(config.android.modules, ['br.com.riffando.audio.RiffandoAudioModule']);
  const kotlin = read('modules/riffando-audio/android/src/main/java/br/com/riffando/audio/RiffandoAudioModule.kt');
  assert.match(kotlin, /class RiffandoAudioModule : Module\(\)/);
  assert.match(kotlin, /AudioRecord\.Builder\(\)/);
  assert.match(kotlin, /AudioTimestamp\.TIMEBASE_MONOTONIC/);
  assert.match(kotlin, /AudioRecord\.READ_BLOCKING/);
  assert.doesNotMatch(kotlin, /FileOutputStream|MediaRecorder\(\)|HttpURLConnection|OutputStream/);
});

test('a fundação explica a captura opcional e o smoke preserva consentimento', () => {
  const messages = read('src/shared/i18n/pt-BR.ts');
  assert.match(messages, /somente quando você decide iniciar a captura/);
  assert.match(read('scripts/smoke-android.mjs'), /granted=false/);
});
