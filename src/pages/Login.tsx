import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, AlertCircle, Home, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuthStore } from '@/stores/authStore';
import { toast } from '@/hooks/use-toast';

export default function Login() {
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const onSubmit = async (data: any) => {
    try {
      setError('');
      await login(data.email, data.password);
      toast({
        title: 'مرحباً بك!',
        description: 'تم تسجيل الدخول بنجاح',
      });

      // Redirect based on role
      const authState = useAuthStore.getState();
      if (authState.user?.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/courses');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
      setError(errorMessage);
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
          {/* Logo placeholder with animation */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-gold transform hover:scale-110 transition-transform duration-300">
                <Lock className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-secondary rounded-full animate-pulse"></div>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-gradient">تسجيل الدخول</CardTitle>
          <CardDescription className="text-base">أدخل بياناتك للوصول إلى حسابك</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              <Label htmlFor="password" className="text-sm font-medium">كلمة المرور</Label>
              <div className="relative group">
                <Lock className="absolute right-3 top-3 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pr-10 pl-10 transition-all duration-300 focus:ring-2 focus:ring-primary/20 border-border hover:border-primary/50"
                  {...register('password', { required: 'كلمة المرور مطلوبة' })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-3 h-5 w-5 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive mt-1 animate-fade-in">{errors.password.message as string}</p>
              )}
            </div>

            <div className="flex justify-between items-center">
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                نسيت كلمة المرور؟
              </Link>
            </div>

            <Button type="submit" className="w-full btn-hero relative overflow-hidden group">
              <span className="relative z-10">تسجيل الدخول</span>
              <div className="absolute inset-0 bg-gradient-to-r from-secondary to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-muted-foreground text-sm">ليس لديك حساب؟</span>
            <Link to="/register" className="block mt-3">
              <Button
                variant="outline"
                className="w-full border-2 border-primary/50 hover:border-primary hover:bg-primary/5 text-primary font-bold py-5 transition-all duration-300 hover:scale-[1.02]"
              >
                إنشاء حساب جديد
              </Button>
            </Link>
          </div>

          {/* Bottom decoration */}
          <div className="flex justify-center gap-2 mt-4 pb-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>

          {/* Home button */}
          <div className="mt-4 text-center">
            <Link to="/home">
              <Button variant="outline" className="gap-2 hover:bg-primary/10 transition-colors">
                <Home className="w-4 h-4" />
                <span>العودة إلى الصفحة الرئيسية</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
