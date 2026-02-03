/* ============================================
   OURHIDDENVERSE - DİZİLER SAYFASI
   Firebase Firestore ile tam entegrasyon
   ============================================ */

// Firestore koleksiyon isimleri - Diziler
const ISTEK_DIZI_KOLEKSIYON = 'istekDiziler';
const IZLENEN_DIZI_KOLEKSIYON = 'diziler';

// Geçici veri cache'leri
let istekDizilerCache = [];
let izlenenDizilerCache = [];

// Sıralama durumu
let currentDiziSortField = null;
let currentDiziSortOrder = 'desc';

// Diziler sayfasını yükle
async function loadDizilerPage() {
  await waitForFirebase();
  console.log("🔥 Firebase hazır, Diziler sayfası yükleniyor...");
  
  const pageContent = document.getElementById('pageContent');
  pageContent.innerHTML = `
    <div class="filmler-container">
      <div class="filmler-header">
        <h2>Diziler</h2>
        <div class="filmler-header-buttons">
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

      <section class="istek-listesi-section">
        <h3 class="section-title">📋 İstek Listesi</h3>
        <div class="istek-listesi" id="istekDiziListesi"></div>
      </section>

      <section class="izlenen-filmler-section">
        <h3 class="section-title">📺 İzlenen Diziler</h3>
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
            Henüz izlenen dizi yok. Bir dizi bitirip puanlamaya ne dersiniz?
          </div>
        </div>
      </section>
    </div>

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
  `;

  setupDizilerEventListeners();
  await loadIstekDizilerFromFirestore();
  await loadIzlenenDizilerFromFirestore();
  
  console.log('📺 Diziler sayfası yüklendi - Firebase aktif');
}

// Event listener'larını ayarla
function setupDizilerEventListeners() {
  const btnYeniDizi = document.getElementById('btnYeniDizi');
  const btnDiziOneri = document.getElementById('btnDiziOneri');
  const diziModal = document.getElementById('diziModal');
  const btnDiziModalClose = document.getElementById('btnDiziModalClose');
  const yeniDiziForm = document.getElementById('yeniDiziForm');

  btnYeniDizi.addEventListener('click', () => {
    diziModal.classList.add('active');
    document.getElementById('diziAdi').focus();
  });

  // Dizi öneri butonu
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
}

