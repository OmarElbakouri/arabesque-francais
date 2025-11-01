import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, TrendingUp, UserPlus, Award, BookOpen, MessageSquare, ArrowUpRight, Percent } from 'lucide-react';
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
  // Mock data avec métriques détaillées
  const stats = {
    totalUsers: 1250,
    normalUsers: 450,
    vipUsers: 180,
    activeUsers: 890,
    monthlyRevenue: 45600,
    newUsersThisMonth: 156,
    totalCourses: 12,
    conversionRate: 23.5,
    normalToVip: 42, // Conversions NORMAL→VIP ce mois
    totalAICredits: 89500, // Crédits IA totaux utilisés
    avgAIUsage: 67, // Utilisation moyenne des crédits IA en %
    commercialRevenue: 15548, // Revenus générés par commerciaux
  };

  const lineChartData = {
    labels: ['1', '5', '10', '15', '20', '25', '30'],
    datasets: [
      {
        label: 'Inscriptions',
        data: [12, 19, 15, 25, 22, 30, 28],
        borderColor: 'hsl(var(--primary))',
        backgroundColor: 'hsla(var(--primary), 0.1)',
        tension: 0.4,
      },
    ],
  };

  const barChartData = {
    labels: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin'],
    datasets: [
      {
        label: 'Revenus (DH)',
        data: [35000, 42000, 38000, 45600, 48000, 52000],
        backgroundColor: 'hsl(var(--secondary))',
      },
    ],
  };

  const doughnutData = {
    labels: ['Normal', 'Premium', 'VIP'],
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
    { user: 'Mohamed Idrissi', action: 'Abonné au plan Premium', time: 'Il y a 5 min', amount: 299 },
    { user: 'Fatima Zahra', action: 'A terminé le cours A1', time: 'Il y a 15 min', amount: null },
    { user: 'Youssef Hassani', action: 'Abonné au plan VIP', time: 'Il y a 30 min', amount: 499 },
    { user: 'Sara Mansouri', action: 'Inscription complétée', time: 'Il y a 1h', amount: null },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Tableau de Bord</h1>
        <p className="text-muted-foreground mt-1">Vue d'ensemble de la plateforme</p>
      </div>

      {/* KPI Cards - Ligne 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Utilisateurs</p>
                <p className="text-2xl font-bold text-primary">{stats.totalUsers}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.normalUsers} Normal • {stats.vipUsers} VIP
                </p>
              </div>
              <Users className="h-8 w-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenus Mensuels</p>
                <p className="text-2xl font-bold text-secondary">{stats.monthlyRevenue} DH</p>
                <p className="text-xs text-success mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +12.5% vs mois dernier
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-secondary/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversions NORMAL→VIP</p>
                <p className="text-2xl font-bold text-success">{stats.normalToVip}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.conversionRate}% taux ce mois
                </p>
              </div>
              <ArrowUpRight className="h-8 w-8 text-success/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Utilisation IA Moy.</p>
                <p className="text-2xl font-bold text-warning">{stats.avgAIUsage}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.totalAICredits.toLocaleString()} crédits utilisés
                </p>
              </div>
              <MessageSquare className="h-8 w-8 text-warning/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KPI Cards - Ligne 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Utilisateurs Actifs</p>
                <p className="text-2xl font-bold text-success">{stats.activeUsers}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round((stats.activeUsers / stats.totalUsers) * 100)}% du total
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-success/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Nouveaux ce mois</p>
                <p className="text-2xl font-bold text-info">{stats.newUsersThisMonth}</p>
                <p className="text-xs text-success mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +8.3% vs mois dernier
                </p>
              </div>
              <UserPlus className="h-8 w-8 text-info/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenus Commerciaux</p>
                <p className="text-2xl font-bold text-purple-600">{stats.commercialRevenue} DH</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round((stats.commercialRevenue / stats.monthlyRevenue) * 100)}% du total
                </p>
              </div>
              <Percent className="h-8 w-8 text-purple-600/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Nombre de Cours</p>
                <p className="text-2xl font-bold text-primary">{stats.totalCourses}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Tous publiés et actifs
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Inscriptions sur 30 jours</CardTitle>
          </CardHeader>
          <CardContent>
            <Line data={lineChartData} options={{ responsive: true, maintainAspectRatio: true }} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenus Mensuels</CardTitle>
          </CardHeader>
          <CardContent>
            <Bar data={barChartData} options={{ responsive: true, maintainAspectRatio: true }} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Activités Récentes</CardTitle>
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
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">{activity.time}</p>
                    {activity.amount && (
                      <p className="text-sm font-bold text-success">+{activity.amount} DH</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Répartition Utilisateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: true }} />
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Normal</span>
                <span className="font-bold">450</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Premium</span>
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
