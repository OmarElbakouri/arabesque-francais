import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import ts from 'typescript';

const source = await readFile(new URL('../src/lib/professorClips.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
});
const { nextClip, isUrgent, SPEAKING_CYCLE } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

const fresh = { greetPending: false, modeClipDone: false, cycle: 0 };
const run = (state, speaking, mode, n) => {
  const clips = [];
  for (let i = 0; i < n; i++) ({ clip: clips[i], state } = nextClip(state, speaking, mode));
  return clips;
};

test('greets once, then idles', () => {
  assert.deepEqual(run({ ...fresh, greetPending: true }, false, 'idle', 3), ['wave', 'idle', 'idle']);
});

test('speaking cycles gestures with calm clips between, never the same gesture twice in a row', () => {
  const clips = run(fresh, true, 'idle', 12);
  assert.deepEqual(clips.slice(0, 6), SPEAKING_CYCLE);
  for (let i = 1; i < clips.length; i++) {
    if (clips[i] !== 'idle') assert.notEqual(clips[i], clips[i - 1]);
  }
});

test('thinking plays its clip once, then rests', () => {
  assert.deepEqual(run(fresh, false, 'thinking', 3), ['think', 'idle', 'idle']);
});

test('praise comes first even when the feedback is already being spoken', () => {
  assert.deepEqual(run(fresh, true, 'encouraging', 3), ['encourage', 'explain1', 'idle']);
});

test('listening nods now and then, not constantly', () => {
  assert.deepEqual(run(fresh, false, 'listening', 6), ['listen', 'idle', 'idle', 'listen', 'idle', 'idle']);
});

test('a quick dissolve only when speech starts on a non-speaking clip, or a mode change interrupts idle', () => {
  assert.equal(isUrgent('think', true, false, false), true);
  assert.equal(isUrgent('explain2', true, false, false), false);
  assert.equal(isUrgent('encourage', true, false, false), false);
  assert.equal(isUrgent('idle', true, true, false), false);
  assert.equal(isUrgent('idle', false, false, true), true);
  assert.equal(isUrgent('wave', false, false, true), false);
});
