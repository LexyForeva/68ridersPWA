# Supabase Edge Functions

## send-push

Admin panelinden veya ileride otomasyonlardan web push bildirimi gondermek icin hazir Edge Function.

Gerekli secrets:

```bash
supabase secrets set VAPID_PUBLIC_KEY="..."
supabase secrets set VAPID_PRIVATE_KEY="..."
supabase secrets set VAPID_SUBJECT="mailto:admin@68riders.com.tr"
```

Deploy:

```bash
supabase functions deploy send-push
```

Frontend tarafinda `VITE_VAPID_PUBLIC_KEY` ayni public key olmalidir. Private key sadece Supabase secrets icinde tutulur.
