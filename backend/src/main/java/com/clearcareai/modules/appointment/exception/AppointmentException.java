package com.clearcareai.modules.appointment.exception;

import com.clearcareai.exception.BadRequestException;

public class AppointmentException extends BadRequestException {

    public AppointmentException(String message) {
        super(message);
    }
}
