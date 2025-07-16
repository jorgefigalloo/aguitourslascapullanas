<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Rutas corregidas para PHPMailer
require __DIR__ . '/PHPMailer-master/src/Exception.php';
require __DIR__ . '/PHPMailer-master/src/PHPMailer.php';
require __DIR__ . '/PHPMailer-master/src/SMTP.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nombre = htmlspecialchars($_POST['nombre']);
    $email = htmlspecialchars($_POST['email']);
    $mensaje = htmlspecialchars($_POST['mensaje']);

    $mail = new PHPMailer(true);

    try {
        // Configuración del servidor SMTP usando variables de entorno
        $mail->isSMTP();
        $mail->Host = getenv('SMTP_HOST') ?: 'smtp.gmail.com'; // Por si no está la variable, usa Gmail por defecto
        $mail->SMTPAuth = true;
        $mail->Username = getenv('SMTP_USERNAME'); // Variable de entorno
        $mail->Password = getenv('SMTP_PASSWORD'); // Variable de entorno
        $mail->SMTPSecure = getenv('SMTP_SECURE') ?: 'ssl'; // Variable de entorno o default
        $mail->Port = getenv('SMTP_PORT') ?: 465; // Variable de entorno o default

        $mail->setFrom(getenv('SMTP_USERNAME'), 'Agencia de Viajes Aguitours'); // Usar el mismo correo de autenticación como remitente
        $mail->addAddress('aguitourslascapullanas@hotmail.com'); // Dirección de la empresa
        $mail->addAddress('jovitamestaz69@gmail.com'); // Dirección de la gerente
        $mail->addAddress('figallojorge@gmail.com'); // Dirección de la gerente

        $mail->addReplyTo($email, $nombre);

        $mail->isHTML(false);
        $mail->Subject = 'Nuevo mensaje de contacto desde la página web';
        $mail->Body = "Nombre: $nombre\nEmail: $email\nMensaje:\n$mensaje";

        $mail->send();

        header("Location: ../contacto.php?status=success");
        exit();
    } catch (Exception $e) {
        // Para depuración, puedes loggear esto en Vercel
        error_log("Error al enviar el correo: " . $mail->ErrorInfo);
        // Puedes ver este error en los logs de ejecución de Vercel
        // echo "Error al enviar el correo: {$mail->ErrorInfo}"; // Quitar esto en producción
        header("Location: ../contacto.php?status=error");
        exit();
    }
}
?>