import { NextResponse } from "next/server";
import { createClient } from "@/src/utils/supabase/server";
import { SyncService } from "@/src/services/SyncService";

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || !user) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu." }, { status: 401 });
    }

    if (!user.user_metadata?.is_gmail_connected) {
      return NextResponse.json({ 
        error: "Koneksi Gmail dinonaktifkan. Silakan aktifkan kembali di halaman Pengaturan." 
      }, { status: 400 });
    }

    // Pengecekan ekstra: Pastikan pengguna terdaftar sebagai tester di tabel profiles dan ambil token
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_gmail_tester, is_gmail_connected, gmail_access_token, gmail_refresh_token, gmail_token_expires_at')
      .eq('id', user.id)
      .single();

    if (!profile || !profile.is_gmail_tester) {
      return NextResponse.json({ 
        error: "Akun Anda belum disetujui sebagai tester fitur Gmail. Hubungi Developer." 
      }, { status: 403 });
    }

    if (!profile.is_gmail_connected || !profile.gmail_access_token) {
      return NextResponse.json({ 
        error: "Gmail belum terhubung. Silakan hubungkan Gmail Anda di halaman Pengaturan." 
      }, { status: 401 });
    }

    let providerToken = profile.gmail_access_token;
    
    // Auto-refresh token if expired (or expires within 1 minute)
    const expiresAt = profile.gmail_token_expires_at ? new Date(profile.gmail_token_expires_at) : null;
    const isExpired = expiresAt ? expiresAt.getTime() <= Date.now() + 60000 : true;

    if (isExpired && profile.gmail_refresh_token) {
      try {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        
        if (!clientId || !clientSecret) {
          console.error("GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET missing from environment");
          throw new Error("Client credentials missing");
        }

        const response = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: profile.gmail_refresh_token,
            grant_type: "refresh_token"
          })
        });

        const tokenData = await response.json();
        if (!response.ok) {
          throw new Error(tokenData.error_description || tokenData.error || "Google API refresh failed");
        }

        providerToken = tokenData.access_token;
        const newExpiresAt = new Date();
        newExpiresAt.setSeconds(newExpiresAt.getSeconds() + (tokenData.expires_in || 3600));

        await supabase
          .from('profiles')
          .update({
            gmail_access_token: providerToken,
            gmail_token_expires_at: newExpiresAt.toISOString()
          })
          .eq('id', user.id);
          
      } catch (refreshErr: any) {
        console.error("Gmail token refresh failed:", refreshErr.message);
        return NextResponse.json({ 
          error: "Koneksi Gmail Anda telah kedaluwarsa. Silakan sambungkan kembali di halaman Pengaturan." 
        }, { status: 401 });
      }
    }

    if (!providerToken) {
      return NextResponse.json({ 
        error: "Gmail belum terhubung atau sesi kedaluwarsa. Silakan hubungkan kembali di halaman Pengaturan." 
      }, { status: 401 });
    }

    // Panggil The Orchestrator
    const count = await SyncService.runAutoSync(supabase, user.id, providerToken);

    return NextResponse.json({ message: `Sukses sync ${count} transaksi.` });
  } catch (error: any) {
    console.error("Sync Error:", error.message);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}