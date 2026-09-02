# BUILD-LOG - Neon Breaker

Bu uygulama nasıl yapıldı: plan, takım, daha kimse tek satır yazmadan yayımlanan sözleşme, QA'nın
yürüttüğü testler ve bulunup düzeltilen her hata.

## 1. Plan (yapım başlamadan ekrana basıldı)

1. SÖZLEŞMEYİ yayımla: dosya listesi, port, JSON şekilleriyle API yolları, bölüm tanımı, tur sonucu.
2. Üç lider alt ajanı başlat, Backend ile Frontend'i paralel çalıştır.
3. Backend Lideri: `package.json`, `server.js`, `node:sqlite` şeması, tohumlanmış demo skorları, skor tablosu API'si, doğrulama.
4. Frontend Lideri: `public/index.html`, `public/style.css`, `public/app.js`, ürün kabuğu ve canvas oyunu.
5. Orkestratör iki yarıyı birleştirir ve sunucuyu ayağa kaldırır.
6. QA Lideri kabul kontrol listesini gerçek kontrollere çevirir, oyunu oynar, API'ye curl ile gider, bozuk olanı düzeltir.
7. Masaüstü (1440x900) ve telefon (390x844) ekran görüntülerini al.
8. `README.md` dosyasını yaz, `BUILD-LOG.md` dosyasını tamamla, çalıştırma komutuyla kapat.

## 2. SÖZLEŞME (önce yayımlandı, ki paralel iş birbirine otursun)

Aşağıdaki her şey, tek satır uygulama kodu var olmadan önce sabitlendi. Backend Lideri ile Frontend
Lideri hiç konuşmak zorunda kalmadı: ikisi de buna karşı yazdı.

### 2.1 Dosya listesi ve sahiplik

| dosya | sahibi | not |
|---|---|---|
| `package.json` | Backend Lideri | `"type": "module"`, `start` betiği `node server.js` çalıştırır |
| `server.js` | Backend Lideri | Express + `node:sqlite`, `public/` ile `/api` yollarını sunar |
| `.gitignore` | Backend Lideri | `node_modules/` ve `data.sqlite` yok sayılır |
| `public/index.html` | Frontend Lideri | kabuğun tamamı, tek sayfa |
| `public/style.css` | Frontend Lideri | tutarlı tek bir neon palet, üç tema, 390px'e kadar duyarlı |
| `public/app.js` | Frontend Lideri | kabuk yönlendiricisi, ayarlar, canvas oyun döngüsü, fizik, ses |
| `data.sqlite` | çalışma anı | ilk açılışta oluşturulur ve tohumlanır, gitignore'da, sıfırlamak için sil |
| `README.md`, `BUILD-LOG.md` | Orkestratör | |
| `screenshots/` | Orkestratör | masaüstü ve telefon PNG'leri |

Başka hiçbir şey yok. Paketleyici yok, framework yok, CSS kütüphanesi yok, oyun motoru yok, ses
dosyası yok.

### 2.2 Port ve adres

`const PORT = Number(process.env.PORT) || 3000;` ve `0.0.0.0` adresine bağlanır.
Varsayılan çalıştırma, http://localhost:3000 üzerinde `node server.js`. `PORT=3001 node server.js`
bunu değiştirir.

### 2.3 API yolları ve JSON şekilleri

| metot | yol | başarı | hata |
|---|---|---|---|
| GET | `/api/health` | `200 {"ok":true,"product":"Neon Breaker","levels":5}` | |
| GET | `/api/levels` | `200 {"levels":[LevelDef x5]}` | |
| GET | `/api/achievements` | `200 {"achievements":[Achievement x5]}` | |
| GET | `/api/scores?limit=10` | `200 {"scores":[ScoreRow ...]}` | hatalı limit için `400 {"ok":false,"error":"<Turkish>"}` |
| POST | `/api/scores` | `201 {"ok":true,"id":N,"rank":N,"scores":[ScoreRow x10]}` | `400 {"ok":false,"error":"<Turkish>"}` |

