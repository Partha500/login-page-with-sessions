# Login Page with Sessions & SQLite Authentication

[![Node.js](https://img.shields.io/badge/Node.js-v22+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v5-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-native--node:sqlite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://nodejs.org/api/sqlite.html)
[![bcrypt](https://img.shields.io/badge/Security-bcrypt-blue?style=for-the-badge)](https://www.npmjs.com/package/bcrypt)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

A lightweight, full-stack authentication web application demonstrating **stateful session-based authentication**, **salted password hashing with bcrypt**, and **embedded database persistence** using Node.js's native `node:sqlite` engine.

---

## Architecture & Data Flow

```
┌─────────────────────────────────┐           HTTP / JSON / Cookies           ┌─────────────────────────────────┐
│        Frontend (Client)        │ ────────────────────────────────────────► │        Backend (Express)        │
│                                 │                                           │                                 │
│  • register.html (Registration) │ ◄──────────────────────────────────────── │  • Request Logger Middleware    │
│  • login.html    (Session Auth) │             CORS with Credentials         │  • Express Router & Validation  │
│  • index.html    (Health Check) │                                           │  • express-session (Cookie Jar) │
└─────────────────────────────────┘                                           └────────────────┬────────────────┘
                                                                                               │
                                                                                    DatabaseSync (node:sqlite)
                                                                                               ▼
                                                                              ┌─────────────────────────────────┐
                                                                              │      SQLite (app.db)            │
                                                                              │  • users table (hashed passes)  │
                                                                              └─────────────────────────────────┘
```

---

## Features

- **Session-Based Authentication:** Employs `express-session` to issue HTTP cookies and maintain authenticated user state across requests with `credentials: 'include'`.
- **Session Lifecycle & Expiry:** Enforces cookie timeout (`maxAge`) and clean session teardown via `/logout` (`req.session.destroy` + `res.clearCookie`).
- **Protected Routes & Auth Guard:** Includes `isAuthenticated` middleware to guard private endpoints (`/profile`) and redirect unauthorized visitors.
- **Error Handling & 404 Routing:** Centralized 404 handler for missing routes and 4-parameter error-handling middleware for JSON parsing issues and server faults.
- **Cryptographic Password Security:** Hashes all user passwords using `bcrypt` (10 salt rounds) before persistence to safeguard against credential leakage and rainbow table attacks.
- **Native Embedded Database:** Leverages Node 22's built-in `node:sqlite` (`DatabaseSync`), eliminating bulky native external database bindings or external daemon requirements.
- **Robust Input Validation:** Server-side checks ensure required fields, duplicate email prevention, and password length policies before execution.
- **CORS Configured with Credentials:** Configured specifically for client-server decoupling with session cookie exchange across localhost origins.
- **Zero-Dependency Frontend:** Lightweight, performant Vanilla JavaScript and semantic HTML5 using the native `fetch` API.

---

## Project Structure

```text
login-page-with-sessions/
├── .gitignore               # Ignored dependencies, database binaries, and OS artifacts
├── README.md                # Project documentation and setup guide
├── backend/
│   ├── db.js                # SQLite table initialization and connection via node:sqlite
│   ├── package.json         # Backend dependencies & script definitions
│   ├── package-lock.json    # Exact dependency tree lockfile
│   └── server.js            # Express server, middleware, routes, and session configuration
└── frontend/
    ├── index.html           # Backend connectivity test page
    ├── login.html           # Login form with credential submission & session storage
    ├── profile.html         # Protected user profile page (session authenticated)
    └── register.html        # User registration form with validation response handling
```

---

## API Reference

| Method | Endpoint | Description | Request Body | Response Status |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/` | Server health check | None | `200 OK` (Text) |
| `GET` | `/hello` | Connectivity verification endpoint | None | `200 OK` (JSON) |
| `GET` | `/about` | Project description metadata | None | `200 OK` (JSON) |
| `POST` | `/register` | Register a new user account | `{ username, email, password }` | `201 Created` / `400 Bad Request` / `409 Conflict` |
| `POST` | `/login` | Authenticate credentials & initiate session | `{ email, password }` | `200 OK` / `400 Bad Request` / `401 Unauthorized` |
| `POST` | `/logout` | Destroy session & clear session cookie | None (`Cookie`) | `200 OK` / `500 Internal Error` |
| `GET` | `/profile` | Fetch authenticated user details (Protected) | None (`Cookie`) | `200 OK` / `401 Unauthorized` |

---

## Getting Started

### Prerequisites

- **[Node.js](https://nodejs.org/)**: v22.0.0 or higher (required for native `node:sqlite` module support)
- **npm**: v10.0.0 or higher
- A static file server for frontend (e.g. VS Code Live Server running on port `5500`, or `npx serve`)

### 1. Clone the Repository

```bash
git clone https://github.com/Partha500/login-page-with-sessions.git
cd login-page-with-sessions
```

### 2. Backend Setup

```bash
cd backend
npm install
node server.js
```

The server will start listening at:
```
Server running on http://localhost:3000
```
On initial run, `app.db` will automatically be generated with the `users` table schema.

### 3. Frontend Setup

Serve the `frontend/` folder using a local server on `http://localhost:5500`:
- **VS Code Live Server**: Right-click `frontend/login.html` or `frontend/register.html` and click **"Open with Live Server"**.
- Or via terminal:
  ```bash
  npx serve frontend -l 5500
  ```

Visit:
- **Registration**: `http://localhost:5500/register.html`
- **Login**: `http://localhost:5500/login.html`
- **Protected Profile**: `http://localhost:5500/profile.html`
- **Connection Test**: `http://localhost:5500/index.html`

---

## Security Highlights & Production Roadmap

- [x] Passwords salted and hashed with `bcrypt`.
- [x] Input sanitization and parameterized SQL statements (`db.prepare(...)`) to protect against SQL Injection.
- [ ] Migrate session store from in-memory `MemoryStore` to persistent store (e.g. `connect-sqlite3` or Redis) for multi-process scalability.
- [ ] Configure `cookie: { secure: true, httpOnly: true, sameSite: 'lax' }` when serving under HTTPS in production.
- [ ] Implement rate limiting on `/login` and `/register` using `express-rate-limit`.

---

## Author

- **Partha Pratim Choudhury** — [@Partha500](https://github.com/Partha500)
