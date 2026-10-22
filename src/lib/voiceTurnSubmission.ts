export interface VoiceTurnRecording {
  sessionId: number;
  questionId: number;
  audioBlob: Blob;
  audioFormat: string;
}

/** Retain a recording until the server confirms a coherent turn, including after a lost response. */
export class VoiceTurnSubmission<T> {
  pending: VoiceTurnRecording | null = null;
  private inFlight: Promise<T> | null = null;
  private version = 0;

  constructor(private readonly submit: (sessionId: number, questionId: number, audio: Blob, format: string) => Promise<T>) {}

  run(recording: VoiceTurnRecording): Promise<T> {
    if (this.inFlight) return this.inFlight;
    this.pending = recording;
    const version = this.version;
    const request = this.submit(recording.sessionId, recording.questionId, recording.audioBlob, recording.audioFormat);
    const result = request.then(value => {
      if (this.version === version) this.pending = null;
      return value;
    }).finally(() => {
      if (this.inFlight === result) this.inFlight = null;
    });
    this.inFlight = result;
    return result;
  }

  clear() {
    this.version++;
    this.pending = null;
    this.inFlight = null;
  }
}
