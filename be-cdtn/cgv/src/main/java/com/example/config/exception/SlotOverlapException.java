package com.example.config.exception;

public class SlotOverlapException extends RuntimeException {
    private String detailMessage;

    public SlotOverlapException(String message, String detailMessage) {
        super(message);
        this.detailMessage = detailMessage;
    }

    public String getDetailMessage() {
        return detailMessage;
    }
}
