# CMS Frontend (React + Tailwind)

Frontend client for the Class Management System backend in `../src`.

## Features
- Public class browsing and enrollment CTA
- Visitor onboarding form (profile + class + KBZ transaction)
- JWT login and role-aware dashboard routing
- HR/ADMIN pending payment verification actions
- ADMIN broadcast notification panel and pending student list
- STUDENT notification inbox + realtime push + class chat

## Stack
- React 19 + TypeScript
- Vite
- Tailwind CSS v4 (`@import "tailwindcss"`)
- React Router
- STOMP WebSocket client (`@stomp/stompjs`)

## Setup
```powershell
Set-Location "D:\cms\client"
npm install
```

## Run Dev
```powershell
Set-Location "D:\cms\client"
npm run dev
```

By default, Vite runs on `http://localhost:5173` and proxies:
- REST: `/api` -> `http://localhost:8080`
- WebSocket: `/ws` -> `ws://localhost:8080`

## Build Check
```powershell
Set-Location "D:\cms\client"
npm run build
```

## Important Notes
- Backend must be running before frontend API calls work.
- Student chat needs a valid class ID where student is confirmed.
- Realtime auth uses JWT in STOMP `CONNECT` header: `Authorization: Bearer <token>`.

## Troubleshooting
- `http proxy error ... ECONNREFUSED` means frontend is running but backend is not reachable at `127.0.0.1:8080`.
- Start backend first, then refresh the browser.
- If backend runs on another port, update `client/vite.config.ts` proxy targets.

