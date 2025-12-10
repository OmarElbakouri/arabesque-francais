import api from '@/lib/api';

// Enable mock mode for testing without backend
const MOCK_MODE = false;

// ============================================
// NEW TYPES FROM BACKEND SPEC
// ============================================

export type QuestionType = 
  | 'CHOIX_MULTIPLE'       // Multiple choice
  | 'VRAI_FAUX'            // True/False  
  | 'TEXTE_A_TROUS'        // Fill in the blanks
  | 'CONJUGAISON'          // Verb conjugation
  | 'CORRECTION_GRAMMATICALE' // Grammar correction
  | 'COMPLETION_PHRASE'    // Complete the sentence
  | 'ECRITURE_LIBRE'       // Free writing
  | 'VOCABULAIRE'          // Vocabulary
  | 'REORGANISER_MOTS';    // Rearrange words

// Backend question DTO structure
export interface QuestionDTO {
  id: string;
  questionIndex?: number;
  isStatic?: boolean;            // false for AI-generated
  text: string;                  // Mapped from questionText
  questionText?: string;         // Original backend field
  type: QuestionType;
  questionType?: QuestionType;   // Original backend field
  options: string[] | null;      // For multiple choice questions
  correctAnswer?: string;        // For display after answering
  requiresTyping: boolean;       // true = text input, false = choices
  hint?: string;                 // Hint for typed questions
  maxLength?: number;            // Max characters for typed input
  explanation?: string;          // Explanation after answer
  grammarPoint?: string;
  difficultyLevel?: 'FACILE' | 'MOYEN' | 'DIFFICILE';
  contexte?: string;
  chapterNumber?: number;
  thematicGroup?: number;
}

export interface CorrectionDTO {
  questionId: string;
  questionIndex?: number;        // Numeric index (0, 1, 2...) matching answers Map
  isCorrect: boolean;
  isPartiallyCorrect: boolean;   // For nearly-correct typed answers
  suggestedAnswer: string;       // Correct answer to show
  tip: string;                   // Learning tip
  userAnswer?: string;           // User's submitted answer
}

export interface QuizStartRequest {
  thematicGroup: number;           // REQUIRED: 1-6 (corresponding to course groups)
  specificChapters?: number[];     // Optional: specific chapters to focus on
  resumeSessionId?: string | null; // Optional: to resume a session
}

export interface AnswerSubmission {
  questionId: string;
  answer: string;
}

export interface QuizSessionDTO {
  sessionId: string | number;
  questions: QuestionDTO[];
  thematicGroup: number;
  totalQuestions?: number;
  resumedFromSaved?: boolean;
  generatedAt?: string;
}

export interface QuizResultDTO {
  sessionId: string;
  totalQuestions: number;
  correctAnswers: number;
  partiallyCorrect: number;
  score: number;
  corrections: CorrectionDTO[];
  completedAt: string;
}

// ============================================
// MOCK DATA - Mixed question types
// ============================================

