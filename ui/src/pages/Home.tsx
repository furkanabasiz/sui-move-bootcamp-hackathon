import { Link } from 'react-router-dom';
import { useAllVotings } from '@/hooks/useSuiClient';
import { formatRelativeTime, formatAddress } from '@/lib/utils';
import { Loader2, Plus, Clock, User } from 'lucide-react';

export default function Home() {
  const { data: votings, isLoading } = useAllVotings();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold">Active Polls</h1>
          <p className="text-muted-foreground mt-2">
            Participate in decentralized voting
          </p>
        </div>
        <Link
          to="/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
        >
          <Plus className="w-5 h-5" />
          Create Poll
        </Link>
      </div>

      {/* Polls Grid */}
      {!votings || votings.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">No polls yet</p>
          <Link
            to="/create"
            className="inline-block mt-4 text-primary hover:underline"
          >
            Create the first poll →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {votings.map((voting) => (
            <Link
              key={voting.id}
              to={`/poll/${voting.id}`}
              className="block p-6 bg-card rounded-lg border hover:border-primary transition-all hover:shadow-lg"
            >
              <h3 className="font-semibold text-lg mb-3 line-clamp-2">
                {voting.question}
              </h3>

              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{formatAddress(voting.creator)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{formatRelativeTime(voting.timestamp)}</span>
                </div>

                <div className="pt-2 text-xs">
                  {voting.optionsCount} options
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <span className="text-sm font-medium text-primary">
                  View Details →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}