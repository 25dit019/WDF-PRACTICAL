<?php
ob_start();
require_once 'db.php';
ob_end_clean();

$message = '';
$msgType = '';
$students = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['register_student'])) {
    $name   = trim($_POST['name'] ?? '');
    $email  = trim($_POST['email'] ?? '');
    $course = trim($_POST['course'] ?? '');
    $year   = trim($_POST['year'] ?? '');

    if (empty($name) || empty($email) || empty($course) || empty($year)) {
        $message = "All fields (Name, Email, Course, Year) are required.";
        $msgType = "error";
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $message = "Please enter a valid email address (e.g., student@charusat.edu.in).";
        $msgType = "error";
    } elseif (!ctype_digit($year) || (int)$year < 1 || (int)$year > 5) {
        $message = "Please enter a valid study year (1 to 4).";
        $msgType = "error";
    } elseif ($pdo === null) {
        $message = "Database connection error. Please ensure MySQL is running in XAMPP.";
        $msgType = "error";
    } else {
        try {
            $insertSql = "INSERT INTO students (name, email, course, year) VALUES (:name, :email, :course, :year)";
            $stmt = $pdo->prepare($insertSql);
            $stmt->execute([
                ':name'   => $name,
                ':email'  => $email,
                ':course' => $course,
                ':year'   => (int)$year
            ]);

            $newStudentId = $pdo->lastInsertId();
            $message = "Student '" . htmlspecialchars($name, ENT_QUOTES, 'UTF-8') . "' registered successfully! (Assigned Student ID: #" . $newStudentId . ")";
            $msgType = "success";

            $name = $email = $course = $year = '';
        } catch (PDOException $e) {
            $message = "Database Error while registering student: " . htmlspecialchars($e->getMessage(), ENT_QUOTES, 'UTF-8');
            $msgType = "error";
        }
    }
}

