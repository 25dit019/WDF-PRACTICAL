<?php
ob_start();
require_once 'db.php';
ob_end_clean();

$events = [];
$message = '';
$msgType = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['add_event'])) {
    $title       = trim($_POST['title'] ?? '');
    $description = trim($_POST['description'] ?? '');
    $event_date  = trim($_POST['event_date'] ?? '');
    $venue       = trim($_POST['venue'] ?? '');

    if (empty($title) || empty($event_date) || empty($venue)) {
        $message = "Event Title, Date, and Venue are required fields.";
        $msgType = "error";
    } elseif ($pdo === null) {
        $message = "Database connection error. Please ensure MySQL is running in XAMPP.";
        $msgType = "error";
    } else {
        try {
            $insertSql = "INSERT INTO events (title, description, event_date, venue) VALUES (:title, :description, :event_date, :venue)";
            $stmt = $pdo->prepare($insertSql);
            $stmt->execute([
                ':title'       => $title,
                ':description' => $description,
                ':event_date'  => $event_date,
                ':venue'       => $venue
            ]);
            $newEventId = $pdo->lastInsertId();
            $message = "Event '" . htmlspecialchars($title, ENT_QUOTES, 'UTF-8') . "' created successfully! (Event ID: #" . $newEventId . ")";
            $msgType = "success";
        } catch (PDOException $e) {
            $message = "Error creating event: " . htmlspecialchars($e->getMessage(), ENT_QUOTES, 'UTF-8');
            $msgType = "error";
        }
    }
}

