import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import {
  GraduationCap, Briefcase, BookOpen, Building, Stethoscope, Scale,
  Check, ArrowRight, ArrowLeft, BookOpenCheck, Users, Globe, Baby,
  FileText, MessageSquare, Mail, UserCheck, Brain, Target, Loader2
} from "lucide-react";

// ==================== INTERFACES ====================

interface QuestionOption {
  value: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

interface Question {
  id: string;
  title: string;
  description: string;
  field: string;
  options: QuestionOption[];
}

interface LevelTestQuestion {
  questionIndex: number;
  questionText: string;
  questionType: "QCM" | "OPEN";
  category: "GRAMMAIRE" | "CONJUGAISON" | "VOCABULAIRE";
  difficulty: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  options: string[] | null;
  correctAnswer: string;
  hint?: string;
  explanation?: string;
}

interface LevelTestAnswer {
  questionIndex: number;
  questionText: string;
  questionType: string;
  category: string;
  difficulty: string;
  userAnswer: string;
  correctAnswer: string;
  options: string[] | null;
}

interface LevelTestResult {
  determinedLevel: string;
  determinedLevelLabel: string;
  levelDescription: string;
  correctAnswers: number;
  totalQuestions: number;
  successPercentage: number;
  strengths: string;
  weaknesses: string;
  recommendations: string;
  internalLevel: string;
}

// ==================== QUESTION DEFINITIONS ====================

// Question 1: Profile Type (determines the path)
const profileTypeQuestion: Question = {
  id: "profileType",
  title: "Quel est votre profil ?",
  description: "Cela déterminera le parcours adapté à vos besoins",
  field: "profileType",
  options: [
    {
      value: "STUDENT",
      label: "Étudiant",
      icon: <GraduationCap className="w-8 h-8" />,
      description: "Je suis étudiant(e) ou je prépare des examens"
    },
    {
      value: "PROFESSIONAL",
      label: "Professionnel",
      icon: <Briefcase className="w-8 h-8" />,
      description: "J'utilise le français pour mon travail"
    },
    {
      value: "PROFESSOR",
      label: "Professeur",
      icon: <BookOpenCheck className="w-8 h-8" />,
      description: "J'enseigne en utilisant le français"
    },
    {
      value: "TCF",
      label: "Préparation TCF",
      icon: <FileText className="w-8 h-8" />,
      description: "Je prépare le Test de Connaissance du Français"
    }
  ]
};

// Student Path Questions (without level - will come from AI test)
const studentQuestions: Question[] = [
  {
    id: "educationLevel",
    title: "Quel est votre niveau d'études ?",
    description: "Nous adapterons le contenu à votre parcours scolaire",
    field: "educationLevel",
    options: [
      {
        value: "COLLEGE",
        label: "Collège",
        icon: <span className="text-2xl">📚</span>,
        description: "Classes de 6ème à 3ème"
      },
      {
        value: "LYCEE",
        label: "Lycée",
        icon: <span className="text-2xl">🎓</span>,
        description: "Classes de 2nde à Terminale"
      },
      {
        value: "UNIVERSITE",
        label: "Université / Études supérieures",
        icon: <span className="text-2xl">🏛️</span>,
        description: "Études post-bac"
      }
    ]
  },
  {
    id: "studentObjective",
    title: "Quel est votre objectif principal ?",
    description: "Nous personnaliserons les exercices en conséquence",
    field: "studentObjective",
    options: [
      {
        value: "EXAMS",
        label: "Réussir mes examens scolaires",
        icon: <GraduationCap className="w-8 h-8" />,
        description: "Brevet, Bac, partiels, concours"
      },
      {
        value: "TCF_DELF",
        label: "Préparation TCF/DELF",
        icon: <FileText className="w-8 h-8" />,
        description: "Certifications officielles"
      },
      {
        value: "GENERAL",
        label: "Améliorer mon niveau général",
        icon: <BookOpen className="w-8 h-8" />,
        description: "Progression globale en français"
      }
    ]
  }
];

// Professional Path Questions (without level)
const professionalQuestions: Question[] = [
  {
    id: "sectorInterest",
    title: "Quel est votre secteur d'activité ?",
    description: "Nous utiliserons du vocabulaire spécialisé",
    field: "sectorInterest",
    options: [
      {
        value: "COMMERCE",
        label: "Commerce / Business",
        icon: <Briefcase className="w-8 h-8" />,
        description: "Ventes, marketing, négociation"
      },
      {
        value: "TOURISM",
        label: "Tourisme / Hôtellerie",
        icon: <Globe className="w-8 h-8" />,
        description: "Accueil, voyages, restauration"
      },
      {
        value: "MEDICAL",
        label: "Médical / Santé",
        icon: <Stethoscope className="w-8 h-8" />,
        description: "Soins, consultations, santé"
      },
      {
        value: "LEGAL",
        label: "Juridique / Administratif",
        icon: <Scale className="w-8 h-8" />,
        description: "Droit, procédures, documents"
      },
      {
        value: "OTHER",
        label: "Autre secteur",
        icon: <Building className="w-8 h-8" />,
        description: "Un autre domaine professionnel"
      }
    ]
  },
  {
    id: "usageContext",
    title: "Dans quel contexte utilisez-vous le français ?",
    description: "Nous adapterons les scénarios de pratique",
    field: "usageContext",
    options: [
      {
        value: "MEETINGS",
        label: "Réunions et présentations",
        icon: <Users className="w-8 h-8" />,
        description: "Exposés, conférences, discussions"
      },
      {
        value: "EMAILS",
        label: "Emails et correspondance",
        icon: <Mail className="w-8 h-8" />,
        description: "Communication écrite professionnelle"
      },
      {
        value: "CLIENTS",
        label: "Accueil clients",
        icon: <UserCheck className="w-8 h-8" />,
        description: "Service client, vente, conseil"
      },
      {
        value: "GENERAL",
        label: "Usage général",
        icon: <MessageSquare className="w-8 h-8" />,
        description: "Un peu de tout"
      }
    ]
  }
];

// Professor Path Questions (without level)
const professorQuestions: Question[] = [
  {
    id: "teachingType",
    title: "Quel type d'enseignement exercez-vous ?",
    description: "Nous adapterons les ressources pédagogiques",
    field: "teachingType",
    options: [
      {
        value: "MATERNELLE",
        label: "Maternelle / Primaire",
        icon: <Baby className="w-8 h-8" />,
        description: "Enseignement aux jeunes enfants"
      },
      {
        value: "FRENCH_TEACHER",
        label: "Professeur de français",
        icon: <BookOpenCheck className="w-8 h-8" />,
        description: "FLE ou français langue maternelle"
      },
      {
        value: "MATH_TEACHER",
        label: "Professeur de mathématiques",
        icon: <span className="text-2xl">➗</span>,
        description: "Mathématiques enseignées en français"
      },
      {
        value: "PHYSICS_TEACHER",
        label: "Professeur de physique-chimie",
        icon: <span className="text-2xl">⚛️</span>,
        description: "Physique-chimie enseignée en français"
      },
      {
        value: "SVT_TEACHER",
        label: "Professeur de SVT",
        icon: <span className="text-2xl">🧬</span>,
        description: "Sciences de la Vie et de la Terre en français"
      }
    ]
  },
  {
    id: "teachingLevel",
    title: "À quel niveau enseignez-vous ?",
    description: "Pour adapter le niveau des ressources",
    field: "teachingLevel",
    options: [
      {
        value: "PRIMAIRE",
        label: "Primaire",
        icon: <span className="text-2xl">📚</span>,
        description: "CP à CM2"
      },
      {
        value: "COLLEGE",
        label: "Collège",
        icon: <span className="text-2xl">📖</span>,
        description: "6ème à 3ème"
      },
      {
        value: "LYCEE",
        label: "Lycée",
        icon: <span className="text-2xl">🎓</span>,
        description: "2nde à Terminale"
      },
      {
        value: "UNIVERSITE",
        label: "Université / Adultes",
        icon: <span className="text-2xl">🏛️</span>,
        description: "Enseignement supérieur ou formation continue"
      }
    ]
  },
  {
    id: "professorNeed",
    title: "Quel est votre besoin principal ?",
    description: "Nous personnaliserons votre expérience",
    field: "professorNeed",
    options: [
      {
        value: "EXERCISES",
        label: "Créer des exercices pédagogiques",
        icon: <FileText className="w-8 h-8" />,
        description: "Générer des quiz et activités pour mes élèves"
      },
      {
        value: "IMPROVE_FRENCH",
        label: "Améliorer mon français professionnel",
        icon: <BookOpen className="w-8 h-8" />,
        description: "Perfectionner ma maîtrise de la langue"
      },
      {
        value: "RESOURCES",
        label: "Ressources pour mes cours",
        icon: <GraduationCap className="w-8 h-8" />,
        description: "Trouver du contenu pour enrichir mes leçons"
      }
    ]
  }
];

// TCF has no additional questions - goes straight to level test

// ==================== ANSWERS INTERFACE ====================

interface Answers {
  profileType: string;
  // Student fields
  educationLevel: string;
  studentObjective: string;
  // Professional fields
  sectorInterest: string;
  usageContext: string;
  // Professor fields
  teachingType: string;
  teachingLevel: string;
  professorNeed: string;
  // Level from AI test
  currentLevel: string;
}

// ==================== COMPONENT ====================

const OrientationTest = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Main state
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [answers, setAnswers] = useState<Answers>({
    profileType: "",
    educationLevel: "",
    studentObjective: "",
    sectorInterest: "",
    usageContext: "",
    teachingType: "",
    teachingLevel: "",
    professorNeed: "",
    currentLevel: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const hasCheckedStatusRef = useRef(false);

  // Level Test State
  const [showLevelTest, setShowLevelTest] = useState(false);
  const [levelTestQuestions, setLevelTestQuestions] = useState<LevelTestQuestion[]>([]);
  const [levelTestAnswers, setLevelTestAnswers] = useState<LevelTestAnswer[]>([]);
  const [currentLevelQuestion, setCurrentLevelQuestion] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isLoadingLevelTest, setIsLoadingLevelTest] = useState(false);
  const [levelTestResult, setLevelTestResult] = useState<LevelTestResult | null>(null);
  const [isEvaluatingLevel, setIsEvaluatingLevel] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result, setResult] = useState<any | null>(() => {
    const savedResult = sessionStorage.getItem('orientationResult');
    if (savedResult) {
      try {
        return JSON.parse(savedResult);
      } catch {
        return null;
      }
    }
    return null;
  });

