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
        
        <div class="cark-wrapper">
          <!-- Işık efekti -->
          <div class="cark-glow"></div>
          
          <!-- Dış çerçeve -->
          <div class="cark-cerceve">
            <!-- Dekoratif noktalar -->
            <div class="cerceve-dots"></div>
            
            <!-- Ok işareti -->
            <div class="cark-ok-container">
              <div class="cark-ok"></div>
            </div>
            
            <!-- Ana Çark -->
            <div class="cark-wheel" id="carkWheel">
              <div class="cark-dilimler">
                <div class="dilim dilim-baran" style="--i: 0;">
                  <span class="dilim-icerik">💙<br>Baran</span>
                </div>
                <div class="dilim dilim-bahar" style="--i: 1;">
                  <span class="dilim-icerik">💖<br>Bahar</span>
                </div>
                <div class="dilim dilim-baran" style="--i: 2;">
                  <span class="dilim-icerik">💙<br>Baran</span>
                </div>
                <div class="dilim dilim-bahar" style="--i: 3;">
                  <span class="dilim-icerik">💖<br>Bahar</span>
                </div>
                <div class="dilim dilim-baran" style="--i: 4;">
                  <span class="dilim-icerik">💙<br>Baran</span>
                </div>
                <div class="dilim dilim-bahar" style="--i: 5;">
                  <span class="dilim-icerik">💖<br>Bahar</span>
                </div>
              </div>
              
              <!-- Merkez -->
              <div class="cark-merkez">
                <button class="cark-merkez-btn" id="carkCevirBtn" onclick="cevirCark()">
                  <div class="merkez-ic">
                    <span class="merkez-icon">🎰</span>
                    <span class="merkez-text">ÇEVİR</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
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
          <div class="istat-vs">VS</div>
          <div class="istat-item bahar-istat">
            <span class="istat-isim">💖 Bahar</span>
            <span class="istat-sayi" id="baharSayisi">0</span>
          </div>
        </div>
        
        <button class="btn-sifirla" onclick="sifirlaIstatistik()">🔄 Sıfırla</button>
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
  btn.querySelector('.merkez-ic').innerHTML = '<span class="merkez-icon">🌀</span><span class="merkez-text">...</span>';
  
  // Ses efekti (opsiyonel)
  playSpinSound();
  
  // Sonucu gizle
  sonucEl.classList.remove('goster');
  
  // Rastgele dönüş açısı (en az 6 tur + rastgele açı)
  const turSayisi = 6 + Math.random() * 4; // 6-10 tur
  const rastgeleAci = Math.random() * 360;
  const toplamAci = mevcutAci + (turSayisi * 360) + rastgeleAci;
  
  // CSS ile animasyonu uygula
  cark.style.transition = 'transform 5s cubic-bezier(0.2, 0.8, 0.2, 1)';
  cark.style.transform = `rotate(${toplamAci}deg)`;
  
  mevcutAci = toplamAci;
  
  // Animasyon bittiğinde sonucu göster
  setTimeout(() => {
    // Normalize açı (0-360)
    const normalAci = toplamAci % 360;
    
    // 6 dilimli çark (her dilim 60 derece)
    // Dilim 0 (Baran): 0-60
    // Dilim 1 (Bahar): 60-120
    // Dilim 2 (Baran): 120-180
    // Dilim 3 (Bahar): 180-240
    // Dilim 4 (Baran): 240-300
    // Dilim 5 (Bahar): 300-360
    
    const dilimIndex = Math.floor(normalAci / 60);
    const kazanan = (dilimIndex % 2 === 0) ? 'baran' : 'bahar';
    
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
    btn.querySelector('.merkez-ic').innerHTML = '<span class="merkez-icon">🎰</span><span class="merkez-text">ÇEVİR</span>';
    
    carkDonuyor = false;
    
    // Konfeti efekti
    createCarkKonfeti(kazanan);
    
  }, 5200);
}

// Ses efekti (basit tick sesi simulasyonu)
function playSpinSound() {
  // Web Audio API ile basit bir tik sesi
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    let tickCount = 0;
    const maxTicks = 40;
    
    const playTick = () => {
      if (tickCount >= maxTicks) return;
      
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.frequency.value = 800 + Math.random() * 400;
      oscillator.type = 'sine';
      
      gainNode.gain.value = 0.05;
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.05);
      
      tickCount++;
      
      // Yavaşlayan aralıklar
      const delay = 50 + (tickCount * tickCount * 0.5);
      if (tickCount < maxTicks) {
        setTimeout(playTick, delay);
      }
    };
    
    playTick();
  } catch (e) {
    // Ses desteği yoksa sessiz devam et
  }
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
