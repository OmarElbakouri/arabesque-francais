import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import logo from '@/assets/logo.jpg';

export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src={logo} alt="BCLT" className="h-12 w-auto" />
              <span className="text-lg font-bold">BCLT الفرنسية</span>
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              منصة متخصصة في تعليم اللغة الفرنسية للناطقين بالعربية
            </p>
            <div className="flex gap-3">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-4">روابط سريعة</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/courses" className="text-muted-foreground hover:text-primary">الدورات</Link></li>
              <li><Link to="/about" className="text-muted-foreground hover:text-primary">من نحن</Link></li>
              <li><Link to="/blog" className="text-muted-foreground hover:text-primary">المدونة</Link></li>
              <li><Link to="/faq" className="text-muted-foreground hover:text-primary">الأسئلة الشائعة</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4">قانوني</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/terms" className="text-muted-foreground hover:text-primary">الشروط والأحكام</Link></li>
              <li><Link to="/privacy" className="text-muted-foreground hover:text-primary">سياسة الخصوصية</Link></li>
              <li><Link to="/refund" className="text-muted-foreground hover:text-primary">سياسة الاسترجاع</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4">اتصل بنا</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail size={16} />
                <span>info@bclt.ma</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone size={16} />
                <span>+212 5XX-XXXXXX</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <MapPin size={16} />
                <span>الدار البيضاء، المغرب</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 BCLT الفرنسية. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
}
