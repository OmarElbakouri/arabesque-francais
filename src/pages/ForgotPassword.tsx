import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, ArrowLeft, CheckCircle, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import api from '@/lib/api';

type Step = 'email' | 'sent';

export default function ForgotPassword() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm();

  // Send reset email
  const handleSendEmail = async (data: any) => {
    try {
      setLoading(true);
      setError('');
      const userEmail = data.email.trim().toLowerCase();
      setEmail(userEmail);
      
      await api.post('/auth/forgot-password/send-email', { email: userEmail });
      
      toast({
        title: 'تم إرسال البريد',
        description: 'تحقق من بريدك الإلكتروني لإعادة تعيين كلمة المرور',
      });
      setStep('sent');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'فشل إرسال البريد الإلكتروني. حاول مرة أخرى';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Resend email
  const handleResendEmail = async () => {
    try {
      setLoading(true);
      setError('');
      
      await api.post('/auth/forgot-password/send-email', { email });
      
      toast({
        title: 'تم إعادة الإرسال',
        description: 'تم إرسال رابط جديد إلى بريدك الإلكتروني',
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'فشل إعادة إرسال البريد';
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
                {step === 'sent' ? (
                  <CheckCircle className="w-10 h-10 text-white" />
                ) : (
                  <KeyRound className="w-10 h-10 text-white" />
                )}
              </div>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-gradient">
            {step === 'email' && 'نسيت كلمة المرور؟'}
            {step === 'sent' && 'تحقق من بريدك الإلكتروني'}
          </CardTitle>
          <CardDescription className="text-base">
            {step === 'email' && 'أدخل بريدك الإلكتروني لاستلام رابط إعادة التعيين'}
            {step === 'sent' && `تم إرسال رابط إعادة التعيين إلى ${email}`}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Step 1: Email Input */}
          {step === 'email' && (
            <form onSubmit={handleSubmit(handleSendEmail)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">البريد الإلكتروني</Label>
                <div className="relative group">
                  <Mail className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    className="pr-10"
                    dir="ltr"
                    {...register('email', { 
                      required: 'البريد الإلكتروني مطلوب',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'البريد الإلكتروني غير صالح'
                      }
                    })}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message as string}</p>
                )}
              </div>

              <Button type="submit" className="w-full btn-hero" disabled={loading}>
                {loading ? 'جاري الإرسال...' : 'إرسال رابط إعادة التعيين'}
              </Button>
            </form>
          )}

          {/* Step 2: Email Sent Confirmation */}
          {step === 'sent' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-muted-foreground">
                إذا كان هناك حساب مرتبط بهذا البريد الإلكتروني، ستتلقى رابطًا لإعادة تعيين كلمة المرور.
              </p>
              <p className="text-sm text-muted-foreground">
                ⏰ الرابط صالح لمدة ساعة واحدة
              </p>
              
              <Button 
                type="button" 
                variant="ghost" 
                className="w-full" 
                onClick={handleResendEmail}
                disabled={loading}
              >
                {loading ? 'جاري إعادة الإرسال...' : 'إعادة إرسال الرابط'}
              </Button>

              <Button onClick={() => window.location.href = '/login'} className="w-full btn-hero">
                العودة لتسجيل الدخول
              </Button>
            </div>
          )}

          {/* Back to login link */}
          {step === 'email' && (
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
