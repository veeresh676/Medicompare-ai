package com.medicompare.user.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.frontend.reset-url}")
    private String resetUrlBase;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendPasswordResetEmail(String toEmail, String token) {

        String resetLink = resetUrlBase + "?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Reset your MediCompare password");
        message.setText(
                "We received a request to reset your password.\n\n" +
                "Click the link below to set a new password. This link expires in 30 minutes.\n\n" +
                resetLink +
                "\n\nIf you didn't request this, you can safely ignore this email."
        );

        mailSender.send(message);
    }
}