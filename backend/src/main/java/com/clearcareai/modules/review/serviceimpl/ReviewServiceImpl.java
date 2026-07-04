package com.clearcareai.modules.review.serviceimpl;

import com.clearcareai.common.PagedResponse;
import com.clearcareai.exception.ResourceNotFoundException;
import com.clearcareai.modules.auth.entity.User;
import com.clearcareai.modules.auth.repository.UserRepository;
import com.clearcareai.modules.consultation.entity.Consultation;
import com.clearcareai.modules.consultation.repository.ConsultationRepository;
import com.clearcareai.modules.doctor.entity.Doctor;
import com.clearcareai.modules.doctor.repository.DoctorRepository;
import com.clearcareai.modules.patient.entity.Patient;
import com.clearcareai.modules.patient.repository.PatientRepository;
import com.clearcareai.modules.review.dto.ReviewFlagRequest;
import com.clearcareai.modules.review.dto.ReviewProcessRequest;
import com.clearcareai.modules.review.dto.ReviewRequestDto;
import com.clearcareai.modules.review.dto.ReviewResponseDto;
import com.clearcareai.modules.review.entity.Review;
import com.clearcareai.modules.review.exception.ReviewException;
import com.clearcareai.modules.review.mapper.ReviewMapper;
import com.clearcareai.modules.review.repository.ReviewRepository;
import com.clearcareai.modules.review.service.ReviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ConsultationRepository consultationRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    private final ReviewMapper reviewMapper;

    @Override
    @Transactional
    public ReviewResponseDto createTextReview(String email, ReviewRequestDto requestDto) {
        Patient patient = getPatientByEmail(email);

        Consultation consultation = consultationRepository.findById(requestDto.getConsultationId())
                .orElseThrow(() -> new ResourceNotFoundException("Consultation", "id", requestDto.getConsultationId()));

        if (!consultation.getPatient().getId().equals(patient.getId())) {
            throw new AccessDeniedException("You can only review your own consultations");
        }

        if (consultation.getStatus() != Consultation.Status.COMPLETED) {
            throw new ReviewException("A review can only be submitted for a completed consultation");
        }

        // A PENDING voice review (call not yet answered) does not block a text review:
        // the patient answering by text converts it and stops further scheduled calls.
        Review existing = reviewRepository.findByConsultationId(consultation.getId()).orElse(null);
        if (existing != null) {
            if (existing.getSource() == Review.Source.VOICE && existing.getStatus() == Review.Status.PENDING) {
                existing.setRawTranscript(requestDto.getRawTranscript());
                existing.setRating(requestDto.getRating());
                existing.setSource(Review.Source.TEXT);
                existing.setStatus(Review.Status.COMPLETED);

                Review converted = reviewRepository.save(existing);
                log.info("Converted pending voice review {} to a completed text review", converted.getId());
                return reviewMapper.toResponseDto(converted);
            }
            throw new ReviewException("A review already exists for this consultation");
        }

        Review review = Review.builder()
                .consultation(consultation)
                .patient(patient)
                .doctor(consultation.getDoctor())
                .rawTranscript(requestDto.getRawTranscript())
                .rating(requestDto.getRating())
                .status(Review.Status.COMPLETED)
                .source(Review.Source.TEXT)
                .isFlagged(false)
                .build();

        Review saved = reviewRepository.save(review);
        log.info("Created text review {} for consultation {} with status COMPLETED", saved.getId(), consultation.getId());

        return reviewMapper.toResponseDto(saved);
    }

    @Override
    public PagedResponse<ReviewResponseDto> getReviewsByDoctor(Long doctorId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Review> reviewPage = reviewRepository.findByDoctorId(doctorId, pageable);
        return toPagedResponse(reviewPage);
    }

    @Override
    public PagedResponse<ReviewResponseDto> getMyReviews(String email, int page, int size) {
        Patient patient = getPatientByEmail(email);
        Pageable pageable = PageRequest.of(page, size);
        Page<Review> reviewPage = reviewRepository.findByPatientId(patient.getId(), pageable);
        return toPagedResponse(reviewPage);
    }

    @Override
    public ReviewResponseDto getReviewById(String email, Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", id));

        validateViewAccess(email, review);

        return reviewMapper.toResponseDto(review);
    }

    @Override
    @Transactional
    public ReviewResponseDto processReview(Long id, ReviewProcessRequest request) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", id));

        if (review.getStatus() != Review.Status.PENDING) {
            throw new ReviewException("Only a PENDING review can be processed — this review is already " + review.getStatus());
        }

        if (StringUtils.hasText(request.getCleanedReview())) {
            review.setCleanedReview(request.getCleanedReview());
        }
        if (StringUtils.hasText(request.getSummary())) {
            review.setSummary(request.getSummary());
        }
        if (StringUtils.hasText(request.getSentiment())) {
            review.setSentiment(Review.Sentiment.valueOf(request.getSentiment()));
        }
        if (request.getRating() != null) {
            review.setRating(request.getRating());
        }
        if (StringUtils.hasText(request.getRecovered())) {
            review.setRecovered(Review.TriState.valueOf(request.getRecovered()));
        }
        if (StringUtils.hasText(request.getRecommendDoctor())) {
            review.setRecommendDoctor(Review.TriState.valueOf(request.getRecommendDoctor()));
        }
        if (StringUtils.hasText(request.getPatientFeedback())) {
            review.setPatientFeedback(request.getPatientFeedback());
        }
        if (StringUtils.hasText(request.getImprovementSuggestions())) {
            review.setImprovementSuggestions(request.getImprovementSuggestions());
        }

        review.setStatus(Review.Status.COMPLETED);

        Review saved = reviewRepository.save(review);
        log.info("Processed review {} - status set to COMPLETED", id);

        return reviewMapper.toResponseDto(saved);
    }

    @Override
    @Transactional
    public ReviewResponseDto flagReview(String email, Long id, ReviewFlagRequest request) {
        User user = getUserByEmail(email);
        Doctor doctor = doctorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found for user: " + email));

        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", id));

        if (!review.getDoctor().getId().equals(doctor.getId())) {
            throw new AccessDeniedException("You can only flag reviews for your own consultations");
        }

        if (review.getStatus() != Review.Status.COMPLETED) {
            throw new ReviewException("Only completed reviews can be flagged");
        }

        review.setIsFlagged(true);
        review.setFlagReason(request.getFlagReason());
        review.setFlaggedAt(LocalDateTime.now());

        Review saved = reviewRepository.save(review);
        log.info("Flagged review {} by doctor {}", id, doctor.getId());

        return reviewMapper.toResponseDto(saved);
    }

    @Override
    public ReviewResponseDto getReviewByCallId(String callId) {
        Review review = reviewRepository.findByOmnidimCallId(callId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found for call id: " + callId));

        return reviewMapper.toResponseDto(review);
    }

    private void validateViewAccess(String email, Review review) {
        User user = getUserByEmail(email);

        boolean isOwnerPatient = user.getRole() == User.Role.ROLE_PATIENT
                && review.getPatient().getUser().getId().equals(user.getId());
        boolean isOwnerDoctor = user.getRole() == User.Role.ROLE_DOCTOR
                && review.getDoctor().getUser().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == User.Role.ROLE_ADMIN;

        if (!isOwnerPatient && !isOwnerDoctor && !isAdmin) {
            throw new AccessDeniedException("You are not authorized to view this review");
        }
    }

    private PagedResponse<ReviewResponseDto> toPagedResponse(Page<Review> reviewPage) {
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

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    private Patient getPatientByEmail(String email) {
        User user = getUserByEmail(email);
        return patientRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found for user: " + email));
    }
}