const mockMixedQuestions: QuestionDTO[] = [
  // CHOIX_MULTIPLE - Multiple choice
  {
    id: 'q1',
    text: 'Quelle est la conjugaison correcte de "être" à la première personne du singulier ?',
    type: 'CHOIX_MULTIPLE',
    options: ['Je suis', 'Je es', 'Je sont', 'Je sommes'],
    correctAnswer: 'Je suis',
    requiresTyping: false,
    explanation: '"Suis" est la forme conjuguée de "être" pour "je".'
  },
  {
    id: 'q2',
    text: 'Comment dit-on "We are happy" en français ?',
    type: 'CHOIX_MULTIPLE',
    options: ['Nous sommes contents', 'Nous avons contents', 'Nous êtes contents', 'Nous sont contents'],
    correctAnswer: 'Nous sommes contents',
    requiresTyping: false,
    explanation: '"Sommes" est la forme de "être" pour "nous".'
  },
  
  // VRAI_FAUX - True/False
  {
    id: 'q3',
    text: '"Il a faim" utilise le verbe "avoir" correctement.',
    type: 'VRAI_FAUX',
    options: ['Vrai', 'Faux'],
    correctAnswer: 'Vrai',
    requiresTyping: false,
    explanation: 'On dit "avoir faim" en français (to be hungry).'
  },
  {
    id: 'q4',
    text: '"Elles sont 20 ans" est une phrase correcte.',
    type: 'VRAI_FAUX',
    options: ['Vrai', 'Faux'],
    correctAnswer: 'Faux',
    requiresTyping: false,
    explanation: 'On dit "avoir X ans" en français. La phrase correcte est "Elles ont 20 ans".'
  },

  // CONJUGAISON - Verb conjugation (typed)
  {
    id: 'q5',
    text: 'Conjuguez le verbe "être" avec le sujet "tu":',
    type: 'CONJUGAISON',
    options: null,
    correctAnswer: 'tu es',
    requiresTyping: true,
    hint: 'Exemple: je suis, il est...',
    maxLength: 50,
    explanation: '"Es" est la forme de "être" pour "tu".'
  },
  {
    id: 'q6',
    text: 'Conjuguez "avoir" avec "nous" au présent:',
    type: 'CONJUGAISON',
    options: null,
    correctAnswer: 'nous avons',
    requiresTyping: true,
    hint: 'Format: sujet + verbe conjugué',
    maxLength: 50,
    explanation: '"Avons" est la forme de "avoir" pour "nous".'
  },

  // TEXTE_A_TROUS - Fill in the blank (typed)
  {
    id: 'q7',
    text: 'Complétez: "Ils ___ très fatigués après le match."',
    type: 'TEXTE_A_TROUS',
    options: null,
    correctAnswer: 'sont',
    requiresTyping: true,
    hint: 'Verbe être au présent avec "ils"',
    maxLength: 20,
    explanation: '"Sont" est la forme de "être" pour "ils/elles".'
  },
  {
    id: 'q8',
    text: 'Complétez: "Elle ___ une belle maison."',
    type: 'TEXTE_A_TROUS',
    options: null,
    correctAnswer: 'a',
    requiresTyping: true,
    hint: 'Verbe avoir au présent avec "elle"',
    maxLength: 20,
    explanation: '"A" est la forme de "avoir" pour "il/elle".'
  },

  // COMPLETION_PHRASE - Complete the sentence (typed)
  {
    id: 'q9',
    text: 'Complétez cette phrase: "Je suis ___" (profession ou adjectif)',
    type: 'COMPLETION_PHRASE',
    options: null,
    correctAnswer: 'étudiant',
    requiresTyping: true,
    hint: 'Exemple: médecin, heureux, français...',
    maxLength: 50,
    explanation: 'Plusieurs réponses sont possibles avec "Je suis + adjectif/profession".'
  },

  // CORRECTION_GRAMMATICALE - Grammar correction (typed)
  {
    id: 'q10',
    text: 'Corrigez cette phrase: "Il sont content de vous voir."',
    type: 'CORRECTION_GRAMMATICALE',
    options: null,
    correctAnswer: 'Il est content de vous voir.',
    requiresTyping: true,
    hint: 'Vérifiez l\'accord du verbe avec le sujet',
    maxLength: 100,
    explanation: '"Il" est singulier, donc on utilise "est" pas "sont".'
  },

  // VOCABULAIRE - Vocabulary (mixed)
  {
    id: 'q11',
    text: 'Quel est le synonyme de "content" ?',
    type: 'VOCABULAIRE',
    options: ['Heureux', 'Triste', 'Fatigué', 'Malade'],
    correctAnswer: 'Heureux',
    requiresTyping: false,
    explanation: '"Content" et "heureux" signifient tous deux "happy".'
  },
  {
    id: 'q12',
    text: 'Traduisez "I am cold" en français:',
    type: 'VOCABULAIRE',
    options: null,
    correctAnswer: "J'ai froid",
    requiresTyping: true,
    hint: 'Attention: en français on utilise "avoir" pas "être"',
    maxLength: 50,
    explanation: 'En français, on dit "avoir froid" (to have cold), pas "être froid".'
  },

  // REORGANISER_MOTS - Rearrange words (typed)
  {
    id: 'q13',
    text: 'Réorganisez les mots: "sommes / Nous / en France / heureux"',
    type: 'REORGANISER_MOTS',
    options: null,
    correctAnswer: 'Nous sommes heureux en France',
    requiresTyping: true,
    hint: 'Sujet + Verbe + Adjectif + Complément',
    maxLength: 100,
    explanation: 'L\'ordre standard en français: Sujet + Verbe + Complément.'
  },

  // More CHOIX_MULTIPLE for variety
  {
    id: 'q14',
    text: 'Quelle phrase utilise "avoir" correctement ?',
    type: 'CHOIX_MULTIPLE',
    options: ['J\'ai soif', 'Je suis soif', 'J\'ai soiffé', 'Je suis soiffé'],
    correctAnswer: 'J\'ai soif',
    requiresTyping: false,
    explanation: 'En français, on dit "avoir soif" (to be thirsty).'
  },
  {
    id: 'q15',
    text: 'Complétez: Vous ___ très gentils.',
    type: 'CHOIX_MULTIPLE',
    options: ['êtes', 'avez', 'sont', 'sommes'],
    correctAnswer: 'êtes',
    requiresTyping: false,
    explanation: '"Êtes" est la forme de "être" pour "vous".'
  }
];

