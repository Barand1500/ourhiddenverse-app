/* ============================================
   DİZİ ÖNERİ SİSTEMİ - TMDB API
   "Birlikte izleyecek dizi mi arıyorsunuz?"
   ============================================ */

// TMDB API Konfigürasyonu (film-oneri.js ile aynı)
const TMDB_CONFIG_DIZI = {
  apiKey: 'b089c4fe09482bc91b7079291b853c21',
  baseUrl: 'https://api.themoviedb.org/3',
  imageBaseUrl: 'https://image.tmdb.org/t/p/w500',
  language: 'tr-TR'
};

// Dizi türleri (TMDB TV genre ID'leri)
const DIZI_TURLERI = [
  { id: 10759, name: 'Aksiyon & Macera', emoji: '💥' },
  { id: 16, name: 'Animasyon', emoji: '🎨' },
  { id: 35, name: 'Komedi', emoji: '😂' },
  { id: 80, name: 'Suç', emoji: '🔪' },
  { id: 99, name: 'Belgesel', emoji: '📹' },
  { id: 18, name: 'Drama', emoji: '🎭' },
  { id: 10751, name: 'Aile', emoji: '👨‍👩‍👧' },
  { id: 10762, name: 'Çocuk', emoji: '🧒' },
  { id: 9648, name: 'Gizem', emoji: '🔍' },
  { id: 10763, name: 'Haber', emoji: '📰' },
  { id: 10764, name: 'Reality', emoji: '📺' },
  { id: 10765, name: 'Bilim Kurgu & Fantazi', emoji: '🚀' },
  { id: 10766, name: 'Pembe Dizi', emoji: '💕' },
  { id: 10767, name: 'Talk Show', emoji: '🎤' },
  { id: 10768, name: 'Savaş & Politik', emoji: '⚔️' },
  { id: 37, name: 'Western', emoji: '🤠' }
];

// Öneri cache
let diziOneriCache = [];
let diziCurrentPage = 1;
let diziCurrentGenre = null;
let diziCurrentListType = 'popular';

// TMDB API'den dizi getir
async function fetchTMDBDiziler(endpoint, params = {}) {
  const queryParams = new URLSearchParams({
    api_key: TMDB_CONFIG_DIZI.apiKey,
    language: TMDB_CONFIG_DIZI.language,
    ...params
  });
  
  const url = `${TMDB_CONFIG_DIZI.baseUrl}${endpoint}?${queryParams}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('TMDB API hatası');
    return await response.json();
  } catch (error) {
    console.error('TMDB API Hatası:', error);
    return null;
  }
}

// Popüler dizileri getir
async function getPopularDiziler(page = 1) {
  const data = await fetchTMDBDiziler('/tv/popular', { page });
  return data?.results || [];
}

// En çok oy alan dizileri getir
async function getTopRatedDiziler(page = 1) {
  const data = await fetchTMDBDiziler('/tv/top_rated', { page });
  return data?.results || [];
}

// Türe göre dizi getir
async function getDizilerByGenre(genreId, page = 1) {
  const data = await fetchTMDBDiziler('/discover/tv', {
    with_genres: genreId,
    sort_by: 'popularity.desc',
    page
  });
  return data?.results || [];
}

// Dizi ara
async function searchDiziler(query) {
  const data = await fetchTMDBDiziler('/search/tv', { query });
  return data?.results || [];
}

// Rastgele dizi öner (türe göre)
async function getRandomDizi(genreId = null) {
  const randomPage = Math.floor(Math.random() * 5) + 1;
  let diziler;
  
  if (genreId) {
    diziler = await getDizilerByGenre(genreId, randomPage);
  } else {
    diziler = await getPopularDiziler(randomPage);
  }
  
  if (diziler.length > 0) {
    const randomIndex = Math.floor(Math.random() * diziler.length);
    return diziler[randomIndex];
  }
  return null;
}

// Dizi öneri sayfasını aç
function openDiziOneriModal() {
  let modal = document.getElementById('diziOneriModal');
  
  if (!modal) {
    const modalHTML = `
      <div class="modal-overlay film-oneri-modal" id="diziOneriModal">
        <div class="modal-content film-oneri-content">
          <button class="btn-modal-close" onclick="closeDiziOneriModal()">×</button>
          
          <div class="film-oneri-header">
            <span class="oneri-icon">📺</span>
            <h2>Dizi Öneri Sistemi</h2>
            <p class="oneri-subtitle">Birlikte izleyecek dizi mi arıyorsunuz?</p>
          </div>
          
          <!-- Tür Seçimi -->
          <div class="oneri-turler">
            <h4>🎭 Tür Seçin</h4>
            <div class="turler-grid" id="diziTurlerGrid">
              <button class="tur-btn active" data-genre="all" onclick="selectDiziGenre(null)">
                🎲 Hepsi
              </button>
              ${DIZI_TURLERI.map(tur => `
                <button class="tur-btn" data-genre="${tur.id}" onclick="selectDiziGenre(${tur.id})">
                  ${tur.emoji} ${tur.name}
                </button>
              `).join('')}
            </div>
          </div>
          
          <!-- Liste Tipi -->
          <div class="oneri-liste-tipi">
            <button class="liste-btn active" data-type="popular" onclick="selectDiziListType('popular')">
              🔥 Popüler
            </button>
            <button class="liste-btn" data-type="top_rated" onclick="selectDiziListType('top_rated')">
              ⭐ En İyi Puanlı
            </button>
            <button class="liste-btn" data-type="random" onclick="selectDiziListType('random')">
              🎲 Rastgele
            </button>
          </div>
          
          <!-- Dizi Önerileri -->
          <div class="film-oneriler-container" id="diziOnerilerContainer">
            <div class="loading-spinner">
              <div class="spinner"></div>
              <p>Diziler yükleniyor...</p>
            </div>
          </div>
          
          <!-- Daha Fazla Yükle -->
          <div class="oneri-actions" id="diziOneriActions" style="display: none;">
            <button class="btn-daha-fazla" onclick="loadMoreDiziler()">
              📺 Daha Fazla Dizi Göster
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    modal = document.getElementById('diziOneriModal');
  }
  
  modal.classList.add('active');
  diziCurrentPage = 1;
  diziCurrentGenre = null;
  diziCurrentListType = 'popular';
  loadDiziOneriler();
}

