import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DollarSign, CheckCircle, Clock, Users as UsersIcon, Trash2, Eye, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getPayments, getPaymentStatistics, markPaymentAsPending, getPromoUsers, createPayment, deletePayment, getUsersProgression } from '@/services/commercialService';
import { uploadToCloudinary } from '@/services/cloudinaryService';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface Payment {
  id?: number;
  paymentId: number;
  userName: string;
  userEmail: string;
  planName: string;
  amount: number;
  status: 'PENDING' | 'VALIDATED' | 'REJECTED' | 'CANCELLED';
  paymentMethod: 'BANK_TRANSFER' | 'CASH' | 'CHECK' | 'MOBILE';
  reference: string;
  paidAt: string | null;
  createdByAdmin?: boolean; // true si le paiement a été créé par l'admin
}

interface PaymentStats {
  totalUsersCreated: number;
  confirmedUsers: number;
  pendingUsers: number;
  normalUsers: number;
  vipUsers: number;
  freeUsers: number;
  promoCode: string;
  promoCodeUsageCount: number;
  promoCodeConversions: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

interface PromoUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  promoCodeUsed: string;
  createdAt: string;
  planName: string;
}

interface CourseProgressInfo {
  courseId: number;
  courseName: string;
  courseLevel: string;
  completedLessons: number;
  totalLessons: number;
  progressPercentage: number;
}

interface UserProgressionSummary {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  planName: string;
  status: string;
  overallProgress: number;
  completedLessons: number;
  totalLessons: number;
  totalXp: number;
  enrolledCoursesCount: number;
  courses: CourseProgressInfo[];
}

interface CreatePaymentForm {
  planName: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  status: string;
}