// Firestore'dan istek dizilerini yükle
async function loadIstekDizilerFromFirestore() {
  try {
    const db = window.firebaseDb;
    if (!db) {
      console.error("❌ Firebase DB bulunamadı!");
      return;
    }
    
    const querySnapshot = await window.firestoreGetDocs(
      window.firestoreCollection(db, ISTEK_DIZI_KOLEKSIYON)
    );
    
    istekDizilerCache = [];
    querySnapshot.forEach((doc) => {
      istekDizilerCache.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    istekDizilerCache.sort((a, b) => {
      const tarihA = a.olusturulmaTarihi?.seconds || 0;
      const tarihB = b.olusturulmaTarihi?.seconds || 0;
      return tarihB - tarihA;
    });
    
    console.log(`📥 İstek dizi listesi yüklendi: ${istekDizilerCache.length} dizi`);
    renderIstekDizileri();
  } catch (error) {
    console.error('❌ İstek dizi listesi yüklenirken hata:', error);
  }
}

// Firestore'dan izlenen dizileri yükle
async function loadIzlenenDizilerFromFirestore() {
  try {
    const db = window.firebaseDb;
    if (!db) {
      console.error("❌ Firebase DB bulunamadı!");
      return;
    }
    
    const querySnapshot = await window.firestoreGetDocs(
      window.firestoreCollection(db, IZLENEN_DIZI_KOLEKSIYON)
    );
    
    izlenenDizilerCache = [];
    querySnapshot.forEach((doc) => {
      izlenenDizilerCache.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    izlenenDizilerCache.sort((a, b) => {
      const tarihA = a.olusturulmaTarihi?.seconds || 0;
      const tarihB = b.olusturulmaTarihi?.seconds || 0;
      return tarihB - tarihA;
    });
    
    console.log(`📥 İzlenen diziler yüklendi: ${izlenenDizilerCache.length} dizi`);
    renderIzlenenDiziler();
  } catch (error) {
    console.error('❌ İzlenen diziler yüklenirken hata:', error);
  }
}

// İstek listesine dizi ekle
async function addDiziToIstekListesi(diziAdi) {
  try {
    const db = window.firebaseDb;
    
    const docRef = await window.firestoreAddDoc(
      window.firestoreCollection(db, ISTEK_DIZI_KOLEKSIYON), 
      {
        ad: diziAdi,
        olusturulmaTarihi: window.firestoreServerTimestamp()
      }
    );
    
    console.log(`✅ Dizi eklendi: ${diziAdi} (ID: ${docRef.id})`);
    await loadIstekDizilerFromFirestore();
  } catch (error) {
    console.error('❌ Dizi eklenirken hata:', error);
    alert('Dizi eklenirken bir hata oluştu!');
  }
}

// İstek listesinden dizi sil
async function deleteDiziFromIstekListesi(diziId) {
  try {
    const db = window.firebaseDb;
    
    await window.firestoreDeleteDoc(
      window.firestoreDoc(db, ISTEK_DIZI_KOLEKSIYON, diziId)
    );
    
    console.log(`🗑️ Dizi silindi: ${diziId}`);
    await loadIstekDizilerFromFirestore();
  } catch (error) {
    console.error('❌ Dizi silinirken hata:', error);
    alert('Dizi silinirken bir hata oluştu!');
  }
}

// İstek dizilerini render et
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
        <button class="btn-check" onclick="openDiziPuanPanel('${dizi.id}')" title="İzlendi olarak işaretle">✓</button>
        <span class="film-name">${dizi.ad}</span>
        <button class="btn-delete" onclick="deleteDiziFromIstekListesi('${dizi.id}')" title="Sil">🗑️</button>
      </div>
      <div class="puan-panel" id="puanDiziPanel-${dizi.id}">
        <form class="puan-form" onsubmit="saveDiziAsIzlendi(event, '${dizi.id}')">
          <div class="form-group">
            <label>💙 Baran Puanı</label>
            <input type="number" min="0" max="5" step="0.5" id="baranDiziPuan-${dizi.id}" placeholder="0-5" required>
          </div>
          <div class="form-group">
            <label>💖 Bahar Puanı</label>
            <input type="number" min="0" max="5" step="0.5" id="baharDiziPuan-${dizi.id}" placeholder="0-5" required>
          </div>
          <div class="form-group">
            <label>📅 Başlangıç Tarihi</label>
            <input type="date" id="baslangicTarihi-${dizi.id}" required>
          </div>
          <div class="form-group">
            <label>📅 Bitiş Tarihi</label>
            <input type="date" id="bitisTarihi-${dizi.id}" required>
          </div>
          <button type="submit" class="btn-puan-kaydet">💾 Kaydet</button>
        </form>
      </div>
    </div>
  `).join('');
}

// Dizi puan panelini aç/kapat
function openDiziPuanPanel(diziId) {
  const panel = document.getElementById(`puanDiziPanel-${diziId}`);
  if (panel) {
    document.querySelectorAll('.puan-panel.active').forEach(p => {
      if (p.id !== `puanDiziPanel-${diziId}`) {
        p.classList.remove('active');
      }
    });
    panel.classList.toggle('active');
    
    const today = new Date().toISOString().split('T')[0];
    const baslangicInput = document.getElementById(`baslangicTarihi-${diziId}`);
    const bitisInput = document.getElementById(`bitisTarihi-${diziId}`);
    if (baslangicInput && !baslangicInput.value) baslangicInput.value = today;
    if (bitisInput && !bitisInput.value) bitisInput.value = today;
  }
}

// Gün farkını hesapla
function hesaplaGunFarki(baslangic, bitis) {
  const baslangicDate = new Date(baslangic);
  const bitisDate = new Date(bitis);
  const fark = bitisDate - baslangicDate;
  const gun = Math.ceil(fark / (1000 * 60 * 60 * 24));
  return gun >= 0 ? gun + 1 : 0;
}

// Diziyi izlendi olarak kaydet
async function saveDiziAsIzlendi(event, diziId) {
  event.preventDefault();
  
  const baranPuan = parseFloat(document.getElementById(`baranDiziPuan-${diziId}`).value);
  const baharPuan = parseFloat(document.getElementById(`baharDiziPuan-${diziId}`).value);
  const baslangicTarihi = document.getElementById(`baslangicTarihi-${diziId}`).value;
  const bitisTarihi = document.getElementById(`bitisTarihi-${diziId}`).value;
  
  if (new Date(bitisTarihi) < new Date(baslangicTarihi)) {
    alert('Bitiş tarihi başlangıç tarihinden önce olamaz!');
    return;
  }
  
  const ortalamaPuan = ((baranPuan + baharPuan) / 2).toFixed(1);
  const gunSayisi = hesaplaGunFarki(baslangicTarihi, bitisTarihi);
  
  const dizi = istekDizilerCache.find(d => d.id === diziId);
  if (!dizi) return;
  
  try {
    const db = window.firebaseDb;
    
    await window.firestoreAddDoc(
      window.firestoreCollection(db, IZLENEN_DIZI_KOLEKSIYON),
      {
        diziAdi: dizi.ad,
        baranPuani: baranPuan,
        baharPuani: baharPuan,
        ortalamaPuan: parseFloat(ortalamaPuan),
        baslangicTarihi: baslangicTarihi,
        bitisTarihi: bitisTarihi,
        gunSayisi: gunSayisi,
        olusturulmaTarihi: window.firestoreServerTimestamp()
      }
    );
    
    await window.firestoreDeleteDoc(
      window.firestoreDoc(db, ISTEK_DIZI_KOLEKSIYON, diziId)
    );
    
    console.log(`✅ Dizi kaydedildi: ${dizi.ad} (${gunSayisi} günde)`);
    
    await loadIstekDizilerFromFirestore();
    await loadIzlenenDizilerFromFirestore();
    
  } catch (error) {
    console.error('❌ Dizi kaydedilirken hata:', error);
    alert('Dizi kaydedilirken bir hata oluştu!');
  }
}

// Tarihi formatla
function formatTarihDizi(tarihStr) {
  const tarih = new Date(tarihStr);
  const gun = String(tarih.getDate()).padStart(2, '0');
  const ay = String(tarih.getMonth() + 1).padStart(2, '0');
  const yil = tarih.getFullYear();
  return `${gun}.${ay}.${yil}`;
}

// İzlenen dizileri render et
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
          ${generateStarHTML(dizi.baranPuani, 'small')}
        </div>
      </td>
      <td class="col-puan">
        <div class="puan-yildiz-wrapper" title="${dizi.baharPuani}/5">
          ${generateStarHTML(dizi.baharPuani, 'small')}
        </div>
      </td>
      <td class="col-puan">
        <div class="puan-yildiz-wrapper ortak" title="${dizi.ortalamaPuan}/5">
          ${generateStarHTML(dizi.ortalamaPuan, 'small')}
        </div>
      </td>
      <td class="col-sil">
        <button class="btn-sil-film" onclick="deleteIzlenenDizi('${dizi.id}')" title="Sil">🗑️</button>
      </td>
    </tr>
  `).join('');
  
  updateDiziSortHeaders();
}

// Dizileri sırala
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
      case 'baranPuan':
        valueA = a.baranPuani || 0;
        valueB = b.baranPuani || 0;
        break;
      case 'baharPuan':
        valueA = a.baharPuani || 0;
        valueB = b.baharPuani || 0;
        break;
      case 'ortalamaPuan':
        valueA = a.ortalamaPuan || 0;
        valueB = b.ortalamaPuan || 0;
        break;
      default:
        valueA = 0;
        valueB = 0;
    }
    
    if (currentDiziSortOrder === 'desc') {
      return valueB - valueA;
    } else {
      return valueA - valueB;
    }
  });
  
  renderIzlenenDiziler();
  console.log(`📊 Dizi Sıralama: ${field} - ${currentDiziSortOrder === 'desc' ? 'Yüksek → Düşük' : 'Düşük → Yüksek'}`);
}

