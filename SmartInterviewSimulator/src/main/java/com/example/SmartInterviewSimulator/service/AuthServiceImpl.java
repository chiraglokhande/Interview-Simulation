package com.example.SmartInterviewSimulator.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.SmartInterviewSimulator.dto.RegisterRequest;
import com.example.SmartInterviewSimulator.entity.User;
import com.example.SmartInterviewSimulator.repository.UserRepository;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private PasswordEncoder encoder;

    // ================= REGISTER =================
    @Override
    public String register(RegisterRequest request) {

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(
            encoder.encode(request.getPassword())
        );

        userRepo.save(user);

        return "User registered successfully";
    }

    // ================= LOGIN =================
    @Override
    public User login(
        String email,
        String password
    ) {

        User user = userRepo.findByEmail(email)
            .orElseThrow(() ->
                new RuntimeException("User not found")
            );

        if (!encoder.matches(
            password,
            user.getPassword()
        )) {
            throw new RuntimeException(
                "Invalid credentials"
            );
        }

        return user;
    }
}