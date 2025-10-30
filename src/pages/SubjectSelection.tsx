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
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-primary/5 to-secondary/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="container mx-auto px-4 py-6 relative z-10">
        <div className="flex items-center justify-center gap-3 animate-fade-in">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse"></div>
            <img src={logoImg} alt="BCLT Logo" className="h-16 w-16 object-contain relative z-10 hover:scale-110 transition-transform duration-300" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gradient">BCLT Academy</h1>
            <p className="text-sm text-muted-foreground font-medium">Centre de Formation d'Excellence</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 relative z-10">
        {/* Title Section */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm shadow-lg px-6 py-3 rounded-full mb-6 hover:scale-105 transition-transform duration-300">
            <GraduationCap className="w-6 h-6 text-primary animate-pulse" />
            <span className="text-primary font-bold text-lg">Plateforme d'Apprentissage</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-black mb-8 leading-tight">
            Choisissez Votre
            <span className="block text-gradient mt-3 animate-fade-in" style={{ animationDelay: '0.2s' }}>Matière d'Étude</span>
          </h1>
          <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.4s' }}>
            Sélectionnez la matière que vous souhaitez apprendre et commencez votre parcours d'excellence académique avec nos experts
          </p>
        </div>

        {/* Subjects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto mb-16">
          {subjects.map((subject, idx) => {
            const Icon = subject.icon;
            return (
              <Card
                key={subject.id}
                className={`relative overflow-hidden transition-all duration-500 cursor-pointer group animate-fade-in ${
                  subject.available
                    ? 'hover:scale-110 hover:shadow-2xl hover:-translate-y-2'
                    : 'opacity-70 cursor-not-allowed'
                }`}
                style={{ animationDelay: `${idx * 150}ms` }}
                onClick={() => handleSubjectClick(subject.id, subject.available)}
              >
                {/* Animated Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${subject.gradient} opacity-5 group-hover:opacity-15 transition-all duration-500`}></div>
                <div className={`absolute -inset-1 bg-gradient-to-r ${subject.gradient} opacity-0 group-hover:opacity-30 blur-xl transition-all duration-500`}></div>
                
                {/* Coming Soon Badge */}
                {!subject.available && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className="bg-gradient-to-r from-secondary to-secondary/80 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg animate-pulse">
                      Bientôt
                    </span>
                  </div>
                )}

                {/* Sparkle effect on available subjects */}
                {subject.available && (
                  <div className="absolute top-4 left-4 z-10">
                    <div className="w-3 h-3 bg-primary rounded-full animate-ping"></div>
                  </div>
                )}

                {/* Content */}
                <div className="relative p-8 text-center">
                  {/* Icon Container with hover effect */}
                  <div className={`${subject.bgColor} w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-lg`}>
                    <Icon className={`w-12 h-12 ${subject.available ? 'animate-pulse' : ''}`} 
                          style={{ 
                            background: `linear-gradient(135deg, ${subject.gradient.split(' ')[1]}, ${subject.gradient.split(' ')[2]})`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                          }} />
                  </div>

                  {/* Subject Name */}
                  <h2 className="text-2xl font-black mb-4 group-hover:text-primary transition-colors duration-300">{subject.name}</h2>
                  
                  {/* Description */}
                  <p className="text-muted-foreground mb-6 text-sm leading-relaxed min-h-[3rem]">
                    {subject.description}
                  </p>

                  {/* Action Button */}
                  <Button
                    className={`w-full font-bold shadow-lg transform transition-all duration-300 ${
                      subject.available 
                        ? `bg-gradient-to-r ${subject.gradient} text-white hover:shadow-2xl hover:scale-105` 
                        : 'bg-muted text-muted-foreground'
                    }`}
                    disabled={!subject.available}
                    size="lg"
                  >
                    {subject.available ? (
                      <span className="flex items-center gap-2">
                        Commencer
                        <span className="text-xl">→</span>
                      </span>
                    ) : (
                      'Bientôt disponible'
                    )}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Features Section */}
        <div className="max-w-6xl mx-auto mt-24">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl font-black mb-4">
              Pourquoi Choisir <span className="text-gradient">BCLT Academy</span> ?
            </h2>
            <p className="text-lg text-muted-foreground">Des avantages uniques pour votre réussite</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Award,
                title: 'Certificats Reconnus',
                description: 'Obtenez des certificats officiels à la fin de chaque niveau',
                color: 'from-amber-500 to-orange-600'
              },
              {
                icon: GraduationCap,
                title: 'Instructeurs Experts',
                description: 'Apprenez avec les meilleurs professeurs du Maroc',
                color: 'from-blue-500 to-indigo-600'
              },
              {
                icon: BookOpen,
                title: 'Contenu Riche',
                description: 'Des milliers de leçons vidéo et exercices interactifs',
                color: 'from-emerald-500 to-teal-600'
              },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Card key={idx} className="p-8 text-center card-elevated group hover:scale-105 transition-all duration-300 hover:shadow-2xl animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-black mb-3 group-hover:text-primary transition-colors duration-300">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-8 shadow-lg mb-8 hover:shadow-2xl transition-shadow duration-300">
            <h3 className="text-2xl font-black mb-3">Prêt à Commencer Votre Parcours ?</h3>
            <p className="text-muted-foreground mb-6">Rejoignez des milliers d'étudiants qui ont transformé leur avenir avec BCLT Academy</p>
            <Button size="lg" className="bg-gradient-to-r from-primary to-secondary text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
              Démarrer Maintenant
            </Button>
          </div>
          <p className="text-muted-foreground text-sm font-medium">
            © 2024 BCLT Academy - Tous droits réservés
          </p>
        </div>
      </footer>
    </div>
  );
}
