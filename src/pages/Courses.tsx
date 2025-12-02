import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Users, Clock, BookOpen, GraduationCap, Trophy, Star, ArrowRight, Play, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { courseService, CoursePublic } from '@/services/courseService';
import { useToast } from '@/hooks/use-toast';
import logo from '@/assets/logo.jpg';
import professor from '@/assets/professor.jpg';

export default function Courses() {
  const { toast } = useToast();
  const [courses, setCourses] = useState<CoursePublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [niveauFilter, setNiveauFilter] = useState('all');
  const [hoveredCourse, setHoveredCourse] = useState<number | null>(null);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await courseService.getPublicCourses();
      setCourses(data);
    } catch (error) {
      console.error('Erreur lors du chargement des cours:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les cours',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesNiveau = niveauFilter === 'all' || course.level === niveauFilter;
    return matchesSearch && matchesNiveau;
  });

  const getLevelConfig = (level: string) => {
    switch (level) {
      case 'Débutant':
        return { 
          gradient: 'from-primary to-primary/80', 
          icon: '🌱',
          color: 'text-primary',
          bg: 'bg-primary/10'
        };
      case 'Intermédiaire':
        return { 
          gradient: 'from-secondary to-secondary/80', 
          icon: '🚀',
          color: 'text-secondary',
          bg: 'bg-secondary/10'
        };
      case 'Avancé':
        return { 
          gradient: 'from-primary via-secondary to-primary', 
          icon: '👑',
          color: 'text-primary',
          bg: 'bg-primary/10'
        };
      default:
        return { 
          gradient: 'from-primary to-secondary', 
          icon: '📚',
          color: 'text-primary',
          bg: 'bg-primary/10'
        };
    }
  };

  return (
    <div dir="ltr" className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
        </div>
        
        <div className="relative container mx-auto px-4 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left - Professor Image */}
            <div className="flex justify-center lg:justify-start order-1">
              <div className="relative">
                {/* Glow */}
                <div className="absolute -inset-4 bg-gradient-to-br from-primary/40 to-secondary/40 rounded-full blur-3xl opacity-50" />
                
                {/* Image */}
                <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl">
                  <img 
                    src={professor} 
                    alt="Votre Formateur" 
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                
                {/* Badge Experience */}
                <div className="absolute top-4 -right-4 px-4 py-2 bg-secondary rounded-full shadow-lg">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-white fill-white" />
                    <span className="text-white font-bold text-sm">+10 ans</span>
                  </div>
                </div>
                
                {/* Badge Certified */}
                <div className="absolute -bottom-2 left-4 px-4 py-2 bg-primary rounded-full shadow-lg">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-white" />
                    <span className="text-white font-bold text-sm">Expert Certifié</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right - Content */}
            <div className="text-left order-2">
              {/* Logo Badge */}
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-6">
                <img src={logo} alt="BCLT" className="w-10 h-10 rounded-lg" />
                <div>
                  <p className="text-white font-bold">BCLT الفرنسية</p>
                  <p className="text-secondary text-xs">Centre de Formation</p>
                </div>
              </div>
              
              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
                Maîtrisez le{' '}
                <span className="text-secondary">Français</span>
                <br />avec Excellence
              </h1>
              
              {/* Description */}
              <p className="text-lg text-white/70 mb-8 max-w-lg">
                Des formations professionnelles conçues par des experts pour vous accompagner vers la maîtrise parfaite de la langue française
              </p>
              
              {/* Stats */}
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-3 px-4 py-3 bg-white/10 rounded-xl">
                  <div className="p-2 bg-secondary rounded-lg">
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">{courses.length}+</p>
                    <p className="text-xs text-white/60">Formations</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-3 bg-white/10 rounded-xl">
                  <div className="p-2 bg-primary rounded-lg">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">500+</p>
                    <p className="text-xs text-white/60">Étudiants</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-3 bg-white/10 rounded-xl">
                  <div className="p-2 bg-secondary rounded-lg">
                    <Trophy className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">98%</p>
                    <p className="text-xs text-white/60">Satisfaction</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mini Navbar Filters */}
      <div className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4 gap-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher une formation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 rounded-lg border-gray-200 focus:border-primary bg-gray-50"
                />
              </div>
            </div>
            
            {/* Level Filter */}
            <Select value={niveauFilter} onValueChange={setNiveauFilter}>
              <SelectTrigger className="w-48 h-10 rounded-lg border-gray-200 bg-gray-50">
                <SelectValue placeholder="Tous les niveaux" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">📚 Tous les niveaux</SelectItem>
                <SelectItem value="Débutant">🌱 Débutant</SelectItem>
                <SelectItem value="Intermédiaire">🚀 Intermédiaire</SelectItem>
                <SelectItem value="Avancé">👑 Avancé</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Results count */}
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
              <span className="text-sm text-gray-600">Résultats:</span>
              <span className="font-bold text-primary">{filteredCourses.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Section */}
      <div className="container mx-auto px-4 py-12">
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="mt-4 text-gray-500">Chargement des formations...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredCourses.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <BookOpen className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Aucune formation trouvée</h3>
            <p className="text-gray-500 mb-4">Essayez de modifier vos critères de recherche</p>
            <Button variant="outline" onClick={() => { setSearchTerm(''); setNiveauFilter('all'); }}>
              Réinitialiser les filtres
            </Button>
          </div>
        )}

        {/* Courses Grid */}
        {!loading && filteredCourses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const levelConfig = getLevelConfig(course.level);
              return (
                <Card 
                  key={course.id} 
                  className="group overflow-hidden border border-gray-100 hover:border-primary/30 hover:shadow-xl transition-all duration-300 bg-white"
                  onMouseEnter={() => setHoveredCourse(course.id)}
                  onMouseLeave={() => setHoveredCourse(null)}
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden bg-gray-100">
                    {course.imageUrl ? (
                      <img
                        src={course.imageUrl}
                        alt={course.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${levelConfig.gradient} flex items-center justify-center`}>
                        <span className="text-5xl">{levelConfig.icon}</span>
                      </div>
                    )}
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <Badge className="bg-white text-gray-800 border-0 shadow-sm">
                        {levelConfig.icon} {course.level}
                      </Badge>
                    </div>
                    
                    {course.status === 'PUBLISHED' && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-primary text-white border-0 shadow-sm">
                          Disponible
                        </Badge>
                      </div>
                    )}
                    
                    {/* Play button on hover */}
                    <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${hoveredCourse === course.id ? 'opacity-100' : 'opacity-0'}`}>
                      <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                        <Play className="w-6 h-6 text-primary fill-primary ml-1" />
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="p-5">
                    {/* Title */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                      {course.name}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                      {course.description}
                    </p>
                    
                    {/* Stats */}
                    <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-primary" />
                        <span>{course.totalChapters} chapitres</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-secondary" />
                        <span>{course.durationHours}h</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-primary" />
                        <span>{course.totalStudents}</span>
                      </div>
                    </div>
                    
                    {/* CTA */}
                    <Link to={`/courses/${course.id}`}>
                      <Button className="w-full h-11 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium">
                        Découvrir le cours
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
