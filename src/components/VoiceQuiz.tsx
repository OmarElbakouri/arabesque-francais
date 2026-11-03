import { clearPendingAi } from '@/lib/aiRequest';
import { AllowanceStatus } from '@/components/AllowanceStatus';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Mic,
  MicOff,
  Square,
  X,
  LogOut,
  Loader2,
  Sparkles,
  Trophy,
  RotateCcw,
  Clock,
  Target,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Play,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { SophieAudioPlayer, type SophieSpeech } from '@/lib/sophieAudioPlayer';
import type { MouthCue } from '@/lib/sophieLipSync';
import { ProfessorVideo, type TutorMode } from '@/components/ProfessorVideo';
import professorPoster from '@/assets/professor-video/poster.jpg';
import { AVATAR_CAPTION, AVATAR_ENABLED, TUTOR_NAME } from '@/lib/sophieStage';
import { VoiceTurnSubmission } from '@/lib/voiceTurnSubmission';
import {
  VoiceQuizQuestion,
  VoiceQuizSessionResponse,
  SubmitAnswerResponse,
  SessionSummary,
  startVoiceQuizSession,
  getCurrentVoiceSession,
  submitVoiceAnswer,
  getSessionSummary,
  formatTime,
  checkVoiceQuizAccess,
  VoiceQuizAccessInfo
} from '@/services/voiceQuizService';

interface VoiceQuizProps {
  chapterId?: number;
  chapterTitle?: string;
  thematicGroup?: number;
}

// The professor's video clips include the classroom, so the avatar always brings its own scene.
const CLASSROOM = AVATAR_ENABLED;
// Over the classroom picture, text sits on frosted pills to stay readable.
const PILL = CLASSROOM ? 'rounded-2xl bg-background/85 px-5 py-3 shadow-sm backdrop-blur-sm' : '';

type ConversationState = 'start' | 'ai_speaking' | 'audio_blocked' | 'user_turn' | 'recording' | 'processing' | 'retry_analysis' | 'finished' | 'summary';

