package com.clearcareai.modules.analytics.dto;

import com.clearcareai.modules.review.dto.ReviewResponseDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorAnalyticsDto {

    private Long doctorId;
    private String doctorName;
    private long totalAppointments;
    private long completedAppointments;
    private long cancelledAppointments;
    private long totalReviews;
    private double averageRating;
    private Map<String, Long> sentimentBreakdown;
    private long monthlyAppointments;
    private Map<String, Long> monthlyBreakdown;
    private List<ReviewResponseDto> recentReviews;
}
