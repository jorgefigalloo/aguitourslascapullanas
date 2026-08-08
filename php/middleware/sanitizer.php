<?php
/**
 * AGUITOURS LAS CAPULLANAS - HELPER DE SANITIZACIÓN DE ENTRADAS
 * Previene vulnerabilidades XSS e Inyecciones de Código en las peticiones.
 */

function sanitizarTexto($input) {
    if (is_null($input)) return '';
    if (is_array($input)) {
        return array_map('sanitizarTexto', $input);
    }
    $clean = trim($input);
    $clean = strip_tags($clean);
    $clean = htmlspecialchars($clean, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    return $clean;
}

function sanitizarEmail($email) {
    $clean = filter_var(trim($email), FILTER_SANITIZE_EMAIL);
    if (filter_var($clean, FILTER_VALIDATE_EMAIL)) {
        return strtolower($clean);
    }
    return null;
}

function sanitizarUUID($uuid) {
    if (preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', trim($uuid))) {
        return trim($uuid);
    }
    return null;
}