// ============================================
// SERVICE FUNCTIONS
// ============================================

const simulateDelay = (ms: number = 800) => 
  new Promise(resolve => setTimeout(resolve, ms));

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Normalize text for comparison (handle accents, case, spacing)
function normalizeAnswer(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accent marks for comparison
    .replace(/\s+/g, ' '); // Normalize whitespace
}

// Check if answer is close enough (for partial credit)
function isPartiallyCorrect(userAnswer: string, correctAnswer: string): boolean {
  const userNorm = normalizeAnswer(userAnswer);
  const correctNorm = normalizeAnswer(correctAnswer);
  
  // Exact match
  if (userNorm === correctNorm) return false; // Not partial, it's correct
  
  // Check Levenshtein distance for small typos
  const distance = levenshteinDistance(userNorm, correctNorm);
  const maxLength = Math.max(userNorm.length, correctNorm.length);
  const similarity = 1 - (distance / maxLength);
  
  // 80% similarity or more = partially correct
  return similarity >= 0.8;
}

// Levenshtein distance for fuzzy matching
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
}

// Start a quiz session
export async function startQuizSession(
  thematicGroup: number,
  specificChapters?: number[],
  resumeSessionId?: string | null
): Promise<QuizSessionDTO> {
  if (MOCK_MODE) {
    await simulateDelay(1000);
    
    // Shuffle and pick questions
    const shuffled = shuffleArray(mockMixedQuestions);
    const selected = shuffled.slice(0, Math.min(10, shuffled.length));
    
    // Shuffle options for multiple choice questions
    const questionsWithShuffledOptions = selected.map(q => ({
      ...q,
      options: q.options ? shuffleArray(q.options) : null
    }));
    
    return {
      sessionId: `session_${Date.now()}`,
      questions: questionsWithShuffledOptions,
      thematicGroup,
      generatedAt: new Date().toISOString()
    };
  }
  
  const request: QuizStartRequest = {
    thematicGroup,
    ...(specificChapters && specificChapters.length > 0 && { specificChapters }),
    ...(resumeSessionId && { resumeSessionId })
  };
  
  console.log('Starting quiz with request:', request);
  
  const response = await api.post('/quiz/start', request);
  const apiResponse = response.data;  // { success, message, data }
  
  console.log('Quiz API response:', apiResponse);
  
  // Check if API call was successful
  if (!apiResponse.success) {
    throw new Error(apiResponse.message || 'Failed to start quiz');
  }
  
  // Extract the actual quiz data from the ApiResponse wrapper
  const quizData = apiResponse.data;  // { sessionId, questions, thematicGroup, ... }
  
  console.log('Quiz data extracted:', quizData);
  
  // Map backend response to frontend DTO structure
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mappedQuestions: QuestionDTO[] = (quizData.questions || []).map((q: any, index: number) => ({
    id: q.id?.toString() || `q_${index}`,
    questionIndex: q.questionIndex ?? index,
    isStatic: q.isStatic ?? false,
    text: q.questionText || q.text || '',
    type: q.questionType || q.type || 'CHOIX_MULTIPLE',
    options: q.options || null,
    correctAnswer: q.correctAnswer,
    requiresTyping: q.requiresTyping ?? false,
    hint: q.hint,
    maxLength: q.maxLength,
    grammarPoint: q.grammarPoint,
    difficultyLevel: q.difficultyLevel,
    contexte: q.contexte,
    chapterNumber: q.chapterNumber,
    thematicGroup: q.thematicGroup
  }));
  
  const result: QuizSessionDTO = {
    sessionId: quizData.sessionId?.toString() || `session_${Date.now()}`,
    questions: mappedQuestions,
    thematicGroup: quizData.thematicGroup,
    totalQuestions: quizData.totalQuestions || mappedQuestions.length,
    resumedFromSaved: quizData.resumedFromSaved
  };
  
  console.log('Mapped quiz session:', result);
  
  return result;
}

