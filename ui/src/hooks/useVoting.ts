import { useState } from 'react';
import { useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { PACKAGE_ID, PLATFORM_CONFIG_ID } from '@/lib/constants';
import { CreateVotingParams } from '@/types';
import { toast } from 'sonner';

export function useVoting() {
  const client = useSuiClient();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const [isLoading, setIsLoading] = useState(false);

  const createVoting = async (params: CreateVotingParams) => {
    setIsLoading(true);
    try {
      const tx = new Transaction();

      tx.moveCall({
        target: `${PACKAGE_ID}::voting::create_voting`,
        arguments: [
          tx.object(PLATFORM_CONFIG_ID),
          tx.pure.string(params.question),
          tx.pure.option('string', params.description),
          tx.pure.option('string', params.imageUrl),
          tx.pure.vector('string', params.options),
          tx.pure.option('u64', params.endTime),
          tx.object('0x6'),
        ],
      });

      const result = await signAndExecute({ transaction: tx });
      toast.success('Poll created successfully!');
      return result;
    } catch (error: any) {
      console.error('Error creating voting:', error);
      toast.error(error.message || 'Failed to create poll');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const vote = async (votingId: string, optionIndex: number) => {
    setIsLoading(true);
    try {
      const tx = new Transaction();

      tx.moveCall({
        target: `${PACKAGE_ID}::voting::vote`,
        arguments: [
          tx.object(PLATFORM_CONFIG_ID),
          tx.object(votingId),
          tx.pure.u64(optionIndex),
          tx.object('0x6'),
        ],
      });

      const result = await signAndExecute({ transaction: tx });
      toast.success('Vote cast successfully!');
      return result;
    } catch (error: any) {
      console.error('Error voting:', error);
      
      if (error.message?.includes('E_ALREADY_VOTED')) {
        toast.error('You have already voted in this poll');
      } else if (error.message?.includes('E_VOTING_CLOSED')) {
        toast.error('This voting is closed');
      } else if (error.message?.includes('E_VOTING_ENDED')) {
        toast.error('This voting has ended');
      } else {
        toast.error(error.message || 'Failed to cast vote');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const closeVoting = async (votingId: string) => {
    setIsLoading(true);
    try {
      const tx = new Transaction();

      tx.moveCall({
        target: `${PACKAGE_ID}::voting::close_voting`,
        arguments: [tx.object(votingId), tx.object('0x6')],
      });

      const result = await signAndExecute({ transaction: tx });
      toast.success('Poll closed successfully!');
      return result;
    } catch (error: any) {
      console.error('Error closing voting:', error);
      
      if (error.message?.includes('E_NOT_CREATOR')) {
        toast.error('Only the creator can close this poll');
      } else {
        toast.error(error.message || 'Failed to close poll');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteVoting = async (votingId: string) => {
    setIsLoading(true);
    try {
      const tx = new Transaction();

      tx.moveCall({
        target: `${PACKAGE_ID}::voting::delete_voting`,
        arguments: [tx.object(votingId), tx.object('0x6')],
      });

      const result = await signAndExecute({ transaction: tx });
      toast.success('Poll deleted successfully!');
      return result;
    } catch (error: any) {
      console.error('Error deleting voting:', error);
      
      if (error.message?.includes('E_NOT_CREATOR')) {
        toast.error('Only the creator can delete this poll');
      } else if (error.message?.includes('E_VOTING_STILL_ACTIVE')) {
        toast.error('Cannot delete an active poll');
      } else {
        toast.error(error.message || 'Failed to delete poll');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createVoting,
    vote,
    closeVoting,
    deleteVoting,
    isLoading,
  };
}