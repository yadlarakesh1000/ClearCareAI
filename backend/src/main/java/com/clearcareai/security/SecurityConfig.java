package com.clearcareai.security;

import com.clearcareai.common.AppConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final AuthEntryPoint authEntryPoint;
    private final CorsConfigurationSource corsConfigurationSource;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(AbstractHttpConfigurer::disable)
                .exceptionHandling(ex -> ex.authenticationEntryPoint(authEntryPoint))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/doctors").permitAll()
                        .requestMatchers("/api/doctors/profile").hasRole(roleName(AppConstants.ROLE_DOCTOR))
                        .requestMatchers(HttpMethod.GET, "/api/doctors/{id}").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/reviews/doctor/{id}").permitAll()
                        .requestMatchers(HttpMethod.PUT, "/api/reviews/{id}/process").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/reviews/by-call-id/**").permitAll()

                        .requestMatchers("/api/admin/**").hasRole(roleName(AppConstants.ROLE_ADMIN))
                        .requestMatchers("/api/analytics/platform").hasRole(roleName(AppConstants.ROLE_ADMIN))

                        .requestMatchers(HttpMethod.GET, "/api/slots/doctor/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/slots/available").hasRole(roleName(AppConstants.ROLE_PATIENT))
                        .requestMatchers(HttpMethod.POST, "/api/slots").hasRole(roleName(AppConstants.ROLE_DOCTOR))
                        .requestMatchers(HttpMethod.DELETE, "/api/slots/**").hasRole(roleName(AppConstants.ROLE_DOCTOR))
                        .requestMatchers(HttpMethod.POST, "/api/consultations").hasRole(roleName(AppConstants.ROLE_DOCTOR))
                        .requestMatchers(HttpMethod.PUT, "/api/consultations/**").hasRole(roleName(AppConstants.ROLE_DOCTOR))
                        .requestMatchers("/api/voice-reviews/**").hasRole(roleName(AppConstants.ROLE_DOCTOR))
                        .requestMatchers("/api/analytics/doctor/**").hasRole(roleName(AppConstants.ROLE_DOCTOR))
                        .requestMatchers(HttpMethod.PUT, "/api/reviews/{id}/flag").hasRole(roleName(AppConstants.ROLE_DOCTOR))

                        .requestMatchers(HttpMethod.POST, "/api/patients/profile").hasRole(roleName(AppConstants.ROLE_PATIENT))
                        .requestMatchers(HttpMethod.PUT, "/api/patients/profile").hasRole(roleName(AppConstants.ROLE_PATIENT))
                        .requestMatchers(HttpMethod.GET, "/api/patients/profile").hasRole(roleName(AppConstants.ROLE_PATIENT))
                        .requestMatchers(HttpMethod.POST, "/api/appointments").hasRole(roleName(AppConstants.ROLE_PATIENT))
                        .requestMatchers("/api/appointments/my").hasRole(roleName(AppConstants.ROLE_PATIENT))
                        .requestMatchers(HttpMethod.PUT, "/api/appointments/{id}/cancel").hasRole(roleName(AppConstants.ROLE_PATIENT))
                        .requestMatchers(HttpMethod.GET, "/api/appointments/doctor").hasRole(roleName(AppConstants.ROLE_DOCTOR))
                        .requestMatchers(HttpMethod.GET, "/api/appointments").hasRole(roleName(AppConstants.ROLE_ADMIN))
                        .requestMatchers(HttpMethod.POST, "/api/reviews").hasRole(roleName(AppConstants.ROLE_PATIENT))
                        .requestMatchers("/api/reviews/my").hasRole(roleName(AppConstants.ROLE_PATIENT))

                        .requestMatchers(HttpMethod.GET, "/api/patients/{id}")
                            .hasAnyRole(roleName(AppConstants.ROLE_DOCTOR), roleName(AppConstants.ROLE_ADMIN))

                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    private String roleName(String role) {
        return role.replace("ROLE_", "");
    }
}
