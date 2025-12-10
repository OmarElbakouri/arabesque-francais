import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bell, CheckCheck, Trash2, Mail, MailOpen, RefreshCw, Eye, Clock, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from '@/lib/api';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  readAt: string | null;
  sentAt: string | null;
  deepLink: string | null;
  createdAt: string;
}

const Messages = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedMessage, setSelectedMessage] = useState<Notification | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { toast } = useToast();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/user/notifications');
      setNotifications(response.data.data || []);
      
      // Calculate unread count
      const unread = (response.data.data || []).filter((n: Notification) => !n.isRead).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les messages",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id: number) => {
    try {
      await api.put(`/user/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/user/notifications/read-all');
      setNotifications(prev => 
        prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
      );
      setUnreadCount(0);
      toast({
        title: "Succès",
        description: "Tous les messages ont été marqués comme lus"
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite",
        variant: "destructive"
      });
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      await api.delete(`/user/notifications/${id}`);
      const notification = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (notification && !notification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      toast({
        title: "Supprimé",
        description: "Message supprimé avec succès"
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le message",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'URGENT':
        return 'bg-red-500';
      case 'INFO':
        return 'bg-blue-500';
      case 'SUCCESS':
        return 'bg-green-500';
      case 'WARNING':
        return 'bg-yellow-500';
      case 'SYSTEM':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTypeBgColor = (type: string) => {
    switch (type) {
      case 'URGENT':
        return 'bg-red-50 border-red-200';
      case 'INFO':
        return 'bg-blue-50 border-blue-200';
      case 'SUCCESS':
        return 'bg-green-50 border-green-200';
      case 'WARNING':
        return 'bg-yellow-50 border-yellow-200';
      case 'SYSTEM':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const openDetails = (notification: Notification) => {
    setSelectedMessage(notification);
    setDetailsOpen(true);
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Bell className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Mes Messages</h1>
              <p className="text-muted-foreground text-sm">
                {unreadCount > 0 
                  ? `${unreadCount} message${unreadCount > 1 ? 's' : ''} non lu${unreadCount > 1 ? 's' : ''}`
                  : 'Tous vos messages sont lus'
                }
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={fetchNotifications}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
            {unreadCount > 0 && (
              <Button 
                size="sm"
                onClick={markAllAsRead}
                className="gap-2"
              >
                <CheckCheck className="h-4 w-4" />
                Tout marquer lu
              </Button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <Card className="shadow-lg">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mail className="h-5 w-5 text-primary" />
              Boîte de réception
            </CardTitle>
            <CardDescription>
              Les messages et notifications de l'administration
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <RefreshCw className="h-10 w-10 animate-spin text-primary mx-auto mb-3" />
                  <p className="text-muted-foreground">Chargement...</p>
                </div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="p-4 bg-muted/30 rounded-full w-fit mx-auto mb-4">
                  <Bell className="h-12 w-12 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium mb-1">Aucun message</p>
                <p className="text-sm text-muted-foreground">Vous n'avez pas encore reçu de messages</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 transition-all hover:bg-muted/50 ${
                      !notification.isRead ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`p-2 rounded-full shrink-0 ${
                        notification.isRead ? 'bg-muted' : 'bg-primary/10'
                      }`}>
                        {notification.isRead ? (
                          <MailOpen className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <Mail className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className={`font-semibold ${
                            notification.isRead ? 'text-foreground' : 'text-primary'
                          }`}>
                            {notification.title || 'Notification'}
                          </h3>
                          {!notification.isRead && (
                            <Badge className="bg-primary text-white text-xs px-2 py-0">
                              Nouveau
                            </Badge>
                          )}
                          <Badge 
                            className={`text-xs text-white ${getTypeColor(notification.type)}`}
                          >
                            {notification.type}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(notification.sentAt || notification.createdAt)}
                          </span>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 text-xs"
                          onClick={() => openDetails(notification)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Détails
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Details Modal */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-full ${selectedMessage ? getTypeBgColor(selectedMessage.type) : ''}`}>
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-lg">
                    {selectedMessage?.title || 'Message'}
                  </DialogTitle>
                  <DialogDescription className="flex items-center gap-2 mt-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(selectedMessage?.sentAt || selectedMessage?.createdAt || null)}
                  </DialogDescription>
                </div>
              </div>
              {selectedMessage && (
                <Badge className={`w-fit text-xs text-white ${getTypeColor(selectedMessage.type)}`}>
                  {selectedMessage.type}
                </Badge>
              )}
            </DialogHeader>
            
            <div className={`p-4 rounded-lg border mt-4 ${selectedMessage ? getTypeBgColor(selectedMessage.type) : ''}`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {selectedMessage?.message}
              </p>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setDetailsOpen(false)}
              >
                Fermer
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (selectedMessage) {
                    deleteNotification(selectedMessage.id);
                    setDetailsOpen(false);
                  }
                }}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Supprimer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Messages;
