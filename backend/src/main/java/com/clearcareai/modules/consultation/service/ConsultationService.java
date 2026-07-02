package com.clearcareai.modules.consultation.service;

import com.clearcareai.modules.consultation.dto.ConsultationRequestDto;
import com.clearcareai.modules.consultation.dto.ConsultationResponseDto;

public interface ConsultationService {

    ConsultationResponseDto startConsultation(String email, ConsultationRequestDto requestDto);

    ConsultationResponseDto updateConsultation(String email, Long id, ConsultationRequestDto requestDto);

    ConsultationResponseDto completeConsultation(String email, Long id);

    ConsultationResponseDto getConsultationById(String email, Long id);

    ConsultationResponseDto getConsultationByAppointmentId(String email, Long appointmentId);
}
