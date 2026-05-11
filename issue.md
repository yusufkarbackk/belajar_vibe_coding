# Issue: API Registrasi User Baru

## Tujuan
Mengimplementasikan fitur registrasi user baru lengkap dengan tabel `users` di database, route `POST /api/users`, dan business logic-nya. Password disimpan dalam bentuk hash menggunakan bcrypt.

## Spesifikasi

### Tabel `users`
| Kolom        | Tipe          | Constraint                                  |
|--------------|---------------|---------------------------------------------|
| `id`         | INTEGER       | PRIMARY KEY, AUTO INCREMENT                 |
| `name`       | VARCHAR(255)  | NOT NULL                                    |
| `email`      | VARCHAR(255)  | NOT NULL                                    |
| `password`   | VARCHAR(255)  | NOT NULL (disimpan sebagai hash bcrypt)     |
| `created_at` | TIMESTAMP     | DEFAULT CURRENT_TIMESTAMP                   |

> Catatan: `email` harus unik secara logika (cek duplikasi sebelum insert). Boleh ditambahkan unique index, namun yang utama adalah validasi di service layer agar bisa mengembalikan error message yang sesuai.

### Endpoint: `POST /api/users`

**Request body:**
```json
{
  "name": "Eko",
  "email": "tes@email.com",
  "password": "rahasia"
}
```

**Response sukses (HTTP 200):**
```json
{
  "data": "ok"
}
```

**Response error — email sudah terdaftar (HTTP 400):**
```json
{
  "error": "email sudah terdaftar"
}
```

## Struktur Folder & File
Buat folder baru di dalam `src/`:
- `src/routes/` — berisi routing Elysia. File: `user-routes.ts`
- `src/services/` — berisi business logic. File: `user-service.ts`

Entry point `src/index.ts` mendaftarkan route dari `src/routes/user-routes.ts`.

## Tahapan Implementasi

### 1. Tambah Dependency bcrypt
- Install library bcrypt yang kompatibel dengan Bun (contoh: `bcryptjs` atau `bcrypt`).
- Pastikan ter-install via `bun add`.

### 2. Update Schema Drizzle
- Buka `src/db/schema/index.ts`.
- Update / tambahkan tabel `users` agar sesuai spesifikasi di atas (tambah kolom `password`).
- Pastikan kolom-kolom sesuai (`id`, `name`, `email`, `password`, `created_at`).

### 3. Generate & Jalankan Migration
- Jalankan `bun run db:generate` untuk membuat file migration dari schema baru.
- Jalankan migration ke MySQL (`bun run db:migrate`) agar tabel `users` benar-benar terbuat di database.

### 4. Buat Service Layer — `src/services/user-service.ts`
Service ini berisi business logic registrasi:
- Fungsi `registerUser(input: { name: string; email: string; password: string })`.
- Langkah di dalam fungsi:
  1. Cek apakah `email` sudah ada di tabel `users` (query Drizzle).
  2. Jika ada → throw error / return error indicator dengan pesan `email sudah terdaftar`.
  3. Jika belum → hash password menggunakan bcrypt (gunakan salt rounds wajar, misal 10).
  4. Insert user baru ke tabel `users`.
  5. Return indikator sukses.

> Service tidak perlu tahu soal HTTP. Cukup return data / lempar error. Route layer yang menerjemahkan ke response HTTP.

### 5. Buat Route Layer — `src/routes/user-routes.ts`
- Buat module Elysia (boleh pakai pattern plugin Elysia: `new Elysia().post(...)` lalu di-export).
- Definisikan route `POST /api/users`.
- Validasi body request memiliki field `name`, `email`, `password` (boleh pakai schema validation bawaan Elysia via `t.Object({...})`).
- Panggil `registerUser` dari service.
- Mapping hasil:
  - Sukses → `{ data: "ok" }` dengan status 200.
  - Error email sudah terdaftar → `{ error: "email sudah terdaftar" }` dengan status 400.

### 6. Daftarkan Route di Entry Point
- Edit `src/index.ts`.
- Import route dari `src/routes/user-routes.ts` dan attach ke instance Elysia menggunakan `.use(userRoutes)`.

### 7. Manual Test
- Jalankan server: `bun run dev`.
- Test menggunakan `curl` / Postman / REST client:
  - Registrasi user baru → harus return `{ "data": "ok" }`.
  - Registrasi ulang dengan email yang sama → harus return `{ "error": "email sudah terdaftar" }`.
- Cek di database, pastikan record tersimpan dan kolom `password` berisi hash (bukan plain text).

## Acceptance Criteria
- Tabel `users` ada di MySQL dengan kolom sesuai spesifikasi.
- Endpoint `POST /api/users` bekerja sesuai contoh request/response di atas.
- Password tersimpan dalam bentuk hash bcrypt (tidak plain text).
- Email duplikat menghasilkan response error yang sesuai.
- Code terbagi rapi antara `routes/` (HTTP layer) dan `services/` (business logic).

## Catatan untuk Implementer
- Jangan campurkan logic database ke dalam route — semua query DB di service.
- Jangan return password (hash maupun plain) di response.
- Tetap pakai konvensi yang sudah ada di project (TypeScript strict, import dari `drizzle-orm/mysql2`, dst).
- Jangan over-engineering: belum perlu JWT, login, atau middleware auth — fokus saja ke registrasi.