`GET /api/scores` sıralaması `score DESC, created_at ASC`, varsayılan limit 10, en fazla 50.
`rank`, yeni satırın tüm tablodaki 1'den başlayan sırasıdır.

### 2.4 Veri şekilleri

```jsonc
// ScoreRow
{ "id": 7, "name": "NOVA", "score": 5200, "level": 4, "created_at": "2026-09-02T09:14:00.000Z" }

// RoundResult, the POST /api/scores body
{ "name": "NOVA", "score": 5200, "level": 4 }

// Achievement
{ "id": "ilk-bolum", "title": "Ilk Bolum", "description": "Bir bolumu temizle" }

// LevelDef
{
  "id": 1,
  "name": "Baslangic",
  "speed": 1.0,                     // ball speed multiplier for this level
  "rows": 6,
  "cols": 10,
  "palette": { "bg": "#070713", "accent": "#00f0ff", "bricks": ["#00f0ff", "#ff2ea6", "#7c5cff"] },
  "grid": [[1,1,1,1,1,1,1,1,1,1], /* rows x cols, 0 empty, 1 normal, 2 two-hit, 3 unbreakable */ ]
}
```

### 2.5 POST /api/scores için sunucu tarafı doğrulama

- `name`: baştan sona boşluklar kırpılmış, 1 ila 12 karakter; yalnızca harf (Türkçe dahil), rakam, boşluk, `_` ve `-`.
- `score`: tam sayı, 0 ila 999999.
- `level`: tam sayı, 1 ila 5.
- Her ihlal HTTP 400 ve Türkçe bir mesaj döndürür. Hiçbir satır yazılmaz.

### 2.6 Frontend sözleşmesi

- Frontend açılışta `GET /api/levels` çağırır ve aynı şekle sahip, gömülü bir yedek dizi tutar,
  böylece istek başarısız olsa bile oyun yine de çalışır. Yedek dizi sunucudakinin birebir kopyası
  değil: aynı beş bölüm sayısını ve aynı alan adlarını taşır, desenleri ve adları farklıdır.
- localStorage anahtarları: `nb.player` (metin), `nb.settings`
  (`{"sound":true,"difficulty":"orta","theme":"nebula","paddle":"orta"}`),
  `nb.progress` (`{"unlocked":1,"achievements":[]}`).
- Tema, `<html>` üzerinde `data-theme` olarak uygulanır; `nebula`, `asit` veya `magma`.
- QA ile ekran görüntüsü aracının uygulamayı sürebilmesi için sabit DOM kimlikleri:
  `#screen-start`, `#screen-game`, `#screen-scores`, `#screen-settings`, `#screen-levels`,
  `#nav-play`, `#nav-scores`, `#nav-settings`, `#game-canvas`, `#profile-chip`, `#player-name`,
  `#pause-menu`. Etkin ekranın kimliği `document.body.dataset.screen` üzerinde yansıtılır.
- Kullanıcının gördüğü bütün metinler Türkçe. Kod ve yorumlar İngilizce; iki markdown dosyası
  Türkçe.

## 3. Gerçekten kurulan takım

İstem, bir Claude Code oturumunu ORKESTRATÖR yapar ve o oturum uygulamayı yazmaz. Sözleşmeyi
yayımlar, liderleri gerçek ve ayrı ajan süreçleri olarak başlatır, geri geleni birleştirir,
sözleşmeye göre yargılar ve en son QA'yı çalıştırır.

| Rol | Model | Efor | Neyin sahibiydi |
|---|---|---|---|
| Orkestratör | Fable 5.1 | high | Sözleşme, görevlendirmeler, entegrasyon, görsel inceleme, `README.md` ve bu dosya |
| Backend Lideri | Sonnet | medium | `package.json`, `.gitignore`, `server.js`, şema, tohum verisi, skor tablosu API'si ve doğrulaması, beş bölüm, beş başarım |
| Frontend Lideri | Sonnet | medium | `public/index.html`, `public/style.css`, `public/app.js`: kabuk, canvas oyun döngüsü, fizik, güçlendirmeler, parçacıklar, ses, HUD |
| QA Lideri | Sonnet | medium | Kabul kontrol listesinin gerçek kontrollere dönüşü, saldırı matrisi ve bozuk olanın düzeltilmesi |
| Frontend işçileri | Sonnet | low ila medium | Orkestratörün yapılan işi inceledikten sonra istediği üç hedefli düzeltme turu |

