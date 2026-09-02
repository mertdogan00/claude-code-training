# Marketplace'ten plugin kurmak (adım adım)

Skill senin yazdığın bir metin dosyası; PLUGIN ise birinin paketleyip yayımladığı hazır bir
yetenek: komutlar, ajanlar, bazen komple MCP bağlantıları, saniyeler içinde kurulabiliyor.

## Plugin'ler nereden gelir (üç katman, hepsi Anthropic'in kurallarıyla)

1. **Resmî marketplace** (`claude-plugins-official`): Anthropic'in seçtiği liste, ilk açılışta
   Claude Code'a OTOMATİK ekleniyor; yani sende zaten var. Web'den https://claude.com/plugins
   adresinden ya da Claude Code içinde `/plugin` → Discover sekmesinden gezebilirsin.
2. **Topluluk marketplace'i**: Anthropic'in otomatik elemesinden geçmiş üçüncü taraf
   plugin'ler. Bir kere ekle, sonra oradan kur:

   ```
   /plugin marketplace add anthropics/claude-plugins-community
   /plugin install <plugin-name>@claude-community
   ```

3. **Herkesin marketplace'i**: içinde marketplace dosyası olan her GitHub deposu
   `/plugin marketplace add owner/repo` ile çalışır. Ekosistem bahsi de bu: araç, Anthropic'i
   beklemeden büyüyor. Sadece güvendiğin kaynakları ekle; bir plugin senin yetkilerinle
   çalışır.

## Sahnede gösterilen akış

Claude Code'un içinde:

```
/plugin
```

1. Plugin yöneticisi **Discover** sekmesinde açılır (resmî marketplace).
2. Her satır neler eklediğini (komutlar / ajanlar / MCP sunucuları) ve context maliyetini
   gösterir.
3. Birini seç, onayla, kapsamı belirle (sadece sen mi, bu proje mi).
4. Tekrar `/` yaz: yeni komutları listede, hazır.

## Sahnede kurduğumuz iki tanesi

İkisi de resmî marketplace'ten geliyor ve ikisi de salonun GÖREBİLECEĞİ bir şeyi değiştiriyor.

**playwright** ("Browser automation and end-to-end testing MCP server by Microsoft. Enables
Claude to interact with web pages, take screenshots, fill forms, click elements, and perform
automated browser testing workflows."). Yani: Microsoft'un tarayıcı otomasyonu sunucusu;
sayfalarla etkileşim, ekran görüntüsü, form doldurma, tıklama. İsteği dikkatli seç: Claude
Code bir sayfayı zaten çekip metnini okuyabiliyor, dolayısıyla asıl eksik olan şey resim ve
tıklama. Kurmadan ÖNCE bir sayfanın ekran görüntüsünü isteyip klasöre kaydetmesini söyle,
Claude alamayacağını söyleyecek. Kur, yeni oturum başlat, aynı cümleyi sor; projeksiyonda bir
tarayıcı açılırken PNG klasöre düşüyor. Ardından o sayfada bir şeye tıklamasını iste. Akşamın
en temiz öncesi-sonrası anı bu.

**superpowers** ("Superpowers teaches Claude brainstorming, subagent driven development with
built in code review, systematic debugging, and red/green TDD. Additionally, it teaches
Claude how to author and test new skills."). Yani: Claude'a fikir üretme, alt ajanlarla
geliştirme, kod incelemesi, sistemli hata ayıklama ve yeni skill yazmayı öğretiyor. Öncesinde
ve sonrasında `/` yaz: komut listesi gözle görülür şekilde doluyor. Tek kurulum, bir yığın
yeni yetenek.

İkisi için de sahnede izlenecek tam sıra, yapıştırmaya hazır hâlde, bu klasördeki `README.md`
dosyasında.

## Evde dene (5 dakika)

- `/plugin` panelini aç, işine yarar görünen bir şey kur, komutunu bir kere çalıştır.
- `/plugin list` sende ne olduğunu gösterir; kaldırmak da aynı panelden.
- Pratik kural: skill = senin kendi tarifin · plugin = başkasının paketlenmiş tarifi.
