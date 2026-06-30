package com.persuasioncoach;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class PersuasionCoachApplication {

    public static void main(String[] args) {
        SpringApplication.run(PersuasionCoachApplication.class, args);
    }
}
