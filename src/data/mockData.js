export const user = {
  name: 'Faruk Yılmaz',
  id: '68123',
  role: 'Kurucu Üye',
  memberSince: '15.03.2024',
  blood: 'A Rh+',
  bike: 'CFMOTO 450 SR',
  phone: '+90 532 681 6823',
  email: 'faruk.yilmaz@68riders.com.tr',
  city: 'Aksaray',
  emergencyName: 'Ayşe Yılmaz',
  emergencyPhone: '+90 532 000 6812',
  qrUrl: 'https://68riders.com.tr/member/68123',
}

export const events = [
  {
    id: 1,
    title: 'Şehir Turu & Kahvaltı Etkinliği',
    date: '26 Mayıs 2026',
    time: '09:00',
    place: 'Aksaray - Ihlara Vadisi',
    people: 24,
    image: 'ride',
    status: 'Katılım açık',
    distance: '118 km',
    pace: 'Orta tempo',
    meetingPoint: '68 Riders Garaj',
    details:
      'Sabah brifingi, toplu sürüş, Ihlara molası ve kahvaltı programı. Kask, eldiven ve reflektörlü yelek zorunludur.',
  },
  {
    id: 2,
    title: 'Gece Sürüşü',
    date: '31 Mayıs 2026',
    time: '21:00',
    place: 'Aksaray - Tuz Gölü',
    people: 18,
    image: 'night',
    status: 'Kask zorunlu',
    distance: '86 km',
    pace: 'Sakin tempo',
    meetingPoint: 'Kültür Parkı Otoparkı',
    details:
      'Gece görüşü ve takip mesafesi odaklı demo sürüş. Artçı düzeni korunacak, fotoğraf molası Tuz Gölü girişinde verilecek.',
  },
  {
    id: 3,
    title: 'Dağ Yolu Sürüşü',
    date: '2 Haziran 2026',
    time: '10:00',
    place: 'Aksaray - Hasan Dağı',
    people: 16,
    image: 'mountain',
    status: 'Kontenjan sınırlı',
    distance: '142 km',
    pace: 'Teknik rota',
    meetingPoint: '68 Riders Garaj',
    details:
      'Viraj pratiği ve dağ yolu güvenliği odaklı rota. Sürüş öncesi lastik basıncı ve zincir kontrolü yapılacak.',
  },
]

export const announcements = [
  {
    id: 1,
    title: 'Önemli Duyuru',
    body: 'Yeni üye kayıtları yönetim onayıyla alınacaktır.',
    time: '2 saat önce',
    type: 'urgent',
  },
  {
    id: 2,
    title: 'Sürüş Kuralları Hatırlatması',
    body: 'Kask, eldiven ve reflektörlü yelek olmadan toplu sürüşe çıkılmayacaktır.',
    time: '1 gün önce',
    type: 'rules',
  },
  {
    id: 3,
    title: 'Yeni Etkinlik',
    body: 'Hafta sonu Ihlara rotası için katılım listesi açıldı.',
    time: '2 gün önce',
    type: 'event',
  },
  {
    id: 4,
    title: 'Bakım Günü',
    body: 'Cumartesi günü zincir yağlama ve temel bakım buluşması yapılacaktır.',
    time: '3 gün önce',
    type: 'service',
  },
]

export const gallery = [
  { id: 1, title: 'Konvoy hazırlığı', type: 'video', image: 'ride', views: 342 },
  { id: 2, title: 'Ihlara molası', type: 'photo', image: 'mountain', views: 218 },
  { id: 3, title: 'Gün batımı', type: 'photo', image: 'night', views: 287 },
  { id: 4, title: 'Hasan Dağı', type: 'photo', image: 'mountain', views: 193 },
  { id: 5, title: 'Gece sürüşü', type: 'video', image: 'night', views: 426 },
  { id: 6, title: 'Ekip fotoğrafı', type: 'photo', image: 'ride', views: 302 },
  { id: 7, title: 'Kahvaltı', type: 'photo', image: 'ride', views: 155 },
  { id: 8, title: 'Tuz Gölü', type: 'photo', image: 'night', views: 244 },
  { id: 9, title: 'Garaj günü', type: 'video', image: 'ride', views: 331 },
]

export const messages = [
  { id: 1, from: 'Yol Kaptanı', text: 'Akşam sürüşünde artçı düzeni korunacak.', me: false },
  { id: 2, from: 'Medya Ekibi', text: 'Video çekenler Drive klasörüne atsın.', me: false },
  { id: 3, from: 'Sen', text: 'Tamamdır, etkinlik sonrası galeriye yükleriz.', me: true },
]

export const members = [
  { id: 68123, name: 'Faruk Yılmaz', role: 'Kurucu Üye', bike: 'CFMOTO 450 SR', status: 'Aktif' },
  { id: 68124, name: 'Mert Kaya', role: 'Yol Kaptanı', bike: 'Yamaha MT-07', status: 'Aktif' },
  { id: 68125, name: 'Selin Arslan', role: 'Medya Ekibi', bike: 'Honda CB650R', status: 'Aktif' },
]

export const badges = [
  { id: 1, title: 'Kurucu', description: 'Topluluk kurucu üyeliği' },
  { id: 2, title: 'Yol Kaptanı', description: 'Güvenli rota liderliği' },
  { id: 3, title: 'Medya', description: 'Etkinlik fotoğraf ve video katkısı' },
]

export const activity = [
  'Faruk Yılmaz QR kartını doğruladı.',
  'Gece Sürüşü için 3 yeni katılımcı eklendi.',
  'Galeriye 12 yeni medya yüklendi.',
]
