import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, BookOpen, Target, Award, Users, Play, Check, Star, MessageCircle, Lightbulb, Video, UserCheck, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import professorImg from "@/assets/professor.jpg";
import logoImg from "@/assets/logo.jpg";

const Index = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/90 backdrop-blur-md shadow-sm z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logoImg} alt="BCLT Logo" className="h-12 w-12 object-contain" />
              <div>
                <h1 className="text-xl font-bold text-primary">BCLT</h1>
                <p className="text-xs text-muted-foreground">تعلم الفرنسية بسهولة</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#features" className="link-animated text-foreground hover:text-primary font-medium">المميزات</a>
              <a href="#courses" className="link-animated text-foreground hover:text-primary font-medium">الدورات</a>
              <a href="#pricing" className="link-animated text-foreground hover:text-primary font-medium">الأسعار</a>
              <a href="#faq" className="link-animated text-foreground hover:text-primary font-medium">الأسئلة الشائعة</a>
            </nav>
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" className="font-medium">تسجيل الدخول</Button>
              </Link>
              <Link to="/register">
                <Button className="btn-hero text-sm">ابدأ مجاناً</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <div className="inline-block mb-4">
                <span className="badge-secondary">🎓 منصة تعليمية متكاملة</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-black mb-6 leading-tight">
                أتقن اللغة الفرنسية
                <span className="text-gradient block">من الصفر إلى الاحتراف</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                تعلم اللغة الفرنسية بأسلوب عصري وتفاعلي مع أفضل المدربين. دروس فيديو، تمارين تفاعلية، وذكاء اصطناعي لمساعدتك في كل خطوة.
              </p>
              <div className="flex flex-wrap gap-4 mb-8">
                <Link to="/subject-selection">
                  <Button size="lg" className="btn-hero">
                    <Play className="ml-2 h-5 w-5" />
                    ابدأ التعلم الآن
                  </Button>
                </Link>
                <Link to="/courses">
                  <Button size="lg" variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-white font-bold">
                    <BookOpen className="ml-2 h-5 w-5" />
                    تصفح الدورات
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-8 text-sm">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-success" />
                  <span className="font-medium">أكثر من 15000 طالب</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-success" />
                  <span className="font-medium">شهادات معتمدة</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-success" />
                  <span className="font-medium">دعم 24/7</span>
                </div>
              </div>
            </div>
            <div className="relative animate-float">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl blur-3xl"></div>
              <img 
                src={professorImg} 
                alt="Professor" 
                className="relative rounded-3xl shadow-custom-lg w-full max-w-md mx-auto"
              />
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-gold p-4 card-elevated">
                <div className="flex items-center gap-3">
                  <div className="bg-secondary/10 rounded-full p-3">
                    <Star className="h-6 w-6 text-secondary fill-current" />
                  </div>
                  <div>
                    <p className="font-bold text-lg">4.9/5</p>
                    <p className="text-sm text-muted-foreground">تقييم الطلاب</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Stages Path */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-black mb-4">
              طريقك لإتقان <span className="text-gradient">التواصل باللغة الفرنسية</span>
            </h2>
            <p className="text-2xl font-bold text-primary mb-2">عبر 3 مراحل</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                stage: "المرحلة 1",
                icon: Lightbulb,
                title: "ضبط القواعد اللغوية والتدرب على الكتابة",
                points: [
                  "عبر دروس بالفيديو بطريقة سلسة و عملية، بالإضافة إلى تمارين و إمتحانات تفاعلية",
                  "يمكنكم التواصل مع الأستاذ في أي وقت للإجابة على أي تساؤلات",
                ],
                highlight: "75 درس، 120 تمرين و 5 امتحانات، 10 كتب",
                duration: "من A1 إلى C1 في مدة 4 أشهر و نصف غوض 5 ساعات في مراكز أخرى",
                color: "bg-primary/10 text-primary border-primary"
              },
              {
                stage: "المرحلة 2",
                icon: Video,
                title: "التمرن على التكلم باللغة الفرنسية",
                points: [
                  "عبر قراءة نصوص و قصص و تلخيصها شفهيا أو إرسالها للأستاذ للتصحيح و ملاحضات و نصائح",
                ],
                highlight: "لمدة شهر و نصف",
                color: "bg-secondary/10 text-secondary border-secondary"
              },
              {
                stage: "المرحلة 3",
                icon: UserCheck,
                title: "التمرن على التحدث مع شخص آخر باللغة الفرنسية",
                points: [
                  "عبر حصص مباشرة مع طلاب آخرين و تحضير أستاذ تقوم بمناقشة مواضيع مختلفة",
                  "كل هذا فيه فيديو التمرن على التواصل المباشر باللغة الفرنسية في مواقف واقعية",
                ],
                highlight: "إختياري لمدة شهرين - دفع إضافي",
                color: "bg-info/10 text-info border-info"
              }
            ].map((stage, idx) => {
              const Icon = stage.icon;
              return (
                <Card 
                  key={idx} 
                  className={`p-6 border-2 ${stage.color} hover:scale-105 transition-all duration-300`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-4 py-2 rounded-full bg-secondary text-white font-bold text-sm">
                      {stage.stage}
                    </span>
                    <Icon className="h-8 w-8" />
                  </div>
                  
                  <h3 className="text-xl font-bold mb-4 leading-tight">
                    {stage.title}
                  </h3>
                  
                  <ul className="space-y-3 mb-4">
                    {stage.points.map((point, pidx) => (
                      <li key={pidx} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{point}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-secondary font-bold text-center">{stage.highlight}</p>
                    {stage.duration && (
                      <p className="text-xs text-muted-foreground text-center mt-2 italic">
                        {stage.duration}
                      </p>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Special Offer */}
      <section className="py-20 bg-gradient-to-br from-secondary/20 via-primary/10 to-secondary/20">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto p-8 md:p-12 shadow-gold border-2 border-secondary/30">
            <div className="text-center mb-8">
              <h2 className="text-4xl md:text-5xl font-black mb-4">
                6 أشهر <span className="text-gradient">لإتقان اللغة الفرنسية</span>
              </h2>
              
              <div className="inline-block bg-gradient-hero text-white px-6 py-3 rounded-full text-xl font-bold mb-6 shadow-lg">
                خصم 30% لل 50 الأوائل
              </div>
              
              <div className="flex items-baseline justify-center gap-3 mb-2">
                <span className="text-6xl md:text-7xl font-black text-gradient">700</span>
                <span className="text-3xl font-bold">درهم</span>
              </div>
              <p className="text-xl text-muted-foreground line-through mb-8">
                عوض <span className="font-bold">1000 درهم</span>
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* المرحلة الأولى */}
              <div className="bg-primary/5 rounded-2xl p-6 border-2 border-primary/20">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                  المرحلة الأولى
                </h3>
                <p className="text-sm text-muted-foreground mb-4 font-semibold">( 4 أشهر و نصف )</p>
                
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-sm">إتقان جميع قواعد اللغة الفرنسية A1 - C1</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-sm">120 تمرين و 5 امتحانات و 3 كتب بالمجان</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-sm">إتقان كتابة الإيمايل و التقارير و الوثائق باللغة الفرنسية</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-sm">المرافقة اليومية من طرف الأستاذ أنس</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-sm">الحصول على شهادة عند نهاية الدورة مستوى B2</span>
                  </li>
                </ul>
              </div>

              {/* المرحلة الثانية */}
              <div className="bg-secondary/5 rounded-2xl p-6 border-2 border-secondary/20">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <span className="bg-secondary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                  المرحلة الثانية
                </h3>
                <p className="text-sm text-muted-foreground mb-4 font-semibold">( شهر و نصف )</p>
                
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-sm">التمرن على التكلم باللغة الفرنسية عبر قراءة لنصوص و قصص و تلخيصها شفهيا أو إرسالها (شهر و نصف)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-sm">المرافقة اليومية من طرف الأستاذ أنس</span>
                  </li>
                </ul>

                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex items-center gap-2 text-secondary">
                    <Clock className="h-5 w-5" />
                    <span className="font-bold">لمدة شهر و نصف</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link to="/register">
                <Button size="lg" className="btn-hero text-lg px-8 py-6">
                  <Play className="ml-2 h-5 w-5" />
                  احجز مكانك الآن بـ 700 درهم فقط
                </Button>
              </Link>
              <a 
                href="https://wa.me/212612097399" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground mt-4 flex items-center justify-center gap-2 hover:text-primary transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                تواصل معنا عبر الواتساب: +212 612097399
              </a>
            </div>
          </Card>
        </div>
      </section>

      {/* Learning Steps */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-black mb-4">
              رحلتك التعليمية في <span className="text-gradient">4 خطوات</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              نوفر لك مسار تعليمي متكامل يأخذك من المستوى المبتدئ A1 حتى الاحتراف C2
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                icon: BookOpen,
                title: "اختر مستواك",
                description: "حدد مستواك الحالي من A1 إلى C2 أو ابدأ باختبار تحديد المستوى",
                color: "primary"
              },
              {
                step: "02",
                icon: Play,
                title: "شاهد الدروس",
                description: "دروس فيديو عالية الجودة مع شرح مفصل وأمثلة عملية",
                color: "secondary"
              },
              {
                step: "03",
                icon: Target,
                title: "تدرب وطبق",
                description: "تمارين تفاعلية وأسئلة متنوعة لتثبيت المعلومات",
                color: "info"
              },
              {
                step: "04",
                icon: Award,
                title: "احصل على الشهادة",
                description: "شهادات معتمدة عند إكمال كل مستوى لتعزز سيرتك الذاتية",
                color: "success"
              }
            ].map((step, idx) => {
              const Icon = step.icon;
              return (
                <Card 
                  key={idx} 
                  className="card-feature relative overflow-hidden group hover:scale-105 transition-transform duration-300"
                >
                  <div className="absolute top-0 left-0 text-8xl font-black text-primary/5 leading-none">
                    {step.step}
                  </div>
                  <div className="relative">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-${step.color}/10 mb-4`}>
                      <Icon className={`h-8 w-8 text-${step.color}`} />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Course Perks */}
      <section id="courses" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">
              لماذا تختار <span className="text-gradient">منصة BCLT</span>؟
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              نقدم لك أفضل تجربة تعليمية بميزات حصرية لا تجدها في أي مكان آخر
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "🎯",
                title: "محتوى مخصص",
                description: "دروس مصممة خصيصاً لتناسب احتياجاتك ومستواك اللغوي"
              },
              {
                icon: "🤖",
                title: "ذكاء اصطناعي",
                description: "مساعد AI لتصحيح النطق وتوليد تمارين مخصصة"
              },
              {
                icon: "📱",
                title: "تعلم في أي مكان",
                description: "منصة متجاوبة تعمل على جميع الأجهزة دون الحاجة لتطبيق"
              },
              {
                icon: "👥",
                title: "مجتمع تفاعلي",
                description: "تواصل مع آلاف الطلاب وشارك تجربتك التعليمية"
              },
              {
                icon: "📊",
                title: "تتبع التقدم",
                description: "احصائيات تفصيلية لتتبع تقدمك ونقاط قوتك وضعفك"
              },
              {
                icon: "🎓",
                title: "شهادات معتمدة",
                description: "احصل على شهادات معترف بها عند إكمال كل مستوى"
              }
            ].map((perk, idx) => (
              <Card key={idx} className="card-elevated p-6 text-center">
                <div className="text-5xl mb-4">{perk.icon}</div>
                <h3 className="text-xl font-bold mb-3">{perk.title}</h3>
                <p className="text-muted-foreground">{perk.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-black mb-4">
              تعلم بذكاء مع <span className="text-gradient">الذكاء الاصطناعي</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              نستخدم تقنيات الذكاء الاصطناعي المتقدمة لتوفير تجربة تعليمية مخصصة وفعالة
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: MessageCircle,
                title: "مساعد ذكي متاح 24/7",
                description: "احصل على إجابات فورية لأسئلتك حول القواعد والمفردات في أي وقت",
                color: "primary"
              },
              {
                icon: Video,
                title: "تدريب صوتي متقدم",
                description: "تحليل نطقك وتقديم ملاحظات دقيقة لتحسين طريقة تحدثك بالفرنسية",
                color: "secondary"
              },
              {
                icon: Target,
                title: "تمارين مخصصة",
                description: "توليد تمارين تناسب مستواك ونقاط ضعفك تلقائياً",
                color: "info"
              }
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Card key={idx} className="card-feature p-6 text-center hover:scale-105 transition-transform">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-${feature.color}/10 mb-4`}>
                    <Icon className={`h-8 w-8 text-${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-gradient-overlay">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">
              اختر <span className="text-gradient">الخطة المناسبة</span> لك
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              خطط مرنة تناسب جميع الميزانيات مع ضمان استرجاع المال خلال 30 يوم
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                name: "عادي",
                originalPrice: "1500",
                price: "750",
                period: "درهم",
                features: [
                  "الوصول الكامل لجميع الدروس والمستويات",
                  "تمارين وامتحانات تفاعلية",
                  "10 رسائل صوتية بالذكاء الاصطناعي في كل فصل",
                  "30 رسالة نصية مع الذكاء الاصطناعي في كل فصل",
                  "شهادات معتمدة لكل مستوى",
                  "دعم يومي من الأستاذ"
                ],
                popular: false,
                cta: "ابدأ الآن"
              },
              {
                name: "VIP",
                originalPrice: "2000",
                price: "1000",
                period: "درهم",
                features: [
                  "جميع مميزات الخطة العادية",
                  "25 رسالة صوتية بالذكاء الاصطناعي في كل فصل",
                  "70 رسالة نصية مع الذكاء الاصطناعي في كل فصل",
                  "أولوية في الدعم والمتابعة",
                  "جلسات خاصة مع الأستاذ",
                  "مجموعة خاصة للطلاب VIP",
                  "دعم 24/7"
                ],
                popular: true,
                cta: "ترقية لـ VIP"
              }
            ].map((plan, idx) => (
              <Card 
                key={idx}
                className={`p-8 relative ${
                  plan.popular 
                    ? 'border-2 border-primary shadow-gold scale-105' 
                    : 'card-elevated'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-hero text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                      الأكثر شعبية
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="mb-2">
                    <span className="text-lg text-muted-foreground line-through">{plan.originalPrice} درهم</span>
                  </div>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-black text-gradient">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, fidx) => (
                    <li key={fidx} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link to="/register" className="block">
                  <Button 
                    className={`w-full ${plan.popular ? 'btn-hero' : 'bg-primary hover:bg-primary-hover text-white'}`}
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">
              ماذا يقول <span className="text-gradient">طلابنا</span> عنا؟
            </h2>
            <p className="text-lg text-muted-foreground">
              آراء حقيقية من طلاب حققوا نجاحات كبيرة معنا
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Oujdi Oujdi",
                role: "6 sem.",
                rating: 5,
                comment: "Saraha une formation li stafadt menha bzaaaf o hasit b rasi niveau Dyali t7assan o bzaaaaf merci bclt français 🙏🙏🙏"
              },
              {
                name: "Sofyane Lahnid",
                role: "6 sem.",
                rating: 5,
                comment: "Une formation claire et motivante, qui donne vraiment envie d'apprendre le français et de progresser rapidement merci Mr Anas"
              },
              {
                name: "Khalid Ouazzani",
                role: "6 sem.",
                rating: 5,
                comment: "Filicitation et bonne courage tu es le meilleur"
              },
              {
                name: "Tarik Éss",
                role: "6 sem.",
                rating: 5,
                comment: "Tebarekkellah formation tooop bdaw m3aya mn la base odb hmd 9dart ntwafa9 fl formation .courage oustad"
              },
              {
                name: "El Idrissi Ridoine",
                role: "35 sem.",
                rating: 5,
                comment: "Je la recommande vivement"
              },
              {
                name: "Soukaina Soukaina",
                role: "35 sem.",
                rating: 5,
                comment: "تبارك الله عليك استاذ في المستوى استفدت معاك بزاف وحتى صحباتي دخلو عندك قلتلها ليهم"
              },
              {
                name: "Salma Salm",
                role: "35 sem.",
                rating: 5,
                comment: "شكرا جزيلا أستاذ انس بفضل الشرح الميمز تبسطت عندي اللغة الفرنسية والقواعد ديالها الحمد لله استفدت ومزال بغا نزيدو ان شاء الله"
              },
              {
                name: "Farid Ibrahim",
                role: "34 sem.",
                rating: 5,
                comment: "أستاذ رائع واصل بارك الله لك في عملك .."
              },
              {
                name: "Fatna Rafii",
                role: "3 sem.",
                rating: 5,
                comment: "كاين فرق بين استاذ واستاذ تبارك الله عليك.والله تستاهل 7000درهم حيث جربت بزاف الأساتذة .شكرا"
              },
              {
                name: "Kawtar Ali",
                role: "6 sem.",
                rating: 5,
                comment: "Formation tooooooooop lah yjazip belkhir"
              },
              {
                name: "Med Qssmy",
                role: "6 sem.",
                rating: 5,
                comment: "حقيقة دورة تكوينية ممتازة تمكن الأعضاء من تعلم قواعد اللغة الفرنسية وطريقة استعمالها. منهاج واضح وسهل، أستاذ ذو كفاءة وسهل، كل الشكر لكم أستاذ أنس جزاكم الله خيرا"
              },
              {
                name: "Fadila Sadik",
                role: "6 sem.",
                rating: 5,
                comment: "بارك الله فيكم أستاذ أنس. بالتوفيق إن شاء الله."
              }
            ].map((testimonial, idx) => (
              <Card key={idx} className="card-elevated p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-secondary fill-current" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 italic leading-relaxed">
                  "{testimonial.comment}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-hero flex items-center justify-center text-white font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">
              الأسئلة <span className="text-gradient">الشائعة</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              إجابات على أكثر الأسئلة شيوعاً حول منصتنا
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {[
              {
                question: "هل يمكنني البدء من الصفر؟",
                answer: "بالتأكيد! نوفر محتوى للمبتدئين تماماً (مستوى A1) مع شرح مفصل باللغة العربية. يمكنك البدء بدون أي معرفة سابقة بالفرنسية."
              },
              {
                question: "ما هي مدة الدورة الكاملة؟",
                answer: "مدة الدورة تعتمد على التزامك ووتيرة تعلمك. في المتوسط، يستغرق الأمر 6-12 شهر لإكمال مستوى واحد (A1, A2, B1, إلخ) بمعدل ساعة يومياً."
              },
              {
                question: "هل الشهادات معترف بها؟",
                answer: "نعم، شهاداتنا معتمدة ومعترف بها. يمكنك استخدامها في سيرتك الذاتية أو عند التقديم للجامعات والوظائف."
              },
              {
                question: "ما الفرق بين الاشتراك البريميوم والـ VIP؟",
                answer: "البريميوم يمنحك الوصول الكامل للدروس و400 رصيد AI شهرياً. أما VIP فيضيف 1000 رصيد AI، 600 تدريب صوتي، جلسات فردية، ومجموعة خاصة."
              },
              {
                question: "هل يمكنني إلغاء الاشتراك؟",
                answer: "نعم، يمكنك إلغاء الاشتراك في أي وقت. نوفر أيضاً ضمان استرجاع المال خلال 30 يوم إذا لم تكن راضياً عن الخدمة."
              },
              {
                question: "كيف يساعدني الذكاء الاصطناعي؟",
                answer: "يساعدك AI في تصحيح النطق، توليد تمارين مخصصة، الإجابة على أسئلتك الفورية، وتقديم نصائح لتحسين مستواك بناءً على أدائك."
              }
            ].map((item, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`} className="bg-white rounded-xl px-6 border-none shadow-sm">
                <AccordionTrigger className="text-right hover:no-underline py-5">
                  <span className="font-bold text-lg">{item.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-90"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center text-white max-w-3xl mx-auto">
            <h2 className="text-4xl lg:text-5xl font-black mb-6">
              جاهز لبدء رحلتك التعليمية؟
            </h2>
            <p className="text-xl mb-8 text-white/90">
              انضم لآلاف الطلاب الذين حققوا أحلامهم في إتقان اللغة الفرنسية
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="btn-hero-outline bg-white text-primary hover:bg-white/90">
                  ابدأ التعلم مجاناً
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-primary">
                  <MessageCircle className="ml-2 h-5 w-5" />
                  تحدث معنا
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src={logoImg} alt="BCLT Logo" className="h-10 w-10" />
                <div>
                  <h3 className="font-bold text-lg">BCLT</h3>
                  <p className="text-xs text-white/70">تعلم الفرنسية بسهولة</p>
                </div>
              </div>
              <p className="text-white/70 text-sm leading-relaxed">
                منصة تعليمية عصرية لتعلم اللغة الفرنسية بأسلوب تفاعلي وممتع
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">روابط سريعة</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><a href="#features" className="hover:text-secondary transition-colors">المميزات</a></li>
                <li><a href="#courses" className="hover:text-secondary transition-colors">الدورات</a></li>
                <li><a href="#pricing" className="hover:text-secondary transition-colors">الأسعار</a></li>
                <li><a href="#faq" className="hover:text-secondary transition-colors">الأسئلة الشائعة</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">الدعم</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><a href="#" className="hover:text-secondary transition-colors">مركز المساعدة</a></li>
                <li><a href="#" className="hover:text-secondary transition-colors">الشروط والأحكام</a></li>
                <li><a href="#" className="hover:text-secondary transition-colors">سياسة الخصوصية</a></li>
                <li><a href="#" className="hover:text-secondary transition-colors">اتصل بنا</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">تابعنا</h4>
              <div className="flex gap-3">
                {['Facebook', 'Instagram', 'Twitter', 'LinkedIn'].map(social => (
                  <a 
                    key={social}
                    href="#" 
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-secondary flex items-center justify-center transition-colors"
                  >
                    <span className="sr-only">{social}</span>
                    <div className="w-5 h-5 bg-white/50 rounded-full"></div>
                  </a>
                ))}
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 text-center text-sm text-white/70">
            <p>© 2025 BCLT. جميع الحقوق محفوظة</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
