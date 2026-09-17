import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import ts from 'typescript';

const source = await readFile(new URL('../src/lib/sophieAudioPlayer.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
});
const { SophieAudioPlayer } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

function setup() {
  const instances = [];
  const statuses = [];
  globalThis.Audio = class {
    src = '';
    played = [];
    nextPlay = null;
    constructor() { instances.push(this); }
    play() {
      this.played.push(this.src);
      const result = this.nextPlay;
      this.nextPlay = null;
      return result ?? Promise.resolve();
    }
    pause() {}
    load() {}
    removeAttribute() { this.src = ''; }
  };
  return { player: new SophieAudioPlayer(s => statuses.push(s)), statuses, instances };
}

test('priming and successive replies reuse one audio element', () => {
  const { player, instances, statuses } = setup();
  player.prime();
  player.play(['feedback', 'question']);
  instances[0].onended();
  instances[0].onended();
  player.play(['another-reply']);
  assert.equal(instances.length, 1);
  assert.deepEqual(instances[0].played.slice(1), [
    'data:audio/mpeg;base64,feedback', 'data:audio/mpeg;base64,question',
    'data:audio/mpeg;base64,another-reply',
  ]);
  assert.ok(statuses.includes('finished'));
});

test('autoplay denial preserves the reply and next question until a tap retries', async () => {
  const { player, instances, statuses } = setup();
  player.prime();
  instances[0].nextPlay = Promise.reject(new DOMException('Blocked', 'NotAllowedError'));
  player.play(['feedback', 'question']);
  await Promise.resolve();
  assert.equal(statuses.at(-1), 'blocked');
  assert.equal(instances[0].played.length, 2);
  player.retry();
  assert.equal(instances[0].played.at(-1), 'data:audio/mpeg;base64,feedback');
  instances[0].onended();
  assert.equal(instances[0].played.at(-1), 'data:audio/mpeg;base64,question');
  instances[0].onended();
  assert.equal(statuses.at(-1), 'finished');
});

test('a failure on the second clip retries that clip without repeating feedback', async () => {
  const { player, instances, statuses } = setup();
  player.play(['feedback', 'question']);
  instances[0].nextPlay = Promise.reject(new DOMException('Interrupted', 'AbortError'));
  instances[0].onended();
  await Promise.resolve();
  assert.equal(statuses.at(-1), 'blocked');
  player.retry();
  assert.deepEqual(instances[0].played, [
    'data:audio/mpeg;base64,feedback', 'data:audio/mpeg;base64,question',
    'data:audio/mpeg;base64,question',
  ]);
});

test('exiting clears playback and ignores late errors and end callbacks', async () => {
  const { player, instances, statuses } = setup();
  player.prime();
  let reject;
  instances[0].nextPlay = new Promise((_, r) => { reject = r; });
  player.play(['feedback', 'question']);
  const ended = instances[0].onended;
  player.stop();
  reject(new Error('Late rejection'));
  ended();
  await Promise.resolve();
  player.retry();
  assert.deepEqual(statuses, ['playing']);
  assert.equal(instances[0].onended, null);
  assert.equal(instances[0].src, '');
});

test('media errors retain the clip and missing audio finishes without a recovery button', () => {
  const { player, instances, statuses } = setup();
  player.play(['reply']);
  instances[0].onerror();
  assert.equal(statuses.at(-1), 'blocked');
  player.retry();
  assert.equal(instances[0].played.at(-1), 'data:audio/mpeg;base64,reply');
  player.play([]);
  assert.equal(statuses.at(-1), 'finished');
});
