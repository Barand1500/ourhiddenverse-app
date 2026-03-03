/* ============================================
   OURHIDDENVERSE - DİZİLER SAYFASI
   Sezon/Bölüm Takipli Gelişmiş Sistem
   ============================================ */

// Firestore koleksiyon isimleri
const ISTEK_DIZI_KOLEKSIYON = 'istekDiziler';
const DEVAM_DIZI_KOLEKSIYON = 'devamEdenDiziler';
const IZLENEN_DIZI_KOLEKSIYON = 'diziler';

// Cache'ler
let istekDizilerCache = [];
let devamDizilerCache = [];
let izlenenDizilerCache = [];

// Sıralama durumu
let currentDiziSortField = null;
let currentDiziSortOrder = 'desc';

// Puan görünüm modu (yildiz veya sayi)
let diziPuanGorunumu = localStorage.getItem('diziPuanGorunumu') || 'yildiz';

// Diziler sayfasını yükle
async function loadDizilerPage() {
  await waitForFirebase();
  console.log("🔥 Firebase hazır, Diziler sayfası yükleniyor...");
  
  const pageContent = document.getElementById('pageContent');
  pageContent.innerHTML = `
    <div class="filmler-container diziler-container">
      <div class="filmler-header">
        <h2>📺 Diziler</h2>
        <div class="filmler-header-buttons">
          <button class="btn-puan-toggle" id="btnPuanToggleDizi" onclick="toggleDiziPuanGorunumu()" title="Puan görünümünü değiştir">
            <span class="toggle-icon">${diziPuanGorunumu === 'yildiz' ? '⭐' : '🔢'}</span>
            <span class="toggle-text">${diziPuanGorunumu === 'yildiz' ? 'Yıldız' : 'Sayı'}</span>
          </button>
          <button class="btn-film-oneri" id="btnDiziOneri">
            <span class="btn-icon">🎲</span>
            <span>Dizi Öner</span>
          </button>
          <button class="btn-yeni-film" id="btnYeniDizi">
            <span class="btn-icon">+</span>
            <span>Yeni Dizi Ekle</span>
          </button>
        </div>
      </div>

      <!-- İstek Listesi -->
      <section class="istek-listesi-section">
        <h3 class="section-title">📋 İstek Listesi</h3>
        <div class="istek-listesi" id="istekDiziListesi"></div>
      </section>

      <!-- Devam Edilen Diziler -->
      <section class="devam-eden-section">
        <h3 class="section-title">▶️ Devam Edilen Diziler</h3>
        <div class="devam-eden-liste" id="devamDiziListesi"></div>
      </section>

      <!-- İzlenen Diziler -->
      <section class="izlenen-filmler-section">
        <h3 class="section-title">✅ Bitirilen Diziler</h3>
        <div class="izlenen-filmler-container">
          <div class="tablo-wrapper">
            <table class="izlenen-tablo">
              <thead>
                <tr>
                  <th class="col-film">Dizi</th>
                  <th class="col-tarih">Başlangıç</th>
                  <th class="col-tarih">Bitiş</th>
                  <th class="col-gun">Gün</th>
                  <th class="col-puan sortable" data-sort="baranPuan" onclick="sortDiziler('baranPuan')">Baran</th>
                  <th class="col-puan sortable" data-sort="baharPuan" onclick="sortDiziler('baharPuan')">Bahar</th>
                  <th class="col-puan sortable" data-sort="ortalamaPuan" onclick="sortDiziler('ortalamaPuan')">Ortak Puan</th>
                  <th class="col-sil">Sil</th>
                </tr>
              </thead>
              <tbody id="izlenenDizilerTbody"></tbody>
            </table>
          </div>
          <div class="izlenen-empty" id="izlenenDiziEmpty">
            Henüz bitirilen dizi yok. Bir dizi bitirip puanlamaya ne dersiniz?
          </div>
        </div>
      </section>
    </div>

    <!-- Yeni Dizi Ekleme Modal -->
    <div class="modal-overlay" id="diziModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Yeni Dizi Ekle</h3>
          <button class="btn-modal-close" id="btnDiziModalClose">×</button>
        </div>
        <form class="modal-form" id="yeniDiziForm">
          <div class="form-group">
            <label for="diziAdi">Dizi Adı</label>
            <input type="text" id="diziAdi" placeholder="Dizi adını girin..." required>
          </div>
          <button type="submit" class="btn-kaydet">İstek Listesine Ekle</button>
        </form>
      </div>
    </div>

    <!-- Dizi Başlatma Modal -->
    <div class="modal-overlay" id="diziBaslatModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>▶️ Diziyi Başlat</h3>
          <button class="btn-modal-close" onclick="closeDiziBaslatModal()">×</button>
        </div>
        <form class="modal-form" id="diziBaslatForm">
          <input type="hidden" id="baslatDiziId">
          <input type="hidden" id="baslatDiziAdi">
          
          <div class="dizi-baslat-info">
            <span class="dizi-baslat-ad" id="baslatDiziAdGoster"></span>
          </div>
          
          <div class="form-group">
            <label for="diziBaslangicTarihi">📅 Başlangıç Tarihi</label>
            <input type="date" id="diziBaslangicTarihi" required>
          </div>
          
          <div class="form-group">
            <label for="diziToplamSezon">📺 Toplam Sezon Sayısı</label>
            <input type="number" id="diziToplamSezon" min="1" max="50" value="1" required>
          </div>
          
          <div class="sezon-bolum-ayar" id="sezonBolumAyar">
            <label>Her Sezonun Bölüm Sayısı</label>
            <div class="sezon-inputs" id="sezonInputs">
              <!-- Dinamik olarak doldurulacak -->
            </div>
          </div>
          
          <button type="submit" class="btn-kaydet btn-baslat">▶️ Diziye Başla</button>
        </form>
      </div>
    </div>

    <!-- Dizi Bitirme Modal -->
    <div class="modal-overlay" id="diziBitirModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>✅ Diziyi Bitir</h3>
          <button class="btn-modal-close" onclick="closeDiziBitirModal()">×</button>
        </div>
        <form class="modal-form" id="diziBitirForm">
          <input type="hidden" id="bitirDiziId">
          
          <div class="dizi-baslat-info">
            <span class="dizi-baslat-ad" id="bitirDiziAdGoster"></span>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="bitirBaranPuan">💙 Baran Puanı</label>
              <input type="number" id="bitirBaranPuan" min="0" max="5" step="0.5" placeholder="0-5" required>
            </div>
            <div class="form-group">
              <label for="bitirBaharPuan">💖 Bahar Puanı</label>
              <input type="number" id="bitirBaharPuan" min="0" max="5" step="0.5" placeholder="0-5" required>
            </div>
          </div>
          
          <div class="bitir-tarih-info">
            <span>📅 Bitiş Tarihi: <strong id="bitirTarihGoster"></strong></span>
          </div>
          
          <button type="submit" class="btn-kaydet btn-bitir">✅ Diziyi Bitir & Kaydet</button>
        </form>
      </div>
    </div>
  `;

  setupDizilerEventListeners();
  await loadIstekDizilerFromFirestore();
  await loadDevamDizilerFromFirestore();
  await loadIzlenenDizilerFromFirestore();
  
  console.log('📺 Diziler sayfası yüklendi');
}

