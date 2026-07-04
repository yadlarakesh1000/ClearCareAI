package com.clearcareai.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Getter
@Configuration
public class AiConfig {

    @Value("${app.omnidim.api-key}")
    private String omnidimApiKey;

    @Value("${app.omnidim.agent-id}")
    private String omnidimAgentId;

    @Value("${app.omnidim.base-url}")
    private String omnidimBaseUrl;

    @Value("${app.fastapi.base-url}")
    private String fastapiBaseUrl;
}
