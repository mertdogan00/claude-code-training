# BUILD-LOG: Satış Analitik Paneli

Takım iş başında. Bu dosya yapımın gerçekte olduğu sırayla yazıldı: önce plan, sonra paralel işin
birbirine oturmasını sağlayan sözleşme, sonra roller, en sonda da QA'nın çalıştırdıkları ve
yakaladığı bütün hatalar.

Kaynak prompt: [`../../prompts/apps/data-dashboard.md`](../../prompts/apps/data-dashboard.md),
olduğu gibi yapıştırıldı. Hedef: 6 ile 10 dakika arası canlı yapım, `npm install` + `node
server.js`, derleme adımı yok, framework yok.

## 1. Orkestratörün yazdırdığı plan

1. Sözleşmeyi yayımla: dosya listesi, port, her API yolu ve döndürdüğü JSON biçimi.
2. Üç lideri başlat ve her birine bir sohbeti değil, sözleşmeyi ver.
3. Backend Lideri: `server.js`, SQLite şeması, CSV içeri alma ya da satır üreticisi, bütün
   toplulaştırma uçları, içgörü motoru.
4. Frontend Lideri: `public/`, ürün kabuğu, dört ekran, KPI kartları, grafikler, filtreler.
5. QA Lideri: altı kabul maddesini gerçek testlere çevir, sunucuyu başlat, tarayıcıda ve curl ile
   doğrula, madde madde geçti ya da kaldı diye raporla.
6. Birleştir: arka uçla ön uç arasındaki dikişleri çöz, QA'nın bildirdiklerini düzelt.
7. Her ekranın 1440x900 ve 390x844 ekran görüntüsünü al.
8. `README.md` ve `BUILD-LOG.md` dosyalarını yaz, sonra boş bir `node_modules` üzerinden temiz
   kontrolü çalıştır.

## 2. Kimse tek satır yazmadan yayımlanan sözleşme

Dosyalar, tam olarak bunlar:

```
data-dashboard/
  package.json      "type": "module", start = node server.js, deps: express, chart.js
  server.js         Express + node:sqlite (DatabaseSync), serves public/ and /api
  public/index.html the shell: top bar, sidebar, four screens
  public/style.css  one palette, one accent, two themes, responsive at 390px
  public/app.js     one state object, all fetching, all rendering
  data.sqlite       created and seeded on first start, gitignored, delete to reset
  README.md         product name, the two commands, features, team, Verified checklist
  BUILD-LOG.md      this file
  screenshots/      1440x900 and 390x844 PNGs
```

Port: varsayılan `3000`, `PORT` bunu değiştiriyor, `0.0.0.0` adresine bağlanıyor.

Her `GET /api/*` yolu aynı dört isteğe bağlı filtre parametresini kabul ediyor, böylece tek bir
filtre durumu bütün bileşenleri sürüyor: `from` (YYYY-MM-DD), `to`, `category`, `city`.

| Yol | Döndürdüğü |
|---|---|
| `GET /api/health` | `{ ok, rows, source }` |
| `GET /api/meta` | `{ rows, source, importedAt, dateRange: { min, max }, categories[], cities[] }` |
| `GET /api/kpis` | `{ current: { revenue, units, orders, avgBasket }, previous: {...}, change: { revenue, units, orders, avgBasket } }`; önceki dönem yoksa bir `change` değeri `null` oluyor |
| `GET /api/timeline?granularity=day\|week\|month` | `{ granularity, points: [{ bucket, revenue, units, orders }] }` |
| `GET /api/categories` | `{ items: [{ category, revenue, units, orders, share }] }` |
| `GET /api/products` | `{ items: [{ product, category, revenue, units, orders, share }] }` |
| `GET /api/cities` | `{ items: [{ city, revenue, units, orders, share }] }` |
| `GET /api/insights` | `{ items: [{ id, tone, title, text, value, valueType }] }`, 3 ile 5 arası madde, `valueType` değeri `money`, `percent` ya da `count` |
| `POST /api/import` | gövde JSON olarak `{ csv }` ya da ham `text/csv` içerik, `{ ok, rows, dateRange }` veya `{ ok: false, error }` döndürüyor |

Para hattın üzerinden yalnızca TL olarak geçiyor. Kur çevrimi bir gösterim meselesi ve tek bir
sabit kur tablosu üzerinden ön uçta yaşıyor. Uygulamanın iki yarısının bir sayının ne anlama
geldiği konusunda anlaşmazlığa düşmesini engelleyen şey tam da bu tek karar.

İlk açılıştaki veri: sunucu `server.js` dosyasının yanında `data/sales-data.csv`,
`../data/sales-data.csv`, `../../data/sales-data.csv` ve `../../../data/sales-data.csv` yollarına
bakıyor, bulduğu ilkini içeri alıyor, hiçbirini bulamazsa aynı sütunlarla 120 satır üretiyor.
Yani aynı `server.js` hem boş bir klasörde hem de bu deponun içinde çalışıyor.

## 3. Takım ve kimin neyi üstlendiği

