# Mega prompt · Randevu Defteri (kuaför / klinik / danışman)

Tek atım. Telefonla randevu alan her küçük işletmenin derdi.

---

> Bir ekip gibi çalış: ürün yöneticisi planı (5 madde, onayımı al) → backend, frontend, veri
> rolleri ayrı raporlanacak → sonda test şapkası kabul listesi.
>
> İş şu: tek çalışanlı bir işletme için "Randevu Defteri" web uygulaması.
>
> Özellikler:
> 1. Haftalık görünüm: Pzt-Cmt sütunları, 09:00-19:00 arası yarım saatlik satırlar.
> 2. Boş hücreye tıklayınca randevu formu: müşteri adı, telefon, hizmet, not.
> 3. Dolu hücre: müşteri adı + hizmet; tıklayınca detay + iptal butonu.
> 4. Çakışma koruması: dolu saate ikinci randevu yazılamaz, Türkçe uyarı.
> 5. Üst bar: bugünkü randevu sayısı, haftanın doluluk yüzdesi, bir sonraki boş saat.
> 6. "Yarını yazdır" butonu: yarının listesini sade bir yazdırma sayfası olarak açar.
>
> Teknik çerçeve: modüler Node.js, sadece yerleşik modüller (http, fs, node:sqlite), npm
> paketi yok. `server.js` + `lib/db.js` + `public/{index.html,style.css,app.js}`.
> `npm run dev`, port 3000. Koyu tema (#16150f / #d97757); tablo ekrana tek seferde sığsın.
>
> Bitiş tanımı: iki randevu ekleyip birini iptal ettiğimde takvim ve üst bar doğru
> güncellenecek; aynı saate ikinci kayıt denemesi reddedilecek. Kanıt adımlarını yaz.
