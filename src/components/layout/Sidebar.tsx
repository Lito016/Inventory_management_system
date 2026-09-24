import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FileText, ShoppingCart, Truck, Package, Users, Building2,
  BarChart3, FolderOpen, Settings, ChevronLeft, ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import { useRole } from '@/hooks/use-role';

interface NavItem { label: string; to: string; icon: LucideIcon; adminOnly?: boolean }
interface NavSection { title: string; items: NavItem[] }

const navSections: NavSection[] = [
  { title: 'Overview', items: [{ label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard }] },
  { title: 'Management', items: [
    { label: 'Finance', to: '/finance', icon: FileText },
    { label: 'Orders', to: '/b2b/pre-orders', icon: ShoppingCart },
    { label: 'Operations', to: '/b2b/receiving', icon: Truck },
    { label: 'Inventory', to: '/inventory/products', icon: Package },
  ]},
  { title: 'Directory', items: [
    { label: 'Customers', to: '/customers', icon: Users },
    { label: 'Suppliers', to: '/suppliers', icon: Building2 },
  ]},
  { title: 'Insights', items: [
    { label: 'Reports', to: '/reports', icon: BarChart3 },
    { label: 'Documents', to: '/documents', icon: FolderOpen },
  ]},
  { title: 'Admin', items: [{ label: 'Users', to: '/settings/users', icon: Settings, adminOnly: true }] },
];

interface SidebarProps {
  mobileOpen: boolean;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
}

export function Sidebar({ mobileOpen, collapsed, onToggleCollapse, onCloseMobile }: SidebarProps) {
  const { isAdmin } = useRole();
  const location = useLocation();

  const isActive = (to: string) =>
    location.pathname === to || location.pathname.startsWith(to + '/');

  return (
    <aside
      aria-label="Primary"
      className={`fixed left-0 top-0 h-screen w-60 bg-slate-900 flex flex-col z-40
        transition-[transform,width] duration-200 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full invisible lg:visible'}
        lg:translate-x-0 ${collapsed ? 'lg:w-[68px]' : 'lg:w-60'}`}
    >
      {/* ── Brand ─────────────────────────────────── */}
      <div className="flex items-center h-14 px-4 border-b border-slate-700/50 shrink-0">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">I</span>
          </div>
          <div className={`flex flex-col ${collapsed ? 'lg:hidden' : ''}`}>
            <span className="text-white font-semibold text-sm leading-tight tracking-tight">IMS</span>
            <span className="text-slate-400 text-[10px] leading-tight">Inventory Management System</span>
          </div>
        </div>
        <button
          onClick={onToggleCollapse}
          className="ml-auto hidden lg:inline-flex p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* ── Navigation ────────────────────────────── */}
      <nav aria-label="Main navigation" className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5 scrollbar-thin">
        {navSections.map((section) => {
          const filtered = section.items.filter((i) => !i.adminOnly || isAdmin);
          if (filtered.length === 0) return null;
          return (
            <div key={section.title} className="mb-1">
              <div className={`px-3 pt-2 pb-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 ${collapsed ? 'lg:hidden' : ''}`}>
                {section.title}
              </div>
              {collapsed && <div className="hidden lg:block my-0.5 mx-2 border-t border-slate-700/40" />}
              {filtered.map((item) => {
                const active = isActive(item.to);
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onCloseMobile}
                    title={collapsed ? item.label : undefined}
                    className={`group relative flex items-center gap-2.5 rounded-md transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                      collapsed ? 'lg:justify-center lg:mx-0 lg:px-0 lg:h-9' : 'px-3 h-8'
                    } ${
                      active
                        ? 'bg-blue-600/15 text-blue-400'
                        : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
                    }`}
                  >
                    {/* Active indicator bar */}
                    {active && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-blue-500" />
                    )}
                    <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                    <span className={`text-[13px] font-medium truncate ${collapsed ? 'lg:hidden' : ''}`}>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
