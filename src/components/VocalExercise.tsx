import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
    Brain,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Lightbulb,
    ArrowRight,
    RotateCcw,
    Trophy,
    Target,
    Sparkles,
    Clock,
    Loader2,
    Mic,
    MicOff,
    Volume2,
    Square,
    List,
    Type
} from 'lucide-react';
import {
    QuestionDTO,
    QuizSessionDTO,
    QuizResultDTO,
    CorrectionDTO,
    startQuizSession,
    submitVocalQuizAnswers,
    QuestionType,
    checkQuizIaAccess,
    QuizAccessInfo
} from '@/services/quizService';

interface VocalExerciseProps {
    chapterId: number;
    chapterTitle: string;
    thematicGroup?: number;
}

type ExerciseState = 'idle' | 'loading' | 'practice' | 'recording' | 'submitting' | 'results';

// Question type labels
const questionTypeLabels: Record<QuestionType, string> = {
    CHOIX_MULTIPLE: 'Choix multiple',
    VRAI_FAUX: 'Vrai ou Faux',
    TEXTE_A_TROUS: 'Texte à trous',
    CONJUGAISON: 'Conjugaison',
    CORRECTION_GRAMMATICALE: 'Correction grammaticale',
    COMPLETION_PHRASE: 'Compléter la phrase',
    ECRITURE_LIBRE: 'Écriture libre',
    VOCABULAIRE: 'Vocabulaire',
    REORGANISER_MOTS: 'Réorganiser les mots'
};

// Question type icons
const questionTypeIcons: Record<QuestionType, React.ReactNode> = {
    CHOIX_MULTIPLE: <List className="w-4 h-4" />,
    VRAI_FAUX: <CheckCircle2 className="w-4 h-4" />,
    TEXTE_A_TROUS: <Type className="w-4 h-4" />,
    CONJUGAISON: <Sparkles className="w-4 h-4" />,
    CORRECTION_GRAMMATICALE: <AlertCircle className="w-4 h-4" />,
    COMPLETION_PHRASE: <Type className="w-4 h-4" />,
    ECRITURE_LIBRE: <Type className="w-4 h-4" />,
    VOCABULAIRE: <Brain className="w-4 h-4" />,
    REORGANISER_MOTS: <ArrowRight className="w-4 h-4" />
};

