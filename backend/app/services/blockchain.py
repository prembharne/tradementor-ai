"""Thin Soroban client. Reads contract addresses + network from settings.

All calls are best-effort: if a contract address is not configured or the
network call fails, the service returns ``None`` and the caller stores the
record off-chain (so the app keeps working without a deployed contract).
"""
from typing import Optional

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class BlockchainClient:
    def __init__(self) -> None:
        self.network = settings.STELLAR_NETWORK
        self.rpc_url = settings.STELLAR_RPC_URL
        self.passphrase = settings.STELLAR_NETWORK_PASSPHRASE
        self.strategy_contract = settings.STRATEGY_CONTRACT_ADDRESS
        self.challenge_contract = settings.CHALLENGE_CONTRACT_ADDRESS
        self.reputation_contract = settings.REPUTATION_CONTRACT_ADDRESS

    @property
    def enabled(self) -> bool:
        return bool(self.strategy_contract and self.challenge_contract and self.reputation_contract)

    def version_strategy(self, strategy_id: str, version: int, owner: str) -> Optional[str]:
        """Submit a strategy version to the on-chain registry.

        Returns the tx hash, or ``None`` if contracts are not configured.
        """
        if not self.enabled:
            logger.info("blockchain.version_strategy skipped: contracts not configured")
            return None
        # Integration point: build + submit a Soroban invocation here using
        # stellar-sdk's SorobanServer / Contract interactions once the
        # contracts in /contracts are deployed and addresses are set in .env.
        logger.info(
            "blockchain.version_strategy",
            strategy_id=strategy_id,
            version=version,
            owner=owner,
        )
        return None

    def submit_challenge_proof(self, owner: str, challenge_code: str) -> Optional[str]:
        if not self.enabled:
            return None
        logger.info("blockchain.submit_challenge_proof", owner=owner, challenge_code=challenge_code)
        return None

    def update_reputation(self, owner: str, score: int) -> Optional[str]:
        if not self.enabled:
            return None
        logger.info("blockchain.update_reputation", owner=owner, score=score)
        return None


blockchain = BlockchainClient()
