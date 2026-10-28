package com.medicompare.ai.controller;

import com.medicompare.ai.dto.AiChatRequest;
import com.medicompare.ai.dto.AiChatResponse;
import com.medicompare.ai.service.AiChatService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(
        origins = "http://localhost:5173",
        methods = {RequestMethod.POST, RequestMethod.OPTIONS}
)
public class AiChatController {

    private final AiChatService aiChatService;

    public AiChatController(AiChatService aiChatService) {
        this.aiChatService = aiChatService;
    }

    @PostMapping("/chat")
    public ResponseEntity<AiChatResponse> chat(
            @Valid @RequestBody AiChatRequest request) {

        try {

            String response =
                    aiChatService.chat(request.getMessage());

            AiChatResponse result = new AiChatResponse();

            result.setResponse(response);
            result.setDisclaimer(
                    "MediCompare AI provides general health information "
                    + "and is not a substitute for professional medical advice."
            );

            return ResponseEntity.ok(result);

        } catch (Exception exception) {

            AiChatResponse result = new AiChatResponse();

            result.setResponse(
                    "The AI assistant is temporarily unavailable. "
                    + "Please try again shortly."
            );

            result.setDisclaimer(
                    "MediCompare AI provides general health information "
                    + "and is not a substitute for professional medical advice."
            );

            return ResponseEntity
                    .status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(result);
        }
    }
}