export default function VocalExercise({ chapterId, chapterTitle, thematicGroup = 1 }: VocalExerciseProps) {
    // State
    const [state, setState] = useState<ExerciseState>('idle');
    const [session, setSession] = useState<QuizSessionDTO | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Map<number, string>>(new Map());
    const [results, setResults] = useState<QuizResultDTO | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [startTime, setStartTime] = useState<number>(0);
    const [accessInfo, setAccessInfo] = useState<QuizAccessInfo | null>(null);
    const [loadingAccess, setLoadingAccess] = useState(true);

    // Voice recognition state
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isVoiceSupported, setIsVoiceSupported] = useState(true);
    const recognitionRef = useRef<any>(null);

    const currentQuestion = session?.questions?.[currentIndex];
    const progress = session?.questions?.length ? ((currentIndex + 1) / session.questions.length) * 100 : 0;

    // Check voice recognition support
    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setIsVoiceSupported(false);
            console.warn('Speech Recognition not supported in this browser');
        }
    }, []);

    // Check access on mount
    useEffect(() => {
        const checkAccess = async () => {
            setLoadingAccess(true);
            try {
                const info = await checkQuizIaAccess();
                setAccessInfo(info);
            } catch (e) {
                console.error('Error checking access:', e);
            } finally {
                setLoadingAccess(false);
            }
        };
        checkAccess();
    }, []);

    // Initialize speech recognition
    const initRecognition = useCallback(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) return null;

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'fr-FR'; // French language

        recognition.onresult = (event: any) => {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    finalTranscript += result[0].transcript;
                } else {
                    interimTranscript += result[0].transcript;
                }
            }

            setTranscript(finalTranscript || interimTranscript);
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            if (event.error === 'not-allowed') {
                setError('Microphone non autorisé. Veuillez autoriser l\'accès au microphone.');
            }
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        return recognition;
    }, []);

    // Start quiz
    const handleStartQuiz = async () => {
        setState('loading');
        setAnswers(new Map());
        setCurrentIndex(0);
        setResults(null);
        setError(null);
        setStartTime(Date.now());

        try {
            const newSession = await startQuizSession(thematicGroup, [chapterId]);
            console.log('VocalExercise session received:', newSession);

            if (newSession.questions && newSession.questions.length > 0) {
                setSession(newSession);
                setState('practice');
            } else {
                setError('Aucune question générée. Veuillez réessayer.');
                setState('idle');
            }
        } catch (err: unknown) {
            console.error('Failed to start vocal exercise:', err);
            let errorMessage = 'Impossible de démarrer l\'exercice. Veuillez réessayer.';
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosError = err as { response?: { status: number; data: { message?: string } } };
                if (axiosError.response?.data?.message) {
                    errorMessage = axiosError.response.data.message;
                }
            }
            setError(errorMessage);
            setState('idle');
        }
    };

    // Start/Stop voice recording
    const handleMicClick = async () => {
        if (!isVoiceSupported) {
            setError('La reconnaissance vocale n\'est pas supportée par ce navigateur.');
            return;
        }

        if (isListening) {
            // Stop recording
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            setIsListening(false);
        } else {
            // Start recording
            setTranscript('');
            const recognition = initRecognition();
            if (recognition) {
                recognitionRef.current = recognition;
                try {
                    recognition.start();
                    setIsListening(true);
                    setState('recording');
                } catch (e) {
                    console.error('Failed to start recognition:', e);
                    setError('Impossible de démarrer l\'enregistrement.');
                }
            }
        }
    };

    // Validate current answer and move to next
    const handleValidateAnswer = () => {
        if (!transcript.trim()) {
            setError('Veuillez donner une réponse vocale.');
            return;
        }

        const newAnswers = new Map(answers);
        newAnswers.set(currentIndex, transcript.trim());
        setAnswers(newAnswers);
        setTranscript('');
        setError(null);

        if (session && currentIndex < session.questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setState('practice');
        } else {
            // All questions answered - submit
            handleSubmit(newAnswers);
        }
    };

    // Skip current question
    const handleSkipQuestion = () => {
        const newAnswers = new Map(answers);
        newAnswers.set(currentIndex, ''); // Empty answer for skipped
        setAnswers(newAnswers);
        setTranscript('');
        setError(null);

        if (session && currentIndex < session.questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setState('practice');
        } else {
            handleSubmit(newAnswers);
        }
    };

    // Submit all answers
    const handleSubmit = async (finalAnswers: Map<number, string>) => {
        if (!session) return;
        setState('submitting');

        const answersArray: string[] = [];
        for (let i = 0; i < session.questions.length; i++) {
            answersArray.push(finalAnswers.get(i) || '');
        }

        const timeSpentSeconds = Math.floor((Date.now() - startTime) / 1000);

        try {
            // Use vocal-specific endpoint for flexible correction
            const result = await submitVocalQuizAnswers(session.sessionId, answersArray, timeSpentSeconds);
            setResults(result);
            setState('results');

            if (result.score >= 80) {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            }
        } catch (error) {
            console.error('Failed to submit vocal exercise:', error);
            setState('practice');
            setError('Erreur lors de la soumission. Veuillez réessayer.');
        }
    };

    // Reset quiz
    const handleReset = () => {
        setState('idle');
        setSession(null);
        setCurrentIndex(0);
        setAnswers(new Map());
        setResults(null);
        setTranscript('');
        setError(null);
        setStartTime(0);
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setIsListening(false);
    };

    // Read question aloud (Text-to-Speech)
    const speakQuestion = (text: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'fr-FR';
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        }
    };

    // Render idle state
    if (state === 'idle') {
        return (
            <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center">
                        <Mic className="w-8 h-8 text-purple-500" />
                    </div>
                    <CardTitle className="text-2xl">Exercice Par Vocale - {chapterTitle}</CardTitle>
                    <p className="text-muted-foreground mt-2">
                        Répondez à 20 questions en utilisant votre voix.
                        Les corrections seront affichées à la fin.
                    </p>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Voice support warning */}
                    {!isVoiceSupported && (
                        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-destructive">Navigateur non supporté</p>
                                <p className="text-sm text-destructive/80">
                                    La reconnaissance vocale n'est pas disponible. Utilisez Chrome ou Edge.
                                </p>
                            </div>
                        </div>
                    )}

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
                                        `${accessInfo.used}/${accessInfo.limit} utilisé${accessInfo.used > 1 ? 's' : ''}`
                                    )}
                                </Badge>
                            </div>
                            {accessInfo.limit !== -1 && accessInfo.remaining > 0 && (
                                <p className="text-xs text-muted-foreground mt-2">
                                    Il vous reste {accessInfo.remaining} exercice(s) ce mois-ci
                                </p>
                            )}
                            {!accessInfo.canUse && accessInfo.message && (
                                <p className="text-xs text-orange-600 mt-2">
                                    {accessInfo.message}
                                </p>
                            )}
                        </div>
                    )}

                    {/* How it works */}
                    <div className="bg-muted/50 rounded-lg p-4">
                        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            Comment ça marche
                        </h4>
                        <ol className="text-sm text-muted-foreground space-y-2">
                            <li className="flex items-start gap-2">
                                <span className="bg-purple-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0">1</span>
                                <span>Lisez la question affichée</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="bg-purple-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0">2</span>
                                <span>Cliquez sur le micro et répondez à voix haute</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="bg-purple-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0">3</span>
                                <span>Validez votre réponse et passez à la suivante</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="bg-purple-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0">4</span>
                                <span>À la fin, découvrez toutes les corrections</span>
                            </li>
                        </ol>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-destructive">Erreur</p>
                                <p className="text-sm text-destructive/80">{error}</p>
                            </div>
                        </div>
                    )}

                    <Button
                        onClick={handleStartQuiz}
                        size="lg"
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        disabled={loadingAccess || (accessInfo && !accessInfo.canUse) || !isVoiceSupported}
                    >
                        {loadingAccess ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Vérification...
                            </>
                        ) : accessInfo && !accessInfo.canUse ? (
                            <>
                                <AlertCircle className="w-5 h-5 mr-2" />
                                Limite atteinte
                            </>
                        ) : (
                            <>
                                <Mic className="w-5 h-5 mr-2" />
                                Commencer l'Exercice Vocal
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>
        );
    }

    // Render loading state
    if (state === 'loading') {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                    <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
                    <p className="text-lg font-medium">Génération des questions...</p>
                    <p className="text-sm text-muted-foreground mt-1">
                        L'IA prépare votre exercice personnalisé
                    </p>
                </CardContent>
            </Card>
        );
    }

    // Render submitting state
    if (state === 'submitting') {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                    <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
                    <p className="text-lg font-medium">Correction en cours...</p>
                    <p className="text-sm text-muted-foreground mt-1">
                        L'IA analyse vos {session?.questions?.length || 20} réponses
                    </p>
                </CardContent>
            </Card>
        );
    }

    // Render results state
    if (state === 'results' && results) {
        const scoreColor = results.score >= 80 ? 'text-green-500' :
            results.score >= 60 ? 'text-yellow-500' : 'text-red-500';

        return (
            <Card>
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-purple-500/10 flex items-center justify-center">
                        <Trophy className={`w-10 h-10 ${scoreColor}`} />
                    </div>
                    <CardTitle className="text-3xl">Exercice Terminé!</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Score summary */}
                    <div className="text-center">
                        <div className={`text-6xl font-bold ${scoreColor}`}>
                            {results.score}%
                        </div>
                        <div className="mt-2 space-y-1">
                            <p className="text-muted-foreground">
                                {results.correctAnswers} correct{results.correctAnswers > 1 ? 's' : ''} sur {results.totalQuestions} questions
                            </p>
                            {results.partiallyCorrect > 0 && (
                                <p className="text-yellow-500 text-sm">
                                    + {results.partiallyCorrect} partiellement correct{results.partiallyCorrect > 1 ? 's' : ''}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Corrections */}
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                        <h3 className="font-semibold flex items-center gap-2">
                            <Lightbulb className="w-5 h-5 text-yellow-500" />
                            Corrections détaillées
                        </h3>
                        {results.corrections.map((correction, index) => {
                            const question = session?.questions[index];
                            const userAnswer = answers.get(index) || correction.userAnswer || '(Pas de réponse)';

                            return (
                                <motion.div
                                    key={correction.questionId}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`p-4 rounded-lg border ${correction.isCorrect
                                        ? 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-900'
                                        : correction.isPartiallyCorrect
                                            ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-900'
                                            : 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        {correction.isCorrect ? (
                                            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                        ) : correction.isPartiallyCorrect ? (
                                            <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                                        ) : (
                                            <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                <span className="text-sm font-medium">Q{index + 1}</span>
                                                {question && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {questionTypeLabels[question.type]}
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm font-medium mb-2">{question?.text}</p>
                                            <div className="text-sm space-y-1">
                                                <p>
                                                    <span className="text-muted-foreground">Votre réponse (vocale):</span>{' '}
                                                    <span className={
                                                        correction.isCorrect
                                                            ? 'text-green-600 dark:text-green-400'
                                                            : correction.isPartiallyCorrect
                                                                ? 'text-yellow-600 dark:text-yellow-400'
                                                                : 'text-red-600 dark:text-red-400'
                                                    }>
                                                        {userAnswer || '(vide)'}
                                                    </span>
                                                </p>
                                                {!correction.isCorrect && (
                                                    <p>
                                                        <span className="text-muted-foreground">Réponse correcte:</span>{' '}
                                                        <span className="text-green-600 dark:text-green-400">
                                                            {correction.suggestedAnswer}
                                                        </span>
                                                    </p>
                                                )}
                                                {correction.tip && (
                                                    <p className="text-muted-foreground italic mt-2 flex items-start gap-1">
                                                        <Lightbulb className="w-4 h-4 shrink-0 mt-0.5" />
                                                        {correction.tip}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <Button onClick={handleReset} variant="outline" className="flex-1">
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Nouvel Exercice
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Render practice/recording state
    if ((state === 'practice' || state === 'recording') && currentQuestion) {
        const answeredCount = answers.size;
        const isLastQuestion = session && currentIndex === session.questions.length - 1;

        return (
            <Card className="overflow-hidden">
                <CardHeader className="pb-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                    <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="flex items-center gap-1">
                            {questionTypeIcons[currentQuestion.type]}
                            {questionTypeLabels[currentQuestion.type]}
                        </Badge>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            Question {currentIndex + 1}/{session?.questions.length}
                        </div>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{answeredCount} répondu(s)</span>
                        <span>{Math.round(progress)}% complété</span>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentQuestion.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            {/* Question text */}
                            <div className="flex items-start gap-3">
                                <h3 className="text-xl font-semibold flex-1">{currentQuestion.text}</h3>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => speakQuestion(currentQuestion.text)}
                                    title="Écouter la question"
                                >
                                    <Volume2 className="w-5 h-5" />
                                </Button>
                            </div>

                            {/* Options display (for reference, not clickable) */}
                            {currentQuestion.options && currentQuestion.options.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Options possibles :</p>
                                    <div className="flex flex-wrap gap-2">
                                        {currentQuestion.options.map((option, i) => (
                                            <Badge key={i} variant="secondary" className="text-sm">
                                                {String.fromCharCode(65 + i)}. {option}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Hint */}
                            {currentQuestion.hint && (
                                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-3">
                                    <p className="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-2">
                                        <Lightbulb className="w-4 h-4" />
                                        {currentQuestion.hint}
                                    </p>
                                </div>
                            )}

                            {/* Voice recording area */}
                            <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-6 text-center">
                                {/* Mic button */}
                                <motion.button
                                    onClick={handleMicClick}
                                    className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 transition-all ${isListening
                                        ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/50'
                                        : 'bg-purple-500 text-white hover:bg-purple-600 shadow-lg shadow-purple-500/30'
                                        }`}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {isListening ? (
                                        <Square className="w-10 h-10 fill-current" />
                                    ) : (
                                        <Mic className="w-10 h-10" />
                                    )}
                                </motion.button>

                                <p className="text-muted-foreground mb-2">
                                    {isListening ? 'Parlez maintenant... Cliquez pour arrêter' : 'Cliquez pour enregistrer votre réponse'}
                                </p>

                                {/* Transcript display */}
                                {transcript && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-white dark:bg-slate-700 rounded-lg p-4 mt-4 border border-slate-200 dark:border-slate-600"
                                    >
                                        <p className="text-sm text-muted-foreground mb-1">Votre réponse :</p>
                                        <p className="text-lg font-medium text-purple-600 dark:text-purple-400">
                                            "{transcript}"
                                        </p>
                                    </motion.div>
                                )}
                            </div>

                            {/* Error message */}
                            {error && (
                                <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-sm text-destructive">
                                    {error}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className="flex justify-between pt-4">
                        <Button
                            variant="ghost"
                            onClick={handleReset}
                        >
                            Abandonner
                        </Button>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={handleSkipQuestion}
                            >
                                Passer
                            </Button>
                            <Button
                                onClick={handleValidateAnswer}
                                disabled={!transcript.trim()}
                                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                            >
                                {isLastQuestion ? 'Terminer' : 'Valider'}
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return null;
}
