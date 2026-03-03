/* ============================================
   ORTAK HEDEFLER - MACERA YOLCULUĞU
   🗺️ Yeni Tasarım - Quest Board Style
   ============================================ */

// State
let bucketCache = [];
let activeTab = 'aktif'; // aktif, tamamlanan, hepsi
let activeKategori = null;

// Kategoriler
const kategoriler = {
  seyahat: { icon: '✈️', isim: 'Seyahat', renk: '#0ea5e9' },
  aktivite: { icon: '🎭', isim: 'Aktivite', renk: '#f97316' },
  yemek: { icon: '🍴', isim: 'Yemek', renk: '#ef4444' },
  romantik: { icon: '💕', isim: 'Romantik', renk: '#ec4899' },
  ev: { icon: '🏠', isim: 'Ev & Yaşam', renk: '#22c55e' },
  gelisim: { icon: '📖', isim: 'Gelişim', renk: '#8b5cf6' },
  eglence: { icon: '🎮', isim: 'Eğlence', renk: '#6366f1' },
  diger: { icon: '⭐', isim: 'Diğer', renk: '#64748b' }
};

// Sayfa Yükle
async function loadBucketListPage() {
  const pageContent = document.getElementById('pageContent');
  
  // Yıl seçenekleri
  const buYil = new Date().getFullYear();
  let yilOps = '<option value="">Yıl</option>';
  for (let y = buYil; y <= buYil + 15; y++) yilOps += `<option value="${y}">${y}</option>`;
  
  // Ay seçenekleri  
  const ayIsim = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
  let ayOps = '<option value="">Ay</option>';
  ayIsim.forEach((a, i) => ayOps += `<option value="${i+1}">${a}</option>`);
  
  // Kategori seçenekleri
  let katOps = Object.entries(kategoriler).map(([k, v]) => 
    `<option value="${k}">${v.icon} ${v.isim}</option>`
  ).join('');
  
  // Kategori filtreleri
  let katFiltre = Object.entries(kategoriler).map(([k, v]) =>
    `<button class="kat-btn" data-kat="${k}" style="--kat-renk: ${v.renk}">${v.icon}</button>`
  ).join('');
  
  pageContent.innerHTML = `
    <div class="quest-page">
      
      <!-- Hero Banner -->
      <div class="quest-hero">
        <div class="quest-hero-bg"></div>
        <div class="quest-hero-content">
          <div class="quest-hero-left">
            <h1 class="quest-title">
              <span class="quest-icon">🗺️</span>
              Macera Haritamız
            </h1>
            <p class="quest-subtitle">Birlikte keşfedilecek hayaller</p>
          </div>
          <div class="quest-hero-stats" id="questHeroStats">
            <div class="hero-stat">
              <span class="hero-stat-num" id="statAktif">0</span>
              <span class="hero-stat-label">Aktif</span>
            </div>
            <div class="hero-stat completed">
              <span class="hero-stat-num" id="statBitti">0</span>
              <span class="hero-stat-label">Başardık</span>
            </div>
          </div>
        </div>
        <div class="quest-mascots">🐧🐰</div>
      </div>
      
      <!-- Progress Journey -->
      <div class="journey-progress" id="journeyProgress">
        <div class="journey-track">
          <div class="journey-fill" id="journeyFill"></div>
          <div class="journey-markers">
            <div class="journey-marker start active">🌱</div>
            <div class="journey-marker" data-at="25">🗺️</div>
            <div class="journey-marker" data-at="50">⭐</div>
            <div class="journey-marker" data-at="75">🏆</div>
            <div class="journey-marker end" data-at="100">💫</div>
          </div>
        </div>
        <p class="journey-text" id="journeyText">Yolculuk başlıyor...</p>
      </div>
      
      <!-- Yeni Hedef Ekleme -->
      <div class="quest-add-section">
        <div class="quest-add-toggle" onclick="toggleAddForm()">
          <span class="add-icon">✨</span>
          <span>Yeni Macera Ekle</span>
          <span class="toggle-arrow">▼</span>
        </div>
        <form class="quest-add-form collapsed" id="questForm">
          <div class="form-main">
            <input type="text" id="questBaslik" placeholder="Hayalinizi yazın..." required>
          </div>
          <div class="form-options">
            <select id="questKategori" required>${katOps}</select>
            <select id="questKisi">
              <option value="İkimiz">🐧🐰 İkimiz</option>
              <option value="Baran">🐧 Baran</option>
              <option value="Bahar">🐰 Bahar</option>
            </select>
            <div class="form-tarih">
              <select id="questYil">${yilOps}</select>
              <select id="questAy">${ayOps}</select>
            </div>
          </div>
          <div class="form-extra">
            <input type="text" id="questNot" placeholder="Ek notlar (opsiyonel)">
            <label class="buyuk-check">
              <input type="checkbox" id="questBuyuk">
              <span>🏔️ Büyük Hedef</span>
            </label>
          </div>
          <button type="submit" class="btn-quest-add">
            <span>🎯</span> Hayale Başla
          </button>
        </form>
      </div>
      
      <!-- Tab Navigation -->
      <div class="quest-tabs">
        <button class="quest-tab active" data-tab="aktif">
          <span>⏳</span> Devam Eden
        </button>
        <button class="quest-tab" data-tab="tamamlanan">
          <span>✅</span> Başarılan
        </button>
        <button class="quest-tab" data-tab="hepsi">
          <span>📋</span> Tümü
        </button>
      </div>
      
      <!-- Kategori Filtreleri -->
      <div class="quest-kategori-bar">
        <button class="kat-btn active" data-kat="">Tümü</button>
        ${katFiltre}
      </div>
      
      <!-- Quest Cards Container -->
      <div class="quest-container" id="questContainer">
        <div class="quest-loading">
          <div class="loading-bounce">🗺️</div>
          <p>Haritanız yükleniyor...</p>
        </div>
      </div>
      
      <!-- Tamamlama Modal -->
      <div class="quest-modal" id="tamamlaModal">
        <div class="modal-overlay" onclick="closeModal('tamamlaModal')"></div>
        <div class="modal-box celebrate">
          <button class="modal-x" onclick="closeModal('tamamlaModal')">×</button>
          <div class="modal-party">🎉</div>
          <h3>Hayali Gerçekleştir!</h3>
          <p class="modal-hedef-text" id="modalHedefText"></p>
          <div class="modal-field">
            <label>Bu anı nasıl tanımlarsın?</label>
            <textarea id="tamamlamaNot" placeholder="İsteğe bağlı not..."></textarea>
          </div>
          <div class="modal-actions">
            <button class="btn-cancel" onclick="closeModal('tamamlaModal')">Vazgeç</button>
            <button class="btn-confirm" onclick="confirmTamamla()">✨ Tamamla!</button>
          </div>
        </div>
      </div>
      
      <!-- Alt Hedef Modal -->
      <div class="quest-modal" id="altHedefModal">
        <div class="modal-overlay" onclick="closeModal('altHedefModal')"></div>
        <div class="modal-box">
          <button class="modal-x" onclick="closeModal('altHedefModal')">×</button>
          <h3>🎯 Checkpoint Ekle</h3>
          <p class="modal-ana-hedef" id="modalAnaHedef"></p>
          <div class="modal-field">
            <input type="text" id="altHedefInput" placeholder="Checkpoint ne olsun?">
          </div>
          <div class="modal-field tarih-field">
            <label>Hedef Tarih</label>
            <div class="tarih-row">
              <select id="altYil">${yilOps}</select>
              <select id="altAy">${ayOps}</select>
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn-cancel" onclick="closeModal('altHedefModal')">Vazgeç</button>
            <button class="btn-confirm" onclick="confirmAltHedef()">➕ Ekle</button>
          </div>
        </div>
      </div>
      
      <!-- Success Celebration -->
      <div class="quest-celebration" id="celebration">
        <div class="celebration-content">
          <div class="celebration-confetti"></div>
          <div class="celebration-emoji">🎊</div>
          <h2>BAŞARDIN!</h2>
          <p id="celebrationText"></p>
          <button onclick="closeCelebration()">Devam Et 🚀</button>
        </div>
      </div>
      
    </div>
  `;
  
  // Event Listeners
  document.getElementById('questForm').addEventListener('submit', handleAddQuest);
  
  document.querySelectorAll('.quest-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.quest-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeTab = tab.dataset.tab;
      renderQuests();
    });
  });
  
  document.querySelectorAll('.kat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.kat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeKategori = btn.dataset.kat || null;
      renderQuests();
    });
  });
  
  await loadQuests();
}

