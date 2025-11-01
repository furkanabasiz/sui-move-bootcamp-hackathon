#[test_only]
module voting::voting_tests {
    use sui::test_scenario::{Self as ts, Scenario};
    use sui::clock::{Self, Clock};
    use std::string::{Self, String};
    
    use voting::voting::{Self, Voting};
    use voting::admin::{Self, PlatformConfig, AdminCap};

    // Test addresses
    const ADMIN: address = @0xAD;
    const CREATOR: address = @0xA1;
    const VOTER1: address = @0xB1;
    const VOTER2: address = @0xB2;
    const VOTER3: address = @0xB3;

    // Error codes (copied from source modules for testing)
    const EInvalidOptionsCount: u64 = 1;
    const EInvalidOptionIndex: u64 = 2;
    const EDuplicateOption: u64 = 4;
    const EAlreadyVoted: u64 = 10;
    const EVotingClosed: u64 = 11;
    const EVotingEnded: u64 = 12;
    const ENotCreator: u64 = 13;

    // Helper function to create test scenario
    fun setup_test(): Scenario {
        let mut scenario = ts::begin(ADMIN);
        
        ts::next_tx(&mut scenario, ADMIN);
        admin::init_for_testing(ts::ctx(&mut scenario));
        
        scenario
    }

    // Helper to create a basic voting
    fun create_test_voting(scenario: &mut Scenario) {
        ts::next_tx(scenario, CREATOR);
        let config = ts::take_shared<PlatformConfig>(scenario);
        let mut clock = clock::create_for_testing(ts::ctx(scenario));
        
        let question = string::utf8(b"What is your favorite color?");
        let description = option::some(string::utf8(b"Choose your favorite"));
        let image_url = option::none<String>();
        
        let mut options = vector::empty<String>();
        vector::push_back(&mut options, string::utf8(b"Red"));
        vector::push_back(&mut options, string::utf8(b"Blue"));
        vector::push_back(&mut options, string::utf8(b"Green"));
        
        voting::create_voting(
            &config,
            question,
            description,
            image_url,
            options,
            option::none<u64>(),
            &clock,
            ts::ctx(scenario)
        );
        
        clock::destroy_for_testing(clock);
        ts::return_shared(config);
    }

