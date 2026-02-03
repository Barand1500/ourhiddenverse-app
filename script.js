/* ============================================
   OURHIDDENVERSE - ANA JAVASCRIPT DOSYASI
   Menü etkileşimleri ve sayfa yönetimi
   Firebase Firestore entegrasyonlu
   ============================================ */

/* ============================================
   PWA INSTALL (Ana Ekrana Ekle)
   ============================================ */
let deferredPrompt;

function initPWA() {
  // Service Worker kaydet
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('✅ Service Worker kayıtlı'))
      .catch(err => console.log('Service Worker hatası:', err));
  }
  
  // Install prompt yakala
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Install butonunu göster
    const installBtn = document.getElementById('pwaInstallBtn');
    if (installBtn) {
      installBtn.style.display = 'flex';
      installBtn.addEventListener('click', installPWA);
    }
    
    console.log('📲 PWA kurulabilir');
  });
  
  // Kurulum tamamlandı
  window.addEventListener('appinstalled', () => {
    console.log('✅ PWA kuruldu!');
    deferredPrompt = null;
    const installBtn = document.getElementById('pwaInstallBtn');
    if (installBtn) installBtn.style.display = 'none';
  });
}

async function installPWA() {
  if (!deferredPrompt) return;
  
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  
  console.log(`PWA kurulum sonucu: ${outcome}`);
  deferredPrompt = null;
  
  const installBtn = document.getElementById('pwaInstallBtn');
  if (installBtn) installBtn.style.display = 'none';
}

/* ============================================
   ONAY MODALI (Confirm Dialog)
   ============================================ */
let confirmResolve = null;

function showConfirmModal(options = {}) {
  return new Promise((resolve) => {
    confirmResolve = resolve;
    
    const {
      icon = '⚠️',
      title = 'Emin misin?',
      message = 'Bu işlem geri alınamaz.',
      confirmText = 'Evet',
      cancelText = 'İptal',
      confirmType = 'danger' // danger, primary
    } = options;
    
    // Modal HTML oluştur
    const modalHTML = `
      <div class="confirm-modal-overlay active" id="confirmModalOverlay">
        <div class="confirm-modal">
          <span class="confirm-icon">${icon}</span>
          <h3 class="confirm-title">${title}</h3>
          <p class="confirm-message">${message}</p>
          <div class="confirm-buttons">
            <button class="confirm-btn cancel" onclick="closeConfirmModal(false)">${cancelText}</button>
            <button class="confirm-btn ${confirmType}" onclick="closeConfirmModal(true)">${confirmText}</button>
          </div>
        </div>
      </div>
    `;
    
    // Modal'ı DOM'a ekle
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  });
}

function closeConfirmModal(result) {
  const overlay = document.getElementById('confirmModalOverlay');
  if (overlay) {
    overlay.classList.remove('active');
    setTimeout(() => overlay.remove(), 300);
  }
  
  if (confirmResolve) {
    confirmResolve(result);
    confirmResolve = null;
  }
}

// ESC ile kapat
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const confirmOverlay = document.getElementById('confirmModalOverlay');
    if (confirmOverlay) closeConfirmModal(false);
  }
});

/* ============================================
   EMOJİ PICKER
   ============================================ */
const emojiCategories = {
  'Duygular': ['😊', '😍', '🥰', '😘', '💕', '❤️', '💖', '💗', '💓', '💝', '🥺', '😢', '😭', '🤗', '😌'],
  'Kalpler': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💔', '❣️', '💞', '💟', '♥️', '💘', '💝'],
  'Yıldızlar': ['⭐', '🌟', '✨', '💫', '🌙', '☀️', '🌈', '🔥', '💥', '⚡', '❄️', '🌸', '🌺', '🌹', '🌻'],
  'Aktivite': ['🎬', '🎮', '📚', '🎵', '🎧', '🎤', '🎸', '🎹', '🍿', '☕', '🍕', '🍦', '🎂', '🎁', '🎉'],
  'Semboller': ['✅', '❌', '⭕', '💯', '🔴', '🟢', '🔵', '⚪', '✍️', '📝', '📍', '🏠', '✈️', '🚗', '🎯']
};

function createEmojiPicker(targetTextareaId) {
  const wrapper = document.createElement('div');
  wrapper.className = 'emoji-picker-wrapper';
  wrapper.innerHTML = `
    <button type="button" class="emoji-trigger" onclick="toggleEmojiPicker(this)">😊</button>
    <div class="emoji-picker" id="emojiPicker_${targetTextareaId}">
      ${Object.entries(emojiCategories).map(([category, emojis]) => `
        <div class="emoji-category">
          <div class="emoji-category-title">${category}</div>
          <div class="emoji-list">
            ${emojis.map(emoji => `
              <span class="emoji-item" onclick="insertEmoji('${emoji}', '${targetTextareaId}')">${emoji}</span>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;
  return wrapper;
}

function toggleEmojiPicker(btn) {
  const picker = btn.nextElementSibling;
  picker.classList.toggle('active');
  
  // Dışarı tıklayınca kapat
  if (picker.classList.contains('active')) {
    setTimeout(() => {
      document.addEventListener('click', function closeOnClick(e) {
        if (!picker.contains(e.target) && e.target !== btn) {
          picker.classList.remove('active');
          document.removeEventListener('click', closeOnClick);
        }
      });
    }, 100);
  }
}

function insertEmoji(emoji, textareaId) {
  const textarea = document.getElementById(textareaId);
  if (!textarea) return;
  
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = textarea.value;
  
  textarea.value = text.substring(0, start) + emoji + text.substring(end);
  textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
  textarea.focus();
  
  // Picker'ı kapat
  const picker = document.querySelector(`#emojiPicker_${textareaId}`);
  if (picker) picker.classList.remove('active');
}

// Global fonksiyonlar
window.installPWA = installPWA;
window.showConfirmModal = showConfirmModal;
window.closeConfirmModal = closeConfirmModal;
window.createEmojiPicker = createEmojiPicker;
window.toggleEmojiPicker = toggleEmojiPicker;
window.insertEmoji = insertEmoji;

// Sayfa yüklendiğinde başlat
document.addEventListener('DOMContentLoaded', () => {
  initPWA();
});

// Firebase hazır olana kadar bekle
function waitForFirebase() {
  return new Promise((resolve) => {
    // Firebase zaten hazırsa hemen devam et
    if (window.firebaseReady && window.firebaseDb) {
      console.log("✅ Firebase zaten hazır");
      resolve();
      return;
    }
    
    // Firebase hazır değilse event'i bekle
    console.log("⏳ Firebase bekleniyor...");
    window.addEventListener('firebaseReady', () => {
      console.log("✅ Firebase hazır event'i alındı");
      resolve();
    });
    
    // 5 saniye sonra timeout
    setTimeout(() => {
      if (window.firebaseDb) {
        resolve();
      } else {
        console.error("❌ Firebase yüklenemedi!");
      }
    }, 5000);
  });
}

/* ============================================
   SAYAÇ VE İSTATİSTİK FONKSİYONLARI
   ============================================ */

// İlişki başlangıç tarihi (Bu tarihi değiştirin!)
const RELATIONSHIP_START_DATE = new Date('2025-01-09T22:21:00');

// Sayaç güncelleme fonksiyonu
function updateTimeCounter() {
  const now = new Date();
  const diff = now - RELATIONSHIP_START_DATE;
  
  // Zaman hesaplamaları
  const totalSeconds = Math.floor(diff / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);
  
  const years = Math.floor(totalDays / 365);
  const days = totalDays % 365;
  const hours = totalHours % 24;
  const minutes = totalMinutes % 60;
  const seconds = totalSeconds % 60;
  
  // DOM güncelle
  const yearsEl = document.getElementById('years');
  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');
  
  if (yearsEl) yearsEl.textContent = years;
  if (daysEl) daysEl.textContent = days;
  if (hoursEl) hoursEl.textContent = hours;
  if (minutesEl) minutesEl.textContent = minutes;
  if (secondsEl) secondsEl.textContent = seconds;
}

// Firebase'den istatistikleri yükle
async function loadHomeStats() {
  try {
    await waitForFirebase();
    
    const db = window.firebaseDb;
    if (!db) return;
    
    // Film sayısını al
    const filmsSnapshot = await window.firestoreGetDocs(
      window.firestoreCollection(db, 'films')
    );
    const filmCount = filmsSnapshot.size;
    
    // Dizi sayısını al
    const dizilerSnapshot = await window.firestoreGetDocs(
      window.firestoreCollection(db, 'diziler')
    );
    const diziCount = dizilerSnapshot.size;
    
    // Date sayısını al
    const datelerSnapshot = await window.firestoreGetDocs(
      window.firestoreCollection(db, 'dateler')
    );
    const dateCount = datelerSnapshot.size;
    
    // Oyun sayısını al (bitirilen oyunlar)
    const oyunlarSnapshot = await window.firestoreGetDocs(
      window.firestoreCollection(db, 'oyunlar')
    );
    let oyunCount = 0;
    oyunlarSnapshot.forEach(doc => {
      if (doc.data().bitirildi) oyunCount++;
    });
    
    // Kitap sayılarını al (Bahar ve Baran ayrı)
    const kitaplarSnapshot = await window.firestoreGetDocs(
      window.firestoreCollection(db, 'books')
    );
    let kitapCountBahar = 0;
    let kitapCountBaran = 0;
    kitaplarSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.durum === 'okunmus') {
        if (data.sahip === 'bahar') kitapCountBahar++;
        else if (data.sahip === 'baran') kitapCountBaran++;
      }
    });
    
    // Gezilen şehir sayısını al (benzersiz şehirler)
    const placesSnapshot = await window.firestoreGetDocs(
      window.firestoreCollection(db, 'places')
    );
    const gezilenSehirler = new Set();
    placesSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.sehir) gezilenSehirler.add(data.sehir);
    });
    const sehirCount = gezilenSehirler.size;
    
    // DOM güncelle
    const filmEl = document.getElementById('filmCount');
    const diziEl = document.getElementById('diziCount');
    const dateEl = document.getElementById('dateCount');
    const oyunEl = document.getElementById('oyunCount');
    const kitapBaharEl = document.getElementById('kitapCountBahar');
    const kitapBaranEl = document.getElementById('kitapCountBaran');
    const sehirEl = document.getElementById('sehirCount');
    
    if (filmEl) filmEl.textContent = filmCount;
    if (diziEl) diziEl.textContent = diziCount;
    if (dateEl) dateEl.textContent = dateCount;
    if (oyunEl) oyunEl.textContent = oyunCount;
    if (kitapBaharEl) kitapBaharEl.textContent = kitapCountBahar;
    if (kitapBaranEl) kitapBaranEl.textContent = kitapCountBaran;
    if (sehirEl) sehirEl.textContent = sehirCount;
    
    // ===== YENİ İSTATİSTİKLER =====
    
    // Şarkı sayısını al
    const sarkilarSnapshot = await window.firestoreGetDocs(
      window.firestoreCollection(db, 'songs')
    );
    const sarkiCount = sarkilarSnapshot.size;
    const sarkiEl = document.getElementById('sarkiCount');
    if (sarkiEl) sarkiEl.textContent = sarkiCount;
    
    // Hedef sayısını al (tamamlanan/toplam)
    const hedeflerSnapshot = await window.firestoreGetDocs(
      window.firestoreCollection(db, 'bucketList')
    );
    let tamamlananHedef = 0;
    let toplamHedef = hedeflerSnapshot.size;
    hedeflerSnapshot.forEach(doc => {
      if (doc.data().tamamlandi) tamamlananHedef++;
    });
    const hedefEl = document.getElementById('hedefCount');
    if (hedefEl) hedefEl.textContent = `${tamamlananHedef}/${toplamHedef}`;
    
    // Özel gün sayısını al
    const ozelGunlerSnapshot = await window.firestoreGetDocs(
      window.firestoreCollection(db, 'ozelGunler')
    );
    const ozelGunCount = ozelGunlerSnapshot.size;
    const ozelGunEl = document.getElementById('ozelGunCount');
    if (ozelGunEl) ozelGunEl.textContent = ozelGunCount;
    
    // 2026 Özeti - Bahar ve Baran'ın en çok seçtiği mood
    const calendarSnapshot = await window.firestoreGetDocs(
      window.firestoreCollection(db, 'calendar')
    );
    const baharMoodSayilari = {};
    const baranMoodSayilari = {};
    
    // Takvimle uyumlu emoji'ler
    const moodEmojiler = {
      'mutlu': '😊',
      'uzgun': '😢',
      'gergin': '😤',
      'huzurlu': '😌',
      'endiseli': '😰',
      'bos': '⚪'
    };
    
    calendarSnapshot.forEach(doc => {
      const data = doc.data();
      // Bahar'ın moodları (field: bahar)
      if (data.bahar && data.bahar !== 'bos') {
        baharMoodSayilari[data.bahar] = (baharMoodSayilari[data.bahar] || 0) + 1;
      }
      // Baran'ın moodları (field: baran)
      if (data.baran && data.baran !== 'bos') {
        baranMoodSayilari[data.baran] = (baranMoodSayilari[data.baran] || 0) + 1;
      }
    });
    
    // Bahar'ın en çok mood'u
    let baharEnCokMood = null;
    let baharEnCokSayi = 0;
    for (const [mood, sayi] of Object.entries(baharMoodSayilari)) {
      if (sayi > baharEnCokSayi) {
        baharEnCokSayi = sayi;
        baharEnCokMood = mood;
      }
    }
    
    // Baran'ın en çok mood'u
    let baranEnCokMood = null;
    let baranEnCokSayi = 0;
    for (const [mood, sayi] of Object.entries(baranMoodSayilari)) {
      if (sayi > baranEnCokSayi) {
        baranEnCokSayi = sayi;
        baranEnCokMood = mood;
      }
    }
    
    // Bahar özet DOM güncelle
    const baharOzetEmojiEl = document.getElementById('baharOzetEmoji');
    const baharOzetCountEl = document.getElementById('baharOzetCount');
    if (baharOzetEmojiEl && baharOzetCountEl) {
      if (baharEnCokMood) {
        baharOzetEmojiEl.textContent = moodEmojiler[baharEnCokMood] || '🌸';
        baharOzetCountEl.textContent = `${baharEnCokSayi} gün`;
      } else {
        baharOzetEmojiEl.textContent = '-';
        baharOzetCountEl.textContent = '';
      }
    }
    
    // Baran özet DOM güncelle
    const baranOzetEmojiEl = document.getElementById('baranOzetEmoji');
    const baranOzetCountEl = document.getElementById('baranOzetCount');
    if (baranOzetEmojiEl && baranOzetCountEl) {
      if (baranEnCokMood) {
        baranOzetEmojiEl.textContent = moodEmojiler[baranEnCokMood] || '🌙';
        baranOzetCountEl.textContent = `${baranEnCokSayi} gün`;
      } else {
        baranOzetEmojiEl.textContent = '-';
        baranOzetCountEl.textContent = '';
      }
    }
    
    // Mektup istatistikleri
    const lettersSnapshot = await window.firestoreGetDocs(
      window.firestoreCollection(db, 'letters')
    );
    
    let baharMektupSayi = 0;
    let baranMektupSayi = 0;
    const bugun = new Date().toISOString().split('T')[0];
    let baharBugunYazdiMi = false;
    let baranBugunYazdiMi = false;
    
    lettersSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.kisi === 'bahar') {
        baharMektupSayi++;
        if (data.tarih === bugun) baharBugunYazdiMi = true;
      }
      if (data.kisi === 'baran') {
        baranMektupSayi++;
        if (data.tarih === bugun) baranBugunYazdiMi = true;
      }
    });
    
    // DOM güncelle
    const baharMektupCountEl = document.getElementById('baharMektupCount');
    const baranMektupCountEl = document.getElementById('baranMektupCount');
    const baharMektupDurumEl = document.getElementById('baharMektupDurum');
    const baranMektupDurumEl = document.getElementById('baranMektupDurum');
    
    if (baharMektupCountEl) baharMektupCountEl.textContent = baharMektupSayi;
    if (baranMektupCountEl) baranMektupCountEl.textContent = baranMektupSayi;
    
    if (baharMektupDurumEl) {
      baharMektupDurumEl.innerHTML = baharBugunYazdiMi ? 
        '<span class="durum-yazdi">✅ Bugün yazdı</span>' : 
        '<span class="durum-yazmadi">⏳ Bugün yazmadı</span>';
    }
    if (baranMektupDurumEl) {
      baranMektupDurumEl.innerHTML = baranBugunYazdiMi ? 
        '<span class="durum-yazdi">✅ Bugün yazdı</span>' : 
        '<span class="durum-yazmadi">⏳ Bugün yazmadı</span>';
    }
    
    console.log(`📊 İstatistikler yüklendi: ${filmCount} film, ${diziCount} dizi, ${dateCount} date, ${oyunCount} oyun, ${kitapCountBahar}+${kitapCountBaran} kitap, ${sehirCount} şehir, ${sarkiCount} şarkı, ${tamamlananHedef}/${toplamHedef} hedef, ${ozelGunCount} özel gün, ${baharMektupSayi}+${baranMektupSayi} mektup`);
    
  } catch (error) {
    console.error('❌ İstatistikler yüklenirken hata:', error);
  }
}

// Sayaç başlat
function startTimeCounter() {
  updateTimeCounter(); // Hemen bir kez çalıştır
  setInterval(updateTimeCounter, 1000); // Her saniye güncelle
}

// Sayfa yüklendiğinde sayaç ve istatistikleri başlat
document.addEventListener('DOMContentLoaded', () => {
  startTimeCounter();
  loadHomeStats();
});

// DOM elementlerini seç
const hamburgerBtn = document.getElementById('hamburgerBtn');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const menuItems = document.querySelectorAll('.menu-item');
const welcomeSection = document.getElementById('welcomeSection');
const pageContent = document.getElementById('pageContent');

/* -------- MOBİL MENÜ FONKSİYONLARI -------- */

// Hamburger menü tıklama olayı
hamburgerBtn.addEventListener('click', () => {
  toggleMobileMenu();
});

// Overlay tıklama olayı (menüyü kapat)
overlay.addEventListener('click', () => {
  closeMobileMenu();
});

// Mobil menüyü aç/kapat
function toggleMobileMenu() {
  hamburgerBtn.classList.toggle('active');
  sidebar.classList.toggle('active');
  overlay.classList.toggle('active');
  
  // Overlay görünür yap
  if (overlay.classList.contains('active')) {
    overlay.style.display = 'block';
  }
}

// Mobil menüyü kapat
function closeMobileMenu() {
  hamburgerBtn.classList.remove('active');
  sidebar.classList.remove('active');
  overlay.classList.remove('active');
  
  // Overlay gizle (animasyon bittikten sonra)
  setTimeout(() => {
    if (!overlay.classList.contains('active')) {
      overlay.style.display = 'none';
    }
  }, 300);
}

/* -------- MENÜ NAVİGASYON FONKSİYONLARI -------- */

// Alt menü toggle fonksiyonu
document.querySelectorAll('.submenu-toggle').forEach(toggle => {
  toggle.addEventListener('click', (e) => {
    e.preventDefault();
    const parentItem = toggle.closest('.menu-item.has-submenu');
    parentItem.classList.toggle('open');
  });
});

// Alt menü öğelerine tıklama olayı
document.querySelectorAll('.submenu-item a').forEach(subItem => {
  subItem.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const pageName = subItem.getAttribute('data-page');
    
    // Tüm submenu-item'lardan active kaldır
    document.querySelectorAll('.submenu-item').forEach(si => si.classList.remove('active'));
    // Bu item'a active ekle
    subItem.closest('.submenu-item').classList.add('active');
    
    // Ana menü itemlarından da active kaldır
    menuItems.forEach(item => item.classList.remove('active'));
    
    // Sayfaya git
    navigateToPage(pageName);
    
    // Mobil menüyü kapat
    if (window.innerWidth <= 768) {
      closeMobileMenu();
    }
  });
});

// Menü öğelerine tıklama olayı ekle
menuItems.forEach(item => {
  // Has-submenu olanları atla (onlar ayrı handle ediliyor)
  if (item.classList.contains('has-submenu')) return;
  
  item.addEventListener('click', (e) => {
    e.preventDefault();
    
    // Tıklanan menü öğesinin sayfa adını al
    const link = item.querySelector('a');
    const pageName = link.getAttribute('data-page');
    
    // Aktif menü öğesini güncelle
    setActiveMenuItem(item);
    
    // Sayfayı değiştir
    navigateToPage(pageName);
    
    // Mobil menüyü kapat
    if (window.innerWidth <= 768) {
      closeMobileMenu();
    }
  });
});

// Aktif menü öğesini ayarla
function setActiveMenuItem(activeItem) {
  // Tüm menü öğelerinden active sınıfını kaldır
  menuItems.forEach(item => {
    item.classList.remove('active');
  });
  // Alt menü itemlarından da active kaldır
  document.querySelectorAll('.submenu-item').forEach(si => si.classList.remove('active'));
  
  // Seçilen öğeye active sınıfını ekle
  activeItem.classList.add('active');
}

// Sayfaya git
function navigateToPage(pageName) {
  console.log(`📍 Sayfa değiştirildi: ${pageName}`);
  
  // Ana sayfa için karşılama ekranını göster
  if (pageName === 'home') {
    showWelcomeSection();
    return;
  }
  
  // Diğer sayfalar için içerik alanını göster
  showPageContent(pageName);
}

// Karşılama ekranını göster
function showWelcomeSection() {
  welcomeSection.classList.remove('hidden');
  pageContent.classList.add('hidden');
  
  // Animasyonu yeniden başlat
  restartWelcomeAnimations();
}

// Sayfa içeriğini göster
function showPageContent(pageName) {
  welcomeSection.classList.add('hidden');
  pageContent.classList.remove('hidden');
  
  // Sayfa içeriğini yükle
  loadPageContent(pageName);
}

// Sayfa içeriğini yükle
async function loadPageContent(pageName) {
  // Filmler sayfası için özel içerik
  if (pageName === 'filmler') {
    await loadFilmlerPage();
    return;
  }
  
  // Diziler sayfası için özel içerik
  if (pageName === 'diziler') {
    await loadDizilerPage();
    return;
  }
  
  // BB-Dateler sayfası için özel içerik
  if (pageName === 'bb-dateler') {
    await loadDatelerPage();
    return;
  }
  
  // Oyunlar sayfası için özel içerik
  if (pageName === 'oyunlar') {
    await loadOyunlarPage();
    return;
  }
  
  // Kitaplar sayfası için özel içerik
  if (pageName === 'kitaplar') {
    await loadKitaplarPage();
    return;
  }
  
  // Harita sayfası için özel içerik
  if (pageName === 'harita') {
    await loadHaritaPage();
    return;
  }
  
  // Takvim sayfası için özel içerik
  if (pageName === 'takvim') {
    await loadTakvimPage();
    return;
  }
  
  // Özel Günler sayfası için özel içerik
  if (pageName === 'ozel-gunler') {
    await loadOzelGunlerPage();
    return;
  }
  
  // Bucket List sayfası için özel içerik
  if (pageName === 'bucket-list') {
    await loadBucketListPage();
    return;
  }
  
  // Şarkılar sayfası için özel içerik
  if (pageName === 'sarkilar') {
    await loadSarkilarPage();
    return;
  }
  
  // Hikayemiz sayfası için özel içerik
  if (pageName === 'hikayemiz') {
    await loadHikayemizPage();
    return;
  }
  
  // Diğer sayfalar için geçici içerik
  const pageContents = {};
  
  const content = pageContents[pageName];
  
  if (content) {
    // İçerik alanını güncelle
    pageContent.innerHTML = `
      <div class="page-header" style="animation: slideUp 0.6s ease forwards;">
        <h2 style="
          font-family: var(--font-heading);
          font-size: 2.5rem;
          color: var(--text-primary);
          margin-bottom: 15px;
          letter-spacing: 3px;
        ">${content.title}</h2>
        <p style="
          color: var(--text-secondary);
          font-size: 1rem;
        ">${content.description}</p>
        <div style="
          width: 60px;
          height: 1px;
          background: linear-gradient(90deg, var(--accent-rose), transparent);
          margin-top: 30px;
        "></div>
      </div>
    `;
  }
}

