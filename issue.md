# Issue: API Get Current User

## Tujuan
Mengimplementasikan fitur untuk mendapatkan informasi user yang sedang login berdasarkan token bearer yang dikirim di header `Authorization`. Token tersebut dicari di tabel `sessions` dan dipakai untuk lookup user terkait.

## Spesifikasi

### Endpoint: `GET /api/users/current`

**Headers:**
```
Authorization: Bearer <token>
```
> `<token>` adalah token UUID yang didapat dari endpoint login (`POST /api/users/login`) dan tersimpan di tabel `sessions`.

**Response sukses (HTTP 200):**
```json
{
  "data": {
    "id": 1,
    "name": "eko",
    "email": "tes@email.com",
    "created_at": "2026-05-11T10:00:00.000Z"
  }
}
```
> Tidak ada field `password` di response — wajib tidak boleh bocor.

**Response error — token tidak valid / tidak ada (HTTP 401):**
```json
{
  "error": "unauthorized"
}
```
> Pesan error sama untuk semua kasus auth gagal:
> - Header `Authorization` tidak ada
> - Format bukan `Bearer <token>`
> - Token tidak ditemukan di tabel `sessions`

## Struktur Folder & File
Tetap menggunakan struktur yang sudah ada:
- `src/routes/user-routes.ts` — tambahkan route `GET /users/current` di sini.
- `src/services/user-service.ts` — tambahkan fungsi `getCurrentUser` di service yang sudah ada.

## Tahapan Implementasi

### 1. Tambah Fungsi `getCurrentUser` di Service Layer
Edit `src/services/user-service.ts`, tambahkan fungsi baru:
- Signature: `getCurrentUser(token: string): Promise<{ id: number; name: string; email: string; created_at: Date }>`.
- Langkah di dalam fungsi:
  1. Cari record di tabel `sessions` berdasarkan `token`. Lakukan JOIN dengan `users` ATAU dua query terpisah (cari session dulu, lalu cari user berdasarkan `session.userId`).
  2. Jika session tidak ditemukan → throw error `unauthorized`.
  3. Jika user tidak ditemukan (edge case: session orphan) → throw error `unauthorized`.
  4. Return object berisi `id`, `name`, `email`, dan `created_at` dari user.
     - **Jangan** return field `password`.
     - Field response menggunakan snake_case `created_at` (mapping dari kolom `createdAt` di schema Drizzle).

### 2. Tambah Route `GET /users/current`
Edit `src/routes/user-routes.ts`, tambahkan endpoint baru di Elysia instance yang sudah ada:
- Path: `GET /users/current` (full path: `/api/users/current`).
- Ambil header `Authorization`. Cara di Elysia: gunakan parameter `headers` di handler, lalu ambil `headers.authorization`.
- Parsing token:
  1. Jika header tidak ada → return 401 + `{ error: "unauthorized" }`.
  2. Jika header tidak diawali `Bearer ` (case-sensitive cukup `Bearer ` dengan satu spasi) → return 401 + `{ error: "unauthorized" }`.
  3. Ambil token: bagian setelah `Bearer `.
- Panggil `getCurrentUser(token)` dari service.
- Mapping hasil:
  - Sukses → `{ data: user }` dengan status 200.
  - Error → `{ error: "unauthorized" }` dengan status 401.

> Gunakan try-catch agar error dari service ditangkap dan diterjemahkan ke response 401 dengan message yang seragam (`unauthorized`).

### 3. Manual Test
- Jalankan `bun run dev`.
- Test menggunakan REST client:
  1. Registrasi → login → dapatkan token.
  2. `GET /api/users/current` dengan header `Authorization: Bearer <token>` yang valid → harus return data user (tanpa password).
  3. `GET /api/users/current` tanpa header `Authorization` → harus return 401 + `{ "error": "unauthorized" }`.
  4. `GET /api/users/current` dengan token random / tidak valid → harus return 401 + error yang sama.
  5. `GET /api/users/current` dengan format header salah (misal `Authorization: <token>` tanpa `Bearer`) → harus return 401.

## Acceptance Criteria
- Endpoint `GET /api/users/current` bekerja sesuai contoh request/response.
- Response sukses hanya berisi `id`, `name`, `email`, `created_at` — TIDAK ADA `password`.
- Semua skenario gagal (header tidak ada, format salah, token tidak valid) menghasilkan response yang sama persis: status 401 + `{ "error": "unauthorized" }`.
- Tidak ada query DB di route layer — semua query DB di service.

## Catatan untuk Implementer
- Reuse instance Elysia `userRoutes` yang sudah ada — chain method baru, jangan buat instance baru.
- Reuse `db`, schema `users` dan `sessions` yang sudah ada — jangan duplikasi.
- Hati-hati saat select kolom dari `users`: jangan select kolom `password`. Bisa pakai `.select({ id, name, email, createdAt })` di Drizzle untuk explicit.
- Tabel `sessions` sudah ada (dibuat di issue sebelumnya) — tidak perlu migration baru untuk fitur ini.
- Belum perlu cek expiry session, refresh token, atau invalidate — fokus saja ke get current user.
