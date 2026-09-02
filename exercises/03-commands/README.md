# 3/7 · Komut kartı

Altı komut bütün akşamı taşıyor, iki tanesi de salonu şaşırtmak için var. Zaten açık olan
oturumda yaz; kurulacak bir şey de yok, geri alınacak bir şey de.

## SAHNEDE (kopyala-yapıştır)

### A · Altısı, bu sırayla

```
/help
```
Bütün komutların listesi, ezberlemeye gerek yok.

```
/context
```
Masanın ne kadarı dolu, neyin yer kapladığını gösterir.

```
/clear
```
Sohbeti sıfırlar, dosyalara dokunmaz.

`/clear` sohbeti boşalttığı için `/compact` komutunun özetleyecek bir şeyi kalmaz. Önce üstünde
durmayacağın bir soru sor, sonraki komutun elinde gerçek malzeme olsun:

```
../../commands.md dosyasını üç cümleyle özetle.
```

```
/compact
```
Sohbeti özetleyip yer açar, iş kaldığı yerden devam eder.

```
/model
```
Hangi model çalışacak (hızlı mı, ağır mı), seçiciyi açıp kapatman yeter.

```
/permissions
```
Claude neyi sormadan yapabilir, sınırları burada görürsün.

`/permissions` sonrası söylenecek cümle: "dosyalarımı görüyor mu?" sorusunun dürüst cevabı bu
ekran.

### B · Hava atmalık iki satır

```
/rewind
```
Şöyle anlat: bu, HEM sohbeti HEM dosyaları bir kontrol noktasına geri götüren geri alma
düğmesi. Kontrol noktası listesini aç, parmakla göster, hiçbirini seçmeden kapat.

```
/resume
```
Şöyle anlat: oturumlar buharlaşmıyor. Listeden geçen haftanın sohbetini seç, bağlamıyla
birlikte geri geliyor. Listeyi aç, bir ekran kaydır, escape ile çık.

### C · Kartın kendisi projeksiyonda

```bash
cat ../../commands.md
```

Ya da `commands.md` dosyasını doğrudan editörde aç: terminalin temel taşları, oturum yönetimi
komutları ve üç kademede 15 slash komutu. İnsanların evine götürdüğü sayfa bu.

## Salon için egzersiz

Beş dakika, 2/7'deki oturumun içinde:

1. A seçeneğindeki altı komutu sırayla çalıştır ve her birinin ne gösterdiğini oku.
2. `/context` üzerinde dur, yüzdeyi bul. Bir kenara not et.
3. `/clear` sonrası üstünde durmayacağın bir soru sor
   (`../../commands.md dosyasını üç cümleyle özetle.`), sonra `/compact` ve tekrar `/context`
   çalıştırıp iki sayıyı karşılaştır.
4. `commands.md` dosyasını aç ve bu hafta SENİN kullanacağını düşündüğün üç komutu işaretle.

## Olmazsa göster

`../../commands.md` dosyasını projeksiyonda aç ve üç kademeyi tek tek sesli olarak gez.
İçindeki hiçbir şey çalışan bir terminal istemiyor.
