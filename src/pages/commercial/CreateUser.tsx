import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { createUser } from '@/services/commercialService';
import { useNavigate } from 'react-router-dom';
import { UserPlus, ArrowLeft } from 'lucide-react';

const CreateUser = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    country: 'Maroc',
    promoCode: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || 
        !formData.phone || !formData.password || !formData.country) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Tous les champs obligatoires doivent être remplis'
      });
      return;
    }

    try {
      setLoading(true);
      
      // Préparer les données (retirer promoCode si vide)
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        country: formData.country,
        ...(formData.promoCode && { promoCode: formData.promoCode })
      };
      
      const response = await createUser(userData);
      
      toast({
        title: 'Succès',
        description: `Utilisateur créé avec succès ! ID: ${response.data?.created_by_commercial_id || 'créé'}`
      });
      
      // Réinitialiser le formulaire
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        country: 'Maroc',
        promoCode: ''
      });
      
      // Rediriger vers le dashboard après 1 seconde
      setTimeout(() => {
        navigate('/commercial');
      }, 1000);
      
    } catch (error: any) {
      console.error('❌ Erreur création:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.response?.data?.message || 'Erreur lors de la création de l\'utilisateur'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/commercial')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour au Dashboard
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-6 w-6" />
            Créer un Nouveau Compte Utilisateur
          </CardTitle>
          <CardDescription>
            Utilise le token JWT automatiquement (pas besoin de passer l'ID commercial). Le code promo du commercial sera appliqué automatiquement. Statut: 🟡 EN_ATTENTE. Audit log automatique.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  Prénom <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  placeholder="Omar"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">
                  Nom <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  placeholder="El Bakouri"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="omar@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                Téléphone <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+212 600000000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Mot de passe <span className="text-red-500">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="password123"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">
                Pays <span className="text-red-500">*</span>
              </Label>
              <Input
                id="country"
                placeholder="Maroc"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="promoCode">
                Code Promo <span className="text-gray-400">(Optionnel)</span>
              </Label>
              <Input
                id="promoCode"
                placeholder="SALES2025"
                value={formData.promoCode}
                onChange={(e) => setFormData({ ...formData, promoCode: e.target.value.toUpperCase() })}
                className="uppercase"
                disabled={loading}
              />
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/commercial')}
                disabled={loading}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Création en cours...' : 'Créer le Compte'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateUser;