# native-pitch-tuner Specification (proposed)

## Requirement: Native monophonic pitch analysis
The Android tuner MUST analyze microphone PCM natively without continuously bridging raw PCM to JavaScript.
### Scenario: Stable monophonic tone
- **WHEN** a sufficiently clean stable single note is captured with permission granted
- **THEN** the tuner reports measured frequency, note, octave, cents and quality/confidence using the effective audio configuration.
### Scenario: Unreliable input
- **WHEN** input is silent, ambiguous, distorted or below confidence requirements
- **THEN** the tuner SHALL show an unavailable/unstable state rather than presenting a guessed current note.

## Requirement: Tuning modes
The tuner MUST provide chromatic recognition and a standard six-string guitar mode.
### Scenario: Chromatic note outside open strings
- **WHEN** the user selects chromatic mode and plays another detectable note
- **THEN** its note and cents SHALL be displayed without restriction to open strings.
### Scenario: Guitar mode
- **WHEN** the user selects guitar mode and chooses an open string
- **THEN** the interface MUST present E2, A2, D3, G3, B3 and E4 as selectable references and SHALL clearly distinguish observed chromatic pitch from deviation relative to the selected target, never claiming the observed note matches an unmatched string.

## Requirement: Accessible and truthful visual feedback
The tuner MUST display a large note, cents and pointer with text indicating flat/in-tune/sharp and accessible pt-BR states.
### Scenario: Low-confidence or interrupted session
- **WHEN** pitch becomes unreliable or capture stops
- **THEN** stale pitch SHALL NOT be shown as a live reliable measurement, and controls/status MUST remain understandable without color alone.

## Requirement: Session correctness
The tuner MUST prevent delayed events from an ended analysis session being presented as current pitch.
### Scenario: Stop and restart
- **WHEN** analysis stops and a new session starts while events from the previous session remain queued
- **THEN** stale events SHALL be ignored rather than shown as live readings.

## Requirement: Privacy, offline behavior and recovery
The tuner MUST work offline, MUST NOT save or upload PCM, and MUST stop/release capture when permission or lifecycle requires.
### Scenario: Permission revoked or app backgrounded
- **WHEN** microphone permission is revoked or the app leaves foreground
- **THEN** capture and pitch events SHALL stop, resources SHALL be released, and recovery SHALL require explicit user action.
