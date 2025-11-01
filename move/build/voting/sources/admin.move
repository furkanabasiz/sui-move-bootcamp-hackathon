module voting::admin {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;

    /// Admin capability for platform-wide operations
    public struct AdminCap has key, store {
        id: UID
    }

    /// Platform configuration
    public struct PlatformConfig has key {
        id: UID,
        admin: address,
        platform_fee: u64, // Fee in basis points (e.g., 100 = 1%)
        paused: bool
    }

    /// Error codes
    const E_NOT_ADMIN: u64 = 100;
    const E_PLATFORM_PAUSED: u64 = 101;
    const E_INVALID_FEE: u64 = 102;

    /// Maximum platform fee (10%)
    const MAX_PLATFORM_FEE: u64 = 1000;

    /// Initialize the admin module - called once during publishing
    fun init(ctx: &mut TxContext) {
        let admin_cap = AdminCap {
            id: object::new(ctx)
        };

        let config = PlatformConfig {
            id: object::new(ctx),
            admin: tx_context::sender(ctx),
            platform_fee: 0,
            paused: false
        };

        transfer::transfer(admin_cap, tx_context::sender(ctx));
        transfer::share_object(config);
    }

    /// Check if sender is admin
    public fun is_admin(config: &PlatformConfig, sender: address): bool {
        config.admin == sender
    }

    /// Assert sender is admin
    public fun assert_admin(config: &PlatformConfig, sender: address) {
        assert!(is_admin(config, sender), E_NOT_ADMIN);
    }

    /// Check if platform is paused
    public fun is_paused(config: &PlatformConfig): bool {
        config.paused
    }

    /// Assert platform is not paused
    public fun assert_not_paused(config: &PlatformConfig) {
        assert!(!config.paused, E_PLATFORM_PAUSED);
    }

    /// Get platform fee
    public fun get_platform_fee(config: &PlatformConfig): u64 {
        config.platform_fee
    }

    /// Update platform fee (admin only)
    public entry fun update_platform_fee(
        _admin_cap: &AdminCap,
        config: &mut PlatformConfig,
        new_fee: u64,
        ctx: &mut TxContext
    ) {
        assert_admin(config, tx_context::sender(ctx));
        assert!(new_fee <= MAX_PLATFORM_FEE, E_INVALID_FEE);
        config.platform_fee = new_fee;
    }

    /// Pause platform (admin only)
    public entry fun pause_platform(
        _admin_cap: &AdminCap,
        config: &mut PlatformConfig,
        ctx: &mut TxContext
    ) {
        assert_admin(config, tx_context::sender(ctx));
        config.paused = true;
    }

    /// Unpause platform (admin only)
    public entry fun unpause_platform(
        _admin_cap: &AdminCap,
        config: &mut PlatformConfig,
        ctx: &mut TxContext
    ) {
        assert_admin(config, tx_context::sender(ctx));
        config.paused = false;
    }

    /// Transfer admin role (admin only)
    public entry fun transfer_admin(
        _admin_cap: &AdminCap,
        config: &mut PlatformConfig,
        new_admin: address,
        ctx: &mut TxContext
    ) {
        assert_admin(config, tx_context::sender(ctx));
        config.admin = new_admin;
    }

    /// Get admin address
    public fun get_admin(config: &PlatformConfig): address {
        config.admin
    }

    #[test_only]
    /// Test-only function to initialize module
    public fun init_for_testing(ctx: &mut TxContext) {
        init(ctx);
    }
}