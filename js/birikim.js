/* ============================================
   KUMBARA / BİRİKİM TAKİP SAYFASI
   2030 Hayallerimiz için biriktiriyoruz! 🐷
   ============================================ */

// Birikim cache
let birikimCache = {
  bahar: 0,
  baran: 0,
  hedef: 50000,
  islemler: []
};

// Para formatla (TL)
function formatPara(miktar) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(miktar);
}

// Birikim sayfasını yükle
async function loadBirikimPage() {
  const pageContent = document.getElementById('pageContent');
  
  pageContent.innerHTML = `
    <div class="birikim-container">
      <!-- Sayfa Başlığı -->
      <div class="birikim-header">
        <h1 class="birikim-title">🐷 Kumbaramız</h1>
        <p class="birikim-subtitle">"2030 Hayallerimiz için biriktiriyoruz!"</p>
        <div class="birikim-divider"></div>
      </div>
      
      <!-- Domuz Kumbara -->
      <div class="kumbara-section">
        <div class="domuz-kumbara">
          <!-- Kulaklar -->
          <div class="domuz-kulaklar">
            <div class="domuz-kulak sol"></div>
            <div class="domuz-kulak sag"></div>
          </div>
          
          <!-- Ana Gövde -->
          <div class="domuz-govde">
            <!-- Para Yarığı -->
            <div class="domuz-para-yeri">
              <div class="para-yarik"></div>
              <span class="para-coin">💰</span>
            </div>
            
            <!-- Yüz -->
            <div class="domuz-yuz">
              <!-- Kaşlar -->
              <div class="domuz-kaslar">
                <div class="domuz-kas sol"></div>
                <div class="domuz-kas sag"></div>
              </div>
              <!-- Gözler -->
              <div class="domuz-gozler">
                <div class="domuz-goz sol">
                  <div class="domuz-goz-bebek"></div>
                </div>
                <div class="domuz-goz sag">
                  <div class="domuz-goz-bebek"></div>
                </div>
              </div>
              <!-- Burun -->
              <div class="domuz-burun">
                <div class="domuz-burun-delik"></div>
                <div class="domuz-burun-delik"></div>
              </div>
            </div>
            
            <!-- Yanaklar -->
            <div class="domuz-yanaklar">
              <div class="domuz-yanak"></div>
              <div class="domuz-yanak"></div>
            </div>
            
            <!-- Yazı ve Toplam -->
            <div class="domuz-yazi">2030 HAYALLERİ</div>
            <div class="domuz-toplam">
              <span class="toplam-label">Toplam Birikim</span>
              <span class="toplam-miktar" id="toplamBirikim">0 ₺</span>
            </div>
          </div>
          
          <!-- Kuyruk -->
          <div class="domuz-kuyruk"></div>
          
          <!-- Ayaklar -->
          <div class="domuz-ayaklar">
            <div class="domuz-ayak"></div>
            <div class="domuz-ayak"></div>
            <div class="domuz-ayak"></div>
            <div class="domuz-ayak"></div>
          </div>
        </div>
        
        <!-- İlerleme Çubuğu -->
        <div class="birikim-progress-container">
          <div class="birikim-progress-bar">
            <div class="birikim-progress-fill" id="birikimProgress"></div>
          </div>
          <div class="birikim-progress-info">
            <span class="progress-current" id="progressCurrent">0 ₺</span>
            <span class="progress-hedef">Hedef: <span id="hedefMiktar">50.000 ₺</span></span>
          </div>
        </div>
      </div>
      
      <!-- Kişisel Birikimler -->
      <div class="kisisel-birikimler">
        <!-- Bahar'ın Birikimi -->
        <div class="kisi-birikim bahar-birikim">
          <div class="kisi-birikim-header">
            <span class="kisi-avatar">👩</span>
            <h3>Bahar'ın Birikimi</h3>
          </div>
          <div class="kisi-toplam">
            <span class="kisi-toplam-miktar" id="baharToplam">0 ₺</span>
          </div>
          <form class="para-ekle-form" onsubmit="paraEkle(event, 'bahar')">
            <div class="para-input-group">
              <span class="para-icon">💵</span>
              <input type="number" id="baharMiktar" placeholder="Miktar (₺)" min="1" required>
            </div>
            <div class="para-input-group">
              <span class="para-icon">📝</span>
              <input type="text" id="baharAciklama" placeholder="Açıklama (opsiyonel)" maxlength="50">
            </div>
            <button type="submit" class="btn-para-ekle bahar">
              <span>💰</span> Para Ekle
            </button>
          </form>
        </div>
        
        <!-- Baran'ın Birikimi -->
        <div class="kisi-birikim baran-birikim">
          <div class="kisi-birikim-header">
            <span class="kisi-avatar">👨</span>
            <h3>Baran'ın Birikimi</h3>
          </div>
          <div class="kisi-toplam">
            <span class="kisi-toplam-miktar" id="baranToplam">0 ₺</span>
          </div>
          <form class="para-ekle-form" onsubmit="paraEkle(event, 'baran')">
            <div class="para-input-group">
              <span class="para-icon">💵</span>
              <input type="number" id="baranMiktar" placeholder="Miktar (₺)" min="1" required>
            </div>
            <div class="para-input-group">
              <span class="para-icon">📝</span>
              <input type="text" id="baranAciklama" placeholder="Açıklama (opsiyonel)" maxlength="50">
            </div>
            <button type="submit" class="btn-para-ekle baran">
              <span>💰</span> Para Ekle
            </button>
          </form>
        </div>
      </div>
      
      <!-- Hedef Ayarlama -->
      <div class="hedef-ayar-section">
        <h3>🎯 Hedef Belirle</h3>
        <div class="hedef-ayar-form">
          <input type="number" id="yeniHedef" placeholder="Yeni hedef (₺)" min="1000" step="1000">
          <button class="btn-hedef-kaydet" onclick="hedefGuncelle()">Hedefi Güncelle</button>
        </div>
      </div>
      
      <!-- İşlem Geçmişi -->
      <div class="islem-gecmisi">
        <h3>📜 İşlem Geçmişi</h3>
        <div class="islem-liste" id="islemListe">
          <div class="loading-spinner">
            <div class="spinner"></div>
            <p>İşlemler yükleniyor...</p>
          </div>
        </div>
      </div>
    </div>
  `;
  
  await loadBirikimFromFirebase();
  renderBirikimUI();
}

