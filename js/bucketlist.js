/* ============================================
   BUCKET LIST / ORTAK HEDEFLER SAYFASI
   ✨ Motivasyon Odaklı Versiyon
   ============================================ */

// Bucket List cache ve state
let bucketListCache = [];
let bucketKategoriler = [
  { id: 'seyahat', icon: '🌍', ad: 'Seyahat', renk: '#3b82f6' },
  { id: 'aktivite', icon: '🎢', ad: 'Aktivite', renk: '#f59e0b' },
  { id: 'yemek', icon: '🍽️', ad: 'Yemek', renk: '#ef4444' },
  { id: 'gelisim', icon: '📚', ad: 'Kişisel Gelişim', renk: '#8b5cf6' },
  { id: 'romantik', icon: '💑', ad: 'Romantik', renk: '#ec4899' },
  { id: 'hayaller', icon: '🌟', ad: 'Hayaller', renk: '#fbbf24' },
  { id: 'ev', icon: '🏡', ad: 'Ev / Yaşam', renk: '#10b981' },
  { id: 'eglence', icon: '🎮', ad: 'Eğlence', renk: '#6366f1' }
];
let bucketFiltre = 'hepsi';
let bucketSiralama = 'yeni';

// Seviye sistemi
const seviyeler = [
  { seviye: 1, isim: 'Hayalperest', min: 0, icon: '🌱', renk: '#10b981' },
  { seviye: 2, isim: 'Kaşif Çift', min: 3, icon: '🗺️', renk: '#3b82f6' },
  { seviye: 3, isim: 'Maceraperest', min: 7, icon: '🏔️', renk: '#8b5cf6' },
  { seviye: 4, isim: 'Hayal Avcısı', min: 12, icon: '🎯', renk: '#f59e0b' },
  { seviye: 5, isim: 'Efsane Duo', min: 20, icon: '👑', renk: '#fbbf24' },
  { seviye: 6, isim: 'Sonsuz Aşk', min: 30, icon: '💫', renk: '#ec4899' }
];

// Rozetler
const rozetler = [
  { id: 'ilk_adim', isim: 'İlk Adım', icon: '🎬', sart: 'İlk hedefinizi tamamladınız', kontrol: (t) => t >= 1 },
  { id: 'bes_yildiz', isim: 'Beş Yıldız', icon: '⭐', sart: '5 hedef tamamladınız', kontrol: (t) => t >= 5 },
  { id: 'on_numara', isim: 'On Numara', icon: '🔟', sart: '10 hedef tamamladınız', kontrol: (t) => t >= 10 },
  { id: 'seyahat_gurusu', isim: 'Seyahat Gurusu', icon: '✈️', sart: '3 seyahat hedefi', kontrol: (t, cache) => cache.filter(h => h.durum === 'tamamlandi' && h.kategori === 'seyahat').length >= 3 },
  { id: 'romantik_ruh', isim: 'Romantik Ruh', icon: '💕', sart: '3 romantik hedef', kontrol: (t, cache) => cache.filter(h => h.durum === 'tamamlandi' && h.kategori === 'romantik').length >= 3 },
  { id: 'gurme', isim: 'Gurme Çift', icon: '👨‍🍳', sart: '3 yemek hedefi', kontrol: (t, cache) => cache.filter(h => h.durum === 'tamamlandi' && h.kategori === 'yemek').length >= 3 },
  { id: 'hizli', isim: 'Hızlı Başlangıç', icon: '⚡', sart: '7 günde 3 hedef', kontrol: (t, cache) => {
    const birHaftaOnce = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return cache.filter(h => h.durum === 'tamamlandi' && h.tamamlanmaTarihi?.seconds * 1000 > birHaftaOnce).length >= 3;
  }},
  { id: 'cok_yonlu', isim: 'Çok Yönlü', icon: '🎨', sart: '5 farklı kategoride hedef', kontrol: (t, cache) => {
    const kategoriler = new Set(cache.filter(h => h.durum === 'tamamlandi').map(h => h.kategori));
    return kategoriler.size >= 5;
  }}
];

// Motivasyon sözü
const motivasyonSozu = {
  soz: "Hayat kısa...",
  detay: "Affet • Yardım et • Şükret • Sev • Gülümse • Mutlu ol • ve Başar",
  icon: "✨"
};

// Günün sözünü al
function getGununMotivasyonu() {
  return motivasyonSozu;
}

// Mevcut seviyeyi hesapla
function getMevcutSeviye(tamamlanan) {
  let mevcutSeviye = seviyeler[0];
  for (const seviye of seviyeler) {
    if (tamamlanan >= seviye.min) {
      mevcutSeviye = seviye;
    }
  }
  return mevcutSeviye;
}

// Sonraki seviyeye kalan
function getSonrakiSeviyeBilgisi(tamamlanan) {
  const mevcut = getMevcutSeviye(tamamlanan);
  const sonrakiIndex = seviyeler.findIndex(s => s.seviye === mevcut.seviye) + 1;
  if (sonrakiIndex >= seviyeler.length) {
    return { sonraki: null, kalan: 0 };
  }
  const sonraki = seviyeler[sonrakiIndex];
  return { sonraki, kalan: sonraki.min - tamamlanan };
}

