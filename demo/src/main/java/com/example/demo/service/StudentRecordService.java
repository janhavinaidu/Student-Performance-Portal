package com.example.demo.service;

import com.example.demo.entity.StudentRecord;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.StudentRecordRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StudentRecordService {

    private final StudentRecordRepository studentRecordRepository;

    public StudentRecordService(StudentRecordRepository studentRecordRepository) {
        this.studentRecordRepository = studentRecordRepository;
    }

    public StudentRecord saveRecord(StudentRecord studentRecord) {
        return studentRecordRepository.save(studentRecord);
    }

    public List<StudentRecord> getAllRecords() {
        return studentRecordRepository.findAll();
    }

    public List<StudentRecord> getRecordsSortedAsc() {
        return studentRecordRepository.findAllByOrderByMarksAsc();
    }

    public List<StudentRecord> getRecordsSortedDesc() {
        return studentRecordRepository.findAllByOrderByMarksDesc();
    }

    public List<StudentRecord> filterByMarks(Double minMarks, Double maxMarks) {
        return studentRecordRepository.findByMarksBetween(minMarks, maxMarks);
    }

    public List<StudentRecord> getRecordsBySubjectSortedAsc(String subjectName) {
        return studentRecordRepository.findBySubjectNameOrderByMarksAsc(subjectName);
    }

    public List<StudentRecord> getRecordsBySubjectSortedDesc(String subjectName) {
        return studentRecordRepository.findBySubjectNameOrderByMarksDesc(subjectName);
    }

    public List<String> getDistinctSubjects() {
        return studentRecordRepository.findDistinctSubjects();
    }

    public StudentRecord getRecordById(Long id) {
        return studentRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student record not found with id: " + id));
    }

    public StudentRecord updateRecord(Long id, StudentRecord updatedRecord) {
        StudentRecord existingRecord = getRecordById(id);

        existingRecord.setStudentName(updatedRecord.getStudentName());
        existingRecord.setSubjectName(updatedRecord.getSubjectName());
        existingRecord.setMarks(updatedRecord.getMarks());

        return studentRecordRepository.save(existingRecord);
    }

    public void deleteRecord(Long id) {
        StudentRecord existingRecord = getRecordById(id);
        studentRecordRepository.delete(existingRecord);
    }
}