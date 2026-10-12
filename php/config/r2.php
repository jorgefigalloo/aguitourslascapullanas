<?php
/**
 * AGUITOURS LAS CAPULLANAS - CLIENTE S3 / CLOUDFLARE R2 OBJECT STORAGE
 * Implementación nativa ligera de AWS Signature Version 4 para Cloudflare R2 sin dependencias externas.
 */

require_once __DIR__ . '/env.php';

define('R2_ACCOUNT_ID', env('CLOUDFLARE_R2_ACCOUNT_ID', '25b75329dafb901dc55edad61b6aa5a4'));
define('R2_ACCESS_KEY_ID', env('CLOUDFLARE_R2_ACCESS_KEY_ID', '280635f598b9ac6fb04c3c6be5cf47d2'));
define('R2_SECRET_ACCESS_KEY', env('CLOUDFLARE_R2_SECRET_ACCESS_KEY', 'bdf41195d888145ceeae62dd3804d60de72fb03f12c04de344447c367db9ca8f'));
define('R2_BUCKET_NAME', env('CLOUDFLARE_R2_BUCKET_NAME', 'aguitourscapullanas'));
define('R2_PUBLIC_URL', rtrim(env('CLOUDFLARE_R2_PUBLIC_URL', 'https://pub-6782babd351c499982137c48af2c6241.r2.dev'), '/'));

/**
 * Genera la firma AWS Signature Version 4
 */
function generarFirmaV4($method, $uri, $body, $contentType = null, $region = 'auto', $service = 's3') {
    $host = R2_ACCOUNT_ID . '.r2.cloudflarestorage.com';
    $now = new DateTime('UTC');
    $amzDate = $now->format('Ymd\THis\Z');
    $dateStamp = $now->format('Ymd');
    
    $payloadHash = hash('sha256', $body);
    
    // Encabezados canónicos
    $headers = [
        'host' => $host,
        'x-amz-content-sha256' => $payloadHash,
        'x-amz-date' => $amzDate
    ];

    if ($contentType) {
        $headers['content-type'] = $contentType;
    }

    ksort($headers);

    $canonicalHeaders = '';
    $signedHeadersArray = [];
    foreach ($headers as $k => $v) {
        $canonicalHeaders .= strtolower($k) . ':' . trim($v) . "\n";
        $signedHeadersArray[] = strtolower($k);
    }
    $signedHeaders = implode(';', $signedHeadersArray);

    $canonicalUri = '/' . ltrim($uri, '/');
    // Codificar cada segmento preservando las barras diagonales
    $parts = explode('/', $canonicalUri);
    $encodedParts = array_map('rawurlencode', $parts);
    $canonicalUri = implode('/', $encodedParts);

    $canonicalRequest = $method . "\n"
        . $canonicalUri . "\n"
        . "" . "\n" // Sin query string
        . $canonicalHeaders . "\n"
        . $signedHeaders . "\n"
        . $payloadHash;

    $credentialScope = $dateStamp . '/' . $region . '/' . $service . '/aws4_request';
    $stringToSign = "AWS4-HMAC-SHA256\n"
        . $amzDate . "\n"
        . $credentialScope . "\n"
        . hash('sha256', $canonicalRequest);

    // Derivación de la clave de firma
    $kSecret = 'AWS4' . R2_SECRET_ACCESS_KEY;
    $kDate = hash_hmac('sha256', $dateStamp, $kSecret, true);
    $kRegion = hash_hmac('sha256', $region, $kDate, true);
    $kService = hash_hmac('sha256', $service, $kRegion, true);
    $kSigning = hash_hmac('sha256', 'aws4_request', $kService, true);

    $signature = hash_hmac('sha256', $stringToSign, $kSigning);

    $authorizationHeader = "AWS4-HMAC-SHA256 Credential=" . R2_ACCESS_KEY_ID . "/" . $credentialScope
        . ", SignedHeaders=" . $signedHeaders
        . ", Signature=" . $signature;

    $requestHeaders = [
        "Host: {$host}",
        "x-amz-date: {$amzDate}",
        "x-amz-content-sha256: {$payloadHash}",
        "Authorization: {$authorizationHeader}"
    ];

    if ($contentType) {
        $requestHeaders[] = "Content-Type: {$contentType}";
    }

    return [
        'url' => "https://{$host}" . $canonicalUri,
        'headers' => $requestHeaders
    ];
}

/**
 * Sube un archivo binario directamente a Cloudflare R2
 */
function subirObjetoR2($binaryData, $key, $mimeType = 'image/jpeg') {
    $uri = R2_BUCKET_NAME . '/' . ltrim($key, '/');
    $auth = generarFirmaV4('PUT', $uri, $binaryData, $mimeType);

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $auth['url']);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
    curl_setopt($ch, CURLOPT_POSTFIELDS, $binaryData);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $auth['headers']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($httpCode >= 200 && $httpCode < 300) {
        return [
            'success' => true,
            'key' => $key,
            'public_url' => R2_PUBLIC_URL . '/' . ltrim($key, '/')
        ];
    }

    return [
        'success' => false,
        'http_code' => $httpCode,
        'error' => $curlError ?: $response ?: 'Error desconocido al subir a R2'
    ];
}

/**
 * Elimina un objeto de Cloudflare R2
 */
function eliminarObjetoR2($key) {
    $uri = R2_BUCKET_NAME . '/' . ltrim($key, '/');
    $auth = generarFirmaV4('DELETE', $uri, '', null);

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $auth['url']);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
    curl_setopt($ch, CURLOPT_HTTPHEADER, $auth['headers']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return ($httpCode === 204 || $httpCode === 200);
}
