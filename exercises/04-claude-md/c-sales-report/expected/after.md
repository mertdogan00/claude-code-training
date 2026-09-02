# Örnek çıktı · SONRA (rules.md dosyası CLAUDE.md olarak yeniden adlandırıldıktan sonra)

Aynı model, aynı soru, farklı davranış: tablo geldi, satırlar en büyükten küçüğe sıralandı,
para TL olarak binlik ayraçla yazıldı ve toplam satırı toplamayı okuyucu yerine kendisi yaptı.

Soru (önceki denemeyle birebir aynı):

```
../../../data/sales-data.csv dosyasındaki satışları şehir şehir özetle.
```

Cevap:

> | Şehir | Ciro | Pay |
> |---|---|---|
> | İzmir | 104.480 TL | %23,5 |
> | Ankara | 99.510 TL | %22,3 |
> | İstanbul | 92.130 TL | %20,7 |
> | Bursa | 78.830 TL | %17,7 |
> | Antalya | 70.440 TL | %15,8 |
> | **Toplam** | **445.390 TL** | **%100** |
>
> 1-28 Ağustos 2026, 120 satış satırı.

Yukarıdaki rakamlar `data/sales-data.csv` dosyasının gerçek toplamları, yani aynı zamanda bir
kontrol noktası: canlı cevap bunlarla uyuşmuyorsa, salona "bunu siz nasıl doğrulardınız?"
diye sormanın tam zamanıdır.
