# Mega prompt · Stok Takip (küçük işletme)

Tek atım. Küçük bir dükkanın gerçek derdi: "neyim var, neyim bitiyor?"

---

> Bir ekip gibi çalış: ürün yöneticisi planı (5 madde, onayımı al) → backend, frontend, veri
> rolleri ayrı raporlanacak → sonda test şapkası kabul listesi.
>
> İş şu: küçük işletme için "Stok Defteri" web uygulaması.
>
> Özellikler:
> 1. Ürün ekleme formu: ad, kategori, adet, kritik eşik (altına düşünce uyarı), birim fiyat.
> 2. Ürün listesi: arama kutusu + kategori filtresi; adet azalt/çoğalt butonları (satış/alım).
> 3. Kritik stok şeridi: eşiğin altındaki ürünler üstte kırmızımsı bantta, "sipariş ver"
>    rozetiyle.
> 4. Özet kartları: toplam çeşit, toplam stok değeri (adet × fiyat), kritik ürün sayısı.
> 5. Her hareket (ekleme, azaltma) tarihçeye yazılsın; "Son 10 hareket" kutusu.
>
> Teknik çerçeve: modüler Node.js, sadece yerleşik modüller (http, fs, node:sqlite), npm
> paketi yok. `server.js` + `lib/db.js` + `public/{index.html,style.css,app.js}`.
> `npm run dev`, port 3000. Koyu tema (#16150f / #d97757), mobil uyumlu.
>
> Kalite çıtası: adet negatife düşemez; eşik varsayılanı 5; Türkçe doğrulama mesajları;
> sunucu yeniden başlayınca veri durur.
>
> Bitiş tanımı: 3 ürün ekleyip birini eşiğin altına düşürdüğümde kritik bantta görmem. Bitince
> bunu kanıtlayan adımları yaz.
