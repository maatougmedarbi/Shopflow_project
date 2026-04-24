package com.shopflow.controller;

import com.shopflow.dto.CustomerDashboardResponse;
import com.shopflow.service.DashboardService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> admin() {
        return dashboardService.adminStats();
    }

    @GetMapping("/seller")
    @PreAuthorize("hasAnyRole('SELLER','ADMIN')")
    public Map<String, Object> seller() {
        return dashboardService.sellerStats();
    }

    @GetMapping("/customer")
    @PreAuthorize("hasAnyRole('CUSTOMER','ADMIN')")
    public CustomerDashboardResponse customer() {
        return dashboardService.customerDashboard();
    }
}
