from typing import Optional
from stellar_sdk import Keypair
from stellar_sdk.exceptions import Ed25519PublicKeyInvalidError, Ed25519SecretSeedInvalidError


def verify_wallet_signature(wallet_address: str, signature: str, message: str) -> bool:
    """
    Verify a Freighter wallet signature.

    Args:
        wallet_address: The public key (wallet address) that signed
        signature: The base64-encoded signature
        message: The original message that was signed

    Returns:
        True if signature is valid, False otherwise
    """
    try:
        keypair = Keypair.from_public_key(wallet_address)
        # Freighter signs the raw message bytes
        message_bytes = message.encode("utf-8")
        signature_bytes = signature  # Already base64 from Freighter

        # Verify using stellar-sdk
        return keypair.verify(message_bytes, signature_bytes)
    except (Ed25519PublicKeyInvalidError, Ed25519SecretSeedInvalidError, Exception):
        return False


def generate_auth_message(wallet_address: str, nonce: str) -> str:
    """Generate a standard authentication message for wallet signing."""
    return f"Sign in to TradeMentor AI\n\nWallet: {wallet_address}\nNonce: {nonce}\n\nThis request will not trigger a blockchain transaction or cost any gas fees."