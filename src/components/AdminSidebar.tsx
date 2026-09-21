import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, Warehouse, Truck, ShoppingCart, Users,
  BarChart2, Brain, FileText, Shield, Settings, Sparkles, LogOut, Menu, Bell, TrendingUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavItem { label: string; icon: React.ReactNode; href: string; }

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: <LayoutDashboard size={17} />, href: '/admin/dashboard' },
  { label: 'Products', icon: <Package size={17} />, href: '/admin/products' },
  { label: 'Inventory', icon: <Warehouse size={17} />, href: '/admin/inventory' },
  { label: 'Suppliers', icon: <Truck size={17} />, href: '/admin/suppliers' },
  { label: 'Purchases', icon: <ShoppingCart size={17} />, href: '/admin/purchases' },
  { label: 'Customers', icon: <Users size={17} />, href: '/admin/customers' },
  { label: 'Sales', icon: <TrendingUp size={17} />, href: '/admin/sales' },
  { label: 'Customer Insights', icon: <BarChart2 size={17} />, href: '/admin/insights' },
  { label: 'Recommendations', icon: <Brain size={17} />, href: '/admin/recommendations' },
  { label: 'Reports', icon: <FileText size={17} />, href: '/admin/reports' },
  { label: 'Users & Access', icon: <Shield size={17} />, href: '/admin/users' },
  { label: 'Settings', icon: <Settings size={17} />, href: '/admin/settings' },
];

export default function AdminSidebar({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isActive = (href: string) => location.pathname === href;

  const handleLogout = () => { logout(); navigate('/admin/login'); };

  const roleLabel: Record<string, string> = {
    super_admin: 'Super Admin',
    beauty_admin: 'Beauty Admin',
    beauty_staff: 'Beauty Staff',
  };

  const notifs = [
    { text: 'Low stock: Classic Cleanser (8 units)', time: '15 min ago', dot: 'bg-amber-400' },
    { text: 'New order #PGB-2026-08842', time: '2 min ago', dot: 'bg-blue-400' },
    { text: 'AI model retrained — 94.2% accuracy', time: '3 hr ago', dot: 'bg-[var(--primary)]' },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center flex-shrink-0">
          <Sparkles size={16} className="text-white" />
        </div>
        {!collapsed && (
          <div>
            <div className="text-white font-semibold text-sm leading-none">P&G Beauty</div>
            <div className="text-white/50 text-[10px] mt-0.5 font-mono">MIS Admin</div>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 scrollbar-hide">
        {navItems.map(item => (
          <Link
            key={item.label}
            to={item.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius)] text-sm font-medium transition-all mb-0.5 ${
              isActive(item.href)
                ? 'bg-[var(--primary)] text-white'
                : 'text-white/60 hover:text-white hover:bg-white/8'
            }`}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className={`flex items-center gap-3 px-2 py-2 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-7 h-7 rounded-full bg-[var(--primary)]/30 flex items-center justify-center flex-shrink-0 text-xs text-white font-semibold">
            {user?.initials || 'A'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-white text-xs font-medium truncate">{roleLabel[user?.role || ''] || 'Admin'}</div>
              <div className="text-white/40 text-[10px] truncate">{user?.email}</div>
            </div>
          )}
          {!collapsed && (
            <button onClick={handleLogout} title="Sign out" className="text-white/40 hover:text-white transition-colors p-1 rounded hover:bg-white/10">
              <LogOut size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[var(--background)] overflow-hidden">
      {/* Desktop sidebar */}
      <aside className={`hidden md:flex flex-col flex-shrink-0 bg-[var(--slate-admin)] transition-all duration-300 ${collapsed ? 'w-16' : 'w-56'}`}>
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-56 bg-[var(--slate-admin)] h-full animate-slide-in">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 flex items-center justify-between px-4 border-b border-[var(--border)] bg-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setCollapsed(c => !c)} className="hidden md:flex w-8 h-8 items-center justify-center rounded-[var(--radius)] hover:bg-[var(--secondary)] text-[var(--muted-foreground)] transition-colors">
              <Menu size={16} />
            </button>
            <button onClick={() => setMobileOpen(true)} className="md:hidden w-8 h-8 flex items-center justify-center rounded-[var(--radius)] hover:bg-[var(--secondary)] text-[var(--muted-foreground)] transition-colors">
              <Menu size={16} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            {/* Notification bell */}
            <div className="relative">
              <button onClick={() => setNotifOpen(o => !o)} className="relative w-8 h-8 flex items-center justify-center rounded-[var(--radius)] hover:bg-[var(--secondary)] text-[var(--muted-foreground)] transition-colors">
                <Bell size={16} />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[var(--primary)]" />
              </button>
              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setNotifOpen(false)} />
                  <div className="absolute right-0 top-10 z-40 w-72 bg-white border border-[var(--border)] rounded-[var(--radius-xl)] shadow-xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
                      <span className="font-semibold text-sm">Notifications</span>
                      <span className="text-xs text-[var(--primary)] cursor-pointer">Mark all read</span>
                    </div>
                    {notifs.map((n, i) => (
                      <div key={i} className="flex items-start gap-3 px-4 py-3 border-b border-[var(--border)] last:border-0 hover:bg-[var(--secondary)] transition-colors cursor-pointer">
                        <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.dot}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-[var(--foreground)] leading-snug">{n.text}</p>
                          <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5">{n.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="w-7 h-7 rounded-full bg-[var(--primary)]/20 flex items-center justify-center text-xs text-[var(--primary)] font-semibold">
              {user?.initials || 'A'}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
