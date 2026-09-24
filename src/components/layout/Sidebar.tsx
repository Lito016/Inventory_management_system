import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FileText, ShoppingCart, Truck, Package, Users, Building2,
  BarChart3, FolderOpen, Settings, ChevronRight, Boxes,
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

const EASE = 'ease-[cubic-bezier(0.2,0,0,1)]';

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
        transition-[transform,width,visibility] duration-200 ${EASE}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full invisible lg:visible'}
        lg:translate-x-0 ${collapsed ? 'lg:w-[68px]' : 'lg:w-60'}`}
    >
      {/* ── Brand ─────────────────────────────────── */}
      <div className={`flex items-center h-16 shrink-0 border-b border-rail-border transition-[padding] duration-200 ${EASE} ${collapsed ? 'lg:pl-[15px] lg:pr-0' : 'px-4'}`}>
        <div className="flex items-center gap-3 min-w-0 overflow-hidden">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-accent-500 to-violet-500 flex items-center justify-center shrink-0 shadow-glow">
            <Boxes className="h-5 w-5 text-rail-ink" />
          </div>
          <div className={`flex flex-col min-w-0 transition-opacity duration-100 ${collapsed ? 'lg:opacity-0' : ''}`}>
            <span className="text-rail-ink font-display font-semibold text-[15px] leading-tight tracking-tight truncate">IMS</span>
            <span className="text-rail-muted text-[10px] leading-tight font-medium tracking-wide truncate">Inventory Control</span>
          </div>
        </div>
      </div>

      {/* Collapse toggle: floating knob half over the rail border (desktop only) */}
      <button
        onClick={onToggleCollapse}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className={`absolute -right-3 top-[70px] z-50 hidden lg:flex h-6 w-6 items-center justify-center rounded-full
          bg-surface border border-gray-300 text-gray-500 shadow-sm hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
          transition-transform duration-200 ${EASE} ${collapsed ? '' : 'rotate-180'}`}
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </button>

      {/* ── Navigation ───────────────────────────── */}
      <nav aria-label="Main navigation" className="flex-1 overflow-y-auto py-3 px-2.5 space-y-1">
        {navSections.map((section) => {
          const filtered = section.items.filter((i) => !i.adminOnly || isAdmin);
          if (filtered.length === 0) return null;
          return (
            <div key={section.title} className="mb-1.5">
              <div className={`px-3 pt-1.5 pb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-rail-muted truncate transition-opacity duration-100 ${collapsed ? 'lg:opacity-0' : ''}`}>
                {section.title}
              </div>
              <div className={`mx-2 my-1 border-t border-rail-border h-0 transition-opacity duration-200 ${EASE} opacity-0 ${collapsed ? 'lg:opacity-100' : ''}`} aria-hidden="true" />
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
                    className={`group relative flex items-center gap-2.5 rounded-lg h-9 px-3 transition-all duration-200 ${EASE}
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
                      ${collapsed ? 'lg:px-[14px]' : ''}
                      ${active
                        ? 'bg-primary-500/15 text-rail-active font-semibold'
                        : 'text-rail-text hover:bg-rail-hover hover:text-rail-ink font-medium'}`}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-gradient-to-b from-accent-400 to-violet-400" />
                    )}
                    <Icon className={`h-[18px] w-[18px] shrink-0 transition-colors ${active ? 'text-rail-active' : 'text-rail-muted group-hover:text-rail-text'}`} />
                    <span className={`text-[13px] truncate min-w-0 transition-opacity duration-100 ${collapsed ? 'lg:opacity-0' : ''}`}>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* ── Footer ────────────────────────────────── */}
      <div className="px-4 py-3 border-t border-rail-border overflow-hidden shrink-0">
        <p className={`text-[10px] text-rail-muted font-medium tracking-wide whitespace-nowrap transition-opacity duration-100 ${collapsed ? 'lg:opacity-0' : ''}`}>v1.2 · demo dataset</p>
      </div>
    </aside>
  );
}
