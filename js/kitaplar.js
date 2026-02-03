/* ============================================
   OURHIDDENVERSE - KİTAPLAR SAYFASI
   ============================================ */

// Kitaplar cache
let kitaplarCache = [];
let aktifKitapFiltre = 'bahar';

// Kitaplar sayfasını yükle
async function loadKitaplarPage() {
  const pageContent = document.getElementById('pageContent');
  
  pageContent.innerHTML = `
    <div class="kitaplar-container">
      <div class="kitaplar-header">
        <div class="kitaplar-title-section">
          <span class="section-icon">📚</span>
          <h2 class="section-title-box">KİTAPLAR</h2>
        </div>
        <button class="btn-yeni-kitap" onclick="openKitapModal()">
          <span class="btn-icon">+</span>
          <span class="btn-text">Yeni Kitap</span>
        </button>
      </div>
      
      <div class="kitap-filtre-container">
        <button class="kitap-filtre-btn active" data-filtre="bahar" onclick="setKitapFiltre('bahar')">
          <span>👩</span> Bahar
        </button>
        <button class="kitap-filtre-btn" data-filtre="baran" onclick="setKitapFiltre('baran')">
          <span>👨</span> Baran
        </button>
        <button class="kitap-filtre-btn" data-filtre="ortak" onclick="setKitapFiltre('ortak')">
          <span>💕</span> Ortak
        </button>
      </div>
      
      <div class="kitap-section">
        <div class="kitap-section-header">
          <h3>📖 Okunacak Kitaplar</h3>
          <span class="kitap-count" id="okunacakCount">0</span>
        </div>
        <div class="okunacak-kitaplar-box" id="okunacakKitaplarContainer"></div>
      </div>
      
      <div class="kitap-section">
        <div class="kitap-section-header">
          <h3>✅ Okunan Kitaplar</h3>
          <span class="kitap-count" id="okunanCount">0</span>
        </div>
        <div class="okunan-kitaplar-grid" id="okunanKitaplarContainer"></div>
      </div>
      
      <div class="modal-overlay" id="kitapModal">
        <div class="modal-content kitap-modal">
          <div class="modal-header">
            <h3>📚 Yeni Kitap Ekle</h3>
            <button class="btn-modal-close" onclick="closeKitapModal()">×</button>
          </div>
          <form id="kitapForm" onsubmit="handleKitapEkle(event)">
            <div class="form-group">
              <label>Kitap Adı</label>
              <input type="text" id="kitapAdi" placeholder="Kitap adını girin..." required>
            </div>
            <div class="form-group">
              <label>Kime Ait?</label>
              <div class="sahip-secim">
                <label class="sahip-option">
                  <input type="radio" name="kitapSahip" value="bahar" checked>
                  <span class="sahip-label">👩 Bahar</span>
                </label>
                <label class="sahip-option">
                  <input type="radio" name="kitapSahip" value="baran">
                  <span class="sahip-label">👨 Baran</span>
                </label>
              </div>
            </div>
            <button type="submit" class="btn-kaydet">📚 Kitap Ekle</button>
          </form>
        </div>
      </div>
      
      <div class="modal-overlay" id="kitapBitirModal">
        <div class="modal-content kitap-modal kitap-bitir-modal">
          <div class="modal-header">
            <h3>✅ Kitabı Bitir</h3>
            <button class="btn-modal-close" onclick="closeKitapBitirModal()">×</button>
          </div>
          <form id="kitapBitirForm" onsubmit="handleKitapBitir(event)">
            <input type="hidden" id="bitirKitapId">
            <div class="form-group">
              <label>🖼️ Kapak Görseli URL (opsiyonel)</label>
              <input type="url" id="kitapBitirKapak" placeholder="https://...">
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>📅 Başlama Tarihi</label>
                <input type="date" id="kitapBitirBaslama" required>
              </div>
              <div class="form-group">
                <label>📅 Bitiş Tarihi</label>
                <input type="date" id="kitapBitirBitis" required>
              </div>
            </div>
            <div class="form-group">
              <label>📄 Sayfa Sayısı</label>
              <input type="number" id="kitapSayfaSayisi" min="1" placeholder="Sayfa sayısı..." required>
            </div>
            <div class="form-group">
              <label>⭐ Puan</label>
              <div class="kitap-star-rating" id="kitapStarRating">
                <span class="star" data-value="1">☆</span>
                <span class="star" data-value="2">☆</span>
                <span class="star" data-value="3">☆</span>
                <span class="star" data-value="4">☆</span>
                <span class="star" data-value="5">☆</span>
              </div>
              <input type="hidden" id="kitapPuan" value="0">
            </div>
            <button type="submit" class="btn-kaydet">✅ Kitabı Bitir</button>
          </form>
        </div>
      </div>
    </div>
  `;
  
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('kitapBitirBitis').value = today;
  
  initKitapStarRating();
  await loadKitaplarFromFirebase();
}