// Event listener'ları ayarla
function setupDizilerEventListeners() {
  const btnYeniDizi = document.getElementById('btnYeniDizi');
  const btnDiziOneri = document.getElementById('btnDiziOneri');
  const diziModal = document.getElementById('diziModal');
  const btnDiziModalClose = document.getElementById('btnDiziModalClose');
  const yeniDiziForm = document.getElementById('yeniDiziForm');
  const diziBaslatForm = document.getElementById('diziBaslatForm');
  const diziBitirForm = document.getElementById('diziBitirForm');
  const toplamSezonInput = document.getElementById('diziToplamSezon');

  // Yeni dizi modal
  btnYeniDizi.addEventListener('click', () => {
    diziModal.classList.add('active');
    document.getElementById('diziAdi').focus();
  });

  btnDiziOneri.addEventListener('click', () => {
    if (typeof openDiziOneriModal === 'function') {
      openDiziOneriModal();
    }
  });

  btnDiziModalClose.addEventListener('click', () => {
    diziModal.classList.remove('active');
    yeniDiziForm.reset();
  });

  diziModal.addEventListener('click', (e) => {
    if (e.target === diziModal) {
      diziModal.classList.remove('active');
      yeniDiziForm.reset();
    }
  });

  yeniDiziForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const diziAdi = document.getElementById('diziAdi').value.trim();
    if (diziAdi) {
      await addDiziToIstekListesi(diziAdi);
      yeniDiziForm.reset();
      diziModal.classList.remove('active');
    }
  });

  // Sezon sayısı değiştiğinde bölüm inputlarını güncelle
  toplamSezonInput.addEventListener('change', () => {
    updateSezonBolumInputs(parseInt(toplamSezonInput.value));
  });

  // Dizi başlatma formu
  diziBaslatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await startDizi();
  });

  // Dizi bitirme formu
  diziBitirForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await finishDizi();
  });
}

