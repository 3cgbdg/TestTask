# Event Management System (EMS)

This is a professional event management platform built with NestJS (Backend), Prisma (ORM), and Next.js (Frontend).

## How to Start

### 1. Database
The project uses PostgreSQL which is configured in `docker-compose.yaml`.
```bash
docker-compose up -d
```

### 2. Backend
Navigate to the `backend` folder and run:
```bash
npm install
# Ensure .env is set up with DATABASE_URL
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

### 3. Frontend
Navigate to the `frontend` folder and run:
```bash
npm install
npm run dev
```

## Evaluation Highlights
- **Weighted Algorithm**: Similar events are ranked by category (10pts), location (5pts), and date proximity (up to 5pts).
- **Type Safety**: Full TypeScript integration across the stack.
- **Form Validation**: Strict client-side (Zod) and server-side (class-validator) validation.
- **Visuals**: Modern MUI design with map integration and responsive layout.
