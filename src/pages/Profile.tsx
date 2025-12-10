import { useState, useEffect } from 'react';
import { Camera, Edit, Save, Shield, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/authStore';
import { toast } from '@/hooks/use-toast';
import api from '@/lib/api';

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: user?.prenom || '',
    lastName: user?.nom || '',
    phoneNumber: user?.telephone || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.prenom || '',
        lastName: user.nom || '',
        phoneNumber: user.telephone || '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await api.put('/profile', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phoneNumber,
      });

      if (response.data.success) {
        // Update local store
        updateUser({
          prenom: formData.firstName,
          nom: formData.lastName,
          telephone: formData.phoneNumber,
        });
        setIsEditing(false);
        toast({ title: 'تم حفظ التغييرات بنجاح' });
      }
    } catch (error: unknown) {
      console.error('Error updating profile:', error);
      toast({ 
        title: 'خطأ', 
        description: 'حدث خطأ أثناء حفظ التغييرات',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    // Validate passwords
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast({ 
        title: 'خطأ', 
        description: 'الرجاء ملء جميع الحقول',
        variant: 'destructive'
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({ 
        title: 'خطأ', 
        description: 'كلمة المرور الجديدة غير متطابقة',
        variant: 'destructive'
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({ 
        title: 'خطأ', 
        description: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
        variant: 'destructive'
      });
      return;
    }

    try {
      setPasswordLoading(true);
      const response = await api.put('/profile/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (response.data.success) {
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        toast({ title: 'تم تغيير كلمة المرور بنجاح' });
      }
    } catch (error: unknown) {
      console.error('Error changing password:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      const errorMessage = axiosError.response?.data?.message || 'حدث خطأ أثناء تغيير كلمة المرور';
      toast({ 
        title: 'خطأ', 
        description: errorMessage === 'Current password is incorrect' ? 'كلمة المرور الحالية غير صحيحة' : errorMessage,
        variant: 'destructive'
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const planColors: Record<string, string> = {
    FREE: 'bg-gray-500 text-white',
    NORMAL: 'bg-blue-500 text-white',
    VIP: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white',
  };

  const planLabels: Record<string, string> = {
    FREE: 'مجاني',
    NORMAL: 'عادي',
    VIP: 'VIP',
  };

  const getPlanBadge = () => {
    if (user?.role === 'ADMIN') {
      return { colorClass: 'bg-red-500 text-white', label: 'مدير' };
    }
    if (user?.role === 'COMMERCIAL') {
      return { colorClass: 'bg-green-500 text-white', label: 'تجاري' };
    }
    const plan = user?.plan || 'FREE';
    const colorClass = planColors[plan] || planColors.FREE;
    const label = planLabels[plan] || planLabels.FREE;
    return { colorClass, label };
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="mb-8 shadow-custom-lg">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-hero flex items-center justify-center text-white text-4xl font-bold">
                  {user?.prenom?.[0]}{user?.nom?.[0]}
                </div>
                <Button
                  size="icon"
                  className="absolute bottom-0 left-0 rounded-full"
                  variant="secondary"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 text-center md:text-right">
                <div className="flex items-center justify-center md:justify-end gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{user?.prenom} {user?.nom}</h1>
                  <Badge className={getPlanBadge().colorClass}>{getPlanBadge().label}</Badge>
                </div>
                <p className="text-muted-foreground mb-2">{user?.email}</p>
                <p className="text-sm text-muted-foreground">
                  عضو منذ: {user?.dateInscription ? new Date(user.dateInscription).toLocaleDateString('ar-MA') : '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs - Only Personal Info and Security */}
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="w-full justify-start mb-6">
            <TabsTrigger value="info">المعلومات الشخصية</TabsTrigger>
            <TabsTrigger value="security">الأمان</TabsTrigger>
          </TabsList>

          {/* Personal Info */}
          <TabsContent value="info">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>المعلومات الشخصية</CardTitle>
                {isEditing ? (
                  <Button onClick={handleSave} size="sm" disabled={loading}>
                    {loading ? (
                      <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 ml-2" />
                    )}
                    حفظ
                  </Button>
                ) : (
                  <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                    <Edit className="h-4 w-4 ml-2" />
                    تعديل
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName">الاسم</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">اللقب</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ''}
                      disabled={true}
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground mt-1">لا يمكن تغيير البريد الإلكتروني</p>
                  </div>
                  <div>
                    <Label htmlFor="phoneNumber">رقم الهاتف</Label>
                    <Input
                      id="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security - Password Change Only */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  تغيير كلمة المرور
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-w-md">
                  <div>
                    <Label>كلمة المرور الحالية</Label>
                    <div className="relative">
                      <Input
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="text-right pl-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label>كلمة المرور الجديدة</Label>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="text-right pl-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label>تأكيد كلمة المرور</Label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="text-right pl-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <Button onClick={handleChangePassword} disabled={passwordLoading}>
                    {passwordLoading ? (
                      <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    ) : null}
                    تحديث كلمة المرور
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
