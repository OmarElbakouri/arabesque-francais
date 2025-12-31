import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  HelpCircle,
  Loader2,
  Type,
  List
} from 'lucide-react';
import {
  QuestionDTO,
  QuizSessionDTO,
  QuizResultDTO,
  CorrectionDTO,
  AnswerSubmission,
  startQuizSession,
  submitQuizAnswers,
  QuestionType,
  checkQuizIaAccess,
  QuizAccessInfo
} from '@/services/quizService';

interface ChapterQuizProps {
  chapterId: number;
  chapterTitle: string;
  thematicGroup?: number; // 1-6, defaults to 1 if not provided
}

type QuizState = 'idle' | 'loading' | 'practice' | 'submitting' | 'results';

// Question type labels in French
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

export default function ChapterQuiz({ chapterId, chapterTitle, thematicGroup = 1 }: ChapterQuizProps) {
  const [state, setState] = useState<QuizState>('idle');
  const [session, setSession] = useState<QuizSessionDTO | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<number, string>>(new Map()); // Map<questionIndex, answer>
  const [results, setResults] = useState<QuizResultDTO | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [accessInfo, setAccessInfo] = useState<QuizAccessInfo | null>(null);
  const [loadingAccess, setLoadingAccess] = useState(true);

  const currentQuestion = session?.questions?.[currentIndex];
  const progress = session?.questions?.length ? ((currentIndex + 1) / session.questions.length) * 100 : 0;

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

  // Start quiz
  const handleStartQuiz = async () => {
    setState('loading');
    setAnswers(new Map());
    setCurrentIndex(0);
    setResults(null);
    setShowHint(false);
    setError(null);
    setStartTime(Date.now());

    try {
      // Pass thematicGroup (required) and optionally the specific chapter
      const newSession = await startQuizSession(thematicGroup, [chapterId]);
      console.log('Quiz session received:', newSession);
      console.log('Questions count:', newSession.questions?.length);
      
      if (newSession.questions && newSession.questions.length > 0) {
        setSession(newSession);
        setState('practice');
      } else {
        setError('Aucune question générée. Veuillez réessayer.');
        setState('idle');
      }
    } catch (err: unknown) {
      console.error('Failed to start quiz:', err);
      // Extract error message from backend response
      let errorMessage = 'Impossible de démarrer le quiz. Veuillez réessayer.';
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

  // Handle answer selection (for multiple choice)
  const handleSelectAnswer = (answer: string) => {
    const newAnswers = new Map(answers);
    newAnswers.set(currentIndex, answer);
    setAnswers(newAnswers);
  };

  // Handle typed answer change
  const handleTypedAnswerChange = (value: string) => {
    const newAnswers = new Map(answers);
    newAnswers.set(currentIndex, value);
    setAnswers(newAnswers);
  };

  // Move to next question
  const handleNext = () => {
    if (!session) return;
    setShowHint(false);
    
    if (currentIndex < session.questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleSubmit();
    }
  };

  // Submit quiz
  const handleSubmit = async () => {
    if (!session) return;
    setState('submitting');

    // Convert Map to array of answers in order
    const answersArray: string[] = [];
    for (let i = 0; i < session.questions.length; i++) {
      answersArray.push(answers.get(i) || '');
    }
    
    // Calculate time spent
    const timeSpentSeconds = Math.floor((Date.now() - startTime) / 1000);

    try {
      const result = await submitQuizAnswers(session.sessionId, answersArray, timeSpentSeconds);
      setResults(result);
      setState('results');

      // Celebrate good scores
      if (result.score >= 80) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      setState('practice');
    }
  };

  // Reset quiz
  const handleReset = () => {
    setState('idle');
    setSession(null);
    setCurrentIndex(0);
    setAnswers(new Map());
    setResults(null);
    setShowHint(false);
    setStartTime(0);
  };

  // Get current answer
  const getCurrentAnswer = () => {
    return answers.get(currentIndex) || '';
  };

  // Render idle state
  if (state === 'idle') {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Brain className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Exercice - {chapterTitle}</CardTitle>
          <p className="text-muted-foreground mt-2">
            Testez vos connaissances avec 20 questions générées par l'IA.
            Les questions peuvent être à choix multiple ou à réponse écrite.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
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
                  Il vous reste {accessInfo.remaining} quiz ce mois-ci
                </p>
              )}
              {!accessInfo.canUse && accessInfo.message && (
                <p className="text-xs text-orange-600 mt-2">
                  {accessInfo.message}
                </p>
              )}
            </div>
          )}

          {/* Question types info */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Types de questions
            </h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <List className="w-3 h-3" /> Choix multiple
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Vrai/Faux
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Type className="w-3 h-3" /> Conjugaison
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Texte à trous
              </Badge>
            </div>
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
            className="w-full"
            disabled={loadingAccess || (accessInfo && !accessInfo.canUse)}
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
                <Sparkles className="w-5 h-5 mr-2" />
                Commencer le Quiz
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
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-lg font-medium">Génération des questions...</p>
          <p className="text-sm text-muted-foreground mt-1">
            L'IA prépare votre quiz personnalisé
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
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-lg font-medium">Correction en cours...</p>
          <p className="text-sm text-muted-foreground mt-1">
            L'IA analyse vos réponses
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
          <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Trophy className={`w-10 h-10 ${scoreColor}`} />
          </div>
          <CardTitle className="text-3xl">Quiz Terminé!</CardTitle>
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
              // Get question by index since questionIndex matches the answers Map keys
              const question = session?.questions[index];
              // Use index to get user answer since answers Map uses numeric indices (0, 1, 2...)
              const userAnswer = answers.get(index) || correction.userAnswer || '(Pas de réponse)';
              
              return (
                <motion.div
                  key={correction.questionId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border ${
                    correction.isCorrect 
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
                          <span className="text-muted-foreground">Votre réponse:</span>{' '}
                          <span className={
                            correction.isCorrect 
                              ? 'text-green-600 dark:text-green-400' 
                              : correction.isPartiallyCorrect
                                ? 'text-yellow-600 dark:text-yellow-400'
                                : 'text-red-600 dark:text-red-400'
                          }>
                            {userAnswer}
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
              Nouveau Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle practice state without current question (fallback)
  if (state === 'practice' && !currentQuestion) {
    console.error('Practice state but no current question. Session:', session);
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <AlertCircle className="w-12 h-12 text-destructive mb-4" />
          <p className="text-lg font-medium">Erreur de chargement</p>
          <p className="text-sm text-muted-foreground mt-1">
            Les questions n'ont pas pu être chargées correctement.
          </p>
          <Button onClick={handleReset} className="mt-4">
            <RotateCcw className="w-4 h-4 mr-2" />
            Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Render practice state
  if (state === 'practice' && currentQuestion) {
    const currentAnswer = getCurrentAnswer();
    const isAnswered = currentAnswer.length > 0;
    const isLastQuestion = session && session.questions && currentIndex === session.questions.length - 1;

    return (
      <Card>
        <CardHeader className="pb-2">
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
        </CardHeader>
        <CardContent className="space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Question text */}
              <h3 className="text-xl font-semibold">{currentQuestion.text}</h3>

              {/* Hint section */}
              {currentQuestion.hint && currentQuestion.requiresTyping && (
                <div className="flex items-start gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowHint(!showHint)}
                    className="text-muted-foreground hover:text-primary"
                  >
                    <HelpCircle className="w-4 h-4 mr-1" />
                    {showHint ? 'Cacher l\'indice' : 'Voir l\'indice'}
                  </Button>
                </div>
              )}
              
              {showHint && currentQuestion.hint && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-3"
                >
                  <p className="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    {currentQuestion.hint}
                  </p>
                </motion.div>
              )}

              {/* Answer options or text input */}
              {currentQuestion.requiresTyping ? (
                // Typed answer input
                <div className="space-y-3">
                  {currentQuestion.type === 'CORRECTION_GRAMMATICALE' || 
                   currentQuestion.type === 'ECRITURE_LIBRE' ||
                   currentQuestion.type === 'REORGANISER_MOTS' ? (
                    <Textarea
                      value={currentAnswer}
                      onChange={(e) => handleTypedAnswerChange(e.target.value)}
                      placeholder="Écrivez votre réponse ici..."
                      className="min-h-[100px] text-base"
                      maxLength={currentQuestion.maxLength}
                    />
                  ) : (
                    <Input
                      value={currentAnswer}
                      onChange={(e) => handleTypedAnswerChange(e.target.value)}
                      placeholder="Tapez votre réponse..."
                      className="text-base h-12"
                      maxLength={currentQuestion.maxLength}
                    />
                  )}
                  {currentQuestion.maxLength && (
                    <p className="text-xs text-muted-foreground text-right">
                      {currentAnswer.length}/{currentQuestion.maxLength} caractères
                    </p>
                  )}
                </div>
              ) : (
                // Multiple choice options
                <div className="grid gap-3">
                  {currentQuestion.options?.map((option, index) => (
                    <motion.button
                      key={option}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleSelectAnswer(option)}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        currentAnswer === option
                          ? 'border-primary bg-primary/10 ring-2 ring-primary/30'
                          : 'border-border hover:border-primary/50 hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            currentAnswer === option
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span className="flex-1">{option}</span>
                        {currentAnswer === option && (
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                        )}
                      </div>
                    </motion.button>
                  ))}
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
            <Button
              onClick={handleNext}
              disabled={!isAnswered}
            >
              {isLastQuestion ? 'Terminer' : 'Suivant'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
