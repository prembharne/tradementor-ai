use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Map, String, Vec, Symbol, Vec as SorobanVec};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Challenge {
    pub id: u64,
    pub code: String,
    pub title: String,
    pub description: String,
    pub target: u32,
    pub metric: String, // "trades_within_risk", "perfect_execution", "detailed_reviews"
    pub reward_xp: u32,
    pub is_active: bool,
    pub created_at: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct UserChallenge {
    pub user: Address,
    pub challenge_id: u64,
    pub progress: u32,
    pub completed: bool,
    pub completed_at: Option<u64>,
    pub proof_submitted: bool,
    pub proof_hash: Option<String>,
    pub on_chain_tx: Option<String>,
}

#[contracttype]
pub enum ChallengeDataKey {
    Challenge(u64),
    UserChallenge(Address, u64),
    UserChallenges(Address),
    NextId,
    ActiveChallenges,
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

        let next_id: u64 = env.storage().instance().get(&ChallengeDataKey::NextId).unwrap_or(0);
        let challenge_id = next_id + 1;

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
        };

        env.storage().instance().set(&ChallengeDataKey::Challenge(challenge_id), &challenge);

        // Add to active challenges
        let mut active: Vec<u64> = env.storage().instance().get(&ChallengeDataKey::ActiveChallenges).unwrap_or(Vec::new(&env));
        active.push_back(challenge_id);
        env.storage().instance().set(&ChallengeDataKey::ActiveChallenges, &active);

        env.storage().instance().set(&ChallengeDataKey::NextId, &challenge_id);

        env.events().publish(
            (Symbol::new(&env, "challenge_created"), admin),
            challenge_id,
        );

        challenge_id
    }

    /// Join a challenge
    pub fn join_challenge(env: Env, user: Address, challenge_id: u64) {
        user.require_auth();

        let challenge: Challenge = env.storage().instance().get(&ChallengeDataKey::Challenge(challenge_id))
            .unwrap_or_else(|| panic!("Challenge not found"));

        if !challenge.is_active {
            panic!("Challenge not active");
        }

        let user_challenge_key = ChallengeDataKey::UserChallenge(user.clone(), challenge_id);
        let existing: Option<UserChallenge> = env.storage().instance().get(&user_challenge_key);

        if existing.is_some() {
            panic!("Already joined");
        }

        let user_challenge = UserChallenge {
            user: user.clone(),
            challenge_id,
            progress: 0,
            completed: false,
            completed_at: None,
            proof_submitted: false,
            proof_hash: None,
            on_chain_tx: None,
        };

        env.storage().instance().set(&user_challenge_key, &user_challenge);

        // Update user's challenge list
        let mut user_challenges: Vec<u64> = env.storage().instance().get(&ChallengeDataKey::UserChallenges(user.clone())).unwrap_or(Vec::new(&env));
        user_challenges.push_back(challenge_id);
        env.storage().instance().set(&ChallengeDataKey::UserChallenges(user), &user_challenges);

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

        let user_challenge_key = ChallengeDataKey::UserChallenge(user.clone(), challenge_id);
        let mut user_challenge: UserChallenge = env.storage().instance().get(&user_challenge_key)
            .unwrap_or_else(|| panic!("User challenge not found"));

        if user_challenge.completed {
            panic!("Already completed");
        }

        user_challenge.proof_submitted = true;
        user_challenge.proof_hash = Some(proof_hash);
        user_challenge.on_chain_tx = Some(tx_hash);
        user_challenge.completed = true;
        user_challenge.completed_at = Some(env.ledger().timestamp());

        env.storage().instance().set(&user_challenge_key, &user_challenge);

        env.events().publish(
            (Symbol::new(&env, "proof_submitted"), user),
            (challenge_id, user_challenge.progress),
        );
    }

    /// Update progress (called by backend)
    pub fn update_progress(
        env: Env,
        admin: Address,
        user: Address,
        challenge_id: u64,
        progress: u32,
    ) {
        admin.require_auth();

        let user_challenge_key = ChallengeDataKey::UserChallenge(user.clone(), challenge_id);
        let mut user_challenge: UserChallenge = env.storage().instance().get(&user_challenge_key)
            .unwrap_or_else(|| panic!("User challenge not found"));

        let challenge: Challenge = env.storage().instance().get(&ChallengeDataKey::Challenge(challenge_id))
            .unwrap_or_else(|| panic!("Challenge not found"));

        user_challenge.progress = progress.min(challenge.target);

        if user_challenge.progress >= challenge.target && !user_challenge.completed {
            user_challenge.completed = true;
            user_challenge.completed_at = Some(env.ledger().timestamp());
        }

        env.storage().instance().set(&user_challenge_key, &user_challenge);

        env.events().publish(
            (Symbol::new(&env, "progress_updated"), user),
            (challenge_id, user_challenge.progress),
        );
    }

    /// Get challenge info
    pub fn get_challenge(env: Env, challenge_id: u64) -> Challenge {
        env.storage().instance().get(&ChallengeDataKey::Challenge(challenge_id)).unwrap()
    }

    /// Get user's challenge progress
    pub fn get_user_challenge(env: Env, user: Address, challenge_id: u64) -> UserChallenge {
        env.storage().instance().get(&ChallengeDataKey::UserChallenge(user, challenge_id)).unwrap()
    }

    /// Get all challenge IDs for a user
    pub fn get_user_challenges(env: Env, user: Address) -> Vec<u64> {
        env.storage().instance().get(&ChallengeDataKey::UserChallenges(user)).unwrap_or(Vec::new(&env))
    }

    /// Get all active challenges
    pub fn get_active_challenges(env: Env) -> Vec<u64> {
        env.storage().instance().get(&ChallengeDataKey::ActiveChallenges).unwrap_or(Vec::new(&env))
    }

    /// Deactivate challenge (admin)
    pub fn deactivate_challenge(env: Env, admin: Address, challenge_id: u64) {
        admin.require_auth();

        let mut challenge: Challenge = env.storage().instance().get(&ChallengeDataKey::Challenge(challenge_id))
            .unwrap_or_else(|| panic!("Challenge not found"));

        challenge.is_active = false;
        env.storage().instance().set(&ChallengeDataKey::Challenge(challenge_id), &challenge);

        env.events().publish(
            (Symbol::new(&env, "challenge_deactivated"), admin),
            challenge_id,
        );
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Address, Env};

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
}