````markdown
# MaliksTech PM

A full-stack project management system: create projects, break them into tasks, track status on a Kanban board, collaborate via comments, and even let AI generate a full project plan from a one-line description.

**Live repo:** https://github.com/imalekj/MaliksTech.PM

## Features

- **Auth & authorization** — JWT-based login/register, BCrypt-hashed passwords, role-based access (Admin / Manager / Member)
- **Projects** — create, search, sort, paginate; risk level tracking (Safe / At Risk / Off Track)
- **Tasks** — Kanban board (Todo / In Progress / Done), priorities, estimated hours, sub-tasks, assignees
- **Comments** — per-task discussion thread, authors (or admins) can delete their own comments
- **AI project generation** — describe a project idea, and Google Gemini breaks it down into a full task list (title, description, priority, estimated hours, insight) saved directly to the database
- **Ownership rules** — only a project's owner or an Admin can edit/delete it; same for its tasks

## Tech Stack

### Backend (`MaliksTech.PM.Api/`)

| Component | Technology |
|---|---|
| Framework | ASP.NET Core 9 Web API |
| Database | Microsoft SQL Server |
| ORM | Entity Framework Core 9 (Code-First + Migrations) |
| Auth | Custom JWT + BCrypt password hashing |
| Validation | FluentValidation + Data Annotations |
| AI | Google Gemini (via direct HTTP call) |
| Docs | OpenAPI / Scalar |

### Frontend (`pm-client/`)

| Component | Technology |
|---|---|
| Library | React 18 + TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS v4 |
| Routing | React Router v6 |
| Server state | TanStack Query |
| HTTP client | Axios |

## Project Structure

```
MaliksTech.PM.Api/
├── MaliksTech.PM.Api/        # ASP.NET Core Web API
│   ├── Controllers/          # Auth, Projects, Tasks, Comments, Users, Ai
│   ├── Models/                # EF Core entities
│   ├── DTOs/                  # Request/response shapes
│   ├── Data/                  # AppDbContext
│   ├── Services/              # TokenService, AiAssistantService
│   ├── Validators/             # FluentValidation rules
│   └── Migrations/
└── pm-client/                 # React + Tailwind frontend
    └── src/
        ├── api/               # axios client + endpoint wrappers
        ├── context/           # AuthContext
        ├── components/        # Navbar, ProtectedRoute, Badge
        └── pages/              # Login, Register, Dashboard, ProjectDetail, TaskDetail
```

## Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) 18+
- SQL Server (local instance or remote)

## Getting Started

### 1. Backend

```bash
cd MaliksTech.PM.Api
dotnet user-secrets set "Jwt:Key" "<a-long-random-secret-at-least-32-chars>"
dotnet user-secrets set "Gemini:ApiKey" "<your-gemini-api-key>"
dotnet ef database update
dotnet run
```

The API starts at `http://localhost:5143`. On first run it seeds an admin account:

- **Email:** `malik@example.com`
- **Password:** `Malik@123`

> `ConnectionStrings:DefaultConnection` in `appsettings.json` points to a local SQL Server instance (`Server=localhost;Database=MaliksTechPMDb;Trusted_Connection=True`). Adjust it for your environment if needed.

### 2. Frontend

```bash
cd pm-client
npm install
npm run dev
```

The app starts at `http://localhost:5173` and expects the API at the URL configured in `pm-client/.env` (`VITE_API_URL`, defaults to `http://localhost:5143/api`).

## Security Notes

- No secrets are committed to this repo — `Jwt:Key` and `Gemini:ApiKey` are supplied via `dotnet user-secrets` (dev) or environment variables (production), never hardcoded.
- Passwords are hashed with BCrypt; the API never returns password hashes in any response.
- CORS is restricted to the origins listed under `Cors:AllowedOrigins` in `appsettings.json`.

## License

Private/internal project — no license specified.
````
