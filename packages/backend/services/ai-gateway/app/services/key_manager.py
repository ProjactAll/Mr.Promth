from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Iterable, List, Optional

import httpx

from ..core.config import Settings
from .crypto import decrypt_secret


class KeyRetrievalError(Exception):
    """Raised when API keys cannot be retrieved."""


class NoAvailableKeysError(Exception):
    """Raised when no API keys are available for the requested provider."""


class ProviderAuthenticationError(Exception):
    """Raised when upstream provider rejects a key with authentication error."""


@dataclass(slots=True)
class ApiKeyRecord:
    id: str
    provider: str
    encrypted_key: str
    last_used: Optional[datetime]
    created_at: datetime


def _parse_datetime(value: Optional[str]) -> Optional[datetime]:
    if not value:
        return None
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None


class SupabaseKeyManager:
    def __init__(self, settings: Settings) -> None:
        if not settings.supabase_url or not settings.supabase_service_role_key:
            raise KeyRetrievalError("Supabase credentials are not configured")

        self._settings = settings
        self._rest_endpoint = settings.supabase_url.rstrip("/") + "/rest/v1/api_keys"
        self._headers = {
            "apikey": settings.supabase_service_role_key,
            "Authorization": f"Bearer {settings.supabase_service_role_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

    async def _fetch_api_keys(self, user_id: str, provider: Optional[str]) -> List[ApiKeyRecord]:
        params: list[tuple[str, str]] = [
            ("select", "id,provider,encrypted_key,last_used,created_at"),
            ("user_id", f"eq.{user_id}"),
            ("order", "last_used.nullsfirst"),
            ("order", "created_at.asc"),
        ]

        if provider and provider != "custom":
            params.append(("provider", f"eq.{provider}"))

        timeout = httpx.Timeout(10.0, connect=5.0, read=10.0)
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.get(self._rest_endpoint, headers=self._headers, params=params)

        if response.status_code >= 400:
            raise KeyRetrievalError(
                f"Failed to fetch API keys (status {response.status_code}): {response.text}"
            )

        payload: Iterable[dict[str, str]] = response.json()
        return [
            ApiKeyRecord(
                id=item["id"],
                provider=item["provider"],
                encrypted_key=item["encrypted_key"],
                last_used=_parse_datetime(item.get("last_used")),
                created_at=_parse_datetime(item.get("created_at")) or datetime.now(timezone.utc),
            )
            for item in payload
        ]

    async def _touch_key(self, key_id: str) -> None:
        now = datetime.now(timezone.utc).isoformat()
        timeout = httpx.Timeout(10.0, connect=5.0, read=10.0)
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.patch(
                self._rest_endpoint,
                headers={**self._headers, "Prefer": "return=minimal"},
                params={"id": f"eq.{key_id}"},
                json={"last_used": now},
            )

        if response.status_code >= 400:
            raise KeyRetrievalError(
                f"Failed to update key usage (status {response.status_code}): {response.text}"
            )

    async def iter_plaintext_keys(
        self,
        user_id: str,
        provider: Optional[str],
    ) -> List[tuple[str, ApiKeyRecord]]:
        records = await self._fetch_api_keys(user_id, provider)

        if not records:
            raise NoAvailableKeysError("No API keys registered for this provider")

        sorted_records = sorted(records, key=lambda item: item.last_used or datetime.fromtimestamp(0, timezone.utc))

        plaintext_keys: List[tuple[str, ApiKeyRecord]] = []
        for record in sorted_records:
            try:
                plaintext = decrypt_secret(record.encrypted_key, self._settings.encryption_key or "")
                plaintext_keys.append((plaintext, record))
            except Exception:
                # Skip keys that cannot be decrypted; they will be ignored.
                continue

        if not plaintext_keys:
            raise NoAvailableKeysError("Unable to decrypt any API keys for this provider")

        return plaintext_keys

    async def mark_key_used(self, record: ApiKeyRecord) -> None:
        await self._touch_key(record.id)
