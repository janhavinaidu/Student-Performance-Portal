# 📝 Technical Architecture & Calculations Specification

This document provides an in-depth breakdown of how the **React (Vite)** frontend for the Student Management System was developed, how data is parsed and structured, and the exact algorithms used to compute student statistics, grades, and filters.

---

## 🏛️ React Frontend Core Architecture

The frontend is constructed as a modern single-page application (SPA) using **Vite** for rapid bundling, hot-module replacement (HMR), and optimized production builds. 

### 1. Root Component Layout (`src/App.jsx`)
*   Acts as the central state controller. It holds the authentication token (`token`), the local student array (`students`), loading states, active editing flags, and search/filter states.
*   Uses **conditional component mounting** to safeguard components:
    *   **Unauthenticated View**: If `token` is missing $\rightarrow$ Renders the `<Login />` view.
    *   **Authenticated View**: If `token` is present $\rightarrow$ Mounts the Header (with **Sign Out** capabilities), the real-time **Stats Deck**, the **StudentForm**, the **FilterBar**, and the **StudentTable**.

### 2. Stylesheets & Theming (`src/App.css` & `src/index.css`)
*   Designed using a **glassmorphic dark-mode palette** with rich HSL colors.
*   Utilizes **CSS Grid** for responsive multi-column layouts (dashboard content breaks down into a single-column layout on mobile devices).
*   Applies **micro-animations** (fade-ins, pulse glows, and translate transitions) to inputs, buttons, and state alerts to deliver a premium user experience.

---

## 🧮 Mathematical Calculations & Algorithmic Logic

All real-time computations are executed on the client side based on the reactive array `students`, ensuring instant, non-blocking UI updates whenever records are added, modified, or deleted.

### 1. Letter Grade Calculation
Grades are derived dynamically from a student's numerical score using a standard scale. This function is defined in both `src/App.jsx` and `src/components/StudentForm.jsx` (for the real-time grade compute indicator):

```javascript
function calculateGrade(marks) {
  const m = Number(marks);
  if (m >= 95) return 'A+';
  if (m >= 90) return 'A';
  if (m >= 80) return 'B+';
  if (m >= 70) return 'B';
  if (m >= 60) return 'C';
  if (m >= 50) return 'D';
  return 'F';
}
```

---

### 2. Real-Time Stats Deck Metrics
Every time the `students` state is modified, the dashboard header cards instantly re-evaluate three key statistics:

#### A. Total Student Entries
Simply tracks the total number of records active in the database:
$$\text{Total Entries} = \text{students.length}$$

#### B. Class Average Score
Computes the arithmetic mean of all marks, rounded to the nearest integer. If the list is empty, it defaults safely to `0` to prevent division-by-zero errors:
$$\text{Class Average} = \text{round}\left( \frac{\sum_{i=1}^{N} \text{marks}_i}{N} \right)$$
```javascript
const classAverage =
  totalCount > 0
    ? Math.round(students.reduce((sum, s) => sum + s.marks, 0) / totalCount)
    : 0;
```

#### C. Pass Rate Percentage
Calculates the proportion of student entries scoring a **passing mark of 50 or above**, rounded to the nearest integer:
$$\text{Pass Rate} = \text{round}\left( \frac{\text{Count of records with marks} \ge 50}{\text{Total Count}} \times 100 \right)$$
```javascript
const passRate =
  totalCount > 0
    ? Math.round((students.filter((s) => s.marks >= 50).length / totalCount) * 100)
    : 0;
```

---

### 3. Class Topper Algorithm (Aggregate Weighted Performance)
Unlike basic systems that select the highest single test score, this application features an advanced **Class Topper** algorithm. It calculates the topper based on their **aggregate percentage of all subjects taken**, preventing duplicate roll numbers and accounting for multi-subject coursework:

1.  **Group by Roll Number**: The system aggregates all student records using their unique `rollNumber` as a key.
2.  **Calculate Total & Count**: For each unique roll number, it sums the marks and counts the number of subjects the student is registered in.
3.  **Compute Student Average**: Divide the student's total marks by their subject count to derive their individual aggregate percentage score.
4.  **Rank**: Sort all aggregate averages in descending order; the student at index `0` is crowned the Class Topper.

