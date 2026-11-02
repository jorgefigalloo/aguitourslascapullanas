import crypto from 'crypto';

export const config = {
  api: {
    bodyParser: false,
  },
};

const R2_ACCOUNT_ID = process.env.CLOUDFLARE_R2_ACCOUNT_ID || '25b75329dafb901dc55edad61b6aa5a4';
const R2_ACCESS_KEY_ID = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '280635f598b9ac6fb04c3c6be5cf47d2';
const R2_SECRET_ACCESS_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || 'bdf41195d888145ceeae62dd3804d60de72fb03f12c04de344447c367db9ca8f';
const R2_BUCKET = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'aguitourscapullanas';
const R2_PUBLIC_URL = (process.env.CLOUDFLARE_R2_PUBLIC_URL || process.env.VITE_CLOUDFLARE_R2_PUBLIC_URL || 'https://pub-6782babd351c499982137c48af2c6241.r2.dev').replace(/\/$/, '');
const SUPABASE_URL = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://qmwukfmieqoqydgrrbct.supabase.co').replace(/\/$/, '');
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtd3VrZm1pZXFvcXlkZ3JyYmN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4MDg1OTAsImV4cCI6MjEwMDM4NDU5MH0.wji4xmdM4KdJEywO77AVZh5q5CfXJXhdwpgohxz0kvU';

function generarFirmaV4(method, uri, bodyBuffer, contentType) {
  const host = `${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.substring(0, 8);
  const region = 'auto';
  const service = 's3';

  const payloadHash = crypto.createHash('sha256').update(bodyBuffer).digest('hex');
  const canonicalUri = '/' + uri.split('/').map(encodeURIComponent).join('/');

  let canonicalHeaders = '';
  let signedHeaders = '';

  if (contentType) {
    canonicalHeaders = `content-type:${contentType}\nhost:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`;
    signedHeaders = 'content-type;host;x-amz-content-sha256;x-amz-date';
  } else {
    canonicalHeaders = `host:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`;
    signedHeaders = 'host;x-amz-content-sha256;x-amz-date';
  }

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

  const headers = {
    'Host': host,
    'x-amz-date': amzDate,
    'x-amz-content-sha256': payloadHash,
    'Authorization': authHeader
  };

  if (contentType) {
    headers['Content-Type'] = contentType;
  }

  return {
    url: `https://${host}${canonicalUri}`,
    headers
  };
}

