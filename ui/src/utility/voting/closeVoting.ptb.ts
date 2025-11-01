import { Transaction } from "@mysten/sui/transactions";
import { SUI_CLOCK_OBJECT_ID } from "@mysten/sui/utils";

export function closeVoting(
    packageId: string,
    votingId: string
): Transaction {
    const tx = new Transaction();

    tx.moveCall({
        target: `${packageId}::voting::close_voting`,
        arguments: [
            tx.object(votingId),
            tx.object(SUI_CLOCK_OBJECT_ID),
        ],
    });

    return tx;
}