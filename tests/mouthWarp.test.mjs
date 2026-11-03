import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import ts from 'typescript';

const source = await readFile(new URL('../src/lib/mouthWarp.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
});
const { renderMouth, REGION, REST, CUE_POSES, easePose, isRest } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

// A skin-coloured region with a horizontal stripe pattern so movement is measurable.
const { width: w, height: h } = REGION;
const src = new Uint8ClampedArray(w * h * 4);
for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
  const i = (y * w + x) * 4;
  src.set([200, 150 - (y % 10) * 4, 120, 255], i);
}
const px = (data, x, y) => Array.from(data.slice((y * w + x) * 4, (y * w + x) * 4 + 3));
const cx = -REGION.left;
const lipY = -REGION.top;

test('the rest pose leaves the frame untouched', () => {
  const out = new Uint8ClampedArray(src.length);
  renderMouth(src, out, REST);
  for (let i = 0; i < src.length; i++) assert.ok(Math.abs(out[i] - src[i]) <= 1, `pixel ${i}`);
});

test('an open "a" shows a dark opening under the upper teeth and drops the jaw', () => {
  const out = new Uint8ClampedArray(src.length);
  renderMouth(src, out, CUE_POSES.D);
  const opening = px(out, cx, lipY + 12);
  assert.ok(opening[0] < 140 && opening[1] < 80, `dark mouth at the centre: ${opening}`);
  const tooth = px(out, cx, lipY + 1);
  assert.ok(tooth[0] > 150 && tooth[2] > 150, `upper teeth just under the lip: ${tooth}`);
  // Below the opening, the chin's pattern has moved down (sampled from higher up).
  assert.notDeepEqual(px(out, cx, lipY + 40), px(src, cx, lipY + 40));
  // Far from the mouth, nothing moves.
  assert.deepEqual(px(out, 2, 2), px(src, 2, 2));
  assert.deepEqual(px(out, cx, h - 1), px(src, cx, h - 1));
});

test('the corners of the mouth stay closed', () => {
  const out = new Uint8ClampedArray(src.length);
  renderMouth(src, out, CUE_POSES.D);
  const corner = px(out, cx + 46, lipY + 2);
  assert.ok(corner[0] > 150, `corner stays skin: ${corner}`);
});

test('poses ease into each other instead of jumping', () => {
  let pose = REST;
  pose = easePose(pose, CUE_POSES.D, 0.016);
  assert.ok(pose.opening > 0.2 && pose.opening < 0.6, `partway open after one frame: ${pose.opening}`);
  for (let i = 0; i < 20; i++) pose = easePose(pose, CUE_POSES.D, 0.016);
  assert.ok(pose.opening > 0.99);
  for (let i = 0; i < 30; i++) pose = easePose(pose, REST, 0.016);
  assert.ok(isRest(pose));
});
