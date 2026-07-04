package com.clearcareai.modules.slot.serviceimpl;

import com.clearcareai.exception.ResourceNotFoundException;
import com.clearcareai.modules.appointment.repository.AppointmentRepository;
import com.clearcareai.modules.auth.entity.User;
import com.clearcareai.modules.auth.repository.UserRepository;
import com.clearcareai.modules.doctor.entity.Doctor;
import com.clearcareai.modules.doctor.repository.DoctorRepository;
import com.clearcareai.modules.slot.dto.SlotRequestDto;
import com.clearcareai.modules.slot.dto.SlotResponseDto;
import com.clearcareai.modules.slot.entity.Slot;
import com.clearcareai.modules.slot.exception.SlotException;
import com.clearcareai.modules.slot.mapper.SlotMapper;
import com.clearcareai.modules.slot.repository.SlotRepository;
import com.clearcareai.modules.slot.service.SlotService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SlotServiceImpl implements SlotService {

    private static final long MIN_DURATION_MINUTES = 15;
    private static final long MAX_DURATION_MINUTES = 60;

    private final SlotRepository slotRepository;
    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    private final SlotMapper slotMapper;

    @Override
    @Transactional
    public SlotResponseDto createSlot(String email, SlotRequestDto requestDto) {
        Doctor doctor = getDoctorByEmail(email);
        DayOfWeek dayOfWeek = DayOfWeek.valueOf(requestDto.getDayOfWeek());

        if (!requestDto.getStartTime().isBefore(requestDto.getEndTime())) {
            throw new SlotException("Start time must be before end time");
        }

        long durationMinutes = Duration.between(requestDto.getStartTime(), requestDto.getEndTime()).toMinutes();
        if (durationMinutes < MIN_DURATION_MINUTES || durationMinutes > MAX_DURATION_MINUTES) {
            throw new SlotException("Slot duration must be between 15 and 60 minutes");
        }

        List<Slot> existingSlots = slotRepository.findByDoctorIdAndDayOfWeekAndIsActiveTrue(doctor.getId(), dayOfWeek);
        boolean overlaps = existingSlots.stream().anyMatch(existing ->
                requestDto.getStartTime().isBefore(existing.getEndTime())
                        && existing.getStartTime().isBefore(requestDto.getEndTime()));
        if (overlaps) {
            throw new SlotException("Slot overlaps with an existing slot for this day");
        }

        Slot slot = slotMapper.toEntity(requestDto);
        slot.setDoctor(doctor);
        slot.setDayOfWeek(dayOfWeek);
        slot.setIsActive(true);

        Slot saved = slotRepository.save(slot);
        log.info("Created slot {} for doctor {}", saved.getId(), doctor.getId());

        return slotMapper.toResponseDto(saved);
    }

    @Override
    public List<SlotResponseDto> getSlotsByDoctor(Long doctorId, String dayOfWeek) {
        List<Slot> slots;
        if (dayOfWeek != null && !dayOfWeek.isBlank()) {
            slots = slotRepository.findByDoctorIdAndDayOfWeek(doctorId, DayOfWeek.valueOf(dayOfWeek));
        } else {
            slots = slotRepository.findByDoctorId(doctorId);
        }

        return slots.stream().map(slotMapper::toResponseDto).toList();
    }

    @Override
    public List<SlotResponseDto> getAvailableSlots(String email, Long doctorId, LocalDate date) {
        DayOfWeek dayOfWeek = date.getDayOfWeek();
        List<Slot> slots = slotRepository.findByDoctorIdAndDayOfWeekAndIsActiveTrue(doctorId, dayOfWeek);

        // Cancelled appointments still block the slot for that date: the unique_appointment
        // DB constraint covers all rows regardless of status, so offering the slot as
        // available would let a booking attempt fail against the constraint.
        Set<Long> bookedSlotIds = appointmentRepository
                .findByDoctorIdAndAppointmentDate(doctorId, date)
                .stream()
                .map(appointment -> appointment.getSlot().getId())
                .collect(Collectors.toSet());

        return slots.stream()
                .filter(slot -> !bookedSlotIds.contains(slot.getId()))
                .map(slotMapper::toResponseDto)
                .toList();
    }

    @Override
    @Transactional
    public void deleteSlot(String email, Long id) {
        Doctor doctor = getDoctorByEmail(email);
        Slot slot = slotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Slot", "id", id));

        if (!slot.getDoctor().getId().equals(doctor.getId())) {
            throw new AccessDeniedException("You can only delete your own slots");
        }

        slot.setIsActive(false);
        slotRepository.save(slot);
        log.info("Deactivated slot {} for doctor {}", id, doctor.getId());
    }

    private Doctor getDoctorByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        return doctorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found for user: " + email));
    }
}
