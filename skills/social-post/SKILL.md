---
name: social-post
description: Tek bir Türkçe metni üç platforma hazır gönderiye çevirir - kullanıcı bir duyuru, fikir ya da haber verip LinkedIn, Instagram ve X sürümlerini istediğinde kullan
---

# Sosyal Medya Gönderisi

Bir kaynak metinle çağrıldığında (yapıştırılmış ya da bir dosya yolu):

1. Önce TEK bir ana mesajı çıkar; onu tek cümleyle geri söyle.
2. `references/platform-notes.md` içindeki platform kurallarına uyarak, her biri açıkça
   etiketlenmiş üç sürüm üret:
   - **LinkedIn:** 4-6 kısa paragraf, ilk satır kanca, en fazla 3 hashtag, sonda bir soru.
   - **Instagram:** satır aralı 2-3 cümle, daha sıcak bir ton, son satırda 5 hashtag.
   - **X:** en fazla 280 karakter, en vurucu açı, hashtag yok.
3. Hepsi Türkçe; kullanıcının verdiği bilgileri birebir koru, hiçbir şey uydurma; kaynağın
   kendisi samimi bir dille yazılmadıysa emoji kullanma.
4. Göz kararı değil, doğrula: her taslağı geçici bir dosyaya kaydet ve kesin sonuç veren
   denetleyiciyi çalıştır, her FAIL'i sonucu göstermeden önce düzelt:
   `node scripts/check_limits.js x draft-x.txt` (`linkedin` / `instagram` için de aynısı).
5. Şununla bitir: "Hangisini açalım?" Böylece kullanıcı birini seçip üzerinde çalışabilir.
