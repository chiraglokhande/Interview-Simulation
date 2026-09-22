package com.example.SmartInterviewSimulator.controller;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.SmartInterviewSimulator.entity.Role;
import com.example.SmartInterviewSimulator.service.RoleService;

@RestController
@RequestMapping("/roles")
@CrossOrigin(origins = "*")
public class RoleController {

    @Autowired
    private RoleService service;

    @GetMapping
    public List<Role> getRoles() {
        return service.getAllRoles();
    }

    @PostMapping
    public Role addRole(@RequestBody Role role) {
        return service.addRole(role);
    }
}
