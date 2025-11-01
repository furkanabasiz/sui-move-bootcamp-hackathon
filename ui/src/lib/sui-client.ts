import { SuiClient } from '@mysten/sui/client';
import { NETWORK, SUI_NETWORK_CONFIG } from './constants';

export const suiClient = new SuiClient({
  url: SUI_NETWORK_CONFIG[NETWORK as keyof typeof SUI_NETWORK_CONFIG],
});

export async function getVotingObject(votingId: string) {
  try {
    const object = await suiClient.getObject({
      id: votingId,
      options: {
        showContent: true,
        showOwner: true,
      },
    });
    return object;
  } catch (error) {
    console.error('Error fetching voting object:', error);
    throw error;
  }
}

export async function getAllVotings(packageId: string) {
  try {
    // Query for all Voting objects
    const objects = await suiClient.queryEvents({
      query: {
        MoveEventType: `${packageId}::events::VotingCreated`,
      },
      limit: 50,
      order: 'descending',
    });
    return objects;
  } catch (error) {
    console.error('Error fetching votings:', error);
    throw error;
  }
}