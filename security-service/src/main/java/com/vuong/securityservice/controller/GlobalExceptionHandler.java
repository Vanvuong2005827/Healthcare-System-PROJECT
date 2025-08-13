package com.vuong.securityservice.controller;

import com.vuong.securityservice.dto.ResponseMessageDto;
import com.vuong.securityservice.exception.CustomException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(CustomException.class)
    public ResponseEntity<ResponseMessageDto> handleCustomException(CustomException e) {
        ResponseMessageDto errorResponse = new ResponseMessageDto(e.getMessage(), e.getStatus());
        return new ResponseEntity<>(errorResponse, e.getStatus());
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ResponseMessageDto> handleBadCredentials(BadCredentialsException ex) {
        ResponseMessageDto errorResponse = new ResponseMessageDto("Wrong Credentials!", HttpStatus.UNAUTHORIZED);
        return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
    }
}
