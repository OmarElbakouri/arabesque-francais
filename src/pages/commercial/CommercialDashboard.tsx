import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Users, DollarSign, UserPlus, TrendingUp, Search, Edit, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

interface PromoUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'FREE' | 'EN_ATTENTE' | 'CONFIRME' | 'NORMAL' | 'VIP';
  registeredDate: string;
  revenue: number;
  promoCode: string;
}

const CommercialDashboard = () => {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Mock data - sera remplacé par des données backend
  const promoCode = 'COMM2025'; // Le code promo du commercial
  const users: PromoUser[] = [
    {
      id: '1',
      name: 'أحمد محمد',
      email: 'ahmed@example.com',
      phone: '+212612345678',
      status: 'FREE',
      registeredDate: '2025-01-15',
      revenue: 0,
      promoCode: promoCode,
    },
    {
      id: '2',
      name: 'فاطمة الزهراء',
      email: 'fatima@example.com',
      phone: '+212623456789',
      status: 'EN_ATTENTE',
      registeredDate: '2025-01-10',
      revenue: 700,
      promoCode: promoCode,
    },
    {
      id: '3',
      name: 'محمد العلوي',
      email: 'mohamed@example.com',
      phone: '+212634567890',
      status: 'CONFIRME',
      registeredDate: '2025-01-05',
      revenue: 700,
      promoCode: promoCode,
    },
    {
      id: '4',
      name: 'سارة بنعلي',
      email: 'sara@example.com',
      phone: '+212645678901',
      status: 'NORMAL',
      registeredDate: '2024-12-20',
      revenue: 700,
      promoCode: promoCode,
    },
  ];

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = users.reduce((sum, u) => sum + u.revenue, 0);
  const confirmedUsers = users.filter((u) => u.status === 'CONFIRME' || u.status === 'NORMAL' || u.status === 'VIP').length;
  const pendingUsers = users.filter((u) => u.status === 'EN_ATTENTE').length;
  const freeUsers = users.filter((u) => u.status === 'FREE').length;

  const statusColors: Record<string, string> = {
    FREE: 'bg-gray-500',
    EN_ATTENTE: 'bg-yellow-500',
    CONFIRME: 'bg-green-500',
    NORMAL: 'bg-blue-500',
    VIP: 'bg-purple-500',
  };

  const statusLabels: Record<string, string> = {
    FREE: 'مجاني',
    EN_ATTENTE: 'في الانتظار',
    CONFIRME: 'مؤكد',
    NORMAL: 'عادي',
    VIP: 'مميز',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">مرحباً، {user?.prenom}</h1>
        <p className="text-muted-foreground">إدارة المستخدمين المسجلين بكود البروموشن الخاص بك</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المستخدمين</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">جميع المسجلين بكودك</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الإيرادات الإجمالية</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRevenue} DH</div>
            <p className="text-xs text-muted-foreground">من جميع المشتركين</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مستخدمين مؤكدين</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{confirmedUsers}</div>
            <p className="text-xs text-muted-foreground">عملاء نشطون</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">في الانتظار</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingUsers}</div>
            <p className="text-xs text-muted-foreground">{freeUsers} مجاني</p>
          </CardContent>
        </Card>
      </div>

      {/* Promo Code Display */}
      <Card className="bg-gradient-to-br from-primary/10 to-secondary/10">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">كود البروموشن الخاص بك</p>
              <p className="text-3xl font-bold text-primary">{promoCode}</p>
            </div>
            <Button onClick={() => navigator.clipboard.writeText(promoCode)}>
              نسخ الكود
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>المستخدمين المسجلين</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث بالاسم أو البريد الإلكتروني..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="تصفية حسب الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="FREE">مجاني</SelectItem>
                <SelectItem value="EN_ATTENTE">في الانتظار</SelectItem>
                <SelectItem value="CONFIRME">مؤكد</SelectItem>
                <SelectItem value="NORMAL">عادي</SelectItem>
                <SelectItem value="VIP">مميز</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">المستخدم</TableHead>
                  <TableHead className="text-right">معلومات الاتصال</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">تاريخ التسجيل</TableHead>
                  <TableHead className="text-right">الإيرادات</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{user.phone}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[user.status]}>
                        {statusLabels[user.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{new Date(user.registeredDate).toLocaleDateString('ar-MA')}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{user.revenue} DH</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
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
};

export default CommercialDashboard;