// Firebase'den birikim verilerini yükle
async function loadBirikimFromFirebase() {
  await waitForFirebase();
  
  try {
    const db = window.firebaseDb;
    
    // Ana birikim dokümanı
    const birikimDoc = await window.firestoreGetDoc(
      window.firestoreDoc(db, 'birikim', 'toplam')
    );
    
    if (birikimDoc.exists()) {
      const data = birikimDoc.data();
      birikimCache.bahar = data.bahar || 0;
      birikimCache.baran = data.baran || 0;
      birikimCache.hedef = data.hedef || 50000;
    }
    
    // İşlem geçmişi
    const islemlerSnapshot = await window.firestoreGetDocs(
      window.firestoreQuery(
        window.firestoreCollection(db, 'birikim_islemler'),
        window.firestoreOrderBy('tarih', 'desc'),
        window.firestoreLimit(50)
      )
    );
    
    birikimCache.islemler = [];
    islemlerSnapshot.forEach(doc => {
      birikimCache.islemler.push({ id: doc.id, ...doc.data() });
    });
    
    console.log('🐷 Birikim verileri yüklendi');
  } catch (error) {
    console.error('Birikim yüklenirken hata:', error);
  }
}

// UI'ı güncelle
function renderBirikimUI() {
  const toplam = birikimCache.bahar + birikimCache.baran;
  const yuzde = Math.min((toplam / birikimCache.hedef) * 100, 100);
  
  // Toplam
  const toplamEl = document.getElementById('toplamBirikim');
  if (toplamEl) toplamEl.textContent = formatPara(toplam);
  
  // Kişisel toplamlar
  const baharEl = document.getElementById('baharToplam');
  const baranEl = document.getElementById('baranToplam');
  if (baharEl) baharEl.textContent = formatPara(birikimCache.bahar);
  if (baranEl) baranEl.textContent = formatPara(birikimCache.baran);
  
  // Progress bar
  const progressEl = document.getElementById('birikimProgress');
  const currentEl = document.getElementById('progressCurrent');
  const hedefEl = document.getElementById('hedefMiktar');
  
  if (progressEl) progressEl.style.width = `${yuzde}%`;
  if (currentEl) currentEl.textContent = formatPara(toplam);
  if (hedefEl) hedefEl.textContent = formatPara(birikimCache.hedef);
  
  // İşlem listesi
  renderIslemler();
}

