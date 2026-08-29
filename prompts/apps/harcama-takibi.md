# Mega prompt · Kişisel Harcama Takibi

Tek atım. Öğrencinin ve ev bütçesinin klasiği; ilk kişisel aracın olmaya aday.

---

> Bir ekip gibi çalış: ürün yöneticisi planı (5 madde, onayımı al) → backend, frontend, veri
> rolleri ayrı raporlanacak → sonda test şapkası kabul listesi.
>
> İş şu: "Cüzdan" adında kişisel harcama takip uygulaması.
>
> Özellikler:
> 1. Hızlı giriş: tutar + kategori (yeme-içme, ulaşım, fatura, eğlence, market, diğer) + not;
>    Enter ile kaydolur.
> 2. Ay görünümü: bu ayın toplamı, günlük ortalama, kalan gün sayısına göre "bu hızla ay sonu
>    tahmini".
> 3. Kategori dağılımı: yatay barlar, yüzdeler; en büyük kalem vurgulu.
> 4. Aylık limit belirleme: limit aşımına yaklaşınca (%80) sarı, aşınca kırmızı bant.
> 5. Son 10 harcama listesi; tek tıkla silme.
>
> Teknik çerçeve: modüler Node.js, sadece yerleşik modüller (http, fs, node:sqlite), npm
> paketi yok. `server.js` + `lib/db.js` + `public/{index.html,style.css,app.js}`.
> `npm run dev`, port 3000. Koyu tema (#16150f / #d97757), telefonda tek elle kullanılır düzen.
>
> Bitiş tanımı: 5 harcama girip limiti 1000₺ yaptığımda üst bant doğru renkte olacak ve ay
> sonu tahmini mantıklı hesaplanacak. Kanıt adımlarını yaz.
