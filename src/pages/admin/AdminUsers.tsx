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
import { Search, Filter, Edit, Trash2, Mail, Phone } from 'lucide-react';
import { UserRole, UserStatus } from '@/stores/authStore';

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
    },
  ]);

  const roleColors: Record<UserRole, string> = {
    NORMAL: 'bg-muted text-muted-foreground',
    PREMIUM: 'bg-primary text-primary-foreground',
    VIP: 'bg-secondary text-secondary-foreground',
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
        <h1 className="text-3xl font-bold">إدارة المستخدمين</h1>
        <p className="text-muted-foreground mt-1">عرض وإدارة جميع المستخدمين</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{stats.total}</p>
              <p className="text-sm text-muted-foreground">إجمالي</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.normal}</p>
              <p className="text-sm text-muted-foreground">عادي</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{stats.premium}</p>
              <p className="text-sm text-muted-foreground">بريميوم</p>
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
              <p className="text-sm text-muted-foreground">نشط</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>البحث والتصفية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="ابحث بالاسم أو البريد الإلكتروني..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="نوع الاشتراك" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="NORMAL">عادي</SelectItem>
                <SelectItem value="PREMIUM">بريميوم</SelectItem>
                <SelectItem value="VIP">VIP</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="ACTIF">نشط</SelectItem>
                <SelectItem value="EXPIRE">منتهي</SelectItem>
                <SelectItem value="EN_ATTENTE">في الانتظار</SelectItem>
                <SelectItem value="SUSPENDU">معلق</SelectItem>
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
                  <TableHead className="text-right">المستخدم</TableHead>
                  <TableHead className="text-right">الاتصال</TableHead>
                  <TableHead className="text-right">الاشتراك</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">تاريخ التسجيل</TableHead>
                  <TableHead className="text-right">تاريخ الانتهاء</TableHead>
                  <TableHead className="text-right">التجاري</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
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
                        <Button size="icon" variant="ghost">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost">
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
