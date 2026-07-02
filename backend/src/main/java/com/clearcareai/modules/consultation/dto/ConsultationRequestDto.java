package com.clearcareai.modules.consultation.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConsultationRequestDto {

    private Long appointmentId;

    private String diagnosis;

    private String prescription;

    private String notes;
}
