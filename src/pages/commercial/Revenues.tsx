import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Users, Calendar } from 'lucide-react';

interface RevenueRecord {
  id: string;
  userName: string;
  userEmail: string;
  amount: number;
  date: string;
  status: 'PAID' | 'PENDING';
  paymentMethod: string;
}

const Revenues = () => {
  // Mock data - sera remplacé par des données backend
  const revenues: RevenueRecord[] = [
    {
      id: '1',
      userName: 'فاطمة الزهراء',
      userEmail: 'fatima@example.com',
      amount: 700,
      date: '2025-01-10',
      status: 'PAID',
      paymentMethod: 'تحويل بنكي',
    },
    {
      id: '2',
      userName: 'محمد العلوي',
      userEmail: 'mohamed@example.com',
      amount: 700,
      date: '2025-01-05',
      status: 'PAID',
      paymentMethod: 'بطاقة بنكية',
    },
    {
      id: '3',
      userName: 'سارة بنعلي',
      userEmail: 'sara@example.com',
      amount: 700,
      date: '2024-12-20',
      status: 'PAID',
      paymentMethod: 'تحويل بنكي',
    },
  ];

  const totalRevenue = revenues.reduce((sum, r) => sum + r.amount, 0);
  const paidRevenue = revenues.filter(r => r.status === 'PAID').reduce((sum, r) => sum + r.amount, 0);
  const pendingRevenue = revenues.filter(r => r.status === 'PENDING').reduce((sum, r) => sum + r.amount, 0);
  const thisMonthRevenue = revenues.filter(r => {
    const date = new Date(r.date);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">الإيرادات</h1>
        <p className="text-muted-foreground">تتبع إيراداتك من المستخدمين المسجلين بكودك</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRevenue} DH</div>
            <p className="text-xs text-muted-foreground">جميع الأوقات</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إيرادات مدفوعة</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paidRevenue} DH</div>
            <p className="text-xs text-muted-foreground">{revenues.filter(r => r.status === 'PAID').length} معاملة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">في الانتظار</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRevenue} DH</div>
            <p className="text-xs text-muted-foreground">{revenues.filter(r => r.status === 'PENDING').length} معاملة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">هذا الشهر</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{thisMonthRevenue} DH</div>
            <p className="text-xs text-muted-foreground">الشهر الحالي</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Table */}
      <Card>
        <CardHeader>
          <CardTitle>سجل الإيرادات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">المستخدم</TableHead>
                  <TableHead className="text-right">المبلغ</TableHead>
                  <TableHead className="text-right">التاريخ</TableHead>
                  <TableHead className="text-right">طريقة الدفع</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {revenues.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{record.userName}</div>
                        <div className="text-sm text-muted-foreground">{record.userEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-primary">{record.amount} DH</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{new Date(record.date).toLocaleDateString('ar-MA')}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{record.paymentMethod}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={record.status === 'PAID' ? 'bg-green-500' : 'bg-yellow-500'}>
                        {record.status === 'PAID' ? 'مدفوع' : 'في الانتظار'}
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
};

export default Revenues;
