/* ============================================
   OURHIDDENVERSE - OYUNLAR SAYFASI
   Oynanıyor ve Bitirilen Oyunlar yönetimi
   ============================================ */

// Oyunlar cache
let oynaniyanOyunlarCache = [];
let bitirilenOyunlarCache = [];

// Oyunlar sayfasını yükle
async function loadOyunlarPage() {
  const pageContent = document.getElementById('pageContent');
  
  pageContent.innerHTML = `
    <div class="filmler-container oyunlar-container">
      <div class="filmler-header">
        <h2 class="filmler-title">🎮 Oyunlar</h2>
        <p class="filmler-subtitle">Birlikte oynadığımız oyunlar</p>
        <div class="header-divider"></div>
      </div>

      <div class="oyun-section-card">
        <div class="section-header-box">
          <span class="section-icon">🕹️</span>
          <h3 class="section-title-box">Yeni Oyun Başlat</h3>
        </div>
        <form id="oyunEkleForm" class="oyun-ekleme-form">
          <div class="form-row-oyun">
            <div class="form-group-oyun">
              <label>🎯 Oyun Adı</label>
              <input type="text" id="oyunAdi" placeholder="Oyun adını yaz..." required>
            </div>
            <div class="form-group-oyun">
              <label>📅 Başlama Tarihi</label>
              <input type="date" id="oyunBaslamaTarihi" required>
            </div>
          </div>
          <button type="submit" class="btn-oyun-baslat">
            <span class="btn-icon">▶️</span>
            <span class="btn-text">Oyuna Başla</span>
          </button>
        </form>
      </div>

      <div class="oyun-section-card">
        <div class="section-header-box">
          <span class="section-icon">🎮</span>
          <h3 class="section-title-box">Oynanıyor</h3>
          <span class="section-count" id="oynaniyanCount">0</span>
        </div>
        <div id="oynaniyanOyunlarContainer" class="oyunlar-grid"></div>
        <div id="oynaniyanEmpty" class="empty-state-oyun">
          <span class="empty-icon">🎮</span>
          <p>Henüz oynanan oyun yok</p>
          <span class="empty-hint">Yukarıdan yeni oyun ekleyebilirsin</span>
        </div>
      </div>

      <div class="oyun-section-card">
        <div class="section-header-box">
          <span class="section-icon">🏆</span>
          <h3 class="section-title-box">Bitirilen Oyunlar</h3>
          <span class="section-count" id="bitirilenCount">0</span>
        </div>
        <div id="bitirilenOyunlarContainer" class="oyunlar-grid"></div>
        <div id="bitirilenEmpty" class="empty-state-oyun">
          <span class="empty-icon">🏆</span>
          <p>Henüz bitirilen oyun yok</p>
          <span class="empty-hint">Oynanıyor listesinden oyunları bitirebilirsin</span>
        </div>
      </div>
    </div>

    <div class="modal-overlay" id="oyunBitirModal">
      <div class="modal-content oyun-bitir-modal">
        <div class="modal-header-oyun">
          <span class="modal-icon">🏆</span>
          <h3 class="modal-title">Oyunu Bitir</h3>
        </div>
        <form id="oyunBitirForm">
          <input type="hidden" id="bitirOyunId">
          
          <div class="form-group-oyun modal-form-group">
            <label>📅 Bitiş Tarihi</label>
            <input type="date" id="oyunBitisTarihi" required>
          </div>
          
          <div class="puan-section">
            <div class="puan-card baran-card">
              <label class="puan-card-label">👨 Baran'ın Puanı</label>
              <div class="star-rating" id="baranStars" data-rating="0">
                ${generateStarInputsOyun('baran')}
              </div>
              <span class="puan-display" id="baranPuanDisplay">0/5</span>
            </div>
            
            <div class="puan-card bahar-card">
              <label class="puan-card-label">👩 Bahar'ın Puanı</label>
              <div class="star-rating" id="baharStars" data-rating="0">
                ${generateStarInputsOyun('bahar')}
              </div>
              <span class="puan-display" id="baharPuanDisplay">0/5</span>
            </div>
          </div>
          
          <div class="ortalama-card">
            <label class="ortalama-label">⭐ Ortalama Puan</label>
            <div class="ortalama-stars" id="ortalamaStars">
              ${generateStarDisplayOyun()}
            </div>
            <span class="ortalama-display" id="ortalamaPuanDisplay">0.0</span>
          </div>
          
          <div class="modal-buttons-oyun">
            <button type="button" class="btn-modal-iptal" onclick="closeOyunBitirModal()">
              ❌ İptal
            </button>
            <button type="submit" class="btn-modal-kaydet">
              🏆 Oyunu Bitir
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  const today = new Date().toISOString().split('T')[0];
  document.getElementById('oyunBaslamaTarihi').value = today;

  document.getElementById('oyunEkleForm').addEventListener('submit', handleOyunEkle);
  document.getElementById('oyunBitirForm').addEventListener('submit', handleOyunBitir);

  initStarRatings();
  await loadOyunlarFromFirebase();
}

// Yıldız inputları oluştur
function generateStarInputsOyun(prefix) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    html += `<span class="star" data-value="${i}" data-prefix="${prefix}">☆</span>`;
  }
  return html;
}

// Yıldız display oluştur
function generateStarDisplayOyun() {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    html += `<span class="star display-star">☆</span>`;
  }
  return html;
}

// Yıldız rating eventlerini başlat
function initStarRatings() {
  const starContainers = document.querySelectorAll('.star-rating');
  
  starContainers.forEach(container => {
    const stars = container.querySelectorAll('.star');
    
    stars.forEach(star => {
      star.addEventListener('click', () => {
        const value = parseInt(star.dataset.value);
        const prefix = star.dataset.prefix;
        container.dataset.rating = value;
        
        stars.forEach((s, index) => {
          if (index < value) {
            s.textContent = '★';
            s.classList.add('filled');
          } else {
            s.textContent = '☆';
            s.classList.remove('filled');
          }
        });
        
        document.getElementById(`${prefix}PuanDisplay`).textContent = `${value}/5`;
        updateOrtalamaDisplay();
      });
      
      star.addEventListener('mouseenter', () => {
        const value = parseInt(star.dataset.value);
        stars.forEach((s, index) => {
          if (index < value) {
            s.classList.add('hover');
          } else {
            s.classList.remove('hover');
          }
        });
      });
      
      star.addEventListener('mouseleave', () => {
        stars.forEach(s => s.classList.remove('hover'));
      });
    });
  });
}

// Ortalama puanı güncelle
function updateOrtalamaDisplay() {
  const baranPuan = parseInt(document.getElementById('baranStars').dataset.rating) || 0;
  const baharPuan = parseInt(document.getElementById('baharStars').dataset.rating) || 0;
  
  let ortalama = 0;
  if (baranPuan > 0 && baharPuan > 0) {
    ortalama = (baranPuan + baharPuan) / 2;
  } else if (baranPuan > 0) {
    ortalama = baranPuan;
  } else if (baharPuan > 0) {
    ortalama = baharPuan;
  }
  
  const fullStars = Math.floor(ortalama);
  const hasHalf = ortalama % 1 >= 0.5;
  
  const ortalamaStars = document.querySelectorAll('#ortalamaStars .star');
  ortalamaStars.forEach((star, index) => {
    star.classList.remove('filled', 'half');
    if (index < fullStars) {
      star.textContent = '★';
      star.classList.add('filled');
    } else if (index === fullStars && hasHalf) {
      star.textContent = '★';
      star.classList.add('half');
    } else {
      star.textContent = '☆';
    }
  });
  
  document.getElementById('ortalamaPuanDisplay').textContent = ortalama.toFixed(1);
}

// Firebase'den oyunları yükle
async function loadOyunlarFromFirebase() {
  await waitForFirebase();
  
  try {
    const db = window.firebaseDb;
    
    const oynaniyanQuery = window.firestoreQuery(
      window.firestoreCollection(db, 'oyunlar'),
      window.firestoreOrderBy('baslamaTarihi', 'desc')
    );
    const oynaniyanSnapshot = await window.firestoreGetDocs(oynaniyanQuery);
    
    oynaniyanOyunlarCache = [];
    bitirilenOyunlarCache = [];
    
    oynaniyanSnapshot.forEach((doc) => {
      const data = { id: doc.id, ...doc.data() };
      if (data.bitirildi) {
        bitirilenOyunlarCache.push(data);
      } else {
        oynaniyanOyunlarCache.push(data);
      }
    });
    
    renderOynaniyanOyunlar();
    renderBitirilenOyunlar();
    
  } catch (error) {
    console.error('Oyunlar yüklenirken hata:', error);
  }
}

// Oyun ekleme
async function handleOyunEkle(e) {
  e.preventDefault();
  
  const oyunAdi = document.getElementById('oyunAdi').value.trim();
  const baslamaTarihi = document.getElementById('oyunBaslamaTarihi').value;
  
  if (!oyunAdi || !baslamaTarihi) return;
  
  await waitForFirebase();
  
  try {
    const db = window.firebaseDb;
    const docRef = await window.firestoreAddDoc(
      window.firestoreCollection(db, 'oyunlar'),
      {
        ad: oyunAdi,
        baslamaTarihi: baslamaTarihi,
        bitirildi: false,
        createdAt: window.firestoreServerTimestamp()
      }
    );
    
    oynaniyanOyunlarCache.unshift({
      id: docRef.id,
      ad: oyunAdi,
      baslamaTarihi: baslamaTarihi,
      bitirildi: false
    });
    
    document.getElementById('oyunAdi').value = '';
    renderOynaniyanOyunlar();
    
    console.log('🎮 Oyun eklendi:', oyunAdi);
    
  } catch (error) {
    console.error('Oyun eklenirken hata:', error);
  }
}

// Oyun bitirme modalını aç
function openOyunBitirModal(oyunId) {
  const modal = document.getElementById('oyunBitirModal');
  document.getElementById('bitirOyunId').value = oyunId;
  
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('oyunBitisTarihi').value = today;
  
  document.getElementById('baranStars').dataset.rating = '0';
  document.getElementById('baharStars').dataset.rating = '0';
  
  document.querySelectorAll('.star-rating .star').forEach(star => {
    star.textContent = '☆';
    star.classList.remove('filled');
  });
  document.querySelectorAll('#ortalamaStars .star').forEach(star => {
    star.textContent = '☆';
    star.classList.remove('filled');
  });
  
  document.getElementById('baranPuanDisplay').textContent = '0/5';
  document.getElementById('baharPuanDisplay').textContent = '0/5';
  document.getElementById('ortalamaPuanDisplay').textContent = '0.0';
  
  initStarRatings();
  modal.classList.add('active');
}

// Oyun bitirme modalını kapat
function closeOyunBitirModal() {
  document.getElementById('oyunBitirModal').classList.remove('active');
}

// Oyun bitirme işlemi
async function handleOyunBitir(e) {
  e.preventDefault();
  
  const oyunId = document.getElementById('bitirOyunId').value;
  const bitisTarihi = document.getElementById('oyunBitisTarihi').value;
  const baranPuan = parseInt(document.getElementById('baranStars').dataset.rating) || 0;
  const baharPuan = parseInt(document.getElementById('baharStars').dataset.rating) || 0;
  
  if (!bitisTarihi || baranPuan === 0 || baharPuan === 0) {
    alert('Lütfen bitiş tarihini ve puanları giriniz!');
    return;
  }
  
  const ortalamaPuan = (baranPuan + baharPuan) / 2;
  
  await waitForFirebase();
  
  try {
    const db = window.firebaseDb;
    
    await window.firestoreUpdateDoc(
      window.firestoreDoc(db, 'oyunlar', oyunId),
      {
        bitirildi: true,
        bitisTarihi: bitisTarihi,
        baranPuan: baranPuan,
        baharPuan: baharPuan,
        ortalamaPuan: ortalamaPuan
      }
    );
    
    const oyunIndex = oynaniyanOyunlarCache.findIndex(o => o.id === oyunId);
    if (oyunIndex !== -1) {
      const oyun = oynaniyanOyunlarCache.splice(oyunIndex, 1)[0];
      oyun.bitirildi = true;
      oyun.bitisTarihi = bitisTarihi;
      oyun.baranPuan = baranPuan;
      oyun.baharPuan = baharPuan;
      oyun.ortalamaPuan = ortalamaPuan;
      bitirilenOyunlarCache.unshift(oyun);
    }
    
    closeOyunBitirModal();
    renderOynaniyanOyunlar();
    renderBitirilenOyunlar();
    
    console.log('🏆 Oyun bitirildi!');
    
  } catch (error) {
    console.error('Oyun bitirilirken hata:', error);
  }
}

// Oyun silme
async function deleteOyun(oyunId, bitirildi = false) {
  if (!confirm('Bu oyunu silmek istediğinize emin misiniz?')) return;
  
  await waitForFirebase();
  
  try {
    const db = window.firebaseDb;
    await window.firestoreDeleteDoc(window.firestoreDoc(db, 'oyunlar', oyunId));
    
    if (bitirildi) {
      bitirilenOyunlarCache = bitirilenOyunlarCache.filter(o => o.id !== oyunId);
      renderBitirilenOyunlar();
    } else {
      oynaniyanOyunlarCache = oynaniyanOyunlarCache.filter(o => o.id !== oyunId);
      renderOynaniyanOyunlar();
    }
    
    console.log('🗑️ Oyun silindi');
    
  } catch (error) {
    console.error('Oyun silinirken hata:', error);
  }
}

// Kaç gün hesapla
function hesaplaGunSayisi(baslama, bitis) {
  const baslamaDate = new Date(baslama);
  const bitisDate = new Date(bitis);
  const diffTime = Math.abs(bitisDate - baslamaDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// Tarih formatla
function formatOyunTarih(tarih) {
  if (!tarih) return '';
  const date = new Date(tarih);
  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Oynanıyor oyunları render et
function renderOynaniyanOyunlar() {
  const container = document.getElementById('oynaniyanOyunlarContainer');
  const emptyDiv = document.getElementById('oynaniyanEmpty');
  const countEl = document.getElementById('oynaniyanCount');
  
  if (!container || !emptyDiv) return;
  
  if (countEl) countEl.textContent = oynaniyanOyunlarCache.length;
  
  if (oynaniyanOyunlarCache.length === 0) {
    container.innerHTML = '';
    emptyDiv.style.display = 'flex';
    return;
  }
  
  emptyDiv.style.display = 'none';
  
  container.innerHTML = oynaniyanOyunlarCache.map(oyun => `
    <div class="oyun-card oynaniyor" data-id="${oyun.id}">
      <div class="oyun-card-left">
        <div class="oyun-icon-box">🎮</div>
        <div class="oyun-info">
          <h4 class="oyun-ad">${oyun.ad}</h4>
          <div class="oyun-meta">
            <span class="oyun-tarih">📅 ${formatOyunTarih(oyun.baslamaTarihi)}</span>
            <span class="oyun-status-badge">▶️ Oynanıyor</span>
          </div>
        </div>
      </div>
      <div class="oyun-actions">
        <button class="btn-oyun-tamamla" onclick="openOyunBitirModal('${oyun.id}')" title="Oyunu Bitir">
          <span class="btn-icon">🏆</span>
          <span class="btn-label">Bitir</span>
        </button>
        <button class="btn-oyun-sil" onclick="deleteOyun('${oyun.id}', false)" title="Sil">
          🗑️
        </button>
      </div>
    </div>
  `).join('');
}

// Bitirilen oyunları render et
function renderBitirilenOyunlar() {
  const container = document.getElementById('bitirilenOyunlarContainer');
  const emptyDiv = document.getElementById('bitirilenEmpty');
  const countEl = document.getElementById('bitirilenCount');
  
  if (!container || !emptyDiv) return;
  
  if (countEl) countEl.textContent = bitirilenOyunlarCache.length;
  
  if (bitirilenOyunlarCache.length === 0) {
    container.innerHTML = '';
    emptyDiv.style.display = 'flex';
    return;
  }
  
  emptyDiv.style.display = 'none';
  
  container.innerHTML = bitirilenOyunlarCache.map(oyun => {
    const gunSayisi = hesaplaGunSayisi(oyun.baslamaTarihi, oyun.bitisTarihi);
    
    return `
      <div class="oyun-card bitirildi" data-id="${oyun.id}">
        <div class="oyun-card-header">
          <div class="oyun-icon-box trophy">🏆</div>
          <div class="oyun-header-info">
            <h4 class="oyun-ad">${oyun.ad}</h4>
            <span class="gun-badge">⏱️ ${gunSayisi} günde bitirildi</span>
          </div>
          <button class="btn-oyun-sil" onclick="deleteOyun('${oyun.id}', true)" title="Sil">
            🗑️
          </button>
        </div>
        
        <div class="oyun-tarih-range">
          📅 ${formatOyunTarih(oyun.baslamaTarihi)} → ${formatOyunTarih(oyun.bitisTarihi)}
        </div>
        
        <div class="oyun-puanlar-grid">
          <div class="puan-box baran">
            <span class="puan-kisi">👨 Baran</span>
            <div class="puan-stars">${generateStarHTML(oyun.baranPuan, 'small')}</div>
          </div>
          <div class="puan-box bahar">
            <span class="puan-kisi">👩 Bahar</span>
            <div class="puan-stars">${generateStarHTML(oyun.baharPuan, 'small')}</div>
          </div>
          <div class="puan-box ortalama-box">
            <span class="puan-kisi">⭐ Ortalama</span>
            <div class="puan-stars">${generateStarHTML(oyun.ortalamaPuan, 'small')}</div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Global fonksiyonları dışa aktar
window.loadOyunlarPage = loadOyunlarPage;
window.openOyunBitirModal = openOyunBitirModal;
window.closeOyunBitirModal = closeOyunBitirModal;
window.deleteOyun = deleteOyun;