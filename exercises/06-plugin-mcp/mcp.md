# MCP sunucusu bağlamak (adım adım, herkese açık üç seçenek)

MCP (Model Context Protocol), Claude Code'un DIŞARIDAKİ sistemlerle konuşma yolu. Skill,
Claude'un nasıl davrandığını değiştirir; MCP sunucusu ise ona uzanabileceği yeni bir YER verir:
bir servis, bir veritabanı, canlı dokümantasyon.

Aşağıdaki üç seçenek de **herkese açık ve API anahtarı istemiyor**; BİRİNİ seç, komutunu
çalıştır, bitti.

## Seçenek 1: Cloudflare dokümanları (sahne demosu)

Cloudflare platformunun tamamı için canlı resmî dokümantasyon:

```bash
claude mcp add --transport http cloudflare-docs https://docs.mcp.cloudflare.com/mcp
```

Sonra sor:

> Bir Cloudflare Worker için cron tetikleyicisi nasıl kurulur? Canlı dokümandan cevapla.

## Seçenek 2: Context7 (her kütüphane için taze doküman)

Binlerce kütüphane ve framework için güncel, sürüme özel dokümantasyon (anahtarsız çalışıyor,
temel hız sınırlarıyla; context7.com'dan alınan ücretsiz anahtar sınırları yükseltiyor):

```bash
claude mcp add --transport http context7 https://mcp.context7.com/mcp
```

Sonra sor:

> Context7 kullanarak, Express ile bir klasördeki statik dosyaları nasıl sunarım?

## Seçenek 3: DeepWiki (herkese açık her GitHub deposuna soru sor)

Ücretsiz, kayıt yok; üç aracı var (soru sor, wiki yapısını oku, içeriği oku):

```bash
claude mcp add --transport http deepwiki https://mcp.deepwiki.com/mcp
```

Sonra sor:

> DeepWiki kullanarak, anthropics/claude-code deposu plugin'ler hakkında ne diyor?

## Hangisini eklersen ekle, sonrasında

Claude Code'u yeniden başlat (ya da yeni bir oturum aç), sonra soruyu sorarken araç çağrılarını
izle: cevap artık hafızadan değil, CANLI bir kaynaktan geliyor. `/mcp` o an neyin bağlı
olduğunu listeler.

## Toparlama

```bash
claude mcp list                # neler bağlı
claude mcp remove cloudflare-docs
```

## Daha fazla sunucuyu nerede bulursun

- Resmî kayıt defteri ve şartname: https://modelcontextprotocol.io
- Cloudflare'in herkese açık sunucuları: https://developers.cloudflare.com/agents/model-context-protocol/

Merdivenin tamamı: prompt → skill (tekrar kullanılabilir) → plugin (paketlenmiş) → MCP (dış
dünya).

Bu üçü için sahne sırası, yapıştırmaya hazır hâlde, bu klasördeki `README.md` dosyasında
(C seçeneği).
