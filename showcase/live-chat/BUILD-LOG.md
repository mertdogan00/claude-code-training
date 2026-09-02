# BUILD-LOG: Salon Sohbeti

Bu uygulama gerçekte nasıl yapıldı: plan, takım, daha kimse tek satır yazmadan yayımlanan sözleşme,
QA'nın çalıştırdığı kontroller ve bulunup düzeltilen her hata.

Tek bir yapıştırılan prompt'tan yapıldı:
[`../../prompts/apps/live-chat.md`](../../prompts/apps/live-chat.md); ORKESTRATÖR rolünü üstlenen
bir Claude Code oturumu tarafından. Orkestratör tek satır uygulama kodu yazmadı: sözleşmeyi
yayımladı, takımı kurdu, sonucu birleştirdi, gerçek ekran görüntülerine bakarak yargıladı ve
yeterince iyi olmayan işi geri gönderdi.

## 1. İşe başlamadan önce ekrana basılan plan

```
1. Publish the CONTRACT: file list, port, HTTP routes with JSON shapes, every WebSocket
   frame in both directions. Write it into BUILD-LOG.md so parallel work fits.
2. Form the team: Backend Lead and Frontend Lead in parallel, they never share a file.
3. Integrate: npm install, boot the server, smoke the API and the WebSocket handshake.
4. QA Lead: turn the six item checklist into real checks, two clients as two people,
   drive the real page in a browser, report pass or fail, fix what fails.
5. Judge the result on screenshots at 1440x900 and 390x844, desktop and phone.
6. Send failures back to the owning lead. Repeat until it reads as a product.
7. Write README.md and BUILD-LOG.md.
8. Clean check: delete node_modules, reinstall, boot, curl, WebSocket round trip, kill.
```

Türkçesi: (1) SÖZLEŞMEYİ yayımla (dosya listesi, port, JSON şekilleriyle HTTP yolları, iki yöndeki
her WebSocket karesi) ve paralel iş birbirine otursun diye BUILD-LOG.md içine yaz; (2) takımı kur,
Backend ile Frontend paralel çalışsın ve asla aynı dosyaya dokunmasın; (3) birleştir: `npm install`,
sunucuyu ayağa kaldır, API'yi ve WebSocket el sıkışmasını yokla; (4) QA Lideri altı maddelik kontrol
listesini gerçek testlere çevirsin, iki kişi yerine iki istemci kullansın, gerçek sayfayı tarayıcıda
sürsün, geçti ya da kaldı diye raporlasın, kalanı düzeltsin; (5) sonucu masaüstü ve telefon için
1440x900 ve 390x844 ekran görüntülerine bakarak yargıla; (6) kalan maddeleri sahibi olan lidere geri
gönder, ürün gibi okunana kadar tekrarla; (7) README.md ve BUILD-LOG.md yaz; (8) temiz kontrol:
`node_modules` sil, yeniden kur, aç, curl at, iki istemci arasında WebSocket turu yap, kapat.

## 2. Takım

| Rol | Model | Efor | Neyin sahibiydi |
|---|---|---|---|
| Orkestratör | ana Claude Code oturumu | high | Sözleşme, entegrasyon, yargı, README, BUILD-LOG, ekran görüntüleri |
| Backend Lideri | Sonnet | medium | `package.json`, `server.js`, `.gitignore` |
| Frontend Lideri | Sonnet | medium | `public/index.html`, `public/style.css`, `public/app.js` |
| QA Lideri | Sonnet | medium | Kontrol listesinin gerçek testlere dönüşü ve kalan maddelerin düzeltilmesi |
| Frontend Lideri, ikinci tur | Sonnet | medium | Ekran görüntüsü incelemesinden sonraki düzen yeniden kurulumu |
| CSS işçisi | Sonnet | low | Ortalanmış taşmanın kırpılması düzeltmesi |

Backend Lideri ile Frontend Lideri AYNI ANDA çalıştı; birbirlerinin dosyalarına karşı değil,
sözleşmeye karşı. Bu ancak 1. adım sayesinde güvenli: Frontend Lideri, henüz diskte var olmayan bir
API için eksiksiz bir istemci yazdı ve ilk birleştirmede oturdu.

