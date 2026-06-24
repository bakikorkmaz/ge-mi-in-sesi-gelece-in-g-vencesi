# Geçmişin Sesi Geleceğin Güvencesi ve Deprem Risk Analizi

Bu proje, olası bir İstanbul depremi senaryosunda, **"Sınırlı bütçe ve kaynaklarla en kısa sürede nasıl toparlanılır?"** sorusuna matematiksel ve analitik cevaplar sunan bir Karar Destek ve Optimizasyon Sistemidir. Doğuşan Yönetimi için bütçe verimliliğini maksimize etmek amacıyla özel olarak güncellenmiştir.

**Proje Araştırmacısı:** Baki Korkmaz

---

## 1. Projenin Amacı ve Optimizasyon Yaklaşımı
Önceki afet deneyimleri (örn: 6 Şubat Adıyaman), sadece kaynak eksikliğinin değil, mevcut kaynakların verimsiz kullanımının da iyileşme sürelerini uzattığını göstermiştir. Bu projenin temel amacı; karar alıcıların **"Bina Güçlendirme Bütçesi"** ve **"Arama Kurtarma Ekibi Sayısı"** gibi değişkenlerle oynayarak, harcadıkları paranın karşılığında **"ne kadar zaman kazandıklarını"** (Fayda) anında görebilmelerini sağlamaktır.

Sistem, "Azalan Verimler Kanunu"nu (Diminishing Returns) baz alarak, gereksiz yatırımları (örneğin iyileşmeyi sadece 1 saat kısaltacak ama 100 milyonlarca liraya mal olacak hamleleri) tespit eder ve engeller.

## 2. Veri Kaynağı ve Simülasyon Mantığı
Simülasyon modeli, **2026 AFAD Risk Dağılım Raporları** ve Kandilli Rasathanesi yapı stoku istatistiklerine dayalı güncel bir sentetik veri seti kullanır (`simulasyon.py`).

1. **Maliyet-Hasar Ağırlıklandırması:** Her bina, yapım yılı, kat sayısı ve zemin sınıfına göre farklı bir hasar ve güçlendirme maliyeti profiline sahiptir.
2. **Toplam Maliyet Hesabı:** Ayrılan güçlendirme bütçesi ve sahaya sürülen arama-kurtarma ekiplerinin (personel, lojistik, ekipman) toplam masrafı hesaplanır.
3. **Zaman-Fayda Dengesi:** Bütçenin sağladığı güçlendirme faktörü, binaların hasar yükünü azaltır. Ekiplerin sayısı ise kalan iş yükünü ne kadar sürede eriteceğini belirler. Ancak ekip sayısı aşırı arttığında koordinasyon kaybı yaşanır.
4. **Verimlilik Skoru:** Kazanılan zamanın toplam maliyete logaritmik olarak oranlanmasıyla 0-100 arasında bir skor (ve A+, B, C, F gibi harf notları) oluşturulur.

## 3. Elde Edilen Bulgular
İnteraktif simülatör kullanılarak elde edilen temel bazı bulgular:
*   **Aşırı Yatırım İsrafı:** Örneğin bütçeyi 2 Milyar TL'ye ve ekip sayısını 1000'e çıkarmak, süreyi 24 saatin altına indirebilir ancak bu "Düşük Verimlilik" (D veya C skoru) anlamına gelir. Çünkü bu noktanın çok daha altında bir harcamayla da güvenli 36-48 saat aralığı yakalanabilir.
*   **A+ Optimum Noktası:** Doğru bir bütçe (örn: 200-300 Milyon TL) ve dengeli bir ekip sayısı (örn: 100-200) ile hem şehir günler süren bir felaketten kurtulmakta hem de bütçenin çok büyük bir kısmı kurumun kasasında kalmaktadır.

### Kurumunuza Katkısı
Uygulama klasörü içerisindeki `index.html` dosyası ile çalıştırılabilen **Kaynak Tahsis Simülatörü**, toplantılarınızda bütçe kararları alırken doğrudan kullanabileceğiniz bir araçtır. 

"Daha fazla para harcayalım mı?" sorusuna sadece "Skorumuz A+ olana kadar harcayalım" gibi net, analitik ve şirketinizi zarardan koruyan cevaplar verebilmenizi sağlar.

---
*Saygılarımla,*  
**Baki Korkmaz**

