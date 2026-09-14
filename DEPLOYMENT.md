# Deploy frontend SIGAP ke Vercel

## Pengaturan proyek

- Root Directory: `frontend` jika repository berisi backend dan frontend; `.` jika repository hanya frontend.
- Framework Preset: Vite.
- Build Command: `npm run build`.
- Output Directory: `dist`.
- Environment Variable: `VITE_API_URL=/` (Production dan Preview).

Jangan isi VITE_API_URL dengan URL ngrok untuk konfigurasi ini. Browser mengakses `/api/*` dan `/sanctum/*` pada domain frontend; Vercel meneruskannya ke ngrok melalui `vercel.json`. Ini menjaga cookie session dan XSRF pada origin yang sama. Restart build setelah perubahan environment variable.

## Pengaturan pada backend Laravel

Setelah domain frontend tersedia, ganti `nama-proyek.vercel.app` di contoh berikut dengan domain sebenarnya. Gabungkan daftar domain lokal yang masih dipakai; jangan menyalin contoh sebagai keseluruhan `.env`.

```dotenv
APP_URL=https://unsecured-sanitizer-porcupine.ngrok-free.dev
FRONTEND_URL=https://nama-proyek.vercel.app
SANCTUM_STATEFUL_DOMAINS=nama-proyek.vercel.app,localhost:5173,127.0.0.1:5173
CORS_ALLOWED_ORIGINS=https://nama-proyek.vercel.app,http://localhost:5173,http://127.0.0.1:5173
SESSION_DOMAIN=null
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=lax
```

`SESSION_DOMAIN=null` membuat cookie host-only sehingga respons proxy dapat dipakai pada domain frontend. Jangan menetapkan domain cookie ke ngrok. `SANCTUM_STATEFUL_DOMAINS` berisi hostname tanpa protokol, sedangkan CORS dan FRONTEND_URL memakai URL lengkap. Daftarkan hanya domain preview yang dipercaya, bukan wildcard semua `*.vercel.app`.

Pada mesin backend, jalankan `php artisan config:clear` setelah perubahan. Pastikan APP_DEBUG=false untuk backend yang diakses publik. Jangan memindahkan APP_KEY, password database, atau kredensial SMTP ke Vercel frontend.

## Development lokal

`npm run dev` menggunakan proxy Vite pada port 5173. Target default adalah ngrok yang sama. Untuk backend lokal, buat `.env.local`:

```dotenv
VITE_API_URL=/
API_PROXY_TARGET=http://localhost:8000
```

Restart Vite setelah perubahan. Gunakan `SESSION_SECURE_COOKIE=false` hanya untuk backend development yang diakses melalui HTTP lokal; deployment HTTPS menggunakan true. `npm run preview` bukan emulator rewrite Vercel.

## Verifikasi setelah deploy

1. Buka `/api/v1/health` pada domain Vercel; harus JSON HTTP 200.
2. Login melalui UI; `/sanctum/csrf-cookie` harus sukses dan cookie harus berada pada domain frontend.
3. Periksa `/api/v1/auth/me`, refresh halaman dashboard, lalu logout/login kembali.
4. Coba membuka URL dashboard secara langsung untuk memeriksa fallback SPA.

Health 200 saja belum membuktikan login berjalan. Jika 419/401, periksa domain Sanctum, cookie Domain/Secure, dan Origin/Referer yang diterima backend. Pengujian lengkap membutuhkan domain Vercel sebenarnya.

Ngrok dan server Laravel harus tetap aktif. Jika hostname ngrok berubah, ubah tiga target di `vercel.json` dan target development di `.env.example`/`.env.local`, lalu deploy ulang.

Referensi: https://vercel.com/docs/routing/rewrites dan https://laravel.com/docs/sanctum.
