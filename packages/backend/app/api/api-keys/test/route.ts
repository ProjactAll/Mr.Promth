import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import { decryptSecret } from '@/utils/security';

export const dynamic = 'force-dynamic';

const PROVIDER_LABELS: Record<string, string> = {
  vanchin: 'Vanchin AI',
  anthropic: 'Anthropic',
};

class ProviderTestError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = 'ProviderTestError';
  }
}

async function verifyVanchin AI(key: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/models', {
    headers: {
      Authorization: `Bearer ${key}`,
    },
  });

  if (!response.ok) {
    const detail = (await response.text()) || response.statusText || 'Vanchin AI API error';
    throw new ProviderTestError(detail, response.status);
  }

  return 'Vanchin AI key verified successfully.';
}

async function verifyAnthropic(key: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/models', {
    headers: {
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
  });

  if (!response.ok) {
    const detail = (await response.text()) || response.statusText || 'Anthropic API error';
    throw new ProviderTestError(detail, response.status);
  }

  return 'Anthropic key verified successfully.';
}

async function verifyProvider(provider: string, key: string): Promise<string> {
  const normalized = provider.toLowerCase();
  switch (normalized) {
    case 'openai':
      return await verifyVanchin AI(key);
    case 'anthropic':
      return await verifyAnthropic(key);
    default:
      throw new ProviderTestError(`Provider "${provider}" is not supported for verification.`, 400);
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createServerComponentClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { key_id } = await request.json();

    if (!key_id) {
      return NextResponse.json({ error: 'Key ID is required' }, { status: 400 });
    }

    const { data: apiKey, error: fetchError } = await supabase
      .from('api_keys')
      .select('id, provider, encrypted_key')
      .eq('id', key_id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !apiKey) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }

    const decryptedKey = decryptSecret(apiKey.encrypted_key);

    try {
      const message = await verifyProvider(apiKey.provider, decryptedKey);

      await supabase
        .from('api_keys')
        .update({ last_used: new Date().toISOString() })
        .eq('id', key_id)
        .eq('user_id', user.id);

      const providerLabel = PROVIDER_LABELS[apiKey.provider.toLowerCase()] ?? apiKey.provider;

      return NextResponse.json({ success: true, message: message || `${providerLabel} connection verified.` });
    } catch (error) {
      if (error instanceof ProviderTestError) {
        return NextResponse.json({ error: error.message }, { status: error.status });
      }

      const detail = error instanceof Error ? error.message : 'Unknown provider verification failure';
      return NextResponse.json({ error: detail }, { status: 500 });
    }
  } catch (error) {
    console.error('Error testing API key:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to test API key' },
      { status: 500 }
    );
  }
}