| Rol | Sorumlu olduğu | Teslim ettiği |
|---|---|---|
| Backend Lideri | `server.js`, `package.json` | Şema ve ilk veri, yedeğinde belirlenimci 120 satırlık üretici olan dört yollu CSV araması, ortak filtre kurucusu, sekiz okuma ucu, önceki dönem karşılaştırması, içgörü motoru, başlık doğrulaması yapan içeri alma ucu |
| Frontend Lideri | `public/index.html`, `public/style.css`, `public/app.js` | Kabuk (üst çubuk, bildirim zili, profil rozeti, yan menü, dört ekran), farkları gösteren KPI kartları, hedef ilerleme çubuğu, gün/hafta/ay anahtarlı zaman çizelgesi, tıklanabilir halka, sıralanabilir ve aranabilir ürün tablosu, şehir çubuk grafiği, sıfırlama düğmeli filtre çubuğu, ayarlar ekranı, iskeletler ve boş durumlar, 390px yerleşimi |
| QA Lideri | doğrulama | Altı kabul maddesinin gerçek testleri; çalışan bir sunucuya karşı curl ile ve başsız Chromium'da DevTools protokolü üzerinden yürütüldü, üstüne bir de temiz kurulum kontrolü |

Bu yapımın nasıl ilerlediğine dair not: reçete orkestratörden üç lideri Agent aracıyla başlatmasını
istiyor. Bu yapım oturumunda Agent aracı kullanılamıyordu, bu yüzden orkestratör üç lider rolünü,
aynı yayımlanmış sözleşmeye karşı, yukarıdaki sırayla üç ayrı geçişte kendisi yürüttü. Sözleşme,
sorumluluk paylaşımı ve QA disiplini reçetenin anlattığının tıpatıp aynısı; eksik olan tek şey
paralellik. Normal bir Claude Code oturumunda aynı prompt üç lideri gerçekten başlatıyor ve arka
uçla ön uç aynı anda yazılıyor.

## 4. QA neleri çalıştırdı

Bütün kontroller, depodaki CSV yüklenmiş halde (120 satır, 2026-08-01 ile 2026-08-28 arası)
`PORT=3000 node server.js` üzerinde koştu. Tarayıcı kontrolleri Chrome DevTools protokolü
üzerinden yürütüldü, böylece konsol hataları varsayılmak yerine toplandı.

| # | Kabul maddesi | Nasıl kontrol edildi | Sonuç |
|---|---|---|---|
| 1 | Temiz başlangıç, gerçek veri, konsolda hata yok, yan menü dört ekrana ulaşıyor | `GET /` 200 döndü, sayfa başsız Chromium'da açıldı ve her KPI değeri, grafik tuvali ve içgörü canlı DOM'dan okundu, konsol ve istisna kanalları kaydedildi, dört menü öğesine de tıklandı | geçti, 0 konsol hatası, başlıklar Genel bakış, Ürünler, Şehirler, Ayarlar olarak geri geldi |
| 2 | `curl -s localhost:3000/api/kpis` sıfırdan farklı ciro, adet ve sipariş döndürüyor | curl ve bir JSON doğrulaması | geçti, ciro 445390, adet 526, sipariş 120 |
| 3 | Son 7 gün bütün bileşenleri aynı anda değiştiriyor ve tablo toplamı ciro kartıyla uyuyor | Tarayıcıda dönem seçimi "Son 7 gün" yapıldı, sonra KPI, halka göstergesi, şehir satırları ve ürün tablosu yeniden okundu | geçti, ciro 445.390'dan 128.160'a indi, ürün tablosunun toplamı tam olarak 128160 çıktı, sıfırlama düğmesi belirdi |
| 4 | Tema ve para birimi uygulamayı yeniden boyuyor, yenileme ikisini de koruyor, hedef çubuğu oynatıyor | Tarayıcıda tema açık, para birimi USD yapıldı, hesaplanan gövde arka planı ve her para rakamı yeniden okundu, sayfa aynı profilde yenilendi, hedef yükseltilip düşürüldü | geçti, arka plan rgb(16,19,25) renginden rgb(244,242,238) rengine geçti, KPI $10.734 ve içgörü değeri $845 oldu, yenilemeden sonra localStorage `{"theme":"light","currency":"USD","target":100000}` tutuyordu, çubuk 49.5% (kil) değerinden 100% (yeşil) değerine gitti |
| 5 | `curl -s localhost:3000/api/insights` her biri bir sayı taşıyan 3 ile 5 arası içgörü döndürüyor | curl ve hem sayıya hem de her maddenin `value` alanına bakan bir JSON doğrulaması | geçti, 5 içgörü, hepsi sayısal bir değer taşıyordu |
| 6 | 390px'te hiçbir şey yana taşmıyor, yan menü toplanıyor, bileşenler alt alta diziliyor | Görüntü alanı 390x844 olarak taklit edildi ve dört ekranda da `scrollWidth - clientWidth` ölçüldü | geçti, her ekranda taşma 0, yan menü bir satır içinde `position: fixed` olarak hesaplandı (alt sekme çubuğu), KPI ızgarası iki sütuna düştü |

