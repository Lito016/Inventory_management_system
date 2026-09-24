import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ChevronRight, LogOut, Search, Bell, Menu, Moon, Sun } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useDashboardSummary } from '@/hooks/use-finance';
import { useTheme } from '@/hooks/use-theme';
import { useState, useRef, useEffect, type RefObject } from 'react';

const breadcrumbMap: Record<string, string> = {
  dashboard: 'Dashboard',
  finance: 'Finance',
  receivables: 'Receivables',
  payables: 'Payables',
  payments: 'Payments',
  'historical-debts': 'Historical Debts',
  search: 'Search',
  b2b: 'B2B',
  'pre-orders': 'Pre-Orders',
  'purchase-orders': 'Purchase Orders',
  fulfillments: 'Fulfillments',
  receiving: 'Receiving',
  b2c: 'B2C',
  'printing-orders': 'Printing Orders',
  inventory: 'Inventory',
  products: 'Products',
  summary: 'Summary',
  adjustments: 'Adjustments',
  customers: 'Customers',
  suppliers: 'Suppliers',
  reports: 'Reports',
  documents: 'Documents',
  settings: 'Settings',
  users: 'Users',
};

interface HeaderProps {
  onOpenMobile: () => void;
  menuBtnRef: RefObject<HTMLButtonElement | null>;
}

export function Header({ onOpenMobile, menuBtnRef }: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const { data: summary } = useDashboardSummary();
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [query, setQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdowns on outside click.
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Focus the search input when the popover opens; Esc closes any open popover.
  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen && !bellOpen && !dropdownOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setSearchOpen(false); setBellOpen(false); setDropdownOpen(false); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [searchOpen, bellOpen, dropdownOpen]);

  // Breadcrumb shows module context only — the last crumb is dropped because the
  // page's own H1 already renders it (single-title rule, PRD v1.2 U6).
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const ancestorSegments = pathSegments.slice(0, -1);
  const breadcrumbs = ancestorSegments.map((segment, index) => ({
    label: breadcrumbMap[segment] || segment,
    path: '/' + ancestorSegments.slice(0, index + 1).join('/'),
  }));

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const term = query.trim();
    navigate(term ? `/finance/search?q=${encodeURIComponent(term)}` : '/finance/search');
    setSearchOpen(false);
    setQuery('');
  };

  const overdueCount = summary?.overdueCount ?? 0;
  const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface';
  const iconBtn = `p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors ${focusRing}`;
  const popover = 'absolute right-0 top-full mt-2 w-72 max-w-[calc(100vw-2rem)] bg-surface border border-gray-200 rounded-xl shadow-lg z-50';

  return (
    <header className="h-16 bg-surface/85 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20">
      <div className="flex items-center gap-2 min-w-0">
        {/* Mobile navigation trigger */}
        <button
          ref={menuBtnRef}
          onClick={onOpenMobile}
          aria-label="Open navigation menu"
          className={`lg:hidden p-2 -ml-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors ${focusRing}`}
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Breadcrumb (module context) */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 truncate">
          {breadcrumbs.map((crumb) => (
            <span key={crumb.path} className="flex items-center gap-1.5">
              <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
              <Link
                to={crumb.path}
                className={`text-sm text-gray-500 hover:text-gray-800 transition-colors font-medium rounded ${focusRing}`}
              >
                {crumb.label}
              </Link>
            </span>
          ))}
        </nav>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Search */}
        <div className="relative" ref={searchRef}>
          <button
            onClick={() => { setSearchOpen((o) => !o); setBellOpen(false); setDropdownOpen(false); }}
            aria-label="Search records"
            aria-expanded={searchOpen}
            className={`hidden sm:inline-flex items-center gap-2 pl-2.5 pr-1.5 h-8 rounded-lg border border-gray-200 bg-canvas text-sm text-gray-600 hover:border-gray-300 hover:text-gray-800 transition-colors ${focusRing}`}
          >
            <Search className="h-4 w-4" />
            <span className="pr-1">Search…</span>
            <span className="kbd">↵</span>
          </button>
          <button
            onClick={() => { setSearchOpen((o) => !o); setBellOpen(false); setDropdownOpen(false); }}
            aria-label="Search records"
            aria-expanded={searchOpen}
            className={`sm:hidden ${iconBtn}`}
          >
            <Search className="h-5 w-5" />
          </button>
          {searchOpen && (
            <form
              onSubmit={submitSearch}
              className={`${popover} p-2`}
            >
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search receivables & payables…"
                aria-label="Search query"
                className={`w-full px-3 py-2 text-sm bg-canvas border border-gray-200 rounded-lg placeholder:text-gray-400 text-gray-900 ${focusRing}`}
              />
              <p className="px-1 pt-1.5 text-[11px] text-gray-400">Press Enter to search finance records</p>
            </form>
          )}
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          className={iconBtn}
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={bellRef}>
          <button
            onClick={() => { setBellOpen((o) => !o); setSearchOpen(false); setDropdownOpen(false); }}
            aria-label={`Notifications: ${overdueCount} overdue receivables`}
            aria-expanded={bellOpen}
            className={`relative ${iconBtn}`}
          >
            <Bell className="h-5 w-5" />
            {overdueCount > 0 && (
              <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center bg-error-500 text-on-accent text-[10px] font-semibold rounded-full ring-2 ring-surface">
                {overdueCount > 9 ? '9+' : overdueCount}
              </span>
            )}
          </button>
          {bellOpen && (
            <div className={`${popover} py-1`}>
              <p className="px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 border-b border-gray-200">Alerts</p>
              {overdueCount > 0 ? (
                <Link
                  to="/finance/receivables"
                  onClick={() => setBellOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors ${focusRing}`}
                >
                  <span className="h-2 w-2 rounded-full bg-error-500 shrink-0" />
                  <span><span className="font-semibold">{overdueCount}</span> overdue receivable{overdueCount === 1 ? '' : 's'} need attention</span>
                </Link>
              ) : (
                <p className="px-4 py-3 text-sm text-gray-500">No overdue receivables. All clear.</p>
              )}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="hidden sm:block h-6 w-px bg-gray-200"></div>

        {/* User dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => { setDropdownOpen((o) => !o); setSearchOpen(false); setBellOpen(false); }}
            aria-expanded={dropdownOpen}
            className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors ${focusRing}`}
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-accent-500 to-violet-500 flex items-center justify-center text-on-accent text-xs font-semibold">
              {profile?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
            </div>
            <div className="hidden sm:flex flex-col items-start">
              <span className="text-sm font-semibold text-gray-800 leading-tight">
                {profile?.full_name || 'User'}
              </span>
              <span className="text-xs text-gray-500 capitalize leading-tight">
                {profile?.role || 'staff'}
              </span>
            </div>
          </button>

          {dropdownOpen && (
            <div className={`absolute right-0 top-full mt-2 w-56 bg-surface border border-gray-200 rounded-xl shadow-lg py-1 z-50`}>
              <div className="px-4 py-3 border-b border-gray-200">
                <p className="text-sm font-semibold text-gray-800">{profile?.full_name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{profile?.email}</p>
              </div>
              <button
                onClick={() => { signOut(); setDropdownOpen(false); }}
                className={`flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors ${focusRing}`}
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
