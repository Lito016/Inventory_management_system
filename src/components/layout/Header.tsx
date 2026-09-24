import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ChevronRight, LogOut, Search, Bell, Menu } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useDashboardSummary } from '@/hooks/use-finance';
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
  const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1';

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20 shadow-sm">
      <div className="flex items-center gap-2 min-w-0">
        {/* Mobile navigation trigger */}
        <button
          ref={menuBtnRef}
          onClick={onOpenMobile}
          aria-label="Open navigation menu"
          className={`lg:hidden p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors ${focusRing}`}
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Breadcrumb (module context) */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 truncate">
          {breadcrumbs.map((crumb) => (
            <span key={crumb.path} className="flex items-center gap-1.5">
              <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
              <Link
                to={crumb.path}
                className={`text-sm text-slate-500 hover:text-slate-700 transition-colors font-medium rounded ${focusRing}`}
              >
                {crumb.label}
              </Link>
            </span>
          ))}
        </nav>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-1 sm:gap-3">
        {/* Search */}
        <div className="relative" ref={searchRef}>
          <button
            onClick={() => { setSearchOpen((o) => !o); setBellOpen(false); setDropdownOpen(false); }}
            aria-label="Search records"
            aria-expanded={searchOpen}
            className={`p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors ${focusRing}`}
          >
            <Search className="h-5 w-5" />
          </button>
          {searchOpen && (
            <form
              onSubmit={submitSearch}
              className="absolute right-0 top-full mt-2 w-72 max-w-[calc(100vw-2rem)] bg-white border border-slate-200 rounded-lg shadow-lg p-2 z-50"
            >
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search receivables & payables…"
                aria-label="Search query"
                className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-md placeholder:text-gray-400 ${focusRing}`}
              />
              <p className="px-1 pt-1.5 text-[11px] text-slate-400">Press Enter to search finance records</p>
            </form>
          )}
        </div>

        {/* Notifications */}
        <div className="relative" ref={bellRef}>
          <button
            onClick={() => { setBellOpen((o) => !o); setSearchOpen(false); setDropdownOpen(false); }}
            aria-label={`Notifications: ${overdueCount} overdue receivables`}
            aria-expanded={bellOpen}
            className={`relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors ${focusRing}`}
          >
            <Bell className="h-5 w-5" />
            {overdueCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 flex items-center justify-center bg-error-600 text-white text-[10px] font-semibold rounded-full">
                {overdueCount > 9 ? '9+' : overdueCount}
              </span>
            )}
          </button>
          {bellOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 max-w-[calc(100vw-2rem)] bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50">
              <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400 border-b border-slate-100">Alerts</p>
              {overdueCount > 0 ? (
                <Link
                  to="/finance/receivables"
                  onClick={() => setBellOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors ${focusRing}`}
                >
                  <span className="h-2 w-2 rounded-full bg-error-600 shrink-0" />
                  <span><span className="font-semibold">{overdueCount}</span> overdue receivable{overdueCount === 1 ? '' : 's'} need attention</span>
                </Link>
              ) : (
                <p className="px-4 py-3 text-sm text-slate-500">No overdue receivables. All clear.</p>
              )}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="hidden sm:block h-6 w-px bg-slate-200"></div>

        {/* User dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => { setDropdownOpen((o) => !o); setSearchOpen(false); setBellOpen(false); }}
            aria-expanded={dropdownOpen}
            className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors ${focusRing}`}
          >
            <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-semibold">
              {profile?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
            </div>
            <div className="hidden sm:flex flex-col items-start">
              <span className="text-sm font-semibold text-slate-800 leading-tight">
                {profile?.full_name || 'User'}
              </span>
              <span className="text-xs text-slate-500 capitalize leading-tight">
                {profile?.role || 'staff'}
              </span>
            </div>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-800">{profile?.full_name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{profile?.email}</p>
              </div>
              <button
                onClick={() => { signOut(); setDropdownOpen(false); }}
                className={`flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors ${focusRing}`}
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
