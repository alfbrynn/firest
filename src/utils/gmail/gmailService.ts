import { google } from 'googleapis';

// Dekoder rahasia Gmail
function decodeBase64(data: string) {
    return Buffer.from(data, 'base64').toString('utf-8');
}

function extractEmailBody(payload: any): string {
    if (!payload) return "";
    if (payload.parts && payload.parts.length > 0) {
        const part = payload.parts.find((p: any) => p.mimeType === 'text/plain') || payload.parts[0];
        if (part.body && part.body.data) return decodeBase64(part.body.data);
        if (part.parts) return extractEmailBody(part); 
    } else if (payload.body && payload.body.data) {
        return decodeBase64(payload.body.data);
    }
    return "";
}

// ... (import dan fungsi decoder tetap sama)

export async function fetchLatestReceipts(accessToken: string, userCreatedAt: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  const gmail = google.gmail({ version: 'v1', auth });

  // 1. Ambil waktu 3 hari yang lalu dari HARI INI (bukan dari userCreatedAt)
  const dateObj = new Date();
  dateObj.setDate(dateObj.getDate() - 3); 
  
  // Format manual YYYY/MM/DD agar akurat
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');
  const dateStr = `${yyyy}/${mm}/${dd}`;

  const domains = ['gopay.co.id', 'shopeepay.co.id', 'bca.co.id', 'bankmandiri.co.id', 'dana.id', 'ovo.id', 'flip.id'];
  const fromQuery = domains.map(d => `from:${d}`).join(' OR ');
  
  // Tambahkan variasi kata kunci agar lebih tangguh
  const q = `(${fromQuery}) (pembayaran OR berhasil OR transaksi OR mutasi OR receipt OR bukti) after:${dateStr}`;

  // 2. NAIKKAN LIMIT! Ubah maxResults menjadi 20 atau 30
  const res = await gmail.users.messages.list({ userId: 'me', q, maxResults: 25 });
  const messages = res.data.messages || [];
  const receiptsData = [];

  for (const msg of messages) {
    const details = await gmail.users.messages.get({ userId: 'me', id: msg.id!, format: 'full' });
    
    const fullBody = extractEmailBody(details.data.payload);
    const textToProcess = fullBody || details.data.snippet || ""; 
    
    receiptsData.push({ id: msg.id, body: textToProcess });
  }
  return receiptsData;
}