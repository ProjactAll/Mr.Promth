from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field


ChatRole = Literal["system", "user", "assistant", "tool"]


class ChatMessage(BaseModel):
    role: ChatRole
    content: str = Field(..., min_length=1)
    name: Optional[str] = None
    tool_call_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    provider: Literal["openai", "anthropic", "azure-openai", "custom"] = "openai"
    model: Optional[str] = None
    session_id: Optional[str] = None
    prompt_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    temperature: float = Field(default=0.7, ge=0.0, le=2.0)
    max_tokens: Optional[int] = Field(default=None, ge=1)
    top_p: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    frequency_penalty: Optional[float] = Field(default=None, ge=-2.0, le=2.0)
    presence_penalty: Optional[float] = Field(default=None, ge=-2.0, le=2.0)
    stream: bool = True


class ChatChunk(BaseModel):
    type: Literal["chunk", "error", "done"]
    content: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


class ChatResponse(BaseModel):
    content: str
    provider: str
    model: Optional[str] = None
