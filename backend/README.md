# Backend - NestJS with Prisma

## Description

NestJS backend with Prisma ORM for managing events.

## Installation

```bash
npm install
```

## Setup Environment

Copy `.env.example` to `.env` and configure your database connection:

```bash
cp .env.example .env
```

Update the `DATABASE_URL` in `.env` to match your PostgreSQL database configuration.

## Database Setup

1. Generate Prisma Client:
```bash
npm run prisma:generate
```

2. Run database migrations:
```bash
npm run prisma:migrate
```

3. (Optional) Seed the database:
```bash
npm run prisma:seed
```

## Running the app

```bash
# development
npm run start:dev

# production mode
npm run start:prod
```

## API Endpoints

- `GET /events` - Get all events
- `GET /events/:id` - Get event by ID
- `POST /events` - Create new event
- `PATCH /events/:id` - Update event
- `DELETE /events/:id` - Delete event

## Test

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```
