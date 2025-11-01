import { useSuiClient as useDefaultSuiClient } from '@mysten/dapp-kit';
import { useQuery } from '@tanstack/react-query';
import { PACKAGE_ID } from '@/lib/constants';

export function useSuiClient() {
  const client = useDefaultSuiClient();

  const getVotingObject = async (votingId: string) => {
    const object = await client.getObject({
      id: votingId,
      options: {
        showContent: true,
        showOwner: true,
        showType: true,
      },
    });
    
    if (object.data?.content?.dataType === 'moveObject') {
      return object.data.content.fields;
    }
    throw new Error('Invalid voting object');
  };

  const queryEvents = async (eventType: string, limit: number = 50) => {
    return await client.queryEvents({
      query: {
        MoveEventType: `${PACKAGE_ID}::events::${eventType}`,
      },
      limit,
      order: 'descending',
    });
  };

  return { client, getVotingObject, queryEvents };
}

export function useVotingObject(votingId: string | undefined) {
  const { getVotingObject } = useSuiClient();

  return useQuery({
    queryKey: ['voting', votingId],
    queryFn: () => getVotingObject(votingId!),
    enabled: !!votingId,
    refetchInterval: 5000,
  });
}

export function useAllVotings() {
  const { queryEvents } = useSuiClient();

  return useQuery({
    queryKey: ['votings', 'all'],
    queryFn: async () => {
      const events = await queryEvents('VotingCreated');
      return events.data.map((event) => ({
        id: event.parsedJson?.voting_id,
        creator: event.parsedJson?.creator,
        question: event.parsedJson?.question,
        optionsCount: event.parsedJson?.options_count,
        endTime: event.parsedJson?.end_time,
        timestamp: event.parsedJson?.timestamp,
      }));
    },
    refetchInterval: 15000,
  });
}