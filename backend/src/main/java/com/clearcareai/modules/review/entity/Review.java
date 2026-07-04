package com.clearcareai.modules.review.entity;

import com.clearcareai.modules.consultation.entity.Consultation;
import com.clearcareai.modules.doctor.entity.Doctor;
import com.clearcareai.modules.patient.entity.Patient;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consultation_id", nullable = false)
    private Consultation consultation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @Column(name = "raw_transcript", columnDefinition = "TEXT")
    private String rawTranscript;

    @Column(name = "cleaned_review", columnDefinition = "TEXT")
    private String cleanedReview;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Enumerated(EnumType.STRING)
    private Sentiment sentiment;

    @Column
    private Integer rating;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Status status = Status.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Source source;

    @Column(name = "omnidim_call_id", length = 100)
    private String omnidimCallId;

    @Column(name = "call_attempts")
    @Builder.Default
    private Integer callAttempts = 0;

    @Column(name = "last_call_at")
    private LocalDateTime lastCallAt;

    @Enumerated(EnumType.STRING)
    private TriState recovered;

    @Enumerated(EnumType.STRING)
    @Column(name = "recommend_doctor")
    private TriState recommendDoctor;

    @Column(name = "patient_feedback", columnDefinition = "TEXT")
    private String patientFeedback;

    @Column(name = "improvement_suggestions", columnDefinition = "TEXT")
    private String improvementSuggestions;

    @Column(name = "is_flagged")
    @Builder.Default
    private Boolean isFlagged = false;

    @Column(name = "flag_reason", columnDefinition = "TEXT")
    private String flagReason;

    @Column(name = "flagged_at")
    private LocalDateTime flaggedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum Sentiment {
        POSITIVE, NEUTRAL, NEGATIVE
    }

    public enum Status {
        PENDING, PROCESSING, COMPLETED, FAILED
    }

    public enum Source {
        VOICE, TEXT
    }

    public enum TriState {
        TRUE, PARTIAL, FALSE
    }
}
