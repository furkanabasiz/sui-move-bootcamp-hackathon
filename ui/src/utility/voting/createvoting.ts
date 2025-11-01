// 1.	Create a new Transaction object.
// 2.	Define the target as ${packageId}::voting_module::create_voting.
// 3.	Add seven arguments to the Move call in this exact order:
// •	Argument 1 → config object ID
// •	Argument 2 → question as a string value
// •	Argument 3 → description as an optional string (Option<String>)
// •	Argument 4 → image_url as an optional string (Option<String>)
// •	Argument 5 → options as a vector of strings (vector<String>)
// •	Argument 6 → end_time as an optional u64 value
// •	Argument 7 → clock using the SUI_CLOCK_OBJECT_ID constant
// 4.	Do not include any type arguments (typeArguments should be empty).
// 5.	Return the Transaction object at the end.
// 6.	Import Transaction from @mysten/sui/transactions.
// 7.	Import SUI_CLOCK_OBJECT_ID from @mysten/sui/utils.
// 8.	The function name must be createVoting.
// 9.	Save the file as createVoting.ptb.ts.
// 10.	Ensure the function receives these external parameters: packageId, configId, question, description, imageUrl, options, and endTime.