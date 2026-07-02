package com.clearcareai.modules.slot.controller;

import com.clearcareai.common.ApiResponse;
import com.clearcareai.modules.slot.dto.SlotRequestDto;
import com.clearcareai.modules.slot.dto.SlotResponseDto;
import com.clearcareai.modules.slot.service.SlotService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/slots")
@RequiredArgsConstructor
public class SlotController {

    private final SlotService slotService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<SlotResponseDto> createSlot(@Valid @RequestBody SlotRequestDto requestDto,
                                                     Authentication authentication) {
        SlotResponseDto response = slotService.createSlot(authentication.getName(), requestDto);
        return ApiResponse.success("Slot created", response);
    }

    @GetMapping("/doctor/{doctorId}")
    public ApiResponse<List<SlotResponseDto>> getSlotsByDoctor(@PathVariable Long doctorId,
                                                                 @RequestParam(required = false) String dayOfWeek) {
        List<SlotResponseDto> response = slotService.getSlotsByDoctor(doctorId, dayOfWeek);
        return ApiResponse.success("Slots retrieved", response);
    }

    @GetMapping("/available")
    public ApiResponse<List<SlotResponseDto>> getAvailableSlots(
            @RequestParam Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            Authentication authentication) {
        List<SlotResponseDto> response = slotService.getAvailableSlots(authentication.getName(), doctorId, date);
        return ApiResponse.success("Available slots retrieved", response);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteSlot(@PathVariable Long id, Authentication authentication) {
        slotService.deleteSlot(authentication.getName(), id);
        return ApiResponse.success("Slot deleted", null);
    }
}
