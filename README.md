# Claude Code Eğitimi

**Claude Code eğitiminin** (2 Eylül 2026, Orion Tekmer, Ankara) uygulama deposu. Eğitmen:
Framepx kurucu ortağı [Mert Doğan](https://github.com/mertdogan00).

Kod bilmenize gerek YOK. Bu depo, sahnede kullanılan çalışma alanının aynısı: klonlayın,
numaralı bir egzersiz klasörüne girin, yazma işini Claude Code yapsın, siz düşünün.

## Hızlı başlangıç

```bash
# 0. Node 24 ya da daha yenisi: https://nodejs.org (işletim sistemine göre ayrıntılar docs/setup/)
# 1. Claude Code'u kur
npm install -g @anthropic-ai/claude-code

# 2. bu depoyu klonla ve içine gir
git clone https://github.com/mertdogan00/claude-code-training.git
cd claude-code-training

# 3. başlat
claude
```

Gereken tek şey **Node 24 veya üstü** ile **Claude Code**; alet çantası bu kadar. En kolay
yol bir Claude **Pro** planı ya da üstü; kullandıkça öde API faturalandırması da olur
([fiyatlar](https://claude.com/pricing)). `showcase/` altındaki demo uygulamalar için her
birinde bir kez `npm install` yeterli, başka bir şey gerekmiyor; ayrıntılar `docs/setup/`
klasöründe.

## Beş durak

Eğitim, beş durağı ve yedi uygulaması olan tek bir yolculuk. 1. durak sadece sohbet;
2. duraktan sonra her uygulamanın `exercises/` altında kendi numaralı klasörü var ve her
klasör, ister etkinlikte ister evde, kopyala-yapıştır yapabileceğiniz bir SAHNEDE bloğuyla
açılıyor:

| Durak | Sahnede | Bu depoda |
|---|---|---|
| 1 · Büyük Resim | yapay zeka nereden geldi, neden Claude Code | (sadece anlatım) |
| 2 · Kurulum | terminalin temelleri, Git ve GitHub, 3 sistemde kurulum, ilk açılış | `exercises/01-install/` + `exercises/02-first-launch/` (+ `docs/setup/`) |
| 3 · Temel Kavramlar | prompt, token, context, CLAUDE.md, komutlar, canlı öncesi-sonrası | `exercises/03-commands/` + `exercises/04-claude-md/` (+ `commands.md`) |
| 4 · Genişletme | skill, plugin, MCP | `exercises/05-skill/` + `exercises/06-plugin-mcp/` (+ `skills/`) |
| 5 · Canlı Kurulum | salon Satış Analitik Paneli, Neon Breaker ve Salon Sohbeti arasında oy veriyor, tek bir prompt bir ajan takımı kuruyor, uygulama doğuyor ve `node server.js` ile çalışıyor | `exercises/07-build/` + `prompts/apps/` (hazır hali: `showcase/`) |

## Harita

| Yol | Nedir |
|---|---|
| `PRESENTER.md` | sahne yönlendirme metni: hangi dosya, hangi komut, hangi anda |
| `CLAUDE.md` | proje hafızası: Claude'un BU depoda nasıl davrandığı (öğretici örnek olarak notlandı) |
| `docs/setup/` | kurulum rehberleri: macOS · Windows · Linux |
| `exercises/` | her uygulama için bir tane olmak üzere YEDİ numaralı klasör: `01-install/`, `02-first-launch/`, `03-commands/`, `04-claude-md/`, `05-skill/`, `06-plugin-mcp/`, `07-build/`. Her README kopyala-yapıştır bir SAHNEDE bloğuyla açılır, 2 ila 4 hazır seçenek sunar ve canlı deneme tutmazsa ne gösterileceğiyle biter |
| `prompts/` | yapıştırmaya hazır prompt kütüphanesi |
| `prompts/apps/` | takım kuran ÜÇ mega-prompt: her biri Claude Code'a lider ve işçi alt ajanlar doğurtur, önce bir sözleşme yayımlatır, en sonda QA yaptırır (Satış Analitik Paneli, Neon Breaker, Salon Sohbeti). Tek ve sade bir yığın: tek klasör, Express, gömülü `node:sqlite`, düz HTML, CSS ve JavaScript, derleme adımı yok |
| `showcase/` | AYNI promptların gerçek ajan takımlarınca kurulmuş hali: kod, takımı iş başında gösteren bir BUILD-LOG.md ve kurulum sırasında yakalandıysa ekran görüntüleri; `npm install` sonra `node server.js`. İçeride ne var, `showcase/README.md` anlatıyor |
| `data/` | panel promptunun okuduğu örnek satış CSV'si |
| `skills/` | betikleri ve şablonlarıyla DÖRT bitmiş skill (seçim rehberi `skills/README.md` içinde) |
| `commands.md` | komut kartı: terminalin temelleri + üç kademede 15 slash komutu |
| `resources.md` | resmi bağlantılar: dokümanlar, marketler, MCP, modeller |
| `after-training.md` | etkinlik sonrası yolunuz: önce neyi kuracaksınız |

## Eğitimden sonra bu depoyu nasıl kullanırsınız

1. `CLAUDE.md` dosyasını okuyun (kısadır ve işin bütün sırrı orada).
2. Kendi bilgisayarınızda önce `exercises/02-first-launch/`, sonra `exercises/04-claude-md/`
   adımlarını tekrarlayın. CLAUDE.md'nin yarattığı farkı bir kez de kendi ekranınızda görün.
3. `skills/` klasöründen bir skill kurun (`skills/README.md`) ve gerçek bir dosya üzerinde
   çalıştırın.
4. `prompts/apps/` içinden BİR mega-promptu yapıştırın; Claude Code'un bir takım kurmasını ve
   koca bir uygulamanın doğuşunu izleyin; `npm install` sonra `node server.js` ile çalıştırıp
   http://localhost:3000 adresini açın; ardından tek bir cümlelik istekle bir özelliği
   değiştirin. (Ya da aynı promptların ajan takımlarınca kurulmuş hallerine, her birinin
   BUILD-LOG.md dosyasıyla birlikte `showcase/` altından göz atın.)

Küçük başlayın, parça parça büyütün.
