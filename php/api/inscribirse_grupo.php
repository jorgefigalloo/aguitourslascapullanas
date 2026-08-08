<?php
// Endpoint Seguro para Inscripción a Paquetes Grupales
require_once __DIR__ . '/../middleware/cors.php';
require_once __DIR__ . '/../middleware/rate_limit.php';
require_once __DIR__ . '/../middleware/sanitizer.php';
require_once __DIR__ . '/../config/supabase.php';
require_once __DIR__ . '/../config/smtp.php';

// 1. Aplicar Seguridad CORS y Rate Limiting
aplicarCors();
aplicarRateLimit();

header('Content-Type: application/json; charset=utf-8');

$input = json_decode(file_get_contents('php://input'), true) ?? [];

// 2. Sanitizar Entradas
$usuario_id     = sanitizarUUID($input['usuario_id'] ?? '');
$paquete_id     = sanitizarUUID($input['paquete_id'] ?? '');
$notas          = sanitizarTexto($input['notas'] ?? '');
$access_token   = $input['access_token'] ?? null;
$user_email     = sanitizarEmail($input['user_email'] ?? '');
$user_nombre    = sanitizarTexto($input['user_nombre'] ?? 'Viajero');
$paquete_titulo = sanitizarTexto($input['paquete_titulo'] ?? 'Paquete Grupal');

if (!$usuario_id || !$paquete_id) {
    echo json_encode([
        'success' => false,
        'message' => 'Parámetros o formato de UUID inválido.'
    ]);
    exit;
}

// 3. Invocar la función almacenada atómica de Postgres en Supabase
$rpcResult = callSupabaseRPC('inscribir_usuario_paquete', [
    'p_usuario_id' => $usuario_id,
    'p_paquete_id' => $paquete_id,
    'p_notas'      => $notas
], $access_token);

if ($rpcResult['status'] === 200 && isset($rpcResult['data']['success']) && $rpcResult['data']['success']) {
    
    // 4. Disparar correo electrónico de confirmación vía PHPMailer SMTP
    if ($user_email) {
        $asunto = "¡Confirmación de inscripción en " . $paquete_titulo . "!";
        
        $cuerpoHTML = "
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e0e0e0; overflow: hidden;'>
            <div style='background: linear-gradient(135deg, #0d5c75, #1995ad); color: white; padding: 25px; text-align: center;'>
                <h1 style='margin: 0; font-size: 24px;'>¡Bienvenido a la aventura, {$user_nombre}! 🎉</h1>
                <p style='margin-top: 8px; font-size: 15px; opacity: 0.9;'>Aguitours Las Capullanas</p>
            </div>
            <div style='padding: 30px; color: #333333;'>
                <p style='font-size: 16px; line-height: 1.5;'>Tu cupo en el viaje grupal <strong>{$paquete_titulo}</strong> ha sido reservado con éxito.</p>
                
                <div style='background-color: #f4f9fa; border-left: 4px solid #1995ad; padding: 15px; margin: 20px 0; border-radius: 4px;'>
                    <h3 style='margin: 0 0 10px 0; color: #0d5c75;'>Detalles de tu inscripción:</h3>
                    <p style='margin: 4px 0;'><strong>Viajero:</strong> {$user_nombre}</p>
                    <p style='margin: 4px 0;'><strong>Paquete:</strong> {$paquete_titulo}</p>
                    <p style='margin: 4px 0;'><strong>Estado:</strong> Confirmado</p>
                </div>

                <p style='font-size: 14px; color: #666666;'>Un asesor de nuestro equipo se pondrá en contacto contigo muy pronto para brindarte el itinerario detallado y coordinar las recomendaciones de viaje.</p>
            </div>
            <div style='background-color: #f1f1f1; color: #777777; text-align: center; padding: 15px; font-size: 12px;'>
                © " . date('Y') . " Aguitours Las Capullanas. Tu Agencia de Viajes Confiable.
            </div>
        </div>
        ";

        enviarCorreoConfirmacion($user_email, $user_nombre, $asunto, $cuerpoHTML);
    }

    echo json_encode([
        'success' => true,
        'message' => $rpcResult['data']['message'] ?? 'Inscripción realizada con éxito.',
        'inscripcion_id' => $rpcResult['data']['inscripcion_id'] ?? null
    ]);
} else {
    $msg = $rpcResult['data']['message'] ?? 'No se pudo completar la inscripción.';
    echo json_encode([
        'success' => false,
        'message' => $msg
    ]);
}
