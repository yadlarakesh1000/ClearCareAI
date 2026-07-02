package com.clearcareai.modules.consultation.serviceimpl;

import com.clearcareai.exception.ResourceNotFoundException;
import com.clearcareai.modules.appointment.entity.Appointment;
import com.clearcareai.modules.appointment.repository.AppointmentRepository;
import com.clearcareai.modules.auth.entity.User;
import com.clearcareai.modules.auth.repository.UserRepository;
import com.clearcareai.modules.consultation.dto.ConsultationRequestDto;
import com.clearcareai.modules.consultation.dto.ConsultationResponseDto;
import com.clearcareai.modules.consultation.entity.Consultation;
import com.clearcareai.modules.consultation.exception.ConsultationException;
import com.clearcareai.modules.consultation.mapper.ConsultationMapper;
import com.clearcareai.modules.consultation.repository.ConsultationRepository;
import com.clearcareai.modules.consultation.service.ConsultationService;
import com.clearcareai.modules.doctor.entity.Doctor;
import com.clearcareai.modules.doctor.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Slf4j
@Service
@RequiredArgsConstructor
public class ConsultationServiceImpl implements ConsultationService {

    private final ConsultationRepository consultationRepository;
    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    private final ConsultationMapper consultationMapper;

    @Override
    @Transactional
    public ConsultationResponseDto startConsultation(String email, ConsultationRequestDto requestDto) {
        if (requestDto.getAppointmentId() == null) {
            throw new ConsultationException("Appointment ID is required");
        }

        Doctor doctor = getDoctorByEmail(email);
        Appointment appointment = appointmentRepository.findById(requestDto.getAppointmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", requestDto.getAppointmentId()));

        if (!appointment.getDoctor().getId().equals(doctor.getId())) {
            throw new AccessDeniedException("You are not authorized to start this consultation");
        }

        if (appointment.getStatus() != Appointment.Status.BOOKED) {
            throw new ConsultationException("Consultation can only be created for a BOOKED appointment");
        }

        if (consultationRepository.existsByAppointmentId(appointment.getId())) {
            throw new ConsultationException("Consultation already exists for this appointment");
        }

        Consultation consultation = Consultation.builder()
                .appointment(appointment)
                .doctor(doctor)
                .patient(appointment.getPatient())
                .status(Consultation.Status.IN_PROGRESS)
                .build();

        Consultation saved = consultationRepository.save(consultation);
        log.info("Started consultation {} for appointment {}", saved.getId(), appointment.getId());

        return consultationMapper.toResponseDto(saved);
    }

    @Override
    @Transactional
    public ConsultationResponseDto updateConsultation(String email, Long id, ConsultationRequestDto requestDto) {
        Doctor doctor = getDoctorByEmail(email);
        Consultation consultation = consultationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation", "id", id));

        if (!consultation.getDoctor().getId().equals(doctor.getId())) {
            throw new AccessDeniedException("You are not authorized to update this consultation");
        }

        if (StringUtils.hasText(requestDto.getDiagnosis())) {
            consultation.setDiagnosis(requestDto.getDiagnosis());
        }
        if (StringUtils.hasText(requestDto.getPrescription())) {
            consultation.setPrescription(requestDto.getPrescription());
        }
        if (StringUtils.hasText(requestDto.getNotes())) {
            consultation.setNotes(requestDto.getNotes());
        }

        Consultation saved = consultationRepository.save(consultation);
        log.info("Updated consultation {}", id);

        return consultationMapper.toResponseDto(saved);
    }

    @Override
    @Transactional
    public ConsultationResponseDto completeConsultation(String email, Long id) {
        Doctor doctor = getDoctorByEmail(email);
        Consultation consultation = consultationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation", "id", id));

        if (!consultation.getDoctor().getId().equals(doctor.getId())) {
            throw new AccessDeniedException("You are not authorized to complete this consultation");
        }

        consultation.setStatus(Consultation.Status.COMPLETED);
        Consultation saved = consultationRepository.save(consultation);

        Appointment appointment = consultation.getAppointment();
        appointment.setStatus(Appointment.Status.COMPLETED);
        appointmentRepository.save(appointment);

        log.info("Completed consultation {} and appointment {}", id, appointment.getId());

        return consultationMapper.toResponseDto(saved);
    }

    @Override
    public ConsultationResponseDto getConsultationById(String email, Long id) {
        Consultation consultation = consultationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation", "id", id));

        validateViewAccess(email, consultation);

        return consultationMapper.toResponseDto(consultation);
    }

    @Override
    public ConsultationResponseDto getConsultationByAppointmentId(String email, Long appointmentId) {
        Consultation consultation = consultationRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation not found for appointment: " + appointmentId));

        validateViewAccess(email, consultation);

        return consultationMapper.toResponseDto(consultation);
    }

    private void validateViewAccess(String email, Consultation consultation) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        boolean isOwnerDoctor = user.getRole() == User.Role.ROLE_DOCTOR
                && consultation.getDoctor().getUser().getId().equals(user.getId());
        boolean isOwnerPatient = user.getRole() == User.Role.ROLE_PATIENT
                && consultation.getPatient().getUser().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == User.Role.ROLE_ADMIN;

        if (!isOwnerDoctor && !isOwnerPatient && !isAdmin) {
            throw new AccessDeniedException("You are not authorized to view this consultation");
        }
    }

    private Doctor getDoctorByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        return doctorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found for user: " + email));
    }
}
