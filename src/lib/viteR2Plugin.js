import crypto from 'crypto';

/**
 * Genera la firma AWS Signature Version 4 para Cloudflare R2
 */
function generarFirmaV4(method, uri, bodyBuffer, contentType, env) {
  const accountId = env.CLOUDFLARE_R2_ACCOUNT_ID || '25b75329dafb901dc55edad61b6aa5a4';
  const accessKey = env.CLOUDFLARE_R2_ACCESS_KEY_ID || '280635f598b9ac6fb04c3c6be5cf47d2';
  const secretKey = env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || 'bdf41195d888145ceeae62dd3804d60de72fb03f12c04de344447c367db9ca8f';

  const host = `${accountId}.r2.cloudflarestorage.com`;
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

  const kSecret = Buffer.from('AWS4' + secretKey, 'utf8');
  const kDate = crypto.createHmac('sha256', kSecret).update(dateStamp).digest();
  const kRegion = crypto.createHmac('sha256', kDate).update(region).digest();
  const kService = crypto.createHmac('sha256', kRegion).update(service).digest();
  const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest();
  const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');

  const authHeader = `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

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

/**
 * Parser de formularios multipart/form-data en Buffer nativo
 */
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

/**
 * Plugin de Vite para manejar uploads a Cloudflare R2 sin requerir Apache/PHP local
 */
export function cloudflareR2VitePlugin(env = {}) {
  const bucketName = env.CLOUDFLARE_R2_BUCKET_NAME || 'aguitourscapullanas';
  const publicUrlBase = (env.CLOUDFLARE_R2_PUBLIC_URL || 'https://pub-6782babd351c499982137c48af2c6241.r2.dev').replace(/\/$/, '');
  const supabaseUrl = (env.VITE_SUPABASE_URL || env.SUPABASE_URL || 'https://qmwukfmieqoqydgrrbct.supabase.co').replace(/\/$/, '');
  const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || '';

  return {
    name: 'vite-plugin-cloudflare-r2',
    configureServer(server) {
      // Endpoint 1: Subida de imágenes a Cloudflare R2
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.includes('/php/api/upload_r2.php') && !req.url.includes('/api/upload_r2')) {
          return next();
        }

        if (req.method !== 'POST') {
          res.writeHead(405, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'Método no permitido.' }));
          return;
        }

        const contentType = req.headers['content-type'] || '';
        const boundaryMatch = contentType.match(/boundary=([-_\w]+)/i);

        if (!boundaryMatch) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'Falta boundary de multipart/form-data.' }));
          return;
        }

        const boundary = boundaryMatch[1];
        const chunks = [];

        req.on('data', chunk => chunks.push(chunk));
        req.on('end', async () => {
          try {
            const bodyBuffer = Buffer.concat(chunks);
            const { fields, files } = parseMultipartBuffer(bodyBuffer, boundary);

            const fileItem = files['imagen'];
            if (!fileItem || !fileItem.data || fileItem.data.length === 0) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, message: 'No se recibió ninguna imagen para subir.' }));
              return;
            }

            const categoria = fields['categoria'] || 'general';
            const titulo = fields['titulo'] || fileItem.filename.replace(/\.[^/.]+$/, '');
            const creadoPor = fields['creado_por'] || null;

            // Extraer extensión y sanitizar nombre
            const extMatch = fileItem.filename.match(/\.([a-zA-Z0-9]+)$/);
            const ext = extMatch ? extMatch[1].toLowerCase() : 'jpg';
            const baseClean = fileItem.filename.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
            const randomHex = crypto.randomBytes(4).toString('hex');
            const timestamp = Math.floor(Date.now() / 1000);
            const r2Key = `galeria/${categoria}/${baseClean}_${timestamp}_${randomHex}.${ext}`;

            // 1. Subir binario a Cloudflare R2
            const uri = `${bucketName}/${r2Key}`;
            const auth = generarFirmaV4('PUT', uri, fileItem.data, fileItem.contentType, env);

            const uploadRes = await fetch(auth.url, {
              method: 'PUT',
              headers: auth.headers,
              body: fileItem.data
            });

            if (!uploadRes.ok) {
              const errText = await uploadRes.text();
              console.error('[R2 Vite Plugin] Error al subir a R2:', uploadRes.status, errText);
              res.writeHead(502, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, message: `Error de Cloudflare R2 (HTTP ${uploadRes.status}): ${errText}` }));
              return;
            }

            const publicUrl = `${publicUrlBase}/${r2Key}`;

            // 2. Guardar registro en Supabase public.imagenes_galeria
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
              const dbRes = await fetch(`${supabaseUrl}/rest/v1/imagenes_galeria`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'apikey': supabaseKey,
                  'Authorization': `Bearer ${supabaseKey}`,
                  'Prefer': 'return=representation'
                },
                body: JSON.stringify(registroBD)
              });

              if (dbRes.ok) {
                const inserted = await dbRes.json();
                datosBD = Array.isArray(inserted) ? inserted[0] : inserted;
              } else {
                console.warn('[R2 Vite Plugin] Error al guardar en Supabase:', await dbRes.text());
              }
            } catch (dbErr) {
              console.warn('[R2 Vite Plugin] Error DB catch:', dbErr);
            }

            // 3. Responder exitosamente al frontend
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({
              success: true,
              message: '¡Imagen subida exitosamente a Cloudflare R2!',
              url: publicUrl,
              key: r2Key,
              data: datosBD || registroBD
            }));
          } catch (err) {
            console.error('[R2 Vite Plugin] Error general:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Error interno: ' + err.message }));
          }
        });
      });

      // Endpoint 2: Eliminación de imágenes de Cloudflare R2
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.includes('/php/api/eliminar_r2.php') && !req.url.includes('/api/eliminar_r2')) {
          return next();
        }

        const chunks = [];
        req.on('data', chunk => chunks.push(chunk));
        req.on('end', async () => {
          try {
            const rawBody = Buffer.concat(chunks).toString('utf8');
            let input = {};
            try { input = JSON.parse(rawBody); } catch { input = {}; }

            const r2Key = input.r2_key;
            const imagenId = input.id;

            if (!r2Key && !imagenId) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, message: 'Se requiere id o r2_key.' }));
              return;
            }

            // 1. Eliminar de R2 si hay r2_key
            let r2Eliminado = false;
            if (r2Key) {
              const uri = `${bucketName}/${r2Key}`;
              const auth = generarFirmaV4('DELETE', uri, Buffer.from(''), null, env);
              const delRes = await fetch(auth.url, {
                method: 'DELETE',
                headers: auth.headers
              });
              r2Eliminado = delRes.status === 204 || delRes.status === 200;
            }

            // 2. Eliminar de Supabase
            if (imagenId) {
              await fetch(`${supabaseUrl}/rest/v1/imagenes_galeria?id=eq.${imagenId}`, {
                method: 'DELETE',
                headers: {
                  'apikey': supabaseKey,
                  'Authorization': `Bearer ${supabaseKey}`
                }
              });
            }

            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({
              success: true,
              message: 'Imagen eliminada correctamente.',
              r2_eliminado: r2Eliminado
            }));
          } catch (err) {
            console.error('[R2 Vite Plugin] Error al eliminar:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Error al eliminar: ' + err.message }));
          }
        });
      });
    }
  };
}