if ($pdo !== null) {
    try {
        $selectSql = "SELECT student_id, name, email, course, year FROM students ORDER BY student_id ASC";
        $stmt = $pdo->prepare($selectSql);
        $stmt->execute();
        $students = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        $message = "Unable to fetch student records: " . htmlspecialchars($e->getMessage(), ENT_QUOTES, 'UTF-8');
        $msgType = "error";
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Student Registration - Practical 8 - StudentHub</title>
    <link rel="stylesheet" href="p8_style.css">
</head>
<body>

    <header>
        <h1>StudentHub Portal</h1>
        <p>Practical 8: MySQL Database Integration with PDO &amp; Prepared Statements</p>
        <span class="sub-header-badge">Task 1: Student Registration &amp; Dynamic Records</span>
    </header>

    <nav>
        <a href="index.html" class="home">Home</a> |
        <a href="dashboard.html" class="dashboard">Dashboard</a> |
        <a href="events.html" class="events">Events (P6)</a> |
        <a href="students.html" class="students">Students (P6)</a> |
        <a href="register.php" class="register-p7">Register (P7 CSV/JSON)</a> |
        <a href="view_records.php" class="records">View Records (P7)</a> |
        <a href="p8_register.php" class="p8-btn p8-reg active">P8: Student Register (DB)</a> |
        <a href="p8_events.php" class="p8-btn p8-evt">P8: Events List (DB)</a> |
        <a href="p8_registrations.php" class="p8-btn p8-join">P8: Event Registrations (JOIN)</a>
    </nav>

    <main>
        <?php if ($pdo === null): ?>
            <div class="alert alert-error">
                <div>
                    <strong>Database Connection Notice:</strong> Could not connect to MySQL database <code>studenthub</code>.
                    <br>Please verify that <b>Apache</b> and <b>MySQL</b> are started in the <b>XAMPP Control Panel</b>, and that you have imported <code>database/studenthub.sql</code> into phpMyAdmin.
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
                <span>Register New Student</span>
                <span class="sub-header-badge" style="background:#e0f2fe; color:#0284c7; border:none;">PDO Prepared INSERT</span>
            </div>
            <p class="card-subtitle">Fill in the details below to insert a new student record into the MySQL <code>students</code> table.</p>

            <form action="p8_register.php" method="POST">
                <div class="form-grid">
                    <div class="form-group">
                        <label for="name">Student Full Name <span class="required">*</span></label>
                        <input type="text" id="name" name="name" class="input-field" 
                               placeholder="e.g. Parthrajsinh H. Gohil" 
                               value="<?php echo htmlspecialchars($name ?? '', ENT_QUOTES, 'UTF-8'); ?>" required>
                    </div>

                    <div class="form-group">
                        <label for="email">Student Email Address <span class="required">*</span></label>
                        <input type="email" id="email" name="email" class="input-field" 
                               placeholder="e.g. 25dit019@charusat.edu.in" 
                               value="<?php echo htmlspecialchars($email ?? '', ENT_QUOTES, 'UTF-8'); ?>" required>
                    </div>

                    <div class="form-group">
                        <label for="course">Academic Course / Program <span class="required">*</span></label>
                        <select id="course" name="course" class="select-field" required>
                            <option value="">-- Select Course --</option>
                            <option value="Information Technology" <?php echo (isset($course) && $course === 'Information Technology') ? 'selected' : ''; ?>>Information Technology</option>
                            <option value="Computer Science & Engineering" <?php echo (isset($course) && $course === 'Computer Science & Engineering') ? 'selected' : ''; ?>>Computer Science & Engineering</option>
                            <option value="Computer Engineering" <?php echo (isset($course) && $course === 'Computer Engineering') ? 'selected' : ''; ?>>Computer Engineering</option>
                            <option value="Artificial Intelligence & ML" <?php echo (isset($course) && $course === 'Artificial Intelligence & ML') ? 'selected' : ''; ?>>Artificial Intelligence & ML</option>
                            <option value="Mechanical Engineering" <?php echo (isset($course) && $course === 'Mechanical Engineering') ? 'selected' : ''; ?>>Mechanical Engineering</option>
                            <option value="Civil Engineering" <?php echo (isset($course) && $course === 'Civil Engineering') ? 'selected' : ''; ?>>Civil Engineering</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="year">Year of Study <span class="required">*</span></label>
                        <select id="year" name="year" class="select-field" required>
                            <option value="">-- Select Year --</option>
                            <option value="1" <?php echo (isset($year) && $year === '1') ? 'selected' : ''; ?>>1st Year</option>
                            <option value="2" <?php echo (isset($year) && $year === '2') ? 'selected' : ''; ?>>2nd Year</option>
                            <option value="3" <?php echo (isset($year) && $year === '3') ? 'selected' : ''; ?>>3rd Year</option>
                            <option value="4" <?php echo (isset($year) && $year === '4') ? 'selected' : ''; ?>>4th Year</option>
                        </select>
                    </div>
                </div>

                <div style="margin-top: 20px; display: flex; gap: 12px; align-items: center;">
                    <button type="submit" name="register_student" class="btn-primary">
                        <span>&#43;</span> Register Student
                    </button>
                    <a href="p8_registrations.php" class="btn-primary btn-accent">
                        <span>&#128197;</span> Go to Event Registrations &rarr;
                    </a>
                </div>
            </form>
        </section>

        <section class="card">
            <div class="card-title">
                <span>Registered Students in Database</span>
                <span class="counter-badge"><?php echo count($students); ?> Total Students</span>
            </div>
            <p class="card-subtitle">Retrieved dynamically from MySQL table <code>students</code> using a PDO prepared <code>SELECT</code> query.</p>

            <?php if (!empty($students)): ?>
                <div class="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 100px;">Student ID</th>
                                <th>Full Name</th>
                                <th>Email</th>
                                <th>Course</th>
                                <th style="text-align: center; width: 110px;">Year</th>
                                <th style="text-align: center; width: 140px;">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($students as $row): ?>
                                <tr>
                                    <td>
                                        <span class="badge badge-blue">#<?php echo htmlspecialchars($row['student_id'], ENT_QUOTES, 'UTF-8'); ?></span>
                                    </td>
                                    <td>
                                        <strong><?php echo htmlspecialchars($row['name'], ENT_QUOTES, 'UTF-8'); ?></strong>
                                    </td>
                                    <td>
                                        <code><?php echo htmlspecialchars($row['email'], ENT_QUOTES, 'UTF-8'); ?></code>
                                    </td>
                                    <td>
                                        <span class="badge badge-green"><?php echo htmlspecialchars($row['course'], ENT_QUOTES, 'UTF-8'); ?></span>
                                    </td>
                                    <td style="text-align: center;">
                                        <span class="badge badge-amber"><?php echo htmlspecialchars($row['year'], ENT_QUOTES, 'UTF-8'); ?> Year</span>
                                    </td>
                                    <td style="text-align: center;">
                                        <a href="p8_registrations.php?student_id=<?php echo urlencode($row['student_id']); ?>" class="btn-primary btn-accent btn-sm" title="Register this student for an event">
                                            Register Event
                                        </a>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            <?php else: ?>
                <div class="empty-state">
                    <p>No student records found in the database table <code>students</code>.</p>
                    <p style="font-size: 0.85rem;">Use the form above to add your first student record or import <code>database/studenthub.sql</code>.</p>
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
