import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
import { Search, Edit, Trash2, Mail, Phone } from 'lucide-react';
import { adminService } from '@/services/adminService';
import { useAuthStore } from '@/stores/authStore';
import { toast } from '@/hooks/use-toast';

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
  active: boolean;
  creditBalance: number;
  currentPlan?: string; // FREE, NORMAL, VIP - from backend
  plan?: string; // For backward compatibility
}

export default function AdminUsers() {
  const currentUser = useAuthStore((state) => state.user);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    role: '',
    status: '',
    credits: 0,
    plan: '',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      console.log('🔄 Chargement des utilisateurs...');
      const data = await adminService.getAllUsers();
      console.log('✅ Données reçues de l\'API:', data);
      console.log('📊 Type de données:', typeof data);
      console.log('📦 Est un tableau?', Array.isArray(data));
      
      const usersArray = Array.isArray(data) ? data : [];
      console.log('👥 Nombre d\'utilisateurs:', usersArray.length);
      
      // Log first user to see structure
      if (usersArray.length > 0) {
        console.log('🔍 Premier utilisateur structure:', usersArray[0]);
        console.log('🔍 Current Plan field:', usersArray[0].currentPlan);
        console.log('🔍 Plan field (old):', usersArray[0].plan);
      }
      
      setUsers(usersArray);
    } catch (error: any) {
      console.error('❌ Erreur lors du chargement des utilisateurs:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error message:', error.response?.data?.message);
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Impossible de charger les utilisateurs',
        variant: 'destructive',
      });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      role: user.role,
      status: user.status,
      credits: user.creditBalance,
      plan: user.currentPlan || user.plan || 'FREE',
    });
    setEditDialogOpen(true);
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;

    try {
      // Prepare update data - match backend expected format
      const updateData: Record<string, any> = {
        role: editForm.role,
        status: editForm.status,
        creditBalance: editForm.credits,
      };

      // Only include plan for USER/NORMAL role
      if (editForm.role === 'USER' || editForm.role === 'NORMAL') {
        updateData.plan = editForm.plan;
      }

      // Update user with all changes at once
      console.log('Updating user with data:', updateData);
      await adminService.updateUser(selectedUser.id, updateData);

      toast({
        title: 'Succès',
        description: 'Utilisateur mis à jour avec succès',
      });
      setEditDialogOpen(false);
      loadUsers();
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error response message:', JSON.stringify(error.response?.data, null, 2));
      console.error('Error status:', error.response?.status);
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Impossible de mettre à jour l\'utilisateur',
        variant: 'destructive',
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser || !currentUser) return;

    try {
      await adminService.deleteUser(selectedUser.id, currentUser.id);
      toast({
        title: 'Succès',
        description: 'Utilisateur supprimé avec succès',
      });
      setDeleteDialogOpen(false);
      loadUsers();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer l\'utilisateur',
        variant: 'destructive',
      });
    }
  };

  const roleColors: Record<string, string> = {
    NORMAL: 'bg-muted/10 text-muted-foreground border border-muted',
    VIP: 'bg-primary/10 text-primary border border-primary/20',
    COMMERCIAL: 'bg-blue-500/10 text-blue-600 border border-blue-500/20',
    ADMIN: 'bg-destructive/10 text-destructive border border-destructive/20',
  };

  const statusColors: Record<string, string> = {
    CONFIRME: 'bg-green-500/10 text-green-600 border border-green-500/20',
    EN_ATTENTE: 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20',
    EXPIRED: 'bg-red-500/10 text-red-600 border border-red-500/20',
    SUSPENDED: 'bg-gray-500/10 text-gray-600 border border-gray-500/20',
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      (user.fullName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const stats = {
    total: users.length,
    normal: users.filter((u) => u.role === 'NORMAL').length,
    vip: users.filter((u) => u.role === 'VIP').length,
    confirme: users.filter((u) => u.status === 'CONFIRME').length,
    enAttente: users.filter((u) => u.status === 'EN_ATTENTE').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Gestion des Utilisateurs</h1>
        <p className="text-muted-foreground mt-1">Afficher et gérer tous les utilisateurs</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.normal}</p>
              <p className="text-sm text-muted-foreground">Normal</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{stats.vip}</p>
              <p className="text-sm text-muted-foreground">VIP</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.confirme}</p>
              <p className="text-sm text-muted-foreground">Confirmé</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats.enAttente}</p>
              <p className="text-sm text-muted-foreground">En Attente</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Recherche et Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Rechercher par nom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Type d'abonnement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="NORMAL">Normal</SelectItem>
                <SelectItem value="VIP">VIP</SelectItem>
                <SelectItem value="COMMERCIAL">Commercial</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="CONFIRME">Confirmé</SelectItem>
                <SelectItem value="EN_ATTENTE">En attente</SelectItem>
                <SelectItem value="EXPIRED">Expiré</SelectItem>
                <SelectItem value="SUSPENDED">Suspendu</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Crédits</TableHead>
                  <TableHead>Actif</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Aucun utilisateur trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <p className="font-medium">{user.fullName || 'N/A'}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-3 h-3 text-muted-foreground" />
                          <span className="text-muted-foreground">{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={roleColors[user.role] || ''}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColors[user.status] || ''}>
                          {user.status === 'CONFIRME' ? 'CONFIRMÉ' : user.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {(user.role === 'USER' || user.role === 'NORMAL') ? (
                          <Badge 
                            variant="outline" 
                            className={
                              (user.currentPlan || user.plan) === 'VIP' 
                                ? 'bg-purple-500/10 text-purple-600 border-purple-500/20' 
                                : (user.currentPlan || user.plan) === 'NORMAL'
                                ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                                : 'bg-gray-500/10 text-gray-600 border-gray-500/20'
                            }
                          >
                            {user.currentPlan || user.plan || 'FREE'}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{user.creditBalance}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.active ? 'default' : 'secondary'}>
                          {user.active ? 'Oui' : 'Non'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEdit(user)}
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(user)}
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
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

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'utilisateur</DialogTitle>
            <DialogDescription>
              Modifier les informations de {selectedUser?.fullName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="role">Type</Label>
              <Select
                value={editForm.role}
                onValueChange={(value) => setEditForm({ ...editForm, role: value })}
              >
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NORMAL">Normal</SelectItem>
                  <SelectItem value="VIP">VIP</SelectItem>
                  <SelectItem value="COMMERCIAL">Commercial</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select
                value={editForm.status}
                onValueChange={(value) => setEditForm({ ...editForm, status: value })}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CONFIRME">Confirmé</SelectItem>
                  <SelectItem value="EN_ATTENTE">En attente</SelectItem>
                  <SelectItem value="EXPIRED">Expiré</SelectItem>
                  <SelectItem value="SUSPENDED">Suspendu</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Only show plan field for USER/NORMAL role, not for COMMERCIAL or ADMIN */}
            {(editForm.role === 'USER' || editForm.role === 'NORMAL') && (
              <div className="space-y-2">
                <Label htmlFor="plan">Type de Plan</Label>
                <Select
                  value={editForm.plan}
                  onValueChange={(value) => setEditForm({ ...editForm, plan: value })}
                >
                  <SelectTrigger id="plan">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FREE">Free</SelectItem>
                    <SelectItem value="NORMAL">Normal</SelectItem>
                    <SelectItem value="VIP">VIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="credits">Crédits</Label>
              <Input
                id="credits"
                type="number"
                value={editForm.credits}
                onChange={(e) =>
                  setEditForm({ ...editForm, credits: parseInt(e.target.value) || 0 })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveEdit}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'utilisateur {selectedUser?.fullName} et toutes ses
              données seront définitivement supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
