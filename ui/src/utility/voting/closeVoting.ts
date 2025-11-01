// 1.	Create a new Transaction object.
// 2.	Define the target as ${packageId}::voting_module::close_voting.
// 3.	Add three arguments to the Move call in this exact order:
// •	Argument 1 → voting object ID
// •	Argument 2 → clock using the SUI_CLOCK_OBJECT_ID constant
// •	Argument 3 → transaction context (automatically provided, no explicit argument needed in UI).
// 4.	Do not include any type arguments (typeArguments should be empty).
// 5.	Return the Transaction object at the end.
// 6.	Import Transaction from @mysten/sui/transactions.
// 7.	Import SUI_CLOCK_OBJECT_ID from @mysten/sui/utils.
// 8.	The function name must be closeVoting.
// 9.	Save the file as closeVoting.ptb.ts.
// 10.	Ensure the function receives these external parameters: packageId and votingId.