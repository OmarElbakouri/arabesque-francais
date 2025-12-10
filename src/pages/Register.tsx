import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, User, Phone, AlertCircle, Tag } from 'lucide-react';
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
      // Si le code promo est vide, ne pas l'envoyer
      const payload = { ...data };
      if (!payload.promoCode || payload.promoCode.trim() === '') {
        delete payload.promoCode;
      }
      
      await registerUser(payload);
      toast({
        title: 'مرحباً بك!',
        description: 'تم إنشاء حسابك بنجاح',
      });
      navigate('/courses');
    } catch (err) {
      setError('حدث خطأ أثناء إنشاء الحساب');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[hsl(210,35%,96%)] via-background to-[hsl(42,45%,97%)] py-12 px-4 relative overflow-hidden">
      {/* Animated floating shapes */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent/5 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>
      
      <Card className="w-full max-w-md shadow-2xl border-0 backdrop-blur-sm bg-white/95 relative z-10 animate-fade-in overflow-hidden">
        {/* Top decorative bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary"></div>
        <CardHeader className="text-center space-y-4 pt-8">
          {/* Logo with animation */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-gold transform hover:rotate-12 transition-transform duration-300">
                <User className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -bottom-1 -left-1 w-6 h-6 bg-primary rounded-full animate-pulse"></div>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-gradient">إنشاء حساب جديد</CardTitle>
          <CardDescription className="text-base">انضم إلينا وابدأ رحلتك في تعلم الفرنسية</CardDescription>
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
              <div className="space-y-2">
                <Label htmlFor="prenom" className="text-sm font-medium">الاسم</Label>
                <Input
                  id="prenom"
                  placeholder="الاسم"
                  className="transition-all duration-300 focus:ring-2 focus:ring-primary/20 border-border hover:border-primary/50"
                  {...register('prenom', { required: 'الاسم مطلوب' })}
                />
                {errors.prenom && (
                  <p className="text-sm text-destructive mt-1 animate-fade-in">{errors.prenom.message as string}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="nom" className="text-sm font-medium">اللقب</Label>
                <Input
                  id="nom"
                  placeholder="اللقب"
                  className="transition-all duration-300 focus:ring-2 focus:ring-primary/20 border-border hover:border-primary/50"
                  {...register('nom', { required: 'اللقب مطلوب' })}
                />
                {errors.nom && (
                  <p className="text-sm text-destructive mt-1 animate-fade-in">{errors.nom.message as string}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">البريد الإلكتروني</Label>
              <div className="relative group">
                <Mail className="absolute right-3 top-3 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  id="email"
                  type="email"
                  placeholder="exemple@email.com"
                  className="pr-10 transition-all duration-300 focus:ring-2 focus:ring-primary/20 border-border hover:border-primary/50"
                  {...register('email', { required: 'البريد الإلكتروني مطلوب' })}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive mt-1 animate-fade-in">{errors.email.message as string}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="telephone" className="text-sm font-medium">رقم الهاتف</Label>
              <div className="relative group">
                <Phone className="absolute right-3 top-3 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  id="telephone"
                  type="tel"
                  placeholder="+212 6XX-XXXXXX"
                  className="pr-10 transition-all duration-300 focus:ring-2 focus:ring-primary/20 border-border hover:border-primary/50"
                  {...register('telephone', { required: 'رقم الهاتف مطلوب' })}
                />
              </div>
              {errors.telephone && (
                <p className="text-sm text-destructive mt-1 animate-fade-in">{errors.telephone.message as string}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="promoCode" className="text-sm font-medium">كود البرومو <span className="text-muted-foreground text-xs">(اختياري)</span></Label>
              <div className="relative group">
                <Tag className="absolute right-3 top-3 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-secondary" />
                <Input
                  id="promoCode"
                  type="text"
                  placeholder="أدخل كود البرومو"
                  className="pr-10 transition-all duration-300 focus:ring-2 focus:ring-secondary/20 border-border hover:border-secondary/50 uppercase"
                  {...register('promoCode')}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase();
                    e.target.value = value;
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">Codes actifs : OMAR2025, SALES2025</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">كلمة المرور</Label>
              <div className="relative group">
                <Lock className="absolute right-3 top-3 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pr-10 transition-all duration-300 focus:ring-2 focus:ring-primary/20 border-border hover:border-primary/50"
                  {...register('password', {
                    required: 'كلمة المرور مطلوبة',
                    minLength: { value: 8, message: 'يجب أن تكون 8 أحرف على الأقل' }
                  })}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-destructive mt-1 animate-fade-in">{errors.password.message as string}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">تأكيد كلمة المرور</Label>
              <div className="relative group">
                <Lock className="absolute right-3 top-3 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className="pr-10 transition-all duration-300 focus:ring-2 focus:ring-primary/20 border-border hover:border-primary/50"
                  {...register('confirmPassword', {
                    required: 'تأكيد كلمة المرور مطلوب',
                    validate: value => value === password || 'كلمات المرور غير متطابقة'
                  })}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive mt-1 animate-fade-in">{errors.confirmPassword.message as string}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Checkbox id="terms" checked={acceptTerms} onCheckedChange={(checked) => setAcceptTerms(checked as boolean)} />
              <label htmlFor="terms" className="text-sm">
                أوافق على <Link to="/terms" className="text-primary hover:underline">الشروط والأحكام</Link>
              </label>
            </div>

            <Button type="submit" className="w-full btn-hero relative overflow-hidden group">
              <span className="relative z-10">إنشاء الحساب</span>
              <div className="absolute inset-0 bg-gradient-to-r from-secondary to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">لديك حساب بالفعل؟ </span>
            <Link to="/login" className="text-primary hover:underline font-medium link-animated">
              تسجيل الدخول
            </Link>
          </div>
          
          {/* Bottom decoration */}
          <div className="flex justify-center gap-2 mt-4 pb-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
