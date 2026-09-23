interface BadgeProps {
  status: string;
  colorMap: Record<string, { bg: string; text: string; border: string }>;
}

export function Badge({ status, colorMap }: BadgeProps) {
  const colors = colorMap[status] || { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium border ${colors.bg} ${colors.text} ${colors.border}`}>
      {status}
    </span>
  );
}
