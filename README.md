# Workup Gaming Demo Day, Cohort 4 Finale: Zoom seti

26 Kasım 2026 Perşembe, 16:00 ile 17:30 (GMT+3), Zoom.
Bu klasör Firstpoint'ten ayrı bir iştir. Firstpoint marka kuralları burada geçerli değil.

## Tasarım dili

Luma'daki mevcut görsellerden alındı (`ref/` altında): siyah zemin, mor piksel serpintisi, oyun arayüzü etiketleri.

| | Değer |
|---|---|
| Zemin | `#000000` |
| Mor (vurgu) | `#7B4DFF` |
| Lila (etiket, ikinci başlık) | `#C6B4FF` |
| Koyu mor (gölge) | `#2E1873` |
| Kart | `#18161F` |
| Başlık fontu | Press Start 2P |
| Etiket fontu | Silkscreen |
| Gövde fontu | Space Grotesk |

Logolar:
- INVEXEN ve Workup Gaming: Luma'daki organizatör görselinden alındı, `brand/` altında. Düzenleyici logosu olarak yalnızca bu ikisi kullanılıyor, Türkiye İş Bankası logosu yok (kullanıcının talimatı).
- Altı stüdyo logosu: Luma kapağındaki karolardan kesildi (278 piksel), `brand/studios/` altında. Açılış ekranında, sunum sırasında, sunum ekranlarında ve oda ekranında yer alıyor.

## Kullanıcının kararları (17 Kasım 2026)

- **Tek bir genel sanal arka plan var, herkes onu kullanır.** Kişiye özel ya da stüdyoya özel arka plan yok. Önce stüdyo başına ve konuşmacı başına arka planlar hazırlamıştım, kullanıcı "kişiye özel olmasın, genel bir background planlayalım herkes onu kullansın" dedi. Tekrar önerme.
- **Şehir adları tasarımda yer almaz.** Luma'daki "The Lineup" görselinde stüdyoların şehirleri yazıyordu (Istanbul, Kocaeli, Kayseri, Ankara), kullanıcı "şehirleri neden yazıyoruz" dedi. Etiketlerde yalnızca platform ve tür kaldı.
- Stüdyo logoları ekranlarda kullanılır.
- **Arka plan üst bantlı olan.** Üç seçenek hazırlamıştım (sahne kartı, sade, üst bant). Kullanıcı "sen karar ver" dedi, üst bantlıyı seçtim: küçük Zoom karesinde bile logolar okunuyor, her kareye aynı mor başlığı veriyor ve siyah duvar kağıdından ayrışıyor. Diğer ikisi silindi.
- **Duvar kağıdında alt yazı yok.** Sol altta "6 studios meet investors & publishers", sağ altta tarih ve saat yazıyordu. Kullanıcı "sağ ve sol footer'a gerek yok" dedi, ikisi de kaldırıldı. Ekran paylaşımıyla gösterilen ekranlardaki alt satırlara dokunulmadı (bunu duvar kağıdı için söylediğini varsaydım).

## Dosyalar (`out/`)

Zoom dosyaları ve ekranlar 1920x1080 PNG.

### `out/email/`: davet e-postası

| Dosya | Ne için |
|---|---|
| `invite.html` | Davet e-postası. Tarayıcıda aç, üstteki "E-postayı kopyala" düğmesine bas, Outlook'ta yeni e-postanın gövdesine yapıştır. Göndermeden önce `[First name]` yerine kişinin adını yaz. İmza dosyada yok, Outlook'taki imza altta kalır. |
| `banner.png` | E-postanın üstündeki başlık bandı (960x440, e-postada 480x220 gösterilir). `invite.html` içine gömülü. Yapıştırınca görsel gelmezse Outlook'ta Ekle, Resimler ile elle eklenir. |

