package com.clearcareai.modules.review.exception;

import com.clearcareai.exception.BadRequestException;

public class ReviewException extends BadRequestException {

    public ReviewException(String message) {
        super(message);
    }
}
