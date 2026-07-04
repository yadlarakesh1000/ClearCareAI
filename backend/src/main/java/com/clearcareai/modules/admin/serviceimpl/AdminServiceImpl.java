package com.clearcareai.modules.admin.serviceimpl;

import com.clearcareai.common.PagedResponse;
import com.clearcareai.exception.BadRequestException;
import com.clearcareai.exception.ResourceNotFoundException;
import com.clearcareai.modules.admin.dto.AdminDashboardDto;
import com.clearcareai.modules.admin.dto.AdminUserDto;
import com.clearcareai.modules.admin.service.AdminService;
import com.clearcareai.modules.appointment.dto.AppointmentResponseDto;
import com.clearcareai.modules.appointment.entity.Appointment;
import com.clearcareai.modules.appointment.mapper.AppointmentMapper;
import com.clearcareai.modules.appointment.repository.AppointmentRepository;
import com.clearcareai.modules.auth.entity.User;
import com.clearcareai.modules.auth.repository.UserRepository;
import com.clearcareai.modules.doctor.dto.DoctorResponseDto;
import com.clearcareai.modules.doctor.repository.DoctorRepository;
import com.clearcareai.modules.doctor.service.DoctorService;
import com.clearcareai.modules.patient.repository.PatientRepository;
import com.clearcareai.modules.review.dto.ReviewResponseDto;
import com.clearcareai.modules.review.entity.Review;
import com.clearcareai.modules.review.mapper.ReviewMapper;
import com.clearcareai.modules.review.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final ReviewRepository reviewRepository;
    private final DoctorService doctorService;
    private final AppointmentMapper appointmentMapper;
    private final ReviewMapper reviewMapper;

    @Override
    public PagedResponse<AdminUserDto> getAllUsers(String role, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        Page<User> userPage = StringUtils.hasText(role)
                ? userRepository.findByRole(User.Role.valueOf(role), pageable)
                : userRepository.findAll(pageable);

        List<AdminUserDto> content = userPage.getContent().stream()
                .map(this::toAdminUserDto)
                .toList();

        return new PagedResponse<>(
                content,
                userPage.getNumber(),
                userPage.getSize(),
                userPage.getTotalElements(),
                userPage.getTotalPages(),
                userPage.isLast()
        );
    }

    @Override
    @Transactional
    public AdminUserDto toggleUserActive(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        user.setIsActive(!Boolean.TRUE.equals(user.getIsActive()));
        User saved = userRepository.save(user);
        log.info("Toggled active status for user {} to {}", userId, saved.getIsActive());

        return toAdminUserDto(saved);
    }

    @Override
    public PagedResponse<DoctorResponseDto> getAllDoctors(int page, int size) {
        return doctorService.getDoctors(null, page, size);
    }

    @Override
    public PagedResponse<AppointmentResponseDto> getAllAppointments(String status, LocalDate date, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        Page<Appointment> appointmentPage;
        if (StringUtils.hasText(status) && date != null) {
            appointmentPage = appointmentRepository.findByStatusAndAppointmentDate(
                    Appointment.Status.valueOf(status), date, pageable);
        } else if (StringUtils.hasText(status)) {
            appointmentPage = appointmentRepository.findByStatus(Appointment.Status.valueOf(status), pageable);
        } else if (date != null) {
            appointmentPage = appointmentRepository.findByAppointmentDate(date, pageable);
        } else {
            appointmentPage = appointmentRepository.findAll(pageable);
        }

        List<AppointmentResponseDto> content = appointmentPage.getContent().stream()
                .map(appointmentMapper::toResponseDto)
                .toList();

        return new PagedResponse<>(
                content,
                appointmentPage.getNumber(),
                appointmentPage.getSize(),
                appointmentPage.getTotalElements(),
                appointmentPage.getTotalPages(),
                appointmentPage.isLast()
        );
    }

    @Override
    public PagedResponse<ReviewResponseDto> getFlaggedReviews(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Review> reviewPage = reviewRepository.findByIsFlaggedTrue(pageable);

        List<ReviewResponseDto> content = reviewPage.getContent().stream()
                .map(reviewMapper::toResponseDto)
                .toList();

        return new PagedResponse<>(
                content,
                reviewPage.getNumber(),
                reviewPage.getSize(),
                reviewPage.getTotalElements(),
                reviewPage.getTotalPages(),
                reviewPage.isLast()
        );
    }

    @Override
    @Transactional
    public ReviewResponseDto unflagReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));

        if (!Boolean.TRUE.equals(review.getIsFlagged())) {
            throw new BadRequestException("Review is not flagged");
        }

        review.setIsFlagged(false);
        review.setFlagReason(null);
        review.setFlaggedAt(null);

        Review saved = reviewRepository.save(review);
        log.info("Unflagged review {}", reviewId);

        return reviewMapper.toResponseDto(saved);
    }

    @Override
    @Transactional
    public void deleteFlaggedReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));

        if (!Boolean.TRUE.equals(review.getIsFlagged())) {
            throw new BadRequestException("Only flagged reviews can be deleted");
        }

        reviewRepository.delete(review);
        log.info("Deleted flagged review {}", reviewId);
    }

    @Override
    public AdminDashboardDto getDashboard() {
        return AdminDashboardDto.builder()
                .totalUsers(userRepository.count())
                .totalDoctors(doctorRepository.count())
                .totalPatients(patientRepository.count())
                .totalAppointments(appointmentRepository.count())
                .totalReviews(reviewRepository.count())
                .totalFlaggedReviews(reviewRepository.countByIsFlaggedTrue())
                .build();
    }

    private AdminUserDto toAdminUserDto(User user) {
        return AdminUserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
