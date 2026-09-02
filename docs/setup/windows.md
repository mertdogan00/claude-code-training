# Windows'a kurulum

## Node.js (Yol 1 için ve demo uygulamaları için gerekli)

Eğitimdeki örnek uygulamalar Node.js üzerinde çalışıyor ve Node'un içinden çıkan
`node:sqlite` modülünü kullanıyor, yani makinende hiçbir şey derlenmiyor. Güncel
**LTS sürümünü, Node 24 ya da daha yenisini** kur. Her demo uygulaması tek bir sade
klasör: bir kez `npm install` çalıştır (internet ister), sonra `node server.js` de ve
http://localhost:3000 adresini aç. Bu deponun istediği sürüm Node 24: orada
`node:sqlite` için ekstra bir bayrağa gerek kalmıyor.

Aşağıdaki Yol 2, yani hazır kurucu, Node istemiyor; Yol 1 ile demo uygulamaları istiyor.

```powershell
# kurulum (iki yoldan biri): LTS sürümünü https://nodejs.org adresinden indir ya da:
winget install OpenJS.NodeJS.LTS

# doğrula (yeni terminal)
node -v         # v24 ya da daha yenisi olmalı
claude --version
```

## Yol 1: npm

```powershell
npm install -g @anthropic-ai/claude-code
```

## Yol 2: hazır kurucu (alternatif, Node gerekmiyor, PowerShell)

```powershell
irm https://claude.ai/install.ps1 | iex
```

Linux ortamını tercih ediyorsan Claude Code **WSL** (Windows Subsystem for Linux)
içinde de gayet iyi çalışıyor; o zaman WSL'in içinde Linux rehberini takip et.

## İlk çalıştırma

```powershell
claude
```

Tarayıcı açılıyor ve Claude hesabınla giriş yapmanı istiyor (Pro planı ya da üstü;
[fiyatlara](https://claude.com/pricing) bakabilirsin). İzni ver, terminale dön, tamam.

## Python (isteğe bağlı: sahnede gösteriliyor, zorunlu değil)

`skills/` altındaki bazı skill'ler küçük bir Python yardımcısını çağırıyor. Bu akşam
hiçbir şey buna bağlı değil.

```powershell
# kurulum (iki yoldan biri): https://python.org adresinden indir ("Add to PATH" kutusunu işaretle) ya da:
winget install Python.Python.3

# doğrula (yeni terminal)
python --version   # (macOS ve Linux'ta python3); 3.9 ve üstü herhangi bir Python iş görür
```
