import api from '@/lib/api';

// ============================================
// TYPES
// ============================================

export type DifficultyLevel = 'DEBUTANT' | 'INTERMEDIAIRE' | 'AVANCE' | 'FACILE' | 'MOYEN' | 'DIFFICILE';

export interface VoiceQuizQuestion {
  id: number;
  questionIndex?: number;
  question: string; // The question asked by the AI
  sentenceWithBlank?: string; // Legacy field, kept for compatibility
  hint: string;
  grammarPoint: string;
  difficultyLevel: DifficultyLevel;
  audioBase64?: string | null;
  audioData?: string | null; // Backend uses this name
}

export interface VoiceQuizSessionResponse {
  sessionId: number;
  totalQuestions: number;
  currentQuestionIndex: number;
  question: VoiceQuizQuestion;
}

export interface VoiceQuizStartRequest {
  thematicGroup: number;    // REQUIRED: 1-6
  chapterNumber?: number;
}

export interface SubmitAnswerResponse {
  sessionId: number;
  questionId: number;
  transcribedText: string;
  expectedSentence: string;
  isCorrect: boolean;
  isPartiallyCorrect: boolean;
  confidenceScore: number;
  feedbackText: string;
  feedbackAudioBase64?: string | null;
  explanation: string;
  grammarPoint: string;
  errors: string[];
  correctedSentence?: string | null;
  currentQuestionIndex: number;
  totalQuestions: number;
  correctSoFar: number;
  isLastQuestion: boolean;
  nextQuestion?: VoiceQuizQuestion | null;
}

export interface QuestionResult {
  questionId: number;
  sentence: string;
  userResponse: string;
  isCorrect: boolean;
  isPartiallyCorrect?: boolean;
  feedback: string;
}

export interface SessionSummary {
  sessionId: number;
  totalQuestions: number;
  correctCount: number;
  partiallyCorrectCount: number;
  incorrectCount: number;
  scorePercentage: number;
  questionResults: QuestionResult[];
  weakGrammarPoints: string[];
  summaryText: string;
  summaryAudioBase64?: string | null;
  recommendations: string[];
  completedAt: string;
  timeSpentSeconds: number;
}

// ============================================
// MOCK MODE
// ============================================

const MOCK_MODE = false;

const mockQuestions: VoiceQuizQuestion[] = [
  {
    id: 1,
    sentenceWithBlank: "Je ___ au marché hier.",
    hint: "Verbe aller au passé composé",
    grammarPoint: "Passé composé avec être",
    difficultyLevel: "INTERMEDIAIRE",
    audioBase64: null
  },
  {
    id: 2,
    sentenceWithBlank: "Elle ___ très fatiguée ce matin.",
    hint: "Verbe être au présent",
    grammarPoint: "Conjugaison être",
    difficultyLevel: "DEBUTANT",
    audioBase64: null
  },
  {
    id: 3,
    sentenceWithBlank: "Nous ___ beaucoup de chance.",
    hint: "Verbe avoir au présent",
    grammarPoint: "Conjugaison avoir",
    difficultyLevel: "DEBUTANT",
    audioBase64: null
  },
  {
    id: 4,
    sentenceWithBlank: "Ils ___ arrivés en retard.",
    hint: "Verbe être au passé composé",
    grammarPoint: "Passé composé avec être",
    difficultyLevel: "INTERMEDIAIRE",
    audioBase64: null
  },
  {
    id: 5,
    sentenceWithBlank: "Tu ___ faire attention.",
    hint: "Verbe devoir au présent",
    grammarPoint: "Verbes modaux",
    difficultyLevel: "INTERMEDIAIRE",
    audioBase64: null
  },
  {
    id: 6,
    sentenceWithBlank: "Il faut que je ___ mes devoirs.",
    hint: "Verbe faire au subjonctif",
    grammarPoint: "Subjonctif présent",
    difficultyLevel: "AVANCE",
    audioBase64: null
  },
  {
    id: 7,
    sentenceWithBlank: "Vous ___ français couramment.",
    hint: "Verbe parler au présent",
    grammarPoint: "Conjugaison -er",
    difficultyLevel: "DEBUTANT",
    audioBase64: null
  },
  {
    id: 8,
    sentenceWithBlank: "Marie ___ partie sans dire au revoir.",
    hint: "Verbe être au passé composé",
    grammarPoint: "Accord du participe passé",
    difficultyLevel: "AVANCE",
    audioBase64: null
  },
  {
    id: 9,
    sentenceWithBlank: "Je ne ___ pas où il habite.",
    hint: "Verbe savoir au présent",
    grammarPoint: "Négation",
    difficultyLevel: "INTERMEDIAIRE",
    audioBase64: null
  },
  {
    id: 10,
    sentenceWithBlank: "Les enfants ___ dans le jardin.",
    hint: "Verbe jouer au présent",
    grammarPoint: "Conjugaison -er",
    difficultyLevel: "DEBUTANT",
    audioBase64: null
  }
];

