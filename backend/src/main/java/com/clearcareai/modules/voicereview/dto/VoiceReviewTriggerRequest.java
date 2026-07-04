package com.clearcareai.modules.voicereview.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VoiceReviewTriggerRequest {

    @NotNull(message = "Consultation ID is required")
    private Long consultationId;
}
