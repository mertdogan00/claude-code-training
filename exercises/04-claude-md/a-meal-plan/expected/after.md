# Örnek çıktı · SONRA (rules.md dosyası CLAUDE.md olarak yeniden adlandırıldıktan sonra)

Aynı model, aynı soru, farklı davranış: tablo geldi, haftalık maliyet satırı geldi, hiçbir
ana yemek tekrar etmiyor. Diskteki bir dosyadan başka değişen hiçbir şey yok.

Soru (önceki denemeyle birebir aynı):

```
Bu klasördeki menu.txt dosyasından bir haftalık yemek planı hazırla.
```

Cevap:

> | Gün | Ana yemek | Yanında |
> |---|---|---|
> | Pazartesi | Kırmızı mercimek çorbası | Yoğurt, ekmek |
> | Salı | Fırında tavuk but | Patates, mevsim sebzesi |
> | Çarşamba | Nohut yemeği | Bulgur pilavı |
> | Perşembe | Kıymalı makarna | Beyaz peynir rendesi |
> | Cuma | (dışarıda) | - |
> | Cumartesi | Karnıyarık | Pirinç pilavı, yoğurt |
> | Pazar | Menemen | Ton balıklı salata |
>
> **Tahmini haftalık maliyet: 1.150 TL** (2 kişilik, evde zaten olan malzemeler düşülerek).
>
> Not: hiçbir ana yemek hafta içinde tekrar etmiyor; kereviz ve sakatat kullanılmadı.

Üç kural, üç görünür sonuç: tablo, maliyet satırı, tekrarsız hafta.
