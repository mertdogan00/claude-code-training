# Komut kartı: sahnede ne yazılıyor ve bilmeye değer 15 komut

## Terminalin temelleri (bu akşam dördü yeter)

```bash
pwd          # neredeyim
ls           # bu klasörde ne var
cd <folder>  # bir klasörün içine gir
cd ..        # bir üst klasöre çık
```

## Claude Code'un yaşam döngüsü

```bash
claude               # başlat (içinde olduğun klasör = çalışma alanı)
claude --continue    # son sohbete kaldığı yerden devam et
```

## Üç kademede 15 slash komutu

### 1. kademe · mutlaka bilinmesi gerekenler (bu akşam bunları kullanacaksınız)

```
/help      # bütün komutların listesi
/init      # bu projenin CLAUDE.md dosyasını Claude senin için yazsın
/clear     # sohbeti sıfırlar (context de sıfırlanır!)
/compact   # sohbeti özetleyip yer açar, iş kaldığı yerden devam eder
/model     # modeli değiştir (hızlı mı, ağır mı) ve varsayılan olarak kaydet
```

### 2. kademe · bilinse iyi olur (ilk hafta)

```
/resume    # daha önceki bir sohbete geri dön
/memory    # CLAUDE.md dosyalarını oturumun içinden düzenle
/rewind    # HEM dosyaları HEM sohbeti bir kontrol noktasına geri alır
/plugin    # marketplace'ler: gez, kur, yönet
/mcp       # bağlı MCP sunucularını gör ve yönet
```

### 3. kademe · arada bir (cepte dursun)

```
/context      # masanın ne kadarı dolu, neyin yer kapladığını gösterir
/usage        # bu iş ne tutuyor, paketin sınırları nerede
/permissions  # Claude neyi sormadan yapabilir
/doctor       # kurulum kontrolü: sorunu bulur ve düzeltir
/export       # sohbeti metin olarak dışarı aktar
```

Ayrıca: `/<skill-name>` kurulu herhangi bir skill'i çalıştırır, `Shift+Tab` ise izin
modları arasında gezdirir.

## İki satırda Git (sahnede gösterilen depo mantığı)

```bash
git clone <url>   # projeyi kendi bilgisayarına indir
git pull          # sonrasında gelen güncellemeleri çek
```

## Aklınızda kalsın

Context yakıt göstergesi gibidir: tükenip sıfırlandığında asistanın hatırladığı tek şey
DOSYALARA yazılmış olanlardır (`CLAUDE.md`, kendi notlarınız). Yazın bir kenara; oturumlar
fani, dosyalar kalıcı.
