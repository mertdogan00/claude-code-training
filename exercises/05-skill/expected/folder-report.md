# Örnek çıktı · /folder-report .

Depo kökünde daha önce yapılmış bir çalıştırmadan alınmış örnek çıktı. Depo büyüdükçe rakamlar
değişir; raporun BİÇİMİ değişmez.

```
/folder-report .
```

> **Ne var**
>
> Depoda `node_modules`, `.git` ve gizli önbellekler hariç yaklaşık 100 dosya var, toplam
> boyut 2 MB civarı. Ağırlık Markdown tarafında: 50'nin üzerinde `.md` dosyası eğitim
> metinlerini, reçeteleri ve klasör açıklamalarını taşıyor. Yanında `showcase/` altındaki üç
> uygulamanın kaynak dosyaları (`.js`, `.html`, `.css`), ekran görüntüleri (`.png`), üç
> SQLite veritabanı, bir örnek PDF ve bir örnek CSV bulunuyor.
>
> **En büyük 5**
>
> 1. showcase/neon-breaker/screenshots/01-start-desktop.png (182 KB)
> 2. showcase/neon-breaker/screenshots/02-skor-tablosu-desktop.png (163 KB)
> 3. showcase/data-dashboard/screenshots/overview-desktop.png (138 KB)
> 4. showcase/neon-breaker/screenshots/03-ayarlar-desktop.png (120 KB)
> 5. showcase/live-chat/screenshots/arama-desktop.png (92 KB)
>
> **En son değişen 5**
>
> 1. exercises/05-skill/samples/sample.pdf
> 2. exercises/04-claude-md/README.md
> 3. exercises/02-first-launch/README.md
> 4. PRESENTER.md
> 5. README.md
>
> **Dikkat**
>
> - `showcase/*/data.sqlite` dosyaları `.gitignore` kapsamında, yani başka bir makinede
>   olmayacaklar; uygulamalar ilk açılışta kendileri üretiyor.
> - Sır görünümlü dosya adı yok, anahtar ya da token bulunmadı: temiz.
>
> **Amaç (tahmin):** bir Claude Code eğitimi için hazırlanmış çalışma alanı; klasör adları
> (`exercises`, `prompts`, `skills`, `showcase`) ders akışını takip ediyor.
