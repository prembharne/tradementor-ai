use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Map, String, Vec, Symbol};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Strategy {
    pub owner: Address,
    pub name: String,
    pub version: u32,
    pub rules_hash: String, // IPFS hash or merkle root of strategy rules
    pub created_at: u64,
    pub updated_at: u64,
    pub is_active: bool,
}

#[contracttype]
pub enum DataKey {
    Strategy(u64),      // strategy_id -> Strategy
    UserStrategies(Address), // owner -> Vec<strategy_id>
    NextId,
}

#[contract]
pub struct StrategyRegistry;

#[contractimpl]
impl StrategyRegistry {
    /// Register a new strategy version on-chain
    pub fn register_strategy(
        env: Env,
        owner: Address,
        name: String,
        rules_hash: String,
    ) -> u64 {
        owner.require_auth();

        let next_id: u64 = env.storage().instance().get(&DataKey::NextId).unwrap_or(0);
        let strategy_id = next_id + 1;

        let timestamp = env.ledger().timestamp();

        let strategy = Strategy {
            owner: owner.clone(),
            name,
            version: 1,
            rules_hash,
            created_at: timestamp,
            updated_at: timestamp,
            is_active: true,
        };

        // Store strategy
        env.storage().instance().set(&DataKey::Strategy(strategy_id), &strategy);

        // Update user's strategy list
        let mut user_strategies: Vec<u64> = env.storage().instance().get(&DataKey::UserStrategies(owner.clone())).unwrap_or(Vec::new(&env));
        user_strategies.push_back(strategy_id);
        env.storage().instance().set(&DataKey::UserStrategies(owner), &user_strategies);

        // Increment next ID
        env.storage().instance().set(&DataKey::NextId, &strategy_id);

        // Emit event
        env.events().publish(
            (Symbol::new(&env, "strategy_registered"), owner),
            (strategy_id, strategy.version),
        );

        strategy_id
    }

    /// Update strategy (new version)
    pub fn update_strategy(
        env: Env,
        owner: Address,
        strategy_id: u64,
        name: String,
        rules_hash: String,
    ) -> u32 {
        owner.require_auth();

        let mut strategy: Strategy = env.storage().instance().get(&DataKey::Strategy(strategy_id))
            .unwrap_or_else(|| panic!("Strategy not found"));

        if strategy.owner != owner {
            panic!("Unauthorized");
        }

        strategy.version += 1;
        strategy.name = name;
        strategy.rules_hash = rules_hash;
        strategy.updated_at = env.ledger().timestamp();

        env.storage().instance().set(&DataKey::Strategy(strategy_id), &strategy);

        env.events().publish(
            (Symbol::new(&env, "strategy_updated"), owner),
            (strategy_id, strategy.version),
        );

        strategy.version
    }

    /// Get strategy by ID
    pub fn get_strategy(env: Env, strategy_id: u64) -> Strategy {
        env.storage().instance().get(&DataKey::Strategy(strategy_id)).unwrap()
    }

    /// Get all strategy IDs for a user
    pub fn get_user_strategies(env: Env, owner: Address) -> Vec<u64> {
        env.storage().instance().get(&DataKey::UserStrategies(owner)).unwrap_or(Vec::new(&env))
    }

    /// Deactivate strategy
    pub fn deactivate_strategy(env: Env, owner: Address, strategy_id: u64) {
        owner.require_auth();

        let mut strategy: Strategy = env.storage().instance().get(&DataKey::Strategy(strategy_id))
            .unwrap_or_else(|| panic!("Strategy not found"));

        if strategy.owner != owner {
            panic!("Unauthorized");
        }

        strategy.is_active = false;
        strategy.updated_at = env.ledger().timestamp();

        env.storage().instance().set(&DataKey::Strategy(strategy_id), &strategy);

        env.events().publish(
            (Symbol::new(&env, "strategy_deactivated"), owner),
            strategy_id,
        );
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Address, Env};

    #[test]
    fn test_register_strategy() {
        let env = Env::default();
        let contract_id = env.register_contract(None, StrategyRegistry);
        let client = StrategyRegistryClient::new(&env, &contract_id);

        let owner = Address::generate(&env);
        let strategy_id = client.register_strategy(&owner, &String::from_str(&env, "Test Strategy"), &String::from_str(&env, "QmHash123"));

        assert_eq!(strategy_id, 1);

        let strategy = client.get_strategy(&strategy_id);
        assert_eq!(strategy.owner, owner);
        assert_eq!(strategy.name, String::from_str(&env, "Test Strategy"));
        assert_eq!(strategy.version, 1);
        assert_eq!(strategy.rules_hash, String::from_str(&env, "QmHash123"));
        assert!(strategy.is_active);
    }

    #[test]
    fn test_update_strategy() {
        let env = Env::default();
        let contract_id = env.register_contract(None, StrategyRegistry);
        let client = StrategyRegistryClient::new(&env, &contract_id);

        let owner = Address::generate(&env);
        let strategy_id = client.register_strategy(&owner, &String::from_str(&env, "Test"), &String::from_str(&env, "hash1"));

        let version = client.update_strategy(&owner, &strategy_id, &String::from_str(&env, "Test v2"), &String::from_str(&env, "hash2"));

        assert_eq!(version, 2);

        let strategy = client.get_strategy(&strategy_id);
        assert_eq!(strategy.version, 2);
        assert_eq!(strategy.rules_hash, String::from_str(&env, "hash2"));
    }
}