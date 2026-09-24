import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FileText, ShoppingCart, Truck, Package, Users, Building2,
  BarChart3, FolderOpen, Settings, ChevronLeft, ChevronRight, Boxes,
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
      className={`fixed left-0 top-0 h-screen w-60 bg-rail flex flex-col z-40
        border-r border-rail-border
        transition-[transform,width] duration-200 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full invisible lg:visible'}
        lg:translate-x-0 ${collapsed ? 'lg:w-[68px]' : 'lg:w-60'}`}
    >
      {/* ── Brand ─────────────────────────────────── */}
      <div className="flex items-center h-16 px-4 border-b border-rail-border shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-accent-500 to-violet-500 flex items-center justify-center shrink-0 shadow-glow">
            <Boxes className="h-5 w-5 text-rail-ink" />
          </div>
          <div className={`flex flex-col ${collapsed ? 'lg:hidden' : ''}`}>
            <span className="text-rail-ink font-display font-semibold text-[15px] leading-tight tracking-tight">IMS</span>
            <span className="text-rail-muted text-[10px] leading-tight font-medium tracking-wide">Inventory Control</span>
          </div>
        </div>
        <button
          onClick={onToggleCollapse}
          className="ml-auto hidden lg:inline-flex p-1.5 text-rail-muted hover:text-rail-ink hover:bg-rail-hover rounded-md transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* ── Navigation ───────────────────────────── */}
      <nav aria-label="Main navigation" className="flex-1 overflow-y-auto py-3 px-2.5 space-y-1 scrollbar-thin">
        {navSections.map((section) => {
          const filtered = section.items.filter((i) => !i.adminOnly || isAdmin);
          if (filtered.length === 0) return null;
          return (
            <div key={section.title} className="mb-1.5">
              <div className={`px-3 pt-1.5 pb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-rail-muted ${collapsed ? 'lg:hidden' : ''}`}>
                {section.title}
              </div>
              {collapsed && <div className="hidden lg:block my-1 mx-2 border-t border-rail-border" />}
              {filtered.map((item) => {
                const active = isActive(item.to);
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onCloseMobile}
                    title={collapsed ? item.label : undefined}
                    aria-current={active ? 'page' : undefined}
                    className={`group relative flex items-center gap-2.5 rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                      collapsed ? 'lg:justify-center lg:mx-0 lg:px-0 lg:h-10' : 'px-3 h-9'
                    } ${
                      active
                        ? 'bg-primary-500/15 text-rail-active font-semibold'
                        : 'text-rail-text hover:bg-rail-hover hover:text-rail-ink font-medium'
                    }`}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-gradient-to-b from-accent-400 to-violet-400" />
                    )}
                    <Icon className={`h-[18px] w-[18px] shrink-0 ${active ? 'text-rail-active' : 'text-rail-muted group-hover:text-rail-text'}`} />
                    <span className={`text-[13px] truncate ${collapsed ? 'lg:hidden' : ''}`}>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* ── Footer ────────────────────────────────── */}
      <div className={`px-4 py-3 border-t border-rail-border ${collapsed ? 'lg:hidden' : ''}`}>
        <p className="text-[10px] text-rail-muted font-medium tracking-wide">v1.2 · demo dataset</p>
      </div>
    </aside>
  );
}
