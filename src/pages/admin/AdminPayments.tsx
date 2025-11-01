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
import { Search, CheckCircle, XCircle, Clock, DollarSign, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Payment {
  id: string;
  utilisateur: string;
  email: string;
  montant: number;
  methode: 'VIREMENT' | 'ESPECES' | 'CHEQUE' | 'MOBILE';
  statut: 'EN_ATTENTE' | 'VALIDE' | 'REJETE';
  plan: 'NORMAL' | 'VIP';
  reference: string;
  dateCreation: string;
  dateValidation?: string;
  commercial?: string;
}

export default function AdminPayments() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showValidationDialog, setShowValidationDialog] = useState(false);

  const [payments] = useState<Payment[]>([
    {
      id: '1',
      utilisateur: 'محمد الإدريسي',
      email: 'mohamed@example.com',
      montant: 750,
      methode: 'VIREMENT',
      statut: 'EN_ATTENTE',
      plan: 'NORMAL',
      reference: 'VIR-2024-001',
      dateCreation: '2024-11-01T10:30:00',
      commercial: 'أحمد السعيد',
    },
    {
      id: '2',
      utilisateur: 'فاطمة الزهراء',
      email: 'fatima@example.com',
      montant: 1000,
      methode: 'ESPECES',
      statut: 'VALIDE',
      plan: 'VIP',
      reference: 'ESP-2024-002',
      dateCreation: '2024-10-28T14:20:00',
      dateValidation: '2024-10-28T15:00:00',
      commercial: 'خالد المنصوري',
    },
    {
      id: '3',
      utilisateur: 'يوسف الحسني',
      email: 'youssef@example.com',
      montant: 750,
      methode: 'MOBILE',
      statut: 'EN_ATTENTE',
      plan: 'NORMAL',
      reference: 'MOB-2024-003',
      dateCreation: '2024-11-01T09:15:00',
    },
    {
      id: '4',
      utilisateur: 'سارة المنصوري',
      email: 'sara@example.com',
      montant: 1000,
      methode: 'CHEQUE',
      statut: 'REJETE',
      plan: 'VIP',
      reference: 'CHQ-2024-004',
      dateCreation: '2024-10-25T11:45:00',
      dateValidation: '2024-10-26T10:00:00',
    },
  ]);

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.utilisateur.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.statut === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: payments.length,
    enAttente: payments.filter((p) => p.statut === 'EN_ATTENTE').length,
    valide: payments.filter((p) => p.statut === 'VALIDE').length,
    rejete: payments.filter((p) => p.statut === 'REJETE').length,
    montantTotal: payments
      .filter((p) => p.statut === 'VALIDE')
      .reduce((sum, p) => sum + p.montant, 0),
  };

  const methodeBadgeColors = {
    VIREMENT: 'bg-blue-500 text-white',
    ESPECES: 'bg-green-500 text-white',
    CHEQUE: 'bg-purple-500 text-white',
    MOBILE: 'bg-orange-500 text-white',
  };

  const statutColors = {
    EN_ATTENTE: 'bg-warning text-white',
    VALIDE: 'bg-success text-white',
    REJETE: 'bg-destructive text-white',
  };

  const handleValidate = (payment: Payment, action: 'VALIDE' | 'REJETE') => {
    toast({
      title: action === 'VALIDE' ? 'Paiement Validé' : 'Paiement Rejeté',
      description: `Le paiement de ${payment.utilisateur} a été ${action === 'VALIDE' ? 'validé' : 'rejeté'}`,
    });
    setShowValidationDialog(false);
    setSelectedPayment(null);
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
                <p className="text-xl font-bold text-secondary">{stats.montantTotal} DH</p>
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
                <SelectItem value="EN_ATTENTE">En attente</SelectItem>
                <SelectItem value="VALIDE">Validé</SelectItem>
                <SelectItem value="REJETE">Rejeté</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Référence</TableHead>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Méthode</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Commercial</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <span className="font-mono text-sm">{payment.reference}</span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{payment.utilisateur}</p>
                        <p className="text-sm text-muted-foreground">{payment.email}</p>
                      </div>
                    </TableCell>
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
                    <TableCell>
                      <span className="font-bold">{payment.montant} DH</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={methodeBadgeColors[payment.methode]}>
                        {payment.methode}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statutColors[payment.statut]}>{payment.statut}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(payment.dateCreation).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </TableCell>
                    <TableCell className="text-sm">{payment.commercial || '-'}</TableCell>
                    <TableCell>
                      {payment.statut === 'EN_ATTENTE' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1"
                            onClick={() => {
                              setSelectedPayment(payment);
                              setShowValidationDialog(true);
                            }}
                          >
                            <AlertCircle className="w-3 h-3" />
                            Traiter
                          </Button>
                        </div>
                      )}
                      {payment.statut === 'VALIDE' && (
                        <Badge variant="outline" className="text-success">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Validé
                        </Badge>
                      )}
                      {payment.statut === 'REJETE' && (
                        <Badge variant="outline" className="text-destructive">
                          <XCircle className="w-3 h-3 mr-1" />
                          Rejeté
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Validation Dialog */}
      <Dialog open={showValidationDialog} onOpenChange={setShowValidationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Valider le Paiement</DialogTitle>
            <DialogDescription>
              Voulez-vous valider ou rejeter ce paiement ?
            </DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Utilisateur</p>
                  <p className="font-medium">{selectedPayment.utilisateur}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Montant</p>
                  <p className="font-bold">{selectedPayment.montant} DH</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Plan</p>
                  <Badge>{selectedPayment.plan}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Méthode</p>
                  <Badge>{selectedPayment.methode}</Badge>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowValidationDialog(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedPayment && handleValidate(selectedPayment, 'REJETE')}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Rejeter
            </Button>
            <Button
              className="bg-success hover:bg-success/90"
              onClick={() => selectedPayment && handleValidate(selectedPayment, 'VALIDE')}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Valider
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