function parseMultipartBuffer(buffer, boundary) {
  const result = { fields: {}, files: {} };
  const delimiter = Buffer.from('--' + boundary);

  let cur = 0;
  while (cur < buffer.length) {
    const startIdx = buffer.indexOf(delimiter, cur);
    if (startIdx === -1) break;

    const nextBoundary = buffer.indexOf(delimiter, startIdx + delimiter.length);
    if (nextBoundary === -1) break;

    const partBuffer = buffer.subarray(startIdx + delimiter.length, nextBoundary);
    cur = nextBoundary;

    const headerEnd = partBuffer.indexOf(Buffer.from('\r\n\r\n'));
    if (headerEnd === -1) continue;

    const headerStr = partBuffer.subarray(0, headerEnd).toString('utf8');
    let bodyBuffer = partBuffer.subarray(headerEnd + 4);
    if (bodyBuffer.length >= 2 && bodyBuffer[bodyBuffer.length - 2] === 13 && bodyBuffer[bodyBuffer.length - 1] === 10) {
      bodyBuffer = bodyBuffer.subarray(0, bodyBuffer.length - 2);
    }

    const dispMatch = headerStr.match(/content-disposition:\s*form-data;\s*name="([^"]+)"(?:;\s*filename="([^"]+)")?/i);
    if (!dispMatch) continue;

    const fieldName = dispMatch[1];
    const filename = dispMatch[2];

    if (filename !== undefined) {
      const typeMatch = headerStr.match(/content-type:\s*([^\r\n;]+)/i);
      const contentType = typeMatch ? typeMatch[1].trim() : 'application/octet-stream';
      result.files[fieldName] = {
        filename,
        contentType,
        data: bodyBuffer
      };
    } else {
      result.fields[fieldName] = bodyBuffer.toString('utf8').trim();
    }
  }

  return result;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método no permitido. Use POST.' });
  }

  try {
    const contentType = req.headers['content-type'] || '';
    const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);

    if (!boundaryMatch) {
      return res.status(400).json({ success: false, message: 'Falta boundary de multipart/form-data.' });
    }

    const boundary = (boundaryMatch[1] || boundaryMatch[2]).trim();
    let bodyBuffer;

    if (Buffer.isBuffer(req.body)) {
      bodyBuffer = req.body;
    } else if (typeof req.body === 'string') {
      bodyBuffer = Buffer.from(req.body, 'latin1');
    } else if (req.rawBody && Buffer.isBuffer(req.rawBody)) {
      bodyBuffer = req.rawBody;
    } else {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
      }
      bodyBuffer = Buffer.concat(chunks);
    }

    if (!bodyBuffer || bodyBuffer.length === 0) {
      return res.status(400).json({ success: false, message: 'El cuerpo de la petición está vacío.' });
    }

    const { fields, files } = parseMultipartBuffer(bodyBuffer, boundary);

    const fileItem = files['imagen'];
    if (!fileItem || !fileItem.data || fileItem.data.length === 0) {
      return res.status(400).json({ success: false, message: 'No se recibió ninguna imagen para subir.' });
    }

    const categoria = fields['categoria'] || 'general';
    const titulo = fields['titulo'] || fileItem.filename.replace(/\.[^/.]+$/, '');
    const creadoPor = fields['creado_por'] || null;

    const extMatch = fileItem.filename.match(/\.([a-zA-Z0-9]+)$/);
    const ext = extMatch ? extMatch[1].toLowerCase() : 'jpg';
    const baseClean = fileItem.filename.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
    const randomHex = crypto.randomBytes(4).toString('hex');
    const timestamp = Math.floor(Date.now() / 1000);
    const r2Key = `galeria/${categoria}/${baseClean}_${timestamp}_${randomHex}.${ext}`;

    // 1. Subir a Cloudflare R2 con firma AWS V4
    const uri = `${R2_BUCKET}/${r2Key}`;
    const auth = generarFirmaV4('PUT', uri, fileItem.data, fileItem.contentType);

    const uploadRes = await fetch(auth.url, {
      method: 'PUT',
      headers: auth.headers,
      body: fileItem.data
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      console.error('[Vercel Serverless R2] Error al subir:', uploadRes.status, errText);
      return res.status(502).json({
        success: false,
        message: `Error al subir a Cloudflare R2 (HTTP ${uploadRes.status}): ${errText}`
      });
    }

    const publicUrl = `${R2_PUBLIC_URL}/${r2Key}`;

    // 2. Registrar en Supabase public.imagenes_galeria
    const registroBD = {
      titulo,
      url: publicUrl,
      r2_key: r2Key,
      origen: 'cloudflare_r2',
      categoria,
      bytes: fileItem.data.length,
      tipo_mime: fileItem.contentType,
      creado_por: creadoPor
    };

    let datosBD = null;
    try {
      const dbRes = await fetch(`${SUPABASE_URL}/rest/v1/imagenes_galeria`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(registroBD)
      });

      if (dbRes.ok) {
        const inserted = await dbRes.json();
        datosBD = Array.isArray(inserted) ? inserted[0] : inserted;
      }
    } catch (dbErr) {
      console.warn('[Vercel Serverless R2] Error guardando en Supabase:', dbErr);
    }

    return res.status(200).json({
      success: true,
      message: '¡Imagen subida exitosamente a Cloudflare R2!',
      url: publicUrl,
      key: r2Key,
      data: datosBD || registroBD
    });

  } catch (err) {
    console.error('[Vercel Serverless R2] Error general:', err);
    return res.status(500).json({
      success: false,
      message: 'Error interno en Vercel Serverless: ' + err.message
    });
  }
}
