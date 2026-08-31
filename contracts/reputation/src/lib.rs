#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, contracterror,
    Address, Env, String, Symbol, Vec, Map, log,
};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ReputationSnapshot {
    pub user: Address,
    pub score: u32,
    pub average_score: u32,
    pub average_outcome_r: u32,
    pub adherence_rate: u32,
    pub challenge_bonus: u32,
    pub total_trades: u32,
    pub completed_challenges: u32,
    pub updated_at: u64,
    pub tx_hash: String,
}

#[contracttype]
pub enum DataKey {
    Reputation(Address),
    Leaderboard,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    NotFound = 1,
    Unauthorized = 2,
    InvalidScore = 3,
}

#[contract]
pub struct ReputationRegistry;

#[contractimpl]
impl ReputationRegistry {
    /// Update user reputation (called by backend after computing)
    pub fn update_reputation(
        env: Env,
        admin: Address,
        user: Address,
        score: u32,
        average_score: u32,
        average_outcome_r: u32,
        adherence_rate: u32,
        challenge_bonus: u32,
        total_trades: u32,
        completed_challenges: u32,
        tx_hash: String,
    ) {
        admin.require_auth();

        if score > 1000 {
            panic!("Score cannot exceed 1000");
        }

        let timestamp = env.ledger().timestamp();

        let snapshot = ReputationSnapshot {
            user: user.clone(),
            score,
            average_score,
            average_outcome_r,
            adherence_rate,
            challenge_bonus,
            total_trades,
            completed_challenges,
            updated_at: timestamp,
            tx_hash,
        };

        env.storage().instance().set(&DataKey::Reputation(user.clone()), &snapshot);

        // Update leaderboard
        Self::update_leaderboard(&env, &user, score);

        env.events().publish(
            ("reputation_updated", user.clone()),
            (score, timestamp),
        );
    }

    /// Get user reputation
    pub fn get_reputation(env: Env, user: Address) -> ReputationSnapshot {
        env.storage().instance()
            .get(&DataKey::Reputation(user.clone()))
            .unwrap_or(ReputationSnapshot {
                user: user.clone(),
                score: 0,
                average_score: 0,
                average_outcome_r: 0,
                adherence_rate: 0,
                challenge_bonus: 0,
                total_trades: 0,
                completed_challenges: 0,
                updated_at: 0,
                tx_hash: String::from_str(&env, ""),
            })
    }

    /// Get leaderboard (top N users)
    pub fn get_leaderboard(env: Env, limit: u32) -> Vec<ReputationSnapshot> {
        let leaderboard: Vec<(Address, u32)> = env.storage().instance()
            .get(&DataKey::Leaderboard)
            .unwrap_or(Vec::new(&env));

        let mut result = Vec::new(&env);
        let mut count: u32 = 0;
        for (user, _score) in leaderboard.iter() {
            if count >= limit {
                break;
            }
            if let Some(snapshot) = env.storage().instance().get(&DataKey::Reputation(user)) {
                result.push_back(snapshot);
                count += 1;
            }
        }

        result
    }

    /// Get user rank
    pub fn get_user_rank(env: Env, user: Address) -> u32 {
        let leaderboard: Vec<(Address, u32)> = env.storage().instance()
            .get(&DataKey::Leaderboard)
            .unwrap_or(Vec::new(&env));

        let mut index: u32 = 0;
        for (u, _) in leaderboard.iter() {
            index += 1;
            if u == user {
                return index;
            }
        }

        0
    }

    /// Get total users with reputation
    pub fn get_total_users(env: Env) -> u32 {
        let leaderboard: Vec<(Address, u32)> = env.storage().instance()
            .get(&DataKey::Leaderboard)
            .unwrap_or(Vec::new(&env));
        leaderboard.len() as u32
    }

