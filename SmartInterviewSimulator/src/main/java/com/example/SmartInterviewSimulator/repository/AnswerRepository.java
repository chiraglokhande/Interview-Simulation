package com.example.SmartInterviewSimulator.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.SmartInterviewSimulator.entity.Answer;

@Repository
public interface AnswerRepository extends JpaRepository<Answer, Long> {

	List<Answer> findByQuestionInterviewId(Long interviewId);}