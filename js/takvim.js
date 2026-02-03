/* ============================================
   TAKVİM SAYFASI - 2026'DA GÜNLERİMİZ
   ============================================ */

// Takvim state
let currentCalendarMonth = new Date().getMonth();
let currentCalendarYear = 2026;
let calendarCache = {};

// Duygu renkleri (Inside Out temalı)
const duygular = {
  mutlu: { renk: '#FFD93D', emoji: '😊', ad: 'Mutlu' },
  uzgun: { renk: '#6EC6FF', emoji: '😢', ad: 'Üzgün' },
  gergin: { renk: '#FF6B6B', emoji: '😤', ad: 'Gergin' },
  huzurlu: { renk: '#7ED957', emoji: '😌', ad: 'Huzurlu' },
  endiseli: { renk: '#C77DFF', emoji: '😰', ad: 'Endişeli' },
  bos: { renk: '#3d444d', emoji: '⚪', ad: 'Girilmedi' }
};

const aylar = ['OCAK', 'ŞUBAT', 'MART', 'NİSAN', 'MAYIS', 'HAZİRAN', 'TEMMUZ', 'AĞUSTOS', 'EYLÜL', 'EKİM', 'KASIM', 'ARALIK'];
const gunler = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

// Takvim sayfasını yükle
async function loadTakvimPage() {
  const pageContent = document.getElementById('pageContent');
  
  const bugun = new Date();
  if (bugun.getFullYear() === 2026) {
    currentCalendarMonth = bugun.getMonth();
  } else {
    currentCalendarMonth = 0;
  }
  currentCalendarYear = 2026;
  
  pageContent.innerHTML = `
    <div class="takvim-container">
      <!-- Ay Navigasyonu -->
      <div class="takvim-header">
        <button class="takvim-nav-btn" onclick="oncekiAy()" title="Önceki Ay">◀</button>
        <h2 class="takvim-ay-baslik" id="takvimAyBaslik">${aylar[currentCalendarMonth]} 2026</h2>
        <button class="takvim-nav-btn" onclick="sonrakiAy()" title="Sonraki Ay">▶</button>
      </div>
      
      <!-- Gün İsimleri -->
      <div class="takvim-gunler">
        ${gunler.map(g => `<div class="takvim-gun-isim">${g}</div>`).join('')}
      </div>
      
      <!-- Takvim Grid -->
      <div class="takvim-grid" id="takvimGrid"></div>
      
      <!-- Renk Açıklaması -->
      <div class="takvim-legend">
        ${Object.entries(duygular).filter(([k]) => k !== 'bos').map(([key, val]) => `
          <div class="legend-item">
            <span class="legend-dot" style="background: ${val.renk}"></span>
            <span class="legend-text">${val.ad}</span>
          </div>
        `).join('')}
      </div>
      
      <!-- Duygu Seçim Modal -->
      <div class="modal-overlay" id="duygularModal">
        <div class="modal-content duygu-modal">
          <div class="modal-header">
            <h3 id="duygularModalTitle">📅 1 Ocak 2026</h3>
            <button class="btn-modal-close" onclick="closeDuygularModal()">×</button>
          </div>
          <div class="duygu-modal-body">
            <input type="hidden" id="selectedDate">
            
            <!-- Bahar'ın Duygusu -->
            <div class="duygu-secim-grup">
              <h4>👩 Bahar'ın Günü</h4>
              <div class="duygu-butonlar" id="baharDuygular">
                ${Object.entries(duygular).map(([key, val]) => `
                  <button class="duygu-btn ${key === 'bos' ? 'bos-btn' : ''}" data-duygu="${key}" data-kisi="bahar" onclick="selectDuygu('bahar', '${key}')" style="--duygu-renk: ${val.renk}">
                    <span class="duygu-emoji">${val.emoji}</span>
                    <span class="duygu-ad">${val.ad}</span>
                  </button>
                `).join('')}
              </div>
            </div>
            
            <!-- Baran'ın Duygusu -->
            <div class="duygu-secim-grup">
              <h4>👨 Baran'ın Günü</h4>
              <div class="duygu-butonlar" id="baranDuygular">
                ${Object.entries(duygular).map(([key, val]) => `
                  <button class="duygu-btn ${key === 'bos' ? 'bos-btn' : ''}" data-duygu="${key}" data-kisi="baran" onclick="selectDuygu('baran', '${key}')" style="--duygu-renk: ${val.renk}">
                    <span class="duygu-emoji">${val.emoji}</span>
                    <span class="duygu-ad">${val.ad}</span>
                  </button>
                `).join('')}
              </div>
            </div>
            
            <button class="btn-kaydet" onclick="saveDuygular()">💾 Kaydet</button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  await loadCalendarFromFirebase();
  renderCalendar();
}

// Takvimi render et
function renderCalendar() {
  const grid = document.getElementById('takvimGrid');
  const baslikEl = document.getElementById('takvimAyBaslik');
  
  if (!grid) return;
  
  baslikEl.textContent = `${aylar[currentCalendarMonth]} ${currentCalendarYear}`;
  
  const ilkGun = new Date(currentCalendarYear, currentCalendarMonth, 1);
  const sonGun = new Date(currentCalendarYear, currentCalendarMonth + 1, 0);
  const gunSayisi = sonGun.getDate();
  
  let baslangicGunu = ilkGun.getDay() - 1;
  if (baslangicGunu < 0) baslangicGunu = 6;
  
  const bugun = new Date();
  const bugunStr = `${bugun.getFullYear()}-${String(bugun.getMonth() + 1).padStart(2, '0')}-${String(bugun.getDate()).padStart(2, '0')}`;
  
  let html = '';
  
  for (let i = 0; i < baslangicGunu; i++) {
    html += '<div class="takvim-gun bos"></div>';
  }
  
  for (let gun = 1; gun <= gunSayisi; gun++) {
    const tarih = `${currentCalendarYear}-${String(currentCalendarMonth + 1).padStart(2, '0')}-${String(gun).padStart(2, '0')}`;
    const gunData = calendarCache[tarih] || { bahar: 'bos', baran: 'bos' };
    const baharRenk = duygular[gunData.bahar]?.renk || duygular.bos.renk;
    const baranRenk = duygular[gunData.baran]?.renk || duygular.bos.renk;
    
    const bugunMu = tarih === bugunStr;
    const gecmisMi = new Date(tarih) < new Date(bugunStr);
    const gelecekMi = new Date(tarih) > new Date(bugunStr);
    
    const clickHandler = gelecekMi ? '' : `onclick="openDuygularModal('${tarih}')"`;
    const cursorClass = gelecekMi ? 'gelecek' : '';
    
    html += `
      <div class="takvim-gun ${bugunMu ? 'bugun' : ''} ${gecmisMi ? 'gecmis' : ''} ${cursorClass}" ${clickHandler}>
        <span class="gun-numara">${gun}</span>
        <div class="duygu-toplar">
          <span class="duygu-top bahar-top" style="background: ${baharRenk}" title="Bahar"></span>
          <span class="duygu-top baran-top" style="background: ${baranRenk}" title="Baran"></span>
        </div>
      </div>
    `;
  }
  
  grid.innerHTML = html;
}

// Önceki ay
function oncekiAy() {
  if (currentCalendarMonth > 0) {
    currentCalendarMonth--;
    renderCalendar();
  }
}

// Sonraki ay
function sonrakiAy() {
  if (currentCalendarMonth < 11) {
    currentCalendarMonth++;
    renderCalendar();
  }
}

// Duygu modal aç
function openDuygularModal(tarih) {
  const [yil, ay, gun] = tarih.split('-');
  const ayAdi = aylar[parseInt(ay) - 1];
  
  document.getElementById('duygularModalTitle').textContent = `📅 ${parseInt(gun)} ${ayAdi} ${yil}`;
  document.getElementById('selectedDate').value = tarih;
  
  const gunData = calendarCache[tarih] || { bahar: 'bos', baran: 'bos' };
  
  document.querySelectorAll('.duygu-btn').forEach(btn => btn.classList.remove('selected'));
  
  if (gunData.bahar !== 'bos') {
    const baharBtn = document.querySelector(`.duygu-btn[data-kisi="bahar"][data-duygu="${gunData.bahar}"]`);
    if (baharBtn) baharBtn.classList.add('selected');
  }
  if (gunData.baran !== 'bos') {
    const baranBtn = document.querySelector(`.duygu-btn[data-kisi="baran"][data-duygu="${gunData.baran}"]`);
    if (baranBtn) baranBtn.classList.add('selected');
  }
  
  document.getElementById('duygularModal').classList.add('active');
}

// Modal kapat
function closeDuygularModal() {
  document.getElementById('duygularModal').classList.remove('active');
}

// Duygu seç
function selectDuygu(kisi, duygu) {
  document.querySelectorAll(`.duygu-btn[data-kisi="${kisi}"]`).forEach(btn => {
    btn.classList.remove('selected');
  });
  
  if (duygu !== 'bos') {
    const btn = document.querySelector(`.duygu-btn[data-kisi="${kisi}"][data-duygu="${duygu}"]`);
    if (btn) btn.classList.add('selected');
  }
}

// Duyguları kaydet
async function saveDuygular() {
  const tarih = document.getElementById('selectedDate').value;
  
  const baharBtn = document.querySelector('.duygu-btn[data-kisi="bahar"].selected');
  const baranBtn = document.querySelector('.duygu-btn[data-kisi="baran"].selected');
  
  const baharDuygu = baharBtn ? baharBtn.dataset.duygu : 'bos';
  const baranDuygu = baranBtn ? baranBtn.dataset.duygu : 'bos';
  
  const mevcutKayit = calendarCache[tarih];
  if (baharDuygu === 'bos' && baranDuygu === 'bos' && !mevcutKayit) {
    closeDuygularModal();
    return;
  }
  
  await waitForFirebase();
  
  try {
    const db = window.firebaseDb;
    
    await window.firestoreSetDoc(
      window.firestoreDoc(db, 'calendar', tarih),
      {
        bahar: baharDuygu,
        baran: baranDuygu,
        updatedAt: window.firestoreServerTimestamp()
      }
    );
    
    calendarCache[tarih] = { bahar: baharDuygu, baran: baranDuygu };
    
    closeDuygularModal();
    renderCalendar();
    
    console.log(`🗓️ ${tarih} duyguları kaydedildi`);
  } catch (error) {
    console.error('Duygu kaydedilirken hata:', error);
    alert('Kaydedilirken bir hata oluştu!');
  }
}

// Firebase'den takvim verilerini yükle
async function loadCalendarFromFirebase() {
  await waitForFirebase();
  
  try {
    const db = window.firebaseDb;
    const calendarSnapshot = await window.firestoreGetDocs(
      window.firestoreCollection(db, 'calendar')
    );
    
    calendarCache = {};
    calendarSnapshot.forEach(doc => {
      calendarCache[doc.id] = doc.data();
    });
    
    console.log(`🗓️ Takvim yüklendi: ${Object.keys(calendarCache).length} gün`);
  } catch (error) {
    console.error('Takvim yüklenirken hata:', error);
  }
}

// Global fonksiyonlar - Takvim
window.loadTakvimPage = loadTakvimPage;
window.oncekiAy = oncekiAy;
window.sonrakiAy = sonrakiAy;
window.openDuygularModal = openDuygularModal;
window.closeDuygularModal = closeDuygularModal;
window.selectDuygu = selectDuygu;
window.saveDuygular = saveDuygular;
