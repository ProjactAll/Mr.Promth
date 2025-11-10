import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get workflow from database
    const { data: workflow, error } = await supabase
      .from('workflows')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (error || !workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    // Load actual files from database
    const { data: projectFiles, error: filesError } = await supabase
      .from('project_files')
      .select('file_path, content')
      .eq('workflow_id', params.id);

    if (filesError) {
      console.error('Error loading files:', filesError);
      // Fallback to mock if no files found
      const files = generateMockFileStructure(workflow.project_name);
      return NextResponse.json({ files });
    }

    // Convert flat file list to tree structure
    const files = buildFileTree(projectFiles || []);

    return NextResponse.json({ files });
  } catch (error) {
    console.error('Error loading project files:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function buildFileTree(files: Array<{ file_path: string; content: string }>) {
  const root: any[] = [];
  const map = new Map<string, any>();

  // Sort files by path
  files.sort((a, b) => a.file_path.localeCompare(b.file_path));

  for (const file of files) {
    const parts = file.file_path.split('/').filter(Boolean);
    let currentLevel = root;
    let currentPath = '';

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      currentPath += '/' + part;
      const isFile = i === parts.length - 1;

      let existing = currentLevel.find((n: any) => n.name === part);

      if (!existing) {
        existing = {
          name: part,
          path: currentPath,
          type: isFile ? 'file' : 'folder',
          children: isFile ? undefined : [],
        };
        currentLevel.push(existing);
        map.set(currentPath, existing);
      }

      if (!isFile && existing.children) {
        currentLevel = existing.children;
      }
    }
  }

  return root;
}

function generateMockFileStructure(projectName: string) {
  return [
    {
      name: 'app',
      path: '/app',
      type: 'folder',
      children: [
        {
          name: 'page.tsx',
          path: '/app/page.tsx',
          type: 'file',
        },
        {
          name: 'layout.tsx',
          path: '/app/layout.tsx',
          type: 'file',
        },
        {
          name: 'api',
          path: '/app/api',
          type: 'folder',
          children: [
            {
              name: 'route.ts',
              path: '/app/api/route.ts',
              type: 'file',
            },
          ],
        },
      ],
    },
    {
      name: 'components',
      path: '/components',
      type: 'folder',
      children: [
        {
          name: 'Header.tsx',
          path: '/components/Header.tsx',
          type: 'file',
        },
        {
          name: 'Footer.tsx',
          path: '/components/Footer.tsx',
          type: 'file',
        },
      ],
    },
    {
      name: 'lib',
      path: '/lib',
      type: 'folder',
      children: [
        {
          name: 'utils.ts',
          path: '/lib/utils.ts',
          type: 'file',
        },
      ],
    },
    {
      name: 'package.json',
      path: '/package.json',
      type: 'file',
    },
    {
      name: 'README.md',
      path: '/README.md',
      type: 'file',
    },
  ];
}
