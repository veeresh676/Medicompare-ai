package com.medicompare.ai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AiChatService {

    private static final String OPENROUTER_URL =
            "https://openrouter.ai/api/v1/chat/completions";

    private static final String MODEL = "openrouter/free";

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public AiChatService(Dotenv dotenv) {

        this.objectMapper = new ObjectMapper();

        String apiKey = System.getenv("OPENROUTER_API_KEY");

        if (apiKey == null || apiKey.isBlank()) {
            apiKey = dotenv.get("OPENROUTER_API_KEY");
        }

        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException(
                    "OPENROUTER_API_KEY is missing. Configure it in the environment or .env file."
            );
        }

        this.restClient = RestClient.builder()
                .baseUrl(OPENROUTER_URL)
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .defaultHeader(
                        "Content-Type",
                        MediaType.APPLICATION_JSON_VALUE
                )
                .build();
    }

    public String chat(String userMessage) {

        String systemPrompt = """
                You are MediCompare AI, a helpful healthcare information assistant.

                RESPONSE STYLE:
                - Respond naturally and conversationally.
                - Answer the user's question directly.
                - Keep answers concise unless the user asks for detail.
                - Use Markdown when helpful.
                - Explain medical terminology in simple language.
                - Avoid repetitive statements and unnecessary sections.

                CONVERSATION STYLE:
                - Be friendly, calm, professional, and easy to understand.
                - Do not sound robotic or overly formal.
                - Give clear and useful answers.

                HEALTHCARE SAFETY:
                - Provide general educational healthcare information only.
                - Do not diagnose a user's condition.
                - Do not prescribe medication or provide medication dosages.
                - Do not claim certainty about a user's medical condition.
                - Do not fabricate hospitals, doctors, prices, appointments,
                  availability, or medical facts.
                - If symptoms could indicate an emergency, recommend immediate
                  professional medical attention.
                - Encourage consultation with a qualified healthcare professional
                  when personal medical evaluation is needed.

                MEDICOMPARE CONTEXT:
                - MediCompare helps users understand and compare healthcare
                  services and hospitals.
                - Do not invent hospital or service information when it is
                  not available in the provided context.

                IMPORTANT:
                - Prioritize clarity, accuracy, and helpfulness.
                """;

        Map<String, Object> systemMessage = new HashMap<>();
        systemMessage.put("role", "system");
        systemMessage.put("content", systemPrompt);

        Map<String, Object> userMessageMap = new HashMap<>();
        userMessageMap.put("role", "user");
        userMessageMap.put("content", userMessage);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", MODEL);
        requestBody.put(
                "messages",
                List.of(systemMessage, userMessageMap)
        );
        requestBody.put("max_completion_tokens", 1200);

        try {

            String response = restClient
                    .post()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(response);

            JsonNode content = root.path("choices")
                    .path(0)
                    .path("message")
                    .path("content");

            if (content.isMissingNode() || content.isNull()) {
                throw new IllegalStateException(
                        "OpenRouter returned an unexpected response."
                );
            }

            return content.asText().trim();

        } catch (Exception exception) {

            System.err.println(
                    "OpenRouter AI request failed: "
                            + exception.getMessage()
            );

            throw new IllegalStateException(
                    "The AI assistant is temporarily unavailable. "
                            + "Please try again shortly."
            );
        }
    }
}