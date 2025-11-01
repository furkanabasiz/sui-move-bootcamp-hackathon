import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useVotingObject } from '@/hooks/useSuiClient';
import { useVoting } from '@/hooks/useVoting';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useRealtimeVotes } from '@/hooks/useEvents';
import {
  formatAddress,
  formatTimestamp,
  calculatePercentage,
  isVotingActive,
} from '@/lib/utils';
import {
  Loader2,
  User,
  Clock,
  CheckCircle,
  XCircle,
  Trash2,
  ArrowLeft,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';

export default function PollDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const account = useCurrentAccount();
  const { data: voting, isLoading, refetch } = useVotingObject(id);
  const { vote, closeVoting, deleteVoting, isLoading: isTxLoading } = useVoting();
  const realtimeVotes = useRealtimeVotes(id || '');

  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!voting) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4">Poll Not Found</h2>
        <p className="text-muted-foreground mb-6">
          This poll doesn't exist or has been deleted
        </p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>
      </div>
    );
  }

  const {
    question,
    description,
    creator,
    options,
    vote_counts,
    total_votes = 0,
    is_closed,
    end_time,
    created_at,
  } = voting as any;

  const isCreator = account?.address === creator;
  const isActive = !is_closed && isVotingActive(end_time);

  const handleVote = async () => {
    if (selectedOption === null || !id) {
      toast.error('Please select an option');
      return;
    }

    if (!account) {
      toast.error('Please connect your wallet to vote');
      return;
    }

    try {
      await vote(id, selectedOption);
      setSelectedOption(null);
      // Refetch voting data to update results
      setTimeout(() => refetch(), 2000);
    } catch (error) {
      console.error(error);
    }
  };

  const handleClose = async () => {
    if (!id) return;

    // Show confirmation toast with action
    toast.warning('Are you sure you want to close this poll?', {
      action: {
        label: 'Close',
        onClick: async () => {
          try {
            await closeVoting(id);
            setTimeout(() => refetch(), 2000);
          } catch (error) {
            console.error(error);
          }
        },
      },
      cancel: {
        label: 'Cancel',
        onClick: () => {},
      },
    });
  };

  const handleDelete = async () => {
    if (!id) return;

    toast.warning('Delete this poll? This action cannot be undone.', {
      action: {
        label: 'Delete',
        onClick: async () => {
          try {
            await deleteVoting(id);
            toast.success('Redirecting to home...');
            setTimeout(() => navigate('/'), 1500);
          } catch (error) {
            console.error(error);
          }
        },
      },
      cancel: {
        label: 'Cancel',
        onClick: () => {},
      },
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Polls
      </button>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-3xl font-bold flex-1">{question}</h1>
          
          {/* Status Badge */}
          <div className="ml-4">
            {is_closed ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600 border border-red-200">
                <XCircle className="w-3 h-3" />
                Closed
              </span>
            ) : isActive ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600 border border-green-200">
                <CheckCircle className="w-3 h-3" />
                Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-600 border border-orange-200">
                <Clock className="w-3 h-3" />
                Ended
              </span>
            )}
          </div>
        </div>

        {description && (
          <p className="text-muted-foreground mb-4 text-lg">{description}</p>
        )}

        {/* Metadata */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>Created by {formatAddress(creator)}</span>
            {isCreator && (
              <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded">
                You
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{formatTimestamp(created_at)}</span>
          </div>

          {end_time && (
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span>Ends {formatTimestamp(end_time)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Options & Results */}
      <div className="space-y-3 mb-6">
        {options.map((option: string, index: number) => {
          const votes = vote_counts?.[index] || 0;
          const percentage = calculatePercentage(votes, total_votes);
          const isSelected = selectedOption === index;

          return (
            <div
              key={index}
              onClick={() => isActive && setSelectedOption(index)}
              className={`relative p-4 border rounded-lg transition-all cursor-pointer ${
                isSelected
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                  : 'hover:border-gray-400 hover:shadow-sm'
              } ${!isActive ? 'cursor-default opacity-75' : ''}`}
            >
              {/* Option Header */}
              <div className="flex items-center justify-between mb-2 relative z-10">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected
                        ? 'border-primary bg-primary'
                        : 'border-gray-300'
                    }`}
                  >
                    {isSelected && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <span className="font-medium">{option}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {votes} votes • {percentage}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Total Votes */}
      <div className="text-center text-sm text-muted-foreground mb-6 p-3 bg-muted/50 rounded-lg">
        Total votes: <span className="font-semibold">{total_votes + realtimeVotes}</span>
      </div>

      {/* Wallet Connection Notice */}
      {!account && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800 text-center">
            <Lock className="w-4 h-4 inline mr-1" />
            Connect your wallet to vote
          </p>
        </div>
      )}

      {/* Inactive Poll Notice */}
      {!isActive && (
        <div className="mb-6 p-4 bg-muted border rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            {is_closed
              ? '🔒 This poll has been closed by the creator'
              : '⏰ This poll has ended'}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Vote Button */}
        {isActive && account && (
          <button
            onClick={handleVote}
            disabled={selectedOption === null || isTxLoading}
            className="flex-1 py-3 px-6 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium transition"
          >
            {isTxLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Casting Vote...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Cast Vote
              </>
            )}
          </button>
        )}

        {/* Close Button (Creator Only, Active Polls) */}
        {isCreator && isActive && (
          <button
            onClick={handleClose}
            disabled={isTxLoading}
            className="px-6 py-3 border border-orange-500 text-orange-600 rounded-lg hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium transition"
          >
            {isTxLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <XCircle className="w-4 h-4" />
                Close Poll
              </>
            )}
          </button>
        )}

        {/* Delete Button (Creator Only, Inactive Polls) */}
        {isCreator && !isActive && (
          <button
            onClick={handleDelete}
            disabled={isTxLoading}
            className="px-6 py-3 border border-red-500 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium transition"
          >
            {isTxLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Delete Poll
              </>
            )}
          </button>
        )}
      </div>

      {/* Creator Actions Info */}
      {isCreator && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-700 text-center">
            👤 You are the creator of this poll
            {isActive && ' • You can close it at any time'}
            {!isActive && ' • You can delete this poll'}
          </p>
        </div>
      )}
    </div>
  );
}