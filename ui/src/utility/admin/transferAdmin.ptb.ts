import { Transaction } from "@mysten/sui/transactions";

export function transferAdmin(
    packageId: string,
    adminCapId: string,
    configId: string,
    newAdmin: string
): Transaction {
    const tx = new Transaction();

    tx.moveCall({
        target: `${packageId}::admin::transfer_admin`,
        arguments: [
            tx.object(adminCapId),
            tx.object(configId),
            tx.pure.address(newAdmin),
        ],
    });

    return tx;
}
