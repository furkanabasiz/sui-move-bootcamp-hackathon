import { Transaction } from "@mysten/sui/transactions";
import { SUI_CLOCK_OBJECT_ID } from "@mysten/sui/utils";

export function createVoting(
    packageId: string,
    configId: string,
    question: string,
    description: string | null,
    imageUrl: string | null,
    options: string[],
    endTime: number | null
): Transaction {
    const tx = new Transaction();

    tx.moveCall({
        target: `${packageId}::voting::create_voting`,
        arguments: [
            tx.object(configId),
            tx.pure.string(question),
            description !== null ? tx.pure.option("string", description) : tx.pure.option("string", null),
            imageUrl !== null ? tx.pure.option("string", imageUrl) : tx.pure.option("string", null),
            tx.pure.vector("string", options),
            endTime !== null ? tx.pure.option("u64", BigInt(endTime)) : tx.pure.option("u64", null),
            tx.object(SUI_CLOCK_OBJECT_ID),
        ],
    });

    return tx;
}
