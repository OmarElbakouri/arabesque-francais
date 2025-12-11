import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { GraduationCap, Briefcase, Plane, BookOpen, Users, Globe, Building, Stethoscope, Scale, Check, ArrowRight, ArrowLeft } from "lucide-react";

interface Question {
  id: number;
  title: string;
  description: string;
  field: string;
  options: {
    value: string;
    label: string;
    icon: React.ReactNode;
    description: string;
  }[];
}

const questions: Question[] = [
  {
    id: 1,
    title: "Quel est votre objectif principal ?",
    description: "Cela nous aidera à adapter le contenu à vos besoins",
    field: "mainObjective",
    options: [
      {
        value: "EXAMS",
        label: "Réussir mes examens",
        icon: <GraduationCap className="w-8 h-8" />,
        description: "Préparation aux tests, diplômes et certifications"
      },
      {
        value: "CAREER",
        label: "Évoluer professionnellement",
        icon: <Briefcase className="w-8 h-8" />,
        description: "Améliorer mes compétences pour le travail"
      }
    ]
  },
  {
    id: 2,
    title: "Dans quel contexte utiliserez-vous le français ?",
    description: "Nous adapterons les scénarios de pratique",
    field: "usageContext",
    options: [
      {
        value: "SCHOOL",
        label: "École / Université",
        icon: <BookOpen className="w-8 h-8" />,
        description: "Cours, examens, travaux académiques"
      },
      {
        value: "WORK",
        label: "Travail",
        icon: <Building className="w-8 h-8" />,
        description: "Réunions, emails, présentations"
      },
      {
        value: "TRAVEL",
        label: "Voyage",
        icon: <Plane className="w-8 h-8" />,
        description: "Tourisme, communication quotidienne"
      },
      {
        value: "PERSONAL",
        label: "Personnel",
        icon: <Users className="w-8 h-8" />,
        description: "Culture, loisirs, famille"
      }
    ]
  },
  {
    id: 3,
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
  },
  {
    id: 4,
    title: "Quelle est votre tranche d'âge ?",
    description: "Pour personnaliser les thèmes et exemples",
    field: "ageRange",
    options: [
      {
        value: "UNDER_18",
        label: "Moins de 18 ans",
        icon: <span className="text-2xl">🎒</span>,
        description: "Lycéen(ne) ou plus jeune"
      },
      {
        value: "18_25",
        label: "18 - 25 ans",
        icon: <span className="text-2xl">🎓</span>,
        description: "Étudiant(e) ou jeune actif"
      },
      {
        value: "26_40",
        label: "26 - 40 ans",
        icon: <span className="text-2xl">💼</span>,
        description: "Professionnel(le) en activité"
      },
      {
        value: "OVER_40",
        label: "Plus de 40 ans",
        icon: <span className="text-2xl">🌟</span>,
        description: "Expérimenté(e)"
      }
    ]
  },
  {
    id: 5,
    title: "Quel secteur vous intéresse le plus ?",
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
        value: "GENERAL",
        label: "Général",
        icon: <BookOpen className="w-8 h-8" />,
        description: "Un peu de tout, polyvalent"
      }
    ]
  }
];

interface Answers {
  mainObjective: string;
  usageContext: string;
  currentLevel: string;
  ageRange: string;
  sectorInterest: string;
}

const OrientationTest = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [answers, setAnswers] = useState<Answers>({
    mainObjective: "",
    usageContext: "",
    currentLevel: "",
    ageRange: "",
    sectorInterest: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false); // Prevent double submissions
  const hasCheckedStatusRef = useRef(false); // Prevent double status checks
  
  // Initialize result from sessionStorage if available (prevents re-doing test on re-render)
  const [result, setResult] = useState<{
    completed: boolean;
    learnerType: string;
    learnerTypeLabel: string;
    learnerTypeDescription: string;
  } | null>(() => {
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

  // Check if orientation is already completed on mount
  useEffect(() => {
    // Prevent double checks
    if (hasCheckedStatusRef.current) {
      setIsLoading(false);
      return;
    }
    
    // If we already have a result from sessionStorage, no need to check
    if (result) {
      hasCheckedStatusRef.current = true;
      setIsLoading(false);
      return;
    }

    const checkStatus = async () => {
      hasCheckedStatusRef.current = true;
      try {
        const response = await api.get('/orientation-test/status');
        if (response.data.completed) {
          // Already completed - redirect to courses immediately
          sessionStorage.setItem('orientationCompleted', 'true');
          navigate('/courses', { state: { fromOrientationTest: true }, replace: true });
          return;
        }
      } catch (error) {
        console.error('Failed to check orientation status:', error);
      }
      setIsLoading(false);
    };

    checkStatus();
  }, [navigate, result]);

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  const handleSelect = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.field]: value
    }));
  };

  const handleNext = () => {
    // Prevent action if already submitting
    if (isSubmitting || isSubmittingRef.current) {
      return;
    }
    
    if (!answers[currentQuestion.field as keyof Answers]) {
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
    // Prevent double submissions using ref (synchronous check)
    if (isSubmittingRef.current) {
      console.log('Submission already in progress, ignoring duplicate call');
      return;
    }
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    
    try {
      const response = await api.post("/orientation-test/submit", answers);
      
      // Store completion status IMMEDIATELY after successful submission
      // This prevents re-initialization issues if component re-renders
      sessionStorage.setItem('orientationCompleted', 'true');
      sessionStorage.setItem('orientationResult', JSON.stringify(response.data));
      
      setResult(response.data);
      toast({
        title: "Test terminé !",
        description: "Votre profil d'apprentissage a été déterminé"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite. Veuillez réessayer.",
        variant: "destructive"
      });
      // Reset ref only on error to allow retry
      isSubmittingRef.current = false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinue = () => {
    // Navigate first, then React will unmount this component
    // The orientationCompleted flag is already set in handleSubmit
    // Don't remove orientationResult here - it can cause race condition
    navigate("/courses", { state: { fromOrientationTest: true }, replace: true });
  };

  // Loading screen - checking if already completed
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
        <Card className="w-full max-w-lg">
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
              <p className="text-sm opacity-90">{result.learnerType}</p>
            </div>

            <p className="text-gray-600 text-center">
              {result.learnerTypeDescription}
            </p>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-2">Ce que cela signifie :</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {result.learnerType === "STUDENT" && (
                  <>
                    <li>• Quiz IA avec exercices académiques</li>
                    <li>• Focus sur la grammaire et conjugaison</li>
                    <li>• Scénarios de classe et exposés oraux</li>
                  </>
                )}
                {result.learnerType === "PROFESSIONAL" && (
                  <>
                    <li>• Quiz IA avec situations professionnelles</li>
                    <li>• Vocabulaire business et formel</li>
                    <li>• Scénarios de réunions et entretiens</li>
                  </>
                )}
                {result.learnerType === "CASUAL" && (
                  <>
                    <li>• Quiz IA avec situations du quotidien</li>
                    <li>• Vocabulaire pratique et conversationnel</li>
                    <li>• Scénarios de voyage et culture</li>
                  </>
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
              Question {currentStep + 1} sur {questions.length}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentQuestion.options.map((option) => {
              const isSelected = answers[currentQuestion.field as keyof Answers] === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    isSelected
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
