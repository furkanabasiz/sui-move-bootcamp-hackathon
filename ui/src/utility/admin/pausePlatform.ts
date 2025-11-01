
// 1.	Create a new Transaction object.
// 2.	Define the target as ${packageId}::voting_module::pause_platform.
// 3.	Add two arguments in this order:
// •	Argument 1 → adminCap object ID (&AdminCap)
// •	Argument 2 → config object ID (&mut PlatformConfig)
// 4.	Do not include any type arguments.
// 5.	Return the Transaction object at the end.
// 6.	Import Transaction from @mysten/sui/transactions.
// 7.	The function name must be pausePlatform.
// 8.	Save the file as pausePlatform.ptb.ts.
// 9.	Ensure the function receives packageId, adminCapId, and configId as external parameters.
// 10.	No clock or timestamp objects are required in this call.