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

        <!-- Taş Kağıt Makas -->
        <div class="oyun-karti" onclick="openTasKagitMakas()">
          <div class="oyun-karti-icon">✊</div>
          <h3 class="oyun-karti-baslik">Taş Kağıt Makas</h3>
          <p class="oyun-karti-aciklama">Klasik oyun! Her iki taraf seçim yapsın, kim kazanacak?</p>
          <span class="oyun-karti-etiket">Canlı Oyun</span>
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
window.openTasKagitMakas = openTasKagitMakas;
window.closeTasKagitMakas = closeTasKagitMakas;
window.tkmSelect = tkmSelect;
window.tkmNewRound = tkmNewRound;

/* ============================================
   TAŞ KAĞIT MAKAS OYUNU
   ============================================ */

const TKM_EMOJIS = {
  tas: '🪨',
  kagit: '📄',
  makas: '✂️'
};

let tkmState = {
  baranSecim: null,
  baharSecim: null,
  sonuc: null,
  aktif: true
};
let tkmUnsubscribe = null;
let tkmStatsCache = { baran: 0, bahar: 0, berabere: 0 };

// TKM Modalını aç
function openTasKagitMakas() {
  // Modal yoksa oluştur
  if (!document.getElementById('tkmModal')) {
    createTKMModal();
  }
  
  document.getElementById('tkmModal').classList.add('active');
  initTKM();
}

// TKM Modalını kapat
function closeTasKagitMakas() {
  const modal = document.getElementById('tkmModal');
  if (modal) modal.classList.remove('active');
  
  if (tkmUnsubscribe) {
    tkmUnsubscribe();
    tkmUnsubscribe = null;
  }
}

