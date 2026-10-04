<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
function getCsrfToken() {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        $_SESSION['csrf_token_time'] = time();
    }
    return $_SESSION['csrf_token'];
}
function getCsrfInputField() {
    $token = htmlspecialchars(getCsrfToken(), ENT_QUOTES, 'UTF-8');
    return '<input type="hidden" name="csrf_token" id="csrf_token" value="' . $token . '">';
}
function validateCsrfToken($submittedToken, $maxLifetimeSeconds = 7200) {
    if (empty($submittedToken) || empty($_SESSION['csrf_token'])) {
        return false;
    }
    if (!empty($_SESSION['csrf_token_time'])) {
        if ((time() - $_SESSION['csrf_token_time']) > $maxLifetimeSeconds) {
            return false;
        }
    }
    return hash_equals($_SESSION['csrf_token'], $submittedToken);
}
function regenerateCsrfToken() {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    $_SESSION['csrf_token_time'] = time();
}
?>
