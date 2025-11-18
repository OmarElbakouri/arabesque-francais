import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, TrendingUp, UserPlus, Award, BookOpen, MessageSquare, ArrowUpRight, Percent } from 'lucide-react';
import { Doughnut } from 'react-chartjs-2';
import { useState, useEffect } from 'react';
import { adminService } from '@/services/adminService';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardStats {
  totalUsers: number;
  freeUsers: number;
  normalUsers: number;
  vipUsers: number;
  activeUsers: number;
  totalRevenue: number;
  monthlyRevenue: number;
  conversionRate: number;
  conversionsThisMonth: number;
  totalCourses: number;
  totalEnrollments: number;
  totalAiMessages: number;
  pendingPayments: number;
}

interface RecentActivity {
  userName: string;
  userInitial: string;
  activityType: string;
  activityDescription: string;
  activityDetail: string | null;
  timestamp: string;
  timeAgo: string;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
    loadRecentActivities();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      console.log('📊 Chargement des statistiques du tableau de bord...');
      const data = await adminService.getDashboardStats();
      console.log('✅ Statistiques reçues:', data);
      setStats(data);
    } catch (error: any) {
      console.error('❌ Erreur lors du chargement des statistiques:', error);
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Impossible de charger les statistiques',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadRecentActivities = async () => {
    try {
      setActivitiesLoading(true);
      console.log('📋 Chargement des activités récentes...');
      const data = await adminService.getRecentActivities(20);
      console.log('✅ Activités reçues:', data);
      setRecentActivities(data || []);
    } catch (error: any) {
      console.error('❌ Erreur lors du chargement des activités:', error);
      // Don't show toast for activities error, just log it
      setRecentActivities([]);
    } finally {
      setActivitiesLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Tableau de Bord</h1>
          <p className="text-muted-foreground mt-1">Vue d'ensemble de la plateforme</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Tableau de Bord</h1>
          <p className="text-muted-foreground mt-1">Aucune donnée disponible</p>
        </div>
      </div>
    );
  }

  const doughnutData = {
    labels: ['FREE', 'NORMAL', 'VIP'],
    datasets: [
      {
        data: [stats?.freeUsers || 0, stats?.normalUsers || 0, stats?.vipUsers || 0],
        backgroundColor: [
          '#94A3B8', // Gray for FREE
          '#3B82F6', // Blue for NORMAL
          '#8B5CF6', // Purple for VIP
        ],
      },
    ],
  };

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
                <p className="text-2xl font-bold text-primary">{stats?.totalUsers || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats?.freeUsers || 0} FREE • {stats?.normalUsers || 0} NORMAL • {stats?.vipUsers || 0} VIP
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
                <p className="text-2xl font-bold text-secondary">{stats?.monthlyRevenue || 0} DH</p>
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
                <p className="text-2xl font-bold text-success">{stats?.normalToVip || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats?.conversionRate || 0}% taux ce mois
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
                <p className="text-2xl font-bold text-warning">{stats?.avgAIUsage || 0}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {(stats?.totalAICredits || 0).toLocaleString()} crédits utilisés
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
                <p className="text-2xl font-bold text-success">{stats?.activeUsers || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats?.totalUsers ? Math.round(((stats?.activeUsers || 0) / stats.totalUsers) * 100) : 0}% du total
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
                <p className="text-2xl font-bold text-info">{stats?.newUsersThisMonth || 0}</p>
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
                <p className="text-2xl font-bold text-purple-600">{stats?.commercialRevenue || 0} DH</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats?.monthlyRevenue ? Math.round(((stats?.commercialRevenue || 0) / stats.monthlyRevenue) * 100) : 0}% du total
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
                <p className="text-2xl font-bold text-primary">{stats?.totalCourses || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Tous publiés et actifs
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Activités Récentes</CardTitle>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : recentActivities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Aucune activité récente</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between pb-4 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold">{activity.userInitial}</span>
                      </div>
                      <div>
                        <p className="font-medium">{activity.userName}</p>
                        <p className="text-sm text-muted-foreground">{activity.activityDescription}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">{activity.timeAgo}</p>
                      {activity.activityDetail && (
                        <p className="text-sm font-bold text-success">{activity.activityDetail}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#94A3B8' }}></div>
                  <span className="text-muted-foreground">FREE</span>
                </div>
                <span className="font-bold">{stats?.freeUsers || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3B82F6' }}></div>
                  <span className="text-muted-foreground">NORMAL</span>
                </div>
                <span className="font-bold">{stats?.normalUsers || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#8B5CF6' }}></div>
                  <span className="text-muted-foreground">VIP</span>
                </div>
                <span className="font-bold">{stats?.vipUsers || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
