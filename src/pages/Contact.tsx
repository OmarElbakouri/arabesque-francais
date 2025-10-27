import { useForm } from 'react-hook-form';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

export default function Contact() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = (data: any) => {
    toast({
      title: 'تم إرسال رسالتك!',
      description: 'سنتواصل معك في أقرب وقت ممكن',
    });
    reset();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-hero py-16 mb-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">اتصل بنا</h1>
          <p className="text-white/90 max-w-2xl mx-auto">
            نحن هنا للإجابة على جميع استفساراتك ومساعدتك
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Contact Info */}
          <div className="space-y-6">
            <Card className="card-elevated">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">البريد الإلكتروني</h3>
                    <p className="text-muted-foreground text-sm">info@bclt.ma</p>
                    <p className="text-muted-foreground text-sm">support@bclt.ma</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-elevated">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="bg-secondary/10 p-3 rounded-lg">
                    <Phone className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">الهاتف</h3>
                    <p className="text-muted-foreground text-sm">+212 5XX-XXXXXX</p>
                    <p className="text-muted-foreground text-sm">الإثنين - الجمعة: 9:00 - 18:00</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-elevated">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="bg-info/10 p-3 rounded-lg">
                    <MapPin className="h-6 w-6 text-info" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">العنوان</h3>
                    <p className="text-muted-foreground text-sm">
                      الدار البيضاء، المغرب
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-custom-lg">
              <CardHeader>
                <CardTitle>أرسل لنا رسالة</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">الاسم الكامل *</Label>
                      <Input
                        id="name"
                        placeholder="اسمك"
                        {...register('name', { required: 'الاسم مطلوب' })}
                      />
                      {errors.name && (
                        <p className="text-sm text-destructive mt-1">{errors.name.message as string}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="email">البريد الإلكتروني *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="email@exemple.com"
                        {...register('email', { required: 'البريد الإلكتروني مطلوب' })}
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive mt-1">{errors.email.message as string}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">رقم الهاتف</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+212 6XX-XXXXXX"
                      {...register('phone')}
                    />
                  </div>

                  <div>
                    <Label htmlFor="subject">الموضوع *</Label>
                    <Input
                      id="subject"
                      placeholder="موضوع رسالتك"
                      {...register('subject', { required: 'الموضوع مطلوب' })}
                    />
                    {errors.subject && (
                      <p className="text-sm text-destructive mt-1">{errors.subject.message as string}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="message">الرسالة *</Label>
                    <Textarea
                      id="message"
                      placeholder="اكتب رسالتك هنا..."
                      rows={6}
                      {...register('message', { required: 'الرسالة مطلوبة' })}
                    />
                    {errors.message && (
                      <p className="text-sm text-destructive mt-1">{errors.message.message as string}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full btn-hero">
                    <Send className="mr-2 h-4 w-4" />
                    إرسال الرسالة
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
