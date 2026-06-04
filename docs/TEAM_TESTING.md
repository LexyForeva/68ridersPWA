# 68 Riders Ekip Test Yayini

Bu dosya uygulamayi ekip uyelerine acmak ve gelen hatalari duzenli takip etmek icin hizli rehberdir.

## En Mantikli Akis

1. Supabase SQL Editor icinde migration dosyalarini sirasiyla calistir:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_membership_applications.sql`
   - `supabase/migrations/003_feedback_reports.sql`
   - `supabase/migrations/004_security_hardening.sql`
2. Projeyi Vercel'e bagla.
3. Vercel Environment Variables alanina sunlari ekle:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_VAPID_PUBLIC_KEY` varsa ekle, yoksa bos kalabilir.
4. Vercel deploy adresini Supabase Auth ayarlarina ekle:
   - Site URL: `https://senin-domainin.vercel.app`
   - Redirect URLs: `https://senin-domainin.vercel.app/**`
5. Ekip uyeleri `/register` sayfasindan basvuru gonderir.
6. Kurucu `/admin` panelinden basvuruyu onaylar.
7. Onaylanan uye giris yapar ve uygulamayi test eder.
8. Hata bulan uye ana sayfadaki `Hata Bildir` kartindan rapor gonderir.
9. Kurucu `/admin` > `Raporlar` icinden hatalari takip eder ve `Cozuldu` olarak isaretler.

## Push Bildirimleri Acmak Icin

Push bildirim gercek gonderim icin Supabase Edge Function hazirdir:

```txt
supabase/functions/send-push
```

Supabase CLI ile secrets:

```bash
supabase secrets set VAPID_PUBLIC_KEY="..."
supabase secrets set VAPID_PRIVATE_KEY="..."
supabase secrets set VAPID_SUBJECT="mailto:admin@68riders.com.tr"
supabase functions deploy send-push
```

Vercel tarafinda `VITE_VAPID_PUBLIC_KEY` ayni public key olmalidir.

## Yerelde Ekip Testi

Ayni Wi-Fi agindaki kisilere gecici test acmak icin:

```bash
npm run dev -- --host 0.0.0.0
```

Sonra kendi bilgisayarinin yerel IP adresini ekip uyelerine ver:

```txt
http://BILGISAYAR_IP_ADRESIN:5173
```

Bu sadece ayni agda calisir. Disaridan erisim icin Vercel gibi bir staging linki gerekir.

## Test Kurali

Ekibe su basit kurali soyle:

- Hata gorursen ekran goruntusu al.
- Uygulamada `Hata Bildir` sayfasina gir.
- Hangi sayfada oldugunu, ne yaptigini ve ne oldugunu yaz.
- Kritik sorunlarda onem seviyesini `Kritik` sec.

## Not

Bu proje Supabase ile gercek auth, onayli uyelik, admin panel ve hata bildirimi altyapisina geciyor. Canli kullanima cikmadan once kurucu sifresi ve test hesaplari yenilenmelidir.
