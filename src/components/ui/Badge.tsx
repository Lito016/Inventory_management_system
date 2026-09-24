interface BadgeProps {
  status: string;
  colorMap: Record<string, { bg: string; text: string; border: string }>;
}

export function Badge({ status, colorMap }: BadgeProps) {
  const colors = colorMap[status] || { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium leading-4 ring-1 ring-inset ${colors.bg} ${colors.text} ${colors.border.replace('border-', 'ring-')}`}>
      {status}
    </span>
  );
}