    /// Increment user's trade count
    pub fn increment_trades(env: Env, admin: Address, user: Address) {
        admin.require_auth();

        let mut snapshot: ReputationSnapshot = env.storage().instance()
            .get(&DataKey::Reputation(user.clone()))
            .unwrap_or(ReputationSnapshot {
                user: user.clone(),
                score: 0,
                average_score: 0,
                average_outcome_r: 0,
                adherence_rate: 0,
                challenge_bonus: 0,
                total_trades: 0,
                completed_challenges: 0,
                updated_at: 0,
                tx_hash: String::from_str(&env, ""),
            });

        snapshot.total_trades += 1;
        snapshot.updated_at = env.ledger().timestamp();
        env.storage().instance().set(&DataKey::Reputation(user), &snapshot);
    }

    /// Increment completed challenges
    pub fn increment_challenges(env: Env, admin: Address, user: Address) {
        admin.require_auth();

        let mut snapshot: ReputationSnapshot = env.storage().instance()
            .get(&DataKey::Reputation(user.clone()))
            .unwrap_or(ReputationSnapshot {
                user: user.clone(),
                score: 0,
                average_score: 0,
                average_outcome_r: 0,
                adherence_rate: 0,
                challenge_bonus: 0,
                total_trades: 0,
                completed_challenges: 0,
                updated_at: 0,
                tx_hash: String::from_str(&env, ""),
            });

        snapshot.completed_challenges += 1;
        snapshot.updated_at = env.ledger().timestamp();
        env.storage().instance().set(&DataKey::Reputation(user), &snapshot);
    }

    /// Batch update multiple users (for periodic sync)
    pub fn batch_update(
        env: Env,
        admin: Address,
        users: Vec<Address>,
        scores: Vec<u32>,
        average_scores: Vec<u32>,
        average_outcome_rs: Vec<u32>,
        adherence_rates: Vec<u32>,
        challenge_bonuses: Vec<u32>,
        total_trades: Vec<u32>,
        completed_challenges: Vec<u32>,
        tx_hashes: Vec<String>,
    ) {
        admin.require_auth();

        let len = users.len();
        if len != scores.len()
            || len != average_scores.len()
            || len != average_outcome_rs.len()
            || len != adherence_rates.len()
            || len != challenge_bonuses.len()
            || len != total_trades.len()
            || len != completed_challenges.len()
            || len != tx_hashes.len() {
            panic!("All arrays must have the same length");
        }

        let timestamp = env.ledger().timestamp();

        for i in 0..len {
            let user = users.get(i).unwrap();
            let score = scores.get(i).unwrap();

            let snapshot = ReputationSnapshot {
                user: user.clone(),
                score,
                average_score: average_scores.get(i).unwrap(),
                average_outcome_r: average_outcome_rs.get(i).unwrap(),
                adherence_rate: adherence_rates.get(i).unwrap(),
                challenge_bonus: challenge_bonuses.get(i).unwrap(),
                total_trades: total_trades.get(i).unwrap(),
                completed_challenges: completed_challenges.get(i).unwrap(),
                updated_at: timestamp,
                tx_hash: tx_hashes.get(i).unwrap(),
            };

            env.storage().instance().set(&DataKey::Reputation(user.clone()), &snapshot);
            Self::update_leaderboard(&env, &user, score);
        }

        env.events().publish(
            ("batch_update",),
            (len, timestamp),
        );
    }

    /// Internal: update leaderboard
    fn update_leaderboard(env: &Env, user: &Address, score: u32) {
        let mut leaderboard: Vec<(Address, u32)> = env.storage().instance()
            .get(&DataKey::Leaderboard)
            .unwrap_or(Vec::new(env));

        // Build new leaderboard without this user
        let mut new_leaderboard = Vec::new(env);
        for (u, s) in leaderboard.iter() {
            if u != *user {
                new_leaderboard.push_back((u, s));
            }
        }

        // Insert in sorted order (highest score first)
        let mut inserted = false;
        let mut final_leaderboard = Vec::new(env);
        for (u, s) in new_leaderboard.iter() {
            if !inserted && score > s {
                final_leaderboard.push_back((user.clone(), score));
                inserted = true;
            }
            final_leaderboard.push_back((u, s));
        }
        if !inserted {
            final_leaderboard.push_back((user.clone(), score));
        }

        env.storage().instance().set(&DataKey::Leaderboard, &final_leaderboard);
    }
}

