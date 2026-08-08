<?php
// Configuración SMTP para PHPMailer en Aguitours Las Capullanas

define('SMTP_HOST', 'smtp.gmail.com'); // Cambiar por tu servidor SMTP de preferencia (ej. Gmail, cPanel)
define('SMTP_PORT', 587); // 587 para TLS / 465 para SSL
define('SMTP_USER', 'tu-correo@gmail.com'); // Tu dirección de correo
define('SMTP_PASS', 'tu-contraseña-o-app-password'); // Tu contraseña o contraseña de aplicación
define('SMTP_FROM_EMAIL', 'contacto@aguitourslascapullanas.com');
define('SMTP_FROM_NAME', 'Aguitours Las Capullanas');

/**
 * Función para enviar correo mediante PHPMailer
 */
function enviarCorreoConfirmacion($destinatarioEmail, $destinatarioNombre, $asunto, $cuerpoHTML) {
    // Si PHPMailer está en includes/PHPMailer-master/src/
    $basePath = __DIR__ . '/../../includes/PHPMailer-master/src/';
    
    if (!file_exists($basePath . 'PHPMailer.php')) {
        // Fallback usando mail() estándar de PHP si PHPMailer no está configurado aún
        $headers = "MIME-Version: 1.0" . "\r\n";
        $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
        $headers .= 'From: ' . SMTP_FROM_NAME . ' <' . SMTP_FROM_EMAIL . '>' . "\r\n";
        return @mail($destinatarioEmail, $asunto, $cuerpoHTML, $headers);
    }

    require_once $basePath . 'Exception.php';
    require_once $basePath . 'PHPMailer.php';
    require_once $basePath . 'SMTP.php';

    $mail = new PHPMailer\PHPMailer\PHPMailer(true);

    try {
        // Configuración del servidor
        $mail->isSMTP();
        $mail->Host       = SMTP_HOST;
        $mail->SMTPAuth   = true;
        $mail->Username   = SMTP_USER;
        $mail->Password   = SMTP_PASS;
        $mail->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = SMTP_PORT;
        $mail->CharSet    = 'UTF-8';

        // Destinatarios
        $mail->setFrom(SMTP_FROM_EMAIL, SMTP_FROM_NAME);
        $mail->addAddress($destinatarioEmail, $destinatarioNombre);

        // Contenido
        $mail->isHTML(true);
        $mail->Subject = $asunto;
        $mail->Body    = $cuerpoHTML;

        $mail->send();
        return true;
    } catch (Exception $e) {
        error_log("Error al enviar correo PHPMailer: {$mail->ErrorInfo}");
        return false;
    }
}
