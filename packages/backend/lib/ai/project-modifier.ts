/**
 * Project Modifier
 * Handles iterative modifications to existing projects
 */

import { vanchinChatCompletion } from './vanchin-client';

export interface ModificationRequest {
  projectId: string;
  userId: string;
  instruction: string;
  currentFiles: Array<{
    path: string;
    content: string;
  }>;
}

export interface ModificationResult {
  success: boolean;
  modifications: Array<{
    path: string;
    action: 'create' | 'update' | 'delete';
    content?: string;
    reason: string;
  }>;
  summary: string;
}

/**
 * Analyze modification request and generate changes
 */
export async function analyzeModification(
  request: ModificationRequest
): Promise<ModificationResult> {
  const { instruction, currentFiles } = request;

  // Build context about current project
  const projectContext = currentFiles
    .map((f) => `File: ${f.path}\n\`\`\`\n${f.content.substring(0, 500)}...\n\`\`\``)
    .join('\n\n');

  const prompt = `You are a code modification assistant. Analyze the following modification request and generate precise changes.

**Current Project Files:**
${projectContext}

**Modification Request:**
${instruction}

**Instructions:**
1. Analyze what needs to be changed
2. Identify which files need to be created, updated, or deleted
3. Generate the exact code changes needed
4. Provide a clear explanation for each change

**Response Format (JSON):**
{
  "modifications": [
    {
      "path": "path/to/file.ts",
      "action": "create" | "update" | "delete",
      "content": "full file content (if create/update)",
      "reason": "explanation of why this change is needed"
    }
  ],
  "summary": "overall summary of changes"
}

Respond ONLY with valid JSON, no additional text.`;

  try {
    const response = await vanchinChatCompletion([
      { role: 'system', content: 'You are a precise code modification assistant. Always respond with valid JSON.' },
      { role: 'user', content: prompt },
    ]);

    // Parse AI response
    let content = '';
    
    if ('choices' in response && response.choices && response.choices[0]) {
      content = response.choices[0].message?.content || '';
    } else if ('content' in response) {
      content = (response as any).content || '';
    }
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('Invalid AI response format');
    }

    const result = JSON.parse(jsonMatch[0]);

    return {
      success: true,
      modifications: result.modifications || [],
      summary: result.summary || 'Modifications generated',
    };
  } catch (error) {
    console.error('Error analyzing modification:', error);
    return {
      success: false,
      modifications: [],
      summary: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Apply modifications to project files
 */
export async function applyModifications(
  projectId: string,
  modifications: ModificationResult['modifications']
): Promise<{ success: boolean; message: string; filesModified: number }> {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    let filesModified = 0;

    for (const mod of modifications) {
      if (mod.action === 'create' || mod.action === 'update') {
        // Save/update file in database
        const { error } = await supabase
          .from('project_files')
          .upsert({
            workflow_id: projectId,
            file_path: mod.path,
            content: mod.content || '',
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'workflow_id,file_path'
          });

        if (error) {
          console.error(`Error saving file ${mod.path}:`, error);
          continue;
        }

        filesModified++;
      } else if (mod.action === 'delete') {
        // Delete file from database
        const { error } = await supabase
          .from('project_files')
          .delete()
          .eq('workflow_id', projectId)
          .eq('file_path', mod.path);

        if (error) {
          console.error(`Error deleting file ${mod.path}:`, error);
          continue;
        }

        filesModified++;
      }
    }

    // Update workflow timestamp
    await supabase
      .from('workflows')
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId);

    return {
      success: true,
      message: `Successfully modified ${filesModified} files`,
      filesModified,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to apply modifications: ${error instanceof Error ? error.message : 'Unknown error'}`,
      filesModified: 0,
    };
  }
}
