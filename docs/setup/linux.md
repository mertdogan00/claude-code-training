# Linux'a kurulum

## Node.js (Yol 1 için ve demo uygulamaları için gerekli)

Eğitimdeki örnek uygulamalar Node.js üzerinde çalışıyor ve Node'un içinden çıkan
`node:sqlite` modülünü kullanıyor, yani makinende hiçbir şey derlenmiyor. Güncel
**LTS sürümünü, Node 24 ya da daha yenisini** https://nodejs.org adresinden ya da
sürüm yöneticinden kur (dağıtım paketleri çoğu zaman daha eski kalıyor). Her demo
uygulaması tek bir sade klasör: bir kez `npm install` çalıştır (internet ister), sonra
`node server.js` de ve http://localhost:3000 adresini aç. Bu deponun istediği sürüm
Node 24: orada `node:sqlite` için ekstra bir bayrağa gerek kalmıyor.

Aşağıdaki Yol 2, yani hazır kurucu, Node istemiyor; Yol 1 ile demo uygulamaları istiyor.

```bash
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

Ekrana yazdığı tarayıcı bağlantısından giriş yap (Pro planı ya da üstü;
[fiyatlara](https://claude.com/pricing) bakabilirsin); ekransız bir sunucudaysan adresi
herhangi bir tarayıcıya kopyala, çıkan kodu geri yapıştır. Evet, bu şu demek: kendi
SUNUCUNDA da çalışıyor. Sahnede Remote Control ile anlatılan nokta tam olarak buydu.

## Python (isteğe bağlı: sahnede gösteriliyor, zorunlu değil)

`skills/` altındaki bazı skill'ler küçük bir Python yardımcısını çağırıyor. Bu akşam
hiçbir şey buna bağlı değil. Neredeyse her dağıtım Python ile geliyor; bu depo için
yakın tarihli herhangi bir Python 3 iş görür.

```bash
python3 --version   # 3.9 ve üstü herhangi bir Python iş görür; yoksa apt/dnf ile python3 kur
```
