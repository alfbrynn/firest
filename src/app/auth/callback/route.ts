import { NextResponse } from 'next/server'
import { createClient } from '@/src/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // Setelah sukses login, arahkan ke dashboard
  const next = searchParams.get('next') ?? '/dashboard'

  const gmailConnect = searchParams.get('gmail_connect') === 'true'

  if (code) {
    const supabase = await createClient()
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data.user) {
      if (gmailConnect) {
        await supabase.auth.updateUser({
          data: { is_gmail_connected: true }
        });

        const updateData: any = {
          is_gmail_connected: true,
        };

        if (data.session) {
          const expiresAt = new Date();
          expiresAt.setSeconds(expiresAt.getSeconds() + (data.session.expires_in || 3600));

          updateData.gmail_access_token = data.session.provider_token;
          updateData.gmail_token_expires_at = expiresAt.toISOString();

          if (data.session.provider_refresh_token) {
            updateData.gmail_refresh_token = data.session.provider_refresh_token;
          }
        }

        await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', data.user.id);
      }

      const forwardedHost = request.headers.get('x-forwarded-host')

      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // Jika gagal, kembalikan ke halaman login dengan pesan error
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
