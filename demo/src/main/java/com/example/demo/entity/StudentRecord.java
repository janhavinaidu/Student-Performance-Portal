package com.example.demo.entity;

import jakarta.persistence.*;

@Entity
public class StudentRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String studentName;
    private String subjectName;
    private Double marks;

    public StudentRecord() {
    }

    public StudentRecord(Long id, String studentName, String subjectName, Double marks) {
        this.id = id;
        this.studentName = studentName;
        this.subjectName = subjectName;
        this.marks = marks;
    }

    public Long getId() {
        return id;
    }

    public String getStudentName() {
        return studentName;
    }

    public String getSubjectName() {
        return subjectName;
    }

    public Double getMarks() {
        return marks;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public void setSubjectName(String subjectName) {
        this.subjectName = subjectName;
    }

    public void setMarks(Double marks) {
        this.marks = marks;
    }
}