package com.clearcareai.modules.admin.service;

import com.clearcareai.common.PagedResponse;
import com.clearcareai.modules.admin.dto.AdminDashboardDto;
import com.clearcareai.modules.admin.dto.AdminUserDto;
import com.clearcareai.modules.appointment.dto.AppointmentResponseDto;
import com.clearcareai.modules.doctor.dto.DoctorResponseDto;
import com.clearcareai.modules.review.dto.ReviewResponseDto;

import java.time.LocalDate;

public interface AdminService {

    PagedResponse<AdminUserDto> getAllUsers(String role, int page, int size);

    AdminUserDto toggleUserActive(Long userId);

    PagedResponse<DoctorResponseDto> getAllDoctors(int page, int size);

    PagedResponse<AppointmentResponseDto> getAllAppointments(String status, LocalDate date, int page, int size);

    PagedResponse<ReviewResponseDto> getFlaggedReviews(int page, int size);

    ReviewResponseDto unflagReview(Long reviewId);

    void deleteFlaggedReview(Long reviewId);

    AdminDashboardDto getDashboard();
}
