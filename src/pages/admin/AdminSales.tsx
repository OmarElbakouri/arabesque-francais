import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Plus, Trash2, Copy, Users, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { adminService } from '@/services/adminService';
import { useAuthStore } from '@/stores/authStore';

interface Commercial {
  commercialId: number;
  commercialName: string;
  commercialEmail: string;
  promoCode: string;
  commissionRate: number;
  monthlyRevenue: number;
  totalRevenue: number;
  monthlyClients: number;
  totalClients: number;
  promoCodeUsage: number;
  status: string;
}

interface CommercialUser {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  dateInscription: string;
  status: string;
  credits: number;
}

export default function AdminSales() {
  const { toast } = useToast();
  const user = useAuthStore((state) => state.user);
  const [commercials, setCommercials] = useState<Commercial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [commercialToDelete, setCommercialToDelete] = useState<Commercial | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [usersDialogOpen, setUsersDialogOpen] = useState(false);
  const [selectedCommercial, setSelectedCommercial] = useState<Commercial | null>(null);
  const [commercialUsers, setCommercialUsers] = useState<CommercialUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    commissionPercentage: 10,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadCommercialSales();
  }, []);

  const loadCommercialSales = async () => {
    try {
      setLoading(true);
      console.log('💼 Chargement des ventes commerciales...');
      const data = await adminService.getCommercialSales();
      console.log('✅ Données commerciales reçues:', data);
      
      // Log each commercial's totalClients for debugging
      if (data && Array.isArray(data)) {
        data.forEach((commercial: Commercial) => {
          console.log(`📊 ${commercial.commercialName} (${commercial.promoCode}):`, {
            totalClients: commercial.totalClients,
            monthlyClients: commercial.monthlyClients,
            promoCodeUsage: commercial.promoCodeUsage
          });
        });
      }
      
      setCommercials(data || []);
    } catch (error: any) {
      console.error('❌ Erreur lors du chargement des ventes commerciales:', error);
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Impossible de charger les données commerciales',
        variant: 'destructive',
      });
      setCommercials([]);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      errors.firstName = 'Le prénom est requis';
    }

    if (!formData.lastName.trim()) {
      errors.lastName = 'Le nom est requis';
    }

    if (!formData.email.trim()) {
      errors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "L'email n'est pas valide";
    }

    if (!formData.password) {
      errors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      errors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    if (formData.phone && !/^\+?[0-9]{10,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      errors.phone = "Le numéro de téléphone n'est pas valide";
    }

    if (!formData.commissionPercentage) {
      errors.commissionPercentage = 'Le taux de commission est requis';
    } else if (formData.commissionPercentage < 1 || formData.commissionPercentage > 100) {
      errors.commissionPercentage = 'Le taux doit être entre 1 et 100';
    }

    return errors;
  };

  const handleAddCommercial = async () => {
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});

    try {
      console.log('🚀 Création du commercial...', formData);
      const result = await adminService.createCommercial({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: formData.phone.trim() || undefined,
        commissionPercentage: parseInt(formData.commissionPercentage.toString()),
      });

      console.log('✅ Commercial créé:', result);

      // Success notification with promo code
      toast({
        title: 'Commercial créé avec succès!',
        description: `${result.fullName} a été ajouté avec le code promo ${result.promoCode}`,
      });

      // Copy promo code to clipboard
      if (result.promoCode) {
        navigator.clipboard.writeText(result.promoCode);
      }

      // Reset form and close modal
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        commissionPercentage: 10,
      });
      setIsAddDialogOpen(false);

      // Reload commercial list
      loadCommercialSales();
    } catch (error: any) {
      console.error('❌ Erreur lors de la création du commercial:', error);
      
      const errorMessage = error.response?.data?.message || 'Erreur lors de la création du commercial';
      
      // Check for specific errors
      if (errorMessage.includes('Email already exists') || errorMessage.includes('existe déjà')) {
        setFormErrors({ email: 'Cet email est déjà utilisé' });
      } else {
        toast({
          title: 'Erreur',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleDeleteCommercial = async () => {
    if (!commercialToDelete || !user?.id) return;

    setIsDeleting(true);
    try {
      console.log('🗑️ Suppression du commercial:', commercialToDelete.commercialId);
      await adminService.deleteUser(commercialToDelete.commercialId.toString(), user.id);
      
      toast({
        title: 'Commercial supprimé',
        description: `${commercialToDelete.commercialName} a été supprimé avec succès`,
      });

      // Close dialog
      setDeleteDialogOpen(false);
      setCommercialToDelete(null);

      // Reload commercial list
      loadCommercialSales();
    } catch (error: any) {
      console.error('❌ Erreur lors de la suppression:', error);
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Impossible de supprimer le commercial',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const loadCommercialUsers = async (commercial: Commercial) => {
    try {
      setLoadingUsers(true);
      setSelectedCommercial(commercial);
      setUsersDialogOpen(true);
      
      console.log(`👥 Chargement des utilisateurs pour ${commercial.commercialName} (ID: ${commercial.commercialId})...`);
      console.log(`📝 Code promo: ${commercial.promoCode}`);
      const users = await adminService.getCommercialUsers(commercial.commercialId);
      console.log('✅ Utilisateurs reçus:', users);
      console.log('📊 Nombre d\'utilisateurs:', users?.length || 0);
      console.log('📋 Type de données:', typeof users, 'Est un tableau?', Array.isArray(users));
      if (users && users.length > 0) {
        console.log('📋 Premier utilisateur détails:', users[0]);
      } else {
        console.log('⚠️ Aucun utilisateur retourné par l\'API');
      }
      
      setCommercialUsers(users || []);
    } catch (error: any) {
      console.error('❌ Erreur lors du chargement des utilisateurs:', error);
      console.error('❌ Détails de l\'erreur backend:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        data: error.response?.data,
        fullError: error.response
      });
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Impossible de charger les utilisateurs',
        variant: 'destructive',
      });
      setCommercialUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const openDeleteDialog = (commercial: Commercial) => {
    setCommercialToDelete(commercial);
    setDeleteDialogOpen(true);
  };

  const totalStats = {
    totalClients: commercials.reduce((sum, c) => sum + c.totalClients, 0),
    monthlyClients: commercials.reduce((sum, c) => sum + c.monthlyClients, 0),
    totalRevenue: Math.round(commercials.reduce((sum, c) => sum + c.totalRevenue, 0)),
    monthlyRevenue: Math.round(commercials.reduce((sum, c) => sum + c.monthlyRevenue, 0)),
  };

  const getCommissionColor = (rate: number) => {
    if (rate >= 12) return 'bg-yellow-500 text-white';
    if (rate >= 10) return 'bg-orange-500 text-white';
    return 'bg-gray-500 text-white';
  };

  const getStatusBadge = (status: string) => {
    return status === 'ACTIVE'
      ? 'bg-green-500 text-white'
      : 'bg-gray-400 text-white';
  };

  const copyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: 'Code copié',
      description: 'Le code promo a été copié dans le presse-papiers',
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Gestion de l'Équipe Commerciale</h1>
          <p className="text-muted-foreground mt-1">Gérer les commerciaux et leurs codes promo</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Liste des Commerciaux</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestion de l'Équipe Commerciale</h1>
          <p className="text-muted-foreground mt-1">Gérer les commerciaux et leurs codes promo</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Ajouter Commercial
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un nouveau commercial</DialogTitle>
              <DialogDescription>
                Ajoutez un commercial et un code promo sera généré automatiquement
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleFormChange('lastName', e.target.value)}
                    placeholder="Ex: السعيد"
                    disabled={isSubmitting}
                  />
                  {formErrors.lastName && (
                    <p className="text-sm text-destructive">{formErrors.lastName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleFormChange('firstName', e.target.value)}
                    placeholder="Ex: أحمد"
                    disabled={isSubmitting}
                  />
                  {formErrors.firstName && (
                    <p className="text-sm text-destructive">{formErrors.firstName}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFormChange('email', e.target.value)}
                  placeholder="ahmed@bclt.com"
                  disabled={isSubmitting}
                />
                {formErrors.email && (
                  <p className="text-sm text-destructive">{formErrors.email}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleFormChange('password', e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  disabled={isSubmitting}
                  required
                />
                {formErrors.password && (
                  <p className="text-sm text-destructive">{formErrors.password}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  Communiquez ce mot de passe au commercial
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleFormChange('phone', e.target.value)}
                  placeholder="+212612345678"
                  disabled={isSubmitting}
                />
                {formErrors.phone && (
                  <p className="text-sm text-destructive">{formErrors.phone}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="commission">(%) Commission</Label>
                <Input
                  id="commission"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.commissionPercentage}
                  onChange={(e) => handleFormChange('commissionPercentage', parseInt(e.target.value) || 0)}
                  placeholder="10"
                  disabled={isSubmitting}
                />
                {formErrors.commissionPercentage && (
                  <p className="text-sm text-destructive">{formErrors.commissionPercentage}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setFormErrors({});
                }}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button 
                onClick={handleAddCommercial}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Création...' : 'Ajouter'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Clients</p>
                <p className="text-3xl font-bold text-primary">{totalStats.totalClients}</p>
              </div>
              <Users className="h-10 w-10 text-primary/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Clients ce mois</p>
                <p className="text-3xl font-bold text-success">{totalStats.monthlyClients}</p>
              </div>
              <Users className="h-10 w-10 text-success/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenus Totaux</p>
                <p className="text-3xl font-bold text-secondary">{totalStats.totalRevenue} DH</p>
              </div>
              <DollarSign className="h-10 w-10 text-secondary/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenus du mois</p>
                <p className="text-3xl font-bold text-warning">{totalStats.monthlyRevenue} DH</p>
              </div>
              <DollarSign className="h-10 w-10 text-warning/20" />
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
                  <TableHead>Commercial</TableHead>
                  <TableHead>Code Promo</TableHead>
                  <TableHead>Total Clients</TableHead>
                  <TableHead>Clients du mois</TableHead>
                  <TableHead>Revenus Totaux</TableHead>
                  <TableHead>Revenus du mois</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commercials.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Aucun commercial trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  commercials.map((commercial) => (
                    <TableRow key={commercial.commercialId}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{commercial.commercialName}</p>
                          <p className="text-sm text-muted-foreground">{commercial.commercialEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono">
                            {commercial.promoCode}
                          </Badge>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => copyCouponCode(commercial.promoCode)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-primary">{commercial.totalClients}</p>
                          {commercial.totalClients > 0 && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => loadCommercialUsers(commercial)}
                              className="h-7 px-2"
                            >
                              <Users className="w-4 h-4 mr-1" />
                              Voir
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-success text-white">
                          +{commercial.monthlyClients}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{Math.round(commercial.totalRevenue)} DH</p>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-success">
                          {Math.round(commercial.monthlyRevenue)} DH
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge className={getCommissionColor(commercial.commissionRate)}>
                          {commercial.commissionRate}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => openDeleteDialog(commercial)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le commercial{' '}
              <span className="font-semibold">{commercialToDelete?.commercialName}</span> ?
              <br />
              Cette action est irréversible et supprimera toutes les données associées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCommercial}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Commercial Users Dialog */}
      <Dialog open={usersDialogOpen} onOpenChange={setUsersDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Liste des utilisateurs - {selectedCommercial?.commercialName}
            </DialogTitle>
            <DialogDescription>
              Utilisateurs inscrits avec le code promo: <span className="font-mono font-semibold">{selectedCommercial?.promoCode}</span>
            </DialogDescription>
          </DialogHeader>

          {loadingUsers ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : commercialUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucun utilisateur trouvé</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Total: {commercialUsers.length} utilisateur{commercialUsers.length > 1 ? 's' : ''}
              </p>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Date d'inscription</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Crédits</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commercialUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.fullName}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{user.email}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{user.phone || 'N/A'}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{new Date(user.dateInscription).toLocaleDateString('fr-FR')}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.status === 'ACTIF' ? 'default' : 'secondary'}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{user.credits}</p>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
