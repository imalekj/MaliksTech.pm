<div align="center">

# MaliksTech PM

**A full-stack project management platform** — plan projects, break them into tasks, track progress on a Kanban board, collaborate through comments, and let AI generate an entire task breakdown from a single sentence.

[![.NET](https://img.shields.io/badge/.NET-9.0-512BD4?logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![SQL Server](https://img.shields.io/badge/SQL_Server-CC2927?logo=microsoftsqlserver&logoColor=white)](https://www.microsoft.com/sql-server)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

[Repository](https://github.com/imalekj/MaliksTech.PM) · [Report an Issue](https://github.com/imalekj/MaliksTech.PM/issues)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment & Configuration](#environment--configuration)
- [API Reference](#api-reference)
- [Security](#security)
- [Roadmap](#roadmap)
- [License](#license)

---

## Overview

MaliksTech PM is a lightweight, self-hosted alternative to tools like Trello or Jira, built to demonstrate a clean, production-shaped full-stack implementation: a role-aware ASP.NET Core API backed by SQL Server, paired with a fast, type-safe React client. It also integrates Google Gemini so a project manager can describe an idea in one sentence and get a fully-scoped task list back in seconds.

## Features

**Authentication & Authorization**
- JWT-based registration and login with BCrypt password hashing
- Role-based access control (`Admin`, `Manager`, `Member`) enforced at the API layer
- Ownership checks — only a resource's owner or an Admin can modify or delete it

**Project & Task Management**
- Full CRUD for projects with search, sorting, and pagination
- Automatic risk-level classification (`Safe` / `At Risk` / `Off Track`)
- Kanban-style task board (`Todo` → `In Progress` → `Done`)
- Task priorities, estimated hours, due dates, assignees, and sub-tasks

**Collaboration**
- Threaded comments on every task
- Comment authors and Admins can delete comments

**AI-Powered Planning**
- One-sentence project idea in → full task breakdown out, via Google Gemini
- Each generated task includes a title, description, priority, hour estimate, and a short AI insight

## Tech Stack

### Backend — `MaliksTech.PM.Api/`

| Layer | Technology |
|---|---|
| Framework | ASP.NET Core 9 Web API |
| Database | Microsoft SQL Server |
| ORM | Entity Framework Core 9 (Code-First + Migrations) |
| Auth | Custom JWT issuance + BCrypt password hashing |
| Validation | FluentValidation + Data Annotations |
| AI Integration | Google Gemini (`generativelanguage.googleapis.com`) |
| API Docs | OpenAPI / Scalar |

### Frontend — `pm-client/`

| Layer | Technology |
|---|---|
| Library | React 18 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS v4 |
| Routing | React Router v6 |
| Server State | TanStack Query |
| HTTP Client | Axios (with JWT interceptor) |

## Architecture

```
┌─────────────────┐        JWT-authenticated REST         ┌──────────────────────┐
│   React Client    │ ─────────────────────────────────▶ │   ASP.NET Core API     │
│  (pm-client, Vite) │ ◀───────────────────────────────── │  Controllers → EF Core │
└─────────────────┘              JSON                     └──────────┬───────────┘
                                                                        │
                                                            ┌───────────▼───────────┐
                                                            │   SQL Server database  │
                                                            └────────────────────────┘
                                                                        │
                                                            ┌───────────▼───────────┐
                                                            │   Google Gemini API     │
                                                            │ (AI task generation)    │
                                                            └────────────────────────┘
```

The API follows a layered structure: **Models** (EF Core entities) → **Data** (`AppDbContext`) → **DTOs** (request/response contracts, keeping entities from leaking) → **Controllers** (HTTP endpoints) → **Services** (token issuance, AI integration).

## Project Structure

```
MaliksTech.PM.Api/
├── MaliksTech.PM.Api/          ASP.NET Core Web API
│   ├── Controllers/            Auth, Projects, Tasks, Comments, Users, Ai
│   ├── Models/                 EF Core entities
│   ├── DTOs/                   Request/response shapes
│   ├── Data/                   AppDbContext
│   ├── Services/                TokenService, AiAssistantService
│   ├── Validators/               FluentValidation rules
│   └── Migrations/
└── pm-client/                   React + Tailwind frontend
    └── src/
        ├── api/                 Axios client + endpoint wrappers
        ├── context/             AuthContext
        ├── components/           Navbar, ProtectedRoute, Badge
        └── pages/                Login, Register, Dashboard, ProjectDetail, TaskDetail
```

## Getting Started

### Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) 18+
- SQL Server (local instance or remote)

### 1. Clone

```bash
git clone https://github.com/imalekj/MaliksTech.PM.git
cd MaliksTech.PM
```

### 2. Backend setup

```bash
cd MaliksTech.PM.Api

# Configure secrets (never stored in source control)
dotnet user-secrets set "Jwt:Key" "<a-long-random-secret-at-least-32-chars>"
dotnet user-secrets set "Gemini:ApiKey" "<your-gemini-api-key>"

# Apply database migrations
dotnet ef database update

# Run the API
dotnet run
```

The API starts at `http://localhost:5143`. On first run it seeds a demo admin account:

| Field | Value |
|---|---|
| Email | `malik@example.com` |
| Password | `Malik@123` |
| Role | `Admin` |

### 3. Frontend setup

```bash
cd pm-client
npm install
npm run dev
```

The app starts at `http://localhost:5173`.

## Environment & Configuration

| Setting | Location | Description |
|---|---|---|
| `ConnectionStrings:DefaultConnection` | `appsettings.json` | SQL Server connection string |
| `Jwt:Key` | user-secrets | HMAC signing key for JWTs (min. 32 chars) |
| `Jwt:Issuer` / `Jwt:Audience` | `appsettings.json` | Token issuer/audience validation |
| `Gemini:ApiKey` | user-secrets | Google Gemini API key |
| `Cors:AllowedOrigins` | `appsettings.json` | Origins permitted to call the API |
| `VITE_API_URL` | `pm-client/.env` | Base URL the frontend uses to reach the API |

## API Reference

All endpoints below (except `auth/register` and `auth/login`) require a `Bearer` JWT in the `Authorization` header.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create an account |
| `POST` | `/api/auth/login` | Authenticate and receive a JWT |
| `GET` | `/api/projects` | List projects (search, sort, paginate) |
| `POST` | `/api/projects` | Create a project |
| `GET` | `/api/projects/{id}` | Get project details |
| `PUT` | `/api/projects/{id}` | Update a project *(owner/Admin only)* |
| `DELETE` | `/api/projects/{id}` | Delete a project *(owner/Admin only)* |
| `GET` | `/api/tasks` | List tasks (filter by project, status, priority) |
| `POST` | `/api/tasks` | Create a task |
| `PATCH` | `/api/tasks/{id}/status` | Update a task's status |
| `PUT` | `/api/tasks/{id}` | Update a task |
| `DELETE` | `/api/tasks/{id}` | Delete a task *(project owner/Admin only)* |
| `GET` | `/api/tasks/{taskId}/comments` | List comments on a task |
| `POST` | `/api/tasks/{taskId}/comments` | Add a comment |
| `DELETE` | `/api/comments/{id}` | Delete a comment *(author/Admin only)* |
| `GET` | `/api/users` | List users |
| `DELETE` | `/api/users/{id}` | Delete a user *(Admin only)* |
| `POST` | `/api/ai/generate-and-save-project` | Generate a project + tasks from a description |

## Security

- No secrets are committed to source control — `Jwt:Key` and `Gemini:ApiKey` are provided via `dotnet user-secrets` in development and environment variables in production.
- Passwords are hashed with BCrypt; API responses never include password hashes.
- All mutating endpoints require authentication; destructive actions are restricted by ownership or role.
- CORS is locked to the origins explicitly listed in configuration.

## Roadmap

- [ ] Project membership (invite specific users instead of global visibility)
- [ ] Real-time updates via SignalR
- [ ] File attachments on tasks
- [ ] Automated test suite (xUnit + integration tests)

## License

This project is currently unlicensed and intended for private/internal use. Contact the repository owner before reuse or redistribution.
