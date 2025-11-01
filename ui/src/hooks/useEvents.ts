import { useEffect, useState } from 'react';
import { useSuiClient } from '@mysten/dapp-kit';
import { SuiEvent } from '@mysten/sui/client';
import { PACKAGE_ID } from '@/lib/constants';
import { VotingEvent } from '@/types';

export function useVotingEvents(votingId?: string) {
  const client = useSuiClient();
  const [events, setEvents] = useState<VotingEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        
        const eventTypes = ['VotingCreated', 'VoteCasted', 'VotingClosed', 'VotingDeleted'];
        const allEvents: VotingEvent[] = [];

        for (const eventType of eventTypes) {
          const result = await client.queryEvents({
            query: {
              MoveEventType: `${PACKAGE_ID}::events::${eventType}`,
            },
            limit: 50,
            order: 'descending',
          });

          const parsedEvents = result.data
            .filter((event) => {
              if (votingId && event.parsedJson) {
                return event.parsedJson.voting_id === votingId;
              }
              return true;
            })
            .map((event) => ({
              type: eventType as VotingEvent['type'],
              votingId: event.parsedJson?.voting_id || '',
              timestamp: event.parsedJson?.timestamp || Date.now(),
              data: event.parsedJson,
            }));

          allEvents.push(...parsedEvents);
        }

        allEvents.sort((a, b) => b.timestamp - a.timestamp);
        setEvents(allEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
    const interval = setInterval(fetchEvents, 10000);

    return () => clearInterval(interval);
  }, [client, votingId]);

  return { events, isLoading };
}

export function useRealtimeVotes(votingId: string) {
  const client = useSuiClient();
  const [voteCount, setVoteCount] = useState<number>(0);

  useEffect(() => {
    if (!votingId) return;

    const subscribeToVotes = async () => {
      try {
        const unsubscribe = await client.subscribeEvent({
          filter: {
            MoveEventType: `${PACKAGE_ID}::events::VoteCasted`,
          },
          onMessage: (event: SuiEvent) => {
            if (event.parsedJson?.voting_id === votingId) {
              setVoteCount((prev) => prev + 1);
            }
          },
        });

        return unsubscribe;
      } catch (error) {
        console.error('Error subscribing to events:', error);
      }
    };

    let unsubscribeFn: (() => void) | undefined;

    subscribeToVotes().then((unsub) => {
      unsubscribeFn = unsub;
    });

    return () => {
      if (unsubscribeFn) {
        unsubscribeFn();
      }
    };
  }, [client, votingId]);

  return voteCount;
}