// --- Voice Orb Component ---
const VoiceOrb = ({ mode }: { mode: 'speaking' | 'listening' | 'processing' | 'idle' }) => {
  return (
    <div className="relative flex items-center justify-center w-64 h-64">
      {/* Core Orb */}
      <motion.div
        className={`w-32 h-32 rounded-full bg-gradient-to-br from-primary to-purple-600 shadow-lg z-10 flex items-center justify-center`}
        animate={
          mode === 'speaking' ? { scale: [1, 1.1, 1] } :
            mode === 'processing' ? { rotate: 360 } :
              mode === 'listening' ? { scale: 1 } :
                { scale: 1 }
        }
        transition={
          mode === 'speaking' ? { repeat: Infinity, duration: 1.5, ease: "easeInOut" } :
            mode === 'processing' ? { repeat: Infinity, duration: 2, ease: "linear" } :
              { duration: 0.5 }
        }
      >
        {mode === 'processing' && (
          <div className="w-24 h-24 rounded-full border-4 border-white/30 border-t-white animate-spin" />
        )}
        {mode === 'listening' && (
          <Mic className="w-12 h-12 text-white" />
        )}
        {mode === 'speaking' && (
          <Volume2 className="w-12 h-12 text-white" />
        )}
        {mode === 'idle' && (
          <Sparkles className="w-12 h-12 text-white" />
        )}
      </motion.div>

      {/* Ripples (AI Speaking) */}
      {mode === 'speaking' && (
        <>
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full border-2 border-primary/30"
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: 1.5 + i * 0.2, opacity: 0 }}
              transition={{ repeat: Infinity, duration: 2, delay: i * 0.4, ease: "easeOut" }}
            />
          ))}
        </>
      )}

      {/* Waveform Simulation (User Recording) */}
      {mode === 'listening' && (
        <div className="absolute inset-0 flex items-center justify-center gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <motion.div
              key={i}
              className="w-2 bg-primary/50 rounded-full"
              animate={{ height: [20, 40 + Math.random() * 40, 20] }}
              transition={{ repeat: Infinity, duration: 0.5 + Math.random() * 0.5, repeatType: "reverse" }}
              style={{ height: 30 }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function VoiceQuiz({ chapterId, chapterTitle, thematicGroup: propThematicGroup }: VoiceQuizProps) {
  // State
  const [state, setState] = useState<ConversationState>('start');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Plan access info
  const [accessInfo, setAccessInfo] = useState<VoiceQuizAccessInfo | null>(null);
  const [loadingAccess, setLoadingAccess] = useState(true);

  // Data
  const [session, setSession] = useState<VoiceQuizSessionResponse | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [recoverable, setRecoverable] = useState<VoiceQuizSessionResponse | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<VoiceQuizQuestion | null>(null);
  const [displayedText, setDisplayedText] = useState<string>(''); // Text being spoken by AI
  const [summary, setSummary] = useState<SessionSummary | null>(null);

  // Filters
  const [selectedThematicGroup, setSelectedThematicGroup] = useState<string>(propThematicGroup?.toString() || '');
  const [chapterNumber, setChapterNumber] = useState<string>(chapterId?.toString() || '');

  const submission = useRef(new VoiceTurnSubmission<SubmitAnswerResponse>(submitVoiceAnswer));
  const completed = useRef(false);

  // Audio
  const [speech, setSpeech] = useState<SophieSpeech>(null);
  const [cheer, setCheer] = useState(false);
  const playerRef = useRef<SophieAudioPlayer | null>(null);
  if (!playerRef.current) {
    playerRef.current = new SophieAudioPlayer((status) => {
      setState(status === 'finished' ? (completed.current ? 'finished' : 'user_turn') : status === 'blocked' ? 'audio_blocked' : 'ai_speaking');
    }, setSpeech);
  }

  useEffect(() => {
    if (!cheer) return;
    const timer = window.setTimeout(() => setCheer(false), 1800);
    return () => window.clearTimeout(timer);
  }, [cheer]);

  // Recording
  const {
    isRecording,
    audioBlob,
    startRecording,
    stopRecording,
    resetRecording,
    isSupported,
    permissionStatus,
    error: recorderError
  } = useAudioRecorder(60); // Longer limit for conversation

  // Check access on mount
  useEffect(() => {
    const checkAccess = async () => {
      setLoadingAccess(true);
      try {
        const info = await checkVoiceQuizAccess();
        setAccessInfo(info);
        const current = await getCurrentVoiceSession();
        setRecoverable(current);
        if (current) clearPendingAi('sophie');
      } catch (e) {
        console.error('Error checking voice quiz access:', e);
      } finally {
        setLoadingAccess(false);
      }
    };
    checkAccess();
  }, []);

  useEffect(() => {
    if (!session?.expiresAt) { setSecondsLeft(null); return; }
    const deadline = Date.now() + (session.remainingSeconds ?? 0) * 1000;
    const tick = () => setSecondsLeft(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
    tick(); const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [session]);

  useEffect(() => {
    if (secondsLeft !== 0 || !session || ['processing', 'ai_speaking', 'summary', 'finished'].includes(state)) return;
    playerRef.current?.stop();
    if (isRecording) stopRecording();
    completed.current = true;
    setError('Les 15 minutes sont écoulées. Vous pouvez consulter le bilan puis démarrer une nouvelle session.');
    setState('finished');
  }, [secondsLeft, session, state, isRecording, stopRecording]);

  // Monitor recorder error
  useEffect(() => {
    if (recorderError) {
      console.error("Recorder error:", recorderError);
      setError(recorderError);
      setState('user_turn');
    }
  }, [recorderError]);

  // Monitor processing hang (no audio blob) - increased timeout
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    console.log('[VoiceQuiz] Processing monitor - state:', state, 'audioBlob:', audioBlob ? `${audioBlob.size} bytes` : 'null');
    if (state === 'processing' && !audioBlob) {
      // If we are processing but no blob appears within 10 seconds, assume failure
      timeout = setTimeout(() => {
        console.error("[VoiceQuiz] Processing timeout - no audio blob after 10 seconds");
        setError("Erreur d'enregistrement (audio vide). Veuillez réessayer.");
        setState('user_turn');
      }, 10000);
    }
    return () => clearTimeout(timeout);
  }, [state, audioBlob]);

  // Watch for audioBlob changes
  useEffect(() => {
    if (audioBlob) {
      console.log('[VoiceQuiz] audioBlob received:', audioBlob.size, 'bytes, type:', audioBlob.type);
    }
  }, [audioBlob]);

  // --- Audio Playback Logic ---
  const playAudioSequence = useCallback((base64List: string[], cues: (MouthCue[] | null | undefined)[] = []) => {
    playerRef.current?.play(base64List, cues.map(c => c ?? undefined));
  }, []);

  useEffect(() => {
    return () => playerRef.current?.stop();
  }, []);

  // --- Actions ---

  const handleStart = async () => {
    // Prime the same player that will speak every reply, during this tap.
    playerRef.current?.prime();

    submission.current.clear();
    completed.current = false;
    setIsLoading(true);
    setError(null);
    try {
      const thematicGroupValue = propThematicGroup || (selectedThematicGroup ? parseInt(selectedThematicGroup) : 1);
      const request: { thematicGroup: number; chapterNumber?: number } = {
        thematicGroup: thematicGroupValue
      };
      if (chapterNumber) request.chapterNumber = parseInt(chapterNumber);

      const current = recoverable ? await getCurrentVoiceSession() : null;
      const response = current || await startVoiceQuizSession(request);
      setRecoverable(null);
      setSession(response);
      setCurrentQuestion(response.question);
      setState('ai_speaking');

      setDisplayedText(response.question.question || response.question.sentenceWithBlank || '');

      if (response.question.audioBase64) {
        playAudioSequence([response.question.audioBase64!], [response.question.audioMouthCues]);
      } else {
        setState('user_turn');
      }

    } catch (err) {
      setError((err as any)?.response?.data?.message || (err as Error)?.message || "Impossible de démarrer la conversation.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicClick = async () => {
    console.log('[VoiceQuiz] handleMicClick called, current state:', state);
    if (state === 'user_turn') {
      setError(null);
      console.log('[VoiceQuiz] Starting recording...');
      await startRecording();
      setState('recording');
    } else if (state === 'recording') {
      console.log('[VoiceQuiz] Stopping recording...');
      stopRecording();
      setState('processing');
    }
  };

  const handleExit = () => {
    submission.current.clear();
    completed.current = false;
    playerRef.current?.stop();
    resetRecording();
    setState('start');
    setSession(null);
    setCurrentQuestion(null);
    setSummary(null);
    Promise.all([checkVoiceQuizAccess(), getCurrentVoiceSession()]).then(([access, current]) => {
      setAccessInfo(access); setRecoverable(current);
      if (current) clearPendingAi('sophie');
    }).catch(() => setError('Impossible de vérifier la reprise. Réessayez.'));
  };

  // Terminate conversation and show summary
  const handleEndConversation = async () => {
    submission.current.clear();
    playerRef.current?.stop();
    resetRecording();

    if (session) {
      try {
        const summaryData = await getSessionSummary(session.sessionId);
        setSummary(summaryData);
        setState('summary');
        if (summaryData.scorePercentage >= 80) {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }
      } catch (err) {
        console.error("Failed to get summary", err);
        // Fallback to start screen
        handleExit();
      }
    } else {
      handleExit();
    }
  };

  // Submit once per recording. A failed/lost response retains the recording for an analysis retry.
  useEffect(() => {
    let cancelled = false;
    if (state !== 'processing' || !session || !currentQuestion) return;
    const pending = submission.current.pending;
    if (!pending && !audioBlob) return;
    const recording = pending || {
      sessionId: session.sessionId,
      questionId: currentQuestion.id,
      audioBlob: audioBlob!,
      audioFormat: audioBlob!.type.includes('mp4') ? 'm4a'
        : audioBlob!.type.includes('ogg') ? 'ogg'
          : audioBlob!.type.includes('wav') ? 'wav' : 'webm',
    };

    submission.current.run(recording).then(response => {
      if (cancelled) return;
      setError(null);
      completed.current = response.isLastQuestion;
      setCheer(response.isCorrect && response.evaluationStatus !== 'NOT_EVALUATED');
      resetRecording();
      const audio: string[] = [];
      const cues: (MouthCue[] | null | undefined)[] = [];
      if (response.feedbackAudioBase64) { audio.push(response.feedbackAudioBase64); cues.push(response.feedbackMouthCues); }
      if (response.isLastQuestion) {
        setDisplayedText(response.feedbackText || 'Merci pour cette conversation !');
      } else if (response.nextQuestion) {
        setCurrentQuestion(response.nextQuestion);
        setDisplayedText(response.nextQuestion.question || response.nextQuestion.sentenceWithBlank || '');
        if (response.nextQuestion.audioBase64) { audio.push(response.nextQuestion.audioBase64); cues.push(response.nextQuestion.audioMouthCues); }
      }
      if (audio.length) {
        setState('ai_speaking');
        playAudioSequence(audio, cues);
      } else {
        setState(response.isLastQuestion ? 'finished' : 'user_turn');
      }
    }).catch((error: unknown) => {
      if (cancelled) return;
      const failure = error as { response?: { status?: number; data?: { message?: string } }; message?: string };
      setError(failure.response?.data?.message || failure.message
        || 'L’analyse est indisponible. Votre enregistrement est conservé.');
      setState(failure.response?.status === 410 ? 'finished' : 'retry_analysis');
    });
    return () => { cancelled = true; };
  }, [state, audioBlob, session, currentQuestion, resetRecording, playAudioSequence]);

  // --- Render Helpers ---

  const getOrbMode = () => {
    switch (state) {
      case 'ai_speaking': return 'speaking';
      case 'recording': return 'listening';
      case 'processing': return 'processing';
      default: return 'idle';
    }
  };

  const getAvatarMode = (): TutorMode => {
    if (state === 'recording') return 'listening';
    if (state === 'processing') return 'thinking';
    return cheer ? 'encouraging' : 'idle';
  };

  const getStatusText = () => {
    switch (state) {
      case 'ai_speaking': return "L'IA parle...";
      case 'audio_blocked': return `Appuyez pour écouter ${TUTOR_NAME}`;
      case 'user_turn': return "À vous de parler";
      case 'recording': return "Écoute en cours...";
      case 'processing': return "Analyse de votre réponse...";
      case 'retry_analysis': return "Votre enregistrement est conservé";
      case 'finished': return "Conversation terminée";
      default: return "";
    }
  };

  // --- Main Render ---

  if (state === 'start') {
    return (
      <Card className="max-w-md mx-auto border-none shadow-xl bg-gradient-to-b from-background to-secondary/10">
        <CardHeader className="text-center pt-10">
          <div className="mx-auto mb-6">
            {AVATAR_ENABLED ? (
              <div className="h-64 w-56 overflow-hidden rounded-[2rem] shadow-xl ring-1 ring-black/5"
                style={{ background: 'radial-gradient(circle at 50% 35%, #fff8ee 0%, #fde9d2 35%, #c9d6ee 75%, #8fa3c9 100%)' }}>
                <ProfessorVideo mode="idle" speech={null} focus="face" />
              </div>
            ) : <VoiceOrb mode="idle" />}
          </div>
          <CardTitle className="text-3xl font-light">{TUTOR_NAME}</CardTitle>
          {recoverable && <p className="text-primary">Votre conversation en cours sera reprise sans nouveau débit.</p>}
          <p className="text-muted-foreground">Conversation interactive avec l'IA</p>
        </CardHeader>
        <CardContent className="space-y-6 pb-10">
          {/* Plan usage info */}
          {!loadingAccess && accessInfo && (
            <div className={`rounded-lg p-4 ${accessInfo.canUse ? 'bg-green-500/10 border border-green-500/30' : 'bg-orange-500/10 border border-orange-500/30'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {accessInfo.limit === -1 ? 'Accès illimité' : `Allocation sans expiration`}
                  </span>
                </div>
                <Badge variant={accessInfo.canUse ? "default" : "secondary"} className="text-xs">
                  {accessInfo.limit === -1 ? (
                    '∞ Illimité'
                  ) : (
                    `${accessInfo.used}/${accessInfo.limit} session${accessInfo.used > 1 ? 's' : ''}`
                  )}
                </Badge>
              </div>
              {accessInfo.limit !== -1 && accessInfo.remaining > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Il vous reste {accessInfo.remaining} session{accessInfo.remaining > 1 ? 's' : ''} sans expiration
                  {accessInfo.maxMinutes > 0 && ` (max ${accessInfo.maxMinutes} min/session)`}
                </p>
              )}
              {!accessInfo.canUse && accessInfo.message && (
                <p className="text-xs text-orange-600 mt-2">
                  {accessInfo.message}
                </p>
              )}
            </div>
          )}

          {!propThematicGroup && (
            <div className="space-y-4">
              <Select value={selectedThematicGroup} onValueChange={setSelectedThematicGroup}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un thème" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Grammaire de base</SelectItem>
                  <SelectItem value="2">Conjugaison</SelectItem>
                  <SelectItem value="3">Vocabulaire</SelectItem>
                  <SelectItem value="4">Expression orale</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {!isSupported && (
            <Alert variant="destructive">
              <AlertDescription>Microphone non supporté.</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleStart}
            size="lg"
            className="w-full h-14 text-lg rounded-full"
            disabled={isLoading || !isSupported || (!propThematicGroup && !selectedThematicGroup) || loadingAccess || (accessInfo && !accessInfo.canUse && !recoverable)}
          >
            {loadingAccess ? (
              <>
                <Loader2 className="animate-spin mr-2" />
                Vérification...
              </>
            ) : accessInfo && !accessInfo.canUse && !recoverable ? (
              <>
                <AlertCircle className="mr-2" />
                Limite atteinte
              </>
            ) : isLoading ? (
              <>
                <Loader2 className="animate-spin mr-2" />
                Chargement...
              </>
            ) : (
              <>
                <Mic className="mr-2" />
                {recoverable ? 'Reprendre la conversation' : 'Commencer la conversation'}
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (state === 'summary') {
    // Calculer le nombre d'échanges (tours de conversation)
    const totalExchanges = summary ? (summary.correctCount + (summary.partiallyCorrectCount || 0) + (summary.incorrectCount || 0)) : 0;

    return (
      <Card className="max-w-md mx-auto border-none shadow-xl">
        <CardHeader className="text-center">
          <MessageSquare className="w-16 h-16 mx-auto text-primary mb-4" />
          <CardTitle>Conversation Terminée</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <div className="bg-primary/10 rounded-xl p-6">
            <div className="text-4xl font-bold text-primary mb-2">
              {totalExchanges}
            </div>
            <p className="text-muted-foreground">échanges dans cette conversation</p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-4">
            <Button onClick={handleStart} variant="default" className="flex-1" disabled={isLoading} aria-busy={isLoading}>
              {isLoading
                ? <><Loader2 className="mr-2 w-4 h-4 animate-spin" /> Démarrage…</>
                : <><RotateCcw className="mr-2 w-4 h-4" /> Nouvelle conversation</>}
            </Button>
            <Button onClick={handleExit} variant="outline" className="flex-1" disabled={isLoading}>
              <LogOut className="mr-2 w-4 h-4" /> Quitter
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Conversation UI
  return createPortal(
    <div className={`fixed inset-0 z-[100] isolate flex flex-col items-center justify-center ${CLASSROOM ? 'bg-background' : 'bg-background/95 backdrop-blur-sm'}`}>
      {CLASSROOM && (
        <>
          {/* Wide screens: the portrait video stands in the middle over a blurred copy of the classroom. */}
          <img src={professorPoster} alt="" aria-hidden className="absolute inset-0 -z-10 h-full w-full scale-110 object-cover blur-2xl brightness-90" />
          <div className="pointer-events-none absolute inset-y-0 left-1/2 w-full max-w-[calc(100dvh*9/16)] -translate-x-1/2">
            <ProfessorVideo mode={getAvatarMode()} speech={speech} greet />
          </div>
          <span className="absolute bottom-3 left-3 rounded-full bg-background/80 px-3 py-1 text-xs text-muted-foreground backdrop-blur-sm">
            {AVATAR_CAPTION}
          </span>
        </>
      )}
      <Button variant="outline" className="absolute top-4 left-4" onClick={handleEndConversation}
        disabled={state === 'processing' || state === 'recording'}>
        {state === 'finished' ? 'Voir le bilan' : 'Terminer la conversation'}
      </Button>
      {/* Exit Button */}
      <Button
        variant="ghost"
        size="icon"
        aria-label="Quitter la conversation"
        className="absolute top-4 right-4 rounded-full hover:bg-destructive/10 hover:text-destructive"
        onClick={handleExit}
      >
        <X className="w-6 h-6" />
      </Button>

      {/* Status Text: at the top over the orb; over the video it joins the captions so the face stays clear. */}
      {!CLASSROOM && (
        <motion.div dir="ltr" lang="fr" className="absolute top-20 text-xl font-light tracking-wide text-muted-foreground"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={state}>
          {getStatusText()}
        </motion.div>
      )}

      {/* Central Orb + Displayed Text. Over the video, captions sit in the lower part, above the controls.
          w-full keeps long subtitles wrapping inside the screen instead of widening the column past it. */}
      <div className={`flex flex-col items-center w-full px-4 sm:px-8 max-w-2xl mx-auto break-words ${CLASSROOM
        ? 'absolute inset-x-0 bottom-36 justify-end gap-2' : 'flex-1 justify-center gap-8'}`}>
        {CLASSROOM ? (
          <motion.div dir="ltr" lang="fr" className="rounded-full bg-background/85 px-4 py-1 text-base font-light tracking-wide text-muted-foreground backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={state}>
            {getStatusText()}
          </motion.div>
        ) : <VoiceOrb mode={getOrbMode()} />}

        {/* Subtitle / Speech Text */}
        {displayedText && (state === 'ai_speaking' || state === 'audio_blocked' || state === 'user_turn' || state === 'finished') && (
          <motion.div
            className={`text-center ${PILL} ${CLASSROOM ? 'max-h-[30dvh] overflow-y-auto' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            key={displayedText.substring(0, 30)}
          >
            <p dir="ltr" lang="fr" className="text-lg md:text-xl text-foreground font-medium leading-relaxed">
              {secondsLeft !== null && <span className="block text-sm font-medium mb-2" role="timer">Temps restant : {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}{secondsLeft <= 120 && secondsLeft > 0 ? ' · Votre session se termine bientôt' : ''}</span>}{displayedText}
            </p>
          </motion.div>
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-12 w-full flex justify-center items-center gap-8">
        {/* Placeholder for symmetry */}
        {state !== 'audio_blocked' && <div className="w-14 h-14" />}

        {state === 'audio_blocked' && (
          <Button
            onClick={() => playerRef.current?.retry()}
            size="lg"
            className="h-auto min-h-14 rounded-full whitespace-normal px-6 py-3"
          >
            <Volume2 className="mr-2 h-5 w-5 shrink-0" />
            Appuyez pour écouter {TUTOR_NAME}
          </Button>
        )}

        {state === 'retry_analysis' && (
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={() => { setError(null); setState('processing'); }}>
              Réessayer l’analyse
            </Button>
            <Button variant="outline" onClick={() => {
              submission.current.clear();
              resetRecording();
              setError(null);
              setState('user_turn');
            }}>
              Enregistrer à nouveau
            </Button>
          </div>
        )}

        {/* Mic Button */}
        <AnimatePresence>
          {(state === 'user_turn' || state === 'recording') && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleMicClick}
              aria-label={state === 'recording' ? 'Arrêter l’enregistrement' : 'Enregistrer ma réponse'}
              className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-colors ${state === 'recording'
                ? 'bg-destructive text-destructive-foreground'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
                }`}
            >
              {state === 'recording' ? (
                <Square className="w-8 h-8 fill-current" />
              ) : (
                <Mic className="w-8 h-8" />
              )}
            </motion.button>
          )}
        </AnimatePresence>

        {/* Placeholder for symmetry */}
        {state !== 'audio_blocked' && <div className="w-14 h-14" />}
      </div>

      {/* Error Toast */}
      {error && (
        <div className="absolute bottom-32 bg-destructive/90 text-white px-4 py-2 rounded-full text-sm">
          {error}
        </div>
      )}
    </div>,
    document.body
  );
}
