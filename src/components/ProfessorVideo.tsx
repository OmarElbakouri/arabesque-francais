import { useEffect, useRef, useState } from 'react';
import track from '@/assets/professor-video/track';
import poster from '@/assets/professor-video/poster.jpg';
import type { SophieSpeech } from '@/lib/sophieAudioPlayer';
import { clipEnvelope, cueAt, ENVELOPE_FPS, nextMouth, type MouthLevel } from '@/lib/sophieLipSync';
import { isUrgent, MOUTH_CLIPS, nextClip, type Clip, type Director, type TutorMode } from '@/lib/professorClips';
import { CUE_POSES, easePose, isRest, LIP, REGION, renderMouth, REST, type MouthPose } from '@/lib/mouthWarp';
import { TUTOR_NAME } from '@/lib/sophieStage';

export type { TutorMode } from '@/lib/professorClips';

const byName = (files: Record<string, string>, prefix = '') => Object.fromEntries(Object.entries(files)
  .map(([path, url]) => [path.split('/').pop()!.replace(/\.\w+$/, '').replace(prefix, ''), url]));
const CLIPS = byName(import.meta.glob<string>('@/assets/professor-video/*.mp4', { eager: true, import: 'default' }));
const CLIP_NAMES = Object.keys(track.clips) as Clip[];
const OPEN_CUES = ['D', 'C', 'E'];  // variety when only loudness is known
const DISSOLVE_MS = 280;

