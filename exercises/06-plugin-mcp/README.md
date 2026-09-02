# 6/7 · Plugin ve MCP

Aynı asistana yeni eller takmanın iki yolu. PLUGIN, birinin paketleyip yayımladığı hazır bir
yetenek (komutlar, ajanlar, bazen komple bir MCP bağlantısı). MCP sunucusu ise dışarıya açılan
bir kapı: canlı dokümantasyon, bir servis, bir veritabanı. İkisi de saniyeler içinde
görülüyor, zaten sahneye ait olmalarının sebebi de bu.

Adım adım anlatımlar bu klasördeki `plugin.md` ve `mcp.md` dosyalarında.

## SAHNEDE (kopyala-yapıştır)

### A · playwright (GÖRÜLEBİLEN plugin)

Resmî marketplace açıklaması, kelimesi kelimesine: "Browser automation and end-to-end testing
MCP server by Microsoft. Enables Claude to interact with web pages, take screenshots, fill
forms, click elements, and perform automated browser testing workflows." Yani: Microsoft'un
tarayıcı otomasyonu sunucusu; sayfalarla etkileşim, ekran görüntüsü, form doldurma, tıklama.

Sadece gerçek bir tarayıcının yapabileceği bir iş seç. Claude Code bir sayfayı zaten ÇEKİP
metnini okuyabiliyor, dolayısıyla "bu sayfada ne yazıyor" diye sormak hiçbir şey kanıtlamaz;
o sayfanın resmini istemek kanıtlar.

ÖNCESİ, mevcut oturumda bunu sor ve dürüstçe başarısız olmasına izin ver:

```
https://github.com/mertdogan00/claude-code-training adresinin ekran görüntüsünü al ve bu klasöre repo.png olarak kaydet.
```

Ekran görüntüsü alamadığını söyler ya da onun yerine sayfayı metin olarak yazmayı önerir.
Sayfaya bakacak bir tarayıcı ve yakalanacak bir pencere yok. Bunu yüksek sesle söyle, sonra
bir tane kur:

```
/plugin
```

Discover sekmesi, `playwright` plugin'ini bul, kur, kapsamı onayla. YENİ bir oturum başlat ve
AYNI cümleyi yapıştır:

```
https://github.com/mertdogan00/claude-code-training adresinin ekran görüntüsünü al ve bu klasöre repo.png olarak kaydet.
```

Bu sefer projeksiyonda bir tarayıcı penceresi açılıyor, sayfa salonun gözü önünde yükleniyor
ve klasörde `repo.png` beliriyor. Kanıt için dosyayı aç. Sonra çekilmiş bir sayfanın da
veremeyeceği şeyi iste, bir tıklama:

```
Şimdi exercises klasörüne tıkla ve içinde ne olduğunu söyle.
```

### B · superpowers (SAYILABİLEN plugin)

Resmî marketplace açıklaması, kelimesi kelimesine: "Superpowers teaches Claude brainstorming,
subagent driven development with built in code review, systematic debugging, and red/green
TDD. Additionally, it teaches Claude how to author and test new skills." Yani: Claude'a fikir
üretme, alt ajanlarla geliştirme, kod incelemesi, sistemli hata ayıklama ve skill yazmayı
öğretiyor.

ÖNCESİ, tek bir slash yaz ve salon listeye baksın:

```
/
```

Satırları yüksek sesle say ya da sadece "liste bu kadar" de. Sonra:

```
/plugin
```

Discover sekmesi, `superpowers` plugin'ini bul, kur. Yeni oturum, slash'ı yine yaz:

```
/
```

Liste gözle görülür şekilde uzadı. Tek kurulum, bir yığın yeni komut.

### C · MCP: üç sunucu, API anahtarı yok

Bunlardan BİRİNİ TERMİNALDE çalıştır (oturumun içinde değil), sonra yeni bir oturum başlat ve
sorusunu sor.

Cloudflare dokümanları (sahne demosu):

```bash
claude mcp add --transport http cloudflare-docs https://docs.mcp.cloudflare.com/mcp
```

```
Bir Cloudflare Worker için cron tetikleyicisi nasıl kurulur? Canlı dokümandan cevapla.
```

Context7 (her kütüphane için taze doküman):

```bash
claude mcp add --transport http context7 https://mcp.context7.com/mcp
```

```
Context7 kullanarak, Express ile bir klasördeki statik dosyaları nasıl sunarım?
```

DeepWiki (herkese açık her GitHub deposuna soru sor):

```bash
claude mcp add --transport http deepwiki https://mcp.deepwiki.com/mcp
```

```
DeepWiki kullanarak, anthropics/claude-code deposu plugin'ler hakkında ne diyor?
```

Çalışırken araç çağrılarını göster: cevap hafızadan değil, canlı bir kaynaktan geliyor. `/mcp`
neyin bağlı olduğunu listeler, `claude mcp list` aynısını terminalden yapar.

## Salon için egzersiz

Beş dakika:

1. Hiçbir şey kurmadan önce ekran görüntüsünü iste ve gelen "yapamam" cevabını oku.
   Plugin'lerin var olma sebebi tam olarak o cevap.
2. `/plugin` panelini aç, Discover sekmesinden bir şey kur ve neler eklediğini not al
   (komutlar, ajanlar, MCP sunucuları) ve context maliyetine bak.
3. Yeni bir oturum başlat ve aynı soruyu tekrar sor.
4. Terminalde kalmayı tercih ediyorsan: C seçeneğinden bir MCP sunucusu ekle ve sorusunu sor.
   Sonra `claude mcp remove <name>` ile kaldır.

Eve götürülecek pratik kural: skill = senin kendi tarifin, plugin = başkasının paketlenmiş
tarifi, MCP = dış dünyaya açılan kapı.

## Olmazsa göster

`plugin.md` dosyasını aç ve marketplace'lerin üç katmanını anlat, sonra `mcp.md` dosyasını açıp
üç `claude mcp add` satırını oku. İkisinin de projeksiyonda işe yaraması için internete
ihtiyacı yok.
