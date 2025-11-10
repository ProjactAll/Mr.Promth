from __future__ import annotations

import hashlib
from base64 import b64decode

from cryptography.hazmat.primitives.ciphers.aead import AESGCM


class EncryptionError(Exception):
    """Raised when encrypted payloads cannot be decrypted."""


def _derive_key(secret: str) -> bytes:
    secret_bytes = secret.encode("utf-8")
    if len(secret_bytes) == 32:
        return secret_bytes
    return hashlib.sha256(secret_bytes).digest()


def decrypt_secret(payload: str, secret: str) -> str:
    """Decrypt AES-256-GCM payload created by the Next.js app."""

    if not secret:
        raise EncryptionError("Encryption key is not configured")

    try:
        buffer = b64decode(payload)
    except Exception as exc:  # pragma: no cover - defensive branch
        raise EncryptionError("Invalid encrypted payload") from exc

    iv = buffer[:12]
    auth_tag = buffer[12:28]
    ciphertext = buffer[28:]

    try:
        aesgcm = AESGCM(_derive_key(secret))
        decrypted = aesgcm.decrypt(iv, ciphertext + auth_tag, None)
        return decrypted.decode("utf-8")
    except Exception as exc:  # pragma: no cover - defensive branch
        raise EncryptionError("Failed to decrypt payload") from exc
