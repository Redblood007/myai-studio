# MyAI Studio

A personal AI workspace built with Next.js, TypeScript, Prisma, PostgreSQL, and OpenAI.

## Features
- AI chat interface
- File upload
- Message persistence
- Dashboard-style UI
- TypeScript-first architecture

## Setup

1. Install dependencies
   npm install

2. Set environment
   cp .env.example .env.local

3. Start PostgreSQL
   Make sure your database is running.

4. Push Prisma schema
   npx prisma generate
   npx prisma db push

5. Run app
   npm run dev

6. Open browser
   http://localhost:3000

## Environment
Add:
- DATABASE_URL
- OPENAI_API_KEY

## Tech Stack
- Next.js
- TypeScript
- Prisma
- PostgreSQL
- OpenAI
- Tailwind CSS

## Notes
This is a strong starter project. You can extend it with:
- auth
- PDF parsing
- semantic search
- user dashboards
- cloud deployment
