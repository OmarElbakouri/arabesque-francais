import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { beforeEach, test } from 'node:test';
import ts from 'typescript';

const source = (await readFile(new URL('../src/lib/aiRequest.ts', import.meta.url), 'utf8'))
  .replace("import api from '@/lib/api';", 'const api = { post: (...args) => globalThis.aiApi(...args) };')
  .replace("import { useAuthStore } from '@/stores/authStore';",
    'const useAuthStore = { getState: () => ({ user: globalThis.aiUser }) };');
let instance = 0;
const load = () => {
  const { outputText } = ts.transpileModule(`${source}\n// instance ${++instance}`, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
  });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
};
const ok = { data: { success: true, data: { reply: 'Bonjour', status: 'success' } } };
beforeEach(() => {
  const storage = new Map();
  globalThis.sessionStorage = {
    getItem: key => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: key => storage.delete(key),
  };
  globalThis.aiUser = { id: 1 };
});

test('lost response retains the original payload and ID across refresh, then clears on success', async () => {
  const calls = [];
  globalThis.aiApi = async (...args) => {
    calls.push(args);
    if (calls.length === 1) throw new Error('lost response');
    return ok;
  };
  const first = await load();
  await assert.rejects(first.postAiOnce('chatbot', '/chatbot/message', { message: 'Bonjour' }));
  const refreshed = await load();
  assert.ok(refreshed.pendingAiRequest('chatbot'));
  await refreshed.retryPendingAi('chatbot');
  assert.deepEqual(calls[0], calls[1]);
  assert.equal(refreshed.pendingAiRequest('chatbot'), null);
  await refreshed.postAiOnce('chatbot', '/chatbot/message', { message: 'Bonjour' });
  assert.notEqual(calls[1][1].requestId, calls[2][1].requestId);
});

test('double clicks share one request while different content is rejected', async () => {
  let complete;
  let calls = 0;
  globalThis.aiApi = () => { calls++; return new Promise(resolve => { complete = resolve; }); };
  const helper = await load();
  const first = helper.postAiOnce('voice_quiz', '/voice-quiz/start', { thematicGroup: 1 });
  const second = helper.postAiOnce('voice_quiz', '/voice-quiz/start', { thematicGroup: 1 });
  assert.equal(first, second);
  await assert.rejects(helper.postAiOnce('voice_quiz', '/voice-quiz/start', { thematicGroup: 2 }), /en attente/);
  assert.equal(calls, 1);
  complete(ok);
  await first;
});

test('accounts and service budgets have independent pending requests', async () => {
  globalThis.aiApi = async () => { throw new Error('offline'); };
  const helper = await load();
  await assert.rejects(helper.postAiOnce('chatbot', '/message', { message: 'a' }));
  const original = helper.pendingAiRequest('chatbot').requestId;
  assert.equal(helper.pendingAiRequest('voice_quiz'), null);
  globalThis.aiUser = { id: 2 };
  assert.equal(helper.pendingAiRequest('chatbot'), null);
  await assert.rejects(helper.postAiOnce('chatbot', '/message', { message: 'b' }));
  assert.notEqual(helper.pendingAiRequest('chatbot').requestId, original);
  globalThis.aiUser = { id: 1 };
  assert.equal(helper.pendingAiRequest('chatbot').requestId, original);
});

test('pending conflicts and server failures keep the ID; definitive refusals clear it', async () => {
  for (const status of [409, 500, 502, 503, 504, 400, 401, 403, 410, 413, 422, 429]) {
    const helper = await load();
    globalThis.aiApi = async () => { throw { response: { status } }; };
    await assert.rejects(helper.postAiOnce(`feature-${status}`, '/start', {}));
    assert.equal(Boolean(helper.pendingAiRequest(`feature-${status}`)), [409, 500, 502, 503, 504].includes(status));
  }
});

test('a provider error in a successful HTTP response retains its retry key', async () => {
  globalThis.aiApi = async () => ({ data: { success: true, data: { status: 'error', reply: 'Unavailable' } } });
  const helper = await load();
  await assert.rejects(helper.postAiOnce('chatbot', '/message', {}), /Unavailable/);
  assert.ok(helper.pendingAiRequest('chatbot'));
  const id = helper.pendingAiRequest('chatbot').requestId;
  globalThis.aiApi = async () => ({ data: { success: true, data: null } });
  await assert.rejects(helper.retryPendingAi('chatbot'));
  assert.equal(helper.pendingAiRequest('chatbot').requestId, id);
});

test('blocked storage still supports retries and clearing within this page', async () => {
  globalThis.sessionStorage = {
    getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); },
    removeItem: () => { throw new Error('blocked'); },
  };
  const helper = await load();
  globalThis.aiApi = async () => { throw new Error('offline'); };
  await assert.rejects(helper.postAiOnce('voice_quiz', '/start', {}));
  const id = helper.pendingAiRequest('voice_quiz').requestId;
  await assert.rejects(helper.retryPendingAi('voice_quiz'));
  assert.equal(helper.pendingAiRequest('voice_quiz').requestId, id);
  helper.clearPendingAi('voice_quiz');
  assert.equal(helper.pendingAiRequest('voice_quiz'), null);
});
