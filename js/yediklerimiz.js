/* ============================================
   OURHIDDENVERSE - YEDİKLERİMİZ SAYFASI
   Restoran değerlendirme sistemi
   ============================================ */

// Firestore koleksiyon ismi
const RESTORAN_KOLEKSIYON = 'restoranlar';

// Local cache
let restoranlarCache = [];

// Puan görünüm modu
let restoranPuanGorunumu = localStorage.getItem('restoranPuanGorunumu') || 'yildiz';

// Sıralama durumu
let restoranSortField = 'tarih';
let restoranSortOrder = 'desc';

// Yediklerimiz sayfasını yükle
async function loadYediklerimizPage() {
  await waitForFirebase();
  console.log("🍽️ Yediklerimiz sayfası yükleniyor...");
  
  const pageContent = document.getElementById('pageContent');
  pageContent.innerHTML = `
    <div class="yediklerimiz-container">
      <!-- Başlık ve Butonlar -->
      <div class="yediklerimiz-header">
        <h2>🍽️ Yediklerimiz</h2>
        <p class="yediklerimiz-subtitle">Birlikte denediğimiz lezzetler</p>
        <div class="yediklerimiz-header-buttons">
          <button class="btn-puan-toggle" id="btnPuanToggleRestoran" onclick="toggleRestoranPuanGorunumu()" title="Puan görünümünü değiştir">
            <span class="toggle-icon">${restoranPuanGorunumu === 'yildiz' ? '⭐' : '🔢'}</span>
            <span class="toggle-text">${restoranPuanGorunumu === 'yildiz' ? 'Yıldız' : 'Sayı'}</span>
          </button>
          <button class="btn-yeni-restoran" id="btnYeniRestoran">
            <span class="btn-icon">+</span>
            <span>Yeni Restoran Ekle</span>
          </button>
        </div>
      </div>

      <!-- Filtre ve Sıralama -->
      <div class="yediklerimiz-filters">
        <div class="filter-group">
          <label>Sırala:</label>
          <select id="restoranSortSelect" onchange="changeRestoranSort()">
            <option value="tarih-desc">Tarihe Göre (Yeni → Eski)</option>
            <option value="tarih-asc">Tarihe Göre (Eski → Yeni)</option>
            <option value="ortalama-desc">Puana Göre (Yüksek → Düşük)</option>
            <option value="ortalama-asc">Puana Göre (Düşük → Yüksek)</option>
            <option value="isim-asc">İsme Göre (A → Z)</option>
            <option value="isim-desc">İsme Göre (Z → A)</option>
          </select>
        </div>
        <div class="filter-stats">
          <span id="restoranStats">0 restoran</span>
        </div>
      </div>

      <!-- Restoran Kartları Grid -->
      <div class="restoranlar-grid" id="restoranlarGrid">
        <div class="loading-indicator">Yükleniyor...</div>
      </div>
      
      <!-- Boş Durum -->
      <div class="restoranlar-empty" id="restoranlarEmpty" style="display: none;">
        <span class="empty-icon">🍽️</span>
        <p>Henüz restoran eklenmemiş.</p>
        <p>İlk restoranınızı eklemek için butona tıklayın!</p>
      </div>
    </div>

    <!-- Yeni Restoran Modal -->
    <div class="modal-overlay" id="restoranModal">
      <div class="modal-content restoran-modal">
        <div class="modal-header">
          <h3 id="restoranModalTitle">Yeni Restoran Ekle</h3>
          <button class="btn-modal-close" id="btnRestoranModalClose">×</button>
        </div>
        <form class="modal-form restoran-form" id="restoranForm">
          <input type="hidden" id="restoranEditId" value="">
          
          <div class="form-row">
            <div class="form-group">
              <label for="restoranAdi">Restoran Adı *</label>
              <input type="text" id="restoranAdi" placeholder="Örn: Pizza Hut" required>
            </div>
            <div class="form-group">
              <label for="restoranTarihi">Gittiğimiz Tarih *</label>
              <input type="date" id="restoranTarihi" required>
            </div>
          </div>
          
          <div class="form-group">
            <label for="restoranKonum">Konum / Adres</label>
            <input type="text" id="restoranKonum" placeholder="Örn: Kadıköy, İstanbul">
          </div>
          
          <div class="form-group">
            <label for="restoranNeYedik">🍴 Ne Yedik?</label>
            <textarea id="restoranNeYedik" placeholder="Hangi yemekleri sipariş ettik..." rows="3"></textarea>
          </div>
          
          <div class="form-group">
            <label for="restoranAciklama">Açıklama / Notlar</label>
            <textarea id="restoranAciklama" placeholder="Ortam nasıldı, izlenimler..." rows="3"></textarea>
          </div>
          
          <div class="form-group">
            <label>Fotoğraf</label>
            ${createFotoUploadHTML('restoranFoto', 'restoranFotoPreview')}
          </div>
          
          <div class="form-row puanlama-row">
            <div class="form-group puan-group">
              <label>Baran'ın Puanı</label>
              <div class="puan-selector" id="baranPuanSelector">
                ${generatePuanSelector('baran')}
              </div>
              <input type="hidden" id="baranPuan" value="0">
            </div>
            <div class="form-group puan-group">
              <label>Bahar'ın Puanı</label>
              <div class="puan-selector" id="baharPuanSelector">
                ${generatePuanSelector('bahar')}
              </div>
              <input type="hidden" id="baharPuan" value="0">
            </div>
          </div>
          
          <div class="form-actions">
            <button type="button" class="btn-iptal" onclick="closeRestoranModal()">İptal</button>
            <button type="submit" class="btn-kaydet">Kaydet</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Restoran Detay Modal -->
    <div class="modal-overlay" id="restoranDetayModal">
      <div class="modal-content restoran-detay-modal">
        <button class="btn-modal-close" id="btnDetayModalClose">×</button>
        <div id="restoranDetayContent"></div>
      </div>
    </div>
  `;

  setupYediklerimizEventListeners();
  await loadRestoranlarFromFirestore();
  
  console.log('🍽️ Yediklerimiz sayfası yüklendi');
}

