# Mega prompt · QR Menü (kafe / restoran)

Tek atım. Masadaki QR'dan açılan menü: görünürde basit, müşterisi olan gerçek bir iş.

---

> Bir ekip gibi çalış: ürün yöneticisi planı (5 madde, onayımı al) → backend, frontend, veri
> rolleri ayrı raporlanacak → sonda test şapkası kabul listesi.
>
> İş şu: bir kafe için iki yüzlü "QR Menü" uygulaması.
>
> Müşteri yüzü (`/`): kategori sekmeleri (kahve, tatlı, atıştırmalık), ürün kartları (ad,
> açıklama, fiyat), "tükendi" işaretli ürünler soluk; en üstte kafe adı ve wifi şifresi satırı.
>
> İşletme yüzü (`/panel`): ürün ekle/düzenle/tükendi işaretle; fiyat güncelle; kategori ekle.
> Basit tek şifreli giriş (şifre .env yerine başlangıçta sabit: "kahve123", değiştirilebilir
> yaz).
>
> Teknik çerçeve: modüler Node.js, sadece yerleşik modüller (http, fs, node:sqlite), npm
> paketi yok. `server.js` + `lib/db.js` + `public/` (müşteri) + `public/panel/` (işletme).
> `npm run dev`, port 3000. Menü yüzü telefon-öncelikli tasarım; koyu tema (#16150f /
> #d97757). Başlangıçta 8 örnek ürün tohumla.
>
> Bitiş tanımı: panelden bir ürünü "tükendi" yapınca müşteri yüzünde anında soluk görünecek;
> yeni ürün eklemek 15 saniye sürecek. Kanıt adımlarını yaz.
