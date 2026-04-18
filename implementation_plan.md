# App Store Style Game Detail View Implementation

Bu plan, kullanıcı oyun kartlarına tıkladığında açılacak şık ve dinamik "Product Page" görünümünün oluşturulmasını ve SPA temeline geçişi hedefler.

## User Review Required
- Değişiklikler sitenin `href` tabanlı yönlendirmesini SPA tabanlı hash routing (`#!/oyun/oyun-id`) mantığına çekecektir. Bu sayede SEO da desteklenecek ve sayfa yenilenmeden oyun detayları açılacaktır.
- Uygulanacak tasarım Apple'ın App Store stiline dayanarak hazırlanacaktır.

## Proposed Changes

### 1) core_files

#### [MODIFY] index.html
- `<body>` etiketinin bitimine yakın bir noktada aşağıdaki div yapısını ekleyeceğiz:
  ```html
  <div id="appStoreOverlay" class="app-store-overlay hidden">
     <div class="overlay-content">
         <div class="drag-indicator"></div>
         <button id="closeOverlayBtn" class="close-overlay-btn">&times;</button>
         
         <!-- Header -->
         <div class="detail-header">
             <img id="detailIcon" src="" alt="icon">
             <div class="detail-title-area">
                 <h2 id="detailTitle">Title</h2>
                 <span id="detailCategory" class="detail-category-tag">Category</span>
             </div>
         </div>
         
         <a id="detailPlayBtn" href="#" class="detail-play-btn">HEMEN OYNA</a>
         
         <!-- Gallery (16:9) -->
         <div class="detail-gallery">
             <img id="galleryImg1" src="" class="gallery-item" alt="g1">
             <div style="width: 15px; flex-shrink:0;"></div>
             <img id="galleryImg2" src="" class="gallery-item" alt="g2">
         </div>
         
         <!-- About -->
         <div class="detail-about">
             <h3>Bu Oyun Hakkında</h3>
             <p id="detailDescription">...</p>
         </div>
     </div>
  </div>
  ```

#### [MODIFY] css/style.css
- `#appStoreOverlay` tasarımı için `position: fixed`, `bottom: 0`, `z-index: 2000`, `height: 100%`, `width: 100%` stilleri tanımlanacaktır.
- Mobilde App Store'daki gibi aşağıdan yukarı kayan yapı (`transform: translateY(100%)`) ve smooth animasyon eklenecektir.
- `.detail-gallery` bileşeni için modern, yatay olarak kaydırılabilir (`overflow-x: auto; scroll-snap-type: x mandatory;`) ve scroll bar'ı gizlenmiş bir grid uygulanacaktır.
- `.detail-play-btn` butonuna geniş yüzeyli, kavisli, dikkat çekici Apple Buton stili verilecektir.
- Aşağı kaydırarak (swipe) kapatma hissiyatı için JavaScript ile entegre çalışacak modern bir `.drag-indicator` bar eklenecektir.

#### [MODIFY] js/main.js
- **Routing Ekleme**: `window.addEventListener('hashchange', handleHashChange)` entegre edilecektir.
- Kart linklerinin href özellikleri `#!/oyun/${game.id}` olarak değiştirilecektir.
- `handleHashChange` metodunda: Eğer adres `#` ile başlıyor ve oyun listesinde bulunuyorsa `appStoreOverlay` aktif hale getirilecektir. 
- Veri Bağlama: Tıklanan oyunun ikonu, ismi rengi ve oynama linki (`gameUrl`) atanacaktır. Dinamik lorem/unsplash fotoğrafları galeriye doldurulacaktır.
- **Kapatma**: Çarpı butonuna (`#closeOverlayBtn`) tıklanınca veya Overlay arka planına tıklanınca `history.back()` veya `location.hash = ''` ile kapatılacaktır. Kaydırma (swipe-down) efekti dinleyicileri (Touch Events) eklenecektir.

## Open Questions
- Yok. Mevcut plan kullanıcının isteğindeki bütün gereksinimleri (yuvarlak ikonlu header, iki adet 16:9 yatay galeri, uzun açıklama metni alanı, swipe ve çarpı ile kapatma) karşılamaktadır.

## Verification Plan
1. Sunucu çalıştırılır. Ana sayfada bir oyun kartına tıklanır.
2. Sayfa yenilenmez; sadece URL `#!/oyun/<oyun-id>` olarak değişir ve aşağıdan kayarak detay penceresi açılır.
3. Detay penceresindeki "HEMEN OYNA" butonuna tıklandığında asıl oyun dosyası (HTML sayfasının içi) tam ekranda / yeni sekmede yüklenir veya bulunduğu konumda açılır (Normalde doğrudan aynı pencereye oyun sayfasına yönlendiriyor, öyle kalacaktır).
4. Mobilden incelendiğinde galerinin kayabildiği ve X tuşu ile kapandığı doğrulanır.
