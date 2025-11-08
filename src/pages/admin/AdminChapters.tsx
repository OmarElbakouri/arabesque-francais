import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  Video, 
  FileText,
  ChevronDown,
  ChevronRight,
  Play
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCoursesStore } from '@/stores/coursesStore';

interface Chapter {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  videos: Video[];
}

interface Video {
  id: string;
  chapterId: string;
  title: string;
  description: string;
  videoUrl: string;
  exercisePdfUrl?: string;
  duration: string;
  order: number;
}

export default function AdminChapters() {
  const { courses } = useCoursesStore();
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [isAddChapterOpen, setIsAddChapterOpen] = useState(false);
  const [isAddVideoOpen, setIsAddVideoOpen] = useState(false);
  const [selectedChapterId, setSelectedChapterId] = useState<string>('');

  // Mock data - in production this would come from API
  const [chapters, setChapters] = useState<Chapter[]>([
    {
      id: '1',
      courseId: '1',
      title: 'Les bases de la grammaire',
      description: 'Introduction aux concepts fondamentaux',
      order: 1,
      videos: [
        {
          id: 'v1',
          chapterId: '1',
          title: 'Les articles définis et indéfinis',
          description: 'Comprendre le, la, les, un, une, des',
          videoUrl: 'https://example.com/video1.mp4',
          exercisePdfUrl: 'https://example.com/exercice1.pdf',
          duration: '15:30',
          order: 1,
        },
        {
          id: 'v2',
          chapterId: '1',
          title: 'Les pronoms personnels',
          description: 'Je, tu, il, elle, nous, vous, ils, elles',
          videoUrl: 'https://example.com/video2.mp4',
          duration: '12:45',
          order: 2,
        },
      ],
    },
    {
      id: '2',
      courseId: '1',
      title: 'La conjugaison au présent',
      description: 'Apprendre à conjuguer les verbes',
      order: 2,
      videos: [],
    },
  ]);

  const toggleChapter = (chapterId: string) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId);
    } else {
      newExpanded.add(chapterId);
    }
    setExpandedChapters(newExpanded);
  };

  const filteredChapters = selectedCourse
    ? chapters.filter((ch) => ch.courseId === selectedCourse)
    : [];

  const totalVideos = chapters.reduce((sum, ch) => sum + ch.videos.length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">إدارة الفصول والفيديوهات</h1>
          <p className="text-muted-foreground mt-1">
            إدارة محتوى الدورات: الفصول، الفيديوهات، والتمارين
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{courses.length}</p>
              <p className="text-sm text-muted-foreground">الدورات</p>
            </div>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-success">{chapters.length}</p>
              <p className="text-sm text-muted-foreground">الفصول</p>
            </div>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-warning">{totalVideos}</p>
              <p className="text-sm text-muted-foreground">الفيديوهات</p>
            </div>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-secondary">
                {chapters.filter((ch) => ch.videos.length > 0).length}
              </p>
              <p className="text-sm text-muted-foreground">فصول مكتملة</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Selection */}
      <Card>
        <CardHeader>
          <CardTitle>اختر الدورة</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger>
              <SelectValue placeholder="اختر دورة لعرض فصولها" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.titre} - {course.niveau}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Chapters List */}
      {selectedCourse && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>الفصول والمحتوى</CardTitle>
              <Dialog open={isAddChapterOpen} onOpenChange={setIsAddChapterOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    إضافة فصل جديد
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>إضافة فصل جديد</DialogTitle>
                    <DialogDescription>
                      أضف فصل جديد للدورة المختارة
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>عنوان الفصل</Label>
                      <Input placeholder="مثال: المقدمة في القواعد" />
                    </div>
                    <div>
                      <Label>وصف الفصل</Label>
                      <Textarea 
                        placeholder="وصف مختصر للفصل وما سيتعلمه الطالب"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>ترتيب الفصل</Label>
                      <Input type="number" placeholder="1" />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsAddChapterOpen(false)}>
                        إلغاء
                      </Button>
                      <Button onClick={() => setIsAddChapterOpen(false)}>
                        حفظ الفصل
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {filteredChapters.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>لا توجد فصول لهذه الدورة بعد</p>
                <p className="text-sm mt-2">ابدأ بإضافة فصل جديد</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredChapters.map((chapter) => (
                  <Card key={chapter.id} className="border-2">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleChapter(chapter.id)}
                            className="mt-1"
                          >
                            {expandedChapters.has(chapter.id) ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </Button>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-lg">
                                الفصل {chapter.order}: {chapter.title}
                              </CardTitle>
                              <Badge variant="outline">
                                {chapter.videos.length} فيديو
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {chapter.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    {expandedChapters.has(chapter.id) && (
                      <CardContent className="pt-0">
                        <div className="border-t pt-4">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="font-semibold">الفيديوهات والتمارين</h4>
                            <Dialog open={isAddVideoOpen} onOpenChange={setIsAddVideoOpen}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-2"
                                  onClick={() => setSelectedChapterId(chapter.id)}
                                >
                                  <Plus className="w-4 h-4" />
                                  إضافة فيديو
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>إضافة فيديو جديد</DialogTitle>
                                  <DialogDescription>
                                    أضف فيديو تعليمي مع التمارين المرفقة
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label>عنوان الفيديو</Label>
                                    <Input placeholder="مثال: شرح الأفعال المساعدة" />
                                  </div>
                                  <div>
                                    <Label>وصف الفيديو</Label>
                                    <Textarea 
                                      placeholder="وصف مختصر لمحتوى الفيديو"
                                      rows={2}
                                    />
                                  </div>
                                  <div>
                                    <Label>رابط الفيديو</Label>
                                    <div className="flex gap-2">
                                      <Input placeholder="https://..." />
                                      <Button variant="outline" className="gap-2">
                                        <Upload className="w-4 h-4" />
                                        رفع
                                      </Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      يمكنك رفع ملف فيديو أو إدخال رابط يوتيوب/فيميو
                                    </p>
                                  </div>
                                  <div>
                                    <Label>مدة الفيديو</Label>
                                    <Input placeholder="مثال: 15:30" />
                                  </div>
                                  <div>
                                    <Label>ملف التمارين (PDF)</Label>
                                    <div className="border-2 border-dashed rounded-lg p-8 text-center">
                                      <Upload className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                                      <p className="text-sm text-muted-foreground mb-2">
                                        اسحب وأفلت ملف PDF أو انقر للتحميل
                                      </p>
                                      <Button variant="outline" size="sm">
                                        اختر ملف PDF
                                      </Button>
                                    </div>
                                  </div>
                                  <div>
                                    <Label>ترتيب الفيديو</Label>
                                    <Input type="number" placeholder="1" />
                                  </div>
                                  <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => setIsAddVideoOpen(false)}>
                                      إلغاء
                                    </Button>
                                    <Button onClick={() => setIsAddVideoOpen(false)}>
                                      حفظ الفيديو
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>

                          {chapter.videos.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground bg-muted/50 rounded-lg">
                              <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">لا توجد فيديوهات في هذا الفصل</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {chapter.videos.map((video) => (
                                <div
                                  key={video.id}
                                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                  <div className="w-32 h-20 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Play className="w-8 h-8 text-muted-foreground" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <h5 className="font-semibold mb-1">
                                          {video.order}. {video.title}
                                        </h5>
                                        <p className="text-sm text-muted-foreground mb-2">
                                          {video.description}
                                        </p>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                          <span className="flex items-center gap-1">
                                            <Video className="w-3 h-3" />
                                            {video.duration}
                                          </span>
                                          {video.exercisePdfUrl && (
                                            <span className="flex items-center gap-1">
                                              <FileText className="w-3 h-3" />
                                              تمارين PDF
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex gap-2">
                                        <Button variant="ghost" size="sm">
                                          <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm">
                                          <Trash2 className="w-4 h-4 text-destructive" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