// Karşılama animasyonlarını yeniden başlat
function restartWelcomeAnimations() {
  const animatedElements = welcomeSection.querySelectorAll('.star, .welcome-title, .welcome-subtitle, .welcome-message, .decorative-line');
  
  animatedElements.forEach(el => {
    // Animasyonu sıfırla
    el.style.animation = 'none';
    el.offsetHeight; // Reflow tetikle
    el.style.animation = null;
  });
}

/* -------- PENCERE BOYUTU DEĞİŞİKLİĞİ -------- */

// Pencere boyutu değiştiğinde menüyü ayarla
window.addEventListener('resize', () => {
  if (window.innerWidth > 768) {
    // Masaüstü boyutunda mobil menüyü kapat
    closeMobileMenu();
    overlay.style.display = 'none';
  }
});

/* -------- SAYFA YÜKLENDİĞİNDE -------- */

document.addEventListener('DOMContentLoaded', () => {
  console.log('✨ OurHiddenVerse yüklendi');
  
  // Başlangıçta overlay'i gizle
  overlay.style.display = 'none';
});

/* -------- İLERİDE KULLANILACAK FONKSİYONLAR -------- */

// Firebase'den veri çekme fonksiyonu (ileride aktif edilecek)
async function fetchDataFromFirebase(collectionName) {
  // Bu fonksiyon ileride Firebase entegrasyonu için kullanılacak
  console.log(`🔥 ${collectionName} verisi çekilecek...`);
  
  // Örnek kullanım:
  // const db = window.firebaseDb;
  // const querySnapshot = await getDocs(collection(db, collectionName));
  // return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Yeni menü öğesi ekleme fonksiyonu
function addMenuItem(icon, text, pageName) {
  const menuList = document.querySelector('.menu-list');
  const newItem = document.createElement('li');
  newItem.className = 'menu-item';
  newItem.innerHTML = `
    <a href="#" data-page="${pageName}">
      <span class="menu-icon">${icon}</span>
      <span class="menu-text">${text}</span>
    </a>
  `;
  
  // Tıklama olayı ekle
  newItem.addEventListener('click', (e) => {
    e.preventDefault();
    setActiveMenuItem(newItem);
    navigateToPage(pageName);
    if (window.innerWidth <= 768) {
      closeMobileMenu();
    }
  });
  
  menuList.appendChild(newItem);
  console.log(`➕ Yeni menü eklendi: ${text}`);
}

// Global fonksiyonları dışa aktar (konsol üzerinden test için)
window.addMenuItem = addMenuItem;
window.navigateToPage = navigateToPage;

/* ============================================
   FİLMLER SAYFASI FONKSİYONLARI
   Firebase Firestore ile tam entegrasyon
   ============================================ */

// Firestore koleksiyon isimleri
const ISTEK_KOLEKSIYON = 'istekFilmler';
const IZLENEN_KOLEKSIYON = 'films';

// Geçici veri cache'leri (performans için)
let istekFilmlerCache = [];
let izlenenFilmlerCache = [];

// Filmler sayfasını yükle
async function loadFilmlerPage() {
  // Önce Firebase'in hazır olmasını bekle
  await waitForFirebase();
  console.log("🔥 Firebase hazır, Filmler sayfası yükleniyor...");
  
  // Sayfa HTML yapısını oluştur
  pageContent.innerHTML = `
    <div class="filmler-container">
      <!-- Başlık ve Yeni Film Butonu -->
      <div class="filmler-header">
        <h2>Filmler</h2>
        <button class="btn-yeni-film" id="btnYeniFilm">
          <span class="btn-icon">+</span>
          <span>Yeni Film Ekle</span>
        </button>
      </div>

      <!-- İstek Listesi Bölümü -->
      <section class="istek-listesi-section">
        <h3 class="section-title">📋 İstek Listesi</h3>
        <div class="istek-listesi" id="istekListesi">
          <!-- İstek filmleri buraya dinamik olarak eklenecek -->
        </div>
      </section>

      <!-- İzlenen Filmler Bölümü -->
      <section class="izlenen-filmler-section">
        <h3 class="section-title">🎬 İzlenen Filmler</h3>
        <div class="izlenen-filmler-container">
          <!-- Tablo wrapper - mobilde kaydırılabilir -->
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
              <tbody id="izlenenFilmlerTbody">
                <!-- İzlenen filmler buraya satır olarak eklenecek -->
              </tbody>
            </table>
          </div>
          
          <!-- Boş durum mesajı -->
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

  // Event listener'ları ekle
  setupFilmlerEventListeners();
  
  // Verileri Firestore'dan yükle ve göster
  await loadIstekListesiFromFirestore();
  await loadIzlenenFilmlerFromFirestore();
  
  console.log('🎬 Filmler sayfası yüklendi - Firebase aktif');
}

// Filmler sayfası event listener'larını ayarla
function setupFilmlerEventListeners() {
  const btnYeniFilm = document.getElementById('btnYeniFilm');
  const filmModal = document.getElementById('filmModal');
  const btnModalClose = document.getElementById('btnModalClose');
  const yeniFilmForm = document.getElementById('yeniFilmForm');

  // Yeni film butonu - modal aç
  btnYeniFilm.addEventListener('click', () => {
    filmModal.classList.add('active');
    document.getElementById('filmAdi').focus();
  });

  // Modal kapat butonu
  btnModalClose.addEventListener('click', () => {
    filmModal.classList.remove('active');
  });

  // Modal dışına tıklayınca kapat
  filmModal.addEventListener('click', (e) => {
    if (e.target === filmModal) {
      filmModal.classList.remove('active');
    }
  });

  // Yeni film formu gönderimi
  yeniFilmForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const filmAdi = document.getElementById('filmAdi').value.trim();
    
    if (filmAdi) {
      await addFilmToIstekListesi(filmAdi);
      document.getElementById('filmAdi').value = '';
      filmModal.classList.remove('active');
    }
  });

  // ESC tuşu ile modal kapat
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && filmModal.classList.contains('active')) {
      filmModal.classList.remove('active');
    }
  });
}

// LocalStorage'dan istek listesini al
function getIstekListesi() {
  return istekFilmlerCache;
}

// LocalStorage'a istek listesini kaydet (artık kullanılmıyor - Firestore kullanılıyor)
function saveIstekListesi(liste) {
  istekFilmlerCache = liste;
}

// LocalStorage'dan izlenen filmleri al
function getIzlenenFilmler() {
  return izlenenFilmlerCache;
}

// LocalStorage'a izlenen filmleri kaydet (artık kullanılmıyor - Firestore kullanılıyor)
function saveIzlenenFilmler(liste) {
  izlenenFilmlerCache = liste;
}

/* ============================================
   FIRESTORE VERİ İŞLEMLERİ
   Tüm okuma, yazma ve silme işlemleri
   ============================================ */

// Firestore'dan istek listesini yükle
async function loadIstekListesiFromFirestore() {
  try {
    console.log("📋 İstek listesi yükleniyor...");
    
    const db = window.firebaseDb;
    if (!db) {
      console.error("❌ Firebase DB bulunamadı!");
      return;
    }
    
    console.log("🔍 Firestore sorgusu yapılıyor: " + ISTEK_KOLEKSIYON);
    const querySnapshot = await window.firestoreGetDocs(
      window.firestoreCollection(db, ISTEK_KOLEKSIYON)
    );
    
    console.log(`📊 Sorgu sonucu: ${querySnapshot.size} belge bulundu`);
    
    istekFilmlerCache = [];
    querySnapshot.forEach((doc) => {
      console.log(`   - Film: ${doc.data().ad} (ID: ${doc.id})`);
      istekFilmlerCache.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Tarihe göre sırala (en yeni en üstte)
    istekFilmlerCache.sort((a, b) => {
      const tarihA = a.olusturulmaTarihi?.seconds || 0;
      const tarihB = b.olusturulmaTarihi?.seconds || 0;
      return tarihB - tarihA;
    });
    
    console.log(`📥 İstek listesi Firestore'dan yüklendi: ${istekFilmlerCache.length} film`);
    renderIstekListesi();
  } catch (error) {
    console.error('❌ İstek listesi yüklenirken hata:', error);
    console.error('Hata detayı:', error.message);
  }
}

// Firestore'dan izlenen filmleri yükle
async function loadIzlenenFilmlerFromFirestore() {
  try {
    console.log("🎬 İzlenen filmler yükleniyor...");
    
    const db = window.firebaseDb;
    if (!db) {
      console.error("❌ Firebase DB bulunamadı!");
      return;
    }
    
    console.log("🔍 Firestore sorgusu yapılıyor: " + IZLENEN_KOLEKSIYON);
    const querySnapshot = await window.firestoreGetDocs(
      window.firestoreCollection(db, IZLENEN_KOLEKSIYON)
    );
    
    console.log(`📊 Sorgu sonucu: ${querySnapshot.size} belge bulundu`);
    
    izlenenFilmlerCache = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`   - Film: ${data.filmAdi} | Baran: ${data.baranPuani} | Bahar: ${data.baharPuani}`);
      izlenenFilmlerCache.push({
        id: doc.id,
        ...data
      });
    });
    
    // Tarihe göre sırala (en yeni en üstte)
    izlenenFilmlerCache.sort((a, b) => {
      const tarihA = a.olusturulmaTarihi?.seconds || 0;
      const tarihB = b.olusturulmaTarihi?.seconds || 0;
      return tarihB - tarihA;
    });
    
    console.log(`📥 İzlenen filmler Firestore'dan yüklendi: ${izlenenFilmlerCache.length} film`);
    renderIzlenenFilmler();
  } catch (error) {
    console.error('❌ İzlenen filmler yüklenirken hata:', error);
    console.error('Hata detayı:', error.message);
  }
}
// İstek listesine film ekle - FIRESTORE'A YAZAR
async function addFilmToIstekListesi(filmAdi) {
  try {
    const db = window.firebaseDb;
    
    // Firestore'a yeni film belgesi ekle
    const docRef = await window.firestoreAddDoc(
      window.firestoreCollection(db, ISTEK_KOLEKSIYON), 
      {
        ad: filmAdi,
        olusturulmaTarihi: window.firestoreServerTimestamp()
      }
    );
    
    console.log(`✅ Film Firestore'a eklendi: ${filmAdi} (ID: ${docRef.id})`);
    
    // Listeyi yeniden yükle
    await loadIstekListesiFromFirestore();
  } catch (error) {
    console.error('❌ Film eklenirken hata:', error);
    alert('Film eklenirken bir hata oluştu!');
  }
}

// İstek listesinden film sil - FIRESTORE'DAN SİLER
async function deleteFilmFromIstekListesi(filmId) {
  try {
    const db = window.firebaseDb;
    
    // Firestore'dan belgeyi sil
    await window.firestoreDeleteDoc(
      window.firestoreDoc(db, ISTEK_KOLEKSIYON, filmId)
    );
    
    console.log(`🗑️ Film Firestore'dan silindi: ${filmId}`);
    
    // Listeyi yeniden yükle
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
      
      <!-- Puan Giriş Paneli -->
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
  
  // Bugünün tarihini varsayılan olarak ayarla
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
  
  // Diğer tüm panelleri kapat
  document.querySelectorAll('.puan-panel').forEach(p => {
    if (p.id !== `puanPanel_${filmId}`) {
      p.classList.remove('active');
    }
  });
  
  // Bu paneli aç/kapat
  panel.classList.toggle('active');
}

// Filmi izlendi olarak kaydet - FIRESTORE'A YAZAR
async function saveFilmAsIzlendi(event, filmId) {
  event.preventDefault();
  
  // İstek listesinden filmi bul
  const film = istekFilmlerCache.find(f => f.id === filmId);
  
  if (!film) {
    console.error('Film bulunamadı:', filmId);
    return;
  }
  
  // Form değerlerini al
  const baharPuan = parseFloat(document.getElementById(`baharPuan_${filmId}`).value);
  const baranPuan = parseFloat(document.getElementById(`baranPuan_${filmId}`).value);
  const izlenmeTarihi = document.getElementById(`izlenmeTarihi_${filmId}`).value;
  
  // Ortalama puanı hesapla
  const ortalamaPuan = parseFloat(((baharPuan + baranPuan) / 2).toFixed(1));
  
  try {
    const db = window.firebaseDb;
    
    // Firestore'a izlenen film olarak ekle (films koleksiyonu)
    const docRef = await window.firestoreAddDoc(
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
    
    console.log(`✅ Film Firestore'a kaydedildi: ${film.ad} (ID: ${docRef.id})`);
    
    // İstek listesinden sil
    await window.firestoreDeleteDoc(
      window.firestoreDoc(db, ISTEK_KOLEKSIYON, filmId)
    );
    
    console.log(`🗑️ Film istek listesinden kaldırıldı: ${filmId}`);
    
    // Listeleri Firestore'dan yeniden yükle
    await loadIstekListesiFromFirestore();
    await loadIzlenenFilmlerFromFirestore();
    
  } catch (error) {
    console.error('❌ Film kaydedilirken hata:', error);
    alert('Film kaydedilirken bir hata oluştu!');
  }
}

// İzlenen filmleri render et
function renderIzlenenFilmler() {
  const tbody = document.getElementById('izlenenFilmlerTbody');
  const emptyMessage = document.getElementById('izlenenEmpty');
  const tabloWrapper = document.querySelector('.tablo-wrapper');
  const filmler = izlenenFilmlerCache;
  
  // Boş durum kontrolü
  if (filmler.length === 0) {
    tabloWrapper.style.display = 'none';
    emptyMessage.style.display = 'block';
    return;
  }
  
  // Tablo görünür, boş mesajı gizli
  tabloWrapper.style.display = 'block';
  emptyMessage.style.display = 'none';
  
  // Tablo satırlarını oluştur (Firestore alan isimleriyle)
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
          ${generateStarHTML(film.baranPuani, 'small')}
        </div>
      </td>
      <td class="col-puan">
        <div class="puan-yildiz-wrapper" title="${film.baharPuani}/5">
          ${generateStarHTML(film.baharPuani, 'small')}
        </div>
      </td>
      <td class="col-puan">
        <div class="puan-yildiz-wrapper ortak" title="${film.ortalamaPuan}/5">
          ${generateStarHTML(film.ortalamaPuan, 'small')}
        </div>
      </td>
      <td class="col-sil">
        <button class="btn-sil-film" onclick="deleteIzlenenFilm('${film.id}')" title="Filmi sil">×</button>
      </td>
    </tr>
  `).join('');
}

// Tarihi formatla (YYYY-MM-DD -> DD.MM.YYYY)
function formatTarih(tarihStr) {
  const tarih = new Date(tarihStr);
  const gun = String(tarih.getDate()).padStart(2, '0');
  const ay = String(tarih.getMonth() + 1).padStart(2, '0');
  const yil = tarih.getFullYear();
  return `${gun}.${ay}.${yil}`;
}

// Global fonksiyonları dışa aktar (onclick için gerekli)
window.togglePuanPanel = togglePuanPanel;
window.saveFilmAsIzlendi = saveFilmAsIzlendi;
window.deleteFilmFromIstekListesi = deleteFilmFromIstekListesi;

/* -------- SIRALAMA VE SİLME FONKSİYONLARI -------- */

// Mevcut sıralama durumu
let currentSortField = null;
let currentSortOrder = 'desc'; // 'asc' veya 'desc'

// Filmleri sırala
function sortFilmler(field) {
  // Firestore alan isimlerini eşleştir
  const fieldMapping = {
    'baranPuan': 'baranPuani',
    'baharPuan': 'baharPuani',
    'ortalamaPuan': 'ortalamaPuan'
  };
  
  const firestoreField = fieldMapping[field] || field;
  
  // Aynı alana tekrar tıklanırsa sıralamayı tersine çevir
  if (currentSortField === field) {
    currentSortOrder = currentSortOrder === 'desc' ? 'asc' : 'desc';
  } else {
    currentSortField = field;
    currentSortOrder = 'desc'; // Yeni alan için varsayılan: yüksekten düşüğe
  }
  
  // Başlık stillerini güncelle
  updateSortHeaders();
  
  // Cache'deki filmleri sırala
  izlenenFilmlerCache.sort((a, b) => {
    const aValue = a[firestoreField];
    const bValue = b[firestoreField];
    
    if (currentSortOrder === 'desc') {
      return bValue - aValue; // Yüksekten düşüğe
    } else {
      return aValue - bValue; // Düşükten yükseğe
    }
  });
  
  // Tabloyu yeniden render et
  renderIzlenenFilmler();
  
  console.log(`📊 Sıralama: ${field} - ${currentSortOrder === 'desc' ? 'Yüksek → Düşük' : 'Düşük → Yüksek'}`);
}

// Sıralama başlıklarının stilini güncelle
function updateSortHeaders() {
  // Tüm sortable başlıklardan sınıfları kaldır
  document.querySelectorAll('.izlenen-tablo th.sortable').forEach(th => {
    th.classList.remove('asc', 'desc');
  });
  
  // Aktif sıralama başlığına sınıf ekle
  if (currentSortField) {
    const activeHeader = document.querySelector(`.izlenen-tablo th[data-sort="${currentSortField}"]`);
    if (activeHeader) {
      activeHeader.classList.add(currentSortOrder);
    }
  }
}

// İzlenen filmi sil - FIRESTORE'DAN SİLER
async function deleteIzlenenFilm(filmId) {
  // Onay iste
  if (!confirm('Bu filmi silmek istediğinizden emin misiniz?')) {
    return;
  }
  
  try {
    const db = window.firebaseDb;
    const silinecekFilm = izlenenFilmlerCache.find(f => f.id === filmId);
    
    // Firestore'dan belgeyi sil
    await window.firestoreDeleteDoc(
      window.firestoreDoc(db, IZLENEN_KOLEKSIYON, filmId)
    );
    
    console.log(`🗑️ Film Firestore'dan silindi: ${silinecekFilm?.filmAdi || filmId}`);
    
    // Listeyi Firestore'dan yeniden yükle
    await loadIzlenenFilmlerFromFirestore();
    
  } catch (error) {
    console.error('❌ Film silinirken hata:', error);
    alert('Film silinirken bir hata oluştu!');
  }
}

// Global fonksiyonları dışa aktar (sıralama ve silme için)
window.sortFilmler = sortFilmler;
window.deleteIzlenenFilm = deleteIzlenenFilm;

/* ============================================
   DİZİLER SAYFASI FONKSİYONLARI
   Firebase Firestore ile tam entegrasyon
   ============================================ */

// Firestore koleksiyon isimleri - Diziler
const ISTEK_DIZI_KOLEKSIYON = 'istekDiziler';
const IZLENEN_DIZI_KOLEKSIYON = 'diziler';

// Geçici veri cache'leri (performans için) - Diziler
let istekDizilerCache = [];
let izlenenDizilerCache = [];

// Sıralama durumu - Diziler
let currentDiziSortField = null;
let currentDiziSortOrder = 'desc';

// Diziler sayfasını yükle
async function loadDizilerPage() {
  // Önce Firebase'in hazır olmasını bekle
  await waitForFirebase();
  console.log("🔥 Firebase hazır, Diziler sayfası yükleniyor...");
  
  // Sayfa HTML yapısını oluştur
  pageContent.innerHTML = `
    <div class="filmler-container">
      <!-- Başlık ve Yeni Dizi Butonu -->
      <div class="filmler-header">
        <h2>Diziler</h2>
        <button class="btn-yeni-film" id="btnYeniDizi">
          <span class="btn-icon">+</span>
          <span>Yeni Dizi Ekle</span>
        </button>
      </div>

      <!-- İstek Listesi Bölümü -->
      <section class="istek-listesi-section">
        <h3 class="section-title">📋 İstek Listesi</h3>
        <div class="istek-listesi" id="istekDiziListesi">
          <!-- İstek dizileri buraya dinamik olarak eklenecek -->
        </div>
      </section>

      <!-- İzlenen Diziler Bölümü -->
      <section class="izlenen-filmler-section">
        <h3 class="section-title">📺 İzlenen Diziler</h3>
        <div class="izlenen-filmler-container">
          <!-- Tablo wrapper - mobilde kaydırılabilir -->
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
              <tbody id="izlenenDizilerTbody">
                <!-- İzlenen diziler buraya satır olarak eklenecek -->
              </tbody>
            </table>
          </div>
          
          <!-- Boş durum mesajı -->
          <div class="izlenen-empty" id="izlenenDiziEmpty">
            Henüz izlenen dizi yok. Bir dizi bitirip puanlamaya ne dersiniz?
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
  `;

  // Event listener'ları ekle
  setupDizilerEventListeners();
  
  // Verileri Firestore'dan yükle ve göster
  await loadIstekDizilerFromFirestore();
  await loadIzlenenDizilerFromFirestore();
  
  console.log('📺 Diziler sayfası yüklendi - Firebase aktif');
}

// Diziler sayfası event listener'larını ayarla
function setupDizilerEventListeners() {
  const btnYeniDizi = document.getElementById('btnYeniDizi');
  const diziModal = document.getElementById('diziModal');
  const btnDiziModalClose = document.getElementById('btnDiziModalClose');
  const yeniDiziForm = document.getElementById('yeniDiziForm');

  // Yeni dizi butonu - modal aç
  btnYeniDizi.addEventListener('click', () => {
    diziModal.classList.add('active');
    document.getElementById('diziAdi').focus();
  });

  // Modal kapat butonu
  btnDiziModalClose.addEventListener('click', () => {
    diziModal.classList.remove('active');
    yeniDiziForm.reset();
  });

  // Modal dışına tıklayınca kapat
  diziModal.addEventListener('click', (e) => {
    if (e.target === diziModal) {
      diziModal.classList.remove('active');
      yeniDiziForm.reset();
    }
  });

  // Yeni dizi form submit
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
    console.log("📋 İstek dizi listesi yükleniyor...");
    
    const db = window.firebaseDb;
    if (!db) {
      console.error("❌ Firebase DB bulunamadı!");
      return;
    }
    
    console.log("🔍 Firestore sorgusu yapılıyor: " + ISTEK_DIZI_KOLEKSIYON);
    const querySnapshot = await window.firestoreGetDocs(
      window.firestoreCollection(db, ISTEK_DIZI_KOLEKSIYON)
    );
    
    console.log(`📊 Sorgu sonucu: ${querySnapshot.size} belge bulundu`);
    
    istekDizilerCache = [];
    querySnapshot.forEach((doc) => {
      console.log(`   - Dizi: ${doc.data().ad} (ID: ${doc.id})`);
      istekDizilerCache.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Tarihe göre sırala (en yeni en üstte)
    istekDizilerCache.sort((a, b) => {
      const tarihA = a.olusturulmaTarihi?.seconds || 0;
      const tarihB = b.olusturulmaTarihi?.seconds || 0;
      return tarihB - tarihA;
    });
    
    console.log(`📥 İstek dizi listesi Firestore'dan yüklendi: ${istekDizilerCache.length} dizi`);
    renderIstekDizileri();
  } catch (error) {
    console.error('❌ İstek dizi listesi yüklenirken hata:', error);
    console.error('Hata detayı:', error.message);
  }
}

// Firestore'dan izlenen dizileri yükle
async function loadIzlenenDizilerFromFirestore() {
  try {
    console.log("📺 İzlenen diziler yükleniyor...");
    
    const db = window.firebaseDb;
    if (!db) {
      console.error("❌ Firebase DB bulunamadı!");
      return;
    }
    
    console.log("🔍 Firestore sorgusu yapılıyor: " + IZLENEN_DIZI_KOLEKSIYON);
    const querySnapshot = await window.firestoreGetDocs(
      window.firestoreCollection(db, IZLENEN_DIZI_KOLEKSIYON)
    );
    
    console.log(`📊 Sorgu sonucu: ${querySnapshot.size} belge bulundu`);
    
    izlenenDizilerCache = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`   - Dizi: ${data.diziAdi} | Baran: ${data.baranPuani} | Bahar: ${data.baharPuani}`);
      izlenenDizilerCache.push({
        id: doc.id,
        ...data
      });
    });
    
    // Tarihe göre sırala (en yeni en üstte)
    izlenenDizilerCache.sort((a, b) => {
      const tarihA = a.olusturulmaTarihi?.seconds || 0;
      const tarihB = b.olusturulmaTarihi?.seconds || 0;
      return tarihB - tarihA;
    });
    
    console.log(`📥 İzlenen diziler Firestore'dan yüklendi: ${izlenenDizilerCache.length} dizi`);
    renderIzlenenDiziler();
  } catch (error) {
    console.error('❌ İzlenen diziler yüklenirken hata:', error);
    console.error('Hata detayı:', error.message);
  }
}

