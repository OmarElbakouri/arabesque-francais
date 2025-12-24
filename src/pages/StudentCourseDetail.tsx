import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Play,
  Lock,
  Clock,
  BookOpen,
  Video,
  FileText,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Download,
  Headphones,
  Circle,
  Crown,
  Heart,
  Send,
  Sparkles,
  Trophy,
  Zap,
  Star,
  GraduationCap,
  Pause,
  Mic,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  courseService,
  StudentCourseDTO,
  StudentChapterDTO,
} from '@/services/courseService';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';
import logo from '@/assets/logo.jpg';
import professor from '@/assets/professor.jpg';
import { StudentLessonDTO } from '@/services/courseService';
import HLSVideoPlayer from '@/components/HLSVideoPlayer';
import ChapterQuiz from '@/components/ChapterQuiz';
import VoiceQuiz from '@/components/VoiceQuiz';

export default function StudentCourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();

  // Check if user has FREE plan (no access to AI Quiz features)
  const isFreePlan = user?.plan === 'FREE';

  const [course, setCourse] = useState<StudentCourseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(new Set());
  const [selectedChapter, setSelectedChapter] = useState<StudentChapterDTO | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<StudentLessonDTO | null>(null);
  const [markingComplete, setMarkingComplete] = useState<number | null>(null);

  useEffect(() => {
    if (courseId) {
      loadCourse(Number(courseId));
    }
  }, [courseId]);

  const loadCourse = async (id: number) => {
    try {
      setLoading(true);
      const data = await courseService.getStudentCourse(id);
      setCourse(data);

      // Auto-expand all chapters and select first unlocked chapter
      if (data.chapters && data.chapters.length > 0) {
        const allChapterIds = new Set(data.chapters.map(c => c.id));
        setExpandedChapters(allChapterIds);

        // Select first available (unlocked) chapter
        const firstUnlocked = data.chapters.find(c => !c.locked);
        if (firstUnlocked) {
          setSelectedChapter(firstUnlocked);
          // Select first lesson of the chapter if available
          if (firstUnlocked.lessons && firstUnlocked.lessons.length > 0) {
            setSelectedLesson(firstUnlocked.lessons[0]);
          }
        }
      }
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

  const toggleChapter = (chapterId: number) => {
    setExpandedChapters((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(chapterId)) {
        newSet.delete(chapterId);
      } else {
        newSet.add(chapterId);
      }
      return newSet;
    });
  };

  const handleChapterClick = (chapter: StudentChapterDTO) => {
    if (chapter.locked) {
      toast({
        title: 'Contenu verrouillé',
        description: chapter.lockedReason || 'Passez au plan NORMAL ou VIP pour accéder à ce contenu',
        variant: 'destructive',
      });
      return;
    }
    setSelectedChapter(chapter);
    // Select first lesson of the chapter if available
    if (chapter.lessons && chapter.lessons.length > 0) {
      setSelectedLesson(chapter.lessons[0]);
    } else {
      setSelectedLesson(null);
    }
  };

  const handleLessonClick = (lesson: StudentLessonDTO) => {
    setSelectedLesson(lesson);
  };

  // Get current video URL - prioritize lesson video, then chapter video
  const getCurrentVideoUrl = (): string | null => {
    if (selectedLesson?.videoUrl) {
      return selectedLesson.videoUrl;
    }
    if (selectedChapter?.videoUrl) {
      return selectedChapter.videoUrl;
    }
    return null;
  };

  // Get current content title
  const getCurrentTitle = (): string => {
    if (selectedLesson) {
      return selectedLesson.title;
    }
    return selectedChapter?.title || '';
  };

  const handleMarkChapterComplete = async (chapterId: number, currentlyCompleted: boolean) => {
    try {
      setMarkingComplete(chapterId);
      // Use the chapter ID as lesson ID since chapters now contain content directly
      if (currentlyCompleted) {
        await courseService.markLessonIncomplete(chapterId);
      } else {
        await courseService.markLessonComplete(chapterId);
      }
      // Reload course to update progress
      if (courseId) {
        await loadCourse(Number(courseId));
      }
      toast({
        title: 'Succès',
        description: currentlyCompleted ? 'Chapitre marqué comme non terminé' : 'Chapitre terminé !',
      });
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour la progression',
        variant: 'destructive',
      });
    } finally {
      setMarkingComplete(null);
    }
  };

  const navigateToChapter = (direction: 'prev' | 'next') => {
    if (!course || !selectedChapter) return;

    const unlockedChapters = (course.chapters || []).filter(c => !c.locked);
    const currentIndex = unlockedChapters.findIndex(c => c.id === selectedChapter.id);

    if (direction === 'prev' && currentIndex > 0) {
      setSelectedChapter(unlockedChapters[currentIndex - 1]);
    } else if (direction === 'next' && currentIndex < unlockedChapters.length - 1) {
      setSelectedChapter(unlockedChapters[currentIndex + 1]);
    }
  };

  const canNavigate = (direction: 'prev' | 'next') => {
    if (!course || !selectedChapter) return false;

    const unlockedChapters = (course.chapters || []).filter(c => !c.locked);
    const currentIndex = unlockedChapters.findIndex(c => c.id === selectedChapter.id);

    if (direction === 'prev') return currentIndex > 0;
    return currentIndex < unlockedChapters.length - 1;
  };

  // Video player functions
  const getVideoType = (url: string): 'bunny-stream' | 'bunny-cdn' | 'youtube' | 'vimeo' | 'direct' => {
    if (!url) return 'direct';
    // Bunny Stream embed or play URLs
    if (url.includes('iframe.mediadelivery.net') || url.includes('video.bunnycdn.com')) {
      return 'bunny-stream';
    }
    // Bunny CDN direct video URLs (HLS streams or direct files)
    if (url.includes('.b-cdn.net') || url.includes('vz-') && url.includes('.b-cdn.net')) {
      return 'bunny-cdn';
    }
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube';
    }
    if (url.includes('vimeo.com') || url.includes('player.vimeo.com')) {
      return 'vimeo';
    }
    return 'direct';
  };

  const getBunnyEmbedUrl = (url: string): string => {
    // Already an embed URL - just ensure proper params
    if (url.includes('iframe.mediadelivery.net/embed/')) {
      // Add responsive and preload params if not present
      const separator = url.includes('?') ? '&' : '?';
      if (!url.includes('responsive=true')) {
        return `${url}${separator}responsive=true&preload=metadata`;
      }
      return url;
    }

    // Convert video.bunnycdn.com/play/ to embed format
    if (url.includes('video.bunnycdn.com/play/')) {
      const parts = url.split('video.bunnycdn.com/play/')[1];
      if (parts) {
        return `https://iframe.mediadelivery.net/embed/${parts}?responsive=true&preload=metadata`;
      }
    }

    // Handle Bunny CDN direct links (vz-xxx.b-cdn.net format) 
    // These need to be converted to embed format using library ID and video ID
    const vzMatch = url.match(/vz-([a-zA-Z0-9]+)\.b-cdn\.net\/([a-zA-Z0-9-]+)/);
    if (vzMatch) {
      const [, pullZone, videoId] = vzMatch;
      // Note: This requires knowing the library ID - the URL structure is different
      // For now, return the direct URL and use native video player
      return url;
    }

    return url;
  };

  const getYouTubeEmbedUrl = (url: string): string => {
    if (url.includes('youtube.com/watch?v=')) {
      return url.replace('watch?v=', 'embed/');
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  const getVimeoEmbedUrl = (url: string): string => {
    if (url.includes('player.vimeo.com/video/')) {
      return url;
    }
    const match = url.match(/vimeo\.com\/(\d+)/);
    if (match) {
      return `https://player.vimeo.com/video/${match[1]}`;
    }
    return url;
  };

  // Count total chapters
  const getTotalChapters = () => {
    return course?.chapters?.length || 0;
  };

  // Get total duration
  const getTotalDuration = () => {
    return course?.durationHours || 0;
  };

  // Check if current lesson is the last lesson of the chapter
  // Quiz IA and Voice Quiz should only be available on the last lesson
  const isLastLesson = (): boolean => {
    if (!selectedChapter) return false;

    // If chapter has no lessons, allow quiz (single content chapter)
    if (!selectedChapter.lessons || selectedChapter.lessons.length === 0) {
      return true;
    }

    // If chapter has only one lesson, allow quiz
    if (selectedChapter.lessons.length === 1) {
      return true;
    }

    // If no lesson selected, check if we're viewing the chapter directly
    if (!selectedLesson) {
      return false;
    }

    // Check if current lesson is the last one
    const lastLesson = selectedChapter.lessons[selectedChapter.lessons.length - 1];
    return selectedLesson.id === lastLesson.id;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="w-24 h-24 border-4 border-primary/20 rounded-full" />
            <div className="w-24 h-24 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Play className="w-10 h-10 text-primary animate-pulse" />
            </div>
          </div>
          <p className="text-white/70 font-medium text-lg">Chargement du cours...</p>
          <p className="text-white/40 text-sm mt-2">Préparation de votre expérience d'apprentissage</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-slate-700 flex items-center justify-center">
            <BookOpen className="h-12 w-12 text-slate-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Cours introuvable</h2>
          <Button onClick={() => navigate('/courses')} className="rounded-xl">
            <ArrowRight className="ml-2 h-4 w-4" />
            Retour aux cours
          </Button>
        </div>
      </div>
    );
  }

  // Calculate progress
  const completedChapters = (course.chapters || []).filter(c => c.completed).length;
  const totalChapters = (course.chapters || []).length;
  const progressPercent = totalChapters > 0 ? (completedChapters / totalChapters) * 100 : 0;

  return (
    <div dir="ltr" className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-900/90 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={logo} alt="BCLT" className="h-10 w-auto rounded-lg" />
              <div className="hidden md:block">
                <h1 className="font-bold text-white text-lg truncate max-w-md">{course.name}</h1>
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    {totalChapters} chapitres
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {getTotalDuration()}h
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-3 bg-slate-800/50 rounded-full px-4 py-2">
                <div>
                  <p className="text-xs text-slate-400">Progression</p>
                  <p className="text-sm font-bold text-white">{Math.round(progressPercent)}%</p>
                </div>
                <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/courses')}
                className="rounded-xl border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700"
              >
                <ArrowRight className="ml-2 h-4 w-4" />
                Retour
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-68px)]">
        {/* Right Sidebar - Chapters List */}
        <div className="w-full lg:w-96 bg-slate-900/50 backdrop-blur-sm border-l border-slate-700/50 overflow-y-auto lg:h-[calc(100vh-68px)] order-2 lg:order-2">
          {/* Stats Banner */}
          <div className="p-4 bg-gradient-to-r from-primary/20 to-secondary/20 border-b border-slate-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Votre progression</p>
                  <p className="text-xl font-bold text-white">{completedChapters}/{totalChapters}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-transparent bg-gradient-to-r from-secondary to-yellow-400 bg-clip-text">
                  {Math.round(progressPercent)}%
                </p>
              </div>
            </div>
            <Progress value={progressPercent} className="h-2 mt-3" />
          </div>

          {/* Chapters List */}
          <div className="p-2">
            {(course.chapters || []).map((chapter, chapterIndex) => (
              <div key={chapter.id} className="mb-2">
                <div
                  onClick={() => handleChapterClick(chapter)}
                  className={`group relative overflow-hidden rounded-2xl transition-all duration-300 cursor-pointer ${chapter.locked
                    ? 'opacity-60'
                    : selectedChapter?.id === chapter.id
                      ? 'ring-2 ring-primary shadow-lg shadow-primary/20'
                      : 'hover:bg-slate-800/50'
                    }`}
                >
                  {/* Active indicator */}
                  {selectedChapter?.id === chapter.id && !chapter.locked && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-secondary rounded-r-full" />
                  )}

                  <div className={`p-4 ${selectedChapter?.id === chapter.id ? 'bg-gradient-to-r from-primary/10 to-transparent' : ''}`}>
                    <div className="flex items-center gap-4">
                      {/* Status Icon */}
                      <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all ${chapter.locked
                        ? 'bg-slate-700/50'
                        : chapter.completed
                          ? 'bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30'
                          : selectedChapter?.id === chapter.id
                            ? 'bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/30'
                            : 'bg-slate-700/50 group-hover:bg-slate-600/50'
                        }`}>
                        {chapter.locked ? (
                          <Lock className="h-5 w-5 text-slate-400" />
                        ) : chapter.completed ? (
                          <CheckCircle className="h-6 w-6 text-white" />
                        ) : selectedChapter?.id === chapter.id ? (
                          <Pause className="h-5 w-5 text-white" />
                        ) : (
                          <Play className="h-5 w-5 text-slate-300" />
                        )}
                      </div>

                      {/* Chapter info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-slate-500">Chapitre {chapterIndex + 1}</span>
                          {chapter.completed && (
                            <Badge className="bg-emerald-500/20 text-emerald-400 border-0 text-[10px] px-2 py-0">
                              Terminé
                            </Badge>
                          )}
                        </div>
                        <h3 className={`font-semibold text-sm truncate ${selectedChapter?.id === chapter.id ? 'text-white' : 'text-slate-200'
                          }`}>
                          {chapter.title}
                        </h3>
                        {chapter.duration && (
                          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {chapter.duration} min
                          </p>
                        )}
                      </div>

                      {/* Media indicators */}
                      <div className="flex flex-col gap-1 flex-shrink-0">
                        {chapter.videoUrl && (
                          <div className="w-6 h-6 rounded bg-blue-500/20 flex items-center justify-center">
                            <Video className="h-3 w-3 text-blue-400" />
                          </div>
                        )}
                        {chapter.pdfUrl && (
                          <div className="w-6 h-6 rounded bg-red-500/20 flex items-center justify-center">
                            <FileText className="h-3 w-3 text-red-400" />
                          </div>
                        )}
                        {chapter.audioUrl && (
                          <div className="w-6 h-6 rounded bg-purple-500/20 flex items-center justify-center">
                            <Headphones className="h-3 w-3 text-purple-400" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Premium upgrade */}
          {(course.chapters || []).some(c => c.locked) && (
            <div className="p-4 border-t border-slate-700/50">
              <Link to="/premium-plans" className="block">
                <div className="p-4 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-2xl hover:border-yellow-500/40 hover:from-yellow-500/20 hover:to-orange-500/20 transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                      <Crown className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-yellow-200">Contenu Premium</p>
                      <p className="text-xs text-yellow-300/60">Débloquez tous les chapitres</p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* Your Professor Card */}
          <div className="p-4 border-t border-slate-700/50">
            <div className="p-4 bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-br from-primary to-secondary rounded-full opacity-50 animate-spin" style={{ animationDuration: '10s' }} />
                  <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-primary/50">
                    <img
                      src={professor}
                      alt="Votre Formateur"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                </div>
                <div>
                  <p className="font-bold text-white text-sm">Votre Formateur</p>
                  <p className="text-xs text-slate-400">Expert Certifié • +10 ans</p>
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Video & Details */}
        <div className="flex-1 overflow-y-auto lg:h-[calc(100vh-68px)] order-1 lg:order-1">
          {selectedChapter ? (
            <div className="p-4 lg:p-8">
              {/* Chapter Header */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <Badge className="bg-primary/20 text-primary border-0">
                    Chapitre {(course.chapters || []).findIndex(c => c.id === selectedChapter.id) + 1}
                  </Badge>
                  {selectedChapter.completed && (
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-0">
                      <CheckCircle className="w-3 h-3 ml-1" />
                      Terminé
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl font-black text-white mb-2">{selectedChapter.title}</h1>
                {/* Show current lesson title if a lesson is selected */}
                {selectedLesson && (
                  <p className="text-lg text-secondary font-semibold mb-1">{selectedLesson.title}</p>
                )}
                {selectedChapter.duration && (
                  <p className="text-slate-400 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {selectedChapter.duration} minutes
                  </p>
                )}
              </div>

              {/* Lesson Selector - if chapter has multiple lessons */}
              {selectedChapter.lessons && selectedChapter.lessons.length > 1 && (
                <div className="mb-6 p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                  <p className="text-sm text-slate-400 mb-3 font-medium">Leçons du chapitre :</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedChapter.lessons.map((lesson, index) => (
                      <button
                        key={lesson.id}
                        onClick={() => handleLessonClick(lesson)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${selectedLesson?.id === lesson.id
                          ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg'
                          : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                          }`}
                      >
                        <span className="flex items-center gap-2">
                          {lesson.videoUrl && <Play className="w-3 h-3" />}
                          Leçon {index + 1}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Video Player - Use getCurrentVideoUrl() */}
              {getCurrentVideoUrl() && (
                <div className="relative rounded-3xl overflow-hidden bg-black mb-6 shadow-2xl shadow-black/50">
                  {/* Glow effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-secondary/50 rounded-3xl blur-xl opacity-30" />

                  <div className="relative aspect-video w-full">
                    {getVideoType(getCurrentVideoUrl()!) === 'bunny-stream' ? (
                      <iframe
                        src={getBunnyEmbedUrl(getCurrentVideoUrl()!)}
                        title={getCurrentTitle()}
                        className="w-full h-full border-0"
                        style={{ border: 'none' }}
                        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    ) : getVideoType(getCurrentVideoUrl()!) === 'bunny-cdn' ? (
                      // HLS streams from Bunny CDN (.m3u8)
                      <HLSVideoPlayer
                        src={getCurrentVideoUrl()!}
                        title={getCurrentTitle()}
                        className="w-full h-full"
                      />
                    ) : getVideoType(getCurrentVideoUrl()!) === 'youtube' ? (
                      <iframe
                        src={getYouTubeEmbedUrl(getCurrentVideoUrl()!)}
                        title={getCurrentTitle()}
                        className="w-full h-full border-0"
                        style={{ border: 'none' }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : getVideoType(getCurrentVideoUrl()!) === 'vimeo' ? (
                      <iframe
                        src={getVimeoEmbedUrl(getCurrentVideoUrl()!)}
                        title={getCurrentTitle()}
                        className="w-full h-full border-0"
                        style={{ border: 'none' }}
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        src={getCurrentVideoUrl()!}
                        title={getCurrentTitle()}
                        className="w-full h-full"
                        controls
                        controlsList="nodownload"
                        playsInline
                      >
                        Votre navigateur ne supporte pas la lecture vidéo.
                      </video>
                    )}
                  </div>
                </div>
              )}

              {/* No video placeholder */}
              {!getCurrentVideoUrl() && (
                <div className="aspect-video w-full rounded-3xl bg-slate-800/50 mb-6 flex items-center justify-center border border-slate-700/50">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-slate-700/50 flex items-center justify-center">
                      <Video className="h-10 w-10 text-slate-500" />
                    </div>
                    <p className="text-slate-400 font-medium">Aucune vidéo pour ce contenu</p>
                    <p className="text-slate-500 text-sm mt-1">Consultez les ressources ci-dessous</p>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mb-6">
                <Button
                  variant="outline"
                  onClick={() => navigateToChapter('next')}
                  disabled={!canNavigate('next')}
                  className="rounded-xl border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-30"
                >
                  <ArrowRight className="ml-2 h-4 w-4" />
                  Chapitre suivant
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigateToChapter('prev')}
                  disabled={!canNavigate('prev')}
                  className="rounded-xl border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-30"
                >
                  Chapitre précédent
                  <ArrowLeft className="mr-2 h-4 w-4" />
                </Button>
              </div>

              {/* Content Tabs */}
              <Card className="border-0 shadow-xl bg-slate-800/50 backdrop-blur-sm overflow-hidden">
                <Tabs defaultValue="description" className="w-full">
                  <TabsList className="w-full justify-start bg-slate-900/50 rounded-none p-0 h-auto border-b border-slate-700/50 flex-wrap">
                    <TabsTrigger
                      value="description"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-white px-6 py-4 text-slate-400"
                    >
                      <FileText className="w-4 h-4 ml-2" />
                      Description
                    </TabsTrigger>
                    <TabsTrigger
                      value="course"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-white px-6 py-4 text-slate-400"
                    >
                      <BookOpen className="w-4 h-4 ml-2" />
                      Cours
                    </TabsTrigger>
                    <TabsTrigger
                      value="resources"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-white px-6 py-4 text-slate-400"
                    >
                      <Download className="w-4 h-4 ml-2" />
                      Ressources
                    </TabsTrigger>
                    {/* Quiz IA and Voice Quiz - Only show on last lesson of chapter */}
                    {isLastLesson() && (
                      <>
                        <TabsTrigger
                          value="quiz"
                          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-white px-6 py-4 text-slate-400"
                        >
                          <Sparkles className="w-4 h-4 ml-2" />
                          Quiz IA
                        </TabsTrigger>
                        <TabsTrigger
                          value="voice-quiz"
                          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-white px-6 py-4 text-slate-400"
                        >
                          <Mic className="w-4 h-4 ml-2" />
                          Quiz Vocal
                        </TabsTrigger>
                      </>
                    )}
                  </TabsList>

                  <CardContent className="pt-6">
                    <TabsContent value="description" className="mt-0">
                      <div className="prose prose-invert max-w-none">
                        {selectedChapter.description ? (
                          <p className="text-slate-300 leading-relaxed">{selectedChapter.description}</p>
                        ) : (
                          <p className="text-slate-500">Aucune description disponible pour ce chapitre.</p>
                        )}
                      </div>

                    </TabsContent>

                    <TabsContent value="course" className="mt-0">
                      <div className="prose prose-invert max-w-none">
                        {selectedChapter.content ? (
                          <div dangerouslySetInnerHTML={{ __html: selectedChapter.content }} className="text-slate-300" />
                        ) : (
                          <div className="text-center py-8">
                            <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                            <p className="text-slate-500">Aucun contenu de cours disponible.</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="resources" className="mt-0">
                      <div className="space-y-4">
                        {/* Lesson resources first (if lesson selected) */}
                        {selectedLesson?.pdfUrl && (
                          <a
                            href={selectedLesson.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-2xl hover:bg-slate-700/50 transition-all duration-300 group border border-slate-600/30 hover:border-red-500/30"
                          >
                            <div className="p-3 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl shadow-lg group-hover:shadow-red-500/30 transition-shadow">
                              <FileText className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-white">Document PDF - Leçon</p>
                              <p className="text-sm text-slate-400">Support de la leçon à télécharger</p>
                            </div>
                            <Download className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
                          </a>
                        )}

                        {selectedLesson?.audioUrl && (
                          <a
                            href={selectedLesson.audioUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-2xl hover:bg-slate-700/50 transition-all duration-300 group border border-slate-600/30 hover:border-purple-500/30"
                          >
                            <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl shadow-lg group-hover:shadow-purple-500/30 transition-shadow">
                              <Headphones className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-white">Audio - Leçon</p>
                              <p className="text-sm text-slate-400">Écoutez la leçon en audio</p>
                            </div>
                            <Download className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
                          </a>
                        )}

                        {/* Chapter resources */}
                        {selectedChapter.pdfUrl && (
                          <a
                            href={selectedChapter.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-2xl hover:bg-slate-700/50 transition-all duration-300 group border border-slate-600/30 hover:border-red-500/30"
                          >
                            <div className="p-3 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl shadow-lg group-hover:shadow-red-500/30 transition-shadow">
                              <FileText className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-white">Document PDF - Chapitre</p>
                              <p className="text-sm text-slate-400">Support de cours à télécharger</p>
                            </div>
                            <Download className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
                          </a>
                        )}

                        {selectedChapter.audioUrl && (
                          <a
                            href={selectedChapter.audioUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-2xl hover:bg-slate-700/50 transition-all duration-300 group border border-slate-600/30 hover:border-purple-500/30"
                          >
                            <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl shadow-lg group-hover:shadow-purple-500/30 transition-shadow">
                              <Headphones className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-white">Audio - Chapitre</p>
                              <p className="text-sm text-slate-400">Écoutez le cours en audio</p>
                            </div>
                            <Download className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
                          </a>
                        )}

                        {!selectedChapter.pdfUrl && !selectedChapter.audioUrl && !selectedLesson?.pdfUrl && !selectedLesson?.audioUrl && (
                          <div className="text-center py-12">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-700/30 flex items-center justify-center">
                              <FileText className="h-8 w-8 text-slate-600" />
                            </div>
                            <p className="text-slate-400 font-medium">Aucune ressource disponible</p>
                            <p className="text-slate-500 text-sm mt-1">Ce contenu ne contient pas de fichiers téléchargeables</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    {/* Quiz IA Tab - Only on last lesson */}
                    {isLastLesson() && (
                      <TabsContent value="quiz" className="mt-0">
                        <ChapterQuiz
                          chapterId={selectedChapter.id}
                          chapterTitle={selectedChapter.title}
                          thematicGroup={course?.id ? Math.min(Math.max(course.id, 1), 6) : 1}
                        />
                      </TabsContent>
                    )}

                    {/* Voice Quiz Tab - Only on last lesson */}
                    {isLastLesson() && (
                      <TabsContent value="voice-quiz" className="mt-0">
                        <VoiceQuiz
                          chapterId={selectedChapter.id}
                          chapterTitle={selectedChapter.title}
                          thematicGroup={course?.id ? Math.min(Math.max(course.id, 1), 6) : 1}
                        />
                      </TabsContent>
                    )}
                  </CardContent>
                </Tabs>
              </Card>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-8">
                <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <Play className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Sélectionnez un chapitre</h3>
                <p className="text-slate-400 max-w-sm mx-auto">
                  Choisissez un chapitre dans le menu à droite pour commencer votre apprentissage
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
