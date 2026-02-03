/* ============================================
   BUCKET LIST / ORTAK HEDEFLER SAYFASI
   Hayaller paylaşıldıkça plan olur...
   ============================================ */

// Bucket List cache ve state
let bucketListCache = [];
let bucketKategoriler = [
  { id: 'seyahat', icon: '🌍', ad: 'Seyahat' },
  { id: 'aktivite', icon: '🎢', ad: 'Aktivite' },
  { id: 'yemek', icon: '🍽️', ad: 'Yemek' },
  { id: 'gelisim', icon: '📚', ad: 'Kişisel Gelişim' },
  { id: 'romantik', icon: '💑', ad: 'Romantik' },
  { id: 'hayaller', icon: '🎯', ad: 'Hayaller' },
  { id: 'ev', icon: '🏡', ad: 'Ev / Yaşam' },
  { id: 'eglence', icon: '🎮', ad: 'Eğlence' }
];
let bucketFiltre = 'hepsi';
let bucketSiralama = 'yeni';

// Bucket List sayfasını yükle
async function loadBucketListPage() {
  const pageContent = document.getElementById('pageContent');
  
  let kategoriOptions = bucketKategoriler.map(k => 
    `<option value="${k.id}">${k.icon} ${k.ad}</option>`
  ).join('');
  
  let filtreButonlar = `
    <button class="bucket-filtre-btn active" data-filtre="hepsi">Hepsi</button>
    <button class="bucket-filtre-btn" data-filtre="yapilacak">⏳ Yapılacak</button>
    <button class="bucket-filtre-btn" data-filtre="tamamlandi">✅ Tamamlandı</button>
  `;
  
  let kategoriFiltreler = bucketKategoriler.map(k => 
    `<button class="bucket-filtre-btn kategori-btn" data-filtre="${k.id}">${k.icon}</button>`
  ).join('');
  
  pageContent.innerHTML = `
    <div class="bucket-list-page">
      <!-- Sayfa Başlığı -->
      <div class="bucket-header">
        <h2 class="bucket-title">🪣 Ortak Hedeflerimiz</h2>
        <p class="bucket-quote">"Hayaller paylaşıldıkça plan olur, planlar tamamlandıkça hatıraya dönüşür."</p>
        <div class="bucket-divider"></div>
      </div>
      
      <!-- İstatistik Özeti -->
      <div class="bucket-stats-bar" id="bucketStatsBar">
        <div class="bucket-stat-item">
          <span class="bucket-stat-icon">🎯</span>
          <span class="bucket-stat-text">Yükleniyor...</span>
        </div>
      </div>
      
      <!-- Hedef Ekleme Formu -->
      <div class="bucket-ekle-card">
        <h3 class="bucket-ekle-baslik">✨ Yeni Hedef Ekle</h3>
        <form id="bucketForm" class="bucket-form">
          <div class="bucket-form-row">
            <div class="bucket-form-group bucket-form-baslik">
              <label for="bucketBaslik">Hedef</label>
              <input type="text" id="bucketBaslik" placeholder="Örn: Kapadokya'da balon turu yapmak" required>
            </div>
            <div class="bucket-form-group bucket-form-kategori">
              <label for="bucketKategori">Kategori</label>
              <select id="bucketKategori" required>
                ${kategoriOptions}
              </select>
            </div>
            <div class="bucket-form-group bucket-form-kisi">
              <label for="bucketKisi">Ekleyen</label>
              <select id="bucketKisi" required>
                <option value="Baran">👨 Baran</option>
                <option value="Bahar">👩 Bahar</option>
                <option value="İkimiz">💑 İkimiz</option>
              </select>
            </div>
          </div>
          <div class="bucket-form-row">
            <div class="bucket-form-group bucket-form-aciklama">
              <label for="bucketAciklama">Açıklama (opsiyonel)</label>
              <input type="text" id="bucketAciklama" placeholder="Örn: Gün doğumunda olsun...">
            </div>
          </div>
          <button type="submit" class="btn-bucket-ekle">
            <span>🎯</span> Hedef Ekle
          </button>
        </form>
      </div>
      
      <!-- Filtreler ve Sıralama -->
      <div class="bucket-controls">
        <div class="bucket-filtreler">
          <div class="filtre-grup durum-filtre">
            ${filtreButonlar}
          </div>
          <div class="filtre-grup kategori-filtre">
            ${kategoriFiltreler}
          </div>
        </div>
        <div class="bucket-siralama">
          <select id="bucketSiralama" onchange="changeBucketSiralama(this.value)">
            <option value="yeni">En Yeni</option>
            <option value="eski">En Eski</option>
            <option value="kategori">Kategoriye Göre</option>
          </select>
        </div>
      </div>
      
      <!-- İlerleme Çubuğu -->
      <div class="bucket-progress-container">
        <div class="bucket-progress-bar">
          <div class="bucket-progress-fill" id="bucketProgressFill" style="width: 0%"></div>
        </div>
        <span class="bucket-progress-text" id="bucketProgressText">%0 tamamlandı</span>
      </div>
      
      <!-- Hedefler Listesi -->
      <div class="bucket-list-container" id="bucketListContainer">
        <div class="loading-spinner">
          <div class="spinner"></div>
          <p>Hedefleriniz yükleniyor...</p>
        </div>
      </div>
      
      <!-- Tamamlama Modal -->
      <div class="bucket-modal" id="bucketTamamlaModal">
        <div class="bucket-modal-content">
          <button class="modal-close" onclick="closeBucketModal()">×</button>
          <div class="bucket-modal-header">
            <span class="bucket-modal-icon">🎉</span>
            <h3>Hedef Tamamlandı!</h3>
          </div>
          <div class="bucket-modal-body">
            <p class="bucket-modal-hedef" id="bucketModalHedef"></p>
            <div class="bucket-modal-form">
              <label for="bucketNot">Bu an nasıldı? (opsiyonel)</label>
              <textarea id="bucketNot" placeholder="Bu deneyimi birkaç cümleyle anlatın..."></textarea>
            </div>
          </div>
          <div class="bucket-modal-footer">
            <button class="btn-bucket-iptal" onclick="closeBucketModal()">İptal</button>
            <button class="btn-bucket-kaydet" onclick="confirmBucketTamamla()">✅ Tamamla</button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.getElementById('bucketForm').addEventListener('submit', handleBucketSubmit);
  
  document.querySelectorAll('.bucket-filtre-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const filtre = btn.dataset.filtre;
      
      if (bucketKategoriler.find(k => k.id === filtre)) {
        if (bucketFiltre === filtre) {
          bucketFiltre = 'hepsi';
          btn.classList.remove('active');
        } else {
          document.querySelectorAll('.kategori-btn').forEach(b => b.classList.remove('active'));
          bucketFiltre = filtre;
          btn.classList.add('active');
        }
      } else {
        document.querySelectorAll('.durum-filtre .bucket-filtre-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        bucketFiltre = filtre;
      }
      
      renderBucketList();
    });
  });
  
  await loadBucketList();
}

// Firebase'den bucket list yükle
async function loadBucketList() {
  await waitForFirebase();
  
  try {
    const db = window.firebaseDb;
    const bucketSnapshot = await window.firestoreGetDocs(
      window.firestoreQuery(
        window.firestoreCollection(db, 'bucketList'),
        window.firestoreOrderBy('createdAt', 'desc')
      )
    );
    
    bucketListCache = [];
    bucketSnapshot.forEach(doc => {
      bucketListCache.push({ id: doc.id, ...doc.data() });
    });
    
    renderBucketList();
    updateBucketStats();
    
    console.log(`🪣 ${bucketListCache.length} hedef yüklendi`);
  } catch (error) {
    console.error('Bucket list yüklenirken hata:', error);
    document.getElementById('bucketListContainer').innerHTML = `
      <div class="bucket-empty">
        <span class="bucket-empty-icon">😢</span>
        <p>Hedefler yüklenirken bir hata oluştu</p>
      </div>
    `;
  }
}

// Bucket list render et
function renderBucketList() {
  const container = document.getElementById('bucketListContainer');
  
  let filtrelenmis = [...bucketListCache];
  
  if (bucketFiltre === 'yapilacak') {
    filtrelenmis = filtrelenmis.filter(h => h.durum === 'yapilacak');
  } else if (bucketFiltre === 'tamamlandi') {
    filtrelenmis = filtrelenmis.filter(h => h.durum === 'tamamlandi');
  } else if (bucketKategoriler.find(k => k.id === bucketFiltre)) {
    filtrelenmis = filtrelenmis.filter(h => h.kategori === bucketFiltre);
  }
  
  if (bucketSiralama === 'yeni') {
    filtrelenmis.sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return bTime - aTime;
    });
  } else if (bucketSiralama === 'eski') {
    filtrelenmis.sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return aTime - bTime;
    });
  } else if (bucketSiralama === 'kategori') {
    filtrelenmis.sort((a, b) => a.kategori.localeCompare(b.kategori));
  }
  
  if (filtrelenmis.length === 0) {
    container.innerHTML = `
      <div class="bucket-empty">
        <span class="bucket-empty-icon">🎯</span>
        <p>${bucketFiltre === 'hepsi' ? 'Henüz hedef eklenmemiş' : 'Bu filtreye uygun hedef yok'}</p>
        <p class="bucket-empty-hint">Hayallerinizi birlikte gerçeğe dönüştürün!</p>
      </div>
    `;
    return;
  }
  
  let html = '<div class="bucket-grid">';
  
  filtrelenmis.forEach(hedef => {
    const kategori = bucketKategoriler.find(k => k.id === hedef.kategori) || { icon: '🎯', ad: 'Diğer' };
    const tamamlandi = hedef.durum === 'tamamlandi';
    const tarih = hedef.createdAt ? formatBucketTarih(hedef.createdAt) : '';
    const tamamlanmaTarihi = hedef.tamamlanmaTarihi ? formatBucketTarih(hedef.tamamlanmaTarihi) : '';
    
    html += `
      <div class="bucket-card ${tamamlandi ? 'tamamlandi' : ''}" data-id="${hedef.id}">
        <div class="bucket-card-header">
          <span class="bucket-kategori-badge">${kategori.icon} ${kategori.ad}</span>
          <span class="bucket-kisi-badge">${hedef.ekleyen === 'Baran' ? '👨' : hedef.ekleyen === 'Bahar' ? '👩' : '💑'}</span>
        </div>
        
        <h4 class="bucket-card-baslik">${hedef.baslik}</h4>
        
        ${hedef.aciklama ? `<p class="bucket-card-aciklama">${hedef.aciklama}</p>` : ''}
        
        <div class="bucket-card-meta">
          <span class="bucket-tarih">📅 ${tarih}</span>
        </div>
        
        ${tamamlandi ? `
          <div class="bucket-tamamlandi-info">
            <div class="bucket-tamamlandi-badge">✅ Tamamlandı</div>
            <span class="bucket-tamamlanma-tarihi">🎉 ${tamamlanmaTarihi}</span>
            ${hedef.not ? `<p class="bucket-not">"${hedef.not}"</p>` : ''}
          </div>
        ` : `
          <button class="btn-bucket-tamamla" onclick="openBucketTamamlaModal('${hedef.id}')">
            ✅ Tamamla
          </button>
        `}
        
        ${!tamamlandi ? `
          <button class="btn-bucket-sil" onclick="silBucketHedef('${hedef.id}')" title="Sil">
            🗑️
          </button>
        ` : ''}
      </div>
    `;
  });
  
  html += '</div>';
  container.innerHTML = html;
}

// İstatistikleri güncelle
function updateBucketStats() {
  const toplam = bucketListCache.length;
  const tamamlanan = bucketListCache.filter(h => h.durum === 'tamamlandi').length;
  const yuzde = toplam > 0 ? Math.round((tamamlanan / toplam) * 100) : 0;
  
  const statsBar = document.getElementById('bucketStatsBar');
  if (statsBar) {
    const kategoriSayilari = {};
    bucketListCache.filter(h => h.durum === 'tamamlandi').forEach(h => {
      kategoriSayilari[h.kategori] = (kategoriSayilari[h.kategori] || 0) + 1;
    });
    
    let enCokKategori = null;
    let enCokSayi = 0;
    for (const [kat, sayi] of Object.entries(kategoriSayilari)) {
      if (sayi > enCokSayi) {
        enCokSayi = sayi;
        enCokKategori = kat;
      }
    }
    
    const enCokKategoriInfo = bucketKategoriler.find(k => k.id === enCokKategori);
    
    statsBar.innerHTML = `
      <div class="bucket-stat-item highlight">
        <span class="bucket-stat-number">${tamamlanan}</span>
        <span class="bucket-stat-text">hayali birlikte gerçeğe dönüştürdünüz 💛</span>
      </div>
      <div class="bucket-stat-item">
        <span class="bucket-stat-icon">📋</span>
        <span class="bucket-stat-text">${toplam - tamamlanan} hedef bekliyor</span>
      </div>
      ${enCokKategoriInfo ? `
        <div class="bucket-stat-item">
          <span class="bucket-stat-icon">${enCokKategoriInfo.icon}</span>
          <span class="bucket-stat-text">En çok ${enCokKategoriInfo.ad}</span>
        </div>
      ` : ''}
    `;
  }
  
  const progressFill = document.getElementById('bucketProgressFill');
  const progressText = document.getElementById('bucketProgressText');
  
  if (progressFill) {
    progressFill.style.width = `${yuzde}%`;
  }
  if (progressText) {
    progressText.textContent = `%${yuzde} tamamlandı (${tamamlanan}/${toplam})`;
  }
}

// Tarih formatla
function formatBucketTarih(timestamp) {
  if (!timestamp) return '';
  
  let date;
  if (timestamp.seconds) {
    date = new Date(timestamp.seconds * 1000);
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else {
    date = new Date(timestamp);
  }
  
  const aylar = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  return `${date.getDate()} ${aylar[date.getMonth()]} ${date.getFullYear()}`;
}

// Yeni hedef ekle
async function handleBucketSubmit(e) {
  e.preventDefault();
  
  const baslik = document.getElementById('bucketBaslik').value.trim();
  const kategori = document.getElementById('bucketKategori').value;
  const ekleyen = document.getElementById('bucketKisi').value;
  const aciklama = document.getElementById('bucketAciklama').value.trim();
  
  if (!baslik) {
    alert('Lütfen bir hedef girin!');
    return;
  }
  
  await waitForFirebase();
  
  try {
    const db = window.firebaseDb;
    
    await window.firestoreAddDoc(
      window.firestoreCollection(db, 'bucketList'),
      {
        baslik: baslik,
        kategori: kategori,
        ekleyen: ekleyen,
        aciklama: aciklama || null,
        durum: 'yapilacak',
        createdAt: window.firestoreServerTimestamp()
      }
    );
    
    document.getElementById('bucketForm').reset();
    await loadBucketList();
    
    console.log(`🎯 Yeni hedef eklendi: ${baslik}`);
  } catch (error) {
    console.error('Hedef eklenirken hata:', error);
    alert('Bir hata oluştu!');
  }
}

// Tamamlama modalını aç
let tamamlanacakHedefId = null;

function openBucketTamamlaModal(id) {
  const hedef = bucketListCache.find(h => h.id === id);
  if (!hedef) return;
  
  tamamlanacakHedefId = id;
  
  const modal = document.getElementById('bucketTamamlaModal');
  const hedefText = document.getElementById('bucketModalHedef');
  const notInput = document.getElementById('bucketNot');
  
  hedefText.textContent = hedef.baslik;
  notInput.value = '';
  
  modal.classList.add('active');
}

// Modalı kapat
function closeBucketModal() {
  const modal = document.getElementById('bucketTamamlaModal');
  modal.classList.remove('active');
  tamamlanacakHedefId = null;
}

// Tamamlamayı onayla
async function confirmBucketTamamla() {
  if (!tamamlanacakHedefId) return;
  
  const not = document.getElementById('bucketNot').value.trim();
  
  await waitForFirebase();
  
  try {
    const db = window.firebaseDb;
    
    await window.firestoreUpdateDoc(
      window.firestoreDoc(db, 'bucketList', tamamlanacakHedefId),
      {
        durum: 'tamamlandi',
        tamamlanmaTarihi: window.firestoreServerTimestamp(),
        not: not || null
      }
    );
    
    closeBucketModal();
    showBucketCelebration();
    await loadBucketList();
    
    console.log(`🎉 Hedef tamamlandı!`);
  } catch (error) {
    console.error('Hedef tamamlanırken hata:', error);
    alert('Bir hata oluştu!');
  }
}

// Kutlama animasyonu
function showBucketCelebration() {
  const celebration = document.createElement('div');
  celebration.className = 'bucket-celebration';
  celebration.innerHTML = `
    <div class="celebration-content">
      <span class="celebration-emoji">🎉</span>
      <span class="celebration-text">Harika! Bir hayal daha gerçek oldu!</span>
    </div>
  `;
  document.body.appendChild(celebration);
  
  setTimeout(() => {
    celebration.classList.add('fade-out');
    setTimeout(() => celebration.remove(), 500);
  }, 2500);
}

// Hedef sil
async function silBucketHedef(id) {
  if (!confirm('Bu hedefi silmek istediğinize emin misiniz?')) {
    return;
  }
  
  await waitForFirebase();
  
  try {
    const db = window.firebaseDb;
    await window.firestoreDeleteDoc(window.firestoreDoc(db, 'bucketList', id));
    
    await loadBucketList();
    console.log(`🗑️ Hedef silindi: ${id}`);
  } catch (error) {
    console.error('Hedef silinirken hata:', error);
    alert('Silme işlemi başarısız!');
  }
}

// Sıralama değiştir
function changeBucketSiralama(value) {
  bucketSiralama = value;
  renderBucketList();
}

// Global fonksiyonlar - Bucket List
window.loadBucketListPage = loadBucketListPage;
window.openBucketTamamlaModal = openBucketTamamlaModal;
window.closeBucketModal = closeBucketModal;
window.confirmBucketTamamla = confirmBucketTamamla;
window.silBucketHedef = silBucketHedef;
window.changeBucketSiralama = changeBucketSiralama;
