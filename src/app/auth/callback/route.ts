import { NextResponse } from 'next/server'
import { createClient } from '@/src/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // Setelah sukses login, arahkan ke dashboard
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data.user) {
      // Jika login via Google, set flag is_gmail_connected
      if (data.user.app_metadata?.provider === 'google' || data.user.app_metadata?.providers?.includes('google')) {
        await supabase.auth.updateUser({
          data: { is_gmail_connected: true }
        });
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
