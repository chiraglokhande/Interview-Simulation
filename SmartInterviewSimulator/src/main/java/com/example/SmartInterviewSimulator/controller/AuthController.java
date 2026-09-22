package com.example.SmartInterviewSimulator.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.SmartInterviewSimulator.dto.AuthResponse;
import com.example.SmartInterviewSimulator.dto.LoginRequest;
import com.example.SmartInterviewSimulator.dto.RegisterRequest;
import com.example.SmartInterviewSimulator.entity.User;
import com.example.SmartInterviewSimulator.security.JwtUtil;
import com.example.SmartInterviewSimulator.service.AuthService;
import com.example.SmartInterviewSimulator.service.AuthServiceImpl;

@RestController
@RequestMapping("/auth")
@CrossOrigin("*")
public class AuthController {

    @Autowired
    private AuthServiceImpl authService;

    @Autowired
    private JwtUtil jwtUtil;

    // ================= REGISTER =================
    @PostMapping("/register")
    public AuthResponse register(
        @RequestBody RegisterRequest request
    ) {
        return new AuthResponse(
            authService.register(request)
        );
    }

    // ================= LOGIN =================
    @PostMapping("/login")
    public Map<String, Object> login(
        @RequestBody LoginRequest req
    ) {

        User user = authService.login(
            req.getEmail(),
            req.getPassword()
        );

        String token =
            jwtUtil.generateToken(
                user.getEmail()
            );

        return Map.of(
            "token", token,
            "id", user.getId(),
            "name", user.getName()
        );
    }
}