Backend Lideri ile Frontend Lideri AYNI ANDA çalıştı. Bu ancak 2. bölümdeki sözleşme sayesinde
mümkün: hiçbiri diğerine soru sormak zorunda kalmadı ve hiçbiri ötekini bozacak bir karar
alamazdı. Backend Lideri kendi portunda, 3005'te, önce bitirdi; Frontend Lideri 3006'da çalıştı;
QA 3007'de; orkestratör 3001'de doğruladı. 3000 portunu kimse kullanmadı, bu yüzden hiçbir şey
çakışmadı.

Dürüstlük notu: Frontend Lideri kendi altına işçi ajan açmamayı SEÇTİ. Raporundan alıntıyla
gerekçesi: DOM kimlikleri, canvas'ın canlı okuduğu CSS özel değişkenleri ve ayarların bağlantıları
birbirine sıkı sıkıya geçmiş durumda, dolayısıyla tek bir sözleşme üzerinde iki yazar birbirinden
uzaklaşırdı. Bu doğru bir karardı ve burada süslenmeden, olduğu gibi kayda geçiyor.

## 4. QA gerçekte ne çalıştırdı

QA Lideri gerçek bir tarayıcıyı Chrome DevTools Protocol üzerinden sürdü (Playwright'ın tarayıcısı
bu kapsayıcıda açılamıyordu: Chromium kum havuzu yok), oyun durumunu okumak için sayfa içinde
JavaScript çalıştırdı, gerçek klavye ve dokunma olayları gönderdi ve API'ye curl ile gitti.

| # | Kontrol | Sonuç | Kanıt |
|---|---|---|---|
| 1 | Temiz açılış, üç ekran, sessiz konsol | geçti | Yüklemede konsol mesaj dizisi boştu; sunucu günlüğünde yalnızca açılış satırı vardı |
| 2 | 1. bölüm temizleniyor, 2. bölüm yükleniyor ve kilidi açılıyor, bir bildirim çıkıyor | geçti | Gerçek kod yolu son tuğlaya kadar sürüldü: `unlocked` 1'den 2'ye çıktı, `ilk-bolum` ve `kayipsiz` verildi, 1. bölümün 60 tuğlasına karşılık 30 tuğlalı 2. bölüm "Kafes" yüklendi |
| 3 | Duraklatma topu donduruyor, devam 3-2-1 sayıyor, top içinden geçip kaçmıyor | geçti | Duraklatılmışken bir saniye arayla iki kez okunan top konumu birebir aynıydı; saniyede 2000 ila 9700 piksel hızla 1500 fizik adımı, sol, sağ ve üst duvarları sıfır kez geçti |
| 4 | Bir güçlendirme yakalanıyor, çipi eriyor ve sıfırda duruyor | geçti | Yakalamada raket genişliği 96'dan 144'e, 14 saniyelik etkinin ardından tam olarak 96'ya döndü. Yavaş top için okunan 260 ve 156 değerleri `currentBallSpeed()` fonksiyonundan geliyordu, topun kendisinden değil; doğrulama turu bunun bir yanlış geçiş olduğunu buldu, bkz. 5. bölüm madde 7 |
| 5 | Ayarlar oyunu gerçekten değiştiriyor ve yenilemeyi atlatıyor | geçti | Tema değişimi `--bg` değerini sayfa yenilenmeden `#070713`'ten `#06120a`'ya çevirdi; kolayda 221'e karşılık zorda 325 top hızı; yenilemeden sonra dört ayar da aynıydı |
| 6 | API doğrulaması, kalıcılık ve telefonda sürükleme | geçti | Aşağıdaki saldırı matrisine bakın; 390px'te gerçek bir dokunma dizisi raketi x=134'ten x=261'e taşıdı |

