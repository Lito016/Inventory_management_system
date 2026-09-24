import { useState } from 'react';

interface DateRangePickerProps {
  fromDate: string;
  toDate: string;
  onChange: (from: string, to: string) => void;
}

export function DateRangePicker({ fromDate, toDate, onChange }: DateRangePickerProps) {
  const [localFrom, setLocalFrom] = useState(fromDate);
  const [localTo, setLocalTo] = useState(toDate);

  const handleApply = () => {
    onChange(localFrom, localTo);
  };

  return (
    <div className="flex items-end gap-2">
      <div className="space-y-1">
        <label className="block text-xs font-medium text-gray-500">From</label>
        <input
          type="date"
          value={localFrom}
          onChange={(e) => setLocalFrom(e.target.value)}
          className="rounded-sm border border-gray-300 px-3 py-2 text-sm text-gray-800
            focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
        />
      </div>
      <div className="space-y-1">
        <label className="block text-xs font-medium text-gray-500">To</label>
        <input
          type="date"
          value={localTo}
          onChange={(e) => setLocalTo(e.target.value)}
          className="rounded-sm border border-gray-300 px-3 py-2 text-sm text-gray-800
            focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
        />
      </div>
      <button
        onClick={handleApply}
        className="px-3 py-2 text-sm font-medium text-link hover:bg-primary-50 rounded-sm transition-colors"
      >
        Apply
      </button>
    </div>
  );
}