// Bucket List sayfasını yükle
async function loadBucketListPage() {
  const pageContent = document.getElementById('pageContent');
  const motivasyon = getGununMotivasyonu();
  
  let kategoriOptions = bucketKategoriler.map(k => 
    `<option value="${k.id}">${k.icon} ${k.ad}</option>`
  ).join('');
  
  let filtreButonlar = `
    <button class="bucket-filtre-btn active" data-filtre="hepsi">Hepsi</button>
    <button class="bucket-filtre-btn" data-filtre="yapilacak">⏳ Bekleyen</button>
    <button class="bucket-filtre-btn" data-filtre="tamamlandi">✅ Tamamlandı</button>
  `;
  
  let kategoriFiltreler = bucketKategoriler.map(k => 
    `<button class="bucket-filtre-btn kategori-btn" data-filtre="${k.id}" title="${k.ad}">${k.icon}</button>`
  ).join('');
  
  // Yıl seçenekleri
  const bugunYil = new Date().getFullYear();
  let yilOptions = '<option value="">Yıl seçin</option>';
  for (let y = bugunYil; y <= bugunYil + 15; y++) {
    yilOptions += `<option value="${y}">${y}</option>`;
  }
  
  // Ay seçenekleri
  const aylar = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  let ayOptions = '<option value="">Ay (opsiyonel)</option>';
  aylar.forEach((ay, i) => {
    ayOptions += `<option value="${i + 1}">${ay}</option>`;
  });
  
  pageContent.innerHTML = `
    <div class="bucket-list-page">
      <!-- Motivasyon Başlık -->
      <div class="bucket-hero">
        <div class="bucket-hero-content">
          <h2 class="bucket-hero-title">🌟 Ortak Hayallerimiz</h2>
          <div class="bucket-motivasyon">
            <p class="motivasyon-soz">${motivasyon.soz}</p>
            <p class="motivasyon-detay">${motivasyon.detay}</p>
          </div>
        </div>
        <div class="bucket-hero-deco">
          <span class="deco-icon">💑</span>
        </div>
      </div>
      
      <!-- Seviye ve İlerleme Kartı -->
      <div class="bucket-progress-card" id="bucketProgressCard">
        <div class="seviye-kismi">
          <div class="seviye-badge" id="seviyeBadge">
            <span class="seviye-icon">🌱</span>
            <span class="seviye-isim">Yükleniyor...</span>
          </div>
          <div class="seviye-ilerleme" id="seviyeIlerleme">
            <div class="seviye-bar">
              <div class="seviye-bar-fill" id="seviyeBarFill"></div>
            </div>
            <span class="seviye-text" id="seviyeText"></span>
          </div>
        </div>
        <div class="istatistik-kismi" id="istatistikKismi">
          <div class="mini-stat">
            <span class="mini-stat-sayi" id="statTamamlanan">0</span>
            <span class="mini-stat-label">Tamamlandı</span>
          </div>
          <div class="mini-stat">
            <span class="mini-stat-sayi" id="statBekleyen">0</span>
            <span class="mini-stat-label">Bekliyor</span>
          </div>
          <div class="mini-stat">
            <span class="mini-stat-sayi" id="statToplam">0</span>
            <span class="mini-stat-label">Toplam</span>
          </div>
        </div>
      </div>
      
      <!-- Rozetler -->
      <div class="bucket-rozetler-section">
        <h3 class="rozetler-baslik">🏆 Rozetlerimiz</h3>
        <div class="rozetler-grid" id="rozetlerGrid">
          <!-- Rozetler buraya yüklenecek -->
        </div>
      </div>
      
      <!-- Hedef Ekleme Formu -->
      <div class="bucket-ekle-card">
        <div class="ekle-card-header">
          <span class="ekle-icon">✨</span>
          <h3>Yeni Hayal Ekle</h3>
        </div>
        <form id="bucketForm" class="bucket-form">
          <div class="bucket-form-row">
            <div class="bucket-form-group bucket-form-baslik">
              <input type="text" id="bucketBaslik" placeholder="Hayalinizi yazın... (Örn: 2030'a kadar dünya turu yapmak)" required>
            </div>
          </div>
          <div class="bucket-form-row compact">
            <div class="bucket-form-group">
              <select id="bucketKategori" required>
                ${kategoriOptions}
              </select>
            </div>
            <div class="bucket-form-group">
              <select id="bucketKisi" required>
                <option value="Baran">👨 Baran</option>
                <option value="Bahar">👩 Bahar</option>
                <option value="İkimiz">💑 İkimiz</option>
              </select>
            </div>
            <div class="bucket-form-group priority-group">
              <select id="bucketOncelik">
                <option value="normal">📌 Normal</option>
                <option value="yuksek">🔥 Öncelikli</option>
                <option value="yakinda">⏰ Yakında</option>
              </select>
            </div>
          </div>
          <div class="bucket-form-row compact tarih-row">
            <div class="bucket-form-group">
              <label>🎯 Hedef Tarihi</label>
              <div class="tarih-selects">
                <select id="bucketHedefYil">
                  ${yilOptions}
                </select>
                <select id="bucketHedefAy">
                  ${ayOptions}
                </select>
              </div>
            </div>
            <div class="bucket-form-group buyuk-hedef-toggle">
              <label class="toggle-label">
                <input type="checkbox" id="bucketBuyukHedef" onchange="toggleAltHedefAlani()">
                <span class="toggle-switch"></span>
                <span class="toggle-text">🏔️ Büyük Hedef (Alt hedefler eklenebilir)</span>
              </label>
            </div>
          </div>
          <div class="bucket-form-row">
            <div class="bucket-form-group bucket-form-aciklama">
              <input type="text" id="bucketAciklama" placeholder="Detay ekleyin... (opsiyonel)">
            </div>
            <button type="submit" class="btn-bucket-ekle">
              <span>🎯</span> Ekle
            </button>
          </div>
        </form>
      </div>
      
      <!-- Filtreler -->
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
            <option value="yeni">🕐 En Yeni</option>
            <option value="eski">📅 En Eski</option>
            <option value="oncelik">🔥 Önceliğe Göre</option>
            <option value="hedefTarihi">🎯 Hedef Tarihine Göre</option>
            <option value="kategori">📂 Kategoriye Göre</option>
          </select>
        </div>
      </div>
      
      <!-- Hedefler Listesi -->
      <div class="bucket-list-container" id="bucketListContainer">
        <div class="loading-spinner">
          <div class="spinner"></div>
          <p>Hayalleriniz yükleniyor...</p>
        </div>
      </div>
      
      <!-- Tamamlama Modal -->
      <div class="bucket-modal" id="bucketTamamlaModal">
        <div class="bucket-modal-content celebration-modal">
          <button class="modal-close" onclick="closeBucketModal()">×</button>
          <div class="bucket-modal-header">
            <div class="confetti-container" id="modalConfetti"></div>
            <span class="bucket-modal-icon bounce">🎉</span>
            <h3>Bir Hayal Daha Gerçek Oluyor!</h3>
          </div>
          <div class="bucket-modal-body">
            <p class="bucket-modal-hedef" id="bucketModalHedef"></p>
            <div class="bucket-modal-form">
              <label for="bucketNot">Bu anı nasıl tanımlarsınız?</label>
              <textarea id="bucketNot" placeholder="Bu özel anı birkaç kelimeyle anlatın... 💭"></textarea>
            </div>
            <div class="bucket-modal-tarih">
              <label for="bucketTamamTarih">Ne zaman gerçekleşti?</label>
              <input type="date" id="bucketTamamTarih" value="${new Date().toISOString().split('T')[0]}">
            </div>
          </div>
          <div class="bucket-modal-footer">
            <button class="btn-bucket-iptal" onclick="closeBucketModal()">Vazgeç</button>
            <button class="btn-bucket-kaydet" onclick="confirmBucketTamamla()">
              <span>✨</span> Hayali Gerçekleştir
            </button>
          </div>
        </div>
      </div>
      
      <!-- Büyük Kutlama Overlay -->
      <div class="mega-celebration" id="megaCelebration">
        <div class="mega-celebration-content">
          <div class="mega-confetti"></div>
          <span class="mega-emoji">🎊</span>
          <h2 class="mega-title">TEBRİKLER!</h2>
          <p class="mega-text" id="megaText">Bir hayal daha gerçek oldu!</p>
          <div class="mega-stats" id="megaStats"></div>
          <button class="mega-close-btn" onclick="closeMegaCelebration()">Devam Et 🚀</button>
        </div>
      </div>
      
      <!-- Alt Hedef Ekleme Modal -->
      <div class="bucket-modal" id="altHedefModal">
        <div class="bucket-modal-content">
          <button class="modal-close" onclick="closeAltHedefModal()">×</button>
          <div class="bucket-modal-header">
            <span class="bucket-modal-icon">🎯</span>
            <h3>Alt Hedef Ekle</h3>
          </div>
          <div class="bucket-modal-body">
            <p class="alt-hedef-ana-baslik" id="altHedefAnaBaslik"></p>
            <div class="bucket-modal-form">
              <label for="altHedefBaslik">Alt hedef ne olsun?</label>
              <input type="text" id="altHedefBaslik" placeholder="Örn: Avrupa turunu tamamla" required>
            </div>
            <div class="bucket-modal-tarih alt-hedef-tarih">
              <label>Hedef Tarihi</label>
              <div class="tarih-selects">
                <select id="altHedefYil"></select>
                <select id="altHedefAy"></select>
              </div>
            </div>
          </div>
          <div class="bucket-modal-footer">
            <button class="btn-bucket-iptal" onclick="closeAltHedefModal()">Vazgeç</button>
            <button class="btn-bucket-kaydet" onclick="confirmAltHedefEkle()">
              <span>➕</span> Alt Hedef Ekle
            </button>
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
    renderRozetler();
    
    console.log(`🪣 ${bucketListCache.length} hedef yüklendi`);
  } catch (error) {
    console.error('Bucket list yüklenirken hata:', error);
    document.getElementById('bucketListContainer').innerHTML = `
      <div class="bucket-empty">
        <span class="bucket-empty-icon">😢</span>
        <p>Hayaller yüklenirken bir hata oluştu</p>
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
  
  // Sıralama
  if (bucketSiralama === 'yeni') {
    filtrelenmis.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  } else if (bucketSiralama === 'eski') {
    filtrelenmis.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
  } else if (bucketSiralama === 'oncelik') {
    const oncelikSira = { 'yakinda': 0, 'yuksek': 1, 'normal': 2 };
    filtrelenmis.sort((a, b) => (oncelikSira[a.oncelik] || 2) - (oncelikSira[b.oncelik] || 2));
  } else if (bucketSiralama === 'hedefTarihi') {
    filtrelenmis.sort((a, b) => {
      const aYil = a.hedefTarihi?.yil || 9999;
      const bYil = b.hedefTarihi?.yil || 9999;
      const aAy = a.hedefTarihi?.ay || 0;
      const bAy = b.hedefTarihi?.ay || 0;
      return (aYil * 12 + aAy) - (bYil * 12 + bAy);
    });
  } else if (bucketSiralama === 'kategori') {
    filtrelenmis.sort((a, b) => a.kategori.localeCompare(b.kategori));
  }
  
  if (filtrelenmis.length === 0) {
    const mesaj = bucketFiltre === 'tamamlandi' 
      ? 'Henüz tamamlanan hedef yok. İlk hayalinizi gerçekleştirmeye ne dersiniz? 🌟'
      : bucketFiltre === 'yapilacak'
      ? 'Tüm hayallerinizi gerçekleştirmişsiniz! 🎉'
      : 'Henüz hayal eklenmemiş. Birlikte hayal kurmaya başlayın! 💭';
    
    container.innerHTML = `
      <div class="bucket-empty">
        <span class="bucket-empty-icon">✨</span>
        <p>${mesaj}</p>
      </div>
    `;
    return;
  }
  
  // Tamamlananları ve bekleyenleri ayır
  const bekleyenler = filtrelenmis.filter(h => h.durum === 'yapilacak');
  const tamamlananlar = filtrelenmis.filter(h => h.durum === 'tamamlandi');
  
  let html = '';
  
  // Bekleyen hedefler
  if (bekleyenler.length > 0 && bucketFiltre !== 'tamamlandi') {
    html += '<div class="bucket-section"><h3 class="bucket-section-title">⏳ Bekleyen Hayaller</h3><div class="bucket-grid">';
    bekleyenler.forEach((hedef, index) => {
      html += renderBucketCard(hedef, index);
    });
    html += '</div></div>';
  }
  
  // Tamamlanan hedefler
  if (tamamlananlar.length > 0 && bucketFiltre !== 'yapilacak') {
    html += '<div class="bucket-section tamamlananlar"><h3 class="bucket-section-title">✅ Gerçekleşen Hayaller</h3><div class="bucket-grid completed-grid">';
    tamamlananlar.forEach((hedef, index) => {
      html += renderBucketCard(hedef, index);
    });
    html += '</div></div>';
  }
  
  container.innerHTML = html;
}