`POST /api/scores` üzerindeki saldırı matrisi; hepsi HTTP 400 ve Türkçe bir mesajla reddedildi,
satır sayısı öncesi ve sonrasında değişmedi: 5000 karakterlik bir isim, yalnızca boşluklardan
oluşan bir isim, içinde `<script>` geçen bir isim, içinde `<img onerror=...>` geçen bir isim,
metin olarak gönderilen bir skor, `1e999`, `1.5`, negatif bir skor, bölüm 0, bölüm 99, null bir
gövde, dizi bir gövde, eksik content-type ve 20KB'ı aşan bir gövde. Frontend, kayıtlı her ismi bir
`textContent` kaçışından geçirerek basar, yani skor tablosundan gelen depolanmış XSS yolu yok.

## 5. Bulunan ve düzeltilen hatalar

İlk birleştirmenin ardından altı kusur bulundu, teslim sonrası bağımsız doğrulama turunda üç
kusur daha çıktı. İkisi QA'dan, dördü bitmiş ekranları inceleyen
orkestratörden geldi; otomatik kontrol listesinin ardından bir de insan gözünün geçmesinin sebebi
tam olarak bu.

1. **Türkçenin harfleri olmadan yazılması.** Kullanıcının gördüğü bütün metinler harfleri
   soyulmuş ASCII olarak çıkmıştı: "Karolari kir, kombonu buyut", "BOLUM SEC", "Baslangic", "Isim 1
   ile 12 karakter arasinda olmali." Türkçe okuyan biri bunu bir kısayol olarak değil, bozukluk
   olarak görür. `index.html`, `app.js` ve `server.js` içindeki kullanıcıya görünen metinler
   taranıp düzgün Türkçeye çevrilerek düzeltildi; başarım kimlikleri, güçlendirme kimlikleri ve
   ayar değeri anahtarları ise ASCII kaldı, çünkü frontend onlarla eşleşiyor.
2. **Masaüstü düzeninin alt yüzde 45'ini kaplayan ölü bir alan.** 1440x900'de başlangıç ekranının
   içeriği y=460 civarında bitiyor, altındaki her yer boş ve neredeyse simsiyah kalıyordu. Kök
   sebep: tam yükseklikte bir esnek sütunun olmayışı ve yalnızca telefondaki sekme çubuğu için
   düşünülmüş, koşulsuz uygulanan 90px'lik alt boşluk. Gövde tam yükseklikte bir esnek sütun
   yapılarak, etkin ekranın bu alanı doldurmasına izin verilerek ve başlangıç, skorlar ile ayarlar
   ekranları bir grup olarak ortalanarak düzeltildi.
3. **Uygulama her yüklemede içeri sönümleniyordu ve ekran görüntüleri onu soluk yakalıyordu.** Kök
   sebep: `animation: fade-in 0.2s ease` kuralı `.screen.active` üzerindeydi, yani ilk boyamada
   tetikleniyordu. İlk düzeltme denemesi kuralı `body.booted .screen.active` ile daraltıp sınıfı
   açılıştan bir kare sonra ekledi; bu işi daha da kötüleştirdi, çünkü sınıfın eklenmesi kuralı
   zaten etkin olan ekranla eşleştirmeye başlattı ve animasyon yine tetiklendi. Doğru düzeltme,
   GEÇİLEN ekrana takılan geçici bir sınıf: `.screen.active.screen-enter`, ekran değiştiricinin
   içinde yalnızca açılıştan sonra ekleniyor ve `animationend` olayında kaldırılıyor. İki yönde de
   doğrulandı: ilk boyama artık net, gerçek bir gezinme ise hala sönümleniyor.
4. **Skor tablosu skorları göstermiyordu.** Skor tablosu ekranındaki on satır bir sıra, bir isim,
   bir bölüm ve bir tarih taşıyordu, skor ise hiçbir yerde yoktu: `row.score` basitçe hiç
   basılmamıştı. Bu, otomatik kontrol listesinden geçti çünkü API doğru JSON'ı döndürüyordu; hatayı
   yalnızca ekrana bakmak yakaladı. Skoru her satırın görsel çıpası olarak basarak düzeltildi;
   `Intl.NumberFormat('tr-TR')` ile biçimlendirildiği için 8200, 8.200 olarak okunuyor; sayılar
   birbirine göre sağa dayalı beş sütunluk bir ızgarada duruyor ve 400px altında dört sütuna
   iniyor, yani skor korunuyor, düşen şey tarih oluyor.
