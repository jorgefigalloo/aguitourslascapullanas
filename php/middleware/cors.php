<?php
/**
 * AGUITOURS LAS CAPULLANAS - MIDDLEWARE DE SEGURIDAD CORS
 * Restringe los orígenes permitidos para peticiones a la API backend.
 */

require_once __DIR__ . '/../config/env.php';

function aplicarCors() {
    $allowedOrigin = env('ALLOWED_ORIGIN', 'http://localhost');
    $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

    // Si el origen de la petición coincide o estamos en desarrollo
    if (strpos($origin, $allowedOrigin) !== false || $allowedOrigin === '*') {
        header("Access-Control-Allow-Origin: {$origin}");
    } else {
        header("Access-Control-Allow-Origin: {$allowedOrigin}");
    }

    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
}
