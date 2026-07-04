package com.clearcareai.modules.consultation.repository;

import com.clearcareai.modules.consultation.entity.Consultation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ConsultationRepository extends JpaRepository<Consultation, Long> {

    Optional<Consultation> findByAppointmentId(Long appointmentId);

    boolean existsByAppointmentId(Long appointmentId);

    List<Consultation> findByStatusAndUpdatedAtBefore(Consultation.Status status, LocalDateTime cutoff);
}