// Form toggle
function toggleAddForm() {
  const form = document.getElementById('questForm');
  form.classList.toggle('collapsed');
}

// Firebase'den yükle
async function loadQuests() {
  await waitForFirebase();
  
  try {
    const db = window.firebaseDb;
    const snapshot = await window.firestoreGetDocs(
      window.firestoreQuery(
        window.firestoreCollection(db, 'bucketList'),
        window.firestoreOrderBy('createdAt', 'desc')
      )
    );
    
    bucketCache = [];
    snapshot.forEach(doc => {
      bucketCache.push({ id: doc.id, ...doc.data() });
    });
    
    renderQuests();
    updateStats();
    
  } catch (err) {
    console.error('Yükleme hatası:', err);
    document.getElementById('questContainer').innerHTML = `
      <div class="quest-empty error">
        <span>😵</span>
        <p>Yüklenirken hata oluştu</p>
      </div>
    `;
  }
}

// İstatistikleri güncelle
function updateStats() {
  const aktif = bucketCache.filter(q => q.durum !== 'tamamlandi').length;
  const bitti = bucketCache.filter(q => q.durum === 'tamamlandi').length;
  const toplam = bucketCache.length;
  
  document.getElementById('statAktif').textContent = aktif;
  document.getElementById('statBitti').textContent = bitti;
  
  // Journey progress
  const yuzde = toplam > 0 ? Math.round((bitti / toplam) * 100) : 0;
  document.getElementById('journeyFill').style.width = `${yuzde}%`;
  
  // Journey text
  let journeyMsg = 'Yolculuk başlıyor...';
  if (bitti >= 1 && bitti < 3) journeyMsg = `${bitti} hayal gerçek oldu! Devam 🌱`;
  else if (bitti >= 3 && bitti < 7) journeyMsg = `${bitti} macera tamamlandı! Harika gidiyorsunuz 🗺️`;
  else if (bitti >= 7 && bitti < 15) journeyMsg = `${bitti} başarı! Gerçek kaşiflersiniz ⭐`;
  else if (bitti >= 15 && bitti < 25) journeyMsg = `${bitti} hayal gerçek! Muhteşem duo 🏆`;
  else if (bitti >= 25) journeyMsg = `${bitti} başarı! Efsanesiniz! 💫`;
  
  document.getElementById('journeyText').textContent = journeyMsg;
  
  // Markers
  document.querySelectorAll('.journey-marker').forEach(m => {
    const at = parseInt(m.dataset.at) || 0;
    m.classList.toggle('active', yuzde >= at);
  });
}

