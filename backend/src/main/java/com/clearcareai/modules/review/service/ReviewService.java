package com.clearcareai.modules.review.service;

import com.clearcareai.common.PagedResponse;
import com.clearcareai.modules.review.dto.ReviewFlagRequest;
import com.clearcareai.modules.review.dto.ReviewProcessRequest;
import com.clearcareai.modules.review.dto.ReviewRequestDto;
import com.clearcareai.modules.review.dto.ReviewResponseDto;

public interface ReviewService {

    ReviewResponseDto createTextReview(String email, ReviewRequestDto requestDto);

    PagedResponse<ReviewResponseDto> getReviewsByDoctor(Long doctorId, int page, int size);

    PagedResponse<ReviewResponseDto> getMyReviews(String email, int page, int size);

    ReviewResponseDto getReviewById(String email, Long id);

    ReviewResponseDto processReview(Long id, ReviewProcessRequest request);

    ReviewResponseDto flagReview(String email, Long id, ReviewFlagRequest request);

    ReviewResponseDto getReviewByCallId(String callId);
}
