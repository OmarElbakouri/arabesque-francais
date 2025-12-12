import api from '@/lib/api';

// Enable mock mode for testing without backend
const MOCK_MODE = false;

// ============================================
// TYPES
// ============================================

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export interface ChatbotAccessInfo {
  canUse: boolean;
  remaining: number;
  limit: number;
  used: number;
  planName?: string;
  message?: string;
  aiAccessExpired?: boolean;
  daysRemaining?: number;
}

export interface ChatResponse {
  reply: string;
  status: string;
  remaining: number;
  limit: number;
  used: number;
  accessDenied?: boolean;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface MiniQuiz {
  title: string;
  questions: QuizQuestion[];
}

export interface MiniQuizResponse {
  quiz: MiniQuiz;
  remaining: number;
  limit: number;
  used: number;
}

export interface ChatbotStatus {
  available: boolean;
  model: string;
  provider: string;
  features: string[];
}

// ============================================
// MOCK DATA
// ============================================

const mockAccessInfo: ChatbotAccessInfo = {
  canUse: true,
  remaining: -1,
  limit: -1,
  used: 0,
  planName: 'VIP',
  message: 'Accès illimité'
};

const mockChatResponses = [
  "Bonjour ! Je suis l'assistant de BCLT Academy. Comment puis-je vous aider aujourd'hui ?",
  "Je suis là pour vous aider à apprendre le français. N'hésitez pas à me poser des questions !",
  "C'est une excellente question ! La conjugaison en français peut sembler complexe, mais avec de la pratique, ça devient plus facile.",
  "Pour accéder aux cours, rendez-vous dans la section 'Mes cours' depuis le tableau de bord."
];

const mockMiniQuiz: MiniQuiz = {
  title: "Quiz de Français",
  questions: [
    {
      question: "Quel est le pluriel de 'cheval' ?",
      options: ["chevals", "chevaux", "chevales", "chevauxs"],
      correctAnswer: 1,
      explanation: "Les mots en -al font leur pluriel en -aux (sauf exceptions)."
    },
    {
      question: "Conjuguez 'être' à la première personne du singulier au présent:",
      options: ["es", "suis", "est", "sommes"],
      correctAnswer: 1,
      explanation: "Je suis, tu es, il/elle est..."
    },
    {
      question: "Quel article défini utilise-t-on devant 'maison' ?",
      options: ["le", "la", "les", "l'"],
      correctAnswer: 1,
      explanation: "'Maison' est un nom féminin singulier, on utilise donc 'la'."
    }
  ]
};

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Check if user can access the chatbot based on plan limits
 */
export async function checkChatbotAccess(): Promise<ChatbotAccessInfo> {
  if (MOCK_MODE) {
    return mockAccessInfo;
  }
  
  try {
    const response = await api.get('/chatbot/access');
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
    console.error('Error checking chatbot access:', error);
    return {
      canUse: false,
      remaining: 0,
      limit: 0,
      used: 0,
      message: error.response?.data?.message || 'Erreur de vérification'
    };
  }
}

/**
 * Send a message to the chatbot
 */
export async function sendChatMessage(
  message: string,
  conversationHistory: ChatMessage[]
): Promise<ChatResponse> {
  if (MOCK_MODE) {
    // Simulate response delay
    await new Promise(resolve => setTimeout(resolve, 500));
    const randomResponse = mockChatResponses[Math.floor(Math.random() * mockChatResponses.length)];
    return {
      reply: randomResponse,
      status: 'success',
      remaining: -1,
      limit: -1,
      used: 0
    };
  }
  
  try {
    const response = await api.post('/chatbot/message', {
      message,
      conversationHistory: conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    });
    
    if (response.data?.success) {
      return response.data.data;
    }
    
    throw new Error(response.data?.message || 'Erreur de communication');
  } catch (error: any) {
    console.error('Error sending chat message:', error);
    
    // Check if access denied
    if (error.response?.status === 403) {
      const data = error.response.data?.data;
      return {
        reply: data?.reply || error.response.data?.message || 'Limite atteinte',
        status: 'error',
        remaining: data?.remaining || 0,
        limit: data?.limit || 0,
        used: 0,
        accessDenied: true
      };
    }
    
    throw error;
  }
}

/**
 * Generate a mini quiz
 */
export async function generateMiniQuiz(
  topic: 'conjugation' | 'vocabulary' | 'grammar' | 'expressions' | 'general' = 'general',
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): Promise<MiniQuizResponse> {
  if (MOCK_MODE) {
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      quiz: mockMiniQuiz,
      remaining: -1,
      limit: -1,
      used: 0
    };
  }
  
  try {
    const response = await api.post('/chatbot/mini-quiz', {
      topic,
      difficulty
    });
    
    if (response.data?.success) {
      return response.data.data;
    }
    
    throw new Error(response.data?.message || 'Erreur de génération');
  } catch (error: any) {
    console.error('Error generating mini quiz:', error);
    throw error;
  }
}

/**
 * Get chatbot status
 */
export async function getChatbotStatus(): Promise<ChatbotStatus> {
  if (MOCK_MODE) {
    return {
      available: true,
      model: 'llama-3.3-70b-versatile',
      provider: 'Groq',
      features: [
        'Réponses aux questions sur la plateforme',
        'Aide avec le français',
        'Mini quiz interactifs',
        'Conseils d\'apprentissage'
      ]
    };
  }
  
  try {
    const response = await api.get('/chatbot/status');
    if (response.data?.success) {
      return response.data.data;
    }
    return {
      available: false,
      model: '',
      provider: '',
      features: []
    };
  } catch (error) {
    console.error('Error getting chatbot status:', error);
    return {
      available: false,
      model: '',
      provider: '',
      features: []
    };
  }
}