Metin kullanıcının 18 Kasım 2026'da gönderdiği davet metninden yeniden yazıldı: açılış doğrudan ne olacağını söylüyor, altı stüdyo adlarıyla yazıyor, program başlangıç saatleriyle veriliyor, sonda "iş arkadaşına ilet" cümlesi var (katılım az olduğu için). Tarih, saat ve süre kalın (kullanıcının isteği).

**Kullanıcı klasik (eski) Outlook kullanıyor.** O sürüm e-postayı Word motoruyla çizer ve gönderirken HTML'i baştan yazar. İlk sürüm kopyalanıp gönderilince bozuldu (kullanıcı: "bazı hatalar var, eski Outlook vs. ayar çek, mobil falan onları da ayarla"). Bu yüzden e-posta şu kurallarla yazıldı, değiştirirken bozma:

- Her şey tek bir tablonun satırları. Boşluk `margin` ile değil hücre dolgusuyla verilir. Word tablo `margin` değerini bozuyor (düğme iki kat uzuyor ve üstündeki tabloya yapışıyordu).
- Her hücredeki yazı `<p style="margin:0">` içinde. Yapıştırılan e-postanın "Normal" stilinde paragraf sonrası boşluk varsa çıplak hücre yazısı onu devralıyor ve satırlar şişiyor.
- Düğme iç içe iki tablo (koyu mor gölge, mor yüzey). `border-radius` yok, köşeler düz.
- Bant görseli link içinde değil. Word linkli görselin altına mavi çizgi çiziyor.
- Genişlik 480 piksel, gövde yazısı 16 piksel. Klasik Outlook HTML'i yeniden yazdığı için gerçek duyarlı düzen (media query) alıcıya ulaşmaz. Telefonlar sabit genişliği ekrana sığdırıp küçültür, 480 piksel ve büyük yazı küçülünce de okunur kalır (600 pikselde yazı telefonda yaklaşık 10 piksele düşüyordu).

Nasıl denendi: bilgisayardaki Word görünmez açılıp e-posta hem dosyadan açıldı hem de var olan boş bir belgeye eklendi (yapıştırmaya en yakın durum), sayfa görüntüsüne bakıldı. Sonra Word'ün yeniden yazdığı HTML tarayıcıda telefon genişliğinde açıldı. Betikler `tools/outlook-test/` altında:

```
node workup-demo-day/tools/outlook-test/extract.mjs workup-demo-day/out/email/invite.html <klasör>/v.html
powershell -File workup-demo-day/tools/outlook-test/render-insert.ps1 -dir <klasör> -name v
```

`<klasör>` proje içinde geçici bir klasör olsun, iş bitince silinsin. Bilinen iki sınır: Word gönderirken düğme yazısının altını çizebilir (alıcının programına göre) ve bant görselini 480x220'ye küçültebilir. Gerçek Outlook'tan gönderip gelen kutusunda bakmak hâlâ son kontroldür, bunu kullanıcı yapar.

### `out/zoom/`: Zoom'a yüklenecekler

| Dosya | Ne için |
|---|---|
| `wallpaper.png` | Webinar duvar kağıdı. Video karelerinin arkasında durur, ortası boş. Üstte logolar ve "Demo Day, Cohort 4", altta yazı yok. |
| `background.png` | Herkesin kullanacağı sanal arka plan. Üstte boydan boya mor bant, logolar bandın içinde. Konuşmacının başı bandın önünde kalır, orta ve alt alan boş. |

### `out/screens/`: ekran paylaşımıyla gösterilecekler, yayın sırasıyla

| Dosya | Ne zaman |
|---|---|
| `01-opening.png` | Yayın başlamadan önce, katılımcılar girerken |
| `02-lv1-opening.png` | 16:00, açılış konuşmaları |
| `03-lv2-studio-pitches.png` | 16:10, sunumlara geçiş |
| `04-lineup.png` | Sunum sırası |
| `05` ... `10-pitch-...png` | Her stüdyo sunuma başlarken |
| `11-lv3-meeting-rooms-open.png` | 16:35, odalara geçiş |
| `12-meeting-rooms.png` | Odalar açıkken ana odada duran ekran |
| `13-lv4-wrap-up.png` | 17:30, kapanış |
| `14-game-over.png` | Yayın biterken |
| `demo-day-screens.pdf` | Yukarıdaki 14 ekranın tek dosya hali. Tam ekran açıp ok tuşlarıyla geçilir. |

