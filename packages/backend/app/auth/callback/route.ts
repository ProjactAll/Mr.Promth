import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

function resolveRedirectPath(url: URL): string {
  const redirectParam = url.searchParams.get('redirect_to') ?? url.searchParams.get('next') ?? '/chat';

  if (!redirectParam.startsWith('/')) {
    return '/';
  }

  return redirectParam;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const errorDescription = requestUrl.searchParams.get('error_description');
  const error = requestUrl.searchParams.get('error');
  const redirectPath = resolveRedirectPath(requestUrl);
  const redirectUrl = new URL(redirectPath, requestUrl.origin);

  if (error || errorDescription) {
    redirectUrl.searchParams.set('error', errorDescription || error || 'authentication_failed');
    return NextResponse.redirect(redirectUrl.toString());
  }

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      redirectUrl.searchParams.set('error', exchangeError.message || 'authentication_failed');
      return NextResponse.redirect(redirectUrl.toString());
    }
  }

  return NextResponse.redirect(redirectUrl.toString());
}
