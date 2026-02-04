/* ============================================
   OURHIDDENVERSE - BB-DATELER SAYFASI
   Firebase Firestore ile tam entegrasyon
   ============================================ */

// Firestore koleksiyon isimleri
const ISTEK_DATE_KOLEKSIYON = 'istekDateler';
const YAPILAN_DATE_KOLEKSIYON = 'dateler';

// Geçici veri cache'leri
let istekDatelerCache = [];
let yapilanDatelerCache = [];

// Dateler sayfasını yükle
async function loadDatelerPage() {
  await waitForFirebase();
  console.log("🔥 Firebase hazır, BB-Dateler sayfası yükleniyor...");
  
  const pageContent = document.getElementById('pageContent');
  pageContent.innerHTML = `
    <div class="dateler-container">
      <div class="dateler-header">
        <h2>DATE'LER</h2>
        <button class="btn-yeni-date" id="btnYeniDate">
          <span class="btn-icon">💕</span>
          <span>Yeni Date Ekle</span>
        </button>
      </div>

      <section class="ister-listesi-section">
        <h3 class="section-title">📋 İstek Listesi</h3>
        <div class="ister-listesi-box" id="isterListesiBox"></div>
      </section>

      <section class="yapilan-dateler-section">
        <h3 class="section-title">💖 Yapılan Date'ler</h3>
        <div class="yapilan-dateler-container" id="yapilanDatelerContainer"></div>
        <div class="yapilan-empty" id="yapilanEmpty">
          Henüz yapılan date yok. Haydi ilk date'inizi planlayın! 💕
        </div>
      </section>
    </div>

    <div class="modal-overlay" id="dateModal">
      <div class="modal-content date-modal">
        <div class="modal-header">
          <h3>Yeni Date Ekle</h3>
          <button class="btn-modal-close" id="btnDateModalClose">×</button>
        </div>
        <form class="modal-form" id="yeniDateForm">
          <div class="form-group">
            <label for="dateBaslik">Date Başlığı</label>
            <input type="text" id="dateBaslik" placeholder="Örn: Sahil yürüyüşü..." required>
          </div>
          <button type="submit" class="btn-kaydet">İstek Listesine Ekle</button>
        </form>
      </div>
    </div>
  `;

  setupDatelerEventListeners();
  await loadIsterListesiFromFirestore();
  await loadYapilanDatelerFromFirestore();
  
  console.log('💕 BB-Dateler sayfası yüklendi - Firebase aktif');
}

// Event listener'larını ayarla
function setupDatelerEventListeners() {
  const btnYeniDate = document.getElementById('btnYeniDate');
  const dateModal = document.getElementById('dateModal');
  const btnDateModalClose = document.getElementById('btnDateModalClose');
  const yeniDateForm = document.getElementById('yeniDateForm');

  btnYeniDate.addEventListener('click', () => {
    dateModal.classList.add('active');
    document.getElementById('dateBaslik').focus();
  });

  btnDateModalClose.addEventListener('click', () => {
    dateModal.classList.remove('active');
    yeniDateForm.reset();
  });

  dateModal.addEventListener('click', (e) => {
    if (e.target === dateModal) {
      dateModal.classList.remove('active');
      yeniDateForm.reset();
    }
  });

  yeniDateForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const baslik = document.getElementById('dateBaslik').value.trim();
    
    if (baslik) {
      await addDateToIsterListesi(baslik);
      yeniDateForm.reset();
      dateModal.classList.remove('active');
    }
  });
}

