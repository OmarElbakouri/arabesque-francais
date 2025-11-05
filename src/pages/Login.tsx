import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuthStore } from '@/stores/authStore';
import { toast } from '@/hooks/use-toast';

export default function Login() {
  const [error, setError] = useState('');
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
        navigate('/dashboard');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero py-12 px-4">
      <Card className="w-full max-w-md shadow-custom-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gradient">تسجيل الدخول</CardTitle>
          <CardDescription>أدخل بياناتك للوصول إلى حسابك</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              <Label htmlFor="password">كلمة المرور</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pr-10"
                  {...register('password', { required: 'كلمة المرور مطلوبة' })}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-destructive mt-1">{errors.password.message as string}</p>
              )}
            </div>

            <div className="flex justify-between items-center">
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                نسيت كلمة المرور؟
              </Link>
            </div>

            <Button type="submit" className="w-full btn-hero">
              تسجيل الدخول
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">ليس لديك حساب؟ </span>
            <Link to="/register" className="text-primary hover:underline font-medium">
              إنشاء حساب جديد
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
