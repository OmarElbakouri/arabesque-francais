import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Globe, Calculator, Atom, GraduationCap, Award } from 'lucide-react';
import logoImg from '@/assets/logo.jpg';

export default function SubjectSelection() {
  const navigate = useNavigate();

  const subjects = [
    {
      id: 'french',
      name: 'Français',
      icon: BookOpen,
      description: 'Apprenez la langue française de A1 à C2',
      gradient: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50',
      available: true,
    },
    {
      id: 'english',
      name: 'Anglais',
      icon: Globe,
      description: 'Maîtrisez l\'anglais avec nos cours complets',
      gradient: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-50',
      available: false,
    },
    {
      id: 'math',
      name: 'Mathématiques',
      icon: Calculator,
      description: 'Excellez en mathématiques à tous les niveaux',
      gradient: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-50',
      available: false,
    },
    {
      id: 'physics',
      name: 'Physique',
      icon: Atom,
      description: 'Découvrez les mystères de la physique',
      gradient: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-50',
      available: false,
    },
  ];

  const handleSubjectClick = (subjectId: string, available: boolean) => {
    if (available) {
      navigate('/home');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center gap-3">
          <img src={logoImg} alt="BCLT Logo" className="h-16 w-16 object-contain" />
          <div className="text-center">
            <h1 className="text-2xl font-bold text-primary">BCLT Academy</h1>
            <p className="text-sm text-muted-foreground">Centre de Formation d'Excellence</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Title Section */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
            <GraduationCap className="w-5 h-5 text-primary" />
            <span className="text-primary font-semibold">Plateforme d'Apprentissage</span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-black mb-6">
            Choisissez Votre
            <span className="block text-gradient mt-2">Matière d'Étude</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Sélectionnez la matière que vous souhaitez apprendre et commencez votre parcours d'excellence académique
          </p>
        </div>

        {/* Subjects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-12">
          {subjects.map((subject, idx) => {
            const Icon = subject.icon;
            return (
              <Card
                key={subject.id}
                className={`relative overflow-hidden transition-all duration-300 cursor-pointer ${
                  subject.available
                    ? 'hover:scale-105 hover:shadow-2xl card-elevated'
                    : 'opacity-60 cursor-not-allowed'
                }`}
                style={{ animationDelay: `${idx * 100}ms` }}
                onClick={() => handleSubjectClick(subject.id, subject.available)}
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${subject.gradient} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                
                {/* Coming Soon Badge */}
                {!subject.available && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className="bg-secondary text-white px-3 py-1 rounded-full text-xs font-bold">
                      Bientôt
                    </span>
                  </div>
                )}

                {/* Content */}
                <div className="relative p-8 text-center">
                  {/* Icon */}
                  <div className={`${subject.bgColor} w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                    <Icon className={`w-10 h-10 bg-gradient-to-br ${subject.gradient} bg-clip-text text-transparent`} style={{ WebkitTextFillColor: 'transparent' }} />
                  </div>

                  {/* Subject Name */}
                  <h2 className="text-2xl font-bold mb-3">{subject.name}</h2>
                  
                  {/* Description */}
                  <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                    {subject.description}
                  </p>

                  {/* Action Button */}
                  <Button
                    className={`w-full ${subject.available ? `bg-gradient-to-r ${subject.gradient} text-white hover:opacity-90` : ''}`}
                    disabled={!subject.available}
                  >
                    {subject.available ? 'Commencer' : 'Bientôt disponible'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Features Section */}
        <div className="max-w-5xl mx-auto mt-20">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Award,
                title: 'Certificats Reconnus',
                description: 'Obtenez des certificats officiels à la fin de chaque niveau',
              },
              {
                icon: GraduationCap,
                title: 'Instructeurs Experts',
                description: 'Apprenez avec les meilleurs professeurs du Maroc',
              },
              {
                icon: BookOpen,
                title: 'Contenu Riche',
                description: 'Des milliers de leçons vidéo et exercices interactifs',
              },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Card key={idx} className="p-6 text-center card-elevated">
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground text-sm">
          © 2024 BCLT Academy - Tous droits réservés
        </p>
      </footer>
    </div>
  );
}
