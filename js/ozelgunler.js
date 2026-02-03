/* ============================================
   ÖZEL GÜNLER SAYFASI
   Yıl dönümleri ve özel anlar takipçisi
   ============================================ */

// Özel günler cache
let ozelGunlerCache = [];
let ozelGunlerInterval = null;
let detayInterval = null;

// Özel Günler sayfasını yükle
async function loadOzelGunlerPage() {
  const pageContent = document.getElementById('pageContent');
  
  let gunOptions = '';
  for (let i = 1; i <= 31; i++) {
    gunOptions += `<option value="${i}">${i}</option>`;
  }
  
  const buYil = new Date().getFullYear();
  let yilOptions = '';
  for (let y = buYil; y >= 2015; y--) {
    yilOptions += `<option value="${y}">${y}</option>`;
  }
  
  pageContent.innerHTML = `
    <div class="ozel-gunler-page">
      <!-- Sayfa Başlığı -->
      <div class="ozel-gunler-header">
        <h2 class="ozel-gunler-title">💝 Özel Günlerimiz</h2>
        <p class="ozel-gunler-subtitle">Her anımız bir hazine, her yıl dönümü yeni bir başlangıç</p>
        <div class="ozel-gunler-divider"></div>
      </div>
      
      <!-- Yeni Özel Gün Ekleme Formu -->
      <div class="ozel-gun-ekle-card">
        <h3 class="ekle-baslik">✨ Yeni Özel Gün Ekle</h3>
        <form id="ozelGunForm" class="ozel-gun-form">
          <div class="form-row">
            <div class="form-group form-group-baslik">
              <label for="ozelGunBaslik">Başlık</label>
              <input type="text" id="ozelGunBaslik" placeholder="Örn: Sevgili Olduğumuz Gün" required>
            </div>
            <div class="form-group form-group-gun">
              <label for="ozelGunGun">Gün</label>
              <select id="ozelGunGun" required>
                ${gunOptions}
              </select>
            </div>
            <div class="form-group form-group-ay">
              <label for="ozelGunAy">Ay</label>
              <select id="ozelGunAy" required>
                <option value="0">Ocak</option>
                <option value="1">Şubat</option>
                <option value="2">Mart</option>
                <option value="3">Nisan</option>
                <option value="4">Mayıs</option>
                <option value="5">Haziran</option>
                <option value="6">Temmuz</option>
                <option value="7">Ağustos</option>
                <option value="8">Eylül</option>
                <option value="9">Ekim</option>
                <option value="10">Kasım</option>
                <option value="11">Aralık</option>
              </select>
            </div>
            <div class="form-group form-group-yil">
              <label for="ozelGunYil">Başlangıç Yılı</label>
              <select id="ozelGunYil" required>
                ${yilOptions}
              </select>
            </div>
            <div class="form-group form-group-icon">
              <label for="ozelGunIcon">İkon</label>
              <select id="ozelGunIcon">
                <option value="💕">💕 Kalpler</option>
                <option value="💍">💍 Yüzük</option>
                <option value="🎂">🎂 Doğum Günü</option>
                <option value="🌹">🌹 Gül</option>
                <option value="✨">✨ Yıldız</option>
                <option value="🎉">🎉 Kutlama</option>
                <option value="☀️">☀️ Güneş</option>
                <option value="🌙">🌙 Ay</option>
                <option value="💫">💫 Kayan Yıldız</option>
                <option value="🏠">🏠 Ev</option>
                <option value="✈️">✈️ Seyahat</option>
                <option value="📸">📸 Fotoğraf</option>
              </select>
            </div>
          </div>
          <button type="submit" class="btn-ozel-gun-ekle">
            <span>💝</span> Özel Gün Ekle
          </button>
        </form>
      </div>
      
      <!-- Özel Günler Listesi -->
      <div class="ozel-gunler-list" id="ozelGunlerList">
        <div class="loading-spinner">
          <div class="spinner"></div>
          <p>Özel günleriniz yükleniyor...</p>
        </div>
      </div>
      
      <!-- Detay Modal -->
      <div class="ozel-gun-modal" id="ozelGunModal">
        <div class="ozel-gun-modal-content">
          <button class="modal-close" onclick="closeOzelGunModal()">×</button>
          <div id="ozelGunDetay"></div>
        </div>
      </div>
    </div>
  `;
  
  document.getElementById('ozelGunForm').addEventListener('submit', handleOzelGunSubmit);
  await loadOzelGunler();
}

