import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  FileText, 
  DollarSign, 
  UserCog,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { useState } from 'react';

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check if user is admin
  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { icon: LayoutDashboard, label: 'لوحة التحكم', path: '/admin' },
    { icon: Users, label: 'المستخدمين', path: '/admin/users' },
    { icon: UserCog, label: 'الفريق التجاري', path: '/admin/sales' },
    { icon: BookOpen, label: 'الدورات', path: '/admin/courses' },
    { icon: FileText, label: 'المستندات', path: '/admin/documents' },
    { icon: DollarSign, label: 'المدفوعات', path: '/admin/payments' },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-card border-b z-50 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary">لوحة الإدارة</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:static inset-y-0 right-0 z-40
            w-64 bg-card border-l transform transition-transform duration-200
            ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
            lg:block
          `}
        >
          <div className="h-full flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b hidden lg:block">
              <h1 className="text-2xl font-bold text-primary">لوحة الإدارة</h1>
              <p className="text-sm text-muted-foreground mt-1">BCLT Français</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 mt-16 lg:mt-0">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${
                      isActive(item.path)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }
                  `}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* User Info & Logout */}
            <div className="p-4 border-t">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold">
                    {user.prenom.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{user.prenom} {user.nom}</p>
                  <p className="text-xs text-muted-foreground">مدير النظام</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={logout}
              >
                <LogOut className="w-4 h-4" />
                تسجيل الخروج
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:mr-64 mt-16 lg:mt-0">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