// İstek listesine dizi ekle - FIRESTORE'A YAZAR
async function addDiziToIstekListesi(diziAdi) {
  try {
    const db = window.firebaseDb;
    
    // Firestore'a yeni dizi belgesi ekle
    const docRef = await window.firestoreAddDoc(
      window.firestoreCollection(db, ISTEK_DIZI_KOLEKSIYON), 
      {
        ad: diziAdi,
        olusturulmaTarihi: window.firestoreServerTimestamp()
      }
    );
    
    console.log(`✅ Dizi Firestore'a eklendi: ${diziAdi} (ID: ${docRef.id})`);
    
    // Listeyi yeniden yükle
    await loadIstekDizilerFromFirestore();
  } catch (error) {
    console.error('❌ Dizi eklenirken hata:', error);
    alert('Dizi eklenirken bir hata oluştu!');
  }
}

// İstek listesinden dizi sil - FIRESTORE'DAN SİLER
async function deleteDiziFromIstekListesi(diziId) {
  try {
    const db = window.firebaseDb;
    const silinenDizi = istekDizilerCache.find(d => d.id === diziId);
    
    // Firestore'dan belgeyi sil
    await window.firestoreDeleteDoc(
      window.firestoreDoc(db, ISTEK_DIZI_KOLEKSIYON, diziId)
    );
    
    console.log(`🗑️ Dizi istek listesinden silindi: ${silinenDizi?.ad || diziId}`);
    
    // Listeyi yeniden yükle
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
      <!-- Puan Giriş Paneli -->
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
    // Diğer açık panelleri kapat
    document.querySelectorAll('.puan-panel.active').forEach(p => {
      if (p.id !== `puanDiziPanel-${diziId}`) {
        p.classList.remove('active');
      }
    });
    // Bu paneli toggle et
    panel.classList.toggle('active');
    
    // Bugünün tarihini varsayılan olarak ayarla
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
  return gun >= 0 ? gun + 1 : 0; // +1 çünkü başlangıç günü de sayılır
}

// Diziyi izlendi olarak kaydet - FIRESTORE'A YAZAR
async function saveDiziAsIzlendi(event, diziId) {
  event.preventDefault();
  
  const baranPuan = parseFloat(document.getElementById(`baranDiziPuan-${diziId}`).value);
  const baharPuan = parseFloat(document.getElementById(`baharDiziPuan-${diziId}`).value);
  const baslangicTarihi = document.getElementById(`baslangicTarihi-${diziId}`).value;
  const bitisTarihi = document.getElementById(`bitisTarihi-${diziId}`).value;
  
  // Tarih kontrolü
  if (new Date(bitisTarihi) < new Date(baslangicTarihi)) {
    alert('Bitiş tarihi başlangıç tarihinden önce olamaz!');
    return;
  }
  
  const ortalamaPuan = ((baranPuan + baharPuan) / 2).toFixed(1);
  const gunSayisi = hesaplaGunFarki(baslangicTarihi, bitisTarihi);
  
  // İstek listesinden dizi bilgisini al
  const dizi = istekDizilerCache.find(d => d.id === diziId);
  if (!dizi) return;
  
  try {
    const db = window.firebaseDb;
    
    // İzlenen dizilere ekle
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
    
    // İstek listesinden sil
    await window.firestoreDeleteDoc(
      window.firestoreDoc(db, ISTEK_DIZI_KOLEKSIYON, diziId)
    );
    
    console.log(`✅ Dizi izlendi olarak kaydedildi: ${dizi.ad} (${gunSayisi} günde)`);
    
    // Listeleri yeniden yükle
    await loadIstekDizilerFromFirestore();
    await loadIzlenenDizilerFromFirestore();
    
  } catch (error) {
    console.error('❌ Dizi kaydedilirken hata:', error);
    alert('Dizi kaydedilirken bir hata oluştu!');
  }
}

// İzlenen dizileri render et (tablo formatında)
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
      <td class="col-tarih">${formatTarih(dizi.baslangicTarihi)}</td>
      <td class="col-tarih">${formatTarih(dizi.bitisTarihi)}</td>
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
  
  // Sıralama başlıklarını güncelle
  updateDiziSortHeaders();
}

// Dizileri sırala
function sortDiziler(field) {
  // Aynı alana tıklanırsa sıralamayı tersine çevir
  if (currentDiziSortField === field) {
    currentDiziSortOrder = currentDiziSortOrder === 'desc' ? 'asc' : 'desc';
  } else {
    currentDiziSortField = field;
    currentDiziSortOrder = 'desc'; // Yeni alan için varsayılan olarak büyükten küçüğe
  }
  
  // Cache'i sırala
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
  
  // Tabloyu yeniden render et
  renderIzlenenDiziler();
  
  console.log(`📊 Dizi Sıralama: ${field} - ${currentDiziSortOrder === 'desc' ? 'Yüksek → Düşük' : 'Düşük → Yüksek'}`);
}

// Dizi sıralama başlıklarının stilini güncelle
function updateDiziSortHeaders() {
  // Tüm sortable başlıklardan sınıfları kaldır
  document.querySelectorAll('.izlenen-tablo th.sortable').forEach(th => {
    th.classList.remove('asc', 'desc');
  });
  
  // Aktif sıralama başlığına sınıf ekle
  if (currentDiziSortField) {
    const activeHeader = document.querySelector(`.izlenen-tablo th[data-sort="${currentDiziSortField}"]`);
    if (activeHeader) {
      activeHeader.classList.add(currentDiziSortOrder);
    }
  }
}

// İzlenen diziyi sil - FIRESTORE'DAN SİLER
async function deleteIzlenenDizi(diziId) {
  // Onay iste
  if (!confirm('Bu diziyi silmek istediğinizden emin misiniz?')) {
    return;
  }
  
  try {
    const db = window.firebaseDb;
    const silinecekDizi = izlenenDizilerCache.find(d => d.id === diziId);
    
    // Firestore'dan belgeyi sil
    await window.firestoreDeleteDoc(
      window.firestoreDoc(db, IZLENEN_DIZI_KOLEKSIYON, diziId)
    );
    
    console.log(`🗑️ Dizi Firestore'dan silindi: ${silinecekDizi?.diziAdi || diziId}`);
    
    // Listeyi Firestore'dan yeniden yükle
    await loadIzlenenDizilerFromFirestore();
    
  } catch (error) {
    console.error('❌ Dizi silinirken hata:', error);
    alert('Dizi silinirken bir hata oluştu!');
  }
}

// Global fonksiyonları dışa aktar - Diziler için
window.openDiziPuanPanel = openDiziPuanPanel;
window.saveDiziAsIzlendi = saveDiziAsIzlendi;
window.deleteDiziFromIstekListesi = deleteDiziFromIstekListesi;
window.sortDiziler = sortDiziler;
window.deleteIzlenenDizi = deleteIzlenenDizi;

/* ============================================
   BB-DATELER SAYFASI FONKSİYONLARI
   Firebase Firestore ile tam entegrasyon
   ============================================ */

// Firestore koleksiyon isimleri - Dateler
const ISTEK_DATE_KOLEKSIYON = 'istekDateler';
const YAPILAN_DATE_KOLEKSIYON = 'dateler';

// Geçici veri cache'leri (performans için) - Dateler
let istekDatelerCache = [];
let yapilanDatelerCache = [];

// Dateler sayfasını yükle
async function loadDatelerPage() {
  // Önce Firebase'in hazır olmasını bekle
  await waitForFirebase();
  console.log("🔥 Firebase hazır, BB-Dateler sayfası yükleniyor...");
  
  // Sayfa HTML yapısını oluştur
  pageContent.innerHTML = `
    <div class="dateler-container">
      <!-- Başlık ve Yeni Date Butonu -->
      <div class="dateler-header">
        <h2>DATE'LER</h2>
        <button class="btn-yeni-date" id="btnYeniDate">
          <span class="btn-icon">💕</span>
          <span>Yeni Date Ekle</span>
        </button>
      </div>

      <!-- İstek Listesi Bölümü -->
      <section class="ister-listesi-section">
        <h3 class="section-title">📋 İstek Listesi</h3>
        <div class="ister-listesi-box" id="isterListesiBox">
          <!-- İster date'leri buraya dinamik olarak eklenecek -->
        </div>
      </section>

      <!-- Yapılan Date'ler Bölümü -->
      <section class="yapilan-dateler-section">
        <h3 class="section-title">💖 Yapılan Date'ler</h3>
        <div class="yapilan-dateler-container" id="yapilanDatelerContainer">
          <!-- Yapılan date kartları buraya eklenecek -->
        </div>
        <!-- Boş durum mesajı -->
        <div class="yapilan-empty" id="yapilanEmpty">
          Henüz yapılan date yok. Haydi ilk date'inizi planlayın! 💕
        </div>
      </section>
    </div>

    <!-- Yeni Date Ekleme Modal -->
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

  // Event listener'ları ekle
  setupDatelerEventListeners();
  
  // Verileri Firestore'dan yükle ve göster
  await loadIsterListesiFromFirestore();
  await loadYapilanDatelerFromFirestore();
  
  console.log('💕 BB-Dateler sayfası yüklendi - Firebase aktif');
}

// Dateler sayfası event listener'larını ayarla
function setupDatelerEventListeners() {
  const btnYeniDate = document.getElementById('btnYeniDate');
  const dateModal = document.getElementById('dateModal');
  const btnDateModalClose = document.getElementById('btnDateModalClose');
  const yeniDateForm = document.getElementById('yeniDateForm');

  // Yeni date butonu - modal aç
  btnYeniDate.addEventListener('click', () => {
    dateModal.classList.add('active');
    document.getElementById('dateBaslik').focus();
  });

  // Modal kapat butonu
  btnDateModalClose.addEventListener('click', () => {
    dateModal.classList.remove('active');
    yeniDateForm.reset();
  });

  // Modal dışına tıklayınca kapat
  dateModal.addEventListener('click', (e) => {
    if (e.target === dateModal) {
      dateModal.classList.remove('active');
      yeniDateForm.reset();
    }
  });

  // Yeni date form submit
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
    console.log("📋 İstek listesi yükleniyor...");
    
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
    
    // Oluşturulma tarihine göre sırala (en eski en üstte)
    istekDatelerCache.sort((a, b) => {
      const aTime = a.olusturulmaTarihi?.seconds || 0;
      const bTime = b.olusturulmaTarihi?.seconds || 0;
      return aTime - bTime;
    });
    
    console.log(`📥 İstek listesi Firestore'dan yüklendi: ${istekDatelerCache.length} date`);
    renderIsterListesi();
  } catch (error) {
    console.error('❌ İstek listesi yüklenirken hata:', error);
  }
}

// Firestore'dan yapılan dateleri yükle
async function loadYapilanDatelerFromFirestore() {
  try {
    console.log("💖 Yapılan dateler yükleniyor...");
    
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
    
    // Tarihe göre sırala (en yeni en üstte)
    yapilanDatelerCache.sort((a, b) => {
      return new Date(b.tarih) - new Date(a.tarih);
    });
    
    console.log(`📥 Yapılan dateler Firestore'dan yüklendi: ${yapilanDatelerCache.length} date`);
    renderYapilanDateler();
  } catch (error) {
    console.error('❌ Yapılan dateler yüklenirken hata:', error);
  }
}

// İstek listesine date ekle - FIRESTORE'A YAZAR
async function addDateToIsterListesi(baslik) {
  try {
    const db = window.firebaseDb;
    
    // Firestore'a yeni date belgesi ekle
    const docRef = await window.firestoreAddDoc(
      window.firestoreCollection(db, ISTEK_DATE_KOLEKSIYON), 
      {
        baslik: baslik,
        olusturulmaTarihi: window.firestoreServerTimestamp()
      }
    );
    
    console.log(`✅ Date Firestore'a eklendi: ${baslik} (ID: ${docRef.id})`);
    
    // Listeyi yeniden yükle
    await loadIsterListesiFromFirestore();
  } catch (error) {
    console.error('❌ Date eklenirken hata:', error);
    alert('Date eklenirken bir hata oluştu!');
  }
}

// İstek listesinden date sil - FIRESTORE'DAN SİLER
async function deleteIsterDate(dateId) {
  try {
    const db = window.firebaseDb;
    
    await window.firestoreDeleteDoc(
      window.firestoreDoc(db, ISTEK_DATE_KOLEKSIYON, dateId)
    );
    
    console.log(`🗑️ Date istek listesinden silindi: ${dateId}`);
    await loadIsterListesiFromFirestore();
    
  } catch (error) {
    console.error('❌ Date silinirken hata:', error);
    alert('Date silinirken bir hata oluştu!');
  }
}

// Date'i yapıldı olarak işaretle - Modal açılır
async function markDateAsYapildi(dateId) {
  const dateItem = istekDatelerCache.find(d => d.id === dateId);
  if (!dateItem) return;
  
  // Checkbox'ı geri al (modal işlemi tamamlanana kadar)
  const checkbox = document.querySelector(`.ister-item[data-id="${dateId}"] .ister-checkbox`);
  if (checkbox) checkbox.checked = false;
  
  // Yapıldı modalını oluştur
  showYapildiModal(dateId, dateItem.baslik);
}

// Yapıldı modal'ını göster
function showYapildiModal(dateId, dateBaslik) {
  // Mevcut modal varsa kaldır
  const existingModal = document.getElementById('yapildiModal');
  if (existingModal) existingModal.remove();
  
  // Bugünün tarihini al
  const today = new Date().toISOString().split('T')[0];
  
  // Modal HTML'i oluştur
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
            <label for="yapildiGorsel">🖼️ Görsel URL (opsiyonel)</label>
            <input type="text" id="yapildiGorsel" placeholder="https://...">
          </div>
          <button type="submit" class="btn-kaydet">💕 Kaydet</button>
        </form>
      </div>
    </div>
  `;
  
  // Modal'ı sayfaya ekle
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Event listener'ları ekle
  const modal = document.getElementById('yapildiModal');
  const closeBtn = document.getElementById('btnYapildiModalClose');
  const form = document.getElementById('yapildiForm');
  
  // Konum inputuna focus
  document.getElementById('yapildiKonum').focus();
  
  // Kapat butonu
  closeBtn.addEventListener('click', () => {
    modal.remove();
  });
  
  // Modal dışına tıklayınca kapat
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
  
  // Form submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const tarih = document.getElementById('yapildiTarih').value;
    const konum = document.getElementById('yapildiKonum').value.trim();
    const gorselUrl = document.getElementById('yapildiGorsel').value.trim();
    
    if (tarih && konum) {
      await saveYapildiDate(dateId, tarih, konum, gorselUrl);
      modal.remove();
    }
  });
}

// Yapıldı date'i kaydet
async function saveYapildiDate(dateId, tarih, konum, gorselUrl) {
  const dateItem = istekDatelerCache.find(d => d.id === dateId);
  if (!dateItem) return;
  
  try {
    const db = window.firebaseDb;
    
    // Yapılan datelere ekle
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
    
    // İstek listesinden sil
    await window.firestoreDeleteDoc(
      window.firestoreDoc(db, ISTEK_DATE_KOLEKSIYON, dateId)
    );
    
    console.log(`✅ Date yapıldı olarak işaretlendi: ${dateItem.baslik}`);
    
    // Listeleri yeniden yükle
    await loadIsterListesiFromFirestore();
    await loadYapilanDatelerFromFirestore();
    
  } catch (error) {
    console.error('❌ Date işaretlenirken hata:', error);
    alert('Date işaretlenirken bir hata oluştu!');
  }
}

// Yapılan date'i sil - FIRESTORE'DAN SİLER
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

// Tarihi formatla (30.01.2026)
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

// Global fonksiyonları dışa aktar - Dateler için
window.markDateAsYapildi = markDateAsYapildi;
window.deleteIsterDate = deleteIsterDate;
window.deleteYapilanDate = deleteYapilanDate;

/* ============================================
   OYUNLAR SAYFASI
   Oynanıyor ve Bitirilen Oyunlar yönetimi
   IMDB tarzı yıldız puanlama sistemi
   ============================================ */

// Oyunlar cache
let oynaniyanOyunlarCache = [];
let bitirilenOyunlarCache = [];

// Oyunlar sayfasını yükle
async function loadOyunlarPage() {
  const pageContent = document.getElementById('pageContent');
  
  pageContent.innerHTML = `
    <div class="filmler-container oyunlar-container">
      <!-- Sayfa Başlığı -->
      <div class="filmler-header">
        <h2 class="filmler-title">🎮 Oyunlar</h2>
        <p class="filmler-subtitle">Birlikte oynadığımız oyunlar</p>
        <div class="header-divider"></div>
      </div>

      <!-- Oyun Ekleme Formu -->
      <div class="oyun-section-card">
        <div class="section-header-box">
          <span class="section-icon">🕹️</span>
          <h3 class="section-title-box">Yeni Oyun Başlat</h3>
        </div>
        <form id="oyunEkleForm" class="oyun-ekleme-form">
          <div class="form-row-oyun">
            <div class="form-group-oyun">
              <label>🎯 Oyun Adı</label>
              <input type="text" id="oyunAdi" placeholder="Oyun adını yaz..." required>
            </div>
            <div class="form-group-oyun">
              <label>📅 Başlama Tarihi</label>
              <input type="date" id="oyunBaslamaTarihi" required>
            </div>
          </div>
          <button type="submit" class="btn-oyun-baslat">
            <span class="btn-icon">▶️</span>
            <span class="btn-text">Oyuna Başla</span>
          </button>
        </form>
      </div>

      <!-- Oynanıyor Bölümü -->
      <div class="oyun-section-card">
        <div class="section-header-box">
          <span class="section-icon">🎮</span>
          <h3 class="section-title-box">Oynanıyor</h3>
          <span class="section-count" id="oynaniyanCount">0</span>
        </div>
        <div id="oynaniyanOyunlarContainer" class="oyunlar-grid"></div>
        <div id="oynaniyanEmpty" class="empty-state-oyun">
          <span class="empty-icon">🎮</span>
          <p>Henüz oynanan oyun yok</p>
          <span class="empty-hint">Yukarıdan yeni oyun ekleyebilirsin</span>
        </div>
      </div>

      <!-- Bitirilen Oyunlar Bölümü -->
      <div class="oyun-section-card">
        <div class="section-header-box">
          <span class="section-icon">🏆</span>
          <h3 class="section-title-box">Bitirilen Oyunlar</h3>
          <span class="section-count" id="bitirilenCount">0</span>
        </div>
        <div id="bitirilenOyunlarContainer" class="oyunlar-grid"></div>
        <div id="bitirilenEmpty" class="empty-state-oyun">
          <span class="empty-icon">🏆</span>
          <p>Henüz bitirilen oyun yok</p>
          <span class="empty-hint">Oynanıyor listesinden oyunları bitirebilirsin</span>
        </div>
      </div>
    </div>

    <!-- Oyun Bitirme Modal -->
    <div class="modal-overlay" id="oyunBitirModal">
      <div class="modal-content oyun-bitir-modal">
        <div class="modal-header-oyun">
          <span class="modal-icon">🏆</span>
          <h3 class="modal-title">Oyunu Bitir</h3>
        </div>
        <form id="oyunBitirForm">
          <input type="hidden" id="bitirOyunId">
          
          <div class="form-group-oyun modal-form-group">
            <label>📅 Bitiş Tarihi</label>
            <input type="date" id="oyunBitisTarihi" required>
          </div>
          
          <div class="puan-section">
            <div class="puan-card baran-card">
              <label class="puan-card-label">👨 Baran'ın Puanı</label>
              <div class="star-rating" id="baranStars" data-rating="0">
                ${generateStarInputs('baran')}
              </div>
              <span class="puan-display" id="baranPuanDisplay">0/5</span>
            </div>
            
            <div class="puan-card bahar-card">
              <label class="puan-card-label">👩 Bahar'ın Puanı</label>
              <div class="star-rating" id="baharStars" data-rating="0">
                ${generateStarInputs('bahar')}
              </div>
              <span class="puan-display" id="baharPuanDisplay">0/5</span>
            </div>
          </div>
          
          <div class="ortalama-card">
            <label class="ortalama-label">⭐ Ortalama Puan</label>
            <div class="ortalama-stars" id="ortalamaStars">
              ${generateStarDisplay()}
            </div>
            <span class="ortalama-display" id="ortalamaPuanDisplay">0.0</span>
          </div>
          
          <div class="modal-buttons-oyun">
            <button type="button" class="btn-modal-iptal" onclick="closeOyunBitirModal()">
              ❌ İptal
            </button>
            <button type="submit" class="btn-modal-kaydet">
              🏆 Oyunu Bitir
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  // Bugünün tarihini varsayılan olarak ayarla
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('oyunBaslamaTarihi').value = today;

  // Form eventlerini bağla
  document.getElementById('oyunEkleForm').addEventListener('submit', handleOyunEkle);
  document.getElementById('oyunBitirForm').addEventListener('submit', handleOyunBitir);

  // Yıldız rating eventlerini bağla
  initStarRatings();

  // Firebase'den verileri yükle
  await loadOyunlarFromFirebase();
}

// Yıldız inputları oluştur (0.5-5)
function generateStarInputs(prefix) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    html += `<span class="star" data-value="${i}" data-prefix="${prefix}">☆</span>`;
  }
  return html;
}

