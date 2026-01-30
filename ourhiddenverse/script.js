/* ============================================
   OURHIDDENVERSE - ANA JAVASCRIPT DOSYASI
   Menü etkileşimleri ve sayfa yönetimi
   Firebase Firestore entegrasyonlu
   ============================================ */

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
    
    // DOM güncelle
    const filmEl = document.getElementById('filmCount');
    const diziEl = document.getElementById('diziCount');
    const dateEl = document.getElementById('dateCount');
    
    if (filmEl) filmEl.textContent = filmCount;
    if (diziEl) diziEl.textContent = diziCount;
    if (dateEl) dateEl.textContent = dateCount;
    
    console.log(`📊 İstatistikler yüklendi: ${filmCount} film, ${diziCount} dizi, ${dateCount} date`);
    
  } catch (error) {
    console.error('❌ İstatistikler yüklenirken hata:', error);
  }
}

// Sayaç başlat
function startTimeCounter() {
  updateTimeCounter(); // Hemen bir kez çalıştır
  setInterval(updateTimeCounter, 1000); // Her saniye güncelle
}

/* ============================================
   TEMA SEÇİCİ FONKSİYONLARI
   ============================================ */

// Tema tanımları
const themes = {
  'ocean-blue': {
    name: 'Okyanus Mavisi',
    colors: {
      '--dark-blue': '#6482AD',
      '--mid-blue': '#7FA1C3',
      '--light-beige': '#E2DAD6',
      '--soft-white': '#F5EDED',
      '--bg-primary': '#F5EDED',
      '--bg-secondary': '#E2DAD6',
      '--accent-primary': '#6482AD',
      '--accent-light': '#7FA1C3',
      '--accent-dark': '#4a6691',
      '--accent-soft': '#E2DAD6',
      '--text-primary': '#3a4a5a',
      '--text-secondary': '#5a6a7a',
      '--text-muted': '#7a8a9a',
      '--glow-primary': 'rgba(100, 130, 173, 0.2)',
      '--glow-soft': 'rgba(127, 161, 195, 0.3)'
    }
  },
  'sonbahar': {
    name: 'Sonbahar',
    colors: {
      '--dark-blue': '#1A120B',
      '--mid-blue': '#3C2A21',
      '--light-beige': '#D5CEA3',
      '--soft-white': '#E5E5CB',
      '--bg-primary': '#E5E5CB',
      '--bg-secondary': '#D5CEA3',
      '--accent-primary': '#3C2A21',
      '--accent-light': '#5a4439',
      '--accent-dark': '#1A120B',
      '--accent-soft': '#D5CEA3',
      '--text-primary': '#1A120B',
      '--text-secondary': '#3C2A21',
      '--text-muted': '#6B5344',
      '--glow-primary': 'rgba(60, 42, 33, 0.2)',
      '--glow-soft': 'rgba(90, 68, 57, 0.3)'
    }
  },
  'forest-green': {
    name: 'Orman Yeşili',
    colors: {
      '--dark-blue': '#4A7C59',
      '--mid-blue': '#8FBC8F',
      '--light-beige': '#C8E6C9',
      '--soft-white': '#E8F5E9',
      '--bg-primary': '#E8F5E9',
      '--bg-secondary': '#C8E6C9',
      '--accent-primary': '#4A7C59',
      '--accent-light': '#8FBC8F',
      '--accent-dark': '#2E5339',
      '--accent-soft': '#C8E6C9',
      '--text-primary': '#2E7D32',
      '--text-secondary': '#558B2F',
      '--text-muted': '#81C784',
      '--glow-primary': 'rgba(74, 124, 89, 0.2)',
      '--glow-soft': 'rgba(143, 188, 143, 0.3)'
    }
  },
  'lavender-dream': {
    name: 'Lavanta Rüyası',
    colors: {
      '--dark-blue': '#7B68EE',
      '--mid-blue': '#9F8FEF',
      '--light-beige': '#E1D5F0',
      '--soft-white': '#F3E5F5',
      '--bg-primary': '#F3E5F5',
      '--bg-secondary': '#E1D5F0',
      '--accent-primary': '#7B68EE',
      '--accent-light': '#9F8FEF',
      '--accent-dark': '#5B48CE',
      '--accent-soft': '#E1D5F0',
      '--text-primary': '#4A148C',
      '--text-secondary': '#6A1B9A',
      '--text-muted': '#AB47BC',
      '--glow-primary': 'rgba(123, 104, 238, 0.2)',
      '--glow-soft': 'rgba(159, 143, 239, 0.3)'
    }
  },
  'warm-autumn': {
    name: 'Sıcak Sonbahar',
    colors: {
      '--dark-blue': '#D2691E',
      '--mid-blue': '#F4A460',
      '--light-beige': '#FFDAB9',
      '--soft-white': '#FFF8DC',
      '--bg-primary': '#FFF8DC',
      '--bg-secondary': '#FFDAB9',
      '--accent-primary': '#D2691E',
      '--accent-light': '#F4A460',
      '--accent-dark': '#A04910',
      '--accent-soft': '#FFDAB9',
      '--text-primary': '#8B4513',
      '--text-secondary': '#A0522D',
      '--text-muted': '#CD853F',
      '--glow-primary': 'rgba(210, 105, 30, 0.2)',
      '--glow-soft': 'rgba(244, 164, 96, 0.3)'
    }
  }
};

