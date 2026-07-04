package com.clearcareai.modules.analytics.controller;

import com.clearcareai.common.ApiResponse;
import com.clearcareai.modules.analytics.dto.DoctorAnalyticsDto;
import com.clearcareai.modules.analytics.dto.PlatformAnalyticsDto;
import com.clearcareai.modules.analytics.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/doctor/{doctorId}")
    public ApiResponse<DoctorAnalyticsDto> getDoctorAnalytics(@PathVariable Long doctorId, Authentication authentication) {
        DoctorAnalyticsDto response = analyticsService.getDoctorAnalytics(authentication.getName(), doctorId);
        return ApiResponse.success("Doctor analytics retrieved", response);
    }

    @GetMapping("/platform")
    public ApiResponse<PlatformAnalyticsDto> getPlatformAnalytics() {
        PlatformAnalyticsDto response = analyticsService.getPlatformAnalytics();
        return ApiResponse.success("Platform analytics retrieved", response);
    }
}
