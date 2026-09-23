import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface TabItem {
  label: string;
  to: string;
}

interface PageTabsProps {
  tabs: TabItem[];
}

export function PageTabs({ tabs }: PageTabsProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (to: string) => {
    return location.pathname === to || location.pathname.startsWith(to + '/');
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="bg-white border-b border-slate-200 px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={handleBack}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all duration-200"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <nav className="flex gap-1 flex-1">
        {tabs.map((tab) => {
          const active = isActive(tab.to);
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={`relative px-4 py-3 text-sm font-medium transition-all duration-200 ease-in-out ${
                active
                  ? 'text-blue-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className="relative z-10">{tab.label}</span>
              {active && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t transition-all duration-200" />
              )}
            </Link>
          );
        })}
        </nav>
      </div>
    </div>
  );
}
