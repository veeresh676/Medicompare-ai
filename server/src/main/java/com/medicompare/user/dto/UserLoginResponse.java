package com.medicompare.user.dto;

public class UserLoginResponse {

    private String token;
    private String tokenType;

    private Long id;
    private String name;
    private String email;
    private String role;

    public UserLoginResponse() {
    }

    public UserLoginResponse(
            String token,
            Long id,
            String name,
            String email,
            String role
    ) {
        this.token = token;
        this.tokenType = "Bearer";
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}