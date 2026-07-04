package com.clearcareai.modules.voicereview.serviceimpl;

import com.clearcareai.exception.BadRequestException;
import com.clearcareai.exception.ResourceNotFoundException;
import com.clearcareai.modules.auth.entity.User;
import com.clearcareai.modules.auth.repository.UserRepository;
import com.clearcareai.modules.consultation.entity.Consultation;
import com.clearcareai.modules.consultation.repository.ConsultationRepository;
import com.clearcareai.modules.doctor.entity.Doctor;
import com.clearcareai.modules.doctor.repository.DoctorRepository;
import com.clearcareai.modules.review.entity.Review;
import com.clearcareai.modules.review.repository.ReviewRepository;
import com.clearcareai.modules.voicereview.dto.OmniDimCallResponse;
import com.clearcareai.modules.voicereview.dto.VoiceReviewTriggerRequest;
import com.clearcareai.modules.voicereview.service.VoiceReviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class VoiceReviewServiceImpl implements VoiceReviewService {

    private final ConsultationRepository consultationRepository;
    private final ReviewRepository reviewRepository;
    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    private final RestTemplate restTemplate;

    @Value("${app.omnidim.api-key}")
    private String omnidimApiKey;

    @Value("${app.omnidim.agent-id}")
    private String omnidimAgentId;

    @Value("${app.omnidim.base-url}")
    private String omnidimBaseUrl;

    @Value("${app.voicereview.initial-delay-days}")
    private long initialDelayDays;

    @Value("${app.voicereview.retry-gap-hours}")
    private long retryGapHours;

    @Value("${app.voicereview.max-attempts}")
    private int maxAttempts;

    @Override
    @Transactional
    public OmniDimCallResponse triggerVoiceReview(String email, VoiceReviewTriggerRequest request) {
        Doctor doctor = getDoctorByEmail(email);

        Consultation consultation = consultationRepository.findById(request.getConsultationId())
                .orElseThrow(() -> new ResourceNotFoundException("Consultation", "id", request.getConsultationId()));

        if (!consultation.getDoctor().getId().equals(doctor.getId())) {
            throw new AccessDeniedException("You are not authorized to trigger a review for this consultation");
        }

        if (consultation.getStatus() != Consultation.Status.COMPLETED) {
            throw new BadRequestException("Voice review can only be triggered for a completed consultation");
        }

        if (reviewRepository.existsByConsultationId(consultation.getId())) {
            throw new BadRequestException("A review already exists for this consultation");
        }

        Review review = createPendingVoiceReview(consultation);
        boolean callPlaced = placeCall(review);

        return OmniDimCallResponse.builder()
                .reviewId(review.getId())
                .omnidimCallId(review.getOmnidimCallId())
                .status(callPlaced ? review.getStatus().name() : "NOT_TRIGGERED")
                .patientPhone(consultation.getPatient().getUser().getPhone())
                .build();
    }

    @Override
    @Transactional
    public void scheduleCallsForCompletedConsultations() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(initialDelayDays);
        List<Consultation> dueConsultations =
                consultationRepository.findByStatusAndUpdatedAtBefore(Consultation.Status.COMPLETED, cutoff);

        for (Consultation consultation : dueConsultations) {
            if (reviewRepository.existsByConsultationId(consultation.getId())) {
                continue;
            }
            Review review = createPendingVoiceReview(consultation);
            placeCall(review);
            log.info("Scheduler created voice review {} for consultation {} (completed before {})",
                    review.getId(), consultation.getId(), cutoff);
        }
    }

    @Override
    @Transactional
    public void retryUnansweredCalls() {
        LocalDateTime retryCutoff = LocalDateTime.now().minusHours(retryGapHours);
        List<Review> candidates = reviewRepository
                .findByStatusAndSourceAndCallAttemptsLessThan(Review.Status.PENDING, Review.Source.VOICE, maxAttempts);

        for (Review review : candidates) {
            if (review.getLastCallAt() != null && review.getLastCallAt().isAfter(retryCutoff)) {
                continue;
            }
            placeCall(review);
            log.info("Scheduler retried voice review {} (attempt {}/{})",
                    review.getId(), review.getCallAttempts(), maxAttempts);
        }
    }

    private Review createPendingVoiceReview(Consultation consultation) {
        Review review = Review.builder()
                .consultation(consultation)
                .patient(consultation.getPatient())
                .doctor(consultation.getDoctor())
                .status(Review.Status.PENDING)
                .source(Review.Source.VOICE)
                .isFlagged(false)
                .callAttempts(0)
                .build();
        return reviewRepository.save(review);
    }

    // Places one call attempt. Attempts are counted even when OmniDim is not configured
    // or the API call fails, so the scheduler cannot loop forever on the same review.
    private boolean placeCall(Review review) {
        review.setCallAttempts(review.getCallAttempts() == null ? 1 : review.getCallAttempts() + 1);
        review.setLastCallAt(LocalDateTime.now());

        if (!StringUtils.hasText(omnidimApiKey)) {
            log.warn("OmniDim API key not configured. Voice review call not triggered for review {}.", review.getId());
            reviewRepository.save(review);
            return false;
        }

        OmniDimCallResponse callResponse = callOmniDim(review);
        if (callResponse != null && callResponse.getOmnidimCallId() != null) {
            review.setOmnidimCallId(callResponse.getOmnidimCallId());
        }
        reviewRepository.save(review);
        return callResponse != null;
    }

    private OmniDimCallResponse callOmniDim(Review review) {
        Consultation consultation = review.getConsultation();

        Map<String, Object> metadata = new HashMap<>();
        metadata.put("review_id", review.getId());
        metadata.put("consultation_id", consultation.getId());
        metadata.put("patient_name", consultation.getPatient().getUser().getFirstName() + " "
                + consultation.getPatient().getUser().getLastName());
        metadata.put("doctor_name", consultation.getDoctor().getUser().getFirstName() + " "
                + consultation.getDoctor().getUser().getLastName());

        Map<String, Object> body = new HashMap<>();
        body.put("agent_id", omnidimAgentId);
        body.put("phone_number", "+91" + consultation.getPatient().getUser().getPhone());
        body.put("metadata", metadata);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(omnidimApiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            return restTemplate.postForObject(omnidimBaseUrl + "/calls", entity, OmniDimCallResponse.class);
        } catch (RestClientException ex) {
            log.error("Failed to trigger OmniDim voice call for review {}: {}", review.getId(), ex.getMessage());
            return null;
        }
    }

    private Doctor getDoctorByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        return doctorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found for user: " + email));
    }
}
