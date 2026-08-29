# Uygulama mega-promptları

Her dosya TEK ATIMLIK bir reçetedir: sıfır kurulu Claude Code'a olduğu gibi yapıştır, uygulama
sıfırdan doğsun. Hepsi aynı iskeleti öğretir:

**ekip talimatı** (ürün yöneticisi → backend → frontend → veri → test; rolleri sahnede izlersin)
→ **iş tanımı** → **teknik çerçeve** (Node yerleşikleri + node:sqlite, npm paketi yok, `npm run
dev`) → **madde madde özellikler** → **kalite çıtası** → **bitiş tanımı** (bitti demenin şartı).

| Prompt | Ne çıkar | Kime iyi gelir |
|---|---|---|
| [veri-dashboard.md](veri-dashboard.md) | CSV/Excel verisinden analizli satış paneli + içgörü kutusu | iş dünyası, raporcu herkes |
| [refleks-oyunu.md](refleks-oyunu.md) | skor tablolu tarayıcı oyunu | eğlence + oynanış mantığı |
| [stok-takip.md](stok-takip.md) | kritik eşik uyarılı stok defteri | dükkan, atölye, depo |
| [randevu-defteri.md](randevu-defteri.md) | haftalık takvim + çakışma koruması | kuaför, klinik, danışman |
| [harcama-takibi.md](harcama-takibi.md) | ay sonu tahminli kişisel bütçe | öğrenci, ev bütçesi |
| [qr-menu.md](qr-menu.md) | müşteri + işletme yüzlü kafe menüsü | kafe, restoran |

Eğitimde salon BİRİNİ oylar ve sahnede sıfırdan yaparız; diğer beşi ev ödevidir: aynı akşam
birini seç, yapıştır, izle.

Kendi mega-promptunu yazarken şablon: NE (tek cümle iş) · EKİP (roller) · ÇERÇEVE (dosyalar,
araçlar) · ÖZELLİKLER (numaralı) · ÇITA (kalite) · BİTİŞ (kanıt şartı).
