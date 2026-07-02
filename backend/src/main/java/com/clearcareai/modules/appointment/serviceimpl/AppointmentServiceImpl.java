package com.clearcareai.modules.appointment.serviceimpl;

import com.clearcareai.common.PagedResponse;
import com.clearcareai.exception.ResourceNotFoundException;
import com.clearcareai.modules.appointment.dto.AppointmentRequestDto;
import com.clearcareai.modules.appointment.dto.AppointmentResponseDto;
import com.clearcareai.modules.appointment.entity.Appointment;
import com.clearcareai.modules.appointment.exception.AppointmentException;
import com.clearcareai.modules.appointment.mapper.AppointmentMapper;
import com.clearcareai.modules.appointment.repository.AppointmentRepository;
import com.clearcareai.modules.appointment.service.AppointmentService;
import com.clearcareai.modules.appointment.validator.AppointmentValidator;
import com.clearcareai.modules.auth.entity.User;
import com.clearcareai.modules.auth.repository.UserRepository;
import com.clearcareai.modules.doctor.entity.Doctor;
import com.clearcareai.modules.doctor.repository.DoctorRepository;
import com.clearcareai.modules.patient.entity.Patient;
import com.clearcareai.modules.patient.repository.PatientRepository;
import com.clearcareai.modules.slot.entity.Slot;
import com.clearcareai.modules.slot.repository.SlotRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final SlotRepository slotRepository;
    private final UserRepository userRepository;
    private final AppointmentMapper appointmentMapper;
    private final AppointmentValidator appointmentValidator;

    @Override
    @Transactional
    public AppointmentResponseDto createAppointment(String email, AppointmentRequestDto requestDto) {
        Patient patient = getPatientByEmail(email);

        Doctor doctor = doctorRepository.findById(requestDto.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", requestDto.getDoctorId()));

        Slot slot = slotRepository.findById(requestDto.getSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("Slot", "id", requestDto.getSlotId()));

        if (!slot.getDoctor().getId().equals(doctor.getId())) {
            throw new AppointmentException("Slot does not belong to the selected doctor");
        }

        appointmentValidator.validateSlotActive(slot);
        appointmentValidator.validateFutureDate(requestDto.getAppointmentDate());
        appointmentValidator.validateDayOfWeekMatches(requestDto.getAppointmentDate(), slot);

        boolean doctorSlotBooked = appointmentRepository.existsByDoctorIdAndSlotIdAndAppointmentDate(
                doctor.getId(), slot.getId(), requestDto.getAppointmentDate());
        appointmentValidator.validateDoctorSlotNotBooked(doctorSlotBooked);

        List<Appointment> patientAppointmentsOnDate = appointmentRepository
                .findByPatientIdAndAppointmentDateAndStatus(patient.getId(), requestDto.getAppointmentDate(),
                        Appointment.Status.BOOKED);
        appointmentValidator.validateNoPatientOverlap(patientAppointmentsOnDate, slot);

        Appointment appointment = appointmentMapper.toEntity(requestDto);
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setSlot(slot);
        appointment.setStatus(Appointment.Status.BOOKED);

        Appointment saved = appointmentRepository.save(appointment);
        log.info("Created appointment {} for patient {} with doctor {}", saved.getId(), patient.getId(), doctor.getId());

        return appointmentMapper.toResponseDto(saved);
    }

    @Override
    public PagedResponse<AppointmentResponseDto> getMyAppointments(String email, String status, int page, int size) {
        Patient patient = getPatientByEmail(email);
        Pageable pageable = PageRequest.of(page, size);

        Page<Appointment> appointmentPage = StringUtils.hasText(status)
                ? appointmentRepository.findByPatientIdAndStatus(patient.getId(), Appointment.Status.valueOf(status), pageable)
                : appointmentRepository.findByPatientId(patient.getId(), pageable);

        return toPagedResponse(appointmentPage);
    }

    @Override
    public PagedResponse<AppointmentResponseDto> getDoctorAppointments(String email, String status, LocalDate date,
                                                                         int page, int size) {
        Doctor doctor = getDoctorByEmail(email);
        Pageable pageable = PageRequest.of(page, size);

        Page<Appointment> appointmentPage;
        if (StringUtils.hasText(status) && date != null) {
            appointmentPage = appointmentRepository.findByDoctorIdAndStatusAndAppointmentDate(
                    doctor.getId(), Appointment.Status.valueOf(status), date, pageable);
        } else if (StringUtils.hasText(status)) {
            appointmentPage = appointmentRepository.findByDoctorIdAndStatus(doctor.getId(), Appointment.Status.valueOf(status), pageable);
        } else if (date != null) {
            appointmentPage = appointmentRepository.findByDoctorIdAndAppointmentDate(doctor.getId(), date, pageable);
        } else {
            appointmentPage = appointmentRepository.findByDoctorId(doctor.getId(), pageable);
        }

        return toPagedResponse(appointmentPage);
    }

    @Override
    public AppointmentResponseDto getAppointmentById(String email, Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));

        validateViewAccess(email, appointment);

        return appointmentMapper.toResponseDto(appointment);
    }

    @Override
    @Transactional
    public AppointmentResponseDto cancelAppointment(String email, Long id) {
        Patient patient = getPatientByEmail(email);
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));

        if (!appointment.getPatient().getId().equals(patient.getId())) {
            throw new AccessDeniedException("You can only cancel your own appointments");
        }

        appointmentValidator.validateCancellable(appointment);

        appointment.setStatus(Appointment.Status.CANCELLED);
        Appointment saved = appointmentRepository.save(appointment);
        log.info("Cancelled appointment {} for patient {}", id, patient.getId());

        return appointmentMapper.toResponseDto(saved);
    }

    @Override
    public PagedResponse<AppointmentResponseDto> getAllAppointments(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Appointment> appointmentPage = appointmentRepository.findAll(pageable);
        return toPagedResponse(appointmentPage);
    }

    private void validateViewAccess(String email, Appointment appointment) {
        User user = getUserByEmail(email);

        boolean isOwnerPatient = user.getRole() == User.Role.ROLE_PATIENT
                && appointment.getPatient().getUser().getId().equals(user.getId());
        boolean isOwnerDoctor = user.getRole() == User.Role.ROLE_DOCTOR
                && appointment.getDoctor().getUser().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == User.Role.ROLE_ADMIN;

        if (!isOwnerPatient && !isOwnerDoctor && !isAdmin) {
            throw new AccessDeniedException("You are not authorized to view this appointment");
        }
    }

    private PagedResponse<AppointmentResponseDto> toPagedResponse(Page<Appointment> appointmentPage) {
        List<AppointmentResponseDto> content = appointmentPage.getContent().stream()
                .map(appointmentMapper::toResponseDto)
                .toList();

        return new PagedResponse<>(
                content,
                appointmentPage.getNumber(),
                appointmentPage.getSize(),
                appointmentPage.getTotalElements(),
                appointmentPage.getTotalPages(),
                appointmentPage.isLast()
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

    private Doctor getDoctorByEmail(String email) {
        User user = getUserByEmail(email);
        return doctorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found for user: " + email));
    }
}
