/* ============================================
   OURHIDDENVERSE - FİLMLER SAYFASI
   Firebase Firestore ile tam entegrasyon
   ============================================ */

// Firestore koleksiyon isimleri
const ISTEK_KOLEKSIYON = 'istekFilmler';
const IZLENEN_KOLEKSIYON = 'films';

// Geçici veri cache'leri (performans için)
let istekFilmlerCache = [];
let izlenenFilmlerCache = [];

// Mevcut sıralama durumu
let currentSortField = null;
let currentSortOrder = 'desc';

// Puan görünüm modu (yildiz veya sayi)
let filmPuanGorunumu = localStorage.getItem('filmPuanGorunumu') || 'yildiz';

// Filmler sayfasını yükle
async function loadFilmlerPage() {
  await waitForFirebase();
  console.log("🔥 Firebase hazır, Filmler sayfası yükleniyor...");
  
  const pageContent = document.getElementById('pageContent');
  pageContent.innerHTML = `
    <div class="filmler-container">
      <!-- Başlık ve Butonlar -->
      <div class="filmler-header">
        <h2>Filmler</h2>
        <div class="filmler-header-buttons">
          <button class="btn-puan-toggle" id="btnPuanToggleFilm" onclick="toggleFilmPuanGorunumu()" title="Puan görünümünü değiştir">
            <span class="toggle-icon">${filmPuanGorunumu === 'yildiz' ? '⭐' : '🔢'}</span>
            <span class="toggle-text">${filmPuanGorunumu === 'yildiz' ? 'Yıldız' : 'Sayı'}</span>
          </button>
          <button class="btn-film-oneri" id="btnFilmOneri">
            <span class="btn-icon">🎲</span>
            <span>Film Öner</span>
          </button>
          <button class="btn-yeni-film" id="btnYeniFilm">
            <span class="btn-icon">+</span>
            <span>Yeni Film Ekle</span>
          </button>
        </div>
      </div>

      <!-- İstek Listesi Bölümü -->
      <section class="istek-listesi-section">
        <h3 class="section-title">📋 İstek Listesi</h3>
        <div class="istek-listesi" id="istekListesi"></div>
      </section>

      <!-- İzlenen Filmler Bölümü -->
      <section class="izlenen-filmler-section">
        <h3 class="section-title">🎬 İzlenen Filmler</h3>
        <div class="izlenen-filmler-container">
          <div class="tablo-wrapper">
            <table class="izlenen-tablo">
              <thead>
                <tr>
                  <th class="col-film">Film</th>
                  <th class="col-tarih">Tarih</th>
                  <th class="col-puan sortable" data-sort="baranPuan" onclick="sortFilmler('baranPuan')">Baran</th>
                  <th class="col-puan sortable" data-sort="baharPuan" onclick="sortFilmler('baharPuan')">Bahar</th>
                  <th class="col-puan sortable" data-sort="ortalamaPuan" onclick="sortFilmler('ortalamaPuan')">Ortak Puan</th>
                  <th class="col-sil">Sil</th>
                </tr>
              </thead>
              <tbody id="izlenenFilmlerTbody"></tbody>
            </table>
          </div>
          <div class="izlenen-empty" id="izlenenEmpty">
            Henüz izlenen film yok. Bir film izleyip puanlamaya ne dersiniz?
          </div>
        </div>
      </section>
    </div>

    <!-- Yeni Film Ekleme Modal -->
    <div class="modal-overlay" id="filmModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Yeni Film Ekle</h3>
          <button class="btn-modal-close" id="btnModalClose">×</button>
        </div>
        <form class="modal-form" id="yeniFilmForm">
          <div class="form-group">
            <label for="filmAdi">Film Adı</label>
            <input type="text" id="filmAdi" placeholder="Film adını girin..." required>
          </div>
          <button type="submit" class="btn-kaydet">İstek Listesine Ekle</button>
        </form>
      </div>
    </div>
  `;

  setupFilmlerEventListeners();
  await loadIstekListesiFromFirestore();
  await loadIzlenenFilmlerFromFirestore();
  
  console.log('🎬 Filmler sayfası yüklendi - Firebase aktif');
}

