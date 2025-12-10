import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Phone, Lock, ArrowLeft, CheckCircle, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import api from '@/lib/api';

type Step = 'phone' | 'code' | 'newPassword' | 'success';

export default function ForgotPassword() {
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const navigate = useNavigate();

  // Step 1: Send SMS code
  const handleSendCode = async (data: any) => {
    try {
      setLoading(true);
      setError('');
      const phoneNumber = data.phone.startsWith('+') ? data.phone : `+212${data.phone.replace(/^0/, '')}`;
      setPhone(phoneNumber);
      
      await api.post('/auth/forgot-password/send-sms', { phone: phoneNumber });
      
      toast({
        title: 'تم إرسال الرمز',
        description: 'تم إرسال رمز التحقق إلى هاتفك',
      });
      setStep('code');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'فشل إرسال الرمز. تحقق من رقم الهاتف';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify code
  const handleVerifyCode = async (data: any) => {
    try {
      setLoading(true);
      setError('');
      
      await api.post('/auth/forgot-password/verify-code', { 
        phone, 
        code: data.code 
      });
      
      toast({
        title: 'تم التحقق',
        description: 'رمز التحقق صحيح',
      });
      setStep('newPassword');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'رمز التحقق غير صحيح أو منتهي الصلاحية';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset password
  const handleResetPassword = async (data: any) => {
    if (data.newPassword !== data.confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      await api.post('/auth/forgot-password/reset', { 
        phone, 
        code: data.code,
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

  // Resend code
  const handleResendCode = async () => {
    try {
      setLoading(true);
      setError('');
      
      await api.post('/auth/forgot-password/send-sms', { phone });
      
      toast({
        title: 'تم إعادة الإرسال',
        description: 'تم إرسال رمز جديد إلى هاتفك',
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'فشل إعادة إرسال الرمز';
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
                ) : (
                  <KeyRound className="w-10 h-10 text-white" />
                )}
              </div>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-gradient">
            {step === 'phone' && 'نسيت كلمة المرور؟'}
            {step === 'code' && 'أدخل رمز التحقق'}
            {step === 'newPassword' && 'كلمة مرور جديدة'}
            {step === 'success' && 'تم بنجاح!'}
          </CardTitle>
          <CardDescription className="text-base">
            {step === 'phone' && 'أدخل رقم هاتفك لاستلام رمز التحقق'}
            {step === 'code' && `تم إرسال رمز إلى ${phone}`}
            {step === 'newPassword' && 'أدخل كلمة المرور الجديدة'}
            {step === 'success' && 'تم تغيير كلمة المرور بنجاح'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Step 1: Phone Input */}
          {step === 'phone' && (
            <form onSubmit={handleSubmit(handleSendCode)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">رقم الهاتف</Label>
                <div className="relative group">
                  <Phone className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="0612345678"
                    className="pr-10"
                    dir="ltr"
                    {...register('phone', { 
                      required: 'رقم الهاتف مطلوب',
                      pattern: {
                        value: /^(\+212|0)?[5-7][0-9]{8}$/,
                        message: 'رقم الهاتف غير صالح'
                      }
                    })}
                  />
                </div>
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone.message as string}</p>
                )}
                <p className="text-xs text-muted-foreground">مثال: 0612345678 أو +212612345678</p>
              </div>

              <Button type="submit" className="w-full btn-hero" disabled={loading}>
                {loading ? 'جاري الإرسال...' : 'إرسال رمز التحقق'}
              </Button>
            </form>
          )}

          {/* Step 2: Code Verification */}
          {step === 'code' && (
            <form onSubmit={handleSubmit(handleVerifyCode)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code" className="text-sm font-medium">رمز التحقق</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  className="text-center text-2xl tracking-widest"
                  dir="ltr"
                  {...register('code', { 
                    required: 'رمز التحقق مطلوب',
                    minLength: { value: 6, message: 'الرمز يجب أن يكون 6 أرقام' },
                    maxLength: { value: 6, message: 'الرمز يجب أن يكون 6 أرقام' }
                  })}
                />
                {errors.code && (
                  <p className="text-sm text-destructive">{errors.code.message as string}</p>
                )}
              </div>

              <Button type="submit" className="w-full btn-hero" disabled={loading}>
                {loading ? 'جاري التحقق...' : 'تحقق من الرمز'}
              </Button>

              <Button 
                type="button" 
                variant="ghost" 
                className="w-full" 
                onClick={handleResendCode}
                disabled={loading}
              >
                إعادة إرسال الرمز
              </Button>
            </form>
          )}

          {/* Step 3: New Password */}
          {step === 'newPassword' && (
            <form onSubmit={handleSubmit(handleResetPassword)} className="space-y-4">
              <input type="hidden" {...register('code')} value={watch('code')} />
              
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
                      required: 'تأكيد كلمة المرور مطلوب'
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

          {/* Step 4: Success */}
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

          {/* Back to login link */}
          {step !== 'success' && (
            <div className="mt-6 text-center">
              <Link to="/login" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" />
                العودة لتسجيل الدخول
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
