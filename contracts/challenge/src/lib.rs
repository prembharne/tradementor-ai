#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, contracterror,
    Address, Env, String, Symbol, Vec, Map, log, vec, map,
};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Challenge {
    pub id: u64,
    pub code: String,
    pub title: String,
    pub description: String,
    pub target: u32,
    pub metric: String,
    pub reward_xp: u32,
    pub is_active: bool,
    pub created_at: u64,
    pub created_by: Address,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct UserChallenge {
    pub user: Address,
    pub challenge_id: u64,
    pub progress: u32,
    pub completed: bool,
    pub completed_at: u64,
    pub proof_submitted: bool,
    pub proof_hash: String,
    pub on_chain_tx: String,
}

#[contracttype]
pub enum DataKey {
    Challenge(u64),
    UserChallenge(Address, u64),
    UserChallenges(Address),
    ActiveChallenges,
    NextId,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    NotFound = 1,
    Unauthorized = 2,
    AlreadyJoined = 3,
    InactiveChallenge = 4,
    AlreadyCompleted = 5,
}

#[contract]
pub struct ChallengeRegistry;

#[contractimpl]
impl ChallengeRegistry {
    /// Create a new challenge (admin only)
    pub fn create_challenge(
        env: Env,
        admin: Address,
        code: String,
        title: String,
        description: String,
        target: u32,
        metric: String,
        reward_xp: u32,
    ) -> u64 {
        admin.require_auth();

        let next_id: u64 = env.storage().instance().get(&DataKey::NextId).unwrap_or(0);
        let challenge_id = next_id + 1;
        env.storage().instance().set(&DataKey::NextId, &challenge_id);

        let timestamp = env.ledger().timestamp();

        let challenge = Challenge {
            id: challenge_id,
            code,
            title,
            description,
            target,
            metric,
            reward_xp,
            is_active: true,
            created_at: timestamp,
            created_by: admin.clone(),
        };

        env.storage().instance().set(&DataKey::Challenge(challenge_id), &challenge);

        // Add to active challenges
        let mut active: Vec<u64> = env.storage().instance()
            .get(&DataKey::ActiveChallenges)
            .unwrap_or(vec![&env]);
        active.push_back(challenge_id);
        env.storage().instance().set(&DataKey::ActiveChallenges, &active);

        env.events().publish(
            (Symbol::new(&env, "challenge_created"), admin),
            challenge_id,
        );

        challenge_id
    }

    /// Join a challenge
    pub fn join_challenge(env: Env, user: Address, challenge_id: u64) {
        user.require_auth();

        let challenge: Challenge = env.storage().instance().get(&DataKey::Challenge(challenge_id))
            .unwrap_or_else(|| panic!("Challenge not found"));

        if !challenge.is_active {
            panic!("Challenge not active");
        }

        let user_challenge_key = DataKey::UserChallenge(user.clone(), challenge_id);
        let existing: Option<UserChallenge> = env.storage().instance().get(&user_challenge_key);

        if existing.is_some() {
            panic!("Already joined");
        }

        let user_challenge = UserChallenge {
            user: user.clone(),
            challenge_id,
            progress: 0,
            completed: false,
            completed_at: 0,
            proof_submitted: false,
            proof_hash: String::from_str(&env, ""),
            on_chain_tx: String::from_str(&env, ""),
        };

        env.storage().instance().set(&user_challenge_key, &user_challenge);

        // Update user's challenge list
        let mut user_challenges: Vec<u64> = env.storage().instance()
            .get(&DataKey::UserChallenges(user.clone()))
            .unwrap_or(vec![&env]);
        user_challenges.push_back(challenge_id);
        env.storage().instance().set(&DataKey::UserChallenges(user.clone()), &user_challenges);

        env.events().publish(
            (Symbol::new(&env, "challenge_joined"), user),
            challenge_id,
        );
    }

    /// Submit proof of completion (called by backend after verification)
    pub fn submit_proof(
        env: Env,
        admin: Address,
        user: Address,
        challenge_id: u64,
        proof_hash: String,
        tx_hash: String,
    ) {
        admin.require_auth();

        let user_challenge_key = DataKey::UserChallenge(user.clone(), challenge_id);
        let mut user_challenge: UserChallenge = env.storage().instance().get(&user_challenge_key)
            .unwrap_or_else(|| panic!("User challenge not found"));

        if user_challenge.completed {
            panic!("Already completed");
        }

        user_challenge.proof_submitted = true;
        user_challenge.proof_hash = proof_hash;
        user_challenge.on_chain_tx = tx_hash;
        user_challenge.completed = true;
        user_challenge.completed_at = env.ledger().timestamp();

        env.storage().instance().set(&user_challenge_key, &user_challenge);

        env.events().publish(
            (Symbol::new(&env, "proof_submitted"), user),
            (challenge_id, user_challenge.progress),
        );
    }

    /// Update progress (called by backend after evaluation)
    pub fn update_progress(
        env: Env,
        admin: Address,
        user: Address,
        challenge_id: u64,
        progress: u32,
    ) {
        admin.require_auth();

        let user_challenge_key = DataKey::UserChallenge(user.clone(), challenge_id);
        let mut user_challenge: UserChallenge = env.storage().instance().get(&user_challenge_key)
            .unwrap_or_else(|| panic!("User challenge not found"));

        let challenge: Challenge = env.storage().instance().get(&DataKey::Challenge(challenge_id))
            .unwrap_or_else(|| panic!("Challenge not found"));

        user_challenge.progress = progress.min(challenge.target);

        if user_challenge.progress >= challenge.target && !user_challenge.completed {
            user_challenge.completed = true;
            user_challenge.completed_at = env.ledger().timestamp();
        }

        env.storage().instance().set(&user_challenge_key, &user_challenge);

        env.events().publish(
            (Symbol::new(&env, "progress_updated"), user),
            (challenge_id, user_challenge.progress),
        );
    }

    /// Get challenge info
    pub fn get_challenge(env: Env, challenge_id: u64) -> Challenge {
        env.storage().instance().get(&DataKey::Challenge(challenge_id)).unwrap()
    }

    /// Get user's challenge progress
    pub fn get_user_challenge(env: Env, user: Address, challenge_id: u64) -> UserChallenge {
        env.storage().instance().get(&DataKey::UserChallenge(user, challenge_id)).unwrap()
    }

    /// Get all challenge IDs for a user
    pub fn get_user_challenges(env: Env, user: Address) -> Vec<u64> {
        env.storage().instance().get(&DataKey::UserChallenges(user)).unwrap_or(vec![&env])
    }

    /// Get all active challenges
    pub fn get_active_challenges(env: Env) -> Vec<u64> {
        env.storage().instance().get(&DataKey::ActiveChallenges).unwrap_or(vec![&env])
    }

    /// Deactivate challenge (admin)
    pub fn deactivate_challenge(env: Env, admin: Address, challenge_id: u64) {
        admin.require_auth();

        let mut challenge: Challenge = env.storage().instance().get(&DataKey::Challenge(challenge_id))
            .unwrap_or_else(|| panic!("Challenge not found"));

        challenge.is_active = false;
        env.storage().instance().set(&DataKey::Challenge(challenge_id), &challenge);

        env.events().publish(
            (Symbol::new(&env, "challenge_deactivated"), admin),
            challenge_id,
        );
    }

    /// Batch create challenges (for initial setup)
    pub fn batch_create_challenges(
        env: Env,
        admin: Address,
        codes: Vec<String>,
        titles: Vec<String>,
        descriptions: Vec<String>,
        targets: Vec<u32>,
        metrics: Vec<String>,
        rewards: Vec<u32>,
    ) {
        admin.require_auth();

        let len = codes.len();
        if len != titles.len()
            || len != descriptions.len()
            || len != targets.len()
            || len != metrics.len()
            || len != rewards.len() {
            panic!("All arrays must have the same length");
        }

        for i in 0..len {
            Self::create_challenge(
                env.clone(),
                admin.clone(),
                codes.get(i).unwrap(),
                titles.get(i).unwrap(),
                descriptions.get(i).unwrap(),
                targets.get(i).unwrap(),
                metrics.get(i).unwrap(),
                rewards.get(i).unwrap(),
            );
        }
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Address, Env, vec as soroban_vec};

    #[test]
    fn test_create_and_join_challenge() {
        let env = Env::default();
        let contract_id = env.register_contract(None, ChallengeRegistry);
        let client = ChallengeRegistryClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let user = Address::generate(&env);

        let challenge_id = client.create_challenge(
            &admin,
            &String::from_str(&env, "RISK_10"),
            &String::from_str(&env, "Risk Master"),
            &String::from_str(&env, "Complete 10 trades within risk limits"),
            &10,
            &String::from_str(&env, "trades_within_risk"),
            &100,
        );

        assert_eq!(challenge_id, 1);

        client.join_challenge(&user, &challenge_id);

        let uc = client.get_user_challenge(&user, &challenge_id);
        assert_eq!(uc.user, user);
        assert_eq!(uc.challenge_id, challenge_id);
        assert_eq!(uc.progress, 0);
        assert!(!uc.completed);
    }

    #[test]
    fn test_update_progress() {
        let env = Env::default();
        let contract_id = env.register_contract(None, ChallengeRegistry);
        let client = ChallengeRegistryClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let user = Address::generate(&env);

        let challenge_id = client.create_challenge(
            &admin,
            &String::from_str(&env, "TEST"),
            &String::from_str(&env, "Test"),
            &String::from_str(&env, "Test"),
            &5,
            &String::from_str(&env, "test"),
            &50,
        );

        client.join_challenge(&user, &challenge_id);
        client.update_progress(&admin, &user, &challenge_id, &3);

        let uc = client.get_user_challenge(&user, &challenge_id);
        assert_eq!(uc.progress, 3);
        assert!(!uc.completed);

        client.update_progress(&admin, &user, &challenge_id, &5);

        let uc = client.get_user_challenge(&user, &challenge_id);
        assert_eq!(uc.progress, 5);
        assert!(uc.completed);
    }

    #[test]
    fn test_submit_proof() {
        let env = Env::default();
        let contract_id = env.register_contract(None, ChallengeRegistry);
        let client = ChallengeRegistryClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let user = Address::generate(&env);

        let challenge_id = client.create_challenge(
            &admin,
            &String::from_str(&env, "TEST"),
            &String::from_str(&env, "Test"),
            &String::from_str(&env, "Test"),
            &5,
            &String::from_str(&env, "test"),
            &50,
        );

        client.join_challenge(&user, &challenge_id);
        client.update_progress(&admin, &user, &challenge_id, &5);

        client.submit_proof(&admin, &user, &challenge_id, &String::from_str(&env, "proof_hash"), &String::from_str(&env, "tx_hash"));

        let uc = client.get_user_challenge(&user, &challenge_id);
        assert!(uc.proof_submitted);
        assert_eq!(uc.proof_hash, String::from_str(&env, "proof_hash"));
        assert_eq!(uc.on_chain_tx, String::from_str(&env, "tx_hash"));
    }

    #[test]
    fn test_batch_create() {
        let env = Env::default();
        let contract_id = env.register_contract(None, ChallengeRegistry);
        let client = ChallengeRegistryClient::new(&env, &contract_id);

        let admin = Address::generate(&env);

        let codes = soroban_vec![&env, String::from_str(&env, "CHAL1"), String::from_str(&env, "CHAL2")];
        let titles = soroban_vec![&env, String::from_str(&env, "Challenge 1"), String::from_str(&env, "Challenge 2")];
        let descriptions = soroban_vec![&env, String::from_str(&env, "Desc 1"), String::from_str(&env, "Desc 2")];
        let targets = soroban_vec![&env, 5u32, 10u32];
        let metrics = soroban_vec![&env, String::from_str(&env, "metric1"), String::from_str(&env, "metric2")];
        let rewards = soroban_vec![&env, 50u32, 100u32];

        client.batch_create_challenges(&admin, &codes, &titles, &descriptions, &targets, &metrics, &rewards);

        let active = client.get_active_challenges();
        assert_eq!(active.len(), 2);
    }
}