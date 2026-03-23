# SyncSpace

SyncSpace is a real-time collaborative whiteboard app with AI-assisted diagram generation.

It is built as a monorepo:
- Frontend: Next.js + React + Tailwind + Konva
- Backend: Express + Socket.IO + Prisma + PostgreSQL

## Features

- Real-time multi-user canvas collaboration via Socket.IO
- Drawing tools: pen, rectangle, circle, text, image upload
- Board autosave and board management dashboard
- AI copilot for flowchart/diagram generation
- Authenticated user workspace with board visibility controls
- Export options (PNG / PDF)

## Tech Stack

- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS, Zustand, Konva, Framer Motion
- Backend: Node.js, Express 5, TypeScript, Socket.IO, Prisma ORM, PostgreSQL
- Auth: Stack Auth
- AI: Google Gemini via `@google/genai`

## Monorepo Structure

```text
SyncSpace/
  backend/
    prisma/
    src/
  frontend/
    src/
```

## Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL database

## Environment Variables

Create these files before running locally.

### backend/.env

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB_NAME
DIRECT_URL=postgresql://USER:PASSWORD@HOST:5432/DB_NAME
STACK_PROJECT_ID=your_stack_project_id
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=http://localhost:3000
PORT=8080
```

### frontend/.env.local

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
```

Note:
- `NEXT_PUBLIC_BACKEND_URL` has a localhost fallback in code, but setting it explicitly is recommended.
- If your Stack Auth setup requires additional frontend/server keys, add the variables required by your Stack project configuration.

## Local Development

### 1) Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2) Prepare database

```bash
cd backend
npx prisma generate
npx prisma migrate dev
```

### 3) Run backend

```bash
cd backend
npx tsx src/server.ts
```

Backend runs on `http://localhost:8080` by default.

### 4) Run frontend

```bash
cd frontend
npm run dev
```

Frontend runs on `http://localhost:3000`.

## Scripts

### Frontend

```bash
npm run dev
npm run build
npm run start
npm run lint
```

### Backend

Current project uses direct run command:

```bash
npx tsx src/server.ts
```

## API Overview

Base URL: `http://localhost:8080/api/v1`

- `GET /api/health` - health check
- `POST /api/v1/user/sync` - sync authenticated user
- `GET /api/v1/room` - fetch user boards
- `POST /api/v1/room` - create board
- `GET /api/v1/room/:roomId` - get board data
- `POST /api/v1/room/:roomId` - save board data
- `DELETE /api/v1/room/:roomId` - delete board
- `PUT /api/v1/room/:roomId/visibility` - update board visibility

## Deployment

### Frontend (Vercel)

Set:

```env
NEXT_PUBLIC_BACKEND_URL=https://your-backend-domain
```

### Backend (Render or similar)

Set:

```env
FRONTEND_URL=https://your-frontend-domain
PORT=10000
DATABASE_URL=...
DIRECT_URL=...
STACK_PROJECT_ID=...
GEMINI_API_KEY=...
```

## Troubleshooting

- WebSocket closed / connect errors:
  - Ensure backend is running and `NEXT_PUBLIC_BACKEND_URL` points to it.
- Prisma type errors around `roomId`:
  - Ensure controller receives `roomId` as a single string before passing to Prisma.
- CORS errors:
  - Verify backend `FRONTEND_URL` matches your frontend domain.

## License

Private project. Add a license if you plan to open source it.
