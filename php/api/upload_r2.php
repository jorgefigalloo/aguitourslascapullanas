<?php
/**
 * AGUITOURS LAS CAPULLANAS - ENDPOINT DE CARGA A CLOUDFLARE R2
 * Sube imágenes a Cloudflare R2 y registra sus metadatos en Supabase.
 */

require_once __DIR__ . '/../middleware/cors.php';
require_once __DIR__ . '/../middleware/rate_limit.php';
require_once __DIR__ . '/../middleware/sanitizer.php';
require_once __DIR__ . '/../config/r2.php';
require_once __DIR__ . '/../config/supabase.php';

// Aplicar seguridad CORS y limitación de tasa
aplicarCors();
aplicarRateLimit();

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido. Utilice POST multipart/form-data.'
    ]);
    exit;
}

// 1. Validar que se haya enviado el archivo
if (!isset($_FILES['imagen']) || $_FILES['imagen']['error'] !== UPLOAD_ERR_OK) {
    $code = isset($_FILES['imagen']['error']) ? $_FILES['imagen']['error'] : 'no_file';
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => "No se recibió ninguna imagen o ocurrió un error en la carga (Código: {$code})."
    ]);
    exit;
}

$file = $_FILES['imagen'];
$fileTmpPath = $file['tmp_name'];
$fileSize = $file['size'];
$originalName = $file['name'];

// 2. Validar tamaño máximo (12 Megabytes)
$maxBytes = 12 * 1024 * 1024;
if ($fileSize > $maxBytes) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'El archivo supera el tamaño máximo permitido de 12 MB.'
    ]);
    exit;
}

// 3. Validar tipo MIME real
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $fileTmpPath);
finfo_close($finfo);

$allowedMimes = [
    'image/jpeg' => 'jpg',
    'image/png'  => 'png',
    'image/webp' => 'webp',
    'image/gif'  => 'gif',
    'image/avif' => 'avif'
];

if (!array_key_exists($mimeType, $allowedMimes)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => "Formato de archivo no admitido ({$mimeType}). Solo se permiten JPG, PNG, WebP, GIF y AVIF."
    ]);
    exit;
}

$ext = $allowedMimes[$mimeType];

// 4. Parámetros de formulario sanitizados
$tituloForm = isset($_POST['titulo']) ? sanitizarTexto($_POST['titulo']) : '';
$categoria  = isset($_POST['categoria']) ? sanitizarTexto($_POST['categoria']) : 'general';
$creadoPor  = isset($_POST['creado_por']) ? sanitizarUUID($_POST['creado_por']) : null;

// Categorías válidas
$categoriasValidas = ['paquetes', 'destinos', 'cms', 'general'];
if (!in_array($categoria, $categoriasValidas)) {
    $categoria = 'general';
}

// Limpiar título o nombre base
$pathInfo = pathinfo($originalName);
$baseName = preg_replace('/[^a-zA-Z0-9_-]/', '_', strtolower($pathInfo['filename']));
if (empty($baseName)) {
    $baseName = 'foto';
}
$tituloFinal = !empty($tituloForm) ? $tituloForm : ucfirst(str_replace('_', ' ', $baseName));

// 5. Generar Key única en Cloudflare R2
$randomId = bin2hex(random_bytes(4));
$timestamp = time();
$r2Key = "galeria/{$categoria}/{$baseName}_{$timestamp}_{$randomId}.{$ext}";

// 6. Leer contenido binario y subir a Cloudflare R2
$binaryContent = file_get_contents($fileTmpPath);
if ($binaryContent === false) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'No se pudo leer el archivo temporal en el servidor.'
    ]);
    exit;
}

$resultadoR2 = subirObjetoR2($binaryContent, $r2Key, $mimeType);

if (!$resultadoR2['success']) {
    http_response_code(502);
    echo json_encode([
        'success' => false,
        'message' => 'Error al comunicarse con Cloudflare R2: ' . ($resultadoR2['error'] ?? 'Fallo desconocido'),
        'details' => $resultadoR2
    ]);
    exit;
}

$publicUrl = $resultadoR2['public_url'];

// 7. Registrar en Supabase public.imagenes_galeria
$registroBD = [
    'titulo'     => $tituloFinal,
    'url'        => $publicUrl,
    'r2_key'     => $r2Key,
    'origen'     => 'cloudflare_r2',
    'categoria'  => $categoria,
    'bytes'      => $fileSize,
    'tipo_mime'  => $mimeType,
    'creado_por' => $creadoPor
];

$insertResult = insertSupabaseTable('imagenes_galeria', $registroBD);
$datosInsertados = ($insertResult['status'] === 201 && !empty($insertResult['data'])) 
    ? (is_array($insertResult['data']) && isset($insertResult['data'][0]) ? $insertResult['data'][0] : $insertResult['data'])
    : null;

// 8. Responder exitosamente
http_response_code(200);
echo json_encode([
    'success' => true,
    'message' => '¡Imagen subida exitosamente a Cloudflare R2!',
    'url' => $publicUrl,
    'r2_key' => $r2Key,
    'data' => [
        'id'        => $datosInsertados['id'] ?? null,
        'titulo'    => $tituloFinal,
        'url'       => $publicUrl,
        'r2_key'    => $r2Key,
        'origen'    => 'cloudflare_r2',
        'categoria' => $categoria,
        'bytes'     => $fileSize,
        'tipo_mime' => $mimeType
    ]
]);
