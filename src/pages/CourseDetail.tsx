import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, FileText, MessageSquare, CheckCircle, Lock, Users, Clock, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useCoursesStore } from '@/stores/coursesStore';
import { useAuthStore } from '@/stores/authStore';
import { toast } from '@/hooks/use-toast';

export default function CourseDetail() {
  const { id } = useParams();
  const { courses, enrolledCourses, enrollCourse } = useCoursesStore();
  const { isAuthenticated, user } = useAuthStore();
  const course = courses.find(c => c.id === id);
  const isEnrolled = enrolledCourses.includes(id!);

  const [currentChapter, setCurrentChapter] = useState(0);

  if (!course) {
    return <div className="container mx-auto px-4 py-12 text-center">الدورة غير موجودة</div>;
  }

  const handleEnroll = () => {
    if (!isAuthenticated) {
      toast({ title: 'يجب تسجيل الدخول أولاً', variant: 'destructive' });
      return;
    }
    if (!course.gratuit && user?.role === 'NORMAL') {
      toast({ title: 'يتطلب اشتراك Premium', variant: 'destructive' });
      return;
    }
    enrollCourse(id!);
    toast({ title: 'تم التسجيل بنجاح!', description: 'يمكنك البدء في التعلم الآن' });
  };

  const lessons = [
    {
      title: 'مقدمة في اللغة الفرنسية',
      chapters: [
        { title: 'الحروف الأبجدية', duration: '15 دقيقة', completed: true, locked: false },
        { title: 'النطق الصحيح', duration: '20 دقيقة', completed: true, locked: false },
        { title: 'التحيات الأساسية', duration: '18 دقيقة', completed: false, locked: false },
      ]
    },
    {
      title: 'القواعد الأساسية',
      chapters: [
        { title: 'الأسماء والأفعال', duration: '25 دقيقة', completed: false, locked: !isEnrolled },
        { title: 'الصفات', duration: '20 دقيقة', completed: false, locked: !isEnrolled },
        { title: 'الضمائر', duration: '22 دقيقة', completed: false, locked: !isEnrolled },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-hero py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <Badge className="mb-4">{course.niveau}</Badge>
            <h1 className="text-4xl font-bold text-white mb-4">{course.titre}</h1>
            <p className="text-white/90 text-lg mb-6">{course.description}</p>
            <div className="flex flex-wrap gap-6 text-white/90">
              <div className="flex items-center gap-2">
                <Users size={20} />
                <span>{course.etudiants} طالب</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={20} />
                <span>{course.duree}</span>
              </div>
              <div className="flex items-center gap-2">
                <Award size={20} />
                <span>{course.chapitres} فصل</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <img
                    src={course.thumbnail}
                    alt={course.titre}
                    className="w-full rounded-lg mb-4"
                  />
                  <div className="text-3xl font-bold text-primary mb-2">
                    {course.gratuit ? 'مجاني' : `${course.prix} درهم`}
                  </div>
                  {isEnrolled ? (
                    <div>
                      <Progress value={course.progression} className="mb-2" />
                      <p className="text-sm text-muted-foreground mb-4">{course.progression}% مكتمل</p>
                      <Link to={`/learn/${course.id}`}>
                        <Button className="w-full btn-hero">متابعة التعلم</Button>
                      </Link>
                    </div>
                  ) : (
                    <Button className="w-full btn-hero" onClick={handleEnroll}>
                      {course.gratuit ? 'ابدأ الآن' : 'شراء الدورة'}
                    </Button>
                  )}
                </div>
                <div className="space-y-3 text-sm border-t border-border pt-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">المدة</span>
                    <span className="font-medium">{course.duree}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">الفصول</span>
                    <span className="font-medium">{course.chapitres} فصل</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">المستوى</span>
                    <span className="font-medium">{course.niveau}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">المدرس</span>
                    <span className="font-medium">{course.enseignant}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="content">المحتوى</TabsTrigger>
                <TabsTrigger value="description">الوصف</TabsTrigger>
                <TabsTrigger value="reviews">التقييمات</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>محتوى الدورة</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {lessons.map((lesson, lessonIdx) => (
                        <AccordionItem key={lessonIdx} value={`lesson-${lessonIdx}`}>
                          <AccordionTrigger className="text-right">
                            <div className="flex items-center gap-3">
                              <span className="font-bold">الدرس {lessonIdx + 1}:</span>
                              <span>{lesson.title}</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2 pr-4">
                              {lesson.chapters.map((chapter, chapterIdx) => (
                                <div
                                  key={chapterIdx}
                                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                  <div className="flex items-center gap-3">
                                    {chapter.completed ? (
                                      <CheckCircle className="h-5 w-5 text-success" />
                                    ) : chapter.locked ? (
                                      <Lock className="h-5 w-5 text-muted-foreground" />
                                    ) : (
                                      <Play className="h-5 w-5 text-primary" />
                                    )}
                                    <span className={chapter.locked ? 'text-muted-foreground' : ''}>
                                      {chapter.title}
                                    </span>
                                  </div>
                                  <span className="text-sm text-muted-foreground">{chapter.duration}</span>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="description" className="mt-6">
                <Card>
                  <CardContent className="pt-6 prose prose-sm max-w-none">
                    <h3>نظرة عامة</h3>
                    <p>{course.description}</p>
                    <h3>ماذا ستتعلم؟</h3>
                    <ul>
                      <li>التواصل باللغة الفرنسية في المواقف اليومية</li>
                      <li>فهم وتطبيق القواعد الأساسية للغة</li>
                      <li>تطوير مهارات الاستماع والقراءة</li>
                      <li>بناء مفردات قوية وعملية</li>
                    </ul>
                    <h3>المتطلبات</h3>
                    <ul>
                      <li>لا توجد متطلبات مسبقة</li>
                      <li>الرغبة في التعلم والممارسة اليومية</li>
                      <li>اتصال بالإنترنت مستقر</li>
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8 text-muted-foreground">
                      التقييمات قريباً...
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
