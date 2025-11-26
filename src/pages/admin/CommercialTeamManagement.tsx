import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Users, 
  DollarSign, 
  UserPlus, 
  TrendingUp, 
  Copy, 
  RefreshCw,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { adminService } from '@/services/adminService';

interface Commercial {
  id: number;
  email: string;
  name: string;
  promoCode: string;
  commission: number;
  monthlyRevenue: number;
  totalRevenue: number;
  clientsThisMonth: number;
  conversionRate: number;
  clientsCount: number;
  active: boolean;
}

interface CommercialStats {
  totalCommercials: number;
  activeCommercials: number;
  totalClientsThisMonth: number;
  totalClients: number;
  monthlyRevenue: number;
  totalRevenue: number;
}

export default function CommercialTeamManagement() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [commercials, setCommercials] = useState<Commercial[]>([]);
  const [stats, setStats] = useState<CommercialStats>({
    totalCommercials: 0,
    activeCommercials: 0,
    totalClientsThisMonth: 0,
    totalClients: 0,
    monthlyRevenue: 0,
    totalRevenue: 0,
  });
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCommercial, setNewCommercial] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
  });

  useEffect(() => {
    fetchCommercials();
    fetchStatistics();
  }, []);

  const fetchCommercials = async () => {
    try {
      setLoading(true);
      const data = await adminService.getCommercialTeam();
      setCommercials(data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de charger les commerciaux',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const data = await adminService.getCommercialTeamStatistics();
      setStats(data);
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    }
  };

  const handleCreateCommercial = async () => {
    if (!newCommercial.email || !newCommercial.password || !newCommercial.firstName || !newCommercial.lastName) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Tous les champs sont obligatoires',
      });
      return;
    }

    try {
      setLoading(true);
      await adminService.createCommercial(newCommercial);
      
      toast({
        title: '✅ Commercial créé avec succès',
        description: `${newCommercial.firstName} ${newCommercial.lastName} a été ajouté à l'équipe`,
      });
      
      setIsCreateModalOpen(false);
      setNewCommercial({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
      });
      
      // Recharger les données
      await fetchCommercials();
      await fetchStatistics();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de créer le commercial',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPromoCode = (promoCode: string) => {
    navigator.clipboard.writeText(promoCode);
    toast({
      title: '📋 Code copié',
      description: `Le code promo "${promoCode}" a été copié`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestion de l'Équipe Commerciale</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les commerciaux et suivez leurs performances
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              fetchCommercials();
              fetchStatistics();
            }}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </Button>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="w-4 h-4" />
                Nouveau Commercial
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer un nouveau commercial</DialogTitle>
                <DialogDescription>
                  Ajoutez un nouveau membre à l'équipe commerciale
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom *</Label>
                    <Input
                      id="firstName"
                      value={newCommercial.firstName}
                      onChange={(e) =>
                        setNewCommercial({ ...newCommercial, firstName: e.target.value })
                      }
                      placeholder="Jean"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom *</Label>
                    <Input
                      id="lastName"
                      value={newCommercial.lastName}
                      onChange={(e) =>
                        setNewCommercial({ ...newCommercial, lastName: e.target.value })
                      }
                      placeholder="Dupont"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newCommercial.email}
                    onChange={(e) =>
                      setNewCommercial({ ...newCommercial, email: e.target.value })
                    }
                    placeholder="jean.dupont@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newCommercial.password}
                    onChange={(e) =>
                      setNewCommercial({ ...newCommercial, password: e.target.value })
                    }
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={newCommercial.phone}
                    onChange={(e) =>
                      setNewCommercial({ ...newCommercial, phone: e.target.value })
                    }
                    placeholder="+212 6XX XXX XXX"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreateCommercial} disabled={loading}>
                  {loading ? 'Création...' : 'Créer le commercial'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenus du mois</p>
                <p className="text-3xl font-bold text-primary">
                  DH {stats.monthlyRevenue}
                </p>
              </div>
              <DollarSign className="h-10 w-10 text-primary/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenus Totaux</p>
                <p className="text-3xl font-bold text-success">
                  DH {stats.totalRevenue}
                </p>
              </div>
              <TrendingUp className="h-10 w-10 text-success/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Clients ce mois</p>
                <p className="text-3xl font-bold text-warning">
                  {stats.totalClientsThisMonth}
                </p>
              </div>
              <Users className="h-10 w-10 text-warning/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Clients</p>
                <p className="text-3xl font-bold text-secondary">
                  {stats.totalClients}
                </p>
              </div>
              <Users className="h-10 w-10 text-secondary/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Commercials Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Commerciaux</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Actions</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Revenus du mois</TableHead>
                  <TableHead>Revenus Totaux</TableHead>
                  <TableHead>Clients du mois</TableHead>
                  <TableHead>Total Clients</TableHead>
                  <TableHead>Code Promo</TableHead>
                  <TableHead>Commercial</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Chargement...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : commercials.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Aucun commercial trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  commercials.map((commercial) => (
                    <TableRow key={commercial.id}>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Badge>{commercial.commission}%</Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        DH {commercial.monthlyRevenue}
                      </TableCell>
                      <TableCell className="font-medium">
                        DH {commercial.totalRevenue}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-success text-white">
                          {commercial.clientsThisMonth}+
                        </Badge>
                      </TableCell>
                      <TableCell>{commercial.clientsCount}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-primary">
                            {commercial.promoCode}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyPromoCode(commercial.promoCode)}
                            title="Copier le code promo"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{commercial.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {commercial.email}
                          </span>
                        </div>
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
