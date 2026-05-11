import { google } from 'googleapis';

export async function fetchLatestReceipts(accessToken: string, userCreatedAt: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  const gmail = google.gmail({ version: 'v1', auth });

  // Filter Tanggal: Hanya ambil email SETELAH user daftar
  const dateStr = new Date(userCreatedAt).toISOString().split('T')[0].replace(/-/g, '/');
  
  const domains = ['gopay.co.id', 'shopeepay.co.id', 'bca.co.id', 'bankmandiri.co.id', 'dana.id'];
  const fromQuery = domains.map(d => `from:${d}`).join(' OR ');
  const q = `(${fromQuery}) (pembayaran OR berhasil OR transaksi) after:${dateStr}`;

  const res = await gmail.users.messages.list({ userId: 'me', q, maxResults: 5 });
  const messages = res.data.messages || [];
  const receiptsData = [];

  for (const msg of messages) {
    const details = await gmail.users.messages.get({ userId: 'me', id: msg.id!, format: 'full' });
    
    // Ambil isi email (biasanya di parts[0] atau snippet sebagai fallback)
    const body = details.data.snippet || ""; 
    
    receiptsData.push({ id: msg.id, body: body });
  }
  return receiptsData;
}