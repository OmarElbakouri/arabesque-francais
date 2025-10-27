import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, TrendingUp, UserPlus, Award, BookOpen } from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminDashboard() {
  // Mock data
  const stats = {
    totalUsers: 1250,
    activeUsers: 890,
    monthlyRevenue: 45600,
    newUsersThisMonth: 156,
    totalCourses: 12,
    conversionRate: 23.5,
  };

  const lineChartData = {
    labels: ['1', '5', '10', '15', '20', '25', '30'],
    datasets: [
      {
        label: 'التسجيلات',
        data: [12, 19, 15, 25, 22, 30, 28],
        borderColor: 'hsl(var(--primary))',
        backgroundColor: 'hsla(var(--primary), 0.1)',
        tension: 0.4,
      },
    ],
  };

  const barChartData = {
    labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
    datasets: [
      {
        label: 'الإيرادات (درهم)',
        data: [35000, 42000, 38000, 45600, 48000, 52000],
        backgroundColor: 'hsl(var(--secondary))',
      },
    ],
  };

  const doughnutData = {
    labels: ['عادي', 'بريميوم', 'VIP'],
    datasets: [
      {
        data: [450, 620, 180],
        backgroundColor: [
          'hsl(var(--muted))',
          'hsl(var(--primary))',
          'hsl(var(--secondary))',
        ],
      },
    ],
  };

  const recentActivities = [
    { user: 'محمد الإدريسي', action: 'اشترك في خطة Premium', time: 'منذ 5 دقائق', amount: 299 },
    { user: 'فاطمة الزهراء', action: 'أكمل دورة A1', time: 'منذ 15 دقيقة', amount: null },
    { user: 'يوسف الحسني', action: 'اشترك في خطة VIP', time: 'منذ 30 دقيقة', amount: 499 },
    { user: 'سارة المنصوري', action: 'قام بالتسجيل', time: 'منذ ساعة', amount: null },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">لوحة التحكم</h1>
        <p className="text-muted-foreground mt-1">نظرة عامة على المنصة</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي المستخدمين</p>
                <p className="text-2xl font-bold text-primary">{stats.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">مستخدمين نشطين</p>
                <p className="text-2xl font-bold text-success">{stats.activeUsers}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-success/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">الإيرادات الشهرية</p>
                <p className="text-2xl font-bold text-secondary">{stats.monthlyRevenue} د.م</p>
              </div>
              <DollarSign className="h-8 w-8 text-secondary/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">تسجيلات هذا الشهر</p>
                <p className="text-2xl font-bold text-info">{stats.newUsersThisMonth}</p>
              </div>
              <UserPlus className="h-8 w-8 text-info/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">عدد الدورات</p>
                <p className="text-2xl font-bold text-warning">{stats.totalCourses}</p>
              </div>
              <BookOpen className="h-8 w-8 text-warning/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">معدل التحويل</p>
                <p className="text-2xl font-bold text-primary">{stats.conversionRate}%</p>
              </div>
              <Award className="h-8 w-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>التسجيلات خلال 30 يوم</CardTitle>
          </CardHeader>
          <CardContent>
            <Line data={lineChartData} options={{ responsive: true, maintainAspectRatio: true }} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>الإيرادات الشهرية</CardTitle>
          </CardHeader>
          <CardContent>
            <Bar data={barChartData} options={{ responsive: true, maintainAspectRatio: true }} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>النشاطات الأخيرة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between pb-4 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-bold">{activity.user.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-medium">{activity.user}</p>
                      <p className="text-sm text-muted-foreground">{activity.action}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-muted-foreground">{activity.time}</p>
                    {activity.amount && (
                      <p className="text-sm font-bold text-success">+{activity.amount} د.م</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>توزيع المستخدمين</CardTitle>
          </CardHeader>
          <CardContent>
            <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: true }} />
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">عادي</span>
                <span className="font-bold">450</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">بريميوم</span>
                <span className="font-bold">620</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">VIP</span>
                <span className="font-bold">180</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
