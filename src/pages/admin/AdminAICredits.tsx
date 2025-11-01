import { useState } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, MessageSquare, Mic, TrendingUp, AlertCircle, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserCredits {
  id: string;
  utilisateur: string;
  email: string;
  plan: 'NORMAL' | 'VIP';
  creditsMessages: number;
  maxMessages: number;
  creditsVocaux: number;
  maxVocaux: number;
  utilisation: number;
  dateReset: string;
  statut: 'ACTIF' | 'LIMITE_ATTEINTE';
}

export default function AdminAICredits() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserCredits | null>(null);
  const [showAdjustDialog, setShowAdjustDialog] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState(0);

  const [users] = useState<UserCredits[]>([
    {
      id: '1',
      utilisateur: 'محمد الإدريسي',
      email: 'mohamed@example.com',
      plan: 'NORMAL',
      creditsMessages: 18,
      maxMessages: 30,
      creditsVocaux: 6,
      maxVocaux: 10,
      utilisation: 60,
      dateReset: '2024-12-01',
      statut: 'ACTIF',
    },
    {
      id: '2',
      utilisateur: 'فاطمة الزهراء',
      email: 'fatima@example.com',
      plan: 'VIP',
      creditsMessages: 45,
      maxMessages: 70,
      creditsVocaux: 15,
      maxVocaux: 25,
      utilisation: 64,
      dateReset: '2024-12-01',
      statut: 'ACTIF',
    },
    {
      id: '3',
      utilisateur: 'يوسف الحسني',
      email: 'youssef@example.com',
      plan: 'NORMAL',
      creditsMessages: 2,
      maxMessages: 30,
      creditsVocaux: 0,
      maxVocaux: 10,
      utilisation: 93,
      dateReset: '2024-12-01',
      statut: 'LIMITE_ATTEINTE',
    },
    {
      id: '4',
      utilisateur: 'سارة المنصوري',
      email: 'sara@example.com',
      plan: 'VIP',
      creditsMessages: 62,
      maxMessages: 70,
      creditsVocaux: 20,
      maxVocaux: 25,
      utilisation: 11,
      dateReset: '2024-12-01',
      statut: 'ACTIF',
    },
  ]);

  const filteredUsers = users.filter((user) =>
    user.utilisateur.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalUsers: users.length,
    normalUsers: users.filter((u) => u.plan === 'NORMAL').length,
    vipUsers: users.filter((u) => u.plan === 'VIP').length,
    avgUtilisation: Math.round(
      users.reduce((sum, u) => sum + u.utilisation, 0) / users.length
    ),
    limitesAtteintes: users.filter((u) => u.statut === 'LIMITE_ATTEINTE').length,
  };

  const handleAdjustCredits = () => {
    if (!selectedUser) return;
    
    toast({
      title: 'Crédits Ajustés',
      description: `${adjustAmount > 0 ? 'Ajouté' : 'Retiré'} ${Math.abs(adjustAmount)} crédits pour ${selectedUser.utilisateur}`,
    });
    setShowAdjustDialog(false);
    setSelectedUser(null);
    setAdjustAmount(0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Gestion des Crédits IA</h1>
        <p className="text-muted-foreground mt-1">
          Suivre et gérer l'utilisation des crédits IA (Chat DeepSeek & Alibaba Cloud Speech)
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
              <p className="text-3xl font-bold">{stats.normalUsers}</p>
              <p className="text-sm text-muted-foreground">
                Normal (30/10)
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-secondary">{stats.vipUsers}</p>
              <p className="text-sm text-muted-foreground">
                VIP (70/25)
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-warning">{stats.avgUtilisation}%</p>
              <p className="text-sm text-muted-foreground">Utilisation Moy.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-destructive">{stats.limitesAtteintes}</p>
              <p className="text-sm text-muted-foreground">Limites Atteintes</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Credit Plans Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge className="bg-primary text-primary-foreground">NORMAL</Badge>
              <span className="text-lg">750 DH/mois</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                <span className="text-sm">Messages IA par chapitre</span>
              </div>
              <span className="font-bold">30 messages</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-primary" />
                <span className="text-sm">Vocaux IA par chapitre</span>
              </div>
              <span className="font-bold">10 vocaux</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-secondary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge className="bg-secondary text-secondary-foreground">VIP</Badge>
              <span className="text-lg">1000 DH/mois</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-secondary" />
                <span className="text-sm">Messages IA par chapitre</span>
              </div>
              <span className="font-bold">70 messages</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-secondary" />
                <span className="text-sm">Vocaux IA par chapitre</span>
              </div>
              <span className="font-bold">25 vocaux</span>
            </div>
          </CardContent>
        </Card>
      </div>

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
                  <TableHead>Messages IA</TableHead>
                  <TableHead>Vocaux IA</TableHead>
                  <TableHead>Utilisation</TableHead>
                  <TableHead>Reset Date</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.utilisateur}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          user.plan === 'VIP'
                            ? 'bg-secondary text-secondary-foreground'
                            : 'bg-primary text-primary-foreground'
                        }
                      >
                        {user.plan}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">
                            {user.creditsMessages}/{user.maxMessages}
                          </span>
                          <MessageSquare className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <Progress
                          value={(user.creditsMessages / user.maxMessages) * 100}
                          className="h-1"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">
                            {user.creditsVocaux}/{user.maxVocaux}
                          </span>
                          <Mic className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <Progress
                          value={(user.creditsVocaux / user.maxVocaux) * 100}
                          className="h-1"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{user.utilisation}%</span>
                          <TrendingUp
                            className={`w-4 h-4 ${
                              user.utilisation > 80 ? 'text-warning' : 'text-success'
                            }`}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(user.dateReset).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          user.statut === 'ACTIF'
                            ? 'bg-success text-white'
                            : 'bg-destructive text-white'
                        }
                      >
                        {user.statut === 'ACTIF' ? 'Actif' : 'Limite'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowAdjustDialog(true);
                        }}
                      >
                        <Plus className="w-3 h-3" />
                        Ajuster
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Adjust Credits Dialog */}
      <Dialog open={showAdjustDialog} onOpenChange={setShowAdjustDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajuster les Crédits IA</DialogTitle>
            <DialogDescription>
              Ajouter ou retirer des crédits pour cet utilisateur
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Utilisateur</p>
                <p className="font-medium">{selectedUser.utilisateur}</p>
                <Badge className="mt-2">{selectedUser.plan}</Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Messages actuels</p>
                  <p className="text-lg font-bold">
                    {selectedUser.creditsMessages}/{selectedUser.maxMessages}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Vocaux actuels</p>
                  <p className="text-lg font-bold">
                    {selectedUser.creditsVocaux}/{selectedUser.maxVocaux}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adjust">Nombre de crédits (+ pour ajouter, - pour retirer)</Label>
                <Input
                  id="adjust"
                  type="number"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(parseInt(e.target.value) || 0)}
                  placeholder="Ex: +10 ou -5"
                />
                <p className="text-xs text-muted-foreground">
                  <AlertCircle className="w-3 h-3 inline mr-1" />
                  Ceci ajustera les crédits messages de l'utilisateur
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdjustDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleAdjustCredits}>Ajuster les Crédits</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
