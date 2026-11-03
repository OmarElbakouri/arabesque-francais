/**
 * Animates the professor's own mouth in the video frame: the jaw (lower lip, soul patch, goatee, chin) drops
 * along a lens-shaped opening, the lips narrow for rounded vowels, and the opening shows a soft dark mouth
 * with upper teeth. Everything outside the mouth keeps the video's own pixels, so lighting and beard match.
 *
 * Coordinates are the 720x1280 clip frames; landmarks were measured on the hero frame.
 */
export const LIP = { x: 362, y: 402 };  // centre of the lip line
const HALF_W = 50;                        // half the lip width
const JAW = 21;                           // jaw drop at full opening, px
/** Area the renderer reads and writes, relative to the lip centre (covers the sampling reach of the warp). */
export const REGION = { left: -93, top: -27, width: 186, height: 150 };

export interface MouthPose { opening: number; narrow: number; teeth: number }
export const REST: MouthPose = { opening: 0, narrow: 1, teeth: 0 };

/** Rhubarb's mouth shapes (A-H, X = rest) as poses. */
export const CUE_POSES: Record<string, MouthPose> = {
  A: REST,                                        // M, B, P: lips together
  B: { opening: 0.28, narrow: 1, teeth: 0.5 },    // most consonants
  C: { opening: 0.5, narrow: 1.04, teeth: 1 },    // é, è
  D: { opening: 1, narrow: 1, teeth: 1 },         // a
  E: { opening: 0.7, narrow: 0.84, teeth: 0 },    // o
  F: { opening: 0.4, narrow: 0.74, teeth: 0 },    // ou
  G: { opening: 0.16, narrow: 1, teeth: 1 },      // f, v
  H: { opening: 0.4, narrow: 1, teeth: 0.6 },     // l
  X: REST,
};

export const isRest = (p: MouthPose) => p.opening < 0.02 && Math.abs(p.narrow - 1) < 0.01;

/** Moves a pose toward a target with a short time constant, so shapes flow instead of jumping. */
export function easePose(current: MouthPose, target: MouthPose, dt: number, tau = 0.035): MouthPose {
  const k = 1 - Math.exp(-dt / tau);
  return {
    opening: current.opening + (target.opening - current.opening) * k,
    narrow: current.narrow + (target.narrow - current.narrow) * k,
    teeth: current.teeth + (target.teeth - current.teeth) * k,
  };
}

const smooth = (t: number) => { const c = t < 0 ? 0 : t > 1 ? 1 : t; return c * c * (3 - 2 * c); };

/** Inside the lips, pull everything toward the centre; beyond `outer` the face is untouched (monotonic). */
function lipMap(dx: number, narrow: number) {
  const inner = HALF_W * 0.85;
  const outer = HALF_W * 1.5;
  const s = 1 / narrow;
  const u = Math.abs(dx);
  const mapped = u < inner ? u * s : u < outer ? inner * s + (u - inner) * (outer - inner * s) / (outer - inner) : u;
  return Math.sign(dx) * mapped;
}

/**
 * Renders the posed mouth. `src` is the REGION read from the current video frame (RGBA, REGION size);
 * the result is written to `out` (same size), ready to draw over the frame at the same place.
 */
export function renderMouth(src: Uint8ClampedArray, out: Uint8ClampedArray, pose: MouthPose) {
  const { width: w, height: h } = REGION;
  const cx = -REGION.left;
  const lipY = -REGION.top;
  const half = HALF_W * 0.92 * pose.narrow;
  const sample = (x: number, y: number, c: number) => {
    const x0 = Math.max(0, Math.min(w - 2, Math.floor(x)));
    const y0 = Math.max(0, Math.min(h - 2, Math.floor(y)));
    const fx = Math.max(0, Math.min(1, x - x0));
    const fy = Math.max(0, Math.min(1, y - y0));
    const i = (y0 * w + x0) * 4 + c;
    const top = src[i] + (src[i + 4] - src[i]) * fx;
    const bottom = src[i + w * 4] + (src[i + w * 4 + 4] - src[i + w * 4]) * fx;
    return top + (bottom - top) * fy;
  };
  for (let y = 0; y < h; y++) {
    const below = y - lipY;
    const fy = below >= 0 ? 1 - smooth((below - 75) / 40) : 0;
    // Only the lips narrow (from the top of the upper lip down), never the moustache above them.
    const band = smooth((below + 12) / 12) * (1 - smooth((below - 18) / 10));
    for (let x = 0; x < w; x++) {
      const dx = x - cx;
      const lens = Math.sqrt(Math.max(0, 1 - (dx / half) ** 2));
      const side = 1 - smooth((Math.abs(dx) - half) / 30);
      const drop = pose.opening * JAW * Math.max(lens, 0.35 * side) * fy;
      const sx = cx + dx + (lipMap(dx, pose.narrow) - dx) * band;
      const sy = y - drop;
      const o = (y * w + x) * 4;
      let r = sample(sx, sy, 0);
      let g = sample(sx, sy, 1);
      let b = sample(sx, sy, 2);
      // The opening between the upper lip and the dropped lower lip: dark, deeper at the centre.
      const gap = pose.opening * JAW * lens;
      if (gap > 0.5 && below > -1 && below < gap + 1) {
        const inside = Math.max(0, Math.min(1.5, Math.min(below + 1, gap - below))) / 1.5;
        const t = Math.max(0, Math.min(1, below / gap));
        const shade = 0.55 + 0.45 * lens;
        let mr = (60 + 55 * t) * shade;
        let mg = (22 + 14 * t) * shade;
        let mb = (30 + 30 * t) * shade;
        // Upper teeth: a soft band just under the upper lip, narrower than the opening.
        const toothH = Math.min(gap * 0.38, 5.5);
        const tooth = pose.teeth * Math.max(0, Math.min(1, (toothH - below) / 1.5))
          * Math.max(0, Math.min(1, (half * 0.62 - Math.abs(dx)) / 4));
        mr = mr * (1 - tooth) + (204 - 28 * t) * tooth;
        mg = mg * (1 - tooth) + (196 - 30 * t) * tooth;
        mb = mb * (1 - tooth) + (188 - 30 * t) * tooth;
        r = r * (1 - inside) + mr * inside;
        g = g * (1 - inside) + mg * inside;
        b = b * (1 - inside) + mb * inside;
      }
      out[o] = r;
      out[o + 1] = g;
      out[o + 2] = b;
      out[o + 3] = 255;
    }
  }
}
