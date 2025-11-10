import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import { encryptSecret, hashIdentifier, maskSecret } from '@/utils/security';

export const dynamic = 'force-dynamic';

const ALLOWED_PROVIDERS = ['vanchin'] as const;
type ProviderValue = (typeof ALLOWED_PROVIDERS)[number];

const isAllowedProvider = (value: string): value is ProviderValue =>
  ALLOWED_PROVIDERS.includes(value as ProviderValue);

export async function POST(request: Request) {
  try {
    const supabase = createServerComponentClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { provider, key } = await request.json();

    if (!provider || !key) {
      return NextResponse.json({ error: 'Provider and key are required' }, { status: 400 });
    }

    const normalizedProvider = String(provider).toLowerCase();

    if (!isAllowedProvider(normalizedProvider)) {
      return NextResponse.json({ error: `Provider "${provider}" is not supported` }, { status: 400 });
    }

    const trimmedKey = String(key).trim();

    if (!trimmedKey) {
      return NextResponse.json({ error: 'API key cannot be empty' }, { status: 400 });
    }

    // Encrypt the API key
    const encryptedKey = encryptSecret(trimmedKey);
    const keyHash = hashIdentifier(trimmedKey);
    const maskedKey = maskSecret(trimmedKey);

    // Check if key already exists
    const { data: existingKey } = await supabase
      .from('api_keys')
      .select('id')
      .eq('user_id', user.id)
      .eq('key_hash', keyHash)
      .single();

    if (existingKey) {
      return NextResponse.json({ error: 'This API key is already saved' }, { status: 409 });
    }

    // Save to database
    const { data, error } = await supabase
      .from('api_keys')
      .insert({
        user_id: user.id,
        provider: normalizedProvider,
        encrypted_key: encryptedKey,
        key_hash: keyHash,
        masked_key: maskedKey,
        last_used: null,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      id: data.id,
      provider: data.provider,
      masked_key: data.masked_key,
      created_at: data.created_at,
    });
  } catch (error) {
    console.error('Error saving API key:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save API key' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = createServerComponentClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('api_keys')
      .select('id, provider, masked_key, last_used, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ keys: data || [] });
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch API keys' },
      { status: 500 }
    );
  }
}