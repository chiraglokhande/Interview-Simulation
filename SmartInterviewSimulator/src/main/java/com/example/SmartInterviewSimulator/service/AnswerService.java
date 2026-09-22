package com.example.SmartInterviewSimulator.service;
import org.springframework.stereotype.Service;

import com.example.SmartInterviewSimulator.dto.AnswerRequest;
import com.example.SmartInterviewSimulator.entity.Answer;

@Service
public interface AnswerService {
    Answer submitAnswer(AnswerRequest request);
    int getTotalScore(Long interviewId);
}