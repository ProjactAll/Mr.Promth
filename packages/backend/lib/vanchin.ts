import OpenAI from "openai";
import type { ChatCompletion } from "openai/resources/chat/completions";
// Load balancer removed - using single API key for all endpoints

const VANCHIN_BASE_URL =
  process.env.VANCHIN_BASE_URL ?? "https://vanchin.streamlake.ai/api/gateway/v1/endpoints";

// Agent to API Key/Endpoint mapping
// Agent 1-7 use pairs 1-7
export const AGENT_TO_KEY_MAP = {
  agent1: 1,
  agent2: 2,
  agent3: 3,
  agent4: 4,
  agent5: 5,
  agent6: 6,
  agent7: 7,
} as const;

export const AGENT_ENDPOINTS = {
  agent1: process.env.VANCHIN_ENDPOINT_1 ?? "ep-lpvcnv-1761467347624133479",
  agent2: process.env.VANCHIN_ENDPOINT_2 ?? "ep-j9pysc-1761467653839114083",
  agent3: process.env.VANCHIN_ENDPOINT_3 ?? "ep-2uyob4-1761467835762653881",
  agent4: process.env.VANCHIN_ENDPOINT_4 ?? "ep-nqjal5-1762460264139958733",
  agent5: process.env.VANCHIN_ENDPOINT_5 ?? "ep-mhsvw6-1762460362477023705",
  agent6: process.env.VANCHIN_ENDPOINT_6 ?? "ep-h614n9-1762460436283699679",
  agent7: process.env.VANCHIN_ENDPOINT_7 ?? "ep-ohxawl-1762460514611065743",
} as const;

type AgentIdentifier = keyof typeof AGENT_ENDPOINTS;

export class MissingVanchinConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MissingVanchinConfigurationError";
  }
}

export async function getAgentApiKey(agentId: AgentIdentifier): Promise<{ apiKey: string; endpoint: string }> {
  const apiKey = process.env.VC_API_KEY || process.env.VANCHIN_API_KEY;
  const endpoint = AGENT_ENDPOINTS[agentId];
  
  if (!apiKey) {
    throw new MissingVanchinConfigurationError(
      `VC_API_KEY environment variable is not set. Please set it to your Vanchin AI API key.`,
    );
  }
  
  if (!endpoint) {
    throw new MissingVanchinConfigurationError(
      `No endpoint found for ${agentId}`,
    );
  }
  
  return {
    apiKey,
    endpoint
  };
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

  const { apiKey, endpoint } = await getAgentApiKey(agentId);
  const client = createVanchinClient(apiKey);

  try {
    const completion = await client.chat.completions.create({
      model: endpoint,
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
  } catch (error) {
    console.error(`Error calling ${agentId}:`, error);
    throw error;
  }
}

const JSON_FENCE_REGEX = /```json\s*([\s\S]+?)```/i;

export function parseAgentResponse<T>(response: string): T {
  const trimmed = response.trim();
  if (!trimmed) {
    throw new Error("Agent returned an empty response");
  }

  const fencedMatch = trimmed.match(JSON_FENCE_REGEX);
  let jsonCandidate = fencedMatch ? fencedMatch[1] : trimmed;
  
  // Sanitize JSON: remove control characters
  jsonCandidate = jsonCandidate.replace(/[\x00-\x1F\x7F]/g, '');

  try {
    return JSON.parse(jsonCandidate) as T;
  } catch (error) {
    // Log the problematic JSON for debugging
    console.error('Failed to parse JSON:', jsonCandidate.substring(0, 500));
    throw new Error(`Failed to parse agent response as JSON: ${(error as Error).message}`);
  }
}
