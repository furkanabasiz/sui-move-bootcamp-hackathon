module voting::events {
    use sui::event;
    use std::string::String;

    /// Event emitted when a new voting is created
    public struct VotingCreated has copy, drop {
        voting_id: ID,
        creator: address,
        question: String,
        options_count: u64,
        end_time: Option<u64>,
        timestamp: u64
    }

    /// Event emitted when a vote is casted
    public struct VoteCasted has copy, drop {
        voting_id: ID,
        voter: address,
        option_index: u64,
        timestamp: u64
    }

    /// Event emitted when voting is closed
    public struct VotingClosed has copy, drop {
        voting_id: ID,
        closer: address,
        total_votes: u64,
        timestamp: u64
    }

    /// Event emitted when voting is deleted
    public struct VotingDeleted has copy, drop {
        voting_id: ID,
        deleter: address,
        timestamp: u64
    }

    /// Emit VotingCreated event
    public(package) fun emit_voting_created(
        voting_id: ID,
        creator: address,
        question: String,
        options_count: u64,
        end_time: Option<u64>,
        timestamp: u64
    ) {
        event::emit(VotingCreated {
            voting_id,
            creator,
            question,
            options_count,
            end_time,
            timestamp
        });
    }

    /// Emit VoteCasted event
    public(package) fun emit_vote_casted(
        voting_id: ID,
        voter: address,
        option_index: u64,
        timestamp: u64
    ) {
        event::emit(VoteCasted {
            voting_id,
            voter,
            option_index,
            timestamp
        });
    }

    /// Emit VotingClosed event
    public(package) fun emit_voting_closed(
        voting_id: ID,
        closer: address,
        total_votes: u64,
        timestamp: u64
    ) {
        event::emit(VotingClosed {
            voting_id,
            closer,
            total_votes,
            timestamp
        });
    }

    /// Emit VotingDeleted event
    public(package) fun emit_voting_deleted(
        voting_id: ID,
        deleter: address,
        timestamp: u64
    ) {
        event::emit(VotingDeleted {
            voting_id,
            deleter,
            timestamp
        });
    }
}