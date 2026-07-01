package com.clearcareai.modules.doctor.controller;

import com.clearcareai.common.ApiResponse;
import com.clearcareai.common.AppConstants;
import com.clearcareai.common.PagedResponse;
import com.clearcareai.modules.doctor.dto.DoctorRequestDto;
import com.clearcareai.modules.doctor.dto.DoctorResponseDto;
import com.clearcareai.modules.doctor.service.DoctorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;

    @PostMapping("/profile")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<DoctorResponseDto> createProfile(@Valid @RequestBody DoctorRequestDto requestDto,
                                                          Authentication authentication) {
        DoctorResponseDto response = doctorService.createProfile(authentication.getName(), requestDto);
        return ApiResponse.success("Doctor profile created", response);
    }

    @GetMapping
    public ApiResponse<PagedResponse<DoctorResponseDto>> getDoctors(
            @RequestParam(required = false) String specialization,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_NUMBER) int page,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_SIZE) int size) {
        PagedResponse<DoctorResponseDto> response = doctorService.getDoctors(specialization, page, size);
        return ApiResponse.success("Doctors retrieved", response);
    }

    @GetMapping("/profile")
    public ApiResponse<DoctorResponseDto> getMyProfile(Authentication authentication) {
        DoctorResponseDto response = doctorService.getMyProfile(authentication.getName());
        return ApiResponse.success("Doctor profile retrieved", response);
    }

    @GetMapping("/{id}")
    public ApiResponse<DoctorResponseDto> getDoctorById(@PathVariable Long id) {
        DoctorResponseDto response = doctorService.getDoctorById(id);
        return ApiResponse.success("Doctor retrieved", response);
    }

    @PutMapping("/profile")
    public ApiResponse<DoctorResponseDto> updateProfile(@Valid @RequestBody DoctorRequestDto requestDto,
                                                          Authentication authentication) {
        DoctorResponseDto response = doctorService.updateProfile(authentication.getName(), requestDto);
        return ApiResponse.success("Doctor profile updated", response);
    }
}
