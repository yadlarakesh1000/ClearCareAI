package com.clearcareai.modules.doctor.repository;

import com.clearcareai.modules.doctor.entity.Doctor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    Optional<Doctor> findByUserId(Long userId);

    boolean existsByUserId(Long userId);

    Page<Doctor> findBySpecializationContainingIgnoreCase(String specialization, Pageable pageable);
}