// Submit quiz answers
export async function submitQuizAnswers(
  sessionId: string | number,
  answers: string[],  // Array of answer strings in order
  timeSpentSeconds: number
): Promise<QuizResultDTO> {
  if (MOCK_MODE) {
    await simulateDelay(1500);
    
    let correctCount = 0;
    let partialCount = 0;
    
    const corrections: CorrectionDTO[] = answers.map((answer, index) => {
      const question = mockMixedQuestions[index];
      if (!question) {
        return {
          questionId: `q_${index}`,
          isCorrect: false,
          isPartiallyCorrect: false,
          suggestedAnswer: 'Question non trouvée',
          tip: ''
        };
      }
      
      const userAnswer = answer.trim();
      const correctAnswer = question.correctAnswer;
      
      // For typed questions, use normalized comparison
      let isCorrect = false;
      let isPartial = false;
      
      if (question.requiresTyping) {
        const userNorm = normalizeAnswer(userAnswer);
        const correctNorm = normalizeAnswer(correctAnswer);
        isCorrect = userNorm === correctNorm;
        
        if (!isCorrect) {
          isPartial = isPartiallyCorrect(userAnswer, correctAnswer);
        }
      } else {
        // For multiple choice, exact match
        isCorrect = userAnswer === correctAnswer;
      }
      
      if (isCorrect) correctCount++;
      if (isPartial) partialCount++;
      
      // Generate helpful tips based on question type
      let tip = question.explanation || '';
      if (!isCorrect && !isPartial) {
        switch (question.type) {
          case 'CONJUGAISON':
            tip = `Révisez la conjugaison du verbe. ${tip}`;
            break;
          case 'TEXTE_A_TROUS':
            tip = `Relisez la phrase et identifiez le temps et le sujet. ${tip}`;
            break;
          case 'CORRECTION_GRAMMATICALE':
            tip = `Vérifiez l'accord sujet-verbe et les accords en genre/nombre. ${tip}`;
            break;
          default:
            tip = tip || 'Révisez cette notion dans le cours.';
        }
      }
      
      return {
        questionId: question.id,
        isCorrect,
        isPartiallyCorrect: isPartial,
        suggestedAnswer: correctAnswer,
        tip
      };
    });
    
    // Calculate score: full points for correct, half for partial
    const totalQuestions = answers.length;
    const score = Math.round(((correctCount + (partialCount * 0.5)) / totalQuestions) * 100);
    
    return {
      sessionId,
      totalQuestions,
      correctAnswers: correctCount,
      partiallyCorrect: partialCount,
      score,
      corrections,
      completedAt: new Date().toISOString()
    };
  }
  
  const submitPayload = {
    sessionId: typeof sessionId === 'string' ? parseInt(sessionId, 10) : sessionId,
    answers: answers,  // Array of answer strings
    timeSpentSeconds: timeSpentSeconds
  };
  
  console.log('Submitting quiz answers:', submitPayload);
  
  const response = await api.post('/quiz/submit', submitPayload);
  const apiResponse = response.data;
  
  console.log('Quiz submit response:', apiResponse);
  
  // Check if API call was successful
  if (!apiResponse.success) {
    throw new Error(apiResponse.message || 'Failed to submit quiz');
  }
  
  // Extract from ApiResponse wrapper and map to frontend DTO
  const data = apiResponse.data;
  
  return {
    sessionId: data.sessionId?.toString() || sessionId.toString(),
    totalQuestions: data.totalQuestions || answers.length,
    correctAnswers: data.correctCount || 0,
    partiallyCorrect: data.partiallyCorrectCount || 0,
    score: data.scorePercentage || 0,
    corrections: (data.corrections || []).map((c: { questionIndex: number; isCorrect: boolean; isPartiallyCorrect?: boolean; correctAnswer: string; tip?: string; userAnswer?: string }, index: number) => ({
      questionId: `q_${c.questionIndex ?? index}`,
      questionIndex: c.questionIndex ?? index,
      isCorrect: c.isCorrect,
      isPartiallyCorrect: c.isPartiallyCorrect || false,
      suggestedAnswer: c.correctAnswer,
      tip: c.tip || '',
      userAnswer: c.userAnswer || answers[c.questionIndex ?? index] || ''
    })),
    completedAt: new Date().toISOString()
  };
}