// Event listener'larını ayarla
function setupFilmlerEventListeners() {
  const btnYeniFilm = document.getElementById('btnYeniFilm');
  const btnFilmOneri = document.getElementById('btnFilmOneri');
  const filmModal = document.getElementById('filmModal');
  const btnModalClose = document.getElementById('btnModalClose');
  const yeniFilmForm = document.getElementById('yeniFilmForm');

  btnYeniFilm.addEventListener('click', () => {
    filmModal.classList.add('active');
    document.getElementById('filmAdi').focus();
  });

  // Film öneri butonu
  btnFilmOneri.addEventListener('click', () => {
    if (typeof openFilmOneriModal === 'function') {
      openFilmOneriModal();
    }
  });

  btnModalClose.addEventListener('click', () => {
    filmModal.classList.remove('active');
  });

  filmModal.addEventListener('click', (e) => {
    if (e.target === filmModal) {
      filmModal.classList.remove('active');
    }
  });

  yeniFilmForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const filmAdi = document.getElementById('filmAdi').value.trim();
    
    if (filmAdi) {
      await addFilmToIstekListesi(filmAdi);
      document.getElementById('filmAdi').value = '';
      filmModal.classList.remove('active');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && filmModal.classList.contains('active')) {
      filmModal.classList.remove('active');
    }
  });
}

// Cache getters
function getIstekListesi() {
  return istekFilmlerCache;
}

function getIzlenenFilmler() {
  return izlenenFilmlerCache;
}

/* ============================================
   FIRESTORE VERİ İŞLEMLERİ
   ============================================ */

