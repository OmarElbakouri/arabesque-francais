import { Link } from 'react-router-dom';
import { BookOpen, Clock, Award, Target, TrendingUp, Coins, Crown, Briefcase, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/stores/authStore';
import { dashboardService, DashboardResponse } from '@/services/dashboardService';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      console.log('Dashboard: user object:', user);
      console.log('Dashboard: user.id:', user?.id);
      
      if (!user?.id) {
        console.log('Dashboard: No user ID, setting error');
        setError('لم يتم العثور على معلومات المستخدم');
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        console.log('Dashboard: Fetching dashboard for user:', user.id);
        const data = await dashboardService.getDashboard(user.id);
        console.log('Dashboard: Received data:', data);
        setDashboardData(data);
      } catch (err: any) {
        console.error('Dashboard: Error fetching dashboard:', err);
        console.error('Dashboard: Error response:', err.response);
        const errorMessage = err.response?.data?.message || 'فشل تحميل البيانات';
        setError(errorMessage);
        toast({
          title: 'خطأ',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, [user?.id, toast]);

  const roleConfig = {
    NORMAL: { 
      className: 'bg-muted text-muted-foreground',
      icon: User,
      label: 'عضو'
    },
    VIP: { 
      className: 'bg-warning text-warning-foreground',
      icon: Crown,
      label: 'VIP ⭐'
    },
    COMMERCIAL: { 
      className: 'bg-info text-info-foreground',
      icon: Briefcase,
      label: 'تجاري 💼'
    },
    ADMIN: { 
      className: 'bg-destructive text-destructive-foreground',
      icon: Crown,
      label: 'مدير 👑'
    },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-48 w-full rounded-2xl mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-destructive mb-4">{error || 'حدث خطأ في تحميل البيانات'}</p>
            <Button onClick={() => window.location.reload()}>إعادة المحاولة</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { userInfo, stats, credits, enrolledCourses } = dashboardData;
  const currentRole = roleConfig[userInfo.role];
  const shouldShowCredits = userInfo.role === 'NORMAL' || userInfo.role === 'VIP';

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-hero rounded-2xl p-8 mb-8 text-white shadow-custom-lg">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">مرحباً بك، {userInfo.firstName} {userInfo.lastName}!</h1>
              <p className="text-white/90 mb-4">استمر في رحلتك التعليمية</p>
              <Badge className={currentRole.className}>
                {currentRole.label}
              </Badge>
            </div>
            <div className="text-left">
              <div className="text-sm text-white/80">إجمالي التقدم</div>
              <div className="text-4xl font-bold">{Math.round(stats.overallProgress)}%</div>
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
                  <p className="text-3xl font-bold text-primary">{stats.enrolledCoursesCount}</p>
                </div>
                <BookOpen className="h-12 w-12 text-primary/20" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">الدروس المكتملة</p>
                  <p className="text-3xl font-bold text-secondary">{stats.completedLessons}/{stats.totalLessons}</p>
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
                  <p className="text-3xl font-bold text-info">{stats.totalLearningHours} ساعة</p>
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
                  <p className="text-3xl font-bold text-warning">{stats.totalBadges}</p>
                </div>
                <Award className="h-12 w-12 text-warning/20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Credits Section - Only for NORMAL and VIP users */}
        {shouldShowCredits && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5" />
                الرصيد المتاح
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">الرصيد الحالي</span>
                  <span className="text-2xl font-bold text-primary">{credits.currentCredits}</span>
                </div>
                {credits.monthlyLimit && (
                  <>
                    <Progress 
                      value={(credits.currentCredits / credits.monthlyLimit) * 100} 
                      className="h-2"
                    />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">مستخدم: {credits.usedCredits}</span>
                      <span className="text-muted-foreground">الحد الشهري: {credits.monthlyLimit}</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Continue Learning */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>استمر في التعلم</CardTitle>
          </CardHeader>
          <CardContent>
            {enrolledCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {enrolledCourses.map((course) => (
                  <div key={course.courseId} className="card-feature">
                    <div className="flex gap-4">
                      <img
                        src={course.courseImage}
                        alt={course.courseName}
                        className="w-24 h-24 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-bold mb-1">{course.courseName}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{course.courseLevel}</p>
                        <Progress value={course.progressPercentage} className="mb-2" />
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            {course.completedLessons}/{course.totalLessons} دروس • {Math.round(course.progressPercentage)}%
                          </span>
                          <Link to={`/course/${course.courseId}`}>
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

        {/* Additional Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">الشهادات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Award className="h-8 w-8 text-warning" />
                <div>
                  <p className="text-3xl font-bold">{stats.totalCertificates}</p>
                  <p className="text-sm text-muted-foreground">شهادة مكتسبة</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">نقاط الخبرة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <TrendingUp className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-3xl font-bold">{stats.totalXp}</p>
                  <p className="text-sm text-muted-foreground">XP نقطة</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">التقدم العام</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Progress value={stats.overallProgress} className="h-3" />
                <p className="text-sm text-muted-foreground text-center">
                  {Math.round(stats.overallProgress)}% من إجمالي الدورات
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
