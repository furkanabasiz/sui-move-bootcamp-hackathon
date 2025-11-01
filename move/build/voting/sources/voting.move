module voting::voting {
    use sui::clock::{Self, Clock};
    use sui::table::{Self, Table};
    use sui::vec_map::{Self, VecMap};
    use std::string::String;
    use voting::events;
    use voting::helpers;
    use voting::admin::{Self, PlatformConfig};

    /// Main voting object
    /// 
    /// Belki display buraya
    public struct Voting has key, store {
        id: UID,
        creator: address,
        question: String,
        description: Option<String>,
        image_url: Option<String>,
        options: vector<String>,
        vote_counts: VecMap<u64, u64>,
        voters: Table<address, u64>,
        is_closed: bool,
        end_time: Option<u64>,
        created_at: u64,
        total_votes: u64
    }

    /// Error codes
    const EAlreadyVoted: u64 = 10;
    const EVotingClosed: u64 = 11;
    const EVotingEnded: u64 = 12;
    const ENotCreator: u64 = 13;
    const EVotingStillActive: u64 = 15;

    /// Create a new voting
    public fun create_voting(
        config: &PlatformConfig,
        question: String,
        description: Option<String>,
        image_url: Option<String>,
        options: vector<String>,
        end_time: Option<u64>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        admin::assert_not_paused(config);

        helpers::validate_question(&question);
        let options_count = vector::length(&options);
        helpers::validate_options_count(options_count);
        helpers::check_duplicate_options(&options);
        helpers::validate_end_time(&end_time, clock);

        let mut i = 0;
        while (i < options_count) {
            helpers::validate_option(vector::borrow(&options, i));
            i = i + 1;
        };

        let vote_counts = helpers::initialize_vote_counts(options_count);

        let voting_uid = object::new(ctx);
        let voting_id = object::uid_to_inner(&voting_uid);
        let timestamp = clock::timestamp_ms(clock);
        let sender = tx_context::sender(ctx);

        let voting = Voting {
            id: voting_uid,
            creator: sender,
            question,
            description,
            image_url,
            options,
            vote_counts,
            voters: table::new(ctx),
            is_closed: false,
            end_time,
            created_at: timestamp,
            total_votes: 0
        };

        events::emit_voting_created(
            voting_id,
            sender,
            voting.question,
            options_count,
            end_time,
            timestamp
        );

        transfer::share_object(voting);
    }

    /// Cast a vote
    public fun vote(
        config: &PlatformConfig,
        voting: &mut Voting,
        option_index: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        admin::assert_not_paused(config);

        let sender = tx_context::sender(ctx);
        
        assert!(!voting.is_closed, EVotingClosed);
        assert!(!helpers::is_voting_ended(&voting.end_time, clock), EVotingEnded);
        assert!(!table::contains(&voting.voters, sender), EAlreadyVoted);
        
        helpers::validate_option_index(option_index, vector::length(&voting.options));

        table::add(&mut voting.voters, sender, option_index);
        helpers::increment_vote(&mut voting.vote_counts, option_index);
        voting.total_votes = voting.total_votes + 1;

        events::emit_vote_casted(
            object::uid_to_inner(&voting.id),
            sender,
            option_index,
            clock::timestamp_ms(clock)
        );
    }

    /// Close voting (creator only)
    public fun close_voting(
        voting: &mut Voting,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        assert!(voting.creator == sender, ENotCreator);
        assert!(!voting.is_closed, EVotingClosed);

        voting.is_closed = true;

        events::emit_voting_closed(
            object::uid_to_inner(&voting.id),
            sender,
            voting.total_votes,
            clock::timestamp_ms(clock)
        );
    }

    /// Delete voting (creator only, must be closed or ended)
    public fun delete_voting(
        voting: Voting,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        assert!(voting.creator == sender, ENotCreator);
        assert!(
            voting.is_closed || helpers::is_voting_ended(&voting.end_time, clock),
            EVotingStillActive
        );

        events::emit_voting_deleted(
            object::uid_to_inner(&voting.id),
            sender,
            clock::timestamp_ms(clock)
        );

        let Voting {
            id,
            creator: _,
            question: _,
            description: _,
            image_url: _,
            options: _,
            vote_counts: mut vote_counts,
            voters,
            is_closed: _,
            end_time: _,
            created_at: _,
            total_votes: _
        } = voting;

        object::delete(id);
        
        // Manually destroy vote_counts
        while (!vec_map::is_empty(&vote_counts)) {
            let (_key, _) = vec_map::pop(&mut vote_counts);
        };
        vec_map::destroy_empty(vote_counts);
        
        table::drop(voters);
    }

    // === View Functions ===

    /// Get voting results
    public fun get_results(voting: &Voting): (vector<String>, vector<u64>, u64, bool) {
        let mut results = vector::empty<u64>();
        let options_count = vector::length(&voting.options);
        let mut i = 0;

        while (i < options_count) {
            let count = *vec_map::get(&voting.vote_counts, &i);
            vector::push_back(&mut results, count);
            i = i + 1;
        };

        (voting.options, results, voting.total_votes, voting.is_closed)
    }

    /// Check if address has voted
    public fun has_voted(voting: &Voting, voter: address): bool {
        table::contains(&voting.voters, voter)
    }

    /// Get vote by address
    public fun get_vote(voting: &Voting, voter: address): Option<u64> {
        if (table::contains(&voting.voters, voter)) {
            option::some(*table::borrow(&voting.voters, voter))
        } else {
            option::none()
        }
    }

    /// Get voting details
    public fun get_voting_info(voting: &Voting): (
        address,
        String,
        Option<String>,
        Option<String>,
        vector<String>,
        bool,
        Option<u64>,
        u64,
        u64
    ) {
        (
            voting.creator,
            voting.question,
            voting.description,
            voting.image_url,
            voting.options,
            voting.is_closed,
            voting.end_time,
            voting.created_at,
            voting.total_votes
        )
    }

    /// Check if voting is active
    public fun is_active(voting: &Voting, clock: &Clock): bool {
        !voting.is_closed && !helpers::is_voting_ended(&voting.end_time, clock)
    }
}