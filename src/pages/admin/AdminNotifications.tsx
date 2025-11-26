import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
import { Bell, Send, Users, CheckCircle, Clock, AlertCircle, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getNotificationHistory, getNotificationStatistics, sendNotification } from '@/services/notificationService';

interface Notification {
  id: number;
  title: string;
  message: string;
  targetRole: 'TOUS' | 'NORMAL' | 'VIP' | 'COMMERCIAL' | 'ADMIN' | null;
  status: 'ENVOYE' | 'PROGRAMME';
  sentAt: string;
  recipientsCount: number;
  readCount: number;
  readRate: number;
}

interface NotificationStats {
  totalSent: number;
  totalRead: number;
  totalUnread: number;
  readRate: number;
  scheduled: number;
}

export default function AdminNotifications() {
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats>({
    totalSent: 0,
    totalRead: 0,
    totalUnread: 0,
    readRate: 0,
    scheduled: 0,
  });
  
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    targetRole: 'TOUS',
    targetUserId: '',
    deepLink: '',
    urgent: false,
  });

  useEffect(() => {
    loadNotifications();
    loadStatistics();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotificationHistory();
      setNotifications(data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de charger les notifications',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const data = await getNotificationStatistics();
      setStats(data);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
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

  const handleCreateNotification = async () => {
    if (!newNotification.title.trim() || !newNotification.message.trim()) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Le titre et le message sont obligatoires',
      });
      return;
    }

    try {
      setLoading(true);
      await sendNotification({
        title: newNotification.title,
        message: newNotification.message,
        targetRole: newNotification.targetRole === 'TOUS' ? null : newNotification.targetRole,
        targetUserId: newNotification.targetUserId ? parseInt(newNotification.targetUserId) : null,
        deepLink: newNotification.deepLink || null,
        urgent: newNotification.urgent,
      });
      
      toast({
        title: '✅ Notification Envoyée',
        description: `Notification envoyée avec succès à ${newNotification.targetRole}`,
      });
      
      setShowCreateDialog(false);
      setNewNotification({
        title: '',
        message: '',
        targetRole: 'TOUS',
        targetUserId: '',
        deepLink: '',
        urgent: false,
      });
      
      // Recharger les données
      loadNotifications();
      loadStatistics();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: "Impossible d'envoyer la notification",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTargetLabel = (targetRole: string | null) => {
    if (!targetRole) return 'TOUS';
    return targetRole;
  };

  const getTargetCount = (cible: string) => {
    // Ces valeurs seront dynamiques depuis le backend
    switch (cible) {
      case 'TOUS':
        return 'Tous';
      case 'NORMAL':
        return 'Utilisateurs NORMAL';
      case 'VIP':
        return 'Utilisateurs VIP';
      case 'COMMERCIAL':
        return 'Équipe Commerciale';
      case 'ADMIN':
        return 'Administrateurs';
      default:
        return 'Tous';
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
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Créer une Notification Push</DialogTitle>
              <DialogDescription>
                Envoyez une notification à un groupe spécifique d'utilisateurs
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="cible">Cible</Label>
                <Select
                  value={newNotification.targetRole}
                  onValueChange={(value) =>
                    setNewNotification({ ...newNotification, targetRole: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TOUS">{getTargetCount('TOUS')}</SelectItem>
                    <SelectItem value="NORMAL">{getTargetCount('NORMAL')}</SelectItem>
                    <SelectItem value="VIP">{getTargetCount('VIP')}</SelectItem>
                    <SelectItem value="COMMERCIAL">{getTargetCount('COMMERCIAL')}</SelectItem>
                    <SelectItem value="ADMIN">{getTargetCount('ADMIN')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="titre">Titre</Label>
                <Input
                  id="titre"
                  value={newNotification.title}
                  onChange={(e) =>
                    setNewNotification({ ...newNotification, title: e.target.value })
                  }
                  placeholder="Ex: Nouvelle fonctionnalité disponible"
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground">
                  {newNotification.title.length}/100 caractères
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={newNotification.message}
                  onChange={(e) =>
                    setNewNotification({ ...newNotification, message: e.target.value })
                  }
                  placeholder="Écrivez votre message ici..."
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground">
                  {newNotification.message.length}/500 caractères
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="deepLink">Lien Deep Link (optionnel)</Label>
                  <Input
                    id="deepLink"
                    value={newNotification.deepLink}
                    onChange={(e) =>
                      setNewNotification({ ...newNotification, deepLink: e.target.value })
                    }
                    placeholder="Ex: /courses/123"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="targetUserId">ID Utilisateur (optionnel)</Label>
                  <Input
                    id="targetUserId"
                    type="number"
                    value={newNotification.targetUserId}
                    onChange={(e) =>
                      setNewNotification({ ...newNotification, targetUserId: e.target.value })
                    }
                    placeholder="ID utilisateur"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="urgent"
                  checked={newNotification.urgent}
                  onCheckedChange={(checked) =>
                    setNewNotification({ ...newNotification, urgent: checked })
                  }
                />
                <Label htmlFor="urgent" className="cursor-pointer text-sm">
                  Notification Urgente (priorité élevée)
                </Label>
              </div>

              <div className="bg-muted p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Aperçu</span>
                </div>
                <div className="bg-background p-2.5 rounded border">
                  <div className="flex items-start gap-2">
                    <Bell className={`w-4 h-4 mt-0.5 ${newNotification.urgent ? 'text-destructive' : 'text-primary'}`} />
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {newNotification.title || 'Titre de la notification'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {newNotification.message || 'Le message apparaîtra ici...'}
                      </p>
                      {newNotification.deepLink && (
                        <p className="text-xs text-primary mt-1.5 flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {newNotification.deepLink}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreateNotification} disabled={loading} className="gap-2">
                <Send className="w-4 h-4" />
                {loading ? 'Envoi en cours...' : `Envoyer la notification`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Envoyées</p>
                <p className="text-3xl font-bold text-primary">{stats.totalSent}</p>
              </div>
              <Send className="h-10 w-10 text-primary/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Lues</p>
                <p className="text-3xl font-bold text-success">{stats.totalRead}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-success/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Non Lues</p>
                <p className="text-3xl font-bold text-warning">{stats.totalUnread}</p>
              </div>
              <Bell className="h-10 w-10 text-warning/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taux de Lecture</p>
                <p className="text-3xl font-bold text-secondary">{stats.readRate}%</p>
              </div>
              <Users className="h-10 w-10 text-secondary/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Programmées</p>
                <p className="text-3xl font-bold text-blue-600">{stats.scheduled}</p>
              </div>
              <Clock className="h-10 w-10 text-blue-600/20" />
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
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <Clock className="w-5 h-5 animate-spin" />
                        <span>Chargement...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : notifications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Aucune notification trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  notifications.map((notification) => (
                    <TableRow key={notification.id}>
                      <TableCell className="font-medium max-w-[200px]">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-primary" />
                          <span className="truncate">{notification.title}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[300px]">
                        <p className="text-sm text-muted-foreground truncate">
                          {notification.message}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge className={cibleColors[getTargetLabel(notification.targetRole) as keyof typeof cibleColors]}>
                          {getTargetLabel(notification.targetRole)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{notification.recipientsCount}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {notification.status === 'ENVOYE' ? (
                          <div className="space-y-1">
                            <p className="text-sm font-medium">
                              {notification.readCount}/{notification.recipientsCount}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {notification.readRate}%
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {notification.sentAt ? new Date(notification.sentAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }) : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge className={statutColors[notification.status]}>
                          {notification.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
