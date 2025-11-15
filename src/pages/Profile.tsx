import { useState } from 'react';
import { Camera, Edit, Save, Shield, Award, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuthStore } from '@/stores/authStore';
import { toast } from '@/hooks/use-toast';

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    prenom: user?.prenom || '',
    nom: user?.nom || '',
    email: user?.email || '',
    telephone: user?.telephone || '',
  });

  const handleSave = () => {
    updateUser(formData);
    setIsEditing(false);
    toast({ title: 'تم حفظ التغييرات بنجاح' });
  };

  const roleColors = {
    USER: 'bg-muted text-muted-foreground',
    COMMERCIAL: 'bg-blue-500 text-white',
    ADMIN: 'bg-destructive text-destructive-foreground',
  };

  const achievements = [
    { title: 'متعلم نشط', description: 'سجل دخول لمدة 7 أيام متتالية', icon: '🔥', earned: true },
    { title: 'النجم الصاعد', description: 'أكمل 5 فصول', icon: '⭐', earned: true },
    { title: 'المثابر', description: 'حقق 100% في 3 اختبارات', icon: '🏆', earned: false },
    { title: 'السريع', description: 'أكمل دورة في أقل من أسبوع', icon: '⚡', earned: false },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="mb-8 shadow-custom-lg">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-hero flex items-center justify-center text-white text-4xl font-bold">
                  {user?.prenom[0]}{user?.nom[0]}
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
                  <Badge className={roleColors[user!.role]}>{user?.role}</Badge>
                </div>
                <p className="text-muted-foreground mb-2">{user?.email}</p>
                <p className="text-sm text-muted-foreground">عضو منذ: {new Date(user!.dateInscription).toLocaleDateString('ar-MA')}</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">65%</div>
                <p className="text-sm text-muted-foreground">معدل الإنجاز</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="w-full justify-start mb-6">
            <TabsTrigger value="info">المعلومات الشخصية</TabsTrigger>
            <TabsTrigger value="subscription">الاشتراك</TabsTrigger>
            <TabsTrigger value="achievements">الإنجازات</TabsTrigger>
            <TabsTrigger value="security">الأمان</TabsTrigger>
          </TabsList>

          {/* Personal Info */}
          <TabsContent value="info">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>المعلومات الشخصية</CardTitle>
                {isEditing ? (
                  <Button onClick={handleSave} size="sm">
                    <Save className="h-4 w-4 ml-2" />
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
                    <Label htmlFor="prenom">الاسم</Label>
                    <Input
                      id="prenom"
                      value={formData.prenom}
                      onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="nom">اللقب</Label>
                    <Input
                      id="nom"
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="telephone">رقم الهاتف</Label>
                    <Input
                      id="telephone"
                      value={formData.telephone}
                      onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscription */}
          <TabsContent value="subscription">
            <Card>
              <CardHeader>
                <CardTitle>الاشتراك الحالي</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="bg-gradient-hero p-6 rounded-lg text-white">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-2xl font-bold mb-2">
                          {user?.role === 'ADMIN' ? 'حساب مدير' : user?.role === 'COMMERCIAL' ? 'حساب تجاري' : 'حساب مستخدم'}
                        </h3>
                        <p className="text-white/90">
                          حسابك نشط
                        </p>
                      </div>
                      <Badge className="bg-white/20 text-white">نشط</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-2 border-primary">
                      <CardContent className="pt-6">
                        <h4 className="text-xl font-bold mb-2">Premium</h4>
                        <p className="text-3xl font-bold text-primary mb-4">299 درهم/شهر</p>
                        <ul className="space-y-2 text-sm mb-6">
                          <li>✓ جميع الدورات</li>
                          <li>✓ 400 رصيد شهري</li>
                          <li>✓ شهادات معتمدة</li>
                        </ul>
                        <Button className="w-full">الترقية الآن</Button>
                      </CardContent>
                    </Card>
                    <Card className="border-2 border-secondary">
                      <CardContent className="pt-6">
                        <h4 className="text-xl font-bold mb-2">VIP</h4>
                        <p className="text-3xl font-bold text-secondary mb-4">599 درهم/شهر</p>
                        <ul className="space-y-2 text-sm mb-6">
                          <li>✓ كل مميزات Premium</li>
                          <li>✓ 1000 رصيد شهري</li>
                          <li>✓ مساعد صوتي</li>
                        </ul>
                        <Button className="w-full" variant="secondary">الترقية الآن</Button>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">سجل المدفوعات</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          { date: '2024-12-15', amount: 299, status: 'مكتمل' },
                          { date: '2024-11-15', amount: 299, status: 'مكتمل' },
                        ].map((payment, index) => (
                          <div key={index} className="flex justify-between items-center p-3 border border-border rounded-lg">
                            <div>
                              <p className="font-medium">{payment.amount} درهم</p>
                              <p className="text-sm text-muted-foreground">{payment.date}</p>
                            </div>
                            <Badge className="bg-success/10 text-success">{payment.status}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements */}
          <TabsContent value="achievements">
            <Card>
              <CardHeader>
                <CardTitle>الإنجازات والشارات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements.map((achievement, index) => (
                    <Card key={index} className={achievement.earned ? 'border-primary' : 'opacity-60'}>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div className="text-4xl">{achievement.icon}</div>
                          <div className="flex-1">
                            <h4 className="font-bold mb-1">{achievement.title}</h4>
                            <p className="text-sm text-muted-foreground">{achievement.description}</p>
                            {achievement.earned && (
                              <Badge className="mt-2 bg-success text-white">مكتسبة</Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>الأمان والخصوصية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-4">تغيير كلمة المرور</h4>
                    <div className="space-y-4 max-w-md">
                      <div>
                        <Label>كلمة المرور الحالية</Label>
                        <Input type="password" placeholder="••••••••" />
                      </div>
                      <div>
                        <Label>كلمة المرور الجديدة</Label>
                        <Input type="password" placeholder="••••••••" />
                      </div>
                      <div>
                        <Label>تأكيد كلمة المرور</Label>
                        <Input type="password" placeholder="••••••••" />
                      </div>
                      <Button>تحديث كلمة المرور</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