### `out/preview/`: yalnızca önizleme

`background.png` arka planın bir konuşmacıyla, `zoom-webinar.png` duvar kağıdı üstünde Zoom kareleri halinde nasıl duracağını gösterir. Gri siluet ve isim etiketleri yer tutucudur. Yayında kullanılmaz.

## Zoom'a yükleme

Zoom'un ekran adları sürüme göre biraz değişebilir.

1. **Duvar kağıdı ve arka plan (Webinar):** Zoom web sitesinde webinarı aç, "Branding" sekmesinde "Session Branding" bölümüne gir. `wallpaper.png` dosyasını duvar kağıdı olarak, `background.png` dosyasını sanal arka plan olarak yükle. Bu bölüm görünmüyorsa hesap ayarlarında "Webinar Session Branding" açılmalı.
2. **İsim etiketleri:** Aynı bölümde. Önerilen renkler: metin `#FFFFFF`, vurgu `#7B4DFF`, zemin `#18161F`.
3. **Stüdyo odaları:** Stüdyolar kendi odalarını açıyorsa aynı arka plan dosyasını kendi Zoom'larına elle ekler: Ayarlar, "Background & effects", sanal arka planlar, artı işareti, dosyayı seç.
4. **Ekranlar:** `demo-day-screens.pdf` dosyasını tam ekran aç ve Zoom'da o pencereyi paylaş.

Zoom ölçüleri (araştırmayla doğrulandı, resmi sayfadan değil üçüncü taraf belgelerden): duvar kağıdı 16:9 ve 1920x1080, JPG, PNG ya da GIF, en fazla 15 MB.

## Yeniden üretmek

Metin, saat ya da stüdyo bilgisi değişirse `build.mjs` başındaki `STUDIOS` ve `LEVELS` listelerini düzenle, sonra yeniden üret.

Bu klasör GitHub'da ayrı bir depo (23 Kasım 2026'dan beri). Depoyu klonlayan biri için:

```
npm install
node build.mjs
```

Bilgisayarda Chrome ya da Edge kurulu olmalı. Ara HTML dosyaları `src/` altına yazılır, depoya girmez.

Firstpoint klasörünün içinden çalışırken (bağımlılıklar üst klasörde kurulu) proje kökünden:

```
node workup-demo-day/build.mjs
```

Tek bir ekranı üretmek için adının bir parçasını ver: `node workup-demo-day/build.mjs opening`. Yalnızca e-posta için: `node workup-demo-day/build.mjs email`. E-postanın metni `build.mjs` içindeki `inviteEmail` işlevinde.

## Varsayımlar ve açık konular

- Stüdyo logoları Luma kapağından kesildiği için 278 piksel. Sunum ekranlarında 340 piksel gösteriliyor, yani hafifçe büyütülmüş. Özgün dosyalar gelirse `brand/studios/` altındaki dosyalarla aynı adla değiştirip yeniden üretmek yeterli.
- Türkiye İş Bankası'nın adı yalnızca açılış satırında yazıyla geçiyor ("Remarks from İş Bankası and INVEXEN"), Luma'daki metinle aynı.
- Sunum sırası Luma'daki "The Lineup" görselindeki sıra kabul edildi (P1 threeW, P2 Yeapp, P3 Portuma, P4 HOGO, P5 Wide, P6 Krono).
- Açılış ekranı durgun görsel. Hareketli döngü ya da geri sayım istenirse ayrıca üretilir.
- Duvar kağıdı özelliği webinar lisansına bağlı. Hesap toplantı lisansıysa o dosya kullanılamayabilir.