  // Get questions based on selected profile type (WITHOUT currentLevel question)
  const getQuestionsForPath = (): Question[] => {
    const pathQuestions = {
      STUDENT: studentQuestions,
      PROFESSIONAL: professionalQuestions,
      PROFESSOR: professorQuestions,
      TCF: [] // TCF goes straight to level test
    };
    return [profileTypeQuestion, ...(pathQuestions[answers.profileType as keyof typeof pathQuestions] || [])];
  };

  const questions = getQuestionsForPath();
  const totalQuestions = answers.profileType ? questions.length : 1;
  const currentQuestion = questions[currentStep];
  const progress = showLevelTest
    ? ((currentLevelQuestion + 1) / (levelTestQuestions.length || 1)) * 100
    : ((currentStep + 1) / totalQuestions) * 100;

  // Check status on mount
  useEffect(() => {
    const safetyTimeout = setTimeout(() => {
      if (isLoading) {
        console.log('⚠️ Safety timeout triggered - forcing test to display');
        setIsLoading(false);
      }
    }, 3000);

    if (hasCheckedStatusRef.current) {
      setIsLoading(false);
      clearTimeout(safetyTimeout);
      return;
    }
    hasCheckedStatusRef.current = true;

    if (result) {
      setIsLoading(false);
      clearTimeout(safetyTimeout);
      return;
    }

    const orientationCompleted = sessionStorage.getItem('orientationCompleted');
    if (orientationCompleted === 'true') {
      navigate('/courses', { state: { fromOrientationTest: true }, replace: true });
      clearTimeout(safetyTimeout);
      return;
    }

    const checkStatus = async () => {
      try {
        const response = await api.get('/orientation-test/status');
        if (response.data.completed) {
          sessionStorage.setItem('orientationCompleted', 'true');
          navigate('/courses', { state: { fromOrientationTest: true }, replace: true });
          return;
        }
      } catch (error) {
        console.error('Failed to check orientation status:', error);
      } finally {
        setIsLoading(false);
        clearTimeout(safetyTimeout);
      }
    };

    checkStatus();

    return () => clearTimeout(safetyTimeout);
  }, [navigate, result]);

