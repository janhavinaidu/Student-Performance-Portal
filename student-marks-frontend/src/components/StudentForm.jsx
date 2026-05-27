import React, { useState, useEffect } from 'react';

const calculateGrade = (marks) => {
  const score = Number(marks);
  if (score >= 95) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 80) return 'B+';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  return 'F';
};

const StudentForm = ({ onSubmit, editStudent, onCancelEdit, existingStudents }) => {
  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    subject: 'Mathematics',
    marks: ''
  });
  const [errors, setErrors] = useState({});
  const [liveGrade, setLiveGrade] = useState('');

  // Handle load of student to edit
  useEffect(() => {
    if (editStudent) {
      setFormData({
        name: editStudent.name || '',
        rollNumber: editStudent.rollNumber || '',
        subject: editStudent.subject || 'Mathematics',
        marks: editStudent.marks !== undefined && editStudent.marks !== null
          ? editStudent.marks.toString()
          : ''
      });
      setLiveGrade(editStudent.marks !== undefined ? calculateGrade(editStudent.marks) : '');
      setErrors({});
    } else {
      resetForm();
    }
  }, [editStudent]);

  // Update live grade as marks change
  useEffect(() => {
    if (formData.marks !== '' && !isNaN(formData.marks)) {
      const score = Number(formData.marks);
      if (score >= 0 && score <= 100) {
        setLiveGrade(calculateGrade(score));
      } else {
        setLiveGrade('');
      }
    } else {
      setLiveGrade('');
    }
  }, [formData.marks]);

  // Premium Feature: Auto-fill student name if the entered roll number already exists
  useEffect(() => {
    const roll = formData.rollNumber.trim().toLowerCase();
    if (roll && !editStudent && existingStudents) {
      const match = existingStudents.find((s) => s.rollNumber.toLowerCase() === roll);
      if (match) {
        setFormData((prev) => ({
          ...prev,
          name: match.name
        }));
      }
    }
  }, [formData.rollNumber, existingStudents, editStudent]);

  const resetForm = () => {
    setFormData({
      name: '',
      rollNumber: '',
      subject: 'Mathematics',
      marks: ''
    });
    setLiveGrade('');
    setErrors({});
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Student Name is required.';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters.';
    }

    if (!formData.rollNumber.trim()) {
      newErrors.rollNumber = 'Roll Number is required.';
    }

    if (formData.marks === '') {
      newErrors.marks = 'Marks are required.';
    } else {
      const score = Number(formData.marks);
      if (isNaN(score) || score < 0 || score > 100) {
        newErrors.marks = 'Marks must be a number between 0 and 100.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      ...formData,
      marks: Number(formData.marks)
    });

    resetForm();
  };

  const getGradeClass = (grade) => {
    if (grade === 'A+' || grade === 'A') return 'grade-excellent';
    if (grade === 'B+' || grade === 'B') return 'grade-good';
    if (grade === 'C' || grade === 'D') return 'grade-average';
    return 'grade-fail';
  };

  return (
    <div className={`form-container glass-card ${editStudent ? 'editing' : ''}`}>
      <h3 className="form-title">
        {editStudent ? '📝 Edit Student Record' : '✨ Add New Student'}
      </h3>

      <form onSubmit={handleSubmit} className="student-form" noValidate>
        <div className="input-group">
          <label htmlFor="rollNumber">Roll Number / ID</label>
          <input
            type="text"
            id="rollNumber"
            name="rollNumber"
            value={formData.rollNumber}
            onChange={handleChange}
            placeholder="e.g. 101"
            className={errors.rollNumber ? 'input-error' : ''}
            disabled={!!editStudent} // Lock roll number in edit mode
          />
          {errors.rollNumber && <span className="error-text">{errors.rollNumber}</span>}
        </div>

        <div className="input-group">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Asha"
            className={errors.name ? 'input-error' : ''}
          />
          {errors.name && <span className="error-text">{errors.name}</span>}
        </div>

        <div className="input-row">
          <div className="input-group flex-1">
            <label htmlFor="subject">Subject</label>
            <select
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
            >
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Computer Science">Computer Science</option>
              <option value="English">English</option>
            </select>
          </div>
        </div>

        <div className="input-row align-end">
          <div className="input-group flex-1">
            <label htmlFor="marks">Marks (0 - 100)</label>
            <input
              type="number"
              id="marks"
              name="marks"
              value={formData.marks}
              onChange={handleChange}
              placeholder="e.g. 85"
              className={errors.marks ? 'input-error' : ''}
              min="0"
              max="100"
            />
            {errors.marks && <span className="error-text">{errors.marks}</span>}
          </div>

          {liveGrade && (
            <div className="live-grade-container">
              <label>Live Grade</label>
              <div className={`live-grade-pill ${getGradeClass(liveGrade)}`}>
                {liveGrade}
              </div>
            </div>
          )}
        </div>

        <div className="form-actions">
          {editStudent && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancelEdit}
            >
              Cancel
            </button>
          )}
          <button type="submit" className="btn btn-primary">
            {editStudent ? 'Update Record' : 'Add Student'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentForm;