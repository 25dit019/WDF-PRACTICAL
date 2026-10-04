<?php
require_once 'csrf.php';
$dataDir = __DIR__ . '/data';
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0777, true);
}
$csvFile = $dataDir . '/contacts.csv';
$jsonFile = $dataDir . '/contacts.json';
$isAjax = (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest')
       || (!empty($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false);
$errors = [];
$sanitized = [];
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    $msg = 'Method Not Allowed. Contact form requires HTTP POST submission.';
    if ($isAjax) {
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => $msg]);
        exit;
    } else {
        renderContactHtmlResponse(false, 'Invalid Request', [$msg], []);
        exit;
    }
}
$submittedCsrf = $_POST['csrf_token'] ?? '';
if (!validateCsrfToken($submittedCsrf)) {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    } else {
        $errors['csrf'] = 'Security validation failed: Invalid or expired CSRF token.';
    }
}
$rawName = $_POST['name'] ?? '';
$sanitizedName = htmlspecialchars(trim(stripslashes($rawName)), ENT_QUOTES, 'UTF-8');
if (empty($sanitizedName)) {
    $errors['name'] = 'Name is required.';
} elseif (strlen($sanitizedName) < 2) {
    $errors['name'] = 'Name must be at least 2 characters long.';
}
$sanitized['name'] = $sanitizedName;
$rawEmail = $_POST['email'] ?? '';
$sanitizedEmail = filter_var(trim($rawEmail), FILTER_SANITIZE_EMAIL);
if (empty($sanitizedEmail)) {
    $errors['email'] = 'Email is required.';
} elseif (!filter_var($sanitizedEmail, FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'Invalid email address format.';
}
$sanitized['email'] = $sanitizedEmail;
$rawMessage = $_POST['message'] ?? '';
$sanitizedMessage = htmlspecialchars(trim(stripslashes($rawMessage)), ENT_QUOTES, 'UTF-8');
if (empty($sanitizedMessage)) {
    $errors['message'] = 'Message is required.';
} elseif (strlen($sanitizedMessage) < 5) {
    $errors['message'] = 'Message must be at least 5 characters in length.';
}
$sanitized['message'] = $sanitizedMessage;
$timestamp = date('Y-m-d H:i:s');
$clientIp = $_SERVER['REMOTE_ADDR'] ?? 'Unknown';
$ticketId = 'TICK-' . time() . '-' . rand(100, 999);
$record = [
    'ticket_id' => $ticketId,
    'timestamp' => $timestamp,
    'name' => $sanitized['name'],
    'email' => $sanitized['email'],
    'message' => $sanitized['message'],
    'ip_address' => $clientIp
];
if (!empty($errors)) {
    http_response_code(422);
    if ($isAjax) {
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'message' => 'Validation failed on contact form.',
            'errors' => $errors
        ]);
        exit;
    } else {
        renderContactHtmlResponse(false, 'Submission Failed', $errors, $sanitized);
        exit;
    }
}
$csvSuccess = false;
$csvFileExists = file_exists($csvFile) && filesize($csvFile) > 0;
$csvFp = fopen($csvFile, 'a');
if ($csvFp) {
    if (flock($csvFp, LOCK_EX)) {
        if (!$csvFileExists) {
            fputcsv($csvFp, ['Ticket ID', 'Timestamp', 'Name', 'Email', 'Message', 'IP Address']);
        }
        fputcsv($csvFp, [
            $record['ticket_id'],
            $record['timestamp'],
            $record['name'],
            $record['email'],
            $record['message'],
            $record['ip_address']
        ]);
        fflush($csvFp);
        flock($csvFp, LOCK_UN);
        $csvSuccess = true;
    }
    fclose($csvFp);
}
$jsonSuccess = false;
$existingRecords = [];
if (file_exists($jsonFile)) {
    $rawJson = file_get_contents($jsonFile);
    if (!empty($rawJson)) {
        $decoded = json_decode($rawJson, true);
        if (is_array($decoded)) {
            $existingRecords = $decoded;
        }
    }
}
$existingRecords[] = $record;
$encodedJson = json_encode($existingRecords, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
if (file_put_contents($jsonFile, $encodedJson, LOCK_EX) !== false) {
    $jsonSuccess = true;
}
regenerateCsrfToken();
if ($isAjax) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => true,
        'message' => 'Contact inquiry received and safely logged to CSV/JSON files.',
        'storage' => [
            'csv_saved' => $csvSuccess,
            'json_saved' => $jsonSuccess
        ],
        'record' => $record
    ]);
    exit;
} else {
    renderContactHtmlResponse(true, 'Message Received Successfully!', [], $record);
    exit;
}
function renderContactHtmlResponse($isSuccess, $title, $errors, $data) {
    ?>
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title><?php echo $title; ?> - StudentHub</title>
        <style>
            * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            body { background: 
            .response-card {
                max-width: 600px;
                margin: 20px auto;
                background: 
                border-radius: 12px;
                box-shadow: 0 4px 16px rgba(0,0,0,0.06);
                overflow: hidden;
                border: 1px solid 
            }
            .header-banner {
                padding: 24px;
                color: 
                background: <?php echo $isSuccess ? 'linear-gradient(135deg, #059669, #10b981)' : 'linear-gradient(135deg, #dc2626, #ef4444)'; ?>;
                text-align: center;
            }
            .header-banner h1 { margin: 0; font-size: 1.6rem; }
            .header-banner p { margin: 6px 0 0; opacity: 0.9; font-size: 0.95rem; }
            .card-body { padding: 28px; }
            .info-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            .info-table th, .info-table td { padding: 10px 14px; border-bottom: 1px solid 
            .info-table th { background: 
            .error-list { background: 
            .actions-row { display: flex; gap: 12px; margin-top: 24px; justify-content: center; flex-wrap: wrap; }
            .btn {
                padding: 10px 20px;
                border-radius: 8px;
                text-decoration: none;
                font-weight: 600;
                font-size: 0.9rem;
                display: inline-block;
                transition: all 0.2s;
            }
            .btn-primary { background: 
            .btn-primary:hover { background: 
            .btn-secondary { background: 
            .btn-secondary:hover { background: 
        </style>
    </head>
    <body>
    <div class="response-card">
        <div class="header-banner">
            <h1><?php echo $isSuccess ? '✅ ' . $title : '⚠️ ' . $title; ?></h1>
            <p><?php echo $isSuccess ? 'Thank you! Your message has been logged and the support team will follow up.' : 'Please fix the errors below.'; ?></p>
        </div>
        <div class="card-body">
            <?php if (!$isSuccess): ?>
                <div class="error-list">
                    <strong>Submission Errors:</strong>
                    <ul>
                        <?php foreach ($errors as $field => $err): ?>
                            <li><strong><?php echo ucfirst($field); ?>:</strong> <?php echo htmlspecialchars($err, ENT_QUOTES, 'UTF-8'); ?></li>
                        <?php endforeach; ?>
                    </ul>
                </div>
                <div class="actions-row">
                    <a href="javascript:history.back()" class="btn btn-secondary">◀ Go Back</a>
                    <a href="contact.html" class="btn btn-primary">Contact Form</a>
                </div>
            <?php else: ?>
                <table class="info-table">
                    <tr><th>Ticket ID</th><td><code><?php echo htmlspecialchars($data['ticket_id']); ?></code></td></tr>
                    <tr><th>Submitted At</th><td><?php echo htmlspecialchars($data['timestamp']); ?></td></tr>
                    <tr><th>Name</th><td><strong><?php echo htmlspecialchars($data['name']); ?></strong></td></tr>
                    <tr><th>Email</th><td><?php echo htmlspecialchars($data['email']); ?></td></tr>
                    <tr><th>Message</th><td><?php echo nl2br(htmlspecialchars($data['message'])); ?></td></tr>
                </table>
                <div class="actions-row">
                    <a href="view_records.php" class="btn btn-primary">📊 View Stored Records (P7)</a>
                    <a href="contact.html" class="btn btn-secondary">✉️ Send Another Message</a>
                    <a href="index.html" class="btn btn-secondary">🏠 Portal Home</a>
                </div>
            <?php endif; ?>
        </div>
    </div>
    </body>
    </html>
    <?php
}
?>
