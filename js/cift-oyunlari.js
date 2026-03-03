/* ============================================
   OURHIDDENVERSE - ÇİFT OYUNLARI
   Eğlenceli çift oyunları koleksiyonu
   ============================================ */

// Çift Oyunları sayfasını yükle
async function loadCiftOyunlariPage() {
  const pageContent = document.getElementById('pageContent');
  
  pageContent.innerHTML = `
    <div class="cift-oyunlari-container">
      <div class="cift-oyunlari-header">
        <h2>🎮 Çift Oyunları</h2>
        <p class="cift-oyunlari-desc">Kararsız kaldığınızda veya eğlenmek istediğinizde!</p>
      </div>

      <!-- Oyun Kartları Grid -->
      <div class="oyun-kartlari-grid">
        
        <!-- Baran mı Bahar mı Çarkı -->
        <div class="oyun-karti" onclick="openBaranBaharCark()">
          <div class="oyun-karti-icon">🎡</div>
          <h3 class="oyun-karti-baslik">Baran mı Bahar mı?</h3>
          <p class="oyun-karti-aciklama">Kararsız kaldığınızda çarkı çevirin, karar verici seçilsin!</p>
          <span class="oyun-karti-etiket">Şans Çarkı</span>
        </div>

        <!-- Yakında Eklenecek Oyunlar -->
        <div class="oyun-karti oyun-yakinda">
          <div class="oyun-karti-icon">🎲</div>
          <h3 class="oyun-karti-baslik">Kim Daha Çok?</h3>
          <p class="oyun-karti-aciklama">Birbiriniz hakkında sorular, kim daha çok puan alacak?</p>
          <span class="oyun-karti-etiket yakinda">Yakında</span>
        </div>

        <div class="oyun-karti oyun-yakinda">
          <div class="oyun-karti-icon">❓</div>
          <h3 class="oyun-karti-baslik">Doğru mu Yanlış mı?</h3>
          <p class="oyun-karti-aciklama">Partneriniz hakkında ne kadar biliyorsunuz?</p>
          <span class="oyun-karti-etiket yakinda">Yakında</span>
        </div>

        <div class="oyun-karti oyun-yakinda">
          <div class="oyun-karti-icon">💕</div>
          <h3 class="oyun-karti-baslik">Aşk Testi</h3>
          <p class="oyun-karti-aciklama">Uyum testinizi yapın, sonuçları karşılaştırın!</p>
          <span class="oyun-karti-etiket yakinda">Yakında</span>
        </div>

      </div>
    </div>

    <!-- Baran mı Bahar mı Çark Modalı -->
    <div class="modal-overlay cark-modal-overlay" id="baranBaharCarkModal">
      <div class="cark-modal-content">
        <button class="btn-modal-close cark-close" onclick="closeBaranBaharCark()">×</button>
        
        <h2 class="cark-baslik">🎡 Baran mı Bahar mı?</h2>
        <p class="cark-alt-baslik">Çarkı çevir, karar veren seçilsin!</p>
        
        <div class="cark-container">
          <!-- Ok işareti -->
          <div class="cark-ok">▼</div>
          
          <!-- Çark -->
          <div class="cark-wheel" id="carkWheel">
            <div class="cark-dilim baran-dilim">
              <span class="dilim-text">💙 Baran</span>
            </div>
            <div class="cark-dilim bahar-dilim">
              <span class="dilim-text">💖 Bahar</span>
            </div>
            <div class="cark-dilim baran-dilim">
              <span class="dilim-text">💙 Baran</span>
            </div>
            <div class="cark-dilim bahar-dilim">
              <span class="dilim-text">💖 Bahar</span>
            </div>
          </div>
          
          <!-- Merkez butonu -->
          <button class="cark-merkez-btn" id="carkCevirBtn" onclick="cevirCark()">
            <span class="cark-merkez-icon">🎯</span>
            <span class="cark-merkez-text">ÇEVİR!</span>
          </button>
        </div>
        
        <!-- Sonuç Alanı -->
        <div class="cark-sonuc" id="carkSonuc">
          <div class="cark-sonuc-icerik" id="carkSonucIcerik"></div>
        </div>
        
        <!-- İstatistikler -->
        <div class="cark-istatistik" id="carkIstatistik">
          <div class="istat-item baran-istat">
            <span class="istat-isim">💙 Baran</span>
            <span class="istat-sayi" id="baranSayisi">0</span>
          </div>
          <div class="istat-item bahar-istat">
            <span class="istat-isim">💖 Bahar</span>
            <span class="istat-sayi" id="baharSayisi">0</span>
          </div>
        </div>
        
        <button class="btn-sifirla" onclick="sifirlaIstatistik()">🔄 İstatistikleri Sıfırla</button>
      </div>
    </div>
  `;

  // LocalStorage'dan istatistikleri yükle
  loadCarkIstatistik();
  
  console.log('🎮 Çift Oyunları sayfası yüklendi');
}

// Çark istatistiklerini yükle
function loadCarkIstatistik() {
  const istatistik = JSON.parse(localStorage.getItem('carkIstatistik') || '{"baran": 0, "bahar": 0}');
  
  const baranEl = document.getElementById('baranSayisi');
  const baharEl = document.getElementById('baharSayisi');
  
  if (baranEl) baranEl.textContent = istatistik.baran;
  if (baharEl) baharEl.textContent = istatistik.bahar;
}