// İşlemleri render et
function renderIslemler() {
  const liste = document.getElementById('islemListe');
  if (!liste) return;
  
  if (birikimCache.islemler.length === 0) {
    liste.innerHTML = `
      <div class="islem-bos">
        <span class="islem-bos-icon">🐷</span>
        <p>Henüz işlem yok</p>
        <p class="islem-bos-alt">İlk birikimi ekleyerek başlayın!</p>
      </div>
    `;
    return;
  }
  
  liste.innerHTML = birikimCache.islemler.map(islem => {
    const tarih = islem.tarih?.toDate ? islem.tarih.toDate() : new Date(islem.tarih);
    const tarihStr = tarih.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const kisiClass = islem.kisi === 'bahar' ? 'bahar' : 'baran';
    const kisiEmoji = islem.kisi === 'bahar' ? '👩' : '👨';
    const kisiAd = islem.kisi === 'bahar' ? 'Bahar' : 'Baran';
    
    return `
      <div class="islem-item ${kisiClass}">
        <div class="islem-kisi">
          <span class="islem-emoji">${kisiEmoji}</span>
          <span class="islem-ad">${kisiAd}</span>
        </div>
        <div class="islem-detay">
          <span class="islem-miktar">+${formatPara(islem.miktar)}</span>
          ${islem.aciklama ? `<span class="islem-aciklama">${islem.aciklama}</span>` : ''}
        </div>
        <div class="islem-tarih">${tarihStr}</div>
        <button class="islem-sil-btn" onclick="islemSil('${islem.id}')" title="Sil">🗑️</button>
      </div>
    `;
  }).join('');
}

// Para ekle
async function paraEkle(event, kisi) {
  event.preventDefault();
  
  const miktarInput = document.getElementById(`${kisi}Miktar`);
  const aciklamaInput = document.getElementById(`${kisi}Aciklama`);
  
  const miktar = parseInt(miktarInput.value);
  const aciklama = aciklamaInput.value.trim();
  
  if (!miktar || miktar <= 0) {
    alert('Geçerli bir miktar girin!');
    return;
  }
  
  await waitForFirebase();
  
  try {
    const db = window.firebaseDb;
    
    // Yeni toplam hesapla
    birikimCache[kisi] += miktar;
    
    // Ana dokümanı güncelle
    await window.firestoreSetDoc(
      window.firestoreDoc(db, 'birikim', 'toplam'),
      {
        bahar: birikimCache.bahar,
        baran: birikimCache.baran,
        hedef: birikimCache.hedef,
        updatedAt: window.firestoreServerTimestamp()
      }
    );
    
    // İşlem kaydı ekle
    const islemRef = await window.firestoreAddDoc(
      window.firestoreCollection(db, 'birikim_islemler'),
      {
        kisi: kisi,
        miktar: miktar,
        aciklama: aciklama,
        tarih: window.firestoreServerTimestamp()
      }
    );
    
    // Cache'e ekle
    birikimCache.islemler.unshift({
      id: islemRef.id,
      kisi: kisi,
      miktar: miktar,
      aciklama: aciklama,
      tarih: new Date()
    });
    
    // Formu temizle
    miktarInput.value = '';
    aciklamaInput.value = '';
    
    // UI güncelle
    renderBirikimUI();
    
    // Animasyon efekti
    animateKumbara();
    
    console.log(`🐷 ${kisi} ${miktar}₺ ekledi`);
  } catch (error) {
    console.error('Para eklenirken hata:', error);
    birikimCache[kisi] -= miktar; // Geri al
    alert('Para eklenirken bir hata oluştu!');
  }
}

