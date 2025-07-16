<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Rutas de require ajustadas para ser relativas al directorio actual del archivo PHP
// __DIR__ asegura que siempre se encuentre la carpeta PHPMailer-master dentro de includes/
require __DIR__ . '/PHPMailer-master/src/Exception.php';
require __DIR__ . '/PHPMailer-master/src/PHPMailer.php';
require __DIR__ . '/PHPMailer-master/src/SMTP.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Recoger los datos del formulario
    $nombre = htmlspecialchars($_POST['nombre']);
    $email = htmlspecialchars($_POST['email']);
    $mensaje = htmlspecialchars($_POST['mensaje']);

    // Crear una instancia de PHPMailer
    $mail = new PHPMailer(true);

    try {
        // Configuración del servidor SMTP usando variables de entorno de Vercel
        $mail->isSMTP();
        // Uso de getenv() para obtener los valores de las variables de entorno
        // Los valores por defecto (ej. 'smtp.gmail.com') son un fallback si la variable no existe,
        // pero DEBES configurarlas en Vercel.
        $mail->Host = getenv('SMTP_HOST') ?: 'smtp.gmail.com'; 
        $mail->SMTPAuth = true;
        $mail->Username = getenv('SMTP_USERNAME'); // Tu correo para autenticación (variable de entorno)
        $mail->Password = getenv('SMTP_PASSWORD'); // Tu contraseña de aplicación de Gmail (variable de entorno)
        $mail->SMTPSecure = getenv('SMTP_SECURE') ?: 'ssl'; // Seguridad SSL/TLS (variable de entorno)
        $mail->Port = getenv('SMTP_PORT') ?: 465; // Puerto SMTP (variable de entorno)

        // Remitente y destinatarios
        // Se recomienda que setFrom use el mismo Username con el que te autenticas
        $mail->setFrom(getenv('SMTP_USERNAME'), 'Agencia de Viajes Aguitours'); 
        $mail->addAddress('aguitourslascapullanas@hotmail.com'); // Dirección de la empresa
        $mail->addAddress('jovitamestaz69@gmail.com'); // Dirección de la gerente
        $mail->addAddress('figallojorge@gmail.com'); // Dirección de la gerente

        // Agregar el correo del usuario como "Reply-To"
        $mail->addReplyTo($email, $nombre);

        // Contenido del correo
        $mail->isHTML(false); // Establecer a false para texto plano
        $mail->Subject = 'Nuevo mensaje de contacto desde la página web';
        $mail->Body = "Nombre: $nombre\nEmail: $email\nMensaje:\n$mensaje";

        // Enviar el correo
        $mail->send();

        // Redirigir con éxito. Ruta relativa al punto de acceso.
        // Si la URL que accede a enviar.php es /includes/enviar.php, entonces ../contacto.php es correcto.
        header("Location: ../contacto.php?status=success");
        exit();
    } catch (Exception $e) {
        // Loggear el error detallado para depuración en los logs de Vercel
        error_log("Error al enviar el correo: " . $mail->ErrorInfo); 
        // No mostrar el error directamente al usuario en producción, solo redirigir
        header("Location: ../contacto.php?status=error");
        exit();
    }
} else {
    // Si alguien intenta acceder a enviar.php directamente sin un POST
    header("Location: ../contacto.php"); // Redirigir de vuelta al formulario
    exit();
}
?>