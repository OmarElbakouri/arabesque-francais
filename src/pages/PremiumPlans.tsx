import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Link, useNavigate } from "react-router-dom";
import {
    Crown,
    Check,
    Sparkles,
    Brain,
    Mic,

    MessageCircle,
    ArrowRight,
    Play,
    CheckCircle2,
    Gift,
    Rocket,
} from "lucide-react";
import logo from "@/assets/logo.jpg";
import ribBcp from "@/assets/rib-bcp.png";
import ribAttijariwafa from "@/assets/rib-attijariwafa.png";

const DEFAULT_WHATSAPP = "212657507364";

export default function PremiumPlans() {
    const navigate = useNavigate();
    const [whatsappNumber, setWhatsappNumber] = useState(DEFAULT_WHATSAPP);
    const [commercialName, setCommercialName] = useState<string | null>(null);

    useEffect(() => {
        // Fetch commercial WhatsApp number if user was referred
        const fetchCommercialWhatsApp = async () => {
            try {
                const token = localStorage.getItem("jwt_token");
                if (!token) return;

                const response = await fetch("/api/profile/commercial-whatsapp", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.data?.whatsapp) {
                        // Format phone number (remove spaces, ensure it starts without +)
                        let phone = data.data.whatsapp.replace(/[\s+-]/g, "");
                        if (!phone.startsWith("212")) {
                            phone = "212" + phone.replace(/^0/, "");
                        }
                        setWhatsappNumber(phone);
                        setCommercialName(data.data.name || null);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch commercial WhatsApp:", error);
            }
        };

        fetchCommercialWhatsApp();
    }, []);

    const normalFeatures = [
        "6 أشهر لإتقان اللغة الفرنسية",
        "إتقان جميع قواعد اللغة A1 - C1",
        "120 تمرين و 5 امتحانات",
        "3 كتب بالمجان",
        "إتقان كتابة الإيمايل والتقارير",
        "المرافقة اليومية من الأستاذ",
        "شهادة مستوى B2",
        "التمرن على التحدث بالفرنسية",
    ];

    const vipFeatures = [
        "6 أشهر لإتقان اللغة الفرنسية",
        "إتقان جميع قواعد اللغة A1 - C1",
        "120 تمرين و 5 امتحانات",
        "3 كتب بالمجان",
        "إتقان كتابة الإيمايل والتقارير",
        "المرافقة اليومية من الأستاذ",
        "شهادة مستوى B2",
        "التمرن على التحدث بالفرنسية",
    ];

    const aiFeatures = [
        { name: "المساعد الذكي (Chatbot)", icon: Brain, normalLimit: 30, vipLimit: "غير محدود ♾️" },
        { name: "Exercice", icon: Sparkles, normalLimit: 50, vipLimit: 100 },
        { name: "Communication", icon: Mic, normalLimit: 15, vipLimit: 100 },
    ];




    return (
        <div dir="rtl" className="min-h-screen bg-white">
            {/* Header */}
            <header className="bg-white/90 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img src={logo} alt="BCLT" className="h-10 w-auto rounded-lg" />
                            <span className="font-bold text-gray-900 text-xl hidden sm:block">BCLT Academy</span>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(-1)}
                            className="rounded-xl border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        >
                            <ArrowRight className="ml-2 h-4 w-4" />
                            رجوع
                        </Button>
                    </div>
                </div>
            </header>

            {/* Hero Section - Same as Landing Page */}
            <section className="relative py-20 overflow-hidden">
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

                <div className="container mx-auto px-4 relative z-10 text-center">

                    <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight text-gray-900">
                        ارتقِ بمستواك مع{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
                            الباقات المميزة
                        </span>
                    </h1>

                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        احصل على وصول كامل لجميع الدروس والتمارين وميزات الذكاء الاصطناعي المتقدمة
                    </p>

                    <div className="flex items-center justify-center gap-8 text-gray-600 flex-wrap">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                            <span>95 فيديو</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                            <span><span className="text-xl font-bold">∞</span> تمرين</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                            <span>5 امتحانات</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                            <span>3 كتب مجانية</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Cards Section */}
            <section className="py-16 px-4 relative overflow-hidden">
                {/* Light gradient background */}
                <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white"></div>

                <div className="container mx-auto relative z-10">
                    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {/* Normal Plan */}
                        <Card className="relative bg-white rounded-3xl p-8 border-2 border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                            <div className="text-center mb-8">
                                <Badge className="bg-gray-100 text-gray-700 border-gray-200 mb-4 px-4 py-2 text-sm">
                                    الباقة العادية
                                </Badge>
                                <div className="flex items-baseline justify-center gap-2 mb-2">
                                    <span className="text-5xl md:text-6xl font-black text-gray-900">2000</span>
                                    <span className="text-2xl font-bold text-gray-400">درهم</span>
                                </div>
                            </div>

                            {/* Features List */}
                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex-grow">
                                <ul className="space-y-4">
                                    {normalFeatures.map((feature, idx) => (
                                        <li key={idx} className="flex items-center gap-3 text-gray-700">
                                            <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}

                                    {/* AI Features - Limited */}
                                    <li className="pt-4 border-t border-gray-200">
                                        <p className="text-sm text-gray-500 mb-3">ميزات الذكاء الاصطناعي:</p>
                                    </li>
                                    {aiFeatures.map((feature, idx) => {
                                        const Icon = feature.icon;
                                        return (
                                            <li key={idx} className="flex items-center gap-3 text-gray-500">
                                                <Icon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                                                <span>
                                                    {feature.name} -{" "}
                                                    <span className="text-orange-500 font-bold">{feature.normalLimit} {feature.name.includes("Chatbot") ? "رسالة" : "مرة"}/الشهر</span>
                                                </span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>

                            <a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('مرحبا، أريد الاشتراك في الباقة العادية (2000 درهم)')}`} target="_blank" rel="noopener noreferrer" className="block mt-8">
                                <Button
                                    size="lg"
                                    className="w-full bg-gray-900 hover:bg-gray-800 text-white text-lg py-6 rounded-2xl"
                                >
                                    <MessageCircle className="ml-2 h-5 w-5" />
                                    ابدأ الآن بـ 2000 درهم
                                </Button>
                            </a>
                        </Card>

                        {/* VIP Plan */}
                        <div className="relative">
                            {/* Gradient glow behind the card */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500 rounded-3xl blur-lg opacity-50 animate-pulse"></div>

                            <Card className="relative bg-white rounded-3xl p-8 border-2 border-primary/30 shadow-xl h-full flex flex-col">
                                {/* VIP Badge */}
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <Badge className="bg-gradient-to-r from-primary to-purple-600 text-white border-0 px-6 py-2 shadow-lg text-sm">
                                        <Crown className="h-4 w-4 ml-2" />
                                        الأكثر طلباً
                                    </Badge>
                                </div>

                                <div className="text-center mb-8 mt-4">
                                    <Badge className="bg-primary/10 text-primary border-primary/30 mb-4 px-4 py-2 text-sm">
                                        باقة VIP
                                    </Badge>
                                    <div className="flex items-baseline justify-center gap-2 mb-2">
                                        <span className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
                                            3000
                                        </span>
                                        <span className="text-2xl font-bold text-gray-400">درهم</span>
                                    </div>
                                </div>

                                {/* Features List */}
                                <div className="bg-primary/5 rounded-2xl p-6 border border-primary/20 flex-grow">
                                    <ul className="space-y-4">
                                        {vipFeatures.map((feature, idx) => (
                                            <li key={idx} className="flex items-center gap-3 text-gray-700">
                                                <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}

                                        {/* AI Features - Unlimited */}
                                        <li className="pt-4 border-t border-primary/20">
                                            <p className="text-sm text-primary font-semibold mb-3">ميزات الذكاء الاصطناعي:</p>
                                        </li>
                                        {aiFeatures.map((feature, idx) => {
                                            const Icon = feature.icon;
                                            const isUnlimited = typeof feature.vipLimit === "string";
                                            return (
                                                <li key={idx} className="flex items-center gap-3">
                                                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-primary to-purple-500 flex items-center justify-center flex-shrink-0">
                                                        <Icon className="h-3 w-3 text-white" />
                                                    </div>
                                                    <span className="text-gray-700">
                                                        {feature.name} -{" "}
                                                        <span className="text-green-500 font-bold">
                                                            {isUnlimited ? feature.vipLimit : `${feature.vipLimit} مرة/الشهر`}
                                                        </span>
                                                    </span>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>

                                <a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('مرحبا، أريد الاشتراك في باقة VIP (1500 درهم)')}`} target="_blank" rel="noopener noreferrer" className="block mt-8">
                                    <Button
                                        size="lg"
                                        className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white text-lg py-6 shadow-lg shadow-primary/25 rounded-2xl"
                                    >
                                        <Crown className="ml-2 h-5 w-5" />
                                        انضم لـ VIP بـ 1500 درهم
                                    </Button>
                                </a>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why VIP Section */}
            <section className="py-16 px-4 relative overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50"></div>

                <div className="container mx-auto relative z-10">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
                            لماذا تختار{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
                                باقة VIP؟
                            </span>
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            استفد من ميزات الذكاء الاصطناعي غير المحدودة لتسريع تعلمك
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        <Card className="bg-white border-gray-100 shadow-lg p-6 text-center hover:shadow-xl hover:border-primary/30 transition-all duration-300">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg">
                                <Brain className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">المساعد الذكي</h3>
                            <p className="text-gray-600">
                                احصل على إجابات فورية لأسئلتك حول القواعد والمفردات في أي وقت 24/7
                            </p>
                        </Card>

                        <Card className="bg-white border-gray-100 shadow-lg p-6 text-center hover:shadow-xl hover:border-primary/30 transition-all duration-300">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                                <Sparkles className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Quiz IA</h3>
                            <p className="text-gray-600">
                                تمارين ذكية مولدة تلقائياً تتكيف مع مستواك واهتماماتك
                            </p>
                        </Card>

                        <Card className="bg-white border-gray-100 shadow-lg p-6 text-center hover:shadow-xl hover:border-primary/30 transition-all duration-300">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg">
                                <Mic className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Quiz Vocal</h3>
                            <p className="text-gray-600">
                                تدرب على النطق مع تصحيح فوري وتقييم دقيق لأدائك
                            </p>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Bank Account Details */}
            <section className="py-16 px-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white"></div>

                <div className="container mx-auto relative z-10">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
                            معلومات{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
                                الدفع البنكي
                            </span>
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            يمكنك إرسال الدفع إلى أحد الحسابين البنكيين التاليين
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        <Card className="bg-white border-gray-100 shadow-lg p-6 hover:shadow-xl transition-all duration-300">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">banque populaire</h3>
                            <img src={ribBcp} alt="RIB BCP" className="w-full rounded-lg shadow" />
                        </Card>

                        <Card className="bg-white border-gray-100 shadow-lg p-6 hover:shadow-xl transition-all duration-300">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">CIH</h3>
                            <img src={ribAttijariwafa} alt="RIB Attijariwafa" className="w-full rounded-lg shadow" />
                        </Card>
                    </div>
                </div>
            </section>

            <section className="py-16 px-4 relative overflow-hidden">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-purple-600/5"></div>

                <div className="container mx-auto text-center relative z-10">
                    <Card className="bg-white border-primary/20 shadow-2xl p-8 md:p-12 rounded-3xl max-w-3xl mx-auto">
                        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center shadow-lg">
                            <Crown className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
                            مستعد للارتقاء بمستواك؟
                        </h2>
                        <p className="text-gray-600 mb-8 text-lg">
                            لا تفوت الفرصة! العرض محدود لل 50 الأوائل فقط
                        </p>
                        <div className="flex justify-center">
                            <a
                                href={`https://wa.me/${whatsappNumber}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Button
                                    size="lg"
                                    className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white text-lg py-6 px-8 shadow-lg shadow-primary/25 rounded-2xl"
                                >
                                    <MessageCircle className="ml-2 h-5 w-5" />
                                    تواصل عبر الواتساب
                                </Button>
                            </a>
                        </div>
                    </Card>
                </div>
            </section>

            {/* Footer Contact */}
            <section className="py-8 px-4 border-t border-gray-100">
                <div className="container mx-auto text-center">
                    <p className="text-gray-600">
                        هل لديك أسئلة؟ تواصل معنا:{" "}
                        <a
                            href={`https://wa.me/${whatsappNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-700 font-bold"
                        >
                            {whatsappNumber.startsWith('212') ? `+${whatsappNumber.slice(0, 3)} ${whatsappNumber.slice(3)}` : whatsappNumber}
                        </a>
                    </p>
                </div>
            </section>
        </div>
    );
}
