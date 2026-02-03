/* ============================================
   ŞARKILAR SAYFASI
   Bazı şarkılar çalar, bazıları yaşanır...
   ============================================ */

// Şarkılar cache ve state değişkenleri
let sarkilarCache = [];
let sarkilarSiralama = 'yeni';

// Duygu etiketleri listesi
const duygularListesiSarki = [
  { id: 'mutlu', emoji: '😊', ad: 'Mutlu' },
  { id: 'huzunlu', emoji: '😢', ad: 'Hüzünlü' },
  { id: 'yol', emoji: '🚗', ad: 'Yol' },
  { id: 'gece', emoji: '🌙', ad: 'Gece' },
  { id: 'umut', emoji: '🌟', ad: 'Umut' },
  { id: 'romantik', emoji: '💕', ad: 'Romantik' }
];

// Şarkılar sayfasını yükle
async function loadSarkilarPage() {
  const pageContent = document.getElementById('pageContent');
  
  const duygularHTML = duygularListesiSarki.map(d => `
    <label class="duygu-checkbox">
      <input type="checkbox" name="duygular" value="${d.id}">
      <span class="duygu-label">${d.emoji} ${d.ad}</span>
    </label>
  `).join('');
  
  pageContent.innerHTML = `
    <div class="sarkilar-page">
      <!-- Sayfa Başlığı -->
      <div class="sarkilar-header">
        <div class="sarkilar-header-left">
          <h2 class="sarkilar-title">🎵 Şarkılarımız</h2>
        </div>
        <div class="sarkilar-header-right">
          <button class="btn-sarki-ekle-ac" onclick="openSarkiEkleModal()">
            ➕ Yeni Şarkı Ekle
          </button>
        </div>
      </div>
      <p class="sarkilar-quote">"Bazı şarkılar çalar, bazıları yaşanır."</p>
      <div class="sarkilar-divider"></div>
      
      <!-- Sıralama Butonları -->
      <div class="sarkilar-siralama">
        <span class="siralama-label">Sırala:</span>
        <button class="siralama-btn active" data-siralama="yeni">🆕 En Yeni</button>
        <button class="siralama-btn" data-siralama="ortak">⭐ Ortak Puan</button>
        <button class="siralama-btn" data-siralama="bahar">👩 Bahar</button>
        <button class="siralama-btn" data-siralama="baran">👨 Baran</button>
      </div>
      
      <!-- Şarkı Listesi -->
      <div class="sarkilar-liste" id="sarkilarListe">
        <div class="loading-spinner">
          <div class="spinner"></div>
          <p>Şarkılarınız yükleniyor...</p>
        </div>
      </div>
      
      <!-- Şarkı Ekleme Modalı -->
      <div class="sarki-modal" id="sarkiEkleModal">
        <div class="sarki-modal-content">
          <button class="modal-close" onclick="closeSarkiModal()">×</button>
          <div class="sarki-modal-header">
            <span class="sarki-modal-icon">🎵</span>
            <h3>Yeni Şarkı Ekle</h3>
          </div>
          <form id="sarkiForm" class="sarki-form">
            <div class="sarki-form-row">
              <div class="sarki-form-group">
                <label for="sarkiAdi">Şarkı Adı *</label>
                <input type="text" id="sarkiAdi" placeholder="Örn: Sarı Gelin" required>
              </div>
              <div class="sarki-form-group">
                <label for="sarkiSanatci">Sanatçı *</label>
                <input type="text" id="sarkiSanatci" placeholder="Örn: Barış Manço" required>
              </div>
            </div>
            
            <div class="sarki-form-group">
              <label for="sarkiLink">Müzik Linki * (Spotify / YouTube / Apple Music)</label>
              <input type="url" id="sarkiLink" placeholder="https://open.spotify.com/track/..." required>
            </div>
            
            <div class="sarki-form-group">
              <label>Duygu Etiketleri</label>
              <div class="duygular-secim">
                ${duygularHTML}
              </div>
            </div>
            
            <div class="sarki-form-row puanlar-row">
              <div class="sarki-form-group puan-group">
                <label for="baranPuan">👨 Baran'ın Puanı</label>
                <div class="puan-input-wrapper">
                  <input type="range" id="baranPuan" min="1" max="10" value="5" oninput="updatePuanLabel('baran', this.value)">
                  <span class="puan-label" id="baranPuanLabel">5</span>
                </div>
              </div>
              <div class="sarki-form-group puan-group">
                <label for="baharPuan">👩 Bahar'ın Puanı</label>
                <div class="puan-input-wrapper">
                  <input type="range" id="baharPuan" min="1" max="10" value="5" oninput="updatePuanLabel('bahar', this.value)">
                  <span class="puan-label" id="baharPuanLabel">5</span>
                </div>
              </div>
            </div>
            
            <div class="sarki-form-group">
              <label for="sarkiNot">Not (opsiyonel)</label>
              <textarea id="sarkiNot" placeholder="Bu şarkı hakkında birkaç söz..."></textarea>
            </div>
            
            <div class="sarki-form-group">
              <label for="sarkiEkleyen">Kim ekledi?</label>
              <select id="sarkiEkleyen">
                <option value="Baran">👨 Baran</option>
                <option value="Bahar">👩 Bahar</option>
                <option value="Ortak">💑 Ortak</option>
              </select>
            </div>
            
            <button type="submit" class="btn-sarki-kaydet">
              🎵 Şarkıyı Kaydet
            </button>
          </form>
        </div>
      </div>
    </div>
  `;
  
  document.getElementById('sarkiForm').addEventListener('submit', handleSarkiSubmit);
  
  document.querySelectorAll('.siralama-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.siralama-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      sarkilarSiralama = btn.dataset.siralama;
      renderSarkilar();
    });
  });
  
  await loadSarkilar();
}