const CommercialDashboard = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [promoUsers, setPromoUsers] = useState<PromoUser[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CreatePaymentForm>({
    planName: 'NORMAL',
    amount: 350,
    paymentMethod: 'VIREMENT',
    paymentDate: new Date().toISOString().slice(0, 16),
    status: 'EN_ATTENTE'
  });
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progressions, setProgressions] = useState<UserProgressionSummary[]>([]);
  const [progressionModalOpen, setProgressionModalOpen] = useState(false);
  const [selectedProgressionUser, setSelectedProgressionUser] = useState<UserProgressionSummary | null>(null);
  const [stats, setStats] = useState<PaymentStats>({
    totalUsersCreated: 0,
    confirmedUsers: 0,
    pendingUsers: 0,
    normalUsers: 0,
    vipUsers: 0,
    freeUsers: 0,
    promoCode: '',
    promoCodeUsageCount: 0,
    promoCodeConversions: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
  });

  useEffect(() => {
    // Vérifier le token JWT
    const token = localStorage.getItem('jwt_token');
    console.log('🔑 Token JWT présent:', token ? 'OUI' : 'NON');
    console.log('🔑 Token (premiers 50 chars):', token?.substring(0, 50));

    loadPayments();
    loadStatistics();
    loadPromoUsers();
    loadProgressions();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const data = await getPayments();
      console.log('📦 Payments reçus du backend:', data);
      console.log('📊 Nombre de paiements:', Array.isArray(data) ? data.length : 'pas un array');
      setPayments(data || []);
    } catch (error) {
      console.error('❌ Erreur chargement paiements:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de charger les paiements',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const data = await getPaymentStatistics();
      console.log('📈 Stats reçues du backend:', data);
      setStats(data || {
        totalUsersCreated: 0,
        confirmedUsers: 0,
        pendingUsers: 0,
        normalUsers: 0,
        vipUsers: 0,
        freeUsers: 0,
        promoCode: '',
        promoCodeUsageCount: 0,
        promoCodeConversions: 0,
        totalRevenue: 0,
        monthlyRevenue: 0,
      });
    } catch (error) {
      console.error('❌ Erreur chargement stats:', error);
    }
  };

  const loadProgressions = async () => {
    try {
      const data = await getUsersProgression();
      setProgressions(data || []);
    } catch (error) {
      console.error('❌ Erreur chargement progression:', error);
    }
  };

  const openProgressionModal = (user: UserProgressionSummary) => {
    setSelectedProgressionUser(user);
    setProgressionModalOpen(true);
  };

  const loadPromoUsers = async () => {
    try {
      const data = await getPromoUsers();
      console.log('👥 Utilisateurs avec code promo reçus:', data);
      console.log('👥 Nombre d\'utilisateurs:', Array.isArray(data) ? data.length : 'pas un array');
      setPromoUsers(data || []);
    } catch (error) {
      console.error('❌ Erreur chargement utilisateurs promo:', error);
    }
  };

  const validateForm = (form: CreatePaymentForm): boolean => {
    if (!form.planName || !["NORMAL", "VIP"].includes(form.planName)) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Plan invalide'
      });
      return false;
    }

    if (!form.amount || form.amount <= 0) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Le montant doit être supérieur à 0'
      });
      return false;
    }

    if (!form.paymentMethod) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Méthode de paiement requise'
      });
      return false;
    }

    if (!form.paymentDate) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Date de paiement requise'
      });
      return false;
    }

    if (!form.status || !["EN_ATTENTE", "VALIDE", "REJETE"].includes(form.status)) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Statut invalide'
      });
      return false;
    }

    return true;
  };

  const handleCreatePayment = async () => {
    if (!selectedUserId) return;

    if (!validateForm(formData)) {
      return;
    }

    try {
      setUploading(true);

      // Upload image to Cloudinary if provided
      let receiptUrl: string | undefined;
      if (receiptFile) {
        try {
          const cloudinaryResponse = await uploadToCloudinary(receiptFile);
          receiptUrl = cloudinaryResponse.secure_url;
          console.log('✅ Image uploadée:', receiptUrl);
        } catch (uploadError) {
          console.error('❌ Erreur upload image:', uploadError);
          toast({
            variant: 'destructive',
            title: 'Erreur',
            description: "Échec de l'upload de l'image. Veuillez réessayer."
          });
          setUploading(false);
          return;
        }
      }

      const paymentData = {
        planName: formData.planName,
        amount: Number(formData.amount),
        paymentMethod: formData.paymentMethod,
        paymentDate: formData.paymentDate + ':00',
        status: formData.status,
        receiptUrl: receiptUrl
      };

      await createPayment(selectedUserId, paymentData);
      toast({
        title: 'Succès',
        description: "Paiement créé avec succès!"
      });
      setIsCreateModalOpen(false);
      setFormData({
        planName: 'NORMAL',
        amount: 350,
        paymentMethod: 'VIREMENT',
        paymentDate: new Date().toISOString().slice(0, 16),
        status: 'EN_ATTENTE'
      });
      setReceiptFile(null);
      setReceiptPreview(null);
      await loadPayments();
      await loadStatistics();
    } catch (error: any) {
      console.error('❌ Erreur création paiement:', error);
      if (error.response?.status === 400) {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: error.response?.data?.message || "Données invalides"
        });
      } else if (error.response?.status === 403) {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: "Vous n'avez pas accès à cet utilisateur"
        });
      } else if (error.response?.status === 404) {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: "Utilisateur ou plan non trouvé"
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: "Erreur lors de la création du paiement"
        });
      }
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const openCreateModal = (userId: number) => {
    setSelectedUserId(userId);
    setFormData({
      planName: 'NORMAL',
      amount: 350,
      paymentMethod: 'VIREMENT',
      paymentDate: new Date().toISOString().slice(0, 16),
      status: 'EN_ATTENTE'
    });
    setReceiptFile(null);
    setReceiptPreview(null);
    setIsCreateModalOpen(true);
  };

  const handleMarkPending = async (paymentId: number) => {
    try {
      setLoading(true);
      await markPaymentAsPending(paymentId);

      toast({
        title: '✅ Paiement marqué en attente',
        description: 'Le paiement a été marqué en attente avec succès',
      });

      // Recharger les données
      await loadPayments();
      await loadStatistics();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de modifier le paiement',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePayment = async (paymentId: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce paiement ?')) return;

    try {
      setLoading(true);
      await deletePayment(paymentId);
      toast({
        title: 'Succès',
        description: 'Paiement supprimé avec succès'
      });
      await loadPayments();
      await loadStatistics();
    } catch (error: any) {
      if (error.response?.status === 403) {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'Vous ne pouvez supprimer que vos propres paiements'
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'Erreur lors de la suppression'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'PENDING': 'En Attente',
      'VALIDATED': 'Accepté',
      'ACCEPTE': 'Accepté',     // Standard - same as VALIDATED
      'REJECTED': 'Refusé',
      'REFUSE': 'Refusé',       // Standard - same as REJECTED
      'CANCELLED': 'Annulé',
    };
    return labels[status] || status;
  };

  const getStatusVariant = (status: string) => {
    const variants: Record<string, string> = {
      'PENDING': 'bg-warning text-white',
      'VALIDATED': 'bg-success text-white',
      'ACCEPTE': 'bg-success text-white',   // Standard - same as VALIDATED
      'REJECTED': 'bg-destructive text-white',
      'REFUSE': 'bg-destructive text-white', // Standard - same as REJECTED
      'CANCELLED': 'bg-muted text-muted-foreground',
    };
    return variants[status] || 'bg-muted';
  };

  const getMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      'BANK_TRANSFER': 'Virement',
      'CASH': 'Espèces',
      'CHECK': 'Chèque',
      'MOBILE': 'Mobile',
    };
    return labels[method] || method;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Tableau de Bord Commercial</h1>
        <p className="text-muted-foreground">Gérez les paiements de vos utilisateurs</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Utilisateurs</p>
                <p className="text-3xl font-bold text-primary">{stats.totalUsersCreated || 0}</p>
              </div>
              <UsersIcon className="h-10 w-10 text-primary/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenus Totaux</p>
                <p className="text-3xl font-bold text-success">DH {stats.totalRevenue || 0}</p>
              </div>
              <DollarSign className="h-10 w-10 text-success/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Utilisateurs Confirmés</p>
                <p className="text-3xl font-bold text-warning">{stats.confirmedUsers || 0}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-warning/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En Attente</p>
                <p className="text-3xl font-bold text-secondary">{stats.pendingUsers || 0}</p>
              </div>
              <Clock className="h-10 w-10 text-secondary/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des Paiements</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Actions</TableHead>
                  <TableHead>Date Paiement</TableHead>
                  <TableHead>Référence</TableHead>
                  <TableHead>Méthode Paiement</TableHead>
                  <TableHead>Statut Paiement</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Utilisateur</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <Clock className="w-5 h-5 animate-spin" />
                        <span>Chargement...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="space-y-2">
                        <p className="text-muted-foreground">Aucun paiement trouvé</p>
                        <p className="text-xs text-muted-foreground">
                          Vérifiez la console du navigateur (F12) pour plus de détails
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            loadPayments();
                            loadStatistics();
                          }}
                        >
                          Recharger
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((payment) => (
                    <TableRow key={payment.id || payment.paymentId}>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkPending(payment.id || payment.paymentId)}
                            disabled={loading || payment.status === 'PENDING'}
                          >
                            Marquer en attente
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePayment(payment.id || payment.paymentId)}
                            disabled={loading}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {payment.paidAt
                          ? new Date(payment.paidAt).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                          : '-'}
                      </TableCell>
                      <TableCell className="font-mono text-sm">{payment.reference}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{getMethodLabel(payment.paymentMethod)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusVariant(payment.status)}>
                          {getStatusLabel(payment.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">DH {payment.amount}</TableCell>
                      <TableCell>
                        <Badge>{payment.planName}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{payment.userEmail}</TableCell>
                      <TableCell className="font-medium">
                        {payment.userName}
                        {payment.createdByAdmin && (
                          <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-700 border-blue-300">
                            Créé par Admin
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Utilisateurs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Utilisateurs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom complet</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Plan actuel</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date d'inscription</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promoUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Aucun utilisateur trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  promoUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.firstName} {user.lastName}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.planName === 'VIP' ? 'default' : 'secondary'}>
                          {user.planName}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.status === 'EN_ATTENTE'
                              ? 'outline'
                              : user.status === 'VALIDE'
                                ? 'default'
                                : 'destructive'
                          }
                        >
                          {user.status === 'EN_ATTENTE'
                            ? 'En attente'
                            : user.status === 'VALIDE'
                              ? 'Validé'
                              : 'Rejeté'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => openCreateModal(user.id)}
                        >
                          Créer Paiement
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

      {/* User Progression Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <CardTitle>Progression des Utilisateurs</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom complet</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Progression</TableHead>
                  <TableHead>Leçons</TableHead>
                  <TableHead>XP</TableHead>
                  <TableHead className="text-right">Détails</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {progressions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Aucune donnée de progression disponible
                    </TableCell>
                  </TableRow>
                ) : (
                  progressions.map((user) => (
                    <TableRow key={user.userId}>
                      <TableCell className="font-medium">
                        {user.firstName} {user.lastName}
                      </TableCell>
                      <TableCell className="text-sm">{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.planName === 'VIP' ? 'default' : 'secondary'}>
                          {user.planName}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${user.overallProgress}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">{user.overallProgress}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {user.completedLessons}/{user.totalLessons}
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {user.totalXp} XP
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openProgressionModal(user)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Voir
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

      {/* Progression Detail Modal */}
      <Dialog open={progressionModalOpen} onOpenChange={setProgressionModalOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Progression de {selectedProgressionUser?.firstName} {selectedProgressionUser?.lastName}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-primary">{selectedProgressionUser?.overallProgress}%</p>
                <p className="text-xs text-muted-foreground">Progression</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold">{selectedProgressionUser?.completedLessons}/{selectedProgressionUser?.totalLessons}</p>
                <p className="text-xs text-muted-foreground">Leçons</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-warning">{selectedProgressionUser?.totalXp}</p>
                <p className="text-xs text-muted-foreground">XP Total</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Cours inscrits ({selectedProgressionUser?.enrolledCoursesCount || 0})</h3>
              {selectedProgressionUser?.courses && selectedProgressionUser.courses.length > 0 ? (
                selectedProgressionUser.courses.map((course) => (
                  <div key={course.courseId} className="border rounded-lg p-3 mb-2">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-sm">{course.courseName}</span>
                      <span className="text-sm text-muted-foreground">{course.progressPercentage}%</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${course.progressPercentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {course.completedLessons}/{course.totalLessons} leçons
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Aucun cours inscrit</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Payment Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Créer un Paiement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Plan <span className="text-red-500">*</span></label>
              <select
                className="w-full px-3 py-2 border rounded-md"
                value={formData.planName}
                onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
                required
              >
                <option value="NORMAL">Normal</option>
                <option value="VIP">VIP</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Montant <span className="text-red-500">*</span></label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="350"
                className="w-full px-3 py-2 border rounded-md"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                required
              />
              <span className="text-xs text-muted-foreground">DH</span>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Méthode de paiement <span className="text-red-500">*</span></label>
              <select
                className="w-full px-3 py-2 border rounded-md"
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                required
              >
                <option value="VIREMENT">Virement</option>
                <option value="ESPECES">Espèces</option>
                <option value="CARTE">Carte bancaire</option>
                <option value="CHEQUE">Chèque</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date de paiement <span className="text-red-500">*</span></label>
              <input
                type="datetime-local"
                className="w-full px-3 py-2 border rounded-md"
                value={formData.paymentDate}
                onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Statut <span className="text-red-500">*</span></label>
              <select
                className="w-full px-3 py-2 border rounded-md"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                required
              >
                <option value="EN_ATTENTE">En attente</option>
                <option value="VALIDE">Validé</option>
                <option value="REJETE">Rejeté</option>
              </select>
              <p className="text-xs text-muted-foreground">Statut par défaut : "EN_ATTENTE"</p>
            </div>

            {/* Photo de preuve de paiement */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Photo de preuve (optionnel)</label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center">
                {receiptPreview ? (
                  <div className="space-y-2">
                    <img
                      src={receiptPreview}
                      alt="Prévisualisation"
                      className="max-h-32 mx-auto rounded-md object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setReceiptFile(null);
                        setReceiptPreview(null);
                      }}
                      className="text-sm text-red-500 hover:text-red-700"
                    >
                      Supprimer
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Cliquez pour ajouter une photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Photo du reçu de virement, screenshot, etc.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} disabled={uploading}>
              Annuler
            </Button>
            <Button onClick={handleCreatePayment} disabled={uploading}>
              {uploading ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Upload en cours...
                </>
              ) : (
                'Créer le paiement'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CommercialDashboard;