5. **Masaüstündeki oyun alanı, siyah bir denizin ortasında dar ve dikey bir şeritti.** 1440px'lik
   bir pencerede yaklaşık 500px'lik bir canvas, iki yanında kabaca 470px'lik neredeyse simsiyah
   boşluk ve alanın yalnızca üst beşte birini dolduran bir tuğla duvarı. Geniş ekranlarda alana
   16:10 yatay bir en boy oranı verilerek, telefonlarda dikey alan korunarak ve tuğla bloğu sabit
   bir piksel sınırı yerine alanın boyutundan ölçeklenerek düzeltildi; artık her iki boyutta da
   alan yüksekliğinin yaklaşık yüzde 40'ını kaplıyor. Top hızı, raket ve güçlendirme düşme hızının
   hepsi alan koordinat uzayında yaşadığı için fizik bu değişiklikten hiç etkilenmeden çıktı.
6. **Oyun, oyuncu çoktan oynarken ona başlamak için dokunmasını söylüyordu.** Canvas'ın altındaki
   "Dokun ve sürükleyerek raketi hareket ettir. Başlatmak için dokun." ipucu hiç kaybolmuyordu.
   Fırlatma kısmı yalnızca top raketin üzerinde beklerken, dokunma kısmı yalnızca kaba bir işaretçi
   varken görünecek ve öğe boş yer ayırmak yerine kapanacak biçimde düzeltildi.

Yol boyunca düzeltilen bir şey daha var; Frontend Lideri işi teslim etmeden önce kendi çalışmasını
gözden geçirirken buldu: çoklu top güçlendirmesi geri sayımı sıfıra indiğinde eski haline
dönmüyordu, bu da sözleşmenin "her süreli etki gözle görülür biçimde durmalı" kuralını çiğniyordu.

Aşağıdaki üç madde, teslimden sonra çalışan bağımsız doğrulama turunda bulundu ve orada düzeltildi.

7. **Yavaş top güçlendirmesi hiçbir şey yapmıyordu.** Top hızı çarpışmalar arasında topun kendi
   `vx`/`vy` değerlerinde taşınıyor, `currentBallSpeed()` ise yalnızca fırlatma ve top sıfırlama
   anında okunuyordu. Uçmakta olan bir topa "yavaş top" yakalatmak hızını hiç değiştirmiyordu:
   HUD'daki çip 10 saniye boyunca geri sayıyor, top ise saniyede tam 260 pikselde kalıyordu.
   Ölçüm: yakalamadan 2500 ms sonra 260.0, etki bittikten sonra yine 260.0. QA'nın geçti raporu
   topun hızını değil `currentBallSpeed()` dönüşünü okuduğu için bunu kaçırmıştı. Etki başlarken
   ve biterken bütün topların hız vektörünü yeni hedef hıza ölçekleyen bir `retargetBallSpeed()`
   yardımcısıyla düzeltildi. Düzeltme sonrası ölçüm: 260 -> 156 -> 261.5.
8. **12 karakterden uzun bir oyuncu adı skoru sessizce çöpe atıyordu.** İsmi değiştirme kutusu
   `maxlength="16"` taşıyor ve `slice(0, 16)` uyguluyordu, sunucu ise ismi 1 ila 12 karakterle ve
   belirli bir karakter kümesiyle sınırlıyor. 16 karakterlik ya da içinde nokta, aksanlı harf veya
   emoji olan bir isimle oynayan biri turu bitiriyor, `POST /api/scores` HTTP 400 dönüyor,
   `postScore` hatayı yutuyor, konsola bir 400 hatası düşüyor ve skor tabloya hiç girmiyordu.
   `maxlength` 12'ye çekilerek ve sunucunun kuralını birebir yansıtan bir `sanitizePlayerName()`
   ile düzeltildi; artık kullanıcı arayüzünden çıkan hiçbir isim sunucuda reddedilemiyor.
