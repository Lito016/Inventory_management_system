import { isDemoMode } from '@/lib/demo';

export function DemoBanner() {
  if (!isDemoMode()) return null;

  return (
    <div
      role="status"
      className="bg-amber-50 border-b border-amber-200 px-4 py-1 text-center text-[11px] font-medium tracking-wide text-amber-800"
    >
      DEMO · sample data only — edits reset on reload
    </div>
  );
}
