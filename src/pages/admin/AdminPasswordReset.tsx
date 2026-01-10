import { useState, useEffect } from 'react';
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

export default function AdminPasswordReset() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchEmail, setSearchEmail] = useState('');
    const [searchPhone, setSearchPhone] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [resetDialogOpen, setResetDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [resetting, setResetting] = useState(false);
    const usersPerPage = 10;

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await adminService.getAllUsers();
            // Filtrer uniquement les utilisateurs (pas les admins ou commerciaux)
            const usersArray = Array.isArray(data) ? data.filter((u: User) => u.role === 'USER') : [];
            setUsers(usersArray);
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
    };

    // Filtrage par email et téléphone
    const filteredUsers = users.filter((user) => {
        const matchesEmail = searchEmail === '' ||
            (user.email?.toLowerCase() || '').includes(searchEmail.toLowerCase());
        const matchesPhone = searchPhone === '' ||
            (user.phone || '').includes(searchPhone);
        return matchesEmail && matchesPhone;
    });

    // Pagination
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchEmail, searchPhone]);

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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Chargement...</p>
            </div>
        );
    }

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
                            <p className="text-2xl font-bold text-primary">{users.length}</p>
                            <p className="text-sm text-muted-foreground">Total Utilisateurs</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-gray-600">
                                {users.filter((u) => (u.currentPlan || u.plan || 'FREE') === 'FREE').length}
                            </p>
                            <p className="text-sm text-muted-foreground">Plan Free</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600">
                                {users.filter((u) => (u.currentPlan || u.plan) === 'NORMAL').length}
                            </p>
                            <p className="text-sm text-muted-foreground">Plan Normal</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-purple-600">
                                {users.filter((u) => (u.currentPlan || u.plan) === 'VIP').length}
                            </p>
                            <p className="text-sm text-muted-foreground">Plan VIP</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Filtres de Recherche</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                                placeholder="Rechercher par email..."
                                value={searchEmail}
                                onChange={(e) => setSearchEmail(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex-1 relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                                placeholder="Rechercher par numéro de téléphone..."
                                value={searchPhone}
                                onChange={(e) => setSearchPhone(e.target.value)}
                                className="pl-10"
                                dir="ltr"
                            />
                        </div>
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
                                    {paginatedUsers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                Aucun utilisateur trouvé
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedUsers.map((user) => (
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
                    {filteredUsers.length > usersPerPage && (
                        <div className="flex items-center justify-between px-4 py-4 border-t">
                            <div className="text-sm text-muted-foreground">
                                Affichage de {startIndex + 1} à {Math.min(endIndex, filteredUsers.length)} sur{' '}
                                {filteredUsers.length} utilisateurs
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Précédent
                                </Button>
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }
                                        return (
                                            <Button
                                                key={pageNum}
                                                variant={currentPage === pageNum ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => setCurrentPage(pageNum)}
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
                                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
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
