<?php
ob_start();
require_once 'db.php';
ob_end_clean();

$message = '';
$msgType = '';
$students = [];
$events = [];
$registrations = [];

$preSelectedStudent = $_GET['student_id'] ?? '';
$preSelectedEvent   = $_GET['event_id'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['register_event'])) {
    $student_id = trim($_POST['student_id'] ?? '');
    $event_id   = trim($_POST['event_id'] ?? '');

    if (empty($student_id) || empty($event_id)) {
        $message = "Please select both a Student and an Event to complete registration.";
        $msgType = "error";
    } elseif ($pdo === null) {
        $message = "Database connection error. Please ensure MySQL is running in XAMPP.";
        $msgType = "error";
    } else {
        try {
            $checkSql = "SELECT COUNT(*) FROM registrations WHERE student_id = :sid AND event_id = :eid";
            $checkStmt = $pdo->prepare($checkSql);
            $checkStmt->execute([':sid' => (int)$student_id, ':eid' => (int)$event_id]);
            $exists = $checkStmt->fetchColumn();

            if ($exists > 0) {
                $message = "Notice: This student is already registered for the selected event.";
                $msgType = "error";
            } else {
                $today = date('Y-m-d');
                $insertSql = "INSERT INTO registrations (student_id, event_id, registration_date) 
                              VALUES (:student_id, :event_id, :registration_date)";
                $stmt = $pdo->prepare($insertSql);
                $stmt->execute([
                    ':student_id'        => (int)$student_id,
                    ':event_id'          => (int)$event_id,
                    ':registration_date' => $today
                ]);

                $newRegId = $pdo->lastInsertId();
                $message = "Event registration successful! (Registration ID: #" . $newRegId . " on " . $today . ")";
                $msgType = "success";
            }
        } catch (PDOException $e) {
            $message = "Database Error during registration: " . htmlspecialchars($e->getMessage(), ENT_QUOTES, 'UTF-8');
            $msgType = "error";
        }
    }
}