## 3. Kimse tek satır yazmadan yayımlanan sözleşme

### Yığın ve dosya listesi

Node 24, ESM, derleme adımı yok, framework yok, TypeScript yok, paketleyici yok, CSS kütüphanesi
yok. Tam olarak üç npm bağımlılığı: `express`, `ws`, `qrcode`. Veritabanı, Node'un içinde hazır
gelen `node:sqlite` (`import { DatabaseSync } from 'node:sqlite'`), yani derlenmesi gereken hiçbir
şey yok.

```
live-chat/
  package.json      "type":"module", scripts.start = "node server.js"
  server.js         Express + ws + node:sqlite + qrcode + os.networkInterfaces
  public/index.html, public/style.css, public/app.js
  .gitignore        node_modules/, data.sqlite*, *.log
  data.sqlite       created and seeded on first start, gitignored
  README.md, BUILD-LOG.md, screenshots/
```

Varsayılan port 3000, `PORT` ile değişiyor, `0.0.0.0` adresine bağlanıyor. Sunucu açılışta hem yerel
adresi hem LAN adresini yazdırıyor. Kullanıcının gördüğü bütün metinler Türkçe. Kod ve kod yorumları
İngilizce; bu belge Türkçe.

### SQLite şeması

```sql
rooms      (id, slug UNIQUE, name, created_at)
messages   (id, room_id, user_id, user_name, user_color, text, created_at)
reactions  (message_id, user_id, emoji, PRIMARY KEY (message_id, user_id, emoji))
```

İlk açılışta Genel, Sorular ve Kahve odalarıyla ve "Salon Botu"ndan gelen birkaç Türkçe hoş geldin
mesajıyla dolduruluyor.

### Ortak JSON şekilleri

```jsonc
Room    { "id": 1, "slug": "genel", "name": "Genel", "createdAt": 1788..., "messageCount": 12 }
User    { "id": "u_ab12cd", "name": "Mert", "color": "#C15F3C" }
Message {
  "id": 42, "roomId": 1,
  "userId": "u_ab12cd", "userName": "Mert", "userColor": "#C15F3C",
  "text": "merhaba", "createdAt": 1788...,
  "reactions": { "👍": ["u_ab12cd", "u_zz99"] }   // emoji -> array of userIds
}
```

`reactions`, bir emojiyi onu ekleyen kullanıcı kimliklerinin dizisine eşliyor; yani sayı dizinin
uzunluğu oluyor ve bir istemci kendi kimliğini dizide görünce tepki verdiğini biliyor. Sabit emoji
kümesi: 👍 ❤️ 😂 🎉 👏.

### HTTP yolları

| metot | yol | 200 cevabı |
|---|---|---|
| GET | `/` | `public/index.html` |
| GET | `/api/health` | `{ "ok": true, "app": "salon-sohbeti", "uptimeSec": 12 }` |
| GET | `/api/rooms` | `{ "rooms": [Room, ...] }` |
| POST | `/api/rooms` | `201 { "room": Room }`; boş ad, 40 karakteri aşan ad ya da yinelenen slug için 400 |
| GET | `/api/rooms/:id/messages?limit=50` | `{ "roomId": 1, "messages": [Message] }`, en eski önce, bilinmeyen oda için 404 |
| GET | `/api/rooms/:id/search?q=...` | `{ "roomId": 1, "query": "...", "hits": [Message] }`, en yeni önce, en fazla 50 |
| GET | `/api/join` | `{ "localUrl", "lanUrl", "url", "port", "qr" }`; `qr` bir PNG veri adresi |
| GET | `/api/stats` | `{ "rooms": 3, "messages": 12, "online": 2 }` |

Hatalar, 400 ya da 404 durumuyla birlikte `{ "error": "<turkish message>" }` biçiminde dönüyor.

### WebSocket, uç nokta `ws://<host>:<port>/ws`

