package com.clearcareai.modules.appointment.validator;

import com.clearcareai.modules.appointment.entity.Appointment;
import com.clearcareai.modules.appointment.exception.AppointmentException;
import com.clearcareai.modules.slot.entity.Slot;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Component
public class AppointmentValidator {

    public void validateFutureDate(LocalDate appointmentDate) {
        if (!appointmentDate.isAfter(LocalDate.now())) {
            throw new AppointmentException("Appointment can only be booked for a future date");
        }
    }

    public void validateSlotActive(Slot slot) {
        if (!Boolean.TRUE.equals(slot.getIsActive())) {
            throw new AppointmentException("This slot is not active");
        }
    }

    public void validateDayOfWeekMatches(LocalDate appointmentDate, Slot slot) {
        if (appointmentDate.getDayOfWeek() != slot.getDayOfWeek()) {
            throw new AppointmentException("Appointment date does not match the slot's day of week");
        }
    }

    public void validateDoctorSlotNotBooked(boolean alreadyBooked) {
        if (alreadyBooked) {
            throw new AppointmentException("This slot is already booked for the selected date");
        }
    }

    public void validateNoPatientOverlap(List<Appointment> existingAppointments, Slot requestedSlot) {
        LocalTime requestedStart = requestedSlot.getStartTime();
        LocalTime requestedEnd = requestedSlot.getEndTime();

        boolean overlaps = existingAppointments.stream().anyMatch(existing -> {
            Slot existingSlot = existing.getSlot();
            return requestedStart.isBefore(existingSlot.getEndTime())
                    && existingSlot.getStartTime().isBefore(requestedEnd);
        });

        if (overlaps) {
            throw new AppointmentException("You already have an appointment at an overlapping time on this date");
        }
    }

    public void validateCancellable(Appointment appointment) {
        if (appointment.getStatus() != Appointment.Status.BOOKED) {
            throw new AppointmentException("Only appointments with status BOOKED can be cancelled");
        }
    }
}
