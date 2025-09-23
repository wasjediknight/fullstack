# Task Manager API (Express + TypeScript + Prisma + PostgreSQL)

API REST com autenticação JWT, papéis `admin` e `member`, gerenciamento de times, tarefas e histórico de alterações.

## Stack
- Node.js 20, Express, TypeScript
- PostgreSQL + Prisma ORM
- Zod para validação
- Jest + Supertest
- Docker e docker-compose
- Pronto para Render

## Rodando local
```bash
cp .env.example .env
# ajuste DATABASE_URL e JWT_SECRET

npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

Endpoints principais estão em `src/routes` e documentados por comentários JSDoc.
Autentique-se com o token Bearer devolvido por `/auth/login`.

## Docker
```bash
docker compose up --build
```

## Deploy no Render
- Configure a variável `DATABASE_URL` apontando para um Postgres gerenciado.
- Configure `JWT_SECRET`.
- Conecte o repositório e deixe o Render usar `render.yaml`.
```

