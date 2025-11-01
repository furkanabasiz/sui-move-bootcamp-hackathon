// 1.	This function is read-only (it does not modify blockchain state).
// 2.	It should be called using a suiClient.getDynamicFieldObject or suiClient.devInspectTransactionBlock request — not a PTB.
// 3.	The Move target is ${packageId}::voting_module::get_vote.
// 4.	It requires two arguments:
// •	Argument 1 → voting object ID
// •	Argument 2 → voter address (Sui address string)
// 5.	The return type is Option<u64> (either the vote index or None).
// 6.	In UI, display None as “No vote casted yet” and numeric values as the selected option index.
// 7.	No Transaction object or signing is needed — use a simulation or view call.
// 8.	The function name should be getVote.
// 9.	Save it as a utility file (e.g., getVote.view.ts or getVote.query.ts).
// 10.	External parameters required: packageId, votingId, and voterAddress.