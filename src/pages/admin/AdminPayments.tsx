import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { Search, Edit, CheckCircle, XCircle, Clock, DollarSign, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { adminService } from '@/services/adminService';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  phone?: string;
  role: string;
  plan: 'NORMAL' | 'VIP';
  paymentStatus: 'PENDING' | 'ACCEPTE' | 'REFUSE' | 'CANCELLED';
  paymentMethod?: 'VIREMENT' | 'ESPECES' | 'CHEQUE' | 'MOBILE';
  amount?: number;
  transactionReference?: string;
  creditBalance: number;
  createdAt: string;
  paidAt?: string;
}

interface EditPaymentData {
  userId: number;
  userName: string;
  currentStatus: string;
  currentMethod?: string;
}

export default function AdminPayments() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<EditPaymentData | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      console.log('👥 Chargement des paiements (utilisateurs NORMAL et VIP)...');
      
      const payments = await adminService.getAllPayments();
      console.log('📦 Paiements reçus:', payments);
      console.log('📦 Type de payments:', typeof payments);
      console.log('📦 Est un tableau?', Array.isArray(payments));
      
      // Check if payments is a valid array
      if (!payments || !Array.isArray(payments)) {
        console.warn('⚠️ Réponse invalide - pas un tableau:', payments);
        setUsers([]);
        return;
      }

      console.log('📦 Nombre de paiements:', payments.length);
      
      if (payments.length > 0) {
        console.log('📦 Premier paiement:', {
          id: payments[0].id,
          planName: payments[0].planName,
          user: payments[0].user ? {
            email: payments[0].user.email,
            id: payments[0].user.id
          } : 'no user'
        });
      }
      
      // Map payments to user format with planName from payment
      const usersWithPayments = payments.map((payment: any) => {
        const user = payment.user || {};
        
        // Extract names from user object or userProfile
        const firstName = user.firstName || user.userProfile?.firstName || '';
        const lastName = user.lastName || user.userProfile?.lastName || '';
        const fullName = `${firstName} ${lastName}`.trim() || user.email?.split('@')[0] || 'Unknown';
        
        // planName comes from the payment object directly
        const planName = payment.planName || 'NORMAL';
        const plan = (planName.toUpperCase() === 'VIP' ? 'VIP' : 'NORMAL') as 'NORMAL' | 'VIP';
        
        // Payment status from payment object
        const paymentStatus = payment.status || 'PENDING';
        
        return {
          id: user.id || payment.id,
          email: user.email || '',
          firstName,
          lastName,
          fullName,
          phone: user.phone || user.userProfile?.phone || '',
          role: user.role || 'USER',
          plan,
          paymentStatus: paymentStatus as 'PENDING' | 'ACCEPTE' | 'REFUSE' | 'CANCELLED',
          paymentMethod: payment.paymentMethod,
          amount: payment.amount,
          transactionReference: payment.transactionReference,
          creditBalance: user.creditBalance || 0,
          createdAt: user.createdAt || payment.createdAt,
          paidAt: payment.paidAt,
        };
      });
      
      console.log('✅ Utilisateurs avec paiements mappés:', usersWithPayments.length);
      if (usersWithPayments.length > 0) {
        console.log('📦 Premier utilisateur mappé:', usersWithPayments[0]);
      }
      
      setUsers(usersWithPayments);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des paiements:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les paiements',
        variant: 'destructive',
      });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEditClick = (user: User) => {
    setEditingUser({
      userId: user.id,
      userName: user.fullName,
      currentStatus: user.paymentStatus,
      currentMethod: user.paymentMethod,
    });
    setSelectedStatus(user.paymentStatus);
    setSelectedMethod(user.paymentMethod || 'UNDEFINED');
    setEditDialogOpen(true);
  };

  const handleSavePayment = async () => {
    if (!editingUser) return;

    try {
      setSaving(true);
      console.log('💾 Mise à jour du paiement pour l\'utilisateur:', editingUser.userId);
      console.log('📋 Status actuel:', editingUser.currentStatus, '→ Nouveau:', selectedStatus);
      console.log('📋 Méthode actuelle:', editingUser.currentMethod, '→ Nouvelle:', selectedMethod);
      
      // Prepare updates object
      const updates: { status?: string; paymentMethod?: string } = {};
      
      if (selectedStatus !== editingUser.currentStatus) {
        updates.status = selectedStatus;
      }
      
      if (selectedMethod && selectedMethod !== 'UNDEFINED' && selectedMethod !== editingUser.currentMethod) {
        updates.paymentMethod = selectedMethod;
      }
      
      // Make single API call with all updates
      if (Object.keys(updates).length > 0) {
        console.log('🔄 Mise à jour du paiement avec:', updates);
        console.log('📤 API Call: PUT /admin/payments/update');
        console.log('📤 Body:', { paymentId: editingUser.userId, ...updates });
        
        await adminService.updatePayment(editingUser.userId, updates);
        console.log('✅ Paiement mis à jour');
      } else {
        console.log('ℹ️ Aucune modification détectée');
      }

      toast({
        title: 'Succès',
        description: 'Informations de paiement mises à jour',
      });

      setEditDialogOpen(false);
      setEditingUser(null);
      loadUsers(); // Reload to get fresh data
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour:', error);
      
      // Log detailed error information
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as any;
        console.error('❌ Response status:', axiosError.response?.status);
        console.error('❌ Response data:', axiosError.response?.data);
        console.error('❌ Request URL:', axiosError.config?.url);
        console.error('❌ Request params:', axiosError.config?.params);
      }
      
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour les informations',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.paymentStatus === statusFilter;
    const matchesPlan = planFilter === 'all' || user.plan === planFilter;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  // Calculate stats
  const stats = {
    total: filteredUsers.length,
    pending: filteredUsers.filter(u => u.paymentStatus === 'PENDING').length,
    validated: filteredUsers.filter(u => u.paymentStatus === 'ACCEPTE').length,
    rejected: filteredUsers.filter(u => u.paymentStatus === 'REFUSE' || u.paymentStatus === 'CANCELLED').length,
  };

  const getStatusBadge = (status: string) => {
    const config = {
      PENDING: { icon: Clock, color: 'bg-yellow-500', label: 'En Attente' },
      ACCEPTE: { icon: CheckCircle, color: 'bg-green-500', label: 'Accepté' },
      REFUSE: { icon: XCircle, color: 'bg-red-500', label: 'Refusé' },
      CANCELLED: { icon: XCircle, color: 'bg-gray-500', label: 'Annulé' },
    };
    const { icon: Icon, color, label } = config[status as keyof typeof config] || config.PENDING;
    return (
      <Badge className={`${color} text-white`}>
        <Icon className="mr-1 h-3 w-3" />
        {label}
      </Badge>
    );
  };

  const getMethodBadge = (method?: string) => {
    if (!method) return <span className="text-gray-400 text-sm">Non défini</span>;
    
    const config = {
      VIREMENT: { color: 'bg-blue-500', label: 'Virement' },
      ESPECES: { color: 'bg-green-500', label: 'Espèces' },
      CHEQUE: { color: 'bg-purple-500', label: 'Chèque' },
      MOBILE: { color: 'bg-orange-500', label: 'Mobile' },
    };
    const { color, label } = config[method as keyof typeof config] || { color: 'bg-gray-500', label: method };
    return <Badge className={`${color} text-white`}>{label}</Badge>;
  };

  const getPlanBadge = (plan: string) => {
    const config = {
      NORMAL: { color: 'bg-blue-600', label: 'Normal' },
      VIP: { color: 'bg-purple-600', label: 'VIP' },
    };
    const { color, label } = config[plan as keyof typeof config];
    return <Badge className={`${color} text-white`}>{label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Paiements</h1>
          <p className="text-gray-500 mt-1">Gérer les statuts et méthodes de paiement des utilisateurs NORMAL et VIP</p>
        </div>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Utilisateurs</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</h3>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">En Attente</p>
                  <h3 className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</h3>
                </div>
                <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Validés</p>
                  <h3 className="text-3xl font-bold text-green-600 mt-2">{stats.validated}</h3>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Rejetés</p>
                  <h3 className="text-3xl font-bold text-red-600 mt-2">{stats.rejected}</h3>
                </div>
                <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher par nom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="PENDING">En Attente</SelectItem>
                <SelectItem value="ACCEPTE">Accepté</SelectItem>
                <SelectItem value="REFUSE">Refusé</SelectItem>
                <SelectItem value="CANCELLED">Annulé</SelectItem>
              </SelectContent>
            </Select>

            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrer par plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les plans</SelectItem>
                <SelectItem value="NORMAL">Normal</SelectItem>
                <SelectItem value="VIP">VIP</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Aucun utilisateur trouvé</h3>
              <p className="mt-2 text-sm text-gray-500">
                {users.length === 0 
                  ? "Il n'y a pas encore d'utilisateurs NORMAL ou VIP."
                  : "Aucun utilisateur ne correspond à vos critères de recherche."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut Paiement</TableHead>
                    <TableHead>Méthode Paiement</TableHead>
                    <TableHead>Référence</TableHead>
                    <TableHead>Date Paiement</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="font-medium">{user.fullName || `${user.firstName} ${user.lastName}`}</div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone || '-'}</TableCell>
                      <TableCell>{getPlanBadge(user.plan)}</TableCell>
                      <TableCell>
                        <span className="font-bold text-gray-900">{user.amount ? `${user.amount} DH` : '-'}</span>
                      </TableCell>
                      <TableCell>{getStatusBadge(user.paymentStatus)}</TableCell>
                      <TableCell>{getMethodBadge(user.paymentMethod)}</TableCell>
                      <TableCell>
                        <span className="font-mono text-xs text-gray-600">
                          {user.transactionReference || '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {user.paidAt ? new Date(user.paidAt).toLocaleDateString('fr-FR') : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditClick(user)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Modifier
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Payment Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Modifier les informations de paiement</DialogTitle>
            <DialogDescription>
              {editingUser?.userName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Statut de Paiement</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4 text-yellow-600" />
                      En Attente
                    </div>
                  </SelectItem>
                  <SelectItem value="ACCEPTE">
                    <div className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                      Accepté
                    </div>
                  </SelectItem>
                  <SelectItem value="REFUSE">
                    <div className="flex items-center">
                      <XCircle className="mr-2 h-4 w-4 text-red-600" />
                      Refusé
                    </div>
                  </SelectItem>
                  <SelectItem value="CANCELLED">
                    <div className="flex items-center">
                      <XCircle className="mr-2 h-4 w-4 text-gray-600" />
                      Annulé
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Méthode de Paiement</label>
              <Select value={selectedMethod || 'UNDEFINED'} onValueChange={setSelectedMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une méthode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UNDEFINED">Non défini</SelectItem>
                  <SelectItem value="VIREMENT">Virement</SelectItem>
                  <SelectItem value="ESPECES">Espèces</SelectItem>
                  <SelectItem value="CHEQUE">Chèque</SelectItem>
                  <SelectItem value="MOBILE">Mobile</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={saving}
            >
              Annuler
            </Button>
            <Button onClick={handleSavePayment} disabled={saving}>
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
