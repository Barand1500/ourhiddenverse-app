/* ============================================
   OURHIDDENVERSE - MAIN
   Sayaç, İstatistikler, Menü Navigasyonu
   ============================================ */

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
    
    // Kumbara/Birikim verilerini al
    const birikimDoc = await window.firestoreGetDoc(
      window.firestoreDoc(db, 'birikim', 'toplam')
    );
    
    let baharBirikim = 0;
    let baranBirikim = 0;
    
    if (birikimDoc.exists()) {
      const birikimData = birikimDoc.data();
      baharBirikim = birikimData.bahar || 0;
      baranBirikim = birikimData.baran || 0;
    }
    
    // Kumbara DOM güncelle
    const baharBirikimEl = document.getElementById('baharBirikimCount');
    const baranBirikimEl = document.getElementById('baranBirikimCount');
    
    const formatParaKisa = (miktar) => {
      if (miktar >= 1000) {
        return (miktar / 1000).toFixed(1).replace('.0', '') + 'K ₺';
      }
      return miktar + ' ₺';
    };
    
    if (baharBirikimEl) baharBirikimEl.textContent = formatParaKisa(baharBirikim);
    if (baranBirikimEl) baranBirikimEl.textContent = formatParaKisa(baranBirikim);
    
    console.log(`📊 İstatistikler yüklendi: ${filmCount} film, ${diziCount} dizi, ${dateCount} date, ${oyunCount} oyun, ${kitapCountBahar}+${kitapCountBaran} kitap, ${sehirCount} şehir, ${sarkiCount} şarkı, ${tamamlananHedef}/${toplamHedef} hedef, ${ozelGunCount} özel gün, ${baharMektupSayi}+${baranMektupSayi} mektup, ${baharBirikim}+${baranBirikim}₺ birikim`);
    
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

/* ============================================
   MENÜ VE NAVİGASYON
   ============================================ */

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
  
  // Birikim/Kumbara sayfası için özel içerik
  if (pageName === 'birikim') {
    await loadBirikimPage();
    return;
  }
  
  // Günlük Soru sayfası için özel içerik
  if (pageName === 'gunluk-soru') {
    await loadGunlukSoruPage();
    return;
  }
  
  // Çift Oyunları sayfası için özel içerik
  if (pageName === 'cift-oyunlari') {
    await loadCiftOyunlariPage();
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
  
  // Yediklerimiz sayfası için özel içerik
  if (pageName === 'yediklerimiz') {
    await loadYediklerimizPage();
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

/* -------- YARDIMCI FONKSİYONLAR -------- */

// Firebase'den veri çekme fonksiyonu (ileride aktif edilecek)
async function fetchDataFromFirebase(collectionName) {
  console.log(`🔥 ${collectionName} verisi çekilecek...`);
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

// Global fonksiyonları dışa aktar
window.addMenuItem = addMenuItem;
window.navigateToPage = navigateToPage;
window.loadHomeStats = loadHomeStats;
