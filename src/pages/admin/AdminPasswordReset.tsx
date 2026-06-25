import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, Mail, Phone, KeyRound, ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { adminService } from '@/services/adminService';
import { toast } from '@/hooks/use-toast';

interface User {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    currentPlan?: string;
    plan?: string;
    role: string;
}

interface Stats {
    total: number;
    free: number;
    normal: number;
    vip: number;
    [key: string]: number;
}

export default function AdminPasswordReset() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(0); // 0-indexed for the backend
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [resetDialogOpen, setResetDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [resetting, setResetting] = useState(false);
    const [stats, setStats] = useState<Stats>({ total: 0, free: 0, normal: 0, vip: 0 });
    const pageSize = 10;

    // Debounced search
    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setCurrentPage(0); // Reset to first page on new search
        }, 400);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Load stats once
    useEffect(() => {
        const loadStats = async () => {
            try {
                const data = await adminService.getUserStats();
                setStats({
                    total: data.total ?? 0,
                    free: data.free ?? 0,
                    normal: data.normal ?? 0,
                    vip: data.vip ?? 0,
                });
            } catch (error: any) {
                console.error('Erreur lors du chargement des stats:', error);
            }
        };
        loadStats();
    }, []);

    // Load users with server-side pagination & search
    const loadUsers = useCallback(async () => {
        try {
            setLoading(true);
            const data = await adminService.searchUsers({
                search: debouncedSearch,
                role: 'USER',
                page: currentPage,
                size: pageSize,
            });

            setUsers(Array.isArray(data.users) ? data.users : []);
            setTotalPages(data.totalPages ?? 1);
            setTotalElements(data.totalElements ?? 0);
        } catch (error: any) {
            console.error('Erreur lors du chargement des utilisateurs:', error);
            toast({
                title: 'Erreur',
                description: 'Impossible de charger les utilisateurs',
                variant: 'destructive',
            });
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, currentPage]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const handleOpenResetDialog = (user: User) => {
        setSelectedUser(user);
        setNewPassword('');
        setConfirmPassword('');
        setShowPassword(false);
        setResetDialogOpen(true);
    };

    const handleResetPassword = async () => {
        if (!selectedUser) return;

        // Validation
        if (!newPassword || newPassword.length < 6) {
            toast({
                title: 'Erreur',
                description: 'Le mot de passe doit contenir au moins 6 caractères',
                variant: 'destructive',
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            toast({
                title: 'Erreur',
                description: 'Les mots de passe ne correspondent pas',
                variant: 'destructive',
            });
            return;
        }

        try {
            setResetting(true);
            await adminService.resetUserPassword(selectedUser.id, newPassword);
            toast({
                title: 'Succès',
                description: `Le mot de passe de ${selectedUser.fullName || selectedUser.email} a été réinitialisé`,
            });
            setResetDialogOpen(false);
            setSelectedUser(null);
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            console.error('Erreur lors de la réinitialisation:', error);
            toast({
                title: 'Erreur',
                description: error.response?.data?.message || 'Impossible de réinitialiser le mot de passe',
                variant: 'destructive',
            });
        } finally {
            setResetting(false);
        }
    };

    const getPlanBadgeClass = (plan: string | undefined) => {
        switch (plan) {
            case 'VIP':
                return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
            case 'NORMAL':
                return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
            default:
                return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
        }
    };

    // Pagination helpers (display is 1-indexed for UI)
    const displayPage = currentPage + 1;
    const startIndex = currentPage * pageSize;

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
                    <KeyRound className="w-8 h-8 text-primary" />
                    Réinitialisation des Mots de Passe
                </h1>
                <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                    Réinitialiser le mot de passe de n'importe quel utilisateur
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-primary">{stats.total}</p>
                            <p className="text-sm text-muted-foreground">Total Utilisateurs</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-gray-600">{stats.free}</p>
                            <p className="text-sm text-muted-foreground">Plan Free</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600">{stats.normal}</p>
                            <p className="text-sm text-muted-foreground">Plan Normal</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-purple-600">{stats.vip}</p>
                            <p className="text-sm text-muted-foreground">Plan VIP</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <Card>
                <CardHeader>
                    <CardTitle>Recherche</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            placeholder="Rechercher par email, nom ou téléphone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <div className="min-w-[600px]">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nom</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Téléphone</TableHead>
                                        <TableHead>Plan</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                Chargement...
                                            </TableCell>
                                        </TableRow>
                                    ) : users.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                Aucun utilisateur trouvé
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        users.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell>
                                                    <p className="font-medium">{user.fullName || 'N/A'}</p>
                                                </TableCell>
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
                                                    <Badge
                                                        variant="outline"
                                                        className={getPlanBadgeClass(user.currentPlan || user.plan)}
                                                    >
                                                        {user.currentPlan || user.plan || 'FREE'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleOpenResetDialog(user)}
                                                        className="gap-2"
                                                    >
                                                        <KeyRound className="w-4 h-4" />
                                                        Réinitialiser
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-4 border-t">
                            <div className="text-sm text-muted-foreground">
                                Affichage de {startIndex + 1} à {Math.min(startIndex + pageSize, totalElements)} sur{' '}
                                {totalElements} utilisateurs
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                                    disabled={currentPage === 0}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Précédent
                                </Button>
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (displayPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (displayPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = displayPage - 2 + i;
                                        }
                                        return (
                                            <Button
                                                key={pageNum}
                                                variant={displayPage === pageNum ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => setCurrentPage(pageNum - 1)}
                                                className="w-8 h-8 p-0"
                                            >
                                                {pageNum}
                                            </Button>
                                        );
                                    })}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
                                    disabled={currentPage >= totalPages - 1}
                                >
                                    Suivant
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Reset Password Dialog */}
            <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <KeyRound className="w-5 h-5 text-primary" />
                            Réinitialiser le mot de passe
                        </DialogTitle>
                        <DialogDescription>
                            Définir un nouveau mot de passe pour{' '}
                            <span className="font-semibold text-foreground">
                                {selectedUser?.fullName || selectedUser?.email}
                            </span>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                            <div className="relative">
                                <Input
                                    id="newPassword"
                                    type={showPassword ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Entrez le nouveau mot de passe"
                                    className="pr-10"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full px-3"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                                    ) : (
                                        <Eye className="w-4 h-4 text-muted-foreground" />
                                    )}
                                </Button>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirmez le mot de passe"
                                    className="pr-10"
                                />
                            </div>
                        </div>
                        {newPassword && confirmPassword && newPassword !== confirmPassword && (
                            <p className="text-sm text-destructive">Les mots de passe ne correspondent pas</p>
                        )}
                        {newPassword && newPassword.length < 6 && (
                            <p className="text-sm text-destructive">
                                Le mot de passe doit contenir au moins 6 caractères
                            </p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setResetDialogOpen(false)}>
                            Annuler
                        </Button>
                        <Button
                            onClick={handleResetPassword}
                            disabled={
                                resetting ||
                                !newPassword ||
                                newPassword.length < 6 ||
                                newPassword !== confirmPassword
                            }
                        >
                            {resetting ? 'Réinitialisation...' : 'Réinitialiser'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
