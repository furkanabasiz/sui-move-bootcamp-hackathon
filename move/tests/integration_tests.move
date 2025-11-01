#[test_only]
module voting::integration_tests {
    use sui::test_scenario::{Self as ts, Scenario};
    use sui::clock::{Self, Clock};
    use std::string::{Self, String};
 
    use voting::voting::{Self, Voting};
    use voting::admin::{Self, PlatformConfig, AdminCap};

    const ADMIN: address = @0xAD;
    const CREATOR1: address = @0xA1;
    const CREATOR2: address = @0xA2;
    const VOTER1: address = @0xB1;
    const VOTER2: address = @0xB2;
    const VOTER3: address = @0xB3;
    const VOTER4: address = @0xB4;
    const VOTER5: address = @0xB5;

    // Error codes
    const EPlatformPaused: u64 = 101;

    fun setup_test(): Scenario {
        let mut scenario = ts::begin(ADMIN);
        
        ts::next_tx(&mut scenario, ADMIN);
        admin::init_for_testing(ts::ctx(&mut scenario));
        
        scenario
    }

    fun create_voting_helper(
        scenario: &mut Scenario,
        creator: address,
        question: vector<u8>,
        options: vector<vector<u8>>,
        end_time: option::Option<u64>
    ) {
        ts::next_tx(scenario, creator);
        let config = ts::take_shared<PlatformConfig>(scenario);
        let mut clock = clock::create_for_testing(ts::ctx(scenario));
        
        let question_str = string::utf8(question);
        let mut options_vec = vector::empty<String>();
        
        let mut i = 0;
        while (i < vector::length(&options)) {
            vector::push_back(&mut options_vec, string::utf8(*vector::borrow(&options, i)));
            i = i + 1;
        };
        
        voting::create_voting(
            &config,
            question_str,
            option::none(),
            option::none(),
            options_vec,
            end_time,
            &clock,
            ts::ctx(scenario)
        );
        
        clock::destroy_for_testing(clock);
        ts::return_shared(config);
    }

    #[test]
    fun test_complete_voting_lifecycle() {
        let mut scenario = setup_test();
        
        let mut options = vector::empty<vector<u8>>();
        vector::push_back(&mut options, b"Option A");
        vector::push_back(&mut options, b"Option B");
        vector::push_back(&mut options, b"Option C");
        
        create_voting_helper(&mut scenario, CREATOR1, b"Test Question?", options, option::none());
        
        ts::next_tx(&mut scenario, VOTER1);
        {
            let mut voting = ts::take_shared<Voting>(&scenario);
            let config = ts::take_shared<PlatformConfig>(&scenario);
            let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
            
            voting::vote(&config, &mut voting, 0, &clock, ts::ctx(&mut scenario));
            
            clock::destroy_for_testing(clock);
            ts::return_shared(voting);
            ts::return_shared(config);
        };
        
        ts::next_tx(&mut scenario, VOTER2);
        {
            let mut voting = ts::take_shared<Voting>(&scenario);
            let config = ts::take_shared<PlatformConfig>(&scenario);
            let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
            
            voting::vote(&config, &mut voting, 1, &clock, ts::ctx(&mut scenario));
            
            clock::destroy_for_testing(clock);
            ts::return_shared(voting);
            ts::return_shared(config);
        };
        
        ts::next_tx(&mut scenario, VOTER3);
        {
            let mut voting = ts::take_shared<Voting>(&scenario);
            let config = ts::take_shared<PlatformConfig>(&scenario);
            let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
            
            voting::vote(&config, &mut voting, 0, &clock, ts::ctx(&mut scenario));
            
            clock::destroy_for_testing(clock);
            ts::return_shared(voting);
            ts::return_shared(config);
        };
        
        ts::next_tx(&mut scenario, CREATOR1);
        {
            let voting = ts::take_shared<Voting>(&scenario);
            
            let (_options, results, total_votes, is_closed) = voting::get_results(&voting);
            assert!(*vector::borrow(&results, 0) == 2, 0);
            assert!(*vector::borrow(&results, 1) == 1, 1);
            assert!(*vector::borrow(&results, 2) == 0, 2);
            assert!(total_votes == 3, 3);
            assert!(!is_closed, 4);
            
            ts::return_shared(voting);
        };
        
        ts::next_tx(&mut scenario, CREATOR1);
        {
            let mut voting = ts::take_shared<Voting>(&scenario);
            let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
            
            voting::close_voting(&mut voting, &clock, ts::ctx(&mut scenario));
            
            clock::destroy_for_testing(clock);
            ts::return_shared(voting);
        };
        
        ts::next_tx(&mut scenario, CREATOR1);
        {
            let voting = ts::take_shared<Voting>(&scenario);
            
            let (_c, _q, _d, _i, _o, is_closed, _e, _cr, _t) = voting::get_voting_info(&voting);
            assert!(is_closed, 0);
            
            ts::return_shared(voting);
        };
        
        ts::next_tx(&mut scenario, CREATOR1);
        {
            let voting = ts::take_shared<Voting>(&scenario);
            let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
            
            voting::delete_voting(voting, &clock, ts::ctx(&mut scenario));
            
            clock::destroy_for_testing(clock);
        };
        
        ts::end(scenario);
    }

