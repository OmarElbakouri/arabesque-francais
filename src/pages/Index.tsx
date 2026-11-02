import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, BookOpen, Target, Award, Users, Play, Check, Star, MessageCircle, Lightbulb, Video, UserCheck, CheckCircle2, Clock, Mic, Brain, Sparkles, Zap, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import professorImg from "@/assets/professor.jpg";
import logoImg from "@/assets/logo.jpg";
import api from "@/lib/api";

const Index = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [landingVideoUrl, setLandingVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    // Fetch landing video URL from site settings
    const fetchVideoUrl = async () => {
      try {
        const response = await api.get('/settings/landing-video');
        if (response.data?.data?.url) {
          setLandingVideoUrl(response.data.data.url);
        }
      } catch (error) {
        console.log('No landing video configured');
      }
    };
    fetchVideoUrl();
  }, []);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/90 backdrop-blur-md shadow-sm z-50">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            {/* Logo */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <img src={logoImg} alt="BCLT Logo" className="h-10 sm:h-12 w-10 sm:w-12 object-contain" />
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold text-primary">BCLT</h1>
                <p className="text-xs text-muted-foreground">تعلم الفرنسية بسهولة</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
              <a href="#features" className="link-animated text-foreground hover:text-primary font-medium">المميزات</a>
              <a href="#courses" className="link-animated text-foreground hover:text-primary font-medium">الدورات</a>
              <a href="#pricing" className="link-animated text-foreground hover:text-primary font-medium">الأسعار</a>
              <a href="#faq" className="link-animated text-foreground hover:text-primary font-medium">الأسئلة الشائعة</a>
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center gap-1 sm:gap-3">
              <Link to="/login">
                <Button variant="ghost" className="font-medium text-xs sm:text-sm px-2 sm:px-4">تسجيل الدخول</Button>
              </Link>
              <Link to="/register">
                <Button className="btn-hero text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4">
                  <span className="hidden sm:inline">جرب الحصة الاولى بالمجان</span>
                  <span className="sm:hidden">جرب مجاناً</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Modern White Design */}
      <section className="relative pt-24 pb-20 overflow-hidden min-h-[90vh] flex items-center">
        {/* Background Effects - White Theme */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-white"></div>

        {/* Subtle Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>

        {/* Animated Gradient Orbs - Softer for white background */}
        <div className="absolute top-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/5 to-purple-400/5 rounded-full blur-3xl"></div>

        {/* Decorative Elements */}
        <div className="absolute top-32 right-10 w-20 h-20 border-2 border-primary/20 rounded-full"></div>
        <div className="absolute bottom-32 left-10 w-32 h-32 border-2 border-purple-400/20 rounded-full"></div>
        <div className="absolute top-1/3 right-1/4 w-4 h-4 bg-primary/30 rounded-full"></div>
        <div className="absolute bottom-1/3 left-1/3 w-6 h-6 bg-purple-400/30 rounded-full"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content - Dark text for white background */}
            <div className="animate-slide-up">
              <div className="inline-block mb-6">
                <span className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-bold shadow-sm">
                  <Sparkles className="w-4 h-4" />
                  أول منصة لتعلم الفرنسية مع الاستاذ اناس بAI في المغرب
                </span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-black mb-6 leading-tight text-gray-900">
                أتقن اللغة الفرنسية
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">مع الأستاذ أناس</span>
                <span className="block">بمساعدة AI</span>
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-xl">
                تعلم اللغة الفرنسية بأسلوب عصري مدعوم بالذكاء الاصطناعي. دروس فيديو، تمارين تفاعلية، ومساعد ذكي يصحح نطقك ويجيب على أسئلتك في الحين.
              </p>

              {/* Stats Row */}
              <div className="flex flex-wrap items-center gap-4 mb-8">
                <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="font-medium text-gray-700">أكثر من 15000 طالب</span>
                </div>
                <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="font-medium text-gray-700">شهادات معتمدة</span>
                </div>
                <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="font-medium text-gray-700">دعم 24/7</span>
                </div>
              </div>

              {/* Free Trial Button - Visible without scrolling */}
              <Link to="/register">
                <Button size="lg" className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white text-lg px-8 py-6 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <Play className="ml-2 h-5 w-5" />
                  جرب الحصة الاولى بالمجان
                </Button>
              </Link>
            </div>

            {/* Professor Image with Creative Frame */}
            <div className="relative">
              {/* Glowing Background Effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-primary via-purple-500 to-pink-500 rounded-3xl blur-2xl opacity-30 animate-pulse"></div>

              {/* Main Image Container */}
              <div className="relative">
                {/* Decorative Frame */}
                <div className="absolute -inset-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500 rounded-3xl opacity-75"></div>

                <div className="relative bg-white rounded-3xl p-2 shadow-2xl">
                  <img
                    src={professorImg}
                    alt="Professor"
                    className="rounded-2xl w-full max-w-md mx-auto"
                  />

                  {/* Gradient Overlay on Image */}
                  <div className="absolute inset-2 rounded-2xl bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none"></div>
                </div>

                {/* Floating Rating Card */}
                <div className="absolute -bottom-4 -left-4 bg-white backdrop-blur-xl rounded-2xl shadow-xl p-4 border border-gray-100 animate-float">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full p-3">
                      <Star className="h-6 w-6 text-white fill-current" />
                    </div>
                    <div>
                      <p className="font-bold text-2xl text-gray-900">4.9/5</p>
                      <p className="text-sm text-gray-500">تقييم الطلاب</p>
                    </div>
                  </div>
                </div>

                {/* Floating AI Badge */}
                <div className="absolute -top-4 -right-4 bg-white backdrop-blur-xl rounded-2xl shadow-xl p-4 border border-gray-100 animate-float" style={{ animationDelay: '0.5s' }}>
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-primary to-purple-600 rounded-full p-3">
                      <Brain className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">AI مساعد</p>
                      <p className="text-xs text-green-500 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        متصل الآن
                      </p>
                    </div>
                  </div>
                </div>

                {/* Floating Students Count */}
                <div className="absolute top-1/2 -right-8 bg-white backdrop-blur-xl rounded-2xl shadow-xl p-4 border border-gray-100 animate-float" style={{ animationDelay: '1s' }}>
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full p-3">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-xl text-gray-900">+10K</p>
                      <p className="text-xs text-gray-500">طالب نشط</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-8 w-8 text-gray-400" />
        </div>
      </section>

      {/* Video Section */}
      {landingVideoUrl && (
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-sm font-bold mb-4">
                <Play className="inline-block w-4 h-4 ml-2" />
                شاهد الفيديو التعريفي
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                اكتشف كيف نساعدك على <span className="text-primary">إتقان الفرنسية</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                شاهد كيف تعمل منصتنا المدعومة بالذكاء الاصطناعي وكيف يمكنها تسريع رحلتك في تعلم اللغة الفرنسية
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl border-4 border-white/50">
                <iframe
                  src={landingVideoUrl}
                  title="فيديو تعريفي عن المنصة"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* AI Demo Section */}
      <section className="py-20 bg-black text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2565&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block py-1 px-3 rounded-full bg-primary/20 border border-primary text-primary text-sm font-bold mb-4">
              <Sparkles className="inline-block w-4 h-4 ml-2" />
              تكنولوجيا حصرية
            </span>
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              تجربة تعليمية <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">تسبق عصرها</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              اكتشف كيف يقوم الذكاء الاصطناعي بتحليل صوتك وتصحيح أخطائك في الوقت الفعلي
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex gap-4 items-start p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Mic className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">تصحيح النطق الفوري</h3>
                  <p className="text-gray-400">تحدث بالفرنسية وسيقوم الذكاء الاصطناعي بتحليل نطقك وتصحيحه فوراً بدقة تصل إلى 99%</p>
                </div>
              </div>

              <div className="flex gap-4 items-start p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <Brain className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">مسار تعليمي ذكي</h3>
                  <p className="text-gray-400">يتكيف المنهج تلقائياً مع مستوى تقدمك ونقاط ضعفك لضمان أسرع نتائج ممكنة</p>
                </div>
              </div>

              <div className="flex gap-4 items-start p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">محادثات واقعية</h3>
                  <p className="text-gray-400">مارس اللغة مع شخصيات افتراضية ذكية في سيناريوهات من الحياة اليومية</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary to-purple-600 rounded-3xl blur-2xl opacity-30 animate-pulse"></div>
              <div className="relative bg-gray-900 rounded-2xl border border-white/10 p-6 shadow-2xl">
                {/* Chat Interface Mockup */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center">
                        <Brain className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-bold">المساعد الذكي</p>
                        <p className="text-xs text-green-400 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                          متصل الآن
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 font-mono text-sm">
                    <div className="flex gap-3 justify-end">
                      <div className="bg-primary text-white p-3 rounded-2xl rounded-tr-none max-w-[80%]">
                        Je veux apprendre à me présenter en français.
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs">You</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center flex-shrink-0">
                        <Brain className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-white/10 text-gray-200 p-3 rounded-2xl rounded-tl-none max-w-[80%]">
                        <p className="mb-2">Bien sûr ! Voici une façon simple de vous présenter :</p>
                        <p className="text-primary font-bold">"Bonjour, je m'appelle [Nom]. J'ai [Âge] ans et je suis [Profession]."</p>
                        <div className="mt-3 flex gap-2">
                          <button className="text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded flex items-center gap-1">
                            <Play className="w-3 h-3" /> استمع
                          </button>
                          <button className="text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded flex items-center gap-1">
                            <Mic className="w-3 h-3" /> جرب النطق
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="h-12 bg-white/5 rounded-xl flex items-center px-4 text-gray-500 justify-between">
                      <span>اكتب رسالتك هنا...</span>
                      <Mic className="w-5 h-5 hover:text-primary cursor-pointer transition-colors" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2 Stages Path */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-black mb-4">
              طريقك لإتقان <span className="text-gradient">التواصل باللغة الفرنسية</span>
            </h2>
            <p className="text-2xl font-bold text-primary mb-2">عبر مرحلتين</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                stage: "المرحلة 1",
                icon: Lightbulb,
                title: "ضبط القواعد اللغوية والتدرب على الكتابة",
                points: [
                  "عبر دروس بالفيديو بطريقة سلسة و عملية، بالإضافة إلى تمارين و إمتحانات تفاعلية مدعومة بالذكاء الاصطناعي",
                  "يمكنكم التواصل مع الأستاذ أو المساعد الذكي في أي وقت للإجابة على أي تساؤلات",
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
                  "عبر قراءة نصوص و قصص و تلخيصها شفهيا أو إرسالها للمصحح الآلي للتصحيح الفوري و ملاحضات و نصائح",
                ],
                highlight: "لمدة شهر و نصف",
                color: "bg-secondary/10 text-secondary border-secondary"
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

      {/* Pricing Comparison Section */}
      <section id="pricing" className="py-20 bg-black text-white overflow-hidden relative">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2565&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block py-1 px-3 rounded-full bg-primary/20 border border-primary text-primary text-sm font-bold mb-4">
              <Sparkles className="inline-block w-4 h-4 ml-2" />
              اختر باقتك
            </span>
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              6 أشهر <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">لإتقان اللغة الفرنسية</span>
            </h2>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">

            {/* Normal Plan */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-gray-600 to-gray-400 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative bg-gray-900/90 backdrop-blur-xl rounded-3xl p-8 border border-white/10 h-full flex flex-col">
                <div className="text-center mb-8">
                  <span className="inline-block px-4 py-2 rounded-full bg-white/10 text-white/80 font-bold text-sm mb-4">
                    الباقة العادية
                  </span>
                  <div className="flex items-baseline justify-center gap-2 mb-2">
                    <span className="text-5xl md:text-6xl font-black text-white">2000</span>
                    <span className="text-2xl font-bold text-gray-400">درهم</span>
                  </div>
                </div>

                {/* Features List */}
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10 flex-grow">
                  <ul className="space-y-4">
                    {[
                      "6 أشهر لإتقان اللغة الفرنسية",
                      "إتقان جميع قواعد اللغة A1 - C1",
                      "120 تمرين و 5 امتحانات",
                      "3 كتب بالمجان",
                      "إتقان كتابة الإيمايل والتقارير",
                      "المرافقة اليومية من الأستاذ",
                      "شهادة مستوى B2",
                      "التمرن على التحدث بالفرنسية"
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-gray-300">
                        <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}

                    {/* AI Features - Limited */}
                    <li className="pt-4 border-t border-white/10">
                      <div className="flex items-center gap-3 text-gray-400">
                        <Brain className="h-5 w-5 text-gray-500 flex-shrink-0" />
                        <span>Chatbot - <span className="text-orange-400 font-bold">2000 رسالة · 50 يومياً · بدون انتهاء</span></span>
                      </div>
                    </li>
                    <li className="flex items-center gap-3 text-gray-400">
                      <Sparkles className="h-5 w-5 text-gray-500 flex-shrink-0" />
                      <span>Exercice - <span className="text-orange-400 font-bold">600 مجموعة · 10 يومياً · بدون انتهاء</span></span>
                    </li>
                    <li className="flex items-center gap-3 text-gray-400">
                      <Mic className="h-5 w-5 text-gray-500 flex-shrink-0" />
                      <span>Sophie - <span className="text-orange-400 font-bold">80 جلسة · 2 يومياً · 15 دقيقة · بدون انتهاء</span></span>
                    </li>
                  </ul>
                </div>

                <Link to="/register" className="block mt-8">
                  <Button size="lg" className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 text-lg py-6">
                    <Play className="ml-2 h-5 w-5" />
                    ابدأ الآن بـ 2000 درهم
                  </Button>
                </Link>
              </div>
            </div>

            {/* VIP Plan */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500 rounded-3xl blur opacity-50 group-hover:opacity-75 transition duration-500 animate-pulse"></div>
              <div className="relative bg-gray-900/95 backdrop-blur-xl rounded-3xl p-8 border border-primary/30 h-full flex flex-col">
                {/* VIP Badge */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="bg-gradient-to-r from-primary to-purple-600 px-6 py-2 rounded-full text-white font-bold text-sm shadow-lg flex items-center gap-2">
                    <Crown className="h-4 w-4" />
                    الأكثر طلباً
                  </div>
                </div>

                <div className="text-center mb-8 mt-4">
                  <span className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-purple-500/20 text-primary font-bold text-sm mb-4 border border-primary/30">
                    باقة VIP
                  </span>
                  <div className="flex items-baseline justify-center gap-2 mb-2">
                    <span className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">3000</span>
                    <span className="text-2xl font-bold text-gray-400">درهم</span>
                  </div>
                </div>

                {/* Features List */}
                <div className="bg-primary/5 rounded-2xl p-6 border border-primary/20 flex-grow">
                  <ul className="space-y-4">
                    {[
                      "6 أشهر لإتقان اللغة الفرنسية",
                      "إتقان جميع قواعد اللغة A1 - C1",
                      "120 تمرين و 5 امتحانات",
                      "3 كتب بالمجان",
                      "إتقان كتابة الإيمايل والتقارير",
                      "المرافقة اليومية من الأستاذ",
                      "شهادة مستوى B2",
                      "التمرن على التحدث بالفرنسية"
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-gray-300">
                        <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}

                    {/* AI Features - Unlimited */}
                    <li className="pt-4 border-t border-primary/20">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-r from-primary to-purple-500 flex items-center justify-center flex-shrink-0">
                          <Brain className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-white">Chatbot - <span className="text-green-400 font-bold">5000 رسالة · 100 يومياً · بدون انتهاء</span></span>
                      </div>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-r from-primary to-purple-500 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-white">Exercice - <span className="text-green-400 font-bold">1000 مجموعة · 15 يومياً · بدون انتهاء</span></span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-r from-primary to-purple-500 flex items-center justify-center flex-shrink-0">
                        <Mic className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-white">Sophie - <span className="text-green-400 font-bold">600 جلسة · 10 يومياً · 15 دقيقة · بدون انتهاء</span></span>
                    </li>
                  </ul>
                </div>

                <Link to="/register" className="block mt-8">
                  <Button size="lg" className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white text-lg py-6 shadow-lg shadow-primary/25">
                    <Crown className="ml-2 h-5 w-5" />
                    انضم لـ VIP بـ 3000 درهم
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* WhatsApp Contact */}
          <div className="text-center mt-12">
            <a
              href="https://wa.me/212612097399"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
              تواصل معنا عبر الواتساب: +212 612097399
            </a>
          </div>
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
                title: "اختر مستواك بدقة",
                description: "حدد مستواك الحالي من A1 إلى C2 عبر اختبار تحديد المستوى المدعوم بالذكاء الاصطناعي",
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
                title: "تدرب مع AI",
                description: "تمارين تفاعلية ذكية تتكيف مع مستواك وتصحح أخطاءك فورياً",
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
                icon: "🤖",
                title: "ذكاء اصطناعي متطور",
                description: "مساعد AI شخصي لتصحيح النطق، المحادثة، وتوليد تمارين مخصصة لك"
              },
              {
                icon: "⚡",
                title: "تعلم أسرع 3 مرات",
                description: "بفضل التخصيص الذكي للمحتوى، ستتعلم ما تحتاجه فقط وفي الوقت المناسب"
              },
              {
                icon: "📱",
                title: "تعلم في أي مكان",
                description: "منصة متجاوبة تعمل على جميع الأجهزة دون الحاجة لتطبيق"
              },
              {
                icon: "🗣️",
                title: "تصحيح نطق فوري",
                description: "لا داعي للخجل، تدرب على النطق مع الذكاء الاصطناعي حتى تتقنه"
              },
              {
                icon: "📊",
                title: "تتبع ذكي للتقدم",
                description: "تحليلات دقيقة توضح لك نقاط قوتك وضعفك لتركز على ما يهم"
              },
              {
                icon: "🎓",
                title: "شهادات معتمدة",
                description: "احصل على شهادات معترف بها عند إكمال كل مستوى"
              }
            ].map((perk, idx) => (
              <Card key={idx} className="card-elevated p-6 text-center group hover:border-primary/50 transition-colors">
                <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">{perk.icon}</div>
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
              تقنيات <span className="text-gradient">الذكاء الاصطناعي</span> الحصرية
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              نحن المنصة الأولى في المغرب التي توفر لك تجربة تعليمية مدعومة بأحدث تقنيات AI
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "مساعد ذكي متاح 24/7",
                description: "احصل على إجابات فورية لأسئلتك حول القواعد والمفردات في أي وقت، كأنك تملك أستاذاً خاصاً في جيبك",
                color: "primary"
              },
              {
                icon: Mic,
                title: "تحليل صوتي دقيق",
                description: "تقنية التعرف على الصوت المتقدمة تحلل نطقك وتعطيك تقييماً فورياً مع نصائح للتحسين",
                color: "secondary"
              },
              {
                icon: Sparkles,
                title: "تمارين مولدة تلقائياً",
                description: "لا مزيد من التمارين المملة! الذكاء الاصطناعي ينشئ تمارين مخصصة بناءً على مستواك واهتماماتك",
                color: "info"
              }
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Card key={idx} className="card-feature p-8 text-center hover:scale-105 transition-transform border-2 hover:border-primary/50">
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-${feature.color}/10 mb-6 shadow-inner`}>
                    <Icon className={`h-10 w-10 text-${feature.color}`} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-lg">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      {/* Removed Pricing Section as requested */}

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
                answer: "NORMAL يشمل 80 جلسة Sophie و600 مجموعة تمارين و2000 رسالة. VIP يشمل 600 جلسة و1000 مجموعة و5000 رسالة. الأرصدة لا تنتهي. جلسة Sophie حتى 15 دقيقة، بحد 2 يومياً لـ NORMAL و10 لـ VIP."
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