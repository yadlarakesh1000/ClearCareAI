package com.clearcareai.modules.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminDashboardDto {

    private long totalUsers;
    private long totalDoctors;
    private long totalPatients;
    private long totalAppointments;
    private long totalReviews;
    private long totalFlaggedReviews;
}
