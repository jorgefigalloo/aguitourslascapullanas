<?php
/**
 * AGUITOURS LAS CAPULLANAS - MIDDLEWARE DE RATE LIMITING
 * Limita la cantidad de peticiones por dirección IP en un intervalo de tiempo.
 */

require_once __DIR__ . '/../config/env.php';

function aplicarRateLimit() {
    $maxRequests = (int) env('RATE_LIMIT_REQUESTS', 60);
    $windowSeconds = (int) env('RATE_LIMIT_WINDOW_SECONDS', 60);

    $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
    $storageDir = sys_get_temp_dir() . '/rate_limits_aguitours/';

    if (!is_dir($storageDir)) {
        @mkdir($storageDir, 0777, true);
    }

    $filePath = $storageDir . md5($ip) . '.json';
    $currentTime = time();

    $data = [
        'first_request' => $currentTime,
        'requests' => 0
    ];

    if (file_exists($filePath)) {
        $content = @file_get_contents($filePath);
        if ($content) {
            $parsed = json_decode($content, true);
            if (is_array($parsed)) {
                $data = $parsed;
            }
        }
    }

    // Resetear contador si la ventana de tiempo ha expirado
    if (($currentTime - $data['first_request']) > $windowSeconds) {
        $data['first_request'] = $currentTime;
        $data['requests'] = 1;
    } else {
        $data['requests']++;
    }

    @file_put_contents($filePath, json_encode($data));

    if ($data['requests'] > $maxRequests) {
        http_response_code(429);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'success' => false,
            'message' => 'Has superado el límite de peticiones autorizadas por minuto. Por favor intenta más tarde.'
        ]);
        exit;
    }
}