// Sezon bölüm inputlarını güncelle
function updateSezonBolumInputs(sezonSayisi) {
  const container = document.getElementById('sezonInputs');
  if (!container) return;
  
  let html = '';
  for (let i = 1; i <= sezonSayisi; i++) {
    html += `
      <div class="sezon-input-row">
        <span class="sezon-label">Sezon ${i}:</span>
        <input type="number" class="sezon-bolum-input" id="sezon${i}Bolum" 
               min="1" max="100" value="10" placeholder="Bölüm sayısı">
        <span class="bolum-label">bölüm</span>
      </div>
    `;
  }
  container.innerHTML = html;
}

/* ============================================
   İSTEK LİSTESİ FONKSİYONLARI
   ============================================ */

async function loadIstekDizilerFromFirestore() {
  try {
    const db = window.firebaseDb;
    const querySnapshot = await window.firestoreGetDocs(
      window.firestoreCollection(db, ISTEK_DIZI_KOLEKSIYON)
    );
    
    istekDizilerCache = [];
    querySnapshot.forEach((doc) => {
      istekDizilerCache.push({ id: doc.id, ...doc.data() });
    });
    
    istekDizilerCache.sort((a, b) => {
      const tarihA = a.olusturulmaTarihi?.seconds || 0;
      const tarihB = b.olusturulmaTarihi?.seconds || 0;
      return tarihB - tarihA;
    });
    
    renderIstekDizileri();
  } catch (error) {
    console.error('❌ İstek diziler yüklenirken hata:', error);
  }
}

async function addDiziToIstekListesi(diziAdi) {
  try {
    const db = window.firebaseDb;
    await window.firestoreAddDoc(
      window.firestoreCollection(db, ISTEK_DIZI_KOLEKSIYON),
      {
        ad: diziAdi,
        olusturulmaTarihi: window.firestoreServerTimestamp()
      }
    );
    await loadIstekDizilerFromFirestore();
  } catch (error) {
    console.error('❌ Dizi eklenirken hata:', error);
  }
}

async function deleteDiziFromIstekListesi(diziId) {
  try {
    const db = window.firebaseDb;
    await window.firestoreDeleteDoc(
      window.firestoreDoc(db, ISTEK_DIZI_KOLEKSIYON, diziId)
    );
    await loadIstekDizilerFromFirestore();
  } catch (error) {
    console.error('❌ Dizi silinirken hata:', error);
  }
}

function renderIstekDizileri() {
  const container = document.getElementById('istekDiziListesi');
  if (!container) return;
  
  if (istekDizilerCache.length === 0) {
    container.innerHTML = `
      <div class="istek-empty">
        İzlemek istediğiniz dizileri ekleyin
      </div>
    `;
    return;
  }
  
  container.innerHTML = istekDizilerCache.map(dizi => `
    <div class="istek-film-card" data-id="${dizi.id}">
      <div class="film-row">
        <button class="btn-baslat-dizi" onclick="openDiziBaslatModal('${dizi.id}', '${dizi.ad.replace(/'/g, "\\'")}')" title="Diziye Başla">
          ▶️
        </button>
        <span class="film-name">${dizi.ad}</span>
        <button class="btn-delete" onclick="deleteDiziFromIstekListesi('${dizi.id}')" title="Sil">🗑️</button>
      </div>
    </div>
  `).join('');
}

