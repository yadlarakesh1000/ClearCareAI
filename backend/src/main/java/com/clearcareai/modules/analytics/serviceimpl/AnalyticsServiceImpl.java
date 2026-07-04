package com.clearcareai.modules.analytics.serviceimpl;

import com.clearcareai.exception.ResourceNotFoundException;
import com.clearcareai.modules.analytics.dto.DoctorAnalyticsDto;
import com.clearcareai.modules.analytics.dto.PlatformAnalyticsDto;
import com.clearcareai.modules.analytics.service.AnalyticsService;
import com.clearcareai.modules.appointment.entity.Appointment;
import com.clearcareai.modules.appointment.repository.AppointmentRepository;
import com.clearcareai.modules.auth.entity.User;
import com.clearcareai.modules.auth.repository.UserRepository;
import com.clearcareai.modules.doctor.entity.Doctor;
import com.clearcareai.modules.doctor.repository.DoctorRepository;
import com.clearcareai.modules.review.entity.Review;
import com.clearcareai.modules.review.dto.ReviewResponseDto;
import com.clearcareai.modules.review.mapper.ReviewMapper;
import com.clearcareai.modules.review.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    private final ReviewRepository reviewRepository;
    private final ReviewMapper reviewMapper;

    @Override
    public DoctorAnalyticsDto getDoctorAnalytics(String email, Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", doctorId));

        User requester = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        if (!doctor.getUser().getId().equals(requester.getId())) {
            throw new AccessDeniedException("You can only view your own analytics");
        }

        long totalAppointments = appointmentRepository.countByDoctorId(doctorId);
        long completedAppointments = appointmentRepository.countByDoctorIdAndStatus(doctorId, Appointment.Status.COMPLETED);
        long cancelledAppointments = appointmentRepository.countByDoctorIdAndStatus(doctorId, Appointment.Status.CANCELLED);

        long totalReviews = reviewRepository.countByDoctorIdAndStatus(doctorId, Review.Status.COMPLETED);
        double averageRating = roundToOneDecimal(reviewRepository.findAverageRatingByDoctorId(doctorId));

        Map<String, Long> sentimentBreakdown = new LinkedHashMap<>();
        sentimentBreakdown.put("positive", reviewRepository.countByDoctorIdAndSentiment(doctorId, Review.Sentiment.POSITIVE));
        sentimentBreakdown.put("neutral", reviewRepository.countByDoctorIdAndSentiment(doctorId, Review.Sentiment.NEUTRAL));
        sentimentBreakdown.put("negative", reviewRepository.countByDoctorIdAndSentiment(doctorId, Review.Sentiment.NEGATIVE));

        YearMonth currentMonth = YearMonth.now();
        long monthlyAppointments = appointmentRepository.countByDoctorIdAndAppointmentDateBetween(
                doctorId, currentMonth.atDay(1), currentMonth.atEndOfMonth());

        // Last 6 months (oldest first) for the analytics bar chart, keyed "yyyy-MM"
        Map<String, Long> monthlyBreakdown = new LinkedHashMap<>();
        for (int i = 5; i >= 0; i--) {
            YearMonth month = currentMonth.minusMonths(i);
            monthlyBreakdown.put(month.toString(), appointmentRepository
                    .countByDoctorIdAndAppointmentDateBetween(doctorId, month.atDay(1), month.atEndOfMonth()));
        }

        List<Review> recent = reviewRepository.findTop5ByDoctorIdOrderByCreatedAtDesc(doctorId);
        List<ReviewResponseDto> recentReviews = recent.stream().map(reviewMapper::toResponseDto).toList();

        return DoctorAnalyticsDto.builder()
                .doctorId(doctor.getId())
                .doctorName(doctor.getUser().getFirstName() + " " + doctor.getUser().getLastName())
                .totalAppointments(totalAppointments)
                .completedAppointments(completedAppointments)
                .cancelledAppointments(cancelledAppointments)
                .totalReviews(totalReviews)
                .averageRating(averageRating)
                .sentimentBreakdown(sentimentBreakdown)
                .monthlyAppointments(monthlyAppointments)
                .monthlyBreakdown(monthlyBreakdown)
                .recentReviews(recentReviews)
                .build();
    }

    @Override
    public PlatformAnalyticsDto getPlatformAnalytics() {
        long totalUsers = userRepository.count();
        long totalDoctors = userRepository.countByRole(User.Role.ROLE_DOCTOR);
        long totalPatients = userRepository.countByRole(User.Role.ROLE_PATIENT);
        long totalAdmins = userRepository.countByRole(User.Role.ROLE_ADMIN);

        long totalAppointments = appointmentRepository.count();
        long bookedAppointments = appointmentRepository.countByStatus(Appointment.Status.BOOKED);
        long completedAppointments = appointmentRepository.countByStatus(Appointment.Status.COMPLETED);
        long cancelledAppointments = appointmentRepository.countByStatus(Appointment.Status.CANCELLED);

        long totalReviews = reviewRepository.count();
        double averagePlatformRating = roundToOneDecimal(reviewRepository.findAveragePlatformRating());
        long totalVoiceReviews = reviewRepository.countBySource(Review.Source.VOICE);
        long totalTextReviews = reviewRepository.countBySource(Review.Source.TEXT);
        long totalFlaggedReviews = reviewRepository.countByIsFlaggedTrue();

        return PlatformAnalyticsDto.builder()
                .totalUsers(totalUsers)
                .totalDoctors(totalDoctors)
                .totalPatients(totalPatients)
                .totalAdmins(totalAdmins)
                .totalAppointments(totalAppointments)
                .bookedAppointments(bookedAppointments)
                .completedAppointments(completedAppointments)
                .cancelledAppointments(cancelledAppointments)
                .totalReviews(totalReviews)
                .averagePlatformRating(averagePlatformRating)
                .totalVoiceReviews(totalVoiceReviews)
                .totalTextReviews(totalTextReviews)
                .totalFlaggedReviews(totalFlaggedReviews)
                .build();
    }

    private double roundToOneDecimal(Double value) {
        if (value == null) {
            return 0.0;
        }
        return Math.round(value * 10.0) / 10.0;
    }
}
