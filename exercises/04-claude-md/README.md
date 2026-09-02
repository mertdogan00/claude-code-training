# 4/7 · Aynı soru, iki cevap

Akşamın küçük numarası şu: daha iyi cevabı daha iyi kelimeler bularak almıyorsun, kuralları
bir dosyaya yazarak alıyorsun. Üç egzersiz, her seferinde aynı akış. Sor, `rules.md`
dosyasını `CLAUDE.md` yap, `/clear`, AYNI soruyu tekrar sor, sonra eski haline döndür.

Her klasör kurallarını `CLAUDE.md` içinde değil, `rules.md` içinde taşıyor ve bu bilerek
böyle. Claude Code bir oturum açılır açılmaz bulduğu her `CLAUDE.md` dosyasını yüklüyor;
yani kuralları hazır duran bir klasör "önce" halini hiç gösteremezdi. Kuralları başka bir
dosya adının altında bekletmek, bu önce-sonra gösterisini mümkün kılan şeyin ta kendisi:
dosya duruyor, kurallar okunabiliyor, sadece henüz hafıza değiller. Bütün gösteri o yeniden
adlandırmada; sondaki `mv CLAUDE.md rules.md` de egzersizi kutusuna geri koyup bir sonraki
kişiye temiz bir başlangıç bırakıyor.

## SAHNEDE (kopyala-yapıştır)

### A · Yemek planı (`a-meal-plan/`)

Aşağıdaki blokların hepsi depo kökünden başlıyor.

```bash
cd exercises/04-claude-md/a-meal-plan
claude
```

```
Bu klasördeki menu.txt dosyasından bir haftalık yemek planı hazırla.
```

```
rules.md içindeki kuralları bu klasörün CLAUDE.md dosyasına kaydet.
```

(ya da oturumdan çık ve `mv rules.md CLAUDE.md` komutunu çalıştır)

```
/clear
```

```
Bu klasördeki menu.txt dosyasından bir haftalık yemek planı hazırla.
```

Bir sonraki denemeden önce eski haline döndür:

```bash
mv CLAUDE.md rules.md
```

### B · Tedarikçi e-postası (`b-supplier-email/`)

```bash
cd exercises/04-claude-md/b-supplier-email
claude
```

```
Bu klasördeki email.txt dosyasını oku ve bir cevap yaz.
```

```
rules.md içindeki kuralları bu klasörün CLAUDE.md dosyasına kaydet.
```

(ya da oturumdan çık ve `mv rules.md CLAUDE.md` komutunu çalıştır)

```
/clear
```

```
Bu klasördeki email.txt dosyasını oku ve bir cevap yaz.
```

Bir sonraki denemeden önce eski haline döndür:

```bash
mv CLAUDE.md rules.md
```

### C · Satış raporu (`c-sales-report/`)

```bash
cd exercises/04-claude-md/c-sales-report
claude
```

```
../../../data/sales-data.csv dosyasındaki satışları şehir şehir özetle.
```

```
rules.md içindeki kuralları bu klasörün CLAUDE.md dosyasına kaydet.
```

(ya da oturumdan çık ve `mv rules.md CLAUDE.md` komutunu çalıştır)

```
/clear
```

```
../../../data/sales-data.csv dosyasındaki satışları şehir şehir özetle.
```

Bir sonraki denemeden önce eski haline döndür:

```bash
mv CLAUDE.md rules.md
```

Üçünde de salona geçen cümle aynı: sen modeli değil, bir DOSYAYI değiştirdin.

## Salon için egzersiz

Beş dakika, her masaya bir seçenek düşsün ki sonrasında karşılaştırabilsinler:

1. Soruyu bir kez sor ve cevabı oku. Daha yargılama.
2. `rules.md` dosyasını `CLAUDE.md` yap, sonra aç ve üç kuralı yüksek sesle oku.
3. `/clear` yap, aynı soruyu bir daha sor, iki cevabı yan yana koy.
4. TEK bir kuralı değiştir (yemek planı vejetaryen olabilir, e-posta "siz" diline geçebilir,
   rapordan toplam satırı kalkabilir) ve üçüncü kez sor.
5. Dizüstünü kapatmadan önce `mv CLAUDE.md rules.md` yap ki bir sonraki kişi tertemiz bir
   "önce" hali bulsun.

## Olmazsa göster

Her klasörde `expected/before.md` ve `expected/after.md` var: aynı sorunun kurallar dosyası
olmadan ve varken alınmış cevabı. İkisini projeksiyonda yan yana aç; fark en arka sıradan
bile okunuyor.
