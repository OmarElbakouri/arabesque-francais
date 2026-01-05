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
import {
  VoiceQuizQuestion,
  VoiceQuizSessionResponse,
  SubmitAnswerResponse,
  SessionSummary,
  startVoiceQuizSession,
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

type ConversationState = 'start' | 'ai_speaking' | 'user_turn' | 'recording' | 'processing' | 'summary';

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
  const [currentQuestion, setCurrentQuestion] = useState<VoiceQuizQuestion | null>(null);
  const [displayedText, setDisplayedText] = useState<string>(''); // Text being spoken by AI
  const [summary, setSummary] = useState<SessionSummary | null>(null);

  // Filters
  const [selectedThematicGroup, setSelectedThematicGroup] = useState<string>(propThematicGroup?.toString() || '');
  const [chapterNumber, setChapterNumber] = useState<string>(chapterId?.toString() || '');

  // Audio
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
      } catch (e) {
        console.error('Error checking voice quiz access:', e);
      } finally {
        setLoadingAccess(false);
      }
    };
    checkAccess();
  }, []);

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
  const playAudioSequence = useCallback((base64List: string[]) => {
    if (base64List.length === 0) {
      setState('user_turn');
      return;
    }

    const [currentAudio, ...remainingAudio] = base64List;
    if (!currentAudio) {
      playAudioSequence(remainingAudio);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(`data:audio/mpeg;base64,${currentAudio}`);
    audioRef.current = audio;

    audio.onended = () => {
      playAudioSequence(remainingAudio);
    };

    audio.onerror = (e) => {
      console.error("Audio playback error", e);
      playAudioSequence(remainingAudio); // Skip to next
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(err => {
        if (err.name !== 'AbortError') {
          console.error("Playback failed", err);
          playAudioSequence(remainingAudio); // Skip to next
        }
      });
    }
  }, []);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // --- Actions ---

  const handleStart = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const thematicGroupValue = propThematicGroup || (selectedThematicGroup ? parseInt(selectedThematicGroup) : 1);
      const request: { thematicGroup: number; chapterNumber?: number } = {
        thematicGroup: thematicGroupValue
      };
      if (chapterNumber) request.chapterNumber = parseInt(chapterNumber);

      const response = await startVoiceQuizSession(request);
      setSession(response);
      setCurrentQuestion(response.question);
      setState('ai_speaking'); // Start conversation

      // Display the question text
      setDisplayedText(response.question.question || response.question.sentenceWithBlank || '');

      // Play initial question
      if (response.question.audioBase64) {
        setTimeout(() => {
          playAudioSequence([response.question.audioBase64!]);
        }, 500);
      } else {
        // Fallback if no audio
        setTimeout(() => setState('user_turn'), 1000);
      }

    } catch (err) {
      setError("Impossible de démarrer la conversation.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicClick = async () => {
    console.log('[VoiceQuiz] handleMicClick called, current state:', state);
    if (state === 'user_turn') {
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
    if (audioRef.current) audioRef.current.pause();
    resetRecording();
    setState('start');
    setSession(null);
    setCurrentQuestion(null);
    setSummary(null);
  };

  // Terminate conversation and show summary
  const handleEndConversation = async () => {
    if (audioRef.current) audioRef.current.pause();
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

  // Process Answer
  useEffect(() => {
    let isCancelled = false;
    let apiTimeout: NodeJS.Timeout;

    const processAnswer = async () => {
      console.log('[VoiceQuiz] processAnswer check - state:', state, 'audioBlob:', audioBlob?.size, 'session:', session?.sessionId, 'question:', currentQuestion?.id);

      if (state === 'processing' && audioBlob && session && currentQuestion) {
        console.log('[VoiceQuiz] All conditions met, starting API call...');

        // Set API timeout (30 seconds for transcription + AI response)
        apiTimeout = setTimeout(() => {
          if (!isCancelled) {
            console.error("[VoiceQuiz] API timeout - no response after 30 seconds");
            setError("La réponse prend trop de temps. Veuillez réessayer.");
            resetRecording();
            setState('user_turn');
          }
        }, 30000);

        try {
          // Determine format
          const audioFormat = audioBlob.type.includes('webm') ? 'webm'
            : audioBlob.type.includes('mp4') ? 'm4a'
              : audioBlob.type.includes('ogg') ? 'ogg'
                : audioBlob.type.includes('wav') ? 'wav'
                  : 'webm';

          console.log('[VoiceQuiz] Submitting audio answer...', { sessionId: session.sessionId, questionId: currentQuestion.id, audioFormat, blobSize: audioBlob.size });

          const response = await submitVoiceAnswer(
            session.sessionId,
            currentQuestion.id,
            audioBlob,
            audioFormat
          );

          if (isCancelled) return;
          clearTimeout(apiTimeout);

          console.log('[VoiceQuiz] Got response from API:', response);

          // Prepare audio sequence: Feedback -> Next Question
          const audioSequence: string[] = [];
          if (response.feedbackAudioBase64) {
            audioSequence.push(response.feedbackAudioBase64);
          }

          if (response.nextQuestion) {
            console.log('[VoiceQuiz] Moving to next turn in conversation');
            // Seamless transition - conversation continues
            setCurrentQuestion(response.nextQuestion);

            // Display feedback + corrections + next question text
            let feedbackDisplay = '';

            // Show what the user said
            if (response.transcribedText) {
              feedbackDisplay += `Vous avez dit: "${response.transcribedText}"\n\n`;
            }

            // Show corrections if any (from explanation field)
            if (response.explanation && response.explanation.trim()) {
              feedbackDisplay += `${response.explanation}\n\n`;
            }

            // Show general feedback
            if (response.feedbackText) {
              feedbackDisplay += response.feedbackText;
            }

            setDisplayedText(feedbackDisplay.trim());

            if (response.nextQuestion.audioBase64) {
              audioSequence.push(response.nextQuestion.audioBase64);
            }
            resetRecording();
            setState('ai_speaking'); // Loop back

            // After feedback, show next question
            setTimeout(() => {
              setDisplayedText(response.nextQuestion?.question || response.nextQuestion?.sentenceWithBlank || '');
            }, 3000);

            // Play the sequence
            playAudioSequence(audioSequence);
          } else {
            console.log('[VoiceQuiz] No next question, playing feedback or returning to user turn');
            // If we have feedback, play it and let user continue
            if (audioSequence.length > 0) {
              setState('ai_speaking');
              playAudioSequence(audioSequence);
            } else {
              setState('user_turn');
            }
            resetRecording();
          }
        } catch (err) {
          if (isCancelled) return;
          clearTimeout(apiTimeout);
          console.error("Submission failed", err);
          setError("Erreur de connexion. Veuillez réessayer.");
          resetRecording();
          setState('user_turn'); // Let user try again
        }
      }
    };

    processAnswer();

    return () => {
      isCancelled = true;
      if (apiTimeout) clearTimeout(apiTimeout);
    };
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

  const getStatusText = () => {
    switch (state) {
      case 'ai_speaking': return "L'IA parle...";
      case 'user_turn': return "À vous de parler";
      case 'recording': return "Écoute en cours...";
      case 'processing': return "Réflexion...";
      default: return "";
    }
  };

  // --- Main Render ---

  if (state === 'start') {
    return (
      <Card className="max-w-md mx-auto border-none shadow-xl bg-gradient-to-b from-background to-secondary/10">
        <CardHeader className="text-center pt-10">
          <div className="mx-auto mb-6">
            <VoiceOrb mode="idle" />
          </div>
          <CardTitle className="text-3xl font-light">Assistant Vocal</CardTitle>
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
                    {accessInfo.limit === -1 ? 'Accès illimité' : `Utilisation ce mois`}
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
                  Il vous reste {accessInfo.remaining} session{accessInfo.remaining > 1 ? 's' : ''} ce mois-ci
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
            disabled={isLoading || !isSupported || (!propThematicGroup && !selectedThematicGroup) || loadingAccess || (accessInfo && !accessInfo.canUse)}
          >
            {loadingAccess ? (
              <>
                <Loader2 className="animate-spin mr-2" />
                Vérification...
              </>
            ) : accessInfo && !accessInfo.canUse ? (
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
                Commencer la conversation
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

          <div className="flex gap-4">
            <Button onClick={handleStart} variant="default" className="flex-1">
              <RotateCcw className="mr-2 w-4 h-4" /> Nouvelle conversation
            </Button>
            <Button onClick={handleExit} variant="outline" className="flex-1">
              <LogOut className="mr-2 w-4 h-4" /> Quitter
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Conversation UI
  return createPortal(
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-[100] flex flex-col items-center justify-center">
      {/* Exit Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 rounded-full hover:bg-destructive/10 hover:text-destructive"
        onClick={handleExit}
      >
        <X className="w-6 h-6" />
      </Button>

      {/* Status Text */}
      <motion.div
        className="absolute top-20 text-xl font-light tracking-wide text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        key={state}
      >
        {getStatusText()}
      </motion.div>

      {/* Central Orb + Displayed Text */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 px-8 max-w-2xl mx-auto">
        <VoiceOrb mode={getOrbMode()} />

        {/* Subtitle / Speech Text */}
        {displayedText && (state === 'ai_speaking' || state === 'user_turn') && (
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            key={displayedText.substring(0, 30)}
          >
            <p className="text-lg md:text-xl text-foreground font-medium leading-relaxed">
              {displayedText}
            </p>
          </motion.div>
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-12 w-full flex justify-center items-center gap-8">
        {/* Placeholder for symmetry */}
        <div className="w-14 h-14" />

        {/* Mic Button */}
        <AnimatePresence>
          {(state === 'user_turn' || state === 'recording') && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleMicClick}
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
        <div className="w-14 h-14" />
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
