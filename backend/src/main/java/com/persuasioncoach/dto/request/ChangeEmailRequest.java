package com.persuasioncoach.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ChangeEmailRequest {
    @NotBlank(message = "Novi e-mail je obavezan")
    @Email(message = "Nevažeći format e-maila")
    private String newEmail;

    @NotBlank(message = "Lozinka je obavezna za potvrdu")
    private String password;
}