    #[test]
    fun test_create_voting_success() {
        let mut scenario = setup_test();
        
        create_test_voting(&mut scenario);
        
        ts::next_tx(&mut scenario, CREATOR);
        {
            let voting = ts::take_shared<Voting>(&scenario);
            
            let (creator, question, _desc, _img, options, is_closed, _end, _created, total_votes) 
                = voting::get_voting_info(&voting);
            
            assert!(creator == CREATOR, 0);
            assert!(question == string::utf8(b"What is your favorite color?"), 1);
            assert!(vector::length(&options) == 3, 2);
            assert!(!is_closed, 3);
            assert!(total_votes == 0, 4);
            
            ts::return_shared(voting);
        };
        
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = EInvalidOptionsCount)]
    fun test_create_voting_insufficient_options() {
        let mut scenario = setup_test();
        
        ts::next_tx(&mut scenario, CREATOR);
        let config = ts::take_shared<PlatformConfig>(&scenario);
        let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
        
        let question = string::utf8(b"Test?");
        let mut options = vector::empty<String>();
        vector::push_back(&mut options, string::utf8(b"Only One"));
        
        voting::create_voting(
            &config,
            question,
            option::none(),
            option::none(),
            options,
            option::none(),
            &clock,
            ts::ctx(&mut scenario)
        );
        
        clock::destroy_for_testing(clock);
        ts::return_shared(config);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = EDuplicateOption)]
    fun test_create_voting_duplicate_options() {
        let mut scenario = setup_test();
        
        ts::next_tx(&mut scenario, CREATOR);
        let config = ts::take_shared<PlatformConfig>(&scenario);
        let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
        
        let question = string::utf8(b"Test?");
        let mut options = vector::empty<String>();
        vector::push_back(&mut options, string::utf8(b"Option A"));
        vector::push_back(&mut options, string::utf8(b"Option A"));
        
        voting::create_voting(
            &config,
            question,
            option::none(),
            option::none(),
            options,
            option::none(),
            &clock,
            ts::ctx(&mut scenario)
        );
        
        clock::destroy_for_testing(clock);
        ts::return_shared(config);
        ts::end(scenario);
    }

    #[test]
    fun test_vote_success() {
        let mut scenario = setup_test();
        create_test_voting(&mut scenario);
        
        ts::next_tx(&mut scenario, VOTER1);
        {
            let mut voting = ts::take_shared<Voting>(&scenario);
            let config = ts::take_shared<PlatformConfig>(&scenario);
            let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
            
            voting::vote(&config, &mut voting, 0, &clock, ts::ctx(&mut scenario));
            
            assert!(voting::has_voted(&voting, VOTER1), 0);
            let vote_option = voting::get_vote(&voting, VOTER1);
            assert!(option::is_some(&vote_option), 1);
            assert!(*option::borrow(&vote_option) == 0, 2);
            
            let (_options, results, total_votes, _closed) = voting::get_results(&voting);
            assert!(*vector::borrow(&results, 0) == 1, 3);
            assert!(total_votes == 1, 4);
            
            clock::destroy_for_testing(clock);
            ts::return_shared(voting);
            ts::return_shared(config);
        };
        
        ts::end(scenario);
    }

    #[test]
    fun test_multiple_votes() {
        let mut scenario = setup_test();
        create_test_voting(&mut scenario);
        
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
            
            let (_options, results, total_votes, _closed) = voting::get_results(&voting);
            assert!(*vector::borrow(&results, 0) == 2, 0);
            assert!(*vector::borrow(&results, 1) == 1, 1);
            assert!(*vector::borrow(&results, 2) == 0, 2);
            assert!(total_votes == 3, 3);
            
            clock::destroy_for_testing(clock);
            ts::return_shared(voting);
            ts::return_shared(config);
        };
        
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = EAlreadyVoted)]
    fun test_double_voting_fails() {
        let mut scenario = setup_test();
        create_test_voting(&mut scenario);
        
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
        
        ts::next_tx(&mut scenario, VOTER1);
        {
            let mut voting = ts::take_shared<Voting>(&scenario);
            let config = ts::take_shared<PlatformConfig>(&scenario);
            let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
            
            voting::vote(&config, &mut voting, 1, &clock, ts::ctx(&mut scenario));
            
            clock::destroy_for_testing(clock);
            ts::return_shared(voting);
            ts::return_shared(config);
        };
        
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = EInvalidOptionIndex)]
    fun test_vote_invalid_option() {
        let mut scenario = setup_test();
        create_test_voting(&mut scenario);
        
        ts::next_tx(&mut scenario, VOTER1);
        {
            let mut voting = ts::take_shared<Voting>(&scenario);
            let config = ts::take_shared<PlatformConfig>(&scenario);
            let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
            
            voting::vote(&config, &mut voting, 10, &clock, ts::ctx(&mut scenario));
            
            clock::destroy_for_testing(clock);
            ts::return_shared(voting);
            ts::return_shared(config);
        };
        
        ts::end(scenario);
    }

    #[test]
    fun test_close_voting() {
        let mut scenario = setup_test();
        create_test_voting(&mut scenario);
        
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
        
        ts::next_tx(&mut scenario, CREATOR);
        {
            let mut voting = ts::take_shared<Voting>(&scenario);
            let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
            
            voting::close_voting(&mut voting, &clock, ts::ctx(&mut scenario));
            
            let (_creator, _q, _d, _i, _o, is_closed, _e, _c, _t) = voting::get_voting_info(&voting);
            assert!(is_closed, 0);
            
            clock::destroy_for_testing(clock);
            ts::return_shared(voting);
        };
        
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = ENotCreator)]
    fun test_close_voting_non_creator_fails() {
        let mut scenario = setup_test();
        create_test_voting(&mut scenario);
        
        ts::next_tx(&mut scenario, VOTER1);
        {
            let mut voting = ts::take_shared<Voting>(&scenario);
            let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
            
            voting::close_voting(&mut voting, &clock, ts::ctx(&mut scenario));
            
            clock::destroy_for_testing(clock);
            ts::return_shared(voting);
        };
        
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = EVotingClosed)]
    fun test_vote_after_close_fails() {
        let mut scenario = setup_test();
        create_test_voting(&mut scenario);
        
        ts::next_tx(&mut scenario, CREATOR);
        {
            let mut voting = ts::take_shared<Voting>(&scenario);
            let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
            
            voting::close_voting(&mut voting, &clock, ts::ctx(&mut scenario));
            
            clock::destroy_for_testing(clock);
            ts::return_shared(voting);
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
    fun test_voting_with_timelock() {
        let mut scenario = setup_test();
        
        ts::next_tx(&mut scenario, CREATOR);
        {
            let config = ts::take_shared<PlatformConfig>(&scenario);
            let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
            
            let question = string::utf8(b"Timelock test?");
            let mut options = vector::empty<String>();
            vector::push_back(&mut options, string::utf8(b"Yes"));
            vector::push_back(&mut options, string::utf8(b"No"));
            
            let end_time = option::some(clock::timestamp_ms(&clock) + 3600000);
            
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
            
            voting::vote(&config, &mut voting, 0, &clock, ts::ctx(&mut scenario));
            assert!(voting::has_voted(&voting, VOTER1), 0);
            
            clock::destroy_for_testing(clock);
            ts::return_shared(voting);
            ts::return_shared(config);
        };
        
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = EVotingEnded)]
    fun test_vote_after_timelock_fails() {
        let mut scenario = setup_test();
        
        ts::next_tx(&mut scenario, CREATOR);
        {
            let config = ts::take_shared<PlatformConfig>(&scenario);
            let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
            
            let question = string::utf8(b"Timelock test?");
            let mut options = vector::empty<String>();
            vector::push_back(&mut options, string::utf8(b"Yes"));
            vector::push_back(&mut options, string::utf8(b"No"));
            
            let end_time = option::some(clock::timestamp_ms(&clock) + 1000);
            
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
        
        ts::end(scenario);
    }

    #[test]
    fun test_delete_voting() {
        let mut scenario = setup_test();
        create_test_voting(&mut scenario);
        
        ts::next_tx(&mut scenario, CREATOR);
        {
            let mut voting = ts::take_shared<Voting>(&scenario);
            let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
            
            voting::close_voting(&mut voting, &clock, ts::ctx(&mut scenario));
            
            clock::destroy_for_testing(clock);
            ts::return_shared(voting);
        };
        
        ts::next_tx(&mut scenario, CREATOR);
        {
            let voting = ts::take_shared<Voting>(&scenario);
            let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
            
            voting::delete_voting(voting, &clock, ts::ctx(&mut scenario));
            
            clock::destroy_for_testing(clock);
        };
        
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = ENotCreator)]
    fun test_delete_voting_non_creator_fails() {
        let mut scenario = setup_test();
        create_test_voting(&mut scenario);
        
        ts::next_tx(&mut scenario, CREATOR);
        {
            let mut voting = ts::take_shared<Voting>(&scenario);
            let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
            
            voting::close_voting(&mut voting, &clock, ts::ctx(&mut scenario));
            
            clock::destroy_for_testing(clock);
            ts::return_shared(voting);
        };
        
        ts::next_tx(&mut scenario, VOTER1);
        {
            let voting = ts::take_shared<Voting>(&scenario);
            let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
            
            voting::delete_voting(voting, &clock, ts::ctx(&mut scenario));
            
            clock::destroy_for_testing(clock);
        };
        
        ts::end(scenario);
    }
}