// Özel günleri Firebase'den yükle
async function loadOzelGunler() {
  await waitForFirebase();
  
  try {
    const db = window.firebaseDb;
    const ozelGunlerSnapshot = await window.firestoreGetDocs(
      window.firestoreQuery(
        window.firestoreCollection(db, 'ozelGunler'),
        window.firestoreOrderBy('baseDate', 'asc')
      )
    );
    
    ozelGunlerCache = [];
    ozelGunlerSnapshot.forEach(doc => {
      ozelGunlerCache.push({ id: doc.id, ...doc.data() });
    });
    
    renderOzelGunler();
    startOzelGunlerCountdown();
    
    console.log(`💝 ${ozelGunlerCache.length} özel gün yüklendi`);
  } catch (error) {
    console.error('Özel günler yüklenirken hata:', error);
    document.getElementById('ozelGunlerList').innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">😢</span>
        <p>Özel günler yüklenirken bir hata oluştu</p>
      </div>
    `;
  }
}

// Özel günleri render et
function renderOzelGunler() {
  const container = document.getElementById('ozelGunlerList');
  
  if (ozelGunlerCache.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">💕</span>
        <p>Henüz özel gün eklenmemiş</p>
        <p class="empty-hint">İlk özel gününüzü ekleyerek başlayın!</p>
      </div>
    `;
    return;
  }
  
  const siralananGunler = [...ozelGunlerCache].sort((a, b) => {
    const aGun = hesaplaGunKaldi(a.baseDate);
    const bGun = hesaplaGunKaldi(b.baseDate);
    return aGun - bGun;
  });
  
  let html = '<div class="ozel-gunler-grid">';
  
  siralananGunler.forEach(gun => {
    const gunKaldi = hesaplaGunKaldi(gun.baseDate);
    const kacinciKutlama = hesaplaKacinciKutlama(gun.baseDate);
    const bugun = gunKaldi === 0;
    const yakin = gunKaldi <= 7 && gunKaldi > 0;
    
    html += `
      <div class="ozel-gun-card ${bugun ? 'bugun' : ''} ${yakin ? 'yakin' : ''}" onclick="openOzelGunDetay('${gun.id}')">
        <div class="ozel-gun-icon">${gun.icon || '💕'}</div>
        <h3 class="ozel-gun-baslik">${gun.baslik}</h3>
        <p class="ozel-gun-tarih">${formatTarihOzel(gun.baseDate)}</p>
        
        ${bugun ? `
          <div class="bugun-badge">
            <span>🎉</span> Bugün ${gun.baslik}!
          </div>
          <div class="bugun-mesaj">
            ${kacinciKutlama}. yıl dönümünüz kutlu olsun! 💕
          </div>
        ` : `
          <div class="gun-kaldi" id="gunKaldi-${gun.id}">
            <span class="gun-kaldi-sayi">${gunKaldi}</span>
            <span class="gun-kaldi-text">gün kaldı</span>
          </div>
        `}
        
        <div class="kutlama-bilgi">
          <span class="kacinci">${kacinciKutlama}. yıl dönümü</span>
          <span class="gecmis-kutlama">${gun.baslangicYili || new Date(gun.baseDate).getFullYear()} yılından beri</span>
        </div>
        
        <button class="btn-ozel-gun-sil" onclick="event.stopPropagation(); silOzelGun('${gun.id}')" title="Sil">
          🗑️
        </button>
      </div>
    `;
  });
  
  html += '</div>';
  container.innerHTML = html;
}

// Gün kaldı hesapla
function hesaplaGunKaldi(baseDate) {
  const bugun = new Date();
  bugun.setHours(0, 0, 0, 0);
  
  const base = new Date(baseDate);
  const buYilKutlama = new Date(bugun.getFullYear(), base.getMonth(), base.getDate());
  buYilKutlama.setHours(0, 0, 0, 0);
  
  let sonrakiKutlama;
  if (buYilKutlama < bugun) {
    sonrakiKutlama = new Date(bugun.getFullYear() + 1, base.getMonth(), base.getDate());
  } else {
    sonrakiKutlama = buYilKutlama;
  }
  
  const fark = sonrakiKutlama - bugun;
  return Math.ceil(fark / (1000 * 60 * 60 * 24));
}

