package com.clearcareai.modules.review.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewResponseDto {

    private Long id;
    private Long consultationId;
    private Long patientId;
    private String patientName;
    private Long doctorId;
    private String doctorName;
    private String rawTranscript;
    private String cleanedReview;
    private String summary;
    private String sentiment;
    private Integer rating;
    private String status;
    private String source;
    private String omnidimCallId;
    private String recovered;
    private String recommendDoctor;
    private String patientFeedback;
    private String improvementSuggestions;
    private Boolean isFlagged;
    private String flagReason;
    private LocalDateTime flaggedAt;
}
