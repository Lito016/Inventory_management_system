import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, LogOut, Search, Bell } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useState, useRef, useEffect } from 'react';

const breadcrumbMap: Record<string, string> = {
  dashboard: 'Dashboard',
  finance: 'Finance',
  receivables: 'Receivables',
  payables: 'Payables',
  payments: 'Payments',
  'historical-debts': 'Historical Debts',
  b2b: 'B2B',
  'pre-orders': 'Pre-Orders',
  'purchase-orders': 'Purchase Orders',
  fulfillments: 'Fulfillments',
  b2c: 'B2C',
  'printing-orders': 'Printing Orders',
  inventory: 'Inventory',
  products: 'Products',
  adjustments: 'Adjustments',
  customers: 'Customers',
  suppliers: 'Suppliers',
  reports: 'Reports',
  documents: 'Documents',
  settings: 'Settings',
  users: 'Users',
};

export function Header() {
  const location = useLocation();
  const { profile, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Build breadcrumb from path
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => ({
    label: breadcrumbMap[segment] || segment,
    path: '/' + pathSegments.slice(0, index + 1).join('/'),
    isLast: index === pathSegments.length - 1,
  }));

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5">
        {breadcrumbs.map((crumb) => (
          <span key={crumb.path} className="flex items-center gap-1.5">
            {crumb.path !== '/' + pathSegments[0] && (
              <ChevronRight className="h-4 w-4 text-slate-300" />
            )}
            {crumb.isLast ? (
              <span className="text-sm font-semibold text-slate-800">{crumb.label}</span>
            ) : (
              <Link 
                to={crumb.path} 
                className="text-sm text-slate-500 hover:text-slate-700 transition-colors font-medium"
              >
                {crumb.label}
              </Link>
            )}
          </span>
        ))}
      </nav>

      {/* Right section */}
      <div className="flex items-center gap-3">
        {/* Search button */}
        <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
          <Search className="h-5 w-5" />
        </button>

        {/* Notifications */}
        <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-blue-600 rounded-full"></span>
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-200"></div>

        {/* User dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-semibold">
              {profile?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
            </div>
            <div className="flex flex-col items-start">
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
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
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