// Kaçıncı kutlama hesapla
function hesaplaKacinciKutlama(baseDate) {
  const bugun = new Date();
  const base = new Date(baseDate);
  
  let yilFark = bugun.getFullYear() - base.getFullYear();
  
  const buYilKutlama = new Date(bugun.getFullYear(), base.getMonth(), base.getDate());
  if (bugun < buYilKutlama) {
    yilFark -= 1;
  }
  
  return yilFark + 1;
}

// Detaylı geri sayım hesapla
function hesaplaDetayliGeriSayim(baseDate) {
  const simdi = new Date();
  const base = new Date(baseDate);
  
  let sonrakiKutlama = new Date(simdi.getFullYear(), base.getMonth(), base.getDate());
  sonrakiKutlama.setHours(0, 0, 0, 0);
  
  if (sonrakiKutlama <= simdi) {
    sonrakiKutlama = new Date(simdi.getFullYear() + 1, base.getMonth(), base.getDate());
    sonrakiKutlama.setHours(0, 0, 0, 0);
  }
  
  const fark = sonrakiKutlama - simdi;
  
  if (fark <= 0) {
    return { gun: 0, saat: 0, dakika: 0, saniye: 0, bugun: true };
  }
  
  const gun = Math.floor(fark / (1000 * 60 * 60 * 24));
  const saat = Math.floor((fark % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const dakika = Math.floor((fark % (1000 * 60 * 60)) / (1000 * 60));
  const saniye = Math.floor((fark % (1000 * 60)) / 1000);
  
  return { gun, saat, dakika, saniye, bugun: false };
}

// Tarih formatla (yıl ile birlikte)
function formatTarihOzel(dateStr) {
  const date = new Date(dateStr);
  const aylar = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
                 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  return `${date.getDate()} ${aylar[date.getMonth()]} ${date.getFullYear()}`;
}

// Tarih formatla (sadece gün ve ay)
function formatTarihSadece(dateStr) {
  const date = new Date(dateStr);
  const aylar = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
                 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  return `${date.getDate()} ${aylar[date.getMonth()]}`;
}

// Özel gün ekle form handler
async function handleOzelGunSubmit(e) {
  e.preventDefault();
  
  const baslik = document.getElementById('ozelGunBaslik').value.trim();
  const gun = parseInt(document.getElementById('ozelGunGun').value);
  const ay = parseInt(document.getElementById('ozelGunAy').value);
  const yil = parseInt(document.getElementById('ozelGunYil').value);
  const icon = document.getElementById('ozelGunIcon').value;
  
  if (!baslik) {
    alert('Lütfen başlık girin!');
    return;
  }
  
  const ayStr = String(ay + 1).padStart(2, '0');
  const gunStr = String(gun).padStart(2, '0');
  const baseDate = `${yil}-${ayStr}-${gunStr}`;
  
  await waitForFirebase();
  
  try {
    const db = window.firebaseDb;
    
    await window.firestoreAddDoc(
      window.firestoreCollection(db, 'ozelGunler'),
      {
        baslik: baslik,
        baseDate: baseDate,
        gun: gun,
        ay: ay,
        baslangicYili: yil,
        icon: icon,
        createdAt: window.firestoreServerTimestamp()
      }
    );
    
    document.getElementById('ozelGunForm').reset();
    await loadOzelGunler();
    
    console.log(`💝 Yeni özel gün eklendi: ${baslik}`);
  } catch (error) {
    console.error('Özel gün eklenirken hata:', error);
    alert('Bir hata oluştu!');
  }
}

// Özel gün sil
async function silOzelGun(id) {
  if (!confirm('Bu özel günü silmek istediğinize emin misiniz?')) {
    return;
  }
  
  await waitForFirebase();
  
  try {
    const db = window.firebaseDb;
    await window.firestoreDeleteDoc(window.firestoreDoc(db, 'ozelGunler', id));
    
    await loadOzelGunler();
    console.log(`🗑️ Özel gün silindi: ${id}`);
  } catch (error) {
    console.error('Özel gün silinirken hata:', error);
    alert('Silme işlemi başarısız!');
  }
}

// Özel gün detay modalını aç
function openOzelGunDetay(id) {
  const gun = ozelGunlerCache.find(g => g.id === id);
  if (!gun) return;
  
  const modal = document.getElementById('ozelGunModal');
  const detayContainer = document.getElementById('ozelGunDetay');
  
  const gunKaldi = hesaplaGunKaldi(gun.baseDate);
  const kacinciKutlama = hesaplaKacinciKutlama(gun.baseDate);
  const bugun = gunKaldi === 0;
  const baslangicYili = gun.baslangicYili || new Date(gun.baseDate).getFullYear();
  const gecenYilSayisi = kacinciKutlama - 1;
  
  detayContainer.innerHTML = `
    <div class="detay-header">
      <span class="detay-icon">${gun.icon || '💕'}</span>
      <h2 class="detay-baslik">${gun.baslik}</h2>
      <p class="detay-tarih">📅 Her yıl ${formatTarihSadece(gun.baseDate)}</p>
    </div>
    
    <div class="detay-body">
      ${bugun ? `
        <div class="detay-bugun">
          <h3>🎉 Bugün ${gun.baslik}!</h3>
          <p>${kacinciKutlama}. yıl dönümünüz kutlu olsun! 💕</p>
        </div>
      ` : `
        <div class="detay-countdown" id="detayCountdown">
          <h3>⏳ Geri Sayım</h3>
          <div class="countdown-units">
            <div class="countdown-unit">
              <span class="countdown-value" id="cd-gun">0</span>
              <span class="countdown-label">Gün</span>
            </div>
            <div class="countdown-unit">
              <span class="countdown-value" id="cd-saat">0</span>
              <span class="countdown-label">Saat</span>
            </div>
            <div class="countdown-unit">
              <span class="countdown-value" id="cd-dakika">0</span>
              <span class="countdown-label">Dakika</span>
            </div>
            <div class="countdown-unit">
              <span class="countdown-value" id="cd-saniye">0</span>
              <span class="countdown-label">Saniye</span>
            </div>
          </div>
        </div>
      `}
      
      <div class="detay-info">
        <div class="info-item">
          <span class="info-icon">🎯</span>
          <span class="info-text">${kacinciKutlama}. yıl dönümü ${bugun ? '(Bugün!)' : 'yaklaşıyor'}</span>
        </div>
        <div class="info-item">
          <span class="info-icon">📅</span>
          <span class="info-text">${baslangicYili} yılından beri</span>
        </div>
        ${gecenYilSayisi > 0 ? `
          <div class="info-item">
            <span class="info-icon">🏆</span>
            <span class="info-text">${gecenYilSayisi} kez birlikte kutlandı</span>
          </div>
        ` : ''}
      </div>
    </div>
  `;
  
  modal.classList.add('active');
  
  if (!bugun) {
    startDetayCountdown(gun.baseDate);
  }
}

// Detay modalını kapat
function closeOzelGunModal() {
  const modal = document.getElementById('ozelGunModal');
  modal.classList.remove('active');
  
  if (detayInterval) {
    clearInterval(detayInterval);
    detayInterval = null;
  }
}

// Detay sayacını başlat
function startDetayCountdown(baseDate) {
  if (detayInterval) {
    clearInterval(detayInterval);
  }
  
  function updateCountdown() {
    const sayim = hesaplaDetayliGeriSayim(baseDate);
    
    const gunEl = document.getElementById('cd-gun');
    const saatEl = document.getElementById('cd-saat');
    const dakikaEl = document.getElementById('cd-dakika');
    const saniyeEl = document.getElementById('cd-saniye');
    
    if (gunEl) gunEl.textContent = sayim.gun;
    if (saatEl) saatEl.textContent = sayim.saat.toString().padStart(2, '0');
    if (dakikaEl) dakikaEl.textContent = sayim.dakika.toString().padStart(2, '0');
    if (saniyeEl) saniyeEl.textContent = sayim.saniye.toString().padStart(2, '0');
  }
  
  updateCountdown();
  detayInterval = setInterval(updateCountdown, 1000);
}

// Ana listedeki gün sayaçlarını başlat
function startOzelGunlerCountdown() {
  if (ozelGunlerInterval) {
    clearInterval(ozelGunlerInterval);
  }
  
  ozelGunlerInterval = setInterval(() => {
    ozelGunlerCache.forEach(gun => {
      const el = document.getElementById(`gunKaldi-${gun.id}`);
      if (el) {
        const gunKaldi = hesaplaGunKaldi(gun.baseDate);
        el.querySelector('.gun-kaldi-sayi').textContent = gunKaldi;
      }
    });
  }, 60000);
}

// Global fonksiyonlar - Özel Günler
window.loadOzelGunlerPage = loadOzelGunlerPage;
window.openOzelGunDetay = openOzelGunDetay;
window.closeOzelGunModal = closeOzelGunModal;
window.silOzelGun = silOzelGun;