// Yıldız rating eventleri
function initKitapStarRating() {
  const container = document.getElementById('kitapStarRating');
  if (!container) return;
  
  const stars = container.querySelectorAll('.star');
  
  stars.forEach(star => {
    star.addEventListener('click', () => {
      const value = parseInt(star.dataset.value);
      document.getElementById('kitapPuan').value = value;
      
      stars.forEach((s, index) => {
        if (index < value) {
          s.textContent = '★';
          s.classList.add('filled');
        } else {
          s.textContent = '☆';
          s.classList.remove('filled');
        }
      });
    });
    
    star.addEventListener('mouseenter', () => {
      const value = parseInt(star.dataset.value);
      stars.forEach((s, index) => {
        if (index < value) s.classList.add('hover');
        else s.classList.remove('hover');
      });
    });
    
    star.addEventListener('mouseleave', () => {
      stars.forEach(s => s.classList.remove('hover'));
    });
  });
}

// Firebase'den kitapları yükle
async function loadKitaplarFromFirebase() {
  await waitForFirebase();
  
  try {
    const db = window.firebaseDb;
    const kitaplarQuery = window.firestoreQuery(
      window.firestoreCollection(db, 'books'),
      window.firestoreOrderBy('createdAt', 'desc')
    );
    
    const snapshot = await window.firestoreGetDocs(kitaplarQuery);
    
    kitaplarCache = [];
    snapshot.forEach(doc => {
      kitaplarCache.push({ id: doc.id, ...doc.data() });
    });
    
    renderKitaplar();
  } catch (error) {
    console.error('Kitaplar yüklenirken hata:', error);
  }
}

// Kitap filtresi değiştir
function setKitapFiltre(filtre) {
  aktifKitapFiltre = filtre;
  
  document.querySelectorAll('.kitap-filtre-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.filtre === filtre) {
      btn.classList.add('active');
    }
  });
  
  renderKitaplar();
}

// Ortak kitapları bul
function getOrtakKitaplar() {
  const kitapGruplari = {};
  
  kitaplarCache.forEach(kitap => {
    const key = kitap.ad.toLowerCase().trim();
    if (!kitapGruplari[key]) {
      kitapGruplari[key] = [];
    }
    kitapGruplari[key].push(kitap);
  });
  
  const ortaklar = [];
  Object.values(kitapGruplari).forEach(grup => {
    const sahipler = [...new Set(grup.map(k => k.sahip))];
    if (sahipler.includes('bahar') && sahipler.includes('baran')) {
      ortaklar.push({
        ad: grup[0].ad,
        bahar: grup.find(k => k.sahip === 'bahar'),
        baran: grup.find(k => k.sahip === 'baran')
      });
    }
  });
  
  return ortaklar;
}

// Gün sayısı hesapla
function hesaplaKitapGunSayisi(baslama, bitis) {
  if (!baslama || !bitis) return '-';
  const d1 = new Date(baslama);
  const d2 = new Date(bitis);
  const diff = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
  return diff >= 0 ? diff + 1 : 1;
}

