# Deploy Risol Teman ke Fly.io (Gratis)

## Persiapan (sekali saja)

### 1. Install flyctl

**Mac:**
```bash
brew install flyctl
```

**Windows:**
```powershell
powershell -ExecutionPolicy Bypass -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

**Linux:**
```bash
curl -L https://fly.io/install.sh | sh
```

### 2. Daftar & login Fly.io
```bash
fly auth signup
# atau kalau sudah punya akun:
fly auth login
```
Ikuti link browser yang muncul. Fly.io butuh kartu kredit untuk verifikasi — tapi tidak akan dicharge selama dalam batas free tier.

---

## Deploy (pertama kali)

Buka terminal, masuk ke folder project:
```bash
cd /path/ke/RISOL
```

### 3. Launch app
```bash
fly launch --no-deploy
```
- Saat ditanya nama app, masukkan: `risol-teman` (atau nama unik lain)
- Saat ditanya region, pilih: `sin` (Singapore — terdekat dari Indonesia)
- Saat ditanya "overwrite fly.toml?", jawab: **No** (kita sudah punya)

### 4. Buat persistent volume untuk database
```bash
fly volumes create risol_data --region sin --size 1
```
Volume ini menyimpan file SQLite agar data tidak hilang saat app restart.

### 5. Deploy!
```bash
fly deploy
```
Tunggu beberapa menit. Fly.io akan build Docker image dan deploy ke server.

### 6. Buka app
```bash
fly open
```
App live di: `https://risol-teman.fly.dev` (sesuai nama yang kamu pilih)

---

## Update setelah ada perubahan kode

Cukup jalankan:
```bash
fly deploy
```

---

## Perintah berguna

```bash
fly status          # cek status app
fly logs            # lihat log real-time
fly ssh console     # masuk ke server (untuk debug)
fly volumes list    # cek volume database
```

---

## Catatan Free Tier

- App otomatis **tidur** setelah tidak ada request ~10 menit
- Request pertama setelah tidur butuh ~2-3 detik untuk bangun
- Batas gratis: 3 shared VM, 3GB volume storage, 160GB transfer/bulan
- Semua itu jauh lebih dari cukup untuk POS toko kecil
