import { HelpCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function FAQ() {
  const faqs = [
    {
      question: 'كيف يمكنني البدء في تعلم اللغة الفرنسية؟',
      answer: 'يمكنك البدء بإنشاء حساب مجاني والتسجيل في الدورات المجانية المتاحة. ننصح بالبدء بدورة المستوى A1 للمبتدئين.',
    },
    {
      question: 'ما الفرق بين الحساب المجاني والمدفوع؟',
      answer: 'الحساب المجاني يمنحك الوصول إلى الدورات الأساسية، بينما الحساب المدفوع (Premium/VIP) يوفر الوصول إلى جميع الدورات، المحتوى الحصري، والدعم المباشر من المعلمين.',
    },
    {
      question: 'هل الشهادات معتمدة؟',
      answer: 'نعم، جميع الشهادات التي نصدرها معتمدة ومعترف بها. يمكنك إضافتها إلى سيرتك الذاتية أو ملفك الشخصي على LinkedIn.',
    },
    {
      question: 'كم من الوقت يستغرق إكمال دورة؟',
      answer: 'يعتمد ذلك على وتيرة تعلمك الشخصية. في المتوسط، تستغرق كل دورة من 20 إلى 40 ساعة من التعلم النشط.',
    },
    {
      question: 'هل يمكنني الوصول إلى الدورات من الهاتف المحمول؟',
      answer: 'نعم، المنصة متوافقة تماماً مع جميع الأجهزة بما في ذلك الهواتف الذكية والأجهزة اللوحية.',
    },
    {
      question: 'ماذا لو لم أكن راضياً عن الدورة؟',
      answer: 'نقدم ضمان استرداد الأموال خلال 14 يوماً من الشراء إذا لم تكن راضياً عن الدورة.',
    },
    {
      question: 'هل هناك دعم فني متاح؟',
      answer: 'نعم، فريق الدعم الفني متاح على مدار الساعة للإجابة على جميع استفساراتك عبر البريد الإلكتروني أو الدردشة المباشرة.',
    },
    {
      question: 'كيف أتواصل مع المعلمين؟',
      answer: 'يمكنك التواصل مع المعلمين من خلال نظام الرسائل الداخلي أو في قسم التعليقات في كل درس.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-hero py-16 mb-12">
        <div className="container mx-auto px-4 text-center">
          <HelpCircle className="h-16 w-16 text-white mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-white mb-4">الأسئلة الشائعة</h1>
          <p className="text-white/90 max-w-2xl mx-auto">
            إجابات على الأسئلة الأكثر شيوعاً حول منصتنا
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12">
        <Card className="max-w-4xl mx-auto shadow-custom-lg">
          <CardHeader>
            <CardTitle>أسئلة وأجوبة</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-right hover:text-primary">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Still Have Questions */}
        <Card className="max-w-4xl mx-auto mt-8 bg-gradient-hero text-white">
          <CardContent className="pt-6 text-center">
            <h3 className="text-2xl font-bold mb-2">لا تزال لديك أسئلة؟</h3>
            <p className="mb-6 text-white/90">
              لا تتردد في التواصل معنا عبر البريد الإلكتروني
            </p>
            <a href="mailto:contact@bclt.ma" className="inline-block">
              <button className="btn-hero-outline">
                contact@bclt.ma
              </button>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
