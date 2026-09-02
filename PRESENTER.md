# Sunum akışı: hangi dosya, hangi komut, hangi anda

Sahne senaryosu bu. Yedi tane elle yapılan uygulama, `exercises/` altında yedi klasör, aşağıda
her birine bir satır. Slayt salona NE olduğunu anlatır; bu dosya sana NEREYE gideceğini söyler.
Kural her seferinde aynı: **klasörün README'sini aç, bir seçenek seç, bloğu yapıştır.** Sahnede
hiçbir şey ezberden yazılmaz ve her klasörün sonunda, ağ ya da bilgisayar seninle anlaşamazsa
diye bir "Olmazsa göster" satırı vardır.

## Kapılar açılmadan önce

```bash
git -C claude-code-training pull      # sahnedeki depo, GitHub'daki deponun ta kendisi
node -v                               # v24 ya da daha yenisi olmalı
cd claude-code-training
ls showcase                           # bu akşam hangi yedekler gerçekten elinde
(cd showcase/data-dashboard && npm install)
(cd showcase/neon-breaker   && npm install)
(cd showcase/live-chat      && npm install)   # klasör yukarıdaki listede yoksa bu satırı atla
```

Her kurulum kendi alt kabuğunda çalışıyor, yani henüz olmayan bir klasör sadece o satırı
düşürür; seni repo kökünde bırakır, geri kalanı bozmaz. `ls showcase` neyi yazmadıysa bu akşam
onun yedeği yok demektir: `live-chat` eksikse ya oylamadan **C · Salon Sohbeti**'ni çıkar ya da
listede bırak ama sahnede tek yolunun canlı kurulum olduğunu bilerek bırak.

Sonra: terminal yazı boyutunu büyüt (arka sıra da okuyabilmeli), bilgisayar ve iki telefon aynı
wifi'da olsun, güvenlik duvarı 3000 portuna izin versin (hem telefondan kumanda gösterisi hem
Salon Sohbeti'nin katılım QR'ı buna muhtaç) ve bir tarayıcı penceresi `http://localhost:3000`
adresinde açık dursun ki sekme hazır olsun.

## Yedi uygulama tek bakışta

| Rozet | Slayt | Klasör | Sahnede |
|---|---|---|---|
| **1/7** | 10 | `exercises/01-install/` | README'yi aç, seçenek seç (macOS / Windows / Linux), yapıştır |
| **2/7** | 11 | `exercises/02-first-launch/` | README'yi aç, seçenek seç (A kafe notu / B satış CSV'si / C bu repo), yapıştır |
| *bonus* | 13 | (klasör yok) | telefondan kumanda, `exercises/02-first-launch/README.md` içindeki bonus paragrafı |
| **3/7** | 19 | `exercises/03-commands/` | README'yi aç, seçenek seç (A altılı / B hava atan iki komut / C kart), yapıştır |
| **4/7** | 20 | `exercises/04-claude-md/` | README'yi aç, seçenek seç (A yemek planı / B tedarikçi maili / C satış raporu), yapıştır |
| **5/7** | 23 | `exercises/05-skill/` | README'yi aç, seçenek seç (A pdf / B toplantı / C klasör / D sosyal medya), yapıştır |
| **6/7** | 24 | `exercises/06-plugin-mcp/` | README'yi aç, seçenek seç (A playwright / B superpowers / C MCP), yapıştır |
| **7/7** | 27 | `exercises/07-build/` | README'yi aç, salonun oyladığı seçeneği seç, yapıştır |

## Durak 1 · Büyük resim (slayt 1-7)

Elle yapılan bir şey yok. Sadece anlatım. Hazır olması gereken tek şey: yol haritası slaytı
(2 · Bu akşamın yol haritası) beş durağın sözünü verdiğin yer, slayt 3 (Elleri görelim) ise el
kaldırma anı. Terminali slayt 10'a kadar gizli tut.

## Durak 2 · Kurulum (slayt 8-13)

Slayt 8 ve 9 (Terminal, dosya, yol; Komut, repo, Git ve GitHub) sadece anlatım: kelimeler
yerine otursun, terminal slayt 10'da sahneye çıksın.

