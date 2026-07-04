package com.clearcareai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ClearCareAiApplication {

    public static void main(String[] args) {
        SpringApplication.run(ClearCareAiApplication.class, args);
    }

}