İstemciden sunucuya: `hello`, `switch`, `message`, `typing`, `react`, `profile`, `ping`.
Sunucudan istemciye: `welcome`, `history`, `message`, `presence`, `typing`, `reaction`, `room`,
`error`, `pong`.

Paralel işin birbirine oturmasını sağlayan kurallar:
- `message`, `reaction` ve `room` bağlı olan HER istemciye gidiyor; böylece istemcinin bakmadığı bir
  oda için bile okunmamış sayaçları ve oda listesi doğru kalıyor. Neyin çizileceğine istemci karar
  veriyor.
- `presence` ve `typing` yalnızca etkin odası eşleşen istemcilere gidiyor.
- Sunucu, bir mesajı ve bir tepki değişimini yayımlamadan ÖNCE kaydediyor.
- 4 saniye içinde tazelenmemiş bir `typing: true` düşürülüyor ve bir `typing: false` yayımlanıyor;
  yani cümlenin ortasında düşen bir istemci geride takılı bir gösterge bırakmıyor.
- `hello` ile gelen kimlik sokete bağlanıyor ve sonraki hiçbir kareden yeniden okunmuyor. `profile`
  yalnızca adı ve rengi değiştirebiliyor, başka hiçbir şeyi değil.

### Frontend sözleşmesi

Ürün kabuğu: üstte ürün adı, etkin oda ve profil rozeti taşıyan bir çubuk; menüden ulaşılan üç ekran
(Sohbet, Katıl, Ayarlar) ve etkin olanı `location.hash` içinde tutmak; ilk `welcome` gelene kadar bir
yükleniyor durumu; her listede bir boş durum; otomatik yeniden bağlanan ve üstel geri çekilmesi 5
saniyeyle sınırlanmış bir bağlantı rozeti; tek bir vurgu rengi (`#C15F3C`); açık ve koyu tema; 390px
genişlikte yana taşma olmadan kullanılabilirlik.

localStorage anahtarları: `salon.user`, `salon.theme`, `salon.sound`, `salon.unread`.

## 4. QA gerçekte ne çalıştırdı

WebSocket kontrolleri, Node 24'ün içinde hazır gelen GLOBAL `WebSocket` ile, iki kişi yerine farklı
adlarla açılmış iki soket üzerinden yapıldı. Gerçek sayfa, hiç npm paketi kullanmadan yine aynı
global WebSocket üzerinden Chrome DevTools Protocol ile sürüldü: localStorage'ı doldurmak ve DOM'u
geri okumak için `Runtime.evaluate`, görüntüler için `Page.captureScreenshot`.

| # | Kontrol | Kanıt |
|---|---|---|
| 1 | Temiz açılış | `npm install` temizdi; açılışta `Salon Sohbeti çalışıyor.` satırıyla birlikte hem yerel HEM LAN adresi yazdırıldı; `/` 200 döndü; yüklemede konsolda hata yok |
| 2 | İki kişi, canlı | İki soket "Ayşe" ve "Mert" olarak katıldı; mesaj 9 ms'de karşıya geçti; çevrimiçi listesi iki adı da döndü |
| 3 | Yazma göstergesi ve tepkiler | Karşı taraf önce `typing:true`, sonra `typing:false` gördü; birinin gönderdiği 👍 ötekine `{"👍":["u_mert"]}` olarak ulaştı |
| 4 | Yeniden başlatma | Bir mesaj ve bir 🎉 tepkisi; sunucu kapatılıp yeniden açıldı: hem API hem de yeni bir `welcome` ikisini de eksiksiz döndürdü |
| 5 | Arama ve QR | `q=herkesle` ilk verideki mesajı buldu; `/api/join` LAN adresini ve gerçek bir 512x512 PNG'ye çözülen bir `qr` döndürdü |
| 6 | Ayarlar ve 390px | Tema ve bildirim sesi yenilemeyi atlattı; üç ekranda da `scrollWidth === 390` |

Orkestratör sonra her şeyi bir kez de kendi başına tekrarladı: WebSocket üzerinden senaryolu üç
kişilik bir konuşma, istemciler arası tepkiler, bir oda değişimi ve 1440x900 ile 390x844
boyutlarında tek tek baktığı dokuz ekran görüntüsü.

