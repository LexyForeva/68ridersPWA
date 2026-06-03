# 68 RIDERS PWA

Mobil-first, koyu/kirmizi temali 68 Riders PWA uygulamasi.

## Kurulum

```bash
npm install
npm run dev
```

Tarayicida ac:

```txt
http://localhost:5173
```

## Build

```bash
npm run build
npm run preview
```

## Ekranlar

- Login / uyelik basvurusu
- Ana sayfa
- Etkinlikler ve etkinlik detayi
- QR uyelik karti
- Duyurular
- Galeri ve medya modal
- Ekip sohbeti
- Profil ve ayarlar
- Kurucu/admin paneli
- Hata bildirimi

## Supabase

`.env` icinde `VITE_SUPABASE_URL` ve `VITE_SUPABASE_ANON_KEY` varsa uygulama gercek Supabase backend ile calisir.

SQL dosyalari sirasiyla calistirilir:

```txt
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_membership_applications.sql
supabase/migrations/003_feedback_reports.sql
```

Uyeler `/register` ile basvuru yapar, kurucu `/admin` panelinden onaylar.

## Ekip Testi

Ekip testleri icin `Hata Bildir` ekrani vardir. Uye hata gonderir, kurucu `/admin` > `Raporlar` icinden takip eder.

Yayina/staging teste acma adimlari:

```txt
docs/TEAM_TESTING.md
```

## PWA

- `public/manifest.json` hazirdir.
- `public/sw.js` temel offline cache icerir.
- Android Chrome ve iOS Safari uzerinden ana ekrana eklenebilir.