// Modal kapat
function closeDiziOneriModal() {
  const modal = document.getElementById('diziOneriModal');
  if (modal) {
    modal.classList.remove('active');
  }
}

// Tür seç
function selectDiziGenre(genreId) {
  diziCurrentGenre = genreId;
  diziCurrentPage = 1;
  
  document.querySelectorAll('#diziTurlerGrid .tur-btn').forEach(btn => {
    btn.classList.remove('active');
    if ((genreId === null && btn.dataset.genre === 'all') || 
        (btn.dataset.genre == genreId)) {
      btn.classList.add('active');
    }
  });
  
  loadDiziOneriler();
}

// Liste tipi seç
function selectDiziListType(type) {
  diziCurrentListType = type;
  diziCurrentPage = 1;
  
  document.querySelectorAll('#diziOneriModal .liste-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.type === type) {
      btn.classList.add('active');
    }
  });
  
  loadDiziOneriler();
}

// Dizi önerilerini yükle
async function loadDiziOneriler() {
  const container = document.getElementById('diziOnerilerContainer');
  const actionsDiv = document.getElementById('diziOneriActions');
  
  container.innerHTML = `
    <div class="loading-spinner">
      <div class="spinner"></div>
      <p>Diziler yükleniyor...</p>
    </div>
  `;
  actionsDiv.style.display = 'none';
  
  let diziler = [];
  
  if (diziCurrentListType === 'random') {
    const dizi = await getRandomDizi(diziCurrentGenre);
    if (dizi) diziler = [dizi];
  } else if (diziCurrentListType === 'top_rated') {
    if (diziCurrentGenre) {
      const data = await fetchTMDBDiziler('/discover/tv', {
        with_genres: diziCurrentGenre,
        sort_by: 'vote_average.desc',
        'vote_count.gte': 100,
        page: diziCurrentPage
      });
      diziler = data?.results || [];
    } else {
      diziler = await getTopRatedDiziler(diziCurrentPage);
    }
  } else {
    if (diziCurrentGenre) {
      diziler = await getDizilerByGenre(diziCurrentGenre, diziCurrentPage);
    } else {
      diziler = await getPopularDiziler(diziCurrentPage);
    }
  }
  
  diziOneriCache = diziler;
  renderDiziOneriler(diziler);
  
  if (diziCurrentListType !== 'random' && diziler.length > 0) {
    actionsDiv.style.display = 'flex';
  }
}

// Daha fazla dizi yükle
async function loadMoreDiziler() {
  diziCurrentPage++;
  
  let diziler = [];
  
  if (diziCurrentListType === 'top_rated') {
    if (diziCurrentGenre) {
      const data = await fetchTMDBDiziler('/discover/tv', {
        with_genres: diziCurrentGenre,
        sort_by: 'vote_average.desc',
        'vote_count.gte': 100,
        page: diziCurrentPage
      });
      diziler = data?.results || [];
    } else {
      diziler = await getTopRatedDiziler(diziCurrentPage);
    }
  } else {
    if (diziCurrentGenre) {
      diziler = await getDizilerByGenre(diziCurrentGenre, diziCurrentPage);
    } else {
      diziler = await getPopularDiziler(diziCurrentPage);
    }
  }
  
  diziOneriCache = [...diziOneriCache, ...diziler];
  renderDiziOneriler(diziOneriCache);
}

