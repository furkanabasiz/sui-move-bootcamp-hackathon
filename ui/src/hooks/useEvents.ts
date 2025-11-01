import { useEffect, useState } from "react";
import { useSuiClient } from "@mysten/dapp-kit";
import { SuiEvent } from "@mysten/sui/client";
import { PACKAGE_ID } from "../constants";

export interface VotingCreatedEvent {
  voting_id: string;
  creator: string;
  question: string;
  options_count: string;
  end_time: string | null;
  timestamp: string;
}

export interface VoteCastedEvent {
  voting_id: string;
  voter: string;
  option_index: string;
  timestamp: string;
}

export interface VotingClosedEvent {
  voting_id: string;
  closer: string;
  total_votes: string;
  timestamp: string;
}

export function useVotingEvents(votingId?: string) {
  const client = useSuiClient();
  const [createdEvents, setCreatedEvents] = useState<VotingCreatedEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      setError(null);
      try {
        const result = await client.queryEvents({
          query: {
            MoveModule: {
              package: PACKAGE_ID,
              module: "events",
            },
          },
          limit: 100,
          order: "descending",
        });

        const votingCreatedEvents = result.data
          .filter((event) => event.type.includes("VotingCreated"))
          .filter((event) => {
            if (votingId && event.parsedJson) {
              return (event.parsedJson as any).voting_id === votingId;
            }
            return true;
          })
          .map((event) => event.parsedJson as VotingCreatedEvent);

        setCreatedEvents(votingCreatedEvents);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, [client, votingId]);

  return { data: createdEvents, loading, error };
}

export function useRealtimeVotes(votingId: string) {
  const client = useSuiClient();
  const [voteCount, setVoteCount] = useState(0);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    async function setupSubscription() {
      const unsub = await client.subscribeEvent({
        filter: {
          MoveModule: {
            package: PACKAGE_ID,
            module: "events",
          },
        },
        onMessage: (event: SuiEvent) => {
          if ((event.parsedJson as any)?.voting_id === votingId) {
            setVoteCount((prev) => prev + 1);
          }
        },
      });
      
      unsubscribe = unsub;
    }

    setupSubscription();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [client, votingId]);

  return { voteCount };
}
