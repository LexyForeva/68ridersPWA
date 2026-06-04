# iOS Installation Guide 📱

iOS (iPhone/iPad) için 68 Riders PWA kurulum rehberi.

---

## ⚠️ Önemli Bilgi

Apple, iOS'ta **Web Push Notifications**'ı iOS 16.4+ sürümlerinde desteklemeye başladı, ancak **çok kısıtlı**:

- ✅ **PWA Yükleme**: Ana ekrana ekleme çalışıyor
- ✅ **Offline Çalışma**: Service Worker destekleniyor
- ⚠️ **Push Notifications**: Sadece ana ekrana eklenmiş PWA'larda çalışır
- ❌ **Background Sync**: Desteklenmiyor
- ❌ **Automatic Updates**: Sınırlı

---

## 📲 Kurulum Adımları

### 1. Safari'de Aç
- **Sadece Safari** ile açın (Chrome/Firefox iOS'ta PWA desteği yok)
- Uygulamayı ziyaret edin: `https://68riders.app`

### 2. Paylaş Menüsünü Aç
- Ekranın **altındaki ortadaki** <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%233b82f6' stroke-width='2'%3E%3Cpath d='M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8'/%3E%3Cpolyline points='16 6 12 2 8 6'/%3E%3Cline x1='12' y1='2' x2='12' y2='15'/%3E%3C/svg%3E" style="display:inline;vertical-align:middle"> **Paylaş** butonuna tıklayın
- Veya üstteki **AA** simgesine basıp "Paylaş" seçin

### 3. Ana Ekrana Ekle
- Aşağı kaydırın
- **"Ana Ekrana Ekle"** seçeneğini bulun (+ ikonu ile)
- Tıklayın

### 4. İsim Onaylayın
- Uygulama ismi: **68 Riders**
- Sağ üstteki **"Ekle"** butonuna basın

### 5. Ana Ekranda Görün! 🎉
- Şimdi 68 Riders ana ekranınızda bir uygulama gibi görünür
- Normal bir uygulama gibi açın

---

## 🔔 Push Notification Kurulumu

iOS'ta push notifications çalışması için:

### Gereksinimler:
- ✅ iOS 16.4 veya üstü
- ✅ Ana ekrana eklenmiş PWA
- ✅ Safari ile açılmış olmalı

### Adımlar:
1. **Ana ekrana ekle** (yukarıdaki adımlar)
2. Ana ekrandan **uygulamayı aç**
3. Ayarlar sayfasına git
4. **"Bildirimlere İzin Ver"** butonuna bas
5. iOS bildirim iznini **"İzin Ver"** ile onayla

### ⚠️ Önemli Notlar:
- Push notifications **sadece ana ekrana eklenmiş** PWA'larda çalışır
- Safari browser'da açarsanız **çalışmaz**
- İlk açılışta otomatik açılmayabilir, **Ayarlar** > **Bildirimler** kısmından manuel aktif edebilirsiniz

---

## 🐛 Sorun Giderme

### PWA Ana Ekrana Eklenmiyor
**Çözüm:**
- Safari kullanın (Chrome/Firefox iOS'ta desteklemiyor)
- Private browsing kapalı olsun
- iOS 13+ gerekli

### Bildirimler Gelmiyor
**Çözüm:**
1. Ana ekrandan **68 Riders uygulamasını** aç (Safari'den değil!)
2. iOS Ayarlar → 68 Riders → Bildirimler → **İzin Ver**
3. Uygulamayı kapatıp tekrar aç

### Uygulama Yavaş veya Donuyor
**Çözüm:**
- Uygulamayı kapatıp tekrar açın
- Safari cache'ini temizleyin: Ayarlar → Safari → Geçmişi ve Web Sitesi Verilerini Temizle
- iPhone'u yeniden başlatın

### Ana Ekran İkonu Yanlış Görünüyor
**Çözüm:**
- Uygulamayı ana ekrandan silin
- Safari cache temizleyin
- Tekrar ana ekrana ekleyin

---

## 📊 iOS vs Android Karşılaştırma

| Özellik | iOS | Android |
|---------|-----|---------|
| Ana Ekrana Ekle | ✅ | ✅ |
| Offline Çalışma | ✅ | ✅ |
| Push Notifications | ⚠️ Kısıtlı | ✅ Tam |
| Background Sync | ❌ | ✅ |
| Auto Update | ⚠️ Kısıtlı | ✅ |
| Native Paylaşım | ✅ | ✅ |
| Kamera Erişimi | ✅ | ✅ |
| Konum Erişimi | ✅ | ✅ |

---

## 💡 İpuçları

### 1. Hız İçin
- PWA'yı **ana ekrana ekleyin** (daha hızlı açılır)
- Wifi'ye bağlıyken ilk açın (offline cache dolsun)

### 2. Bildirimler İçin
- **Mutlaka ana ekrandan açın** (Safari'den değil)
- "İzin Ver" dediğinizden emin olun

### 3. Güncelleme İçin
- Uygulamayı kapatıp açtığınızda otomatik günceller
- Manuel: Uygulamayı sil + tekrar ekle

---

## 🆘 Destek

Sorun yaşıyorsanız:

1. **Hata Bildir** sayfasından detaylı bilgi gönderin
2. **Admin ile iletişim**: admin@68riders.com
3. **GitHub Issues**: [github.com/68riders/pwa/issues](https://github.com/68riders/pwa/issues)

---

## 📚 Ek Kaynaklar

- [Apple PWA Documentation](https://developer.apple.com/documentation/webkit/safari_web_extensions)
- [iOS Push Notifications](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/)
- [Can I Use - iOS PWA](https://caniuse.com/?search=pwa)

---

**Made with ❤️ by 68 Riders Community** 🏍️