// Yıldız display oluştur (sadece görüntüleme)
function generateStarDisplay() {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    html += `<span class="star display-star">☆</span>`;
  }
  return html;
}

// Yıldız rating eventlerini başlat
function initStarRatings() {
  const starContainers = document.querySelectorAll('.star-rating');
  
  starContainers.forEach(container => {
    const stars = container.querySelectorAll('.star');
    
    stars.forEach(star => {
      star.addEventListener('click', () => {
        const value = parseInt(star.dataset.value);
        const prefix = star.dataset.prefix;
        container.dataset.rating = value;
        
        // Yıldızları güncelle
        stars.forEach((s, index) => {
          if (index < value) {
            s.textContent = '★';
            s.classList.add('filled');
          } else {
            s.textContent = '☆';
            s.classList.remove('filled');
          }
        });
        
        // Puan display güncelle
        document.getElementById(`${prefix}PuanDisplay`).textContent = `${value}/5`;
        
        // Ortalama hesapla
        updateOrtalamaDisplay();
      });
      
      // Hover efekti
      star.addEventListener('mouseenter', () => {
        const value = parseInt(star.dataset.value);
        stars.forEach((s, index) => {
          if (index < value) {
            s.classList.add('hover');
          } else {
            s.classList.remove('hover');
          }
        });
      });
      
      star.addEventListener('mouseleave', () => {
        stars.forEach(s => s.classList.remove('hover'));
      });
    });
  });
}

// Ortalama puanı güncelle (5 yıldız sistemi)
function updateOrtalamaDisplay() {
  const baranPuan = parseInt(document.getElementById('baranStars').dataset.rating) || 0;
  const baharPuan = parseInt(document.getElementById('baharStars').dataset.rating) || 0;
  
  let ortalama = 0;
  if (baranPuan > 0 && baharPuan > 0) {
    ortalama = (baranPuan + baharPuan) / 2;
  } else if (baranPuan > 0) {
    ortalama = baranPuan;
  } else if (baharPuan > 0) {
    ortalama = baharPuan;
  }
  
  const fullStars = Math.floor(ortalama);
  const hasHalf = ortalama % 1 >= 0.5;
  
  // Ortalama yıldızları güncelle
  const ortalamaStars = document.querySelectorAll('#ortalamaStars .star');
  ortalamaStars.forEach((star, index) => {
    star.classList.remove('filled', 'half');
    if (index < fullStars) {
      star.textContent = '★';
      star.classList.add('filled');
    } else if (index === fullStars && hasHalf) {
      star.textContent = '★';
      star.classList.add('half');
    } else {
      star.textContent = '☆';
    }
  });
  
  document.getElementById('ortalamaPuanDisplay').textContent = ortalama.toFixed(1);
}

// Firebase'den oyunları yükle
async function loadOyunlarFromFirebase() {
  await waitForFirebase();
  
  try {
    const db = window.firebaseDb;
    
    // Oynanıyor oyunları
    const oynaniyanQuery = window.firestoreQuery(
      window.firestoreCollection(db, 'oyunlar'),
      window.firestoreOrderBy('baslamaTarihi', 'desc')
    );
    const oynaniyanSnapshot = await window.firestoreGetDocs(oynaniyanQuery);
    
    oynaniyanOyunlarCache = [];
    bitirilenOyunlarCache = [];
    
    oynaniyanSnapshot.forEach((doc) => {
      const data = { id: doc.id, ...doc.data() };
      if (data.bitirildi) {
        bitirilenOyunlarCache.push(data);
      } else {
        oynaniyanOyunlarCache.push(data);
      }
    });
    
    // Render
    renderOynaniyanOyunlar();
    renderBitirilenOyunlar();
    
  } catch (error) {
    console.error('Oyunlar yüklenirken hata:', error);
  }
}

// Oyun ekleme
async function handleOyunEkle(e) {
  e.preventDefault();
  
  const oyunAdi = document.getElementById('oyunAdi').value.trim();
  const baslamaTarihi = document.getElementById('oyunBaslamaTarihi').value;
  
  if (!oyunAdi || !baslamaTarihi) return;
  
  await waitForFirebase();
  
  try {
    const db = window.firebaseDb;
    const docRef = await window.firestoreAddDoc(
      window.firestoreCollection(db, 'oyunlar'),
      {
        ad: oyunAdi,
        baslamaTarihi: baslamaTarihi,
        bitirildi: false,
        createdAt: window.firestoreServerTimestamp()
      }
    );
    
    // Cache'e ekle
    oynaniyanOyunlarCache.unshift({
      id: docRef.id,
      ad: oyunAdi,
      baslamaTarihi: baslamaTarihi,
      bitirildi: false
    });
    
    // Formu temizle
    document.getElementById('oyunAdi').value = '';
    
    // Render
    renderOynaniyanOyunlar();
    
    console.log('🎮 Oyun eklendi:', oyunAdi);
    
  } catch (error) {
    console.error('Oyun eklenirken hata:', error);
  }
}

// Oyun bitirme modalını aç
function openOyunBitirModal(oyunId) {
  const modal = document.getElementById('oyunBitirModal');
  document.getElementById('bitirOyunId').value = oyunId;
  
  // Bugünün tarihini ayarla
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('oyunBitisTarihi').value = today;
  
  // Puanları sıfırla
  document.getElementById('baranStars').dataset.rating = '0';
  document.getElementById('baharStars').dataset.rating = '0';
  
  // Yıldızları sıfırla
  document.querySelectorAll('.star-rating .star').forEach(star => {
    star.textContent = '☆';
    star.classList.remove('filled');
  });
  document.querySelectorAll('#ortalamaStars .star').forEach(star => {
    star.textContent = '☆';
    star.classList.remove('filled');
  });
  
  document.getElementById('baranPuanDisplay').textContent = '0/10';
  document.getElementById('baharPuanDisplay').textContent = '0/10';
  document.getElementById('ortalamaPuanDisplay').textContent = '0.0';
  
  // Yıldız eventlerini yeniden bağla
  initStarRatings();
  
  modal.classList.add('active');
}

// Oyun bitirme modalını kapat
function closeOyunBitirModal() {
  document.getElementById('oyunBitirModal').classList.remove('active');
}

// Oyun bitirme işlemi
async function handleOyunBitir(e) {
  e.preventDefault();
  
  const oyunId = document.getElementById('bitirOyunId').value;
  const bitisTarihi = document.getElementById('oyunBitisTarihi').value;
  const baranPuan = parseInt(document.getElementById('baranStars').dataset.rating) || 0;
  const baharPuan = parseInt(document.getElementById('baharStars').dataset.rating) || 0;
  
  if (!bitisTarihi || baranPuan === 0 || baharPuan === 0) {
    alert('Lütfen bitiş tarihini ve puanları giriniz!');
    return;
  }
  
  const ortalamaPuan = (baranPuan + baharPuan) / 2;
  
  await waitForFirebase();
  
  try {
    const db = window.firebaseDb;
    
    // Firebase'de güncelle
    await window.firestoreUpdateDoc(
      window.firestoreDoc(db, 'oyunlar', oyunId),
      {
        bitirildi: true,
        bitisTarihi: bitisTarihi,
        baranPuan: baranPuan,
        baharPuan: baharPuan,
        ortalamaPuan: ortalamaPuan
      }
    );
    
    // Cache'den oyunu bul ve taşı
    const oyunIndex = oynaniyanOyunlarCache.findIndex(o => o.id === oyunId);
    if (oyunIndex !== -1) {
      const oyun = oynaniyanOyunlarCache.splice(oyunIndex, 1)[0];
      oyun.bitirildi = true;
      oyun.bitisTarihi = bitisTarihi;
      oyun.baranPuan = baranPuan;
      oyun.baharPuan = baharPuan;
      oyun.ortalamaPuan = ortalamaPuan;
      bitirilenOyunlarCache.unshift(oyun);
    }
    
    // Modal kapat
    closeOyunBitirModal();
    
    // Render
    renderOynaniyanOyunlar();
    renderBitirilenOyunlar();
    
    console.log('🏆 Oyun bitirildi!');
    
  } catch (error) {
    console.error('Oyun bitirilirken hata:', error);
  }
}

// Oyun silme
async function deleteOyun(oyunId, bitirildi = false) {
  if (!confirm('Bu oyunu silmek istediğinize emin misiniz?')) return;
  
  await waitForFirebase();
  
  try {
    const db = window.firebaseDb;
    await window.firestoreDeleteDoc(window.firestoreDoc(db, 'oyunlar', oyunId));
    
    // Cache'den sil
    if (bitirildi) {
      bitirilenOyunlarCache = bitirilenOyunlarCache.filter(o => o.id !== oyunId);
      renderBitirilenOyunlar();
    } else {
      oynaniyanOyunlarCache = oynaniyanOyunlarCache.filter(o => o.id !== oyunId);
      renderOynaniyanOyunlar();
    }
    
    console.log('🗑️ Oyun silindi');
    
  } catch (error) {
    console.error('Oyun silinirken hata:', error);
  }
}

