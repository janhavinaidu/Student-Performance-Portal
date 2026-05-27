package com.example.demo.controller;

import com.example.demo.entity.StudentRecord;
import com.example.demo.service.StudentRecordService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "http://localhost:3000")
public class StudentRecordController {

    private final StudentRecordService studentRecordService;

    public StudentRecordController(StudentRecordService studentRecordService) {
        this.studentRecordService = studentRecordService;
    }

    @PostMapping
    public ResponseEntity<StudentRecord> createRecord(@RequestBody StudentRecord studentRecord) {
        return ResponseEntity.ok(studentRecordService.saveRecord(studentRecord));
    }

    @GetMapping
    public ResponseEntity<List<StudentRecord>> getAllRecords() {
        return ResponseEntity.ok(studentRecordService.getAllRecords());
    }

    @GetMapping("/sort/asc")
    public ResponseEntity<List<StudentRecord>> sortAscending() {
        return ResponseEntity.ok(studentRecordService.getRecordsSortedAsc());
    }

    @GetMapping("/sort/desc")
    public ResponseEntity<List<StudentRecord>> sortDescending() {
        return ResponseEntity.ok(studentRecordService.getRecordsSortedDesc());
    }

    @GetMapping("/filter")
    public ResponseEntity<List<StudentRecord>> filterByMarks(
            @RequestParam Double min,
            @RequestParam Double max
    ) {
        return ResponseEntity.ok(studentRecordService.filterByMarks(min, max));
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudentRecord> getById(@PathVariable Long id) {
        return ResponseEntity.ok(studentRecordService.getRecordById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StudentRecord> updateRecord(
            @PathVariable Long id,
            @RequestBody StudentRecord studentRecord
    ) {
        return ResponseEntity.ok(studentRecordService.updateRecord(id, studentRecord));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteRecord(@PathVariable Long id) {
        studentRecordService.deleteRecord(id);
        return ResponseEntity.ok("Record deleted successfully");
    }
    @GetMapping("/subjects")
    public ResponseEntity<List<String>> getSubjects() {
        return ResponseEntity.ok(studentRecordService.getDistinctSubjects());
    }

    @GetMapping("/subject/sort/asc")
    public ResponseEntity<List<StudentRecord>> sortBySubjectAsc(
            @RequestParam String subject) {
        return ResponseEntity.ok(studentRecordService.getRecordsBySubjectSortedAsc(subject));
    }

    @GetMapping("/subject/sort/desc")
    public ResponseEntity<List<StudentRecord>> sortBySubjectDesc(
            @RequestParam String subject) {
        return ResponseEntity.ok(studentRecordService.getRecordsBySubjectSortedDesc(subject));
    }
}