// Kumbara animasyonu
function animateKumbara() {
  const kumbara = document.querySelector('.domuz-govde');
  if (kumbara) {
    kumbara.classList.add('para-eklendi');
    setTimeout(() => kumbara.classList.remove('para-eklendi'), 600);
  }
}

// Hedef güncelle
async function hedefGuncelle() {
  const hedefInput = document.getElementById('yeniHedef');
  const yeniHedef = parseInt(hedefInput.value);
  
  if (!yeniHedef || yeniHedef < 1000) {
    alert('Hedef en az 1.000₺ olmalıdır!');
    return;
  }
  
  await waitForFirebase();
  
  try {
    const db = window.firebaseDb;
    
    birikimCache.hedef = yeniHedef;
    
    await window.firestoreSetDoc(
      window.firestoreDoc(db, 'birikim', 'toplam'),
      {
        bahar: birikimCache.bahar,
        baran: birikimCache.baran,
        hedef: birikimCache.hedef,
        updatedAt: window.firestoreServerTimestamp()
      }
    );
    
    hedefInput.value = '';
    renderBirikimUI();
    
    console.log(`🎯 Yeni hedef: ${formatPara(yeniHedef)}`);
  } catch (error) {
    console.error('Hedef güncellenirken hata:', error);
    alert('Hedef güncellenirken bir hata oluştu!');
  }
}

// İşlem sil
async function islemSil(islemId) {
  const confirmed = await showConfirmModal({
    icon: '🗑️',
    title: 'İşlemi Sil',
    message: 'Bu işlemi silmek istediğinize emin misiniz? Toplam birikim güncellenecek.',
    confirmText: 'Sil',
    cancelText: 'İptal',
    confirmType: 'danger'
  });
  
  if (!confirmed) return;
  
  await waitForFirebase();
  
  try {
    const db = window.firebaseDb;
    
    // Silinen işlemi bul
    const islem = birikimCache.islemler.find(i => i.id === islemId);
    if (!islem) return;
    
    // Toplamdan düş
    birikimCache[islem.kisi] -= islem.miktar;
    if (birikimCache[islem.kisi] < 0) birikimCache[islem.kisi] = 0;
    
    // Firebase'den sil
    await window.firestoreDeleteDoc(
      window.firestoreDoc(db, 'birikim_islemler', islemId)
    );
    
    // Toplamı güncelle
    await window.firestoreSetDoc(
      window.firestoreDoc(db, 'birikim', 'toplam'),
      {
        bahar: birikimCache.bahar,
        baran: birikimCache.baran,
        hedef: birikimCache.hedef,
        updatedAt: window.firestoreServerTimestamp()
      }
    );
    
    // Cache'den kaldır
    birikimCache.islemler = birikimCache.islemler.filter(i => i.id !== islemId);
    
    renderBirikimUI();
    console.log('🗑️ İşlem silindi');
  } catch (error) {
    console.error('İşlem silinirken hata:', error);
    alert('İşlem silinirken bir hata oluştu!');
  }
}

// Global fonksiyonlar
window.loadBirikimPage = loadBirikimPage;
window.paraEkle = paraEkle;
window.hedefGuncelle = hedefGuncelle;
window.islemSil = islemSil;
