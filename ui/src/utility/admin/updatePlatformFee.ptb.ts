import { Transaction } from "@mysten/sui/transactions";

export function updatePlatformFee(
    packageId: string,
    adminCapId: string,
    configId: string,
    newFee: number
): Transaction {
    const tx = new Transaction();

    tx.moveCall({
        target: `${packageId}::admin::update_platform_fee`,
        arguments: [
            tx.object(adminCapId),
            tx.object(configId),
            tx.pure.u64(BigInt(newFee)),
        ],
    });

    return tx;
}
