<?php
// Configuración de Supabase cargando desde .env
require_once __DIR__ . '/env.php';

define('SUPABASE_URL', env('SUPABASE_URL', 'https://qmwukfmieqoqydgrrbct.supabase.co'));
define('SUPABASE_ANON_KEY', env('SUPABASE_ANON_KEY', ''));
define('SUPABASE_SERVICE_ROLE_KEY', env('SUPABASE_SERVICE_ROLE_KEY', ''));

/**
 * Función auxiliar para realizar llamadas a la API REST / RPC de Supabase desde PHP
 */
function callSupabaseRPC($functionName, $params = [], $bearerToken = null) {
    $url = SUPABASE_URL . '/rest/v1/rpc/' . $functionName;
    
    $headers = [
        'Content-Type: application/json',
        'apikey: ' . SUPABASE_ANON_KEY
    ];

    if ($bearerToken) {
        $headers[] = 'Authorization: Bearer ' . $bearerToken;
    } else {
        $headers[] = 'Authorization: Bearer ' . SUPABASE_ANON_KEY;
    }

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($params));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return [
        'status' => $httpCode,
        'data' => json_decode($response, true)
    ];
}
