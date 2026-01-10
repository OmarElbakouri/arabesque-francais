import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Plus, Edit, Trash2, CheckCircle, XCircle, Clock, DollarSign, Users, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { adminService } from '@/services/adminService';

// Mapping for payment methods (EN -> FR display)
const PAYMENT_METHOD_DISPLAY: Record<string, string> = {
  'TRANSFER': 'Virement',
  'CASH': 'Espèces',
  'CHECK': 'Chèque',
  'MOBILE': 'Mobile',
};

// Mapping for status (EN -> FR display)
const PAYMENT_STATUS_DISPLAY: Record<string, string> = {
  'PENDING': 'En Attente',
  'ACCEPTE': 'Accepté',
  'REFUSE': 'Refusé',
};

interface DirectUser {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  currentPlan: string;
  createdAt: string;
  hasActiveSubscription: boolean;
  hasPromoCode?: boolean; // true si l'utilisateur a un code promo (appartient à un commercial)
  promoCodeUsed?: string; // le code promo utilisé
}

interface DirectPayment {
  id: number;
  userId: number;
  userEmail: string;
  userName: string;
  planName: string;
  amount: number;
  status: 'PENDING' | 'ACCEPTE' | 'REFUSE';
  paymentMethod: 'TRANSFER' | 'CASH' | 'CHECK' | 'MOBILE';
  transactionReference?: string;
  adminNotes?: string;
  createdAt: string;
  paidAt?: string;
}

interface DirectPaymentStats {
  totalPayments: number;
  pendingCount: number;
  acceptedCount: number;
  refusedCount: number;
  totalRevenue: number;
  usersWithoutPromoCode: number;
}

