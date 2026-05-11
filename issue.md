# Issue: API Login User

## Tujuan
Mengimplementasikan fitur login user. User mengirim email + password, sistem memvalidasi credentials, lalu membuat record `sessions` baru berisi token UUID dan mengembalikannya ke client sebagai bearer token untuk autentikasi request berikutnya.

## Spesifikasi

### Tabel `sessions`
| Kolom        | Tipe          | Constraint                                  |
|--------------|---------------|---------------------------------------------|
| `id`         | INTEGER       | PRIMARY KEY, AUTO INCREMENT                 |
| `token`      | VARCHAR(255)  | NOT NULL (isinya UUID)                      |
| `user_id`    | INTEGER       | FOREIGN KEY → `users.id`                    |
| `created_at` | TIMESTAMP     | DEFAULT CURRENT_TIMESTAMP                   |

> Catatan: kolom `token` sebaiknya unique secara logika karena dipakai sebagai identifier session. Boleh ditambahkan unique index.

### Endpoint: `POST /api/users/login`

**Request body:**
```json
{
  "email": "tes@email.com",
  "password": "rahasia"
}
```

**Response sukses (HTTP 200):**
```json
{
  "data": "token"
}
```
> `data` berisi string token UUID yang baru di-generate dan disimpan di tabel `sessions`.

**Response error — email/password salah (HTTP 401):**
```json
{
  "error": "email atau password salah"
}
```
> Pesan error sama untuk kasus "email tidak ditemukan" maupun "password salah" — supaya tidak membocorkan informasi email mana yang terdaftar.

## Struktur Folder & File
Tetap menggunakan struktur yang sudah ada:
- `src/routes/user-routes.ts` — tambahkan route login di sini (jangan buat file baru, gabungkan dengan route registrasi yang sudah ada).
- `src/services/user-service.ts` — tambahkan fungsi `loginUser` di service yang sudah ada.

## Tahapan Implementasi

### 1. Update Schema Drizzle
- Buka `src/db/schema/index.ts`.
- Tambahkan tabel `sessions` sesuai spesifikasi di atas:
  - Kolom `id`, `token`, `user_id` (FK ke `users.id`), `created_at`.
  - Pakai helper Drizzle untuk MySQL (`int`, `varchar`, `timestamp`, `mysqlTable`).
  - Definisikan foreign key `user_id` → `users.id` menggunakan `.references(() => users.id)`.

### 2. Generate & Jalankan Migration
- Jalankan `bun run db:generate` untuk membuat file migration baru.
- Jalankan `bun run db:migrate` untuk apply migration ke MySQL.
- Verifikasi tabel `sessions` terbentuk dengan foreign key yang benar.

### 3. Tambah Fungsi `loginUser` di Service Layer
Edit `src/services/user-service.ts`, tambahkan fungsi baru:
- Signature: `loginUser(input: { email: string; password: string }): Promise<string>` (return token).
- Langkah di dalam fungsi:
  1. Cari user berdasarkan `email` di tabel `users`.
  2. Jika user tidak ditemukan → throw error dengan pesan `email atau password salah`.
  3. Bandingkan `input.password` dengan hash di DB menggunakan `bcrypt.compare`.
  4. Jika tidak cocok → throw error yang sama (`email atau password salah`).
  5. Jika cocok → generate token UUID baru.
  6. Insert ke tabel `sessions` (`token`, `user_id`).
  7. Return token tersebut.

> Pakai `crypto.randomUUID()` (sudah built-in di Bun, tidak perlu library tambahan) untuk generate UUID.

### 4. Tambah Route Login
Edit `src/routes/user-routes.ts`, tambahkan endpoint baru di Elysia instance yang sudah ada:
- Path: `POST /users/login` (prefix `/api` sudah ada di instance, jadi full path-nya `/api/users/login`).
- Validasi body memiliki `email` dan `password` (pakai `t.Object`).
- Panggil `loginUser` dari service.
- Mapping hasil:
  - Sukses → `{ data: token }` dengan status 200.
  - Error credentials salah → `{ error: "email atau password salah" }` dengan status 401.

### 5. Manual Test
- Jalankan `bun run dev`.
- Test menggunakan REST client:
  1. Registrasi user dulu via `POST /api/users` (kalau belum punya).
  2. Login dengan email + password yang benar → harus return `{ "data": "<uuid>" }`.
  3. Login dengan email yang tidak terdaftar → harus return `{ "error": "email atau password salah" }` (401).
  4. Login dengan email benar tapi password salah → harus return error yang sama (401).
- Cek di database: record baru di tabel `sessions` dengan `user_id` yang benar dan `token` berisi UUID.

## Acceptance Criteria
- Tabel `sessions` ada di MySQL dengan foreign key ke `users.id`.
- Endpoint `POST /api/users/login` bekerja sesuai contoh request/response di atas.
- Token yang dikembalikan adalah UUID yang valid dan tersimpan di tabel `sessions`.
- Pesan error untuk "email tidak ditemukan" dan "password salah" sama persis (tidak membocorkan informasi).
- Route dan service tetap terpisah: tidak ada query DB atau bcrypt di route layer.

## Catatan untuk Implementer
- Jangan generate token sebelum credentials terverifikasi.
- Jangan return `password` atau data sensitif lain di response apapun.
- Belum perlu implementasi logout, refresh token, atau expiry session — fokus saja ke login.
- Reuse fungsi/helper yang sudah ada (`db`, `users` schema, `bcrypt`) — jangan duplikasi.
