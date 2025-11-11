import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Users, DollarSign, Settings, LogOut, Menu, X, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import logoImg from '@/assets/logo.jpg';

const CommercialLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  if (!user || user.role !== 'COMMERCIAL') {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { icon: Users, label: 'Utilisateurs', path: '/commercial' },
    { icon: DollarSign, label: 'Revenus', path: '/commercial/revenues' },
    { icon: UserPlus, label: 'Créer un compte', path: '/commercial/create-user' },
    { icon: Settings, label: 'Paramètres', path: '/commercial/settings' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-background border-b z-50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logoImg} alt="BCLT" className="h-8 w-8" />
          <span className="font-bold text-lg">Tableau de Bord - Commercial</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-background border-r w-64 z-40 transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="p-6 border-b">
          <div className="flex items-center gap-3 mb-4">
            <img src={logoImg} alt="BCLT" className="h-10 w-10" />
            <div>
              <h1 className="font-bold text-lg">BCLT</h1>
              <p className="text-xs text-muted-foreground">Tableau de Bord - Commercial</p>
            </div>
          </div>
          <div className="bg-primary/10 rounded-lg p-3">
            <p className="text-sm font-medium">{user.prenom} {user.nom}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
            <div className="mt-2">
              <span className="inline-block bg-secondary text-white text-xs px-2 py-1 rounded">
                Commercial
              </span>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive(item.path)
                    ? 'bg-primary text-white'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            Déconnexion
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0">
        <div className="container mx-auto p-6">
          <Outlet />
        </div>
      </main>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default CommercialLayout;
