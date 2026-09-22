package com.example.SmartInterviewSimulator.service;

import com.example.SmartInterviewSimulator.dto.RegisterRequest;
import com.example.SmartInterviewSimulator.entity.User;

public interface AuthService {

    String register(RegisterRequest request);

    User login(String email, String password);
}