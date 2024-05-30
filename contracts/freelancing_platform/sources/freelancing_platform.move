module freelancing_platform::freelancing_platform {

    use std::string::String;
    use sui::object::{new};
    // use sui::tx_context::TxContext;
    // use sui::address::Address;
    // use option::Option;
    use std::debug;


    /// Struct to store job offer details
    public struct JobOffer has key, store {
        id: UID,
        client: address,
        description: String,
        freelancer: option::Option<address>,
        completed: bool,
        custom_id: u64
    }

    /// Struct to store freelancer achievements
    public struct FreelancerAchievement has key, store {
        id: UID,
        freelancer: address,
        completed_jobs: vector<u64>
    }

    /// Create a new job offer
    public fun add_job_offer(ctx: &mut TxContext, client: address, description: String, custom_id: u64): JobOffer {
        // debug::print(add_job_offer ca);
        debug::print(&client);
        debug::print(&description);
        debug::print(&custom_id);

        let job_offer = JobOffer {
            id: new(ctx),
            client,
            description,
            freelancer: option::none<address>(),
            completed: false,
            custom_id

        };
        // debug::print(&format!("Job offer created with ID: {}", job_offer.id));
        job_offer
    }

    /// Accept a job offer
    public fun accept_job_offer(job_offer: &mut JobOffer, freelancer: address) {
        job_offer.freelancer = option::some(freelancer);
    }

    /// Mark job as completed
    public fun complete_job(ctx: &mut TxContext, job_offer: &mut JobOffer, freelancer: address): FreelancerAchievement {
        // debug::print(&format!("accept_job_offer called with freelancer: {}", freelancer));
        assert!(job_offer.freelancer == option::some(freelancer), 1);
        job_offer.completed = true;

        let achievement = FreelancerAchievement {
            id: new(ctx),
            freelancer,
            completed_jobs: vector[job_offer.custom_id]
        };
        // debug::print(&format!("Job completed with ID: {} and achievement created with ID: {}", job_offer.id, achievement.id));
        achievement
    }
}