// Kaç gün hesapla
function hesaplaGunSayisi(baslama, bitis) {
  const baslamaDate = new Date(baslama);
  const bitisDate = new Date(bitis);
  const diffTime = Math.abs(bitisDate - baslamaDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// Tarih formatla
function formatOyunTarih(tarih) {
  if (!tarih) return '';
  const date = new Date(tarih);
  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Yıldız HTML oluştur - 5 yıldız sistemi (yarım yıldız destekli)
function generateStarHTML(puan, size = 'normal') {
  const maxStars = 5;
  const fullStars = Math.floor(puan);
  const hasHalf = puan % 1 >= 0.5;
  const emptyStars = maxStars - fullStars - (hasHalf ? 1 : 0);
  
  let html = `<div class="stars-display ${size}">`;
  
  // Dolu yıldızlar
  for (let i = 0; i < fullStars; i++) {
    html += `<span class="star filled">★</span>`;
  }
  
  // Yarım yıldız
  if (hasHalf) {
    html += `<span class="star half">★</span>`;
  }
  
  // Boş yıldızlar
  for (let i = 0; i < emptyStars; i++) {
    html += `<span class="star empty">☆</span>`;
  }
  
  html += '</div>';
  return html;
}

// Oynanıyor oyunları render et
function renderOynaniyanOyunlar() {
  const container = document.getElementById('oynaniyanOyunlarContainer');
  const emptyDiv = document.getElementById('oynaniyanEmpty');
  const countEl = document.getElementById('oynaniyanCount');
  
  if (!container || !emptyDiv) return;
  
  // Count güncelle
  if (countEl) countEl.textContent = oynaniyanOyunlarCache.length;
  
  if (oynaniyanOyunlarCache.length === 0) {
    container.innerHTML = '';
    emptyDiv.style.display = 'flex';
    return;
  }
  
  emptyDiv.style.display = 'none';
  
  container.innerHTML = oynaniyanOyunlarCache.map(oyun => `
    <div class="oyun-card oynaniyor" data-id="${oyun.id}">
      <div class="oyun-card-left">
        <div class="oyun-icon-box">🎮</div>
        <div class="oyun-info">
          <h4 class="oyun-ad">${oyun.ad}</h4>
          <div class="oyun-meta">
            <span class="oyun-tarih">📅 ${formatOyunTarih(oyun.baslamaTarihi)}</span>
            <span class="oyun-status-badge">▶️ Oynanıyor</span>
          </div>
        </div>
      </div>
      <div class="oyun-actions">
        <button class="btn-oyun-tamamla" onclick="openOyunBitirModal('${oyun.id}')" title="Oyunu Bitir">
          <span class="btn-icon">🏆</span>
          <span class="btn-label">Bitir</span>
        </button>
        <button class="btn-oyun-sil" onclick="deleteOyun('${oyun.id}', false)" title="Sil">
          🗑️
        </button>
      </div>
    </div>
  `).join('');
}

// Bitirilen oyunları render et
function renderBitirilenOyunlar() {
  const container = document.getElementById('bitirilenOyunlarContainer');
  const emptyDiv = document.getElementById('bitirilenEmpty');
  const countEl = document.getElementById('bitirilenCount');
  
  if (!container || !emptyDiv) return;
  
  // Count güncelle
  if (countEl) countEl.textContent = bitirilenOyunlarCache.length;
  
  if (bitirilenOyunlarCache.length === 0) {
    container.innerHTML = '';
    emptyDiv.style.display = 'flex';
    return;
  }
  
  emptyDiv.style.display = 'none';
  
  container.innerHTML = bitirilenOyunlarCache.map(oyun => {
    const gunSayisi = hesaplaGunSayisi(oyun.baslamaTarihi, oyun.bitisTarihi);
    
    return `
      <div class="oyun-card bitirildi" data-id="${oyun.id}">
        <div class="oyun-card-header">
          <div class="oyun-icon-box trophy">🏆</div>
          <div class="oyun-header-info">
            <h4 class="oyun-ad">${oyun.ad}</h4>
            <span class="gun-badge">⏱️ ${gunSayisi} günde bitirildi</span>
          </div>
          <button class="btn-oyun-sil" onclick="deleteOyun('${oyun.id}', true)" title="Sil">
            🗑️
          </button>
        </div>
        
        <div class="oyun-tarih-range">
          📅 ${formatOyunTarih(oyun.baslamaTarihi)} → ${formatOyunTarih(oyun.bitisTarihi)}
        </div>
        
        <div class="oyun-puanlar-grid">
          <div class="puan-box baran">
            <span class="puan-kisi">👨 Baran</span>
            <div class="puan-stars">${generateStarHTML(oyun.baranPuan, 'small')}</div>
          </div>
          <div class="puan-box bahar">
            <span class="puan-kisi">👩 Bahar</span>
            <div class="puan-stars">${generateStarHTML(oyun.baharPuan, 'small')}</div>
          </div>
          <div class="puan-box ortalama-box">
            <span class="puan-kisi">⭐ Ortalama</span>
            <div class="puan-stars">${generateStarHTML(oyun.ortalamaPuan, 'small')}</div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Global fonksiyonları dışa aktar - Oyunlar için
window.openOyunBitirModal = openOyunBitirModal;
window.closeOyunBitirModal = closeOyunBitirModal;
window.deleteOyun = deleteOyun;

/* ============================================
   KİTAPLAR SAYFASI
   ============================================ */

// Kitaplar cache
let kitaplarCache = [];
let aktifKitapFiltre = 'bahar'; // bahar, baran, ortak

// Kitaplar sayfasını yükle
async function loadKitaplarPage() {
  const pageContent = document.getElementById('pageContent');
  
  pageContent.innerHTML = `
    <div class="kitaplar-container">
      <!-- Üst Header -->
      <div class="kitaplar-header">
        <div class="kitaplar-title-section">
          <span class="section-icon">📚</span>
          <h2 class="section-title-box">KİTAPLAR</h2>
        </div>
        <button class="btn-yeni-kitap" onclick="openKitapModal()">
          <span class="btn-icon">+</span>
          <span class="btn-text">Yeni Kitap</span>
        </button>
      </div>
      
      <!-- Filtre Butonları -->
      <div class="kitap-filtre-container">
        <button class="kitap-filtre-btn active" data-filtre="bahar" onclick="setKitapFiltre('bahar')">
          <span>👩</span> Bahar
        </button>
        <button class="kitap-filtre-btn" data-filtre="baran" onclick="setKitapFiltre('baran')">
          <span>👨</span> Baran
        </button>
        <button class="kitap-filtre-btn" data-filtre="ortak" onclick="setKitapFiltre('ortak')">
          <span>💕</span> Ortak
        </button>
      </div>
      
      <!-- Okunacak Kitaplar -->
      <div class="kitap-section">
        <div class="kitap-section-header">
          <h3>📖 Okunacak Kitaplar</h3>
          <span class="kitap-count" id="okunacakCount">0</span>
        </div>
        <div class="okunacak-kitaplar-box" id="okunacakKitaplarContainer">
        </div>
      </div>
      
      <!-- Okunan Kitaplar -->
      <div class="kitap-section">
        <div class="kitap-section-header">
          <h3>✅ Okunan Kitaplar</h3>
          <span class="kitap-count" id="okunanCount">0</span>
        </div>
        <div class="okunan-kitaplar-grid" id="okunanKitaplarContainer">
        </div>
      </div>
      
      <!-- Yeni Kitap Modal -->
      <div class="modal-overlay" id="kitapModal">
        <div class="modal-content kitap-modal">
          <div class="modal-header">
            <h3>📚 Yeni Kitap Ekle</h3>
            <button class="btn-modal-close" onclick="closeKitapModal()">×</button>
          </div>
          <form id="kitapForm" onsubmit="handleKitapEkle(event)">
            <div class="form-group">
              <label>Kitap Adı</label>
              <input type="text" id="kitapAdi" placeholder="Kitap adını girin..." required>
            </div>
            <div class="form-group">
              <label>Kime Ait?</label>
              <div class="sahip-secim">
                <label class="sahip-option">
                  <input type="radio" name="kitapSahip" value="bahar" checked>
                  <span class="sahip-label">👩 Bahar</span>
                </label>
                <label class="sahip-option">
                  <input type="radio" name="kitapSahip" value="baran">
                  <span class="sahip-label">👨 Baran</span>
                </label>
              </div>
            </div>
            <button type="submit" class="btn-kaydet">📚 Kitap Ekle</button>
          </form>
        </div>
      </div>
      
      <!-- Kitap Bitir Modal -->
      <div class="modal-overlay" id="kitapBitirModal">
        <div class="modal-content kitap-modal kitap-bitir-modal">
          <div class="modal-header">
            <h3>✅ Kitabı Bitir</h3>
            <button class="btn-modal-close" onclick="closeKitapBitirModal()">×</button>
          </div>
          <form id="kitapBitirForm" onsubmit="handleKitapBitir(event)">
            <input type="hidden" id="bitirKitapId">
            <div class="form-group">
              <label>🖼️ Kapak Görseli URL (opsiyonel)</label>
              <input type="url" id="kitapBitirKapak" placeholder="https://...">
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>📅 Başlama Tarihi</label>
                <input type="date" id="kitapBitirBaslama" required>
              </div>
              <div class="form-group">
                <label>📅 Bitiş Tarihi</label>
                <input type="date" id="kitapBitirBitis" required>
              </div>
            </div>
            <div class="form-group">
              <label>📄 Sayfa Sayısı</label>
              <input type="number" id="kitapSayfaSayisi" min="1" placeholder="Sayfa sayısı..." required>
            </div>
            <div class="form-group">
              <label>⭐ Puan</label>
              <div class="kitap-star-rating" id="kitapStarRating">
                <span class="star" data-value="1">☆</span>
                <span class="star" data-value="2">☆</span>
                <span class="star" data-value="3">☆</span>
                <span class="star" data-value="4">☆</span>
                <span class="star" data-value="5">☆</span>
              </div>
              <input type="hidden" id="kitapPuan" value="0">
            </div>
            <button type="submit" class="btn-kaydet">✅ Kitabı Bitir</button>
          </form>
        </div>
      </div>
    </div>
  `;
  
  // Bugünün tarihini ayarla
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('kitapBitirBitis').value = today;
  
  // Yıldız rating eventlerini başlat
  initKitapStarRating();
  
  // Firebase'den kitapları yükle
  await loadKitaplarFromFirebase();
}

// Kitap yıldız rating eventleri
function initKitapStarRating() {
  const container = document.getElementById('kitapStarRating');
  if (!container) return;
  
  const stars = container.querySelectorAll('.star');
  
  stars.forEach(star => {
    star.addEventListener('click', () => {
      const value = parseInt(star.dataset.value);
      document.getElementById('kitapPuan').value = value;
      
      stars.forEach((s, index) => {
        if (index < value) {
          s.textContent = '★';
          s.classList.add('filled');
        } else {
          s.textContent = '☆';
          s.classList.remove('filled');
        }
      });
    });
    
    star.addEventListener('mouseenter', () => {
      const value = parseInt(star.dataset.value);
      stars.forEach((s, index) => {
        if (index < value) s.classList.add('hover');
        else s.classList.remove('hover');
      });
    });
    
    star.addEventListener('mouseleave', () => {
      stars.forEach(s => s.classList.remove('hover'));
    });
  });
}

// Firebase'den kitapları yükle
async function loadKitaplarFromFirebase() {
  await waitForFirebase();
  
  try {
    const db = window.firebaseDb;
    const kitaplarQuery = window.firestoreQuery(
      window.firestoreCollection(db, 'books'),
      window.firestoreOrderBy('createdAt', 'desc')
    );
    
    const snapshot = await window.firestoreGetDocs(kitaplarQuery);
    
    kitaplarCache = [];
    snapshot.forEach(doc => {
      kitaplarCache.push({ id: doc.id, ...doc.data() });
    });
    
    renderKitaplar();
  } catch (error) {
    console.error('Kitaplar yüklenirken hata:', error);
  }
}

// Kitap filtresi değiştir
function setKitapFiltre(filtre) {
  aktifKitapFiltre = filtre;
  
  // Buton stillerini güncelle
  document.querySelectorAll('.kitap-filtre-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.filtre === filtre) {
      btn.classList.add('active');
    }
  });
  
  renderKitaplar();
}

// Ortak kitapları bul (aynı isme sahip farklı sahiplerden)
function getOrtakKitaplar() {
  const kitapGruplari = {};
  
  kitaplarCache.forEach(kitap => {
    const key = kitap.ad.toLowerCase().trim();
    if (!kitapGruplari[key]) {
      kitapGruplari[key] = [];
    }
    kitapGruplari[key].push(kitap);
  });
  
  // Sadece hem bahar hem baran'ın eklediği kitapları döndür
  const ortaklar = [];
  Object.values(kitapGruplari).forEach(grup => {
    const sahipler = [...new Set(grup.map(k => k.sahip))];
    if (sahipler.includes('bahar') && sahipler.includes('baran')) {
      ortaklar.push({
        ad: grup[0].ad,
        bahar: grup.find(k => k.sahip === 'bahar'),
        baran: grup.find(k => k.sahip === 'baran')
      });
    }
  });
  
  return ortaklar;
}

// Kitapları render et
function renderKitaplar() {
  const okunacakContainer = document.getElementById('okunacakKitaplarContainer');
  const okunacakCount = document.getElementById('okunacakCount');
  const okunanCount = document.getElementById('okunanCount');
  
  if (aktifKitapFiltre === 'ortak') {
    renderOrtakKitaplar();
    return;
  }
  
  // Normal filtre (bahar veya baran)
  const filtreliKitaplar = kitaplarCache.filter(k => k.sahip === aktifKitapFiltre);
  const okunacaklar = filtreliKitaplar.filter(k => k.durum === 'okunacak');
  const okunanlar = filtreliKitaplar.filter(k => k.durum === 'okunmus');
  
  // Okunacak sayısı
  okunacakCount.textContent = okunacaklar.length;
  okunanCount.textContent = okunanlar.length;
  
  // Okunacak kitaplar
  if (okunacaklar.length === 0) {
    okunacakContainer.innerHTML = `
      <div class="kitap-empty">
        <span class="empty-icon">📚</span>
        <p>Henüz okunacak kitap eklenmemiş</p>
      </div>
    `;
  } else {
    okunacakContainer.innerHTML = okunacaklar.map(kitap => `
      <div class="okunacak-kitap-item">
        <div class="kitap-info">
          <div class="kitap-kapak-placeholder">📖</div>
          <span class="kitap-adi">${kitap.ad}</span>
        </div>
        <div class="kitap-actions">
          <button class="btn-kitap-bitir" onclick="openKitapBitirModal('${kitap.id}')" title="Kitabı Bitir">
            ✅ Bitir
          </button>
          <button class="btn-kitap-sil" onclick="deleteKitap('${kitap.id}')" title="Sil">🗑️</button>
        </div>
      </div>
    `).join('');
  }
  
  // Okunan kitaplar
  const okunanContainer = document.getElementById('okunanKitaplarContainer');
  
  if (okunanlar.length === 0) {
    okunanContainer.innerHTML = `
      <div class="kitap-empty">
        <span class="empty-icon">📖</span>
        <p>Henüz okunan kitap yok</p>
      </div>
    `;
  } else {
    okunanContainer.innerHTML = okunanlar.map(kitap => {
      const gunSayisi = hesaplaGunSayisi(kitap.baslamaTarihi, kitap.bitisTarihi);
      return `
        <div class="okunan-kitap-card">
          <div class="okunan-kitap-kapak">
            ${kitap.kapakUrl ? `<img src="${kitap.kapakUrl}" alt="${kitap.ad}">` : '<span class="kapak-placeholder">📚</span>'}
          </div>
          <div class="okunan-kitap-detay">
            <h4 class="okunan-kitap-adi">${kitap.ad}</h4>
            <div class="okunan-kitap-meta">
              <span class="meta-item">📄 ${kitap.sayfaSayisi || '?'} sayfa</span>
              <span class="meta-item">⏱️ ${gunSayisi} günde</span>
            </div>
            <div class="okunan-kitap-tarihler">
              <span>${formatKitapTarih(kitap.baslamaTarihi)} → ${formatKitapTarih(kitap.bitisTarihi)}</span>
            </div>
            <div class="okunan-kitap-puan">
              ${generateStarHTML(kitap.puan || 0, 'small')}
            </div>
          </div>
          <button class="btn-kitap-sil-mini" onclick="deleteKitap('${kitap.id}')" title="Sil">×</button>
        </div>
      `;
    }).join('');
  }
}

// Gün sayısı hesapla
function hesaplaGunSayisi(baslama, bitis) {
  if (!baslama || !bitis) return '-';
  const d1 = new Date(baslama);
  const d2 = new Date(bitis);
  const diff = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
  return diff >= 0 ? diff + 1 : 1; // En az 1 gün
}

// Ortak kitapları render et
function renderOrtakKitaplar() {
  const okunacakContainer = document.getElementById('okunacakKitaplarContainer');
  const okunanContainer = document.getElementById('okunanKitaplarContainer');
  const okunacakCount = document.getElementById('okunacakCount');
  const okunanCount = document.getElementById('okunanCount');
  
  const ortakKitaplar = getOrtakKitaplar();
  
  // Okunuyor/okunacak olanlar
  const okunacakOrtaklar = ortakKitaplar.filter(o => 
    (o.bahar && o.bahar.durum !== 'okunmus') || (o.baran && o.baran.durum !== 'okunmus')
  );
  
  // Her ikisi de okumuş olanlar
  const okunanOrtaklar = ortakKitaplar.filter(o => 
    o.bahar && o.bahar.durum === 'okunmus' && o.baran && o.baran.durum === 'okunmus'
  );
  
  okunacakCount.textContent = okunacakOrtaklar.length;
  okunanCount.textContent = okunanOrtaklar.length;
  
  // Okunacak ortak kitaplar
  if (okunacakOrtaklar.length === 0) {
    okunacakContainer.innerHTML = `
      <div class="kitap-empty">
        <span class="empty-icon">💕</span>
        <p>Ortak kitap bulunamadı</p>
        <small>Aynı kitabı hem Bahar hem Baran eklediğinde burada görünür</small>
      </div>
    `;
  } else {
    okunacakContainer.innerHTML = okunacakOrtaklar.map(ortak => `
      <div class="ortak-kitap-card">
        <div class="ortak-kitap-baslik">"${ortak.ad}"</div>
        <div class="ortak-kitap-grid">
          <div class="ortak-kisi bahar">
            <span class="kisi-icon">👩 Bahar</span>
            <span class="durum-badge ${ortak.bahar?.durum || 'yok'}">${getDurumText(ortak.bahar?.durum)}</span>
          </div>
          <div class="ortak-kisi baran">
            <span class="kisi-icon">👨 Baran</span>
            <span class="durum-badge ${ortak.baran?.durum || 'yok'}">${getDurumText(ortak.baran?.durum)}</span>
          </div>
        </div>
      </div>
    `).join('');
  }
  
  // Okunan ortak kitaplar
  if (okunanOrtaklar.length === 0) {
    okunanContainer.innerHTML = `
      <div class="kitap-empty">
        <span class="empty-icon">📖</span>
        <p>Henüz birlikte bitirilen kitap yok</p>
      </div>
    `;
  } else {
    okunanContainer.innerHTML = okunanOrtaklar.map(ortak => `
      <div class="ortak-okunan-card">
        <div class="ortak-kitap-baslik">"${ortak.ad}"</div>
        <div class="ortak-puanlar">
          <div class="ortak-puan bahar">
            <span>👩 Bahar</span>
            ${generateStarHTML(ortak.bahar?.puan || 0, 'small')}
          </div>
          <div class="ortak-puan baran">
            <span>👨 Baran</span>
            ${generateStarHTML(ortak.baran?.puan || 0, 'small')}
          </div>
        </div>
      </div>
    `).join('');
  }
}

// Durum metni
function getDurumText(durum) {
  switch(durum) {
    case 'okunacak': return '📋 Okunacak';
    case 'okunuyor': return '📖 Okunuyor';
    case 'okunmus': return '✅ Okundu';
    default: return '❌ Eklenmemiş';
  }
}

// Tarih formatla
function formatKitapTarih(tarih) {
  if (!tarih) return '-';
  const d = new Date(tarih);
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Modal aç/kapat
function openKitapModal() {
  document.getElementById('kitapModal').classList.add('active');
  document.getElementById('kitapAdi').value = '';
}

function closeKitapModal() {
  document.getElementById('kitapModal').classList.remove('active');
}

function openKitapBitirModal(kitapId) {
  const kitap = kitaplarCache.find(k => k.id === kitapId);
  document.getElementById('kitapBitirModal').classList.add('active');
  document.getElementById('bitirKitapId').value = kitapId;
  document.getElementById('kitapBitirKapak').value = '';
  document.getElementById('kitapBitirBaslama').value = '';
  document.getElementById('kitapBitirBitis').value = new Date().toISOString().split('T')[0];
  document.getElementById('kitapSayfaSayisi').value = '';
  document.getElementById('kitapPuan').value = 0;
  
  // Yıldızları sıfırla
  document.querySelectorAll('#kitapStarRating .star').forEach(s => {
    s.textContent = '☆';
    s.classList.remove('filled');
  });
  
  // Yıldız eventlerini yeniden başlat
  initKitapStarRating();
}

function closeKitapBitirModal() {
  document.getElementById('kitapBitirModal').classList.remove('active');
}

// Kitap ekle
async function handleKitapEkle(e) {
  e.preventDefault();
  
  const ad = document.getElementById('kitapAdi').value.trim();
  const sahip = document.querySelector('input[name="kitapSahip"]:checked').value;
  
  if (!ad) return;
  
  await waitForFirebase();
  
  try {
    const db = window.firebaseDb;
    const docRef = await window.firestoreAddDoc(
      window.firestoreCollection(db, 'books'),
      {
        ad: ad,
        sahip: sahip,
        kapakUrl: null,
        durum: 'okunacak',
        baslamaTarihi: null,
        bitisTarihi: null,
        sayfaSayisi: null,
        puan: null,
        createdAt: window.firestoreServerTimestamp()
      }
    );
    
    kitaplarCache.unshift({
      id: docRef.id,
      ad: ad,
      sahip: sahip,
      kapakUrl: null,
      durum: 'okunacak',
      baslamaTarihi: null,
      bitisTarihi: null,
      sayfaSayisi: null,
      puan: null
    });
    
    closeKitapModal();
    
    // Eklenen kişinin filtresine geç
    setKitapFiltre(sahip);
    
    console.log('📚 Kitap eklendi:', ad);
  } catch (error) {
    console.error('Kitap eklenirken hata:', error);
  }
}

// Kitabı bitir
async function handleKitapBitir(e) {
  e.preventDefault();
  
  const kitapId = document.getElementById('bitirKitapId').value;
  const kapakUrl = document.getElementById('kitapBitirKapak').value.trim();
  const baslamaTarihi = document.getElementById('kitapBitirBaslama').value;
  const bitisTarihi = document.getElementById('kitapBitirBitis').value;
  const sayfaSayisi = parseInt(document.getElementById('kitapSayfaSayisi').value) || 0;
  const puan = parseInt(document.getElementById('kitapPuan').value) || 0;
  
  if (!baslamaTarihi || !bitisTarihi || sayfaSayisi === 0 || puan === 0) {
    alert('Lütfen tüm alanları doldurunuz!');
    return;
  }
  
  await waitForFirebase();
  
  try {
    const db = window.firebaseDb;
    await window.firestoreUpdateDoc(
      window.firestoreDoc(db, 'books', kitapId),
      {
        durum: 'okunmus',
        kapakUrl: kapakUrl || null,
        baslamaTarihi: baslamaTarihi,
        bitisTarihi: bitisTarihi,
        sayfaSayisi: sayfaSayisi,
        puan: puan
      }
    );
    
    // Cache güncelle
    const kitap = kitaplarCache.find(k => k.id === kitapId);
    if (kitap) {
      kitap.durum = 'okunmus';
      kitap.kapakUrl = kapakUrl || null;
      kitap.baslamaTarihi = baslamaTarihi;
      kitap.bitisTarihi = bitisTarihi;
      kitap.sayfaSayisi = sayfaSayisi;
      kitap.puan = puan;
    }
    
    closeKitapBitirModal();
    renderKitaplar();
    
    console.log('✅ Kitap bitirildi');
  } catch (error) {
    console.error('Kitap bitirilirken hata:', error);
  }
}

// Kitap sil
async function deleteKitap(kitapId) {
  console.log('deleteKitap çağrıldı:', kitapId);
  
  if (!confirm('Bu kitabı silmek istediğinize emin misiniz?')) {
    console.log('Silme iptal edildi');
    return;
  }
  
  try {
    await waitForFirebase();
    const db = window.firebaseDb;
    
    console.log('Firebase silme başlıyor...');
    await window.firestoreDeleteDoc(window.firestoreDoc(db, 'books', kitapId));
    console.log('Firebase silme tamamlandı');
    
    kitaplarCache = kitaplarCache.filter(k => k.id !== kitapId);
    console.log('Cache güncellendi, yeni boyut:', kitaplarCache.length);
    
    renderKitaplar();
    console.log('🗑️ Kitap silindi');
  } catch (error) {
    console.error('Kitap silinirken hata:', error);
    alert('Kitap silinirken hata oluştu: ' + error.message);
  }
}

// Global fonksiyonlar - Kitaplar
window.openKitapModal = openKitapModal;
window.closeKitapModal = closeKitapModal;
window.openKitapBitirModal = openKitapBitirModal;
window.closeKitapBitirModal = closeKitapBitirModal;
window.setKitapFiltre = setKitapFiltre;
window.handleKitapEkle = handleKitapEkle;
window.handleKitapBitir = handleKitapBitir;
window.deleteKitap = deleteKitap;

/* ============================================
   HARİTA SAYFASI - GİTTİĞİMİZ YERLER
   ============================================ */

// Harita cache ve state
let placesCache = [];
let currentZoom = 1;
let selectedCity = null;

// İl kodları ve isimleri (TR01-TR81 formatında)
const illerData = {
  "TR01": "Adana", "TR02": "Adıyaman", "TR03": "Afyonkarahisar", "TR04": "Ağrı",
  "TR05": "Amasya", "TR06": "Ankara", "TR07": "Antalya", "TR08": "Artvin",
  "TR09": "Aydın", "TR10": "Balıkesir", "TR11": "Bilecik", "TR12": "Bingöl",
  "TR13": "Bitlis", "TR14": "Bolu", "TR15": "Burdur", "TR16": "Bursa",
  "TR17": "Çanakkale", "TR18": "Çankırı", "TR19": "Çorum", "TR20": "Denizli",
  "TR21": "Diyarbakır", "TR22": "Edirne", "TR23": "Elazığ", "TR24": "Erzincan",
  "TR25": "Erzurum", "TR26": "Eskişehir", "TR27": "Gaziantep", "TR28": "Giresun",
  "TR29": "Gümüşhane", "TR30": "Hakkari", "TR31": "Hatay", "TR32": "Isparta",
  "TR33": "Mersin", "TR34": "İstanbul", "TR35": "İzmir", "TR36": "Kars",
  "TR37": "Kastamonu", "TR38": "Kayseri", "TR39": "Kırklareli", "TR40": "Kırşehir",
  "TR41": "Kocaeli", "TR42": "Konya", "TR43": "Kütahya", "TR44": "Malatya",
  "TR45": "Manisa", "TR46": "Kahramanmaraş", "TR47": "Mardin", "TR48": "Muğla",
  "TR49": "Muş", "TR50": "Nevşehir", "TR51": "Niğde", "TR52": "Ordu",
  "TR53": "Rize", "TR54": "Sakarya", "TR55": "Samsun", "TR56": "Siirt",
  "TR57": "Sinop", "TR58": "Sivas", "TR59": "Tekirdağ", "TR60": "Tokat",
  "TR61": "Trabzon", "TR62": "Tunceli", "TR63": "Şanlıurfa", "TR64": "Uşak",
  "TR65": "Van", "TR66": "Yozgat", "TR67": "Zonguldak", "TR68": "Aksaray",
  "TR69": "Bayburt", "TR70": "Karaman", "TR71": "Kırıkkale", "TR72": "Batman",
  "TR73": "Şırnak", "TR74": "Bartın", "TR75": "Ardahan", "TR76": "Iğdır",
  "TR77": "Yalova", "TR78": "Karabük", "TR79": "Kilis", "TR80": "Osmaniye", "TR81": "Düzce"
};

// Puan renklerini döndür
function getPuanColor(puan) {
  if (puan >= 4.5) return '#f0b429'; // Altın sarısı
  if (puan >= 3.5) return '#ffd93d'; // Açık sarı
  if (puan >= 2.5) return '#ffab4c'; // Açık turuncu
  if (puan >= 1.5) return '#ff8243'; // Turuncu
  return '#ff6b6b'; // Kırmızı
}

// Şehrin ortalama puanını hesapla
function getSehirOrtalamaPuan(sehirKodu) {
  const sehirPlaces = placesCache.filter(p => p.sehir === sehirKodu);
  if (sehirPlaces.length === 0) return 0;
  const toplam = sehirPlaces.reduce((sum, p) => sum + (p.puan || 0), 0);
  return toplam / sehirPlaces.length;
}

// Harita sayfasını yükle
async function loadHaritaPage() {
  const pageContent = document.getElementById('pageContent');
  
  pageContent.innerHTML = `
    <div class="harita-container">
      <!-- Üst Header -->
      <div class="harita-header">
        <div class="harita-title-section">
          <span class="section-icon">🗺️</span>
          <h2 class="section-title-box">GİTTİĞİMİZ YERLER</h2>
        </div>
        <div class="harita-stats">
          <span class="harita-stat" id="ziyaretSayisi">0 şehir ziyaret edildi</span>
        </div>
      </div>
      
      <!-- Zoom Kontrolleri -->
      <div class="zoom-controls">
        <button class="zoom-btn" onclick="zoomIn()" title="Yakınlaştır">+</button>
        <button class="zoom-btn" onclick="zoomOut()" title="Uzaklaştır">−</button>
        <button class="zoom-btn" onclick="resetZoom()" title="Sıfırla">⟲</button>
      </div>
      
      <!-- Harita Alanı -->
      <div class="harita-wrapper" id="haritaWrapper">
        <div class="harita-inner" id="haritaInner">
          <svg id="turkiyeHaritasi" viewBox="0 0 800 350" xmlns="http://www.w3.org/2000/svg">
            <!-- Türkiye haritası illeri -->
            ${generateTurkeyMapPaths()}
          </svg>
        </div>
      </div>
      
      <!-- Tooltip -->
      <div class="harita-tooltip" id="haritaTooltip"></div>
      
      <!-- Şehir Modal -->
      <div class="modal-overlay" id="sehirModal">
        <div class="modal-content sehir-modal">
          <div class="modal-header">
            <h3 id="sehirModalTitle">📍 Şehir</h3>
            <button class="btn-modal-close" onclick="closeSehirModal()">×</button>
          </div>
          <div class="sehir-modal-body">
            <!-- Önceki date'ler -->
            <div class="onceki-dateler" id="oncekiDateler">
              <h4>📅 Bu Şehirdeki Date'lerimiz</h4>
              <div class="date-list" id="dateList"></div>
            </div>
            
            <!-- Yeni date formu -->
            <div class="yeni-date-form">
              <h4>✨ Yeni Date Ekle</h4>
              <form id="dateForm" onsubmit="handleDateEkle(event)">
                <input type="hidden" id="dateSehirKodu">
                <div class="form-group">
                  <label>💕 Date Başlığı</label>
                  <input type="text" id="dateBaslik" placeholder="Örn: İlk Buluşmamız..." required>
                </div>
                <div class="form-group">
                  <label>📅 Tarih</label>
                  <input type="date" id="dateTarih" required>
                </div>
                <div class="form-group">
                  <label>⭐ Puan</label>
                  <div class="date-star-rating" id="dateStarRating">
                    <span class="star" data-value="1">☆</span>
                    <span class="star" data-value="2">☆</span>
                    <span class="star" data-value="3">☆</span>
                    <span class="star" data-value="4">☆</span>
                    <span class="star" data-value="5">☆</span>
                  </div>
                  <input type="hidden" id="datePuan" value="0">
                </div>
                <div class="form-group">
                  <label>📝 Not (opsiyonel)</label>
                  <textarea id="dateNot" placeholder="Kısa bir not..." rows="2"></textarea>
                </div>
                <div class="form-group">
                  <label>📷 Fotoğraf URL (opsiyonel)</label>
                  <input type="url" id="dateFoto" placeholder="https://...">
                </div>
                <button type="submit" class="btn-kaydet">💾 Kaydet</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Bugünün tarihini ayarla
  document.getElementById('dateTarih').value = new Date().toISOString().split('T')[0];
  
  // Yıldız rating eventlerini başlat
  initDateStarRating();
  
  // Harita eventlerini başlat
  initHaritaEvents();
  
  // Firebase'den verileri yükle
  await loadPlacesFromFirebase();
}

// Türkiye haritası SVG path'lerini oluştur - SimpleMaps TR SVG tabanlı gerçek koordinatlar
function generateTurkeyMapPaths() {
  // Gerçek Türkiye haritası path'leri (SimpleMaps.com tabanlı - 81 il)
  const ilPaths = {
    "TR01": { name: "Adana", d: "M440.5,262.8l-6.2,1.8l-8.5,7.8l-1.9,5.3l0.7,6.9l-2.8,1.5l-7.9-0.8l-5.9,2.4l0.3,4.2l4.7,4.6l1.2,4.5l-3.3,6l3.6,4.5l9.3,-0.5l5.9,-3.5l7.4,-2l6.9,4.3l1.9,-5.5l6.6,-3.5l1,-7.3l-3.5,-7.9l-3.7,-2.7l0.5,-4.8l-2.5,-7.2l-4.3,-2.6Z" },
    "TR02": { name: "Adıyaman", d: "M523.5,224.8l-4.3,4.8l0.9,7.2l-2.9,5.5l6.9,7.3l9.2,2.5l4.2,-2.2l12.8,1.2l5.5,-5.3l-0.5,-4.8l-4.9,-4.8l3.3,-6l-7.2,-1.8l-2.8,-5.3l-7.9,-0.5l-6.4,1.2l-5.9,1Z" },
    "TR03": { name: "Afyonkarahisar", d: "M270.8,169.5l-10.5,2l-3.8,7.5l-9.3,0.8l-2.3,9.5l5.5,8l0.5,9l8.8,-0.8l5,7.8l8.8,0.3l6,-6.8l12.5,-2.8l3.3,-9.3l-0.8,-8l-6.5,-6l-2.5,-7.7l-6.7,-1.5l-8,2Z" },
    "TR04": { name: "Ağrı", d: "M665.2,126.5l-7.5,10.2l1.8,5.5l-4.2,5.8l5.2,8l-4.5,5.8l6.9,6.3l18.5,3.3l8.8,-0.5l3.5,-5.8l8.2,-0.5l5.2,-8.2l-3.8,-8.2l-8.5,-3l-1.2,-7l-9,-4.5l-11.2,1.5l-8.2,-8.7Z" },
    "TR05": { name: "Amasya", d: "M419.8,107.8l-11.3,2.2l-5.5,6.5l3,8.5l8.8,1.8l3.8,7.2l11.8,-1.5l5.8,-4.5l10.2,2.8l0,-5.8l-3.8,-6.5l2.2,-5.3l-7,-4l-10.5,0.8l-7.5,-2.2Z" },
    "TR06": { name: "Ankara", d: "M330.5,120.5l-6.3,0.8l-9.2,8.5l-3.8,-6.8l-8.5,0.3l-2.2,5l4.5,9l-4.8,10.5l6.5,5.3l-1,8.8l6,3.5l12,0.5l4.5,-5.3l11.5,0l9.2,-6.8l1.8,-9.3l9.2,-2.8l2.8,-5.3l-0.8,-6.8l-5.2,-4.5l-8.2,0l-5,-5.8l-8.5,2.3l-4.5,4.7Z" },
    "TR07": { name: "Antalya", d: "M290.2,251.3l-17.5,3.5l-9.8,7.3l-6.5,0.5l-8.2,-5l-6.8,6.2l2.5,11.2l6.2,5.5l0.5,10l12.5,8.5l11.8,-5.5l10.2,-0.5l8.5,-5l4.5,-10.5l13.2,-2l8.5,-7.5l-4.8,-9.3l-7.2,-0.8l-5.8,-6.5l-11.8,0Z" },
    "TR08": { name: "Artvin", d: "M620.8,52.5l-3.5,6l3.8,8.5l-4.8,8.2l8,4.8l9.2,-1.2l5.2,4.5l8.5,-3.5l0.8,-8.2l-3.5,-6l5.2,-7.8l-6.5,-5.5l-8.2,3.5l-6,-5l-8.2,1.7Z" },
    "TR09": { name: "Aydın", d: "M158.8,208.5l-9.2,0.8l-5.3,7.5l-13,-0.5l-4.5,8.3l8.5,6l-3.5,5l4.5,4l10.2,-0.5l4,-6.5l9.2,-0.5l8.5,-5l3.8,-9.8l-3.5,-4.3l-9.7,-4.5Z" },
    "TR10": { name: "Balıkesir", d: "M175.5,98.5l-14.2,1.8l-9.2,6.8l4.2,9.3l-10.5,5l-2.8,8.5l11.2,7.5l14,1.5l6.5,-3.3l11,-1l0.8,-9.5l8.8,-4l-0.5,-7.3l-5.8,-5l0.5,-7.5l-13.5,-2.8Z" },
    "TR11": { name: "Bilecik", d: "M248.2,105.5l-8.8,1.3l-3.5,6l5.5,6.5l-2.8,7.3l8.5,3l8.2,-2.3l1.2,-6.5l7.2,-1.5l-2.5,-7.3l-5.2,-4l-7.8,-2.5Z" },
    "TR12": { name: "Bingöl", d: "M570.5,165.8l-6.8,3l-8.5,10.5l4.2,7l8.5,-0.5l8.2,6.5l10.5,-2.5l2.2,-5l-0.5,-7.8l4,-5.5l-6.2,-6.5l-8.5,1.3l-7.1,-0.5Z" },
    "TR13": { name: "Bitlis", d: "M617.8,180.8l-6.5,3.8l-2,6.8l6.2,8.5l12,0.5l9,-3.8l-0.8,-9.2l-6.2,-5.3l-11.7,-1.3Z" },
    "TR14": { name: "Bolu", d: "M303.5,85.5l-10,6.3l2.8,8.5l6.2,2.8l1,6.5l9.5,-1.3l5.5,7l8.2,-0.8l4.8,-6.5l-2,-7l5.5,-5.5l-6.5,-7.8l-9.5,2.3l-8,0.5l-7.5,-5Z" },
    "TR15": { name: "Burdur", d: "M262.2,219.5l-6.8,1.5l-5.5,8.2l1.8,9l-6.5,6.8l12,2.2l8.8,-2.5l5.5,4.5l6.8,-6l0.3,-8.8l-4.8,-7.3l-3.8,-5.6l-7.8,-2Z" },
    "TR16": { name: "Bursa", d: "M212.5,95.8l-9.8,5l1.8,8.3l7.2,4l-0.5,6.5l7.2,1.3l9.8,-6l3.8,5l7,-1.2l-0.3,-7.8l-5,-4.8l0.8,-7l-8.5,-2l-13.5,-1.3Z" },
    "TR17": { name: "Çanakkale", d: "M130.5,85.8l-8.2,0.5l-9.8,9.5l3.2,7.2l-10.5,5l-4.3,10.5l6.3,3l8.8,-2.5l5.2,-8.5l13.5,-0.5l4.2,-7l-3,-9.2l-5.4,-8Z" },
    "TR18": { name: "Çankırı", d: "M355.8,82.5l-7.5,5l2.8,7.2l-5.5,6l0.8,6.8l8.8,4.5l12.2,-1.8l4,-7l10.5,3l3,-7.5l-4.8,-6.2l-1,-7.5l-10,0.8l-13.3,-3.3Z" },
    "TR19": { name: "Çorum", d: "M393.2,93.5l-7.5,2.3l-3.3,8.8l4.3,6.8l-2.3,6l11.5,0.3l8,-6.8l11.8,1.5l6,-8.5l-2.3,-7.8l-8.2,-3l-10.3,1l-7.7,-0.6Z" },
    "TR20": { name: "Denizli", d: "M218.5,202.8l-5.2,4l-12.8,0.5l-3.5,8l5.5,10l9.5,3.5l11,-2.5l5.5,-6.5l10.8,0.8l-1.2,-8.5l-6.5,-5l-4.6,-4l-8.5,0Z" },
    "TR21": { name: "Diyarbakır", d: "M553.8,195.5l-7.2,2.5l-3,8.8l-10.2,0.5l-5.5,6.3l7.2,9.5l0.5,7.2l7.8,-0.5l8.8,5.5l7.5,-1.8l5.8,-7.2l10.2,-1.8l-2,-8.5l-4.2,-6l5.8,-8.8l-5.8,-4l-8.5,-0.5l-7.2,-1.2Z" },
    "TR22": { name: "Edirne", d: "M150.5,35.5l-12.5,5l-2.8,8.5l4.5,5.8l-5.5,7.2l7.2,4l11.5,-2l3.5,-7.5l8.5,0.5l3,-8.8l-6,-6.5l-11.4,-6.2Z" },
    "TR23": { name: "Elazığ", d: "M520.5,165.5l-10.2,1.2l-5.5,5.2l3.2,9.5l-4.5,5.8l5,8.5l11,0.5l5.8,-5l12.2,1l3,-7l-3.5,-7.2l-6,-8.5l-10.5,-3Z" },
    "TR24": { name: "Erzincan", d: "M540.8,127.2l-7.2,5.8l-1.5,9.2l6.8,5.5l-3.2,8.2l8.8,6l11.5,-4.5l4.8,4.2l8.5,-6l-0.5,-8.2l4.2,-5.5l-4.5,-6.8l-9.2,0l-9.5,-5l-9,1.1Z" },
    "TR25": { name: "Erzurum", d: "M590.8,100.5l-5.5,5.5l-10.2,-2l-5.8,6.8l5.8,7.8l-4,6l5.5,5.5l12.8,-2l9,6.2l11.2,-1l1.2,-5.5l8.8,-0.5l3.2,-7.5l-1.2,-8.5l-11,-4.5l-7.5,-8l-12.3,1.7Z" },
    "TR26": { name: "Eskişehir", d: "M272.5,117.5l-7.5,5l-7.8,-3.8l-5.2,5.3l4.5,8.5l-2.8,9.5l7.2,0.5l4.5,6l12.2,0.2l7.2,-8.5l-0.3,-6l-6.5,-5.7l0.8,-6.5l-6.3,-4.5Z" },
    "TR27": { name: "Gaziantep", d: "M478.8,251.5l-7.5,3.2l-3,7.5l2.3,5.5l12.8,0.3l6.5,-3l8.5,3.5l4.5,-5.5l-3.5,-8.5l-6.2,-1.5l-4.8,3l-9.6,-4.5Z" },
    "TR28": { name: "Giresun", d: "M481.8,84.5l-10.5,3.5l-1.2,7.8l6.8,3l-1.5,7l7.5,2.8l9.5,-4l6.2,-7.3l-3.5,-7.5l-13.3,-5.3Z" },
    "TR29": { name: "Gümüşhane", d: "M530.5,86.8l-7.5,4.5l-2.5,7.2l6.5,4.5l-2,7l8.2,3.5l10.5,-4.8l4.8,-7l-3.2,-7.2l-6.8,-5l-8,-2.7Z" },
    "TR30": { name: "Hakkari", d: "M695.8,210.5l-6.2,6l-9.5,-0.5l-4,8.8l6,6.5l1.8,9.2l11.5,-0.3l7.2,-9.8l1.2,-10.2l-3.5,-6l-4.5,-3.7Z" },
    "TR31": { name: "Hatay", d: "M448.5,295.8l-6.8,3l-0.5,12l5,8.5l3.2,11.2l7.5,3.8l4.5,-5.8l-2.5,-10.5l4,-9.5l-5.2,-9.5l-9.2,-3.2Z" },
    "TR32": { name: "Isparta", d: "M276.2,195.5l-8.5,5.8l-2.2,8.8l5.2,7.5l-4.8,7.3l9.2,4.5l12.5,-5.3l3.5,-8.5l-1.2,-9.5l-5.7,-8.1l-8,-2.5Z" },
    "TR33": { name: "Mersin", d: "M382.2,270.8l-12.2,1.5l-9.8,6l-8,-1.5l-9.5,7l2.8,8.2l7.2,0.5l8.2,-5.5l11.5,2l12.5,-1.5l5,-8.5l-2.2,-6l-5.5,-2.2Z" },
    "TR34": { name: "İstanbul", d: "M202.5,62.5l-7.5,2.8l-2.5,7.8l6.2,6l-4.5,6.3l9.5,1.2l8.2,-4l0.5,-6.8l4.8,-4.5l-4.5,-5.8l-10.2,-3Z" },
    "TR35": { name: "İzmir", d: "M145.8,148.5l-11.5,0.2l-7.5,6.8l-3.2,12.5l7.5,5.2l-5.2,9.5l2,6.5l10.5,2l7.5,-7l-2,-8.8l5.5,-6.5l-0.5,-10l5,-7l-8.1,-3.4Z" },
    "TR36": { name: "Kars", d: "M654.2,75.5l-6.2,5.5l-0.5,10l5.5,5.5l-4.2,6.5l7.5,7.5l10,1.5l6.8,-5l5.8,4.3l8.2,-4.8l-0.5,-8.5l4.5,-6.3l-6.2,-8l-9,-1l-9,-3.7l-12.7,-3.5Z" },
    "TR37": { name: "Kastamonu", d: "M375.5,52.8l-13.5,4.5l-3.5,7.2l5.8,5.8l-3.8,8l10,4.5l13,-1.5l4.2,-7.5l11.8,0.2l4.5,-6.5l-5.5,-6.5l-9.8,-2.5l-13.2,-5.7Z" },
    "TR38": { name: "Kayseri", d: "M415.8,170.8l-8.5,3.5l-5.5,9.2l7.2,6.5l-1.5,8.5l10.5,5.8l12.8,-3.5l8.2,-8.5l-1.8,-9.2l-6.5,-6.5l1.8,-6l-9,-2.3l-7.7,2.5Z" },
    "TR39": { name: "Kırklareli", d: "M170.8,40.5l-6.8,4.2l-3.5,9l5.2,5.8l-3.2,8.2l11.2,1.5l9.8,-5.8l-1.5,-7.5l6,-5.5l-4.5,-6l-12.7,-3.9Z" },
    "TR40": { name: "Kırşehir", d: "M380.5,149.8l-9.2,3.2l-4.5,7.8l6.5,6.5l-2.8,6.5l8.2,3.5l10.2,-4l2.5,-7.5l-2.8,-9.5l-8.1,-6.5Z" },
    "TR41": { name: "Kocaeli", d: "M232.5,72.8l-7.8,3.5l-0.5,8.5l7.5,3l4.2,-4.5l10.5,1l0.5,-5.8l-5.2,-3.5l-9.2,-2.2Z" },
    "TR42": { name: "Konya", d: "M325.2,196.5l-11.5,2.5l-8.2,8.5l3.2,9.5l-8,8.8l7.5,5.2l0.5,8.5l11.5,2l11.2,-6l7.2,3.5l8.8,-8l-2.5,-10.5l5,-7.8l-4.5,-5.5l-8.7,-4l-3.5,-6l-8,-0.7Z" },
    "TR43": { name: "Kütahya", d: "M235.8,131.5l-7.5,2.8l-5.5,8.2l4.8,7.5l-3.5,8l6.5,2.5l10.8,-1.5l6.5,-7l12.2,-0.8l-1.8,-6.8l-6,-6.5l-2,-6.2l-14.5,-0.2Z" },
    "TR44": { name: "Malatya", d: "M488.2,177.5l-9.2,4.5l-3.8,7.5l5.5,5.5l-3.8,8.8l8.5,4.5l11.5,-3l4.8,-7.5l8.2,0.5l0.8,-7.8l-7.2,-6.5l-6.5,0.5l-8.8,-6.5Z" },
    "TR45": { name: "Manisa", d: "M175.8,142.8l-9.2,2.2l-4.8,7.2l5,7.5l-3.2,6l7.8,2l9,-3.8l9,3.2l4,-6.5l-1.5,-7.5l-6,-6.3l-10.1,-4Z" },
    "TR46": { name: "Kahramanmaraş", d: "M455.5,220.8l-8.5,5.5l-4.2,9l7.5,6l-2.2,8.5l10.2,3.2l10.2,-5l2.5,-9.5l8,-2.8l-4.5,-8.2l-10,-4.7l-9,-2Z" },
    "TR47": { name: "Mardin", d: "M575.8,230.5l-9.5,3.5l-3.2,8l6.5,5.8l-2.5,6l10,2.2l12,-4.5l5.2,-7l-3.5,-7.5l-6.5,-4l-8.5,-2.5Z" },
    "TR48": { name: "Muğla", d: "M195.2,231.8l-11.5,1.2l-8.2,9.5l-9.5,-2.5l-4.8,8l5.5,8.2l0.5,10l8.2,2.2l9.5,-5.5l10.8,-0.5l4.8,-8l-1.5,-9.5l-3.8,-13.1Z" },
    "TR49": { name: "Muş", d: "M599.5,158.5l-8.2,3.5l-4.5,8l6.5,7.2l-2.5,6.8l9.2,2l9,-4.5l4.2,-8.8l-3.2,-7.5l-10.5,-6.7Z" },
    "TR50": { name: "Nevşehir", d: "M390.8,185.8l-7.5,4.5l-1.2,8.5l5.5,5l-2.5,7l8.8,1.8l8.5,-5.5l-0.5,-8.5l-3.5,-7l-7.6,-5.8Z" },
    "TR51": { name: "Niğde", d: "M402.8,212.5l-9.5,4l-2.5,9l6.8,7.2l-1.8,8l10.5,0.5l8,-6.5l-0.8,-9.2l-4,-8.5l-6.7,-4.5Z" },
    "TR52": { name: "Ordu", d: "M455.5,77.8l-10,4.5l-2.8,8l6.2,4.5l-1.5,6.2l8.2,3.5l11.5,-3.8l4.5,-7l-2.8,-7.5l-5.8,-5.9l-7.5,-2.5Z" },
    "TR53": { name: "Rize", d: "M580.2,58.8l-8.5,4.5l-2,8.2l6.5,5.5l-2.5,6.5l9.8,3.2l10,-5l3.5,-7.8l-3.8,-7.5l-5.5,-5l-7.5,-2.6Z" },
    "TR54": { name: "Sakarya", d: "M260.2,77.8l-7.2,3l-3.5,7.5l5.5,5.2l-2.5,6.5l8.5,2.5l9.5,-4.2l3.2,-6.8l-3.2,-7.2l-10.3,-6.5Z" },
    "TR55": { name: "Samsun", d: "M427.5,68.5l-10.5,4l-3.5,8.2l6.5,5.5l-2.2,7l9.8,3.5l11.8,-4.8l4.2,-7.5l-3.5,-7.5l-5.5,-5.4l-7.1,-3Z" },
    "TR56": { name: "Siirt", d: "M620.2,195.8l-7.2,5l-3.8,8l6,6l-2,7.2l8.5,2.5l9.5,-4l3.8,-7.5l-2.5,-8l-5.8,-6.2l-6.5,-3Z" },
    "TR57": { name: "Sinop", d: "M405.2,50.2l-8.8,5.5l-2.2,8.5l6,5l-2.5,6.8l8.8,4l11,-3.8l4.5,-7.2l-3,-7.8l-5.8,-6l-8,-5Z" },
    "TR58": { name: "Sivas", d: "M478.8,125.5l-11.2,4.5l-5.2,9.8l7.8,7.2l-3.5,9l10.8,5.8l14.2,-4l6.8,-9.2l-1.5,-10l-5.8,-7l2.5,-5.6l-15,-0.5Z" },
    "TR59": { name: "Tekirdağ", d: "M168.2,55.8l-7.8,4l-3.2,8l6,5.5l-2.8,6.5l9.2,3l10,-4.2l3.5,-7l-3.2,-7.8l-4.8,-5.5l-6.9,-2.5Z" },
    "TR60": { name: "Tokat", d: "M458.5,105.5l-9.5,4.8l-3.5,8.5l6.8,6l-2.8,7.2l10.2,4.5l12,-4l5,-8l-2.2,-8.2l-6.2,-6.3l-9.8,-4.5Z" },
    "TR61": { name: "Trabzon", d: "M550.8,62.8l-10,5l-2.5,8.5l7,5.8l-2.2,7l10,3.8l11.5,-4.5l4,-7.5l-3.5,-7.8l-6.2,-6.3l-8.1,-4Z" },
    "TR62": { name: "Tunceli", d: "M545.8,152.8l-8.5,4l-4,8.8l6.2,6.5l-2.2,7.2l9.5,3.2l10.2,-4.5l4,-8.2l-3,-7.8l-5.5,-5.7l-6.7,-3.5Z" },
    "TR63": { name: "Şanlıurfa", d: "M530.8,245.5l-11.2,4l-5.5,10l8,7.2l-2.5,8.5l12,3.8l13.5,-5.5l5.5,-10l-3.8,-9.5l-7,-6l-9,-2.5Z" },
    "TR64": { name: "Uşak", d: "M225.2,165.8l-8.8,3.5l-4,8.2l6,6.5l-2.5,7.2l9,3l10.5,-4.5l3.5,-8l-2.5,-8.2l-5.2,-5.2l-6,-2.5Z" },
    "TR65": { name: "Van", d: "M665.5,158.5l-9.2,5l-4.5,10l7.5,8l-3,8.5l11,4l13,-5.5l6,-10l-4,-10l-7.3,-7.5l-9.5,-2.5Z" },
    "TR66": { name: "Yozgat", d: "M408.5,130.8l-10.2,4l-4.2,9l7,6.8l-2.8,7.5l10.5,4.2l12.2,-4.8l4.8,-8.5l-2.5,-8.7l-6.2,-6l-8.6,-3.5Z" },
    "TR67": { name: "Zonguldak", d: "M318.5,58.8l-9.5,4.5l-3,8.2l6.5,5.8l-2.2,7l9.5,3.5l11,-4.2l4,-7.5l-3.2,-7.5l-5.5,-6l-7.6,-3.8Z" },
    "TR68": { name: "Aksaray", d: "M370.5,185.5l-9,4l-3.5,8.5l6.5,6.2l-2.5,7.5l9.5,3.2l11,-4.5l4,-8.2l-2.8,-8l-5.7,-6l-7.5,-2.7Z" },
    "TR69": { name: "Bayburt", d: "M575.5,90.8l-8.2,4.5l-3.2,8l6.2,6l-2.5,6.8l9,3l10.2,-4.2l3.8,-7.5l-2.8,-7.6l-5.5,-5.5l-7,-3.5Z" },
    "TR70": { name: "Karaman", d: "M352.5,228.5l-9.5,4.2l-3.8,8.8l6.8,6.5l-2.5,7.8l10,3.5l11.5,-5l4.2,-8.5l-3,-8.3l-6,-6l-7.7,-3Z" },
    "TR71": { name: "Kırıkkale", d: "M365.2,130.5l-8.5,3.8l-3.5,7.8l6,5.8l-2.2,6.8l8.8,3.2l10,-4l3.2,-7.2l-2.5,-7.5l-5,-5.7l-6.3,-3Z" },
    "TR72": { name: "Batman", d: "M590.2,205.5l-8.5,4l-3.8,8.2l6.2,6.2l-2.5,7l9.5,3.2l10.5,-4.5l4,-8l-3,-7.6l-5.5,-5.5l-6.9,-3Z" },
    "TR73": { name: "Şırnak", d: "M640.5,220.5l-9,4.2l-4,8.5l6.5,6.5l-2.5,7.5l10,3.5l11.2,-5l4.2,-8.5l-3.2,-8.2l-6,-6l-7.2,-2.5Z" },
    "TR74": { name: "Bartın", d: "M340.2,52.5l-8.5,4l-3.2,7.8l5.8,5.5l-2.2,6.5l8.5,3l9.8,-4l3.5,-7l-2.5,-7.3l-5,-5.5l-6.2,-3Z" },
    "TR75": { name: "Ardahan", d: "M650.2,55.5l-8,4.2l-3.5,8l6,5.8l-2.5,6.8l9,3.2l10.2,-4.5l4,-7.5l-3,-7.5l-5.5,-5.5l-6.7,-3Z" },
    "TR76": { name: "Iğdır", d: "M702.5,105.5l-7.5,4.5l-3.2,7.5l5.8,5.5l-2.2,6.5l8.5,2.8l9.5,-4l3.5,-7l-2.5,-7.3l-5.2,-5.5l-6.7,-3Z" },
    "TR77": { name: "Yalova", d: "M210.2,80.5l-5.5,3l-2.2,5.5l4.2,4l-1.5,4.5l6,2l7,-3l2.5,-5l-2,-5.5l-3.5,-3.5l-5,-2Z" },
    "TR78": { name: "Karabük", d: "M340.5,70.5l-8,3.8l-3,7.2l5.5,5.2l-2.2,6.2l8,2.8l9.2,-3.8l3.2,-6.5l-2.2,-7l-4.8,-5.2l-5.7,-2.7Z" },
    "TR79": { name: "Kilis", d: "M485.2,270.5l-6.5,3.5l-2.5,6.5l4.8,5l-1.8,5.5l7,2l8,-3.5l2.5,-5.8l-2,-6l-4,-4.7l-5.5,-2.5Z" },
    "TR80": { name: "Osmaniye", d: "M445.5,255.5l-7.5,4l-3,7.5l5.5,5.5l-2,6.5l8,2.5l9.2,-3.8l3.2,-6.8l-2.2,-7l-4.7,-5.4l-6.5,-3Z" },
    "TR81": { name: "Düzce", d: "M288.5,75.5l-7.2,3.5l-2.8,6.8l5.2,5l-2,6l7.5,2.5l8.5,-3.5l3,-6.2l-2.2,-6.6l-4.5,-4.8l-5.5,-2.7Z" }
  };
  
  let paths = '';
  for (const [kod, data] of Object.entries(ilPaths)) {
    paths += `<path id="${kod}" class="il-path" d="${data.d}" data-name="${data.name}" />`;
  }
  return paths;
}

// Harita eventlerini başlat
function initHaritaEvents() {
  const paths = document.querySelectorAll('.il-path');
  const tooltip = document.getElementById('haritaTooltip');
  
  paths.forEach(path => {
    // Hover tooltip
    path.addEventListener('mouseenter', (e) => {
      const name = path.dataset.name;
      const kod = path.id;
      const ortalamaPuan = getSehirOrtalamaPuan(kod);
      
      tooltip.innerHTML = ortalamaPuan > 0 
        ? `${name} <span class="tooltip-puan">⭐ ${ortalamaPuan.toFixed(1)}</span>`
        : name;
      tooltip.classList.add('visible');
    });
    
    path.addEventListener('mousemove', (e) => {
      tooltip.style.left = e.pageX + 15 + 'px';
      tooltip.style.top = e.pageY + 15 + 'px';
    });
    
    path.addEventListener('mouseleave', () => {
      tooltip.classList.remove('visible');
    });
    
    // Tıklama
    path.addEventListener('click', () => {
      openSehirModal(path.id, path.dataset.name);
    });
  });
}

// Date yıldız rating eventleri
function initDateStarRating() {
  const container = document.getElementById('dateStarRating');
  if (!container) return;
  
  const stars = container.querySelectorAll('.star');
  
  stars.forEach(star => {
    star.addEventListener('click', () => {
      const value = parseInt(star.dataset.value);
      document.getElementById('datePuan').value = value;
      
      stars.forEach((s, index) => {
        if (index < value) {
          s.textContent = '★';
          s.classList.add('filled');
        } else {
          s.textContent = '☆';
          s.classList.remove('filled');
        }
      });
    });
  });
}

// Firebase'den places yükle
async function loadPlacesFromFirebase() {
  await waitForFirebase();
  
  try {
    const db = window.firebaseDb;
    const placesQuery = window.firestoreQuery(
      window.firestoreCollection(db, 'places'),
      window.firestoreOrderBy('createdAt', 'desc')
    );
    
    const snapshot = await window.firestoreGetDocs(placesQuery);
    
    placesCache = [];
    snapshot.forEach(doc => {
      placesCache.push({ id: doc.id, ...doc.data() });
    });
    
    updateHaritaColors();
    updateZiyaretSayisi();
    
  } catch (error) {
    console.error('Places yüklenirken hata:', error);
  }
}

// Harita renklerini güncelle
function updateHaritaColors() {
  const paths = document.querySelectorAll('.il-path');
  
  paths.forEach(path => {
    const kod = path.id;
    const ortalamaPuan = getSehirOrtalamaPuan(kod);
    
    if (ortalamaPuan > 0) {
      path.style.fill = getPuanColor(ortalamaPuan);
      path.classList.add('visited');
    } else {
      path.style.fill = '';
      path.classList.remove('visited');
    }
  });
}

// Ziyaret sayısını güncelle
function updateZiyaretSayisi() {
  const ziyaretEdilenSehirler = new Set(placesCache.map(p => p.sehir));
  const sayiEl = document.getElementById('ziyaretSayisi');
  if (sayiEl) {
    sayiEl.textContent = `${ziyaretEdilenSehirler.size} şehir ziyaret edildi`;
  }
}

// Şehir modalı aç
function openSehirModal(sehirKodu, sehirAdi) {
  selectedCity = sehirKodu;
  
  document.getElementById('sehirModalTitle').textContent = `📍 ${sehirAdi}`;
  document.getElementById('dateSehirKodu').value = sehirKodu;
  
  // Önceki date'leri listele
  const sehirPlaces = placesCache.filter(p => p.sehir === sehirKodu);
  const dateListEl = document.getElementById('dateList');
  const oncekiDatelerEl = document.getElementById('oncekiDateler');
  
  if (sehirPlaces.length === 0) {
    oncekiDatelerEl.style.display = 'none';
  } else {
    oncekiDatelerEl.style.display = 'block';
    dateListEl.innerHTML = sehirPlaces.map(place => `
      <div class="date-item">
        <div class="date-item-header">
          <span class="date-item-title">💕 ${place.baslik}</span>
          <button class="btn-date-sil" onclick="deletePlace('${place.id}')" title="Sil">×</button>
        </div>
        <div class="date-item-meta">
          <span>📅 ${formatDateTarih(place.tarih)}</span>
          <span>⭐ ${place.puan}/5</span>
        </div>
        ${place.not ? `<p class="date-item-not">${place.not}</p>` : ''}
        ${place.fotoUrl ? `<img src="${place.fotoUrl}" class="date-item-foto" alt="">` : ''}
      </div>
    `).join('');
  }
  
  // Formu sıfırla
  document.getElementById('dateBaslik').value = '';
  document.getElementById('dateTarih').value = new Date().toISOString().split('T')[0];
  document.getElementById('datePuan').value = 0;
  document.getElementById('dateNot').value = '';
  document.getElementById('dateFoto').value = '';
  document.querySelectorAll('#dateStarRating .star').forEach(s => {
    s.textContent = '☆';
    s.classList.remove('filled');
  });
  
  document.getElementById('sehirModal').classList.add('active');
}

function closeSehirModal() {
  document.getElementById('sehirModal').classList.remove('active');
  selectedCity = null;
}

// Date ekle
async function handleDateEkle(e) {
  e.preventDefault();
  
  const sehirKodu = document.getElementById('dateSehirKodu').value;
  const baslik = document.getElementById('dateBaslik').value.trim();
  const tarih = document.getElementById('dateTarih').value;
  const puan = parseInt(document.getElementById('datePuan').value) || 0;
  const not = document.getElementById('dateNot').value.trim();
  const fotoUrl = document.getElementById('dateFoto').value.trim();
  
  if (!baslik || !tarih || puan === 0) {
    alert('Lütfen başlık, tarih ve puan giriniz!');
    return;
  }
  
  await waitForFirebase();
  
  try {
    const db = window.firebaseDb;
    const docRef = await window.firestoreAddDoc(
      window.firestoreCollection(db, 'places'),
      {
        sehir: sehirKodu,
        sehirAdi: illerData[sehirKodu] || sehirKodu,
        baslik: baslik,
        tarih: tarih,
        puan: puan,
        not: not || null,
        fotoUrl: fotoUrl || null,
        createdAt: window.firestoreServerTimestamp()
      }
    );
    
    placesCache.unshift({
      id: docRef.id,
      sehir: sehirKodu,
      sehirAdi: illerData[sehirKodu] || sehirKodu,
      baslik: baslik,
      tarih: tarih,
      puan: puan,
      not: not || null,
      fotoUrl: fotoUrl || null
    });
    
    closeSehirModal();
    updateHaritaColors();
    updateZiyaretSayisi();
    
    console.log('📍 Date eklendi:', baslik);
  } catch (error) {
    console.error('Date eklenirken hata:', error);
    alert('Date eklenirken hata oluştu!');
  }
}

// Place sil
async function deletePlace(placeId) {
  if (!confirm('Bu date kaydını silmek istediğinize emin misiniz?')) return;
  
  try {
    await waitForFirebase();
    const db = window.firebaseDb;
    await window.firestoreDeleteDoc(window.firestoreDoc(db, 'places', placeId));
    
    placesCache = placesCache.filter(p => p.id !== placeId);
    
    updateHaritaColors();
    updateZiyaretSayisi();
    
    // Modalı yeniden aç
    if (selectedCity) {
      openSehirModal(selectedCity, illerData[selectedCity]);
    }
    
    console.log('🗑️ Date silindi');
  } catch (error) {
    console.error('Date silinirken hata:', error);
  }
}

// Tarih formatla
function formatDateTarih(tarih) {
  if (!tarih) return '-';
  const d = new Date(tarih);
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Zoom fonksiyonları
function zoomIn() {
  if (currentZoom < 3) {
    currentZoom += 0.3;
    applyZoom();
  }
}

function zoomOut() {
  if (currentZoom > 0.5) {
    currentZoom -= 0.3;
    applyZoom();
  }
}

function resetZoom() {
  currentZoom = 1;
  applyZoom();
}

function applyZoom() {
  const haritaInner = document.getElementById('haritaInner');
  if (haritaInner) {
    haritaInner.style.transform = `scale(${currentZoom})`;
  }
}

// Global fonksiyonlar - Harita
window.openSehirModal = openSehirModal;
window.closeSehirModal = closeSehirModal;
window.handleDateEkle = handleDateEkle;
window.deletePlace = deletePlace;
window.zoomIn = zoomIn;
window.zoomOut = zoomOut;
window.resetZoom = resetZoom;

/* ============================================
   TAKVİM SAYFASI - 2026'DA GÜNLERİMİZ
   ============================================ */

// Takvim state
let currentCalendarMonth = new Date().getMonth(); // 0-11
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
  
  // Bugünün ayını başlangıç olarak al
  const bugun = new Date();
  if (bugun.getFullYear() === 2026) {
    currentCalendarMonth = bugun.getMonth();
  } else {
    currentCalendarMonth = 0; // 2026 değilse Ocak'tan başla
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
      <div class="takvim-grid" id="takvimGrid">
        <!-- Günler buraya render edilecek -->
      </div>
      
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
  
  // Firebase'den verileri yükle ve takvimi render et
  await loadCalendarFromFirebase();
  renderCalendar();
}

// Takvimi render et
function renderCalendar() {
  const grid = document.getElementById('takvimGrid');
  const baslikEl = document.getElementById('takvimAyBaslik');
  
  if (!grid) return;
  
  baslikEl.textContent = `${aylar[currentCalendarMonth]} ${currentCalendarYear}`;
  
  // Ayın ilk günü ve gün sayısı
  const ilkGun = new Date(currentCalendarYear, currentCalendarMonth, 1);
  const sonGun = new Date(currentCalendarYear, currentCalendarMonth + 1, 0);
  const gunSayisi = sonGun.getDate();
  
  // İlk günün haftanın hangi günü olduğu (Pazartesi = 0)
  let baslangicGunu = ilkGun.getDay() - 1;
  if (baslangicGunu < 0) baslangicGunu = 6; // Pazar için
  
  // Bugünün tarihi
  const bugun = new Date();
  const bugunStr = `${bugun.getFullYear()}-${String(bugun.getMonth() + 1).padStart(2, '0')}-${String(bugun.getDate()).padStart(2, '0')}`;
  
  let html = '';
  
  // Boş hücreler (ayın başındaki)
  for (let i = 0; i < baslangicGunu; i++) {
    html += '<div class="takvim-gun bos"></div>';
  }
  
  // Günler
  for (let gun = 1; gun <= gunSayisi; gun++) {
    const tarih = `${currentCalendarYear}-${String(currentCalendarMonth + 1).padStart(2, '0')}-${String(gun).padStart(2, '0')}`;
    const gunData = calendarCache[tarih] || { bahar: 'bos', baran: 'bos' };
    const baharRenk = duygular[gunData.bahar]?.renk || duygular.bos.renk;
    const baranRenk = duygular[gunData.baran]?.renk || duygular.bos.renk;
    
    const bugunMu = tarih === bugunStr;
    const gecmisMi = new Date(tarih) < new Date(bugunStr);
    const gelecekMi = new Date(tarih) > new Date(bugunStr);
    
    // Gelecek günlere tıklanamaz
    const clickHandler = gelecekMi ? '' : `onclick="openDuygularModal('${tarih}')"`;    const cursorClass = gelecekMi ? 'gelecek' : '';
    
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
  
  // Mevcut seçimleri işaretle
  const gunData = calendarCache[tarih] || { bahar: 'bos', baran: 'bos' };
  
  // Tüm seçimleri temizle
  document.querySelectorAll('.duygu-btn').forEach(btn => btn.classList.remove('selected'));
  
  // Mevcut seçimleri işaretle
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
  // Aynı kişinin diğer butonlarından seçimi kaldır
  document.querySelectorAll(`.duygu-btn[data-kisi="${kisi}"]`).forEach(btn => {
    btn.classList.remove('selected');
  });
  
  // Eğer "bos" seçildiyse hiçbir butonu seçme (temizle)
  // Değilse bu butonu seç
  if (duygu !== 'bos') {
    const btn = document.querySelector(`.duygu-btn[data-kisi="${kisi}"][data-duygu="${duygu}"]`);
    if (btn) btn.classList.add('selected');
  }
}

// Duyguları kaydet
async function saveDuygular() {
  const tarih = document.getElementById('selectedDate').value;
  
  // Seçili duyguları al
  const baharBtn = document.querySelector('.duygu-btn[data-kisi="bahar"].selected');
  const baranBtn = document.querySelector('.duygu-btn[data-kisi="baran"].selected');
  
  const baharDuygu = baharBtn ? baharBtn.dataset.duygu : 'bos';
  const baranDuygu = baranBtn ? baranBtn.dataset.duygu : 'bos';
  
  // Eğer her ikisi de boşsa ve daha önce kayıt yoksa, sadece kapat
  const mevcutKayit = calendarCache[tarih];
  if (baharDuygu === 'bos' && baranDuygu === 'bos' && !mevcutKayit) {
    closeDuygularModal();
    return;
  }
  
  await waitForFirebase();
  
  try {
    const db = window.firebaseDb;
    
    // Tarih ID olarak kullan
    await window.firestoreSetDoc(
      window.firestoreDoc(db, 'calendar', tarih),
      {
        bahar: baharDuygu,
        baran: baranDuygu,
        updatedAt: window.firestoreServerTimestamp()
      }
    );
    
    // Cache güncelle
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
window.oncekiAy = oncekiAy;
window.sonrakiAy = sonrakiAy;
window.openDuygularModal = openDuygularModal;
window.closeDuygularModal = closeDuygularModal;
window.selectDuygu = selectDuygu;
window.saveDuygular = saveDuygular;

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
  
  // Gün seçenekleri oluştur
  let gunOptions = '';
  for (let i = 1; i <= 31; i++) {
    gunOptions += `<option value="${i}">${i}</option>`;
  }
  
  // Yıl seçenekleri oluştur (2015'ten bu yıla kadar)
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
  
  // Form event listener
  document.getElementById('ozelGunForm').addEventListener('submit', handleOzelGunSubmit);
  
  // Özel günleri yükle
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
  
  // Özel günleri sırala (yaklaşan önce)
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
        <p class="ozel-gun-tarih">${formatTarih(gun.baseDate)}</p>
        
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
  
  // Eğer bu yılki kutlama geçtiyse, gelecek yılı hesapla
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
  
  // Eğer bu yılki kutlama henüz gelmediyse
  const buYilKutlama = new Date(bugun.getFullYear(), base.getMonth(), base.getDate());
  if (bugun < buYilKutlama) {
    yilFark -= 1;
  }
  
  return yilFark + 1; // +1 çünkü ilk yıl da sayılır
}

// Detaylı geri sayım hesapla
function hesaplaDetayliGeriSayim(baseDate) {
  const simdi = new Date();
  const base = new Date(baseDate);
  
  // Sonraki kutlama tarihini bul
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
function formatTarih(dateStr) {
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
  
  // Tarihi ISO formatında oluştur (YYYY-MM-DD)
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
    
    // Formu temizle
    document.getElementById('ozelGunForm').reset();
    
    // Listeyi yenile
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
    
    // Listeyi yenile
    await loadOzelGunler();
    
    console.log(`🗑️ Özel gün silindi: ${id}`);
  } catch (error) {
    console.error('Özel gün silinirken hata:', error);
    alert('Silme işlemi başarısız!');
  }
}

// Kutlama animasyonu
function showKutlamaAnimation() {
  const confetti = document.createElement('div');
  confetti.className = 'kutlama-confetti';
  confetti.innerHTML = `
    <div class="confetti-inner">
      🎉🎊💕✨🎉🎊💕✨🎉🎊
    </div>
  `;
  document.body.appendChild(confetti);
  
  setTimeout(() => {
    confetti.remove();
  }, 3000);
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
  const gecenYilSayisi = kacinciKutlama - 1; // Kaç yıl geçti
  
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
  
  // Canlı sayaç başlat (eğer bugün değilse)
  if (!bugun) {
    startDetayCountdown(gun.baseDate);
  }
}

// Detay modalını kapat
function closeOzelGunModal() {
  const modal = document.getElementById('ozelGunModal');
  modal.classList.remove('active');
  
  // Sayacı durdur
  if (detayInterval) {
    clearInterval(detayInterval);
    detayInterval = null;
  }
}

// Detay sayacını başlat
function startDetayCountdown(baseDate) {
  // Önceki interval'i temizle
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
  // Önceki interval'i temizle
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
  }, 60000); // Her dakika güncelle
}

// Global fonksiyonlar - Özel Günler
window.openOzelGunDetay = openOzelGunDetay;
window.closeOzelGunModal = closeOzelGunModal;
window.silOzelGun = silOzelGun;

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
  
  // Kategori seçenekleri oluştur
  let kategoriOptions = bucketKategoriler.map(k => 
    `<option value="${k.id}">${k.icon} ${k.ad}</option>`
  ).join('');
  
  // Filtre butonları oluştur
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
  
  // Event listeners
  document.getElementById('bucketForm').addEventListener('submit', handleBucketSubmit);
  
  // Filtre butonları
  document.querySelectorAll('.bucket-filtre-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const filtre = btn.dataset.filtre;
      
      // Kategori filtresi mi durum filtresi mi?
      if (bucketKategoriler.find(k => k.id === filtre)) {
        // Kategori filtresi - toggle
        if (bucketFiltre === filtre) {
          bucketFiltre = 'hepsi';
          btn.classList.remove('active');
        } else {
          document.querySelectorAll('.kategori-btn').forEach(b => b.classList.remove('active'));
          bucketFiltre = filtre;
          btn.classList.add('active');
        }
      } else {
        // Durum filtresi
        document.querySelectorAll('.durum-filtre .bucket-filtre-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        bucketFiltre = filtre;
      }
      
      renderBucketList();
    });
  });
  
  // Verileri yükle
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
  
  // Filtreleme
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
  
  // İstatistik çubuğu
  const statsBar = document.getElementById('bucketStatsBar');
  if (statsBar) {
    // En çok tamamlanan kategori
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
  
  // İlerleme çubuğu
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
    
    // Formu temizle
    document.getElementById('bucketForm').reset();
    
    // Listeyi yenile
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
    
    // Kutlama animasyonu
    showBucketCelebration();
    
    // Listeyi yenile
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

// Hedef sil (sadece tamamlanmamış olanlar)
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
window.openBucketTamamlaModal = openBucketTamamlaModal;
window.closeBucketModal = closeBucketModal;
window.confirmBucketTamamla = confirmBucketTamamla;
window.silBucketHedef = silBucketHedef;
window.changeBucketSiralama = changeBucketSiralama;

/* ============================================
   ŞARKILAR SAYFASI
   Bazı şarkılar çalar, bazıları yaşanır...
   ============================================ */

// Şarkılar cache ve state değişkenleri
let sarkilarCache = [];
let sarkilarSiralama = 'yeni';

// Duygu etiketleri listesi
const duygularListesi = [
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
  
  // Duygu seçenekleri oluştur
  const duygularHTML = duygularListesi.map(d => `
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
  
  // Form event listener
  document.getElementById('sarkiForm').addEventListener('submit', handleSarkiSubmit);
  
  // Sıralama butonları event listener
  document.querySelectorAll('.siralama-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.siralama-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      sarkilarSiralama = btn.dataset.siralama;
      renderSarkilar();
    });
  });
  
  // Şarkıları yükle
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
  
  // Sıralama uygula
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
    // Duygu etiketlerini oluştur
    const duygularHTML = (sarki.emotions || []).map(duyguId => {
      const duygu = duygularListesi.find(d => d.id === duyguId);
      return duygu ? `<span class="duygu-badge">${duygu.emoji} ${duygu.ad}</span>` : '';
    }).join('');
    
    // Kişi ikonu
    const kisiIcon = sarki.addedBy === 'Baran' ? '👨' : sarki.addedBy === 'Bahar' ? '👩' : '💑';
    
    // Not önizleme (maksimum 60 karakter)
    const notOnizleme = sarki.note ? 
      (sarki.note.length > 60 ? sarki.note.substring(0, 60) + '...' : sarki.note) : '';
    
    // Ekleme tarihi formatla
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
  
  // Formu sıfırla
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
  
  // Seçilen duyguları al
  const seciliDuygular = [];
  document.querySelectorAll('input[name="duygular"]:checked').forEach(checkbox => {
    seciliDuygular.push(checkbox.value);
  });
  
  // Ortak puanı hesapla (yuvarlama ile)
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
    
    // Modalı kapat
    closeSarkiModal();
    
    // Listeyi yenile
    await loadSarkilar();
    
    console.log(`🎵 Yeni şarkı eklendi: ${sarkiAdi} - ${sanatci}`);
  } catch (error) {
    console.error('Şarkı eklenirken hata:', error);
    alert('Bir hata oluştu!');
  }
}

// Global fonksiyonlar - Şarkılar
window.openSarkiEkleModal = openSarkiEkleModal;
window.closeSarkiModal = closeSarkiModal;
window.updatePuanLabel = updatePuanLabel;
window.deleteSarki = deleteSarki;

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
    
    // Cache'den kaldır
    sarkilarCache = sarkilarCache.filter(s => s.id !== sarkiId);
    
    // Render
    renderSarkilar();
    
    console.log('🗑️ Şarkı silindi');
  } catch (error) {
    console.error('Şarkı silinirken hata:', error);
    alert('Silme işlemi başarısız!');
  }
}

/* ============================================
   BİZİM HİKÂYEMİZ SAYFASI
   İki kalp, tek yol... Mektup Sistemi
   ============================================ */

// Cache
let hikayemizCache = null;
let mektuplarCache = [];
let timelineCache = [];
let bugunMektuplar = { baran: null, bahar: null };

// Bugünün tarihi (YYYY-MM-DD format)
function getBugunTarih() {
  return new Date().toISOString().split('T')[0];
}

// Hikayemiz sayfasını yükle
async function loadHikayemizPage() {
  const pageContent = document.getElementById('pageContent');
  
  // Firebase'den verileri yükle
  await loadMektuplarFromFirebase();
  await loadTimelineFromFirebase();
  
  // Bugünün mektuplarını kontrol et
  const bugun = getBugunTarih();
  bugunMektuplar.baran = mektuplarCache.find(m => m.tarih === bugun && m.kisi === 'baran');
  bugunMektuplar.bahar = mektuplarCache.find(m => m.tarih === bugun && m.kisi === 'bahar');
  
  // 1 hafta öncesinin tarihi (arşiv için)
  const birHaftaOnceDate = new Date();
  birHaftaOnceDate.setDate(birHaftaOnceDate.getDate() - 7);
  const birHaftaOnce = birHaftaOnceDate.toISOString().split('T')[0];
  
  // Bildirim kontrolü - karşı tarafın mektubu var mı?
  setTimeout(() => {
    showMektupBildirim();
  }, 1500);
  
  pageContent.innerHTML = `
    <div class="hikayemiz-container">
      <!-- Sayfa Başlığı -->
      <div class="hikayemiz-header">
        <h1 class="hikayemiz-title">Bizim Hikâyemiz</h1>
        <p class="hikayemiz-subtitle">📮 Her gün birbirimize bıraktığımız mektuplar 📮</p>
        <div class="hikayemiz-divider"></div>
      </div>
      
      <!-- Mektup Kutuları -->
      <div class="mektup-kutulari">
        <!-- Baran'ın Mektup Kutusu (Bahar için) -->
        <div class="mektup-kutu baran-kutu">
          <div class="mektup-zarf">
            <div class="zarf-kapak"></div>
            <div class="zarf-govde">
              <span class="zarf-icon">💌</span>
            </div>
          </div>
          <h3 class="mektup-kutu-baslik">Baran'dan Mektup</h3>
          <p class="mektup-kutu-alt">👨 Bahar'a yazdığı</p>
          
          ${bugunMektuplar.baran ? `
            <div class="mektup-durum yazildi">
              <span class="durum-icon">📨</span>
              <span>Bugün mektup var!</span>
            </div>
            <button class="btn-mektup-oku" onclick="openMektupOkuModal('baran')">
              📖 Oku
            </button>
          ` : `
            <div class="mektup-durum yazilmadi">
              <span class="durum-icon">📭</span>
              <span>Bugün mektup yok</span>
            </div>
          `}
          
          <div class="mektup-yaz-kisim">
            <hr class="mektup-ayrac">
            <p class="mektup-yaz-baslik">✍️ Baran olarak yaz</p>
            ${!bugunMektuplar.baran ? `
              <button class="btn-mektup-yaz" onclick="openMektupModal('baran')">
                ✍️ Mektup Yaz
              </button>
            ` : `
              <span class="zaten-yazildi">✅ Bugün mektubunu bıraktın</span>
            `}
          </div>
        </div>
        
        <!-- Ortadaki Kalp -->
        <div class="mektup-baglanti">
          <span class="baglanti-kalp">💕</span>
        </div>
        
        <!-- Bahar'ın Mektup Kutusu (Baran için) -->
        <div class="mektup-kutu bahar-kutu">
          <div class="mektup-zarf">
            <div class="zarf-kapak"></div>
            <div class="zarf-govde">
              <span class="zarf-icon">💌</span>
            </div>
          </div>
          <h3 class="mektup-kutu-baslik">Bahar'dan Mektup</h3>
          <p class="mektup-kutu-alt">👩 Baran'a yazdığı</p>
          
          ${bugunMektuplar.bahar ? `
            <div class="mektup-durum yazildi">
              <span class="durum-icon">📨</span>
              <span>Bugün mektup var!</span>
            </div>
            <button class="btn-mektup-oku" onclick="openMektupOkuModal('bahar')">
              📖 Oku
            </button>
          ` : `
            <div class="mektup-durum yazilmadi">
              <span class="durum-icon">📭</span>
              <span>Bugün mektup yok</span>
            </div>
          `}
          
          <div class="mektup-yaz-kisim">
            <hr class="mektup-ayrac">
            <p class="mektup-yaz-baslik">✍️ Bahar olarak yaz</p>
            ${!bugunMektuplar.bahar ? `
              <button class="btn-mektup-yaz" onclick="openMektupModal('bahar')">
                ✍️ Mektup Yaz
              </button>
            ` : `
              <span class="zaten-yazildi">✅ Bugün mektubunu bıraktın</span>
            `}
          </div>
        </div>
      </div>
      
      <!-- İki Hikaye Tek Yol - Mektup Arşivi -->
      <div class="mektup-arsiv-section">
        <h3 class="arsiv-baslik">💕 İki Hikâye, Tek Yol</h3>
        <p class="arsiv-alt">Geçmiş mektupları okumak için bir tarih seç <em>(en az 1 hafta öncesi)</em></p>
        
        <div class="arsiv-tarih-sec">
          <input type="date" id="arsivTarih" max="${birHaftaOnce}" onchange="loadMektuplarByDate()">
        </div>
        
        <div class="arsiv-mektuplar" id="arsivMektuplar">
          <p class="arsiv-bos">Bir tarih seçerek mektupları görüntüleyin</p>
        </div>
      </div>
      
      <!-- Timeline -->
      <div class="hikaye-timeline">
        <div class="timeline-header">
          <h3 class="timeline-baslik">📍 Yolculuğumuz</h3>
          <button class="btn-timeline-ekle" onclick="openTimelineModal()">
            <span>+</span> Yeni An Ekle
          </button>
        </div>
        <div class="timeline-line" id="timelineContainer">
          <!-- Timeline öğeleri buraya yüklenecek -->
        </div>
      </div>
    </div>
    
    <!-- Mektup Yazma Modal -->
    <div class="modal-overlay" id="mektupModal">
      <div class="modal-content mektup-modal">
        <button class="btn-modal-close" onclick="closeMektupModal()">×</button>
        <div class="modal-header-mektup">
          <span class="modal-icon">💌</span>
          <h3>Bugünün Mektubu</h3>
        </div>
        
        <div class="mektup-uyari">
          <span class="uyari-icon">⚠️</span>
          <p>Günde sadece <strong>1 mektup</strong> yazabilirsin. Dikkatli ol! 💕</p>
        </div>
        
        <form id="mektupForm" onsubmit="handleMektupSubmit(event)">
          <input type="hidden" id="mektupKisi" value="">
          
          <div class="mektup-form-group">
            <div class="form-label-row">
              <label>💭 Bugün ona ne söylemek istersin?</label>
              <div class="emoji-picker-wrapper">
                <button type="button" class="emoji-trigger" onclick="toggleEmojiPicker(this)">😊</button>
                <div class="emoji-picker" id="emojiPicker_mektupIcerik">
                  <div class="emoji-category">
                    <div class="emoji-category-title">Duygular</div>
                    <div class="emoji-list">
                      <span class="emoji-item" onclick="insertEmoji('😊', 'mektupIcerik')">😊</span>
                      <span class="emoji-item" onclick="insertEmoji('😍', 'mektupIcerik')">😍</span>
                      <span class="emoji-item" onclick="insertEmoji('🥰', 'mektupIcerik')">🥰</span>
                      <span class="emoji-item" onclick="insertEmoji('😘', 'mektupIcerik')">😘</span>
                      <span class="emoji-item" onclick="insertEmoji('💕', 'mektupIcerik')">💕</span>
                      <span class="emoji-item" onclick="insertEmoji('❤️', 'mektupIcerik')">❤️</span>
                      <span class="emoji-item" onclick="insertEmoji('💖', 'mektupIcerik')">💖</span>
                      <span class="emoji-item" onclick="insertEmoji('🥺', 'mektupIcerik')">🥺</span>
                      <span class="emoji-item" onclick="insertEmoji('😢', 'mektupIcerik')">😢</span>
                      <span class="emoji-item" onclick="insertEmoji('🤗', 'mektupIcerik')">🤗</span>
                    </div>
                  </div>
                  <div class="emoji-category">
                    <div class="emoji-category-title">Kalpler</div>
                    <div class="emoji-list">
                      <span class="emoji-item" onclick="insertEmoji('💕', 'mektupIcerik')">💕</span>
                      <span class="emoji-item" onclick="insertEmoji('💗', 'mektupIcerik')">💗</span>
                      <span class="emoji-item" onclick="insertEmoji('💓', 'mektupIcerik')">💓</span>
                      <span class="emoji-item" onclick="insertEmoji('💝', 'mektupIcerik')">💝</span>
                      <span class="emoji-item" onclick="insertEmoji('💘', 'mektupIcerik')">💘</span>
                      <span class="emoji-item" onclick="insertEmoji('💞', 'mektupIcerik')">💞</span>
                      <span class="emoji-item" onclick="insertEmoji('💟', 'mektupIcerik')">💟</span>
                      <span class="emoji-item" onclick="insertEmoji('❣️', 'mektupIcerik')">❣️</span>
                    </div>
                  </div>
                  <div class="emoji-category">
                    <div class="emoji-category-title">Semboller</div>
                    <div class="emoji-list">
                      <span class="emoji-item" onclick="insertEmoji('⭐', 'mektupIcerik')">⭐</span>
                      <span class="emoji-item" onclick="insertEmoji('✨', 'mektupIcerik')">✨</span>
                      <span class="emoji-item" onclick="insertEmoji('🌙', 'mektupIcerik')">🌙</span>
                      <span class="emoji-item" onclick="insertEmoji('🌟', 'mektupIcerik')">🌟</span>
                      <span class="emoji-item" onclick="insertEmoji('🌸', 'mektupIcerik')">🌸</span>
                      <span class="emoji-item" onclick="insertEmoji('🌹', 'mektupIcerik')">🌹</span>
                      <span class="emoji-item" onclick="insertEmoji('🎵', 'mektupIcerik')">🎵</span>
                      <span class="emoji-item" onclick="insertEmoji('☕', 'mektupIcerik')">☕</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <textarea id="mektupIcerik" rows="8" placeholder="Sevgili..." required></textarea>
          </div>
          
          <button type="submit" class="btn-mektup-gonder">
            📮 Mektubu Bırak
          </button>
        </form>
      </div>
    </div>
    
    <!-- Mektup Okuma Modal -->
    <div class="modal-overlay" id="mektupOkuModal">
      <div class="modal-content mektup-oku-modal">
        <button class="btn-modal-close" onclick="closeMektupOkuModal()">×</button>
        <div class="mektup-oku-header" id="mektupOkuHeader">
          <!-- Dinamik olarak doldurulacak -->
        </div>
        <div class="mektup-oku-icerik" id="mektupOkuIcerik">
          <!-- Mektup içeriği buraya -->
        </div>
        <div class="mektup-oku-footer" id="mektupOkuFooter">
          <!-- Saat bilgisi -->
        </div>
      </div>
    </div>
    
    <!-- Mektup Bildirim Toast -->
    <div class="mektup-bildirim" id="mektupBildirim">
      <span class="bildirim-icon">💌</span>
      <span class="bildirim-mesaj" id="bildirimMesaj"></span>
      <button class="bildirim-kapat" onclick="closeMektupBildirim()">×</button>
    </div>
    
    <!-- Timeline Ekleme Modal -->
    <div class="modal-overlay" id="timelineModal">
      <div class="modal-content timeline-modal">
        <button class="btn-modal-close" onclick="closeTimelineModal()">×</button>
        <div class="modal-header-timeline">
          <span class="modal-icon">📍</span>
          <h3>Yeni An Ekle</h3>
        </div>
        
        <div class="timeline-uyari">
          <span class="uyari-icon">✍️</span>
          <p>Evren'in gözünden yazın. 3. şahıs kullanın.<br>
          <em>Örnek: "O gün ikisi de aynı şeyi hissetti..." veya "Baran gülümsedi, Bahar anladı..."</em></p>
        </div>
        
        <form id="timelineForm" onsubmit="handleTimelineSubmit(event)">
          <div class="timeline-form-group">
            <label>📅 Tarih</label>
            <input type="date" id="timelineTarih" required>
          </div>
          
          <div class="timeline-form-group">
            <label>✨ Olayın Başlığı</label>
            <input type="text" id="timelineBaslik" placeholder="O gün ne oldu? (kısa)" required>
          </div>
          
          <div class="timeline-form-group">
            <label>📝 Detay (3. şahıs)</label>
            <textarea id="timelineDetay" rows="4" placeholder="O gün neler yaşandı? (Evren'in gözünden)"></textarea>
          </div>
          <button type="submit" class="btn-timeline-kaydet">💾 Kaydet</button>
        </form>
      </div>
    </div>
  `;
  
  // Timeline render
  renderTimeline();
}

// Firebase'den mektupları yükle
async function loadMektuplarFromFirebase() {
  await waitForFirebase();
  
  try {
    const db = window.firebaseDb;
    const snapshot = await window.firestoreGetDocs(
      window.firestoreQuery(
        window.firestoreCollection(db, 'letters'),
        window.firestoreOrderBy('createdAt', 'desc')
      )
    );
    
    mektuplarCache = [];
    snapshot.forEach(doc => {
      mektuplarCache.push({ id: doc.id, ...doc.data() });
    });
  } catch (error) {
    console.error('Mektuplar yüklenirken hata:', error);
  }
}

// Tarihegöre mektupları göster
function loadMektuplarByDate() {
  const tarih = document.getElementById('arsivTarih').value;
  const container = document.getElementById('arsivMektuplar');
  
  if (!tarih) {
    container.innerHTML = '<p class="arsiv-bos">Bir tarih seçerek mektupları görüntüleyin</p>';
    return;
  }
  
  const baranMektup = mektuplarCache.find(m => m.tarih === tarih && m.kisi === 'baran');
  const baharMektup = mektuplarCache.find(m => m.tarih === tarih && m.kisi === 'bahar');
  
  const tarihObj = new Date(tarih);
  const tarihStr = tarihObj.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  
  container.innerHTML = `
    <div class="arsiv-baslik-tarih">📅 ${tarihStr}</div>
    <div class="arsiv-mektup-grid">
      <div class="arsiv-mektup baran-mektup">
        <div class="arsiv-mektup-header">
          <span>👨 Baran'dan</span>
          ${baranMektup ? `<button class="btn-mektup-sil" onclick="deleteMektup('${baranMektup.id}')">🗑️</button>` : ''}
        </div>
        <div class="arsiv-mektup-icerik">
          ${baranMektup ? baranMektup.icerik : '<em class="bos">Bu gün mektup yazılmamış</em>'}
        </div>
        ${baranMektup ? `<div class="arsiv-mektup-saat">${formatMektupSaat(baranMektup.createdAt)}</div>` : ''}
      </div>
      
      <div class="arsiv-mektup bahar-mektup">
        <div class="arsiv-mektup-header">
          <span>👩 Bahar'dan</span>
          ${baharMektup ? `<button class="btn-mektup-sil" onclick="deleteMektup('${baharMektup.id}')">🗑️</button>` : ''}
        </div>
        <div class="arsiv-mektup-icerik">
          ${baharMektup ? baharMektup.icerik : '<em class="bos">Bu gün mektup yazılmamış</em>'}
        </div>
        ${baharMektup ? `<div class="arsiv-mektup-saat">${formatMektupSaat(baharMektup.createdAt)}</div>` : ''}
      </div>
    </div>
  `;
}

// Mektup saati formatla
function formatMektupSaat(timestamp) {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

// Mektup modal aç
function openMektupModal(kisi) {
  document.getElementById('mektupModal').classList.add('active');
  document.getElementById('mektupKisi').value = kisi;
  document.getElementById('mektupIcerik').value = '';
}

// Mektup modal kapat
function closeMektupModal() {
  document.getElementById('mektupModal').classList.remove('active');
}

// Mektup kaydet
async function handleMektupSubmit(e) {
  e.preventDefault();
  
  const kisi = document.getElementById('mektupKisi').value;
  const icerik = document.getElementById('mektupIcerik').value.trim();
  const bugun = getBugunTarih();
  
  if (!icerik) {
    alert('Mektup içeriği boş olamaz!');
    return;
  }
  
  // Tekrar kontrol - bugün zaten yazmış mı?
  const mevcutMektup = mektuplarCache.find(m => m.tarih === bugun && m.kisi === kisi);
  if (mevcutMektup) {
    alert('Bugün zaten mektubunu bıraktın! Yarın tekrar yazabilirsin 💕');
    closeMektupModal();
    return;
  }
  
  await waitForFirebase();
  
  try {
    const db = window.firebaseDb;
    
    const yeniMektup = {
      kisi: kisi,
      tarih: bugun,
      icerik: icerik,
      createdAt: window.firestoreServerTimestamp()
    };
    
    const docRef = await window.firestoreAddDoc(
      window.firestoreCollection(db, 'letters'),
      yeniMektup
    );
    
    // Cache'e ekle
    mektuplarCache.unshift({ id: docRef.id, ...yeniMektup, createdAt: new Date() });
    
    // Modal kapat ve sayfayı yenile
    closeMektupModal();
    await loadHikayemizPage();
    
    console.log(`💌 ${kisi} bugünkü mektubunu bıraktı`);
    
  } catch (error) {
    console.error('Mektup kaydedilirken hata:', error);
    alert('Bir hata oluştu!');
  }
}

// Mektup sil
async function deleteMektup(mektupId) {
  const confirmed = await showConfirmModal({
    icon: '📝',
    title: 'Mektubu Sil',
    message: 'Bu mektubu silmek istediğine emin misin? Bu işlem geri alınamaz.',
    confirmText: 'Evet, Sil',
    cancelText: 'İptal',
    confirmType: 'danger'
  });
  
  if (!confirmed) return;
  
  await waitForFirebase();
  
  try {
    const db = window.firebaseDb;
    await window.firestoreDeleteDoc(window.firestoreDoc(db, 'letters', mektupId));
    
    mektuplarCache = mektuplarCache.filter(m => m.id !== mektupId);
    
    // Arşivi yenile
    loadMektuplarByDate();
    
    console.log('🗑️ Mektup silindi');
  } catch (error) {
    console.error('Mektup silinirken hata:', error);
  }
}

// Mektup okuma modal'ı aç
function openMektupOkuModal(kimdenKisi) {
  const mektup = bugunMektuplar[kimdenKisi];
  if (!mektup) {
    alert('Bu kişi bugün mektup yazmadı!');
    return;
  }
  
  const kimeKisi = kimdenKisi === 'baran' ? 'Bahar' : 'Baran';
  const kimdenAd = kimdenKisi === 'baran' ? 'Baran' : 'Bahar';
  const emoji = kimdenKisi === 'baran' ? '👨' : '👩';
  
  const headerEl = document.getElementById('mektupOkuHeader');
  const icerikEl = document.getElementById('mektupOkuIcerik');
  const footerEl = document.getElementById('mektupOkuFooter');
  
  headerEl.innerHTML = `
    <span class="mektup-oku-zarf">💌</span>
    <p class="mektup-oku-bilgi">Bu mektup <strong>${kimeKisi}</strong>'a, <strong>${kimdenAd}</strong> ${emoji} tarafından yazılmıştır.</p>
  `;
  
  icerikEl.innerHTML = `<p>${mektup.icerik.replace(/\n/g, '<br>')}</p>`;
  
  const saat = formatMektupSaat(mektup.createdAt);
  footerEl.innerHTML = `<span class="mektup-oku-saat">📍 Bugün, ${saat}</span>`;
  
  document.getElementById('mektupOkuModal').classList.add('active');
}

// Mektup okuma modal kapat
function closeMektupOkuModal() {
  document.getElementById('mektupOkuModal').classList.remove('active');
}

// Mektup bildirim göster
function showMektupBildirim() {
  // Hangi kişinin bakış açısından baktığımızı bilmiyoruz, 
  // her iki durum için de bildirim göster
  let mesaj = '';
  
  if (bugunMektuplar.baran && bugunMektuplar.bahar) {
    mesaj = '💕 Bugün ikiniz de mektup bıraktınız!';
  } else if (bugunMektuplar.baran) {
    mesaj = '💌 Baran bugün mektup bıraktı! Bahar, okumak ister misin?';
  } else if (bugunMektuplar.bahar) {
    mesaj = '💌 Bahar bugün mektup bıraktı! Baran, okumak ister misin?';
  }
  
  if (mesaj) {
    document.getElementById('bildirimMesaj').textContent = mesaj;
    document.getElementById('mektupBildirim').classList.add('active');
    
    // 8 saniye sonra otomatik kapat
    setTimeout(() => {
      closeMektupBildirim();
    }, 8000);
  }
}

// Mektup bildirim kapat
function closeMektupBildirim() {
  document.getElementById('mektupBildirim').classList.remove('active');
}

// Firebase'den timeline verilerini yükle
async function loadTimelineFromFirebase() {
  await waitForFirebase();
  
  try {
    const db = window.firebaseDb;
    const timelineSnapshot = await window.firestoreGetDocs(
      window.firestoreQuery(
        window.firestoreCollection(db, 'timeline'),
        window.firestoreOrderBy('tarih', 'asc')
      )
    );
    
    timelineCache = [];
    timelineSnapshot.forEach(doc => {
      timelineCache.push({ id: doc.id, ...doc.data() });
    });
    
    // Başlangıç öğesi yoksa ekle (sabit)
    const baslangicVar = timelineCache.some(t => t.sabit === true);
    if (!baslangicVar) {
      timelineCache.unshift({
        id: 'baslangic',
        tarih: '2026-01-09',
        baslik: 'Her şeyin başlangıcı ✨',
        sabit: true
      });
    }
    
  } catch (error) {
    console.error('Timeline yüklenirken hata:', error);
  }
}

// Timeline render
function renderTimeline() {
  const container = document.getElementById('timelineContainer');
  if (!container) return;
  
  // Tarihe göre sırala
  const sirali = [...timelineCache].sort((a, b) => new Date(a.tarih) - new Date(b.tarih));
  
  let html = '';
  
  sirali.forEach(item => {
    const tarihObj = new Date(item.tarih);
    const tarihStr = tarihObj.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    
    html += `
      <div class="timeline-item" data-id="${item.id}">
        <div class="timeline-item-header">
          <span class="timeline-tarih">${item.sabit ? '9 Ocak 2026' : tarihStr}</span>
          ${!item.sabit ? `<button class="btn-timeline-sil" onclick="deleteTimelineItem('${item.id}')" title="Sil">🗑️</button>` : ''}
        </div>
        <span class="timeline-event">${item.baslik}</span>
        
        ${item.detay ? `
          <div class="timeline-detay">
            <p class="timeline-detay-metin">${item.detay}</p>
          </div>
        ` : ''}
      </div>
    `;
  });
  
  // En sona "devam ediyor" ekle
  html += `
    <div class="timeline-item devam">
      <span class="timeline-tarih">Bugün</span>
      <span class="timeline-event">Ve hikâye devam ediyor... 💕</span>
    </div>
  `;
  
  container.innerHTML = html;
}

// Timeline modal aç
function openTimelineModal() {
  document.getElementById('timelineModal').classList.add('active');
  document.getElementById('timelineForm').reset();
  
  // Bugünün tarihini varsayılan yap
  document.getElementById('timelineTarih').value = new Date().toISOString().split('T')[0];
}

// Timeline modal kapat
function closeTimelineModal() {
  document.getElementById('timelineModal').classList.remove('active');
}

// Timeline kaydet (Aynı tarihe yazılanlar birleştirilir)
async function handleTimelineSubmit(e) {
  e.preventDefault();
  
  const tarih = document.getElementById('timelineTarih').value;
  const baslik = document.getElementById('timelineBaslik').value.trim();
  const detay = document.getElementById('timelineDetay').value.trim();
  
  if (!tarih || !baslik) {
    alert('Tarih ve başlık zorunludur!');
    return;
  }
  
  await waitForFirebase();
  
  try {
    const db = window.firebaseDb;
    
    // Aynı tarihte kayıt var mı kontrol et
    const mevcutKayit = timelineCache.find(t => t.tarih === tarih && !t.sabit);
    
    if (mevcutKayit) {
      // Mevcut kayda ekle (birleştir)
      const guncelData = {
        baslik: mevcutKayit.baslik + ' | ' + baslik,
        detay: [mevcutKayit.detay, detay].filter(Boolean).join('\n\n')
      };
      
      await window.firestoreUpdateDoc(
        window.firestoreDoc(db, 'timeline', mevcutKayit.id),
        guncelData
      );
      
      // Cache güncelle
      const idx = timelineCache.findIndex(t => t.id === mevcutKayit.id);
      if (idx !== -1) {
        timelineCache[idx] = { ...timelineCache[idx], ...guncelData };
      }
      
      console.log('📍 Timeline öğesi güncellendi (aynı tarih birleştirildi)');
    } else {
      // Yeni kayıt oluştur
      const yeniItem = {
        tarih: tarih,
        baslik: baslik,
        detay: detay || null,
        createdAt: window.firestoreServerTimestamp()
      };
      
      const docRef = await window.firestoreAddDoc(
        window.firestoreCollection(db, 'timeline'),
        yeniItem
      );
      
      // Cache'e ekle
      timelineCache.push({ id: docRef.id, ...yeniItem });
      
      console.log('📍 Yeni timeline öğesi eklendi');
    }
    
    // Modal kapat ve render
    closeTimelineModal();
    renderTimeline();
    
  } catch (error) {
    console.error('Timeline kaydedilirken hata:', error);
    alert('Bir hata oluştu!');
  }
}

// Timeline öğesi sil
async function deleteTimelineItem(itemId) {
  const confirmed = await showConfirmModal({
    icon: '📍',
    title: 'Anı Sil',
    message: 'Bu anı timeline\'ından silmek istediğine emin misin?',
    confirmText: 'Evet, Sil',
    cancelText: 'İptal',
    confirmType: 'danger'
  });
  
  if (!confirmed) return;
  
  await waitForFirebase();
  
  try {
    const db = window.firebaseDb;
    await window.firestoreDeleteDoc(window.firestoreDoc(db, 'timeline', itemId));
    
    // Cache'den kaldır
    timelineCache = timelineCache.filter(t => t.id !== itemId);
    
    // Render
    renderTimeline();
    
    console.log('🗑️ Timeline öğesi silindi');
    
  } catch (error) {
    console.error('Timeline silinirken hata:', error);
  }
}

// Global fonksiyonlar - Hikayemiz & Timeline
window.openTimelineModal = openTimelineModal;
window.closeTimelineModal = closeTimelineModal;
window.handleTimelineSubmit = handleTimelineSubmit;
window.deleteTimelineItem = deleteTimelineItem;

// Global fonksiyonlar - Mektup Sistemi
window.openMektupModal = openMektupModal;
window.closeMektupModal = closeMektupModal;
window.handleMektupSubmit = handleMektupSubmit;
window.deleteMektup = deleteMektup;
window.loadMektuplarByDate = loadMektuplarByDate;
window.openMektupOkuModal = openMektupOkuModal;
window.closeMektupOkuModal = closeMektupOkuModal;
window.showMektupBildirim = showMektupBildirim;
window.closeMektupBildirim = closeMektupBildirim;