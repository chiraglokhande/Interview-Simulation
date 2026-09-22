package com.example.SmartInterviewSimulator.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.SmartInterviewSimulator.entity.Question;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByInterviewId(Long id);

	List<Question> findByRole(String role);

	List<Question> findByRoleAndDifficulty(String role, String difficulty);
}