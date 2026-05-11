import { google } from 'googleapis';

// Fungsi untuk membaca isi email yang dienkripsi Gmail
function decodeBase64(data: string) {
    return Buffer.from(data, 'base64').toString('utf-8');
}

function extractEmailBody(payload: any): string {
    if (!payload) return "";
    if (payload.parts && payload.parts.length > 0) {
        // Cari bagian teks biasa (bukan HTML jika memungkinkan)
        const part = payload.parts.find((p: any) => p.mimeType === 'text/plain') || payload.parts[0];
        if (part.body && part.body.data) return decodeBase64(part.body.data);
        if (part.parts) return extractEmailBody(part); 
    } else if (payload.body && payload.body.data) {
        return decodeBase64(payload.body.data);
    }
    return "";
}

export async function fetchLatestReceipts(accessToken: string, userCreatedAt: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  const gmail = google.gmail({ version: 'v1', auth });

  // Ubah tanggal daftar user menjadi format Gmail (YYYY/MM/DD)
  const dateObj = new Date(userCreatedAt);
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');

  const domains = [
    'gopay.co.id', 'shopeepay.co.id', 'bankmandiri.co.id',
    'bca.co.id', 'bri.co.id', 'bni.co.id', 'ovo.id', 'dana.id', 'flip.id'
  ];
  
  const fromQuery = domains.map(domain => `from:${domain}`).join(' OR ');
  
  // FILTER BARU: Tambahkan after:{tanggal}
  const q = `(${fromQuery}) (pembayaran OR berhasil OR transaksi OR transfer OR mutasi) after:${yyyy}/${mm}/${dd}`;

  const res = await gmail.users.messages.list({
    userId: 'me',
    q: q, 
    maxResults: 5, 
  });

  const messages = res.data.messages || [];
  const receiptsData = [];

  for (const msg of messages) {
    const details = await gmail.users.messages.get({
      userId: 'me',
      id: msg.id!,
      format: 'full',
    });

    // Ambil isi penuh email
    const fullBody = extractEmailBody(details.data.payload);
    const textToProcess = fullBody || details.data.snippet; // Fallback ke snippet jika body gagal

    receiptsData.push({
      id: details.data.id,
      body: textToProcess, 
    });
  }

  return receiptsData;
}