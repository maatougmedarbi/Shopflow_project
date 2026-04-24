package com.shopflow.controller;

import com.shopflow.model.User;
import com.shopflow.service.UserService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public User createUser(@RequestBody User user) {
        return userService.createUser(user);
    }

    @GetMapping("/me")
    public User getMe() {
        return userService.getCurrentUser();
    }

    @PutMapping("/me")
    public User updateMe(@RequestBody User updated) {
        return userService.updateUser(updated);
    }

    @GetMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public java.util.List<User> getAll() {
        return userService.getAll();
    }

    @PutMapping("/{id}/toggle")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public User toggleStatus(@PathVariable Long id) {
        return userService.toggleStatus(id);
    }
}