package com.clearcareai.modules.slot.service;

import com.clearcareai.modules.slot.dto.SlotRequestDto;
import com.clearcareai.modules.slot.dto.SlotResponseDto;

import java.time.LocalDate;
import java.util.List;

public interface SlotService {

    SlotResponseDto createSlot(String email, SlotRequestDto requestDto);

    List<SlotResponseDto> getSlotsByDoctor(Long doctorId, String dayOfWeek);

    List<SlotResponseDto> getAvailableSlots(String email, Long doctorId, LocalDate date);

    void deleteSlot(String email, Long id);
}
