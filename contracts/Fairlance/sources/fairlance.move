module 0x1::fairlance {

    use sui::event;
    use sui::coin::Coin;
    use sui::coin;
    use sui::tx_context::TxContext;

    // Struct to represent a Job
    public struct Job has copy, drop, store {
        id: u64,
        description: vector<u8>,
        freelancer: address,
        client: address,
        amount: u64,
        completed: bool,
    }

    // Event to be emitted after job completion and payment
    public struct JobCompletedEvent has copy, drop, store {
        job_id: u64,
        freelancer: address,
        client: address,
        amount: u64,
    }

    // Function to create a new job
    public fun create_job(
        id: u64,
        description: vector<u8>,
        freelancer: address,
        client: address,
        amount: u64
    ): Job {
        Job {
            id,
            description,
            freelancer,
            client,
            amount,
            completed: false,
        }
    }

    // Function to complete a job and release payment
    public fun complete_job(
        job: &mut Job,
        _client_coin: &mut Coin<u64>, // Prefix with underscore to avoid unused variable warning
        ctx: &mut TxContext
    ) {
        assert!(!job.completed, 1); // Ensure the job is not already completed
        job.completed = true;

        // Transfer the asset from client to freelancer
        // Use sui::coin::transfer to transfer coins
        coin::transfer(job.amount, job.client, job.freelancer, ctx);

        // Emit job completion event
        event::emit<JobCompletedEvent>(JobCompletedEvent {
            job_id: job.id,
            freelancer: job.freelancer,
            client: job.client,
            amount: job.amount,
        });
    }

    // Function to get job details
    public fun get_job_details(job: &Job): (u64, vector<u8>, address, address, u64, bool) {
        (
            job.id,
            job.description,
            job.freelancer,
            job.client,
            job.amount,
            job.completed,
        )
    }
}
