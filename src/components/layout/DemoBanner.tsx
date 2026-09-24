import { isDemoMode } from '@/lib/demo';

export function DemoBanner() {
  if (!isDemoMode()) return null;

  return (
    <div
      role="status"
      className="bg-amber-100 border-b border-amber-300 px-4 py-1.5 text-center text-xs font-medium text-amber-900"
    >
      DEMO — sample data only. Edits reset when you reload the page.
    </div>
  );
}
