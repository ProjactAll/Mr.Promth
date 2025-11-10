from __future__ import annotations

from typing import Any, AsyncIterator

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import JSONResponse, StreamingResponse

from ..core.config import Settings, get_settings
from ..models.chat import ChatRequest
from ..services.key_manager import (
    KeyRetrievalError,
    NoAvailableKeysError,
    ProviderAuthenticationError,
    SupabaseKeyManager,
)


router = APIRouter(prefix="/api/v1", tags=["chat"])


def ensure_authorized(request: Request, settings: Settings) -> None:
    if not settings.gateway_api_key:
        return

    provided = request.headers.get("X-API-Key") or request.headers.get("x-api-key")
    if provided != settings.gateway_api_key:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid gateway API key")


@router.post("/chat/completions")
async def create_chat_completion(
    chat_request: ChatRequest,
    request: Request,
    settings: Settings = Depends(get_settings),
) -> Any:
    ensure_authorized(request, settings)
    user_id = request.headers.get("X-User-Id") or request.headers.get("x-user-id")

    if not user_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing X-User-Id header")

    provider = _normalize_provider(chat_request.provider)

    if provider not in {"openai", "anthropic", "vanchin"}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Provider '{provider}' is not supported by the gateway",
        )

    try:
        key_manager = SupabaseKeyManager(settings)
        candidate_keys = await key_manager.iter_plaintext_keys(user_id, provider)
    except NoAvailableKeysError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except KeyRetrievalError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc

    auth_errors: list[str] = []
    for api_key, record in candidate_keys:
        try:
            await key_manager.mark_key_used(record)
        except KeyRetrievalError as exc:
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc

        try:
            if chat_request.stream:
                stream = _select_stream_callable(provider, api_key, chat_request, settings)
                return StreamingResponse(
                    stream,
                    media_type="text/event-stream",
                    headers={
                        "Cache-Control": "no-cache",
                        "Connection": "keep-alive",
                    },
                )

            payload = await _select_completion_callable(provider, api_key, chat_request, settings)
            return JSONResponse(payload)
        except ProviderAuthenticationError as exc:
            auth_errors.append(str(exc))
            continue

    detail = "All API keys were rejected by the upstream provider"
    if auth_errors:
        detail = f"{detail}: {auth_errors[-1]}"
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)


def _normalize_provider(value: str) -> str:
    mapped = value.lower()
    if mapped in {"claude", "anthropic"}:
        return "anthropic"
    if mapped in {"azure", "azure-openai"}:
        return "azure-openai"
    if mapped in {"vanchin", "streamlake", "vanchinai"}:
        return "vanchin"
    return "openai" if mapped == "custom" else mapped


async def _select_completion_callable(
    provider: str,
    api_key: str,
    chat_request: ChatRequest,
    settings: Settings,
) -> dict[str, Any]:
    if provider == "anthropic":
        return await _anthropic_completion(api_key, chat_request, settings)
    if provider == "vanchin":
        return await _vanchin_completion(api_key, chat_request, settings)
    return await _openai_completion(api_key, chat_request, settings)


def _select_stream_callable(
    provider: str,
    api_key: str,
    chat_request: ChatRequest,
    settings: Settings,
) -> AsyncIterator[bytes]:
    if provider == "anthropic":
        return _anthropic_stream(api_key, chat_request, settings)
    if provider == "vanchin":
        return _vanchin_stream(api_key, chat_request, settings)
    return _openai_stream(api_key, chat_request, settings)


def _build_openai_payload(chat_request: ChatRequest) -> dict[str, Any]:
    payload: dict[str, Any] = {
        "model": chat_request.model or "gpt-4o-mini",
        "messages": [message.model_dump(exclude_none=True) for message in chat_request.messages],
        "temperature": chat_request.temperature,
        "stream": chat_request.stream,
    }

    if chat_request.max_tokens is not None:
        payload["max_tokens"] = chat_request.max_tokens
    if chat_request.top_p is not None:
        payload["top_p"] = chat_request.top_p
    if chat_request.frequency_penalty is not None:
        payload["frequency_penalty"] = chat_request.frequency_penalty
    if chat_request.presence_penalty is not None:
        payload["presence_penalty"] = chat_request.presence_penalty

    return payload


async def _openai_completion(api_key: str, chat_request: ChatRequest, settings: Settings) -> dict[str, Any]:
    url = settings.openai_api_base.rstrip("/") + "/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    timeout = httpx.Timeout(30.0, connect=10.0, read=60.0)
    async with httpx.AsyncClient(timeout=timeout) as client:
        response = await client.post(url, headers=headers, json=_build_openai_payload(chat_request))

    if response.status_code in {401, 403}:
        raise ProviderAuthenticationError(response.text or "Unauthorized")
    if response.status_code >= 400:
        raise HTTPException(status_code=response.status_code, detail=response.text or "Upstream OpenAI error")

    return response.json()


