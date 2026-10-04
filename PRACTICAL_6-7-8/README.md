# StudentHub Portal - Web Development & Frameworks (WDF)

**Student Name:** Parthrajsinh H. Gohil  
**Enrollment No.:** 25DIT019  
**Branch:** Information Technology  

---

## Laboratory Work Overview

This repository contains the progressive implementation of the **StudentHub Portal** across Web Development & Frameworks (WDF) practicals.

### Summary of Practicals Implemented:
- **Practical 1 & 2:** HTML5 Wireframing & Semantic Multi-Page Portal Structure
- **Practical 3:** Responsive CSS3 Layouts, Grid/Flexbox Design Systems
- **Practical 4:** Client-Side JavaScript Form Validation & Interactive DOM Manipulation
- **Practical 5:** Weather API Fetching & Dynamic Dashboard Widgets
- **Practical 6:** Rendering External JSON Data using Fetch API, Search, Filter, Sort, Pagination, Dependent Dropdowns & LocalStorage Caching
- **Practical 7:** PHP Server-Side Form Processing with Validation, Sanitization, CSRF Protection, and Safe CSV/JSON File Storage

---

## Practical 6: Fetch API Dynamic External JSON Rendering

### Key Questions Addressed:
1. **How is JSON fetched, parsed, and rendered?**
   - Asynchronous `fetch()` calls parse external `.json` data using `response.json()`.
   - Modally rendered using template literals into responsive card grids.
   - Cross-Site Scripting (XSS) is mitigated with `escapeHtml()`.
2. **Which array methods are used for search, filter, sort, and pagination?**
   - **Search:** `Array.prototype.filter()` with multi-attribute text matching.
   - **Category Filter:** `Array.prototype.filter()` matching selected department/category.
   - **Sorting:** `Array.prototype.sort()` using `localeCompare()` for text and numeric subtraction for dates/numbers.
   - **Pagination:** `Array.prototype.slice(startIndex, endIndex)` with page numbers, prev, and next buttons.
3. **How are loading and error states handled?**
   - CSS loading spinner displayed while requests are pending.
   - Graceful fallback with error alerts and retry buttons upon network failure.
4. **How is modularity maintained in JavaScript files?**
   - Clean separation between fetch, filter, sort, render, and caching logic.

### Datasets (>= 15 records each):
- `events.json`: 16 Campus events, hackathons, and summits.
- `students.json`: 16 Student profiles with skills and geographic locations.
- `faqs.json`: 16 Categorized FAQs with search and helpfulness votes.
- `courses.json`: 16 Departmental academic courses.

### Extensions:
- **Intermediate Extension:** Dependent dropdowns for Country ➔ State ➔ City in `students.html` / `students.js`.
- **Advanced Extension:** Offline LocalStorage caching with last sync timestamps and offline badge.

---

## Practical 7: PHP Form Processing & CSV/JSON File Storage

### Key Questions Addressed:
1. **Is the form submitted using POST?**
   - Strictly enforced via `$_SERVER['REQUEST_METHOD'] === 'POST'`. Non-POST requests receive HTTP 405.
2. **Are inputs validated and sanitized server side?**
   - Sanitized via `trim()`, `stripslashes()`, `htmlspecialchars()`, and `filter_var()`.
   - Validated via regex patterns (name, phone) and server-side whitelists (courses, years, genders).
3. **Is file writing handled safely?**
   - Implements exclusive file locks (`LOCK_EX`) using `flock()` for CSV appending and `file_put_contents(..., LOCK_EX)` for JSON appending.
4. **Are success and error responses displayed clearly?**
   - Returns structured JSON for asynchronous AJAX/Fetch calls (`422` on validation errors).
   - Generates responsive styled HTML cards with summary tables for standard browser POST submissions.

### Extensions:
- **Intermediate Extension:** `view_records.php` — Interactive records viewer displaying stored registrations and contact queries from either CSV or JSON with live search filtering and download options.
- **Advanced Extension:** `csrf.php` — Cross-Site Request Forgery token generation and validation using `hash_equals()`.

---

## File Directory Map

```text
├── 25dit019 wdf practical 3,4,5/
│   ├── index.html & index.js & index.css
│   ├── dashboard.html & dashboard.js & dashboard.css
│   ├── profile.html & profile.js & profile.css
│   ├── courses.html & courses.js & courses.css & courses.json (16 records)
│   ├── events.html & events.js & events.css & events.json (16 records)       [P6]
│   ├── students.html & students.js & students.css & students.json (16 records) [P6]
│   ├── faqs.html & faqs.js & faqs.css & faqs.json (16 records)               [P6]
│   ├── register.html & register.php & register.js & register.css             [P7]
│   ├── contact.html & contact.php & contact.js & contact.css                 [P7]
│   ├── process_register.php & process_contact.php                            [P7]
│   ├── csrf.php (CSRF Security Token Module)                                 [P7]
│   ├── view_records.php (Stored CSV/JSON Viewer)                             [P7]
│   └── data/
│       ├── registrations.csv & registrations.json
│       └── contacts.csv & contacts.json
├── PRACTICAL_6/ (Standalone Submission Bundle)
│   ├── README.md
│   ├── events.html, events.js, events.css, events.json
│   ├── students.html, students.js, students.css, students.json
│   └── faqs.html, faqs.js, faqs.css, faqs.json
└── PRACTICAL_7/ (Standalone Submission Bundle)
    ├── README.md
    ├── process_register.php, process_contact.php, csrf.php, view_records.php
    ├── register.html, register.php, register.js, register.css
    ├── contact.html, contact.php, contact.js, contact.css
    └── data/ (CSV & JSON Storage)
```

---

## How to Test & Demonstrate

### 1. Testing Practical 6 (Fetch API, Dynamic Views, Dependent Dropdowns, Offline Caching):
- Open `events.html`, `students.html`, or `faqs.html` in your browser.
- Test the search bar: type "AI", "25DIT019", "Bhavnagar", etc.
- Test the dependent dropdowns on `students.html`: Select **India** ➔ observe states populate (**Gujarat**, **Maharashtra**, **Karnataka**) ➔ select **Gujarat** ➔ observe cities populate (**Bhavnagar**, **Ahmedabad**, etc.) ➔ observe student profiles filter dynamically.
- Test sorting and pagination buttons (Next, Prev, Numeric pages).
- Test offline caching: Click "Sync Fresh Data" or disconnect internet — data remains cached in `localStorage` with offline badge!

### 2. Testing Practical 7 (PHP Server-Side Validation, CSV/JSON Storage, Stored Records Viewer):
- Run PHP server from directory: `php -S localhost:8000` (or place in XAMPP `htdocs`).
- Navigate to `http://localhost:8000/register.php` (or `register.html`).
- Submit valid details ➔ observe successful write to both `data/registrations.csv` and `data/registrations.json`.
- Navigate to `http://localhost:8000/view_records.php` ➔ inspect live registered student table and contact inquiries, toggle between CSV and JSON data sources, and download raw files.
- Test server-side validation: Intentionally clear input fields or enter an invalid mobile/email ➔ observe server returns descriptive error messages.