9. **Güç Toplayıcı başarımı gösterdiği açıklamayı yapmıyordu.** Ekranda "Bir turda dört farklı
   güçlendirme türünü topla" yazıyor, kod ise oturumlar arasında saklanan toplam yakalama sayısını
   sayıp beşte veriyordu. Tur başına yakalanan türler `game.powerupTypesThisRound` içinde tutulacak
   ve başarım dört türün hepsi toplandığında verilecek biçimde düzeltildi.

## 6. Temiz kontrol

`README.md` içindeki iki komutun herkese yeten tek şey olduğunu kanıtlamak için, tamamen boş bir
`node_modules` üzerinden, en sonda orkestratör tarafından çalıştırıldı.

```
rm -rf node_modules
npm install --no-audit --no-fund      ->  added 68 packages in 400ms
PORT=3001 node server.js              ->  Neon Breaker running at http://localhost:3001,
                                          LAN: http://172.18.0.9:3001
curl -s -o /dev/null -w '%{http_code}' localhost:3001/         ->  200
curl -s localhost:3001/api/health                              ->  {"ok":true,"product":"Neon Breaker","levels":5}
curl -s localhost:3001/api/levels                              ->  valid JSON, 5 levels
curl -s localhost:3001/api/achievements                        ->  valid JSON, 5 achievements
curl -s localhost:3001/api/scores                              ->  valid JSON, the seeded top 10
curl -s -X POST localhost:3001/api/scores -d '{"name":"","score":-5}'
                                                               ->  400 {"ok":false,"error":"İsim 1 ile 12 karakter arasında olmalı."}
kill <listening pid>                                           ->  port 3001 free
node_modules                                                   ->  left installed, 65 entries
```

Sunucu `0.0.0.0` adresine bağlanır ve LAN adresini yazdırır, böylece aynı wifi'daki bir telefon
uygulamayı açabilir. Kodda varsayılan port 3000 olarak kalıyor; burada 3001 kullanılmasının tek
sebebi, aynı anda başka portlarda başka uygulamaların yapılıyor olmasıydı.

## 7. Dürüst notlar

- Frontend Lideri Playwright tarayıcı aracını kullanamadı: Chromium bu kapsayıcıda kum havuzu
  olmadan başlayamıyor. Takım bunu, Node 24'ün yerleşik `WebSocket` desteği üzerine kurulmuş, hiç
  npm paketi kullanmayan küçük bir Chrome DevTools Protocol sürücüsüyle aştı; QA daha sonra
  uygulamada tıklamak, oyun durumunu okumak, gerçek klavye ve dokunma olayları göndermek ve fizik
  simülasyonlarını çalıştırmak için bunu kullandı.
- İlk QA turu yarısında makine tarafından sonlandırıldı ve raporunu kaybetti. Tekrar turuna
  bulgularını madde madde, aşama aşama diske yazması söylendi; böylece ikinci bir kesinti kanıtı
  silemeyecekti. Tur temiz bitti.
- `GET /api/levels` her bölüm için bir `palette` alanı döndürür, ama tuğlaları, raketi ve arka
  planı çizen renkler etkin temanın CSS değişkenlerinden okunur. Bunun sebebi kabul listesindeki
  5. madde: tema değişimi oyunu anında yeniden boyamak zorunda. Yani beş bölümün her birinin kendi
  deseni ve kendi hızı var, ama kendi paleti yok; palet temadan geliyor. Sözleşmedeki alan API
  şeklinin bir parçası olarak duruyor.
- Oyun alanı sabit bir en boy oranı korur: masaüstünde 16:10, telefonda 3:4. Çok uzun bir telefon
  ekranında bu, alanın altında bir arka plan şeridi bırakır. Bu bir düzen hatası değil, sabit en
  boy oranından gelen bir çerçeveleme ve hiç bozulmayan bir oyun alanı için bilinçli olarak yapılan
  takas.
