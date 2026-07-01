package com.clearcareai.modules.doctor.serviceimpl;

import com.clearcareai.common.PagedResponse;
import com.clearcareai.exception.ResourceNotFoundException;
import com.clearcareai.modules.auth.entity.User;
import com.clearcareai.modules.auth.repository.UserRepository;
import com.clearcareai.modules.doctor.dto.DoctorRequestDto;
import com.clearcareai.modules.doctor.dto.DoctorResponseDto;
import com.clearcareai.modules.doctor.entity.Doctor;
import com.clearcareai.modules.doctor.mapper.DoctorMapper;
import com.clearcareai.modules.doctor.repository.DoctorRepository;
import com.clearcareai.modules.doctor.service.DoctorService;
import com.clearcareai.modules.doctor.validator.DoctorValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class DoctorServiceImpl implements DoctorService {

    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    private final DoctorMapper doctorMapper;
    private final DoctorValidator doctorValidator;

    @Override
    @Transactional
    public DoctorResponseDto createProfile(String email, DoctorRequestDto requestDto) {
        User user = getUserByEmail(email);

        doctorValidator.validateProfileDoesNotExist(doctorRepository.existsByUserId(user.getId()));

        Doctor doctor = doctorMapper.toEntity(requestDto);
        doctor.setUser(user);
        doctor.setIsAvailable(true);

        Doctor saved = doctorRepository.save(doctor);
        log.info("Created doctor profile for user: {}", email);

        return toResponseDtoWithDefaults(saved);
    }

    @Override
    public PagedResponse<DoctorResponseDto> getDoctors(String specialization, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        Page<Doctor> doctorPage = StringUtils.hasText(specialization)
                ? doctorRepository.findBySpecializationContainingIgnoreCase(specialization, pageable)
                : doctorRepository.findAll(pageable);

        List<DoctorResponseDto> content = doctorPage.getContent().stream()
                .map(this::toResponseDtoWithDefaults)
                .toList();

        return new PagedResponse<>(
                content,
                doctorPage.getNumber(),
                doctorPage.getSize(),
                doctorPage.getTotalElements(),
                doctorPage.getTotalPages(),
                doctorPage.isLast()
        );
    }

    @Override
    public DoctorResponseDto getDoctorById(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", id));

        return toResponseDtoWithDefaults(doctor);
    }

    @Override
    public DoctorResponseDto getMyProfile(String email) {
        User user = getUserByEmail(email);
        Doctor doctor = doctorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found for user: " + email));

        return toResponseDtoWithDefaults(doctor);
    }

    @Override
    @Transactional
    public DoctorResponseDto updateProfile(String email, DoctorRequestDto requestDto) {
        User user = getUserByEmail(email);
        Doctor doctor = doctorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found for user: " + email));

        doctorMapper.updateEntityFromDto(requestDto, doctor);

        Doctor saved = doctorRepository.save(doctor);
        log.info("Updated doctor profile for user: {}", email);

        return toResponseDtoWithDefaults(saved);
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    private DoctorResponseDto toResponseDtoWithDefaults(Doctor doctor) {
        DoctorResponseDto dto = doctorMapper.toResponseDto(doctor);
        dto.setAverageRating(0.0);
        dto.setTotalReviews(0L);
        return dto;
    }
}
