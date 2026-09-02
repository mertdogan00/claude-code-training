# Skill'ler: günlük hayattan dört bitmiş örnek

Bir skill aslında bir klasördür: içinde `SKILL.md` (yönergeler), iş gerektiriyorsa `scripts/`
(çalıştırılabilir yardımcılar) ve `references/` (skill'in okuduğu şablonlar ve kurallar) bulunur.
Aşağıdaki dördü tamamlanmış ve kurulmaya hazır; her biri muhtemelen her hafta karşına çıkan bir
işi çözüyor.

| Skill | Günlük hayattan anı | Yanında getirdikleri |
|---|---|---|
| [pdf-summarizer](pdf-summarizer/) | gelen kutuna 40 sayfalık bir PDF düşer | `scripts/extract_text.py` |
| [meeting-notes](meeting-notes/) | toplantı sonrası darmadağın notlar | `references/template.md` |
| [folder-report](folder-report/) | "bu klasörde NE var ki?" | `scripts/scan.py` |
| [social-post](social-post/) | tek duyuru, üç platform | `scripts/check_limits.js`, `references/platform-notes.md` |

## Birini kur (bu akşam BİR tanesini seç ve gerçekten çalıştır)

**Bu projeye** (Claude Code bu depoda çalışırken kullanılabilir): depo kökünden Claude Code'a
kendi cümlelerinle söyle, mesela şöyle:

> skills/pdf-summarizer klasörünü bu projeye skill olarak kur.

Klasörü `.claude/skills/` içine kopyalar ve `/pdf-summarizer` artık `/` listesinde görünür.

**Her yerde kendin için** (her projede kullanılabilir): skill klasörünü onun yerine kendi
kullanıcı skill dizinine kopyala:

```bash
mkdir -p ~/.claude/skills
cp -r skills/pdf-summarizer ~/.claude/skills/
```

Claude Code'u yeniden başlat (ya da `/reload-plugins` çalıştır), `/` yaz, listede karşında.

## Sonra kullan

- `/pdf-summarizer some-report.pdf`
- `/meeting-notes` yaz, sonra ham notlarını yapıştır
- `/folder-report ~/Downloads` (kendini hazırla)
- `/social-post` yaz, sonra duyuru metnini yapıştır

## Kendi skill'ini yaz

İhtiyacına en yakın olandan başla, klasörün adını değiştir, `SKILL.md` dosyasını sade
cümlelerle yeniden yaz: ne zaman devreye girecek, adımlar neler, çıktı nasıl görünecek, neyi
YAPMAYACAK. Bir adım mekanikse (klasörleri gezmek, metin çıkarmak, karakter saymak) onu
`scripts/` içine koy ve skill'in çağırmasını sağla; yönergeler karar verir, script'ler ağır işi
yapar. Sunumdaki iki motor da burada temsil ediliyor: `scan.py` ve `extract_text.py` Python,
`check_limits.js` Node, `meeting-notes` ise sadece metin şekillendiren bir skill'in hiçbir
script'e ihtiyaç duymadığını gösteriyor.