const mockCorrectAnswers: Record<number, string> = {
  1: "Je suis allé au marché hier.",
  2: "Elle est très fatiguée ce matin.",
  3: "Nous avons beaucoup de chance.",
  4: "Ils sont arrivés en retard.",
  5: "Tu dois faire attention.",
  6: "Il faut que je fasse mes devoirs.",
  7: "Vous parlez français couramment.",
  8: "Marie est partie sans dire au revoir.",
  9: "Je ne sais pas où il habite.",
  10: "Les enfants jouent dans le jardin."
};

const simulateDelay = (ms: number = 1000) =>
  new Promise(resolve => setTimeout(resolve, ms));

// ============================================
// SERVICE FUNCTIONS
// ============================================

let mockSessionState = {
  sessionId: 0,
  currentIndex: 0,
  correctCount: 0,
  partiallyCorrectCount: 0,
  results: [] as QuestionResult[],
  startTime: Date.now()
};

export async function startVoiceQuizSession(
  request: VoiceQuizStartRequest
): Promise<VoiceQuizSessionResponse> {
  if (MOCK_MODE) {
    await simulateDelay(800);
    
    // Reset mock session state
    mockSessionState = {
      sessionId: Date.now(),
      currentIndex: 0,
      correctCount: 0,
      partiallyCorrectCount: 0,
      results: [],
      startTime: Date.now()
    };
    
    return {
      sessionId: mockSessionState.sessionId,
      totalQuestions: mockQuestions.length,
      currentQuestionIndex: 1,
      question: mockQuestions[0]
    };
  }

  const response = await api.post('/voice-quiz/start', request);
  const apiResponse = response.data;
  
  console.log('Voice Quiz API response:', apiResponse);
  
  // Check if API call was successful
  if (!apiResponse.success) {
    throw new Error(apiResponse.message || 'Failed to start voice quiz');
  }
  
  // Extract from ApiResponse wrapper
  const data = apiResponse.data;
  
  console.log('Voice Quiz data:', data);
  console.log('Voice Quiz currentQuestion:', data.currentQuestion);
  
  // Map backend response to frontend interface
  // Backend returns: currentQuestion, allQuestions, totalQuestions, etc.
  const mappedResponse: VoiceQuizSessionResponse = {
    sessionId: data.sessionId,
    totalQuestions: data.totalQuestions || data.allQuestions?.length || 10,
    currentQuestionIndex: data.currentQuestionIndex || 0,
    question: data.currentQuestion ? {
      id: data.currentQuestion.id ?? 0,
      question: data.currentQuestion.question || data.currentQuestion.sentenceWithBlank || '',
      sentenceWithBlank: data.currentQuestion.sentenceWithBlank,
      hint: data.currentQuestion.hint || '',
      grammarPoint: data.currentQuestion.grammarPoint || '',
      difficultyLevel: data.currentQuestion.difficultyLevel || 'DEBUTANT',
      audioBase64: data.currentQuestion.audioData || data.currentQuestion.audioBase64
    } : data.allQuestions?.[0]
  };
  
  console.log('Mapped voice quiz response:', mappedResponse);
  
  return mappedResponse;
}

