import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, LogOut, BookOpen, BarChart3, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import logo from '@/assets/logo.jpg';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const roleColors = {
    NORMAL: 'bg-muted text-muted-foreground',
    PREMIUM: 'bg-primary text-primary-foreground',
    VIP: 'bg-secondary text-secondary-foreground',
    ADMIN: 'bg-destructive text-destructive-foreground',
  };

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 shadow-custom-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="BCLT" className="h-12 w-auto" />
            <span className="text-xl font-bold text-foreground">BCLT الفرنسية</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`link-animated ${isActive('/') ? 'text-primary font-bold' : 'text-foreground'}`}
            >
              الرئيسية
            </Link>
            <Link
              to="/courses"
              className={`link-animated ${isActive('/courses') ? 'text-primary font-bold' : 'text-foreground'}`}
            >
              الدورات
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/dashboard"
                  className={`link-animated ${isActive('/dashboard') ? 'text-primary font-bold' : 'text-foreground'}`}
                >
                  لوحة التحكم
                </Link>
                {user?.role === 'ADMIN' && (
                  <Link
                    to="/admin"
                    className={`link-animated ${isActive('/admin') ? 'text-primary font-bold' : 'text-foreground'}`}
                  >
                    الإدارة
                  </Link>
                )}
              </>
            )}
            <Link
              to="/blog"
              className={`link-animated ${isActive('/blog') ? 'text-primary font-bold' : 'text-foreground'}`}
            >
              المدونة
            </Link>
            <Link
              to="/contact"
              className={`link-animated ${isActive('/contact') ? 'text-primary font-bold' : 'text-foreground'}`}
            >
              اتصل بنا
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link to="/cart">
                  <Button variant="ghost" size="icon">
                    <ShoppingCart className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/messages">
                  <Button variant="ghost" size="icon">
                    <MessageSquare className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/profile" className="flex items-center gap-2">
                  {user && <Badge className={roleColors[user.role]}>{user.role}</Badge>}
                  <div className="text-right">
                    <div className="text-sm font-medium">{user?.prenom} {user?.nom}</div>
                  </div>
                </Link>
                <Button variant="ghost" size="icon" onClick={logout}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">تسجيل الدخول</Button>
                </Link>
                <Link to="/register">
                  <Button>إنشاء حساب</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-foreground"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-4 animate-fade-in">
            <Link
              to="/"
              className="block py-2 text-foreground"
              onClick={() => setIsOpen(false)}
            >
              الرئيسية
            </Link>
            <Link
              to="/courses"
              className="block py-2 text-foreground"
              onClick={() => setIsOpen(false)}
            >
              الدورات
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/dashboard"
                  className="block py-2 text-foreground"
                  onClick={() => setIsOpen(false)}
                >
                  لوحة التحكم
                </Link>
                {user?.role === 'ADMIN' && (
                  <Link
                    to="/admin"
                    className="block py-2 text-foreground"
                    onClick={() => setIsOpen(false)}
                  >
                    الإدارة
                  </Link>
                )}
              </>
            )}
            <Link
              to="/blog"
              className="block py-2 text-foreground"
              onClick={() => setIsOpen(false)}
            >
              المدونة
            </Link>
            <Link
              to="/contact"
              className="block py-2 text-foreground"
              onClick={() => setIsOpen(false)}
            >
              اتصل بنا
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="block py-2" onClick={() => setIsOpen(false)}>
                  {user && <Badge className={roleColors[user.role]}>{user.prenom} {user.nom} - {user.role}</Badge>}
                </Link>
                <Button variant="destructive" onClick={() => { logout(); setIsOpen(false); }} className="w-full">
                  تسجيل الخروج
                </Button>
              </>
            ) : (
              <div className="space-y-2">
                <Link to="/login" className="block" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full">تسجيل الدخول</Button>
                </Link>
                <Link to="/register" className="block" onClick={() => setIsOpen(false)}>
                  <Button className="w-full">إنشاء حساب</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