  // Start the level test
  const startLevelTest = async () => {
    setIsLoadingLevelTest(true);
    try {
      const response = await api.get('/orientation-test/level-test/start');
      setLevelTestQuestions(response.data);
      setLevelTestAnswers([]);
      setCurrentLevelQuestion(0);
      setCurrentAnswer("");
      setShowLevelTest(true);
      toast({
        title: "Test de niveau",
        description: "20 questions pour évaluer votre niveau de français"
      });
    } catch (error) {
      console.error('Failed to start level test:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger le test. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingLevelTest(false);
    }
  };

  // Handle answer for level test question
  const handleLevelTestAnswer = (answer: string) => {
    const question = levelTestQuestions[currentLevelQuestion];

    const newAnswer: LevelTestAnswer = {
      questionIndex: question.questionIndex,
      questionText: question.questionText,
      questionType: question.questionType,
      category: question.category,
      difficulty: question.difficulty,
      userAnswer: answer,
      correctAnswer: question.correctAnswer,
      options: question.options
    };

    setLevelTestAnswers(prev => [...prev, newAnswer]);
    setCurrentAnswer("");

    if (currentLevelQuestion < levelTestQuestions.length - 1) {
      setCurrentLevelQuestion(prev => prev + 1);
    } else {
      // All questions answered, submit for evaluation
      submitLevelTest([...levelTestAnswers, newAnswer]);
    }
  };

  // Submit all level test answers at once
  const submitLevelTest = async (allAnswers: LevelTestAnswer[]) => {
    setIsEvaluatingLevel(true);
    try {
      const response = await api.post('/orientation-test/level-test/submit', {
        answers: allAnswers
      });

      setLevelTestResult(response.data);

      // Update the answers with the determined level
      setAnswers(prev => ({
        ...prev,
        currentLevel: response.data.internalLevel
      }));

      toast({
        title: "Test terminé !",
        description: `Votre niveau: ${response.data.determinedLevelLabel}`
      });
    } catch (error) {
      console.error('Failed to evaluate level test:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de l'évaluation. Niveau par défaut attribué.",
        variant: "destructive"
      });
      // Fallback to intermediate
      setAnswers(prev => ({
        ...prev,
        currentLevel: "INTERMEDIATE"
      }));
      setLevelTestResult({
        determinedLevel: "B1",
        determinedLevelLabel: "Intermédiaire (B1)",
        levelDescription: "Niveau intermédiaire par défaut",
        correctAnswers: 0,
        totalQuestions: allAnswers.length,
        successPercentage: 0,
        strengths: "",
        weaknesses: "",
        recommendations: "",
        internalLevel: "INTERMEDIATE"
      });
    } finally {
      setIsEvaluatingLevel(false);
    }
  };

