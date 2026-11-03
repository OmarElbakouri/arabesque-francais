/**
 * Which video clip the professor plays next. Every clip starts and ends on the same hero frame, so a clip that
 * finishes can hand over to any other without a visible cut.
 */
export type TutorMode = 'idle' | 'listening' | 'thinking' | 'encouraging';
export type Clip = 'idle' | 'explain1' | 'explain2' | 'explain3' | 'listen' | 'think' | 'encourage' | 'wave';

/** While he speaks: gestures with calm moments between them, never the same gesture twice in a row. */
export const SPEAKING_CYCLE: Clip[] = ['explain1', 'idle', 'explain2', 'idle', 'explain3', 'idle'];
/** Clips whose mouth area stays visible and steady enough for the drawn, voice-synced mouth. */
export const MOUTH_CLIPS = new Set<Clip>(['idle', 'explain1', 'explain2', 'explain3', 'listen', 'wave', 'encourage']);

export interface Director {
  greetPending: boolean;  // wave once when the conversation opens
  modeClipDone: boolean;  // the current mode's one-off clip (think, encourage) has played
  cycle: number;          // position in the speaking / listening rotation
}

export function nextClip(state: Director, speaking: boolean, mode: TutorMode): { clip: Clip; state: Director } {
  if (state.greetPending) return { clip: 'wave', state: { ...state, greetPending: false } };
  // Praise arrives together with the spoken feedback: the thumbs-up comes first (its mouth stays in view).
  if (mode === 'encouraging' && !state.modeClipDone) return { clip: 'encourage', state: { ...state, modeClipDone: true } };
  if (speaking) {
    return { clip: SPEAKING_CYCLE[state.cycle % SPEAKING_CYCLE.length], state: { ...state, cycle: state.cycle + 1 } };
  }
  if (mode === 'thinking' && !state.modeClipDone) return { clip: 'think', state: { ...state, modeClipDone: true } };
  if (mode === 'listening') {
    // A nod every third clip reads as attention; constant nodding would not.
    return { clip: state.cycle % 3 === 0 ? 'listen' : 'idle', state: { ...state, cycle: state.cycle + 1 } };
  }
  return { clip: 'idle', state };
}

/** Changes worth a quick dissolve instead of waiting for the current clip to finish. */
export function isUrgent(current: Clip, speaking: boolean, wasSpeaking: boolean, modeChanged: boolean): boolean {
  if (speaking && !wasSpeaking) return !SPEAKING_CYCLE.includes(current) && current !== 'encourage';
  return modeChanged && current === 'idle';
}
