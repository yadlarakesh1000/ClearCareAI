package com.clearcareai.modules.appointment.repository;

import com.clearcareai.modules.appointment.entity.Appointment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    Page<Appointment> findByPatientId(Long patientId, Pageable pageable);

    Page<Appointment> findByPatientIdAndStatus(Long patientId, Appointment.Status status, Pageable pageable);

    Page<Appointment> findByDoctorId(Long doctorId, Pageable pageable);

    Page<Appointment> findByDoctorIdAndStatus(Long doctorId, Appointment.Status status, Pageable pageable);

    Page<Appointment> findByDoctorIdAndAppointmentDate(Long doctorId, LocalDate appointmentDate, Pageable pageable);

    Page<Appointment> findByDoctorIdAndStatusAndAppointmentDate(Long doctorId, Appointment.Status status,
                                                                 LocalDate appointmentDate, Pageable pageable);

    List<Appointment> findByPatientIdAndAppointmentDateAndStatus(Long patientId, LocalDate appointmentDate,
                                                                  Appointment.Status status);

    List<Appointment> findByDoctorIdAndAppointmentDateAndStatusNot(Long doctorId, LocalDate appointmentDate,
                                                                    Appointment.Status status);

    boolean existsByDoctorIdAndSlotIdAndAppointmentDate(Long doctorId, Long slotId, LocalDate appointmentDate);

    long countByDoctorId(Long doctorId);

    long countByDoctorIdAndStatus(Long doctorId, Appointment.Status status);

    long countByDoctorIdAndAppointmentDateBetween(Long doctorId, LocalDate startDate, LocalDate endDate);

    long countByStatus(Appointment.Status status);

    Page<Appointment> findByStatus(Appointment.Status status, Pageable pageable);

    Page<Appointment> findByAppointmentDate(LocalDate appointmentDate, Pageable pageable);

    Page<Appointment> findByStatusAndAppointmentDate(Appointment.Status status, LocalDate appointmentDate, Pageable pageable);
}