// Firestore'dan istek listesini yükle
async function loadIsterListesiFromFirestore() {
  try {
    const db = window.firebaseDb;
    if (!db) {
      console.error("❌ Firebase DB bulunamadı!");
      return;
    }
    
    const querySnapshot = await window.firestoreGetDocs(
      window.firestoreCollection(db, ISTEK_DATE_KOLEKSIYON)
    );
    
    istekDatelerCache = [];
    querySnapshot.forEach((doc) => {
      istekDatelerCache.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    istekDatelerCache.sort((a, b) => {
      const aTime = a.olusturulmaTarihi?.seconds || 0;
      const bTime = b.olusturulmaTarihi?.seconds || 0;
      return aTime - bTime;
    });
    
    console.log(`📥 İstek listesi yüklendi: ${istekDatelerCache.length} date`);
    renderIsterListesi();
  } catch (error) {
    console.error('❌ İstek listesi yüklenirken hata:', error);
  }
}

// Firestore'dan yapılan dateleri yükle
async function loadYapilanDatelerFromFirestore() {
  try {
    const db = window.firebaseDb;
    if (!db) {
      console.error("❌ Firebase DB bulunamadı!");
      return;
    }
    
    const querySnapshot = await window.firestoreGetDocs(
      window.firestoreCollection(db, YAPILAN_DATE_KOLEKSIYON)
    );
    
    yapilanDatelerCache = [];
    querySnapshot.forEach((doc) => {
      yapilanDatelerCache.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    yapilanDatelerCache.sort((a, b) => {
      return new Date(b.tarih) - new Date(a.tarih);
    });
    
    console.log(`📥 Yapılan dateler yüklendi: ${yapilanDatelerCache.length} date`);
    renderYapilanDateler();
  } catch (error) {
    console.error('❌ Yapılan dateler yüklenirken hata:', error);
  }
}

// İstek listesine date ekle
async function addDateToIsterListesi(baslik) {
  try {
    const db = window.firebaseDb;
    
    const docRef = await window.firestoreAddDoc(
      window.firestoreCollection(db, ISTEK_DATE_KOLEKSIYON), 
      {
        baslik: baslik,
        olusturulmaTarihi: window.firestoreServerTimestamp()
      }
    );
    
    console.log(`✅ Date eklendi: ${baslik} (ID: ${docRef.id})`);
    await loadIsterListesiFromFirestore();
  } catch (error) {
    console.error('❌ Date eklenirken hata:', error);
    alert('Date eklenirken bir hata oluştu!');
  }
}

// İstek listesinden date sil
async function deleteIsterDate(dateId) {
  try {
    const db = window.firebaseDb;
    
    await window.firestoreDeleteDoc(
      window.firestoreDoc(db, ISTEK_DATE_KOLEKSIYON, dateId)
    );
    
    console.log(`🗑️ Date silindi: ${dateId}`);
    await loadIsterListesiFromFirestore();
    
  } catch (error) {
    console.error('❌ Date silinirken hata:', error);
    alert('Date silinirken bir hata oluştu!');
  }
}

// Date'i yapıldı olarak işaretle
async function markDateAsYapildi(dateId) {
  const dateItem = istekDatelerCache.find(d => d.id === dateId);
  if (!dateItem) return;
  
  const checkbox = document.querySelector(`.ister-item[data-id="${dateId}"] .ister-checkbox`);
  if (checkbox) checkbox.checked = false;
  
  showYapildiModal(dateId, dateItem.baslik);
}

// Yapıldı modal'ını göster
function showYapildiModal(dateId, dateBaslik) {
  const existingModal = document.getElementById('yapildiModal');
  if (existingModal) existingModal.remove();
  
  const today = new Date().toISOString().split('T')[0];
  
  const modalHTML = `
    <div class="modal-overlay active" id="yapildiModal">
      <div class="modal-content date-modal">
        <div class="modal-header">
          <h3>✅ Date Yapıldı!</h3>
          <button class="btn-modal-close" id="btnYapildiModalClose">×</button>
        </div>
        <div class="yapildi-modal-date-title">${dateBaslik}</div>
        <form class="modal-form" id="yapildiForm">
          <div class="form-group">
            <label for="yapildiTarih">📅 Ne Zaman Yapıldı?</label>
            <input type="date" id="yapildiTarih" value="${today}" required>
          </div>
          <div class="form-group">
            <label for="yapildiKonum">📍 Konum</label>
            <input type="text" id="yapildiKonum" placeholder="Örn: Kadıköy Sahil, İstanbul..." required>
          </div>
          <div class="form-group">
            <label>📷 Fotoğraf (opsiyonel)</label>
            ${createFotoUploadHTML('yapildiGorsel', 'yapildiGorselPreview')}
          </div>
          <button type="submit" class="btn-kaydet" id="btnYapildiKaydet">💕 Kaydet</button>
        </form>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  const modal = document.getElementById('yapildiModal');
  const closeBtn = document.getElementById('btnYapildiModalClose');
  const form = document.getElementById('yapildiForm');
  
  document.getElementById('yapildiKonum').focus();
  
  closeBtn.addEventListener('click', () => {
    modal.remove();
  });
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const tarih = document.getElementById('yapildiTarih').value;
    const konum = document.getElementById('yapildiKonum').value.trim();
    const kaydetBtn = document.getElementById('btnYapildiKaydet');
    
    if (tarih && konum) {
      kaydetBtn.disabled = true;
      kaydetBtn.innerHTML = '<span class="spinner"></span> Kaydediliyor...';
      
      try {
        // Fotoğraf seçildiyse Cloudinary'e yükle
        let gorselUrl = '';
        const fotoInput = document.getElementById('yapildiGorsel');
        if (fotoInput && fotoInput.files && fotoInput.files[0]) {
          gorselUrl = await uploadSelectedFoto('yapildiGorsel', 'dateler');
        }
        
        await saveYapildiDate(dateId, tarih, konum, gorselUrl);
        modal.remove();
      } catch (error) {
        console.error('Kaydetme hatası:', error);
        alert('Kaydetme sırasında hata oluştu!');
        kaydetBtn.disabled = false;
        kaydetBtn.innerHTML = '💕 Kaydet';
      }
    }
  });
}

// Yapıldı date'i kaydet
async function saveYapildiDate(dateId, tarih, konum, gorselUrl) {
  const dateItem = istekDatelerCache.find(d => d.id === dateId);
  if (!dateItem) return;
  
  try {
    const db = window.firebaseDb;
    
    await window.firestoreAddDoc(
      window.firestoreCollection(db, YAPILAN_DATE_KOLEKSIYON),
      {
        baslik: dateItem.baslik,
        tarih: tarih,
        konum: konum,
        gorselUrl: gorselUrl || '',
        olusturulmaTarihi: window.firestoreServerTimestamp()
      }
    );
    
    await window.firestoreDeleteDoc(
      window.firestoreDoc(db, ISTEK_DATE_KOLEKSIYON, dateId)
    );
    
    console.log(`✅ Date yapıldı: ${dateItem.baslik}`);
    
    await loadIsterListesiFromFirestore();
    await loadYapilanDatelerFromFirestore();
    
  } catch (error) {
    console.error('❌ Date işaretlenirken hata:', error);
    alert('Date işaretlenirken bir hata oluştu!');
  }
}

// Yapılan date'i sil
async function deleteYapilanDate(dateId) {
  if (!confirm('Bu date\'i silmek istediğinizden emin misiniz?')) {
    return;
  }
  
  try {
    const db = window.firebaseDb;
    
    await window.firestoreDeleteDoc(
      window.firestoreDoc(db, YAPILAN_DATE_KOLEKSIYON, dateId)
    );
    
    console.log(`🗑️ Yapılan date silindi: ${dateId}`);
    await loadYapilanDatelerFromFirestore();
    
  } catch (error) {
    console.error('❌ Yapılan date silinirken hata:', error);
    alert('Date silinirken bir hata oluştu!');
  }
}

// Tarihi formatla
function formatDateTarih(tarihStr) {
  const date = new Date(tarihStr);
  const gun = String(date.getDate()).padStart(2, '0');
  const ay = String(date.getMonth() + 1).padStart(2, '0');
  const yil = date.getFullYear();
  return `${gun}.${ay}.${yil}`;
}

// İstek listesini render et
function renderIsterListesi() {
  const container = document.getElementById('isterListesiBox');
  if (!container) return;
  
  if (istekDatelerCache.length === 0) {
    container.innerHTML = `
      <div class="ister-empty">
        Henüz planlanmış date yok. Yeni bir date ekleyin! 💕
      </div>
    `;
    return;
  }
  
  container.innerHTML = istekDatelerCache.map(date => `
    <div class="ister-item" data-id="${date.id}">
      <label class="ister-checkbox-label">
        <input type="checkbox" class="ister-checkbox" onchange="markDateAsYapildi('${date.id}')">
        <span class="ister-checkmark"></span>
        <span class="ister-text">${date.baslik}</span>
      </label>
      <button class="btn-ister-sil" onclick="deleteIsterDate('${date.id}')" title="Sil">🗑️</button>
    </div>
  `).join('');
}

// Yapılan date'leri render et
function renderYapilanDateler() {
  const container = document.getElementById('yapilanDatelerContainer');
  const emptyDiv = document.getElementById('yapilanEmpty');
  
  if (!container || !emptyDiv) return;
  
  if (yapilanDatelerCache.length === 0) {
    container.innerHTML = '';
    emptyDiv.style.display = 'block';
    return;
  }
  
  emptyDiv.style.display = 'none';
  
  container.innerHTML = yapilanDatelerCache.map(date => `
    <div class="yapilan-date-card" data-id="${date.id}">
      <div class="date-gorsel-wrapper">
        ${date.gorselUrl 
          ? `<img src="${date.gorselUrl}" alt="${date.baslik}" class="date-gorsel" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
             <div class="date-gorsel-placeholder" style="display:none;">💕</div>`
          : `<div class="date-gorsel-placeholder">💕</div>`
        }
      </div>
      <div class="date-info">
        <h4 class="date-baslik">${date.baslik}</h4>
        <div class="date-details">
          <span class="date-tarih">📅 ${formatDateTarih(date.tarih)}</span>
          ${date.konum ? `<span class="date-konum">📍 ${date.konum}</span>` : ''}
        </div>
      </div>
      <button class="btn-date-sil" onclick="deleteYapilanDate('${date.id}')" title="Sil">🗑️</button>
    </div>
  `).join('');
}

// Global fonksiyonları dışa aktar
window.loadDatelerPage = loadDatelerPage;
window.markDateAsYapildi = markDateAsYapildi;
window.deleteIsterDate = deleteIsterDate;
window.deleteYapilanDate = deleteYapilanDate;
