---
name: meeting-notes
description: Ham toplantı notlarını düzenli Türkçe tutanağa çevirir - kullanıcı dağınık notlar, bir deşifre metni ya da toplantıdan kalma madde kırıntıları verdiğinde kullan
---

# Toplantı Tutanağı

Kullanıcı bu skill'i ham notlarla çağırdığında (yapıştırılmış metin ya da bir dosya yolu):

1. Önce her şeyi oku; satır satır özetlemeye kalkma.
2. `references/template.md` dosyasındaki çıktı şablonunu Türkçe olarak birebir doldur:
   - **Özet** (3 cümle: neler konuşuldu, ne değişti)
   - **Kararlar** (numaralı; her biri tek cümle, belirtilmişse kimin karar verdiğiyle birlikte)
   - **Aksiyonlar** (tablo: iş · sahibi · tarih; notlarda geçmiyorsa "?" yaz)
   - **Açık konular** (gündeme gelmiş ama sonuca bağlanmamış olanlar)
3. Sahip ya da tarih asla uydurma; eksikse eksik kalır.
4. Tek satırla bitir: en acil takip edilmesi gereken tek konu.

Bütün çıktıyı bir ekranı geçmeyecek kadar kısa tut. Notlar İngilizceyse yine Türkçe cevap ver:
tutanağı okuyan kişi Türk.