| Slayt anı | Rozet | Klasör | Ne yapacaksın |
|---|---|---|---|
| **10 · UYGULAMA · Kurulum: Node, Claude Code, giriş** | **1/7** | `exercises/01-install/` | `exercises/01-install/README.md` dosyasını aç, sahnedeki bilgisayara uyan seçeneği seç (A macOS, B Windows, C Linux), onun 1. yol ya da 2. yol bloğunu yapıştır, sonra `node -v` ve `claude --version` doğrulama satırlarını canlı çalıştır. İsteğe bağlı `python3 --version` satırını açık açık söyle: skill betikleri onu kullanıyor, Claude Code'un ihtiyacı yok. Salon da beraber kuruyor. Yedek: projeksiyonda `docs/setup/macos.md`, `windows.md`, `linux.md`. |
| **11 · UYGULAMA · İlk açılış: claude, /help, ilk cümle** | **2/7** | `exercises/02-first-launch/` | `exercises/02-first-launch/README.md` dosyasını aç, ilk iki satırı yapıştır (`cd exercises/02-first-launch`, sonra `claude`). Sıfır bir bilgisayarda giriş için tarayıcı açılır: bırak salon izlesin, gecenin tek hesap adımı bu. Sonra `/help`, yavaşça kaydırarak. Şimdi TEK bir ilk cümle seç ve olduğu gibi yapıştır: A `notes.txt` içindeki kafe notu, B repodaki CSV üzerinden satış sorusu (`data/sales-data.csv`, README'den `../../data/sales-data.csv` diye yapıştırılıyor), C `../../README.md` üzerinden kendini anlatan repo. `/context` ile kapat (göstergeyi işaret et) ve `/clear`. Yedek: `exercises/02-first-launch/expected/a.md`, `b.md`, `c.md`. |
| **13 · UYGULAMA · Telefondan bilgisayarımı çalıştırıyorum** | *bonus, rozet yok* | `exercises/02-first-launch/` | Aynı README'nin en altındaki bonus paragrafı. Telefon: Claude uygulamasını aç, bu bilgisayara bağlan, küçük bir görev gönder. Bilgisayar iş yaparken telefonu havada tut. Repoda hazırlanacak bir şey yok. |

Aralarındaki slayt 12 (Ne kadara mal oluyor) sadece anlatım; terminal ekranda kalabilir.

## Durak 3 · Temel kavramlar (slayt 14-20)

Slayt 14-18 (prompt, token, context, Markdown ve CLAUDE.md, kaputun altı) sadece anlatım ama
slayt 11'deki oturumu canlı tut: token'ları anlatırken ekranda duran bir `/context`, bir sayfa
slayta bedel. Komutlar ÖNCE geliyor (19), önce/sonra egzersizi sonra (20), böylece `/clear`
lazım olduğunda salon onu zaten biliyor.

| Slayt anı | Rozet | Klasör | Ne yapacaksın |
|---|---|---|---|
| **19 · UYGULAMA · Komut kartı ve hangi model** | **3/7** | `exercises/03-commands/` | `exercises/03-commands/README.md` dosyasını aç ve A seçeneğini sırayla işle: `/help`, `/context`, `/clear`, `/compact` özetleyecek bir şey bulsun diye tek kullanımlık bir soru, `/compact`, `/model` (seçiciyi aç, merdiveni anlat, hiçbir şeyi değiştirmeden kapat), `/permissions`. Her birinin README'de tek satırlık Türkçe karşılığı var, yüksek sesle oku. Sonra B seçeneği, hava atan iki satır: `/rewind` (dosyaları VE konuşmayı geri alan geri alma) ve `/resume` (geçen haftaki oturum context'iyle geri geliyor); ikisini de aç ve çıkarak göster. Yedek: `commands.md`, salonun eve götürdüğü kartın aynısı. |
| **20 · UYGULAMA · Aynı soru, iki cevap** | **4/7** | `exercises/04-claude-md/` | `exercises/04-claude-md/README.md` dosyasını aç ve bir seçenek seç: A `a-meal-plan/`, B `b-supplier-email/`, C `c-sales-report/`. Akış üçünde de aynı: repo kökünden `cd exercises/04-claude-md/<option>` (`a-meal-plan`, `b-supplier-email` ya da `c-sales-report`), `claude`, soruyu yapıştır, sade cevabı göster, sonra hafıza dosyasını canlı oluştur: `rules.md içindeki kuralları bu klasörün CLAUDE.md dosyasına kaydet.` (ya da oturumdan çıkıp `mv rules.md CLAUDE.md`), yeni `CLAUDE.md` dosyasını aç ve üç kuralını yüksek sesle oku, `/clear`, AYNI soruyu yapıştır. Yerine oturan cümleyi söyle: sen modeli değil, bir dosyayı değiştirdin. `mv CLAUDE.md rules.md` ile eski haline döndür. Yedek: seçeneğin klasöründeki `expected/before.md` ve `expected/after.md`, yan yana. |

