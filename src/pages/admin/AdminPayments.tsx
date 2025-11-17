import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
import { Search, CheckCircle, XCircle, Clock, DollarSign, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { adminService } from '@/services/adminService';

interface Payment {
  id: number;
  userName: string;
  userEmail: string;
  amount: number;
  paymentMethod: 'VIREMENT' | 'ESPECES' | 'CHEQUE' | 'MOBILE';
  status: 'PENDING' | 'VALIDATED' | 'REJECTED';
  plan: 'NORMAL' | 'VIP';
  reference: string;
  createdAt: string;
  validatedAt?: string;
  commercialName?: string;
}

interface EditingCell {
  paymentId: number;
  field: 'status' | 'paymentMethod' | 'amount';
  value: string | number;
}

export default function AdminPayments() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [savingPaymentId, setSavingPaymentId] = useState<number | null>(null);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      console.log('💰 Chargement des paiements...');
      const data = await adminService.getAllPayments();
      console.log('✅ Paiements reçus:', data);
      setPayments(data || []);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des paiements:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les paiements',
        variant: 'destructive',
      });
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePayment = async (paymentId: number, field: 'status' | 'paymentMethod' | 'amount', value: string | number) => {
    try {
      setSavingPaymentId(paymentId);
      
      const updateData: {
        status?: string;
        paymentMethod?: string;
        amount?: number;
      } = {};
      
      if (field === 'status') updateData.status = value as string;
      if (field === 'paymentMethod') updateData.paymentMethod = value as string;
      if (field === 'amount') updateData.amount = Number(value);

      console.log(`💾 Mise à jour du paiement ${paymentId}:`, updateData);
      await adminService.updatePayment(paymentId, updateData);
      
      // Update local state
      setPayments(prev => prev.map(p => 
        p.id === paymentId 
          ? { ...p, [field]: value }
          : p
      ));
      
      toast({
        title: 'Succès',
        description: 'Paiement mis à jour avec succès',
      });
      
      setEditingCell(null);
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le paiement',
        variant: 'destructive',
      });
    } finally {
      setSavingPaymentId(null);
    }
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: payments.length,
    enAttente: payments.filter((p) => p.status === 'PENDING').length,
    valide: payments.filter((p) => p.status === 'VALIDATED').length,
    rejete: payments.filter((p) => p.status === 'REJECTED').length,
    montantTotal: payments
      .filter((p) => p.status === 'VALIDATED')
      .reduce((sum, p) => sum + p.amount, 0),
  };

  const methodeBadgeColors = {
    VIREMENT: 'bg-blue-500 text-white',
    ESPECES: 'bg-green-500 text-white',
    CHEQUE: 'bg-purple-500 text-white',
    MOBILE: 'bg-orange-500 text-white',
  };

  const statusColors = {
    PENDING: 'bg-warning text-white',
    VALIDATED: 'bg-success text-white',
    REJECTED: 'bg-destructive text-white',
  };

  const statusLabels = {
    PENDING: 'EN_ATTENTE',
    VALIDATED: 'VALIDE',
    REJECTED: 'REJETE',
  };

  const paymentMethodLabels = {
    VIREMENT: 'VIREMENT',
    MOBILE: 'MOBILE',
    CHEQUE: 'CHEQUE',
    ESPECES: 'ESPECES',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Gestion des Paiements</h1>
        <p className="text-muted-foreground mt-1">Valider et suivre les paiements manuels</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-primary">{stats.total}</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En Attente</p>
                <p className="text-2xl font-bold text-warning">{stats.enAttente}</p>
              </div>
              <Clock className="h-8 w-8 text-warning/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Validés</p>
                <p className="text-2xl font-bold text-success">{stats.valide}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rejetés</p>
                <p className="text-2xl font-bold text-destructive">{stats.rejete}</p>
              </div>
              <XCircle className="h-8 w-8 text-destructive/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Montant Total</p>
                <p className="text-xl font-bold text-secondary">DH {stats.montantTotal}</p>
              </div>
              <DollarSign className="h-8 w-8 text-secondary/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Rechercher par nom, email ou référence..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="PENDING">En attente</SelectItem>
                <SelectItem value="VALIDATED">Validé</SelectItem>
                <SelectItem value="REJECTED">Rejeté</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucun paiement trouvé</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Actions</TableHead>
                    <TableHead>Commercial</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Méthode</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Référence</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      {/* Actions */}
                      <TableCell>
                        {savingPaymentId === payment.id && (
                          <Save className="w-4 h-4 animate-spin text-primary" />
                        )}
                      </TableCell>

                      {/* Commercial */}
                      <TableCell className="text-sm">
                        {payment.commercialName || '-'}
                      </TableCell>

                      {/* Date */}
                      <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                        {new Date(payment.createdAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </TableCell>

                      {/* Status - Editable */}
                      <TableCell onClick={() => setEditingCell({ paymentId: payment.id, field: 'status', value: payment.status })}>
                        {editingCell?.paymentId === payment.id && editingCell?.field === 'status' ? (
                          <Select
                            value={editingCell.value as string}
                            onValueChange={(value) => handleUpdatePayment(payment.id, 'status', value)}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PENDING">EN_ATTENTE</SelectItem>
                              <SelectItem value="VALIDATED">VALIDE</SelectItem>
                              <SelectItem value="REJECTED">REJETE</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge className={`${statusColors[payment.status]} cursor-pointer hover:opacity-80`}>
                            {statusLabels[payment.status]}
                          </Badge>
                        )}
                      </TableCell>

                      {/* Payment Method - Editable */}
                      <TableCell onClick={() => setEditingCell({ paymentId: payment.id, field: 'paymentMethod', value: payment.paymentMethod })}>
                        {editingCell?.paymentId === payment.id && editingCell?.field === 'paymentMethod' ? (
                          <Select
                            value={editingCell.value as string}
                            onValueChange={(value) => handleUpdatePayment(payment.id, 'paymentMethod', value)}
                          >
                            <SelectTrigger className="w-[130px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="VIREMENT">VIREMENT</SelectItem>
                              <SelectItem value="MOBILE">MOBILE</SelectItem>
                              <SelectItem value="CHEQUE">CHEQUE</SelectItem>
                              <SelectItem value="ESPECES">ESPECES</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge className={`${methodeBadgeColors[payment.paymentMethod]} cursor-pointer hover:opacity-80`}>
                            {paymentMethodLabels[payment.paymentMethod]}
                          </Badge>
                        )}
                      </TableCell>

                      {/* Amount - Editable */}
                      <TableCell onClick={() => setEditingCell({ paymentId: payment.id, field: 'amount', value: payment.amount })}>
                        {editingCell?.paymentId === payment.id && editingCell?.field === 'amount' ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={editingCell.value}
                              onChange={(e) => setEditingCell({ ...editingCell, value: Number(e.target.value) })}
                              onBlur={() => handleUpdatePayment(payment.id, 'amount', editingCell.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleUpdatePayment(payment.id, 'amount', editingCell.value);
                                }
                                if (e.key === 'Escape') {
                                  setEditingCell(null);
                                }
                              }}
                              autoFocus
                              className="w-24"
                            />
                            <span className="text-sm">DH</span>
                          </div>
                        ) : (
                          <span className="font-bold cursor-pointer hover:text-primary">
                            {payment.amount} DH
                          </span>
                        )}
                      </TableCell>

                      {/* Plan */}
                      <TableCell>
                        <Badge
                          className={
                            payment.plan === 'VIP'
                              ? 'bg-secondary text-secondary-foreground'
                              : 'bg-primary text-primary-foreground'
                          }
                        >
                          {payment.plan}
                        </Badge>
                      </TableCell>

                      {/* User */}
                      <TableCell>
                        <div>
                          <p className="font-medium">{payment.userName}</p>
                          <p className="text-sm text-muted-foreground">{payment.userEmail}</p>
                        </div>
                      </TableCell>

                      {/* Reference */}
                      <TableCell>
                        <span className="font-mono text-sm">{payment.reference}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