// Tek kart render
function renderBucketCard(hedef, index) {
  const kategori = bucketKategoriler.find(k => k.id === hedef.kategori) || { icon: '🎯', ad: 'Diğer', renk: '#6b7280' };
  const tamamlandi = hedef.durum === 'tamamlandi';
  const tarih = hedef.createdAt ? formatBucketTarih(hedef.createdAt) : '';
  const tamamlanmaTarihi = hedef.tamamlanmaTarihi ? formatBucketTarih(hedef.tamamlanmaTarihi) : '';
  
  const oncelikClass = hedef.oncelik === 'yuksek' ? 'oncelik-yuksek' : hedef.oncelik === 'yakinda' ? 'oncelik-yakinda' : '';
  const oncelikBadge = hedef.oncelik === 'yuksek' ? '<span class="oncelik-badge yuksek">🔥</span>' : 
                       hedef.oncelik === 'yakinda' ? '<span class="oncelik-badge yakinda">⏰</span>' : '';
  
  const ekleyenIcon = hedef.ekleyen === 'Baran' ? '👨' : hedef.ekleyen === 'Bahar' ? '👩' : '💑';
  
  // Hedef tarihi formatla
  const hedefTarihiStr = formatHedefTarihi(hedef.hedefTarihi);
  
  // Alt hedefler için ilerleme hesapla
  const altHedefler = hedef.altHedefler || [];
  const tamamlananAltHedefSayisi = altHedefler.filter(a => a.durum === 'tamamlandi').length;
  const altHedefIlerleme = altHedefler.length > 0 ? Math.round((tamamlananAltHedefSayisi / altHedefler.length) * 100) : 0;
  const buyukHedefMi = hedef.buyukHedef || altHedefler.length > 0;
  
  // Alt hedefler HTML
  let altHedeflerHTML = '';
  if (buyukHedefMi && !tamamlandi) {
    altHedeflerHTML = `
      <div class="alt-hedefler-section">
        <div class="alt-hedefler-header">
          <span class="alt-hedefler-title">📋 Alt Hedefler</span>
          <span class="alt-hedefler-progress">${tamamlananAltHedefSayisi}/${altHedefler.length}</span>
        </div>
        ${altHedefler.length > 0 ? `
          <div class="alt-hedef-ilerleme-bar">
            <div class="alt-hedef-ilerleme-fill" style="width: ${altHedefIlerleme}%"></div>
          </div>
          <div class="alt-hedefler-list">
            ${altHedefler.map((alt, i) => `
              <div class="alt-hedef-item ${alt.durum === 'tamamlandi' ? 'tamamlandi' : ''}" data-index="${i}">
                <button class="alt-hedef-check" onclick="toggleAltHedef('${hedef.id}', ${i})" title="${alt.durum === 'tamamlandi' ? 'Geri al' : 'Tamamla'}">
                  ${alt.durum === 'tamamlandi' ? '✓' : '○'}
                </button>
                <span class="alt-hedef-baslik">${alt.baslik}</span>
                ${alt.hedefTarihi ? `<span class="alt-hedef-tarih">${formatHedefTarihi(alt.hedefTarihi)}</span>` : ''}
              </div>
            `).join('')}
          </div>
        ` : '<p class="alt-hedef-bos">Henüz alt hedef eklenmemiş</p>'}
        <button class="btn-alt-hedef-ekle" onclick="openAltHedefModal('${hedef.id}')">
          <span>➕</span> Alt Hedef Ekle
        </button>
      </div>
    `;
  }
  
  return `
    <div class="bucket-card ${tamamlandi ? 'tamamlandi' : ''} ${oncelikClass} ${buyukHedefMi ? 'buyuk-hedef' : ''}" data-id="${hedef.id}" style="animation-delay: ${index * 0.05}s; --kategori-renk: ${kategori.renk}">
      ${oncelikBadge}
      ${buyukHedefMi ? '<span class="buyuk-hedef-badge">🏔️ Büyük Hedef</span>' : ''}
      <div class="bucket-card-header">
        <span class="bucket-kategori-badge" style="background: ${kategori.renk}20; color: ${kategori.renk}">${kategori.icon} ${kategori.ad}</span>
        <span class="bucket-kisi-badge">${ekleyenIcon}</span>
      </div>
      
      <h4 class="bucket-card-baslik">${hedef.baslik}</h4>
      
      ${hedefTarihiStr ? `<div class="bucket-hedef-tarih"><span class="hedef-tarih-icon">🎯</span> Hedef: ${hedefTarihiStr}</div>` : ''}
      
      ${hedef.aciklama ? `<p class="bucket-card-aciklama">${hedef.aciklama}</p>` : ''}
      
      ${altHedeflerHTML}
      
      ${tamamlandi ? `
        <div class="bucket-tamamlandi-info">
          <div class="bucket-tamamlandi-badge">
            <span class="check-icon">✓</span>
            Gerçekleşti!
          </div>
          <span class="bucket-tamamlanma-tarihi">🎉 ${tamamlanmaTarihi}</span>
          ${hedef.not ? `<p class="bucket-not">"${hedef.not}"</p>` : ''}
        </div>
      ` : `
        <div class="bucket-card-footer">
          <span class="bucket-tarih">📅 ${tarih}</span>
          <button class="btn-bucket-tamamla" onclick="openBucketTamamlaModal('${hedef.id}')">
            <span class="tamamla-icon">✨</span>
            <span class="tamamla-text">Tamamla</span>
          </button>
        </div>
      `}
      
      ${!tamamlandi ? `
        <button class="btn-bucket-sil" onclick="silBucketHedef('${hedef.id}')" title="Sil">
          ×
        </button>
      ` : ''}
    </div>
  `;
}