// Puan seçici HTML oluştur
function generatePuanSelector(kim) {
  let html = '';
  for (let i = 1; i <= 10; i++) {
    html += `<span class="puan-btn" data-puan="${i}" data-kim="${kim}" onclick="selectPuan('${kim}', ${i})">${i}</span>`;
  }
  return html;
}

// Puan seç
function selectPuan(kim, puan) {
  // Eski seçimi kaldır
  document.querySelectorAll(`#${kim}PuanSelector .puan-btn`).forEach(btn => {
    btn.classList.remove('selected');
  });
  
  // Yeni seçimi işaretle
  const selectedBtn = document.querySelector(`#${kim}PuanSelector .puan-btn[data-puan="${puan}"]`);
  if (selectedBtn) {
    selectedBtn.classList.add('selected');
  }
  
  // Hidden input güncelle
  document.getElementById(`${kim}Puan`).value = puan;
}

// Event listener'ları ayarla
function setupYediklerimizEventListeners() {
  const btnYeni = document.getElementById('btnYeniRestoran');
  const modal = document.getElementById('restoranModal');
  const btnClose = document.getElementById('btnRestoranModalClose');
  const form = document.getElementById('restoranForm');
  const detayModal = document.getElementById('restoranDetayModal');
  const btnDetayClose = document.getElementById('btnDetayModalClose');
  
  // Yeni restoran butonu
  btnYeni.addEventListener('click', () => {
    resetRestoranForm();
    document.getElementById('restoranModalTitle').textContent = 'Yeni Restoran Ekle';
    modal.classList.add('active');
    document.getElementById('restoranAdi').focus();
  });
  
  // Modal kapatma
  btnClose.addEventListener('click', closeRestoranModal);
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeRestoranModal();
  });
  
  // Detay modal kapatma
  btnDetayClose.addEventListener('click', () => {
    detayModal.classList.remove('active');
  });
  
  detayModal.addEventListener('click', (e) => {
    if (e.target === detayModal) detayModal.classList.remove('active');
  });
  
  // Form gönderme
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await saveRestoran();
  });
  
  // ESC tuşu
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (modal.classList.contains('active')) closeRestoranModal();
      if (detayModal.classList.contains('active')) detayModal.classList.remove('active');
    }
  });
}

