import { google } from 'googleapis';

export async function fetchLatestReceipts(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  const gmail = google.gmail({ version: 'v1', auth });

  // --- FILTERING SAKTI V2 (Lebih Lengkap & Anti-Promo) ---
  // Daftar domain e-wallet dan bank populer di Indonesia
  const domains = [
    'gopay.co.id', 
    'shopeepay.co.id', 
    'bankmandiri.co.id',
    'bca.co.id', 
    'bri.co.id', 
    'bni.co.id', 
    'ovo.id', 
    'dana.id',
    'flip.id'
  ];
  
  const fromQuery = domains.map(domain => `from:${domain}`).join(' OR ');
  
  // Wajib mengandung kata kunci transaksi agar email promosi tidak ikut tersedot
  const q = `(${fromQuery}) (pembayaran OR berhasil OR transaksi OR transfer OR mutasi OR receipt)`;

  const res = await gmail.users.messages.list({
    userId: 'me',
    q: q, // Masukkan filter di sini
    maxResults: 5, // Cek 5 email terakhir saja biar hemat
  });

  const messages = res.data.messages || [];
  const receiptsData = [];

  for (const msg of messages) {
    const details = await gmail.users.messages.get({
      userId: 'me',
      id: msg.id!,
      format: 'full',
    });

    // Ambil isi email (biasanya ada di snippet atau part body)
    const snippet = details.data.snippet; // Teks singkat email
    const messageId = details.data.id;

    receiptsData.push({
      id: messageId,
      body: snippet, // Kita pakai snippet dulu untuk hemat token, atau ambil full body jika perlu
    });
  }

  return receiptsData;
}