if ($pdo !== null) {
    try {
        $stmtS = $pdo->prepare("SELECT student_id, name, email, course, year FROM students ORDER BY name ASC");
        $stmtS->execute();
        $students = $stmtS->fetchAll(PDO::FETCH_ASSOC);

        $stmtE = $pdo->prepare("SELECT event_id, title, event_date, venue FROM events ORDER BY event_date ASC");
        $stmtE->execute();
        $events = $stmtE->fetchAll(PDO::FETCH_ASSOC);

        $joinSql = "SELECT 
                        r.registration_id,
                        s.name AS student_name,
                        s.email AS student_email,
                        s.course,
                        e.title AS event_title,
                        e.event_date,
                        e.venue,
                        r.registration_date
                    FROM registrations r
                    INNER JOIN students s ON r.student_id = s.student_id
                    INNER JOIN events e ON r.event_id = e.event_id
                    ORDER BY r.registration_id DESC";
        $stmtJoin = $pdo->prepare($joinSql);
        $stmtJoin->execute();
        $registrations = $stmtJoin->fetchAll(PDO::FETCH_ASSOC);

    } catch (PDOException $e) {
        $message = "Error loading database records: " . htmlspecialchars($e->getMessage(), ENT_QUOTES, 'UTF-8');
        $msgType = "error";
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Event Registrations - Practical 8 - StudentHub</title>
    <link rel="stylesheet" href="p8_style.css">
</head>
<body>

    <header>
        <h1>StudentHub Portal</h1>
        <p>Practical 8: MySQL Database Integration with PDO &amp; Prepared Statements</p>
        <span class="sub-header-badge">Task 3: Event Registration &amp; Multi-Table SQL JOIN</span>
    </header>

    <nav>
        <a href="index.html" class="home">Home</a> |
        <a href="dashboard.html" class="dashboard">Dashboard</a> |
        <a href="events.html" class="events">Events (P6)</a> |
        <a href="students.html" class="students">Students (P6)</a> |
        <a href="register.php" class="register-p7">Register (P7 CSV/JSON)</a> |
        <a href="view_records.php" class="records">View Records (P7)</a> |
        <a href="p8_register.php" class="p8-btn p8-reg">P8: Student Register (DB)</a> |
        <a href="p8_events.php" class="p8-btn p8-evt">P8: Events List (DB)</a> |
        <a href="p8_registrations.php" class="p8-btn p8-join active">P8: Event Registrations (JOIN)</a>
    </nav>

    <main>
        <?php if ($pdo === null): ?>
            <div class="alert alert-error">
                <div>
                    <strong>Database Connection Notice:</strong> Could not connect to MySQL database <code>studenthub</code>.
                    <br>Please verify that <b>MySQL</b> is started in <b>XAMPP</b> and you have imported <code>database/studenthub.sql</code>.
                    <?php if (!empty($db_error)): ?>
                        <br><small style="opacity: 0.85;">Details: <?php echo htmlspecialchars($db_error, ENT_QUOTES, 'UTF-8'); ?></small>
                    <?php endif; ?>
                </div>
            </div>
        <?php endif; ?>

        <?php if (!empty($message)): ?>
            <div class="alert alert-<?php echo ($msgType === 'success') ? 'success' : 'error'; ?>">
                <div>
                    <?php echo ($msgType === 'success') ? '&#10004; ' : '&#9888; '; ?>
                    <?php echo $message; ?>
                </div>
            </div>
        <?php endif; ?>

        <section class="card">
            <div class="card-title">
                <span>Register Student for an Event</span>
                <span class="sub-header-badge" style="background:#f3e8ff; color:#7c3aed; border:none;">Foreign Key Association</span>
            </div>
            <p class="card-subtitle">
                Select a student from the <code>students</code> table and an event from the <code>events</code> table to create a linked registration record.
            </p>

            <form action="p8_registrations.php" method="POST">
                <div class="form-grid">
                    <div class="form-group">
                        <label for="student_id">Select Student <span class="required">*</span></label>
                        <select id="student_id" name="student_id" class="select-field" required>
                            <option value="">-- Choose Student (Loaded from MySQL) --</option>
                            <?php foreach ($students as $s): ?>
                                <?php $isSelected = ($preSelectedStudent == $s['student_id']) ? 'selected' : ''; ?>
                                <option value="<?php echo htmlspecialchars($s['student_id'], ENT_QUOTES, 'UTF-8'); ?>" <?php echo $isSelected; ?>>
                                    <?php echo htmlspecialchars($s['name'], ENT_QUOTES, 'UTF-8'); ?> 
                                    (ID: #<?php echo $s['student_id']; ?> | <?php echo htmlspecialchars($s['course'], ENT_QUOTES, 'UTF-8'); ?>)
                                </option>
                            <?php endforeach; ?>
                        </select>
                        <small style="color: var(--text-muted); font-size: 0.8rem;">
                            Need to register a new student? <a href="p8_register.php" style="color: var(--primary);">Add Student here</a>.
                        </small>
                    </div>

                    <div class="form-group">
                        <label for="event_id">Select Campus Event <span class="required">*</span></label>
                        <select id="event_id" name="event_id" class="select-field" required>
                            <option value="">-- Choose Event (Loaded from MySQL) --</option>
                            <?php foreach ($events as $e): ?>
                                <?php $isSelected = ($preSelectedEvent == $e['event_id']) ? 'selected' : ''; ?>
                                <option value="<?php echo htmlspecialchars($e['event_id'], ENT_QUOTES, 'UTF-8'); ?>" <?php echo $isSelected; ?>>
                                    <?php echo htmlspecialchars($e['title'], ENT_QUOTES, 'UTF-8'); ?> 
                                    (<?php echo date('M d, Y', strtotime($e['event_date'])); ?> | <?php echo htmlspecialchars($e['venue'], ENT_QUOTES, 'UTF-8'); ?>)
                                </option>
                            <?php endforeach; ?>
                        </select>
                        <small style="color: var(--text-muted); font-size: 0.8rem;">
                            View full event details on the <a href="p8_events.php" style="color: var(--accent);">Events List page</a>.
                        </small>
                    </div>
                </div>

                <div style="margin-top: 20px;">
                    <button type="submit" name="register_event" class="btn-primary btn-accent">
                        <span>&#9997;</span> Complete Registration
                    </button>
                </div>
            </form>
        </section>

        <section class="card" style="background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);">
            <div class="card-title">
                <span style="font-size: 1.15rem; color: #334155;">SQL JOIN Demonstration (Practical 8 Logic)</span>
                <span class="sub-header-badge" style="background:#e0e7ff; color:#4338ca; border:none;">INNER JOIN 3 Tables</span>
            </div>
            <p class="card-subtitle" style="margin-bottom: 10px;">
                The table below executes the following prepared <code>INNER JOIN</code> query to combine <code>registrations</code> with <code>students</code> and <code>events</code>:
            </p>
            <pre style="background:#0f172a; color:#f8fafc; padding:12px 16px; border-radius:8px; font-size:0.82rem; overflow-x:auto; line-height:1.45;">
SELECT 
    r.registration_id, s.name AS student_name, s.email AS student_email, s.course,
    e.title AS event_title, e.event_date, e.venue, r.registration_date
FROM registrations r
INNER JOIN students s ON r.student_id = s.student_id
INNER JOIN events e ON r.event_id = e.event_id
ORDER BY r.registration_id DESC;</pre>
        </section>

        <section class="card">
            <div class="card-title">
                <span>Event Registrations List (Multi-Table JOIN)</span>
                <span class="counter-badge"><?php echo count($registrations); ?> Total Registrations</span>
            </div>
            <p class="card-subtitle">
                Combines data from <code>registrations</code>, <code>students</code>, and <code>events</code> in real time via relational foreign keys.
            </p>

            <?php if (!empty($registrations)): ?>
                <div class="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 80px;">Reg ID</th>
                                <th>Student Name</th>
                                <th>Student Email</th>
                                <th>Course</th>
                                <th>Event Title</th>
                                <th style="width: 120px;">Event Date</th>
                                <th>Venue</th>
                                <th style="width: 130px; text-align: center;">Reg Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($registrations as $row): ?>
                                <tr>
                                    <td>
                                        <span class="badge badge-purple">#<?php echo htmlspecialchars($row['registration_id'], ENT_QUOTES, 'UTF-8'); ?></span>
                                    </td>
                                    <td>
                                        <strong><?php echo htmlspecialchars($row['student_name'], ENT_QUOTES, 'UTF-8'); ?></strong>
                                    </td>
                                    <td>
                                        <code><?php echo htmlspecialchars($row['student_email'], ENT_QUOTES, 'UTF-8'); ?></code>
                                    </td>
                                    <td>
                                        <span class="badge badge-green"><?php echo htmlspecialchars($row['course'], ENT_QUOTES, 'UTF-8'); ?></span>
                                    </td>
                                    <td>
                                        <strong style="color: var(--primary);"><?php echo htmlspecialchars($row['event_title'], ENT_QUOTES, 'UTF-8'); ?></strong>
                                    </td>
                                    <td>
                                        <span class="badge badge-blue"><?php echo htmlspecialchars($row['event_date'], ENT_QUOTES, 'UTF-8'); ?></span>
                                    </td>
                                    <td>
                                        <small><?php echo htmlspecialchars($row['venue'], ENT_QUOTES, 'UTF-8'); ?></small>
                                    </td>
                                    <td style="text-align: center;">
                                        <span class="badge badge-amber"><?php echo htmlspecialchars($row['registration_date'], ENT_QUOTES, 'UTF-8'); ?></span>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            <?php else: ?>
                <div class="empty-state">
                    <p>No event registrations found in the database.</p>
                    <p style="font-size: 0.85rem;">Use the form above to register a student for an event.</p>
                </div>
            <?php endif; ?>
        </section>
    </main>

    <footer>
        <p>&copy; 2026 StudentHub Portal | Web Development &amp; Frameworks (WDF) - Practical 8</p>
        <p style="margin-top: 6px; font-size: 0.8rem;">
            Prepared by <b>Parthrajsinh H. Gohil</b> (25DIT019) | Information Technology
        </p>
    </footer>

</body>
</html>
