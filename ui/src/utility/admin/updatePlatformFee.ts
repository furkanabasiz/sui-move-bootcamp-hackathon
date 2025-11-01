// 1.	Create a new Transaction object.
// 	2.	Define the target as ${packageId}::voting_module::update_platform_fee.
// 	3.	Add three arguments in this order:
// 	•	Argument 1 → adminCap object ID (&AdminCap)
// 	•	Argument 2 → config object ID (&mut PlatformConfig)
// 	•	Argument 3 → new_fee value as u64.
// 	4.	Do not include any type arguments.
// 	5.	Return the Transaction object at the end.
// 	6.	Import Transaction from @mysten/sui/transactions.
// 	7.	The function name must be updatePlatformFee.
// 	8.	Save the file as updatePlatformFee.ptb.ts.
// 	9.	Ensure the function receives packageId, adminCapId, configId, and newFee as external parameters.
// 	10.	No clock or system object arguments are required for this call.