export interface Voting {
  id: string;
  creator: string;
  question: string;
  description?: string;
  imageUrl?: string;
  options: string[];
  voteCounts: Map<number, number>;
  isClosed: boolean;
  endTime?: number;
  createdAt: number;
  totalVotes: number;
}

export interface VotingEvent {
  type: 'VotingCreated' | 'VoteCasted' | 'VotingClosed' | 'VotingDeleted';
  votingId: string;
  timestamp: number;
  data: any;
}

export interface VotingResult {
  options: string[];
  votes: number[];
  totalVotes: number;
  isClosed: boolean;
}

export interface CreateVotingParams {
  question: string;
  description?: string;
  imageUrl?: string;
  options: string[];
  endTime?: number;
}

export interface WalletConnection {
  address: string;
  connected: boolean;
  balance?: string;
}