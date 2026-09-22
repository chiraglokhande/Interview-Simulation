package com.example.SmartInterviewSimulator.repository;

import com.example.SmartInterviewSimulator.entity.Resume;
import com.example.SmartInterviewSimulator.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResumeRepository extends JpaRepository<Resume, Long> {

    List<Resume> findByUser(User user);

}
