import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Play, Lock, Users, Clock, BookOpen, Video, FileText, CheckCircle, ArrowLeft, ArrowRight, Star, Sparkles, Trophy, GraduationCap, Target, Zap, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { courseService, CoursePublic } from '@/services/courseService';
import { useToast } from '@/hooks/use-toast';
import logo from '@/assets/logo.jpg';
import professor from '@/assets/professor.jpg';

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [course, setCourse] = useState<CoursePublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeChapter, setActiveChapter] = useState<number | null>(null);

  useEffect(() => {
    if (id) {
      loadCourse(Number(id));
    }
  }, [id]);

  const loadCourse = async (courseId: number) => {
    try {
      setLoading(true);
      const data = await courseService.getPublicCourseById(courseId);
      setCourse(data);
    } catch (error) {
      console.error('Erreur lors du chargement du cours:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger le cours',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getLevelConfig = (level: string) => {
    switch (level) {
      case 'Débutant':
        return { 
          gradient: 'from-primary to-primary/80', 
          icon: '🌱',
          bg: 'bg-primary',
          text: 'text-primary'
        };
      case 'Intermédiaire':
        return { 
          gradient: 'from-secondary to-secondary/80', 
          icon: '🚀',
          bg: 'bg-secondary',
          text: 'text-secondary'
        };
      case 'Avancé':
        return { 
          gradient: 'from-primary via-secondary to-primary', 
          icon: '👑',
          bg: 'bg-primary',
          text: 'text-primary'
        };
      default:
        return { 
          gradient: 'from-primary to-secondary', 
          icon: '📚',
          bg: 'bg-primary',
          text: 'text-primary'
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="w-20 h-20 border-4 border-primary/20 rounded-full" />
            <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
            <div className="absolute inset-0 flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-primary animate-pulse" />
            </div>
          </div>
          <p className="text-muted-foreground font-medium">Chargement du cours...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
            <BookOpen className="h-12 w-12 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Cours introuvable</h2>
          <Button onClick={() => navigate('/courses')} className="rounded-xl">
            <ArrowRight className="ml-2 h-4 w-4" />
            Retour aux cours
          </Button>
        </div>
      </div>
    );
  }

  const levelConfig = getLevelConfig(course.level);
  const unlockedChapters = course.chapters?.filter(c => !c.isLocked).length || 0;
  const totalChapters = course.chapters?.length || 0;
  const progressPercent = totalChapters > 0 ? (unlockedChapters / totalChapters) * 100 : 100;

  return (
    <div dir="ltr" className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-secondary/20 rounded-full blur-3xl" />
        </div>
        
        <div className="relative bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 py-16 md:py-20">
          <div className="container mx-auto px-4">
            {/* Back Button */}
            <Button
              variant="ghost"
              onClick={() => navigate('/courses')}
              className="mb-8 text-white/70 hover:text-white hover:bg-white/10 rounded-xl"
            >
              <ArrowRight className="ml-2 h-4 w-4" />
              Retour aux cours
            </Button>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left - Course Info */}
              <div className="order-2 lg:order-1">
                <div className="flex items-center gap-3 mb-6">
                  <Badge className={`bg-gradient-to-r ${levelConfig.gradient} text-white border-0 px-4 py-2 text-sm font-bold`}>
                    {levelConfig.icon} {course.level}
                  </Badge>
                  {course.status === 'PUBLISHED' && (
                    <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse" />
                      Disponible
                    </Badge>
                  )}
                </div>
                
                <h1 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
                  {course.name}
                </h1>
                
                <p className="text-xl text-white/70 mb-8 leading-relaxed">
                  {course.description}
                </p>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-white">{course.publishedChapters || course.totalChapters}</p>
                    <p className="text-xs text-white/60">Chapitres</p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-white">{course.durationHours}h</p>
                    <p className="text-xs text-white/60">De contenu</p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-white">{course.totalStudents}</p>
                    <p className="text-xs text-white/60">Étudiants</p>
                  </div>
                </div>
                
                {/* CTA Button */}
                <Button 
                  size="lg" 
                  onClick={() => navigate(`/learn/${course.id}`)}
                  className={`h-14 px-8 rounded-2xl bg-gradient-to-r ${levelConfig.gradient} hover:opacity-90 text-white font-bold text-lg shadow-2xl hover:shadow-xl transition-all duration-300 group`}
                >
                  <Play className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform" />
                  Commencer le cours
                </Button>
              </div>
              
              {/* Right - Course Image/Preview */}
              <div className="order-1 lg:order-2">
                <div className="relative">
                  {/* Glow Effect */}
                  <div className={`absolute -inset-4 bg-gradient-to-r ${levelConfig.gradient} rounded-3xl blur-2xl opacity-30`} />
                  
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                    {course.imageUrl ? (
                      <img
                        src={course.imageUrl}
                        alt={course.name}
                        className="w-full aspect-video object-cover"
                      />
                    ) : (
                      <div className={`w-full aspect-video bg-gradient-to-br ${levelConfig.gradient} flex items-center justify-center`}>
                        <div className="text-center">
                          <div className="text-8xl mb-4">{levelConfig.icon}</div>
                          <p className="text-white/80 font-medium">Aperçu du cours</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Play Overlay */}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center group cursor-pointer" onClick={() => navigate(`/learn/${course.id}`)}>
                      <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/50 group-hover:scale-110 transition-transform">
                        <Play className="w-10 h-10 text-white fill-white mr-[-4px]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Wave Separator */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 120" fill="none" className="w-full h-auto">
              <path d="M0 120L48 110C96 100 192 80 288 70C384 60 480 60 576 65C672 70 768 80 864 85C960 90 1056 90 1152 85C1248 80 1344 70 1392 65L1440 60V120H0Z" 
                className="fill-slate-50 dark:fill-slate-950"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Content - 2 columns */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Start Card */}
            <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-r from-primary/5 via-transparent to-secondary/5">
              <div className={`h-1 bg-gradient-to-r ${levelConfig.gradient}`} />
              <CardContent className="py-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${levelConfig.gradient} flex items-center justify-center shadow-lg`}>
                      <Zap className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl mb-1">Prêt à commencer ?</h3>
                      <p className="text-muted-foreground">
                        Accédez aux leçons vidéo et suivez votre progression
                      </p>
                    </div>
                  </div>
                  <Button 
                    size="lg" 
                    onClick={() => navigate(`/learn/${course.id}`)}
                    className={`h-12 px-6 rounded-xl bg-gradient-to-r ${levelConfig.gradient} hover:opacity-90 text-white font-bold shadow-lg`}
                  >
                    <Play className="w-5 h-5 ml-2" />
                    Commencer maintenant
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* About Section */}
            <Card className="overflow-hidden border-0 shadow-xl">
              <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <CardTitle>À propos de cette formation</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-muted-foreground leading-relaxed mb-6">{course.description}</p>
                
                {/* Features Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm font-medium">Accès à vie</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                    <Video className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-medium">Vidéos HD</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20">
                    <FileText className="w-5 h-5 text-purple-500" />
                    <span className="text-sm font-medium">Ressources PDF</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20">
                    <Trophy className="w-5 h-5 text-orange-500" />
                    <span className="text-sm font-medium">Certificat</span>
                  </div>
                </div>
                
                {course.pdfUrl && (
                  <Button variant="outline" asChild className="rounded-xl">
                    <a href={course.pdfUrl} download target="_blank" rel="noopener noreferrer">
                      <FileText className="ml-2 h-4 w-4" />
                      Télécharger le syllabus
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Chapters Section */}
            <Card className="overflow-hidden border-0 shadow-xl">
              <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle>Contenu du cours</CardTitle>
                      <p className="text-sm text-muted-foreground">{course.publishedChapters || course.totalChapters} chapitres</p>
                    </div>
                  </div>
                  {course.chapters?.some(c => c.isLocked) && (
                    <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">
                      <Lock className="w-3 h-3 ml-1" />
                      Contenu Premium
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {/* Locked Warning */}
                {course.chapters && course.chapters.some(c => c.isLocked) && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-yellow-500 flex items-center justify-center">
                        <Lock className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <span className="font-bold text-yellow-900 dark:text-yellow-200">Contenu Premium</span>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          {course.chapters.filter(c => c.isLocked).length} chapitres nécessitent un abonnement NORMAL ou VIP
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {!course.chapters || course.chapters.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <BookOpen className="h-10 w-10 text-slate-400" />
                    </div>
                    <p className="text-muted-foreground">Aucun chapitre disponible pour le moment</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {course.chapters.map((chapter, index) => (
                      <div
                        key={chapter.id}
                        className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 ${
                          chapter.isLocked
                            ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-75'
                            : activeChapter === chapter.id 
                              ? `border-transparent bg-gradient-to-r ${levelConfig.gradient} text-white shadow-lg`
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:shadow-md cursor-pointer'
                        }`}
                        onClick={() => {
                          if (!chapter.isLocked) {
                            setActiveChapter(activeChapter === chapter.id ? null : chapter.id);
                          }
                        }}
                        onDoubleClick={() => {
                          if (!chapter.isLocked) {
                            navigate(`/learn/${course.id}`);
                          }
                        }}
                      >
                        <div className="flex items-center gap-4 p-4">
                          {/* Order Number */}
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                            chapter.isLocked 
                              ? 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                              : activeChapter === chapter.id 
                                ? 'bg-white/20 text-white' 
                                : `bg-gradient-to-br ${levelConfig.gradient} text-white`
                          }`}>
                            {chapter.isLocked ? <Lock className="w-5 h-5" /> : chapter.displayOrder}
                          </div>

                          {/* Chapter Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-bold mb-1 ${activeChapter === chapter.id ? 'text-white' : ''}`}>
                              {chapter.title}
                            </h4>
                            {chapter.description && (
                              <p className={`text-sm line-clamp-1 ${activeChapter === chapter.id ? 'text-white/80' : 'text-muted-foreground'}`}>
                                {chapter.description}
                              </p>
                            )}
                            <div className={`flex items-center gap-4 mt-2 text-xs ${activeChapter === chapter.id ? 'text-white/70' : 'text-muted-foreground'}`}>
                              <div className="flex items-center gap-1">
                                <Clock size={12} />
                                <span>{chapter.durationMinutes} min</span>
                              </div>
                              {chapter.videoUrl && (
                                <div className="flex items-center gap-1">
                                  <Video size={12} />
                                  <span>Vidéo</span>
                                </div>
                              )}
                              {chapter.pdfUrl && (
                                <div className="flex items-center gap-1">
                                  <FileText size={12} />
                                  <span>PDF</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action Icon */}
                          <div className="flex-shrink-0">
                            {chapter.isLocked ? (
                              <div className="w-10 h-10 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                                <Lock className="h-5 w-5 text-yellow-600" />
                              </div>
                            ) : (
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                                activeChapter === chapter.id 
                                  ? 'bg-white/20' 
                                  : 'bg-primary/10 group-hover:bg-primary/20'
                              }`}>
                                <Play className={`h-5 w-5 ${activeChapter === chapter.id ? 'text-white' : 'text-primary'}`} />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Course Card */}
              <Card className="overflow-hidden border-0 shadow-xl">
                <div className={`h-1.5 bg-gradient-to-r ${levelConfig.gradient}`} />
                {course.imageUrl && (
                  <div className="relative">
                    <img
                      src={course.imageUrl}
                      alt={course.name}
                      className="w-full aspect-video object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                )}
                <CardContent className="pt-6 space-y-5">
                  {/* Progress */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Accès au contenu</span>
                      <span className="font-bold">{Math.round(progressPercent)}%</span>
                    </div>
                    <Progress value={progressPercent} className="h-2" />
                  </div>
                  
                  {/* Details */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                      <span className="text-muted-foreground">Niveau</span>
                      <Badge className={`bg-gradient-to-r ${levelConfig.gradient} text-white border-0`}>
                        {levelConfig.icon} {course.level}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                      <span className="text-muted-foreground">Chapitres</span>
                      <span className="font-bold">{course.publishedChapters || course.totalChapters}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                      <span className="text-muted-foreground">Durée totale</span>
                      <span className="font-bold">{course.durationHours}h</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                      <span className="text-muted-foreground">Étudiants</span>
                      <span className="font-bold">{course.totalStudents}</span>
                    </div>
                  </div>
                  
                  {/* Access Info */}
                  <div className="pt-4 border-t">
                    {course.chapters?.some((c) => c.isLocked) ? (
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Certains chapitres sont verrouillés. Passez à Premium pour un accès complet.
                        </p>
                        <Button
                          className={`w-full h-12 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 hover:opacity-90 text-white font-bold shadow-lg`}
                          onClick={() => navigate('/pricing')}
                        >
                          <Sparkles className="w-5 h-5 ml-2" />
                          Passer à Premium
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium text-sm">Accès complet à tous les chapitres</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Rating Card */}
              <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
                <CardContent className="pt-6 text-center">
                  <div className="flex justify-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  <p className="text-2xl font-bold mb-1">4.9/5</p>
                  <p className="text-sm text-muted-foreground">Basé sur {course.totalStudents} avis</p>
                </CardContent>
              </Card>

              {/* Professor Card */}
              <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-primary/5 to-secondary/5 dark:from-primary/10 dark:to-secondary/10">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    {/* Professor Photo */}
                    <div className="relative mb-4">
                      <div className="absolute -inset-2 bg-gradient-to-br from-primary via-secondary to-primary rounded-full opacity-30 animate-spin" style={{ animationDuration: '15s' }} />
                      <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl">
                        <img 
                          src={professor} 
                          alt="Votre Formateur" 
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                      {/* Verified Badge */}
                      <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    
                    <h4 className="font-bold text-lg mb-1">Votre Formateur</h4>
                    <p className="text-sm text-muted-foreground mb-4">Expert en Langue Française</p>
                    
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 w-full">
                      <div className="p-3 rounded-xl bg-white/50 dark:bg-slate-800/50">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Award className="w-4 h-4 text-yellow-500" />
                          <span className="font-bold">+10</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Ans d'expérience</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white/50 dark:bg-slate-800/50">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <GraduationCap className="w-4 h-4 text-primary" />
                          <span className="font-bold">500+</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Étudiants formés</p>
                      </div>
                    </div>
                    
                    {/* Logo */}
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 w-full">
                      <div className="flex items-center justify-center gap-2">
                        <img src={logo} alt="BCLT" className="w-10 h-10 rounded-lg shadow-md" />
                        <div className="text-right">
                          <p className="font-bold text-sm">BCLT الفرنسية</p>
                          <p className="text-xs text-muted-foreground">Centre de Formation</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