## 5. Bulunan ve düzeltilen hatalar

**1. İlk kez gelen biri içeri giremiyordu. Yolu tıkayan hata.**
`public/app.js`, `{ type: 'hello', user, roomId: state.activeRoomId || undefined }` gönderiyordu ve
ilk ziyarette `activeRoomId` null oluyor. `server.js` ise `Number(frame.roomId)` yapıp `NaN` alıyor,
oda aramasında kalıyor ve `{"type":"error","message":"Geçersiz giriş bilgisi."}` cevabını
veriyordu. Yani her yeni kullanıcı duvara tosluyordu. Birleştirme sırasında orkestratör tarafından
bulundu, iki satırlık bir WebSocket yoklamasıyla yeniden üretildi ve hoşgörülü uçta, yani sunucuda
düzeltildi: `roomId` eksik, `NaN` ya da bilinmeyen geldiğinde `hello` artık ilk odaya düşüyor ve
çözülmüş `roomId` değerini taşıyan normal bir `welcome` cevabı veriyor. Yalnızca geçersiz bir `user`
reddediliyor.

**2. Türkçenin harfleri olmadan yazılması.**
`server.js` içindeki her Türkçe metin ASCII'ye soyulmuştu: `Gecersiz giris bilgisi.`,
`Oda bulunamadi.`, `Salon Sohbeti'ne hos geldiniz!`, `Salon Sohbeti calisiyor.`. Türkçe konuşan bir
salon bunu bozukluk olarak okur. Hepsi düzgün harfleriyle yeniden yazıldı, hoş geldin mesajları
doğru gelsin diye veritabanı yeniden dolduruldu ve oda slug'ları bilinçli olarak ASCII bırakıldı.

**3. `[hidden]` hiçbir işe yaramıyordu, bu yüzden geri gelen kullanıcılar hep giriş ekranını
görüyordu. Kritik.**
`public/style.css`, `.join-screen`, `.shell` ve birkaç `.screen-*` kuralında `display` değerini
koşulsuz veriyordu. Eşit özgüllükte, yazarın kuralları `hidden` özniteliği için tarayıcının
varsayılanını yeniyor; dolayısıyla `el.hidden = true` ile bir öğeyi gizlemenin hiçbir etkisi
olmuyordu: geri gelen kullanıcı uygulamanın üstünde giriş ekranını görüyor ve aynı anda birden fazla
ekran çizilebiliyordu. QA Lideri buldu; tek bir genel `[hidden] { display: none !important; }`
kuralıyla düzeltildi.

**4. Sohbet pencereye sığmıyordu. Kritik ve yalnızca ekran görüntüsüne bakınca görüldü.**
Uygulama kullanılamaz haldeyken bütün işlevsel kontroller geçiyordu: kabuk, görüntü alanını
dolduracağına sayfa boyunca aşağı akıyordu; yani hem 1440x900'de hem 390x844'te mesaj kutusu, yazma
satırı ve tepki düğmeleri ekranın altında kalıyor, mesaj listesi de EN ESKİ mesajda açılıyordu.
Mesaj kutusunu göremediğin bir sohbet ürün değildir. Kabuk `100dvh` yüksekliğinde, `overflow: hidden`
olan bir esnek sütun olarak yeniden kurularak düzeltildi; zincir boyunca her esnek çocuğa
`min-height: 0` verildi (herkesin unuttuğu adım; bu olmadan liste küçülmeyi reddediyor ve mesaj
kutusunu ekrandan itiyor), tek kaydırılan bölge `#message-list` yapıldı ve mesaj kutusu onun altına
sabitlendi. Liste; geçmiş yüklendikten sonra, her yeni mesajdan sonra ve her oda değişiminden sonra
en alta kayıyor, okuyan kişi 120px'den fazla yukarı kaydırmadıysa. İlk kaydırmayı bir
`requestAnimationFrame` boyunca iki kez yazmak da gerekti, çünkü ilki yazı tipi yedeğinin yeniden
akışından önce iniyordu.

