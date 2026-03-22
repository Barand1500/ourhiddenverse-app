/* ============================================
   OURHIDDENVERSE - OYUNLAR SAYFASI
   Online & Hikaye oyun takip sistemi
   ============================================ */

// Cache
let oyunlarCache = [];
let aktifFiltre = 'aktif';

// ---- SAYFA YÜKLEME ----
async function loadOyunlarPage() {
  const pageContent = document.getElementById('pageContent');

  pageContent.innerHTML = `
    <div class="filmler-container oyunlar-container">
      <div class="filmler-header">
        <h2 class="filmler-title">🎮 Oyunlar</h2>
        <p class="filmler-subtitle">Birlikte oynadığımız ve takip ettiğimiz oyunlar</p>
        <div class="header-divider"></div>
      </div>

      <!-- Yeni Oyun Ekleme -->
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
          <div class="form-group-oyun">
            <label>🎲 Oyun Türü</label>
            <div class="oyun-tur-secim">
              <label class="oyun-tur-option selected" data-tur="online">
                <input type="radio" name="oyunTuru" value="online" checked>
                <span class="tur-icon">🌐</span>
                <span class="tur-label">Online</span>
                <span class="tur-desc">Süresiz, ara verilebilir</span>
              </label>
              <label class="oyun-tur-option" data-tur="hikaye">
                <input type="radio" name="oyunTuru" value="hikaye">
                <span class="tur-icon">📖</span>
                <span class="tur-label">Hikaye</span>
                <span class="tur-desc">Bitirilir, tekrar oynanır</span>
              </label>
            </div>
          </div>
          <button type="submit" class="btn-oyun-baslat">
            <span class="btn-icon">▶️</span>
            <span class="btn-text">Oyuna Başla</span>
          </button>
        </form>
      </div>

      <!-- Filtre Tabları -->
      <div class="oyun-filtre-bar">
        <button class="oyun-filtre-tab active" data-filtre="aktif">
          🎮 Aktif <span class="filtre-count" id="aktifCount">0</span>
        </button>
        <button class="oyun-filtre-tab" data-filtre="mola">
          ⏸️ Mola <span class="filtre-count" id="molaCount">0</span>
        </button>
        <button class="oyun-filtre-tab" data-filtre="bitirildi">
          🏆 Bitirildi <span class="filtre-count" id="bitirildiCount">0</span>
        </button>
        <button class="oyun-filtre-tab" data-filtre="hepsi">
          📋 Hepsi <span class="filtre-count" id="hepsiCount">0</span>
        </button>
      </div>

      <!-- Oyunlar Listesi -->
      <div class="oyun-section-card" id="oyunlarListSection">
        <div id="oyunlarListContainer" class="oyunlar-grid"></div>
        <div id="oyunlarEmpty" class="empty-state-oyun">
          <span class="empty-icon">🎮</span>
          <p>Bu kategoride oyun yok</p>
          <span class="empty-hint">Yukarıdan yeni oyun ekleyebilirsin</span>
        </div>
      </div>
    </div>

    <!-- Oyun Bitir Modal -->
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

    <!-- Geçmiş Modal -->
    <div class="modal-overlay" id="oyunGecmisModal">
      <div class="modal-content oyun-gecmis-modal">
        <div class="modal-header-oyun gecmis-header">
          <span class="modal-icon">📜</span>
          <h3 class="modal-title" id="gecmisOyunAd">Oyun Geçmişi</h3>
        </div>
        <div id="gecmisTimeline" class="oyun-timeline"></div>
        <div style="padding: 20px;">
          <button type="button" class="btn-modal-iptal" onclick="closeGecmisModal()" style="width:100%;">
            ✖️ Kapat
          </button>
        </div>
      </div>
    </div>
  `;

  const today = new Date().toISOString().split('T')[0];
  document.getElementById('oyunBaslamaTarihi').value = today;

  document.getElementById('oyunEkleForm').addEventListener('submit', handleOyunEkle);
  document.getElementById('oyunBitirForm').addEventListener('submit', handleOyunBitir);

  initTurSecim();
  initFiltreTablari();
  initStarRatings();

  await loadOyunlarFromFirebase();
}

