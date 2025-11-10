import { NextRequest, NextResponse } from 'next/server';
import { projectTemplates } from '@/lib/templates/project-templates';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');

    let templates = projectTemplates;

    if (category) {
      templates = templates.filter(t => t.category === category);
    }

    if (difficulty) {
      templates = templates.filter(t => t.difficulty === difficulty);
    }

    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
