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

  const planColors: Record<string, string> = {
    FREE: 'bg-gray-500 text-white',
    NORMAL: 'bg-blue-500 text-white',
    VIP: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white',
  };

  const planLabels: Record<string, string> = {
    FREE: 'مجاني',
    NORMAL: 'عادي',
    VIP: 'VIP',
  };

  const roleColors: Record<string, string> = {
    USER: 'bg-gray-500 text-white',
    COMMERCIAL: 'bg-green-500 text-white',
    ADMIN: 'bg-red-500 text-white',
  };

  const getPlanBadge = () => {
    // For ADMIN and COMMERCIAL, show their role
    if (user?.role === 'ADMIN') {
      return { colorClass: 'bg-red-500 text-white', label: 'مدير' };
    }
    if (user?.role === 'COMMERCIAL') {
      return { colorClass: 'bg-green-500 text-white', label: 'تجاري' };
    }
    // For regular users, show their plan
    const plan = user?.plan || 'FREE';
    const colorClass = planColors[plan] || planColors.FREE;
    const label = planLabels[plan] || planLabels.FREE;
    return { colorClass, label };
  };

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 shadow-custom-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/home" className="flex items-center gap-3">
            <img src={logo} alt="BCLT" className="h-12 w-auto" />
            <span className="text-xl font-bold text-foreground">BCLT الفرنسية</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            {user?.role !== 'COMMERCIAL' && (
              <Link
                to="/courses"
                className={`link-animated ${isActive('/courses') ? 'text-primary font-bold' : 'text-foreground'}`}
              >
                الدورات
              </Link>
            )}
            <Link
              to="/documents"
              className={`link-animated ${isActive('/documents') ? 'text-primary font-bold' : 'text-foreground'}`}
            >
              المستندات
            </Link>
            {isAuthenticated && (
              <>
                {user?.role === 'ADMIN' && (
                  <Link
                    to="/admin"
                    className={`link-animated ${isActive('/admin') ? 'text-primary font-bold' : 'text-foreground'}`}
                  >
                    الإدارة
                  </Link>
                )}
                {user?.role === 'COMMERCIAL' && (
                  <Link
                    to="/commercial"
                    className={`link-animated ${isActive('/commercial') ? 'text-primary font-bold' : 'text-foreground'}`}
                  >
                    Tableau de Bord
                  </Link>
                )}
              </>
            )}
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
                  {user && <Badge className={getPlanBadge().colorClass}>{getPlanBadge().label}</Badge>}
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
            {user?.role !== 'COMMERCIAL' && (
              <Link
                to="/courses"
                className="block py-2 text-foreground"
                onClick={() => setIsOpen(false)}
              >
                الدورات
              </Link>
            )}
            <Link
              to="/documents"
              className="block py-2 text-foreground"
              onClick={() => setIsOpen(false)}
            >
              المستندات
            </Link>
            {isAuthenticated && (
              <>
                {user?.role === 'ADMIN' && (
                  <Link
                    to="/admin"
                    className="block py-2 text-foreground"
                    onClick={() => setIsOpen(false)}
                  >
                    الإدارة
                  </Link>
                )}
                {user?.role === 'COMMERCIAL' && (
                  <Link
                    to="/commercial"
                    className="block py-2 text-foreground"
                    onClick={() => setIsOpen(false)}
                  >
                    Tableau de Bord
                  </Link>
                )}
              </>
            )}
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
                  {user && <Badge className={getPlanBadge().colorClass}>{user.prenom} {user.nom} - {getPlanBadge().label}</Badge>}
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
