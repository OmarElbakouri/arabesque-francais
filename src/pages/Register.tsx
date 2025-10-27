import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, User, Phone, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuthStore } from '@/stores/authStore';
import { toast } from '@/hooks/use-toast';

export default function Register() {
  const [error, setError] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const { register: registerUser } = useAuthStore();
  const navigate = useNavigate();

  const password = watch('password');

  const onSubmit = async (data: any) => {
    if (!acceptTerms) {
      setError('يجب الموافقة على الشروط والأحكام');
      return;
    }

    try {
      setError('');
      await registerUser(data);
      toast({
        title: 'مرحباً بك!',
        description: 'تم إنشاء حسابك بنجاح',
      });
      navigate('/dashboard');
    } catch (err) {
      setError('حدث خطأ أثناء إنشاء الحساب');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero py-12 px-4">
      <Card className="w-full max-w-md shadow-custom-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gradient">إنشاء حساب جديد</CardTitle>
          <CardDescription>انضم إلينا وابدأ رحلتك في تعلم الفرنسية</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="prenom">الاسم</Label>
                <Input
                  id="prenom"
                  placeholder="الاسم"
                  {...register('prenom', { required: 'الاسم مطلوب' })}
                />
                {errors.prenom && (
                  <p className="text-sm text-destructive mt-1">{errors.prenom.message as string}</p>
                )}
              </div>
              <div>
                <Label htmlFor="nom">اللقب</Label>
                <Input
                  id="nom"
                  placeholder="اللقب"
                  {...register('nom', { required: 'اللقب مطلوب' })}
                />
                {errors.nom && (
                  <p className="text-sm text-destructive mt-1">{errors.nom.message as string}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <div className="relative">
                <Mail className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="exemple@email.com"
                  className="pr-10"
                  {...register('email', { required: 'البريد الإلكتروني مطلوب' })}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive mt-1">{errors.email.message as string}</p>
              )}
            </div>

            <div>
              <Label htmlFor="telephone">رقم الهاتف</Label>
              <div className="relative">
                <Phone className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="telephone"
                  type="tel"
                  placeholder="+212 6XX-XXXXXX"
                  className="pr-10"
                  {...register('telephone', { required: 'رقم الهاتف مطلوب' })}
                />
              </div>
              {errors.telephone && (
                <p className="text-sm text-destructive mt-1">{errors.telephone.message as string}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">كلمة المرور</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pr-10"
                  {...register('password', {
                    required: 'كلمة المرور مطلوبة',
                    minLength: { value: 8, message: 'يجب أن تكون 8 أحرف على الأقل' }
                  })}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-destructive mt-1">{errors.password.message as string}</p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className="pr-10"
                  {...register('confirmPassword', {
                    required: 'تأكيد كلمة المرور مطلوب',
                    validate: value => value === password || 'كلمات المرور غير متطابقة'
                  })}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive mt-1">{errors.confirmPassword.message as string}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Checkbox id="terms" checked={acceptTerms} onCheckedChange={(checked) => setAcceptTerms(checked as boolean)} />
              <label htmlFor="terms" className="text-sm">
                أوافق على <Link to="/terms" className="text-primary hover:underline">الشروط والأحكام</Link>
              </label>
            </div>

            <Button type="submit" className="w-full btn-hero">
              إنشاء الحساب
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">لديك حساب بالفعل؟ </span>
            <Link to="/login" className="text-primary hover:underline font-medium">
              تسجيل الدخول
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
