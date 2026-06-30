package com.persuasioncoach.service;

import com.persuasioncoach.dto.request.*;
import com.persuasioncoach.dto.response.AuthResponse;
import com.persuasioncoach.dto.response.UserResponse;
import com.persuasioncoach.entity.User;
import com.persuasioncoach.exception.BadRequestException;
import com.persuasioncoach.exception.ResourceNotFoundException;
import com.persuasioncoach.repository.UserRepository;
import com.persuasioncoach.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Korisnik sa ovim e-mailom već postoji");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        user = userRepository.save(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails);

        return AuthResponse.builder()
                .token(token)
                .user(mapToUserResponse(user))
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Korisnik nije pronađen"));

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails);

        return AuthResponse.builder()
                .token(token)
                .user(mapToUserResponse(user))
                .build();
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Korisnik sa ovim e-mailom nije pronađen"));
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        throw new BadRequestException("Reset password token funkcionalnost nije implementirana");
    }

    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Korisnik nije pronađen"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Trenutna lozinka nije ispravna");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Transactional
    public void changeEmail(String currentEmail, ChangeEmailRequest request) {
        User user = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Korisnik nije pronađen"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadRequestException("Lozinka nije ispravna");
        }

        if (userRepository.existsByEmail(request.getNewEmail())) {
            throw new BadRequestException("E-mail adresa je već u upotrebi");
        }

        user.setEmail(request.getNewEmail());
        userRepository.save(user);
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .experienceLevel(user.getExperienceLevel())
                .interests(user.getInterests())
                .language(user.getLanguage())
                .createdAt(user.getCreatedAt())
                .notificationsEnabled(user.isNotificationsEnabled())
                .notifyReminders(user.isNotifyReminders())
                .notifyResults(user.isNotifyResults())
                .notifyTips(user.isNotifyTips())
                .notifySystem(user.isNotifySystem())
                .privacySettings(user.getPrivacySettings())
                .role(user.getRole())
                .build();
    }
}
