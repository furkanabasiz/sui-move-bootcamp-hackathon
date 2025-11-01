import { CheckCircle, XCircle, Clock } from 'lucide-react';

type Status = 'active' | 'closed' | 'ended';

interface StatusBadgeProps {
  status: Status;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    active: {
      icon: CheckCircle,
      label: 'Active',
      className: 'text-green-600 bg-green-50 border-green-200',
    },
    closed: {
      icon: XCircle,
      label: 'Closed',
      className: 'text-red-600 bg-red-50 border-red-200',
    },
    ended: {
      icon: Clock,
      label: 'Ended',
      className: 'text-orange-600 bg-orange-50 border-orange-200',
    },
  };

  const { icon: Icon, label, className } = config[status];

  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${className}`}
    >
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}