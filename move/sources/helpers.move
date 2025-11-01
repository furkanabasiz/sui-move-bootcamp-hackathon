module voting::helpers {
    use sui::clock::{Self, Clock};
    use sui::vec_map::{Self, VecMap};
    use std::string::{Self, String};
    use std::option::{Self, Option};
    use std::vector;

    /// Error codes
    const EInvalidOptionsCount: u64 = 1;
    const EInvalidOptionIndex: u64 = 2;
    const EInvalidEndTime: u64 = 3;
    const EDuplicateOption: u64 = 4;
    const EEmptyQuestion: u64 = 5;
    const EEmptyOption: u64 = 6;

    /// Constants
    const MinOptions: u64 = 2;
    const MaxOptions: u64 = 100;

    /// Validate that options count is at least 2
    public fun validate_options_count(count: u64) {
        assert!(count >= MinOptions, EInvalidOptionsCount);
        assert!(count <= MaxOptions, EInvalidOptionsCount);
    }

    /// Validate option index is within bounds
    public fun validate_option_index(index: u64, total_options: u64) {
        assert!(index < total_options, EInvalidOptionIndex);
    }

    /// Validate end time is in the future (if provided)
    public fun validate_end_time(end_time: &Option<u64>, clock: &Clock) {
        if (option::is_some(end_time)) {
            let time = *option::borrow(end_time);
            assert!(time > clock::timestamp_ms(clock), EInvalidEndTime);
        }
    }

    /// Check if voting has ended based on timelock
    public fun is_voting_ended(end_time: &Option<u64>, clock: &Clock): bool {
        if (option::is_some(end_time)) {
            let time = *option::borrow(end_time);
            clock::timestamp_ms(clock) >= time
        } else {
            false
        }
    }

    /// Calculate total votes from vote counts map
    public fun calculate_total_votes(vote_counts: &VecMap<u64, u64>): u64 {
        let mut total = 0u64;
        let mut i = 0u64;
        let size = vec_map::size(vote_counts);
        
        while (i < size) {
            let (_key, value) = vec_map::get_entry_by_idx(vote_counts, i);
            total = total + *value;
            i = i + 1;
        };
        
        total
    }

    /// Validate question is not empty
    public fun validate_question(question: &String) {
        assert!(std::string::length(question) > 0, EEmptyQuestion);
    }

    /// Validate option is not empty
    public fun validate_option(option: &String) {
        assert!(std::string::length(option) > 0, EEmptyOption);
    }

    /// Check for duplicate options
    public fun check_duplicate_options(options: &vector<String>) {
        let len = vector::length(options);
        let mut i = 0;
        
        while (i < len) {
            let option1 = vector::borrow(options, i);
            let mut j = i + 1;
            
            while (j < len) {
                let option2 = vector::borrow(options, j);
                assert!(option1 != option2, EDuplicateOption);
                j = j + 1;
            };
            
            i = i + 1;
        };
    }

    /// Initialize vote counts map with zeros
    public fun initialize_vote_counts(options_count: u64): VecMap<u64, u64> {
        let mut vote_counts = vec_map::empty<u64, u64>();
        let mut i = 0;
        
        while (i < options_count) {
            vec_map::insert(&mut vote_counts, i, 0);
            i = i + 1;
        };
        
        vote_counts
    }

    /// Increment vote count for an option
    public fun increment_vote(vote_counts: &mut VecMap<u64, u64>, option_index: u64) {
        let current_count = vec_map::get_mut(vote_counts, &option_index);
        *current_count = *current_count + 1;
    }
}