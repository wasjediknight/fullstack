# HelpDesk Full-Stack (Node/Express + Prisma + Postgres + Vite/React + Tailwind)

## Como rodar localmente
1. `docker compose up -d` (sobe Postgres em localhost:5432)
2. **Backend**:
   - `cd backend`
   - crie `.env` a partir de `.env.example`
   - `npm i`
   - `npx prisma migrate dev`
   - `npx prisma db seed`
   - `npm run dev`
3. **Frontend**:
   - `cd ../frontend`
   - `npm i`
   - crie `.env` com `VITE_API_BASE_URL=http://localhost:3333`
   - `npm run dev`

## Contas seed
- Admin: `admin@helpdesk.local` / `Admin@123`
- Técnicos: `tec1@helpdesk.local` / `Tec1@123`, `tec2@helpdesk.local` / `Tec2@123`, `tec3@helpdesk.local` / `Tec3@123`

## Deploy
- Backend (Render): set `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`
- Frontend (Vercel): set `VITE_API_BASE_URL` apontando para o backend publicado