export default function AdminDirectPayments() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [payments, setPayments] = useState<DirectPayment[]>([]);
  const [usersWithoutPromoCode, setUsersWithoutPromoCode] = useState<DirectUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DirectPaymentStats>({
    totalPayments: 0,
    pendingCount: 0,
    acceptedCount: 0,
    refusedCount: 0,
    totalRevenue: 0,
    usersWithoutPromoCode: 0,
  });

  // Create Payment Dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [userSearchTerm, setUserSearchTerm] = useState(''); // Search for users by email/phone
  const [newPlanName, setNewPlanName] = useState<'NORMAL' | 'VIP'>('NORMAL');
  const [newAmount, setNewAmount] = useState<number>(0);
  const [newPaymentMethod, setNewPaymentMethod] = useState<'TRANSFER' | 'CASH' | 'CHECK' | 'MOBILE'>('TRANSFER');
  const [newStatus, setNewStatus] = useState<'PENDING' | 'ACCEPTE'>('PENDING');
  const [newReference, setNewReference] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newPaidAt, setNewPaidAt] = useState('');
  const [activateSubscription, setActivateSubscription] = useState(false);
  const [creating, setCreating] = useState(false);

  // Filtered users based on search (email or phone)
  const filteredUsers = usersWithoutPromoCode.filter((user) => {
    if (!userSearchTerm) return true;
    const search = userSearchTerm.toLowerCase();
    return (
      user.email?.toLowerCase().includes(search) ||
      user.fullName?.toLowerCase().includes(search) ||
      user.phone?.toLowerCase().includes(search)
    );
  });

  // Edit Payment Dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<DirectPayment | null>(null);
  const [editPlanName, setEditPlanName] = useState<'NORMAL' | 'VIP'>('NORMAL');
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editPaymentMethod, setEditPaymentMethod] = useState<'TRANSFER' | 'CASH' | 'CHECK' | 'MOBILE'>('TRANSFER');
  const [editStatus, setEditStatus] = useState<'PENDING' | 'ACCEPTE' | 'REFUSE'>('PENDING');
  const [editReference, setEditReference] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editPaidAt, setEditPaidAt] = useState('');
  const [editActivateSubscription, setEditActivateSubscription] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const data = await adminService.getDirectPayments();
      console.log('📦 Direct Payments:', data);
      setPayments(data || []);
    } catch (error) {
      console.error('❌ Error loading direct payments:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les paiements directs',
        variant: 'destructive',
      });
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUsersWithoutPromoCode = async () => {
    try {
      const data = await adminService.getUsersWithoutPromoCode();
      console.log('👥 Users without promo code:', data);
      setUsersWithoutPromoCode(data || []);
    } catch (error) {
      console.error('❌ Error loading users:', error);
    }
  };

  const loadStats = async () => {
    try {
      const data = await adminService.getDirectPaymentStats();
      console.log('📊 Direct Payment Stats:', data);
      setStats(data);
    } catch (error) {
      console.error('❌ Error loading stats:', error);
    }
  };

  useEffect(() => {
    loadPayments();
    loadUsersWithoutPromoCode();
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreatePayment = async () => {
    if (!selectedUserId) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner un utilisateur',
        variant: 'destructive',
      });
      return;
    }

    if (newAmount <= 0) {
      toast({
        title: 'Erreur',
        description: 'Le montant doit être supérieur à 0',
        variant: 'destructive',
      });
      return;
    }

    try {
      setCreating(true);
      await adminService.createDirectPayment({
        userId: parseInt(selectedUserId),
        planName: newPlanName,
        amount: newAmount,
        paymentMethod: newPaymentMethod,
        status: newStatus,
        transactionReference: newReference || undefined,
        adminNotes: newNotes || undefined,
        paidAt: newPaidAt ? new Date(newPaidAt).toISOString() : undefined,
        activateSubscription: activateSubscription,
      });

      toast({
        title: 'Succès',
        description: 'Paiement créé avec succès',
      });

      setCreateDialogOpen(false);
      resetCreateForm();
      loadPayments();
      loadStats();
    } catch (error: any) {
      console.error('❌ Error creating payment:', error);
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Erreur lors de la création du paiement',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const resetCreateForm = () => {
    setSelectedUserId('');
    setNewPlanName('NORMAL');
    setNewAmount(0);
    setNewPaymentMethod('TRANSFER');
    setNewStatus('PENDING');
    setNewReference('');
    setNewNotes('');
    setNewPaidAt('');
    setActivateSubscription(false);
  };

  const handleEditClick = (payment: DirectPayment) => {
    setEditingPayment(payment);
    setEditPlanName(payment.planName as 'NORMAL' | 'VIP');
    setEditAmount(payment.amount);
    setEditPaymentMethod(payment.paymentMethod);
    setEditStatus(payment.status);
    setEditReference(payment.transactionReference || '');
    setEditNotes(payment.adminNotes || '');
    if (payment.paidAt) {
      const date = new Date(payment.paidAt);
      setEditPaidAt(date.toISOString().slice(0, 16));
    } else {
      setEditPaidAt('');
    }
    setEditActivateSubscription(false);
    setEditDialogOpen(true);
  };

  const handleSavePayment = async () => {
    if (!editingPayment) return;

    try {
      setSaving(true);
      await adminService.updateDirectPayment(editingPayment.id, {
        planName: editPlanName,
        amount: editAmount,
        paymentMethod: editPaymentMethod,
        status: editStatus,
        transactionReference: editReference || undefined,
        adminNotes: editNotes || undefined,
        paidAt: editPaidAt ? new Date(editPaidAt).toISOString() : undefined,
        activateSubscription: editActivateSubscription,
      });

      toast({
        title: 'Succès',
        description: 'Paiement mis à jour avec succès',
      });

      setEditDialogOpen(false);
      setEditingPayment(null);
      loadPayments();
      loadStats();
    } catch (error: any) {
      console.error('❌ Error updating payment:', error);
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Erreur lors de la mise à jour',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (paymentId: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce paiement ?')) return;

    try {
      await adminService.deleteDirectPayment(paymentId);
      toast({
        title: 'Succès',
        description: 'Paiement supprimé avec succès',
      });
      loadPayments();
      loadStats();
    } catch (error) {
      console.error('❌ Error deleting payment:', error);
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la suppression',
        variant: 'destructive',
      });
    }
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.userEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const config = {
      PENDING: { icon: Clock, color: 'bg-yellow-500', label: 'En Attente' },
      ACCEPTE: { icon: CheckCircle, color: 'bg-green-500', label: 'Accepté' },
      REFUSE: { icon: XCircle, color: 'bg-red-500', label: 'Refusé' },
    };
    const { icon: Icon, color, label } = config[status as keyof typeof config] || config.PENDING;
    return (
      <Badge className={`${color} text-white`}>
        <Icon className="mr-1 h-3 w-3" />
        {label}
      </Badge>
    );
  };

  const getMethodBadge = (method: string) => {
    const config: Record<string, { color: string; label: string }> = {
      TRANSFER: { color: 'bg-blue-500', label: 'Virement' },
      CASH: { color: 'bg-green-500', label: 'Espèces' },
      CHECK: { color: 'bg-purple-500', label: 'Chèque' },
      MOBILE: { color: 'bg-orange-500', label: 'Mobile' },
    };
    const { color, label } = config[method] || { color: 'bg-gray-500', label: method };
    return <Badge className={`${color} text-white`}>{label}</Badge>;
  };

  const getPlanBadge = (plan: string) => {
    if (plan === 'VIP') {
      return <Badge className="bg-purple-600 text-white">VIP</Badge>;
    }
    return <Badge className="bg-blue-600 text-white">NORMAL</Badge>;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MAD',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Paiements Directs (Admin)</h1>
          <p className="text-muted-foreground">
            Gérer les paiements pour tous les utilisateurs (avec ou sans code promo)
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouveau Paiement
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Utilisateurs directs</p>
                <p className="text-2xl font-bold">{stats.usersWithoutPromoCode}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold">{stats.pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Acceptés</p>
                <p className="text-2xl font-bold">{stats.acceptedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Revenus totaux</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="PENDING">En Attente</SelectItem>
                <SelectItem value="ACCEPTE">Accepté</SelectItem>
                <SelectItem value="REFUSED">Refusé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="p-12 text-center">
              <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">Aucun paiement trouvé</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all'
                  ? 'Aucun paiement ne correspond à vos critères'
                  : 'Commencez par créer un paiement pour un utilisateur'}
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Créer un paiement
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[700px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Méthode</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date de paiement</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{payment.userName}</p>
                            <p className="text-sm text-muted-foreground">{payment.userEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell>{getPlanBadge(payment.planName)}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(payment.amount)}</TableCell>
                        <TableCell>{getMethodBadge(payment.paymentMethod)}</TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                        <TableCell>{formatDate(payment.paidAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditClick(payment)}
                              title="Modifier"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(payment.id)}
                              className="text-red-500 hover:text-red-700"
                              title="Supprimer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Payment Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouveau Paiement Admin</DialogTitle>
            <DialogDescription>
              Créer un paiement pour n'importe quel utilisateur (y compris ceux avec code promo commercial)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Utilisateur *</Label>
              {/* Search Input for Users */}
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par email ou téléphone..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un utilisateur" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {filteredUsers.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      Aucun utilisateur trouvé
                    </div>
                  ) : (
                    filteredUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{user.fullName}</span>
                            {user.hasPromoCode && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 border border-orange-200">
                                Code promo: {user.promoCodeUsed}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {user.email} {user.phone && `• ${user.phone}`}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {filteredUsers.length} utilisateur(s) trouvé(s)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Plan *</Label>
                <Select value={newPlanName} onValueChange={(v) => setNewPlanName(v as 'NORMAL' | 'VIP')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NORMAL">NORMAL</SelectItem>
                    <SelectItem value="VIP">VIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Montant (MAD) *</Label>
                <Input
                  type="number"
                  value={newAmount}
                  onChange={(e) => setNewAmount(parseFloat(e.target.value) || 0)}
                  min={0}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Méthode de paiement *</Label>
                <Select value={newPaymentMethod} onValueChange={(v) => setNewPaymentMethod(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TRANSFER">Virement</SelectItem>
                    <SelectItem value="CASH">Espèces</SelectItem>
                    <SelectItem value="CHECK">Chèque</SelectItem>
                    <SelectItem value="MOBILE">Mobile</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Statut</Label>
                <Select value={newStatus} onValueChange={(v) => setNewStatus(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">En Attente</SelectItem>
                    <SelectItem value="ACCEPTE">Accepté</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Référence de transaction</Label>
              <Input
                value={newReference}
                onChange={(e) => setNewReference(e.target.value)}
                placeholder="Numéro de virement, reçu, etc."
              />
            </div>

            <div className="space-y-2">
              <Label>Date de paiement</Label>
              <Input
                type="datetime-local"
                value={newPaidAt}
                onChange={(e) => setNewPaidAt(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Notes administrateur</Label>
              <Textarea
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Notes internes..."
                rows={3}
              />
            </div>

            {newStatus === 'ACCEPTE' && (
              <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg border border-green-200">
                <Checkbox
                  id="activateSubscription"
                  checked={activateSubscription}
                  onCheckedChange={(checked) => setActivateSubscription(!!checked)}
                />
                <Label htmlFor="activateSubscription" className="text-green-700 cursor-pointer">
                  Activer immédiatement l'abonnement de l'utilisateur
                </Label>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreatePayment} disabled={creating}>
              {creating ? 'Création...' : 'Créer le paiement'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Payment Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Modifier le Paiement</DialogTitle>
            <DialogDescription>
              {editingPayment?.userName} - {editingPayment?.userEmail}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Plan</Label>
                <Select value={editPlanName} onValueChange={(v) => setEditPlanName(v as 'NORMAL' | 'VIP')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NORMAL">NORMAL</SelectItem>
                    <SelectItem value="VIP">VIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Montant (MAD)</Label>
                <Input
                  type="number"
                  value={editAmount}
                  onChange={(e) => setEditAmount(parseFloat(e.target.value) || 0)}
                  min={0}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Méthode de paiement</Label>
                <Select value={editPaymentMethod} onValueChange={(v) => setEditPaymentMethod(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TRANSFER">Virement</SelectItem>
                    <SelectItem value="CASH">Espèces</SelectItem>
                    <SelectItem value="CHECK">Chèque</SelectItem>
                    <SelectItem value="MOBILE">Mobile</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Statut</Label>
                <Select value={editStatus} onValueChange={(v) => setEditStatus(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">En Attente</SelectItem>
                    <SelectItem value="ACCEPTE">Accepté</SelectItem>
                    <SelectItem value="REFUSE">Refusé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Référence de transaction</Label>
              <Input
                value={editReference}
                onChange={(e) => setEditReference(e.target.value)}
                placeholder="Numéro de virement, reçu, etc."
              />
            </div>

            <div className="space-y-2">
              <Label>Date de paiement</Label>
              <Input
                type="datetime-local"
                value={editPaidAt}
                onChange={(e) => setEditPaidAt(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Notes administrateur</Label>
              <Textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Notes internes..."
                rows={3}
              />
            </div>

            {editStatus === 'ACCEPTE' && editingPayment?.status !== 'ACCEPTE' && (
              <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg border border-green-200">
                <Checkbox
                  id="editActivateSubscription"
                  checked={editActivateSubscription}
                  onCheckedChange={(checked) => setEditActivateSubscription(!!checked)}
                />
                <Label htmlFor="editActivateSubscription" className="text-green-700 cursor-pointer">
                  Activer l'abonnement de l'utilisateur
                </Label>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
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
