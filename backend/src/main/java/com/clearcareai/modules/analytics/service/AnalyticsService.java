package com.clearcareai.modules.analytics.service;

import com.clearcareai.modules.analytics.dto.DoctorAnalyticsDto;
import com.clearcareai.modules.analytics.dto.PlatformAnalyticsDto;

public interface AnalyticsService {

    DoctorAnalyticsDto getDoctorAnalytics(String email, Long doctorId);

    PlatformAnalyticsDto getPlatformAnalytics();
}
