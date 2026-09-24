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
    <div className="bg-surface border-b border-gray-200 px-6">
      <div className="flex items-center gap-4 min-w-0">
        <button
          onClick={handleBack}
          className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <nav aria-label="Section tabs" className="flex gap-1 flex-1 min-w-0 overflow-x-auto">
        {tabs.map((tab) => {
          const active = isActive(tab.to);
          return (
            <Link
              key={tab.to}
              to={tab.to}
              aria-current={active ? 'page' : undefined}
              className={`relative px-4 py-3 text-sm font-medium transition-all duration-200 ease-in-out rounded-t-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500 ${
                active
                  ? 'text-link'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="relative z-10">{tab.label}</span>
              {active && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-accent-500 to-violet-500 rounded-t transition-all duration-200" />
              )}
            </Link>
          );
        })}
        </nav>
      </div>
    </div>
  );
}
