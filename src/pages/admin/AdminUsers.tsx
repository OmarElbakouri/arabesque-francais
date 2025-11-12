import { useState } from 'react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, Edit, Trash2, Mail, Phone, MessageSquare } from 'lucide-react';
import { UserRole, UserStatus } from '@/stores/authStore';
import { Progress } from '@/components/ui/progress';

interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: UserRole;
  status: UserStatus;
  dateInscription: string;
  dateExpiration?: string;
  commercial?: string;
  creditsIA?: number;
  maxCreditsIA?: number;
}

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Mock data
  const [users] = useState<User[]>([
    {
      id: '1',
      nom: 'الإدريسي',
      prenom: 'محمد',
      email: 'mohamed@example.com',
      telephone: '+212600000001',
      role: 'PREMIUM',
      status: 'ACTIF',
      dateInscription: '2024-01-15',
      dateExpiration: '2024-12-15',
      commercial: 'أحمد السعيد',
      creditsIA: 18,
      maxCreditsIA: 30,
    },
    {
      id: '2',
      nom: 'الزهراء',
      prenom: 'فاطمة',
      email: 'fatima@example.com',
      telephone: '+212600000002',
      role: 'VIP',
      status: 'ACTIF',
      dateInscription: '2024-02-01',
      dateExpiration: '2025-02-01',
      commercial: 'خالد المنصوري',
      creditsIA: 45,
      maxCreditsIA: 70,
    },
    {
      id: '3',
      nom: 'الحسني',
      prenom: 'يوسف',
      email: 'youssef@example.com',
      telephone: '+212600000003',
      role: 'NORMAL',
      status: 'ACTIF',
      dateInscription: '2024-03-10',
      creditsIA: 22,
      maxCreditsIA: 30,
    },
    {
      id: '4',
      nom: 'المنصوري',
      prenom: 'سارة',
      email: 'sara@example.com',
      telephone: '+212600000004',
      role: 'PREMIUM',
      status: 'EXPIRE',
      dateInscription: '2023-06-20',
      dateExpiration: '2024-06-20',
      commercial: 'أحمد السعيد',
      creditsIA: 0,
      maxCreditsIA: 30,
    },
    {
      id: '5',
      nom: 'العلوي',
      prenom: 'كريم',
      email: 'karim@example.com',
      telephone: '+212600000005',
      role: 'PREMIUM',
      status: 'EN_ATTENTE',
      dateInscription: '2024-10-01',
      commercial: 'خالد المنصوري',
      creditsIA: 30,
      maxCreditsIA: 30,
    },
  ]);

  const roleColors: Record<UserRole, string> = {
    FREE: 'bg-gray-500 text-white',
    NORMAL: 'bg-muted text-muted-foreground',
    PREMIUM: 'bg-primary text-primary-foreground',
    VIP: 'bg-secondary text-secondary-foreground',
    COMMERCIAL: 'bg-info text-white',
    ADMIN: 'bg-destructive text-destructive-foreground',
  };

  const statusColors: Record<UserStatus, string> = {
    ACTIF: 'bg-success text-white',
    EXPIRE: 'bg-destructive text-white',
    EN_ATTENTE: 'bg-warning text-white',
    SUSPENDU: 'bg-muted text-muted-foreground',
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const stats = {
    total: users.length,
    normal: users.filter((u) => u.role === 'NORMAL').length,
    premium: users.filter((u) => u.role === 'PREMIUM').length,
    vip: users.filter((u) => u.role === 'VIP').length,
    active: users.filter((u) => u.status === 'ACTIF').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Gestion des Utilisateurs</h1>
        <p className="text-muted-foreground mt-1">Afficher et gérer tous les utilisateurs</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.normal}</p>
              <p className="text-sm text-muted-foreground">Normal</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{stats.premium}</p>
              <p className="text-sm text-muted-foreground">Premium</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-secondary">{stats.vip}</p>
              <p className="text-sm text-muted-foreground">VIP</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-success">{stats.active}</p>
              <p className="text-sm text-muted-foreground">Actif</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Recherche et Filtres</CardTitle>
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
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Type d'abonnement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="NORMAL">Normal</SelectItem>
                <SelectItem value="PREMIUM">Premium</SelectItem>
                <SelectItem value="VIP">VIP</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="ACTIF">Actif</SelectItem>
                <SelectItem value="EXPIRE">Expiré</SelectItem>
                <SelectItem value="EN_ATTENTE">En attente</SelectItem>
                <SelectItem value="SUSPENDU">Suspendu</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Abonnement</TableHead>
                  <TableHead>Crédits IA</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date d'inscription</TableHead>
                  <TableHead>Date d'expiration</TableHead>
                  <TableHead>Commercial</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.prenom} {user.nom}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-3 h-3 text-muted-foreground" />
                          <span className="text-muted-foreground">{user.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-3 h-3 text-muted-foreground" />
                          <span className="text-muted-foreground">{user.telephone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={roleColors[user.role]}>{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      {user.creditsIA !== undefined ? (
                        <div className="space-y-1 min-w-[120px]">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">
                              {user.creditsIA}/{user.maxCreditsIA}
                            </span>
                            <MessageSquare className="w-3 h-3 text-muted-foreground" />
                          </div>
                          <Progress
                            value={(user.creditsIA / (user.maxCreditsIA || 1)) * 100}
                            className="h-1.5"
                          />
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[user.status]}>{user.status}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(user.dateInscription).toLocaleDateString('ar-MA')}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.dateExpiration
                        ? new Date(user.dateExpiration).toLocaleDateString('ar-MA')
                        : '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.commercial || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="icon" variant="ghost" onClick={() => console.log('Edit user', user.id)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => console.log('Delete user', user.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
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
