/* ============================================
   FİLM ÖNERİ SİSTEMİ - TMDB API
   "İzleyecek film mi arıyorsunuz?"
   ============================================ */

// TMDB API Konfigürasyonu
const TMDB_CONFIG = {
  apiKey: 'b089c4fe09482bc91b7079291b853c21',
  baseUrl: 'https://api.themoviedb.org/3',
  imageBaseUrl: 'https://image.tmdb.org/t/p/w500',
  language: 'tr-TR'
};

// Film türleri (TMDB genre ID'leri)
const FILM_TURLERI = [
  { id: 28, name: 'Aksiyon', emoji: '💥' },
  { id: 12, name: 'Macera', emoji: '🗺️' },
  { id: 16, name: 'Animasyon', emoji: '🎨' },
  { id: 35, name: 'Komedi', emoji: '😂' },
  { id: 80, name: 'Suç', emoji: '🔪' },
  { id: 99, name: 'Belgesel', emoji: '📹' },
  { id: 18, name: 'Drama', emoji: '🎭' },
  { id: 10751, name: 'Aile', emoji: '👨‍👩‍👧' },
  { id: 14, name: 'Fantastik', emoji: '🧙' },
  { id: 36, name: 'Tarih', emoji: '📜' },
  { id: 27, name: 'Korku', emoji: '👻' },
  { id: 10402, name: 'Müzik', emoji: '🎵' },
  { id: 9648, name: 'Gizem', emoji: '🔍' },
  { id: 10749, name: 'Romantik', emoji: '💕' },
  { id: 878, name: 'Bilim Kurgu', emoji: '🚀' },
  { id: 53, name: 'Gerilim', emoji: '😰' },
  { id: 10752, name: 'Savaş', emoji: '⚔️' },
  { id: 37, name: 'Western', emoji: '🤠' }
];

// Öneri cache
let oneriCache = [];
let currentPage = 1;
let currentGenre = null;
let currentListType = 'popular';

// TMDB API'den film getir
async function fetchTMDBFilms(endpoint, params = {}) {
  const queryParams = new URLSearchParams({
    api_key: TMDB_CONFIG.apiKey,
    language: TMDB_CONFIG.language,
    ...params
  });
  
  const url = `${TMDB_CONFIG.baseUrl}${endpoint}?${queryParams}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('TMDB API hatası');
    return await response.json();
  } catch (error) {
    console.error('TMDB API Hatası:', error);
    return null;
  }
}

// Popüler filmleri getir
async function getPopularFilms(page = 1) {
  const data = await fetchTMDBFilms('/movie/popular', { page });
  return data?.results || [];
}

// En çok oy alan filmleri getir
async function getTopRatedFilms(page = 1) {
  const data = await fetchTMDBFilms('/movie/top_rated', { page });
  return data?.results || [];
}

// Türe göre film getir
async function getFilmsByGenre(genreId, page = 1) {
  const data = await fetchTMDBFilms('/discover/movie', {
    with_genres: genreId,
    sort_by: 'popularity.desc',
    page
  });
  return data?.results || [];
}

// Film ara
async function searchFilms(query) {
  const data = await fetchTMDBFilms('/search/movie', { query });
  return data?.results || [];
}

// Rastgele film öner (türe göre)
async function getRandomFilm(genreId = null) {
  const randomPage = Math.floor(Math.random() * 5) + 1;
  let films;
  
  if (genreId) {
    films = await getFilmsByGenre(genreId, randomPage);
  } else {
    films = await getPopularFilms(randomPage);
  }
  
  if (films.length > 0) {
    const randomIndex = Math.floor(Math.random() * films.length);
    return films[randomIndex];
  }
  return null;
}

// Film öneri sayfasını aç
function openFilmOneriModal() {
  // Modal zaten varsa aç
  let modal = document.getElementById('filmOneriModal');
  
  if (!modal) {
    // Modal HTML'i oluştur
    const modalHTML = `
      <div class="modal-overlay film-oneri-modal" id="filmOneriModal">
        <div class="modal-content film-oneri-content">
          <button class="btn-modal-close" onclick="closeFilmOneriModal()">×</button>
          
          <div class="film-oneri-header">
            <span class="oneri-icon">🎬</span>
            <h2>Film Öneri Sistemi</h2>
            <p class="oneri-subtitle">Birlikte izleyecek film mi arıyorsunuz?</p>
          </div>
          
          <!-- Tür Seçimi -->
          <div class="oneri-turler">
            <h4>🎭 Tür Seçin</h4>
            <div class="turler-grid" id="turlerGrid">
              <button class="tur-btn active" data-genre="all" onclick="selectGenre(null)">
                🎲 Hepsi
              </button>
              ${FILM_TURLERI.map(tur => `
                <button class="tur-btn" data-genre="${tur.id}" onclick="selectGenre(${tur.id})">
                  ${tur.emoji} ${tur.name}
                </button>
              `).join('')}
            </div>
          </div>
          
          <!-- Liste Tipi -->
          <div class="oneri-liste-tipi">
            <button class="liste-btn active" data-type="popular" onclick="selectListType('popular')">
              🔥 Popüler
            </button>
            <button class="liste-btn" data-type="top_rated" onclick="selectListType('top_rated')">
              ⭐ En İyi Puanlı
            </button>
            <button class="liste-btn" data-type="random" onclick="selectListType('random')">
              🎲 Rastgele
            </button>
          </div>
          
          <!-- Film Önerileri -->
          <div class="film-oneriler-container" id="filmOnerilerContainer">
            <div class="loading-spinner">
              <div class="spinner"></div>
              <p>Filmler yükleniyor...</p>
            </div>
          </div>
          
          <!-- Daha Fazla Yükle -->
          <div class="oneri-actions" id="oneriActions" style="display: none;">
            <button class="btn-daha-fazla" onclick="loadMoreFilms()">
              📽️ Daha Fazla Film Göster
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    modal = document.getElementById('filmOneriModal');
  }
  
  modal.classList.add('active');
  currentPage = 1;
  currentGenre = null;
  currentListType = 'popular';
  loadFilmOneriler();
}

