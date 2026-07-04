package com.clearcareai.modules.review.repository;

import com.clearcareai.modules.review.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    Optional<Review> findByConsultationId(Long consultationId);

    boolean existsByConsultationId(Long consultationId);

    Page<Review> findByPatientId(Long patientId, Pageable pageable);

    Page<Review> findByDoctorId(Long doctorId, Pageable pageable);

    Optional<Review> findByOmnidimCallId(String omnidimCallId);

    Page<Review> findByIsFlaggedTrue(Pageable pageable);

    long countByIsFlaggedTrue();

    long countByDoctorIdAndStatus(Long doctorId, Review.Status status);

    long countByDoctorIdAndSentiment(Long doctorId, Review.Sentiment sentiment);

    long countBySource(Review.Source source);

    List<Review> findTop5ByDoctorIdOrderByCreatedAtDesc(Long doctorId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.doctor.id = :doctorId AND r.status = 'COMPLETED'")
    Double findAverageRatingByDoctorId(@Param("doctorId") Long doctorId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.status = 'COMPLETED'")
    Double findAveragePlatformRating();
}
