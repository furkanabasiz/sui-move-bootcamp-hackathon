import { useSuiClientQuery } from "@mysten/dapp-kit";
import { PACKAGE_ID } from "../constants";

export interface VotingData {
  question: string;
  description: string | null;
  image_url: string | null;
  options: string[];
  vote_counts: number[];
  total_votes: number;
  is_closed: boolean;
  creator: string;
  created_at: string;
}

export function useVotingData(votingId: string) {
  const { data, isPending, error } = useSuiClientQuery(
    "getObject",
    {
      id: votingId,
      options: {
        showContent: true,
        showDisplay: true,
      },
    },
    {
      enabled: !!votingId,
    }
  );

  const votingData: VotingData | null = data?.data?.content
    ? parseVotingObject(data.data.content)
    : null;

  return { data: votingData, isPending, error };
}

function parseVotingObject(content: any): VotingData | null {
  try {
    if (content.dataType !== "moveObject") {
      return null;
    }

    const fields = content.fields;
    
    // Convert VecMap vote_counts to array
    const voteCountsArray: number[] = [];
    if (fields.vote_counts?.fields?.contents) {
      const contents = fields.vote_counts.fields.contents;
      const maxIndex = contents.length;
      for (let i = 0; i < maxIndex; i++) {
        voteCountsArray.push(parseInt(contents[i]?.fields?.value || "0"));
      }
    }

    return {
      question: fields.question || "",
      description: fields.description?.fields?.some || null,
      image_url: fields.image_url?.fields?.some || null,
      options: fields.options || [],
      vote_counts: voteCountsArray,
      total_votes: parseInt(fields.total_votes || "0"),
      is_closed: fields.is_closed || false,
      creator: fields.creator || "",
      created_at: fields.created_at || "0",
    };
  } catch (error) {
    console.error("Error parsing voting object:", error);
    return null;
  }
}

export function useAllVotings() {
  const { data, isPending, error } = useSuiClientQuery(
    "queryEvents",
    {
      query: {
        MoveModule: {
          package: PACKAGE_ID,
          module: "events",
        },
      },
      limit: 100,
      order: "descending",
    },
    {
      enabled: true,
    }
  );

  // Extract voting IDs from events
  const votingIds = new Set<string>();
  if (data?.data) {
    data.data
      .filter((event) => event.type.includes("VotingCreated"))
      .forEach((event) => {
        if ((event.parsedJson as any)?.voting_id) {
          votingIds.add((event.parsedJson as any).voting_id);
        }
      });
  }

  return { data: Array.from(votingIds), isPending, error };
}
