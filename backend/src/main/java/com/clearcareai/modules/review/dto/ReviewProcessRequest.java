package com.clearcareai.modules.review.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewProcessRequest {

    private String cleanedReview;
    private String summary;
    private String sentiment;
    private Integer rating;
    private String recovered;
    private String recommendDoctor;
    private String patientFeedback;
    private String improvementSuggestions;
}