// Tarih formatla
function formatKitapTarih(tarih) {
  if (!tarih) return '-';
  const d = new Date(tarih);
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Kitapları render et
function renderKitaplar() {
  const okunacakContainer = document.getElementById('okunacakKitaplarContainer');
  const okunacakCount = document.getElementById('okunacakCount');
  const okunanCount = document.getElementById('okunanCount');
  
  if (aktifKitapFiltre === 'ortak') {
    renderOrtakKitaplar();
    return;
  }
  
  const filtreliKitaplar = kitaplarCache.filter(k => k.sahip === aktifKitapFiltre);
  const okunacaklar = filtreliKitaplar.filter(k => k.durum === 'okunacak');
  const okunanlar = filtreliKitaplar.filter(k => k.durum === 'okunmus');
  
  okunacakCount.textContent = okunacaklar.length;
  okunanCount.textContent = okunanlar.length;
  
  if (okunacaklar.length === 0) {
    okunacakContainer.innerHTML = `
      <div class="kitap-empty">
        <span class="empty-icon">📚</span>
        <p>Henüz okunacak kitap eklenmemiş</p>
      </div>
    `;
  } else {
    okunacakContainer.innerHTML = okunacaklar.map(kitap => `
      <div class="okunacak-kitap-item">
        <div class="kitap-info">
          <div class="kitap-kapak-placeholder">📖</div>
          <span class="kitap-adi">${kitap.ad}</span>
        </div>
        <div class="kitap-actions">
          <button class="btn-kitap-bitir" onclick="openKitapBitirModal('${kitap.id}')" title="Kitabı Bitir">
            ✅ Bitir
          </button>
          <button class="btn-kitap-sil" onclick="deleteKitap('${kitap.id}')" title="Sil">🗑️</button>
        </div>
      </div>
    `).join('');
  }
  
  const okunanContainer = document.getElementById('okunanKitaplarContainer');
  
  if (okunanlar.length === 0) {
    okunanContainer.innerHTML = `
      <div class="kitap-empty">
        <span class="empty-icon">📖</span>
        <p>Henüz okunan kitap yok</p>
      </div>
    `;
  } else {
    okunanContainer.innerHTML = okunanlar.map(kitap => {
      const gunSayisi = hesaplaKitapGunSayisi(kitap.baslamaTarihi, kitap.bitisTarihi);
      return `
        <div class="okunan-kitap-card">
          <div class="okunan-kitap-kapak">
            ${kitap.kapakUrl ? `<img src="${kitap.kapakUrl}" alt="${kitap.ad}">` : '<span class="kapak-placeholder">📚</span>'}
          </div>
          <div class="okunan-kitap-detay">
            <h4 class="okunan-kitap-adi">${kitap.ad}</h4>
            <div class="okunan-kitap-meta">
              <span class="meta-item">📄 ${kitap.sayfaSayisi || '?'} sayfa</span>
              <span class="meta-item">⏱️ ${gunSayisi} günde</span>
            </div>
            <div class="okunan-kitap-tarihler">
              <span>${formatKitapTarih(kitap.baslamaTarihi)} → ${formatKitapTarih(kitap.bitisTarihi)}</span>
            </div>
            <div class="okunan-kitap-puan">
              ${generateStarHTML(kitap.puan || 0, 'small')}
            </div>
          </div>
          <button class="btn-kitap-sil-mini" onclick="deleteKitap('${kitap.id}')" title="Sil">×</button>
        </div>
      `;
    }).join('');
  }
}

// Durum metni
function getDurumText(durum) {
  switch(durum) {
    case 'okunacak': return '📋 Okunacak';
    case 'okunuyor': return '📖 Okunuyor';
    case 'okunmus': return '✅ Okundu';
    default: return '❌ Eklenmemiş';
  }
}

// Ortak kitapları render et
function renderOrtakKitaplar() {
  const okunacakContainer = document.getElementById('okunacakKitaplarContainer');
  const okunanContainer = document.getElementById('okunanKitaplarContainer');
  const okunacakCount = document.getElementById('okunacakCount');
  const okunanCount = document.getElementById('okunanCount');
  
  const ortakKitaplar = getOrtakKitaplar();
  
  const okunacakOrtaklar = ortakKitaplar.filter(o => 
    (o.bahar && o.bahar.durum !== 'okunmus') || (o.baran && o.baran.durum !== 'okunmus')
  );
  
  const okunanOrtaklar = ortakKitaplar.filter(o => 
    o.bahar && o.bahar.durum === 'okunmus' && o.baran && o.baran.durum === 'okunmus'
  );
  
  okunacakCount.textContent = okunacakOrtaklar.length;
  okunanCount.textContent = okunanOrtaklar.length;
  
  if (okunacakOrtaklar.length === 0) {
    okunacakContainer.innerHTML = `
      <div class="kitap-empty">
        <span class="empty-icon">💕</span>
        <p>Ortak kitap bulunamadı</p>
        <small>Aynı kitabı hem Bahar hem Baran eklediğinde burada görünür</small>
      </div>
    `;
  } else {
    okunacakContainer.innerHTML = okunacakOrtaklar.map(ortak => `
      <div class="ortak-kitap-card">
        <div class="ortak-kitap-baslik">"${ortak.ad}"</div>
        <div class="ortak-kitap-grid">
          <div class="ortak-kisi bahar">
            <span class="kisi-icon">👩 Bahar</span>
            <span class="durum-badge ${ortak.bahar?.durum || 'yok'}">${getDurumText(ortak.bahar?.durum)}</span>
          </div>
          <div class="ortak-kisi baran">
            <span class="kisi-icon">👨 Baran</span>
            <span class="durum-badge ${ortak.baran?.durum || 'yok'}">${getDurumText(ortak.baran?.durum)}</span>
          </div>
        </div>
      </div>
    `).join('');
  }
  
  if (okunanOrtaklar.length === 0) {
    okunanContainer.innerHTML = `
      <div class="kitap-empty">
        <span class="empty-icon">📖</span>
        <p>Henüz birlikte bitirilen kitap yok</p>
      </div>
    `;
  } else {
    okunanContainer.innerHTML = okunanOrtaklar.map(ortak => `
      <div class="ortak-okunan-card">
        <div class="ortak-kitap-baslik">"${ortak.ad}"</div>
        <div class="ortak-puanlar">
          <div class="ortak-puan bahar">
            <span>👩 Bahar</span>
            ${generateStarHTML(ortak.bahar?.puan || 0, 'small')}
          </div>
          <div class="ortak-puan baran">
            <span>👨 Baran</span>
            ${generateStarHTML(ortak.baran?.puan || 0, 'small')}
          </div>
        </div>
      </div>
    `).join('');
  }
}

// Modal aç/kapat
function openKitapModal() {
  document.getElementById('kitapModal').classList.add('active');
  document.getElementById('kitapAdi').value = '';
}

function closeKitapModal() {
  document.getElementById('kitapModal').classList.remove('active');
}

function openKitapBitirModal(kitapId) {
  document.getElementById('kitapBitirModal').classList.add('active');
  document.getElementById('bitirKitapId').value = kitapId;
  document.getElementById('kitapBitirKapak').value = '';
  document.getElementById('kitapBitirBaslama').value = '';
  document.getElementById('kitapBitirBitis').value = new Date().toISOString().split('T')[0];
  document.getElementById('kitapSayfaSayisi').value = '';
  document.getElementById('kitapPuan').value = 0;
  
  document.querySelectorAll('#kitapStarRating .star').forEach(s => {
    s.textContent = '☆';
    s.classList.remove('filled');
  });
  
  initKitapStarRating();
}

function closeKitapBitirModal() {
  document.getElementById('kitapBitirModal').classList.remove('active');
}

// Kitap ekle
async function handleKitapEkle(e) {
  e.preventDefault();
  
  const ad = document.getElementById('kitapAdi').value.trim();
  const sahip = document.querySelector('input[name="kitapSahip"]:checked').value;
  
  if (!ad) return;
  
  await waitForFirebase();
  
  try {
    const db = window.firebaseDb;
    const docRef = await window.firestoreAddDoc(
      window.firestoreCollection(db, 'books'),
      {
        ad: ad,
        sahip: sahip,
        kapakUrl: null,
        durum: 'okunacak',
        baslamaTarihi: null,
        bitisTarihi: null,
        sayfaSayisi: null,
        puan: null,
        createdAt: window.firestoreServerTimestamp()
      }
    );
    
    kitaplarCache.unshift({
      id: docRef.id,
      ad: ad,
      sahip: sahip,
      kapakUrl: null,
      durum: 'okunacak',
      baslamaTarihi: null,
      bitisTarihi: null,
      sayfaSayisi: null,
      puan: null
    });
    
    closeKitapModal();
    setKitapFiltre(sahip);
    
    console.log('📚 Kitap eklendi:', ad);
  } catch (error) {
    console.error('Kitap eklenirken hata:', error);
  }
}

// Kitabı bitir
async function handleKitapBitir(e) {
  e.preventDefault();
  
  const kitapId = document.getElementById('bitirKitapId').value;
  const kapakUrl = document.getElementById('kitapBitirKapak').value.trim();
  const baslamaTarihi = document.getElementById('kitapBitirBaslama').value;
  const bitisTarihi = document.getElementById('kitapBitirBitis').value;
  const sayfaSayisi = parseInt(document.getElementById('kitapSayfaSayisi').value) || 0;
  const puan = parseInt(document.getElementById('kitapPuan').value) || 0;
  
  if (!baslamaTarihi || !bitisTarihi || sayfaSayisi === 0 || puan === 0) {
    alert('Lütfen tüm alanları doldurunuz!');
    return;
  }
  
  await waitForFirebase();
  
  try {
    const db = window.firebaseDb;
    await window.firestoreUpdateDoc(
      window.firestoreDoc(db, 'books', kitapId),
      {
        durum: 'okunmus',
        kapakUrl: kapakUrl || null,
        baslamaTarihi: baslamaTarihi,
        bitisTarihi: bitisTarihi,
        sayfaSayisi: sayfaSayisi,
        puan: puan
      }
    );
    
    const kitap = kitaplarCache.find(k => k.id === kitapId);
    if (kitap) {
      kitap.durum = 'okunmus';
      kitap.kapakUrl = kapakUrl || null;
      kitap.baslamaTarihi = baslamaTarihi;
      kitap.bitisTarihi = bitisTarihi;
      kitap.sayfaSayisi = sayfaSayisi;
      kitap.puan = puan;
    }
    
    closeKitapBitirModal();
    renderKitaplar();
    
    console.log('✅ Kitap bitirildi');
  } catch (error) {
    console.error('Kitap bitirilirken hata:', error);
  }
}

// Kitap sil
async function deleteKitap(kitapId) {
  if (!confirm('Bu kitabı silmek istediğinize emin misiniz?')) return;
  
  try {
    await waitForFirebase();
    const db = window.firebaseDb;
    
    await window.firestoreDeleteDoc(window.firestoreDoc(db, 'books', kitapId));
    
    kitaplarCache = kitaplarCache.filter(k => k.id !== kitapId);
    renderKitaplar();
    console.log('🗑️ Kitap silindi');
  } catch (error) {
    console.error('Kitap silinirken hata:', error);
  }
}

// Global fonksiyonlar
window.loadKitaplarPage = loadKitaplarPage;
window.openKitapModal = openKitapModal;
window.closeKitapModal = closeKitapModal;
window.openKitapBitirModal = openKitapBitirModal;
window.closeKitapBitirModal = closeKitapBitirModal;
window.setKitapFiltre = setKitapFiltre;
window.handleKitapEkle = handleKitapEkle;
window.handleKitapBitir = handleKitapBitir;
window.deleteKitap = deleteKitap;
