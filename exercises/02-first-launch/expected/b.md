# Örnek çıktı · B seçeneği (sales-data.csv)

Daha önceki bir denemeden alınmış örnek çıktı. Canlı cevabın kelimeleri farklı olacak; önemli
olan cevabın şekli.

Prompt:

```
../../data/sales-data.csv dosyasını oku; en çok satan şehri ve toplam ciroyu söyle.
```

Cevap:

> Dosyada 1-28 Ağustos 2026 arasına ait 120 satış satırı var (sütunlar: date, product,
> category, qty, unit_price, city).
>
> | Şehir | Ciro (TL) |
> |---|---|
> | İzmir | 104.480 |
> | Ankara | 99.510 |
> | İstanbul | 92.130 |
> | Bursa | 78.830 |
> | Antalya | 70.440 |
>
> En çok satan şehir **İzmir** (104.480 TL), toplam ciro ise **445.390 TL**. Ciroyu tek
> başına taşıyan kategori Electronics (275.500 TL); ürün bazında lider Coffee Maker
> (153.600 TL).

Sahne notu: yukarıdaki sayılar `data/sales-data.csv` dosyasının gerçek toplamları. Canlı cevap
bunlarla uyuşmazsa, salona "siz olsanız bunu nasıl kontrol ederdiniz?" diye sormak için tam
zamanı.
