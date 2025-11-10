/**
 * Chat Context Manager
 * Manages conversation context including active projects
 */

import { createClient } from '@supabase/supabase-js';

export interface ChatContext {
  userId: string;
  sessionId: string;
  activeProjectId?: string;
  activeProjectName?: string;
  conversationHistory: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
  }>;
}

/**
 * Get chat context for a session
 */
export async function getChatContext(
  userId: string,
  sessionId: string
): Promise<ChatContext> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Get user's most recent project
  const { data: workflows } = await supabase
    .from('workflows')
    .select('id, project_name, status')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(1);

  const activeProject = workflows?.[0];

  // Get conversation history (last 10 messages)
  const { data: messages } = await supabase
    .from('chat_messages')
    .select('role, content, created_at')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(10);

  return {
    userId,
    sessionId,
    activeProjectId: activeProject?.id,
    activeProjectName: activeProject?.project_name,
    conversationHistory: (messages || [])
      .reverse()
      .map((m) => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content,
        timestamp: m.created_at,
      })),
  };
}

/**
 * Set active project for a chat session
 */
export async function setActiveProject(
  sessionId: string,
  projectId: string
): Promise<void> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  await supabase
    .from('chat_sessions')
    .update({
      active_project_id: projectId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', sessionId);
}

/**
 * Build context-aware system prompt
 */
export function buildContextPrompt(context: ChatContext): string {
  let prompt = 'You are Mr.Prompt, an AI assistant that helps users build web applications.';

  if (context.activeProjectId && context.activeProjectName) {
    prompt += `\n\nThe user is currently working on a project called "${context.activeProjectName}" (ID: ${context.activeProjectId}).`;
    prompt += '\nYou can help them modify this project, add features, or answer questions about it.';
  }

  if (context.conversationHistory.length > 0) {
    prompt += '\n\nRecent conversation:';
    context.conversationHistory.slice(-5).forEach((msg) => {
      prompt += `\n- ${msg.role}: ${msg.content.substring(0, 100)}...`;
    });
  }

  return prompt;
}
