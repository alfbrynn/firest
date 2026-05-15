import { google } from 'googleapis';

// Dekoder rahasia Gmail
function decodeBase64(data: string) {
    return Buffer.from(data, 'base64').toString('utf-8');
}

/**
 * Membuang tag HTML, style, script, dan mengonversi HTML entities
 * agar teks yang dikirim ke AI sangat bersih, pendek, dan mudah dibaca.
 */
function cleanHtml(text: string): string {
    if (!text) return "";

    // 1. Hapus tag <style> dan <script> beserta seluruh isinya
    let clean = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
    clean = clean.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");

    // 2. Konversi tag block/pemisah HTML ke baris baru agar struktur teks/tabel tidak berantakan
    clean = clean.replace(/<\/p>/gi, "\n");
    clean = clean.replace(/<br\s*\/?>/gi, "\n");
    clean = clean.replace(/<\/tr>/gi, "\n");
    clean = clean.replace(/<\/div>/gi, "\n");
    clean = clean.replace(/<\/li>/gi, "\n");
    clean = clean.replace(/<td[^>]*>/gi, " ");

    // 3. Hapus semua tag HTML yang tersisa
    clean = clean.replace(/<[^>]*>/g, "");

    // 4. Konversi HTML entities umum ke karakter biasa
    const entities: { [key: string]: string } = {
        "&nbsp;": " ",
        "&amp;": "&",
        "&lt;": "<",
        "&gt;": ">",
        "&quot;": '"',
        "&#39;": "'",
        "&apos;": "'",
        "&cent;": "¢",
        "&pound;": "£",
        "&yen;": "¥",
        "&euro;": "€",
        "&copy;": "©",
        "&reg;": "®"
    };
    
    clean = clean.replace(/&[a-z0-9#]+;/gi, (match) => {
        return entities[match.toLowerCase()] || match;
    });

    // 5. Normalisasi baris baru dan spasi berlebih
    const lines = clean.split("\n");
    const processedLines = lines
        .map(line => line.trim())
        .filter(line => line.length > 0);

    return processedLines.join("\n");
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

export class GmailProvider {
  static async fetchRecentEmails(accessToken: string, daysAgo: number = 3) {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const gmail = google.gmail({ version: 'v1', auth });

    const dateObj = new Date();
    dateObj.setDate(dateObj.getDate() - daysAgo); 
    
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(dateObj.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}/${mm}/${dd}`;

    const domains = ['gopay.co.id', 'shopeepay.co.id', 'bca.co.id', 'bankmandiri.co.id', 'dana.id', 'ovo.id', 'flip.id'];
    const fromQuery = domains.map(d => `from:${d}`).join(' OR ');
    const q = `(${fromQuery}) (pembayaran OR berhasil OR transaksi OR mutasi OR receipt OR bukti) after:${dateStr}`;

    const res = await gmail.users.messages.list({ userId: 'me', q, maxResults: 25 });
    const messages = res.data.messages || [];
    const emails = [];

    for (const msg of messages) {
      const details = await gmail.users.messages.get({ userId: 'me', id: msg.id!, format: 'full' });
      
      const fullBody = extractEmailBody(details.data.payload);
      const textToProcess = fullBody || details.data.snippet || ""; 
      const internalDate = details.data.internalDate ? new Date(parseInt(details.data.internalDate)).toISOString() : new Date().toISOString();
      const cleanedBody = cleanHtml(textToProcess);
      
      emails.push({ id: msg.id!, body: cleanedBody, date: internalDate });
    }


    return emails;
  }
}
