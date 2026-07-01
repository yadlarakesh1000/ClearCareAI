package com.clearcareai.modules.doctor.validator;

import com.clearcareai.modules.doctor.exception.DoctorException;
import org.springframework.stereotype.Component;

@Component
public class DoctorValidator {

    public void validateProfileDoesNotExist(boolean profileExists) {
        if (profileExists) {
            throw new DoctorException("Doctor profile already exists for this user");
        }
    }

    public void validateProfileExists(boolean profileExists) {
        if (!profileExists) {
            throw new DoctorException("Doctor profile not found");
        }
    }
}