#[cfg(test)]
mod test {
    use soroban_sdk::{testutils::Address as _, Address, Env, String, Vec};
    use super::{ReputationRegistry, ReputationRegistryClient};

    #[test]
    fn test_update_and_get_reputation() {
        let env = Env::default();
        let contract_id = env.register_contract(None, ReputationRegistry);
        let client = ReputationRegistryClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let user = Address::generate(&env);

        client.update_reputation(
            &admin,
            &user,
            &85,
            &80,
            &250, // 2.5R * 100
            &90,
            &10,
            &50,
            &5,
            &String::from_str(&env, "tx_123"),
        );

        let rep = client.get_reputation(&user);
        assert_eq!(rep.score, 85);
        assert_eq!(rep.average_score, 80);
        assert_eq!(rep.average_outcome_r, 250);
        assert_eq!(rep.adherence_rate, 90);
        assert_eq!(rep.challenge_bonus, 10);
        assert_eq!(rep.total_trades, 50);
        assert_eq!(rep.completed_challenges, 5);
        assert_eq!(rep.tx_hash, String::from_str(&env, "tx_123"));
    }

    #[test]
    fn test_leaderboard() {
        let env = Env::default();
        let contract_id = env.register_contract(None, ReputationRegistry);
        let client = ReputationRegistryClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let user1 = Address::generate(&env);
        let user2 = Address::generate(&env);
        let user3 = Address::generate(&env);

        client.update_reputation(&admin, &user1, &100, &90, &300, &95, &20, &100, &10, &String::from_str(&env, "tx1"));
        client.update_reputation(&admin, &user2, &80, &75, &200, &85, &10, &80, &5, &String::from_str(&env, "tx2"));
        client.update_reputation(&admin, &user3, &90, &85, &250, &90, &15, &90, &8, &String::from_str(&env, "tx3"));

        let leaderboard = client.get_leaderboard(&10);
        assert_eq!(leaderboard.len(), 3);
        assert_eq!(leaderboard.get(0).unwrap().score, 100); // user1 first
        assert_eq!(leaderboard.get(1).unwrap().score, 90);  // user3 second
        assert_eq!(leaderboard.get(2).unwrap().score, 80);  // user2 third

        assert_eq!(client.get_user_rank(&user1), 1);
        assert_eq!(client.get_user_rank(&user3), 2);
        assert_eq!(client.get_user_rank(&user2), 3);
    }

    #[test]
    fn test_batch_update() {
        let env = Env::default();
        let contract_id = env.register_contract(None, ReputationRegistry);
        let client = ReputationRegistryClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let user1 = Address::generate(&env);
        let user2 = Address::generate(&env);

        let users = Vec::from_array(&env, [user1.clone(), user2.clone()]);
        let scores = Vec::from_array(&env, [90u32, 85u32]);
        let avg_scores = Vec::from_array(&env, [85u32, 80u32]);
        let avg_rs = Vec::from_array(&env, [200u32, 180u32]);
        let adherence = Vec::from_array(&env, [90u32, 85u32]);
        let bonuses = Vec::from_array(&env, [10u32, 5u32]);
        let trades = Vec::from_array(&env, [50u32, 40u32]);
        let challenges = Vec::from_array(&env, [5u32, 3u32]);
        let txs = Vec::from_array(&env, [String::from_str(&env, "tx1"), String::from_str(&env, "tx2")]);

        client.batch_update(&admin, &users, &scores, &avg_scores, &avg_rs, &adherence, &bonuses, &trades, &challenges, &txs);

        let rep1 = client.get_reputation(&user1);
        assert_eq!(rep1.score, 90);

        let rep2 = client.get_reputation(&user2);
        assert_eq!(rep2.score, 85);
    }
}