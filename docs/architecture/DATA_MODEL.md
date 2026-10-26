# Modelo de dados local — proposta v1

Persistência SQLite, identificadores UUID, datas em UTC e migrações incrementais.

| Tabela | Campos principais | Observações |
|---|---|---|
| instruments | id, name, string_count, tuning_id | Instrumento e afinação ativa |
| tunings | id, name, reference_hz | Afinações cadastradas |
| tuning_strings | tuning_id, string_number, midi_note | PK composta, ordenação de cordas explícita |
| exercises | id, title, type, level, bpm_min, bpm_max, version | Catálogo versionado |
| exercise_notes | id, exercise_id, note_midi, beat_position, duration_beats | Expectativa rítmica e melódica |
| practice_routines | id, title, target_minutes | Rotinas do usuário |
| routine_exercises | routine_id, exercise_id, position | Ordem e configuração |
| practice_sessions | id, instrument_id, started_at, ended_at | Sessão |
| session_exercises | id, session_id, exercise_id, bpm, status, score, scoring_version | Execuções |
| note_events | id, session_exercise_id, note_midi, onset_ms, confidence | Retenção limitada, sem armazenar PCM por padrão |
| audio_assets | id, title, local_uri, duration_ms | Áudio importado pelo usuário |
| app_settings | key, value | Validar esquema/versão |

## Regras

- Usar FKs e índices em consultas por sessão/data.
- Preservar snapshots ou versão de exercícios e algoritmo para evitar comparação de resultados incompatíveis.
- Pontuações devem guardar componentes de nota, ritmo, estabilidade e confiança, não só score final.
- Importação de backup deve validar integridade e versão, com rollback.
- Não salvar gravações brutas automaticamente; requer consentimento e política de armazenamento.
- Campos exatos e normalização dependem do primeiro protótipo de persistência.
