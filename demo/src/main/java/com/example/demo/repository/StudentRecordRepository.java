package com.example.demo.repository;

import com.example.demo.entity.StudentRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface StudentRecordRepository extends JpaRepository<StudentRecord, Long> {

    List<StudentRecord> findAllByOrderByMarksAsc();

    List<StudentRecord> findAllByOrderByMarksDesc();

    List<StudentRecord> findByMarksBetween(Double minMarks, Double maxMarks);

    List<StudentRecord> findBySubjectNameOrderByMarksAsc(String subjectName);

    List<StudentRecord> findBySubjectNameOrderByMarksDesc(String subjectName);

    @Query("SELECT DISTINCT s.subjectName FROM StudentRecord s")
    List<String> findDistinctSubjects();
}