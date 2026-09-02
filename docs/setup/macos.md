# macOS'a kurulum

İki yol var; ikisi de seni terminaldeki aynı `claude` komutuna götürüyor.

## Node.js (Yol 1 için ve demo uygulamaları için gerekli)

Eğitimdeki örnek uygulamalar Node.js üzerinde çalışıyor ve Node'un içinden çıkan
`node:sqlite` modülünü kullanıyor, yani makinende hiçbir şey derlenmiyor. Güncel
**LTS sürümünü, Node 24 ya da daha yenisini** kur. Her demo uygulaması tek bir sade
klasör: bir kez `npm install` çalıştır (internet ister), sonra `node server.js` de ve
http://localhost:3000 adresini aç. Bu deponun istediği sürüm Node 24: orada
`node:sqlite` için ekstra bir bayrağa gerek kalmıyor.

Aşağıdaki Yol 2, yani hazır kurucu, Node istemiyor; Yol 1 ile demo uygulamaları istiyor.

```bash
# kurulum (iki yoldan biri): LTS sürümünü https://nodejs.org adresinden indir ya da:
brew install node

# doğrula
node -v         # v24 ya da daha yenisi olmalı
claude --version
```

## Yol 1: npm

```bash
npm install -g @anthropic-ai/claude-code
```

## Yol 2: hazır kurucu (alternatif, Node gerekmiyor)

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

## İlk çalıştırma

```bash
claude
```

İlk açılışta tarayıcını açıp Claude hesabınla giriş yapmanı istiyor (Pro planı ya da
üstü; [fiyatlara](https://claude.com/pricing) bakabilirsin). İzni verdikten sonra
terminale geri dön: içeridesin.

## Python (isteğe bağlı: sahnede gösteriliyor, zorunlu değil)

`skills/` altındaki bazı skill'ler küçük bir Python yardımcısını çağırıyor. Bu akşam
hiçbir şey buna bağlı değil. macOS zaten bir `python3` ile geliyor; bu depo için yakın
tarihli herhangi bir Python 3 iş görür.

```bash
python3 --version   # 3.9 ve üstü herhangi bir Python iş görür; yoksa brew install python
```

## İsteğe bağlı: VS Code

Aynı aracı editörün içinde çalıştırmak istersen VS Code marketinden resmi "Claude Code"
eklentisini kur. Eğitimin kendisi terminali kullanıyor: her makinede aynı görünen ortak
zemin orası.
