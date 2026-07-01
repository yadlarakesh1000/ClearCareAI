package com.clearcareai.modules.patient.repository;

import com.clearcareai.modules.patient.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PatientRepository extends JpaRepository<Patient, Long> {

    Optional<Patient> findByUserId(Long userId);

    boolean existsByUserId(Long userId);
}