// Modal kapat
function closeRestoranModal() {
  document.getElementById('restoranModal').classList.remove('active');
  resetRestoranForm();
}

// Form sıfırla
function resetRestoranForm() {
  document.getElementById('restoranForm').reset();
  document.getElementById('restoranEditId').value = '';
  document.getElementById('baranPuan').value = '0';
  document.getElementById('baharPuan').value = '0';
  
  // Puan seçicileri sıfırla
  document.querySelectorAll('.puan-btn').forEach(btn => btn.classList.remove('selected'));
  
  // Fotoğraf önizlemesini sıfırla
  if (typeof removeFotoPreview === 'function') {
    const preview = document.getElementById('restoranFotoPreview');
    const placeholder = document.getElementById('restoranFotoPlaceholder');
    if (preview) preview.style.display = 'none';
    if (placeholder) placeholder.style.display = 'flex';
    const input = document.getElementById('restoranFoto');
    if (input) input.value = '';
  }
  
  // Bugünün tarihini ayarla
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('restoranTarihi').value = today;
}

// Restoran kaydet
async function saveRestoran() {
  const editId = document.getElementById('restoranEditId').value;
  const isEdit = editId !== '';
  
  const restoranAdi = document.getElementById('restoranAdi').value.trim();
  const tarih = document.getElementById('restoranTarihi').value;
  const konum = document.getElementById('restoranKonum').value.trim();
  const neYedik = document.getElementById('restoranNeYedik').value.trim();
  const aciklama = document.getElementById('restoranAciklama').value.trim();
  const baranPuan = parseInt(document.getElementById('baranPuan').value) || 0;
  const baharPuan = parseInt(document.getElementById('baharPuan').value) || 0;
  
  if (!restoranAdi || !tarih) {
    alert('Lütfen restoran adı ve tarih girin!');
    return;
  }
  
  // Butonları devre dışı bırak
  const submitBtn = document.querySelector('.restoran-form .btn-kaydet');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Kaydediliyor...';
  
  try {
    // Fotoğraf yükleme
    let fotoUrl = '';
    const fotoInput = document.getElementById('restoranFoto');
    
    if (fotoInput && fotoInput.files && fotoInput.files[0]) {
      fotoUrl = await uploadSelectedFoto('restoranFoto', 'yediklerimiz');
    } else if (isEdit) {
      // Düzenleme modunda eski fotoğrafı koru
      const existingRestoran = restoranlarCache.find(r => r.id === editId);
      if (existingRestoran) fotoUrl = existingRestoran.fotoUrl || '';
    }
    
    // Ortalama puan hesapla
    const ortalamaPuan = (baranPuan > 0 && baharPuan > 0) 
      ? ((baranPuan + baharPuan) / 2).toFixed(1) 
      : (baranPuan > 0 ? baranPuan : baharPuan) || 0;
    
    const restoranData = {
      ad: restoranAdi,
      tarih: tarih,
      konum: konum,
      neYedik: neYedik,
      aciklama: aciklama,
      baranPuan: baranPuan,
      baharPuan: baharPuan,
      ortalamaPuan: parseFloat(ortalamaPuan),
      fotoUrl: fotoUrl,
      guncellenmeTarihi: new Date().toISOString()
    };
    
    const db = window.firebaseDb;
    
    if (isEdit) {
      // Güncelleme
      const docRef = window.firestoreDoc(db, RESTORAN_KOLEKSIYON, editId);
      await window.firestoreUpdateDoc(docRef, restoranData);
      console.log('✅ Restoran güncellendi:', editId);
    } else {
      // Yeni kayıt
      restoranData.olusturulmaTarihi = new Date().toISOString();
      await window.firestoreAddDoc(
        window.firestoreCollection(db, RESTORAN_KOLEKSIYON),
        restoranData
      );
      console.log('✅ Yeni restoran eklendi');
    }
    
    closeRestoranModal();
    await loadRestoranlarFromFirestore();
    
  } catch (error) {
    console.error('❌ Restoran kaydedilirken hata:', error);
    alert('Kayıt sırasında bir hata oluştu!');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Kaydet';
  }
}

