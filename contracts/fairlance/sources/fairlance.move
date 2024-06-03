
module fairlance::fairlance {

    use std::string::String;
    use sui::object::{new};


    /// Struct to store job offer details
    public struct JobOffer has key, store {
        id: UID,
        client: address,
        job_title: String,
        skills_required: String,
        description: String,
        image_id: String,
        budget: u64,
        deadline: u64,
        freelancer: Option<address>,
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
    public fun add_job_offer(
        ctx: &mut TxContext,
        client: address,
        job_title: String,
        skills_required: String,
        description: String,
        image_id: String,
        budget: u64,
        deadline: u64,
        custom_id: u64
    ): JobOffer {

        let job_offer = JobOffer {
            id: new(ctx),
            client,
            job_title,
            skills_required,
            description,
            image_id,
            budget,
            deadline,
            freelancer: std::option::none<address>(),
            completed: false,
            custom_id
        };
        job_offer
    }

    /// Accept a job offer
    public fun accept_job_offer(job_offer: &mut JobOffer, freelancer: address) {
            job_offer.freelancer = std::option::some(freelancer);
    }

    /// Mark job as completed
    public fun complete_job(ctx: &mut TxContext, job_offer: &mut JobOffer, freelancer: address): FreelancerAchievement {
        assert!(job_offer.freelancer == std::option::some(freelancer), 1);
        job_offer.completed = true;

        let achievement = FreelancerAchievement {
            id: new(ctx),
            freelancer,
            completed_jobs: vector[job_offer.custom_id]
        };
        achievement
    }

}

