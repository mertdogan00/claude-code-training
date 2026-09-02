# Mega prompt · Salon Sohbeti (bir takımın kurduğu gerçek zamanlı sohbet ürünü)

Tek atışta, tamamen otonom ve Claude Code bunu tek başına kurmuyor: alt ajanlardan bir takım
kurup onları paralel çalıştırıyor. Boş bir klasörde de çalışır, veri dosyası gerekmez. Aşağıdaki
bloğu OLDUĞU GİBİ taze bir Claude Code oturumuna yapıştır.

---

> **Sen ORKESTRATÖRSÜN.** Bu işi baştan sona, hiçbir noktada benim onayımı BEKLEMEDEN yürüt.
> Önce numaralı bir plan yazdır (en fazla 8 satır) ki salon ekrandan takip edebilsin, sonra onu
> uygula. Bu iş bir salonun önünde canlı akıyor: her adımı anlatarak ilerle.
>
> ADIM 1, SÖZLEŞMEYİ YAYIMLA, daha kimse tek satır yazmadan: dosya listesi, port, JSON
> şekilleriyle birlikte HTTP yolları ve her iki yöndeki bütün WebSocket mesaj türleri. Ekrana
> yazdır, sonra `BUILD-LOG.md` içine yaz. Paralel çalışma ancak bunun sayesinde birbirine oturur.
>
> ADIM 2, TAKIMI GERÇEKTEN KUR. Agent aracınla üç LİDER alt ajan aç ve işleri birbirinden
> bağımsız olduğu her yerde onları paralel çalıştır:
> - **Backend Lideri**: `server.js`, SQLite şeması ve tohumlama, WebSocket merkezi (yayın, kimler
>   çevrimiçi, yazıyor bilgisi), oda, mesaj, tepki ve arama yolları, LAN IP'si ve QR.
> - **Frontend Lideri**: `public/index.html`, `public/style.css`, `public/app.js`, katılma ekranı,
>   ürün kabuğu, sohbet görünümü, ayarlar ekranı ve projeksiyon için QR ekranı.
> - **QA Lideri**: aşağıdaki kontrol listesini gerçek kontrollere çevirir, sunucuyu başlatır, İKİ
>   ayrı kişiymiş gibi İKİ tarayıcı penceresi açar, API'ye curl ile vurur, her madde için geçti
>   mi kaldı mı raporlar ve kalanı düzeltir.
> Bir lider kendine bir işçi açabilir. Uygulamayı sen yazmıyorsun: parçaları birleştirir ve en
> sonda QA'yı çalıştırırsın.
>
> İŞ: "Salon Sohbeti" adında, bütün bir salonun katılabileceği gerçek zamanlı bir sohbet ürünü
> kur: odalar, canlı mesajlar, kimlerin çevrimiçi olduğu, yazıyor bilgisi, tepkiler, arama,
> ayarlar ve projeksiyonda bir katılma QR'ı ki aynı wifi'daki telefonlar doğrudan içeri girsin.
>
> ÜRÜN KABUĞU, pazarlık yok: bu bir demo değil, yayımlanmış bir ürün gibi durmalı. Ürün adını
> ve bir profil çipini taşıyan bir üst çubuk; en az üç ekrana uzanan bir gezinme; işleri
> gerçekten değiştiren bir ayarlar ekranı; boş ve yükleniyor durumları; klavye ve dokunmatik
> dostu; tek bir vurgu rengiyle uyumlu tek bir palet; Türkçe arayüz metni; 390px'te kullanılabilir.
>
> YIĞIN, pazarlık yok, derleme adımı yok, framework yok:
> - TEK klasör, burada oluşturulur, içinde tam olarak şunlar: `package.json`, `server.js`,
>   `public/` (`index.html`, `style.css`, `app.js`), `data.sqlite`, `README.md`, `BUILD-LOG.md`.
> - `package.json` içinde `"type": "module"` ve `node server.js` çalıştıran bir `start` betiği var.
> - `server.js`: Node 24, npm'den Express ve `ws`, katılma QR'ı için `qrcode` ve YERLEŞİK
>   `node:sqlite` modülü (`import { DatabaseSync } from 'node:sqlite'`). Derlenen bir şey yok.
> - Sunucu `0.0.0.0` üzerinde DİNLER ki aynı wifi'daki diğer cihazlar erişebilsin, ve açılışta hem
>   http://localhost:3000 hem de LAN adresini yazdırır.
> - `public/` düz HTML, CSS ve JavaScript: TypeScript yok, bundler yok, CSS framework'ü yok.
> - `data.sqlite` İLK AÇILIŞTA oluşturulur; içinde Genel, Sorular ve Kahve odaları ve birkaç
>   hoş geldin mesajı tohumlu gelir; silmek uygulamayı sıfırlar.
> - Kimsenin yazacağı tek iki komut: `npm install`, sonra `node server.js`, adres
>   http://localhost:3000. `PORT=3001 node server.js` portu geçersiz kılabilmeli.
> - Kullanıcının gördüğü bütün arayüz metni TÜRKÇE; `README.md` ve `BUILD-LOG.md` de TÜRKÇE
>   yazılır; sadece kodun kendisi ve kod yorumları İngilizce kalır.
>
> ÖZELLİKLER, hepsi zorunlu:
> 1. Katılma ekranı: bir görünen ad ve bir avatar rengi, localStorage'da hatırlanır, böylece
>    sayfa yenilenince doğrudan içeri girilir; sonra kabuk gelir: üst çubuk, profil çipi ve üç
>    ekran (Sohbet, Katıl, Ayarlar), her birinin kendi yükleniyor ve boş durumuyla.
> 2. Kenar çubuğunda odalar (Genel, Sorular, Kahve tohumlu), bir "oda oluştur" düğmesi ve her
>    oda için okunmamış sayacı.
> 3. WebSocket üzerinden mesajlar, odadaki diğer her pencereye bir saniyenin altında ulaşır,
>    SQLite'ta saklanır, biri katıldığında son 50 mesaj geçmiş olarak yüklenir.
> 4. Kimler çevrimiçi ve yazıyor bilgisi: odada kimlerin olduğunu gösteren canlı bir liste ve
>    biri yazarken beliren, yazmayı bırakınca kaybolan bir "yazıyor..." göstergesi.
> 5. Herhangi bir mesaja emoji tepkileri, sayıları her pencerede canlı güncellenir.
> 6. Oda geçmişinde arama, sonuçlar yazarı ve saatiyle listelenir, birine tıklamak o mesaja
>    atlar ve onu vurgular.
> 7. İşleri gerçekten değiştiren ve hepsi localStorage'da saklanan Ayarlar: tema (koyu / açık),
>    bildirim sesi (açık / kapalı), görünen adı ve avatar rengini değiştirme.
> 8. KATILMA QR'ı: sunucu `os.networkInterfaces()` ile dizüstünün LAN IPv4 adresini bulur
>    (dahili olmayan ilki), `/api/join` bu adresi ve `qrcode.toDataURL` ile üretilen bir QR data
>    URL'ini döndürür, Katıl ekranı da ikisini projeksiyon için kocaman gösterir.
>
> KABUL KONTROL LİSTESİ, QA Lideri her maddeyi EKRANDA ya da curl ile doğrular ve geçti/kaldı
> raporlar:
> 1. `npm install` sonra `node server.js` temiz açılır; kayıtta hem yerel hem LAN adresi yazar;
>    http://localhost:3000 adresinde katılma ekranı konsolda hata olmadan görünür.
> 2. Farklı isimlerle katılmış iki tarayıcı penceresi: birinde gönderilen mesaj bir saniyenin
>    altında diğerinde belirir ve iki isim de odanın çevrimiçi listesinde görünür.
> 3. Bir pencerede yazmak diğerinde "yazıyor..." gösterir ve yazma bitince kaybolur; bir
>    pencerede eklenen tepki diğerinde sayısını günceller.
> 4. Sunucuyu yeniden başlatmak her odayı, mesajı ve tepkiyi korur, geçmiş yeniden yüklenir.
> 5. Arama, önceki bir mesajdaki bir kelimeyi bulur; `curl -s localhost:3000/api/join` LAN
>    adresini ve bir QR data URL'ini döndürür, o QR okutulunca katılma ekranı açılır.
> 6. Ayarlar'da tema ve bildirim sesi sayfa yenilenince yerinde kalır; 390px'te hiçbir şey yana
>    taşmaz.
>
> BİTTİ TANIMI: kontrol listesinin her maddesi yeşil; `README.md` içinde ürün adı, iki
> komut, LAN'dan katılma talimatı, özellikler ve takım; `BUILD-LOG.md` içinde plan, takım,
> sözleşme, QA'nın yaptığı testler ve düzeltilen her hata. Sonu çalıştırma komutuyla bağla.

---

**Sahne notu:** takım çalışırken salona sor: "bir mesajın bir tarayıcıdan diğerine bir saniyenin
altında gitmesi gerekiyor, peki o bağlantıyı açık tutan kim?" İş bitince `npm install`, sonra
`node server.js` çalıştır ve projeksiyonda yan yana İKİ pencere aç: birine yaz, diğerine düştüğünü
izle. Garantili yol bu demo. Sonra Katıl ekranını aç ve aynı wifi'daki iki üç telefon QR'ı okutup
salona canlı canlı merhaba desin. Kurulum takılırsa yedek: `cd showcase/live-chat` ve
`node server.js`.
