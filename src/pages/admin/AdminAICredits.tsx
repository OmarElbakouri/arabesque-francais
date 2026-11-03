import { AllowanceStatus } from '@/components/AllowanceStatus';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Search, MessageSquare, Mic, TrendingUp, RefreshCw, RotateCcw, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { adminService } from '@/services/adminService';

import { TUTOR_NAME } from '@/lib/sophieStage';
interface UserCredits {
  userId: number;
  userName: string;
  email: string;
  planName: string;
  quizIaUsed: number;
  quizIaLimit: number; // -1 means unlimited
  voiceQuizUsed: number;
  voiceQuizLimit: number; // -1 means unlimited
  utilizationPercent: number;
  lastUpdated: string | null;
  yearMonth: string;
  allowances?: Record<string, import("@/components/AllowanceStatus").AllowanceInfo>;
  status: 'ACTIF' | 'LIMITE_ATTEINTE';
}

interface CreditsStats {
  totalUsers: number;
  freeUsers: number;
  normalUsers: number;
  vipUsers: number;
  avgUtilizationPercent: number;
  usersAtLimit: number;
  totalQuizIaUsed: number;
  totalVoiceQuizUsed: number;
  currentMonth: string;
}

export default function AdminAICredits() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  
  const [users, setUsers] = useState<UserCredits[]>([]);
  const [stats, setStats] = useState<CreditsStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [adjustingUser, setAdjustingUser] = useState<UserCredits | null>(null);
  const [adjustFeature, setAdjustFeature] = useState<'quiz_ia' | 'voice_quiz' | 'chatbot'>('voice_quiz');
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [adjustRequestId, setAdjustRequestId] = useState('');

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [usersData, statsData] = await Promise.all([
        adminService.getAICredits(),
        adminService.getAICreditsStats()
      ]);
      setUsers(usersData || []);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading AI credits data:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données des crédits IA',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleResetCredits = async (user: UserCredits) => {
    setIsResetting(true);
    try {
      const amount = Number(adjustAmount);
      if (!Number.isInteger(amount) || !amount || !adjustReason.trim()) throw new Error('Montant entier et motif requis.');
      await adminService.adjustAICredits(user.userId, adjustFeature, -amount, adjustReason.trim(), adjustRequestId);
      setAdjustingUser(null);
      
      toast({
        title: 'Allocation ajustée',
        description: `Les crédits de ${user.userName} ont été ajustés avec historique`,
      });
      
      // Reload data
      await loadData();
    } catch (error) {
      console.error('Error resetting credits:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d’ajuster les crédits',
        variant: 'destructive',
      });
    } finally {
      setIsResetting(false);
    }
  };

  const formatLimit = (limit: number) => {
    return limit === -1 ? '∞' : limit.toString();
  };

  const getProgressValue = (used: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    if (limit === 0) return 100;
    return Math.min((used / limit) * 100, 100);
  };

  const getPlanBadgeClass = (plan: string) => {
    switch (plan) {
      case 'VIP':
        return 'bg-secondary text-secondary-foreground';
      case 'NORMAL':
        return 'bg-primary text-primary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2">Chargement des crédits IA...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Crédits IA</h1>
          <p className="text-muted-foreground mt-1">
            Suivre et gérer les allocations IA : exercices, {TUTOR_NAME} et chatbot — {stats?.currentMonth}
          </p>
        </div>
        <Button onClick={loadData} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{stats.totalUsers}</p>
                <p className="text-sm text-muted-foreground">Total Utilisateurs</p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-muted-foreground">{stats.freeUsers}</p>
                <p className="text-sm text-muted-foreground">FREE</p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold">{stats.normalUsers}</p>
                <p className="text-sm text-muted-foreground">NORMAL (600/80)</p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-secondary">{stats.vipUsers}</p>
                <p className="text-sm text-muted-foreground">VIP (1000/600)</p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-warning">{stats.avgUtilizationPercent}%</p>
                <p className="text-sm text-muted-foreground">Utilisation Moy.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-destructive">{stats.usersAtLimit}</p>
                <p className="text-sm text-muted-foreground">Limites Atteintes</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Credit Plans Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-muted">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge className="bg-muted text-muted-foreground">FREE</Badge>
              <span className="text-lg">0 DH</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Quiz IA</span>
              </div>
              <span className="font-bold text-destructive">Bloqué</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Voice Quiz</span>
              </div>
              <span className="font-bold text-destructive">Bloqué</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge className="bg-primary text-primary-foreground">NORMAL</Badge>
              <span className="text-lg">Sans expiration</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                <span className="text-sm">Exercices sans expiration</span>
              </div>
              <span className="font-bold">600 séries · 10/jour</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-primary" />
                <span className="text-sm">{TUTOR_NAME} sans expiration</span>
              </div>
              <span className="font-bold">80 sessions · 2/jour</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-secondary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge className="bg-secondary text-secondary-foreground">VIP</Badge>
              <span className="text-lg">Sans expiration</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-secondary" />
                <span className="text-sm">Exercices sans expiration</span>
              </div>
              <span className="font-bold">1000 séries · 15/jour</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-secondary" />
                <span className="text-sm">{TUTOR_NAME} sans expiration</span>
              </div>
              <span className="font-bold">600 sessions · 10/jour</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {adjustingUser && <Card><CardHeader><CardTitle>Ajuster l’allocation de {adjustingUser.userName}</CardTitle></CardHeader><CardContent className="space-y-3">
        <select aria-label="Service IA" className="border rounded p-2" value={adjustFeature} onChange={e => setAdjustFeature(e.target.value as typeof adjustFeature)} disabled={isResetting}>
          <option value="voice_quiz">{TUTOR_NAME}</option><option value="quiz_ia">Exercices</option><option value="chatbot">Chatbot</option>
        </select>
        {adjustingUser.allowances?.[adjustFeature] && <AllowanceStatus info={adjustingUser.allowances[adjustFeature]} />}
        <Input type="number" placeholder="Nombre à ajouter (négatif pour retirer)" value={adjustAmount} onChange={e => { setAdjustAmount(e.target.value); setAdjustRequestId(crypto.randomUUID()); }} disabled={isResetting} />
        <Input maxLength={255} placeholder="Motif obligatoire" value={adjustReason} onChange={e => { setAdjustReason(e.target.value); setAdjustRequestId(crypto.randomUUID()); }} disabled={isResetting} />
        <Button onClick={() => handleResetCredits(adjustingUser)} disabled={isResetting || !adjustReason.trim() || !adjustAmount}>Enregistrer l’ajustement</Button>
        <Button variant="ghost" onClick={() => setAdjustingUser(null)} disabled={isResetting}>Annuler</Button>
      </CardContent></Card>}

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Rechercher par nom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Credits Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Quiz IA</TableHead>
                  <TableHead>{TUTOR_NAME}</TableHead>
                  <TableHead>Chatbot</TableHead>
                  <TableHead>Utilisation</TableHead>
                  <TableHead>Validité</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? 'Aucun utilisateur trouvé' : 'Aucun utilisateur avec des crédits IA'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.userId}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.userName}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPlanBadgeClass(user.planName)}>
                          {user.planName}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 min-w-[100px]">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">
                              {user.quizIaUsed}/{formatLimit(user.quizIaLimit)}
                            </span>
                            <MessageSquare className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <Progress
                            value={getProgressValue(user.quizIaUsed, user.quizIaLimit)}
                            className="h-1"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 min-w-[100px]">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">
                              {user.voiceQuizUsed}/{formatLimit(user.voiceQuizLimit)}
                            </span>
                            <Mic className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <Progress
                            value={getProgressValue(user.voiceQuizUsed, user.voiceQuizLimit)}
                            className="h-1"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.allowances?.chatbot && <AllowanceStatus info={user.allowances.chatbot} />}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{user.utilizationPercent}%</span>
                          <TrendingUp
                            className={`w-4 h-4 ${
                              user.utilizationPercent > 80 ? 'text-warning' : 'text-success'
                            }`}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {user.yearMonth}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            user.status === 'ACTIF'
                              ? 'bg-success text-white'
                              : 'bg-destructive text-white'
                          }
                        >
                          {user.status === 'ACTIF' ? 'Actif' : 'Limite'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="gap-1 text-destructive"
                          disabled={isResetting}
                          onClick={() => { setAdjustingUser(user); setAdjustAmount(''); setAdjustReason(''); setAdjustRequestId(crypto.randomUUID()); }}
                        >
                          <RotateCcw className="w-3 h-3" />
                          Ajuster
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