/* ============================================
   DİZİ BAŞLATMA FONKSİYONLARI
   ============================================ */

function openDiziBaslatModal(diziId, diziAdi) {
  document.getElementById('baslatDiziId').value = diziId;
  document.getElementById('baslatDiziAdi').value = diziAdi;
  document.getElementById('baslatDiziAdGoster').textContent = diziAdi;
  
  // Bugünün tarihini ayarla
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('diziBaslangicTarihi').value = today;
  
  // Varsayılan 1 sezon
  document.getElementById('diziToplamSezon').value = 1;
  updateSezonBolumInputs(1);
  
  document.getElementById('diziBaslatModal').classList.add('active');
}

function closeDiziBaslatModal() {
  document.getElementById('diziBaslatModal').classList.remove('active');
}

async function startDizi() {
  const diziId = document.getElementById('baslatDiziId').value;
  const diziAdi = document.getElementById('baslatDiziAdi').value;
  const baslangicTarihi = document.getElementById('diziBaslangicTarihi').value;
  const toplamSezon = parseInt(document.getElementById('diziToplamSezon').value);
  
  // Sezon bölüm sayılarını topla
  const sezonBolumleri = {};
  for (let i = 1; i <= toplamSezon; i++) {
    const bolumInput = document.getElementById(`sezon${i}Bolum`);
    sezonBolumleri[i] = bolumInput ? parseInt(bolumInput.value) || 10 : 10;
  }
  
  try {
    const db = window.firebaseDb;
    
    // Devam eden dizilere ekle
    await window.firestoreAddDoc(
      window.firestoreCollection(db, DEVAM_DIZI_KOLEKSIYON),
      {
        diziAdi: diziAdi,
        baslangicTarihi: baslangicTarihi,
        toplamSezon: toplamSezon,
        sezonBolumleri: sezonBolumleri,
        mevcutSezon: 1,
        mevcutBolum: 1,
        olusturulmaTarihi: window.firestoreServerTimestamp()
      }
    );
    
    // İstek listesinden sil
    await window.firestoreDeleteDoc(
      window.firestoreDoc(db, ISTEK_DIZI_KOLEKSIYON, diziId)
    );
    
    closeDiziBaslatModal();
    await loadIstekDizilerFromFirestore();
    await loadDevamDizilerFromFirestore();
    
    console.log(`▶️ Dizi başlatıldı: ${diziAdi}`);
  } catch (error) {
    console.error('❌ Dizi başlatılırken hata:', error);
    alert('Dizi başlatılırken bir hata oluştu!');
  }
}

/* ============================================
   DEVAM EDEN DİZİLER FONKSİYONLARI
   ============================================ */

async function loadDevamDizilerFromFirestore() {
  try {
    const db = window.firebaseDb;
    const querySnapshot = await window.firestoreGetDocs(
      window.firestoreCollection(db, DEVAM_DIZI_KOLEKSIYON)
    );
    
    devamDizilerCache = [];
    querySnapshot.forEach((doc) => {
      devamDizilerCache.push({ id: doc.id, ...doc.data() });
    });
    
    devamDizilerCache.sort((a, b) => {
      const tarihA = a.olusturulmaTarihi?.seconds || 0;
      const tarihB = b.olusturulmaTarihi?.seconds || 0;
      return tarihB - tarihA;
    });
    
    renderDevamDizileri();
  } catch (error) {
    console.error('❌ Devam eden diziler yüklenirken hata:', error);
  }
}

