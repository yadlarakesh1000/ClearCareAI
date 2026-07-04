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

import java.util.HashMap;
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

        String patientPhone = consultation.getPatient().getUser().getPhone();

        Review review = Review.builder()
                .consultation(consultation)
                .patient(consultation.getPatient())
                .doctor(consultation.getDoctor())
                .status(Review.Status.PENDING)
                .source(Review.Source.VOICE)
                .isFlagged(false)
                .build();
        review = reviewRepository.save(review);

        if (!StringUtils.hasText(omnidimApiKey)) {
            log.warn("OmniDim API key not configured. Voice review call not triggered.");
            return OmniDimCallResponse.builder()
                    .reviewId(review.getId())
                    .omnidimCallId(null)
                    .status("NOT_TRIGGERED")
                    .patientPhone(patientPhone)
                    .build();
        }

        OmniDimCallResponse callResponse = callOmniDim(review, consultation, patientPhone);
        if (callResponse == null) {
            return OmniDimCallResponse.builder()
                    .reviewId(review.getId())
                    .omnidimCallId(null)
                    .status("NOT_TRIGGERED")
                    .patientPhone(patientPhone)
                    .build();
        }

        review.setOmnidimCallId(callResponse.getOmnidimCallId());
        reviewRepository.save(review);

        return OmniDimCallResponse.builder()
                .reviewId(review.getId())
                .omnidimCallId(callResponse.getOmnidimCallId())
                .status(review.getStatus().name())
                .patientPhone(patientPhone)
                .build();
    }

    private OmniDimCallResponse callOmniDim(Review review, Consultation consultation, String patientPhone) {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("review_id", review.getId());
        metadata.put("consultation_id", consultation.getId());
        metadata.put("patient_name", consultation.getPatient().getUser().getFirstName() + " "
                + consultation.getPatient().getUser().getLastName());
        metadata.put("doctor_name", consultation.getDoctor().getUser().getFirstName() + " "
                + consultation.getDoctor().getUser().getLastName());

        Map<String, Object> body = new HashMap<>();
        body.put("agent_id", omnidimAgentId);
        body.put("phone_number", "+91" + patientPhone);
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
