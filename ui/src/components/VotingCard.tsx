import { Link } from 'react-router-dom';
import { formatAddress, formatRelativeTime } from '@/lib/utils';
import { User, Clock, BarChart3 } from 'lucide-react';
import StatusBadge from './StatusBadge';

interface VotingCardProps {
  id: string;
  question: string;
  creator: string;
  optionsCount: number;
  timestamp: number;
  isActive: boolean;
  isClosed: boolean;
  totalVotes?: number;
}

export default function VotingCard({
  id,
  question,
  creator,
  optionsCount,
  timestamp,
  isActive,
  isClosed,
  totalVotes = 0,
}: VotingCardProps) {
  const status = isClosed ? 'closed' : isActive ? 'active' : 'ended';

  return (
    <Link
      to={`/poll/${id}`}
      className="block p-6 bg-card rounded-lg border hover:border-primary transition-all hover:shadow-lg group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition flex-1">
          {question}
        </h3>
        <StatusBadge status={status} />
      </div>

      {/* Metadata */}
      <div className="space-y-2 text-sm text-muted-foreground mb-4">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4" />
          <span>{formatAddress(creator)}</span>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>{formatRelativeTime(timestamp)}</span>
        </div>

        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          <span>{totalVotes} votes • {optionsCount} options</span>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t">
        <span className="text-sm font-medium text-primary group-hover:underline">
          View Details →
        </span>
      </div>
    </Link>
  );
}