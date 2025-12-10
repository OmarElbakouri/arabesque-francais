import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Plus,
  Edit,
  Trash2,
  Upload,
  FileText,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  Headphones,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Clock,
  Video,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Play,
  BookOpen,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { adminService } from '@/services/adminService';
import HLSVideoPlayer from '@/components/HLSVideoPlayer';

// Interfaces TypeScript
interface Course {
  id: number;
  title?: string;
  name?: string;
  description?: string;
  level?: string;
  chaptersCount?: number;
}

interface Lesson {
  id: number;
  chapterId: number;
  title: string;
  description?: string | null;
  videoUrl?: string | null;
  pdfUrl?: string | null;
  duration?: string | null;
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

interface Chapter {
  id: number;
  courseId: number;
  title: string;
  description?: string;
  orderIndex: number;
  videoUrl?: string;
  pdfUrl?: string;
  audioUrl?: string;
  durationMinutes?: number;
  isLocked?: boolean;
  status?: 'DRAFT' | 'PUBLISHED';
  published?: boolean;
  totalLessons?: number;
  quizPrompt?: string;
  voiceQuizPrompt?: string;
  lessons?: Lesson[];
  createdAt?: string;
  updatedAt?: string;
}

interface ChapterFormData {
  title: string;
  description: string;
  videoUrl: string;
  pdfUrl: string;
  audioUrl: string;
  durationMinutes: number;
  isLocked: boolean;
  quizPrompt: string;
  voiceQuizPrompt: string;
}

interface LessonFormData {
  title: string;
  description: string;
  videoUrl: string;
  pdfUrl: string;
  duration: string;
  displayOrder: number;
}

export default function AdminChapters() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courseId || '');
  const [course, setCourse] = useState<Course | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [formData, setFormData] = useState<ChapterFormData>({
    title: '',
    description: '',
    videoUrl: '',
    pdfUrl: '',
    audioUrl: '',
    durationMinutes: 0,
    isLocked: false,
    quizPrompt: '',
    voiceQuizPrompt: '',
  });

  // États pour les leçons
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(new Set());
  const [chapterLessons, setChapterLessons] = useState<Record<number, Lesson[]>>({});
  const [loadingLessons, setLoadingLessons] = useState<Set<number>>(new Set());
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [isEditLessonModalOpen, setIsEditLessonModalOpen] = useState(false);
  const [selectedChapterId, setSelectedChapterId] = useState<number | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessonFormData, setLessonFormData] = useState<LessonFormData>({
    title: '',
    description: '',
    videoUrl: '',
    pdfUrl: '',
    duration: '',
    displayOrder: 1,
  });

  // États pour le lecteur vidéo
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedVideoLesson, setSelectedVideoLesson] = useState<Lesson | null>(null);

  // Charger la liste des cours au démarrage
  useEffect(() => {
    loadCourses();
  }, []);

  // Charger les chapitres quand un cours est sélectionné
  useEffect(() => {
    if (selectedCourseId) {
      loadCourseAndChapters();
    } else {
      setLoading(false);
      setCourse(null);
      setChapters([]);
    }
  }, [selectedCourseId]);

  // Si courseId change dans l'URL
  useEffect(() => {
    if (courseId) {
      setSelectedCourseId(courseId);
    }
  }, [courseId]);

  const loadCourses = async () => {
    try {
      const data = await adminService.getAllCourses();
      setCourses(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des cours:', error);
    }
  };

  const loadCourseAndChapters = async () => {
    try {
      setLoading(true);
      const [courseData, chaptersData] = await Promise.all([
        adminService.getCourseById(Number(selectedCourseId)),
        adminService.getCourseChapters(Number(selectedCourseId)),
      ]);
      setCourse(courseData);
      setChapters(chaptersData || []);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données du cours',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChapter = async () => {
    try {
      if (!formData.title) {
        toast({
          title: 'Erreur',
          description: 'Le titre est obligatoire',
          variant: 'destructive',
        });
        return;
      }

      await adminService.createChapter(Number(selectedCourseId), {
        title: formData.title,
        description: formData.description,
        videoUrl: formData.videoUrl || undefined,
        pdfUrl: formData.pdfUrl || undefined,
        audioUrl: formData.audioUrl || undefined,
        durationMinutes: formData.durationMinutes,
        isLocked: formData.isLocked,
        quizPrompt: formData.quizPrompt || undefined,
        voiceQuizPrompt: formData.voiceQuizPrompt || undefined,
      });

      toast({
        title: 'Succès',
        description: 'Chapitre créé avec succès',
      });

      setIsCreateModalOpen(false);
      resetForm();
      loadCourseAndChapters();
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer le chapitre',
        variant: 'destructive',
      });
    }
  };

  const handleEditChapter = async () => {
    if (!editingChapter) return;

    try {
      await adminService.updateChapter(editingChapter.id, {
        title: formData.title,
        description: formData.description,
        videoUrl: formData.videoUrl || undefined,
        pdfUrl: formData.pdfUrl || undefined,
        audioUrl: formData.audioUrl || undefined,
        durationMinutes: formData.durationMinutes,
        isLocked: formData.isLocked,
        quizPrompt: formData.quizPrompt || undefined,
        voiceQuizPrompt: formData.voiceQuizPrompt || undefined,
      });

      toast({
        title: 'Succès',
        description: 'Chapitre modifié avec succès',
      });

      setIsEditModalOpen(false);
      setEditingChapter(null);
      resetForm();
      loadCourseAndChapters();
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier le chapitre',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteChapter = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce chapitre ?')) {
      return;
    }

    try {
      await adminService.deleteChapter(id);
      toast({
        title: 'Succès',
        description: 'Chapitre supprimé avec succès',
      });
      loadCourseAndChapters();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le chapitre',
        variant: 'destructive',
      });
    }
  };

  const handleMoveChapter = async (chapterId: number, direction: 'up' | 'down') => {
    const currentIndex = chapters.findIndex((c) => c.id === chapterId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= chapters.length) return;

    // Create new order array
    const newOrder = chapters.map((c) => c.id);
    [newOrder[currentIndex], newOrder[newIndex]] = [newOrder[newIndex], newOrder[currentIndex]];

    try {
      await adminService.reorderChapters(Number(selectedCourseId), newOrder);
      toast({
        title: 'Succès',
        description: 'Ordre des chapitres mis à jour',
      });
      loadCourseAndChapters();
    } catch (error) {
      console.error('Erreur lors du réordonnancement:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de réordonner les chapitres',
        variant: 'destructive',
      });
    }
  };

  const openEditModal = (chapter: Chapter) => {
    setEditingChapter(chapter);
    setFormData({
      title: chapter.title,
      description: chapter.description || '',
      videoUrl: chapter.videoUrl || '',
      pdfUrl: chapter.pdfUrl || '',
      audioUrl: chapter.audioUrl || '',
      durationMinutes: chapter.durationMinutes || 0,
      isLocked: chapter.isLocked,
      quizPrompt: chapter.quizPrompt || '',
      voiceQuizPrompt: chapter.voiceQuizPrompt || '',
    });
    setIsEditModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      videoUrl: '',
      pdfUrl: '',
      audioUrl: '',
      durationMinutes: 0,
      isLocked: false,
      quizPrompt: '',
      voiceQuizPrompt: '',
    });
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const result = await adminService.uploadChapterPdf(file);
      setFormData({ ...formData, pdfUrl: result.pdfPath });
      toast({
        title: 'Succès',
        description: 'PDF uploadé avec succès',
      });
    } catch (error) {
      console.error('Erreur upload PDF:', error);
      toast({
        title: 'Erreur',
        description: "Impossible d'uploader le PDF",
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const result = await adminService.uploadChapterAudio(file);
      setFormData({ ...formData, audioUrl: result.audioPath });
      toast({
        title: 'Succès',
        description: 'Audio uploadé avec succès',
      });
    } catch (error) {
      console.error('Erreur upload audio:', error);
      toast({
        title: 'Erreur',
        description: "Impossible d'uploader l'audio",
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  // ==================== LESSON MANAGEMENT ====================

  const toggleChapterExpand = async (chapterId: number) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId);
    } else {
      newExpanded.add(chapterId);
      // Load lessons if not already loaded
      if (!chapterLessons[chapterId]) {
        await loadLessonsForChapter(chapterId);
      }
    }
    setExpandedChapters(newExpanded);
  };

  const loadLessonsForChapter = async (chapterId: number) => {
    try {
      setLoadingLessons(prev => new Set(prev).add(chapterId));
      const lessons = await adminService.getLessonsByChapter(chapterId);
      setChapterLessons(prev => ({ ...prev, [chapterId]: lessons || [] }));
    } catch (error) {
      console.error('Erreur chargement leçons:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les leçons',
        variant: 'destructive',
      });
    } finally {
      setLoadingLessons(prev => {
        const newSet = new Set(prev);
        newSet.delete(chapterId);
        return newSet;
      });
    }
  };

  const openCreateLessonModal = (chapterId: number) => {
    setSelectedChapterId(chapterId);
    const existingLessons = chapterLessons[chapterId] || [];
    setLessonFormData({
      title: '',
      description: '',
      videoUrl: '',
      pdfUrl: '',
      duration: '',
      displayOrder: existingLessons.length + 1,
    });
    setIsLessonModalOpen(true);
  };

  const openEditLessonModal = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setLessonFormData({
      title: lesson.title,
      description: lesson.description || '',
      videoUrl: lesson.videoUrl || '',
      pdfUrl: lesson.pdfUrl || '',
      duration: lesson.duration || '',
      displayOrder: lesson.displayOrder,
    });
    setIsEditLessonModalOpen(true);
  };

  const handleCreateLesson = async () => {
    if (!selectedChapterId || !lessonFormData.title) {
      toast({
        title: 'Erreur',
        description: 'Le titre est obligatoire',
        variant: 'destructive',
      });
      return;
    }

    try {
      await adminService.createLesson({
        chapterId: selectedChapterId,
        title: lessonFormData.title,
        description: lessonFormData.description || undefined,
        videoUrl: lessonFormData.videoUrl || undefined,
        duration: lessonFormData.duration || undefined,
        displayOrder: lessonFormData.displayOrder,
      });

      toast({
        title: 'Succès',
        description: 'Leçon créée avec succès',
      });

      setIsLessonModalOpen(false);
      resetLessonForm();
      await loadLessonsForChapter(selectedChapterId);
    } catch (error) {
      console.error('Erreur création leçon:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer la leçon',
        variant: 'destructive',
      });
    }
  };

  const handleEditLesson = async () => {
    if (!editingLesson) return;

    try {
      await adminService.updateLesson(editingLesson.id, {
        title: lessonFormData.title,
        description: lessonFormData.description || undefined,
        videoUrl: lessonFormData.videoUrl || undefined,
        duration: lessonFormData.duration || undefined,
        displayOrder: lessonFormData.displayOrder,
      });

      toast({
        title: 'Succès',
        description: 'Leçon modifiée avec succès',
      });

      setIsEditLessonModalOpen(false);
      setEditingLesson(null);
      resetLessonForm();
      await loadLessonsForChapter(editingLesson.chapterId);
    } catch (error) {
      console.error('Erreur modification leçon:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier la leçon',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteLesson = async (lesson: Lesson) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette leçon ?')) {
      return;
    }

    try {
      await adminService.deleteLesson(lesson.id);
      toast({
        title: 'Succès',
        description: 'Leçon supprimée avec succès',
      });
      await loadLessonsForChapter(lesson.chapterId);
    } catch (error) {
      console.error('Erreur suppression leçon:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la leçon',
        variant: 'destructive',
      });
    }
  };

  const resetLessonForm = () => {
    setLessonFormData({
      title: '',
      description: '',
      videoUrl: '',
      pdfUrl: '',
      duration: '',
      displayOrder: 1,
    });
    setSelectedChapterId(null);
  };

  // ==================== VIDEO PLAYER FUNCTIONS ====================

  // Détecter le type de vidéo (Bunny Stream, direct, YouTube)
  const getVideoType = (url: string): 'bunny-stream' | 'bunny-cdn' | 'direct' | 'youtube' => {
    if (!url) return 'direct';
    
    // Bunny Stream embed or play URLs
    if (url.includes('iframe.mediadelivery.net') || url.includes('video.bunnycdn.com')) {
      return 'bunny-stream';
    }
    
    // Bunny CDN direct video URLs (HLS streams or direct files)
    if (url.includes('.b-cdn.net') || (url.includes('vz-') && url.includes('.b-cdn.net'))) {
      return 'bunny-cdn';
    }
    
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube';
    }
    
    return 'direct';
  };

  // Formater l'URL pour l'embed Bunny Stream
  const getBunnyEmbedUrl = (url: string): string => {
    // Already an embed URL - just ensure proper params
    if (url.includes('iframe.mediadelivery.net/embed/')) {
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
    
    return url;
  };

  // Formater l'URL YouTube pour l'embed
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

  // Ouvrir le modal vidéo
  const handlePlayVideo = (lesson: Lesson) => {
    if (lesson.videoUrl) {
      setSelectedVideoLesson(lesson);
      setVideoModalOpen(true);
    } else {
      toast({
        title: 'Erreur',
        description: "Cette leçon n'a pas de vidéo",
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status?: string) => {
    return status === 'PUBLISHED' ? (
      <Badge className="bg-green-500 text-white">
        <Eye className="mr-1 h-3 w-3" />
        Publié
      </Badge>
    ) : (
      <Badge className="bg-gray-500 text-white">
        <EyeOff className="mr-1 h-3 w-3" />
        Brouillon
      </Badge>
    );
  };

  // Stats calculations
  const totalLessons = Object.values(chapterLessons).reduce((sum, lessons) => sum + lessons.length, 0);
  const stats = {
    total: chapters.length,
    published: chapters.filter((c) => c.status === 'PUBLISHED' || c.published).length,
    locked: chapters.filter((c) => c.isLocked).length,
    totalDuration: chapters.reduce((sum, c) => sum + (c.durationMinutes || 0), 0),
    totalLessons: totalLessons || chapters.reduce((sum, c) => sum + (c.totalLessons || 0), 0),
  };

  if (loading && selectedCourseId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si aucun cours n'est sélectionné, afficher le sélecteur de cours
  if (!selectedCourseId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/courses')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux cours
          </Button>
          <h1 className="text-3xl font-bold">Gestion des Chapitres</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sélectionner un cours</CardTitle>
            <CardDescription>
              Choisissez un cours pour gérer ses chapitres
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={selectedCourseId}
              onValueChange={(value) => setSelectedCourseId(value)}
            >
              <SelectTrigger className="w-full md:w-96">
                <SelectValue placeholder="Sélectionner un cours..." />
              </SelectTrigger>
              <SelectContent>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.title || c.name || `Cours #${c.id}`} - {c.level || 'N/A'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/courses')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux cours
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Chapitres du cours</h1>
            {course && (
              <p className="text-gray-500 mt-1">
                {course.title || course.name} - {course.level}
              </p>
            )}
          </div>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau Chapitre
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-gray-500">Chapitres</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 rounded-full">
                <Play className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalLessons}</p>
                <p className="text-sm text-gray-500">Leçons</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.published}</p>
                <p className="text-sm text-gray-500">Publiés</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Lock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.locked}</p>
                <p className="text-sm text-gray-500">Verrouillés</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalDuration} min</p>
                <p className="text-sm text-gray-500">Durée</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chapters with Lessons */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Chapitres ({chapters.length})</CardTitle>
          <CardDescription>Cliquez sur un chapitre pour voir et gérer ses leçons</CardDescription>
        </CardHeader>
        <CardContent>
          {chapters.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Aucun chapitre pour ce cours</p>
              <p className="text-sm mt-2">Commencez par ajouter un chapitre</p>
            </div>
          ) : (
            <div className="space-y-3">
              {chapters
                .sort((a, b) => a.orderIndex - b.orderIndex)
                .map((chapter, index) => (
                  <Collapsible
                    key={chapter.id}
                    open={expandedChapters.has(chapter.id)}
                    onOpenChange={() => toggleChapterExpand(chapter.id)}
                  >
                    <div className="border rounded-lg">
                      {/* Chapter Header */}
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-t-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <CollapsibleTrigger asChild>
                              <Button variant="ghost" size="sm" className="p-1">
                                {expandedChapters.has(chapter.id) ? (
                                  <ChevronUp className="h-5 w-5" />
                                ) : (
                                  <ChevronDown className="h-5 w-5" />
                                )}
                              </Button>
                            </CollapsibleTrigger>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-500">#{chapter.orderIndex}</span>
                              <GripVertical className="h-4 w-4 text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold">{chapter.title}</p>
                              {chapter.description && (
                                <p className="text-sm text-gray-500 line-clamp-1">{chapter.description}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            {/* Badges info */}
                            <div className="hidden md:flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                <Play className="h-3 w-3 mr-1" />
                                {chapter.totalLessons || chapterLessons[chapter.id]?.length || 0} leçons
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                {chapter.durationMinutes || 0} min
                              </Badge>
                              {chapter.isLocked ? (
                                <Badge className="bg-yellow-500 text-white text-xs">
                                  <Lock className="h-3 w-3 mr-1" />
                                  Verrouillé
                                </Badge>
                              ) : (
                                <Badge className="bg-green-500 text-white text-xs">
                                  <Unlock className="h-3 w-3 mr-1" />
                                  Libre
                                </Badge>
                              )}
                              {getStatusBadge(chapter.status || (chapter.published ? 'PUBLISHED' : 'DRAFT'))}
                            </div>
                            
                            {/* Actions */}
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); handleMoveChapter(chapter.id, 'up'); }}
                                disabled={index === 0}
                                title="Monter"
                              >
                                <ArrowUp className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); handleMoveChapter(chapter.id, 'down'); }}
                                disabled={index === chapters.length - 1}
                                title="Descendre"
                              >
                                <ArrowDown className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); openEditModal(chapter); }}
                                title="Modifier"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); handleDeleteChapter(chapter.id); }}
                                title="Supprimer"
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Lessons Content */}
                      <CollapsibleContent>
                        <div className="p-4 border-t bg-white dark:bg-gray-900">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium text-gray-700 dark:text-gray-300">
                              Leçons du chapitre
                            </h4>
                            <Button
                              size="sm"
                              onClick={() => openCreateLessonModal(chapter.id)}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Ajouter une leçon
                            </Button>
                          </div>
                          
                          {loadingLessons.has(chapter.id) ? (
                            <div className="flex items-center justify-center py-8">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                            </div>
                          ) : (chapterLessons[chapter.id]?.length || 0) === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                              <Play className="w-10 h-10 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">Aucune leçon dans ce chapitre</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {chapterLessons[chapter.id]
                                ?.sort((a, b) => a.displayOrder - b.displayOrder)
                                .map((lesson) => (
                                  <div
                                    key={lesson.id}
                                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    onClick={() => handlePlayVideo(lesson)}
                                  >
                                    <div className="flex items-center gap-3">
                                      <span className="text-xs text-gray-400 w-6">
                                        {lesson.displayOrder}.
                                      </span>
                                      <div 
                                        className={`p-1.5 rounded-full ${lesson.videoUrl ? 'bg-indigo-100 dark:bg-indigo-900' : 'bg-gray-200 dark:bg-gray-600'}`}
                                      >
                                        <Play className={`h-3 w-3 ${lesson.videoUrl ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`} />
                                      </div>
                                      <div>
                                        <p className="font-medium text-sm">{lesson.title}</p>
                                        {lesson.duration && (
                                          <p className="text-xs text-gray-500">{lesson.duration}</p>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {lesson.videoUrl && (
                                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                          <Video className="h-3 w-3 mr-1" />
                                          Vidéo
                                        </Badge>
                                      )}
                                      {lesson.pdfUrl && (
                                        <Badge variant="outline" className="text-xs">
                                          <FileText className="h-3 w-3 mr-1" />
                                          PDF
                                        </Badge>
                                      )}
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => { e.stopPropagation(); openEditLessonModal(lesson); }}
                                        title="Modifier"
                                      >
                                        <Edit className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => { e.stopPropagation(); handleDeleteLesson(lesson); }}
                                        title="Supprimer"
                                      >
                                        <Trash2 className="h-3 w-3 text-red-500" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Créer un nouveau chapitre</DialogTitle>
            <DialogDescription>
              Remplissez les informations du chapitre. Le titre est obligatoire.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Titre du chapitre"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description du chapitre"
                rows={3}
              />
            </div>

            {/* AI Quiz Prompts Section */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
              <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
                🤖 Prompts IA pour les Quiz
              </h4>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="quizPrompt">📝 Prompt Quiz Normal</Label>
                    <span className="text-xs text-muted-foreground">(Optionnel)</span>
                  </div>
                  <Textarea
                    id="quizPrompt"
                    value={formData.quizPrompt}
                    onChange={(e) => setFormData({ ...formData, quizPrompt: e.target.value })}
                    placeholder="Ex: Génère des questions sur la conjugaison des verbes être et avoir au présent et au passé composé..."
                    rows={3}
                    maxLength={2000}
                  />
                  <p className="text-xs text-muted-foreground">
                    Instructions personnalisées pour l'IA. Si vide, l'IA utilisera le titre du chapitre.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="voiceQuizPrompt">🎤 Prompt Quiz Vocal</Label>
                    <span className="text-xs text-muted-foreground">(Optionnel)</span>
                  </div>
                  <Textarea
                    id="voiceQuizPrompt"
                    value={formData.voiceQuizPrompt}
                    onChange={(e) => setFormData({ ...formData, voiceQuizPrompt: e.target.value })}
                    placeholder="Ex: Crée des exercices de prononciation pour les formes conjuguées..."
                    rows={3}
                    maxLength={2000}
                  />
                  <p className="text-xs text-muted-foreground">
                    Instructions pour les exercices de prononciation et d'écoute.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Durée (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="0"
                  value={formData.durationMinutes}
                  onChange={(e) =>
                    setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 0 })
                  }
                  placeholder="Durée en minutes"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="videoUrl">URL Vidéo</Label>
                <Input
                  id="videoUrl"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  placeholder="https://youtube.com/..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>PDF du chapitre</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={handlePdfUpload}
                    disabled={uploading}
                    className="hidden"
                    id="pdf-upload-create"
                  />
                  <label htmlFor="pdf-upload-create" className="w-full">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      disabled={uploading}
                      asChild
                    >
                      <span>
                        <FileText className="mr-2 h-4 w-4" />
                        {uploading ? 'Upload...' : 'Uploader PDF'}
                      </span>
                    </Button>
                  </label>
                </div>
                {formData.pdfUrl && <p className="text-xs text-green-600">✓ PDF uploadé</p>}
              </div>
              <div className="space-y-2">
                <Label>Audio du chapitre</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioUpload}
                    disabled={uploading}
                    className="hidden"
                    id="audio-upload-create"
                  />
                  <label htmlFor="audio-upload-create" className="w-full">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      disabled={uploading}
                      asChild
                    >
                      <span>
                        <Headphones className="mr-2 h-4 w-4" />
                        {uploading ? 'Upload...' : 'Uploader Audio'}
                      </span>
                    </Button>
                  </label>
                </div>
                {formData.audioUrl && <p className="text-xs text-green-600">✓ Audio uploadé</p>}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isLocked"
                checked={formData.isLocked}
                onCheckedChange={(checked) => setFormData({ ...formData, isLocked: checked })}
              />
              <Label htmlFor="isLocked">Chapitre verrouillé (réservé aux abonnés)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateChapter}>Créer le chapitre</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le chapitre</DialogTitle>
            <DialogDescription>Modifiez les informations du chapitre.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Titre *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Titre du chapitre"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description du chapitre"
                rows={3}
              />
            </div>

            {/* AI Quiz Prompts Section */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
              <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
                🤖 Prompts IA pour les Quiz
              </h4>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="edit-quizPrompt">📝 Prompt Quiz Normal</Label>
                    <span className="text-xs text-muted-foreground">(Optionnel)</span>
                  </div>
                  <Textarea
                    id="edit-quizPrompt"
                    value={formData.quizPrompt}
                    onChange={(e) => setFormData({ ...formData, quizPrompt: e.target.value })}
                    placeholder="Ex: Génère des questions sur la conjugaison des verbes être et avoir au présent et au passé composé..."
                    rows={3}
                    maxLength={2000}
                  />
                  <p className="text-xs text-muted-foreground">
                    Instructions personnalisées pour l'IA. Si vide, l'IA utilisera le titre du chapitre.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="edit-voiceQuizPrompt">🎤 Prompt Quiz Vocal</Label>
                    <span className="text-xs text-muted-foreground">(Optionnel)</span>
                  </div>
                  <Textarea
                    id="edit-voiceQuizPrompt"
                    value={formData.voiceQuizPrompt}
                    onChange={(e) => setFormData({ ...formData, voiceQuizPrompt: e.target.value })}
                    placeholder="Ex: Crée des exercices de prononciation pour les formes conjuguées..."
                    rows={3}
                    maxLength={2000}
                  />
                  <p className="text-xs text-muted-foreground">
                    Instructions pour les exercices de prononciation et d'écoute.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-duration">Durée (minutes)</Label>
                <Input
                  id="edit-duration"
                  type="number"
                  min="0"
                  value={formData.durationMinutes}
                  onChange={(e) =>
                    setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 0 })
                  }
                  placeholder="Durée en minutes"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-videoUrl">URL Vidéo</Label>
                <Input
                  id="edit-videoUrl"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  placeholder="https://youtube.com/..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>PDF du chapitre</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={handlePdfUpload}
                    disabled={uploading}
                    className="hidden"
                    id="pdf-upload-edit"
                  />
                  <label htmlFor="pdf-upload-edit" className="w-full">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      disabled={uploading}
                      asChild
                    >
                      <span>
                        <FileText className="mr-2 h-4 w-4" />
                        {uploading ? 'Upload...' : 'Uploader PDF'}
                      </span>
                    </Button>
                  </label>
                </div>
                {formData.pdfUrl && (
                  <p className="text-xs text-green-600">✓ PDF: {formData.pdfUrl}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Audio du chapitre</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioUpload}
                    disabled={uploading}
                    className="hidden"
                    id="audio-upload-edit"
                  />
                  <label htmlFor="audio-upload-edit" className="w-full">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      disabled={uploading}
                      asChild
                    >
                      <span>
                        <Headphones className="mr-2 h-4 w-4" />
                        {uploading ? 'Upload...' : 'Uploader Audio'}
                      </span>
                    </Button>
                  </label>
                </div>
                {formData.audioUrl && (
                  <p className="text-xs text-green-600">✓ Audio: {formData.audioUrl}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="edit-isLocked"
                checked={formData.isLocked}
                onCheckedChange={(checked) => setFormData({ ...formData, isLocked: checked })}
              />
              <Label htmlFor="edit-isLocked">Chapitre verrouillé (réservé aux abonnés)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleEditChapter}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Lesson Modal */}
      <Dialog open={isLessonModalOpen} onOpenChange={setIsLessonModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Ajouter une leçon</DialogTitle>
            <DialogDescription>
              Créez une nouvelle leçon pour ce chapitre.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="lesson-title">Titre *</Label>
              <Input
                id="lesson-title"
                value={lessonFormData.title}
                onChange={(e) => setLessonFormData({ ...lessonFormData, title: e.target.value })}
                placeholder="Titre de la leçon"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lesson-description">Description</Label>
              <Textarea
                id="lesson-description"
                value={lessonFormData.description}
                onChange={(e) => setLessonFormData({ ...lessonFormData, description: e.target.value })}
                placeholder="Description de la leçon"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lesson-videoUrl">URL Vidéo</Label>
                <Input
                  id="lesson-videoUrl"
                  value={lessonFormData.videoUrl}
                  onChange={(e) => setLessonFormData({ ...lessonFormData, videoUrl: e.target.value })}
                  placeholder="https://youtube.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lesson-duration">Durée</Label>
                <Input
                  id="lesson-duration"
                  value={lessonFormData.duration}
                  onChange={(e) => setLessonFormData({ ...lessonFormData, duration: e.target.value })}
                  placeholder="Ex: 15:30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lesson-order">Ordre d'affichage</Label>
              <Input
                id="lesson-order"
                type="number"
                min="1"
                value={lessonFormData.displayOrder}
                onChange={(e) => setLessonFormData({ ...lessonFormData, displayOrder: parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsLessonModalOpen(false); resetLessonForm(); }}>
              Annuler
            </Button>
            <Button onClick={handleCreateLesson}>Créer la leçon</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Lesson Modal */}
      <Dialog open={isEditLessonModalOpen} onOpenChange={setIsEditLessonModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Modifier la leçon</DialogTitle>
            <DialogDescription>
              Modifiez les informations de la leçon.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-lesson-title">Titre *</Label>
              <Input
                id="edit-lesson-title"
                value={lessonFormData.title}
                onChange={(e) => setLessonFormData({ ...lessonFormData, title: e.target.value })}
                placeholder="Titre de la leçon"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-lesson-description">Description</Label>
              <Textarea
                id="edit-lesson-description"
                value={lessonFormData.description}
                onChange={(e) => setLessonFormData({ ...lessonFormData, description: e.target.value })}
                placeholder="Description de la leçon"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-lesson-videoUrl">URL Vidéo</Label>
                <Input
                  id="edit-lesson-videoUrl"
                  value={lessonFormData.videoUrl}
                  onChange={(e) => setLessonFormData({ ...lessonFormData, videoUrl: e.target.value })}
                  placeholder="https://youtube.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-lesson-duration">Durée</Label>
                <Input
                  id="edit-lesson-duration"
                  value={lessonFormData.duration}
                  onChange={(e) => setLessonFormData({ ...lessonFormData, duration: e.target.value })}
                  placeholder="Ex: 15:30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-lesson-order">Ordre d'affichage</Label>
              <Input
                id="edit-lesson-order"
                type="number"
                min="1"
                value={lessonFormData.displayOrder}
                onChange={(e) => setLessonFormData({ ...lessonFormData, displayOrder: parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsEditLessonModalOpen(false); setEditingLesson(null); resetLessonForm(); }}>
              Annuler
            </Button>
            <Button onClick={handleEditLesson}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Lecteur Vidéo - Support Bunny.net */}
      <Dialog open={videoModalOpen} onOpenChange={setVideoModalOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-full">
                <Play className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              {selectedVideoLesson?.title}
            </DialogTitle>
            <DialogDescription>
              Lecteur vidéo pour la leçon sélectionnée
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 p-6 pt-4">
            {selectedVideoLesson?.videoUrl && (
              <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
                {getVideoType(selectedVideoLesson.videoUrl) === 'bunny-stream' ? (
                  // Bunny Stream - iframe embed
                  <iframe
                    src={getBunnyEmbedUrl(selectedVideoLesson.videoUrl)}
                    title={selectedVideoLesson.title}
                    className="w-full h-full border-0"
                    style={{ border: 'none' }}
                    allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : getVideoType(selectedVideoLesson.videoUrl) === 'bunny-cdn' ? (
                  // Bunny CDN HLS streams (.m3u8)
                  <HLSVideoPlayer
                    src={selectedVideoLesson.videoUrl}
                    title={selectedVideoLesson.title}
                    className="w-full h-full"
                  />
                ) : getVideoType(selectedVideoLesson.videoUrl) === 'youtube' ? (
                  // YouTube
                  <iframe
                    src={getYouTubeEmbedUrl(selectedVideoLesson.videoUrl)}
                    title={selectedVideoLesson.title}
                    className="w-full h-full border-0"
                    style={{ border: 'none' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  // Other direct video files
                  <video
                    src={selectedVideoLesson.videoUrl}
                    title={selectedVideoLesson.title}
                    className="w-full h-full"
                    controls
                    controlsList="nodownload"
                    playsInline
                  >
                    Votre navigateur ne supporte pas la lecture vidéo.
                  </video>
                )}
              </div>
            )}
            
            {selectedVideoLesson?.description && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Description</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{selectedVideoLesson.description}</p>
              </div>
            )}
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4 text-gray-500">
                {selectedVideoLesson?.duration && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {selectedVideoLesson.duration}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">
                    Leçon #{selectedVideoLesson?.displayOrder}
                  </span>
                </span>
              </div>
              
              {selectedVideoLesson?.pdfUrl && (
                <a 
                  href={selectedVideoLesson.pdfUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-500 hover:text-blue-700 hover:underline"
                >
                  <FileText className="h-4 w-4" />
                  Télécharger le PDF
                </a>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