if ($pdo !== null) {
    try {
        $selectSql = "SELECT event_id, title, description, event_date, venue FROM events ORDER BY event_date ASC";
        $stmt = $pdo->prepare($selectSql);
        $stmt->execute();
        $events = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        $message = "Unable to fetch events from database: " . htmlspecialchars($e->getMessage(), ENT_QUOTES, 'UTF-8');
        $msgType = "error";
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Campus Events - Practical 8 - StudentHub</title>
    <link rel="stylesheet" href="p8_style.css">
</head>
<body>

    <header>
        <h1>StudentHub Portal</h1>
        <p>Practical 8: MySQL Database Integration with PDO &amp; Prepared Statements</p>
        <span class="sub-header-badge">Task 2: Events Management &amp; Dynamic SELECT Query</span>
    </header>

    <nav>
        <a href="index.html" class="home">Home</a> |
        <a href="dashboard.html" class="dashboard">Dashboard</a> |
        <a href="events.html" class="events">Events (P6)</a> |
        <a href="students.html" class="students">Students (P6)</a> |
        <a href="register.php" class="register-p7">Register (P7 CSV/JSON)</a> |
        <a href="view_records.php" class="records">View Records (P7)</a> |
        <a href="p8_register.php" class="p8-btn p8-reg">P8: Student Register (DB)</a> |
        <a href="p8_events.php" class="p8-btn p8-evt active">P8: Events List (DB)</a> |
        <a href="p8_registrations.php" class="p8-btn p8-join">P8: Event Registrations (JOIN)</a>
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
                <span>Campus Events Directory</span>
                <span class="counter-badge"><?php echo count($events); ?> Events in MySQL</span>
            </div>
            <p class="card-subtitle">Retrieved dynamically from the <code>events</code> table using a PDO prepared <code>SELECT</code> query.</p>

            <?php if (!empty($events)): ?>
                <div class="events-grid">
                    <?php foreach ($events as $evt): ?>
                        <div class="event-card">
                            <div>
                                <div class="event-card-header">
                                    <h3 class="event-card-title"><?php echo htmlspecialchars($evt['title'], ENT_QUOTES, 'UTF-8'); ?></h3>
                                    <span class="badge badge-purple">Event #<?php echo htmlspecialchars($evt['event_id'], ENT_QUOTES, 'UTF-8'); ?></span>
                                </div>
                                
                                <p class="event-card-desc">
                                    <?php echo nl2br(htmlspecialchars($evt['description'] ?? 'No description provided.', ENT_QUOTES, 'UTF-8')); ?>
                                </p>
                            </div>

                            <div>
                                <div class="event-meta">
                                    <div class="event-meta-item">
                                        <span style="font-weight: 700; color: #0284c7;">&#128197; Date:</span>
                                        <span><?php echo date('F d, Y', strtotime($evt['event_date'])); ?></span>
                                    </div>
                                    <div class="event-meta-item">
                                        <span style="font-weight: 700; color: #0d9488;">&#128205; Venue:</span>
                                        <span><?php echo htmlspecialchars($evt['venue'], ENT_QUOTES, 'UTF-8'); ?></span>
                                    </div>
                                </div>

                                <div style="display: flex; gap: 8px;">
                                    <a href="p8_registrations.php?event_id=<?php echo urlencode($evt['event_id']); ?>" class="btn-primary btn-sm" style="flex: 1; text-align: center;">
                                        &#9997; Register for this Event
                                    </a>
                                </div>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>

                <div style="margin-top: 32px;">
                    <h3 style="font-size: 1.15rem; color: var(--text-primary); margin-bottom: 12px; font-weight: 700;">
                        Tabular View of Events (Raw Database Fields)
                    </h3>
                    <div class="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th style="width: 90px;">Event ID</th>
                                    <th>Title</th>
                                    <th>Description</th>
                                    <th style="width: 130px;">Event Date</th>
                                    <th>Venue</th>
                                    <th style="text-align: center; width: 140px;">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($events as $evt): ?>
                                    <tr>
                                        <td>
                                            <span class="badge badge-purple">#<?php echo htmlspecialchars($evt['event_id'], ENT_QUOTES, 'UTF-8'); ?></span>
                                        </td>
                                        <td>
                                            <strong><?php echo htmlspecialchars($evt['title'], ENT_QUOTES, 'UTF-8'); ?></strong>
                                        </td>
                                        <td style="font-size: 0.85rem; max-width: 320px;">
                                            <?php echo htmlspecialchars($evt['description'] ?? '', ENT_QUOTES, 'UTF-8'); ?>
                                        </td>
                                        <td>
                                            <span class="badge badge-blue"><?php echo htmlspecialchars($evt['event_date'], ENT_QUOTES, 'UTF-8'); ?></span>
                                        </td>
                                        <td>
                                            <?php echo htmlspecialchars($evt['venue'], ENT_QUOTES, 'UTF-8'); ?>
                                        </td>
                                        <td style="text-align: center;">
                                            <a href="p8_registrations.php?event_id=<?php echo urlencode($evt['event_id']); ?>" class="btn-primary btn-accent btn-sm">
                                                Register
                                            </a>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                </div>

            <?php else: ?>
                <div class="empty-state">
                    <p>No events found in the database table <code>events</code>.</p>
                    <p style="font-size: 0.85rem;">Import <code>database/studenthub.sql</code> or add a new event below.</p>
                </div>
            <?php endif; ?>
        </section>

        <section class="card">
            <div class="card-title">
                <span>Add New Event (Optional Testing)</span>
                <span class="sub-header-badge" style="background:#f0fdf4; color:#0d9488; border:none;">PDO Prepared INSERT</span>
            </div>
            <p class="card-subtitle">Insert an additional campus event into MySQL without touching phpMyAdmin.</p>

            <form action="p8_events.php" method="POST">
                <div class="form-grid">
                    <div class="form-group">
                        <label for="title">Event Title <span class="required">*</span></label>
                        <input type="text" id="title" name="title" class="input-field" placeholder="e.g. AI & Robotics Showcase" required>
                    </div>

                    <div class="form-group">
                        <label for="event_date">Event Date <span class="required">*</span></label>
                        <input type="date" id="event_date" name="event_date" class="input-field" value="<?php echo date('Y-m-d', strtotime('+7 days')); ?>" required>
                    </div>

                    <div class="form-group" style="grid-column: 1 / -1;">
                        <label for="venue">Venue <span class="required">*</span></label>
                        <input type="text" id="venue" name="venue" class="input-field" placeholder="e.g. Auditorium 1, Science Building" required>
                    </div>

                    <div class="form-group" style="grid-column: 1 / -1;">
                        <label for="description">Event Description</label>
                        <textarea id="description" name="description" class="input-field" rows="2" placeholder="Brief summary of event schedule and prerequisites..."></textarea>
                    </div>
                </div>

                <div style="margin-top: 16px;">
                    <button type="submit" name="add_event" class="btn-primary btn-accent">
                        <span>&#43;</span> Add Event to Database
                    </button>
                </div>
            </form>
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