// Get quiz history for a chapter
export async function getChapterQuizHistory(chapterId: number): Promise<QuizResultDTO[]> {
  if (MOCK_MODE) {
    await simulateDelay(500);
    // Return empty history in mock mode
    return [];
  }
  
  const response = await api.get(`/quiz/history/chapter/${chapterId}`);
  return response.data;
}

// Get user's overall quiz statistics
export async function getQuizStatistics(): Promise<{
  totalAttempts: number;
  averageScore: number;
  bestScore: number;
  questionsAnswered: number;
  correctAnswers: number;
}> {
  if (MOCK_MODE) {
    await simulateDelay(500);
    return {
      totalAttempts: 0,
      averageScore: 0,
      bestScore: 0,
      questionsAnswered: 0,
      correctAnswers: 0
    };
  }
  
  const response = await api.get('/quiz/statistics');
  return response.data;
}

// ============================================
// PLAN LIMITS - Check Quiz IA access
// ============================================

export interface QuizAccessInfo {
  canUse: boolean;
  remaining: number;  // -1 = unlimited
  limit: number;      // -1 = unlimited
  used: number;
  message?: string;
  planName?: string;
}

export async function checkQuizIaAccess(): Promise<QuizAccessInfo> {
  if (MOCK_MODE) {
    return {
      canUse: true,
      remaining: -1,
      limit: -1,
      used: 0,
      planName: 'VIP'
    };
  }
  
  try {
    const response = await api.get('/quiz/access');
    if (response.data?.success) {
      return response.data.data;
    }
    return {
      canUse: false,
      remaining: 0,
      limit: 0,
      used: 0,
      message: 'Impossible de vérifier l\'accès'
    };
  } catch (error: any) {
    console.error('Error checking Quiz IA access:', error);
    return {
      canUse: false,
      remaining: 0,
      limit: 0,
      used: 0,
      message: error.response?.data?.message || 'Erreur de vérification'
    };
  }
}
