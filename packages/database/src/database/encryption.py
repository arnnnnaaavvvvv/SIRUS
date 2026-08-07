import os
import base64
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

# Master Key derived or loaded from environment
MASTER_SECRET = os.getenv("MASTER_ENCRYPTION_KEY", "default-dev-secret-key-32bytes-long!!")
SALT = b"trading_platform_salt_v1"


def get_fernet_instance() -> Fernet:
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=SALT,
        iterations=100_000,
    )
    key = base64.urlsafe_b64encode(kdf.derive(MASTER_SECRET.encode()))
    return Fernet(key)


def encrypt_secret(plaintext: str) -> str:
    """Encrypts sensitive exchange API keys/secrets with AES-256 (Fernet)."""
    if not plaintext:
        return ""
    fernet = get_fernet_instance()
    return fernet.encrypt(plaintext.encode()).decode()


def decrypt_secret(ciphertext: str) -> str:
    """Decrypts sensitive exchange API keys/secrets."""
    if not ciphertext:
        return ""
    fernet = get_fernet_instance()
    return fernet.decrypt(ciphertext.encode()).decode()
