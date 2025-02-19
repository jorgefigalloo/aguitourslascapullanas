<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer-master/src/Exception.php';
require 'PHPMailer-master/src/PHPMailer.php';
require 'PHPMailer-master/src/SMTP.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Recoger los datos del formulario
    $nombre = htmlspecialchars($_POST['nombre']);
    $email = htmlspecialchars($_POST['email']);
    $mensaje = htmlspecialchars($_POST['mensaje']);

    // Crear una instancia de PHPMailer
    $mail = new PHPMailer(true);

    try {
        // Configuración del servidor SMTP
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com'; // Servidor SMTP de Gmail
        $mail->SMTPAuth = true;
        $mail->Username = 'aguitourslascapullanas1@gmail.com'; // Tu correo (corregido)
        $mail->Password = 'krni rcnl megq qwaa'; // Contraseña de aplicación
        $mail->SMTPSecure = 'ssl'; // Seguridad SSL
        $mail->Port = 465; // Puerto SMTP seguro

        // Remitente y destinatarios
        $mail->setFrom('aguitourslascapullanas1@gmail.com', 'Agencia de Viajes'); // Usar el mismo correo autenticado
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

        // Redirigir con éxito
        header("Location: ../contacto.php?status=success");
        exit();
    } catch (Exception $e) {
        // Mostrar el mensaje de error detallado
        echo "Error al enviar el correo: {$mail->ErrorInfo}";
        header("Location: ../contacto.php?status=error");
        exit();
    }
}
?>