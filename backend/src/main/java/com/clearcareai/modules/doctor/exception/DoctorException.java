package com.clearcareai.modules.doctor.exception;

import com.clearcareai.exception.BadRequestException;

public class DoctorException extends BadRequestException {

    public DoctorException(String message) {
        super(message);
    }
}
