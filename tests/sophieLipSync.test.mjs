import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import ts from 'typescript';

const source = await readFile(new URL('../src/lib/sophieLipSync.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
});
const { buildEnvelope, nextMouth } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

const tone = (seconds, amplitude, rate = 3000) =>
  Array.from({ length: seconds * rate }, (_, i) => amplitude * Math.sin(i / 3));

test('silence stays closed and loud speech opens the mouth', () => {
  const rate = 3000;
  const samples = Float32Array.from([...tone(0.5, 0, rate), ...tone(0.5, 0.8, rate), ...tone(0.5, 0, rate)]);
  const envelope = buildEnvelope(samples, rate, 30);
  assert.equal(envelope.length, 45);
  assert.ok(envelope[5] < 0.05, 'leading silence');
  assert.ok(envelope[25] > 0.9, 'speech');
  assert.ok(envelope[44] < 0.05, 'mouth closes again after speech');
  assert.ok(envelope[31] > envelope[33], 'release is gradual, not instant');
});

test('an all-silent clip never divides by zero', () => {
  const envelope = buildEnvelope(new Float32Array(3000), 3000, 30);
  assert.ok(envelope.every(v => v === 0));
});

test('hysteresis keeps the mouth from fluttering around a threshold', () => {
  assert.equal(nextMouth(0.1, 'closed'), 'closed');
  assert.equal(nextMouth(0.18, 'closed'), 'closed');
  assert.equal(nextMouth(0.18, 'half'), 'half');
  assert.equal(nextMouth(0.55, 'half'), 'half');
  assert.equal(nextMouth(0.55, 'open'), 'open');
  assert.equal(nextMouth(0.7, 'closed'), 'open');
  assert.equal(nextMouth(0.05, 'open'), 'closed');
});

test('cueAt finds the active mouth shape, and none outside the cues', async () => {
  const { cueAt } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
  const cues = [{ start: 0, end: 0.2, value: 'X' }, { start: 0.2, end: 0.45, value: 'B' }, { start: 0.45, end: 0.6, value: 'D' }];
  assert.equal(cueAt(cues, 0.1), 'X');
  assert.equal(cueAt(cues, 0.2), 'B');
  assert.equal(cueAt(cues, 0.5), 'D');
  assert.equal(cueAt(cues, 0.6), null);
  assert.equal(cueAt([], 0.3), null);
});
