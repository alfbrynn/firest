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

  // === FIX TANGGAL: Beri toleransi mundur 3 hari ===
  const dateObj = new Date(userCreatedAt);
  dateObj.setDate(dateObj.getDate() - 3); // Mundur 3 hari dari tanggal daftar
  
  const dateStr = dateObj.toISOString().split('T')[0].replace(/-/g, '/');
  // =================================================

  const domains = ['gopay.co.id', 'shopeepay.co.id', 'bca.co.id', 'bankmandiri.co.id', 'dana.id', 'ovo.id'];
  const fromQuery = domains.map(d => `from:${d}`).join(' OR ');
  
  // Filter akan mencari email sejak 3 hari sebelum daftar
  const q = `(${fromQuery}) (pembayaran OR berhasil OR transaksi) after:${dateStr}`;

  const res = await gmail.users.messages.list({ userId: 'me', q, maxResults: 5 });
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