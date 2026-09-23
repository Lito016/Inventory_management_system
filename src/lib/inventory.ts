export const LOW_STOCK_THRESHOLD = 10;

export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';

export function stockStatus(quantity: number): StockStatus {
  if (!Number.isFinite(quantity) || quantity <= 0) return 'Out of Stock';
  if (quantity < LOW_STOCK_THRESHOLD) return 'Low Stock';
  return 'In Stock';
}

// PostgREST or()/filter syntax reserves , ( ); ILIKE treats % and _ as wildcards — strip them so a literal term search can't break the query or match loosely.
export function sanitizeSearchTerm(term: string): string {
  return term.replace(/[,()_%]/g, ' ').trim();
}

export function parseAdjustmentQuantity(input: string | number): number | null {
  const value = typeof input === 'number' ? input : Number.parseFloat(input);
  if (!Number.isFinite(value) || value === 0) return null;
  const rounded = Math.round(value * 100) / 100;
  return rounded === 0 ? null : rounded;
}

export function projectedQuantityAfterAdjustment(current: string | number, adjustment: number): number {
  const base = typeof current === 'number' ? current : Number.parseFloat(current);
  return (Number.isFinite(base) ? base : 0) + adjustment;
}

export function movementQuantityDisplay(movementType: string, quantity: string): string {
  const value = Number.parseFloat(quantity);
  if (movementType === 'received') return `+${Math.abs(value)}`;
  if (movementType === 'released') return `-${Math.abs(value)}`;
  return value > 0 ? `+${value}` : `${value}`;
}