// Hedef tarihi formatla
function formatHedefTarihi(hedefTarihi) {
  if (!hedefTarihi || !hedefTarihi.yil) return '';
  const aylar = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  if (hedefTarihi.ay) {
    return `${aylar[hedefTarihi.ay - 1]} ${hedefTarihi.yil}`;
  }
  return `${hedefTarihi.yil}`;
}

// Rozetleri render et
function renderRozetler() {
  const grid = document.getElementById('rozetlerGrid');
  if (!grid) return;
  
  const tamamlanan = bucketListCache.filter(h => h.durum === 'tamamlandi').length;
  
  let html = '';
  rozetler.forEach(rozet => {
    const kazanildi = rozet.kontrol(tamamlanan, bucketListCache);
    html += `
      <div class="rozet-item ${kazanildi ? 'kazanildi' : 'kilitli'}" title="${rozet.sart}">
        <span class="rozet-icon">${kazanildi ? rozet.icon : '🔒'}</span>
        <span class="rozet-isim">${rozet.isim}</span>
        ${!kazanildi ? `<span class="rozet-sart">${rozet.sart}</span>` : ''}
      </div>
    `;
  });
  
  grid.innerHTML = html;
}

// İstatistikleri güncelle
function updateBucketStats() {
  const toplam = bucketListCache.length;
  const tamamlanan = bucketListCache.filter(h => h.durum === 'tamamlandi').length;
  const bekleyen = toplam - tamamlanan;
  
  // Mini istatistikler
  const statTamamlanan = document.getElementById('statTamamlanan');
  const statBekleyen = document.getElementById('statBekleyen');
  const statToplam = document.getElementById('statToplam');
  
  if (statTamamlanan) statTamamlanan.textContent = tamamlanan;
  if (statBekleyen) statBekleyen.textContent = bekleyen;
  if (statToplam) statToplam.textContent = toplam;
  
  // Seviye sistemi
  const seviye = getMevcutSeviye(tamamlanan);
  const sonrakiBilgi = getSonrakiSeviyeBilgisi(tamamlanan);
  
  const seviyeBadge = document.getElementById('seviyeBadge');
  const seviyeBarFill = document.getElementById('seviyeBarFill');
  const seviyeText = document.getElementById('seviyeText');
  
  if (seviyeBadge) {
    seviyeBadge.innerHTML = `
      <span class="seviye-icon">${seviye.icon}</span>
      <span class="seviye-isim">${seviye.isim}</span>
    `;
    seviyeBadge.style.background = `linear-gradient(135deg, ${seviye.renk}20, ${seviye.renk}40)`;
    seviyeBadge.style.borderColor = seviye.renk;
  }
  
  if (seviyeBarFill && seviyeText) {
    if (sonrakiBilgi.sonraki) {
      const aradakiFark = sonrakiBilgi.sonraki.min - seviye.min;
      const yapilan = tamamlanan - seviye.min;
      const yuzde = Math.round((yapilan / aradakiFark) * 100);
      seviyeBarFill.style.width = `${yuzde}%`;
      seviyeBarFill.style.background = `linear-gradient(90deg, ${seviye.renk}, ${sonrakiBilgi.sonraki.renk})`;
      seviyeText.innerHTML = `Sonraki seviye: <strong>${sonrakiBilgi.sonraki.isim}</strong> (${sonrakiBilgi.kalan} hedef kaldı)`;
    } else {
      seviyeBarFill.style.width = '100%';
      seviyeBarFill.style.background = `linear-gradient(90deg, ${seviye.renk}, gold)`;
      seviyeText.innerHTML = `🎊 Maksimum seviyeye ulaştınız!`;
    }
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
  const oncelik = document.getElementById('bucketOncelik').value;
  const hedefYil = document.getElementById('bucketHedefYil').value;
  const hedefAy = document.getElementById('bucketHedefAy').value;
  const buyukHedef = document.getElementById('bucketBuyukHedef').checked;
  
  if (!baslik) {
    alert('Lütfen bir hayal girin!');
    return;
  }
  
  await waitForFirebase();
  
  // Hedef tarihi objesi
  let hedefTarihi = null;
  if (hedefYil) {
    hedefTarihi = { yil: parseInt(hedefYil) };
    if (hedefAy) {
      hedefTarihi.ay = parseInt(hedefAy);
    }
  }
  
  try {
    const db = window.firebaseDb;
    
    await window.firestoreAddDoc(
      window.firestoreCollection(db, 'bucketList'),
      {
        baslik: baslik,
        kategori: kategori,
        ekleyen: ekleyen,
        aciklama: aciklama || null,
        oncelik: oncelik,
        hedefTarihi: hedefTarihi,
        buyukHedef: buyukHedef,
        altHedefler: [],
        durum: 'yapilacak',
        createdAt: window.firestoreServerTimestamp()
      }
    );
    
    document.getElementById('bucketForm').reset();
    await loadBucketList();
    
    // Mini kutlama
    showMiniToast(buyukHedef ? '🏔️ Büyük hedef eklendi!' : '🎯 Yeni bir hayal eklendi!');
    
    console.log(`🎯 Yeni hedef eklendi: ${baslik}`);
  } catch (error) {
    console.error('Hedef eklenirken hata:', error);
    alert('Bir hata oluştu!');
  }
}

// Toggle fonksiyonu (şimdilik sadece görsel)
function toggleAltHedefAlani() {
  // İleride form içinde alt hedef alanı göstermek için kullanılabilir
}

// Mini toast göster
function showMiniToast(mesaj) {
  const toast = document.createElement('div');
  toast.className = 'bucket-mini-toast';
  toast.innerHTML = mesaj;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }, 100);
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
  const tarihInput = document.getElementById('bucketTamamTarih');
  
  hedefText.textContent = hedef.baslik;
  notInput.value = '';
  tarihInput.value = new Date().toISOString().split('T')[0];
  
  modal.classList.add('active');
  
  // Modal confetti
  createModalConfetti();
}

