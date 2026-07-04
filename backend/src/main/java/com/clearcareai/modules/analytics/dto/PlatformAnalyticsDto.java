package com.clearcareai.modules.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlatformAnalyticsDto {

    private long totalUsers;
    private long totalDoctors;
    private long totalPatients;
    private long totalAdmins;
    private long totalAppointments;
    private long bookedAppointments;
    private long completedAppointments;
    private long cancelledAppointments;
    private long totalReviews;
    private double averagePlatformRating;
    private long totalVoiceReviews;
    private long totalTextReviews;
    private long totalFlaggedReviews;
}
