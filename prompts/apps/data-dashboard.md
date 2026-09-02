# Mega prompt · Satış Analitik Paneli (bir takımın kurduğu satış panosu)

Tek atış, tam özerk, üstelik Claude Code bunu tek başına kurmuyor: alt-ajanlardan bir takım
kurup hepsini paralel çalıştırıyor. Boş bir klasörde de çalışır, depodaki CSV varsa onu da
alır. Aşağıdaki bloğu OLDUĞU GİBİ yeni bir Claude Code oturumuna yapıştır.

---

> **Sen ORKESTRATÖRSÜN.** Bu işi baştan sona, hiçbir noktada benim onayımı beklemeden yürüt.
> Önce numaralı bir plan yaz (en fazla 8 satır) ki salon ekrandan takip edebilsin, sonra onu
> uygula. Bu iş bir seyircinin önünde canlı akıyor: her adımı anlatarak ilerle.
>
> ADIM 1, KİMSE TEK SATIR YAZMADAN ÖNCE SÖZLEŞMEYİ YAYIMLA: dosya listesi, port, tam API
> rotaları ve her birinin döndürdüğü JSON şekli. Bunu ekrana yaz, sonra `BUILD-LOG.md`
> içine geçir. Paralel işin sonradan birbirine oturmasının tek sebebi bunun önceden var
> olmasıdır.
>
> ADIM 2, TAKIMI GERÇEKTEN KUR. Agent aracınla üç LİDER alt-ajan aç ve işleri birbirinden
> bağımsız olduğu her yerde onları paralel çalıştır:
> - **Backend Lideri**: `server.js`, SQLite şeması, CSV içe aktarma ya da satır üreteci,
>   bütün toplulaştırma uç noktaları, içgörü motoru.
> - **Frontend Lideri**: `public/index.html`, `public/style.css`, `public/app.js`, ürün
>   kabuğu, dört ekran, KPI kartları, grafikler ve filtre çubuğu.
> - **QA Lideri**: aşağıdaki kabul kontrol listesini gerçek kontrollere çevirir, sunucuyu
>   başlatır, her maddeyi tarayıcıda ya da curl ile doğrular, madde madde geçti/kaldı
>   raporlar, kalanları düzeltir.
> Bir lider, bağımsız alt görevler için bir iki işçi açabilir. Uygulamayı sen yazmıyorsun:
> birleştiriyor, çakışmaları çözüyor ve en sonda QA'yı çalıştırıyorsun.
>
> İŞ: "Satış Analitik Paneli"ni kur; paralı bir ürün gibi duran bir satış analitiği panosu:
> KPI kartları, grafikler, hepsini aynı anda süren filtreler ve sunucunun hesapladığı bir
> içgörü paneli.
>
> ÜRÜN KABUĞU, pazarlık yok: bu şey demo gibi değil, yayınlanmış bir ürün gibi hissettirmeli.
> Ürün adı ve profil rozeti olan bir üst bar; dört ekranlı bir kenar çubuğu; gerçekten bir
> şeyleri değiştiren bir ayarlar ekranı; her yerde boş ve yükleniyor durumları; klavye ve
> dokunmatik dostu; tek vurgu rengi olan uyumlu bir palet; Türkçe arayüz metni; 390px'te
> okunur.
>
> YIĞIN, pazarlık yok, derleme adımı yok, framework yok:
> - Burada oluşturulan TEK klasör, tam olarak şunları taşır: `package.json`, `server.js`,
>   `public/` (`index.html`, `style.css`, `app.js`), `data.sqlite`, `README.md`,
>   `BUILD-LOG.md`.
> - `package.json` içinde `"type": "module"` ve `node server.js` çalıştıran bir `start`
>   script'i olacak.
> - `server.js`: Node 24, npm'den Express ve GÖMÜLÜ `node:sqlite` modülü
>   (`import { DatabaseSync } from 'node:sqlite'`). Bu makinede hiçbir yerel paket derlenmez.
> - `public/` düz HTML, CSS ve JavaScript: TypeScript yok, bundler yok, CSS framework'ü yok.
>   Grafikler: `express.static` ile `node_modules` üzerinden servis edilen Chart.js, ya da
>   elle çizilmiş SVG.
> - `data.sqlite` İLK AÇILIŞTA oluşturulur ve doldurulur; silmek uygulamayı sıfırlar.
> - Kimsenin yazacağı tek iki komut: `npm install`, sonra `node server.js`, adres
>   http://localhost:3000. `PORT=3001 node server.js` portu ezebilmeli.
> - VERİ: `../data/sales-data.csv` ya da `data/sales-data.csv` varsa onu içe aktar (sütunlar
>   `date,product,category,qty,unit_price,city`); yoksa aynı sütunlarla 120 gerçekçi satır
>   üret. Kurulum hem boş bir klasörde HEM de bu deponun içinde çalışmalı.
> - Kullanıcının gördüğü bütün arayüz metni TÜRKÇE; `README.md` ve `BUILD-LOG.md` de TÜRKÇE
>   yazılır; sadece kodun kendisi ve kod yorumları İngilizce kalır.
>
> ÖZELLİKLER, hepsi zorunlu:
> 1. Kabuk: ürün adını, en iyi üç içgörüyü listeleyen bir bildirim zilini ve bir profil
>    rozetini taşıyan üst bar; dört ekranlı bir kenar çubuğu (Genel bakış, Ürünler, Şehirler,
>    Ayarlar); veri gelirken iskelet yükleyiciler, hiçbir şey eşleşmediğinde Türkçe bir boş
>    durum.
> 2. Genel bakış: dört KPI kartı (ciro, satılan adet, sipariş sayısı, ortalama sepet), her
>    biri aynı uzunluktaki bir önceki döneme göre yüzde değişimiyle, artı hedef geçildiğinde
>    rengi değişen aylık hedef ciro ilerleme çubuğu.
> 3. Gün / hafta / ay kırılım anahtarı olan ciro zaman çizgisi grafiği.
> 4. Yüzde etiketli kategori payı donut'ı; bir dilime tıklamak o kategori filtresini uygular.
> 5. Ürünler: sıralanabilir sütunlar, anlık arama kutusu, ürün başına ciro, adet ve toplam
>    içindeki pay. Şehirler: ciroya göre sıralı çubuk grafik, ipucu balonunda hem ciro hem
>    adet.
> 6. Tek bir durumdan HER ekranı süren tek bir filtre çubuğu (tarih aralığı, kategori, şehir),
>    görünür bir "filtreleri temizle" sıfırlamasıyla.
> 7. İçgörü paneli: filtrelenmiş veriden 3 ila 5 gözlemi SUNUCU hesaplar (en iyi gün, öne
>    çıkan kategori, en çok değişen, önerilen bir aksiyon), her biri arkasındaki rakamla
>    birlikte.
> 8. Gerçekten bir şeyleri değiştiren, hepsi localStorage'da saklanan Ayarlar: tema (koyu /
>    açık), para birimi (tek sabit kur tablosu üzerinden TL, USD, EUR; her para rakamına
>    uygulanır) ve ilerleme çubuğunu besleyen aylık hedef ciro, artı veri setinin yerine
>    geçen CSV içe aktarma.
>
> KABUL KONTROL LİSTESİ, QA Lideri her maddeyi EKRANDA ya da curl ile doğrular ve geçti/kaldı
> raporlar:
> 1. `npm install` ardından `node server.js` temiz açılıyor; http://localhost:3000 konsolda
>    hata olmadan gerçek veriyi çiziyor ve kenar çubuğu dört ekrana da ulaşıyor.
> 2. `curl -s localhost:3000/api/kpis` sıfırdan farklı ciro, adet ve sipariş döndürüyor.
> 3. Tarih aralığını son 7 güne çekmek KPI kartlarını, zaman çizgisini, donut'ı, şehir
>    grafiğini ve ürün tablosunu aynı anda değiştiriyor ve tablo toplamı ciro kartıyla
>    tutuyor.
> 4. Ayarlar'da temayı açık'a, para birimini USD'ye çevirmek bütün uygulamayı ve her para
>    rakamını yeniden boyuyor, sayfa yenilenince ikisi de duruyor ve aylık hedef ciroyu
>    yükseltmek ilerleme çubuğunu oynatıyor.
> 5. `curl -s localhost:3000/api/insights` her biri bir rakam taşıyan 3 ila 5 içgörü
>    döndürüyor.
> 6. 390px genişlikte hiçbir şey yana taşmıyor, kenar çubuğu kapanıyor ve bileşenler alt alta
>    diziliyor.
>
> BİTTİ TANIMI: kontrol listesinin her maddesi yeşil; ürün adını, iki komutu, özellikleri ve
> takımı içeren bir `README.md`; planı, takımı, sözleşmeyi, QA'nın çalıştırdığı testleri ve
> düzeltilen her hatayı içeren bir `BUILD-LOG.md`. Sonu çalıştırma komutu ve beş satırlık bir
> özetle bağla.

---

**Sahne notu:** takım çalışırken salona şunu sor: "üç alt-ajan aynı anda yazıyor, peki
frontend ile backend'in hâlâ birbirine oturduğuna kim karar veriyor?" Cevap ekranda:
orkestratörün, daha kimse yazmaya başlamadan yayımladığı sözleşme. İş bitince `npm install`,
sonra `node server.js` çalıştır ve http://localhost:3000 adresini aç. Dört ekranı gez,
Ayarlar'da temayı ve para birimini değiştir, sonra seyirciden bir değişiklik isteği al.
Kurulum takılırsa yedek: `cd showcase/data-dashboard` ve `node server.js`.
