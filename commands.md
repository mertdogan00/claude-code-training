# Cheat sheet: everything typed on stage

## Terminal basics

```bash
pwd          # neredeyim
ls           # bu klasörde ne var
cd <klasör>  # klasöre gir
cd ..        # bir üste çık
```

## Claude Code lifecycle

```bash
claude               # başlat (bulunduğun klasör = çalışma alanı)
claude --continue    # son sohbete kaldığın yerden devam et
```

## Inside Claude Code

```
/help        # komut listesi
/clear       # sohbeti sıfırla (context de sıfırlanır!)
/compact     # sohbeti özetleyip yer aç
/plugin      # resmi marketplace: kur, yönet
/<skill>     # kurulu bir skill'i çağır
Shift+Tab    # izin modları arasında geçiş
```

## Git in two lines (the repo logic shown on stage)

```bash
git clone <url>   # projeyi bilgisayarına indir
git pull          # güncellemeleri çek
```

## The one to remember

Context is the fuel gauge: when it runs out and resets, the assistant remembers only what is
written in FILES (`CLAUDE.md`, your notes). Write things down; sessions are mortal, files
are not.