function useReducedMotion() {
  const query = '(prefers-reduced-motion: reduce)';
  const [reduced, setReduced] = useState(() => window.matchMedia?.(query).matches ?? false);
  useEffect(() => {
    const media = window.matchMedia?.(query);
    if (!media) return;
    const update = () => setReduced(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  return reduced;
}

/**
 * The professor as looping video clips (body, gestures, blinks). While he speaks, his own mouth in the frame
 * is animated (jaw, lips, opening) from the voice's timed mouth shapes; see mouthWarp.ts.
 * Clips share their first and last frame, so they chain without cuts; urgent changes dissolve quickly.
 * `focus="face"` anchors the top of the frame (head and shoulders) for small boxes.
 */
export function ProfessorVideo({ mode, speech, greet = false, focus = 'body' }: {
  mode: TutorMode; speech: SophieSpeech; greet?: boolean; focus?: 'body' | 'face';
}) {
  const reduced = useReducedMotion();
  const box = useRef<HTMLDivElement>(null);
  const videos = useRef<Partial<Record<Clip, HTMLVideoElement | null>>>({});
  const mouthCanvas = useRef<HTMLCanvasElement | null>(null);
  const live = useRef({ mode, speech, reduced });
  live.current = { mode, speech, reduced };
  const [fit, setFit] = useState({ scale: 0, x: 0, y: 0 });
  const anchorY = focus === 'face' ? 0 : 0.5;

  // The overlay lives in video pixels; map it like object-fit: cover with the same anchor.
  useEffect(() => {
    const element = box.current;
    if (!element) return;
    const measure = () => {
      const { width, height } = element.getBoundingClientRect();
      const s = Math.max(width / track.width, height / track.height);
      setFit({ scale: s, x: (width - track.width * s) / 2, y: (height - track.height * s) * anchorY });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [anchorY]);

  useEffect(() => {
    if (reduced) return;
    let director: Director = { greetPending: greet, modeClipDone: false, cycle: 0 };
    let active: Clip = 'idle';
    let lastMode = live.current.mode;
    let wasSpeaking = false;
    let raf = 0;
    let mouthLevel: MouthLevel = 'closed';
    let openCue = 0;
    let pose: MouthPose = REST;
    let last = performance.now();
    // Reads the mouth area of the current video frame; the visible canvas receives the animated mouth.
    const reader = document.createElement('canvas');
    reader.width = REGION.width;
    reader.height = REGION.height;
    const readContext = reader.getContext('2d', { willReadFrequently: true });
    // The canvas mounts once the layout is measured, so its context is picked up on first use.
    let drawContext: CanvasRenderingContext2D | null = null;
    let output: ImageData | null = null;
    let envelope: Float32Array | null = null;
    let envelopeClip = '';
    let stopped = false;

    const show = (clip: Clip, dissolve: boolean) => {
      const next = videos.current[clip];
      const previousClip = active;
      const previous = videos.current[previousClip];
      if (!next) return;
      next.currentTime = 0;
      next.style.transition = dissolve ? `opacity ${DISSOLVE_MS}ms ease` : 'none';
      next.style.zIndex = '2';
      if (previous && previous !== next) previous.style.zIndex = '1';
      const reveal = () => {
        if (stopped) return;
        next.style.opacity = '1';
        // Hide the previous clip once the new one covers it (unless it has been chosen again meanwhile).
        if (previous && previous !== next) {
          window.setTimeout(() => {
            if (active !== previousClip) { previous.style.opacity = '0'; previous.pause(); }
          }, dissolve ? DISSOLVE_MS : 0);
        }
      };
      void next.play().then(reveal, () => reveal());
      active = clip;
    };

    const advance = (dissolve: boolean) => {
      const { speech: s, mode: m } = live.current;
      const choice = nextClip(director, Boolean(s), m);
      director = choice.state;
      show(choice.clip, dissolve);
    };

    const onEnded = (event: Event) => {
      if (event.target === videos.current[active]) advance(false);
    };
    const elements = videos.current;
    for (const clip of CLIP_NAMES) elements[clip]?.addEventListener('ended', onEnded);
    advance(false);

    const tick = () => {
      const { speech: s, mode: m } = live.current;
      const speaking = Boolean(s);
      const modeChanged = m !== lastMode;
      if (modeChanged) director = { ...director, modeClipDone: false, cycle: 0 };
      if (isUrgent(active, speaking, wasSpeaking, modeChanged)) advance(true);
      lastMode = m;
      wasSpeaking = speaking;

      // Mouth: only while audio is audible, only on clips where the mouth is in view.
      const now = performance.now();
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const video = videos.current[active];
      const clipTrack = track.clips[active];
      const frame = video ? Math.min(clipTrack.frames - 1, Math.floor(video.currentTime * clipTrack.fps)) : 0;
      const offset = clipTrack.offsets[frame] as readonly number[] | null;
      let cue = 'X';
      if (s?.cues?.length && MOUTH_CLIPS.has(active) && offset) {
        cue = cueAt(s.cues, s.audio.currentTime) ?? 'X';  // timed shapes from the audio itself
      } else if (s && MOUTH_CLIPS.has(active) && offset) {
        if (envelopeClip !== s.clip) {
          envelopeClip = s.clip;
          envelope = null;
          clipEnvelope(s.clip).then(e => { if (envelopeClip === s.clip) envelope = e; });
        }
        const at = s.audio.currentTime;
        const level = envelope ? envelope[Math.min(envelope.length - 1, Math.floor(at * ENVELOPE_FPS))] ?? 0
          : Math.floor(at * 6) % 2 ? 0.35 : 0;
        const next = nextMouth(level, mouthLevel);
        if (next === 'open' && mouthLevel !== 'open') openCue = (openCue + 1) % OPEN_CUES.length;
        mouthLevel = next;
        cue = next === 'open' ? OPEN_CUES[openCue] : next === 'half' ? 'B' : 'X';
      } else mouthLevel = 'closed';
      pose = easePose(pose, s ? CUE_POSES[cue] ?? REST : REST, dt);
      const canvas = mouthCanvas.current;
      if (canvas && !drawContext) {
        drawContext = canvas.getContext('2d');
        output = drawContext?.createImageData(REGION.width, REGION.height) ?? null;
      }
      if (canvas && drawContext && readContext && output && video && offset && !isRest(pose)) {
        const left = LIP.x + offset[0] + REGION.left;
        const top = LIP.y + offset[1] + REGION.top;
        readContext.drawImage(video, left, top, REGION.width, REGION.height, 0, 0, REGION.width, REGION.height);
        renderMouth(readContext.getImageData(0, 0, REGION.width, REGION.height).data, output.data, pose);
        drawContext.putImageData(output, 0, 0);
        canvas.style.transform = `translate(${left}px, ${top}px)`;
        canvas.style.opacity = '1';
      } else if (canvas) canvas.style.opacity = '0';
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      for (const clip of CLIP_NAMES) {
        const v = elements[clip];
        v?.removeEventListener('ended', onEnded);
        v?.pause();
      }
    };
  }, [greet, reduced]);

  const objectPosition = focus === 'face' ? '50% 0%' : '50% 50%';
  return (
    <div ref={box} role="img" aria-label={`Avatar IA du ${TUTOR_NAME}`} className="relative h-full w-full overflow-hidden bg-[#e9d2bd]">
      <img src={poster} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition }} />
      {!reduced && CLIP_NAMES.map(clip => (
        <video key={clip} ref={el => { videos.current[clip] = el; }} src={CLIPS[clip]} muted playsInline preload="auto"
          aria-hidden className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition, opacity: 0 }} />
      ))}
      {fit.scale > 0 && (
        <div aria-hidden className="pointer-events-none absolute left-0 top-0 z-10"
          style={{ width: track.width, height: track.height, transformOrigin: '0 0',
            transform: `translate(${fit.x}px, ${fit.y}px) scale(${fit.scale})` }}>
          <canvas ref={mouthCanvas} width={REGION.width} height={REGION.height}
            className="absolute left-0 top-0" style={{ opacity: 0 }} />
        </div>
      )}
    </div>
  );
}
