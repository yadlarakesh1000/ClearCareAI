package com.clearcareai.modules.consultation.mapper;

import com.clearcareai.modules.consultation.dto.ConsultationResponseDto;
import com.clearcareai.modules.consultation.entity.Consultation;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ConsultationMapper {

    @Mapping(target = "appointmentId", source = "appointment.id")
    @Mapping(target = "doctorId", source = "doctor.id")
    @Mapping(target = "doctorName", expression = "java(consultation.getDoctor().getUser().getFirstName() + \" \" + consultation.getDoctor().getUser().getLastName())")
    @Mapping(target = "patientId", source = "patient.id")
    @Mapping(target = "patientName", expression = "java(consultation.getPatient().getUser().getFirstName() + \" \" + consultation.getPatient().getUser().getLastName())")
    ConsultationResponseDto toResponseDto(Consultation consultation);
}