// Firestore'dan istek listesini yükle
async function loadIstekListesiFromFirestore() {
  try {
    const db = window.firebaseDb;
    if (!db) {
      console.error("❌ Firebase DB bulunamadı!");
      return;
    }
    
    const querySnapshot = await window.firestoreGetDocs(
      window.firestoreCollection(db, ISTEK_KOLEKSIYON)
    );
    
    istekFilmlerCache = [];
    querySnapshot.forEach((doc) => {
      istekFilmlerCache.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    istekFilmlerCache.sort((a, b) => {
      const tarihA = a.olusturulmaTarihi?.seconds || 0;
      const tarihB = b.olusturulmaTarihi?.seconds || 0;
      return tarihB - tarihA;
    });
    
    console.log(`📥 İstek listesi yüklendi: ${istekFilmlerCache.length} film`);
    renderIstekListesi();
  } catch (error) {
    console.error('❌ İstek listesi yüklenirken hata:', error);
  }
}

// Firestore'dan izlenen filmleri yükle
async function loadIzlenenFilmlerFromFirestore() {
  try {
    const db = window.firebaseDb;
    if (!db) {
      console.error("❌ Firebase DB bulunamadı!");
      return;
    }
    
    const querySnapshot = await window.firestoreGetDocs(
      window.firestoreCollection(db, IZLENEN_KOLEKSIYON)
    );
    
    izlenenFilmlerCache = [];
    querySnapshot.forEach((doc) => {
      izlenenFilmlerCache.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    izlenenFilmlerCache.sort((a, b) => {
      const tarihA = a.olusturulmaTarihi?.seconds || 0;
      const tarihB = b.olusturulmaTarihi?.seconds || 0;
      return tarihB - tarihA;
    });
    
    console.log(`📥 İzlenen filmler yüklendi: ${izlenenFilmlerCache.length} film`);
    renderIzlenenFilmler();
  } catch (error) {
    console.error('❌ İzlenen filmler yüklenirken hata:', error);
  }
}

// İstek listesine film ekle
async function addFilmToIstekListesi(filmAdi) {
  try {
    const db = window.firebaseDb;
    
    const docRef = await window.firestoreAddDoc(
      window.firestoreCollection(db, ISTEK_KOLEKSIYON), 
      {
        ad: filmAdi,
        olusturulmaTarihi: window.firestoreServerTimestamp()
      }
    );
    
    console.log(`✅ Film eklendi: ${filmAdi} (ID: ${docRef.id})`);
    await loadIstekListesiFromFirestore();
  } catch (error) {
    console.error('❌ Film eklenirken hata:', error);
    alert('Film eklenirken bir hata oluştu!');
  }
}

// İstek listesinden film sil
async function deleteFilmFromIstekListesi(filmId) {
  try {
    const db = window.firebaseDb;
    
    await window.firestoreDeleteDoc(
      window.firestoreDoc(db, ISTEK_KOLEKSIYON, filmId)
    );
    
    console.log(`🗑️ Film silindi: ${filmId}`);
    await loadIstekListesiFromFirestore();
  } catch (error) {
    console.error('❌ Film silinirken hata:', error);
    alert('Film silinirken bir hata oluştu!');
  }
}

// İstek listesini render et
function renderIstekListesi() {
  const container = document.getElementById('istekListesi');
  const liste = getIstekListesi();
  
  if (liste.length === 0) {
    container.innerHTML = `
      <div class="empty-message">
        Henüz istek listesinde film yok. Yeni bir film ekleyin!
      </div>
    `;
    return;
  }
  
  container.innerHTML = liste.map(film => `
    <div class="istek-film-card" data-id="${film.id}">
      <div class="film-row">
        <button class="btn-check" onclick="togglePuanPanel('${film.id}')" title="İzlendi olarak işaretle">
          ✓
        </button>
        <span class="film-name">${film.ad}</span>
        <button class="btn-delete" onclick="deleteFilmFromIstekListesi('${film.id}')" title="Sil">
          ×
        </button>
      </div>
      
      <div class="puan-panel" id="puanPanel_${film.id}">
        <form class="puan-form" onsubmit="saveFilmAsIzlendi(event, '${film.id}')">
          <div class="form-group">
            <label for="baranPuan_${film.id}">💙 Baran'ın Puanı</label>
            <input type="number" id="baranPuan_${film.id}" min="0" max="5" step="0.5" placeholder="0-5" required>
          </div>
          <div class="form-group">
            <label for="baharPuan_${film.id}">💖 Bahar'ın Puanı</label>
            <input type="number" id="baharPuan_${film.id}" min="0" max="5" step="0.5" placeholder="0-5" required>
          </div>
          <div class="form-group">
            <label for="izlenmeTarihi_${film.id}">📅 İzlenme Tarihi</label>
            <input type="date" id="izlenmeTarihi_${film.id}" required>
          </div>
          <button type="submit" class="btn-kaydet">Kaydet</button>
        </form>
      </div>
    </div>
  `).join('');
  
  liste.forEach(film => {
    const tarihInput = document.getElementById(`izlenmeTarihi_${film.id}`);
    if (tarihInput) {
      tarihInput.value = new Date().toISOString().split('T')[0];
    }
  });
}

// Puan panelini aç/kapat
function togglePuanPanel(filmId) {
  const panel = document.getElementById(`puanPanel_${filmId}`);
  
  document.querySelectorAll('.puan-panel').forEach(p => {
    if (p.id !== `puanPanel_${filmId}`) {
      p.classList.remove('active');
    }
  });
  
  panel.classList.toggle('active');
}

// Filmi izlendi olarak kaydet
async function saveFilmAsIzlendi(event, filmId) {
  event.preventDefault();
  
  const film = istekFilmlerCache.find(f => f.id === filmId);
  if (!film) {
    console.error('Film bulunamadı:', filmId);
    return;
  }
  
  const baharPuan = parseFloat(document.getElementById(`baharPuan_${filmId}`).value);
  const baranPuan = parseFloat(document.getElementById(`baranPuan_${filmId}`).value);
  const izlenmeTarihi = document.getElementById(`izlenmeTarihi_${filmId}`).value;
  const ortalamaPuan = parseFloat(((baharPuan + baranPuan) / 2).toFixed(1));
  
  try {
    const db = window.firebaseDb;
    
    await window.firestoreAddDoc(
      window.firestoreCollection(db, IZLENEN_KOLEKSIYON),
      {
        filmAdi: film.ad,
        baharPuani: baharPuan,
        baranPuani: baranPuan,
        ortalamaPuan: ortalamaPuan,
        tarih: izlenmeTarihi,
        olusturulmaTarihi: window.firestoreServerTimestamp()
      }
    );
    
    await window.firestoreDeleteDoc(
      window.firestoreDoc(db, ISTEK_KOLEKSIYON, filmId)
    );
    
    console.log(`✅ Film kaydedildi: ${film.ad}`);
    
    await loadIstekListesiFromFirestore();
    await loadIzlenenFilmlerFromFirestore();
    
  } catch (error) {
    console.error('❌ Film kaydedilirken hata:', error);
    alert('Film kaydedilirken bir hata oluştu!');
  }
}

// Yıldız HTML'i oluştur
function generateStarHTML(puan, size = 'normal') {
  const maxStars = 5;
  const fullStars = Math.floor(puan);
  const hasHalf = puan % 1 >= 0.5;
  const emptyStars = maxStars - fullStars - (hasHalf ? 1 : 0);
  
  let html = `<div class="stars-display ${size}">`;
  
  for (let i = 0; i < fullStars; i++) {
    html += `<span class="star filled">★</span>`;
  }
  
  if (hasHalf) {
    html += `<span class="star half">★</span>`;
  }
  
  for (let i = 0; i < emptyStars; i++) {
    html += `<span class="star empty">☆</span>`;
  }
  
  html += '</div>';
  return html;
}

// Sayı HTML'i oluştur
function generateSayiHTML(puan, isOrtak = false) {
  const className = isOrtak ? 'puan-sayi ortak' : 'puan-sayi';
  return `<span class="${className}">${puan.toFixed(1)}</span>`;
}

// Puan görünümüne göre HTML oluştur
function generatePuanHTML(puan, isOrtak = false) {
  if (filmPuanGorunumu === 'yildiz') {
    return generateStarHTML(puan, 'small');
  } else {
    return generateSayiHTML(puan, isOrtak);
  }
}

// Puan görünümünü değiştir
function toggleFilmPuanGorunumu() {
  filmPuanGorunumu = filmPuanGorunumu === 'yildiz' ? 'sayi' : 'yildiz';
  localStorage.setItem('filmPuanGorunumu', filmPuanGorunumu);
  
  // Butonu güncelle
  const btn = document.getElementById('btnPuanToggleFilm');
  if (btn) {
    btn.innerHTML = `
      <span class="toggle-icon">${filmPuanGorunumu === 'yildiz' ? '⭐' : '🔢'}</span>
      <span class="toggle-text">${filmPuanGorunumu === 'yildiz' ? 'Yıldız' : 'Sayı'}</span>
    `;
  }
  
  // Tabloyu yeniden render et
  renderIzlenenFilmler();
}

// İzlenen filmleri render et
function renderIzlenenFilmler() {
  const tbody = document.getElementById('izlenenFilmlerTbody');
  const emptyMessage = document.getElementById('izlenenEmpty');
  const tabloWrapper = document.querySelector('.tablo-wrapper');
  const filmler = izlenenFilmlerCache;
  
  if (filmler.length === 0) {
    tabloWrapper.style.display = 'none';
    emptyMessage.style.display = 'block';
    return;
  }
  
  tabloWrapper.style.display = 'block';
  emptyMessage.style.display = 'none';
  
  tbody.innerHTML = filmler.map((film, index) => `
    <tr class="film-satir" style="animation: fadeIn 0.4s ease ${index * 0.05}s forwards; opacity: 0;">
      <td class="col-film">
        <span class="film-adi">${film.filmAdi}</span>
      </td>
      <td class="col-tarih">
        <span class="tarih-text">${formatTarih(film.tarih)}</span>
      </td>
      <td class="col-puan">
        <div class="puan-yildiz-wrapper" title="${film.baranPuani}/5">
          ${generatePuanHTML(film.baranPuani, false)}
        </div>
      </td>
      <td class="col-puan">
        <div class="puan-yildiz-wrapper" title="${film.baharPuani}/5">
          ${generatePuanHTML(film.baharPuani, false)}
        </div>
      </td>
      <td class="col-puan">
        <div class="puan-yildiz-wrapper ortak" title="${film.ortalamaPuan}/5">
          ${generatePuanHTML(film.ortalamaPuan, true)}
        </div>
      </td>
      <td class="col-sil">
        <button class="btn-sil-film" onclick="deleteIzlenenFilm('${film.id}')" title="Filmi sil">×</button>
      </td>
    </tr>
  `).join('');
}

// Tarihi formatla
function formatTarih(tarihStr) {
  const tarih = new Date(tarihStr);
  const gun = String(tarih.getDate()).padStart(2, '0');
  const ay = String(tarih.getMonth() + 1).padStart(2, '0');
  const yil = tarih.getFullYear();
  return `${gun}.${ay}.${yil}`;
}

// Filmleri sırala
function sortFilmler(field) {
  const fieldMapping = {
    'baranPuan': 'baranPuani',
    'baharPuan': 'baharPuani',
    'ortalamaPuan': 'ortalamaPuan'
  };
  
  const firestoreField = fieldMapping[field] || field;
  
  if (currentSortField === field) {
    currentSortOrder = currentSortOrder === 'desc' ? 'asc' : 'desc';
  } else {
    currentSortField = field;
    currentSortOrder = 'desc';
  }
  
  updateSortHeaders();
  
  izlenenFilmlerCache.sort((a, b) => {
    const aValue = a[firestoreField];
    const bValue = b[firestoreField];
    
    if (currentSortOrder === 'desc') {
      return bValue - aValue;
    } else {
      return aValue - bValue;
    }
  });
  
  renderIzlenenFilmler();
  console.log(`📊 Sıralama: ${field} - ${currentSortOrder === 'desc' ? 'Yüksek → Düşük' : 'Düşük → Yüksek'}`);
}

// Sıralama başlıklarının stilini güncelle
function updateSortHeaders() {
  document.querySelectorAll('.izlenen-tablo th.sortable').forEach(th => {
    th.classList.remove('asc', 'desc');
  });
  
  if (currentSortField) {
    const activeHeader = document.querySelector(`.izlenen-tablo th[data-sort="${currentSortField}"]`);
    if (activeHeader) {
      activeHeader.classList.add(currentSortOrder);
    }
  }
}

// İzlenen filmi sil
async function deleteIzlenenFilm(filmId) {
  if (!confirm('Bu filmi silmek istediğinizden emin misiniz?')) {
    return;
  }
  
  try {
    const db = window.firebaseDb;
    const silinecekFilm = izlenenFilmlerCache.find(f => f.id === filmId);
    
    await window.firestoreDeleteDoc(
      window.firestoreDoc(db, IZLENEN_KOLEKSIYON, filmId)
    );
    
    console.log(`🗑️ Film silindi: ${silinecekFilm?.filmAdi || filmId}`);
    await loadIzlenenFilmlerFromFirestore();
    
  } catch (error) {
    console.error('❌ Film silinirken hata:', error);
    alert('Film silinirken bir hata oluştu!');
  }
}

// Global fonksiyonları dışa aktar
window.loadFilmlerPage = loadFilmlerPage;
window.togglePuanPanel = togglePuanPanel;
window.saveFilmAsIzlendi = saveFilmAsIzlendi;
window.deleteFilmFromIstekListesi = deleteFilmFromIstekListesi;
window.sortFilmler = sortFilmler;
window.deleteIzlenenFilm = deleteIzlenenFilm;
window.generateStarHTML = generateStarHTML;
