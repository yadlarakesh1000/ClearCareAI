package com.clearcareai.modules.voicereview.service;

import com.clearcareai.modules.voicereview.dto.OmniDimCallResponse;
import com.clearcareai.modules.voicereview.dto.VoiceReviewTriggerRequest;

public interface VoiceReviewService {

    OmniDimCallResponse triggerVoiceReview(String email, VoiceReviewTriggerRequest request);

    void scheduleCallsForCompletedConsultations();

    void retryUnansweredCalls();
}
