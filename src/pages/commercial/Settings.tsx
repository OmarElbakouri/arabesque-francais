import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';
import { Settings as SettingsIcon, Key, User } from 'lucide-react';

const Settings = () => {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: 'خطأ',
        description: 'كلمات المرور غير متطابقة',
        variant: 'destructive',
      });
      return;
    }

    // Mock password change - sera remplacé par appel API
    toast({
      title: 'تم تحديث كلمة المرور',
      description: 'تم تغيير كلمة المرور بنجاح',
    });

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">الإعدادات</h1>
        <p className="text-muted-foreground">إدارة إعدادات حسابك</p>
      </div>

      {/* Profile Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            معلومات الحساب
          </CardTitle>
          <CardDescription>معلوماتك الشخصية</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>الاسم الأول</Label>
              <Input value={user?.prenom || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label>الاسم الأخير</Label>
              <Input value={user?.nom || ''} disabled />
            </div>
          </div>
          <div className="space-y-2">
            <Label>البريد الإلكتروني</Label>
            <Input value={user?.email || ''} disabled />
          </div>
          <div className="space-y-2">
            <Label>رقم الهاتف</Label>
            <Input value={user?.telephone || ''} disabled />
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            تغيير كلمة المرور
          </CardTitle>
          <CardDescription>تحديث كلمة المرور الخاصة بك</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">كلمة المرور الحالية</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">كلمة المرور الجديدة</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">تأكيد كلمة المرور</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit">
              تحديث كلمة المرور
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Promo Code Info */}
      <Card className="bg-gradient-to-br from-primary/10 to-secondary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            كود البروموشن
          </CardTitle>
          <CardDescription>كودك الترويجي الخاص</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">شارك هذا الكود مع العملاء</p>
              <p className="text-3xl font-bold text-primary">COMM2025</p>
            </div>
            <Button onClick={() => navigator.clipboard.writeText('COMM2025')}>
              نسخ الكود
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
