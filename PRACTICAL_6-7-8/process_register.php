<?php
require_once 'csrf.php';
$dataDir = __DIR__ . '/data';
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0777, true);
}
$csvFile = $dataDir . '/registrations.csv';
$jsonFile = $dataDir . '/registrations.json';
$isAjax = (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest')
       || (!empty($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false);
$errors = [];
$sanitized = [];
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    $msg = 'Method Not Allowed. This endpoint strictly accepts HTTP POST submissions.';
    if ($isAjax) {
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => $msg]);
        exit;
    } else {
        renderHtmlResponse(false, 'Invalid Request Method', [$msg], []);
        exit;
    }
}
$submittedCsrf = $_POST['csrf_token'] ?? '';
if (!validateCsrfToken($submittedCsrf)) {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    } else {
        $errors['csrf'] = 'Invalid or expired CSRF security token. Please refresh the page and try again.';
    }
}
$rawName = $_POST['fullname'] ?? '';
$sanitizedName = htmlspecialchars(trim(stripslashes($rawName)), ENT_QUOTES, 'UTF-8');
if (empty($sanitizedName)) {
    $errors['fullname'] = 'Full Name is required.';
} elseif (!preg_match("/^[a-zA-Z\s]{2,50}$/", $sanitizedName)) {
    $errors['fullname'] = 'Full Name must contain letters and spaces only (2 to 50 characters).';
}
$sanitized['fullname'] = $sanitizedName;
$rawEmail = $_POST['email'] ?? '';
$sanitizedEmail = filter_var(trim($rawEmail), FILTER_SANITIZE_EMAIL);
if (empty($sanitizedEmail)) {
    $errors['email'] = 'Email address is required.';
} elseif (!filter_var($sanitizedEmail, FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'Please provide a valid email format (e.g., student@charusat.edu.in).';
}
$sanitized['email'] = $sanitizedEmail;
$rawMobile = $_POST['mobile'] ?? '';
$sanitizedMobile = trim($rawMobile);
if (empty($sanitizedMobile)) {
    $errors['mobile'] = 'Mobile number is required.';
} elseif (!preg_match("/^[6-9]\d{9}$/", $sanitizedMobile)) {
    $errors['mobile'] = 'Mobile number must be a valid 10-digit number starting with 6, 7, 8, or 9.';
}
$sanitized['mobile'] = $sanitizedMobile;
$rawPassword = $_POST['password'] ?? '';
$rawConfirmPassword = $_POST['confirmpassword'] ?? '';
if (empty($rawPassword)) {
    $errors['password'] = 'Password is required.';
} elseif (strlen($rawPassword) < 6 || !preg_match("/[0-9]/", $rawPassword) || !preg_match("/[a-zA-Z]/", $rawPassword)) {
    $errors['password'] = 'Password must be at least 6 characters and contain both letters and digits.';
} elseif ($rawPassword !== $rawConfirmPassword) {
    $errors['confirmpassword'] = 'Password confirmation does not match.';
}
$allowedCourses = [
    'Information Technology',
    'Computer Engineering',
    'Computer Science',
    'AI & Machine Learning',
    'Data Science'
];
$rawCourse = $_POST['course'] ?? '';
if (empty($rawCourse) || !in_array($rawCourse, $allowedCourses)) {
    $errors['course'] = 'Please select a valid recognized course from the dropdown.';
}
$sanitized['course'] = htmlspecialchars($rawCourse, ENT_QUOTES, 'UTF-8');
$allowedYears = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
$rawYear = $_POST['year'] ?? '';
if (empty($rawYear) || !in_array($rawYear, $allowedYears)) {
    $errors['year'] = 'Please choose a valid academic year.';
}
$sanitized['year'] = htmlspecialchars($rawYear, ENT_QUOTES, 'UTF-8');
$allowedGenders = ['Male', 'Female', 'Other'];
$rawGender = $_POST['gender'] ?? '';
if (empty($rawGender) || !in_array($rawGender, $allowedGenders)) {
    $errors['gender'] = 'Please select a valid gender option.';
}
$sanitized['gender'] = htmlspecialchars($rawGender, ENT_QUOTES, 'UTF-8');
if (!isset($_POST['terms']) || ($_POST['terms'] !== 'on' && $_POST['terms'] !== '1' && $_POST['terms'] !== true)) {
    $errors['terms'] = 'You must accept the terms and conditions to proceed.';
}
$timestamp = date('Y-m-d H:i:s');
$clientIp = $_SERVER['REMOTE_ADDR'] ?? 'Unknown';
$recordId = 'REG-' . time() . '-' . rand(100, 999);
$record = [
    'id' => $recordId,
    'timestamp' => $timestamp,
    'fullname' => $sanitized['fullname'],
    'email' => $sanitized['email'],
    'mobile' => $sanitized['mobile'],
    'course' => $sanitized['course'],
    'year' => $sanitized['year'],
    'gender' => $sanitized['gender'],
    'ip_address' => $clientIp
];
if (!empty($errors)) {
    http_response_code(422); 
    if ($isAjax) {
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'message' => 'Server-side validation failed. Please correct the highlighted errors.',
            'errors' => $errors
        ]);
        exit;
    } else {
        renderHtmlResponse(false, 'Validation Failed', $errors, $sanitized);
        exit;
    }
}
$csvSuccess = false;
$csvFileExists = file_exists($csvFile) && filesize($csvFile) > 0;
$csvFp = fopen($csvFile, 'a');
if ($csvFp) {
    if (flock($csvFp, LOCK_EX)) {
        if (!$csvFileExists) {
            fputcsv($csvFp, ['ID', 'Timestamp', 'Full Name', 'Email', 'Mobile', 'Course', 'Year', 'Gender', 'IP Address']);
        }
        fputcsv($csvFp, [
            $record['id'],
            $record['timestamp'],
            $record['fullname'],
            $record['email'],
            $record['mobile'],
            $record['course'],
            $record['year'],
            $record['gender'],
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
        'message' => 'Registration data successfully validated and saved to server storage.',
        'storage' => [
            'csv_saved' => $csvSuccess,
            'json_saved' => $jsonSuccess,
            'csv_path' => 'data/registrations.csv',
            'json_path' => 'data/registrations.json'
        ],
        'record' => $record
    ]);
    exit;
} else {
    renderHtmlResponse(true, 'Registration Successful!', [], $record);
    exit;
}
function renderHtmlResponse($isSuccess, $title, $errors, $data) {
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
                max-width: 650px;
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
            .error-list ul { margin: 8px 0 0; padding-left: 20px; }
            .storage-badge {
                display: inline-block;
                padding: 4px 10px;
                border-radius: 6px;
                font-size: 0.8rem;
                font-weight: 600;
                background: 
                color: 
                margin-right: 6px;
            }
            .actions-row {
                display: flex;
                gap: 12px;
                margin-top: 24px;
                justify-content: center;
                flex-wrap: wrap;
            }
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
            <p><?php echo $isSuccess ? 'Your registration has been securely processed and stored on the server.' : 'Please address the validation errors below to submit.'; ?></p>
        </div>
        <div class="card-body">
            <?php if (!$isSuccess): ?>
                <div class="error-list">
                    <strong>The following validation errors occurred:</strong>
                    <ul>
                        <?php foreach ($errors as $field => $err): ?>
                            <li><strong><?php echo ucfirst($field); ?>:</strong> <?php echo htmlspecialchars($err, ENT_QUOTES, 'UTF-8'); ?></li>
                        <?php endforeach; ?>
                    </ul>
                </div>
                <div class="actions-row">
                    <a href="javascript:history.back()" class="btn btn-secondary">◀ Go Back & Correct Form</a>
                    <a href="register.html" class="btn btn-primary">Start New Registration</a>
                </div>
            <?php else: ?>
                <div style="margin-bottom: 16px;">
                    <span class="storage-badge">📁 Saved to CSV (data/registrations.csv)</span>
                    <span class="storage-badge">💾 Saved to JSON (data/registrations.json)</span>
                </div>
                <table class="info-table">
                    <tr><th>Reference ID</th><td><code><?php echo htmlspecialchars($data['id']); ?></code></td></tr>
                    <tr><th>Submission Time</th><td><?php echo htmlspecialchars($data['timestamp']); ?></td></tr>
                    <tr><th>Full Name</th><td><strong><?php echo htmlspecialchars($data['fullname']); ?></strong></td></tr>
                    <tr><th>Email Address</th><td><?php echo htmlspecialchars($data['email']); ?></td></tr>
                    <tr><th>Mobile Number</th><td><?php echo htmlspecialchars($data['mobile']); ?></td></tr>
                    <tr><th>Course Program</th><td><?php echo htmlspecialchars($data['course']); ?></td></tr>
                    <tr><th>Academic Year</th><td><?php echo htmlspecialchars($data['year']); ?></td></tr>
                    <tr><th>Gender</th><td><?php echo htmlspecialchars($data['gender']); ?></td></tr>
                    <tr><th>Client IP</th><td><?php echo htmlspecialchars($data['ip_address']); ?></td></tr>
                </table>
                <div class="actions-row">
                    <a href="view_records.php" class="btn btn-primary">📊 View Stored Records (P7)</a>
                    <a href="register.html" class="btn btn-secondary">➕ Register Another Student</a>
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
