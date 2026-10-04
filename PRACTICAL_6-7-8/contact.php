<?php
require_once 'csrf.php';
$csrfToken = getCsrfToken();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Contact Us - StudentHub (Practical 7)</title>
    <link rel="stylesheet" href="contact.css">
</head>
<body>
<header>
    <h1 class="contact-title">Contact Support & Administration</h1>
</header>
<hr>
<nav>
    <a href="index.html" class="home">Home</a>
    <a href="dashboard.html" class="dashboard">Dashboard</a>
    <a href="profile.html" class="profile">Profile</a>
    <a href="courses.html" class="courses">Courses</a>
    <a href="events.html" class="events">Events (P6)</a>
    <a href="students.html" class="students">Students (P6)</a>
    <a href="faqs.html" class="faqs">FAQs (P6)</a>
    <a href="register.php" class="register">Register (P7)</a>
    <a href="contact.php" class="contact" style="font-weight: bold; color: #007bff;">Contact (P7)</a>
    <a href="view_records.php" class="records">View Records (P7)</a>
</nav>
<hr>
<main>
    <section>
        <h2 class="message-title">Send Your Message (PHP POST + CSV/JSON File Storage)</h2>
        <div class="contact-container">
            <form class="contact-form" id="contactForm" action="process_contact.php" method="POST">
                <!-- Advanced Extension: CSRF token injection -->
                <input type="hidden" name="csrf_token" id="csrf_token" value="<?php echo htmlspecialchars($csrfToken, ENT_QUOTES, 'UTF-8'); ?>">
                <label for="name">Name</label>
                <input type="text"
                       id="name"
                       name="name"
                       class="input-field"
                       placeholder="Enter your name"
                       value="Parthrajsinh H. Gohil"
                       required>
                <label for="email">Email</label>
                <input type="email"
                       id="email"
                       name="email"
                       class="input-field"
                       placeholder="Enter your email"
                       value="25dit019@charusat.edu.in"
                       required>
                <label for="message">Message</label>
                <textarea id="message"
                          name="message"
                          class="message-field"
                          placeholder="Enter your message"
                          rows="5"
                          required>Hello, this is a test query verifying Practical 7 PHP server-side validation and safe CSV/JSON storage.</textarea>
                <div class="button-container">
                    <button type="submit" class="send-button" id="sendBtn">Send Message to PHP</button>
                    <button type="reset" class="clear-button" id="clearBtn">Clear</button>
                </div>
            </form>
        </div>
    </section>
</main>
<hr>
<footer>
    <p class="contact-footer">
        © 2026 StudentHub Portal | Practical 7 - PHP Form Processing | Student: Parthrajsinh H. Gohil (25DIT019)
    </p>
</footer>
<script src="contact.js"></script>
</body>
</html>
