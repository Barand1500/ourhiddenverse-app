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
  if (puan >= 4.5) return '#f0b429';
  if (puan >= 3.5) return '#ffd93d';
  if (puan >= 2.5) return '#ffab4c';
  if (puan >= 1.5) return '#ff8243';
  return '#ff6b6b';
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
            <div class="onceki-dateler" id="oncekiDateler">
              <h4>📅 Bu Şehirdeki Date'lerimiz</h4>
              <div class="date-list" id="dateList"></div>
            </div>
            
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
  
  document.getElementById('dateTarih').value = new Date().toISOString().split('T')[0];
  initDateStarRating();
  initHaritaEvents();
  await loadPlacesFromFirebase();
}

// Türkiye haritası SVG path'leri
function generateTurkeyMapPaths() {
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
    
    path.addEventListener('click', () => {
      openSehirModal(path.id, path.dataset.name);
    });
  });
}

// Date yıldız rating
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
window.loadHaritaPage = loadHaritaPage;
window.openSehirModal = openSehirModal;
window.closeSehirModal = closeSehirModal;
window.handleDateEkle = handleDateEkle;
window.deletePlace = deletePlace;
window.zoomIn = zoomIn;
window.zoomOut = zoomOut;
window.resetZoom = resetZoom;
