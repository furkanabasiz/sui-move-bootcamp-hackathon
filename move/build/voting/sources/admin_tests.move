#[test_only]
module voting::admin_tests {
    use sui::test_scenario::{Self as ts, Scenario};
    use voting::admin::{Self, PlatformConfig, AdminCap};

    const ADMIN: address = @0xAD;
    const USER: address = @0xB1;
    const NEW_ADMIN: address = @0xA2;

    fun setup_test(): Scenario {
        let mut scenario = ts::begin(ADMIN);
        
        ts::next_tx(&mut scenario, ADMIN);
        admin::init_for_testing(ts::ctx(&mut scenario));
        
        scenario
    }

    #[test]
    fun test_init_admin() {
        let mut scenario = setup_test();
        
        ts::next_tx(&mut scenario, ADMIN);
        {
            let config = ts::take_shared<PlatformConfig>(&scenario);
            
            assert!(admin::get_admin(&config) == ADMIN, 0);
            assert!(admin::get_platform_fee(&config) == 0, 1);
            assert!(!admin::is_paused(&config), 2);
            
            ts::return_shared(config);
        };
        
        ts::end(scenario);
    }

    #[test]
    fun test_admin_owns_cap() {
        let mut scenario = setup_test();
        
        ts::next_tx(&mut scenario, ADMIN);
        {
            assert!(ts::has_most_recent_for_address<AdminCap>(ADMIN), 0);
        };
        
        ts::end(scenario);
    }

    #[test]
    fun test_update_platform_fee() {
        let mut scenario = setup_test();
        
        ts::next_tx(&mut scenario, ADMIN);
        {
            let admin_cap = ts::take_from_address<AdminCap>(&scenario, ADMIN);
            let mut config = ts::take_shared<PlatformConfig>(&scenario);
            
            admin::update_platform_fee(&admin_cap, &mut config, 250, ts::ctx(&mut scenario));
            
            assert!(admin::get_platform_fee(&config) == 250, 0);
            
            ts::return_to_address(ADMIN, admin_cap);
            ts::return_shared(config);
        };
        
        ts::end(scenario);
    }

    #[test]
#[expected_failure]
fun test_update_platform_fee_too_high() {
    let mut scenario = setup_test();
    
    ts::next_tx(&mut scenario, ADMIN);
    {
        let admin_cap = ts::take_from_address<AdminCap>(&scenario, ADMIN);
        let mut config = ts::take_shared<PlatformConfig>(&scenario);
        
        // Try to set fee above 10% (1000 basis points)
        admin::update_platform_fee(&admin_cap, &mut config, 2000, ts::ctx(&mut scenario));
        
        ts::return_to_address(ADMIN, admin_cap);
        ts::return_shared(config);
    };
    
    ts::end(scenario);
}

#[test]
fun test_pause_unpause_platform() {
    let mut scenario = setup_test();
    
    // Pause
    ts::next_tx(&mut scenario, ADMIN);
    {
        let admin_cap = ts::take_from_address<AdminCap>(&scenario, ADMIN);
        let mut config = ts::take_shared<PlatformConfig>(&scenario);
        
        admin::pause_platform(&admin_cap, &mut config, ts::ctx(&mut scenario));
        assert!(admin::is_paused(&config), 0);
        
        ts::return_to_address(ADMIN, admin_cap);
        ts::return_shared(config);
    };
    
    // Unpause
    ts::next_tx(&mut scenario, ADMIN);
    {
        let admin_cap = ts::take_from_address<AdminCap>(&scenario, ADMIN);
        let mut config = ts::take_shared<PlatformConfig>(&scenario);
        
        admin::unpause_platform(&admin_cap, &mut config, ts::ctx(&mut scenario));
        assert!(!admin::is_paused(&config), 0);
        
        ts::return_to_address(ADMIN, admin_cap);
        ts::return_shared(config);
    };
    
    ts::end(scenario);
}

#[test]
fun test_transfer_admin() {
    let mut scenario = setup_test();
    
    ts::next_tx(&mut scenario, ADMIN);
    {
        let admin_cap = ts::take_from_address<AdminCap>(&scenario, ADMIN);
        let mut config = ts::take_shared<PlatformConfig>(&scenario);
        
        assert!(admin::get_admin(&config) == ADMIN, 0);
        
        admin::transfer_admin(&admin_cap, &mut config, NEW_ADMIN, ts::ctx(&mut scenario));
        
        assert!(admin::get_admin(&config) == NEW_ADMIN, 1);
        
        ts::return_to_address(ADMIN, admin_cap);
        ts::return_shared(config);
    };
    
    ts::end(scenario);
}

#[test]
fun test_is_admin_check() {
    let mut scenario = setup_test();
    
    ts::next_tx(&mut scenario, ADMIN);
    {
        let config = ts::take_shared<PlatformConfig>(&scenario);
        
        assert!(admin::is_admin(&config, ADMIN), 0);
        assert!(!admin::is_admin(&config, USER), 1);
        
        ts::return_shared(config);
    };
    
    ts::end(scenario);
    }
}