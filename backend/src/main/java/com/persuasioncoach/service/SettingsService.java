package com.persuasioncoach.service;

import com.persuasioncoach.entity.User;
import com.persuasioncoach.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SettingsService {

    private final UserService userService;
    private final UserRepository userRepository;

    @Transactional
    public void updateLanguage(String email, String language) {
        User user = userService.findByEmail(email);
        user.setLanguage(language);
        userRepository.save(user);
    }

    @Transactional
    public void updatePrivacy(String email, String privacySettings) {
        User user = userService.findByEmail(email);
        user.setPrivacySettings(privacySettings);
        userRepository.save(user);
    }

    public List<Map<String, String>> getFaq() {
        return List.of(
                Map.of("question", "Kako funkcioniše aplikacija?",
                        "answer", "Persuasion Coach koristi AI scenarije za vježbanje komunikacijskih vještina."),
                Map.of("question", "Kako se boduju sesije?",
                        "answer", "Svaka sesija se analizira po jasnoći, uvjerljivosti, tonu i adaptaciji."),
                Map.of("question", "Kako zaraditi značke?",
                        "answer", "Značke se zarađuju ispunjavanjem posebnih uvjeta prikazanih uz svaku značku."),
                Map.of("question", "Mogu li obrisati nalog?",
                        "answer", "Da, u Podešavanjima možete obrisati nalog. Svi podaci će biti trajno izbrisani.")
        );
    }

    public Map<String, Object> getAbout() {
        Map<String, Object> about = new LinkedHashMap<>();
        about.put("appName", "Persuasion Coach");
        about.put("version", "2.1.0");
        about.put("description", "Aplikacija za vježbanje i razvoj komunikacijskih i persuazivnih vještina.");
        about.put("developer", "Persuasion Coach Team");
        about.put("email", "support@persuasioncoach.com");
        return about;
    }

    public String getTerms() {
        return "Uvjeti korišćenja aplikacije Persuasion Coach. " +
               "Korišćenjem aplikacije prihvatate ove uvjete. " +
               "Aplikacija prikuplja podatke o sesijama isključivo u svrhu poboljšanja vašeg iskustva. " +
               "Zabranjena je zloupotreba platforme.";
    }
}
