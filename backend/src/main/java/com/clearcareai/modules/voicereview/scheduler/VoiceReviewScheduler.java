package com.clearcareai.modules.voicereview.scheduler;

import com.clearcareai.modules.voicereview.service.VoiceReviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class VoiceReviewScheduler {

    private final VoiceReviewService voiceReviewService;

    @Scheduled(fixedDelayString = "${app.voicereview.check-interval-ms}")
    public void runVoiceReviewCycle() {
        try {
            voiceReviewService.scheduleCallsForCompletedConsultations();
            voiceReviewService.retryUnansweredCalls();
        } catch (Exception ex) {
            log.error("Voice review scheduler cycle failed: {}", ex.getMessage(), ex);
        }
    }
}
