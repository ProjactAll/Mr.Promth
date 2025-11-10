import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

/**
 * Create Supabase client with anon key (for client-side operations)
 */
export function createClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and Anon Key must be configured')
  }
  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}

/**
 * Create Supabase client with service role key (for server-side operations)
 * This bypasses RLS policies - use with caution!
 */
export function createServiceClient() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Supabase URL and Service Role Key must be configured')
  }
  return createSupabaseClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Legacy export for backward compatibility
export const supabase = createClient()
export const createServiceRoleSupabaseClient = createServiceClient

// ============================================================================
// Extension API Keys
// ============================================================================

export async function getApiKeyByKey(key: string) {
  const supabase = createServiceClient()
  
  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .eq('key', key)
    .eq('name', 'Extension')
    .single()

  if (error) throw error
  return data
}

export async function createExtensionApiKey(userId: string, key: string) {
  const supabase = createServiceClient()
  
  const { data, error } = await supabase
    .from('api_keys')
    .insert({
      user_id: userId,
      name: 'Extension',
      key: key,
      last_used_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateApiKeyLastUsed(key: string) {
  const supabase = createServiceClient()
  
  const { error } = await supabase
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('key', key)

  if (error) throw error
}

export async function getExtensionApiKey(userId: string) {
  const supabase = createServiceClient()
  
  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .eq('user_id', userId)
    .eq('name', 'Extension')
    .single()

  if (error && error.code !== 'PGRST116') throw error // PGRST116 = not found
  return data
}

// ============================================================================
// Extension Sessions
// ============================================================================

export async function createExtensionSession(userId: string, metadata?: any) {
  const supabase = createServiceClient()
  
  const { data, error } = await supabase
    .from('extension_sessions')
    .insert({
      user_id: userId,
      metadata: metadata || {},
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getExtensionSession(sessionId: string) {
  const supabase = createServiceClient()
  
  const { data, error } = await supabase
    .from('extension_sessions')
    .select('*')
    .eq('id', sessionId)
    .single()

  if (error) throw error
  return data
}

// ============================================================================
// Screenshots
// ============================================================================

export async function createScreenshot(
  userId: string,
  sessionId: string,
  url: string,
  storagePath: string,
  metadata?: any
) {
  const supabase = createServiceClient()
  
  const { data, error } = await supabase
    .from('screenshots')
    .insert({
      user_id: userId,
      session_id: sessionId,
      url: url,
      storage_path: storagePath,
      width: metadata?.width,
      height: metadata?.height,
      metadata: metadata || {},
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getScreenshot(screenshotId: string) {
  const supabase = createServiceClient()
  
  const { data, error } = await supabase
    .from('screenshots')
    .select('*')
    .eq('id', screenshotId)
    .single()

  if (error) throw error
  return data
}

export async function getUserScreenshots(userId: string, limit = 10) {
  const supabase = createServiceClient()
  
  const { data, error } = await supabase
    .from('screenshots')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

export async function getSessionScreenshots(sessionId: string) {
  const supabase = createServiceClient()
  
  const { data, error } = await supabase
    .from('screenshots')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// ============================================================================
// DOM Snapshots
// ============================================================================

export async function createDomSnapshot(
  screenshotId: string,
  domStructure: any,
  clickableElements: any[],
  formFields: any[]
) {
  const supabase = createServiceClient()
  
  const { data, error } = await supabase
    .from('dom_snapshots')
    .insert({
      screenshot_id: screenshotId,
      dom_structure: domStructure,
      clickable_elements: clickableElements,
      form_fields: formFields,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getDomSnapshot(screenshotId: string) {
  const supabase = createServiceClient()
  
  const { data, error } = await supabase
    .from('dom_snapshots')
    .select('*')
    .eq('screenshot_id', screenshotId)
    .single()

  if (error) throw error
  return data
}

// ============================================================================
// Analysis Results
// ============================================================================

export async function createAnalysisResult(
  screenshotId: string,
  analysisType: string,
  results: any,
  suggestions: any[],
  confidenceScore: number,
  processingTime: number
) {
  const supabase = createServiceClient()
  
  const { data, error } = await supabase
    .from('analysis_results')
    .insert({
      screenshot_id: screenshotId,
      analysis_type: analysisType,
      results: results,
      suggestions: suggestions,
      confidence_score: confidenceScore,
      processing_time: processingTime,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getAnalysisResults(screenshotId: string) {
  const supabase = createServiceClient()
  
  const { data, error } = await supabase
    .from('analysis_results')
    .select('*')
    .eq('screenshot_id', screenshotId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getAnalysisResult(analysisId: string) {
  const supabase = createServiceClient()
  
  const { data, error } = await supabase
    .from('analysis_results')
    .select('*')
    .eq('id', analysisId)
    .single()

  if (error) throw error
  return data
}

// ============================================================================
// Extension Logs
// ============================================================================

export async function createExtensionLog(
  userId: string,
  level: 'info' | 'warning' | 'error',
  message: string,
  metadata?: any
) {
  const supabase = createServiceClient()
  
  const { data, error } = await supabase
    .from('extension_logs')
    .insert({
      user_id: userId,
      level: level,
      message: message,
      metadata: metadata || {},
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================================================
// User Profiles
// ============================================================================

export async function getUserProfile(userId: string) {
  const supabase = createServiceClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}

export async function updateUserProfile(
  userId: string,
  updates: {
    display_name?: string
    avatar_url?: string
    preferences?: any
  }
) {
  const supabase = createServiceClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================================================
// Chat Sessions (for backward compatibility with old API routes)
// ============================================================================

export async function getChatSessions(userId: string) {
  const supabase = createServiceClient()
  
  const { data, error } = await supabase
    .from('extension_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createChatSession(userId: string, title: string, metadata?: any) {
  const supabase = createServiceClient()
  
  const { data, error } = await supabase
    .from('extension_sessions')
    .insert({
      user_id: userId,
      browser_info: metadata || {},
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getMessages(sessionId: string) {
  const supabase = createServiceClient()
  
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
  
  if (error) throw error
  return data || []
}

export async function saveMessage(
  sessionId: string,
  sender: 'user' | 'assistant' | 'system',
  content: string,
  metadata?: any
) {
  const supabase = createServiceClient()
  
  const { data, error } = await supabase
    .from('messages')
    .insert({
      session_id: sessionId,
      role: sender,
      content: content,
      metadata: metadata || {}
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function createChatSession(userId: string, title?: string) {
  const supabase = createServiceClient()
  
  const { data, error } = await supabase
    .from('chat_sessions')
    .insert({
      user_id: userId,
      title: title || 'New Chat'
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getChatSessions(userId: string) {
  const supabase = createServiceClient()
  
  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function updateChatSession(sessionId: string, updates: { title?: string }) {
  const supabase = createServiceClient()
  
  const { data, error } = await supabase
    .from('chat_sessions')
    .update(updates)
    .eq('id', sessionId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteChatSession(sessionId: string) {
  const supabase = createServiceClient()
  
  const { error } = await supabase
    .from('chat_sessions')
    .delete()
    .eq('id', sessionId)
  
  if (error) throw error
  return true
}

// Legacy function - keep for backward compatibility
export async function saveLegacyMessage(
  sessionId: string,
  sender: 'user' | 'assistant' | 'system',
  content: string
) {
  const supabase = createServiceClient()
  
  const { data: session } = await supabase
    .from('extension_sessions')
    .select('user_id')
    .eq('id', sessionId)
    .single()
  
  if (session) {
    await createExtensionLog(
      session.user_id,
      'info',
      `${sender}: ${content}`,
      { session_id: sessionId, sender }
    )
  }
  
  return { id: Date.now().toString(), session_id: sessionId, sender, content }
}
