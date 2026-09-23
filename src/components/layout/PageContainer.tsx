import { type ReactNode } from 'react';

interface PageContainerProps {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function PageContainer({ title, actions, children }: PageContainerProps) {
  return (
    <div className="px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 border-l-3 border-primary-600 pl-3">
          {title}
        </h1>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  );
}