// Firestore'dan restoranları yükle
async function loadRestoranlarFromFirestore() {
  try {
    const db = window.firebaseDb;
    if (!db) {
      console.error("❌ Firebase DB bulunamadı!");
      return;
    }
    
    const querySnapshot = await window.firestoreGetDocs(
      window.firestoreCollection(db, RESTORAN_KOLEKSIYON)
    );
    
    restoranlarCache = [];
    querySnapshot.forEach((doc) => {
      restoranlarCache.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Sıralama uygula
    sortRestoranlar();
    
    console.log(`📥 Restoranlar yüklendi: ${restoranlarCache.length} restoran`);
    renderRestoranlar();
    
  } catch (error) {
    console.error('❌ Restoranlar yüklenirken hata:', error);
  }
}

// Restoranları sırala
function sortRestoranlar() {
  restoranlarCache.sort((a, b) => {
    let valA, valB;
    
    switch (restoranSortField) {
      case 'tarih':
        valA = a.tarih || '';
        valB = b.tarih || '';
        break;
      case 'ortalama':
        valA = a.ortalamaPuan || 0;
        valB = b.ortalamaPuan || 0;
        break;
      case 'isim':
        valA = (a.ad || '').toLowerCase();
        valB = (b.ad || '').toLowerCase();
        break;
      default:
        valA = a.tarih || '';
        valB = b.tarih || '';
    }
    
    if (restoranSortOrder === 'asc') {
      return valA > valB ? 1 : valA < valB ? -1 : 0;
    } else {
      return valA < valB ? 1 : valA > valB ? -1 : 0;
    }
  });
}

// Sıralama değiştir
function changeRestoranSort() {
  const select = document.getElementById('restoranSortSelect');
  const [field, order] = select.value.split('-');
  restoranSortField = field;
  restoranSortOrder = order;
  sortRestoranlar();
  renderRestoranlar();
}

// Restoranları render et
function renderRestoranlar() {
  const grid = document.getElementById('restoranlarGrid');
  const empty = document.getElementById('restoranlarEmpty');
  const stats = document.getElementById('restoranStats');
  
  if (restoranlarCache.length === 0) {
    grid.style.display = 'none';
    empty.style.display = 'flex';
    stats.textContent = '0 restoran';
    return;
  }
  
  grid.style.display = 'grid';
  empty.style.display = 'none';
  stats.textContent = `${restoranlarCache.length} restoran`;
  
  grid.innerHTML = restoranlarCache.map(restoran => createRestoranCard(restoran)).join('');
}

// Restoran kartı oluştur
function createRestoranCard(restoran) {
  const tarihFormatli = formatTarih(restoran.tarih);
  const baranPuanDisplay = renderPuan(restoran.baranPuan, 'baran');
  const baharPuanDisplay = renderPuan(restoran.baharPuan, 'bahar');
  const ortalamaPuanDisplay = renderOrtalamaPuan(restoran.ortalamaPuan);
  
  const fotoHTML = restoran.fotoUrl 
    ? `<div class="restoran-foto" style="background-image: url('${restoran.fotoUrl}')"></div>`
    : `<div class="restoran-foto no-foto"><span>📷</span></div>`;
  
  return `
    <div class="restoran-card" onclick="openRestoranDetay('${restoran.id}')">
      ${fotoHTML}
      <div class="restoran-card-content">
        <h3 class="restoran-ad">${escapeHtml(restoran.ad)}</h3>
        <div class="restoran-meta">
          <span class="restoran-tarih">📅 ${tarihFormatli}</span>
          ${restoran.konum ? `<span class="restoran-konum">📍 ${escapeHtml(restoran.konum)}</span>` : ''}
        </div>
        <div class="restoran-puanlar">
          <div class="puan-item baran">
            <span class="puan-label">Baran</span>
            <span class="puan-value">${baranPuanDisplay}</span>
          </div>
          <div class="puan-item bahar">
            <span class="puan-label">Bahar</span>
            <span class="puan-value">${baharPuanDisplay}</span>
          </div>
          <div class="puan-item ortalama">
            <span class="puan-label">Ortalama</span>
            <span class="puan-value">${ortalamaPuanDisplay}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Puan render et
function renderPuan(puan, kim) {
  if (!puan || puan === 0) return '<span class="puan-bos">-</span>';
  
  if (restoranPuanGorunumu === 'yildiz') {
    return renderYildizPuan(puan);
  } else {
    return `<span class="puan-sayi">${puan}/10</span>`;
  }
}

// Ortalama puan render et
function renderOrtalamaPuan(puan) {
  if (!puan || puan === 0) return '<span class="puan-bos">-</span>';
  
  if (restoranPuanGorunumu === 'yildiz') {
    return renderYildizPuan(puan);
  } else {
    return `<span class="puan-sayi ortalama-sayi">${puan}/10</span>`;
  }
}

// Yıldız puan render et
function renderYildizPuan(puan) {
  const fullStars = Math.floor(puan / 2);
  const halfStar = puan % 2 >= 1 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStar;
  
  let html = '';
  for (let i = 0; i < fullStars; i++) html += '⭐';
  if (halfStar) html += '✨';
  for (let i = 0; i < emptyStars; i++) html += '☆';
  
  return `<span class="puan-yildiz">${html}</span>`;
}

// Tarih formatla
function formatTarih(tarihStr) {
  if (!tarihStr) return '-';
  const date = new Date(tarihStr);
  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

// HTML escape
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Puan görünümü toggle
function toggleRestoranPuanGorunumu() {
  restoranPuanGorunumu = restoranPuanGorunumu === 'yildiz' ? 'sayi' : 'yildiz';
  localStorage.setItem('restoranPuanGorunumu', restoranPuanGorunumu);
  
  const btn = document.getElementById('btnPuanToggleRestoran');
  if (btn) {
    btn.querySelector('.toggle-icon').textContent = restoranPuanGorunumu === 'yildiz' ? '⭐' : '🔢';
    btn.querySelector('.toggle-text').textContent = restoranPuanGorunumu === 'yildiz' ? 'Yıldız' : 'Sayı';
  }
  
  renderRestoranlar();
}

// Restoran detay modal aç
function openRestoranDetay(id) {
  const restoran = restoranlarCache.find(r => r.id === id);
  if (!restoran) return;
  
  const tarihFormatli = formatTarih(restoran.tarih);
  const modal = document.getElementById('restoranDetayModal');
  const content = document.getElementById('restoranDetayContent');
  
  const fotoHTML = restoran.fotoUrl 
    ? `<div class="detay-foto" style="background-image: url('${restoran.fotoUrl}')"></div>`
    : '';
  
  content.innerHTML = `
    ${fotoHTML}
    <div class="detay-body">
      <h2 class="detay-title">${escapeHtml(restoran.ad)}</h2>
      
      <div class="detay-info">
        <div class="detay-info-item">
          <span class="info-icon">📅</span>
          <span class="info-text">${tarihFormatli}</span>
        </div>
        ${restoran.konum ? `
        <div class="detay-info-item">
          <span class="info-icon">📍</span>
          <span class="info-text">${escapeHtml(restoran.konum)}</span>
        </div>
        ` : ''}
      </div>
      
      ${restoran.neYedik ? `
      <div class="detay-neyedik">
        <h4>🍴 Ne Yedik?</h4>
        <p>${escapeHtml(restoran.neYedik)}</p>
      </div>
      ` : ''}
      
      ${restoran.aciklama ? `
      <div class="detay-aciklama">
        <h4>📝 Notlar</h4>
        <p>${escapeHtml(restoran.aciklama)}</p>
      </div>
      ` : ''}
      
      <div class="detay-puanlar">
        <div class="detay-puan-box baran">
          <span class="puan-kisi">👨 Baran</span>
          <span class="puan-deger">${restoran.baranPuan || 0}/10</span>
          <div class="puan-bar">
            <div class="puan-bar-fill" style="width: ${(restoran.baranPuan || 0) * 10}%"></div>
          </div>
        </div>
        <div class="detay-puan-box bahar">
          <span class="puan-kisi">👩 Bahar</span>
          <span class="puan-deger">${restoran.baharPuan || 0}/10</span>
          <div class="puan-bar">
            <div class="puan-bar-fill" style="width: ${(restoran.baharPuan || 0) * 10}%"></div>
          </div>
        </div>
        <div class="detay-puan-box ortalama">
          <span class="puan-kisi">⭐ Ortalama</span>
          <span class="puan-deger">${restoran.ortalamaPuan || 0}/10</span>
          <div class="puan-bar">
            <div class="puan-bar-fill ortalama" style="width: ${(restoran.ortalamaPuan || 0) * 10}%"></div>
          </div>
        </div>
      </div>
      
      <div class="detay-actions">
        <button class="btn-duzenle" onclick="editRestoran('${id}')">
          <span>✏️</span> Düzenle
        </button>
        <button class="btn-sil" onclick="deleteRestoran('${id}')">
          <span>🗑️</span> Sil
        </button>
      </div>
    </div>
  `;
  
  modal.classList.add('active');
}

// Restoran düzenle
function editRestoran(id) {
  const restoran = restoranlarCache.find(r => r.id === id);
  if (!restoran) return;
  
  // Detay modalı kapat
  document.getElementById('restoranDetayModal').classList.remove('active');
  
  // Form modalını aç ve değerleri doldur
  document.getElementById('restoranModalTitle').textContent = 'Restoran Düzenle';
  document.getElementById('restoranEditId').value = id;
  document.getElementById('restoranAdi').value = restoran.ad || '';
  document.getElementById('restoranTarihi').value = restoran.tarih || '';
  document.getElementById('restoranKonum').value = restoran.konum || '';
  document.getElementById('restoranNeYedik').value = restoran.neYedik || '';
  document.getElementById('restoranAciklama').value = restoran.aciklama || '';
  
  // Puanları seç
  if (restoran.baranPuan > 0) selectPuan('baran', restoran.baranPuan);
  if (restoran.baharPuan > 0) selectPuan('bahar', restoran.baharPuan);
  
  // Mevcut fotoğrafı göster
  if (restoran.fotoUrl) {
    const preview = document.getElementById('restoranFotoPreview');
    const previewImg = document.getElementById('restoranFotoPreviewImg');
    const placeholder = document.getElementById('restoranFotoPlaceholder');
    
    if (preview && previewImg && placeholder) {
      previewImg.src = restoran.fotoUrl;
      preview.style.display = 'block';
      placeholder.style.display = 'none';
    }
  }
  
  document.getElementById('restoranModal').classList.add('active');
}

// Restoran sil
async function deleteRestoran(id) {
  const restoran = restoranlarCache.find(r => r.id === id);
  if (!restoran) return;
  
  const confirmed = confirm(`"${restoran.ad}" restoranını silmek istediğinize emin misiniz?`);
  if (!confirmed) return;
  
  try {
    const db = window.firebaseDb;
    const docRef = window.firestoreDoc(db, RESTORAN_KOLEKSIYON, id);
    await window.firestoreDeleteDoc(docRef);
    
    console.log('🗑️ Restoran silindi:', id);
    
    document.getElementById('restoranDetayModal').classList.remove('active');
    await loadRestoranlarFromFirestore();
    
  } catch (error) {
    console.error('❌ Restoran silinirken hata:', error);
    alert('Silme işlemi başarısız oldu!');
  }
}

// Global fonksiyonları window'a ekle
window.loadYediklerimizPage = loadYediklerimizPage;
window.selectPuan = selectPuan;
window.closeRestoranModal = closeRestoranModal;
window.changeRestoranSort = changeRestoranSort;
window.toggleRestoranPuanGorunumu = toggleRestoranPuanGorunumu;
window.openRestoranDetay = openRestoranDetay;
window.editRestoran = editRestoran;
window.deleteRestoran = deleteRestoran;
