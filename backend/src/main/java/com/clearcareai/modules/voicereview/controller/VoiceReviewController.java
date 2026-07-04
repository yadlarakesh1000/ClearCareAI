package com.clearcareai.modules.voicereview.controller;

import com.clearcareai.common.ApiResponse;
import com.clearcareai.modules.voicereview.dto.OmniDimCallResponse;
import com.clearcareai.modules.voicereview.dto.VoiceReviewTriggerRequest;
import com.clearcareai.modules.voicereview.service.VoiceReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/voice-reviews")
@RequiredArgsConstructor
public class VoiceReviewController {

    private final VoiceReviewService voiceReviewService;

    @PostMapping("/trigger")
    public ApiResponse<OmniDimCallResponse> triggerVoiceReview(@Valid @RequestBody VoiceReviewTriggerRequest request,
                                                                 Authentication authentication) {
        OmniDimCallResponse response = voiceReviewService.triggerVoiceReview(authentication.getName(), request);
        String message = "NOT_TRIGGERED".equals(response.getStatus())
                ? "Voice review call was not triggered — OmniDim is not configured"
                : "Voice review call initiated";
        return ApiResponse.success(message, response);
    }
}
