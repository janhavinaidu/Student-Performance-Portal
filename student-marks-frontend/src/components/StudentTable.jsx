import React, { useState } from 'react';

const StudentTable = ({ students, onEdit, onDelete }) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const getGradeClass = (grade) => {
    if (grade === 'A+' || grade === 'A') return 'grade-excellent';
    if (grade === 'B+' || grade === 'B') return 'grade-good';
    if (grade === 'C' || grade === 'D') return 'grade-average';
    return 'grade-fail';
  };

  const getProgressBarClass = (marks) => {
    if (marks >= 80) return 'progress-success';
    if (marks >= 50) return 'progress-warning';
    return 'progress-danger';
  };

  const handleDeleteClick = (id) => {
    setConfirmDeleteId(id);
  };

  const handleConfirmDelete = (id) => {
    onDelete(id);
    setConfirmDeleteId(null);
  };

  const handleCancelDelete = () => {
    setConfirmDeleteId(null);
  };

  if (students.length === 0) {
    return (
      <div className="empty-state glass-card">
        <div className="empty-state-icon">📂</div>
        <h4>No Student Records Found</h4>
        <p>Try adjusting your search filters or add a new student using the form.</p>
      </div>
    );
  }

  return (
    <div className="table-container glass-card">
      <table className="student-table">
        <thead>
          <tr>
            <th>Roll Number</th>
            <th>Full Name</th>
            <th>Subject</th>
            <th>Marks</th>
            <th>Grade</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id} className="student-row">
              <td className="cell-roll" data-label="Roll Number">
                <code>{student.rollNumber}</code>
              </td>
              <td className="cell-name" data-label="Name">
                {student.name}
              </td>
              <td className="cell-subject" data-label="Subject">
                <span className="subject-tag">{student.subject}</span>
              </td>
              <td className="cell-marks" data-label="Marks">
                <div className="marks-container">
                  <span className="marks-value">{student.marks}/100</span>
                  <div className="progress-bar-bg">
                    <div
                      className={`progress-bar-fill ${getProgressBarClass(student.marks)}`}
                      style={{ width: `${student.marks}%` }}
                    ></div>
                  </div>
                </div>
              </td>
              <td className="cell-grade" data-label="Grade">
                <span className={`grade-pill ${getGradeClass(student.grade)}`}>
                  {student.grade}
                </span>
              </td>
              <td className="cell-actions text-right" data-label="Actions">
                {confirmDeleteId === student.id ? (
                  <div className="confirm-delete-box">
                    <span className="confirm-text">Confirm?</span>
                    <button
                      className="btn-icon btn-confirm"
                      onClick={() => handleConfirmDelete(student.id)}
                      title="Yes, Delete"
                    >
                      ✔
                    </button>
                    <button
                      className="btn-icon btn-cancel"
                      onClick={handleCancelDelete}
                      title="Cancel"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="action-buttons">
                    <button
                      className="btn-icon btn-edit"
                      onClick={() => onEdit(student)}
                      title="Edit Record"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-icon btn-delete"
                      onClick={() => handleDeleteClick(student.id)}
                      title="Delete Record"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentTable;
