import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { getCommercialProfile, updateCommercialProfile, changePassword } from '@/services/commercialService';
import { Settings as SettingsIcon, Key, User } from 'lucide-react';

const Settings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Profile data
  const [profile, setProfile] = useState({
    id: 0,
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    promoCode: '',
    active: true
  });

  // Profile form
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: ''
  });

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Load profile on mount
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getCommercialProfile();
      console.log('👤 Profil chargé:', data);
      
      setProfile(data);
      setProfileForm({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        phone: data.phone || ''
      });
    } catch (err: any) {
      console.error('❌ Erreur chargement profil:', err);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Erreur lors du chargement du profil'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileForm({
      ...profileForm,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value
    });
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const updated = await updateCommercialProfile(profileForm);
      setProfile(updated);
      toast({
        title: 'Succès',
        description: 'Profil mis à jour avec succès'
      });
    } catch (err: any) {
      console.error('❌ Erreur mise à jour:', err);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: err.response?.data?.message || 'Erreur lors de la mise à jour'
      });
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangingPassword(true);

    // Validation
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Les mots de passe ne correspondent pas'
      });
      setChangingPassword(false);
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Le mot de passe doit contenir au moins 6 caractères'
      });
      setChangingPassword(false);
      return;
    }

    try {
      await changePassword(passwordForm);
      toast({
        title: 'Succès',
        description: 'Mot de passe modifié avec succès'
      });
      
      // Reset form
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err: any) {
      console.error('❌ Erreur changement mot de passe:', err);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: err.response?.data?.message || 'Erreur lors du changement de mot de passe'
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const copyPromoCode = () => {
    if (profile.promoCode) {
      navigator.clipboard.writeText(profile.promoCode);
      toast({
        title: 'Succès',
        description: 'Code promo copié !'
      });
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Paramètres</h1>
        <p className="text-muted-foreground">Gérez les paramètres de votre compte</p>
      </div>

      {/* Profile Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informations du Compte
          </CardTitle>
          <CardDescription>Vos informations personnelles</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={profileForm.firstName}
                  onChange={handleProfileChange}
                  placeholder="Prénom"
                  disabled={updating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={profileForm.lastName}
                  onChange={handleProfileChange}
                  placeholder="Nom de famille"
                  disabled={updating}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={profile.email}
                disabled
                className="bg-gray-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                name="phone"
                value={profileForm.phone}
                onChange={handleProfileChange}
                placeholder="+212 6XX XXX XXX"
                disabled={updating}
              />
            </div>
            <Button type="submit" disabled={updating}>
              {updating ? 'Mise à jour...' : 'Mettre à jour'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator />

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Changer le Mot de Passe
          </CardTitle>
          <CardDescription>Mettez à jour votre mot de passe</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Mot de passe actuel</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                placeholder="••••••••"
                required
                disabled={changingPassword}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nouveau mot de passe</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                placeholder="••••••••"
                minLength={6}
                required
                disabled={changingPassword}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="••••••••"
                minLength={6}
                required
                disabled={changingPassword}
              />
            </div>
            <Button type="submit" disabled={changingPassword}>
              {changingPassword ? 'Modification...' : 'Mettre à jour le mot de passe'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator />

      {/* Promo Code Info */}
      <Card className="bg-gradient-to-br from-primary/10 to-secondary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Code Promo
          </CardTitle>
          <CardDescription>Votre code promo personnel</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Partagez ce code avec vos clients</p>
              <p className="text-3xl font-bold text-primary">{profile.promoCode || 'Aucun code promo'}</p>
            </div>
            {profile.promoCode && (
              <Button onClick={copyPromoCode}>
                Copier le code
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;