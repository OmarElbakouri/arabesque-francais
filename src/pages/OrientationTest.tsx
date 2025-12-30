import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import {
  GraduationCap, Briefcase, BookOpen, Building, Stethoscope, Scale,
  Check, ArrowRight, ArrowLeft, BookOpenCheck, Users, Globe, Baby,
  Microscope, FileText, MessageSquare, Mail, UserCheck
} from "lucide-react";

// ==================== QUESTION DEFINITIONS ====================

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

// Student Path Questions
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
  },
  {
    id: "currentLevel",
    title: "Quel est votre niveau actuel en français ?",
    description: "Nous ajusterons la difficulté des exercices",
    field: "currentLevel",
    options: [
      {
        value: "BEGINNER",
        label: "Débutant",
        icon: <span className="text-2xl font-bold">A1-A2</span>,
        description: "Je connais les bases, vocabulaire limité"
      },
      {
        value: "INTERMEDIATE",
        label: "Intermédiaire",
        icon: <span className="text-2xl font-bold">B1-B2</span>,
        description: "Je peux tenir une conversation"
      },
      {
        value: "ADVANCED",
        label: "Avancé",
        icon: <span className="text-2xl font-bold">C1-C2</span>,
        description: "Je suis à l'aise dans la plupart des situations"
      }
    ]
  }
];

// Professional Path Questions
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
  },
  {
    id: "currentLevel",
    title: "Quel est votre niveau actuel en français ?",
    description: "Nous ajusterons la difficulté des exercices",
    field: "currentLevel",
    options: [
      {
        value: "BEGINNER",
        label: "Débutant",
        icon: <span className="text-2xl font-bold">A1-A2</span>,
        description: "Je connais les bases, vocabulaire limité"
      },
      {
        value: "INTERMEDIATE",
        label: "Intermédiaire",
        icon: <span className="text-2xl font-bold">B1-B2</span>,
        description: "Je peux tenir une conversation"
      },
      {
        value: "ADVANCED",
        label: "Avancé",
        icon: <span className="text-2xl font-bold">C1-C2</span>,
        description: "Je suis à l'aise dans la plupart des situations"
      }
    ]
  }
];

// Professor Path Questions
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

// TCF Path Questions
const tcfQuestions: Question[] = [
  {
    id: "currentLevel",
    title: "Quel est votre niveau actuel en français ?",
    description: "Nous calibrerons la difficulté des exercices TCF",
    field: "currentLevel",
    options: [
      {
        value: "BEGINNER",
        label: "Débutant",
        icon: <span className="text-2xl font-bold">A1-A2</span>,
        description: "Je vise un score A1-A2 au TCF"
      },
      {
        value: "INTERMEDIATE",
        label: "Intermédiaire",
        icon: <span className="text-2xl font-bold">B1-B2</span>,
        description: "Je vise un score B1-B2 au TCF"
      },
      {
        value: "ADVANCED",
        label: "Avancé",
        icon: <span className="text-2xl font-bold">C1-C2</span>,
        description: "Je vise un score C1-C2 au TCF"
      }
    ]
  }
];

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
  // Common fields
  currentLevel: string;
}

// ==================== COMPONENT ====================

const OrientationTest = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
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

  // Get questions based on selected profile type
  const getQuestionsForPath = (): Question[] => {
    const pathQuestions = {
      STUDENT: studentQuestions,
      PROFESSIONAL: professionalQuestions,
      PROFESSOR: professorQuestions,
      TCF: tcfQuestions
    };
    return [profileTypeQuestion, ...(pathQuestions[answers.profileType as keyof typeof pathQuestions] || [])];
  };

  const questions = getQuestionsForPath();
  const totalQuestions = answers.profileType ? questions.length : 1;
  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / totalQuestions) * 100;

  // Simplified check on mount - ProtectedRoute already handles the main status check
  // This just handles the case where user has a cached result or needs to show the test
  useEffect(() => {
    // Prevent multiple checks
    if (hasCheckedStatusRef.current) {
      setIsLoading(false);
      return;
    }
    hasCheckedStatusRef.current = true;

    // If we have a cached result, show it
    if (result) {
      setIsLoading(false);
      return;
    }

    // Check sessionStorage first (fast path set by ProtectedRoute)
    const orientationCompleted = sessionStorage.getItem('orientationCompleted');
    if (orientationCompleted === 'true') {
      // Already completed, redirect to courses
      navigate('/courses', { state: { fromOrientationTest: true }, replace: true });
      return;
    }

    // Make a single API call with proper error handling and guaranteed loading state update
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
        // On error, just show the test - user can take it
      } finally {
        // CRITICAL: Always set loading to false, even on error or redirect
        setIsLoading(false);
      }
    };

    checkStatus();
  }, [navigate, result]);

  const handleSelect = (value: string) => {
    const field = currentQuestion.field;
    setAnswers(prev => ({
      ...prev,
      [field]: value
    }));

    // If selecting profile type, reset path-specific answers
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
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (isSubmittingRef.current) {
      return;
    }
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

  // Result screen
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

            {/* Detailed choices overview */}
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

                {/* Path-specific fields */}
                {answers.profileType === "STUDENT" && (
                  <>
                    <div className="flex items-center justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-500 text-sm">Niveau d'études</span>
                      <span className="font-medium text-gray-800">{result.educationLevelLabel || answers.educationLevel}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-500 text-sm">Objectif</span>
                      <span className="font-medium text-gray-800">{result.studentObjectiveLabel || answers.studentObjective}</span>
                    </div>
                  </>
                )}

                {answers.profileType === "PROFESSIONAL" && (
                  <>
                    <div className="flex items-center justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-500 text-sm">Secteur d'activité</span>
                      <span className="font-medium text-gray-800">{result.sectorInterestLabel || answers.sectorInterest}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-500 text-sm">Contexte d'utilisation</span>
                      <span className="font-medium text-gray-800">{result.usageContextLabel || answers.usageContext}</span>
                    </div>
                  </>
                )}

                {answers.profileType === "PROFESSOR" && (
                  <>
                    <div className="flex items-center justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-500 text-sm">Type d'enseignement</span>
                      <span className="font-medium text-gray-800">{result.teachingTypeLabel || answers.teachingType}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-500 text-sm">Niveau enseigné</span>
                      <span className="font-medium text-gray-800">{result.teachingLevelLabel || answers.teachingLevel}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-500 text-sm">Besoin principal</span>
                      <span className="font-medium text-gray-800">{result.professorNeedLabel || answers.professorNeed}</span>
                    </div>
                  </>
                )}

                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-500 text-sm">Niveau actuel</span>
                  <span className="font-medium text-gray-800">{result.currentLevelLabel || answers.currentLevel}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium mb-2">Ce que cela signifie :</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {result.learnerType === "STUDENT" && (
                  <li>• Quiz IA avec exercices académiques adaptés à votre niveau</li>
                )}
                {result.learnerType === "PROFESSIONAL" && (
                  <li>• Quiz IA avec situations professionnelles réalistes</li>
                )}
                {result.learnerType === "TEACHER" && (
                  <li>• Quiz IA avec ressources pédagogiques et techniques d'enseignement</li>
                )}
                {result.learnerType === "TCF_CANDIDATE" && (
                  <li>• Quiz IA avec exercices de préparation au TCF</li>
                )}

                {/* Level-specific content */}
                {result.currentLevel === "BEGINNER" && (
                  <li>• Progression adaptée niveau débutant (A1-A2)</li>
                )}
                {result.currentLevel === "INTERMEDIATE" && (
                  <li>• Exercices intermédiaires pour consolider vos acquis (B1-B2)</li>
                )}
                {result.currentLevel === "ADVANCED" && (
                  <li>• Défis avancés pour perfectionner votre maîtrise (C1-C2)</li>
                )}
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

  // Question screen
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
              {isSubmitting ? (
                "Analyse en cours..."
              ) : currentStep === questions.length - 1 ? (
                <>
                  Terminer
                  <Check className="ml-2 w-4 h-4" />
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
