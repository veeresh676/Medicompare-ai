package com.medicompare.ai.dto;

public class AiChatResponse {

    private String response;
    private String disclaimer;

    public AiChatResponse() {
    }

    public AiChatResponse(String response, String disclaimer) {
        this.response = response;
        this.disclaimer = disclaimer;
    }

    public String getResponse() {
        return response;
    }

    public void setResponse(String response) {
        this.response = response;
    }

    public String getDisclaimer() {
        return disclaimer;
    }

    public void setDisclaimer(String disclaimer) {
        this.disclaimer = disclaimer;
    }
}