function renderDevamDizileri() {
  const container = document.getElementById('devamDiziListesi');
  if (!container) return;
  
  if (devamDizilerCache.length === 0) {
    container.innerHTML = `
      <div class="devam-empty">
        <span class="devam-empty-icon">📺</span>
        <p>Şu an izlediğiniz dizi yok</p>
        <p class="devam-empty-alt">İstek listesinden bir dizi başlatın!</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = devamDizilerCache.map(dizi => {
    const sezonBolumleri = dizi.sezonBolumleri || {};
    const mevcutSezon = dizi.mevcutSezon || 1;
    const mevcutBolum = dizi.mevcutBolum || 1;
    const toplamSezon = dizi.toplamSezon || 1;
    
    // Bu sezonun toplam bölümü
    const buSezonToplamBolum = sezonBolumleri[mevcutSezon] || 10;
    
    // Genel ilerleme hesapla
    let toplamIzlenen = 0;
    let genelToplam = 0;
    
    for (let s = 1; s <= toplamSezon; s++) {
      const sezonBolum = sezonBolumleri[s] || 10;
      genelToplam += sezonBolum;
      
      if (s < mevcutSezon) {
        toplamIzlenen += sezonBolum;
      } else if (s === mevcutSezon) {
        toplamIzlenen += mevcutBolum - 1;
      }
    }
    
    const genelYuzde = genelToplam > 0 ? Math.round((toplamIzlenen / genelToplam) * 100) : 0;
    const sezonYuzde = Math.round(((mevcutBolum - 1) / buSezonToplamBolum) * 100);
    
    return `
      <div class="devam-dizi-card" data-id="${dizi.id}">
        <div class="devam-dizi-header">
          <h4 class="devam-dizi-ad">${dizi.diziAdi}</h4>
          <span class="devam-dizi-tarih">📅 ${formatTarihDizi(dizi.baslangicTarihi)}'den beri</span>
        </div>
        
        <div class="devam-dizi-progress">
          <div class="progress-info">
            <span class="sezon-bolum-text">
              <strong>S${String(mevcutSezon).padStart(2, '0')}E${String(mevcutBolum).padStart(2, '0')}</strong>
              <span class="of-text">/ ${buSezonToplamBolum} bölüm</span>
            </span>
            <span class="genel-progress-text">${genelYuzde}% tamamlandı</span>
          </div>
          
          <div class="progress-bar-container">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${genelYuzde}%"></div>
            </div>
          </div>
        </div>
        
        <div class="devam-dizi-controls">
          <div class="sezon-bolum-kontrol">
            <div class="kontrol-grup sezon-kontrol">
              <span class="kontrol-label">Sezon</span>
              <div class="kontrol-butonlar">
                <button class="btn-kontrol minus" onclick="updateDiziProgress('${dizi.id}', 'sezon', -1)" ${mevcutSezon <= 1 ? 'disabled' : ''}>−</button>
                <span class="kontrol-deger">${mevcutSezon}</span>
                <button class="btn-kontrol plus" onclick="updateDiziProgress('${dizi.id}', 'sezon', 1)" ${mevcutSezon >= toplamSezon ? 'disabled' : ''}>+</button>
              </div>
            </div>
            
            <div class="kontrol-grup bolum-kontrol">
              <span class="kontrol-label">Bölüm</span>
              <div class="kontrol-butonlar">
                <button class="btn-kontrol minus" onclick="updateDiziProgress('${dizi.id}', 'bolum', -1)" ${mevcutBolum <= 1 ? 'disabled' : ''}>−</button>
                <span class="kontrol-deger">${mevcutBolum}</span>
                <button class="btn-kontrol plus" onclick="updateDiziProgress('${dizi.id}', 'bolum', 1)" ${mevcutBolum >= buSezonToplamBolum ? 'disabled' : ''}>+</button>
              </div>
            </div>
          </div>
          
          <div class="devam-dizi-actions">
            <button class="btn-dizi-bitir" onclick="openDiziBitirModal('${dizi.id}')">
              ✅ Bitir
            </button>
            <button class="btn-dizi-iptal" onclick="deleteDiziFromDevam('${dizi.id}')" title="İptal Et">
              🗑️
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Dizi ilerlemesini güncelle
async function updateDiziProgress(diziId, type, delta) {
  const dizi = devamDizilerCache.find(d => d.id === diziId);
  if (!dizi) return;
  
  let mevcutSezon = dizi.mevcutSezon || 1;
  let mevcutBolum = dizi.mevcutBolum || 1;
  const toplamSezon = dizi.toplamSezon || 1;
  const sezonBolumleri = dizi.sezonBolumleri || {};
  
  if (type === 'sezon') {
    const yeniSezon = mevcutSezon + delta;
    if (yeniSezon >= 1 && yeniSezon <= toplamSezon) {
      mevcutSezon = yeniSezon;
      mevcutBolum = 1; // Sezon değişince bölümü sıfırla
    }
  } else if (type === 'bolum') {
    const buSezonToplamBolum = sezonBolumleri[mevcutSezon] || 10;
    const yeniBolum = mevcutBolum + delta;
    
    if (yeniBolum >= 1 && yeniBolum <= buSezonToplamBolum) {
      mevcutBolum = yeniBolum;
    }
  }
  
  try {
    const db = window.firebaseDb;
    await window.firestoreUpdateDoc(
      window.firestoreDoc(db, DEVAM_DIZI_KOLEKSIYON, diziId),
      {
        mevcutSezon: mevcutSezon,
        mevcutBolum: mevcutBolum
      }
    );
    
    // Cache güncelle
    dizi.mevcutSezon = mevcutSezon;
    dizi.mevcutBolum = mevcutBolum;
    
    renderDevamDizileri();
  } catch (error) {
    console.error('❌ İlerleme güncellenirken hata:', error);
  }
}

// Devam eden diziyi sil/iptal et
async function deleteDiziFromDevam(diziId) {
  const confirmed = await showConfirmModal({
    icon: '🗑️',
    title: 'Diziyi İptal Et',
    message: 'Bu diziyi izlemeyi bırakmak istediğinize emin misiniz?',
    confirmText: 'İptal Et',
    cancelText: 'Vazgeç',
    confirmType: 'danger'
  });
  
  if (!confirmed) return;
  
  try {
    const db = window.firebaseDb;
    await window.firestoreDeleteDoc(
      window.firestoreDoc(db, DEVAM_DIZI_KOLEKSIYON, diziId)
    );
    await loadDevamDizilerFromFirestore();
  } catch (error) {
    console.error('❌ Dizi silinirken hata:', error);
  }
}

/* ============================================
   DİZİ BİTİRME FONKSİYONLARI
   ============================================ */

function openDiziBitirModal(diziId) {
  const dizi = devamDizilerCache.find(d => d.id === diziId);
  if (!dizi) return;
  
  document.getElementById('bitirDiziId').value = diziId;
  document.getElementById('bitirDiziAdGoster').textContent = dizi.diziAdi;
  
  // Bugünün tarihini göster
  const today = new Date().toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  document.getElementById('bitirTarihGoster').textContent = today;
  
  // Puanları sıfırla
  document.getElementById('bitirBaranPuan').value = '';
  document.getElementById('bitirBaharPuan').value = '';
  
  document.getElementById('diziBitirModal').classList.add('active');
}

function closeDiziBitirModal() {
  document.getElementById('diziBitirModal').classList.remove('active');
}

async function finishDizi() {
  const diziId = document.getElementById('bitirDiziId').value;
  const baranPuan = parseFloat(document.getElementById('bitirBaranPuan').value);
  const baharPuan = parseFloat(document.getElementById('bitirBaharPuan').value);
  
  const dizi = devamDizilerCache.find(d => d.id === diziId);
  if (!dizi) return;
  
  const bitisTarihi = new Date().toISOString().split('T')[0];
  const ortalamaPuan = ((baranPuan + baharPuan) / 2).toFixed(1);
  const gunSayisi = hesaplaGunFarki(dizi.baslangicTarihi, bitisTarihi);
  
  try {
    const db = window.firebaseDb;
    
    // İzlenen dizilere ekle
    await window.firestoreAddDoc(
      window.firestoreCollection(db, IZLENEN_DIZI_KOLEKSIYON),
      {
        diziAdi: dizi.diziAdi,
        baranPuani: baranPuan,
        baharPuani: baharPuan,
        ortalamaPuan: parseFloat(ortalamaPuan),
        baslangicTarihi: dizi.baslangicTarihi,
        bitisTarihi: bitisTarihi,
        gunSayisi: gunSayisi,
        toplamSezon: dizi.toplamSezon,
        sezonBolumleri: dizi.sezonBolumleri,
        olusturulmaTarihi: window.firestoreServerTimestamp()
      }
    );
    
    // Devam edenlerden sil
    await window.firestoreDeleteDoc(
      window.firestoreDoc(db, DEVAM_DIZI_KOLEKSIYON, diziId)
    );
    
    closeDiziBitirModal();
    await loadDevamDizilerFromFirestore();
    await loadIzlenenDizilerFromFirestore();
    
    console.log(`✅ Dizi bitirildi: ${dizi.diziAdi}`);
  } catch (error) {
    console.error('❌ Dizi bitirilirken hata:', error);
    alert('Dizi bitirilirken bir hata oluştu!');
  }
}

/* ============================================
   İZLENEN DİZİLER FONKSİYONLARI
   ============================================ */

// Sayı HTML'i oluştur (diziler için)
function generateDiziSayiHTML(puan, isOrtak = false) {
  const className = isOrtak ? 'puan-sayi ortak' : 'puan-sayi';
  return `<span class="${className}">${puan.toFixed(1)}</span>`;
}

// Puan görünümüne göre HTML oluştur (diziler için)
function generateDiziPuanHTML(puan, isOrtak = false) {
  if (diziPuanGorunumu === 'yildiz') {
    return generateStarHTML(puan, 'small');
  } else {
    return generateDiziSayiHTML(puan, isOrtak);
  }
}

// Puan görünümünü değiştir (diziler için)
function toggleDiziPuanGorunumu() {
  diziPuanGorunumu = diziPuanGorunumu === 'yildiz' ? 'sayi' : 'yildiz';
  localStorage.setItem('diziPuanGorunumu', diziPuanGorunumu);
  
  // Butonu güncelle
  const btn = document.getElementById('btnPuanToggleDizi');
  if (btn) {
    btn.innerHTML = `
      <span class="toggle-icon">${diziPuanGorunumu === 'yildiz' ? '⭐' : '🔢'}</span>
      <span class="toggle-text">${diziPuanGorunumu === 'yildiz' ? 'Yıldız' : 'Sayı'}</span>
    `;
  }
  
  // Tabloyu yeniden render et
  renderIzlenenDiziler();
}

async function loadIzlenenDizilerFromFirestore() {
  try {
    const db = window.firebaseDb;
    const querySnapshot = await window.firestoreGetDocs(
      window.firestoreCollection(db, IZLENEN_DIZI_KOLEKSIYON)
    );
    
    izlenenDizilerCache = [];
    querySnapshot.forEach((doc) => {
      izlenenDizilerCache.push({ id: doc.id, ...doc.data() });
    });
    
    izlenenDizilerCache.sort((a, b) => {
      const tarihA = a.olusturulmaTarihi?.seconds || 0;
      const tarihB = b.olusturulmaTarihi?.seconds || 0;
      return tarihB - tarihA;
    });
    
    renderIzlenenDiziler();
  } catch (error) {
    console.error('❌ İzlenen diziler yüklenirken hata:', error);
  }
}

function renderIzlenenDiziler() {
  const tbody = document.getElementById('izlenenDizilerTbody');
  const emptyDiv = document.getElementById('izlenenDiziEmpty');
  
  if (!tbody || !emptyDiv) return;
  
  if (izlenenDizilerCache.length === 0) {
    tbody.innerHTML = '';
    emptyDiv.style.display = 'block';
    return;
  }
  
  emptyDiv.style.display = 'none';
  
  tbody.innerHTML = izlenenDizilerCache.map(dizi => `
    <tr>
      <td class="col-film">${dizi.diziAdi}</td>
      <td class="col-tarih">${formatTarihDizi(dizi.baslangicTarihi)}</td>
      <td class="col-tarih">${formatTarihDizi(dizi.bitisTarihi)}</td>
      <td class="col-gun"><span class="gun-badge">${dizi.gunSayisi}</span></td>
      <td class="col-puan">
        <div class="puan-yildiz-wrapper" title="${dizi.baranPuani}/5">
          ${generateDiziPuanHTML(dizi.baranPuani, false)}
        </div>
      </td>
      <td class="col-puan">
        <div class="puan-yildiz-wrapper" title="${dizi.baharPuani}/5">
          ${generateDiziPuanHTML(dizi.baharPuani, false)}
        </div>
      </td>
      <td class="col-puan">
        <div class="puan-yildiz-wrapper ortak" title="${dizi.ortalamaPuan}/5">
          ${generateDiziPuanHTML(dizi.ortalamaPuan, true)}
        </div>
      </td>
      <td class="col-sil">
        <button class="btn-sil-film" onclick="deleteIzlenenDizi('${dizi.id}')" title="Sil">🗑️</button>
      </td>
    </tr>
  `).join('');
  
  updateDiziSortHeaders();
}

// Sıralama
function sortDiziler(field) {
  if (currentDiziSortField === field) {
    currentDiziSortOrder = currentDiziSortOrder === 'desc' ? 'asc' : 'desc';
  } else {
    currentDiziSortField = field;
    currentDiziSortOrder = 'desc';
  }
  
  izlenenDizilerCache.sort((a, b) => {
    let valueA, valueB;
    
    switch (field) {
      case 'baranPuan': valueA = a.baranPuani || 0; valueB = b.baranPuani || 0; break;
      case 'baharPuan': valueA = a.baharPuani || 0; valueB = b.baharPuani || 0; break;
      case 'ortalamaPuan': valueA = a.ortalamaPuan || 0; valueB = b.ortalamaPuan || 0; break;
      default: valueA = 0; valueB = 0;
    }
    
    return currentDiziSortOrder === 'desc' ? valueB - valueA : valueA - valueB;
  });
  
  renderIzlenenDiziler();
}

function updateDiziSortHeaders() {
  document.querySelectorAll('.izlenen-tablo th.sortable').forEach(th => {
    th.classList.remove('asc', 'desc');
  });
  
  if (currentDiziSortField) {
    const activeHeader = document.querySelector(`.izlenen-tablo th[data-sort="${currentDiziSortField}"]`);
    if (activeHeader) activeHeader.classList.add(currentDiziSortOrder);
  }
}

async function deleteIzlenenDizi(diziId) {
  const confirmed = await showConfirmModal({
    icon: '🗑️',
    title: 'Diziyi Sil',
    message: 'Bu diziyi silmek istediğinize emin misiniz?',
    confirmText: 'Sil',
    cancelText: 'Vazgeç',
    confirmType: 'danger'
  });
  
  if (!confirmed) return;
  
  try {
    const db = window.firebaseDb;
    await window.firestoreDeleteDoc(
      window.firestoreDoc(db, IZLENEN_DIZI_KOLEKSIYON, diziId)
    );
    await loadIzlenenDizilerFromFirestore();
  } catch (error) {
    console.error('❌ Dizi silinirken hata:', error);
  }
}

/* ============================================
   YARDIMCI FONKSİYONLAR
   ============================================ */

function formatTarihDizi(tarihStr) {
  if (!tarihStr) return '-';
  const tarih = new Date(tarihStr);
  const gun = String(tarih.getDate()).padStart(2, '0');
  const ay = String(tarih.getMonth() + 1).padStart(2, '0');
  const yil = tarih.getFullYear();
  return `${gun}.${ay}.${yil}`;
}

function hesaplaGunFarki(baslangic, bitis) {
  const baslangicDate = new Date(baslangic);
  const bitisDate = new Date(bitis);
  const fark = bitisDate - baslangicDate;
  const gun = Math.ceil(fark / (1000 * 60 * 60 * 24));
  return gun >= 0 ? gun + 1 : 0;
}

// Global fonksiyonlar
window.loadDizilerPage = loadDizilerPage;
window.openDiziBaslatModal = openDiziBaslatModal;
window.closeDiziBaslatModal = closeDiziBaslatModal;
window.openDiziBitirModal = openDiziBitirModal;
window.closeDiziBitirModal = closeDiziBitirModal;
window.updateDiziProgress = updateDiziProgress;
window.deleteDiziFromIstekListesi = deleteDiziFromIstekListesi;
window.deleteDiziFromDevam = deleteDiziFromDevam;
window.sortDiziler = sortDiziler;
window.deleteIzlenenDizi = deleteIzlenenDizi;
