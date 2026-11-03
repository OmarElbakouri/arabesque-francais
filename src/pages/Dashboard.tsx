import { AllowanceStatus } from '@/components/AllowanceStatus';
import { Link, useNavigate } from 'react-router-dom';
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
import { FreeUserRestriction } from '@/components/FreeUserRestriction';
import { SecureImage } from '@/components/SecureImage';
import api from '@/lib/api';

import { TUTOR_NAME } from '@/lib/sophieStage';
export default function Dashboard() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkingOrientation, setCheckingOrientation] = useState(true);

  // Check orientation test completion
  useEffect(() => {
    const checkOrientation = async () => {
      try {
        // Skip for ADMIN and COMMERCIAL
        if (user?.role === 'ADMIN' || user?.role === 'COMMERCIAL') {
          setCheckingOrientation(false);
          return;
        }

        // Skip if orientation was just completed (from sessionStorage)
        if (sessionStorage.getItem('orientationCompleted') === 'true') {
          setCheckingOrientation(false);
          return;
        }

        const response = await api.get('/orientation-test/status');
        if (!response.data.completed) {
          navigate('/orientation-test', { replace: true });
          return;
        }
      } catch (error) {
        console.error('Failed to check orientation status:', error);
      } finally {
        setCheckingOrientation(false);
      }
    };

    if (user) {
      checkOrientation();
    } else {
      setCheckingOrientation(false);
    }
  }, [user, navigate]);

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
        console.log('Dashboard: userInfo:', data?.userInfo);
        console.log('Dashboard: stats:', data?.stats);
        console.log('Dashboard: credits:', data?.credits);
        setDashboardData(data);
      } catch (err: any) {
        console.error('Dashboard: Error fetching dashboard:', err);
        console.error('Dashboard: Error response:', err.response);
        
        // Handle 500 errors for new users with no data
        if (err.response?.status === 500) {
          console.log('Dashboard: 500 error - possibly a new user with no data');
          // Set empty dashboard data for new users
          setDashboardData({
            userInfo: {
              userId: parseInt(user.id),
              firstName: user.prenom || '',
              lastName: user.nom || '',
              email: user.email || '',
              role: user.role || 'FREE',
            },
            stats: {
              overallProgress: 0,
              totalCertificates: 0,
              totalBadges: 0,
              totalLearningHours: 0,
              completedLessons: 0,
              totalLessons: 0,
              totalXp: 0,
              enrolledCoursesCount: 0,
            },
            credits: {
              currentCredits: user.credits || 0,
              usedCredits: 0,
              monthlyLimit: user.role === 'FREE' ? 10 : null,
              hasUnlimitedCredits: user.role === 'VIP',
            },
            enrolledCourses: [],
          });
          setError(null); // Clear error for new users
        } else {
          const errorMessage = err.response?.data?.message || 'فشل تحميل البيانات';
          setError(errorMessage);
          toast({
            title: 'خطأ',
            description: errorMessage,
            variant: 'destructive',
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, [user?.id, toast]);

  const roleConfig = {
    USER: { 
      className: 'bg-gray-500 text-white',
      icon: User,
      label: 'Utilisateur'
    },
    FREE: { 
      className: 'bg-gray-500 text-white',
      icon: User,
      label: 'Gratuit'
    },
    NORMAL: { 
      className: 'bg-primary text-white',
      icon: User,
      label: 'Membre'
    },
    VIP: { 
      className: 'bg-secondary text-white',
      icon: Crown,
      label: 'VIP ⭐'
    },
    COMMERCIAL: { 
      className: 'bg-primary text-white',
      icon: Briefcase,
      label: 'Commercial 💼'
    },
    ADMIN: { 
      className: 'bg-destructive text-destructive-foreground',
      icon: Crown,
      label: 'Admin 👑'
    },
  };

  // Show loading while checking orientation
  if (checkingOrientation || isLoading) {
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

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>إعادة المحاولة</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!dashboardData || !dashboardData.userInfo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-destructive mb-4">حدث خطأ في تحميل البيانات</p>
            <p className="text-sm text-muted-foreground mb-4">
              {!dashboardData ? 'لا توجد بيانات' : 'معلومات المستخدم غير متوفرة'}
            </p>
            <Button onClick={() => window.location.reload()}>إعادة المحاولة</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { userInfo, stats, credits, enrolledCourses } = dashboardData;
  
  // Add safety check for role
  if (!userInfo || !userInfo.role) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-destructive mb-4">بيانات المستخدم غير مكتملة</p>
            <Button onClick={() => window.location.reload()}>إعادة المحاولة</Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Check if user is FREE and show limited content
  const isFreeUser = userInfo.role === 'FREE' || userInfo.role === 'USER';
  
  // Ensure role exists in roleConfig, fallback to USER if not found
  const userRole = userInfo.role && roleConfig[userInfo.role] ? userInfo.role : 'USER';
  const currentRole = roleConfig[userRole];
  const shouldShowCredits = userInfo.role === 'NORMAL' || userInfo.role === 'VIP';

  return (
    <div dir="ltr" className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 mb-8 text-white shadow-xl">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Bienvenue, {userInfo.firstName} {userInfo.lastName}!</h1>
              <p className="text-white/80 mb-4">Continuez votre parcours d'apprentissage</p>
              <Badge className={currentRole.className}>
                {currentRole.label}
              </Badge>
            </div>
            <div className="text-right">
              <div className="text-sm text-white/70">Progression globale</div>
              <div className="text-4xl font-bold">{Math.round(stats.overallProgress)}%</div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border border-gray-100 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Cours inscrits</p>
                  <p className="text-3xl font-bold text-primary">{stats.enrolledCoursesCount}</p>
                </div>
                <BookOpen className="h-12 w-12 text-primary/20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-100 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Leçons terminées</p>
                  <p className="text-3xl font-bold text-secondary">{stats.completedLessons}/{stats.totalLessons}</p>
                </div>
                <Target className="h-12 w-12 text-secondary/20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-100 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Temps d'apprentissage</p>
                  <p className="text-3xl font-bold text-primary">{stats.totalLearningHours} heures</p>
                </div>
                <Clock className="h-12 w-12 text-primary/20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-100 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Badges</p>
                  <p className="text-3xl font-bold text-secondary">{stats.totalBadges}</p>
                </div>
                <Award className="h-12 w-12 text-secondary/20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Credits Section - Only for NORMAL and VIP users */}
        {shouldShowCredits && (
          <Card className="mb-8 border border-gray-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5" />
                Crédits disponibles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {Object.entries(credits.allowances || {}).map(([feature, info]) => <div key={feature} className="rounded-lg border p-4">
                  <p className="font-semibold mb-2">{{ voice_quiz: `${TUTOR_NAME} · 15 minutes`, quiz_ia: 'Exercices écrits et vocaux', chatbot: 'Messages du chatbot' }[feature] || feature}</p>
                  <AllowanceStatus info={info} />
                </div>)}
                {!credits.allowances && <p>Ouvrez votre activité pour consulter son allocation.</p>}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Continue Learning */}
        <Card className="mb-8 border border-gray-100">
          <CardHeader>
            <CardTitle>Continuez votre apprentissage</CardTitle>
          </CardHeader>
          <CardContent>
            {enrolledCourses.length > 0 ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* For FREE users, only show the first course */}
                  {(isFreeUser ? [enrolledCourses[0]] : enrolledCourses).map((course) => (
                    <div key={course.courseId} className="border border-gray-100 rounded-xl p-4">
                      <div className="flex gap-4">
                        <SecureImage
                          src={course.courseImage}
                          alt={course.courseName}
                          className="w-24 h-24 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-bold mb-1">{course.courseName}</h3>
                          <p className="text-sm text-gray-500 mb-2">{course.courseLevel}</p>
                          <Progress value={course.progressPercentage} className="mb-2" />
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">
                              {course.completedLessons}/{course.totalLessons} leçons • {Math.round(course.progressPercentage)}%
                            </span>
                            <Link to={`/learn/${course.courseId}`}>
                              <Button size="sm" className="bg-primary hover:bg-primary/90">{isFreeUser && course.completedLessons > 0 ? 'Verrouillé' : 'Continuer'}</Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Show restriction message for FREE users */}
                {isFreeUser && enrolledCourses.length > 1 && (
                  <FreeUserRestriction featureName="les cours supplémentaires" />
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Vous n'êtes inscrit à aucun cours</p>
                <Link to="/courses">
                  <Button className="bg-primary hover:bg-primary/90">Parcourir les cours</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border border-gray-100">
            <CardHeader>
              <CardTitle className="text-lg">Certificats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Award className="h-8 w-8 text-secondary" />
                <div>
                  <p className="text-3xl font-bold">{stats.totalCertificates}</p>
                  <p className="text-sm text-gray-500">certificats obtenus</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-100">
            <CardHeader>
              <CardTitle className="text-lg">Points d'expérience</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <TrendingUp className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-3xl font-bold">{stats.totalXp}</p>
                  <p className="text-sm text-gray-500">points XP</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-100">
            <CardHeader>
              <CardTitle className="text-lg">Progression globale</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Progress value={stats.overallProgress} className="h-3" />
                <p className="text-sm text-gray-500 text-center">
                  {Math.round(stats.overallProgress)}% de tous les cours
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
