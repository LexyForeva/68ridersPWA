# 68 Riders Supabase Kurulumu

1. Supabase projesi oluştur.
2. `supabase/migrations/001_initial_schema.sql` dosyasını Supabase SQL Editor içinde çalıştır.
3. Project Settings > API ekranından URL ve anon key değerlerini al.
4. Proje kökünde `.env` oluştur:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
VITE_VAPID_PUBLIC_KEY=
```

5. Uygulamadan bir hesap başvurusu yap.
6. İlk kurucu hesabı SQL Editor ile founder yap:

```sql
update public.profiles
set role = 'founder', status = 'active', member_no = '68123'
where email = 'faruk.yilmaz@68riders.com.tr';
```

7. Artık sadece `status = active` üyeler uygulama içine girebilir. `pending`, `banned`, `removed`, `rejected` üyeler route ve RLS seviyesinde engellenir.

## Sohbet

Realtime chat `chat_messages` tablosunu ve `chat-media`, `chat-voice`, `chat-documents` bucketlarını kullanır.

Desteklenenler:
- Yazılı mesaj
- Fotoğraf/video/belge
- Kamera dosyası
- Sesli mesaj
- Cevaplama
- Düzenleme/silme
- Emoji tepkisi
- Anket mesajı
- Etkinlik paylaşımı
- Online presence ve yazıyor bilgisi

## Push Bildirim

Frontend subscription kaydı hazır. Gerçek push göndermek için VAPID key ve bir Supabase Edge Function veya ayrı Node backend gerekir. Subscription kayıtları `push_subscriptions` tablosunda tutulur.