// Convert Blob to Base64
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      // Remove the data URL prefix (e.g., "data:audio/webm;base64,")
      const base64Data = base64.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function submitVoiceAnswer(
  sessionId: number,
  questionId: number,
  audioBlob: Blob,
  audioFormat: string = 'webm'
): Promise<SubmitAnswerResponse> {
  if (MOCK_MODE) {
    await simulateDelay(2000); // Simulate transcription time
    
    const currentQuestion = mockQuestions[mockSessionState.currentIndex];
    const correctAnswer = mockCorrectAnswers[currentQuestion.id];
    
    // Simulate random correctness for demo
    const random = Math.random();
    const isCorrect = random > 0.4;
    const isPartiallyCorrect = !isCorrect && random > 0.2;
    
    if (isCorrect) mockSessionState.correctCount++;
    if (isPartiallyCorrect) mockSessionState.partiallyCorrectCount++;
    
    // Store result
    mockSessionState.results.push({
      questionId: currentQuestion.id,
      sentence: correctAnswer,
      userResponse: isCorrect ? correctAnswer : "Transcription simulée...",
      isCorrect,
      isPartiallyCorrect,
      feedback: isCorrect 
        ? "Excellent ! Votre prononciation est parfaite."
        : isPartiallyCorrect 
          ? "Presque parfait ! Petite erreur de prononciation."
          : "Réessayez. La réponse correcte est affichée ci-dessous."
    });
    
    const isLast = mockSessionState.currentIndex >= mockQuestions.length - 1;
    mockSessionState.currentIndex++;
    
    const nextQuestion = isLast ? null : mockQuestions[mockSessionState.currentIndex];
    
    return {
      sessionId,
      questionId: currentQuestion.id,
      transcribedText: isCorrect ? correctAnswer : "Transcription simulée...",
      expectedSentence: correctAnswer,
      isCorrect,
      isPartiallyCorrect,
      confidenceScore: isCorrect ? 0.95 : 0.65,
      feedbackText: isCorrect 
        ? "Excellent ! Votre prononciation est parfaite."
        : isPartiallyCorrect 
          ? "Presque parfait ! Petite erreur de prononciation."
          : "Réessayez. Voici la réponse correcte.",
      feedbackAudioBase64: null,
      explanation: `${currentQuestion.grammarPoint}: ${currentQuestion.hint}`,
      grammarPoint: currentQuestion.grammarPoint,
      errors: isCorrect ? [] : ["Erreur de conjugaison"],
      correctedSentence: isCorrect ? null : correctAnswer,
      currentQuestionIndex: mockSessionState.currentIndex + 1,
      totalQuestions: mockQuestions.length,
      correctSoFar: mockSessionState.correctCount,
      isLastQuestion: isLast,
      nextQuestion
    };
  }

  // Convert blob to base64
  const audioBase64 = await blobToBase64(audioBlob);

  const response = await api.post('/voice-quiz/submit-answer', {
    sessionId,
    questionId,
    audioBase64,
    audioFormat
  });
  
  const apiResponse = response.data;
  
  console.log('Voice Quiz submit response:', apiResponse);
  
  // Check if API call was successful
  if (!apiResponse.success) {
    throw new Error(apiResponse.message || 'Failed to submit voice answer');
  }
  
  // Extract from ApiResponse wrapper
  const data = apiResponse.data;
  
  console.log('Voice Quiz submit data:', data);
  console.log('isCorrect:', data.isCorrect, 'correct:', data.correct);
  
  // Map nextQuestion if present
  const nextQuestion = data.nextQuestion ? {
    id: data.nextQuestion.id,
    question: data.nextQuestion.question, // Map question field
    sentenceWithBlank: data.nextQuestion.sentenceWithBlank,
    hint: data.nextQuestion.hint,
    grammarPoint: data.nextQuestion.grammarPoint,
    difficultyLevel: data.nextQuestion.difficultyLevel || 'DEBUTANT',
    audioBase64: data.nextQuestion.audioData || data.nextQuestion.audioBase64
  } : null;
  
  // Return mapped response, ensuring isCorrect is properly set
  return {
    sessionId: data.sessionId,
    questionId: data.questionId,
    transcribedText: data.transcribedText,
    expectedSentence: data.expectedSentence,
    isCorrect: data.isCorrect === true || data.correct === true,
    isPartiallyCorrect: data.isPartiallyCorrect === true || data.partiallyCorrect === true,
    confidenceScore: data.confidenceScore || 0,
    feedbackText: data.feedbackText || data.feedback || '',
    feedbackAudioBase64: data.feedbackAudioBase64 || data.feedbackAudio || null,
    explanation: data.explanation || '',
    grammarPoint: data.grammarPoint || '',
    errors: data.errors || [],
    correctedSentence: data.correctedSentence || null,
    currentQuestionIndex: data.currentQuestionIndex || 0,
    totalQuestions: data.totalQuestions || 10,
    correctSoFar: data.correctSoFar || data.correctCount || 0,
    isLastQuestion: data.isLastQuestion || data.isCompleted || false,
    nextQuestion
  };
}

