# 68 Riders Deployment Checklist

## 1. GitHub

GitHub Desktop:

1. `File > Add local repository`
2. Local path: `D:\68-riders-pwa-fixed`
3. `Publish repository`
4. Repository name: `68-riders-pwa`
5. Ilk yayin icin `Private` onerilir.

Push sonrasi GitHub Actions `Build` workflow yesil olmalidir.

## 2. Supabase SQL

SQL Editor icinde sirasiyla calistir:

```txt
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_membership_applications.sql
supabase/migrations/003_feedback_reports.sql
supabase/migrations/004_security_hardening.sql
supabase/migrations/005_media_and_chat_fixes.sql
```

## 3. Vercel

1. `Add New Project`
2. GitHub repo: `68-riders-pwa`
3. Framework preset: `Vite`
4. Build command: `npm run build`
5. Output directory: `dist`

Environment Variables:

```txt
VITE_SUPABASE_URL=https://PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=...
VITE_VAPID_PUBLIC_KEY=...
VITE_DEMO_ADMIN=false
```

`VITE_VAPID_PUBLIC_KEY` push acilana kadar bos kalabilir.
`VITE_DEMO_ADMIN` production ortaminda `false` kalmalidir; sadece Supabase olmadan lokal admin arayuzu test edilecekse `true` yapilir.

## 4. Supabase Auth URL

Vercel deploy linki geldikten sonra Supabase Dashboard:

```txt
Authentication > URL Configuration
```

Site URL:

```txt
https://senin-vercel-linkin.vercel.app
```

Redirect URLs:

```txt
https://senin-vercel-linkin.vercel.app/**
```

## 5. Push Bildirim

VAPID key uretildikten sonra Supabase secrets:

```bash
supabase secrets set VAPID_PUBLIC_KEY="..."
supabase secrets set VAPID_PRIVATE_KEY="..."
supabase secrets set VAPID_SUBJECT="mailto:admin@68riders.com.tr"
supabase functions deploy send-push
```

Vercel `VITE_VAPID_PUBLIC_KEY` ayni public key olmalidir.

## 6. Smoke Test

Deploy linkinde kontrol:

1. `/register` ile yeni uye basvurusu gonder.
2. Kurucu hesabi ile `/admin` ac.
3. Basvuruyu onayla.
4. Onaylanan hesapla giris yap.
5. `/chat` iki farkli hesapta realtime calisiyor mu test et.
6. `/feedback` ile hata bildirimi gonder.
7. `/admin > Raporlar` icinde bildirimi `Cozuldu` yap.
8. Android/iOS ana ekrana ekleme test et.
