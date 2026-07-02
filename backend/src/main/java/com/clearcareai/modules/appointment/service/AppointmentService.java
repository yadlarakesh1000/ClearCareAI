package com.clearcareai.modules.appointment.service;

import com.clearcareai.common.PagedResponse;
import com.clearcareai.modules.appointment.dto.AppointmentRequestDto;
import com.clearcareai.modules.appointment.dto.AppointmentResponseDto;

import java.time.LocalDate;

public interface AppointmentService {

    AppointmentResponseDto createAppointment(String email, AppointmentRequestDto requestDto);

    PagedResponse<AppointmentResponseDto> getMyAppointments(String email, String status, int page, int size);

    PagedResponse<AppointmentResponseDto> getDoctorAppointments(String email, String status, LocalDate date,
                                                                  int page, int size);

    AppointmentResponseDto getAppointmentById(String email, Long id);

    AppointmentResponseDto cancelAppointment(String email, Long id);

    PagedResponse<AppointmentResponseDto> getAllAppointments(int page, int size);
}
