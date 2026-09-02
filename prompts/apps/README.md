# Uygulama mega-promptları

Buradaki her reçete TEK ATIŞLIK bir prompttur: olduğu gibi kopyalayıp yeni bir Claude Code
oturumuna yapıştırırsın, sıfırdan koca bir uygulama doğar, hiçbir onay molası vermeden.
Sıradan bir prompttan farkı, ekranda bundan sonra olanlardır. Claude Code orada tek başına
dosya yazmaz, bir TAKIM KURAR: kendi Agent aracıyla lider alt-ajanlar açar, her birine bir
görev alanı verir, hepsini paralel çalıştırır, sonra işlerini birleştirir ve sonucun başına bir
QA lideri koyar. Asıl ders bunun gözünün önünde açılması; uygulama yanına kalan hediye.

| Reçete | Elinde ne olacak | Vurucu yanı |
|---|---|---|
| [data-dashboard.md](data-dashboard.md) | **Satış Analitik Paneli**: bir CSV üzerinden satış panosu; KPI'lar, grafikler, filtreler, içgörüler ve CSV içe aktarma | rakamlar dakikalar içinde canlı bir panoya dönüşüyor |
| [neon-breaker.md](neon-breaker.md) | **Neon Breaker**: gerçek raket fiziği, güçlendirmeler, parçacıklar, ses ve skor tablosu olan bir canvas Breakout | sahnede, tek bir prompttan çıkan gerçek bir oyun |
| [live-chat.md](live-chat.md) | **Salon Sohbeti**: odaları, "yazıyor" göstergesi, tepkileri, araması, ayarları ve aynı wifi'daki telefonlar için katılım QR'ı olan gerçek zamanlı bir sohbet | WhatsApp altı dakikada; salon telefonundan katılıyor |

## Ortak iskelet

Üç reçete de aynı şekilde kurulur:

**özerklik maddesi** (planı yaz, sonra sonuna kadar koş, onay için hiç durma) ardından
**önce sözleşme** (orkestratör, kimse kod yazmadan ÖNCE dosya listesini, portu, rotaları ve
JSON şekillerini yayımlar; paralel işin sonradan birbirine oturmasının tek sebebi budur)
ardından **takımı gerçekten kur** (Agent aracıyla açılan bir Backend Lideri, bir Frontend
Lideri ve bir QA Lideri; her biri bir iki işçi açmakta serbest) ardından **iş** ardından
**ürün kabuğu** (ürün adı ve profil rozeti olan bir üst bar, en az üç ekran üzerinden
gezinme, gerçekten bir şeyleri değiştiren bir ayarlar ekranı, boş ve yükleniyor durumları,
tek vurgu rengi olan tek bir palet, Türkçe arayüz metni, 390px'te okunur: demo değil,
yayınlanmış bir ürün gibi görünmeli) ardından **yığın** ardından **numaralı 8 özellik**
ardından QA liderinin ekranda ya da curl ile doğruladığı **6 maddelik kabul kontrol listesi**,
en sonda da **bitti tanımı** (planı, takımı, sözleşmeyi, testleri ve düzeltilen her hatayı
kayda geçiren bir `README.md` ve bir `BUILD-LOG.md`).

Yığın üçünde de aynı ve bilerek küçük tutuldu:

```
<app>/
  package.json     "type": "module", node server.js çalıştıran bir start betiği
  server.js        Node 24 + Express + gömülü node:sqlite (DatabaseSync)
  public/          düz HTML, CSS ve JavaScript
  data.sqlite      ilk açılışta oluşturulup dolduruluyor; silmek uygulamayı sıfırlar
  README.md        BUILD-LOG.md
```

İki komut, hep aynı iki komut:

```bash
npm install
node server.js        # sonra http://localhost:3000 adresini aç
```

`PORT=3001 node server.js` uygulamayı başka bir porta taşır. Node 24 ya da üstü gerekiyor,
çünkü `node:sqlite` onun içine gömülü ve derlenmesi gereken hiçbir yerel parça kalmıyor.
Salon Sohbeti buna iki küçük paket ekler, canlı bağlantı için `ws` ve katılım kodu için
`qrcode`, ayrıca bütün ağ arayüzlerini dinler ki aynı wifi'daki telefonlar erişebilsin.

`showcase/` klasöründe aynı üçünün gerçek ajan takımlarınca kurulmuş halleri duruyor: kodu,
kimin ne yaptığını anlatan bir `BUILD-LOG.md` ve ekran görüntüleri. Canlı kurulum takılırsa
sahne yedeğin orası; aynı zamanda her reçetenin ne ürettiğinin kanıtı.

## Eğitim akşamı

Salon yukarıdaki üçü arasında oy verir. Hangisi kazanırsa kazansın, devamı aynıdır:

1. Kazananın dosyasını ekranda aç ve iki `---` çizgisi arasındaki her şeyi kopyala.
2. Terminalde: `mkdir demo && cd demo && claude`, tertemiz bir oturum.
3. Yapıştır. Başka hiçbir şey yazma: plan da, özerklik de, takım da, kontrol listesi de
   promptun içinde.
4. Kurulum sürerken takım anlatısını sesli oku: kim açıldı, hangi lider ne yapıyor, her biri
   ne getirdi. Sahnenin bütün derdi o canlı organizasyon şeması.
5. Bitince: `npm install`, sonra `node server.js`, sonra http://localhost:3000 adresini aç.
6. Ekranları gez, Ayarlar'ı aç ve temayı herkesin gözü önünde değiştir, sonra salondan bir
   değişiklik isteği al ve onu tek bir cümle olarak yaz.

Oyu kaybeden ikisi ev ödevin. BU AKŞAM birini seç, yapıştır, izle, sonra tek bir takip
cümlesiyle bir özelliğini değiştir ("donut'ı çubuk grafiğe çevir", "üçüncü bir top
güçlendirmesi ekle", "sadece duyurular için bir oda ekle"). Yaşayan bir uygulamayı
düzenlemek, sıfırdan başlatmaktan çok daha fazlasını öğretir. Takımın arkasında bıraktığı
`BUILD-LOG.md` dosyasını da oku: her ajanın, her testin, her hatanın adı orada.

## Kendi mega-promptunu yazmak

Şablon şu: ÖZERKLİK (onay molası yok) · SÖZLEŞME (dosyalar, port, rotalar ve şekiller kimse
kod yazmadan yayımlanır) · TAKIM (Agent aracıyla açılan liderler, artı işçiler) · NE (işin
tek cümlelik tarifi) · KABUK (üst bar, üç ekran, gerçekten bir şeyleri değiştiren bir ayarlar
ekranı, boş durumlar, tek vurgu rengi) · `YIĞIN` (tek klasör, `package.json`, `server.js`,
`public/`, iki komut) · ÖZELLİKLER (8 tane, numaralı) · KONTROL LİSTESİ (6 madde, her biri
ekranda ya da curl ile doğrulanabilir) · BİTTİ (kanıt, artı kurulum günlüğü). Prompt ne kadar
uzun ve somutsa, sondaki sürpriz o kadar küçük olur.
