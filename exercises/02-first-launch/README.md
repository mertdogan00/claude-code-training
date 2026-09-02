# 2/7 · İlk açılış: claude, /help, ilk cümle

Claude Code'u ilk kez aç, ona gerçek bir soru sor ve kendi başına gidip bir dosyayı okuyuşunu
izle. Kod yok. Aşağıdaki üç ilk cümleden BİRİNİ seç; üçü de bu klasörden çalışır.

## SAHNEDE (kopyala-yapıştır)

Hangi seçeneği alırsan al, depo kökünden buradan başla:

```bash
cd exercises/02-first-launch
claude
```

Sonra etrafa bir bak:

```
/help
```

### A · Kafe notu (en garantisi)

```
Bu klasördeki notes.txt dosyasını oku ve bu kişinin yapay zekadan ne beklediğini üç cümleyle anlat.
```

### B · Gerçek satış verisi üzerine bir soru

```
../../data/sales-data.csv dosyasını oku; en çok satan şehri ve toplam ciroyu söyle.
```

### C · Depo kendini anlatıyor

```
../../README.md dosyasını oku ve bu deponun ne işe yaradığını üç cümleyle anlat.
```

Hangi seçenek çalıştıysa, halkayı aynı iki komutla kapat:

```
/context
```

```
/clear
```

`/context` masanın kendisi: ne kadar yer kaldığını ve yeri neyin kapladığını gösterir.
`/clear` ise sohbeti siler, dosyalara dokunmaz.

### Bonus · Bu dizüstünü telefondan çalıştır

Numarasız ve zorunlu değil. Telefonda Claude uygulamasını aç, bu makineye bağlan ve telefondan
küçük bir iş gönder: "bu klasördeki dosyaları listele ve bu klasörün ne işe yaradığını söyle".
Projeksiyonda dizüstü çalışırken telefonu havaya kaldır. Anlatılacak şey tek cümle: işi yapan
makine, elindeki makine olmak zorunda değil.

## Salon için egzersiz

Beş dakika:

1. Bu klasöre `cd` ile gir ve `claude` yaz; tarayıcı açılırsa giriş yap.
2. `/help` yaz ve yavaşça kaydır. Kimse burayı ezberlemiyor.
3. A, B ya da C seçeneğini yapıştır ve çıkan cevabı yanındakine sesli oku.
4. `/context` yaz, sayıyı bul; sonra `/clear` yaz ve sayının düşüşünü izle.

Ders 3. adımda saklı: NE istediğini söyledin, NASIL yapılacağını hiç anlatmadın. Dosyayı
açmaya Claude kendisi karar verdi.

## Olmazsa göster

`expected/a.md`, `expected/b.md` ya da `expected/c.md` dosyasını aç: her seçenek için önceden
alınmış, projeksiyona hazır birer örnek cevap.
