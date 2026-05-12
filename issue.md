# Issue: API Logout User

## Tujuan
Mengimplementasikan fitur logout user. User mengirim token bearer di header `Authorization`, dan sistem menghapus record `sessions` yang sesuai sehingga token tidak bisa lagi dipakai untuk autentikasi.

## Spesifikasi

### Endpoint: `DELETE /api/users/logout`

**Headers:**
```
Authorization: Bearer <token>
```
> `<token>` adalah token UUID dari endpoint login (`POST /api/users/login`) yang tersimpan di tabel `sessions`.

**Response sukses (HTTP 200):**
```json
{
  "data": "ok"
}
```
> Record di tabel `sessions` dengan `token` tersebut WAJIB sudah terhapus.

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
- `src/routes/user-routes.ts` — tambahkan route `DELETE /users/logout`.
- `src/services/user-service.ts` — tambahkan fungsi `logoutUser`.

## Tahapan Implementasi

### 1. Tambah Fungsi `logoutUser` di Service Layer
Edit `src/services/user-service.ts`, tambahkan fungsi baru:
- Signature: `logoutUser(token: string): Promise<void>`.
- Langkah di dalam fungsi:
  1. Cek apakah ada record di tabel `sessions` dengan `token` tersebut.
  2. Jika tidak ada → throw error `unauthorized`.
  3. Jika ada → `DELETE FROM sessions WHERE token = ?` menggunakan Drizzle (`db.delete(sessions).where(eq(sessions.token, token))`).
  4. Tidak perlu return apa-apa.

> Alternatif: langsung jalankan `delete` dan cek `affectedRows` / hasil delete. Jika tidak ada baris yang terhapus → throw `unauthorized`. Pilih pendekatan mana saja yang lebih clean.

### 2. Tambah Route `DELETE /users/logout`
Edit `src/routes/user-routes.ts`, chain method baru di Elysia instance yang sudah ada:
- Path: `DELETE /users/logout` (full path: `/api/users/logout`).
- Ambil header `Authorization` dari parameter `headers` di handler Elysia.
- Parsing token (sama persis dengan route `GET /users/current` yang sudah ada):
  1. Jika header tidak ada → 401 + `{ error: "unauthorized" }`.
  2. Jika tidak diawali `Bearer ` → 401 + `{ error: "unauthorized" }`.
  3. Ambil token: bagian setelah `Bearer `.
- Panggil `logoutUser(token)` di dalam try-catch.
- Mapping hasil:
  - Sukses → `{ data: "ok" }` dengan status 200.
  - Error apapun → `{ error: "unauthorized" }` dengan status 401.

### 3. Manual Test
- Jalankan `bun run dev`.
- Test menggunakan REST client:
  1. Registrasi → login → dapatkan token.
  2. `DELETE /api/users/logout` dengan header `Authorization: Bearer <token>` yang valid → harus return `{ "data": "ok" }`, dan record di `sessions` terhapus.
  3. `DELETE /api/users/logout` dengan token yang sama (setelah logout) → harus return 401 (karena sudah terhapus).
  4. `DELETE /api/users/logout` tanpa header `Authorization` → 401.
  5. `DELETE /api/users/logout` dengan format header salah → 401.
  6. `DELETE /api/users/logout` dengan token random / tidak valid → 401.
- Cek di database setelah logout sukses: pastikan baris `sessions` yang bersangkutan benar-benar hilang.

## Acceptance Criteria
- Endpoint `DELETE /api/users/logout` bekerja sesuai contoh request/response.
- Setelah sukses logout, record `sessions` dengan `token` tersebut WAJIB sudah terhapus dari database.
- Semua skenario gagal (header tidak ada, format salah, token tidak valid) menghasilkan response yang sama persis: status 401 + `{ "error": "unauthorized" }`.
- Tidak ada query DB di route layer — semua query DB di service.

## Catatan untuk Implementer
- Reuse instance Elysia `userRoutes` yang sudah ada — chain `.delete(...)` baru, jangan buat instance baru.
- Reuse `db`, schema `sessions` yang sudah ada — jangan duplikasi.
- Parsing `Authorization` header sudah ada di route `GET /users/current` — boleh pakai pendekatan yang sama (copy-paste 3 baris parsing tidak masalah; baru bikin helper kalau pattern ini dipakai 3x atau lebih).
- Belum perlu invalidate semua session user lain, audit log, atau response body kompleks — fokus saja ke hapus session berdasarkan token yang diberikan.
