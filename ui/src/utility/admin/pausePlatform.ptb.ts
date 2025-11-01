import { Transaction } from "@mysten/sui/transactions";

export function pausePlatform(
    packageId: string,
    adminCapId: string,
    configId: string
): Transaction {
    const tx = new Transaction();

    tx.moveCall({
        target: `${packageId}::admin::pause_platform`,
        arguments: [
            tx.object(adminCapId),
            tx.object(configId),
        ],
    });

    return tx;
}