// Modal confetti
function createModalConfetti() {
  const container = document.getElementById('modalConfetti');
  if (!container) return;
  container.innerHTML = '';
  
  const emojiler = ['🎉', '✨', '🌟', '💫', '🎊', '💕'];
  for (let i = 0; i < 15; i++) {
    const confetti = document.createElement('span');
    confetti.className = 'modal-confetti-piece';
    confetti.textContent = emojiler[Math.floor(Math.random() * emojiler.length)];
    confetti.style.left = `${Math.random() * 100}%`;
    confetti.style.animationDelay = `${Math.random() * 2}s`;
    confetti.style.animationDuration = `${2 + Math.random() * 2}s`;
    container.appendChild(confetti);
  }
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
  const tarih = document.getElementById('bucketTamamTarih').value;
  
  await waitForFirebase();
  
  try {
    const db = window.firebaseDb;
    const hedef = bucketListCache.find(h => h.id === tamamlanacakHedefId);
    
    await window.firestoreUpdateDoc(
      window.firestoreDoc(db, 'bucketList', tamamlanacakHedefId),
      {
        durum: 'tamamlandi',
        tamamlanmaTarihi: tarih ? new Date(tarih) : window.firestoreServerTimestamp(),
        not: not || null
      }
    );
    
    closeBucketModal();
    
    // Büyük kutlama
    const eskiTamamlanan = bucketListCache.filter(h => h.durum === 'tamamlandi').length;
    await loadBucketList();
    const yeniTamamlanan = bucketListCache.filter(h => h.durum === 'tamamlandi').length;
    
    showMegaCelebration(hedef, yeniTamamlanan);
    
    // Seviye atladı mı kontrol et
    const eskiSeviye = getMevcutSeviye(eskiTamamlanan);
    const yeniSeviye = getMevcutSeviye(yeniTamamlanan);
    if (yeniSeviye.seviye > eskiSeviye.seviye) {
      setTimeout(() => {
        showMiniToast(`🎊 YENİ SEVİYE: ${yeniSeviye.isim} ${yeniSeviye.icon}`);
      }, 3000);
    }
    
    console.log(`🎉 Hedef tamamlandı: ${hedef.baslik}`);
  } catch (error) {
    console.error('Hedef tamamlanırken hata:', error);
    alert('Bir hata oluştu!');
  }
}