Listenin dışındaki ek kontroller: `PORT=3999 node server.js` 3999 portunda 200 cevapladı;
`POST /api/import` iki satırlık bir CSV'yi kabul edip veri setinin yerine koydu; başlığı yanlış
olan bir CSV `{"ok":false,"error":"CSV header must contain date,product,category,qty,unit_price,city"}`
ile geri çevrildi; hiçbir satırın uymadığı bir tarih aralığı zaman çizelgesinde, halkada ve içgörü
panelinde boş kutular yerine Türkçe boş durum mesajları üretti; `data.sqlite` silinip yeniden
başlatıldığında depodaki CSV'den 120 satır tekrar yüklendi.

## 5. QA'nın bulduğu hatalar ve düzeltmeleri

1. **İlk açılışta her KPI "+100%" diyordu.** Önceki dönem karşılaştırması boş bir önceki pencereyi
   sıfır sayıp oradan bölüyordu, yani uygulamayı tam tarih aralığında açmak dört kartın hepsinde
   sahte bir yüzde 100 artış gösteriyordu. `percentChange` artık karşılaştıracak bir şey yoksa
   `null` döndürüyor ve kart, doğru olmayan bir sayı yerine sessiz bir "önceki dönem yok" rozeti
   gösteriyor.
2. **Şehirler çubuk grafiği 0x0 çizildi.** Chart.js tuvalini o ekran hâlâ `display: none` iken
   ölçtü, böylece grafik boyutsuz kuruldu ve ekran değişince de görünmez kaldı. Ekran değişimleri
   artık bir sonraki animasyon karesinde grafikleri yeniden boyutlandırıyor.
3. **`hidden` esnek kutularda hiçbir işe yaramıyordu.** Filtre çubuğu `display: flex`, bu da
   tarayıcının `[hidden] { display: none }` kuralını yeniyor; dolayısıyla filtreleyecek bir şeyi
   olmayan Ayarlar ekranında bile ekranda kalıyordu. Tek bir `[hidden] { display: none !important; }`
   kuralı, açılıp kapanan her öğe için bunu çözdü.
4. **Satır başına duran ciro çubuğu başıboş bir tire gibi görünüyordu.** Sağa yaslı bir hücrenin
   sol kenarına sabitlenmişti, bu yüzden kendi sayısından uzağa kaçıyordu. Artık sağa sabitlenmiş
   durumda ve değerle birlikte uzayan bir alt çizgi gibi okunuyor.
5. **Ürün tablosu telefonda kırpılıyordu.** 390px'te altı sütun para sütununu ekranın kenarının
   altına itiyordu. Telefonda en az işe yarayan sütun olan kategori etiketi 900px'in altında
   gizleniyor ve hücre boşlukları daralıyor.

## 6. Bitti sayılma ölçütü

`npm install`, sonra `node server.js`, sonra http://localhost:3000. Altı kabul maddesinin hepsi
yeşil (yukarıdaki tabloya ve `README.md` içindeki Doğrulandı listesine bak). Son temiz kontrol:
sunucu kapatıldı, `node_modules` silindi, `npm install --no-audit --no-fund` sıfırdan yeniden
çalıştırıldı, `PORT=3000 node server.js` başlatıldı, `GET /` 200 ve `GET /api/kpis` JSON
cevapladı, sunucu kapatıldı ve 3000 portunun boşaldığı doğrulandı.

## 7. Bağımsız doğrulama geçişi

Ayrı bir gözden geçiren, bütün kontrol listesini temiz bir `node_modules` üzerinde baştan koşturdu,
dört ekranı DevTools protokolü üzerinden 1440x900 ve 390x844 boyutlarında sürdü ve API'ye bozuk
girdi gönderdi. Yukarıdaki tablodaki her şey aynen tekrarlandı. O geçişte üç şey onarıldı:

1. **Bozuk tarihler 500 ve bir yığın izi ile cevaplanıyordu.** `GET /api/kpis?from=abc` isteği
   önceki dönem yürüyüşü üzerinden `addDays` fonksiyonuna ulaşıp `RangeError: Invalid time value`
   fırlatıyordu, Express de mutlak dosya yolları taşıyan varsayılan HTML hata sayfasıyla cevap
   veriyordu. Sorgudaki tarihler artık yalnızca `YYYY-MM-DD` biçiminde kabul ediliyor, başka her
   şey eleniyor.
2. **Bozuk bir JSON gövdesi de aynısını yapıyordu.** Gövdesi yarım kalmış bir `POST /api/import`
   isteği HTML bir yığın izi döndürüyordu. Artık bir JSON hata işleyicisi
   `{"ok":false,"error":"Invalid request"}` cevabını veriyor.
3. **Ürün tablosu 390px'te hâlâ yana kaydırma istiyordu.** Beş sütun, 328px'lik bir kartın içinde
   408px ölçüldü, bu yüzden sipariş sayısı rakamın ortasından kesiliyordu. 560px'in altında
   `Sipariş` sütunu da gizleniyor ve kalan dört sütun tam oturuyor. `screenshots/products-phone.png`
   yeniden çekildi.
