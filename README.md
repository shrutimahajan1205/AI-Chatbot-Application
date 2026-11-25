# 🤖 AI-Powered Real-Time Chatbot Application

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-24.x-green?logo=node.js)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express-4.21-lightgrey?logo=express)](https://expressjs.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8-black?logo=socket.io)](https://socket.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas_/_Mongoose-47A248?logo=mongodb)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A production-ready, academic & evaluation-ready AI Chatbot platform built strictly according to the curriculum and specifications outlined in the project specification. Features a modern **Next.js** frontend styled with **Tailwind CSS**, a scalable **Express.js** backend, **Socket.io** real-time bidirectional communication, persistent **MongoDB** conversation storage, **JWT** session authentication, **OpenAI GPT** integration with an intelligent built-in fallback engine, **User Personalization**, and a comprehensive **Admin Analytics Dashboard**.

---

## 🌟 Key Features

### 1. User Authentication & Session Security (JWT)
- User registration and secure login with **bcryptjs** (10-round salted password hashing).
- Stateless **JSON Web Tokens (JWT)** for protected API endpoints and authenticated Socket.io handshakes.
- Protected route middleware and role-based access control (`user` vs `admin`).

### 2. Sleek & Responsive Chat Interface
- Engineered with **Tailwind CSS** supporting both **Dark Mode** and **Light Mode**.
- Responsive layout with desktop split pane and mobile drawer navigation.
- Markdown rendering with syntax-highlighted code blocks and one-click copy buttons.
- Real-time typing indicators with animated status badges.

### 3. AI-Powered Conversational Engine
- Direct integration with **OpenAI GPT API** (`gpt-4o-mini` / `gpt-3.5-turbo`).
- **Resilient Offline Fallback Engine**: If no OpenAI API key is supplied, an integrated contextual AI engine generates domain-specific, formatted responses across 4 dynamic personas so evaluators can test the application instantly without external setup.
- Conversational memory: Past conversation turns are automatically injected for context awareness.

### 4. Real-Time Bidirectional Communication (WebSockets)
- Powered by **Socket.io** for live message delivery without page reloads.
- Word-by-word streaming chunk visualization.
- Room-based isolation (`conv_<id>`) for multi-session support.

### 5. Persistent Chat History & Sessions
- Multi-session management: Create new chats, switch between existing conversations, and delete sessions.
- Automatically persisted in **MongoDB** with indexed queries for performance.
- Built-in In-Memory Fallback Store: Automatically activates if MongoDB is offline, guaranteeing 0 setup hurdles during evaluation.

### 6. User Personalization & Feedback
- Custom Chatbot Name (e.g. *Nova*, *CodeMentor*, *Jarvis*).
- 4 AI Persona Categories:
  - ☕ **Casual Companion**: Warm, empathetic, and natural conversation.
  - 💻 **Coding Architect**: Clean code snippets, debugging, and software architecture.
  - 💼 **Corporate Consultant**: Executive briefings, SWOT analysis, and structured bullet points.
  - ✨ **Creative Storyteller**: Imaginative narrative flow and worldbuilding.
- Interactive **5-Star Rating** and user feedback comment modal.
- **Voice Interaction (Future Enhancement Ready)**: Web Speech API microphone for Speech-to-Text (STT) input and Text-to-Speech (TTS) voice playback.

### 7. Admin Panel & Analytics Dashboard
- Dedicated `/admin` route with role-gated access.
- Live KPI Metrics:
  - Registered User Count
  - Total Conversation Sessions
  - Total Messages Processed
  - Average AI Latency (in milliseconds)
  - Average Customer Satisfaction Rating (⭐ out of 5)
- Persona usage distribution progress meters.
- Server runtime health monitor (Memory heap, uptime, Node version).
- User directory listing with role and registration timestamps.

### 8. Performance & API Optimization (Day 10)
- In-memory **LRU query cache** for instant responses to identical repeated prompts.
- **Rate limiting** via `express-rate-limit` (100 req/15min general, 30 req/15min auth).
- CORS headers and input sanitation middleware.

---

## 🛠️ Tech Stack & Purpose

| Technology | Purpose |
| :--- | :--- |
| **Next.js 14 (Pages Router)** | Frontend framework for SSR, routing, and optimal performance |
| **Tailwind CSS** | Responsive styling, dark/light theme classes |
| **Node.js (v20+)** | Server-side JavaScript runtime environment |
| **Express.js** | Modular REST API routing, middleware, controllers |
| **Socket.io** | Low-latency real-time bidirectional WebSocket communication |
| **MongoDB & Mongoose** | Document database for users, sessions, messages, feedback |
| **OpenAI GPT API** | AI model completions with intelligent fallback |
| **Web Speech API** | Voice recognition (STT) and voice readout (TTS) |

---

## 📂 Project Architecture

```
/chatbot-app
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js             # Top header, theme toggle, personalization trigger
│   │   │   ├── Sidebar.js            # History sessions, new chat, delete session
│   │   │   ├── ChatWindow.js         # Active conversation view & quick prompts
│   │   │   ├── MessageBubble.js      # Message card, markdown code, TTS, rating stars
│   │   │   ├── ChatInput.js          # Textarea, voice STT mic, persona tags
│   │   │   ├── PersonalizationModal.js # Bot name & persona selector modal
│   │   │   └── FeedbackModal.js      # Star rating and feedback review modal
│   │   ├── context/
│   │   │   ├── AuthContext.js        # Session persistence, login, logout, token state
│   │   │   └── ThemeContext.js       # Dark / Light theme mode controller
│   │   ├── pages/
│   │   │   ├── _app.js               # Global providers
│   │   │   ├── _document.js          # HTML root & typography
│   │   │   ├── index.js              # Primary chat view
│   │   │   ├── login.js              # Authentication (Sign In & Sign Up)
│   │   │   └── admin.js              # Admin Analytics Dashboard
│   │   ├── services/
│   │   │   ├── api.js                # Axios client with JWT interceptor
│   │   │   └── socket.js             # Socket.io client connector
│   │   └── styles/
│   │       └── globals.css           # Tailwind directives & prose styles
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                 # Resilient MongoDB connector with mock fallback
│   │   │   └── env.js                # Environment configuration loader
│   │   ├── controllers/
│   │   │   ├── authController.js     # User registration, login, preferences
│   │   │   ├── chatController.js     # REST chat endpoint & message history
│   │   │   ├── conversationController.js # Conversation CRUD
│   │   │   ├── feedbackController.js # Rating & user feedback handler
│   │   │   └── adminController.js    # System analytics & user directory
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js     # JWT verification & admin check
│   │   │   ├── rateLimiter.js        # IP rate limiting
│   │   │   ├── validate.js           # Request sanitation & validation
│   │   │   └── errorHandler.js       # Centralized error handler
│   │   ├── models/
│   │   │   ├── User.js               # User schema
│   │   │   ├── Conversation.js       # Conversation schema
│   │   │   ├── Message.js            # Message history & metrics schema
│   │   │   ├── Feedback.js           # Feedback submissions schema
│   │   │   └── mockStore.js          # Resilient in-memory storage fallback
│   │   ├── routes/
│   │   │   ├── authRoutes.js         # /api/auth/*
│   │   │   ├── chatRoutes.js         # /api/chat/*
│   │   │   ├── conversationRoutes.js # /api/conversations/*
│   │   │   ├── feedbackRoutes.js     # /api/feedback/*
│   │   │   └── adminRoutes.js        # /api/admin/*
│   │   ├── services/
│   │   │   ├── aiService.js          # OpenAI GPT client + fallback contextual AI
│   │   │   ├── cacheService.js       # In-memory query caching
│   │   │   └── socketService.js      # Socket.io events & streaming handler
│   │   └── server.js                 # Express server & Socket.io bootstrap
│   ├── tests/
│   │   └── api.test.js               # Full automated integration test suite
│   ├── .env.example
│   └── package.json
│
├── package.json                      # Monorepo scripts
├── README.md                         # Complete project documentation
├── API_DOCUMENTATION.md              # REST & WebSocket endpoint catalog
└── PROJECT_REPORT.md                 # 14-day academic submission report
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher (v24.x tested)
- **npm**: v9.0.0 or higher
- *(Optional)* **MongoDB**: Local MongoDB instance or free MongoDB Atlas URI
- *(Optional)* **OpenAI API Key**: In `.env` if using real OpenAI credits

### 1. Installation
Clone or navigate to the project directory:
```bash
cd ai-chatbot-app
npm --prefix backend install
npm --prefix frontend install
```

### 2. Environment Variables Configuration
Backend configuration (`backend/.env`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/chatbot_app
JWT_SECRET=super_secret_jwt_key_chatbot_app_2026
JWT_EXPIRES_IN=7d
OPENAI_API_KEY=your_openai_key_here_or_leave_empty_for_fallback
OPENAI_MODEL=gpt-4o-mini
FRONTEND_URL=http://localhost:3000
```

Frontend configuration (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

### 3. Running the Application

#### Start Backend Server:
```bash
npm run dev:backend
# Or inside backend: npm run dev
```
*Backend runs at `http://localhost:5000` with WebSockets active.*

#### Start Frontend Application:
```bash
npm run dev:frontend
# Or inside frontend: npm run dev
```
*Frontend runs at `http://localhost:3000`.*

---

## 🔑 Demo Accounts (1-Click Login)

The login screen includes quick 1-click test credentials:

| Role | Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@example.com` | `admin123` | Full Chatbot Access + Admin Analytics Dashboard |
| **User** | `demo@example.com` | `password123` | Full Chatbot Access, Personalization & History |

---

## 🧪 Automated Testing

Run the full end-to-end API integration tests:
```bash
npm run test
# Or inside backend: node tests/api.test.js
```

### Verified Test Suite:
1. `GET /api/health` -> System health status (200 OK)
2. `POST /api/auth/register` -> User creation & JWT issue (201 Created)
3. `POST /api/auth/login` -> Credential authentication (200 OK)
4. `POST /api/conversations` -> Session creation (201 Created)
5. `POST /api/chat/message` -> AI response generation with persona styling (200 OK)
6. `POST /api/feedback` -> 5-star rating submission (201 Created)
7. `GET /api/admin/analytics` -> Real-time metrics aggregation (200 OK)

---

## 🚢 Deployment Guide

### Frontend Deployment (Vercel)
1. Push project to GitHub.
2. Link the repository to [Vercel](https://vercel.com).
3. Set **Root Directory** to `frontend`.
4. Configure Environment Variables:
   - `NEXT_PUBLIC_API_URL`: Your deployed backend URL + `/api`
   - `NEXT_PUBLIC_SOCKET_URL`: Your deployed backend URL
5. Click **Deploy**.

### Backend Deployment (Render / Railway / AWS)
1. Set **Root Directory** to `backend`.
2. Build command: `npm install`
3. Start command: `node src/server.js`
4. Set Environment Variables (`MONGODB_URI`, `JWT_SECRET`, `OPENAI_API_KEY`, etc.).