package com.clearcareai.modules.review.controller;

import com.clearcareai.common.ApiResponse;
import com.clearcareai.common.AppConstants;
import com.clearcareai.common.PagedResponse;
import com.clearcareai.modules.review.dto.ReviewFlagRequest;
import com.clearcareai.modules.review.dto.ReviewProcessRequest;
import com.clearcareai.modules.review.dto.ReviewRequestDto;
import com.clearcareai.modules.review.dto.ReviewResponseDto;
import com.clearcareai.modules.review.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ReviewResponseDto> createTextReview(@Valid @RequestBody ReviewRequestDto requestDto,
                                                             Authentication authentication) {
        ReviewResponseDto response = reviewService.createTextReview(authentication.getName(), requestDto);
        return ApiResponse.success("Review submitted", response);
    }

    @GetMapping("/doctor/{doctorId}")
    public ApiResponse<PagedResponse<ReviewResponseDto>> getReviewsByDoctor(
            @PathVariable Long doctorId,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_NUMBER) int page,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_SIZE) int size) {
        PagedResponse<ReviewResponseDto> response = reviewService.getReviewsByDoctor(doctorId, page, size);
        return ApiResponse.success("Reviews retrieved", response);
    }

    @GetMapping("/my")
    public ApiResponse<PagedResponse<ReviewResponseDto>> getMyReviews(
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_NUMBER) int page,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_SIZE) int size,
            Authentication authentication) {
        PagedResponse<ReviewResponseDto> response = reviewService.getMyReviews(authentication.getName(), page, size);
        return ApiResponse.success("Reviews retrieved", response);
    }

    @GetMapping("/by-call-id/{callId}")
    public ApiResponse<ReviewResponseDto> getReviewByCallId(@PathVariable String callId) {
        ReviewResponseDto response = reviewService.getReviewByCallId(callId);
        return ApiResponse.success("Review retrieved", response);
    }

    @GetMapping("/{id}")
    public ApiResponse<ReviewResponseDto> getReviewById(@PathVariable Long id, Authentication authentication) {
        ReviewResponseDto response = reviewService.getReviewById(authentication.getName(), id);
        return ApiResponse.success("Review retrieved", response);
    }

    @PutMapping("/{id}/process")
    public ApiResponse<ReviewResponseDto> processReview(@PathVariable Long id,
                                                          @RequestBody ReviewProcessRequest request) {
        ReviewResponseDto response = reviewService.processReview(id, request);
        return ApiResponse.success("Review processed", response);
    }

    @PutMapping("/{id}/flag")
    public ApiResponse<ReviewResponseDto> flagReview(@PathVariable Long id,
                                                       @Valid @RequestBody ReviewFlagRequest request,
                                                       Authentication authentication) {
        ReviewResponseDto response = reviewService.flagReview(authentication.getName(), id, request);
        return ApiResponse.success("Review flagged for admin review", response);
    }
}
