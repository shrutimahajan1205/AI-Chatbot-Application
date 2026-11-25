# 📖 API Documentation - AI-Powered Real-Time Chatbot

This document specifies the complete RESTful HTTP endpoints and WebSocket events supported by the chatbot backend.

Base URL: `http://localhost:5000/api`

---

## 🔐 Authentication Endpoints (`/api/auth`)

### 1. User Registration
- **URL**: `POST /api/auth/register`
- **Rate Limit**: 30 requests / 15 minutes
- **Request Body**:
```json
{
  "username": "alex_dev",
  "email": "alex@example.com",
  "password": "password123"
}
```
- **Response (201 Created)**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "673f4...",
    "username": "alex_dev",
    "email": "alex@example.com",
    "role": "user",
    "preferences": {
      "theme": "dark",
      "botName": "Antigravity AI",
      "defaultCategory": "casual"
    }
  }
}
```

### 2. User Login
- **URL**: `POST /api/auth/login`
- **Request Body**:
```json
{
  "email": "alex@example.com",
  "password": "password123"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

### 3. Get Current User Profile
- **URL**: `GET /api/auth/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**: Current user profile object.

### 4. Update Personalization Preferences
- **URL**: `PUT /api/auth/preferences`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
```json
{
  "theme": "dark",
  "botName": "CodeMentor",
  "defaultCategory": "coding"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Preferences updated successfully",
  "preferences": { ... }
}
```

---

## 💬 Conversation Endpoints (`/api/conversations`)

All conversation endpoints require `Authorization: Bearer <token>`.

### 1. Get All Conversations
- **URL**: `GET /api/conversations`
- **Response (200 OK)**:
```json
{
  "success": true,
  "count": 2,
  "conversations": [
    {
      "_id": "674...",
      "userId": "673...",
      "title": "Fullstack Architecture Chat",
      "category": "coding",
      "botName": "CodeMentor",
      "lastMessageAt": "2026-11-25T11:45:00.000Z"
    }
  ]
}
```

### 2. Create New Conversation
- **URL**: `POST /api/conversations`
- **Request Body**:
```json
{
  "title": "System Design Discussion",
  "category": "coding",
  "botName": "CodeMentor"
}
```
- **Response (201 Created)**: Returns the newly created conversation session.

### 3. Get Conversation by ID (with Messages)
- **URL**: `GET /api/conversations/:id`
- **Response (200 OK)**: Returns conversation metadata along with ordered message history.

### 4. Update Conversation Title or Category
- **URL**: `PUT /api/conversations/:id`
- **Request Body**: `{ "title": "Updated Title", "category": "professional" }`
- **Response (200 OK)**: Updated conversation document.

### 5. Delete Conversation
- **URL**: `DELETE /api/conversations/:id`
- **Response (200 OK)**: `{ "success": true, "message": "Conversation deleted successfully" }`

---

## ⚡ Chat & AI Endpoints (`/api/chat`)

### 1. Send Message (REST Fallback)
- **URL**: `POST /api/chat/message`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
```json
{
  "conversationId": "674...",
  "content": "Explain how WebSockets work",
  "category": "coding",
  "botName": "CodeMentor"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "userMessage": {
    "_id": "...",
    "sender": "user",
    "content": "Explain how WebSockets work"
  },
  "botMessage": {
    "_id": "...",
    "sender": "bot",
    "content": "### WebSockets Architecture...\n\nWebSockets establish a persistent...",
    "tokens": 128,
    "latencyMs": 310
  },
  "meta": {
    "latencyMs": 310,
    "tokens": 128,
    "fromCache": false
  }
}
```

---

## ⭐ Feedback & Ratings (`/api/feedback`)

### 1. Submit Response Rating & Comment
- **URL**: `POST /api/feedback`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
```json
{
  "messageId": "674b...",
  "rating": 5,
  "comment": "Very accurate and helpful answer!"
}
```
- **Response (201 Created)**: Returns persisted feedback object.

---

## 📊 Admin & Analytics (`/api/admin`)

Requires `Authorization: Bearer <token>` and `role === "admin"`.

### 1. Get Aggregated Analytics
- **URL**: `GET /api/admin/analytics`
- **Response (200 OK)**:
```json
{
  "success": true,
  "analytics": {
    "totalUsers": 12,
    "totalConversations": 24,
    "totalMessages": 88,
    "avgLatencyMs": 315,
    "avgRating": 4.9,
    "totalFeedbacks": 18,
    "categoryBreakdown": {
      "casual": 8,
      "coding": 10,
      "professional": 4,
      "creative": 2
    },
    "systemStatus": {
      "uptimeSeconds": 1420,
      "nodeVersion": "v24.14.0",
      "memoryUsageMb": 54
    }
  }
}
```

### 2. Get Users Directory
- **URL**: `GET /api/admin/users`
- **Response (200 OK)**: Lists all registered accounts (excluding password hashes).

---

## 📡 WebSocket / Socket.io Events

### Client -> Server Events

| Event Name | Payload | Description |
| :--- | :--- | :--- |
| `join_conversation` | `conversationId: string` | Joins room `conv_<conversationId>` |
| `leave_conversation` | `conversationId: string` | Leaves conversation room |
| `typing_start` | `{ conversationId, username }` | Broadcasts user typing activity |
| `typing_stop` | `{ conversationId }` | Stops typing notification |
| `send_message` | `{ conversationId, content, category, botName }` | Dispatches user prompt to AI pipeline |

### Server -> Client Events

| Event Name | Payload | Description |
| :--- | :--- | :--- |
| `new_message` | `MessageObject` | Emitted when a new user or bot message is finalized |
| `bot_typing` | `{ conversationId, isTyping: boolean }` | Indicates AI model computation state |
| `bot_stream_chunk` | `{ chunk, accumulatedText, isComplete }` | Real-time word-by-word streaming stream |
| `user_typing` | `{ conversationId, username }` | User typing alert |
| `error_event` | `{ message: string }` | Emitted when an error occurs |