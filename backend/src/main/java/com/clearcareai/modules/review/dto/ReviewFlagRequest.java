package com.clearcareai.modules.review.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewFlagRequest {

    @NotBlank(message = "Flag reason is required")
    private String flagReason;
}
