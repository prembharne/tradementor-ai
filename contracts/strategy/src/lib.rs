#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, contracterror,
    Address, Env, String, Symbol, Vec, Map, log, vec, map,
};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Strategy {
    pub id: u64,
    pub owner: Address,
    pub name: String,
    pub market: String,
    pub timeframe: String,
    pub risk_percent: u32,
    pub reward_ratio: u32,
    pub entry_rules: Vec<String>,
    pub exit_rules: Vec<String>,
    pub status: String,
    pub version: u32,
    pub on_chain_status: String,
    pub created_at: u64,
    pub updated_at: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct StrategyVersion {
    pub strategy_id: u64,
    pub version: u32,
    pub entry_rules: Vec<String>,
    pub exit_rules: Vec<String>,
    pub risk_percent: u32,
    pub reward_ratio: u32,
    pub status: String,
    pub timestamp: u64,
    pub tx_hash: String,
}

#[contracttype]
pub enum DataKey {
    NextStrategyId,
    Strategy(u64),
    UserStrategies(Address),
    StrategyVersions(u64),
    StrategyCount,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    NotFound = 1,
    Unauthorized = 2,
    AlreadyExists = 3,
    InvalidVersion = 4,
    InactiveStrategy = 5,
}

#[contract]
pub struct StrategyRegistry;

#[contractimpl]
impl StrategyRegistry {
    /// Create a new strategy
    pub fn create_strategy(
        env: Env,
        owner: Address,
        name: String,
        market: String,
        timeframe: String,
        risk_percent: u32,
        reward_ratio: u32,
        entry_rules: Vec<String>,
        exit_rules: Vec<String>,
    ) -> u64 {
        owner.require_auth();

        let strategy_id: u64 = env.storage().instance().get(&DataKey::NextStrategyId).unwrap_or(0);
        let new_id = strategy_id + 1;
        env.storage().instance().set(&DataKey::NextStrategyId, &new_id);

        let timestamp = env.ledger().timestamp();

        let strategy = Strategy {
            id: new_id,
            owner: owner.clone(),
            name,
            market,
            timeframe,
            risk_percent,
            reward_ratio,
            entry_rules,
            exit_rules,
            status: String::from_str(&env, "draft"),
            version: 1,
            on_chain_status: String::from_str(&env, "pending"),
            created_at: timestamp,
            updated_at: timestamp,
        };

        env.storage().instance().set(&DataKey::Strategy(new_id), &strategy);

        // Add to user's strategies
        let mut user_strategies: Vec<u64> = env.storage().instance()
            .get(&DataKey::UserStrategies(owner.clone()))
            .unwrap_or(vec![&env]);
        user_strategies.push_back(new_id);
        env.storage().instance().set(&DataKey::UserStrategies(owner.clone()), &user_strategies);

        // Create initial version
        let version = StrategyVersion {
            strategy_id: new_id,
            version: 1,
            entry_rules: strategy.entry_rules.clone(),
            exit_rules: strategy.exit_rules.clone(),
            risk_percent: strategy.risk_percent,
            reward_ratio: strategy.reward_ratio,
            status: strategy.status.clone(),
            timestamp,
            tx_hash: String::from_str(&env, ""),
        };
        let mut versions: Vec<StrategyVersion> = Vec::new(&env);
        versions.push_back(version);
        env.storage().instance().set(&DataKey::StrategyVersions(new_id), &versions);

        env.events().publish(
            (Symbol::new(&env, "strategy_created"), owner),
            new_id,
        );

        new_id
    }

    /// Update strategy (creates new version)
    pub fn update_strategy(
        env: Env,
        owner: Address,
        strategy_id: u64,
        name: String,
        market: String,
        timeframe: String,
        risk_percent: u32,
        reward_ratio: u32,
        entry_rules: Vec<String>,
        exit_rules: Vec<String>,
        status: String,
    ) {
        owner.require_auth();

        let mut strategy: Strategy = env.storage().instance()
            .get(&DataKey::Strategy(strategy_id))
            .unwrap_or_else(|| panic!("Strategy not found"));

        if strategy.owner != owner {
            panic!("Unauthorized");
        }

        let timestamp = env.ledger().timestamp();
        let new_version = strategy.version + 1;

        // Save old version
        let version = StrategyVersion {
            strategy_id,
            version: strategy.version,
            entry_rules: strategy.entry_rules.clone(),
            exit_rules: strategy.exit_rules.clone(),
            risk_percent: strategy.risk_percent,
            reward_ratio: strategy.reward_ratio,
            status: strategy.status.clone(),
            timestamp: strategy.updated_at,
            tx_hash: String::from_str(&env, ""),
        };
        let mut versions: Vec<StrategyVersion> = env.storage().instance()
            .get(&DataKey::StrategyVersions(strategy_id))
            .unwrap_or(Vec::new(&env));
        versions.push_back(version);
        env.storage().instance().set(&DataKey::StrategyVersions(strategy_id), &versions);

        // Update strategy
        strategy.name = name;
        strategy.market = market;
        strategy.timeframe = timeframe;
        strategy.risk_percent = risk_percent;
        strategy.reward_ratio = reward_ratio;
        strategy.entry_rules = entry_rules;
        strategy.exit_rules = exit_rules;
        strategy.status = status;
        strategy.version = new_version;
        strategy.updated_at = timestamp;

        env.storage().instance().set(&DataKey::Strategy(strategy_id), &strategy);

        env.events().publish(
            (Symbol::new(&env, "strategy_updated"), owner),
            (strategy_id, new_version),
        );
    }

    /// Publish strategy to chain
    pub fn publish_strategy(
        env: Env,
        owner: Address,
        strategy_id: u64,
        tx_hash: String,
    ) {
        owner.require_auth();

        let mut strategy: Strategy = env.storage().instance()
            .get(&DataKey::Strategy(strategy_id))
            .unwrap_or_else(|| panic!("Strategy not found"));

        if strategy.owner != owner {
            panic!("Unauthorized");
        }

        strategy.status = String::from_str(&env, "published");
        strategy.on_chain_status = String::from_str(&env, "confirmed");
        strategy.updated_at = env.ledger().timestamp();

        env.storage().instance().set(&DataKey::Strategy(strategy_id), &strategy);

        // Update version tx_hash
        let mut versions: Vec<StrategyVersion> = env.storage().instance()
            .get(&DataKey::StrategyVersions(strategy_id))
            .unwrap_or(Vec::new(&env));
        if let Some(last) = versions.last() {
            let mut last_version = last.clone();
            last_version.tx_hash = tx_hash.clone();
            versions.push_back(last_version);
            env.storage().instance().set(&DataKey::StrategyVersions(strategy_id), &versions);
        }

        env.events().publish(
            (Symbol::new(&env, "strategy_published"), owner),
            (strategy_id, tx_hash),
        );
    }

    /// Get strategy by ID
    pub fn get_strategy(env: Env, strategy_id: u64) -> Strategy {
        env.storage().instance()
            .get(&DataKey::Strategy(strategy_id))
            .unwrap_or_else(|| panic!("Strategy not found"))
    }

    /// Get user's strategies
    pub fn get_user_strategies(env: Env, owner: Address) -> Vec<u64> {
        env.storage().instance()
            .get(&DataKey::UserStrategies(owner))
            .unwrap_or(Vec::new(&env))
    }

    /// Get strategy version history
    pub fn get_strategy_versions(env: Env, strategy_id: u64) -> Vec<StrategyVersion> {
        env.storage().instance()
            .get(&DataKey::StrategyVersions(strategy_id))
            .unwrap_or(Vec::new(&env))
    }

    /// Get strategy count
    pub fn get_strategy_count(env: Env) -> u64 {
        env.storage().instance()
            .get(&DataKey::StrategyCount)
            .unwrap_or(0)
    }
}

#[cfg(test)]
mod test {
    use soroban_sdk::{testutils::Address as _, Address, Env, String, vec as soroban_vec};
    use super::{StrategyRegistry, StrategyRegistryClient};

    #[test]
    fn test_create_and_update_strategy() {
        let env = Env::default();
        let contract_id = env.register_contract(None, StrategyRegistry);
        let client = StrategyRegistryClient::new(&env, &contract_id);

        let owner = Address::generate(&env);

        let strategy_id = client.create_strategy(
            &owner,
            &String::from_str(&env, "Test Strategy"),
            &String::from_str(&env, "BTCUSDT"),
            &String::from_str(&env, "15m"),
            &2,
            &2,
            &soroban_vec![&env, String::from_str(&env, "RSI < 30")],
            &soroban_vec![&env, String::from_str(&env, "RSI > 70")],
        );

        assert_eq!(strategy_id, 1);

        let strategy = client.get_strategy(&strategy_id);
        assert_eq!(strategy.owner, owner);
        assert_eq!(strategy.name, String::from_str(&env, "Test Strategy"));
        assert_eq!(strategy.version, 1);
        assert_eq!(strategy.status, String::from_str(&env, "draft"));

        client.update_strategy(
            &owner,
            &strategy_id,
            &String::from_str(&env, "Updated Strategy"),
            &String::from_str(&env, "ETHUSDT"),
            &String::from_str(&env, "1h"),
            &1,
            &3,
            &soroban_vec![&env, String::from_str(&env, "EMA cross")],
            &soroban_vec![&env, String::from_str(&env, "Take profit")],
            &String::from_str(&env, "published"),
        );

        let strategy = client.get_strategy(&strategy_id);
        assert_eq!(strategy.version, 2);
        assert_eq!(strategy.name, String::from_str(&env, "Updated Strategy"));
        assert_eq!(strategy.status, String::from_str(&env, "published"));

        let versions = client.get_strategy_versions(&strategy_id);
        assert_eq!(versions.len(), 2);
    }

    #[test]
    fn test_publish_strategy() {
        let env = Env::default();
        let contract_id = env.register_contract(None, StrategyRegistry);
        let client = StrategyRegistryClient::new(&env, &contract_id);

        let owner = Address::generate(&env);

        let strategy_id = client.create_strategy(
            &owner,
            &String::from_str(&env, "Test"),
            &String::from_str(&env, "BTCUSDT"),
            &String::from_str(&env, "15m"),
            &2,
            &2,
            &soroban_vec![&env, String::from_str(&env, "RSI < 30")],
            &soroban_vec![&env, String::from_str(&env, "RSI > 70")],
        );

        client.publish_strategy(
            &owner,
            &strategy_id,
            &String::from_str(&env, "tx_12345"),
        );

        let strategy = client.get_strategy(&strategy_id);
        assert_eq!(strategy.on_chain_status, String::from_str(&env, "confirmed"));
    }
}