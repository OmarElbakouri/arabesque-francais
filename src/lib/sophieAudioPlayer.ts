import type { MouthCue } from './sophieLipSync';

type PlaybackStatus = 'playing' | 'blocked' | 'finished';
/** Reported only while a clip is audibly playing; null as soon as sound stops. Cues time the mouth shapes. */
export type SophieSpeech = { audio: HTMLAudioElement; clip: string; cues?: readonly MouthCue[] } | null;

/** Keeps the same media element and preserves unplayed clips when playback fails. */
export class SophieAudioPlayer {
  private audio: HTMLAudioElement | null = null;
  private queue: string[] = [];
  private cues: (readonly MouthCue[] | undefined)[] = [];
  private attempt = 0;

  constructor(
    private readonly onStatus: (status: PlaybackStatus) => void,
    private readonly onSpeech: (speech: SophieSpeech) => void = () => {},
  ) {}

  private getAudio() {
    this.audio ??= new Audio();
    return this.audio;
  }

  prime() {
    this.stop();
    const audio = this.getAudio();
    // A short, valid silent WAV, played on the user's initial tap.
    const wav = new Uint8Array(204);
    const view = new DataView(wav.buffer);
    const text = (offset: number, value: string) => {
      [...value].forEach((char, i) => { wav[offset + i] = char.charCodeAt(0); });
    };
    text(0, 'RIFF'); view.setUint32(4, 196, true); text(8, 'WAVE');
    text(12, 'fmt '); view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); view.setUint16(22, 1, true);
    view.setUint32(24, 8000, true); view.setUint32(28, 16000, true);
    view.setUint16(32, 2, true); view.setUint16(34, 16, true);
    text(36, 'data'); view.setUint32(40, 160, true);
    audio.src = `data:audio/wav;base64,${btoa(String.fromCharCode(...wav))}`;
    // Failure here is harmless: actual replies offer manual playback if needed.
    try { void audio.play().catch(() => {}); } catch { /* Retry with the reply. */ }
  }

  /** Plays clips in order; cues[i], when given, are the mouth shapes for clips[i]. */
  play(clips: string[], cues: (readonly MouthCue[] | undefined)[] = []) {
    this.stop();
    const kept = clips.map((clip, i) => [clip, cues[i]] as const).filter(([clip]) => Boolean(clip));
    this.queue = kept.map(([clip]) => clip);
    this.cues = kept.map(([, cue]) => cue);
    this.playCurrent();
  }

  /** Call directly from the recovery button to preserve browser user activation. */
  retry() {
    if (this.queue.length) this.playCurrent();
  }

  private playCurrent() {
    if (!this.queue.length) {
      this.onStatus('finished');
      return;
    }
    const audio = this.getAudio();
    const attempt = ++this.attempt;
    const active = () => attempt === this.attempt;
    const clip = this.queue[0];
    const cues = this.cues[0];
    const silent = () => {
      if (active()) this.onSpeech(null);
    };
    const blocked = () => {
      if (!active()) return;
      this.onSpeech(null);
      this.onStatus('blocked');
    };
    audio.onpause = silent;
    audio.onwaiting = silent;
    audio.onended = () => {
      if (!active()) return;
      this.onSpeech(null);
      this.queue.shift();
      this.cues.shift();
      this.playCurrent();
    };
    audio.onerror = blocked;
    audio.onplaying = () => {
      if (!active()) return;
      this.onStatus('playing');
      this.onSpeech({ audio, clip, cues });
    };
    audio.src = `data:audio/mpeg;base64,${clip}`;
    this.onStatus('playing');
    try {
      void audio.play().catch(blocked);
    } catch {
      blocked();
    }
  }

  stop() {
    ++this.attempt;
    this.queue = [];
    this.cues = [];
    if (this.audio) {
      this.audio.onended = null;
      this.audio.onerror = null;
      this.audio.onplaying = null;
      this.audio.onpause = null;
      this.audio.onwaiting = null;
      this.audio.pause();
      this.audio.removeAttribute('src');
      this.audio.load();
    }
    this.onSpeech(null);
  }
}
