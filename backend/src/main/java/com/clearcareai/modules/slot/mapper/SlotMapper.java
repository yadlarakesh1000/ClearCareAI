package com.clearcareai.modules.slot.mapper;

import com.clearcareai.modules.slot.dto.SlotRequestDto;
import com.clearcareai.modules.slot.dto.SlotResponseDto;
import com.clearcareai.modules.slot.entity.Slot;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface SlotMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "doctor", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    Slot toEntity(SlotRequestDto dto);

    @Mapping(target = "doctorId", source = "doctor.id")
    SlotResponseDto toResponseDto(Slot slot);
}
