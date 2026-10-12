<?php
/**
 * AGUITOURS LAS CAPULLANAS - ENDPOINT PARA ELIMINAR IMAGEN DE CLOUDFLARE R2
 */

require_once __DIR__ . '/../middleware/cors.php';
require_once __DIR__ . '/../middleware/rate_limit.php';
require_once __DIR__ . '/../middleware/sanitizer.php';
require_once __DIR__ . '/../config/r2.php';
require_once __DIR__ . '/../config/supabase.php';

aplicarCors();
aplicarRateLimit();

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido.']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
$r2Key = isset($input['r2_key']) ? trim($input['r2_key']) : '';
$imagenId = isset($input['id']) ? sanitizarUUID($input['id']) : null;

if (!$r2Key && !$imagenId) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Parámetros insuficientes (r2_key o id requerido).']);
    exit;
}

// 1. Eliminar de Cloudflare R2 si tiene r2_key
$r2Eliminado = true;
if ($r2Key) {
    $r2Eliminado = eliminarObjetoR2($r2Key);
}

// 2. Eliminar de la base de datos Supabase
if ($imagenId) {
    $url = SUPABASE_URL . '/rest/v1/imagenes_galeria?id=eq.' . $imagenId;
    $serviceKey = SUPABASE_SERVICE_ROLE_KEY ?: SUPABASE_ANON_KEY;

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'apikey: ' . SUPABASE_ANON_KEY,
        'Authorization: Bearer ' . $serviceKey
    ]);
    curl_exec($ch);
    curl_close($ch);
}

echo json_encode([
    'success' => true,
    'message' => 'Imagen eliminada correctamente.',
    'r2_eliminado' => $r2Eliminado
]);
