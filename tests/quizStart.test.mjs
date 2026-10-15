import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { beforeEach, test } from 'node:test';
import ts from 'typescript';

const compile = source => {
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
  });
  return `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`;
};
const helperSource = await readFile(new URL('../src/lib/quizStart.ts', import.meta.url), 'utf8');
const helperUrl = compile(helperSource);
const helpers = await import(helperUrl);
const serviceSource = (await readFile(new URL('../src/services/quizService.ts', import.meta.url), 'utf8'))
  .replace("import api from '@/lib/api';", 'const api = { post: (...args) => globalThis.quizTestApi.post(...args) };')
  .replace("import { useAuthStore } from '@/stores/authStore';",
    'const useAuthStore = { getState: () => ({ user: globalThis.quizTestUser }) };')
  .replace("from '@/lib/quizStart'", `from '${helperUrl}'`);
const service = await import(compile(serviceSource));

let nextAccount = 0;
beforeEach(() => {
  const storage = new Map();
  globalThis.sessionStorage = {
    getItem: key => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: key => storage.delete(key),
  };
  globalThis.quizTestUser = { id: `account-${++nextAccount}` };
});

const success = (id = 17, recovered = false) => ({ data: { success: true, data: {
  sessionId: id, thematicGroup: 1, resumedFromSaved: recovered,
  questions: [{ questionText: 'Choisissez un article.', questionType: 'CHOIX_MULTIPLE', options: ['Le', 'La'] }],
} } });

test('a lost response retries with the same ID and a 90-second startup timeout', async () => {
  const calls = [];
  globalThis.quizTestApi = { post: async (...args) => {
    calls.push(args);
    if (calls.length === 1) throw { isAxiosError: true, code: 'ECONNABORTED' };
    return success(17, calls.length === 2);
  } };
  await assert.rejects(service.startQuizSession(1, [5]));
  assert.equal(service.hasPendingQuizStart(1, [5]), true);
  const recovered = await service.startQuizSession(1, [5]);
  assert.equal(recovered.sessionId, '17');
  assert.equal(recovered.resumedFromSaved, true);
  assert.equal(calls[0][1].startRequestId, calls[1][1].startRequestId);
  assert.equal(calls[0][1].recoverExisting, false);
  assert.equal(calls[1][1].recoverExisting, true);
  assert.equal(calls[0][2].timeout, 90000);
  assert.equal(service.hasPendingQuizStart(1, [5]), false);
  await service.startQuizSession(1, [5]);
  assert.notEqual(calls[2][1].startRequestId, calls[1][1].startRequestId);
  assert.equal(calls[2][1].recoverExisting, false);
});

test('the pending ID survives a fresh module load and stays scoped to account and chapters', async () => {
  const scope = helpers.quizStartScope('student-a', 1, [3, 2]);
  const id = helpers.quizStartRequestId(scope);
  const reloaded = await import(compile(`${helperSource}\n// fresh page load`));
  assert.equal(reloaded.quizStartRequestId(helpers.quizStartScope('student-a', 1, [2, 3])), id);
  assert.notEqual(reloaded.quizStartRequestId(helpers.quizStartScope('student-b', 1, [2, 3])), id);
  assert.notEqual(reloaded.quizStartRequestId(helpers.quizStartScope('student-a', 1, [4])), id);
});

test('overlapping clicks send one request and return the same session', async () => {
  let resolve;
  let calls = 0;
  globalThis.quizTestApi = { post: () => { calls++; return new Promise(r => { resolve = r; }); } };
  const first = service.startQuizSession(1, [6]);
  const second = service.startQuizSession(1, [6]);
  assert.equal(calls, 1);
  resolve(success());
  assert.deepEqual(await first, await second);
});

test('a malformed success response retains recovery information and exposes a useful error', async () => {
  globalThis.quizTestApi = { post: async () => ({ data: { success: true, data: null } }) };
  await assert.rejects(service.startQuizSession(1, [7]), /Aucune question reçue/);
  assert.equal(service.hasPendingQuizStart(1, [7]), true);
});

test('a definitive completed-session rejection allows a new start request', async () => {
  const ids = [];
  globalThis.quizTestApi = { post: async (_, body) => {
    ids.push(body.startRequestId);
    if (ids.length === 1) throw { response: { status: 400, data: { message: 'Ce quiz est déjà terminé.' } } };
    return success();
  } };
  await assert.rejects(service.startQuizSession(1, [8]));
  assert.equal(service.hasPendingQuizStart(1, [8]), false);
  await service.startQuizSession(1, [8]);
  assert.notEqual(ids[0], ids[1]);
});

test('explicit resume uses the longer timeout without creating a new start ID', async () => {
  let body;
  globalThis.quizTestApi = { post: async (_, request, options) => {
    body = request;
    assert.equal(options.timeout, 90000);
    return success();
  } };
  await service.startQuizSession(1, [9], '17');
  assert.equal(body.resumeSessionId, '17');
  assert.equal(body.startRequestId, undefined);
});

test('storage restrictions still preserve an uncertain attempt in memory', () => {
  globalThis.sessionStorage = {
    getItem: () => { throw new Error('blocked'); },
    setItem: () => { throw new Error('blocked'); },
    removeItem: () => { throw new Error('blocked'); },
  };
  const scope = helpers.quizStartScope('restricted-storage', 1, [1]);
  const id = helpers.quizStartRequestId(scope);
  assert.equal(helpers.quizStartRequestId(scope), id);
  helpers.clearQuizStartId(scope, id);
  assert.notEqual(helpers.quizStartRequestId(scope), id);
});

test('errors distinguish timeouts, network failures, login, plan limits, and unavailable services', () => {
  const message = helpers.getQuizStartErrorMessage;
  assert.match(message({ isAxiosError: true, code: 'ECONNABORTED' }), /prend trop de temps/);
  assert.match(message({ isAxiosError: true, code: 'ERR_NETWORK' }), /connexion Internet/);
  assert.match(message({ response: { status: 401 } }), /reconnecter/);
  assert.match(message({ response: { status: 403 } }), /Reconnectez-vous/);
  assert.equal(message({ response: { status: 403, data: { message: 'Limite mensuelle atteinte (100/100).' } } }),
    'Limite mensuelle atteinte (100/100).');
  assert.match(message({ response: { status: 502, data: '<html>Bad Gateway</html>' } }), /temporairement indisponible/);
  assert.match(message({ response: { status: 503 } }), /temporairement indisponible/);
  assert.match(message({ response: { status: 504 } }), /prend trop de temps/);
  assert.match(message(new Error('Aucune question reçue.')), /Aucune question reçue/);
});
