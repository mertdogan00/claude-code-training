# Mega prompt · Neon Breaker (bir takımın kurduğu arcade canvas Breakout)

Tek atışta, tamamen otonom ve Claude Code bunu tek başına kurmuyor: alt ajanlardan bir takım
kurup onları paralel çalıştırıyor. Boş bir klasörde de çalışır, veri dosyası gerekmez. Aşağıdaki
bloğu OLDUĞU GİBİ taze bir Claude Code oturumuna yapıştır.

---

> **Sen ORKESTRATÖRSÜN.** Bu işi baştan sona, hiçbir noktada benim onayımı BEKLEMEDEN yürüt.
> Önce numaralı bir plan yazdır (en fazla 8 satır) ki salon ekrandan takip edebilsin, sonra onu
> uygula. Bu iş bir salonun önünde canlı akıyor: her adımı anlatarak ilerle.
>
> ADIM 1, SÖZLEŞMEYİ YAYIMLA, daha kimse tek satır yazmadan: dosya listesi, port, JSON
> şekilleriyle birlikte API yolları, bir seviye tanımının ve bir tur sonucunun şekli. Ekrana
> yazdır, sonra `BUILD-LOG.md` içine yaz. Paralel çalışma ancak bunun sayesinde birbirine oturur.
>
> ADIM 2, TAKIMI GERÇEKTEN KUR. Agent aracınla üç LİDER alt ajan aç ve işleri birbirinden
> bağımsız olduğu her yerde onları paralel çalıştır:
> - **Backend Lideri**: `server.js`, SQLite skor tablosu, tohumlanmış demo skorlar, skor tablosu
>   API'si ve girdi doğrulaması.
> - **Frontend Lideri**: `public/index.html`, `public/style.css`, `public/app.js`, menü ve ayarlar
>   kabuğu, canvas oyun döngüsü, fizik, güçlendirmeler, parçacıklar, ses ve HUD.
> - **QA Lideri**: aşağıdaki kontrol listesini gerçek kontrollere çevirir, sunucuyu başlatır,
>   tarayıcıda oynar, API'ye curl ile vurur, her madde için geçti mi kaldı mı raporlar ve kalanı
>   düzeltir; topun tuğlaların içinden geçmesini, topun takılıp kalmasını ve skor tablosu
>   girdisinin kötüye kullanılmasını bilerek avlar.
> Bir lider kendine bir işçi açabilir. Uygulamayı sen yazmıyorsun: parçaları birleştirir ve en
> sonda QA'yı çalıştırırsın.
>
> İŞ: "Neon Breaker" adında bir canvas Breakout kur; okul ödevi gibi değil, gerçek bir bağımsız
> arcade oyunu gibi hissettirsin: dokunuşu olan raket fiziği, gittikçe hızlanan seviyeler, yağan
> güçlendirmeler, parçacıklar, sentezlenmiş ses ve yeniden başlatmayı atlatan bir skor tablosu.
>
> ÜRÜN KABUĞU, pazarlık yok: bu bir demo değil, yayımlanmış bir oyun gibi durmalı. Logosuyla
> gerçek bir başlangıç ekranı ve oyuncu adını taşıyan bir profil çipi; en az üç ekrana uzanan
> menüler; oyunu gerçekten değiştiren bir ayarlar ekranı; tek bir vurgu rengiyle uyumlu tek bir
> neon palet; Türkçe arayüz metni; klavye ve dokunmatik dostu; 390px'te oynanabilir.
>
> YIĞIN, pazarlık yok, derleme adımı yok, framework yok:
> - TEK klasör, burada oluşturulur, içinde tam olarak şunlar: `package.json`, `server.js`,
>   `public/` (`index.html`, `style.css`, `app.js`), `data.sqlite`, `README.md`, `BUILD-LOG.md`.
> - `package.json` içinde `"type": "module"` ve `node server.js` çalıştıran bir `start` betiği var.
> - `server.js`: Node 24, npm'den Express ve YERLEŞİK `node:sqlite` modülü
>   (`import { DatabaseSync } from 'node:sqlite'`). Bu makinede derlenen bir şey yok.
> - `public/` düz HTML, CSS ve JavaScript, oyun alanı bir `<canvas>` üzerinde: bundler yok, CSS
>   framework'ü yok, oyun motoru yok. Ses Web Audio ile sentezlenir, ses dosyası kullanılmaz.
> - `data.sqlite` İLK AÇILIŞTA oluşturulur ve demo skorlarla tohumlanır; silmek sıfırlar.
> - Kimsenin yazacağı tek iki komut: `npm install`, sonra `node server.js`, adres
>   http://localhost:3000. `PORT=3001 node server.js` portu geçersiz kılabilmeli.
> - Kullanıcının gördüğü bütün arayüz metni TÜRKÇE; `README.md` ve `BUILD-LOG.md` de TÜRKÇE
>   yazılır; sadece kodun kendisi ve kod yorumları İngilizce kalır.
>
> ÖZELLİKLER, hepsi zorunlu:
> 1. Kabuk: Neon Breaker logosunun olduğu ve oyuncu adını localStorage'da hatırlayan bir
>    başlangıç ekranı, üç ekrana uzanan bir menü (Oyna, Skor tablosu, Ayarlar), seviyeler
>    geçildikçe açılan bir seviye seçimi ve Space ile açılan bir duraklatma menüsü (devam,
>    yeniden başla, ayarlar).
> 2. Dokunuşu olan raket fiziği: sekme açısı topun rakete NEREDEN çarptığına bağlı (ortada düz,
>    kenarlarda 60 dereceye kadar), çarpışma süpürmeli hesaplanır ki hızlı top tuğlaların
>    içinden geçmesin, ve yatayda düzleşen bir döngü normal bir açıya doğru itilir.
> 3. Kendi deseni ve paleti olan beş seviye, her seviyede bir hız rampası ve üç tuğla türü:
>    normal, iki vuruşluk, kırılmaz.
> 4. Kırılan tuğlalardan düşen güçlendirmeler (çoklu top, geniş raket, yavaş top, ekstra can),
>    raketle yakalanır, her biri neon HUD'da geri sayan bir çip gösterir.
> 5. Tat: her kırılışta parçacık patlaması, can kaybında ekran sarsıntısı, büyüyen kombo yazısı
>    ve sentezlenmiş ses (raket sesi, satıra göre perdesi değişen tuğla tonu, çıngırak, güm).
> 6. Beş başarım (ilk seviyeyi geçmek, can kaybetmeden bitirmek, 10'luk kombo, tüm
>    güçlendirmeleri yakalamak, 5000 skor), her biri kazanıldığı anda bir toast ile bildirilir.
> 7. SQLite'ta skor tablosu (isim, skor, seviye, tarih), Skor tablosu ekranında ilk 10 ve yeni
>    girilen kayıt vurgulu; POST ismi ve skoru sunucu tarafında doğrular.
> 8. Oyunu gerçekten değiştiren, localStorage'da saklanan ve anında uygulanan Ayarlar: ses
>    açık/kapalı, zorluk (kolay / orta / zor, top hızını ve can sayısını değiştirir), tema (üç
>    neon palet) ve raket boyu. Dokunmatik: raket parmağı takip eder, dokunuş topu fırlatır.
>
> KABUL KONTROL LİSTESİ, QA Lideri her maddeyi EKRANDA ya da curl ile doğrular ve geçti/kaldı
> raporlar:
> 1. `npm install` sonra `node server.js` temiz açılır; http://localhost:3000 logosuyla
>    başlangıç ekranını gösterir, üç menü ekranı da açılır ve konsol sessizdir.
> 2. 1. seviye geçilebiliyor: son tuğla kırılır, 2. seviye farklı bir desenle yüklenir ve seviye
>    seçiminde açılır, bir başarım toast'u çıkar.
> 3. Space duraklatma menüsünü açar ve top olduğu yerde donar, devam 3-2-1 geri sayımından sonra
>    oyunu sürdürür, tam bir seviye boyunca top ne tuğlaların içinden geçer ne de alanın dışına
>    kaçar.
> 4. Bir güçlendirme düşer, yakalanır, geri sayan bir çip gösterir ve sıfırda gözle görülür
>    biçimde etkisini yitirir.
> 5. Ayarlar'da tema değiştirmek tuğlaları, raketi ve arka planı anında yeniden boyar, zorluk zor
>    topu gözle görülür biçimde hızlandırır, sesi kapatmak sesi susturur, sayfa yenilenince dört
>    ayar da yerinde kalır.
> 6. `curl -s -X POST localhost:3000/api/scores -H 'content-type: application/json' -d
>    '{"name":"","score":-5}'` Türkçe bir HTTP 400 döndürür, `curl -s localhost:3000/api/scores`
>    yeniden başlatmayı atlatan bir ilk 10 JSON'u döndürür ve 390px'te sürükleme raketi hareket
>    ettirir.
>
> BİTTİ TANIMI: kontrol listesinin her maddesi yeşil; `README.md` içinde ürün adı, iki
> komut, kontroller, özellikler ve takım; `BUILD-LOG.md` içinde plan, takım, sözleşme, QA'nın
> yaptığı testler ve düzeltilen her hata. Sonu çalıştırma komutuyla bağla.

---

**Sahne notu:** takım çalışırken salona sor: "fizik işçisiyle HUD işçisi aynı saniyede aynı
uygulamanın içine yazıyor, peki onların birbirine çarpmasını ne engelliyor?" Cevap, orkestratörün
en başta yayımladığı sözleşme. İş bitince `npm install`, sonra `node server.js` çalıştır,
http://localhost:3000 adresini aç, başlangıç ekranına bir isim yaz ve salondan birine 1. seviyeyi
projeksiyonda oynat; tepkiyi görmek için oyunun ortasında Ayarlar'dan temayı değiştir. Kurulum
takılırsa yedek: `cd showcase/neon-breaker` ve `node server.js`.
