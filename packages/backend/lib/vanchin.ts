import OpenAI from "openai";
import type { ChatCompletion } from "openai/resources/chat/completions";

const VANCHIN_BASE_URL =
  process.env.VANCHIN_BASE_URL ?? "https://vanchin.streamlake.ai/api/gateway/v1/endpoints";

export const AGENT_ENDPOINTS = {
  agent1: "ep-lpvcnv-1761467347624133479",
  agent2: "ep-j9pysc-1761467653839114083",
  agent3: "ep-2uyob4-1761467835762653881",
  agent4: "ep-nqjal5-1762460264139958733",
  agent5: "ep-mhsvw6-1762460362477023705",
  agent6: "ep-h614n9-1762460436283699679",
  agent7: "ep-ohxawl-1762460514611065743",
} as const;

type AgentIdentifier = keyof typeof AGENT_ENDPOINTS;

export class MissingVanchinConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MissingVanchinConfigurationError";
  }
}

export async function getAgentApiKey(agentId: AgentIdentifier): Promise<string> {
  const envKey = process.env[`VANCHIN_AGENT_${agentId.toUpperCase()}_KEY`];
  if (!envKey) {
    throw new MissingVanchinConfigurationError(
      `VanchinAI API key missing for ${agentId}. Please set VANCHIN_AGENT_${agentId.toUpperCase()}_KEY.`,
    );
  }
  return envKey;
}

export function createVanchinClient(apiKey: string) {
  if (!apiKey) {
    throw new MissingVanchinConfigurationError("Attempted to create Vanchin client without API key");
  }

  const client = new OpenAI({
    apiKey,
    baseURL: VANCHIN_BASE_URL,
  });

  return client;
}

interface CallAgentOptions {
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export async function callAgent(
  agentId: AgentIdentifier,
  prompt: string,
  options: CallAgentOptions = {},
): Promise<string> {
  if (options.stream) {
    throw new Error("Streaming mode is not supported for callAgent");
  }

  const apiKey = await getAgentApiKey(agentId);
  const client = createVanchinClient(apiKey);
  const model = AGENT_ENDPOINTS[agentId];

  const completion = await client.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content:
          "You are a world-class software developer working within the Mr.Promth agent chain. Follow instructions precisely and return structured results.",
      },
      { role: "user", content: prompt },
    ],
    temperature: options.temperature ?? 0.7,
    max_tokens: options.max_tokens ?? 2000,
    stream: options.stream ?? false,
  });

  if (!("choices" in completion)) {
    throw new Error("Streaming responses are not supported in callAgent");
  }

  const chatCompletion = completion as ChatCompletion;
  const content = chatCompletion.choices[0]?.message?.content ?? "";
  return content.trim();
}

const JSON_FENCE_REGEX = /```json\s*([\s\S]+?)```/i;

export function parseAgentResponse<T>(response: string): T {
  const trimmed = response.trim();
  if (!trimmed) {
    throw new Error("Agent returned an empty response");
  }

  const fencedMatch = trimmed.match(JSON_FENCE_REGEX);
  const jsonCandidate = fencedMatch ? fencedMatch[1] : trimmed;

  try {
    return JSON.parse(jsonCandidate) as T;
  } catch (error) {
    throw new Error(`Failed to parse agent response as JSON: ${(error as Error).message}`);
  }
}