## Durak 4 · Yetenek katmak (slayt 21-25)

Slayt 21 mola. Terminali repo kökünde bırakıp dön. Slayt 22 (Skill, plugin, MCP, ajan) sadece
anlatım: ikisini göstermeden önce dördünün adını koy.

| Slayt anı | Rozet | Klasör | Ne yapacaksın |
|---|---|---|---|
| **23 · UYGULAMA · Skill kur** | **5/7** | `exercises/05-skill/` | `exercises/05-skill/README.md` dosyasını aç. Repo kökünden, Claude Code'un içinde kurulum cümlesini yapıştır: `skills/pdf-summarizer klasörünü bu projeye skill olarak kur.` `/` yaz ve listede bul. Sonra bir seçenek seç ve iki sütununu göster, yani her seferinde yeniden yazacağın uzun prompt ile tek komut: A `exercises/05-skill/samples/sample.pdf` üzerinde `/pdf-summarizer`, B `exercises/05-skill/samples/meeting.txt` üzerinde `/meeting-notes`, C bu repoda `/folder-report .`, D yapıştırılan bir duyuruda `/social-post`. Söylenecek cümle: dün bu, her defasında yeniden yazdığın bir promptu; bugün bir komut ve kendi betiğini de yanında getirdi. Yedek: `exercises/05-skill/expected/` içinde her skill için bir örnek çıktı var. |
| **24 · UYGULAMA · Plugin ve MCP** | **6/7** | `exercises/06-plugin-mcp/` | `exercises/06-plugin-mcp/README.md` dosyasını aç. Öne çıkarılacak olan A seçeneği: `https://github.com/mertdogan00/claude-code-training adresinin ekran görüntüsünü al ve bu klasöre repo.png olarak kaydet.` diye sor ve dürüstçe başarısız olmasına izin ver (sayfayı çekip metnini okuyabilir, fotoğrafını çekemez), sonra `/plugin` → Discover → `playwright` → kur → YENİ oturum → aynı cümle → projeksiyonda tarayıcı açılıyor ve klasörde `repo.png` beliriyor, ardından `Şimdi exercises klasörüne tıkla ve içinde ne olduğunu söyle.` Salon ikincisini isterse B seçeneği: `superpowers`, öncesinde ve sonrasında `/` yazarak listenin gözle görülür şekilde büyümesini göster. C seçeneği MCP, terminalde: `claude mcp add --transport http cloudflare-docs https://docs.mcp.cloudflare.com/mcp`, yeni oturum, sonra sor: `Bir Cloudflare Worker için cron tetikleyicisi nasıl kurulur? Canlı dokümandan cevapla.` Aynı blokta yedekler: Context7 ve DeepWiki, kendi sorularıyla. Yedek: o klasördeki `plugin.md` ve `mcp.md`, anlatarak. |

Slayt 25 (Ajanlar) Durak 5'e geçiş köprüsü: yüksek sesle söyle, bundan sonra göreceğin tek bir
asistan değil, bir takım.

## Durak 5 · Canlı kurulum (slayt 26-28)