export async function getSessionSummary(sessionId: number): Promise<SessionSummary> {
  if (MOCK_MODE) {
    await simulateDelay(800);
    
    const incorrectCount = mockQuestions.length - mockSessionState.correctCount - mockSessionState.partiallyCorrectCount;
    const score = Math.round(
      ((mockSessionState.correctCount + mockSessionState.partiallyCorrectCount * 0.5) / mockQuestions.length) * 100
    );
    
    return {
      sessionId,
      totalQuestions: mockQuestions.length,
      correctCount: mockSessionState.correctCount,
      partiallyCorrectCount: mockSessionState.partiallyCorrectCount,
      incorrectCount,
      scorePercentage: score,
      questionResults: mockSessionState.results,
      weakGrammarPoints: ["Subjonctif présent", "Accord du participe passé"],
      summaryText: score >= 80 
        ? "Bravo ! Excellente performance. Continuez comme ça !"
        : score >= 60
          ? "Bon travail ! Quelques points à réviser."
          : "Continuez à pratiquer, vous progressez !",
      summaryAudioBase64: null,
      recommendations: [
        "Révisez la conjugaison des verbes irréguliers",
        "Pratiquez le passé composé avec être"
      ],
      completedAt: new Date().toISOString(),
      timeSpentSeconds: Math.floor((Date.now() - mockSessionState.startTime) / 1000)
    };
  }

  const response = await api.get(`/voice-quiz/session/${sessionId}/summary`);
  const apiResponse = response.data;
  
  console.log('Voice Quiz summary response:', apiResponse);
  
  // Check if API call was successful
  if (!apiResponse.success) {
    throw new Error(apiResponse.message || 'Failed to get session summary');
  }
  
  // Extract from ApiResponse wrapper
  return apiResponse.data;
}

// ============================================
// PLAN LIMITS - Check Voice Quiz access
// ============================================

export interface VoiceQuizAccessInfo {
  canUse: boolean;
  remaining: number;  // -1 = unlimited
  limit: number;      // -1 = unlimited
  used: number;
  maxMinutes: number;
  ttsEnabled: boolean;
  message?: string;
  planName?: string;
}

export async function checkVoiceQuizAccess(): Promise<VoiceQuizAccessInfo> {
  if (MOCK_MODE) {
    return {
      canUse: true,
      remaining: -1,
      limit: -1,
      used: 0,
      maxMinutes: 15,
      ttsEnabled: true,
      planName: 'VIP'
    };
  }
  
  try {
    const response = await api.get('/voice-quiz/access');
    if (response.data?.success) {
      return response.data.data;
    }
    return {
      canUse: false,
      remaining: 0,
      limit: 0,
      used: 0,
      maxMinutes: 0,
      ttsEnabled: false,
      message: 'Impossible de vérifier l\'accès'
    };
  } catch (error: any) {
    console.error('Error checking Voice Quiz access:', error);
    return {
      canUse: false,
      remaining: 0,
      limit: 0,
      used: 0,
      maxMinutes: 0,
      ttsEnabled: false,
      message: error.response?.data?.message || 'Erreur de vérification'
    };
  }
}

// ============================================
// AUDIO UTILITIES
// ============================================

export function playBase64Audio(base64Audio: string): HTMLAudioElement {
  const audio = new Audio(`data:audio/mpeg;base64,${base64Audio}`);
  audio.play();
  return audio;
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
