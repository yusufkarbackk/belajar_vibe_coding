# Issue: Setup Project Baru dengan Bun + Elysia + Drizzle + MySQL

## Tujuan
Membuat fondasi project backend baru di folder ini menggunakan stack modern berbasis Bun runtime, dengan Elysia sebagai web framework, Drizzle sebagai ORM, dan MySQL sebagai database.

## Stack
- **Runtime:** Bun
- **Framework:** Elysia.js
- **ORM:** Drizzle ORM
- **Database:** MySQL

## Scope Pekerjaan

### 1. Inisialisasi Project
- Inisialisasi project Bun baru di folder ini.
- Setup `package.json` dengan script-script yang umum dibutuhkan (dev, build, start, db migration, db generate).
- Setup `tsconfig.json` sesuai standar Bun + Elysia.

### 2. Install Dependencies
- Install Elysia.
- Install Drizzle ORM beserta driver MySQL yang sesuai.
- Install Drizzle Kit sebagai dev dependency untuk migration.
- Tambahkan dependency pendukung lain yang biasa dibutuhkan (contoh: dotenv / loader env, plugin Elysia yang relevan jika perlu).

### 3. Konfigurasi Environment
- Buat file `.env.example` berisi konfigurasi koneksi MySQL (host, port, user, password, database).
- Pastikan `.env` masuk dalam `.gitignore`.

### 4. Setup Database & Drizzle
- Buat konfigurasi koneksi database menggunakan Drizzle untuk MySQL.
- Buat konfigurasi `drizzle.config.ts` untuk Drizzle Kit (folder schema, output migration, dsb).
- Siapkan struktur folder untuk schema Drizzle (misal `src/db/schema`) dan satu contoh tabel sederhana sebagai placeholder.

### 5. Setup Elysia Server
- Buat entry point aplikasi Elysia.
- Tambahkan minimal satu route health check (contoh: `GET /` atau `GET /health`) yang mengembalikan status OK.
- Pastikan server bisa dijalankan via `bun run dev`.

### 6. Struktur Folder
Susun struktur folder yang rapi dan scalable, kira-kira:
- `src/` — kode aplikasi
  - `db/` — koneksi & schema Drizzle
  - `routes/` atau `modules/` — route handler
  - `index.ts` — entry point
- File konfigurasi di root (`drizzle.config.ts`, `tsconfig.json`, `.env.example`, dst).

### 7. Dokumentasi Singkat
- Update / buat `README.md` berisi:
  - Cara install dependencies (`bun install`)
  - Cara setup `.env`
  - Cara generate & run migration Drizzle
  - Cara menjalankan server dev

## Acceptance Criteria
- `bun install` berjalan tanpa error.
- `bun run dev` menjalankan Elysia server dan route health check mengembalikan respons sukses.
- Drizzle dapat melakukan generate migration dari schema contoh tanpa error.
- Struktur project bersih, siap dikembangkan untuk fitur berikutnya.

## Catatan
- Tidak perlu implementasi fitur bisnis apapun di tahap ini — cukup fondasi.
- Pilih versi terbaru yang stabil untuk setiap dependency.
- Jangan over-engineering: hindari menambahkan library / abstraksi yang belum dibutuhkan.
