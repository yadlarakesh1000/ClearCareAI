package com.clearcareai.modules.doctor.service;

import com.clearcareai.common.PagedResponse;
import com.clearcareai.modules.doctor.dto.DoctorRequestDto;
import com.clearcareai.modules.doctor.dto.DoctorResponseDto;

public interface DoctorService {

    DoctorResponseDto createProfile(String email, DoctorRequestDto requestDto);

    PagedResponse<DoctorResponseDto> getDoctors(String specialization, int page, int size);

    DoctorResponseDto getDoctorById(Long id);

    DoctorResponseDto getMyProfile(String email);

    DoctorResponseDto updateProfile(String email, DoctorRequestDto requestDto);
}
