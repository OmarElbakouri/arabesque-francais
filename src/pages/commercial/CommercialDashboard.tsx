import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Users, DollarSign, UserPlus, TrendingUp, Search, Key, Trash2, Copy, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';

interface PromoUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'FREE' | 'EN_ATTENTE' | 'CONFIRME' | 'NORMAL' | 'VIP';
  registeredDate: string;
  revenue: number;
  promoCode: string;
}

const CommercialDashboard = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<PromoUser | null>(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [users, setUsers] = useState<PromoUser[]>([
    {
      id: '1',
      name: 'أحمد محمد',
      email: 'ahmed@example.com',
      phone: '+212612345678',
      status: 'FREE',
      registeredDate: '2025-01-15',
      revenue: 0,
      promoCode: 'COMM2025',
    },
    {
      id: '2',
      name: 'فاطمة الزهراء',
      email: 'fatima@example.com',
      phone: '+212623456789',
      status: 'EN_ATTENTE',
      registeredDate: '2025-01-10',
      revenue: 700,
      promoCode: 'COMM2025',
    },
    {
      id: '3',
      name: 'محمد العلوي',
      email: 'mohamed@example.com',
      phone: '+212634567890',
      status: 'CONFIRME',
      registeredDate: '2025-01-05',
      revenue: 700,
      promoCode: 'COMM2025',
    },
    {
      id: '4',
      name: 'سارة بنعلي',
      email: 'sara@example.com',
      phone: '+212645678901',
      status: 'NORMAL',
      registeredDate: '2024-12-20',
      revenue: 700,
      promoCode: 'COMM2025',
    },
  ]);

  const promoCode = 'COMM2025'; // Le code promo du commercial

  const handleStatusChange = (userId: string, currentStatus: string) => {
    let newStatus: string = currentStatus;
    
    if (currentStatus === 'FREE') {
      newStatus = 'EN_ATTENTE';
    } else if (currentStatus === 'EN_ATTENTE') {
      newStatus = 'CONFIRME';
    }
    
    setUsers(users.map(u => 
      u.id === userId ? { ...u, status: newStatus as PromoUser['status'] } : u
    ));
    
    toast({
      title: 'Statut mis à jour',
      description: `Le statut de l'utilisateur a été changé en ${statusLabels[newStatus]}`,
    });
  };

  const handlePasswordChange = () => {
    if (!selectedUser || !newPassword) return;
    
    // Mock password update - sera remplacé par appel API
    toast({
      title: 'Mot de passe mis à jour',
      description: `Le mot de passe de ${selectedUser.name} a été modifié`,
    });
    
    setPasswordDialogOpen(false);
    setNewPassword('');
    setSelectedUser(null);
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;
    
    setUsers(users.filter(u => u.id !== selectedUser.id));
    
    toast({
      title: 'Utilisateur supprimé',
      description: `${selectedUser.name} a été supprimé avec succès`,
      variant: 'destructive',
    });
    
    setDeleteDialogOpen(false);
    setSelectedUser(null);
  };

  const openPasswordDialog = (user: PromoUser) => {
    setSelectedUser(user);
    setPasswordDialogOpen(true);
  };

  const openDeleteDialog = (user: PromoUser) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = users.reduce((sum, u) => sum + u.revenue, 0);
  const confirmedUsers = users.filter((u) => u.status === 'CONFIRME' || u.status === 'NORMAL' || u.status === 'VIP').length;
  const pendingUsers = users.filter((u) => u.status === 'EN_ATTENTE').length;
  const freeUsers = users.filter((u) => u.status === 'FREE').length;

  const statusColors: Record<string, string> = {
    FREE: 'bg-muted text-muted-foreground',
    EN_ATTENTE: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20',
    CONFIRME: 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20',
    NORMAL: 'bg-primary/10 text-primary border border-primary/20',
    VIP: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20',
  };

  const statusLabels: Record<string, string> = {
    FREE: 'Gratuit',
    EN_ATTENTE: 'En attente',
    CONFIRME: 'Confirmé',
    NORMAL: 'Normal',
    VIP: 'VIP',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Bienvenue, {user?.prenom}</h1>
        <p className="text-muted-foreground">Gérez les utilisateurs inscrits avec votre code promo</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">Tous inscrits avec votre code</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus Totaux</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRevenue} DH</div>
            <p className="text-xs text-muted-foreground">De tous les abonnés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs Confirmés</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{confirmedUsers}</div>
            <p className="text-xs text-muted-foreground">Clients actifs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Attente</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingUsers}</div>
            <p className="text-xs text-muted-foreground">{freeUsers} gratuit</p>
          </CardContent>
        </Card>
      </div>

      {/* Promo Code Display */}
      <Card className="bg-gradient-to-br from-primary/10 to-secondary/10">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Votre code promo</p>
              <p className="text-3xl font-bold text-primary">{promoCode}</p>
            </div>
            <Button onClick={() => navigator.clipboard.writeText(promoCode)}>
              Copier le code
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Utilisateurs Inscrits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="FREE">Gratuit</SelectItem>
                <SelectItem value="EN_ATTENTE">En attente</SelectItem>
                <SelectItem value="CONFIRME">Confirmé</SelectItem>
                <SelectItem value="NORMAL">Normal</SelectItem>
                <SelectItem value="VIP">VIP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Utilisateur</TableHead>
                  <TableHead className="w-[150px]">Coordonnées</TableHead>
                  <TableHead className="w-[100px]">Revenus</TableHead>
                  <TableHead className="w-[120px]">Date d'inscription</TableHead>
                  <TableHead className="w-[120px]">Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      Aucun utilisateur trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{user.phone}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{user.revenue} DH</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{new Date(user.registeredDate).toLocaleDateString('fr-FR')}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColors[user.status]}>
                          {statusLabels[user.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          {(user.status === 'FREE' || user.status === 'EN_ATTENTE') && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleStatusChange(user.id, user.status)}
                              className="gap-1"
                            >
                              {user.status === 'FREE' ? 'En attente' : 'Confirmer'}
                              <ArrowLeft className="h-3 w-3 rotate-180" />
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => openPasswordDialog(user)}
                            title="Changer le mot de passe"
                          >
                            <Key className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => openDeleteDialog(user)}
                            title="Supprimer l'utilisateur"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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

      {/* Password Change Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Changer le mot de passe</DialogTitle>
            <DialogDescription>
              Changer le mot de passe de {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">Nouveau mot de passe</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Entrez le nouveau mot de passe"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handlePasswordChange} disabled={!newPassword}>
              Mettre à jour le mot de passe
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              L'utilisateur {selectedUser?.name} sera supprimé définitivement. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CommercialDashboard;