**5. Mesaj satırları dikeyde yer harcıyordu.**
Satır başına yaklaşık 110px, 900px'lik bir ekranı altı mesajın doldurması demekti. Satır boşlukları
ve aralıklar sıkılaştırıldı; aynı kişinin beş dakika içindeki arka arkaya mesajları artık
gruplanıyor: avatar, ad ve saat yalnızca ilkinde duruyor, kalanı hizalanacak biçimde içeri alınıyor.
Gizli bir tepki seçicisi de her satırda sessizce 32px'lik düzen yüksekliği tutuyordu.

**6. Ayarlar ve Katıl ekranlarında ölü alanlar.**
Ayarlar, 900px'lik bir ekranda y=540 civarında bitiyor ve alttaki yüzde 40 boş kalıyordu. Bir profil
başlığı ve iki panel (Görünüm, Profil) olarak yeniden kuruldu: geniş ekranda yan yana, telefonda alt
alta. Katıl ekranındaki yönerge satırına bir `max-width` ve dengeli bir satır sonu verildi. Ölü alan
yüzde 31'den yaklaşık yüzde 15'e indi.

**7. Ortalanmış esnek içerik telefonda kendi üstünü kırpıyordu.**
Ayarlar panelleri dikeyde ortalanınca içerik 390x844'te kapsayıcıdan uzun hale geliyor ve taşma iki
yöne birden dökülüyordu: profil avatarı üst kenara karşı ortadan kesiliyor ve yukarı kaydırıp ona
ulaşmanın yolu kalmıyordu. Klasik flexbox ortalanmış taşma tuzağı. Güvenli ortalamayla düzeltildi;
yani sığan bir ekran yine ortalanmış görünüyor, sığmayan ekran ise tümüyle erişilebilir kalıyor.

**8. Bozuk bir WebSocket karesi bütün sunucuyu öldürebiliyordu. Yolu tıkayan hata, doğrulamada
bulundu.**
`hello` yalnızca `user.id` değerinin dolu olup olmadığına bakıyor ve kimliği hiçbir tür dönüşümü
yapmadan sokete bağlıyordu; yani bir istemci `user.name` alanına bir nesne koyarak katılabiliyordu.
Bir sonraki `message` karesi o nesneyi doğrudan `stmt.insertMessage.run(...)` çağrısına geçiriyor,
`node:sqlite` de `TypeError: Provided value cannot be bound to SQLite parameter 3` fırlatıyordu; ve
fırlatma `ws` mesaj işleyicisinin içinde olduğu için hiçbir yer onu yakalamıyordu: süreç çıkıyor ve
bağlı olan her istemci odayı kaybediyordu. Wifi'daki herhangi bir cihazdan gelen iki kare yetiyordu,
ki bu uygulama tam olarak o kitleyi bir QR ile içeri çağırıyor. Üç yerde düzeltildi: `id`, `name` ve
`color` için yalnızca kırpılmış metinleri kabul eden bir `toIdentity` yardımcısı (`hello` ve, soketin
kendi kimliğini koruyan, `profile` tarafından kullanılıyor), gelecekteki hiçbir karenin süreci
düşürememesi için `handleFrame` çevresinde bir `try/catch` ve Express uygulamasında bir JSON hata
işleyicisi, ki bozuk gövdeli bir istek artık HTML bir yığın izi yerine 400 durumuyla
`{"error": "..."}` alıyor.

## 6. Bitti sayılma ölçütü

`npm install`, `node server.js`, http://localhost:3000 adresini aç, altı kontrol maddesinin hepsi
yeşil, `README.md` ve `BUILD-LOG.md` yazılmış. Son düzeltmeden sonra bir kez daha sıfırdan
doğrulandı: yeni bir `node_modules`, temiz bir açılış, `/` için 200, JSON cevaplayan `/api/join` ve
iki istemci arasında bir WebSocket turu. [README.md](README.md) içindeki Doğrulandı tablosuna bak.
