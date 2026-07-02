package com.clearcareai.modules.slot.exception;

import com.clearcareai.exception.BadRequestException;

public class SlotException extends BadRequestException {

    public SlotException(String message) {
        super(message);
    }
}
