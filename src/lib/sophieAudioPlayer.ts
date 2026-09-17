type PlaybackStatus = 'playing' | 'blocked' | 'finished';

/** Keeps the same media element and preserves unplayed clips when playback fails. */
export class SophieAudioPlayer {
  private audio: HTMLAudioElement | null = null;
  private queue: string[] = [];
  private attempt = 0;

  constructor(private readonly onStatus: (status: PlaybackStatus) => void) {}

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

  play(clips: string[]) {
    this.stop();
    this.queue = clips.filter(Boolean);
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
    const blocked = () => {
      if (active()) this.onStatus('blocked');
    };
    audio.onended = () => {
      if (!active()) return;
      this.queue.shift();
      this.playCurrent();
    };
    audio.onerror = blocked;
    audio.onplaying = () => {
      if (active()) this.onStatus('playing');
    };
    audio.src = `data:audio/mpeg;base64,${this.queue[0]}`;
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
    if (this.audio) {
      this.audio.onended = null;
      this.audio.onerror = null;
      this.audio.onplaying = null;
      this.audio.pause();
      this.audio.removeAttribute('src');
      this.audio.load();
    }
  }
}
