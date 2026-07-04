package com.clearcareai.modules.voicereview.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// Doubles as OmniDim's raw call response (call_id, status) and our own /trigger response payload.
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class OmniDimCallResponse {

    private Long reviewId;

    @JsonProperty("call_id")
    private String omnidimCallId;

    private String status;

    private String patientPhone;
}
