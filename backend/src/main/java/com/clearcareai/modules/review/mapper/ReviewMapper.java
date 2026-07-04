package com.clearcareai.modules.review.mapper;

import com.clearcareai.modules.review.dto.ReviewResponseDto;
import com.clearcareai.modules.review.entity.Review;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ReviewMapper {

    @Mapping(target = "consultationId", source = "consultation.id")
    @Mapping(target = "patientId", source = "patient.id")
    @Mapping(target = "patientName", expression = "java(review.getPatient().getUser().getFirstName() + \" \" + review.getPatient().getUser().getLastName())")
    @Mapping(target = "doctorId", source = "doctor.id")
    @Mapping(target = "doctorName", expression = "java(review.getDoctor().getUser().getFirstName() + \" \" + review.getDoctor().getUser().getLastName())")
    ReviewResponseDto toResponseDto(Review review);
}