// Büyük kutlama göster
function showMegaCelebration(hedef, toplam) {
  const overlay = document.getElementById('megaCelebration');
  const textEl = document.getElementById('megaText');
  const statsEl = document.getElementById('megaStats');
  
  if (!overlay) return;
  
  textEl.innerHTML = `"${hedef.baslik}"<br><small>hayaliniz gerçek oldu!</small>`;
  
  const seviye = getMevcutSeviye(toplam);
  statsEl.innerHTML = `
    <div class="mega-stat-item">
      <span class="mega-stat-icon">${seviye.icon}</span>
      <span class="mega-stat-text">${seviye.isim}</span>
    </div>
    <div class="mega-stat-item">
      <span class="mega-stat-number">${toplam}</span>
      <span class="mega-stat-text">hayal gerçek oldu</span>
    </div>
  `;
  
  overlay.classList.add('active');
  
  // Confetti yağmuru
  createMegaConfetti();
}

// Mega confetti
function createMegaConfetti() {
  const overlay = document.getElementById('megaCelebration');
  if (!overlay) return;
  
  const confettiContainer = overlay.querySelector('.mega-confetti');
  if (!confettiContainer) return;
  confettiContainer.innerHTML = '';
  
  const emojiler = ['🎉', '✨', '🌟', '💫', '🎊', '💕', '🎯', '👏', '🥳', '💖'];
  
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement('span');
    confetti.className = 'mega-confetti-piece';
    confetti.textContent = emojiler[Math.floor(Math.random() * emojiler.length)];
    confetti.style.left = `${Math.random() * 100}%`;
    confetti.style.animationDelay = `${Math.random() * 3}s`;
    confetti.style.animationDuration = `${3 + Math.random() * 3}s`;
    confetti.style.fontSize = `${1 + Math.random() * 1.5}rem`;
    confettiContainer.appendChild(confetti);
  }
}

