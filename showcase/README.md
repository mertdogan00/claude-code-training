# Vitrin: reçeteler, ajan takımlarının elinden çıkmış hâliyle

Buradaki her uygulama, [`../prompts/apps/`](../prompts/apps/) içindeki TEK bir mega-prompttan
doğdu. Claude Code reçeteyi okudu, alt ajanlardan gerçek bir takım kurdu (bir Backend Lideri,
bir Frontend Lideri ve bir QA Lideri; her biri kendine yardımcı çıkarmakta serbestti), önce
sözleşmeyi yayımladı, paralel çalıştı, parçaları birleştirdi ve sonucu kırmayı QA'ya bıraktı.
Her klasör kanıtı saklıyor: kod, takımın çalışmasını anlatan bir `BUILD-LOG.md` (plan, roller,
sözleşme, testler, bulunan ve giderilen hatalar) ve ekran görüntüleri. `prompts/apps/` içinde
bir reçeteyi açın, sonra buradaki eşleşen klasörü açın; o tek promptun neyi ürettiğini
birebir görürsünüz.

## Üç yapım

| Uygulama | Ürün adı ve ne olduğu | Reçete |
|---|---|---|
| [data-dashboard](data-dashboard/) | **Satış Analitik Paneli**, bir CSV üzerinden çalışan satış panosu: KPI kartları, grafikler, her bileşeni birlikte değiştiren filtreler, sunucuda hesaplanan içgörüler ve CSV içe aktarma | [data-dashboard.md](../prompts/apps/data-dashboard.md) |
| [neon-breaker](neon-breaker/) | **Neon Breaker**, canvas üzerinde bir Breakout: gerçek raket fiziği, güçlendirmeler, parçacıklar, sentezlenmiş ses ve bir skor tablosu | [neon-breaker.md](../prompts/apps/neon-breaker.md) |
| [live-chat](live-chat/) | **Salon Sohbeti**, gerçek zamanlı bir sohbet ürünü: odalar, anlık mesajlar, kimin çevrimiçi olduğu ve "yazıyor..." göstergesi, emoji tepkileri, arama, bir ayarlar ekranı ve aynı wifi'daki telefonlar için katılım QR'ı | [live-chat.md](../prompts/apps/live-chat.md) |

Salonun 5. durakta oylayacağı üç aday tam olarak bunlar.

## Bu klasör neden var

1. **Gezinebileceğiniz kanıt.** Reçeteyi okuyan herkes bitmiş ürünü görebilir, `BUILD-LOG.md`
   dosyasından kimin ne yaptığını okuyabilir, uygulamayı çalıştırabilir ve `Doğrulandı`
   listesini kontrol edebilir. Kimseye güvenmeniz gerekmiyor.
2. **Sahnedeki yedek.** Canlı kurulum uzarsa ya da internet giderse, sunucu buradaki eşleşen
   klasörü açıp çalıştırır: "bunu, tam olarak o prompttan bir ajan takımı yaptı, sonuç burada,
   kimin ne yaptığı da burada."

## Herhangi birini çalıştırma

```bash
cd showcase/<app>
npm install       # bir kereye mahsus, internet ister
node server.js    # sonra http://localhost:3000 adresini aç
```

3000 portu doluysa `PORT=3001 node server.js` uygulamayı başka bir porta taşır.

Bilmeye değer tek istisna Salon Sohbeti: yalnızca localhost yerine `0.0.0.0` adresine bağlanır
ve açılışta yerel adresin yanına dizüstünün yerel ağ adresini de yazar. Katılım QR'ının
kodladığı adres işte o yazdırılan adres; böylece aynı wifi'daki telefonlar içeri girebilir.
Onunla ilgili geri kalan her şey aynı: yine aynı iki komut.

## Hepsinde ortak olan

- **Tek klasör, derleme adımı yok.** `server.js` (Node üzerinde Express ve yerleşik
  `node:sqlite`, yani makinenizde hiçbir yerel bileşen derlenmez) hem API'yi hem de düz HTML,
  CSS ve JavaScript'ten oluşan `public/` klasörünü sunar. Bundler yok, framework yok,
  derleme yok.
- **Node 24 veya üstü.** Orada `node:sqlite` için bayrak gerekmez; Node 22.x üzerinde ise
  `--experimental-sqlite` arkasında durur (bkz. `docs/setup/`).
- **Kendi ayakları üstünde.** Her klasör tek başına çalışır. `data.sqlite` ilk açılışta
  oluşturulup örnek verilerle doldurulur ve gitignore'dadır; yani her kopya tertemiz başlar,
  verileriniz yeniden başlatmalarda kalır ve o tek dosyayı silmek uygulamayı sıfırlar.
- **Aynı anda tek uygulama** 3000 portunda; ikincisini çalıştırmak için yukarıdaki `PORT`
  değişikliğini kullanın.
- **Takım kayıt altında.** Her klasördeki `BUILD-LOG.md` planı, rolleri ve modellerini,
  sözleşmeyi, QA'nın çalıştırdığı her testi ve yakaladığı her hatayı anlatır.
- **Ekran görüntüleri.** Bir klasörde içi dolu bir `screenshots/` dizini varsa, oradakiler
  masaüstü (1440x900) ve telefon (390x844) görünümleridir.
- **Sahneden önce,** üçünde de `npm install` komutunu önceden çalıştırın; böylece yedek,
  internete ihtiyaç duymadan saniyeler içinde açılır.

Bitmiş bir uygulama klasörünün `README.md` dosyasında ürün adı, iki komut, özellikler, onu
yapan takım, ekran görüntüleri ve `Doğrulandı` kontrol listesi bulunur. Yapımı hâlâ süren bir
klasörde README ya da ekran görüntüleri eksik olabilir; sahnedeki yedek olarak ona
yaslanmadan önce içine bakın.
