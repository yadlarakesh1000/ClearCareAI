package com.clearcareai.modules.consultation.controller;

import com.clearcareai.common.ApiResponse;
import com.clearcareai.modules.consultation.dto.ConsultationRequestDto;
import com.clearcareai.modules.consultation.dto.ConsultationResponseDto;
import com.clearcareai.modules.consultation.service.ConsultationService;
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
@RequestMapping("/api/consultations")
@RequiredArgsConstructor
public class ConsultationController {

    private final ConsultationService consultationService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ConsultationResponseDto> startConsultation(@Valid @RequestBody ConsultationRequestDto requestDto,
                                                                    Authentication authentication) {
        ConsultationResponseDto response = consultationService.startConsultation(authentication.getName(), requestDto);
        return ApiResponse.success("Consultation started", response);
    }

    @PutMapping("/{id}")
    public ApiResponse<ConsultationResponseDto> updateConsultation(@PathVariable Long id,
                                                                     @Valid @RequestBody ConsultationRequestDto requestDto,
                                                                     Authentication authentication) {
        ConsultationResponseDto response = consultationService.updateConsultation(authentication.getName(), id, requestDto);
        return ApiResponse.success("Consultation updated", response);
    }

    @PutMapping("/{id}/complete")
    public ApiResponse<ConsultationResponseDto> completeConsultation(@PathVariable Long id, Authentication authentication) {
        ConsultationResponseDto response = consultationService.completeConsultation(authentication.getName(), id);
        return ApiResponse.success("Consultation completed", response);
    }

    @GetMapping("/{id}")
    public ApiResponse<ConsultationResponseDto> getConsultationById(@PathVariable Long id, Authentication authentication) {
        ConsultationResponseDto response = consultationService.getConsultationById(authentication.getName(), id);
        return ApiResponse.success("Consultation retrieved", response);
    }

    @GetMapping("/appointment/{appointmentId}")
    public ApiResponse<ConsultationResponseDto> getConsultationByAppointmentId(@PathVariable Long appointmentId,
                                                                                 Authentication authentication) {
        ConsultationResponseDto response =
                consultationService.getConsultationByAppointmentId(authentication.getName(), appointmentId);
        return ApiResponse.success("Consultation retrieved", response);
    }
}