// Modal kapat
function closeFilmOneriModal() {
  const modal = document.getElementById('filmOneriModal');
  if (modal) {
    modal.classList.remove('active');
  }
}

// Tür seç
function selectGenre(genreId) {
  currentGenre = genreId;
  currentPage = 1;
  
  // Aktif tür butonunu güncelle
  document.querySelectorAll('.tur-btn').forEach(btn => {
    btn.classList.remove('active');
    if ((genreId === null && btn.dataset.genre === 'all') || 
        (btn.dataset.genre == genreId)) {
      btn.classList.add('active');
    }
  });
  
  loadFilmOneriler();
}

// Liste tipi seç
function selectListType(type) {
  currentListType = type;
  currentPage = 1;
  
  document.querySelectorAll('.liste-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.type === type) {
      btn.classList.add('active');
    }
  });
  
  loadFilmOneriler();
}

// Film önerilerini yükle
async function loadFilmOneriler() {
  const container = document.getElementById('filmOnerilerContainer');
  const actionsDiv = document.getElementById('oneriActions');
  
  container.innerHTML = `
    <div class="loading-spinner">
      <div class="spinner"></div>
      <p>Filmler yükleniyor...</p>
    </div>
  `;
  actionsDiv.style.display = 'none';
  
  let films = [];
  
  if (currentListType === 'random') {
    // Rastgele tek film göster
    const film = await getRandomFilm(currentGenre);
    if (film) films = [film];
  } else if (currentListType === 'top_rated') {
    if (currentGenre) {
      // Türe göre en iyi puanlı
      const data = await fetchTMDBFilms('/discover/movie', {
        with_genres: currentGenre,
        sort_by: 'vote_average.desc',
        'vote_count.gte': 100,
        page: currentPage
      });
      films = data?.results || [];
    } else {
      films = await getTopRatedFilms(currentPage);
    }
  } else {
    // Popüler
    if (currentGenre) {
      films = await getFilmsByGenre(currentGenre, currentPage);
    } else {
      films = await getPopularFilms(currentPage);
    }
  }
  
  oneriCache = films;
  renderFilmOneriler(films);
  
  if (currentListType !== 'random' && films.length > 0) {
    actionsDiv.style.display = 'flex';
  }
}

