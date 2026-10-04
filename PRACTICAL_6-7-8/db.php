<?php
$host = "localhost";
$dbname = "studenthub";
$username = "root";
$password = "";

$pdo = null;
$db_error = null;

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
        $username,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );

    $isDirectAccess = (isset($_SERVER['SCRIPT_FILENAME']) && realpath(__FILE__) === realpath($_SERVER['SCRIPT_FILENAME']))
                   || (isset($_SERVER['PHP_SELF']) && basename($_SERVER['PHP_SELF']) === 'db.php');

    if ($isDirectAccess) {
        header('Content-Type: text/html; charset=utf-8');
        echo "<!DOCTYPE html><html><head><title>Database Connection - StudentHub</title>";
        echo "<style>body{font-family:sans-serif;padding:30px;background:#f0f9ff;color:#0f172a;}";
        echo ".card{background:#fff;padding:24px;border-radius:10px;border:1px solid #7dd3fc;max-width:550px;margin:auto;box-shadow:0 4px 16px rgba(0,0,0,0.06);}";
        echo "h2{color:#0284c7;margin-top:0;}.success{color:#059669;font-weight:bold;}</style></head><body>";
        echo "<div class='card'>";
        echo "<h2>StudentHub Database Status</h2>";
        echo "<p class='success'>&#10004; Database connected successfully</p>";
        echo "<p>Host: <code>$host</code> | Database: <code>$dbname</code></p>";
        echo "<hr style='border:none;border-top:1px solid #e2e8f0;margin:15px 0;'>";
        echo "<p style='font-size:0.9rem;'><a href='p8_register.php'>&rarr; Go to Student Registration (P8)</a> | <a href='p8_events.php'>&rarr; View Events (P8)</a> | <a href='p8_registrations.php'>&rarr; View Registrations (P8)</a></p>";
        echo "</div></body></html>";
    }
} catch (PDOException $e) {
    $db_error = $e->getMessage();

    $isDirectAccess = (isset($_SERVER['SCRIPT_FILENAME']) && realpath(__FILE__) === realpath($_SERVER['SCRIPT_FILENAME']))
                   || (isset($_SERVER['PHP_SELF']) && basename($_SERVER['PHP_SELF']) === 'db.php');

    if ($isDirectAccess) {
        header('Content-Type: text/html; charset=utf-8');
        echo "<!DOCTYPE html><html><head><title>Database Connection Error - StudentHub</title>";
        echo "<style>body{font-family:sans-serif;padding:30px;background:#fff1f2;color:#9f1239;}";
        echo ".card{background:#fff;padding:24px;border-radius:10px;border:1px solid #fecdd3;max-width:550px;margin:auto;box-shadow:0 4px 16px rgba(0,0,0,0.06);}";
        echo "h2{color:#e11d48;margin-top:0;}</style></head><body>";
        echo "<div class='card'>";
        echo "<h2>Database connection failed</h2>";
        echo "<p>Error: " . htmlspecialchars($db_error, ENT_QUOTES, 'UTF-8') . "</p>";
        echo "<p>Please ensure:</p>";
        echo "<ol><li>MySQL service is running in <b>XAMPP Control Panel</b>.</li>";
        echo "<li>You have imported <code>database/studenthub.sql</code> into phpMyAdmin.</li></ol>";
        echo "</div></body></html>";
    }
}