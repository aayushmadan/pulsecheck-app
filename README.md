# PulseCheck

Uptime monitoring application built with Node.js, Express, PostgreSQL (Supabase), Prisma, and React. Automatically checks your URLs at configurable intervals, logs response times and status codes, calculates uptime percentages, and provides a clean dashboard for managing monitors and viewing results.

## Features

- **Monitor Management** — Add, pause, resume, and delete URL monitors
- **Automated Checks** — Background cron jobs run at configurable intervals (in minutes)
- **Detailed Logging** — Each check records status (UP/DOWN), HTTP status code, response time, and timestamp
- **Uptime Statistics** — Calculates uptime percentage and average response time from the last 100 checks
- **Check Retention** — Configurable limit on stored checks per monitor to prevent database bloat
- **React Dashboard** — Responsive UI with dark/light theme toggle, live data refresh, modal forms, and toast notifications
- **Clean Architecture** — Separated controllers, routes, services, cron jobs, and Prisma utilities

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js (>=18.18) |
| Backend | Express.js |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma |
| Scheduling | node-cron |
| HTTP Client | Axios |
| Frontend | React 19 + Vite |
| Styling | Tailwind CSS |
| Icons | Lucide React |

## Prerequisites

- Node.js >= 18.18
- Supabase account (free tier works fine)
- npm or yarn

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase Database

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Project Settings** > **Database**
3. Under **Connection string**, select **URI** format and copy the string
4. You'll use this in the next step as `DATABASE_URL`

**Connection string formats:**
- **Connection pooler** (port 6543) — Recommended for development and serverless deployments
- **Direct connection** (port 5432) — Use for production migrations if needed

### 3. Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Supabase PostgreSQL connection string | `postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres` |
| `PORT` | Server port (default: 3000) | `3000` |
| `REQUEST_TIMEOUT_MS` | HTTP request timeout in milliseconds | `10000` |
| `CHECK_RETENTION_PER_MONITOR` | Max check logs to keep per monitor | `500` |

### 4. Initialize Database

```bash
npm run prisma:generate
npm run prisma:migrate -- --name init
```

This creates the `Monitor` and `Check` tables in your Supabase database.

### 5. Start the Application

**Development mode** (two terminals for hot-reloading):

```bash
# Terminal 1 — API server
npm run dev:api

# Terminal 2 — React frontend (Vite dev server)
npm run dev:client
```

- API server: http://localhost:3000
- Frontend (Vite): http://localhost:5173

**Production mode:**

```bash
npm run build    # Build React frontend
npm start        # Start production API server (frontend served separately)
```

The production API server runs at http://localhost:3000

## Project Structure

```
uptime-checker/
├── client/src/           # React frontend source
│   ├── components/       # Reusable UI components (MonitorTable, AddMonitorModal, Sidebar, etc.)
│   ├── hooks/            # Custom React hooks (useMonitors)
│   ├── pages/            # Page components (Dashboard)
│   └── App.jsx           # Main application component
├── prisma/
│   ├── schema.prisma     # Database schema (Monitor, Check models)
│   └── migrations/       # Generated database migrations
├── src/                  # Backend source
│   ├── controllers/      # Request handlers
│   ├── cron/             # Scheduled uptime check jobs
│   ├── prisma/           # Prisma client utilities
│   ├── routes/           # API route definitions
│   ├── services/         # Business logic (monitor checks, stats calculation)
│   └── utils/            # Helper functions
├── public/               # Static assets (fallback)
├── .env.example          # Environment variables template
└── package.json
```

## API Reference

### Health Check

```
GET /api/health
→ Returns: OK
```

### Monitors

**Create Monitor**
```
POST /api/monitors
Content-Type: application/json

{
  "url": "https://example.com",
  "interval": 1
}
```

**List All Monitors**
```
GET /api/monitors
```

**Update Monitor**
```
PATCH /api/monitors/:id
Content-Type: application/json

{
  "url": "https://example.com",
  "interval": 5,
  "isActive": false
}
```

**Delete Monitor**
```
DELETE /api/monitors/:id
```

**Get Monitor Logs**
```
GET /api/monitors/:id/logs
→ Returns the last 50 check logs for the monitor
```

**Get Monitor Stats**
```
GET /api/monitors/:id/stats
→ Returns uptime percentage, average response time, and check counts (last 100 checks)
```

## Database Schema

### Monitor
| Field | Type | Description |
|-------|------|-------------|
| id | Int | Primary key (auto-increment) |
| url | String | URL to monitor |
| interval | Int | Check interval in minutes |
| isActive | Boolean | Whether monitoring is active |
| createdAt | DateTime | Creation timestamp |

### Check
| Field | Type | Description |
|-------|------|-------------|
| id | Int | Primary key (auto-increment) |
| monitorId | Int | Foreign key to Monitor |
| status | Enum (UP/DOWN) | Check result status |
| statusCode | Int? | HTTP response status code |
| responseTime | Int | Response time in milliseconds |
| createdAt | DateTime | Check timestamp |

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start API server with hot-reload |
| `npm run dev:api` | Start API server with hot-reload |
| `npm run dev:client` | Start Vite dev server for frontend |
| `npm run build` | Build React frontend for production |
| `npm run start` | Start production server |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:studio` | Open Prisma Studio (database GUI) |

## Supabase Notes

- The **free tier** includes 500MB database storage and is sufficient for development and small-scale monitoring
- **Connection pooling** (port 6543) is recommended for development and serverless environments
- For **production deployments** with high concurrency, enable connection pooling in your Supabase dashboard
- Prisma migrations work directly with Supabase's PostgreSQL instance
- You can use **Prisma Studio** (`npm run prisma:studio`) to visually inspect your data

## Security

- **Helmet.js** sets secure HTTP headers
- **CORS** is configured for cross-origin requests
- Environment variables keep sensitive configuration out of source code
- Input validation on all API endpoints

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request