| Slayt anı | Rozet | Klasör | Ne yapacaksın |
|---|---|---|---|
| **26 · Şimdi siz seçin: üç aday** | (oylama) | `exercises/07-build/` | Üçünü `exercises/07-build/README.md` dosyasından yüksek sesle oku: Satış Analitik Paneli (`data-dashboard`), Neon Breaker (`neon-breaker`), Salon Sohbeti (`live-chat`). Her seçenek için el kaldırt, sesli say, kazananı ilan et. |
| **27 · UYGULAMA · Reçete ve canlı kurulum** | **7/7** | `exercises/07-build/` | Kazananın seçeneğini `exercises/07-build/README.md` içinde aç (A Satış Analitik Paneli `data-dashboard`, B Neon Breaker `neon-breaker`, C Salon Sohbeti `live-chat`), sonra `prompts/apps/<winner>.md` dosyasını ekranda aç ve yavaşça kaydır: takım maddesini, önce sözleşme kuralını ve kabul kontrol listesini işaret et. Sonra hâlâ repo kökündeyken `mkdir demo && cd demo && claude`, iki `---` satırı arasındaki her şeyi yapıştır ve BAŞKA hiçbir şey yazma. O kurarken takımı anlat: kim doğdu, her lider ne yapıyor, her biri ne getirdi. README'deki soruyu sor. Bittiğinde: `npm install`, sonra `node server.js`, http://localhost:3000 adresini aç. Salon Sohbeti kazandıysa şu sırayla göster: önce yan yana iki tarayıcı penceresi, birine yaz ve diğerine düştüğünü izle, ancak ondan sonra Katıl ekranını QR'ıyla projeksiyona ver ki wifi'daki iki telefon okutup merhaba desin. Salon bir değişiklik istesin, sen de tek cümle olarak yaz. |
| **27 · yedek şerit** | **7/7** | `showcase/<winner>/` | Canlı kurulum uzarsa ya da ağ ölürse: `cd ~/claude-code-training/showcase/<winner>` (`demo/` içinden de çalışır) → `node server.js` (onun `npm install` işi kapılar açılmadan yapılmıştı) → http://localhost:3000 adresini aç → sonra o klasörün `BUILD-LOG.md` dosyasını aç ve kimin ne yaptığını oku. `showcase/live-chat/` şimdilik `BUILD-LOG.md` taşımıyor: Salon Sohbeti kazandıysa uygulamayı göster, günlük için `showcase/data-dashboard/BUILD-LOG.md` dosyasını aç. Aynı prompt, bitmiş sonuç. |
| **28 · Bu gece ne öğrendik, sorular** | (kapanış) | `exercises/` | Ekranda repo adresi ve QR. İlk hafta için `after-training.md` dosyasını, akşamı evde tekrar etmek için de `exercises/` altındaki yedi numaralı klasörü göster; başlangıç `exercises/02-first-launch/`. |

## Cepteki cevaplar

- **Canlı kurulum patlarsa, uzarsa ya da wifi ortada ölürse:** `cd ~/claude-code-training/showcase/<winner>` ve
  `node server.js` çalıştır, sonra uygulamayı ve `BUILD-LOG.md` dosyasını göster: "bir ajan takımı
  bunu tam olarak o promptu okuyarak kurdu, işte sonucu ve işte kimin ne yaptığı." Hazır yedekler
  `showcase/` altında duruyor; kapılar açılmadan çalıştırdığın `ls showcase` bu akşam gerçekten
  hangilerinin elinde olduğunu söylüyor, yani listede görmediğin bir yedeğin sözünü asla verme.
- **MCP sırasında wifi ölürse:** `exercises/06-plugin-mcp/mcp.md` dosyasını göster ve anlat; skill
  ve plugin gösterileri çevrimdışı çalışır (plugin KURULUMU çalışmaz, o yüzden skill'i öne al).
- **Canlı bir cevap yanlış görünürse:** o klasörün kendi yedeğini aç ve salon karşılaştırsın.
  Canlı cevabın kendisi asıl mesele olduğu yerlerde hazır bir örnek çıktı bekliyor:
  `exercises/02-first-launch/expected/`, `exercises/05-skill/expected/` ve
  `exercises/04-claude-md/` içindeki her seçenek klasörünün kendi `expected/` klasörü; satış
  rakamlarında bu aynı zamanda doğru cevap demek. Gerisi başka yerlere düşüyor: 1/7
  `docs/setup/*.md`, 3/7 `commands.md`, 6/7 `plugin.md` ve `mcp.md`, 7/7 `showcase/<winner>/` ve
  onun `BUILD-LOG.md` dosyası. Her klasörün kendi "Olmazsa göster" satırı da aynı şeyi söylüyor.
- **Kurulum sormaması gereken bir soruda takılırsa:** `plana göre devam et, başka onay sorma` diye cevap ver, prompt dosyasını da yarın sıkılaştır.
- **Biri "dosyalarımı görebiliyor mu?" diye sorarsa:** ekrandaki `/permissions` en dürüst cevap.
- **3000 portu doluysa:** `PORT=3001 node server.js` ve http://localhost:3001 adresini aç.
