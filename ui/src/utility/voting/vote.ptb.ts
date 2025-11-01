import { Transaction } from "@mysten/sui/transactions";
import { SUI_CLOCK_OBJECT_ID } from "@mysten/sui/utils";

export function vote(
    packageId: string,
    configId: string,
    votingId: string,
    optionIndex: number
): Transaction {
    const tx = new Transaction();

    tx.moveCall({
        target: `${packageId}::voting::vote`,
        arguments: [
            tx.object(configId),
            tx.object(votingId),
            tx.pure.u64(BigInt(optionIndex)),
            tx.object(SUI_CLOCK_OBJECT_ID),
        ],
    });

    return tx;
}
