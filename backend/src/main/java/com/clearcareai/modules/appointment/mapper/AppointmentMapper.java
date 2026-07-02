package com.clearcareai.modules.appointment.mapper;

import com.clearcareai.modules.appointment.dto.AppointmentRequestDto;
import com.clearcareai.modules.appointment.dto.AppointmentResponseDto;
import com.clearcareai.modules.appointment.entity.Appointment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AppointmentMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "patient", ignore = true)
    @Mapping(target = "doctor", ignore = true)
    @Mapping(target = "slot", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "notes", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Appointment toEntity(AppointmentRequestDto dto);

    @Mapping(target = "patientId", source = "patient.id")
    @Mapping(target = "patientName", expression = "java(appointment.getPatient().getUser().getFirstName() + \" \" + appointment.getPatient().getUser().getLastName())")
    @Mapping(target = "doctorId", source = "doctor.id")
    @Mapping(target = "doctorName", expression = "java(appointment.getDoctor().getUser().getFirstName() + \" \" + appointment.getDoctor().getUser().getLastName())")
    @Mapping(target = "specialization", source = "doctor.specialization")
    @Mapping(target = "slotId", source = "slot.id")
    @Mapping(target = "startTime", source = "slot.startTime")
    @Mapping(target = "endTime", source = "slot.endTime")
    AppointmentResponseDto toResponseDto(Appointment appointment);
}