// Sıralama başlıklarını güncelle
function updateDiziSortHeaders() {
  document.querySelectorAll('.izlenen-tablo th.sortable').forEach(th => {
    th.classList.remove('asc', 'desc');
  });
  
  if (currentDiziSortField) {
    const activeHeader = document.querySelector(`.izlenen-tablo th[data-sort="${currentDiziSortField}"]`);
    if (activeHeader) {
      activeHeader.classList.add(currentDiziSortOrder);
    }
  }
}

// İzlenen diziyi sil
async function deleteIzlenenDizi(diziId) {
  if (!confirm('Bu diziyi silmek istediğinizden emin misiniz?')) {
    return;
  }
  
  try {
    const db = window.firebaseDb;
    const silinecekDizi = izlenenDizilerCache.find(d => d.id === diziId);
    
    await window.firestoreDeleteDoc(
      window.firestoreDoc(db, IZLENEN_DIZI_KOLEKSIYON, diziId)
    );
    
    console.log(`🗑️ Dizi silindi: ${silinecekDizi?.diziAdi || diziId}`);
    await loadIzlenenDizilerFromFirestore();
    
  } catch (error) {
    console.error('❌ Dizi silinirken hata:', error);
    alert('Dizi silinirken bir hata oluştu!');
  }
}

// Global fonksiyonları dışa aktar
window.loadDizilerPage = loadDizilerPage;
window.openDiziPuanPanel = openDiziPuanPanel;
window.saveDiziAsIzlendi = saveDiziAsIzlendi;
window.deleteDiziFromIstekListesi = deleteDiziFromIstekListesi;
window.sortDiziler = sortDiziler;
window.deleteIzlenenDizi = deleteIzlenenDizi;
