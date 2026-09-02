---
name: folder-report
description: Bir klasörde ne olduğunu sade Türkçe ile raporlar - kullanıcı bir dizinde ne var, ne kadar yer kaplıyor ya da son zamanlarda ne değişti diye sorduğunda kullan
---

# Klasör Raporu

Bir klasör yoluyla çağrıldığında (varsayılan: bulunduğun dizin):

1. Önce yanında gelen tarayıcıyı çalıştır; klasörleri gezme işini senin yerine o yapar:

   ```bash
   python3 scripts/scan.py <folder>
   ```

   JSON basar: boyutlarıyla birlikte dosya türü dağılımı, en büyük 5 dosya, en son değişen 5
   dosya ve bir uyarı listesi (0 bayt dosyalar, 50 MB üstü dosyalar, adı bir sırrı andıran her
   şey). `node_modules`, `.git` ve gizli önbellekleri kendiliğinden atlar.

2. O JSON'u bir ekranı geçmeyen Türkçe bir rapora çevir:
   - **Ne var:** tür dağılımı tek bir okunur paragrafta, boyutlar insan diliyle
   - **En büyük 5** ve **En son değişen 5** iki kısa liste hâlinde
   - **Dikkat:** tarayıcıdan gelen her uyarı, her biri bir satır; hiç yoksa "temiz" de
3. Tek satırla bitir: adlardan ve türlerden yola çıkarak bu klasörün görünen AMACI; bunun bir
   tahmin olduğunu açıkça belirt ("tahmin").

Amaç tahmini için gereken minik metin başlıkları dışında dosya içeriklerini asla açma. Script
çalışmazsa (python3 yoksa) kendi dizin listeleme araçlarına geç ve aynı rapor biçimini üret.
