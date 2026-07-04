package com.clearcareai.modules.admin.controller;

import com.clearcareai.common.ApiResponse;
import com.clearcareai.common.AppConstants;
import com.clearcareai.common.PagedResponse;
import com.clearcareai.modules.admin.dto.AdminDashboardDto;
import com.clearcareai.modules.admin.dto.AdminUserDto;
import com.clearcareai.modules.admin.service.AdminService;
import com.clearcareai.modules.appointment.dto.AppointmentResponseDto;
import com.clearcareai.modules.doctor.dto.DoctorResponseDto;
import com.clearcareai.modules.review.dto.ReviewResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/users")
    public ApiResponse<PagedResponse<AdminUserDto>> getAllUsers(
            @RequestParam(required = false) String role,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_NUMBER) int page,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_SIZE) int size) {
        PagedResponse<AdminUserDto> response = adminService.getAllUsers(role, page, size);
        return ApiResponse.success("Users retrieved", response);
    }

    @PutMapping("/users/{id}/toggle-active")
    public ApiResponse<AdminUserDto> toggleUserActive(@PathVariable Long id) {
        AdminUserDto response = adminService.toggleUserActive(id);
        return ApiResponse.success("User active status toggled", response);
    }

    @GetMapping("/doctors")
    public ApiResponse<PagedResponse<DoctorResponseDto>> getAllDoctors(
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_NUMBER) int page,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_SIZE) int size) {
        PagedResponse<DoctorResponseDto> response = adminService.getAllDoctors(page, size);
        return ApiResponse.success("Doctors retrieved", response);
    }

    @GetMapping("/appointments")
    public ApiResponse<PagedResponse<AppointmentResponseDto>> getAllAppointments(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_NUMBER) int page,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_SIZE) int size) {
        PagedResponse<AppointmentResponseDto> response = adminService.getAllAppointments(status, date, page, size);
        return ApiResponse.success("Appointments retrieved", response);
    }

    @GetMapping("/reviews/flagged")
    public ApiResponse<PagedResponse<ReviewResponseDto>> getFlaggedReviews(
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_NUMBER) int page,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_SIZE) int size) {
        PagedResponse<ReviewResponseDto> response = adminService.getFlaggedReviews(page, size);
        return ApiResponse.success("Flagged reviews retrieved", response);
    }

    @PutMapping("/reviews/{id}/unflag")
    public ApiResponse<ReviewResponseDto> unflagReview(@PathVariable Long id) {
        ReviewResponseDto response = adminService.unflagReview(id);
        return ApiResponse.success("Review unflagged", response);
    }

    @DeleteMapping("/reviews/{id}")
    public ApiResponse<Void> deleteFlaggedReview(@PathVariable Long id) {
        adminService.deleteFlaggedReview(id);
        return ApiResponse.success("Review deleted", null);
    }

    @GetMapping("/dashboard")
    public ApiResponse<AdminDashboardDto> getDashboard() {
        AdminDashboardDto response = adminService.getDashboard();
        return ApiResponse.success("Dashboard retrieved", response);
    }
}
