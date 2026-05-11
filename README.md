# belajar_vibe_coding

Backend API menggunakan Bun + Elysia + Drizzle + MySQL.

## Stack
- **Runtime:** Bun
- **Framework:** Elysia.js
- **ORM:** Drizzle ORM
- **Database:** MySQL

## Setup

### 1. Install dependencies
```bash
bun install
```

### 2. Konfigurasi environment
```bash
cp .env.example .env
```
Edit `.env` sesuai konfigurasi MySQL lokal kamu.

### 3. Generate migration
```bash
bun run db:generate
```

### 4. Jalankan migration
```bash
bun run db:migrate
```

### 5. Jalankan server
```bash
bun run dev
```

Server berjalan di `http://localhost:3000`.

## Endpoints
| Method | Path      | Keterangan    |
|--------|-----------|---------------|
| GET    | /health   | Health check  |
