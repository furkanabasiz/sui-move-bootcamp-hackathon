import { Transaction } from "@mysten/sui/transactions";

export const vote = () => {

    const tx = new Transaction();

    // 1.	Create a new Transaction object.
	// 2.	Define the target as ${packageId}::voting_module::vote.
	// 3.	Add four arguments to the Move call in this exact order:
	// •	Argument 1 → config object ID
	// •	Argument 2 → voting object ID
	// •	Argument 3 → option_index as a u64 value
	// •	Argument 4 → clock using the SUI_CLOCK_OBJECT_ID constant
	// 4.	Do not include any type arguments (typeArguments should be empty).
	// 5.	Return the Transaction object at the end.
	// 6.	Import Transaction from @mysten/sui/transactions.
	// 7.	Import SUI_CLOCK_OBJECT_ID from @mysten/sui/utils.
	// 8.	The function name must be vote.
	// 9.	Save the file as vote.ptb.ts.
	// 10.	Ensure the function receives these external parameters: packageId, configId, votingId, and optionIndex.

    return tx;
}