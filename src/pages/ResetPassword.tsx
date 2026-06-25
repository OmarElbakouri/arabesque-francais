import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Lock, CheckCircle, KeyRound, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import api from '@/lib/api';

type Step = 'validating' | 'newPassword' | 'success' | 'invalid';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [step, setStep] = useState<Step>('validating');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const navigate = useNavigate();

  // Validate token on page load
  useEffect(() => {
    if (!token) {
      setStep('invalid');
      return;
    }

    const validateToken = async () => {
      try {
        const response = await api.post('/auth/forgot-password/validate-token', { token });
        if (response.data?.data?.valid) {
          setStep('newPassword');
        } else {
          setStep('invalid');
        }
      } catch {
        setStep('invalid');
      }
    };

    validateToken();
  }, [token]);

  // Reset password
  const handleResetPassword = async (data: any) => {
    if (data.newPassword !== data.confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      await api.post('/auth/forgot-password/reset', { 
        token,
        newPassword: data.newPassword 
      });
      
      toast({
        title: 'تم تغيير كلمة المرور',
        description: 'يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة',
      });
      setStep('success');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'فشل تغيير كلمة المرور';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[hsl(210,35%,96%)] via-background to-[hsl(42,45%,97%)] py-12 px-4 relative overflow-hidden">
      {/* Animated floating shapes */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      
      <Card className="w-full max-w-md shadow-2xl border-0 backdrop-blur-sm bg-white/95 relative z-10 animate-fade-in overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary"></div>
        
        <CardHeader className="text-center space-y-4 pt-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-gold">
                {step === 'success' ? (
                  <CheckCircle className="w-10 h-10 text-white" />
                ) : step === 'invalid' ? (
                  <XCircle className="w-10 h-10 text-white" />
                ) : (
                  <KeyRound className="w-10 h-10 text-white" />
                )}
              </div>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-gradient">
            {step === 'validating' && 'جاري التحقق...'}
            {step === 'newPassword' && 'كلمة مرور جديدة'}
            {step === 'success' && 'تم بنجاح!'}
            {step === 'invalid' && 'رابط غير صالح'}
          </CardTitle>
          <CardDescription className="text-base">
            {step === 'validating' && 'يرجى الانتظار بينما نتحقق من الرابط'}
            {step === 'newPassword' && 'أدخل كلمة المرور الجديدة'}
            {step === 'success' && 'تم تغيير كلمة المرور بنجاح'}
            {step === 'invalid' && 'الرابط منتهي الصلاحية أو غير صالح'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Validating state */}
          {step === 'validating' && (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-muted-foreground mt-4">جاري التحقق من الرابط...</p>
            </div>
          )}

          {/* New Password Form */}
          {step === 'newPassword' && (
            <form onSubmit={handleSubmit(handleResetPassword)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm font-medium">كلمة المرور الجديدة</Label>
                <div className="relative group">
                  <Lock className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="••••••••"
                    className="pr-10"
                    {...register('newPassword', { 
                      required: 'كلمة المرور مطلوبة',
                      minLength: { value: 6, message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }
                    })}
                  />
                </div>
                {errors.newPassword && (
                  <p className="text-sm text-destructive">{errors.newPassword.message as string}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">تأكيد كلمة المرور</Label>
                <div className="relative group">
                  <Lock className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    className="pr-10"
                    {...register('confirmPassword', { 
                      required: 'تأكيد كلمة المرور مطلوب',
                      validate: (value: string) => value === watch('newPassword') || 'كلمات المرور غير متطابقة'
                    })}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword.message as string}</p>
                )}
              </div>

              <Button type="submit" className="w-full btn-hero" disabled={loading}>
                {loading ? 'جاري التغيير...' : 'تغيير كلمة المرور'}
              </Button>
            </form>
          )}

          {/* Success */}
          {step === 'success' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-muted-foreground">يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة</p>
              <Button onClick={() => navigate('/login')} className="w-full btn-hero">
                تسجيل الدخول
              </Button>
            </div>
          )}

          {/* Invalid/Expired Token */}
          {step === 'invalid' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <p className="text-muted-foreground">
                هذا الرابط منتهي الصلاحية أو تم استخدامه بالفعل.
                <br />
                يرجى طلب رابط جديد.
              </p>
              <Button onClick={() => navigate('/forgot-password')} className="w-full btn-hero">
                طلب رابط جديد
              </Button>
              <Button onClick={() => navigate('/login')} variant="ghost" className="w-full">
                العودة لتسجيل الدخول
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