// ---- TÜR SEÇİM ----
function initTurSecim() {
  document.querySelectorAll('.oyun-tur-option').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.oyun-tur-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      opt.querySelector('input[type="radio"]').checked = true;
    });
  });
}

// ---- FİLTRE TABLARI ----
function initFiltreTablari() {
  document.querySelectorAll('.oyun-filtre-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.oyun-filtre-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      aktifFiltre = tab.dataset.filtre;
      renderOyunlar();
    });
  });
}

// ---- YILDIZ FONKSİYONLARI ----
function generateStarInputsOyun(prefix) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    html += `<span class="star" data-value="${i}" data-prefix="${prefix}">☆</span>`;
  }
  return html;
}

function generateStarDisplayOyun() {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    html += `<span class="star display-star">☆</span>`;
  }
  return html;
}

function initStarRatings() {
  document.querySelectorAll('.star-rating').forEach(container => {
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
          if (index < value) s.classList.add('hover');
          else s.classList.remove('hover');
        });
      });
      star.addEventListener('mouseleave', () => {
        stars.forEach(s => s.classList.remove('hover'));
      });
    });
  });
}

function updateOrtalamaDisplay() {
  const baranPuan = parseInt(document.getElementById('baranStars').dataset.rating) || 0;
  const baharPuan = parseInt(document.getElementById('baharStars').dataset.rating) || 0;
  let ortalama = 0;
  if (baranPuan > 0 && baharPuan > 0) ortalama = (baranPuan + baharPuan) / 2;
  else if (baranPuan > 0) ortalama = baranPuan;
  else if (baharPuan > 0) ortalama = baharPuan;

  const fullStars = Math.floor(ortalama);
  const hasHalf = ortalama % 1 >= 0.5;

  document.querySelectorAll('#ortalamaStars .star').forEach((star, index) => {
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

// ---- YARDIMCI FONKSİYONLAR ----
function hesaplaGunSayisi(baslama, bitis) {
  const diffTime = Math.abs(new Date(bitis) - new Date(baslama));
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function formatOyunTarih(tarih) {
  if (!tarih) return '';
  return new Date(tarih).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function molaSuresiHesapla(gecmis) {
  if (!gecmis || gecmis.length === 0) return '';
  const sonKayit = gecmis[gecmis.length - 1];
  if (sonKayit.aksiyon !== 'mola') return '';
  const molaTarihi = new Date(sonKayit.tarih);
  const bugun = new Date();
  const farkGun = Math.floor((bugun - molaTarihi) / (1000 * 60 * 60 * 24));
  if (farkGun < 30) return `${farkGun} gündür mola`;
  const farkAy = Math.floor(farkGun / 30);
  if (farkAy < 12) return `${farkAy} aydır mola`;
  const farkYil = Math.floor(farkAy / 12);
  return `${farkYil} yıldır mola`;
}

// Eski veriyi yeni formata dönüştür
function migrateOyunData(data) {
  if (data.tur && data.durum && data.gecmis) return data;

  const gecmis = data.gecmis || [{ aksiyon: 'basladi', tarih: data.baslamaTarihi }];
  let durum = data.durum || 'aktif';
  if (!data.durum && data.bitirildi) {
    durum = 'bitirildi';
    if (data.bitisTarihi && !gecmis.find(g => g.aksiyon === 'bitirildi')) {
      gecmis.push({ aksiyon: 'bitirildi', tarih: data.bitisTarihi });
    }
  }

  return {
    ...data,
    tur: data.tur || 'hikaye',
    durum: durum,
    bitisSayisi: data.bitisSayisi || (data.bitirildi ? 1 : 0),
    gecmis: gecmis
  };
}

// ---- FİREBASE YÜKLEME ----
async function loadOyunlarFromFirebase() {
  await waitForFirebase();
  try {
    const db = window.firebaseDb;
    const q = window.firestoreQuery(
      window.firestoreCollection(db, 'oyunlar'),
      window.firestoreOrderBy('baslamaTarihi', 'desc')
    );
    const snapshot = await window.firestoreGetDocs(q);

    oyunlarCache = [];
    snapshot.forEach((doc) => {
      const data = migrateOyunData({ id: doc.id, ...doc.data() });
      oyunlarCache.push(data);
    });

    renderOyunlar();
  } catch (error) {
    console.error('Oyunlar yüklenirken hata:', error);
  }
}

// ---- OYUN EKLEME ----
async function handleOyunEkle(e) {
  e.preventDefault();
  const oyunAdi = document.getElementById('oyunAdi').value.trim();
  const baslamaTarihi = document.getElementById('oyunBaslamaTarihi').value;
  const oyunTuru = document.querySelector('input[name="oyunTuru"]:checked').value;

  if (!oyunAdi || !baslamaTarihi) return;

  await waitForFirebase();
  try {
    const db = window.firebaseDb;
    const yeniOyun = {
      ad: oyunAdi,
      tur: oyunTuru,
      durum: 'aktif',
      baslamaTarihi: baslamaTarihi,
      bitisSayisi: 0,
      gecmis: [{ aksiyon: 'basladi', tarih: baslamaTarihi }],
      createdAt: window.firestoreServerTimestamp()
    };

    const docRef = await window.firestoreAddDoc(
      window.firestoreCollection(db, 'oyunlar'), yeniOyun
    );

    oyunlarCache.unshift({ id: docRef.id, ...yeniOyun });
    document.getElementById('oyunAdi').value = '';

    aktifFiltre = 'aktif';
    document.querySelectorAll('.oyun-filtre-tab').forEach(t => t.classList.remove('active'));
    document.querySelector('.oyun-filtre-tab[data-filtre="aktif"]').classList.add('active');

    renderOyunlar();
    console.log('🎮 Oyun eklendi:', oyunAdi);
  } catch (error) {
    console.error('Oyun eklenirken hata:', error);
  }
}

// ---- MOLA VER ----
async function molaVerOyun(oyunId) {
  const oyun = oyunlarCache.find(o => o.id === oyunId);
  if (!oyun) return;

  const bugun = new Date().toISOString().split('T')[0];
  const yeniGecmis = [...(oyun.gecmis || []), { aksiyon: 'mola', tarih: bugun }];

  await waitForFirebase();
  try {
    const db = window.firebaseDb;
    await window.firestoreUpdateDoc(
      window.firestoreDoc(db, 'oyunlar', oyunId),
      { durum: 'mola', gecmis: yeniGecmis }
    );
    oyun.durum = 'mola';
    oyun.gecmis = yeniGecmis;
    renderOyunlar();
    console.log('⏸️ Mola verildi:', oyun.ad);
  } catch (error) {
    console.error('Mola verilirken hata:', error);
  }
}

// ---- DEVAM ET / GERİ DÖN ----
async function devamEtOyun(oyunId) {
  const oyun = oyunlarCache.find(o => o.id === oyunId);
  if (!oyun) return;

  const bugun = new Date().toISOString().split('T')[0];
  const yeniGecmis = [...(oyun.gecmis || []), { aksiyon: 'devam', tarih: bugun }];

  await waitForFirebase();
  try {
    const db = window.firebaseDb;
    await window.firestoreUpdateDoc(
      window.firestoreDoc(db, 'oyunlar', oyunId),
      { durum: 'aktif', gecmis: yeniGecmis }
    );
    oyun.durum = 'aktif';
    oyun.gecmis = yeniGecmis;

    aktifFiltre = 'aktif';
    document.querySelectorAll('.oyun-filtre-tab').forEach(t => t.classList.remove('active'));
    document.querySelector('.oyun-filtre-tab[data-filtre="aktif"]').classList.add('active');

    renderOyunlar();
    console.log('▶️ Oyuna geri dönüldü:', oyun.ad);
  } catch (error) {
    console.error('Devam ederken hata:', error);
  }
}

// ---- OYUN BİTİR MODAL ----
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

function closeOyunBitirModal() {
  document.getElementById('oyunBitirModal').classList.remove('active');
}

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
  const oyun = oyunlarCache.find(o => o.id === oyunId);
  if (!oyun) return;

  const yeniBitisSayisi = (oyun.bitisSayisi || 0) + 1;
  const yeniGecmis = [...(oyun.gecmis || []), { aksiyon: 'bitirildi', tarih: bitisTarihi }];

  await waitForFirebase();
  try {
    const db = window.firebaseDb;
    await window.firestoreUpdateDoc(
      window.firestoreDoc(db, 'oyunlar', oyunId),
      {
        durum: 'bitirildi',
        bitisTarihi: bitisTarihi,
        baranPuan: baranPuan,
        baharPuan: baharPuan,
        ortalamaPuan: ortalamaPuan,
        bitisSayisi: yeniBitisSayisi,
        gecmis: yeniGecmis
      }
    );

    oyun.durum = 'bitirildi';
    oyun.bitisTarihi = bitisTarihi;
    oyun.baranPuan = baranPuan;
    oyun.baharPuan = baharPuan;
    oyun.ortalamaPuan = ortalamaPuan;
    oyun.bitisSayisi = yeniBitisSayisi;
    oyun.gecmis = yeniGecmis;

    closeOyunBitirModal();

    aktifFiltre = 'bitirildi';
    document.querySelectorAll('.oyun-filtre-tab').forEach(t => t.classList.remove('active'));
    document.querySelector('.oyun-filtre-tab[data-filtre="bitirildi"]').classList.add('active');

    renderOyunlar();
    console.log('🏆 Oyun bitirildi!');
  } catch (error) {
    console.error('Oyun bitirilirken hata:', error);
  }
}

// ---- TEKRAR BAŞLA ----
async function tekrarBaslaOyun(oyunId) {
  const oyun = oyunlarCache.find(o => o.id === oyunId);
  if (!oyun) return;

  const bugun = new Date().toISOString().split('T')[0];
  const yeniGecmis = [...(oyun.gecmis || []), { aksiyon: 'tekrar', tarih: bugun }];

  await waitForFirebase();
  try {
    const db = window.firebaseDb;
    await window.firestoreUpdateDoc(
      window.firestoreDoc(db, 'oyunlar', oyunId),
      { durum: 'aktif', baslamaTarihi: bugun, gecmis: yeniGecmis }
    );
    oyun.durum = 'aktif';
    oyun.baslamaTarihi = bugun;
    oyun.gecmis = yeniGecmis;

    aktifFiltre = 'aktif';
    document.querySelectorAll('.oyun-filtre-tab').forEach(t => t.classList.remove('active'));
    document.querySelector('.oyun-filtre-tab[data-filtre="aktif"]').classList.add('active');

    renderOyunlar();
    console.log('🔄 Tekrar başlandı:', oyun.ad);
  } catch (error) {
    console.error('Tekrar başlatılırken hata:', error);
  }
}

// ---- OYUN SİLME ----
async function deleteOyun(oyunId) {
  if (!confirm('Bu oyunu silmek istediğinize emin misiniz?')) return;

  await waitForFirebase();
  try {
    const db = window.firebaseDb;
    await window.firestoreDeleteDoc(window.firestoreDoc(db, 'oyunlar', oyunId));
    oyunlarCache = oyunlarCache.filter(o => o.id !== oyunId);
    renderOyunlar();
    console.log('🗑️ Oyun silindi');
  } catch (error) {
    console.error('Oyun silinirken hata:', error);
  }
}

// ---- GEÇMİŞ MODAL ----
function openGecmisModal(oyunId) {
  const oyun = oyunlarCache.find(o => o.id === oyunId);
  if (!oyun) return;

  const turText = oyun.tur === 'online' ? '🌐 Online' : '📖 Hikaye';
  document.getElementById('gecmisOyunAd').textContent = `${oyun.ad} - ${turText}`;

  const gecmis = oyun.gecmis || [];
  const timelineHTML = gecmis.map((item, index) => {
    const aksiyonBilgi = getAksiyonBilgi(item.aksiyon);
    const isLast = index === gecmis.length - 1;
    return `
      <div class="timeline-item ${isLast ? 'current' : ''}">
        <div class="timeline-dot ${item.aksiyon}"></div>
        <div class="timeline-content">
          <span class="timeline-aksiyon">${aksiyonBilgi.icon} ${aksiyonBilgi.label}</span>
          <span class="timeline-tarih">${formatOyunTarih(item.tarih)}</span>
        </div>
      </div>
    `;
  }).join('');

  document.getElementById('gecmisTimeline').innerHTML = timelineHTML ||
    '<p style="text-align:center;color:var(--text-muted);padding:30px;">Henüz geçmiş kaydı yok</p>';
  document.getElementById('oyunGecmisModal').classList.add('active');
}

function closeGecmisModal() {
  document.getElementById('oyunGecmisModal').classList.remove('active');
}

function getAksiyonBilgi(aksiyon) {
  const map = {
    'basladi': { icon: '▶️', label: 'Oyuna başlandı' },
    'mola': { icon: '⏸️', label: 'Mola verildi' },
    'devam': { icon: '🔙', label: 'Oyuna geri dönüldü' },
    'bitirildi': { icon: '🏆', label: 'Oyun bitirildi' },
    'tekrar': { icon: '🔄', label: 'Tekrar başlandı' }
  };
  return map[aksiyon] || { icon: '❓', label: aksiyon };
}

// ---- RENDER ----
function renderOyunlar() {
  const container = document.getElementById('oyunlarListContainer');
  const emptyDiv = document.getElementById('oyunlarEmpty');
  if (!container || !emptyDiv) return;

  const aktifList = oyunlarCache.filter(o => o.durum === 'aktif');
  const molaList = oyunlarCache.filter(o => o.durum === 'mola');
  const bitirildiList = oyunlarCache.filter(o => o.durum === 'bitirildi');

  const setCount = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };
  setCount('aktifCount', aktifList.length);
  setCount('molaCount', molaList.length);
  setCount('bitirildiCount', bitirildiList.length);
  setCount('hepsiCount', oyunlarCache.length);

  let filteredList = [];
  if (aktifFiltre === 'aktif') filteredList = aktifList;
  else if (aktifFiltre === 'mola') filteredList = molaList;
  else if (aktifFiltre === 'bitirildi') filteredList = bitirildiList;
  else filteredList = [...oyunlarCache];

  if (filteredList.length === 0) {
    container.innerHTML = '';
    emptyDiv.style.display = 'flex';
    return;
  }

  emptyDiv.style.display = 'none';
  container.innerHTML = filteredList.map(oyun => renderOyunKarti(oyun)).join('');
}

function renderOyunKarti(oyun) {
  const turBadge = oyun.tur === 'online'
    ? '<span class="oyun-tur-badge online-badge">🌐 Online</span>'
    : '<span class="oyun-tur-badge hikaye-badge">📖 Hikaye</span>';

  // ---- AKTİF KART ----
  if (oyun.durum === 'aktif') {
    const gunSayisi = hesaplaGunSayisi(oyun.baslamaTarihi, new Date().toISOString().split('T')[0]);
    const bitisSayisiInfo = oyun.bitisSayisi > 0
      ? `<span class="tekrar-badge">🔄 ${oyun.bitisSayisi}. tekrar</span>` : '';

    let actionButtons = '';
    if (oyun.tur === 'hikaye') {
      actionButtons += `<button class="btn-oyun-action btn-bitir" onclick="openOyunBitirModal('${oyun.id}')" title="Bitir">🏆 Bitir</button>`;
    }
    actionButtons += `<button class="btn-oyun-action btn-mola" onclick="molaVerOyun('${oyun.id}')" title="Mola Ver">⏸️ Mola</button>`;
    actionButtons += `<button class="btn-oyun-action btn-gecmis" onclick="openGecmisModal('${oyun.id}')" title="Geçmiş">📜</button>`;
    actionButtons += `<button class="btn-oyun-sil" onclick="deleteOyun('${oyun.id}')" title="Sil">🗑️</button>`;

    return `
      <div class="oyun-card durum-aktif tur-${oyun.tur}" data-id="${oyun.id}">
        <div class="oyun-card-left">
          <div class="oyun-icon-box aktif-icon">${oyun.tur === 'online' ? '🌐' : '📖'}</div>
          <div class="oyun-info">
            <div class="oyun-name-row">
              <h4 class="oyun-ad">${oyun.ad}</h4>
              ${turBadge}
              ${bitisSayisiInfo}
            </div>
            <div class="oyun-meta">
              <span class="oyun-tarih">📅 ${formatOyunTarih(oyun.baslamaTarihi)}'ten beri</span>
              <span class="oyun-sure-badge">⏱️ ${gunSayisi} gündür oynanıyor</span>
              <span class="oyun-status-badge durum-aktif-badge">▶️ Aktif</span>
            </div>
          </div>
        </div>
        <div class="oyun-actions">${actionButtons}</div>
      </div>
    `;
  }

  // ---- MOLA KART ----
  if (oyun.durum === 'mola') {
    const molaSuresi = molaSuresiHesapla(oyun.gecmis);

    let actionButtons = '';
    actionButtons += `<button class="btn-oyun-action btn-devam" onclick="devamEtOyun('${oyun.id}')" title="Geri Dön">▶️ Geri Dön</button>`;
    actionButtons += `<button class="btn-oyun-action btn-gecmis" onclick="openGecmisModal('${oyun.id}')" title="Geçmiş">📜</button>`;
    actionButtons += `<button class="btn-oyun-sil" onclick="deleteOyun('${oyun.id}')" title="Sil">🗑️</button>`;

    return `
      <div class="oyun-card durum-mola tur-${oyun.tur}" data-id="${oyun.id}">
        <div class="oyun-card-left">
          <div class="oyun-icon-box mola-icon">⏸️</div>
          <div class="oyun-info">
            <div class="oyun-name-row">
              <h4 class="oyun-ad">${oyun.ad}</h4>
              ${turBadge}
            </div>
            <div class="oyun-meta">
              <span class="oyun-mola-sure">😴 ${molaSuresi}</span>
              <span class="oyun-status-badge durum-mola-badge">⏸️ Mola</span>
            </div>
          </div>
        </div>
        <div class="oyun-actions">${actionButtons}</div>
      </div>
    `;
  }

  // ---- BİTİRİLDİ KART ----
  if (oyun.durum === 'bitirildi') {
    const gunSayisi = oyun.bitisTarihi
      ? hesaplaGunSayisi(oyun.baslamaTarihi, oyun.bitisTarihi) : '?';
    const bitisSayisi = oyun.bitisSayisi || 1;

    let actionButtons = '';
    actionButtons += `<button class="btn-oyun-action btn-tekrar" onclick="tekrarBaslaOyun('${oyun.id}')" title="Tekrar Başla">🔄 Tekrar Başla</button>`;
    actionButtons += `<button class="btn-oyun-action btn-gecmis" onclick="openGecmisModal('${oyun.id}')" title="Geçmiş">📜</button>`;
    actionButtons += `<button class="btn-oyun-sil" onclick="deleteOyun('${oyun.id}')" title="Sil">🗑️</button>`;

    return `
      <div class="oyun-card durum-bitirildi tur-${oyun.tur}" data-id="${oyun.id}">
        <div class="oyun-card-header">
          <div class="oyun-icon-box trophy">🏆</div>
          <div class="oyun-header-info">
            <div class="oyun-name-row">
              <h4 class="oyun-ad">${oyun.ad}</h4>
              ${turBadge}
            </div>
            <div class="oyun-bitis-meta">
              <span class="gun-badge">⏱️ ${gunSayisi} günde bitirildi</span>
              ${bitisSayisi > 1 ? `<span class="bitis-sayisi-badge">🔄 ${bitisSayisi}. kez bitirildi</span>` : ''}
            </div>
          </div>
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
        <div class="oyun-card-footer">${actionButtons}</div>
      </div>
    `;
  }

  return '';
}

// ---- GLOBAL FONKSİYONLAR ----
window.loadOyunlarPage = loadOyunlarPage;
window.openOyunBitirModal = openOyunBitirModal;
window.closeOyunBitirModal = closeOyunBitirModal;
window.closeGecmisModal = closeGecmisModal;
window.openGecmisModal = openGecmisModal;
window.deleteOyun = deleteOyun;
window.molaVerOyun = molaVerOyun;
window.devamEtOyun = devamEtOyun;
window.tekrarBaslaOyun = tekrarBaslaOyun;