// Daha fazla film yükle
async function loadMoreFilms() {
  currentPage++;
  
  let films = [];
  
  if (currentListType === 'top_rated') {
    if (currentGenre) {
      const data = await fetchTMDBFilms('/discover/movie', {
        with_genres: currentGenre,
        sort_by: 'vote_average.desc',
        'vote_count.gte': 100,
        page: currentPage
      });
      films = data?.results || [];
    } else {
      films = await getTopRatedFilms(currentPage);
    }
  } else {
    if (currentGenre) {
      films = await getFilmsByGenre(currentGenre, currentPage);
    } else {
      films = await getPopularFilms(currentPage);
    }
  }
  
  oneriCache = [...oneriCache, ...films];
  renderFilmOneriler(oneriCache);
}

// Film kartlarını render et
function renderFilmOneriler(films) {
  const container = document.getElementById('filmOnerilerContainer');
  
  if (films.length === 0) {
    container.innerHTML = `
      <div class="oneri-bos">
        <span class="bos-icon">🎬</span>
        <p>Bu kriterlere uygun film bulunamadı</p>
      </div>
    `;
    return;
  }
  
  let html = '<div class="film-oneriler-grid">';
  
  films.forEach(film => {
    const posterUrl = film.poster_path 
      ? `${TMDB_CONFIG.imageBaseUrl}${film.poster_path}`
      : 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 450"><rect fill="%231a1a2e" width="300" height="450"/><text x="150" y="225" fill="%23666" text-anchor="middle" font-size="40">🎬</text></svg>';
    
    const yil = film.release_date ? film.release_date.split('-')[0] : '?';
    const puan = film.vote_average ? film.vote_average.toFixed(1) : '-';
    const ozet = film.overview 
      ? (film.overview.length > 150 ? film.overview.substring(0, 150) + '...' : film.overview)
      : 'Açıklama bulunamadı';
    
    // Film türlerini bul
    const filmTurleri = (film.genre_ids || [])
      .map(id => FILM_TURLERI.find(t => t.id === id))
      .filter(Boolean)
      .slice(0, 3);
    
    html += `
      <div class="film-oneri-kart">
        <div class="film-poster-wrapper">
          <img src="${posterUrl}" alt="${film.title}" class="film-poster" loading="lazy">
          <div class="film-puan-badge">
            <span class="puan-yildiz">⭐</span>
            <span class="puan-deger">${puan}</span>
          </div>
        </div>
        
        <div class="film-oneri-info">
          <h4 class="film-oneri-title">${film.title}</h4>
          <p class="film-oneri-yil">${yil}</p>
          
          <div class="film-turler">
            ${filmTurleri.map(t => `<span class="tur-badge">${t.emoji} ${t.name}</span>`).join('')}
          </div>
          
          <p class="film-ozet">${ozet}</p>
          
          <div class="film-oneri-actions">
            <button class="btn-listeye-ekle" onclick="addFilmFromOneri('${film.title.replace(/'/g, "\\'")}', '${posterUrl}', this)">
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

// Önerilen filmi istek listesine ekle
async function addFilmFromOneri(filmAdi, posterUrl, btnElement) {
  await waitForFirebase();
  
  try {
    const db = window.firebaseDb;
    
    // Film zaten var mı kontrol et (Firestore'dan)
    const snapshot = await window.firestoreGetDocs(
      window.firestoreCollection(db, 'istekFilmler')
    );
    
    let filmVar = false;
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.ad && data.ad.toLowerCase() === filmAdi.toLowerCase()) {
        filmVar = true;
      }
    });
    
    if (filmVar) {
      alert('Bu film zaten istek listesinde!');
      return;
    }
    
    // Firestore'a ekle
    await window.firestoreAddDoc(
      window.firestoreCollection(db, 'istekFilmler'),
      {
        ad: filmAdi,
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
    
    console.log(`🎬 "${filmAdi}" istek listesine eklendi`);
  } catch (error) {
    console.error('Film eklenirken hata:', error);
    alert('Bir hata oluştu: ' + error.message);
  }
}

// Global fonksiyonlar
window.openFilmOneriModal = openFilmOneriModal;
window.closeFilmOneriModal = closeFilmOneriModal;
window.selectGenre = selectGenre;
window.selectListType = selectListType;
window.loadMoreFilms = loadMoreFilms;
window.addFilmFromOneri = addFilmFromOneri;