// Firebase'den şarkıları yükle
async function loadSarkilar() {
  await waitForFirebase();
  
  try {
    const db = window.firebaseDb;
    const sarkilarSnapshot = await window.firestoreGetDocs(
      window.firestoreQuery(
        window.firestoreCollection(db, 'songs'),
        window.firestoreOrderBy('createdAt', 'desc')
      )
    );
    
    sarkilarCache = [];
    sarkilarSnapshot.forEach(doc => {
      sarkilarCache.push({ id: doc.id, ...doc.data() });
    });
    
    renderSarkilar();
    console.log(`🎵 ${sarkilarCache.length} şarkı yüklendi`);
  } catch (error) {
    console.error('Şarkılar yüklenirken hata:', error);
    document.getElementById('sarkilarListe').innerHTML = `
      <div class="sarkilar-bos">
        <span class="sarkilar-bos-icon">😢</span>
        <p>Şarkılar yüklenirken bir hata oluştu</p>
      </div>
    `;
  }
}

// Şarkıları render et
function renderSarkilar() {
  const container = document.getElementById('sarkilarListe');
  
  if (sarkilarCache.length === 0) {
    container.innerHTML = `
      <div class="sarkilar-bos">
        <span class="sarkilar-bos-icon">🎵</span>
        <p>Henüz şarkı eklenmemiş</p>
        <p class="sarkilar-bos-hint">İlk şarkınızı ekleyerek başlayın!</p>
      </div>
    `;
    return;
  }
  
  let siraliSarkilar = [...sarkilarCache];
  
  if (sarkilarSiralama === 'yeni') {
    siraliSarkilar.sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return bTime - aTime;
    });
  } else if (sarkilarSiralama === 'ortak') {
    siraliSarkilar.sort((a, b) => (b.ortakScore || 0) - (a.ortakScore || 0));
  } else if (sarkilarSiralama === 'bahar') {
    siraliSarkilar.sort((a, b) => (b.baharScore || 0) - (a.baharScore || 0));
  } else if (sarkilarSiralama === 'baran') {
    siraliSarkilar.sort((a, b) => (b.baranScore || 0) - (a.baranScore || 0));
  }
  
  let html = '<div class="sarkilar-grid">';
  
  siraliSarkilar.forEach((sarki, index) => {
    const duygularHTML = (sarki.emotions || []).map(duyguId => {
      const duygu = duygularListesiSarki.find(d => d.id === duyguId);
      return duygu ? `<span class="duygu-badge">${duygu.emoji} ${duygu.ad}</span>` : '';
    }).join('');
    
    const kisiIcon = sarki.addedBy === 'Baran' ? '👨' : sarki.addedBy === 'Bahar' ? '👩' : '💑';
    
    const notOnizleme = sarki.note ? 
      (sarki.note.length > 60 ? sarki.note.substring(0, 60) + '...' : sarki.note) : '';
    
    let eklemeTarihiStr = '';
    if (sarki.createdAt) {
      const tarih = sarki.createdAt.toDate ? sarki.createdAt.toDate() : new Date(sarki.createdAt);
      eklemeTarihiStr = tarih.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }) + 
        ' ' + tarih.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    }
    
    html += `
      <div class="sarki-kart" style="animation-delay: ${index * 0.05}s">
        <div class="sarki-kart-header">
          <span class="sarki-ekleme-tarihi">${eklemeTarihiStr}</span>
          <span class="sarki-kisi-badge">${kisiIcon}</span>
        </div>
        
        <div class="sarki-kart-body">
          <h4 class="sarki-adi">🎵 ${sarki.title}</h4>
          <p class="sarki-sanatci">${sarki.artist}</p>
          
          ${duygularHTML ? `<div class="sarki-duygular">${duygularHTML}</div>` : ''}
          
          <div class="sarki-puanlar">
            <div class="sarki-puan">
              <span class="puan-kisi">👩 Bahar:</span>
              <span class="puan-deger">${sarki.baharScore || '-'}</span>
            </div>
            <div class="sarki-puan">
              <span class="puan-kisi">👨 Baran:</span>
              <span class="puan-deger">${sarki.baranScore || '-'}</span>
            </div>
            <div class="sarki-puan ortak-puan">
              <span class="puan-kisi">⭐ Ortak:</span>
              <span class="puan-deger">${sarki.ortakScore || '-'}</span>
            </div>
          </div>
          
          ${notOnizleme ? `<p class="sarki-not-onizleme">"${notOnizleme}"</p>` : ''}
        </div>
        
        <div class="sarki-kart-footer">
          <a href="${sarki.link}" target="_blank" rel="noopener noreferrer" class="btn-sarki-ac">
            🔗 Şarkıyı Aç
          </a>
          <button class="btn-sarki-sil" onclick="deleteSarki('${sarki.id}')" title="Şarkıyı Sil">
            🗑️
          </button>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  container.innerHTML = html;
}

// Puan label güncelle
function updatePuanLabel(kisi, deger) {
  document.getElementById(`${kisi}PuanLabel`).textContent = deger;
}

// Şarkı ekleme modalını aç
function openSarkiEkleModal() {
  const modal = document.getElementById('sarkiEkleModal');
  modal.classList.add('active');
  
  document.getElementById('sarkiForm').reset();
  document.getElementById('baranPuanLabel').textContent = '5';
  document.getElementById('baharPuanLabel').textContent = '5';
}

// Modalı kapat
function closeSarkiModal() {
  const modal = document.getElementById('sarkiEkleModal');
  modal.classList.remove('active');
}

// Yeni şarkı ekle
async function handleSarkiSubmit(e) {
  e.preventDefault();
  
  const sarkiAdi = document.getElementById('sarkiAdi').value.trim();
  const sanatci = document.getElementById('sarkiSanatci').value.trim();
  const link = document.getElementById('sarkiLink').value.trim();
  const baranPuan = parseInt(document.getElementById('baranPuan').value);
  const baharPuan = parseInt(document.getElementById('baharPuan').value);
  const not = document.getElementById('sarkiNot').value.trim();
  const ekleyen = document.getElementById('sarkiEkleyen').value;
  
  const seciliDuygular = [];
  document.querySelectorAll('input[name="duygular"]:checked').forEach(checkbox => {
    seciliDuygular.push(checkbox.value);
  });
  
  const ortakPuan = Math.round((baranPuan + baharPuan) / 2 * 10) / 10;
  
  if (!sarkiAdi || !sanatci || !link) {
    alert('Lütfen zorunlu alanları doldurun!');
    return;
  }
  
  await waitForFirebase();
  
  try {
    const db = window.firebaseDb;
    
    await window.firestoreAddDoc(
      window.firestoreCollection(db, 'songs'),
      {
        title: sarkiAdi,
        artist: sanatci,
        link: link,
        emotions: seciliDuygular,
        baranScore: baranPuan,
        baharScore: baharPuan,
        ortakScore: ortakPuan,
        note: not || null,
        addedBy: ekleyen,
        createdAt: window.firestoreServerTimestamp()
      }
    );
    
    closeSarkiModal();
    await loadSarkilar();
    
    console.log(`🎵 Yeni şarkı eklendi: ${sarkiAdi} - ${sanatci}`);
  } catch (error) {
    console.error('Şarkı eklenirken hata:', error);
    alert('Bir hata oluştu!');
  }
}

// Şarkı silme
async function deleteSarki(sarkiId) {
  const confirmed = await showConfirmModal({
    icon: '🎵',
    title: 'Şarkıyı Sil',
    message: 'Bu şarkıyı listeden silmek istediğine emin misin?',
    confirmText: 'Evet, Sil',
    cancelText: 'İptal',
    confirmType: 'danger'
  });
  
  if (!confirmed) return;
  
  await waitForFirebase();
  
  try {
    const db = window.firebaseDb;
    await window.firestoreDeleteDoc(window.firestoreDoc(db, 'songs', sarkiId));
    
    sarkilarCache = sarkilarCache.filter(s => s.id !== sarkiId);
    renderSarkilar();
    
    console.log('🗑️ Şarkı silindi');
  } catch (error) {
    console.error('Şarkı silinirken hata:', error);
    alert('Silme işlemi başarısız!');
  }
}

// Global fonksiyonlar - Şarkılar
window.loadSarkilarPage = loadSarkilarPage;
window.openSarkiEkleModal = openSarkiEkleModal;
window.closeSarkiModal = closeSarkiModal;
window.updatePuanLabel = updatePuanLabel;
window.deleteSarki = deleteSarki;
