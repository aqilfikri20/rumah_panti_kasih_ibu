# Sistem Manajemen Rumah Kasih Ibu

Aplikasi web untuk membantu pengurus Rumah Kasih Ibu mengelola data anak dan kegiatan pengasuhan dalam satu tempat. Informasi yang dikelola meliputi profil anak, kesehatan, pertumbuhan, catatan harian, pengingat, pembagian pengasuh, serta stok makanan, obat, pakaian, dan perlengkapan bayi.

Frontend dibuat dengan React, TypeScript, dan Vite. Backend menyediakan REST API dengan FastAPI dan menyimpan data di PostgreSQL.

## Fitur utama

- Melihat dan mengelola profil anak, termasuk pencarian, filter, dan pagination.
- Mencatat kesehatan, pengukuran pertumbuhan, serta catatan harian.
- Melihat pengasuh, anak dampingan, alamat, dan nomor HP.
- Mengelola pengingat dan kebutuhan beserta stoknya.
- Melihat ringkasan kondisi anak dan kebutuhan di dashboard.

## Requirements

- **Python 3.10 atau lebih baru** untuk backend.
- **Node.js 20.19+ atau 22.12+** untuk frontend Vite 8.
- **PostgreSQL 14 atau lebih baru**.
- **npm** (disertakan bersama Node.js).
- `psql` untuk menjalankan skrip database dan data awal.

Pastikan PostgreSQL sudah berjalan dan siapkan nama pengguna serta kata sandi database sebelum menjalankan aplikasi.

## Instalasi lokal (Windows PowerShell)

### 1. Siapkan database

Dari direktori utama proyek, jalankan skrip schema. Skrip ini membuat database `web_child`, tabel, indeks, dan beberapa data contoh jika belum tersedia.

```powershell
$env:PGPASSWORD = "kata-sandi-postgres"
psql -h localhost -p 5432 -U postgres -d postgres -f .\backend-web-child\schema.sql
Remove-Item Env:PGPASSWORD
```

Sesuaikan host, port, dan nama pengguna PostgreSQL bila berbeda. Jangan masukkan kata sandi database ke kode frontend atau commit ke Git.

### 2. Pasang dan jalankan backend

Buka terminal PowerShell pertama:

```powershell
cd .\backend-web-child
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
Copy-Item .env.example .env
```

Buka `backend-web-child/.env` dan sesuaikan `DATABASE_URL` serta `FRONTEND_ORIGINS`:

```dotenv
DATABASE_URL=postgresql+psycopg://postgres:KATA_SANDI@localhost:5432/web_child
FRONTEND_ORIGINS=http://localhost:5173
```

Karakter khusus pada kata sandi URL database perlu di-URL-encode. Jangan membagikan atau memasukkan file `.env` ke commit.

Jalankan API dari direktori `backend-web-child`:

```powershell
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Saat mulai, backend membuat tabel yang belum ada dan menambahkan beberapa kolom baru yang diperlukan pada database lama.

### 3. Pasang dan jalankan frontend

Buka terminal PowerShell kedua:

```powershell
cd .\frontend-web-child
npm ci
npm run dev
```

Buka alamat yang ditampilkan Vite, biasanya <http://localhost:5173>. Konfigurasi Vite meneruskan request `/api` ke backend di `http://127.0.0.1:8000`.

## Alamat layanan

- Aplikasi: <http://localhost:5173>
- Dokumentasi API FastAPI: <http://127.0.0.1:8000/docs>
- Pemeriksaan koneksi database: <http://127.0.0.1:8000/api/healthz>

## Perintah pengembangan

Jalankan dari direktori `frontend-web-child`:

```powershell
npm run dev       # server pengembangan
npm run build     # build produksi
npm run preview   # pratinjau build produksi
npm run lint      # pemeriksaan lint
```

## Struktur direktori

```text
backend-web-child/       FastAPI, model database, dan schema PostgreSQL
frontend-web-child/      React, TypeScript, dan Vite
frontend-web-child/database/  Schema PostgreSQL untuk aplikasi
```

## Catatan

- Katalog kebutuhan diinisialisasi aplikasi melalui API saat halaman kebutuhan dibuka; perubahan stok disimpan di PostgreSQL.
- Skrip schema backend dapat memasukkan data contoh dan akun demo lokal. Autentikasi API belum diterapkan, jadi jangan gunakan kredensial demo untuk data atau lingkungan produksi.
- Simpan konfigurasi lokal di `backend-web-child/.env`. File tersebut tidak boleh dipublikasikan.
