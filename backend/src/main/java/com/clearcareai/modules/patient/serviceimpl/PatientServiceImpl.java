package com.clearcareai.modules.patient.serviceimpl;

import com.clearcareai.exception.ResourceNotFoundException;
import com.clearcareai.modules.auth.entity.User;
import com.clearcareai.modules.auth.repository.UserRepository;
import com.clearcareai.modules.patient.dto.PatientRequestDto;
import com.clearcareai.modules.patient.dto.PatientResponseDto;
import com.clearcareai.modules.patient.entity.Patient;
import com.clearcareai.modules.patient.mapper.PatientMapper;
import com.clearcareai.modules.patient.repository.PatientRepository;
import com.clearcareai.modules.patient.service.PatientService;
import com.clearcareai.modules.patient.validator.PatientValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final PatientMapper patientMapper;
    private final PatientValidator patientValidator;

    @Override
    @Transactional
    public PatientResponseDto createProfile(String email, PatientRequestDto requestDto) {
        User user = getUserByEmail(email);

        patientValidator.validateProfileDoesNotExist(patientRepository.existsByUserId(user.getId()));

        Patient patient = patientMapper.toEntity(requestDto);
        patient.setUser(user);

        Patient saved = patientRepository.save(patient);
        log.info("Created patient profile for user: {}", email);

        return patientMapper.toResponseDto(saved);
    }

    @Override
    public PatientResponseDto getMyProfile(String email) {
        User user = getUserByEmail(email);
        Patient patient = patientRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found for user: " + email));

        return patientMapper.toResponseDto(patient);
    }

    @Override
    public PatientResponseDto getPatientById(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", id));

        return patientMapper.toResponseDto(patient);
    }

    @Override
    @Transactional
    public PatientResponseDto updateProfile(String email, PatientRequestDto requestDto) {
        User user = getUserByEmail(email);
        Patient patient = patientRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found for user: " + email));

        patientMapper.updateEntityFromDto(requestDto, patient);

        Patient saved = patientRepository.save(patient);
        log.info("Updated patient profile for user: {}", email);

        return patientMapper.toResponseDto(saved);
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }
}
