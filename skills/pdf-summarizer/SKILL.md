---
name: pdf-summarizer
description: Bir PDF'i Türkçe özetler - kullanıcı bir PDF yolu verip özünü, kararları ya da aksiyon maddelerini istediğinde kullan
---

# PDF Özetleyici

Kullanıcı bu skill'i bir PDF yoluyla çağırdığında:

1. Metni al. Önce yanında gelen çıkarıcıyı dene; makinede varsa `pdftotext` kullanır, yoksa
   bunu sana söyler:

   ```bash
   python3 scripts/extract_text.py <file.pdf>
   ```

   Script hiçbir çıkarıcının bulunmadığını bildirirse PDF'i kendi dosya okuman ile doğrudan oku
   (PDF'leri kendin de okuyabiliyorsun); script büyük PDF'leri ucuza getirmek için var, önüne
   set çekmek için değil.

2. Türkçe olarak şunları üret:
   - **3 cümlelik özet** (bütün belge üç cümlede)
   - **Karar/aksiyon listesi** (bulunan her karar ya da aksiyon maddesi, her biri bir satır)
   - **Sayılar** (akılda kalması gereken rakamlar, tutarlar ve tarihler)
3. PDF 20 sayfadan uzunsa önce bölüm bölüm özetle, sonra hepsini birleştir.
4. Tek satırla bitir: kullanıcı bu belgeyle büyük ihtimalle NE yapmalı.

Bütün çıktıyı bir ekranı geçmeyecek kadar kısa tut; kullanıcı yeniden yazılmış bir metin değil,
özü istiyor.
