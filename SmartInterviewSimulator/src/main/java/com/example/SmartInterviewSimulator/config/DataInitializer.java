package com.example.SmartInterviewSimulator.config;

import com.example.SmartInterviewSimulator.entity.Role;
import com.example.SmartInterviewSimulator.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Override
    public void run(String... args) throws Exception {
        if (roleRepository.count() == 0) {
            List<String> defaultRoles = List.of(
                "Java Developer",
                "Frontend Developer",
                "Full Stack Developer",
                "Python Developer",
                "DevOps Engineer",
                "Data Scientist"
            );

            for (String roleName : defaultRoles) {
                Role role = new Role();
                role.setName(roleName);
                roleRepository.save(role);
            }
            System.out.println("✅ Initialized default interview roles in database.");
        }
    }
}
