<?php
$dataDir = __DIR__ . '/data';
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0777, true);
}
$regCsvFile = $dataDir . '/registrations.csv';
$regJsonFile = $dataDir . '/registrations.json';
$contactCsvFile = $dataDir . '/contacts.csv';
$contactJsonFile = $dataDir . '/contacts.json';
if (!file_exists($regCsvFile) && !file_exists($regJsonFile)) {
    $seedRegistrations = [
        [
            'id' => 'REG-1727600100-101',
            'timestamp' => '2026-09-28 10:30:15',
            'fullname' => 'Parthrajsinh H. Gohil',
            'email' => '25dit019@charusat.edu.in',
            'mobile' => '9876543210',
            'course' => 'Information Technology',
            'year' => '2nd Year',
            'gender' => 'Male',
            'ip_address' => '127.0.0.1'
        ],
        [
            'id' => 'REG-1727600200-102',
            'timestamp' => '2026-09-28 11:15:20',
            'fullname' => 'Aarav Sharma',
            'email' => 'aarav.sharma@charusat.edu.in',
            'mobile' => '9825012345',
            'course' => 'Computer Science',
            'year' => '2nd Year',
            'gender' => 'Male',
            'ip_address' => '127.0.0.1'
        ],
        [
            'id' => 'REG-1727600300-103',
            'timestamp' => '2026-09-28 14:05:42',
            'fullname' => 'Diya K. Patel',
            'email' => 'diya.patel@charusat.edu.in',
            'mobile' => '9712345678',
            'course' => 'Computer Engineering',
            'year' => '2nd Year',
            'gender' => 'Female',
            'ip_address' => '127.0.0.1'
        ]
    ];
    file_put_contents($regJsonFile, json_encode($seedRegistrations, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES), LOCK_EX);
    $fp = fopen($regCsvFile, 'w');
    if ($fp) {
        fputcsv($fp, ['ID', 'Timestamp', 'Full Name', 'Email', 'Mobile', 'Course', 'Year', 'Gender', 'IP Address']);
        foreach ($seedRegistrations as $r) {
            fputcsv($fp, array_values($r));
        }
        fclose($fp);
    }
}
if (!file_exists($contactCsvFile) && !file_exists($contactJsonFile)) {
    $seedContacts = [
        [
            'ticket_id' => 'TICK-1727600400-201',
            'timestamp' => '2026-09-28 15:22:10',
            'name' => 'Parthrajsinh H. Gohil',
            'email' => '25dit019@charusat.edu.in',
            'message' => 'Query regarding Fetch API practical submission guidelines.',
            'ip_address' => '127.0.0.1'
        ],
        [
            'ticket_id' => 'TICK-1727600500-202',
            'timestamp' => '2026-09-29 09:10:45',
            'name' => 'Rohan Deshmukh',
            'email' => 'rohan.deshmukh@charusat.edu.in',
            'message' => 'Requesting access to central high-performance computing lab for AI model testing.',
            'ip_address' => '127.0.0.1'
        ]
    ];
    file_put_contents($contactJsonFile, json_encode($seedContacts, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES), LOCK_EX);
    $fp = fopen($contactCsvFile, 'w');
    if ($fp) {
        fputcsv($fp, ['Ticket ID', 'Timestamp', 'Name', 'Email', 'Message', 'IP Address']);
        foreach ($seedContacts as $c) {
            fputcsv($fp, array_values($c));
        }
        fclose($fp);
    }
}
$tab = $_GET['tab'] ?? 'registrations'; 
$format = $_GET['format'] ?? 'csv'; 
$registrationsFromCsv = [];
if (file_exists($regCsvFile)) {
    if (($handle = fopen($regCsvFile, 'r')) !== false) {
        $headers = fgetcsv($handle);
        while (($row = fgetcsv($handle)) !== false) {
            if (count($row) >= 8) {
                $registrationsFromCsv[] = [
                    'id' => $row[0] ?? '',
                    'timestamp' => $row[1] ?? '',
                    'fullname' => $row[2] ?? '',
                    'email' => $row[3] ?? '',
                    'mobile' => $row[4] ?? '',
                    'course' => $row[5] ?? '',
                    'year' => $row[6] ?? '',
                    'gender' => $row[7] ?? '',
                    'ip_address' => $row[8] ?? ''
                ];
            }
        }
        fclose($handle);
    }
}
$registrationsFromJson = [];
if (file_exists($regJsonFile)) {
    $raw = file_get_contents($regJsonFile);
    $decoded = json_decode($raw, true);
    if (is_array($decoded)) {
        $registrationsFromJson = $decoded;
    }
}
$contactsFromCsv = [];
if (file_exists($contactCsvFile)) {
    if (($handle = fopen($contactCsvFile, 'r')) !== false) {
        $headers = fgetcsv($handle);
        while (($row = fgetcsv($handle)) !== false) {
            if (count($row) >= 5) {
                $contactsFromCsv[] = [
                    'ticket_id' => $row[0] ?? '',
                    'timestamp' => $row[1] ?? '',
                    'name' => $row[2] ?? '',
                    'email' => $row[3] ?? '',
                    'message' => $row[4] ?? '',
                    'ip_address' => $row[5] ?? ''
                ];
            }
        }
        fclose($handle);
    }
}
$contactsFromJson = [];
if (file_exists($contactJsonFile)) {
    $raw = file_get_contents($contactJsonFile);
    $decoded = json_decode($raw, true);
    if (is_array($decoded)) {
        $contactsFromJson = $decoded;
    }
}
if ($tab === 'contacts') {
    $records = ($format === 'json') ? $contactsFromJson : $contactsFromCsv;
    $recordType = 'Contact Queries';
} else {
    $records = ($format === 'json') ? $registrationsFromJson : $registrationsFromCsv;
    $recordType = 'Student Registrations';
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Stored Records Viewer - Practical 7 - StudentHub</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        body { background: 
        header { text-align: center; padding: 20px 10px; }
        .page-title { font-size: 2.2rem; color: 
        .page-subtitle { color: 
        hr { border: none; height: 1px; background: 
        nav {
            text-align: center;
            padding: 12px 10px;
            background: 
            border-radius: 10px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 10px 14px;
            font-size: 0.95rem;
            margin-bottom: 20px;
        }
        nav a { text-decoration: none; color: 
        nav a:hover { color: 
        nav a.active { color: 
        main { max-width: 1200px; margin: 0 auto; }
        .tab-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 12px;
            margin-bottom: 16px;
        }
        .nav-tabs { display: flex; gap: 8px; }
        .nav-tab {
            padding: 10px 18px;
            background: 
            border: 1px solid 
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            color: 
            transition: all 0.2s;
            display: inline-flex;
            align-items: center;
            gap: 6px;
        }
        .nav-tab.active {
            background: 
            color: 
            border-color: 
        }
        .format-toggle {
            display: flex;
            align-items: center;
            gap: 8px;
            background: 
            padding: 6px 12px;
            border-radius: 8px;
            border: 1px solid 
            font-size: 0.9rem;
        }
        .format-btn {
            padding: 4px 10px;
            border-radius: 4px;
            text-decoration: none;
            font-weight: 600;
            color: 
        }
        .format-btn.active {
            background: 
            color: 
        }
        .controls-card {
            background: 
            padding: 16px 20px;
            border-radius: 10px;
            border: 1px solid 
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 12px;
            margin-bottom: 20px;
        }
        .search-box {
            flex-grow: 1;
            max-width: 450px;
            padding: 9px 14px;
            border: 1.5px solid 
            border-radius: 6px;
            font-size: 0.95rem;
            outline: none;
        }
        .search-box:focus { border-color: 
        .download-links { display: flex; gap: 10px; }
        .btn-download {
            padding: 8px 14px;
            background: 
            border: 1px solid 
            border-radius: 6px;
            text-decoration: none;
            color: 
            font-size: 0.85rem;
            font-weight: 600;
            transition: all 0.2s;
        }
        .btn-download:hover { background: 
        .table-container {
            background: 
            border-radius: 10px;
            border: 1px solid 
            overflow-x: auto;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
        }
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.9rem;
            text-align: left;
        }
        th {
            background: 
            padding: 12px 16px;
            font-weight: 600;
            color: 
            border-bottom: 2px solid 
            white-space: nowrap;
        }
        td {
            padding: 12px 16px;
            border-bottom: 1px solid 
            color: 
        }
        tr:hover { background: 
        .badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 600;
        }
        .badge-blue { background: 
        .badge-green { background: 
        .badge-gray { background: 
        .empty-state {
            padding: 40px 20px;
            text-align: center;
            color: 
        }
        footer { text-align: center; padding: 24px 0; color: 
    </style>
</head>
<body>
<header>
    <h1 class="page-title">Server Storage Records Viewer</h1>
    <p class="page-subtitle">Practical 7: Display Stored CSV / JSON Records on Webpage (Intermediate Extension)</p>
</header>
<hr>
<nav>
    <a href="index.html">Home</a>
    <a href="dashboard.html">Dashboard</a>
    <a href="profile.html">Profile</a>
    <a href="courses.html">Courses</a>
    <a href="events.html">Events (P6)</a>
    <a href="students.html">Students (P6)</a>
    <a href="faqs.html">FAQs (P6)</a>
    <a href="register.html">Register (P7)</a>
    <a href="contact.html">Contact (P7)</a>
    <a href="view_records.php" class="active">View Records (P7)</a>
    <a href="p8_register.php" style="color: #0284c7; font-weight: bold;">P8 Register (DB)</a>
    <a href="p8_events.php" style="color: #0d9488; font-weight: bold;">P8 Events (DB)</a>
    <a href="p8_registrations.php" style="color: #7c3aed; font-weight: bold;">P8 Registrations (JOIN)</a>
</nav>
<hr>
<main>
    <!-- Tab Bar: Switch Dataset & Switch Format -->
    <div class="tab-bar">
        <div class="nav-tabs">
            <a href="?tab=registrations&format=<?php echo $format; ?>" class="nav-tab <?php echo $tab === 'registrations' ? 'active' : ''; ?>">
                🎓 Student Registrations (<?php echo count($tab === 'registrations' ? $records : $registrationsFromCsv); ?>)
            </a>
            <a href="?tab=contacts&format=<?php echo $format; ?>" class="nav-tab <?php echo $tab === 'contacts' ? 'active' : ''; ?>">
                📬 Contact Queries (<?php echo count($tab === 'contacts' ? $records : $contactsFromCsv); ?>)
            </a>
        </div>
        <div class="format-toggle">
            <span>Data Source:</span>
            <a href="?tab=<?php echo $tab; ?>&format=csv" class="format-btn <?php echo $format === 'csv' ? 'active' : ''; ?>">
                📄 CSV File
            </a>
            <a href="?tab=<?php echo $tab; ?>&format=json" class="format-btn <?php echo $format === 'json' ? 'active' : ''; ?>">
                💾 JSON File
            </a>
        </div>
    </div>
    <!-- Controls Card: Search & Downloads -->
    <div class="controls-card">
        <input type="text" id="recordSearch" class="search-box" placeholder="🔍 Filter records by name, email, id, or department..." oninput="filterRecordsTable()">
        <div class="download-links">
            <a href="data/<?php echo $tab; ?>.csv" download class="btn-download" target="_blank">⬇️ Download CSV</a>
            <a href="data/<?php echo $tab; ?>.json" download class="btn-download" target="_blank">⬇️ Download JSON</a>
        </div>
    </div>
    <!-- Records Table -->
    <div class="table-container">
        <table id="recordsTable">
            <thead>
                <?php if ($tab === 'registrations'): ?>
                    <tr>
                        <th>
                        <th>Record ID</th>
                        <th>Submitted At</th>
                        <th>Student Name</th>
                        <th>Email Address</th>
                        <th>Mobile</th>
                        <th>Course</th>
                        <th>Year</th>
                        <th>Gender</th>
                    </tr>
                <?php else: ?>
                    <tr>
                        <th>
                        <th>Ticket ID</th>
                        <th>Timestamp</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Message</th>
                        <th>IP Address</th>
                    </tr>
                <?php endif; ?>
            </thead>
            <tbody>
                <?php if (empty($records)): ?>
                    <tr>
                        <td colspan="9" class="empty-state">
                            <h3>No records currently found in data/<?php echo $tab; ?>.<?php echo $format; ?>.</h3>
                            <p>Submit a new form to see live entries written to disk.</p>
                        </td>
                    </tr>
                <?php else: ?>
                    <?php $idx = 1; foreach ($records as $r): ?>
                        <tr>
                            <?php if ($tab === 'registrations'): ?>
                                <td><?php echo $idx++; ?></td>
                                <td><code><?php echo htmlspecialchars($r['id'] ?? ''); ?></code></td>
                                <td style="white-space: nowrap;"><?php echo htmlspecialchars($r['timestamp'] ?? ''); ?></td>
                                <td><strong><?php echo htmlspecialchars($r['fullname'] ?? ''); ?></strong></td>
                                <td><?php echo htmlspecialchars($r['email'] ?? ''); ?></td>
                                <td><?php echo htmlspecialchars($r['mobile'] ?? ''); ?></td>
                                <td><span class="badge badge-blue"><?php echo htmlspecialchars($r['course'] ?? ''); ?></span></td>
                                <td><span class="badge badge-green"><?php echo htmlspecialchars($r['year'] ?? ''); ?></span></td>
                                <td><span class="badge badge-gray"><?php echo htmlspecialchars($r['gender'] ?? ''); ?></span></td>
                            <?php else: ?>
                                <td><?php echo $idx++; ?></td>
                                <td><code><?php echo htmlspecialchars($r['ticket_id'] ?? ''); ?></code></td>
                                <td style="white-space: nowrap;"><?php echo htmlspecialchars($r['timestamp'] ?? ''); ?></td>
                                <td><strong><?php echo htmlspecialchars($r['name'] ?? ''); ?></strong></td>
                                <td><?php echo htmlspecialchars($r['email'] ?? ''); ?></td>
                                <td><?php echo htmlspecialchars($r['message'] ?? ''); ?></td>
                                <td><code><?php echo htmlspecialchars($r['ip_address'] ?? ''); ?></code></td>
                            <?php endif; ?>
                        </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</main>
<hr>
<footer>
    <p>2026 StudentHub Portal | Practical 7 - Server-Side Form Processing & File Storage (CSV & JSON) | Student: Parthrajsinh H. Gohil (25DIT019)</p>
</footer>
<script>
function filterRecordsTable() {
    const input = document.getElementById('recordSearch').value.toLowerCase();
    const rows = document.querySelectorAll('#recordsTable tbody tr');
    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(input) ? '' : 'none';
    });
}
</script>
</body>
</html>