// İstatistikleri kaydet
function saveCarkIstatistik(kazanan) {
  const istatistik = JSON.parse(localStorage.getItem('carkIstatistik') || '{"baran": 0, "bahar": 0}');
  
  if (kazanan === 'baran') {
    istatistik.baran++;
  } else {
    istatistik.bahar++;
  }
  
  localStorage.setItem('carkIstatistik', JSON.stringify(istatistik));
  loadCarkIstatistik();
}

// İstatistikleri sıfırla
function sifirlaIstatistik() {
  localStorage.setItem('carkIstatistik', JSON.stringify({ baran: 0, bahar: 0 }));
  loadCarkIstatistik();
}

// Baran mı Bahar mı modalını aç
function openBaranBaharCark() {
  const modal = document.getElementById('baranBaharCarkModal');
  if (modal) {
    modal.classList.add('active');
    loadCarkIstatistik();
    
    // Sonucu gizle
    const sonucEl = document.getElementById('carkSonuc');
    if (sonucEl) sonucEl.classList.remove('goster');
  }
}

// Modalı kapat
function closeBaranBaharCark() {
  const modal = document.getElementById('baranBaharCarkModal');
  if (modal) {
    modal.classList.remove('active');
  }
}

// Çark dönüşü durumu
let carkDonuyor = false;
let mevcutAci = 0;

// Çarkı çevir
function cevirCark() {
  if (carkDonuyor) return;
  
  carkDonuyor = true;
  
  const cark = document.getElementById('carkWheel');
  const btn = document.getElementById('carkCevirBtn');
  const sonucEl = document.getElementById('carkSonuc');
  const sonucIcerik = document.getElementById('carkSonucIcerik');
  
  // Butonu devre dışı bırak
  btn.classList.add('donuyor');
  btn.innerHTML = '<span class="cark-merkez-icon">🌀</span><span class="cark-merkez-text">...</span>';
  
  // Sonucu gizle
  sonucEl.classList.remove('goster');
  
  // Rastgele dönüş açısı (en az 5 tur + rastgele açı)
  const turSayisi = 5 + Math.random() * 3; // 5-8 tur
  const rastgeleAci = Math.random() * 360;
  const toplamAci = mevcutAci + (turSayisi * 360) + rastgeleAci;
  
  // CSS ile animasyonu uygula
  cark.style.transition = 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)';
  cark.style.transform = `rotate(${toplamAci}deg)`;
  
  mevcutAci = toplamAci;
  
  // Animasyon bittiğinde sonucu göster
  setTimeout(() => {
    // Normalize açı (0-360)
    const normalAci = toplamAci % 360;
    
    // Hangi dilimde durduğunu hesapla (90 derece dilimler)
    // Ok yukarıda, yani 0 derece en üst
    let kazanan;
    
    // Çarkın yapısına göre:
    // 0-90: Bahar (sağ üst)
    // 90-180: Baran (sağ alt)
    // 180-270: Bahar (sol alt)
    // 270-360: Baran (sol üst)
    
    if ((normalAci >= 0 && normalAci < 90) || (normalAci >= 180 && normalAci < 270)) {
      kazanan = 'bahar';
    } else {
      kazanan = 'baran';
    }
    
    // Sonucu göster
    if (kazanan === 'baran') {
      sonucIcerik.innerHTML = `
        <div class="sonuc-emoji">💙</div>
        <div class="sonuc-isim baran-sonuc">BARAN</div>
        <div class="sonuc-mesaj">Karar Baran'ın!</div>
      `;
      sonucEl.className = 'cark-sonuc goster baran-kazandi';
    } else {
      sonucIcerik.innerHTML = `
        <div class="sonuc-emoji">💖</div>
        <div class="sonuc-isim bahar-sonuc">BAHAR</div>
        <div class="sonuc-mesaj">Karar Bahar'ın!</div>
      `;
      sonucEl.className = 'cark-sonuc goster bahar-kazandi';
    }
    
    // İstatistiği kaydet
    saveCarkIstatistik(kazanan);
    
    // Butonu tekrar aktif et
    btn.classList.remove('donuyor');
    btn.innerHTML = '<span class="cark-merkez-icon">🎯</span><span class="cark-merkez-text">ÇEVİR!</span>';
    
    carkDonuyor = false;
    
    // Konfeti efekti
    createCarkKonfeti(kazanan);
    
  }, 4100);
}

// Mini konfeti efekti
function createCarkKonfeti(kazanan) {
  const container = document.querySelector('.cark-modal-content');
  if (!container) return;
  
  const renkler = kazanan === 'baran' 
    ? ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'] 
    : ['#ec4899', '#f472b6', '#f9a8d4', '#fbcfe8'];
  
  for (let i = 0; i < 30; i++) {
    const konfeti = document.createElement('div');
    konfeti.className = 'cark-konfeti';
    konfeti.style.cssText = `
      position: absolute;
      width: ${Math.random() * 10 + 5}px;
      height: ${Math.random() * 10 + 5}px;
      background: ${renkler[Math.floor(Math.random() * renkler.length)]};
      left: ${Math.random() * 100}%;
      top: 50%;
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      pointer-events: none;
      animation: konfetiDus ${Math.random() * 1 + 1}s ease-out forwards;
    `;
    container.appendChild(konfeti);
    
    setTimeout(() => konfeti.remove(), 2000);
  }
}

// Global fonksiyonlar
window.loadCiftOyunlariPage = loadCiftOyunlariPage;
window.openBaranBaharCark = openBaranBaharCark;
window.closeBaranBaharCark = closeBaranBaharCark;
window.cevirCark = cevirCark;
window.sifirlaIstatistik = sifirlaIstatistik;
