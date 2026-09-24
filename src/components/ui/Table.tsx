import { type ReactNode } from 'react';

export interface ColumnDef<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  rowClassName?: (item: T) => string;
}

export function Table<T>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No records found.',
  onRowClick,
  rowClassName,
}: TableProps<T>) {
  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-md overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {columns.map((col) => (
                <th key={col.key} aria-label={col.header || col.key} className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide text-left">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-gray-200">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-2.5">
                    <div className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: `${60 + Math.random() * 30}%` }} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-md p-8 text-center">
        <p className="text-sm text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-md overflow-x-auto">
      <table className="w-full min-w-[640px]">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            {columns.map((col) => (
              <th key={col.key} aria-label={col.header || col.key} className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide text-left">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => (
            <tr
              key={(item as unknown as Record<string, unknown>).id as string || idx}
              className={`border-b border-gray-200 last:border-b-0
                ${onRowClick ? 'cursor-pointer hover:bg-blue-50' : 'hover:bg-gray-50'}
                ${rowClassName?.(item) || ''} transition-colors`}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((col) => (
                <td key={col.key} className={`px-4 py-2.5 text-sm text-gray-700 ${col.className || ''}`}>
                  {col.render ? col.render(item) : ((item as unknown as Record<string, unknown>)[col.key] as ReactNode) ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
