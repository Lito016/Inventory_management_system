import { formatPHP } from '@/lib/utils/currency';

interface AmountDisplayProps {
  value: string | number;
  showPesoSign?: boolean;
  className?: string;
}

export function AmountDisplay({ value, showPesoSign = true, className = '' }: AmountDisplayProps) {
  const formatted = showPesoSign ? formatPHP(value) : formatPHP(value).replace('₱', '');
  return (
    <span className={`font-mono text-sm ${className}`}>
      {formatted}
    </span>
  );
}
