import { callAgent, parseAgentResponse } from "@/lib/vanchin";
import type { Agent1Output, Agent2Output } from "./types";
import { architectureCache } from '../cache/architecture-cache'
import { retryWithCheck } from '../utils/retry'
import { createLogger } from '../utils/logger'

const logger = createLogger({ component: 'Agent2' })

export async function executeAgent2(agent1Output: Agent1Output): Promise<Agent2Output> {
  // Try to get from cache first
  const cacheKey = agent1Output.features || []
  const cached = architectureCache.get(cacheKey)
  
  if (cached) {
    logger.info('Using cached architecture', { features: cacheKey.length })
    return cached
  }
  
  logger.info('Generating new architecture', { features: cacheKey.length })
  
  const prompt = `
You are a senior software engineer. Based on the following project specification, design the system architecture. The output must be a JSON object.

Project Specification:
${JSON.stringify(agent1Output, null, 2)}

Generate a JSON object with the following structure:
{
  "database_schema": {
    "tables": [
      {
        "name": "<table_name>",
        "columns": ["<column_1>", "<column_2>", ...]
      }
    ]
  },
  "folder_structure": {
    "app": ["<folder_1>", "<folder_2>", ...],
    "components": ["<component_1>", "<component_2>", ...],
    "lib": ["<lib_1>", "<lib_2>", ...]
  },
  "api_endpoints": ["<endpoint_1>", "<endpoint_2>", ...],
  "dependencies": {
    "<dependency_1>": "<version>",
    "<dependency_2>": "<version>",
    ...
  }
}

Rules:
- Design a scalable and maintainable architecture
- Include all necessary database tables with proper columns
- Organize folders logically
- Define clear API endpoints
- Use latest stable versions of dependencies

Respond with ONLY the JSON object, no additional text.
  `.trim();

  // Use retry mechanism for API calls
  const result = await retryWithCheck(async () => {
    const response = await callAgent("agent2", prompt, {
      temperature: 0.6,
      max_tokens: 2600,
    });
    return parseAgentResponse<Agent2Output>(response);
  }, {
    maxAttempts: 3,
    initialDelay: 1000
  });
  
  // Cache the result
  architectureCache.set(cacheKey, result)
  logger.info('Cached new architecture')
  
  return result;
}
