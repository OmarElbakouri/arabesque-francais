import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { beforeEach, test } from 'node:test';
import ts from 'typescript';

const compile = source => `data:text/javascript;base64,${Buffer.from(ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
}).outputText).toString('base64')}`;
const { VoiceTurnSubmission } = await import(compile(await readFile(
  new URL('../src/lib/voiceTurnSubmission.ts', import.meta.url), 'utf8')));
const source = (await readFile(new URL('../src/services/voiceQuizService.ts', import.meta.url), 'utf8'))
  .replace("import api from '@/lib/api';", 'const api = { post: (...args) => globalThis.voiceTestApi.post(...args) };');
const service = await import(compile(source.replace("import { postAiOnce } from '@/lib/aiRequest';", "const postAiOnce = (_feature, ...args) => api.post(...args);")));
const recording = () => ({ sessionId: 41, questionId: 0, audioBlob: new Blob(['synthetic audio']), audioFormat: 'webm' });
const success = (extra = {}) => ({ data: { success: true, data: {
  sessionId: 41, questionId: 0, correct: true, partiallyCorrect: false,
  evaluationStatus: 'EVALUATED', targetUsed: false, currentQuestionIndex: 1,
  nextQuestion: { id: 1, question: 'Avec qui ?', audioData: null }, ...extra,
} } });

beforeEach(() => {
  globalThis.FileReader = class {
    readAsDataURL(blob) {
      blob.arrayBuffer().then(data => {
        this.result = `data:audio/webm;base64,${Buffer.from(data).toString('base64')}`;
        this.onloadend();
      });
    }
  };
});

test('an analysis failure retains the exact recording and retry succeeds without re-recording', async () => {
  let attempts = 0;
  const captured = [];
  const submission = new VoiceTurnSubmission(async (...args) => {
    captured.push(args);
    if (++attempts === 1) throw new Error('temporary outage');
    return { nextQuestion: { id: 1 } };
  });
  const answer = recording();
  await assert.rejects(submission.run(answer));
  assert.equal(submission.pending.audioBlob, answer.audioBlob);
  await submission.run(submission.pending);
  assert.equal(captured[0][2], captured[1][2]);
  assert.equal(submission.pending, null);
});

test('overlapping effect executions share one request', async () => {
  let resolve;
  let calls = 0;
  const submission = new VoiceTurnSubmission(() => {
    calls++;
    return new Promise(done => { resolve = done; });
  });
  const answer = recording();
  const first = submission.run(answer);
  const second = submission.run(answer);
  assert.equal(first, second);
  assert.equal(calls, 1);
  resolve('done');
  await first;
});

test('an old session response cannot clear a new session recording', async () => {
  const completions = [];
  const submission = new VoiceTurnSubmission(() => new Promise(resolve => completions.push(resolve)));
  const old = submission.run(recording());
  submission.clear();
  const current = recording();
  current.sessionId = 42;
  const fresh = submission.run(current);
  completions[0]('old');
  await old;
  assert.equal(submission.pending, current);
  completions[1]('fresh');
  await fresh;
  assert.equal(submission.pending, null);
});

test('a lost response retries the same turn and audio with a 90-second request timeout', async () => {
  const calls = [];
  globalThis.voiceTestApi = { post: async (...args) => {
    calls.push(args);
    if (calls.length === 1) throw new Error('response lost');
    return success();
  } };
  const submission = new VoiceTurnSubmission(service.submitVoiceAnswer);
  await assert.rejects(submission.run(recording()));
  const response = await submission.run(submission.pending);
  assert.equal(response.isCorrect, true);
  assert.equal(response.targetUsed, false);
  assert.deepEqual(calls[0][1], calls[1][1]);
  assert.equal(calls[0][2].timeout, 90000);
});

test('missing next turn retains the recording instead of silently reopening the same question', async () => {
  globalThis.voiceTestApi = { post: async () => success({ nextQuestion: null }) };
  const submission = new VoiceTurnSubmission(service.submitVoiceAnswer);
  await assert.rejects(submission.run(recording()), /suite de la conversation/);
  assert.notEqual(submission.pending, null);
});

test('a closing reply completes without requiring another question', async () => {
  globalThis.voiceTestApi = { post: async () => success({ sessionComplete: true, nextQuestion: null }) };
  assert.equal((await service.submitVoiceAnswer(41, 0, recording().audioBlob)).isLastQuestion, true);
});

test('an ungraded clarification keeps its status and is never presented as an error by the service', async () => {
  globalThis.voiceTestApi = { post: async () => success({
    correct: false, partiallyCorrect: false, evaluationStatus: 'NOT_EVALUATED', errors: [],
  }) };
  const response = await service.submitVoiceAnswer(41, 0, recording().audioBlob);
  assert.equal(response.evaluationStatus, 'NOT_EVALUATED');
  assert.deepEqual(response.errors, []);
});

test('empty success payload preserves recovery rather than defaulting to a negative grade', async () => {
  globalThis.voiceTestApi = { post: async () => ({ data: { success: true, data: null } }) };
  const submission = new VoiceTurnSubmission(service.submitVoiceAnswer);
  await assert.rejects(submission.run(recording()), /analyse n’a pas été reçue/);
  assert.notEqual(submission.pending, null);
});
