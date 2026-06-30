package com.persuasioncoach.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ResetPasswordRequest {
    @NotBlank(message = "Token je obavezan")
    private String token;

    @NotBlank(message = "Nova lozinka je obavezna")
    @Size(min = 6, message = "Lozinka mora imati najmanje 6 znakova")
    private String newPassword;
}