  // Continue after level test to complete orientation
  const completeOrientationAfterLevelTest = async () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      const response = await api.post("/orientation-test/submit", answers);

      sessionStorage.setItem('orientationCompleted', 'true');
      sessionStorage.setItem('orientationResult', JSON.stringify(response.data));

      setResult(response.data);
      toast({
        title: "Test terminé !",
        description: "Votre profil d'apprentissage a été déterminé"
      });
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite. Veuillez réessayer.",
        variant: "destructive"
      });
      isSubmittingRef.current = false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelect = (value: string) => {
    const field = currentQuestion.field;
    setAnswers(prev => ({
      ...prev,
      [field]: value
    }));

    if (field === "profileType") {
      setAnswers(prev => ({
        ...prev,
        profileType: value,
        educationLevel: "",
        studentObjective: "",
        sectorInterest: "",
        usageContext: "",
        teachingType: "",
        teachingLevel: "",
        professorNeed: "",
        currentLevel: ""
      }));
    }
  };

  const handleNext = () => {
    if (isSubmitting || isSubmittingRef.current) {
      return;
    }

    const currentField = currentQuestion.field as keyof Answers;
    if (!answers[currentField]) {
      toast({
        title: "Sélection requise",
        description: "Veuillez choisir une option pour continuer",
        variant: "destructive"
      });
      return;
    }

    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Last question of the path - start level test
      startLevelTest();
    }
  };

  const handleBack = () => {
    if (showLevelTest) {
      if (currentLevelQuestion > 0 && !levelTestResult) {
        setCurrentLevelQuestion(prev => prev - 1);
        setLevelTestAnswers(prev => prev.slice(0, -1));
        setCurrentAnswer("");
      } else if (currentLevelQuestion === 0) {
        setShowLevelTest(false);
        setLevelTestQuestions([]);
        setLevelTestAnswers([]);
      }
    } else if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleContinue = () => {
    navigate("/courses", { state: { fromOrientationTest: true }, replace: true });
  };

  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Final result screen
  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Félicitations !</CardTitle>
            <CardDescription>Votre profil d'apprentissage a été déterminé</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white text-center">
              <p className="text-sm opacity-90 mb-2">Votre profil</p>
              <h2 className="text-3xl font-bold mb-2">{result.learnerTypeLabel}</h2>
              <p className="text-sm opacity-90">{result.profileTypeLabel || result.learnerType}</p>
            </div>

            <p className="text-gray-600 text-center">
              {result.learnerTypeDescription}
            </p>

            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Récapitulatif de vos choix
              </h4>
              <div className="grid gap-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-500 text-sm">Profil</span>
                  <span className="font-medium text-gray-800">{result.profileTypeLabel || answers.profileType}</span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-500 text-sm">Niveau évalué par l'IA</span>
                  <span className="font-medium text-gray-800 flex items-center gap-2">
                    <Brain className="w-4 h-4 text-purple-600" />
                    {result.currentLevelLabel || answers.currentLevel}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Ce que cela signifie :
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Exercices adaptés à votre niveau réel</li>
                <li>• Quiz IA personnalisés selon votre profil</li>
                <li>• Progression optimisée pour vos besoins</li>
              </ul>
            </div>

            <Button
              onClick={handleContinue}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              Continuer vers le tableau de bord
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Level Test Result Screen (before submitting orientation)
  if (levelTestResult && !result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-2xl">Test de niveau terminé !</CardTitle>
            <CardDescription>Voici les résultats de votre évaluation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-6 text-white text-center">
              <p className="text-sm opacity-90 mb-2">Votre niveau CECR</p>
              <h2 className="text-4xl font-bold mb-2">{levelTestResult.determinedLevel}</h2>
              <p className="text-lg">{levelTestResult.determinedLevelLabel}</p>
            </div>

            <p className="text-gray-600 text-center">
              {levelTestResult.levelDescription}
            </p>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-2xl font-bold text-blue-600">{levelTestResult.correctAnswers}</p>
                <p className="text-sm text-gray-500">Bonnes réponses</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-2xl font-bold text-purple-600">{levelTestResult.totalQuestions}</p>
                <p className="text-sm text-gray-500">Questions</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-2xl font-bold text-green-600">{Math.round(levelTestResult.successPercentage)}%</p>
                <p className="text-sm text-gray-500">Réussite</p>
              </div>
            </div>

            {levelTestResult.strengths && (
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-medium mb-2 text-green-800">✓ Points forts</h4>
                <p className="text-sm text-green-700">{levelTestResult.strengths}</p>
              </div>
            )}

            {levelTestResult.weaknesses && (
              <div className="bg-orange-50 rounded-lg p-4">
                <h4 className="font-medium mb-2 text-orange-800">⚡ À améliorer</h4>
                <p className="text-sm text-orange-700">{levelTestResult.weaknesses}</p>
              </div>
            )}

            {levelTestResult.recommendations && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium mb-2 text-blue-800">💡 Recommandations</h4>
                <p className="text-sm text-blue-700">{levelTestResult.recommendations}</p>
              </div>
            )}

            <Button
              onClick={completeOrientationAfterLevelTest}
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  Finalisation...
                </>
              ) : (
                <>
                  Continuer
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Level Test Question Screen
  if (showLevelTest && levelTestQuestions.length > 0 && !levelTestResult) {
    const question = levelTestQuestions[currentLevelQuestion];
    const levelProgress = ((currentLevelQuestion + 1) / levelTestQuestions.length) * 100;

    if (isEvaluatingLevel) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardContent className="py-16 text-center">
              <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Analyse en cours...</h2>
              <p className="text-gray-600 mb-6">L'IA évalue vos réponses pour déterminer votre niveau</p>
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-600" />
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                <span className="text-sm text-gray-500">
                  Test de niveau - Question {currentLevelQuestion + 1} sur {levelTestQuestions.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${question.category === "GRAMMAIRE" ? "bg-blue-100 text-blue-700" :
                    question.category === "CONJUGAISON" ? "bg-green-100 text-green-700" :
                      "bg-purple-100 text-purple-700"
                  }`}>
                  {question.category}
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                  {question.difficulty}
                </span>
              </div>
            </div>
            <Progress value={levelProgress} className="h-2 mb-6" />
            <CardTitle className="text-xl md:text-2xl">{question.questionText}</CardTitle>
            {question.hint && (
              <CardDescription className="mt-2">💡 {question.hint}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {question.questionType === "QCM" && question.options ? (
              <div className="grid gap-3">
                {question.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleLevelTestAnswer(option)}
                    className="p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                  >
                    <span className="font-medium">{String.fromCharCode(65 + idx)}.</span> {option}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <Input
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder="Tapez votre réponse..."
                  className="text-lg p-4"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && currentAnswer.trim()) {
                      handleLevelTestAnswer(currentAnswer.trim());
                    }
                  }}
                />
                <Button
                  onClick={() => handleLevelTestAnswer(currentAnswer.trim())}
                  disabled={!currentAnswer.trim()}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600"
                >
                  Valider
                  <Check className="ml-2 w-4 h-4" />
                </Button>
              </div>
            )}

            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentLevelQuestion === 0}
              >
                <ArrowLeft className="mr-2 w-4 h-4" />
                Retour
              </Button>
              <span className="text-sm text-gray-500 self-center">
                {Math.round(levelProgress)}% complété
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading level test screen
  if (isLoadingLevelTest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="py-16 text-center">
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
              <Brain className="w-10 h-10 text-white animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Préparation du test de niveau</h2>
            <p className="text-gray-600 mb-6">L'IA génère 20 questions adaptées pour évaluer votre niveau...</p>
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-600" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main orientation question screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500">
              Question {currentStep + 1} sur {totalQuestions}
            </span>
            <span className="text-sm font-medium text-blue-600">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-2 mb-6" />
          <CardTitle className="text-xl md:text-2xl">{currentQuestion.title}</CardTitle>
          <CardDescription>{currentQuestion.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={`grid gap-3 ${currentQuestion.options.length <= 3 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
            {currentQuestion.options.map((option) => {
              const isSelected = answers[currentQuestion.field as keyof Answers] === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`p-4 rounded-lg border-2 transition-all text-left relative ${isSelected
                    ? "border-blue-500 bg-blue-50 shadow-md"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 ${isSelected ? "text-blue-600" : "text-gray-400"}`}>
                      {option.icon}
                    </div>
                    <div>
                      <h3 className={`font-medium ${isSelected ? "text-blue-700" : "text-gray-800"}`}>
                        {option.label}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">{option.description}</p>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <Check className="w-5 h-5 text-blue-500" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              Retour
            </Button>
            <Button
              onClick={handleNext}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              {currentStep === questions.length - 1 ? (
                <>
                  <Brain className="mr-2 w-4 h-4" />
                  Passer le test de niveau
                </>
              ) : (
                <>
                  Suivant
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrientationTest;
