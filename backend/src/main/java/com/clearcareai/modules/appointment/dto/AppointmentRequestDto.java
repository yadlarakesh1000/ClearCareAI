package com.clearcareai.modules.appointment.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentRequestDto {

    @NotNull(message = "Doctor ID is required")
    private Long doctorId;

    @NotNull(message = "Slot ID is required")
    private Long slotId;

    @NotNull(message = "Appointment date is required")
    private LocalDate appointmentDate;
}
