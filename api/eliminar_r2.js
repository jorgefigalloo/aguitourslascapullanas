import crypto from 'crypto';

const R2_ACCOUNT_ID = process.env.CLOUDFLARE_R2_ACCOUNT_ID || '25b75329dafb901dc55edad61b6aa5a4';
const R2_ACCESS_KEY_ID = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '280635f598b9ac6fb04c3c6be5cf47d2';
const R2_SECRET_ACCESS_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || 'bdf41195d888145ceeae62dd3804d60de72fb03f12c04de344447c367db9ca8f';
const R2_BUCKET = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'aguitourscapullanas';
const SUPABASE_URL = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://qmwukfmieqoqydgrrbct.supabase.co').replace(/\/$/, '');
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtd3VrZm1pZXFvcXlkZ3JyYmN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4MDg1OTAsImV4cCI6MjEwMDM4NDU5MH0.wji4xmdM4KdJEywO77AVZh5q5CfXJXhdwpgohxz0kvU';

function generarFirmaV4(method, uri) {
  const host = `${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.substring(0, 8);
  const region = 'auto';
  const service = 's3';

  const payloadHash = crypto.createHash('sha256').update('').digest('hex');
  const canonicalUri = '/' + uri.split('/').map(encodeURIComponent).join('/');

  const canonicalHeaders = `host:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`;
  const signedHeaders = 'host;x-amz-content-sha256;x-amz-date';

  const canonicalRequest = `${method}\n${canonicalUri}\n\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${crypto.createHash('sha256').update(canonicalRequest).digest('hex')}`;

  const kSecret = Buffer.from('AWS4' + R2_SECRET_ACCESS_KEY, 'utf8');
  const kDate = crypto.createHmac('sha256', kSecret).update(dateStamp).digest();
  const kRegion = crypto.createHmac('sha256', kDate).update(region).digest();
  const kService = crypto.createHmac('sha256', kRegion).update(service).digest();
  const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest();
  const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');

  const authHeader = `AWS4-HMAC-SHA256 Credential=${R2_ACCESS_KEY_ID}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return {
    url: `https://${host}${canonicalUri}`,
    headers: {
      'Host': host,
      'x-amz-date': amzDate,
      'x-amz-content-sha256': payloadHash,
      'Authorization': authHeader
    }
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    let input = req.body;
    if (!input || typeof input !== 'object') {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      try {
        input = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      } catch {
        input = {};
      }
    }

    const r2Key = input.r2_key;
    const imagenId = input.id;

    if (!r2Key && !imagenId) {
      return res.status(400).json({ success: false, message: 'Se requiere id o r2_key.' });
    }

    let r2Eliminado = false;
    if (r2Key) {
      const uri = `${R2_BUCKET}/${r2Key}`;
      const auth = generarFirmaV4('DELETE', uri);
      const delRes = await fetch(auth.url, {
        method: 'DELETE',
        headers: auth.headers
      });
      r2Eliminado = delRes.status === 204 || delRes.status === 200;
    }

    if (imagenId) {
      await fetch(`${SUPABASE_URL}/rest/v1/imagenes_galeria?id=eq.${imagenId}`, {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Imagen eliminada correctamente.',
      r2_eliminado: r2Eliminado
    });
  } catch (err) {
    console.error('[Vercel Serverless R2] Error al eliminar:', err);
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar: ' + err.message
    });
  }
}
