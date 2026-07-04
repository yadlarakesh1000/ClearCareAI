package com.clearcareai.modules.auth.serviceimpl;

import com.clearcareai.exception.BadRequestException;
import com.clearcareai.exception.UnauthorizedException;
import com.clearcareai.modules.auth.dto.AuthResponse;
import com.clearcareai.modules.auth.dto.LoginRequest;
import com.clearcareai.modules.auth.dto.RefreshTokenRequest;
import com.clearcareai.modules.auth.dto.RegisterRequest;
import com.clearcareai.modules.auth.entity.RefreshToken;
import com.clearcareai.modules.auth.entity.User;
import com.clearcareai.modules.auth.repository.RefreshTokenRepository;
import com.clearcareai.modules.auth.repository.UserRepository;
import com.clearcareai.modules.auth.service.AuthService;
import com.clearcareai.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private static final String TOKEN_TYPE = "Bearer";

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered: " + request.getEmail());
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .role(User.Role.valueOf(request.getRole()))
                .isActive(true)
                .build();

        user = userRepository.save(user);
        log.info("Registered new user with email: {}", user.getEmail());

        return buildAuthResponse(user);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        } catch (BadCredentialsException ex) {
            throw new UnauthorizedException("Invalid email or password");
        } catch (DisabledException ex) {
            throw new UnauthorizedException("Your account has been deactivated. Contact the administrator.");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        return buildAuthResponse(user);
    }

    @Override
    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken existingToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        if (Boolean.TRUE.equals(existingToken.getIsRevoked())) {
            throw new UnauthorizedException("Refresh token has been revoked");
        }

        if (existingToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new UnauthorizedException("Refresh token has expired");
        }

        existingToken.setIsRevoked(true);
        refreshTokenRepository.save(existingToken);

        User user = existingToken.getUser();
        return buildAuthResponse(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtTokenProvider.generateAccessToken(user.getEmail(), user.getId(), user.getRole().name());
        String refreshToken = createRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType(TOKEN_TYPE)
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    private String createRefreshToken(User user) {
        String token = UUID.randomUUID().toString();

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(token)
                .expiryDate(LocalDateTime.now().plusSeconds(jwtTokenProvider.getRefreshExpirationMs() / 1000))
                .isRevoked(false)
                .build();

        refreshTokenRepository.save(refreshToken);
        return token;
    }
}
