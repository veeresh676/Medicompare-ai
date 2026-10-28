package com.medicompare.ai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AiChatRequest {

    @NotBlank(message = "Message is required")
    @Size(min = 2, max = 2000, message = "Message must contain between 2 and 2000 characters")
    private String message;

    public AiChatRequest() {
    }

    public AiChatRequest(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}