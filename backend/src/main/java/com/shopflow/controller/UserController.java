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
}