# 7/7 · Oylama ve canlı kurulum

Final. Salon üç aday arasında oy veriyor, kazananın reçetesi ekrana geliyor, tek bir yapıştırma
bir ajan takımını başlatıyor ve sıfırdan bir uygulama doğuyor. Ondan sonra kimse ikinci bir
cümle yazmıyor.

Eller havaya, yüksek sesle say, kazananı duyur. Sonra aşağıdaki eşleşen seçeneği aç. Bu
dosyadaki her komut, moladan sonra döndüğün klasör olan depo kökünden yazılıyor.

## SAHNEDE (kopyala-yapıştır)

### A · Satış Analitik Paneli (`data-dashboard`)

Bir CSV üzerinden satış paneli: KPI kartları, ciro zaman çizgisi, kategori halkası, şehir
çubukları, aranabilir ürün tablosu ve tüm bileşenleri aynı anda süren filtreler. Vurucu yanı:
bir sütun dolusu rakam dakikalar içinde canlı bir panele dönüşüyor.

```bash
cat prompts/apps/data-dashboard.md
```

### B · Neon Breaker (`neon-breaker`)

Canvas üzerinde, gerçek raket fiziği olan bir Breakout: beş bölüm, düşen güçlendirmeler,
parçacıklar, sentezlenmiş ses ve bir skor tablosu. Vurucu yanı: tek bir promptan çıkan,
sahnede oynanan gerçek bir oyun.

```bash
cat prompts/apps/neon-breaker.md
```

### C · Salon Sohbeti (`live-chat`)

Gerçek zamanlı bir sohbet ürünü: odalar, canlı mesajlar, kimin çevrimiçi olduğu ve
"yazıyor..." göstergesi, emoji tepkileri, arama, bir ayarlar ekranı ve aynı wifi'daki
telefonlar için katılım QR'ı. Vurucu yanı: WhatsApp altı dakikada, salon telefondan katılıyor.

```bash
cat prompts/apps/live-chat.md
```

### Hangisi kazanırsa kazansın, aynı beş adım

Kazananın reçetesini ekranda aç ve yavaşça kaydır: takım maddesini, önce sözleşme kuralını ve
kabul kontrol listesini göster. Sonra, panelin `data/sales-data.csv` dosyasını bir üst
klasörde bulabilmesi için hâlâ depo kökündeyken:

```bash
mkdir demo && cd demo && claude
```

Reçetedeki iki `---` satırı arasındaki her şeyi kopyala, yapıştır ve BAŞKA hiçbir şey yazma.
Prompt kendi planını, kendi özerklik maddesini ve kendi kabul kontrol listesini taşıyor,
dolayısıyla onay beklemeden sonuna kadar gidiyor. Yine de durup onay sorarsa tek cevabın şu:
`plana göre devam et, başka onay sorma`

Kurulurken takımı yüksek sesle anlat: kim doğdu, hangi lider ne yapıyor, her biri ne getirdi,
QA hangi hatayı yakaladı. Salona sorulacak soru: üç ajan aynı anda yazıyor, peki ön yüzle arka
yüzün birbirine uymasını kim sağlıyor? Cevap ekranda, adı sözleşme.

Bittiğinde:

```bash
npm install
node server.js
```

Sonra http://localhost:3000 adresini aç ve salondan TEK bir değişiklik isteği al, tek cümle
hâlinde yazılsın. 3000 portu doluysa: `PORT=3001 node server.js`.

Salon Sohbeti'nin fazladan bir anı var: önce yan yana İKİ tarayıcı penceresi aç, iki farklı
isimle katıl, birinde yaz ve mesajın diğerinde belirmesini izle. Garantili demo bu. Ancak
ondan sonra Katıl ekranını projeksiyona ver, aynı wifi'daki telefonlar QR'ı okutup salona
merhaba desin.

## Salon için egzersiz

Bu beş dakikalık değil, bu ev ödevi ve depodaki en güzel şey:

1. Oylamayı KAYBEDEN iki adaydan birini seç.
2. Depo kökünde `mkdir demo2 && cd demo2 && claude`, reçetenin `---` satırları arasındaki
   kısmı yapıştır ve kendi ekranında bir takımın kurulmasını izle.
3. `npm install` ve `node server.js` ile çalıştır.
4. Tek bir takip cümlesiyle bir özelliği değiştir ("halka grafiği çubuk grafiğe çevir",
   "üçüncü bir top güçlendirmesi ekle", "sadece duyurular için bir oda ekle"). Yaşayan bir
   uygulamayı düzenlemek, sıfırdan başlatmaktan daha çok şey öğretiyor.
5. Takımın geride bıraktığı `BUILD-LOG.md` dosyasını oku: her ajan, her test, her hata orada.

## Olmazsa göster

Üçü de gerçek ajan takımları tarafından, tam olarak bu promptlarla çoktan kuruldu. Depo
kökünde dur (hâlâ `demo/` içindeysen önce `cd ..` çalıştır), sonra:

```bash
cd showcase/<winner>
node server.js
```

`npm install` işi kapılar açılmadan yapıldı, o yüzden bu anında başlıyor. Uygulamayı göster,
sonra o klasörün `BUILD-LOG.md` dosyasını aç ve kimin ne yaptığını oku: plan, takım, sözleşme,
testler, hatalar. Aynı kanıt, gerilimsiz. Tek istisna `showcase/live-chat/`: o klasör şimdilik
`BUILD-LOG.md` olmadan geliyor, orada uygulamanın kendisini göster ve kurulum günlüğü için
`showcase/data-dashboard/BUILD-LOG.md` dosyasını aç.
