package com.clearcareai.modules.patient.controller;

import com.clearcareai.common.ApiResponse;
import com.clearcareai.modules.patient.dto.PatientRequestDto;
import com.clearcareai.modules.patient.dto.PatientResponseDto;
import com.clearcareai.modules.patient.service.PatientService;
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
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    @PostMapping("/profile")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<PatientResponseDto> createProfile(@Valid @RequestBody PatientRequestDto requestDto,
                                                           Authentication authentication) {
        PatientResponseDto response = patientService.createProfile(authentication.getName(), requestDto);
        return ApiResponse.success("Patient profile created", response);
    }

    @GetMapping("/profile")
    public ApiResponse<PatientResponseDto> getMyProfile(Authentication authentication) {
        PatientResponseDto response = patientService.getMyProfile(authentication.getName());
        return ApiResponse.success("Patient profile retrieved", response);
    }

    @GetMapping("/{id}")
    public ApiResponse<PatientResponseDto> getPatientById(@PathVariable Long id) {
        PatientResponseDto response = patientService.getPatientById(id);
        return ApiResponse.success("Patient retrieved", response);
    }

    @PutMapping("/profile")
    public ApiResponse<PatientResponseDto> updateProfile(@Valid @RequestBody PatientRequestDto requestDto,
                                                           Authentication authentication) {
        PatientResponseDto response = patientService.updateProfile(authentication.getName(), requestDto);
        return ApiResponse.success("Patient profile updated", response);
    }
}
