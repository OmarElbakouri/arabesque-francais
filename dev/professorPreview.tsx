// Development-only: the video avatar in a box of the given size. "speaking" fakes an audible clip (no sound)
// so the animated mouth shows (fixed open/close rhythm); "cue=D" holds one Rhubarb mouth shape instead.
import { createRoot } from 'react-dom/client';
import '@/index.css';
import { ProfessorVideo, type TutorMode } from '@/components/ProfessorVideo';

const q = new URLSearchParams(location.search);
const started = performance.now();
const fakeAudio = { get currentTime() { return (performance.now() - started) / 1000; } } as HTMLAudioElement;

createRoot(document.getElementById('root')!).render(
  <div style={{ width: Number(q.get('w') ?? 390), height: Number(q.get('h') ?? 844), position: 'relative' }}>
    <ProfessorVideo mode={(q.get('mode') ?? 'idle') as TutorMode} greet={q.has('greet')}
      focus={(q.get('focus') ?? 'body') as 'body' | 'face'}
      speech={q.has('speaking') || q.has('cue') ? {
        audio: fakeAudio, clip: 'preview',
        // ?cue=D holds one Rhubarb mouth shape, to inspect it on the real video.
        cues: q.has('cue') ? [{ start: 0, end: 1e6, value: q.get('cue')! }] : undefined,
      } : null} />
  </div>,
);
