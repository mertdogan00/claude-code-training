# Mega prompt · Veri Dashboard'u (CSV → analiz → panel)

Tek atım: sıfır kurulu bir Claude Code'a aşağıyı OLDUĞU GİBİ yapıştır. Repo kökünde çalıştır
(`data/satis-verisi.csv` oradadır). Evde kendi Excel'inden `Farklı Kaydet → CSV` ile aynısını
yapabilirsin; Google Sheets'ten de `Dosya → İndir → CSV`.

---

> Bir ekip gibi çalışmanı istiyorum: önce ürün yöneticisi şapkasıyla 5 maddelik kısa bir plan
> çıkar ve onayımı al; sonra işi backend, frontend ve veri katmanı olarak böl, her rolün ne
> yaptığını ayrı ayrı raporla, en sonda test şapkasıyla kontrol listesini işaretle.
>
> İş şu: `data/satis-verisi.csv` dosyasını okuyan bir "Satış Paneli" web uygulaması yap.
>
> Teknik çerçeve: küçük ama modüler bir Node.js uygulaması. Sadece Node'un yerleşik
> modüllerini kullan (http, fs, node:sqlite); npm paketi KURMA. Yapı: `server.js` +
> `lib/db.js` (CSV'yi SQLite'a yükler) + `lib/stats.js` (analizler) + `public/` altında
> `index.html`, `style.css`, `app.js`. `npm run dev` = `node --watch server.js`, port 3000.
>
> Panelde olacaklar:
> 1. Üstte dört özet kartı: toplam ciro, toplam adet, en çok kazandıran ürün, en güçlü şehir.
> 2. Günlere göre ciro çizgisi ya da çubuk grafiği (kütüphanesiz, saf SVG ya da div-bar çiz).
> 3. Kategoriye göre ciro dağılımı (yatay barlar, yüzdeleriyle).
> 4. Şehir bazlı tablo: ciro, adet, ortalama sepet; ciroya göre sıralı.
> 5. "İçgörü" kutusu: veriye bakıp 3 cümlelik Türkçe yorum üret (en iyi gün, dikkat çeken
>    kategori, önerilecek tek aksiyon) ve bunu backend'de hesaplayıp API'den döndür.
>
> Görünüm: koyu tema (#16150f zemin, #d97757 vurgu), sistem fontu, mobilde alt alta düşen
> düzen. Sayfa tek ekran, kaydırma en fazla bir kez.
>
> Kalite çıtası: her dosya tek iş yapsın, fonksiyonlar kısa, Türkçe hata mesajları. CSV'de
> bozuk satır varsa atla ve kaçını atladığını logla.
>
> Bitiş tanımı: `npm run dev` sonrası http://localhost:3000 açıldığında beş bölüm de gerçek
> veriyle dolu görünecek. Bittiğinde bana tek satırlık doğrulama komutu ve panelin ekran
> özetini yaz.

---

**Bu prompt neden çalışıyor?** Rol bölüşümü (ekip talimatı) + net dosya yapısı + madde madde
kabul kriterleri + görsel çerçeve + bitiş tanımı. "Güzel bir şey yap" değil, "bitti demenin
şartı şu" diyor.
