# Proje hafızası (CLAUDE.md)

<!-- ÖĞRETİCİ NOT: Claude Code bu projede her istekte bu dosyayı kendiliğinden okur.
     Aşağıdaki her satır dokümantasyon değil, Claude'a verilmiş bir TALİMATTIR. Sahnede
     gösterilen "proje tabanlı hafıza" budur: buradaki bir satırı değiştirin, Claude'un bu
     depodaki davranışı kalıcı olarak değişsin, her promptta kendinizi tekrar etmeyin. -->

## Kiminle çalışıyorsun

Kullanıcı geliştirici olmayabilir. Ne yaptığını sade bir Türkçeyle, adım adım ve yapmadan
önce anlat. Bir komutun ne işe yaradığını bildiğini asla varsayma.

## Ev kuralları

- Türkçe cevap ver; kod yorumlarını İngilizce yaz.
- Dosya oluşturmadan önce NE oluşturacağını ve NEDEN oluşturduğunu birer kısa cümleyle söyle
  (takım kurulumlarında yayımladığın sözleşme ile BUILD-LOG.md bu açıklamanın yerine geçer).
- İşi gören en basit çözümü seç; istenmedikçe framework kullanma (bir yığını adıyla belirten
  mega-prompt zaten o isteğin ta kendisidir).
- Bir işi bitirdikten sonra sonucun tek komutla nasıl doğrulanacağını göster.

## Bu depo

Burası bir eğitim çalışma alanı. Egzersizler `exercises/` altında, her uygulama için bir
tane olmak üzere yedi numaralı klasörde duruyor; her birinin kendi amacını anlatan bir
README'si var. Kullanıcı bir egzersizi sorduğunda bağlam için o klasörün README'sini oku;
kullanıcı istemedikçe adımlarını çalıştırma, dosyalarını yeniden adlandırma.
`exercises/04-claude-md` içinde, istenmedikçe `rules.md` dosyasını okuma.