// Temayı uygula
function applyTheme(themeName) {
  const theme = themes[themeName];
  if (!theme) return;
  
  const root = document.documentElement;
  
  Object.entries(theme.colors).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
  
  // LocalStorage'a kaydet
  localStorage.setItem('selectedTheme', themeName);
  
  // Aktif tema butonunu güncelle
  document.querySelectorAll('.theme-option').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.theme === themeName) {
      btn.classList.add('active');
    }
  });
  
  console.log(`🎨 Tema değiştirildi: ${theme.name}`);
}

// Kayıtlı temayı yükle
function loadSavedTheme() {
  const savedTheme = localStorage.getItem('selectedTheme');
  if (savedTheme && themes[savedTheme]) {
    applyTheme(savedTheme);
  }
}

// Tema seçici toggle
function initThemePicker() {
  const toggle = document.getElementById('themePickerToggle');
  const drawer = document.getElementById('themePickerDrawer');
  const themeOptions = document.querySelectorAll('.theme-option');
  
  if (!toggle || !drawer) return;
  
  // Toggle butonu tıklama
  toggle.addEventListener('click', () => {
    drawer.classList.toggle('active');
    toggle.style.display = drawer.classList.contains('active') ? 'none' : 'flex';
  });
  
  // Dışarı tıklayınca kapat
  document.addEventListener('click', (e) => {
    if (!drawer.contains(e.target) && !toggle.contains(e.target)) {
      drawer.classList.remove('active');
      toggle.style.display = 'flex';
    }
  });
  
  // Tema seçenekleri tıklama
  themeOptions.forEach(option => {
    option.addEventListener('click', () => {
      const themeName = option.dataset.theme;
      applyTheme(themeName);
    });
  });
}