// Mega kutlamayı kapat
function closeMegaCelebration() {
  const overlay = document.getElementById('megaCelebration');
  if (overlay) {
    overlay.classList.remove('active');
  }
}

// Hedef sil
async function silBucketHedef(id) {
  if (!confirm('Bu hayali silmek istediğinize emin misiniz?')) {
    return;
  }
  
  await waitForFirebase();
  
  try {
    const db = window.firebaseDb;
    await window.firestoreDeleteDoc(window.firestoreDoc(db, 'bucketList', id));
    
    await loadBucketList();
    showMiniToast('🗑️ Hayal silindi');
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

// Alt hedef modal için state
let altHedefEklenecekHedefId = null;

// Alt hedef modal aç
function openAltHedefModal(hedefId) {
  const hedef = bucketListCache.find(h => h.id === hedefId);
  if (!hedef) return;
  
  altHedefEklenecekHedefId = hedefId;
  
  const modal = document.getElementById('altHedefModal');
  const anaBaslik = document.getElementById('altHedefAnaBaslik');
  const baslikInput = document.getElementById('altHedefBaslik');
  const yilSelect = document.getElementById('altHedefYil');
  const aySelect = document.getElementById('altHedefAy');
  
  anaBaslik.innerHTML = `<strong>Ana Hedef:</strong> ${hedef.baslik}`;
  baslikInput.value = '';
  
  // Yıl seçenekleri
  const bugunYil = new Date().getFullYear();
  let yilOptions = '<option value="">Yıl seçin</option>';
  for (let y = bugunYil; y <= bugunYil + 15; y++) {
    yilOptions += `<option value="${y}">${y}</option>`;
  }
  yilSelect.innerHTML = yilOptions;
  
  // Ay seçenekleri
  const aylar = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  let ayOptions = '<option value="">Ay (opsiyonel)</option>';
  aylar.forEach((ay, i) => {
    ayOptions += `<option value="${i + 1}">${ay}</option>`;
  });
  aySelect.innerHTML = ayOptions;
  
  modal.classList.add('active');
}

// Alt hedef modal kapat
function closeAltHedefModal() {
  const modal = document.getElementById('altHedefModal');
  modal.classList.remove('active');
  altHedefEklenecekHedefId = null;
}

// Alt hedef eklemeyi onayla
async function confirmAltHedefEkle() {
  if (!altHedefEklenecekHedefId) return;
  
  const baslik = document.getElementById('altHedefBaslik').value.trim();
  const yil = document.getElementById('altHedefYil').value;
  const ay = document.getElementById('altHedefAy').value;
  
  if (!baslik) {
    alert('Lütfen alt hedef için bir başlık girin!');
    return;
  }
  
  await waitForFirebase();
  
  try {
    const db = window.firebaseDb;
    const hedef = bucketListCache.find(h => h.id === altHedefEklenecekHedefId);
    if (!hedef) return;
    
    // Hedef tarihi oluştur
    let hedefTarihi = null;
    if (yil) {
      hedefTarihi = { yil: parseInt(yil) };
      if (ay) {
        hedefTarihi.ay = parseInt(ay);
      }
    }
    
    // Yeni alt hedef
    const yeniAltHedef = {
      id: Date.now().toString(),
      baslik: baslik,
      hedefTarihi: hedefTarihi,
      durum: 'yapilacak',
      createdAt: new Date().toISOString()
    };
    
    // Mevcut alt hedeflere ekle
    const altHedefler = hedef.altHedefler || [];
    altHedefler.push(yeniAltHedef);
    
    // Firestore'u güncelle
    await window.firestoreUpdateDoc(
      window.firestoreDoc(db, 'bucketList', altHedefEklenecekHedefId),
      { 
        altHedefler: altHedefler,
        buyukHedef: true
      }
    );
    
    closeAltHedefModal();
    await loadBucketList();
    showMiniToast('✅ Alt hedef eklendi!');
    
  } catch (error) {
    console.error('Alt hedef eklenirken hata:', error);
    alert('Bir hata oluştu!');
  }
}

// Alt hedef tamamla/geri al
async function toggleAltHedef(hedefId, altIndex) {
  await waitForFirebase();
  
  try {
    const db = window.firebaseDb;
    const hedef = bucketListCache.find(h => h.id === hedefId);
    if (!hedef || !hedef.altHedefler) return;
    
    const altHedefler = [...hedef.altHedefler];
    const altHedef = altHedefler[altIndex];
    
    if (altHedef.durum === 'tamamlandi') {
      altHedef.durum = 'yapilacak';
      altHedef.tamamlanmaTarihi = null;
    } else {
      altHedef.durum = 'tamamlandi';
      altHedef.tamamlanmaTarihi = new Date().toISOString();
    }
    
    await window.firestoreUpdateDoc(
      window.firestoreDoc(db, 'bucketList', hedefId),
      { altHedefler: altHedefler }
    );
    
    await loadBucketList();
    
    if (altHedef.durum === 'tamamlandi') {
      showMiniToast('🎯 Alt hedef tamamlandı!');
    }
    
  } catch (error) {
    console.error('Alt hedef güncellenirken hata:', error);
  }
}

// Global fonksiyonlar - Bucket List
window.loadBucketListPage = loadBucketListPage;
window.openBucketTamamlaModal = openBucketTamamlaModal;
window.closeBucketModal = closeBucketModal;
window.confirmBucketTamamla = confirmBucketTamamla;
window.silBucketHedef = silBucketHedef;
window.changeBucketSiralama = changeBucketSiralama;
window.closeMegaCelebration = closeMegaCelebration;
window.openAltHedefModal = openAltHedefModal;
window.closeAltHedefModal = closeAltHedefModal;
window.confirmAltHedefEkle = confirmAltHedefEkle;
window.toggleAltHedef = toggleAltHedef;
window.toggleAltHedefAlani = toggleAltHedefAlani;
