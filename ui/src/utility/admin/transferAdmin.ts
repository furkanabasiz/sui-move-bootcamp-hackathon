// 1.	Create a new Transaction object.
// 2.	Define the target as ${packageId}::voting_module::transfer_admin.
// 3.	Add three arguments in this order:
// •	Argument 1 → adminCap object ID (&AdminCap)
// •	Argument 2 → config object ID (&mut PlatformConfig)
// •	Argument 3 → new_admin address (string Sui address).
// 4.	Do not include any type arguments.
// 5.	Return the Transaction object at the end.
// 6.	Import Transaction from @mysten/sui/transactions.
// 7.	The function name must be transferAdmin.
// 8.	Save the file as transferAdmin.ptb.ts.
// 9.	Ensure the function receives packageId, adminCapId, configId, and newAdminAddress as external parameters.
// 10.	No clock or other system objects are required for this call.