// Questleri render et
function renderQuests() {
  const container = document.getElementById('questContainer');
  
  let filtered = [...bucketCache];
  
  // Tab filter
  if (activeTab === 'aktif') {
    filtered = filtered.filter(q => q.durum !== 'tamamlandi');
  } else if (activeTab === 'tamamlanan') {
    filtered = filtered.filter(q => q.durum === 'tamamlandi');
  }
  
  // Kategori filter
  if (activeKategori) {
    filtered = filtered.filter(q => q.kategori === activeKategori);
  }
  
  // Sort by hedef tarihi, then createdAt
  filtered.sort((a, b) => {
    const aY = a.hedefTarihi?.yil || 9999;
    const bY = b.hedefTarihi?.yil || 9999;
    const aM = a.hedefTarihi?.ay || 0;
    const bM = b.hedefTarihi?.ay || 0;
    const aScore = aY * 12 + aM;
    const bScore = bY * 12 + bM;
    if (aScore !== bScore) return aScore - bScore;
    return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
  });
  
  if (filtered.length === 0) {
    const msg = activeTab === 'tamamlanan' 
      ? 'Henüz tamamlanan hedef yok. İlk maceraya başla!'
      : activeTab === 'aktif'
      ? 'Aktif hedef yok. Yeni bir hayal ekle!'
      : 'Henüz hedef eklenmemiş.';
    
    container.innerHTML = `
      <div class="quest-empty">
        <span>🌟</span>
        <p>${msg}</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = filtered.map((q, i) => renderQuestCard(q, i)).join('');
}

// Tek quest kartı
function renderQuestCard(quest, idx) {
  const kat = kategoriler[quest.kategori] || kategoriler.diger;
  const done = quest.durum === 'tamamlandi';
  const kisiIcon = quest.ekleyen === 'Baran' ? '🐧' : quest.ekleyen === 'Bahar' ? '🐰' : '🐧🐰';
  
  // Tarih format
  const hedefTarih = formatTarih(quest.hedefTarihi);
  const tamamTarih = quest.tamamlanmaTarihi ? formatTimestamp(quest.tamamlanmaTarihi) : '';
  
  // Alt hedefler - ID bazlı sort
  const altHedefler = (quest.altHedefler || []).slice().sort((a, b) => {
    const aY = a.hedefTarihi?.yil || 9999;
    const bY = b.hedefTarihi?.yil || 9999;
    const aM = a.hedefTarihi?.ay || 0;
    const bM = b.hedefTarihi?.ay || 0;
    return (aY * 12 + aM) - (bY * 12 + bM);
  });
  
  const altDone = altHedefler.filter(a => a.durum === 'tamamlandi').length;
  const altTotal = altHedefler.length;
  const altPct = altTotal > 0 ? Math.round((altDone / altTotal) * 100) : 0;
  const isBuyuk = quest.buyukHedef || altTotal > 0;
  
  // Alt hedef listesi HTML - ÖNEMLİ: index yerine ID kullanıyoruz!
  let altHTML = '';
  if (isBuyuk && !done) {
    altHTML = `
      <div class="quest-checkpoints">
        <div class="checkpoints-header">
          <span>📍 Checkpoints</span>
          ${altTotal > 0 ? `<span class="cp-count">${altDone}/${altTotal}</span>` : ''}
        </div>
        ${altTotal > 0 ? `
          <div class="cp-progress-bar">
            <div class="cp-progress-fill" style="width: ${altPct}%"></div>
          </div>
          <div class="cp-list">
            ${altHedefler.map(alt => `
              <div class="cp-item ${alt.durum === 'tamamlandi' ? 'done' : ''}" onclick="toggleCheckpoint('${quest.id}', '${alt.id}')">
                <span class="cp-check">${alt.durum === 'tamamlandi' ? '✓' : '○'}</span>
                <span class="cp-text">${alt.baslik}</span>
                ${alt.hedefTarihi ? `<span class="cp-date">${formatTarih(alt.hedefTarihi)}</span>` : ''}
              </div>
            `).join('')}
          </div>
        ` : '<p class="cp-empty">Checkpoint eklenmemiş</p>'}
        <button class="btn-add-cp" onclick="openAltModal('${quest.id}')">+ Checkpoint Ekle</button>
      </div>
    `;
  }
  
  return `
    <div class="quest-card ${done ? 'completed' : ''} ${isBuyuk ? 'big' : ''}" 
         style="--delay: ${idx * 0.05}s; --kat-renk: ${kat.renk}">
      
      <div class="quest-card-top">
        <span class="quest-kat" style="background: ${kat.renk}22; color: ${kat.renk}">
          ${kat.icon} ${kat.isim}
        </span>
        <span class="quest-kisi">${kisiIcon}</span>
      </div>
      
      ${isBuyuk ? '<div class="big-badge">🏔️ Büyük Hedef</div>' : ''}
      
      <h3 class="quest-title-text">${quest.baslik}</h3>
      
      ${hedefTarih ? `<div class="quest-target">🎯 ${hedefTarih}</div>` : ''}
      ${quest.aciklama ? `<p class="quest-desc">${quest.aciklama}</p>` : ''}
      
      ${altHTML}
      
      ${done ? `
        <div class="quest-completed-info">
          <div class="completed-badge">✓ Başarıldı</div>
          ${tamamTarih ? `<span class="completed-date">🎉 ${tamamTarih}</span>` : ''}
          ${quest.not ? `<p class="completed-note">"${quest.not}"</p>` : ''}
        </div>
      ` : `
        <div class="quest-actions">
          <button class="btn-complete" onclick="openTamamlaModal('${quest.id}')">
            ✨ Tamamla
          </button>
          <button class="btn-delete" onclick="deleteQuest('${quest.id}')" title="Sil">
            🗑️
          </button>
        </div>
      `}
      
    </div>
  `;
}

// Tarih formatları
function formatTarih(t) {
  if (!t || !t.yil) return '';
  const aylar = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
  return t.ay ? `${aylar[t.ay - 1]} ${t.yil}` : `${t.yil}`;
}

function formatTimestamp(ts) {
  if (!ts) return '';
  let d;
  if (ts.seconds) d = new Date(ts.seconds * 1000);
  else if (ts instanceof Date) d = ts;
  else d = new Date(ts);
  const aylar = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
  return `${d.getDate()} ${aylar[d.getMonth()]} ${d.getFullYear()}`;
}

// Yeni hedef ekle
async function handleAddQuest(e) {
  e.preventDefault();
  
  const baslik = document.getElementById('questBaslik').value.trim();
  const kategori = document.getElementById('questKategori').value;
  const kisi = document.getElementById('questKisi').value;
  const yil = document.getElementById('questYil').value;
  const ay = document.getElementById('questAy').value;
  const not = document.getElementById('questNot').value.trim();
  const buyuk = document.getElementById('questBuyuk').checked;
  
  if (!baslik) return alert('Hedef yazın!');
  
  await waitForFirebase();
  
  let hedefTarihi = null;
  if (yil) {
    hedefTarihi = { yil: parseInt(yil) };
    if (ay) hedefTarihi.ay = parseInt(ay);
  }
  
  try {
    const db = window.firebaseDb;
    await window.firestoreAddDoc(
      window.firestoreCollection(db, 'bucketList'),
      {
        baslik,
        kategori,
        ekleyen: kisi,
        aciklama: not || null,
        hedefTarihi,
        buyukHedef: buyuk,
        altHedefler: [],
        durum: 'yapilacak',
        createdAt: window.firestoreServerTimestamp()
      }
    );
    
    document.getElementById('questForm').reset();
    document.getElementById('questForm').classList.add('collapsed');
    
    await loadQuests();
    showToast(buyuk ? '🏔️ Büyük hedef eklendi!' : '🎯 Yeni macera eklendi!');
    
  } catch (err) {
    console.error('Ekleme hatası:', err);
    alert('Hata oluştu!');
  }
}

// Modal işlemleri
let currentQuestId = null;

function openTamamlaModal(id) {
  const quest = bucketCache.find(q => q.id === id);
  if (!quest) return;
  
  currentQuestId = id;
  document.getElementById('modalHedefText').textContent = quest.baslik;
  document.getElementById('tamamlamaNot').value = '';
  document.getElementById('tamamlaModal').classList.add('active');
}

function openAltModal(id) {
  const quest = bucketCache.find(q => q.id === id);
  if (!quest) return;
  
  currentQuestId = id;
  document.getElementById('modalAnaHedef').innerHTML = `<strong>${quest.baslik}</strong>`;
  document.getElementById('altHedefInput').value = '';
  document.getElementById('altYil').value = '';
  document.getElementById('altAy').value = '';
  document.getElementById('altHedefModal').classList.add('active');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
  currentQuestId = null;
}

// Tamamlamayı onayla
async function confirmTamamla() {
  if (!currentQuestId) return;
  
  const not = document.getElementById('tamamlamaNot').value.trim();
  
  await waitForFirebase();
  
  try {
    const db = window.firebaseDb;
    const quest = bucketCache.find(q => q.id === currentQuestId);
    
    await window.firestoreUpdateDoc(
      window.firestoreDoc(db, 'bucketList', currentQuestId),
      {
        durum: 'tamamlandi',
        tamamlanmaTarihi: window.firestoreServerTimestamp(),
        not: not || null
      }
    );
    
    closeModal('tamamlaModal');
    await loadQuests();
    showCelebration(quest?.baslik || 'Hedef');
    
  } catch (err) {
    console.error('Tamamlama hatası:', err);
    alert('Hata!');
  }
}

// Alt hedef ekle
async function confirmAltHedef() {
  if (!currentQuestId) return;
  
  const baslik = document.getElementById('altHedefInput').value.trim();
  const yil = document.getElementById('altYil').value;
  const ay = document.getElementById('altAy').value;
  
  if (!baslik) return alert('Checkpoint yazın!');
  
  await waitForFirebase();
  
  try {
    const db = window.firebaseDb;
    const quest = bucketCache.find(q => q.id === currentQuestId);
    if (!quest) return;
    
    let hedefTarihi = null;
    if (yil) {
      hedefTarihi = { yil: parseInt(yil) };
      if (ay) hedefTarihi.ay = parseInt(ay);
    }
    
    const yeniAlt = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      baslik,
      hedefTarihi,
      durum: 'yapilacak',
      createdAt: new Date().toISOString()
    };
    
    const altHedefler = [...(quest.altHedefler || []), yeniAlt];
    
    await window.firestoreUpdateDoc(
      window.firestoreDoc(db, 'bucketList', currentQuestId),
      { altHedefler, buyukHedef: true }
    );
    
    closeModal('altHedefModal');
    await loadQuests();
    showToast('📍 Checkpoint eklendi!');
    
  } catch (err) {
    console.error('Alt hedef hatası:', err);
    alert('Hata!');
  }
}

// Checkpoint toggle - ID BAZLI (bug fix!)
async function toggleCheckpoint(questId, altId) {
  await waitForFirebase();
  
  try {
    const db = window.firebaseDb;
    const quest = bucketCache.find(q => q.id === questId);
    if (!quest || !quest.altHedefler) return;
    
    // ID ile bul (index yerine!)
    const altHedefler = quest.altHedefler.map(alt => {
      if (alt.id === altId) {
        return {
          ...alt,
          durum: alt.durum === 'tamamlandi' ? 'yapilacak' : 'tamamlandi',
          tamamlanmaTarihi: alt.durum === 'tamamlandi' ? null : new Date().toISOString()
        };
      }
      return alt;
    });
    
    await window.firestoreUpdateDoc(
      window.firestoreDoc(db, 'bucketList', questId),
      { altHedefler }
    );
    
    // Tamamlandı mı kontrol et
    const toggled = altHedefler.find(a => a.id === altId);
    if (toggled?.durum === 'tamamlandi') {
      showToast('🎯 Checkpoint tamamlandı!');
    }
    
    await loadQuests();
    
  } catch (err) {
    console.error('Toggle hatası:', err);
  }
}

// Hedef sil
async function deleteQuest(id) {
  if (!confirm('Bu hayali silmek istediğine emin misin?')) return;
  
  await waitForFirebase();
  
  try {
    const db = window.firebaseDb;
    await window.firestoreDeleteDoc(window.firestoreDoc(db, 'bucketList', id));
    await loadQuests();
    showToast('🗑️ Silindi');
  } catch (err) {
    console.error('Silme hatası:', err);
  }
}

// Toast
function showToast(msg) {
  const existing = document.querySelector('.quest-toast');
  if (existing) existing.remove();
  
  const toast = document.createElement('div');
  toast.className = 'quest-toast';
  toast.textContent = msg;
  document.body.appendChild(toast);
  
  requestAnimationFrame(() => {
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  });
}

// Celebration
function showCelebration(title) {
  const el = document.getElementById('celebration');
  document.getElementById('celebrationText').textContent = `"${title}" gerçek oldu!`;
  el.classList.add('active');
  
  // Confetti
  const confetti = el.querySelector('.celebration-confetti');
  confetti.innerHTML = '';
  const emojis = ['🎉','🎊','✨','💫','⭐','🌟','💕','🎯'];
  for (let i = 0; i < 40; i++) {
    const c = document.createElement('span');
    c.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    c.style.left = Math.random() * 100 + '%';
    c.style.animationDelay = Math.random() * 2 + 's';
    c.style.animationDuration = (2 + Math.random() * 2) + 's';
    confetti.appendChild(c);
  }
}

function closeCelebration() {
  document.getElementById('celebration').classList.remove('active');
}

// Global exports
window.loadBucketListPage = loadBucketListPage;
window.toggleAddForm = toggleAddForm;
window.openTamamlaModal = openTamamlaModal;
window.openAltModal = openAltModal;
window.closeModal = closeModal;
window.confirmTamamla = confirmTamamla;
window.confirmAltHedef = confirmAltHedef;
window.toggleCheckpoint = toggleCheckpoint;
window.deleteQuest = deleteQuest;
window.closeCelebration = closeCelebration;
