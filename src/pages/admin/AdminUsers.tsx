import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Trash2, Mail, Phone, Download, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { adminService } from '@/services/adminService';
import { useAuthStore } from '@/stores/authStore';
import { toast } from '@/hooks/use-toast';

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
  active: boolean;
  creditBalance: number;
  currentPlan?: string;
  plan?: string;
  phone?: string;
  usedPromoCode?: string;
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

export default function AdminUsers() {
  const currentUser = useAuthStore((state) => state.user);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [promoFilter, setPromoFilter] = useState<string>('all');
  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(0); // 0-indexed for backend
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const usersPerPage = 20;
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [progressionMap, setProgressionMap] = useState<Record<string, UserProgressionSummary>>({});
  const [progressionModalOpen, setProgressionModalOpen] = useState(false);
  const [selectedProgressionUser, setSelectedProgressionUser] = useState<UserProgressionSummary | null>(null);
  const [stats, setStats] = useState({ total: 0, free: 0, normal: 0, vip: 0, admin: 0, commercial: 0, withPromo: 0, withoutPromo: 0 });

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(0);
  }, [typeFilter, planFilter, promoFilter]);

  // Load stats once
  useEffect(() => {
    loadStats();
  }, []);

  // Load users when page/filters change
  useEffect(() => {
    loadUsers();
  }, [currentPage, debouncedSearch, typeFilter, planFilter, promoFilter]);

  const loadStats = async () => {
    try {
      const data = await adminService.getUserStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.searchUsers({
        search: debouncedSearch || undefined,
        role: typeFilter !== 'all' ? typeFilter : undefined,
        plan: planFilter !== 'all' ? planFilter : undefined,
        promo: promoFilter !== 'all' ? promoFilter : undefined,
        page: currentPage,
        size: usersPerPage,
      });
      const pageUsers: User[] = Array.isArray(data.users) ? data.users : [];
      setUsers(pageUsers);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
      loadProgressionsForPage(pageUsers);
    } catch (error: any) {
      console.error('Error loading users:', error);
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Impossible de charger les utilisateurs',
        variant: 'destructive',
      });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadProgressionsForPage = async (pageUsers: User[]) => {
    const ids = pageUsers.filter((u) => u.role === 'USER').map((u) => u.id);
    if (ids.length === 0) return;
    try {
      const data = await adminService.getProgressionsForUsers(ids);
      if (!Array.isArray(data)) return;
      setProgressionMap((prev) => {
        const next = { ...prev };
        data.forEach((p: UserProgressionSummary) => {
          next[String(p.userId)] = p;
        });
        return next;
      });
    } catch (error) {
      console.error('Error loading progressions:', error);
    }
  };

  const openProgressionModal = (userId: string) => {
    const progression = progressionMap[userId];
    if (progression) {
      setSelectedProgressionUser(progression);
      setProgressionModalOpen(true);
    }
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser || !currentUser) return;
    try {
      await adminService.deleteUser(selectedUser.id, currentUser.id);
      toast({ title: 'Succès', description: 'Utilisateur supprimé avec succès' });
      setDeleteDialogOpen(false);
      loadUsers();
      loadStats();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({ title: 'Erreur', description: "Impossible de supprimer l'utilisateur", variant: 'destructive' });
    }
  };

  const roleColors: Record<string, string> = {
    USER: 'bg-muted/10 text-muted-foreground border border-muted',
    COMMERCIAL: 'bg-blue-500/10 text-blue-600 border border-blue-500/20',
    ADMIN: 'bg-destructive/10 text-destructive border border-destructive/20',
  };

  const statusColors: Record<string, string> = {
    CONFIRME: 'bg-green-500/10 text-green-600 border border-green-500/20',
    EN_ATTENTE: 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20',
    EXPIRED: 'bg-red-500/10 text-red-600 border border-red-500/20',
    SUSPENDED: 'bg-gray-500/10 text-gray-600 border border-gray-500/20',
  };

  // CSV Export - uses legacy endpoint to get ALL users
  const exportToCSV = async (filterType: string) => {
    try {
      const allUsers: User[] = await adminService.getAllUsers();
      let usersToExport = allUsers;
      let exportLabel = filterType;

      if (filterType === 'WITHOUT_PROMO') {
        usersToExport = allUsers.filter((user) => user.role === 'USER' && (!user.usedPromoCode || user.usedPromoCode.trim() === ''));
        exportLabel = 'sans_code_promo';
      } else if (filterType === 'WITH_PROMO') {
        usersToExport = allUsers.filter((user) => user.role === 'USER' && user.usedPromoCode && user.usedPromoCode.trim() !== '');
        exportLabel = 'avec_code_promo';
      } else if (filterType !== 'all') {
        usersToExport = allUsers.filter((user) => (user.currentPlan || user.plan || 'FREE') === filterType);
        exportLabel = filterType.toLowerCase();
      }

      if (usersToExport.length === 0) {
        toast({ title: 'Information', description: `Aucun utilisateur à exporter`, variant: 'default' });
        return;
      }

      const headers = ['Nom', 'Prénom', 'Email', 'Numéro', 'Plan', 'Code Promo Utilisé'];
      const escapeField = (field: string) => field.includes(',') || field.includes('"') ? `"${field.replace(/"/g, '""')}"` : field;
      const csvContent = [
        headers.join(','),
        ...usersToExport.map((user) => {
          const parts = (user.fullName || '').split(' ');
          return [
            escapeField(parts.slice(1).join(' ') || ''),
            escapeField(parts[0] || ''),
            escapeField(user.email || ''),
            escapeField(user.phone || ''),
            escapeField(user.currentPlan || user.plan || 'FREE'),
            escapeField(user.usedPromoCode || '')
          ].join(',');
        })
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.setAttribute('href', URL.createObjectURL(blob));
      link.setAttribute('download', `utilisateurs_${exportLabel}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({ title: 'Export réussi', description: `${usersToExport.length} utilisateur(s) exporté(s)` });
    } catch (error) {
      toast({ title: 'Erreur', description: "Erreur lors de l'export", variant: 'destructive' });
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  const displayPage = currentPage + 1; // 1-indexed for display

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Gestion des Utilisateurs</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">Afficher et gérer tous les utilisateurs</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-4">
        <Card><CardContent className="pt-6"><div className="text-center"><p className="text-2xl font-bold text-primary">{stats.total}</p><p className="text-sm text-muted-foreground">Total</p></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-center"><p className="text-2xl font-bold text-gray-600">{stats.free}</p><p className="text-sm text-muted-foreground">Free</p></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-center"><p className="text-2xl font-bold text-blue-600">{stats.normal}</p><p className="text-sm text-muted-foreground">Normal</p></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-center"><p className="text-2xl font-bold text-purple-600">{stats.vip}</p><p className="text-sm text-muted-foreground">VIP</p></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-center"><p className="text-2xl font-bold text-orange-600">{stats.admin}</p><p className="text-sm text-muted-foreground">Admin</p></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-center"><p className="text-2xl font-bold text-cyan-600">{stats.commercial}</p><p className="text-sm text-muted-foreground">Commercial</p></div></CardContent></Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle>Recherche et Filtres</CardTitle>
            <div className="flex gap-2">
              <Select onValueChange={(value) => exportToCSV(value)}>
                <SelectTrigger className="w-[180px]">
                  <Download className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Exporter CSV" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les utilisateurs</SelectItem>
                  <SelectItem value="FREE">Plan Free</SelectItem>
                  <SelectItem value="NORMAL">Plan Normal</SelectItem>
                  <SelectItem value="VIP">Plan VIP</SelectItem>
                  <SelectItem value="WITHOUT_PROMO">Sans code promo</SelectItem>
                  <SelectItem value="WITH_PROMO">Avec code promo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Rechercher par nom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Type d'utilisateur" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="COMMERCIAL">Commercial</SelectItem>
                <SelectItem value="USER">User</SelectItem>
              </SelectContent>
            </Select>
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Plan" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les plans</SelectItem>
                <SelectItem value="FREE">Free</SelectItem>
                <SelectItem value="NORMAL">Normal</SelectItem>
                <SelectItem value="VIP">VIP</SelectItem>
              </SelectContent>
            </Select>
            <Select value={promoFilter} onValueChange={setPromoFilter}>
              <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Code promo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous (code promo)</SelectItem>
                <SelectItem value="with">Avec code promo ({stats.withPromo})</SelectItem>
                <SelectItem value="without">Sans code promo ({stats.withoutPromo})</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[700px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Progression</TableHead>
                    <TableHead>Actif</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        Chargement...
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        Aucun utilisateur trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell><p className="font-medium">{user.fullName || 'N/A'}</p></TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-3 h-3 text-muted-foreground" />
                            <span className="text-muted-foreground">{user.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm" dir="ltr">
                            <Phone className="w-3 h-3 text-muted-foreground" />
                            <span className="text-muted-foreground">{user.phone || '-'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={roleColors[user.role] || ''}>{user.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusColors[user.status] || ''}>
                            {user.status === 'CONFIRME' ? 'CONFIRMÉ' : user.status?.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.role === 'USER' ? (
                            <Badge variant="outline" className={
                              (user.currentPlan || user.plan) === 'VIP' ? 'bg-purple-500/10 text-purple-600 border-purple-500/20'
                                : (user.currentPlan || user.plan) === 'NORMAL' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                                  : 'bg-gray-500/10 text-gray-600 border-gray-500/20'
                            }>
                              {user.currentPlan || user.plan || 'FREE'}
                            </Badge>
                          ) : <span className="text-muted-foreground text-sm">-</span>}
                        </TableCell>
                        <TableCell>
                          {user.role === 'USER' && progressionMap[user.id] ? (
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progressionMap[user.id].overallProgress}%` }} />
                              </div>
                              <span className="text-xs text-muted-foreground">{progressionMap[user.id].overallProgress}%</span>
                            </div>
                          ) : <span className="text-muted-foreground text-sm">-</span>}
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.active ? 'default' : 'secondary'}>{user.active ? 'Oui' : 'Non'}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {user.role === 'USER' && progressionMap[user.id] && (
                              <Button size="icon" variant="ghost" onClick={() => openProgressionModal(user.id)} title="Voir progression">
                                <Eye className="w-4 h-4 text-primary" />
                              </Button>
                            )}
                            <Button size="icon" variant="ghost" onClick={() => handleDelete(user)} title="Supprimer">
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          {/* Server-side Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-4 border-t">
              <div className="text-sm text-muted-foreground">
                Page {displayPage} sur {totalPages} ({totalElements} utilisateurs)
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(p - 1, 0))} disabled={currentPage === 0}>
                  <ChevronLeft className="w-4 h-4" /> Précédent
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) pageNum = i;
                    else if (currentPage <= 2) pageNum = i;
                    else if (currentPage >= totalPages - 3) pageNum = totalPages - 5 + i;
                    else pageNum = currentPage - 2 + i;
                    return (
                      <Button key={pageNum} variant={currentPage === pageNum ? 'default' : 'outline'} size="sm" onClick={() => setCurrentPage(pageNum)} className="w-8 h-8 p-0">
                        {pageNum + 1}
                      </Button>
                    );
                  })}
                </div>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages - 1))} disabled={currentPage >= totalPages - 1}>
                  Suivant <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
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
                <p className="text-2xl font-bold text-orange-500">{selectedProgressionUser?.totalXp}</p>
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
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${course.progressPercentage}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{course.completedLessons}/{course.totalLessons} leçons</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Aucun cours inscrit</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'utilisateur {selectedUser?.fullName} et toutes ses
              données seront définitivement supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