// TKM Modal HTML oluştur
function createTKMModal() {
  const modalHTML = `
    <div class="modal-overlay tkm-modal-overlay" id="tkmModal">
      <div class="tkm-modal-content">
        <button class="btn-modal-close tkm-close" onclick="closeTasKagitMakas()">×</button>
        
        <div class="tkm-modal-header">
          <h2>✊ Taş Kağıt Makas</h2>
          <span class="tkm-live-badge">🔴 CANLI</span>
        </div>
        
        <div class="tkm-arena">
          <!-- Baran Tarafı -->
          <div class="tkm-player baran-side">
            <div class="tkm-player-header">
              <span class="tkm-avatar">🐧</span>
              <span class="tkm-name">Baran</span>
              <span class="tkm-wins" id="tkmBaranWins">0 🏆</span>
            </div>
            <div class="tkm-choices" id="tkmBaranChoices">
              <button class="tkm-choice" data-player="baran" data-choice="tas" onclick="tkmSelect('baran', 'tas')">
                <span class="tkm-emoji">🪨</span>
                <span class="tkm-label">Taş</span>
              </button>
              <button class="tkm-choice" data-player="baran" data-choice="kagit" onclick="tkmSelect('baran', 'kagit')">
                <span class="tkm-emoji">📄</span>
                <span class="tkm-label">Kağıt</span>
              </button>
              <button class="tkm-choice" data-player="baran" data-choice="makas" onclick="tkmSelect('baran', 'makas')">
                <span class="tkm-emoji">✂️</span>
                <span class="tkm-label">Makas</span>
              </button>
            </div>
            <div class="tkm-status" id="tkmBaranStatus">⏳ Seçim bekliyor...</div>
          </div>
          
          <!-- VS Ortası -->
          <div class="tkm-vs-center">
            <div class="tkm-vs-box" id="tkmVsBox">
              <span class="tkm-vs-text">VS</span>
            </div>
            <div class="tkm-battle-display" id="tkmBattleDisplay" style="display: none;">
              <div class="tkm-battle-item baran-battle">
                <span id="tkmBaranBattle">❓</span>
              </div>
              <div class="tkm-battle-spark">⚡</div>
              <div class="tkm-battle-item bahar-battle">
                <span id="tkmBaharBattle">❓</span>
              </div>
            </div>
          </div>
          
          <!-- Bahar Tarafı -->
          <div class="tkm-player bahar-side">
            <div class="tkm-player-header">
              <span class="tkm-avatar">🐰</span>
              <span class="tkm-name">Bahar</span>
              <span class="tkm-wins" id="tkmBaharWins">0 🏆</span>
            </div>
            <div class="tkm-choices" id="tkmBaharChoices">
              <button class="tkm-choice" data-player="bahar" data-choice="tas" onclick="tkmSelect('bahar', 'tas')">
                <span class="tkm-emoji">🪨</span>
                <span class="tkm-label">Taş</span>
              </button>
              <button class="tkm-choice" data-player="bahar" data-choice="kagit" onclick="tkmSelect('bahar', 'kagit')">
                <span class="tkm-emoji">📄</span>
                <span class="tkm-label">Kağıt</span>
              </button>
              <button class="tkm-choice" data-player="bahar" data-choice="makas" onclick="tkmSelect('bahar', 'makas')">
                <span class="tkm-emoji">✂️</span>
                <span class="tkm-label">Makas</span>
              </button>
            </div>
            <div class="tkm-status" id="tkmBaharStatus">⏳ Seçim bekliyor...</div>
          </div>
        </div>
        
        <!-- Sonuç Alanı -->
        <div class="tkm-result-area" id="tkmResultArea" style="display: none;">
          <div class="tkm-result-box" id="tkmResultBox">
            <span class="tkm-result-emoji" id="tkmResultEmoji">🎉</span>
            <span class="tkm-result-text" id="tkmResultText">Sonuç</span>
          </div>
          <button class="tkm-new-round" onclick="tkmNewRound()">🔄 Yeni Tur</button>
        </div>
        
        <!-- İstatistikler -->
        <div class="tkm-stats-bar">
          <div class="tkm-stat baran-stat">
            <span class="tkm-stat-emoji">🐧</span>
            <span class="tkm-stat-count" id="tkmStatBaran">0</span>
          </div>
          <div class="tkm-stat draw-stat">
            <span class="tkm-stat-emoji">🤝</span>
            <span class="tkm-stat-count" id="tkmStatDraw">0</span>
          </div>
          <div class="tkm-stat bahar-stat">
            <span class="tkm-stat-emoji">🐰</span>
            <span class="tkm-stat-count" id="tkmStatBahar">0</span>
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// TKM Başlat
async function initTKM() {
  await waitForFirebase();
  
  const db = window.firebaseDb;
  const tkmDocRef = window.firestoreDoc(db, 'miniOyunlar', 'tasKagitMakas');
  
  // İlk kontrol - belge yoksa oluştur
  try {
    const docSnap = await window.firestoreGetDoc(tkmDocRef);
    if (!docSnap.exists()) {
      await window.firestoreSetDoc(tkmDocRef, {
        baranSecim: null,
        baharSecim: null,
        sonuc: null,
        aktif: true,
        stats: { baran: 0, bahar: 0, berabere: 0 }
      });
    }
  } catch (e) {
    console.error('TKM init error:', e);
  }
  
  // Real-time dinle
  tkmUnsubscribe = window.firestoreOnSnapshot(tkmDocRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      tkmState = {
        baranSecim: data.baranSecim,
        baharSecim: data.baharSecim,
        sonuc: data.sonuc,
        aktif: data.aktif !== false
      };
      tkmStatsCache = data.stats || { baran: 0, bahar: 0, berabere: 0 };
      updateTKMUI();
    }
  });
}

// TKM UI Güncelle
function updateTKMUI() {
  const baranStatus = document.getElementById('tkmBaranStatus');
  const baharStatus = document.getElementById('tkmBaharStatus');
  const baranChoices = document.getElementById('tkmBaranChoices');
  const baharChoices = document.getElementById('tkmBaharChoices');
  
  if (!baranStatus) return;
  
  // Baran durumu
  if (tkmState.baranSecim) {
    baranStatus.innerHTML = '✅ Seçim yapıldı!';
    baranStatus.classList.add('selected');
    baranChoices.querySelectorAll('.tkm-choice').forEach(btn => {
      btn.classList.remove('selected');
      if (tkmState.sonuc && btn.dataset.choice === tkmState.baranSecim) {
        btn.classList.add('revealed');
      }
    });
  } else {
    baranStatus.innerHTML = '⏳ Seçim bekliyor...';
    baranStatus.classList.remove('selected');
    baranChoices.querySelectorAll('.tkm-choice').forEach(btn => {
      btn.classList.remove('selected', 'revealed');
    });
  }
  
  // Bahar durumu
  if (tkmState.baharSecim) {
    baharStatus.innerHTML = '✅ Seçim yapıldı!';
    baharStatus.classList.add('selected');
    baharChoices.querySelectorAll('.tkm-choice').forEach(btn => {
      btn.classList.remove('selected');
      if (tkmState.sonuc && btn.dataset.choice === tkmState.baharSecim) {
        btn.classList.add('revealed');
      }
    });
  } else {
    baharStatus.innerHTML = '⏳ Seçim bekliyor...';
    baharStatus.classList.remove('selected');
    baharChoices.querySelectorAll('.tkm-choice').forEach(btn => {
      btn.classList.remove('selected', 'revealed');
    });
  }
  
  // Sonuç göster
  const resultArea = document.getElementById('tkmResultArea');
  const battleDisplay = document.getElementById('tkmBattleDisplay');
  const vsBox = document.getElementById('tkmVsBox');
  
  if (tkmState.sonuc) {
    vsBox.style.display = 'none';
    battleDisplay.style.display = 'flex';
    resultArea.style.display = 'flex';
    
    document.getElementById('tkmBaranBattle').textContent = TKM_EMOJIS[tkmState.baranSecim] || '❓';
    document.getElementById('tkmBaharBattle').textContent = TKM_EMOJIS[tkmState.baharSecim] || '❓';
    
    const resultBox = document.getElementById('tkmResultBox');
    const resultEmoji = document.getElementById('tkmResultEmoji');
    const resultText = document.getElementById('tkmResultText');
    
    resultBox.className = 'tkm-result-box';
    
    if (tkmState.sonuc === 'baran') {
      resultEmoji.textContent = '🐧🏆';
      resultText.textContent = 'Baran Kazandı!';
      resultBox.classList.add('winner-baran');
    } else if (tkmState.sonuc === 'bahar') {
      resultEmoji.textContent = '🐰🏆';
      resultText.textContent = 'Bahar Kazandı!';
      resultBox.classList.add('winner-bahar');
    } else {
      resultEmoji.textContent = '🤝';
      resultText.textContent = 'Berabere!';
      resultBox.classList.add('draw');
    }
  } else {
    vsBox.style.display = 'flex';
    battleDisplay.style.display = 'none';
    resultArea.style.display = 'none';
  }
  
  // İstatistikler
  document.getElementById('tkmStatBaran').textContent = tkmStatsCache.baran || 0;
  document.getElementById('tkmStatBahar').textContent = tkmStatsCache.bahar || 0;
  document.getElementById('tkmStatDraw').textContent = tkmStatsCache.berabere || 0;
  document.getElementById('tkmBaranWins').textContent = `${tkmStatsCache.baran || 0} 🏆`;
  document.getElementById('tkmBaharWins').textContent = `${tkmStatsCache.bahar || 0} 🏆`;
}

// Seçim yap
async function tkmSelect(player, choice) {
  if (tkmState.sonuc) return;
  
  await waitForFirebase();
  
  const db = window.firebaseDb;
  const tkmDocRef = window.firestoreDoc(db, 'miniOyunlar', 'tasKagitMakas');
  
  const choiceBtn = document.querySelector(`.tkm-choice[data-player="${player}"][data-choice="${choice}"]`);
  if (choiceBtn) {
    document.querySelectorAll(`.tkm-choice[data-player="${player}"]`).forEach(btn => btn.classList.remove('selecting'));
    choiceBtn.classList.add('selecting');
  }
  
  try {
    const updateData = {};
    updateData[`${player}Secim`] = choice;
    
    await window.firestoreUpdateDoc(tkmDocRef, updateData);
    
    const docSnap = await window.firestoreGetDoc(tkmDocRef);
    const currentData = docSnap.data();
    
    const baranSec = player === 'baran' ? choice : currentData.baranSecim;
    const baharSec = player === 'bahar' ? choice : currentData.baharSecim;
    
    if (baranSec && baharSec) {
      const sonuc = hesaplaTKMSonuc(baranSec, baharSec);
      const newStats = { ...currentData.stats } || { baran: 0, bahar: 0, berabere: 0 };
      
      if (sonuc === 'baran') newStats.baran = (newStats.baran || 0) + 1;
      else if (sonuc === 'bahar') newStats.bahar = (newStats.bahar || 0) + 1;
      else newStats.berabere = (newStats.berabere || 0) + 1;
      
      await window.firestoreUpdateDoc(tkmDocRef, {
        sonuc: sonuc,
        stats: newStats
      });
    }
    
  } catch (err) {
    console.error('TKM seçim hatası:', err);
  }
}

// Sonuç hesapla
function hesaplaTKMSonuc(baran, bahar) {
  if (baran === bahar) return 'berabere';
  
  if (
    (baran === 'tas' && bahar === 'makas') ||
    (baran === 'kagit' && bahar === 'tas') ||
    (baran === 'makas' && bahar === 'kagit')
  ) {
    return 'baran';
  }
  
  return 'bahar';
}

// Yeni tur
async function tkmNewRound() {
  await waitForFirebase();
  
  const db = window.firebaseDb;
  const tkmDocRef = window.firestoreDoc(db, 'miniOyunlar', 'tasKagitMakas');
  
  try {
    await window.firestoreUpdateDoc(tkmDocRef, {
      baranSecim: null,
      baharSecim: null,
      sonuc: null,
      aktif: true
    });
  } catch (err) {
    console.error('Yeni tur hatası:', err);
  }
}