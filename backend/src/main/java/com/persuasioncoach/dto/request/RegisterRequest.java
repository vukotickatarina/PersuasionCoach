package com.persuasioncoach.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank(message = "Ime je obavezno")
    private String name;

    @NotBlank(message = "E-mail je obavezan")
    @Email(message = "Nevažeći format e-maila")
    private String email;

    @NotBlank(message = "Lozinka je obavezna")
    @Size(min = 6, message = "Lozinka mora imati najmanje 6 znakova")
    private String password;
}
