package com.persuasioncoach.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.persuasioncoach.entity.DebateMessage;
import com.persuasioncoach.entity.DebateRoom;
import com.persuasioncoach.service.DebateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Slf4j
@Component
@RequiredArgsConstructor
public class DebateWebSocketHandler extends TextWebSocketHandler {

    private final DebateService debateService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // roomCode -> list of connected sessions
    private final Map<String, List<WebSocketSession>> roomSessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        String code = extractCode(session);
        roomSessions.computeIfAbsent(code, k -> new CopyOnWriteArrayList<>()).add(session);
        log.info("WebSocket konekcija uspostavljena: session={}, room={}", session.getId(), code);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String code = extractCode(session);
        Map<String, Object> payload = objectMapper.readValue(message.getPayload(), Map.class);
        String type = (String) payload.getOrDefault("type", "MESSAGE");

        if ("END_DEBATE".equals(type)) {
            handleEndDebate(code);
            return;
        }

        Long userId = payload.get("userId") != null ? Long.valueOf(payload.get("userId").toString()) : null;
        String username = (String) payload.getOrDefault("username", "Nepoznat");
        String content = (String) payload.get("content");

        if (content == null || content.isBlank()) return;

        DebateMessage saved = debateService.sendMessage(code, userId, username, content);

        // Broadcast user message
        Map<String, Object> outMsg = buildMessagePayload(saved);
        broadcast(code, outMsg);

        // Fetch and broadcast AI comment if one was generated
        List<DebateMessage> allMessages = debateService.getMessages(code);
        DebateMessage lastMsg = allMessages.isEmpty() ? null : allMessages.get(allMessages.size() - 1);
        if (lastMsg != null && lastMsg.isAiComment() && !lastMsg.getId().equals(saved.getId())) {
            broadcast(code, buildMessagePayload(lastMsg));
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String code = extractCode(session);
        List<WebSocketSession> sessions = roomSessions.get(code);
        if (sessions != null) {
            sessions.remove(session);
            if (sessions.isEmpty()) roomSessions.remove(code);
        }
        log.info("WebSocket konekcija zatvorena: session={}, room={}", session.getId(), code);
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) {
        log.error("WebSocket transport greška: session={}, greška={}", session.getId(), exception.getMessage());
    }

    private void handleEndDebate(String code) throws IOException {
        DebateRoom room = debateService.endDebate(code);
        Map<String, Object> endPayload = new HashMap<>();
        endPayload.put("type", "DEBATE_ENDED");
        endPayload.put("winner", room.getWinner());
        endPayload.put("aiAnalysis", room.getAiAnalysis());
        broadcast(code, endPayload);
    }

    private void broadcast(String code, Map<String, Object> payload) throws IOException {
        String json = objectMapper.writeValueAsString(payload);
        List<WebSocketSession> sessions = roomSessions.getOrDefault(code, List.of());
        for (WebSocketSession s : sessions) {
            if (s.isOpen()) {
                s.sendMessage(new TextMessage(json));
            }
        }
    }

    private Map<String, Object> buildMessagePayload(DebateMessage msg) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", msg.isAiComment() ? "AI_COMMENT" : "MESSAGE");
        payload.put("id", msg.getId());
        payload.put("userId", msg.getUserId());
        payload.put("username", msg.getUsername());
        payload.put("content", msg.getContent());
        payload.put("aiComment", msg.isAiComment());
        if (msg.getTimestamp() != null) {
            payload.put("timestamp", msg.getTimestamp().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        }
        return payload;
    }

    private String extractCode(WebSocketSession session) {
        String path = session.getUri() != null ? session.getUri().getPath() : "";
        int idx = path.lastIndexOf('/');
        return idx >= 0 ? path.substring(idx + 1) : "unknown";
    }
}
