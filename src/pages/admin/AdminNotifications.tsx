import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Bell, Send, Users, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  titre: string;
  message: string;
  cible: 'TOUS' | 'NORMAL' | 'VIP' | 'COMMERCIAL' | 'ADMIN';
  statut: 'ENVOYE' | 'PROGRAMMEE' | 'ECHEC';
  dateEnvoi: string;
  destinataires: number;
  lus: number;
}

export default function AdminNotifications() {
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newNotification, setNewNotification] = useState({
    titre: '',
    message: '',
    cible: 'TOUS',
  });

  const [notifications] = useState<Notification[]>([
    {
      id: '1',
      titre: 'Nouvelle fonctionnalité IA disponible',
      message: 'Découvrez notre nouvel assistant vocal amélioré avec Alibaba Cloud Speech',
      cible: 'TOUS',
      statut: 'ENVOYE',
      dateEnvoi: '2024-11-01T10:00:00',
      destinataires: 1250,
      lus: 845,
    },
    {
      id: '2',
      titre: 'Offre spéciale VIP',
      message: 'Profitez de 20% de réduction sur votre renouvellement VIP ce mois-ci',
      cible: 'VIP',
      statut: 'ENVOYE',
      dateEnvoi: '2024-10-28T14:30:00',
      destinataires: 180,
      lus: 156,
    },
    {
      id: '3',
      titre: 'Formation commerciale ce weekend',
      message: 'Rappel: Session de formation pour tous les commerciaux samedi à 10h',
      cible: 'COMMERCIAL',
      statut: 'PROGRAMMEE',
      dateEnvoi: '2024-11-03T09:00:00',
      destinataires: 15,
      lus: 0,
    },
    {
      id: '4',
      titre: 'Upgrade vers VIP',
      message: "Passez au plan VIP et obtenez 70 messages IA et 25 vocaux par chapitre",
      cible: 'NORMAL',
      statut: 'ENVOYE',
      dateEnvoi: '2024-10-25T16:00:00',
      destinataires: 450,
      lus: 312,
    },
  ]);

  const stats = {
    total: notifications.length,
    envoye: notifications.filter((n) => n.statut === 'ENVOYE').length,
    programmee: notifications.filter((n) => n.statut === 'PROGRAMMEE').length,
    tauxLecture: Math.round(
      (notifications
        .filter((n) => n.statut === 'ENVOYE')
        .reduce((sum, n) => sum + (n.lus / n.destinataires) * 100, 0) /
        notifications.filter((n) => n.statut === 'ENVOYE').length) ||
        0
    ),
  };

  const cibleColors = {
    TOUS: 'bg-primary text-primary-foreground',
    NORMAL: 'bg-blue-500 text-white',
    VIP: 'bg-secondary text-secondary-foreground',
    COMMERCIAL: 'bg-purple-500 text-white',
    ADMIN: 'bg-destructive text-white',
  };

  const statutColors = {
    ENVOYE: 'bg-success text-white',
    PROGRAMMEE: 'bg-warning text-white',
    ECHEC: 'bg-destructive text-white',
  };

  const handleCreateNotification = () => {
    toast({
      title: 'Notification Envoyée',
      description: `Notification envoyée avec succès à ${newNotification.cible}`,
    });
    setShowCreateDialog(false);
    setNewNotification({
      titre: '',
      message: '',
      cible: 'TOUS',
    });
  };

  const getTargetCount = (cible: string) => {
    switch (cible) {
      case 'TOUS':
        return 1250;
      case 'NORMAL':
        return 450;
      case 'VIP':
        return 180;
      case 'COMMERCIAL':
        return 15;
      case 'ADMIN':
        return 3;
      default:
        return 0;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Notifications Push</h1>
          <p className="text-muted-foreground mt-1">
            Envoyer des notifications ciblées par rôle ou broadcast global
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Send className="w-4 h-4" />
              Nouvelle Notification
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer une Notification Push</DialogTitle>
              <DialogDescription>
                Envoyez une notification à un groupe spécifique d'utilisateurs
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="cible">Cible</Label>
                <Select
                  value={newNotification.cible}
                  onValueChange={(value) =>
                    setNewNotification({ ...newNotification, cible: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TOUS">
                      Tous les utilisateurs ({getTargetCount('TOUS')})
                    </SelectItem>
                    <SelectItem value="NORMAL">
                      Utilisateurs NORMAL ({getTargetCount('NORMAL')})
                    </SelectItem>
                    <SelectItem value="VIP">
                      Utilisateurs VIP ({getTargetCount('VIP')})
                    </SelectItem>
                    <SelectItem value="COMMERCIAL">
                      Équipe Commerciale ({getTargetCount('COMMERCIAL')})
                    </SelectItem>
                    <SelectItem value="ADMIN">
                      Administrateurs ({getTargetCount('ADMIN')})
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="titre">Titre</Label>
                <Input
                  id="titre"
                  value={newNotification.titre}
                  onChange={(e) =>
                    setNewNotification({ ...newNotification, titre: e.target.value })
                  }
                  placeholder="Ex: Nouvelle fonctionnalité disponible"
                  maxLength={60}
                />
                <p className="text-xs text-muted-foreground">
                  {newNotification.titre.length}/60 caractères
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={newNotification.message}
                  onChange={(e) =>
                    setNewNotification({ ...newNotification, message: e.target.value })
                  }
                  placeholder="Écrivez votre message ici..."
                  rows={4}
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground">
                  {newNotification.message.length}/200 caractères
                </p>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Aperçu</span>
                </div>
                <div className="bg-background p-3 rounded border">
                  <div className="flex items-start gap-3">
                    <Bell className="w-5 h-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {newNotification.titre || 'Titre de la notification'}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {newNotification.message || 'Le message apparaîtra ici...'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreateNotification} className="gap-2">
                <Send className="w-4 h-4" />
                Envoyer à {getTargetCount(newNotification.cible)} utilisateurs
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-3xl font-bold text-primary">{stats.total}</p>
              </div>
              <Bell className="h-10 w-10 text-primary/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Envoyées</p>
                <p className="text-3xl font-bold text-success">{stats.envoye}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-success/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Programmées</p>
                <p className="text-3xl font-bold text-warning">{stats.programmee}</p>
              </div>
              <Clock className="h-10 w-10 text-warning/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taux de Lecture</p>
                <p className="text-3xl font-bold text-secondary">{stats.tauxLecture}%</p>
              </div>
              <Users className="h-10 w-10 text-secondary/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des Notifications</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Cible</TableHead>
                  <TableHead>Destinataires</TableHead>
                  <TableHead>Taux de Lecture</TableHead>
                  <TableHead>Date d'envoi</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell className="font-medium max-w-[200px]">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-primary" />
                        <span className="truncate">{notification.titre}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[300px]">
                      <p className="text-sm text-muted-foreground truncate">
                        {notification.message}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge className={cibleColors[notification.cible]}>
                        {notification.cible}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{notification.destinataires}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {notification.statut === 'ENVOYE' ? (
                        <div className="space-y-1">
                          <p className="text-sm font-medium">
                            {notification.lus}/{notification.destinataires}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {Math.round((notification.lus / notification.destinataires) * 100)}%
                          </p>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(notification.dateEnvoi).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge className={statutColors[notification.statut]}>
                        {notification.statut}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
