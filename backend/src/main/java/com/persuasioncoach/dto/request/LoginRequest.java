package com.persuasioncoach.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank(message = "E-mail je obavezan")
    @Email(message = "Nevažeći format e-maila")
    private String email;

    @NotBlank(message = "Lozinka je obavezna")
    private String password;
}
