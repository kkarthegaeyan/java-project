package com.sece.farmstock.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @GetMapping("/csrf")
    public Map<String, String> csrfToken(HttpServletRequest request) {
        Object csrfAttribute = request.getAttribute(CsrfToken.class.getName());
        CsrfToken csrfToken = null;
        if (csrfAttribute instanceof CsrfToken token) {
            csrfToken = token;
        } else {
            csrfAttribute = request.getAttribute("_csrf");
            if (csrfAttribute instanceof CsrfToken token) {
                csrfToken = token;
            }
        }
        if (csrfToken == null) {
            throw new IllegalStateException("CSRF token is not available for this request");
        }

        return Map.of(
                "token", csrfToken.getToken(),
                "headerName", csrfToken.getHeaderName(),
                "parameterName", csrfToken.getParameterName());
    }

    @GetMapping("/me")
    public Map<String, String> currentUser(Authentication authentication) {
        return Map.of("username", authentication.getName());
    }
}