// Dizi kartlarını render et
function renderDiziOneriler(diziler) {
  const container = document.getElementById('diziOnerilerContainer');
  
  if (diziler.length === 0) {
    container.innerHTML = `
      <div class="oneri-bos">
        <span class="bos-icon">📺</span>
        <p>Bu kriterlere uygun dizi bulunamadı</p>
      </div>
    `;
    return;
  }
  
  let html = '<div class="film-oneriler-grid">';
  
  diziler.forEach(dizi => {
    const posterUrl = dizi.poster_path 
      ? `${TMDB_CONFIG_DIZI.imageBaseUrl}${dizi.poster_path}`
      : 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 450"><rect fill="%231a1a2e" width="300" height="450"/><text x="150" y="225" fill="%23666" text-anchor="middle" font-size="40">📺</text></svg>';
    
    const yil = dizi.first_air_date ? dizi.first_air_date.split('-')[0] : '?';
    const puan = dizi.vote_average ? dizi.vote_average.toFixed(1) : '-';
    const ozet = dizi.overview 
      ? (dizi.overview.length > 150 ? dizi.overview.substring(0, 150) + '...' : dizi.overview)
      : 'Açıklama bulunamadı';
    
    // Dizi adı (name veya original_name)
    const diziAdi = dizi.name || dizi.original_name || 'İsimsiz';
    
    // Dizi türlerini bul
    const diziTurleri = (dizi.genre_ids || [])
      .map(id => DIZI_TURLERI.find(t => t.id === id))
      .filter(Boolean)
      .slice(0, 3);
    
    html += `
      <div class="film-oneri-kart">
        <div class="film-poster-wrapper">
          <img src="${posterUrl}" alt="${diziAdi}" class="film-poster" loading="lazy">
          <div class="film-puan-badge">
            <span class="puan-yildiz">⭐</span>
            <span class="puan-deger">${puan}</span>
          </div>
        </div>
        
        <div class="film-oneri-info">
          <h4 class="film-oneri-title">${diziAdi}</h4>
          <p class="film-oneri-yil">${yil}</p>
          
          <div class="film-turler">
            ${diziTurleri.map(t => `<span class="tur-badge">${t.emoji} ${t.name}</span>`).join('')}
          </div>
          
          <p class="film-ozet">${ozet}</p>
          
          <div class="film-oneri-actions">
            <button class="btn-listeye-ekle" onclick="addDiziFromOneri('${diziAdi.replace(/'/g, "\\'")}', '${posterUrl}', this)">
              📋 İstek Listesine Ekle
            </button>
          </div>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  container.innerHTML = html;
}

// Önerilen diziyi istek listesine ekle
async function addDiziFromOneri(diziAdi, posterUrl, btnElement) {
  await waitForFirebase();
  
  try {
    const db = window.firebaseDb;
    
    // Dizi zaten var mı kontrol et (Firestore'dan)
    const snapshot = await window.firestoreGetDocs(
      window.firestoreCollection(db, 'istekDiziler')
    );
    
    let diziVar = false;
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.ad && data.ad.toLowerCase() === diziAdi.toLowerCase()) {
        diziVar = true;
      }
    });
    
    if (diziVar) {
      alert('Bu dizi zaten istek listesinde!');
      return;
    }
    
    // Firestore'a ekle
    await window.firestoreAddDoc(
      window.firestoreCollection(db, 'istekDiziler'),
      {
        ad: diziAdi,
        poster: posterUrl,
        olusturulmaTarihi: window.firestoreServerTimestamp()
      }
    );
    
    // Başarı mesajı
    if (btnElement) {
      btnElement.innerHTML = '✅ Eklendi!';
      btnElement.classList.add('eklendi');
      btnElement.disabled = true;
      
      setTimeout(() => {
        btnElement.innerHTML = '📋 İstek Listesine Ekle';
        btnElement.classList.remove('eklendi');
        btnElement.disabled = false;
      }, 2000);
    }
    
    console.log(`📺 "${diziAdi}" istek listesine eklendi`);
  } catch (error) {
    console.error('Dizi eklenirken hata:', error);
    alert('Bir hata oluştu: ' + error.message);
  }
}

// Global fonksiyonlar
window.openDiziOneriModal = openDiziOneriModal;
window.closeDiziOneriModal = closeDiziOneriModal;
window.selectDiziGenre = selectDiziGenre;
window.selectDiziListType = selectDiziListType;
window.loadMoreDiziler = loadMoreDiziler;
window.addDiziFromOneri = addDiziFromOneri;