    #[test]
    fun test_multiple_concurrent_votings() {
        let mut scenario = setup_test();
        
        let mut options1 = vector::empty<vector<u8>>();
        vector::push_back(&mut options1, b"Yes");
        vector::push_back(&mut options1, b"No");
        create_voting_helper(&mut scenario, CREATOR1, b"Question 1?", options1, option::none());
        
        let mut options2 = vector::empty<vector<u8>>();
        vector::push_back(&mut options2, b"Red");
        vector::push_back(&mut options2, b"Blue");
        vector::push_back(&mut options2, b"Green");
        create_voting_helper(&mut scenario, CREATOR2, b"Question 2?", options2, option::none());
        
        ts::next_tx(&mut scenario, VOTER1);
        {
            assert!(ts::has_most_recent_shared<Voting>(), 0);
        };
        
        ts::end(scenario);
    }

    #[test]
    fun test_platform_pause_integration() {
        let mut scenario = setup_test();
        
        let mut options = vector::empty<vector<u8>>();
        vector::push_back(&mut options, b"Option A");
        vector::push_back(&mut options, b"Option B");
        create_voting_helper(&mut scenario, CREATOR1, b"Before Pause?", options, option::none());
        
        ts::next_tx(&mut scenario, ADMIN);
        {
            let admin_cap = ts::take_from_address<AdminCap>(&scenario, ADMIN);
            let mut config = ts::take_shared<PlatformConfig>(&scenario);
            
            admin::pause_platform(&admin_cap, &mut config, ts::ctx(&mut scenario));
            
            ts::return_to_address(ADMIN, admin_cap);
            ts::return_shared(config);
        };
        
        ts::next_tx(&mut scenario, VOTER1);
        {
            let config = ts::take_shared<PlatformConfig>(&scenario);
            
            let paused = admin::is_paused(&config);
            assert!(paused, 0);
            
            ts::return_shared(config);
        };
        
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = EPlatformPaused)]
    fun test_cannot_create_voting_when_paused() {
        let mut scenario = setup_test();
        
        ts::next_tx(&mut scenario, ADMIN);
        {
            let admin_cap = ts::take_from_address<AdminCap>(&scenario, ADMIN);
            let mut config = ts::take_shared<PlatformConfig>(&scenario);
            
            admin::pause_platform(&admin_cap, &mut config, ts::ctx(&mut scenario));
            
            ts::return_to_address(ADMIN, admin_cap);
            ts::return_shared(config);
        };
        
        let mut options = vector::empty<vector<u8>>();
        vector::push_back(&mut options, b"Option A");
        vector::push_back(&mut options, b"Option B");
        create_voting_helper(&mut scenario, CREATOR1, b"Will Fail?", options, option::none());
        
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = EPlatformPaused)]
    fun test_cannot_vote_when_paused() {
        let mut scenario = setup_test();
        
        let mut options = vector::empty<vector<u8>>();
        vector::push_back(&mut options, b"Option A");
        vector::push_back(&mut options, b"Option B");
        create_voting_helper(&mut scenario, CREATOR1, b"Question?", options, option::none());
        
        ts::next_tx(&mut scenario, ADMIN);
        {
            let admin_cap = ts::take_from_address<AdminCap>(&scenario, ADMIN);
            let mut config = ts::take_shared<PlatformConfig>(&scenario);
            
            admin::pause_platform(&admin_cap, &mut config, ts::ctx(&mut scenario));
            
            ts::return_to_address(ADMIN, admin_cap);
            ts::return_shared(config);
        };
        
        ts::next_tx(&mut scenario, VOTER1);
        {
            let mut voting = ts::take_shared<Voting>(&scenario);
            let config = ts::take_shared<PlatformConfig>(&scenario);
            let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
            
            voting::vote(&config, &mut voting, 0, &clock, ts::ctx(&mut scenario));
            
            clock::destroy_for_testing(clock);
            ts::return_shared(voting);
            ts::return_shared(config);
        };
        
        ts::end(scenario);
    }

    #[test]
    fun test_timelock_voting_race_condition() {
        let mut scenario = setup_test();
        
        ts::next_tx(&mut scenario, CREATOR1);
        {
            let config = ts::take_shared<PlatformConfig>(&scenario);
            let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
            
            let current_time = clock::timestamp_ms(&clock);
            let end_time = option::some(current_time + 10000);
            
            let question = string::utf8(b"Quick vote?");
            let mut options = vector::empty<String>();
            vector::push_back(&mut options, string::utf8(b"Yes"));
            vector::push_back(&mut options, string::utf8(b"No"));
            
            voting::create_voting(
                &config,
                question,
                option::none(),
                option::none(),
                options,
                end_time,
                &clock,
                ts::ctx(&mut scenario)
            );
            
            clock::destroy_for_testing(clock);
            ts::return_shared(config);
        };
        
        ts::next_tx(&mut scenario, VOTER1);
        {
            let mut voting = ts::take_shared<Voting>(&scenario);
            let config = ts::take_shared<PlatformConfig>(&scenario);
            let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
            
            clock::increment_for_testing(&mut clock, 2000);
            voting::vote(&config, &mut voting, 0, &clock, ts::ctx(&mut scenario));
            
            clock::destroy_for_testing(clock);
            ts::return_shared(voting);
            ts::return_shared(config);
        };
        
        ts::next_tx(&mut scenario, VOTER2);
        {
            let mut voting = ts::take_shared<Voting>(&scenario);
            let config = ts::take_shared<PlatformConfig>(&scenario);
            let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
            
            clock::increment_for_testing(&mut clock, 5000);
            voting::vote(&config, &mut voting, 1, &clock, ts::ctx(&mut scenario));
            
            clock::destroy_for_testing(clock);
            ts::return_shared(voting);
            ts::return_shared(config);
        };
        
        ts::next_tx(&mut scenario, VOTER3);
        {
            let mut voting = ts::take_shared<Voting>(&scenario);
            let config = ts::take_shared<PlatformConfig>(&scenario);
            let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
            
            clock::increment_for_testing(&mut clock, 9000);
            voting::vote(&config, &mut voting, 0, &clock, ts::ctx(&mut scenario));
            
            clock::destroy_for_testing(clock);
            ts::return_shared(voting);
            ts::return_shared(config);
        };
        
        ts::next_tx(&mut scenario, CREATOR1);
        {
            let voting = ts::take_shared<Voting>(&scenario);
            
            let (_opts, results, total, _closed) = voting::get_results(&voting);
            assert!(total == 3, 0);
            assert!(*vector::borrow(&results, 0) == 2, 1);
            assert!(*vector::borrow(&results, 1) == 1, 2);
            
            ts::return_shared(voting);
        };
        
        ts::end(scenario);
    }

    #[test]
    fun test_high_volume_voting() {
        let mut scenario = setup_test();
        
        let mut options = vector::empty<vector<u8>>();
        vector::push_back(&mut options, b"Option A");
        vector::push_back(&mut options, b"Option B");
        create_voting_helper(&mut scenario, CREATOR1, b"Popular Vote?", options, option::none());
        
        let voters = vector[VOTER1, VOTER2, VOTER3, VOTER4, VOTER5];
        let votes = vector[0, 1, 0, 1, 0];
        
        let mut i = 0;
        while (i < vector::length(&voters)) {
            let voter = *vector::borrow(&voters, i);
            let vote = *vector::borrow(&votes, i);
            
            ts::next_tx(&mut scenario, voter);
            {
                let mut voting = ts::take_shared<Voting>(&scenario);
                let config = ts::take_shared<PlatformConfig>(&scenario);
                let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
                
                voting::vote(&config, &mut voting, vote, &clock, ts::ctx(&mut scenario));
                
                clock::destroy_for_testing(clock);
                ts::return_shared(voting);
                ts::return_shared(config);
            };
            
            i = i + 1;
        };
        
        ts::next_tx(&mut scenario, CREATOR1);
        {
            let voting = ts::take_shared<Voting>(&scenario);
            
            let (_opts, results, total, _closed) = voting::get_results(&voting);
            assert!(total == 5, 0);
            assert!(*vector::borrow(&results, 0) == 3, 1);
            assert!(*vector::borrow(&results, 1) == 2, 2);
            
            ts::return_shared(voting);
        };
        
        ts::end(scenario);
    }

    #[test]
    fun test_admin_transfer_workflow() {
        let mut scenario = setup_test();
        
        ts::next_tx(&mut scenario, ADMIN);
        {
            let admin_cap = ts::take_from_address<AdminCap>(&scenario, ADMIN);
            let mut config = ts::take_shared<PlatformConfig>(&scenario);
            
            admin::transfer_admin(&admin_cap, &mut config, CREATOR1, ts::ctx(&mut scenario));
            
            assert!(admin::get_admin(&config) == CREATOR1, 0);
            
            ts::return_to_address(ADMIN, admin_cap);
            ts::return_shared(config);
        };
        
        ts::next_tx(&mut scenario, ADMIN);
        {
            let admin_cap = ts::take_from_address<AdminCap>(&scenario, ADMIN);
            let mut config = ts::take_shared<PlatformConfig>(&scenario);
            
            admin::pause_platform(&admin_cap, &mut config, ts::ctx(&mut scenario));
            assert!(admin::is_paused(&config), 0);
            
            ts::return_to_address(ADMIN, admin_cap);
            ts::return_shared(config);
        };
        
        ts::end(scenario);
    }

    #[test]
    fun test_voting_query_functions() {
        let mut scenario = setup_test();
        
        let mut options = vector::empty<vector<u8>>();
        vector::push_back(&mut options, b"A");
        vector::push_back(&mut options, b"B");
        create_voting_helper(&mut scenario, CREATOR1, b"Test?", options, option::none());
        
        ts::next_tx(&mut scenario, VOTER1);
        {
            let mut voting = ts::take_shared<Voting>(&scenario);
            let config = ts::take_shared<PlatformConfig>(&scenario);
            let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
            
            voting::vote(&config, &mut voting, 0, &clock, ts::ctx(&mut scenario));
            
            assert!(voting::has_voted(&voting, VOTER1), 0);
            assert!(!voting::has_voted(&voting, VOTER2), 1);
            
            let vote_opt = voting::get_vote(&voting, VOTER1);
            assert!(option::is_some(&vote_opt), 2);
            assert!(*option::borrow(&vote_opt) == 0, 3);
            
            let no_vote_opt = voting::get_vote(&voting, VOTER2);
            assert!(option::is_none(&no_vote_opt), 4);
            
            assert!(voting::is_active(&voting, &clock), 5);
            
            clock::destroy_for_testing(clock);
            ts::return_shared(voting);
            ts::return_shared(config);
        };
        
        ts::end(scenario);
    }
}