```javascript
const calculateClassTopper = () => {
  if (students.length === 0) return null;

  const studentGroups = {};
  students.forEach((student) => {
    const roll = student.rollNumber;
    if (!studentGroups[roll]) {
      studentGroups[roll] = {
        name: student.name,
        rollNumber: roll,
        totalMarks: 0,
        subjectCount: 0,
        subjects: []
      };
    }
    studentGroups[roll].totalMarks += student.marks;
    studentGroups[roll].subjectCount += 1;
    studentGroups[roll].subjects.push(student.subject);
  });

  const studentAverages = Object.values(studentGroups).map((group) => {
    return {
      ...group,
      percentage: Math.round(group.totalMarks / group.subjectCount)
    };
  });

  // Sort by average aggregate percentage descending
  studentAverages.sort((a, b) => b.percentage - a.percentage);

  return studentAverages[0] || null;
};
```

---

### 4. Transparent Fallback Roll Numbers
To accommodate optional roll numbers, the system supports a dual fallback model:
*   **When Provided**: The roll number is serialized inside the backend `studentName` attribute alongside their full name: `Name (Roll: RollNumber)`.
*   **When Omitted (Optional)**: The system submits only the clean name. When reading back from the backend, if no `(Roll: ...)` pattern is found, the frontend auto-generates a clean default serial ID based on the database key:
$$\text{Generated ID} = \text{"S"} + \text{String(student.id).padStart(3, "0")}$$
This maintains data structural integrity while providing an outstanding user experience.

```javascript
// App.jsx Parsing logic (mapApiToUi)
const rollMatch = rawName.match(/^(.*?)\s*\(Roll:\s*(.*?)\)$/i);
let name = rawName;
let rollNumber = '';

if (rollMatch) {
  name = rollMatch[1].trim();
  rollNumber = rollMatch[2].trim();
} else {
  // Generates S001, S002, etc. if no Roll Number exists
  rollNumber = `S${String(student.id ?? '').padStart(3, '0')}`;
}
```

---

### 5. Multi-Category Client Filtering & Dynamic Sorting
The dashboard uses active chaining inside a combined `.filter().sort()` pipeline. Filtering and sorting do not mutate the main `students` state, ensuring zero lag.

#### A. Multi-Category Filtering Logic
1.  **Search Query Filter**: Checks if the query string matches the student's Name, Subject, or Roll Number (case-insensitive).
2.  **Subject dropdown filter**: Selects a specific subject or passes `'All'`.
3.  **Grade Category filter**:
    *   `'Distinction'`: Includes only scores $\ge 80$.
    *   `'Pass'`: Includes only scores $\ge 50$.
    *   `'Fail'`: Includes only scores $< 50$.

```javascript
const filteredAndSortedStudents = students
  .filter((student) => {
    const q = searchQuery.toLowerCase().trim();

    const matchesSearch =
      !q ||
      student.name.toLowerCase().includes(q) ||
      student.rollNumber.toLowerCase().includes(q) ||
      student.subject.toLowerCase().includes(q);

    const matchesSubject =
      selectedSubject === 'All' || student.subject === selectedSubject;

    let matchesGrade = true;
    if (selectedGradeCategory === 'Distinction') {
      matchesGrade = student.marks >= 80;
    } else if (selectedGradeCategory === 'Pass') {
      matchesGrade = student.marks >= 50;
    } else if (selectedGradeCategory === 'Fail') {
      matchesGrade = student.marks < 50;
    }

    return matchesSearch && matchesSubject && matchesGrade;
  })
```

#### B. Dynamic Sorting Logic
After passing the filters, the records are sorted before rendering:
*   `'name-asc'` / `'name-desc'`: Alphabetical sorting via `localeCompare`.
*   `'marks-desc'` / `'marks-asc'`: Numerical subtraction of the `marks` attribute.
*   `'date-desc'`: Falls back to creation date timestamps or student IDs to sort from newest to oldest.

```javascript
  .sort((a, b) => {
    if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
    if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
    if (sortBy === 'marks-desc') return b.marks - a.marks;
    if (sortBy === 'marks-asc') return a.marks - b.marks;

    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : Number(a.id) || 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : Number(b.id) || 0;
    return dateB - dateA;
  });
```

---

## 🛡️ Authentication & Middleware Interceptors

The security flow handles token injection and automated logout seamlessly.

### 1. Axios Request Middleware (Bearer Token Injection)
Instead of adding authentication headers to every HTTP request manually, we intercept Axios configurations globally:
```javascript
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
```

### 2. Axios Response Middleware (Automated Invalidation & Sign Out)
If the backend throws a `401 Unauthorized` status (indicating token expiration or tampering), this response interceptor intercepts the error, deletes the invalid token, and reloads the page to return the user to the Sign In screen:
```javascript
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      window.location.reload();
    }
    return Promise.reject(error);
  }
);
```