async def _openai_stream(
    api_key: str,
    chat_request: ChatRequest,
    settings: Settings,
) -> AsyncIterator[bytes]:
    url = settings.openai_api_base.rstrip("/") + "/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    timeout = httpx.Timeout(60.0, connect=10.0, read=None)
    async with httpx.AsyncClient(timeout=timeout) as client:
        async with client.stream("POST", url, headers=headers, json=_build_openai_payload(chat_request)) as response:
            if response.status_code in {401, 403}:
                body = await response.aread()
                raise ProviderAuthenticationError(body.decode("utf-8", errors="ignore") or "Unauthorized")
            if response.status_code >= 400:
                body = await response.aread()
                raise HTTPException(
                    status_code=response.status_code,
                    detail=body.decode("utf-8", errors="ignore") or "Upstream OpenAI error",
                )

            async for chunk in response.aiter_bytes():
                yield chunk


def _build_anthropic_payload(chat_request: ChatRequest) -> dict[str, Any]:
    system_messages = [message.content for message in chat_request.messages if message.role == "system"]

    formatted_messages: list[dict[str, str]] = []
    for message in chat_request.messages:
        if message.role not in {"user", "assistant"}:
            continue
        formatted_messages.append({
            "role": "user" if message.role == "user" else "assistant",
            "content": message.content,
        })

    payload: dict[str, Any] = {
        "model": chat_request.model or "claude-3-haiku-20240307",
        "messages": formatted_messages,
        "max_tokens": chat_request.max_tokens or 1024,
        "stream": chat_request.stream,
        "temperature": chat_request.temperature,
    }

    if system_messages:
        payload["system"] = "\n\n".join(system_messages)
    if chat_request.top_p is not None:
        payload["top_p"] = chat_request.top_p

    return payload


async def _anthropic_completion(api_key: str, chat_request: ChatRequest, settings: Settings) -> dict[str, Any]:
    url = settings.anthropic_api_base.rstrip("/") + "/v1/messages"
    headers = {
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
    }

    timeout = httpx.Timeout(30.0, connect=10.0, read=60.0)
    async with httpx.AsyncClient(timeout=timeout) as client:
        response = await client.post(url, headers=headers, json=_build_anthropic_payload(chat_request))

    if response.status_code in {401, 403}:
        raise ProviderAuthenticationError(response.text or "Unauthorized")
    if response.status_code >= 400:
        raise HTTPException(status_code=response.status_code, detail=response.text or "Upstream Anthropic error")

    return response.json()


async def _anthropic_stream(
    api_key: str,
    chat_request: ChatRequest,
    settings: Settings,
) -> AsyncIterator[bytes]:
    url = settings.anthropic_api_base.rstrip("/") + "/v1/messages"
    headers = {
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
    }

    timeout = httpx.Timeout(60.0, connect=10.0, read=None)
    async with httpx.AsyncClient(timeout=timeout) as client:
        async with client.stream("POST", url, headers=headers, json=_build_anthropic_payload(chat_request)) as response:
            if response.status_code in {401, 403}:
                body = await response.aread()
                raise ProviderAuthenticationError(body.decode("utf-8", errors="ignore") or "Unauthorized")
            if response.status_code >= 400:
                body = await response.aread()
                raise HTTPException(
                    status_code=response.status_code,
                    detail=body.decode("utf-8", errors="ignore") or "Upstream Anthropic error",
                )

            async for chunk in response.aiter_bytes():
                yield chunk


# VanchinAI functions (OpenAI-compatible API)
async def _vanchin_completion(api_key: str, chat_request: ChatRequest, settings: Settings) -> dict[str, Any]:
    """VanchinAI completion using OpenAI SDK format."""
    url = settings.vanchin_api_base.rstrip("/") + "/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    timeout = httpx.Timeout(30.0, connect=10.0, read=60.0)
    async with httpx.AsyncClient(timeout=timeout) as client:
        response = await client.post(url, headers=headers, json=_build_openai_payload(chat_request))

    if response.status_code in {401, 403}:
        raise ProviderAuthenticationError(response.text or "Unauthorized")
    if response.status_code >= 400:
        raise HTTPException(status_code=response.status_code, detail=response.text or "Upstream VanchinAI error")

    return response.json()


async def _vanchin_stream(
    api_key: str,
    chat_request: ChatRequest,
    settings: Settings,
) -> AsyncIterator[bytes]:
    """VanchinAI streaming using OpenAI SDK format."""
    url = settings.vanchin_api_base.rstrip("/") + "/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    timeout = httpx.Timeout(60.0, connect=10.0, read=None)
    async with httpx.AsyncClient(timeout=timeout) as client:
        async with client.stream("POST", url, headers=headers, json=_build_openai_payload(chat_request)) as response:
            if response.status_code in {401, 403}:
                body = await response.aread()
                raise ProviderAuthenticationError(body.decode("utf-8", errors="ignore") or "Unauthorized")
            if response.status_code >= 400:
                body = await response.aread()
                raise HTTPException(
                    status_code=response.status_code,
                    detail=body.decode("utf-8", errors="ignore") or "Upstream VanchinAI error",
                )

            async for chunk in response.aiter_bytes():
                yield chunk
