import { callAgent, parseAgentResponse } from "@/lib/vanchin";

import type { Agent1Output } from "./types";

export async function executeAgent1(userPrompt: string): Promise<Agent1Output> {
  const prompt = `
You are a world-class software architect. Your task is to expand a simple user prompt into a detailed project specification for a web application. The output must be a JSON object.

User Prompt: ${JSON.stringify(userPrompt)}

Generate a JSON object with the following structure:
{
  "project_type": "<project_type>",
  "features": ["<feature_1>", "<feature_2>", ...],
  "pages": ["<page_1>", "<page_2>", ...],
  "tech_stack": {
    "frontend": "Next.js 14",
    "styling": "Tailwind CSS",
    "database": "Supabase",
    "payment": "<payment_provider_if_needed>"
  },
  "design_style": "<design_style>",
  "expanded_prompt": "<detailed_project_description>"
}

Rules:
- Be specific and detailed
- Include all necessary features for the project type
- List all pages that should be created
- Use modern, production-ready technologies
- The expanded_prompt should be a comprehensive description of the project

Respond with ONLY the JSON object, no additional text.
  `.trim();

  const response = await callAgent("agent1", prompt, {
    temperature: 0.7,
    max_tokens: 2200,
  });

  return parseAgentResponse<Agent1Output>(response);
}