// Sayfa yüklendiğinde sayaç ve istatistikleri başlat
document.addEventListener('DOMContentLoaded', () => {
  startTimeCounter();
  loadHomeStats();
  loadSavedTheme();
  initThemePicker();
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

// Menü öğelerine tıklama olayı ekle
menuItems.forEach(item => {
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
                    <div class="form-group">
            <label for="baranPuan_${film.id}">💙 Baran'ın Puanı</label>
            <input type="number" id="baranPuan_${film.id}" min="0" max="10" step="0.5" placeholder="0-10" required>
          </div>
            <label for="baharPuan_${film.id}">💖 Bahar'ın Puanı</label>
            <input type="number" id="baharPuan_${film.id}" min="0" max="10" step="0.5" placeholder="0-10" required>
          </div>
          <div class="form-group">
            <label for="izlenmeTarihi_${film.id}"> İzlenme Tarihi</label>
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
        <span class="puan-badge baran">${film.baranPuani}</span>
      </td>
      <td class="col-puan">
        <span class="puan-badge bahar">${film.baharPuani}</span>
      </td>
      <td class="col-puan">
        <span class="puan-badge ortak">${film.ortalamaPuan}</span>
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
            <label>Baran Puanı</label>
            <input type="number" min="0" max="10" step="0.5" id="baranDiziPuan-${dizi.id}" placeholder="0-10" required>
          </div>
          <div class="form-group">
            <label>Bahar Puanı</label>
            <input type="number" min="0" max="10" step="0.5" id="baharDiziPuan-${dizi.id}" placeholder="0-10" required>
          </div>
          <div class="form-group">
            <label>Başlangıç Tarihi</label>
            <input type="date" id="baslangicTarihi-${dizi.id}" required>
          </div>
          <div class="form-group">
            <label>Bitiş Tarihi</label>
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
      <td class="col-puan"><span class="puan-badge baran">${dizi.baranPuani}</span></td>
      <td class="col-puan"><span class="puan-badge bahar">${dizi.baharPuani}</span></td>
      <td class="col-puan"><span class="puan-badge ortak">${dizi.ortalamaPuan}</span></td>
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

      <!-- İster Listesi Bölümü -->
      <section class="ister-listesi-section">
        <h3 class="section-title">📋 İster Listesi</h3>
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
          <div class="form-group">
            <label for="dateTarih">Tarih</label>
            <input type="date" id="dateTarih" required>
          </div>
          <button type="submit" class="btn-kaydet">İster Listesine Ekle</button>
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
    // Bugünün tarihini varsayılan olarak ayarla
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('dateTarih').value = today;
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
    const tarih = document.getElementById('dateTarih').value;
    
    if (baslik && tarih) {
      await addDateToIsterListesi(baslik, tarih);
      yeniDateForm.reset();
      dateModal.classList.remove('active');
    }
  });
}

// Firestore'dan ister listesini yükle
async function loadIsterListesiFromFirestore() {
  try {
    console.log("📋 İster listesi yükleniyor...");
    
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
    
    // Tarihe göre sırala (en yakın tarih en üstte)
    istekDatelerCache.sort((a, b) => {
      return new Date(a.tarih) - new Date(b.tarih);
    });
    
    console.log(`📥 İster listesi Firestore'dan yüklendi: ${istekDatelerCache.length} date`);
    renderIsterListesi();
  } catch (error) {
    console.error('❌ İster listesi yüklenirken hata:', error);
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

// İster listesine date ekle - FIRESTORE'A YAZAR
async function addDateToIsterListesi(baslik, tarih) {
  try {
    const db = window.firebaseDb;
    
    // Firestore'a yeni date belgesi ekle
    const docRef = await window.firestoreAddDoc(
      window.firestoreCollection(db, ISTEK_DATE_KOLEKSIYON), 
      {
        baslik: baslik,
        tarih: tarih,
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

// İster listesinden date sil - FIRESTORE'DAN SİLER
async function deleteIsterDate(dateId) {
  try {
    const db = window.firebaseDb;
    
    await window.firestoreDeleteDoc(
      window.firestoreDoc(db, ISTEK_DATE_KOLEKSIYON, dateId)
    );
    
    console.log(`🗑️ Date ister listesinden silindi: ${dateId}`);
    await loadIsterListesiFromFirestore();
    
  } catch (error) {
    console.error('❌ Date silinirken hata:', error);
    alert('Date silinirken bir hata oluştu!');
  }
}

// Date'i yapıldı olarak işaretle - Checkbox tıklandığında
async function markDateAsYapildi(dateId) {
  const dateItem = istekDatelerCache.find(d => d.id === dateId);
  if (!dateItem) return;
  
  // Görsel URL'yi sor (opsiyonel)
  const gorselUrl = prompt('Date için görsel URL eklemek ister misiniz? (Boş bırakabilirsiniz)', '');
  
  // Kullanıcı iptal ettiyse checkbox'ı geri al
  if (gorselUrl === null) {
    // Checkbox'ı geri al
    const checkbox = document.querySelector(`.ister-item[data-id="${dateId}"] .ister-checkbox`);
    if (checkbox) checkbox.checked = false;
    return;
  }
  
  try {
    const db = window.firebaseDb;
    
    // Yapılan datelere ekle
    await window.firestoreAddDoc(
      window.firestoreCollection(db, YAPILAN_DATE_KOLEKSIYON),
      {
        baslik: dateItem.baslik,
        tarih: dateItem.tarih,
        gorselUrl: gorselUrl.trim() || '',
        olusturulmaTarihi: window.firestoreServerTimestamp()
      }
    );
    
    // İster listesinden sil
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

// İster listesini render et
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
        <span class="ister-tarih">${formatDateTarih(date.tarih)}</span>
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
        <span class="date-tarih">${formatDateTarih(date.tarih)}</span>
      </div>
      <button class="btn-date-sil" onclick="deleteYapilanDate('${date.id}')" title="Sil">🗑️</button>
    </div>
  `).join('');
}

// Global fonksiyonları dışa aktar - Dateler için
window.markDateAsYapildi = markDateAsYapildi;
window.deleteIsterDate = deleteIsterDate;
window.deleteYapilanDate = deleteYapilanDate;
