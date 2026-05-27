import React, { useState, useEffect } from 'react';
import api from './services/api';
import StudentForm from './components/StudentForm';
import FilterBar from './components/FilterBar';
import StudentTable from './components/StudentTable';
import Login from './components/Login';
import './App.css';

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

function mapApiToUi(student) {
  const marks = Number(student.marks ?? 0);
  const rawName = student.name ?? student.studentName ?? '';
  
  // Try to parse "Name (Roll: RollNumber)" from backend studentName field
  const rollMatch = rawName.match(/^(.*?)\s*\(Roll:\s*(.*?)\)$/i);
  let name = rawName;
  let rollNumber = '';

  if (rollMatch) {
    name = rollMatch[1].trim();
    rollNumber = rollMatch[2].trim();
  } else {
    // Backward compatibility: If no formatted Roll Number in the backend string, generate a default one
    rollNumber = `S${String(student.id ?? '').padStart(3, '0')}`;
  }

  return {
    id: student.id,
    name,
    rollNumber,
    subject: student.subject ?? student.subjectName ?? '',
    marks,
    grade: student.grade ?? calculateGrade(marks),
    createdAt: student.createdAt ?? null,
  };
}

function mapUiToApi(formData) {
  // Save the Roll Number transparently inside the studentName backend attribute
  const formattedName = `${formData.name.trim()} (Roll: ${formData.rollNumber.trim()})`;
  return {
    studentName: formattedName,
    subjectName: formData.subject,
    marks: Number(formData.marks),
  };
}

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMock, setIsMock] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedGradeCategory, setSelectedGradeCategory] = useState('All');
  const [sortBy, setSortBy] = useState('date-desc');

  useEffect(() => {
    if (token) {
      fetchStudents();
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  if (!token) {
    return (
      <div className="animate-fade-in">
        <header className="app-header">
          <div className="header-title-container">
            <span className="header-logo">🎓</span>
            <h1>Student Upgrade Gradebook</h1>
          </div>
        </header>
        <Login onLoginSuccess={(newToken) => setToken(newToken)} />
      </div>
    );
  }

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await api.getStudents();
      const rawStudents = Array.isArray(response) ? response : response?.data ?? [];
      const uiStudents = rawStudents.map(mapApiToUi);

      setStudents(uiStudents);
      setIsMock(Boolean(response?.isMock));
    } catch (err) {
      console.error('Error fetching students:', err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrUpdate = async (formData) => {
    try {
      const payload = mapUiToApi(formData);

      if (editingStudent) {
        const response = await api.updateStudent(editingStudent.id, payload);
        const updatedRecord = mapApiToUi(response?.data ?? response);

        setStudents((prev) =>
          prev.map((s) => (s.id === editingStudent.id ? updatedRecord : s))
        );
        setIsMock(Boolean(response?.isMock));
        setEditingStudent(null);
      } else {
        const response = await api.createStudent(payload);
        const newRecord = mapApiToUi(response?.data ?? response);

        setStudents((prev) => [...prev, newRecord]);
        setIsMock(Boolean(response?.isMock));
      }
    } catch (err) {
      console.error('Error saving student record:', err);
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
  };

  const handleCancelEdit = () => {
    setEditingStudent(null);
  };

  const handleDelete = async (id) => {
    try {
      const response = await api.deleteStudent(id);
      setStudents((prev) => prev.filter((s) => s.id !== id));
      setIsMock(Boolean(response?.isMock));

      if (editingStudent && editingStudent.id === id) {
        setEditingStudent(null);
      }
    } catch (err) {
      console.error('Error deleting student record:', err);
    }
  };

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
    .sort((a, b) => {
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
      if (sortBy === 'marks-desc') return b.marks - a.marks;
      if (sortBy === 'marks-asc') return a.marks - b.marks;

      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : Number(a.id) || 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : Number(b.id) || 0;
      return dateB - dateA;
    });

  // Calculate Real-time Statistics
  const totalCount = students.length;

  const classAverage =
    totalCount > 0
      ? Math.round(students.reduce((sum, s) => sum + s.marks, 0) / totalCount)
      : 0;

  const passRate =
    totalCount > 0
      ? Math.round((students.filter((s) => s.marks >= 50).length / totalCount) * 100)
      : 0;

  // New Rule: Calculate Class Topper based on aggregate percentage of all subject marks
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

    // Sort by percentage descending
    studentAverages.sort((a, b) => b.percentage - a.percentage);

    return studentAverages[0] || null;
  };

  const classTopper = calculateClassTopper();

  return (
    <div className="animate-fade-in">
      <header className="app-header">
        <div className="header-title-container">
          <span className="header-logo">🎓</span>
          <h1>Student Upgrade Gradebook</h1>
        </div>

        <div className="header-controls">
          <div
            className={`connection-badge ${isMock ? 'mock' : 'live'}`}
            title={
              isMock
                ? 'Running with browser local storage database'
                : 'Connected to live REST backend API'
            }
          >
            <span className="status-dot"></span>
            {isMock ? 'Mock Storage Mode' : 'Live API Connected'}
          </div>

          <button
            onClick={handleLogout}
            className="btn btn-secondary btn-signout"
            title="Sign out of the system"
          >
            <span>Sign Out</span> 🚪
          </button>
        </div>
      </header>

      <section className="stats-deck">
        <div className="glass-card stat-card total">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <span className="stat-label">Total Student Entries</span>
            <span className="stat-value">{totalCount}</span>
            <span className="stat-subtext">Registered records</span>
          </div>
        </div>

        <div className="glass-card stat-card average">
          <div className="stat-icon">📈</div>
          <div className="stat-info">
            <span className="stat-label">Class Average</span>
            <span className="stat-value">{classAverage}%</span>
            <span className="stat-subtext">Overall score</span>
          </div>
        </div>

        <div className="glass-card stat-card pass">
          <div className="stat-icon">🏆</div>
          <div className="stat-info">
            <span className="stat-label">Pass Rate</span>
            <span className="stat-value">{passRate}%</span>
            <span className="stat-subtext">Marks ≥ 50</span>
          </div>
        </div>

        <div className="glass-card stat-card top">
          <div className="stat-icon">🌟</div>
          <div className="stat-info">
            <span className="stat-label">Class Topper</span>
            <span
              className="stat-value"
              style={{
                fontSize:
                  classTopper && classTopper.name.length > 12 ? '1.25rem' : '1.5rem',
              }}
            >
              {classTopper ? `${classTopper.name} (${classTopper.percentage}%)` : 'N/A'}
            </span>
            <span className="stat-subtext">
              {classTopper
                ? `Roll: ${classTopper.rollNumber} | ${classTopper.subjectCount} Subj`
                : 'No records yet'}
            </span>
          </div>
        </div>
      </section>

      <main className="dashboard-content">
        <StudentForm
          onSubmit={handleAddOrUpdate}
          editStudent={editingStudent}
          onCancelEdit={handleCancelEdit}
          existingStudents={students}
        />

        <section className="list-section">
          <FilterBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedSubject={selectedSubject}
            setSelectedSubject={setSelectedSubject}
            selectedGradeCategory={selectedGradeCategory}
            setSelectedGradeCategory={setSelectedGradeCategory}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />

          {loading ? (
            <div className="empty-state glass-card">
              <div className="empty-state-icon animate-pulse">⏳</div>
              <h4>Synchronizing Gradebook Data...</h4>
              <p>Fetching records from the server API...</p>
            </div>
          ) : (
            <StudentTable
              students={filteredAndSortedStudents}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </section>
      </main>
    </div>
  );
}

export default App;