# Mega prompt · Refleks Oyunu (skor tablolu)

Tek atım: boş bir klasörde bile çalışır; sıfır kurulu Claude Code'a olduğu gibi yapıştır.

---

> Bir ekip gibi çalış: önce ürün yöneticisi olarak 5 maddelik plan çıkarıp onayımı al; sonra
> oyun mantığı (frontend), skor servisi (backend) ve veri katmanı rollerini ayrı ayrı işle ve
> her rolün çıktısını raporla; en sonda test şapkasıyla kabul listesini tek tek işaretle.
>
> İş şu: tarayıcıda oynanan "Refleks" oyunu.
>
> Oynanış: Başla'ya basınca 30 saniyelik tur başlar. Ekranda rastgele konumda yuvarlak hedef
> belirir; tıklayınca +1 puan, hedef her vuruşta biraz küçülür ve yer değiştirir. Süre bitince
> skor, oyuncu adıyla kaydedilir ve En İyi 5 listesi gösterilir; "Tekrar Oyna" ile yeni tur.
>
> Teknik çerçeve: küçük ama modüler Node.js. Sadece yerleşik modüller (http, fs, node:sqlite);
> npm paketi KURMA. Yapı: `server.js` + `public/index.html` + `public/style.css` +
> `public/game.js`. Skorlar SQLite'ta kalıcı. `npm run dev` = `node --watch server.js`,
> port 3001.
>
> Görünüm: koyu tema (#16150f zemin, #d97757 hedef), skor ve süre üst barda büyük; hedefe
> hover'da imleç crosshair; küçük bir vuruş animasyonu (CSS ile, kütüphanesiz).
>
> Kalite çıtası: isim en fazla 12 karakter, boşsa "anon"; skor tam sayı; aynı isim tekrar
> oynayabilir. Sunucu yeniden başlasa da liste kaybolmayacak.
>
> Bitiş tanımı: `npm run dev` sonrası oynanabilir olacak, iki tur oynayınca En İyi 5 dolacak.
> Bittiğinde doğrulama adımlarını (2 komut + 1 tıklama) yaz.

---

**Sahne notu:** bekleme anında salona sor: "hedef küçüldükçe oyun kolay mı zor mu?"
İlk turu seyirciden biri oynasın.
