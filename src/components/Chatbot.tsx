import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2, Sparkles, AlertCircle, Target, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';
import {
  checkChatbotAccess,
  sendChatMessage,
  generateMiniQuiz,
  ChatMessage,
  ChatbotAccessInfo,
  MiniQuiz,
  QuizQuestion
} from '@/services/chatbotService';

interface Message extends ChatMessage {
  id: string;
  isQuiz?: boolean;
  quiz?: MiniQuiz;
}

export function Chatbot() {
  const { user, isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [accessInfo, setAccessInfo] = useState<ChatbotAccessInfo | null>(null);
  const [loadingAccess, setLoadingAccess] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<{ quiz: MiniQuiz; currentQuestion: number; score: number } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadAccessInfo = async () => {
    setLoadingAccess(true);
    try {
      const info = await checkChatbotAccess();
      setAccessInfo(info);

      // Add welcome message if no messages
      if (messages.length === 0) {
        const welcomeMessage: Message = {
          id: 'welcome',
          role: 'assistant',
          content: `Bonjour${user?.prenom ? ' ' + user.prenom : ''} ! 👋 Je suis l'assistant IA de BCLT Academy. Comment puis-je vous aider aujourd'hui ?\n\nVous pouvez me demander :\n• Des explications sur le français\n• Des informations sur la plateforme\n• Un mini quiz rapide\n• Des conseils d'apprentissage`,
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
      }
    } catch (error) {
      console.error('Error loading access info:', error);
    } finally {
      setLoadingAccess(false);
    }
  };

  // Check access when opened
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadAccessInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isAuthenticated]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    if (!accessInfo?.canUse) {
      toast({
        title: "Accès limité",
        description: accessInfo?.message || "Vous avez atteint votre limite mensuelle",
        variant: "destructive"
      });
      return;
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Get conversation history (excluding welcome message)
      const history = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({ role: m.role, content: m.content }));

      const response = await sendChatMessage(userMessage.content, history);

      if (response.accessDenied) {
        const errorMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: response.reply,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
        setAccessInfo(prev => prev ? { ...prev, canUse: false, remaining: 0 } : null);
      } else {
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: response.reply,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);

        // Update access info
        setAccessInfo(prev => prev ? {
          ...prev,
          remaining: response.remaining,
          used: response.used
        } : null);
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: "Désolé, une erreur s'est produite. Veuillez réessayer.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!accessInfo?.canUse || isLoading) return;

    setIsLoading(true);

    const requestMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: '🎯 Génère-moi un mini quiz !',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, requestMessage]);

    try {
      const response = await generateMiniQuiz('general', 'medium');

      // Start the quiz
      setActiveQuiz({
        quiz: response.quiz,
        currentQuestion: 0,
        score: 0
      });

      const quizMessage: Message = {
        id: `quiz-${Date.now()}`,
        role: 'assistant',
        content: `🎯 **${response.quiz.title}**\n\nQuestion 1/${response.quiz.questions.length}:\n\n**${response.quiz.questions[0].question}**`,
        timestamp: new Date(),
        isQuiz: true,
        quiz: response.quiz
      };
      setMessages(prev => [...prev, quizMessage]);

      // Update access info
      setAccessInfo(prev => prev ? {
        ...prev,
        remaining: response.remaining,
        used: response.used
      } : null);
    } catch (error) {
      console.error('Error generating quiz:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le quiz",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuizAnswer = (answerIndex: number) => {
    if (!activeQuiz) return;

    const currentQ = activeQuiz.quiz.questions[activeQuiz.currentQuestion];
    const isCorrect = answerIndex === currentQ.correctAnswer;
    const newScore = isCorrect ? activeQuiz.score + 1 : activeQuiz.score;

    // Add answer feedback
    const feedbackMessage: Message = {
      id: `feedback-${Date.now()}`,
      role: 'assistant',
      content: isCorrect
        ? `✅ Correct ! ${currentQ.explanation}`
        : `❌ Incorrect. La bonne réponse était : **${currentQ.options[currentQ.correctAnswer]}**\n\n${currentQ.explanation}`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, feedbackMessage]);

    // Check if more questions
    if (activeQuiz.currentQuestion < activeQuiz.quiz.questions.length - 1) {
      // Next question
      const nextIndex = activeQuiz.currentQuestion + 1;
      const nextQ = activeQuiz.quiz.questions[nextIndex];

      setTimeout(() => {
        const nextMessage: Message = {
          id: `question-${Date.now()}`,
          role: 'assistant',
          content: `Question ${nextIndex + 1}/${activeQuiz.quiz.questions.length}:\n\n**${nextQ.question}**`,
          timestamp: new Date(),
          isQuiz: true,
          quiz: activeQuiz.quiz
        };
        setMessages(prev => [...prev, nextMessage]);
        setActiveQuiz({ ...activeQuiz, currentQuestion: nextIndex, score: newScore });
      }, 1000);
    } else {
      // Quiz complete
      setTimeout(() => {
        const finalScore = newScore;
        const total = activeQuiz.quiz.questions.length;
        const percentage = Math.round((finalScore / total) * 100);

        let emoji = '🎉';
        let comment = 'Excellent travail !';
        if (percentage < 50) {
          emoji = '💪';
          comment = 'Continuez à pratiquer !';
        } else if (percentage < 80) {
          emoji = '👍';
          comment = 'Bon travail !';
        }

        const resultMessage: Message = {
          id: `result-${Date.now()}`,
          role: 'assistant',
          content: `${emoji} **Quiz terminé !**\n\nVotre score : **${finalScore}/${total}** (${percentage}%)\n\n${comment}\n\nVoulez-vous un autre quiz ?`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, resultMessage]);
        setActiveQuiz(null);
      }, 1000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatLimit = (limit: number) => {
    return limit === -1 ? '∞' : limit.toString();
  };

  // Don't render if not authenticated
  if (!isAuthenticated) return null;

  // Don't render for ADMIN and COMMERCIAL users
  if (user?.role === 'ADMIN' || user?.role === 'COMMERCIAL') return null;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${isOpen
            ? 'bg-destructive hover:bg-destructive/90 rotate-90'
            : 'bg-primary hover:bg-primary/90 animate-pulse hover:animate-none'
          }`}
        aria-label={isOpen ? 'Fermer le chat' : 'Ouvrir le chat'}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-primary-foreground" />
        ) : (
          <MessageCircle className="w-6 h-6 text-primary-foreground" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] h-[500px] max-h-[calc(100vh-150px)] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <CardHeader className="py-3 px-4 border-b bg-primary/5 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">Assistant IA</CardTitle>
                  <p className="text-xs text-muted-foreground">BCLT Academy</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsOpen(false)}
              >
                <ChevronDown className="h-5 w-5" />
              </Button>
            </div>

            {/* Usage indicator */}
            {!loadingAccess && accessInfo && (
              <div className={`mt-2 flex items-center gap-2 text-xs ${accessInfo.canUse ? 'text-green-600' : 'text-orange-600'}`}>
                <Target className="w-3 h-3" />
                <span>
                  {accessInfo.limit === -1
                    ? 'Accès illimité'
                    : `${accessInfo.remaining}/${formatLimit(accessInfo.limit)} messages restants`
                  }
                </span>
                {accessInfo.planName && (
                  <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                    {accessInfo.planName}
                  </Badge>
                )}
              </div>
            )}
          </CardHeader>

          {/* Messages */}
          <ScrollArea className="flex-1 px-4 py-3">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${message.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'bg-muted rounded-bl-sm'
                      }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                    {/* Quiz options */}
                    {message.isQuiz && activeQuiz && (message.id.includes('quiz-') || message.id.includes('question-')) ? (
                      <div className="mt-3 space-y-2">
                        {activeQuiz.quiz.questions[activeQuiz.currentQuestion].options.map((option, idx) => (
                          <Button
                            key={idx}
                            variant="outline"
                            size="sm"
                            className="w-full justify-start text-left h-auto py-2 px-3"
                            onClick={() => handleQuizAnswer(idx)}
                          >
                            <span className="font-semibold mr-2">{String.fromCharCode(65 + idx)}.</span>
                            {option}
                          </Button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">En train d'écrire...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-3 border-t bg-background flex-shrink-0">
            {/* Quick actions */}
            <div className="flex gap-2 mb-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={handleGenerateQuiz}
                disabled={isLoading || !accessInfo?.canUse || !!activeQuiz}
              >
                <Sparkles className="w-3 h-3 mr-1" />
                Mini Quiz
              </Button>
            </div>

            {/* Message input */}
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={accessInfo?.canUse ? "Écrivez votre message..." : "Limite atteinte"}
                disabled={isLoading || !accessInfo?.canUse || !!activeQuiz}
                className="flex-1"
              />
              <Button
                size="icon"
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim() || !accessInfo?.canUse || !!activeQuiz}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Access denied message */}
            {accessInfo && !accessInfo.canUse && (
              <div className="mt-2 flex items-center gap-2 text-xs text-orange-600">
                <AlertCircle className="w-3 h-3" />
                <span>{accessInfo.message}</span>
              </div>
            )}
          </div>
        </Card>
      )}
    </>
  );
}

export default Chatbot;
