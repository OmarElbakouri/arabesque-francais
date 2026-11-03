/**
 * Mouth movement for the tutor's avatar. The TTS server sends Rhubarb cues (timed mouth shapes) when it can;
 * otherwise the clip's loudness opens and closes the mouth, which cannot tell an A from an O.
 */
export type MouthLevel = 'closed' | 'half' | 'open';
/** A timed mouth shape from Rhubarb Lip Sync (A-H, X = rest), in seconds from the start of the clip. */
export interface MouthCue { start: number; end: number; value: string }

/** The cue active at a time, or null between cues (binary search; cues are sorted and contiguous). */
export function cueAt(cues: readonly MouthCue[], time: number): string | null {
  let lo = 0;
  let hi = cues.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (time < cues[mid].start) hi = mid - 1;
    else if (time >= cues[mid].end) lo = mid + 1;
    else return cues[mid].value;
  }
  return null;
}

export const ENVELOPE_FPS = 30;

/** Loudness per animation frame, normalised to 0..1, with a fast attack and a slower release. */
export function buildEnvelope(samples: Float32Array, sampleRate: number, fps = ENVELOPE_FPS): Float32Array {
  const window = Math.max(1, Math.round(sampleRate / fps));
  const frames = Math.ceil(samples.length / window);
  const rms = new Float32Array(frames);
  for (let f = 0; f < frames; f++) {
    let sum = 0;
    const end = Math.min(samples.length, (f + 1) * window);
    for (let i = f * window; i < end; i++) sum += samples[i] * samples[i];
    rms[f] = Math.sqrt(sum / Math.max(1, end - f * window));
  }
  // Normalise against loud speech (95th percentile) rather than the single loudest peak.
  const sorted = Array.from(rms).filter(v => v > 0.002).sort((a, b) => a - b);
  const reference = sorted.length ? sorted[Math.floor(sorted.length * 0.95)] : 1;
  let previous = 0;
  return rms.map(v => {
    const level = Math.min(1, v / reference);
    previous = level > previous ? level : previous * 0.6 + level * 0.4;
    return previous;
  });
}

/** Thresholds with hysteresis so the mouth does not flutter around a boundary. */
export function nextMouth(level: number, current: MouthLevel): MouthLevel {
  const openAt = current === 'open' ? 0.5 : 0.6;
  const halfAt = current === 'closed' ? 0.22 : 0.15;
  if (level >= openAt) return 'open';
  if (level >= halfAt) return 'half';
  return 'closed';
}

const cache = new Map<string, Promise<Float32Array | null>>();
let context: BaseAudioContext | null = null;

/** Decodes a base64 clip once and returns its envelope, or null where decoding is unavailable. */
export function clipEnvelope(clip: string): Promise<Float32Array | null> {
  let envelope = cache.get(clip);
  if (!envelope) {
    envelope = (async () => {
      try {
        context ??= new OfflineAudioContext(1, 1, 44100);
        const bytes = Uint8Array.from(atob(clip), c => c.charCodeAt(0));
        const buffer = await context.decodeAudioData(bytes.buffer);
        return buildEnvelope(buffer.getChannelData(0), buffer.sampleRate);
      } catch {
        return null;
      }
    })();
    cache.set(clip, envelope);
    // A turn plays at most two clips; keep a few for replays.
    if (cache.size > 4) cache.delete(cache.keys().next().value!);
  }
  return envelope;
}
