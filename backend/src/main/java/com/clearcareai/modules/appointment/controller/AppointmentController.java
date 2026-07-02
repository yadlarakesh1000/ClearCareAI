package com.clearcareai.modules.appointment.controller;

import com.clearcareai.common.ApiResponse;
import com.clearcareai.common.AppConstants;
import com.clearcareai.common.PagedResponse;
import com.clearcareai.modules.appointment.dto.AppointmentRequestDto;
import com.clearcareai.modules.appointment.dto.AppointmentResponseDto;
import com.clearcareai.modules.appointment.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<AppointmentResponseDto> createAppointment(@Valid @RequestBody AppointmentRequestDto requestDto,
                                                                   Authentication authentication) {
        AppointmentResponseDto response = appointmentService.createAppointment(authentication.getName(), requestDto);
        return ApiResponse.success("Appointment booked successfully", response);
    }

    @GetMapping("/my")
    public ApiResponse<PagedResponse<AppointmentResponseDto>> getMyAppointments(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_NUMBER) int page,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_SIZE) int size,
            Authentication authentication) {
        PagedResponse<AppointmentResponseDto> response =
                appointmentService.getMyAppointments(authentication.getName(), status, page, size);
        return ApiResponse.success("Appointments retrieved", response);
    }

    @GetMapping("/doctor")
    public ApiResponse<PagedResponse<AppointmentResponseDto>> getDoctorAppointments(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_NUMBER) int page,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_SIZE) int size,
            Authentication authentication) {
        PagedResponse<AppointmentResponseDto> response =
                appointmentService.getDoctorAppointments(authentication.getName(), status, date, page, size);
        return ApiResponse.success("Appointments retrieved", response);
    }

    @GetMapping("/{id}")
    public ApiResponse<AppointmentResponseDto> getAppointmentById(@PathVariable Long id, Authentication authentication) {
        AppointmentResponseDto response = appointmentService.getAppointmentById(authentication.getName(), id);
        return ApiResponse.success("Appointment retrieved", response);
    }

    @PutMapping("/{id}/cancel")
    public ApiResponse<AppointmentResponseDto> cancelAppointment(@PathVariable Long id, Authentication authentication) {
        AppointmentResponseDto response = appointmentService.cancelAppointment(authentication.getName(), id);
        return ApiResponse.success("Appointment cancelled", response);
    }

    @GetMapping
    public ApiResponse<PagedResponse<AppointmentResponseDto>> getAllAppointments(
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_NUMBER) int page,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_SIZE) int size) {
        PagedResponse<AppointmentResponseDto> response = appointmentService.getAllAppointments(page, size);
        return ApiResponse.success("Appointments retrieved", response);
    }
}
