import { Link } from 'react-router-dom';
import { BookOpen, Clock, Award, Target, TrendingUp, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { useCoursesStore } from '@/stores/coursesStore';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { courses, enrolledCourses } = useCoursesStore();
  
  const myCourses = courses.filter(c => enrolledCourses.includes(c.id));
  const totalProgress = myCourses.reduce((acc, c) => acc + c.progression, 0) / myCourses.length || 0;
  const completedChapters = myCourses.reduce((acc, c) => acc + Math.floor(c.chapitres * c.progression / 100), 0);
  const totalChapters = myCourses.reduce((acc, c) => acc + c.chapitres, 0);

  const roleColors = {
    NORMAL: 'bg-muted text-muted-foreground',
    PREMIUM: 'bg-primary text-primary-foreground',
    VIP: 'bg-secondary text-secondary-foreground',
    ADMIN: 'bg-destructive text-destructive-foreground',
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-hero rounded-2xl p-8 mb-8 text-white shadow-custom-lg">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">مرحباً بك، {user?.prenom}!</h1>
              <p className="text-white/90 mb-4">استمر في رحلتك التعليمية</p>
              {user && <Badge className={roleColors[user.role]}>{user.role}</Badge>}
            </div>
            <div className="text-left">
              <div className="text-sm text-white/80">إجمالي التقدم</div>
              <div className="text-4xl font-bold">{Math.round(totalProgress)}%</div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">الدورات المسجلة</p>
                  <p className="text-3xl font-bold text-primary">{myCourses.length}</p>
                </div>
                <BookOpen className="h-12 w-12 text-primary/20" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">الفصول المكتملة</p>
                  <p className="text-3xl font-bold text-secondary">{completedChapters}/{totalChapters}</p>
                </div>
                <Target className="h-12 w-12 text-secondary/20" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">وقت التعلم</p>
                  <p className="text-3xl font-bold text-info">42 ساعة</p>
                </div>
                <Clock className="h-12 w-12 text-info/20" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">الشارات</p>
                  <p className="text-3xl font-bold text-warning">12</p>
                </div>
                <Award className="h-12 w-12 text-warning/20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Continue Learning */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>استمر في التعلم</CardTitle>
          </CardHeader>
          <CardContent>
            {myCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myCourses.map((course) => (
                  <div key={course.id} className="card-feature">
                    <div className="flex gap-4">
                      <img
                        src={course.thumbnail}
                        alt={course.titre}
                        className="w-24 h-24 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-bold mb-1">{course.titre}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{course.enseignant}</p>
                        <Progress value={course.progression} className="mb-2" />
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">{course.progression}% مكتمل</span>
                          <Link to={`/course/${course.id}`}>
                            <Button size="sm">متابعة</Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">لم تسجل في أي دورة بعد</p>
                <Link to="/courses">
                  <Button>تصفح الدورات</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>النشاط الأخير</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: 'أكملت الفصل 5', course: 'المستوى A1', time: 'منذ ساعتين' },
                { action: 'حصلت على شارة "متعلم نشط"', course: '', time: 'منذ 5 ساعات' },
                { action: 'بدأت الدرس 3', course: 'المستوى A2', time: 'أمس' },
              ].map((activity, index) => (
                <div key={index} className="flex items-start gap-4 pb-4 border-b border-border last:border-0">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{activity.action}</p>
                    {activity.course && <p className="text-sm text-muted-foreground">{activity.course}</p>}
                  </div>
                  <span className="text-sm text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
