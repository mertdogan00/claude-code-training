# 5/7 · Skill kur

Skill, defalarca yazdığın bir promptu, kendi betiğini de yanında getiren bir slash komutuna
çevirir. `skills/` altında bitmiş dört tane duruyor. Sahnede BİR tanesini kur,
`exercises/05-skill/samples/` içindeki eşleşen örnek üzerinde çalıştır ve salon iki sütun
arasındaki farkı kendi gözüyle okusun. Bu dosyadaki her yol DEPO KÖKÜNDEN yazıldı; moladan
sonra oturum zaten orada oluyor.

## SAHNEDE (kopyala-yapıştır)

Önce kurulum, DEPO KÖKÜNDEN, Claude Code'un içinde (aynı cümle dördü için de çalışır, sadece
klasör adını değiştir):

```
skills/pdf-summarizer klasörünü bu projeye skill olarak kur.
```

Klasörü `.claude/skills/` içine kopyalar. `/` yaz ve yeni komutun listeye düştüğünü izle.
Sadece bu projede değil her projede dursun istiyorsan oturumdan çık ve şunu çalıştır:

```bash
mkdir -p ~/.claude/skills
cp -r skills/pdf-summarizer ~/.claude/skills/
```

Sonra aşağıdan bir seçenek seç. Her biri AYNI işi iki kere gösteriyor: her seferinde
yazacağın uzun prompt ve onun yerine geçen tek komut.

### A · pdf-summarizer (`exercises/05-skill/samples/sample.pdf` üzerinde)

ÖNCESİ, her belge için tekrar tekrar yazacağın prompt:

```
exercises/05-skill/samples/sample.pdf dosyasını oku ve bana Türkçe olarak şunları ver: belgenin tamamının üç cümlelik özeti, sonra her kararı ve aksiyonu tek satırlık bir liste hâlinde, sonra akılda tutmaya değer rakamlar, tutarlar ve tarihler. Tek ekranı geçmesin ve bu belgeyle muhtemelen ne yapmam gerektiğini söyleyen tek bir satırla bitir.
```

SONRASI:

```
/pdf-summarizer exercises/05-skill/samples/sample.pdf
```

### B · meeting-notes (`exercises/05-skill/samples/meeting.txt` üzerinde)

ÖNCESİ:

```
exercises/05-skill/samples/meeting.txt dosyasını oku ve düzgün bir Türkçe toplantı tutanağına çevir: üç cümlelik özet, kararlar numaralı ve her biri tek cümle, iş, sahibi ve tarih sütunlarından oluşan bir aksiyon tablosu (notlarda geçmeyen yere soru işareti koy) ve açık konular. Asla bir sahip ya da tarih uydurma. En acil takip maddesiyle bitir.
```

SONRASI:

```
/meeting-notes exercises/05-skill/samples/meeting.txt
```

### C · folder-report (bu deponun üzerinde)

ÖNCESİ:

```
Bu depoyu gez, node_modules ve .git klasörlerini atla ve içinde ne olduğunu bana Türkçe anlat: dosya türleri ve boyutları tek bir okunur paragrafta, en büyük beş dosya, en son değişen beş dosya ve endişe verici ne varsa (boş dosyalar, devasa dosyalar, sır gibi duran her şey). Bu klasörün ne işe yaradığına dair tahmininle bitir ve tahmin olduğunu belirt.
```

SONRASI:

```
/folder-report .
```

### D · social-post (tek bir duyuru üzerinde)

ÖNCESİ:

```
Bunu Türkçe üç sosyal medya paylaşımına çevir: ilk satırı kanca olan, dört ila altı kısa paragraflık, en fazla üç etiketli ve bir soruyla kapanan bir LinkedIn metni; satır aralarıyla yazılmış iki üç cümlelik, son satırında beş etiket olan bir Instagram metni; ve 280 karakterin altında, etiketsiz bir X metni. Verdiğim bilgileri aynen koru, hiçbir şey uydurma. Metin: Bereket Kahve'nin on beşinci şubesi 20 Eylül'de Ankara Çayyolu'nda açılıyor; açılış haftası boyunca tüm filtre kahveler yarı fiyatına.
```

SONRASI:

```
/social-post
```

sonra duyuruyu yapıştır:

```
Bereket Kahve'nin on beşinci şubesi 20 Eylül'de Ankara Çayyolu'nda açılıyor; açılış haftası boyunca tüm filtre kahveler yarı fiyatına.
```

## Salon için egzersiz

Beş dakika:

1. Yukarıdaki cümleyle bir skill kur. Nereye düştüğüne bak (`.claude/skills/`).
2. `/` yaz ve bul. "Kurulum töreni" dediğimiz şey bundan ibaret.
3. `exercises/05-skill/samples/` içindeki eşleşen örnekte ya da kendi dosyanda çalıştır.
4. `skills/<name>/SKILL.md` dosyasını aç ve yüksek sesle oku. Kod yok, düz cümleler var.
   İşin can alıcı yeri burası: bunlardan birini bu akşam sen de yazabilirsin.

## Olmazsa göster

`exercises/05-skill/expected/` klasöründe her skill için bir örnek çıktı duruyor:
`pdf-summarizer.md`, `meeting-notes.md`, `folder-report.md`, `social-post.md`. Eşleşen dosyayı
aç ve SONRASI sütununu projeksiyondan oku.
