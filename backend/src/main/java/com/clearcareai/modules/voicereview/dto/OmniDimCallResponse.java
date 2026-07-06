package com.clearcareai.modules.voicereview.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// Doubles as OmniDim's raw dispatch response and our own /trigger response payload.
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class OmniDimCallResponse {

    private Long reviewId;

    // OmniDim's dispatch response id field name isn't documented; accept the common
    // variants so omnidim_call_id gets captured regardless of which one it returns.
    // The exact field is confirmed from the logged response on the first real call.
    @JsonProperty("call_id")
    @JsonAlias({"id", "callId", "call_request_id", "callRequestId", "requestId", "request_id"})
    private String omnidimCallId;

    private String status;

    private String patientPhone;
}
