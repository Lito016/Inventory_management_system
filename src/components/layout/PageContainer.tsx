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
        <h1 className="font-display text-2xl font-semibold text-gray-900 tracking-tight">
          {title}
        </h1>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  );
}
