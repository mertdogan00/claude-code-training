# 1/7 · Kurulum: Node, Claude Code, ilk giriş

Üç işletim sistemi, her biri için iki yol. Sahnedeki makineye uyan satırı seç, bloğu yapıştır,
sonra doğrulama satırlarını çalıştır. Rehberlerin tamamı `docs/setup/` içinde.

## SAHNEDE (kopyala-yapıştır)

### A · macOS

1. yol, npm (Node gerekir: https://nodejs.org adresindeki LTS kurulumu, Node 24 veya üstü;
makinede Homebrew varsa `brew install node` de olur):

```bash
npm install -g @anthropic-ai/claude-code
```

2. yol, kendi kurucusu (Claude Code için Node gerekmez):

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

Doğrulama:

```bash
node -v            # v24 ya da daha yenisi
claude --version
python3 --version  # isteğe bağlı, sadece skill betikleri kullanıyor
```

### B · Windows (PowerShell)

1. yol, npm (Node gerekir):

```powershell
winget install OpenJS.NodeJS.LTS
npm install -g @anthropic-ai/claude-code
```

2. yol, kendi kurucusu:

```powershell
irm https://claude.ai/install.ps1 | iex
```

Doğrulama (PATH'in tazelenmesi için YENİ bir terminalde):

```powershell
node -v            # v24 ya da daha yenisi
claude --version
python --version   # isteğe bağlı, sadece skill betikleri kullanıyor
```

### C · Linux

1. yol, npm (Node 24 veya üstü, https://nodejs.org adresinden ya da bir sürüm yöneticisiyle;
dağıtımın kendi paketi çoğu zaman fazla eski kalıyor):

```bash
npm install -g @anthropic-ai/claude-code
```

2. yol, kendi kurucusu:

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

Doğrulama:

```bash
node -v            # v24 ya da daha yenisi
claude --version
python3 --version  # isteğe bağlı, sadece skill betikleri kullanıyor
```

### İlk giriş (üçünde de, bir kereye mahsus)

```bash
claude
```

İlk açılışta tarayıcı kendiliğinden açılır ve Claude hesabına giriş ister. Orada izni ver,
terminale geri dön; karşılama ekranı seni bekliyor olacak. Ekransız bir sunucudaysan, ekrana
düşen adresi herhangi bir tarayıcıya taşı ve verilen kodu terminale geri yapıştır.

## Salon için egzersiz

Beş dakika, herkes kendi makinesinde:

1. Node'u kur (1. yol) ya da hiç uğraşma (2. yol) ve Claude Code'u kur.
2. `node -v` ve `claude --version` komutlarını çalıştır, çıkan iki sürüm numarasını sesli oku.
3. `claude` yaz, giriş yap ve karşılama ekranında dur. Egzersizin tamamı bu kadar.

Bir dizüstü inat ediyorsa, yanındakinin ekranına ortak ol. Kurulum yüzünden kimse akşamın
geri kalanını dışarıdan izlemesin.

## Olmazsa göster

`docs/setup/macos.md`, `docs/setup/windows.md` ve `docs/setup/linux.md` dosyalarını
projeksiyonda aç, her birinden işe yarayan iki satırı oku.
