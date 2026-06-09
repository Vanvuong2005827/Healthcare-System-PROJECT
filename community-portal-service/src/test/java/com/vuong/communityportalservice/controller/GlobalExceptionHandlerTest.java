package com.vuong.communityportalservice.controller;

import com.vuong.communityportalservice.dto.ResponseMessageDto;
import com.vuong.communityportalservice.exception.CustomException;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import static org.assertj.core.api.Assertions.assertThat;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler globalExceptionHandler = new GlobalExceptionHandler();

    @Test
    void handleCustomExceptionReturnsStatusAndMessage() {
        CustomException exception = new CustomException(
                new ResponseMessageDto("Bad request", HttpStatus.BAD_REQUEST),
                HttpStatus.BAD_REQUEST
        );

        var response = globalExceptionHandler.handleCustomException(exception);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isEqualTo(new ResponseMessageDto("Bad request", HttpStatus.BAD_REQUEST));
    }

    @Test
    void handleResponseStatusExceptionReturnsStatusAndReason() {
        ResponseStatusException exception = new ResponseStatusException(HttpStatus.NOT_FOUND, "Not found");

        var response = globalExceptionHandler.handleResponseStatusException(exception);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).isEqualTo(new ResponseMessageDto("Not found", HttpStatus.NOT_FOUND));
    }
}
