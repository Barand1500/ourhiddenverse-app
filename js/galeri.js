/* ============================================
   OURHIDDENVERSE - FOTOĞRAF GALERİSİ
   Cloudinary ile fotoğraf yükleme ve galeri
   ============================================ */

// Cloudinary Ayarları
const CLOUDINARY_CONFIG = {
  cloudName: 'dwyyymb6u',
  uploadPreset: 'ourhiddenverse'
};

// Galeri state
let galeriCache = [];
let selectedPhotos = [];

// Galeri sayfasını yükle
async function loadGaleriPage() {
  const pageContent = document.getElementById('pageContent');
  
  pageContent.innerHTML = `
    <div class="galeri-container">
      <!-- Header -->
      <div class="galeri-header">
        <h2>📸 Anı Albümü</h2>
        <button class="btn-add-photo" onclick="openFotoModal()">
          <span>➕</span> Anı Ekle
        </button>
      </div>
      
      <!-- Filtreler -->
      <div class="galeri-filters">
        <button class="filter-btn active" onclick="filterGaleri('all')">Tümü</button>
        <button class="filter-btn" onclick="filterGaleri('2026')">2026</button>
        <button class="filter-btn" onclick="filterGaleri('2025')">2025</button>
        <button class="filter-btn" onclick="filterGaleri('favorites')">❤️ Favoriler</button>
      </div>
      
      <!-- Galeri Grid -->
      <div class="galeri-grid" id="galeriGrid">
        <div class="loading-spinner">Yükleniyor...</div>
      </div>
      
      <!-- Boş State -->
      <div class="galeri-empty" id="galeriEmpty" style="display: none;">
        <div class="empty-icon">📷</div>
        <h3>Henüz anı eklenmemiş</h3>
        <p>İlk anınızı eklemek için yukarıdaki butona tıklayın</p>
      </div>
      
      <!-- Fotoğraf Ekleme Modal -->
      <div class="modal-overlay" id="fotoModal">
        <div class="modal-content foto-modal">
          <div class="modal-header">
            <h3>📸 Yeni Anı Ekle</h3>
            <button class="btn-modal-close" onclick="closeFotoModal()">×</button>
          </div>
          <div class="foto-modal-body">
            <!-- Fotoğraf Yükleme Alanı -->
            <div class="foto-upload-area" id="fotoUploadArea" onclick="document.getElementById('fotoInput').click()">
              <input type="file" id="fotoInput" accept="image/*" multiple onchange="handleFotoSelect(event)" style="display: none;">
              <div class="upload-placeholder" id="uploadPlaceholder">
                <span class="upload-icon">📁</span>
                <p>Fotoğraf seçmek için tıklayın</p>
                <small>veya sürükleyip bırakın</small>
              </div>
              <div class="upload-preview" id="uploadPreview" style="display: none;"></div>
            </div>
            
            <!-- Yükleme Progress -->
            <div class="upload-progress" id="uploadProgress" style="display: none;">
              <div class="progress-bar">
                <div class="progress-fill" id="progressFill"></div>
              </div>
              <span class="progress-text" id="progressText">Yükleniyor...</span>
            </div>
            
            <!-- Anı Bilgileri -->
            <div class="ani-bilgileri">
              <div class="form-group">
                <label for="aniBaslik">📝 Başlık</label>
                <input type="text" id="aniBaslik" placeholder="Bu anıya bir isim verin..." maxlength="100">
              </div>
              
              <div class="form-group">
                <label for="aniAciklama">💭 Açıklama</label>
                <textarea id="aniAciklama" placeholder="Bu anı hakkında bir şeyler yazın..." maxlength="500"></textarea>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="aniTarih">📅 Tarih</label>
                  <input type="date" id="aniTarih">
                </div>
                <div class="form-group">
                  <label for="aniKategori">🏷️ Kategori</label>
                  <select id="aniKategori">
                    <option value="genel">Genel</option>
                    <option value="date">Date</option>
                    <option value="seyahat">Seyahat</option>
                    <option value="kutlama">Kutlama</option>
                    <option value="gunluk">Günlük</option>
                  </select>
                </div>
              </div>
            </div>
            
            <button class="btn-kaydet" id="btnKaydetAni" onclick="saveAni()" disabled>
              💾 Anıyı Kaydet
            </button>
          </div>
        </div>
      </div>
      
      <!-- Fotoğraf Görüntüleme Modal (Lightbox) -->
      <div class="lightbox-overlay" id="lightboxModal" onclick="closeLightbox(event)">
        <div class="lightbox-content">
          <button class="lightbox-close" onclick="closeLightbox()">×</button>
          <button class="lightbox-nav prev" onclick="navigateLightbox(-1)">❮</button>
          <div class="lightbox-image-container">
            <img id="lightboxImage" src="" alt="">
          </div>
          <button class="lightbox-nav next" onclick="navigateLightbox(1)">❯</button>
          <div class="lightbox-info" id="lightboxInfo">
            <h3 id="lightboxTitle"></h3>
            <p id="lightboxDesc"></p>
            <span id="lightboxDate"></span>
          </div>
          <div class="lightbox-actions">
            <button class="lightbox-btn" onclick="toggleFavorite()" id="btnFavorite">🤍</button>
            <button class="lightbox-btn delete" onclick="deleteAni()">🗑️</button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Tarih alanını bugüne ayarla
  document.getElementById('aniTarih').value = new Date().toISOString().split('T')[0];
  
  // Drag & Drop
  setupDragDrop();
  
  // Galeriyi yükle
  await loadGaleriFromFirebase();
}

// Drag & Drop kurulumu
function setupDragDrop() {
  const uploadArea = document.getElementById('fotoUploadArea');
  
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    uploadArea.addEventListener(eventName, preventDefaults, false);
  });
  
  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }
  
  ['dragenter', 'dragover'].forEach(eventName => {
    uploadArea.addEventListener(eventName, () => {
      uploadArea.classList.add('drag-over');
    }, false);
  });
  
  ['dragleave', 'drop'].forEach(eventName => {
    uploadArea.addEventListener(eventName, () => {
      uploadArea.classList.remove('drag-over');
    }, false);
  });
  
  uploadArea.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    handleFiles(files);
  }, false);
}

// Fotoğraf seçildiğinde
function handleFotoSelect(event) {
  const files = event.target.files;
  handleFiles(files);
}

// Dosyaları işle
function handleFiles(files) {
  selectedPhotos = Array.from(files).filter(file => file.type.startsWith('image/'));
  
  if (selectedPhotos.length === 0) {
    alert('Lütfen geçerli bir fotoğraf seçin!');
    return;
  }
  
  // Önizleme göster
  const placeholder = document.getElementById('uploadPlaceholder');
  const preview = document.getElementById('uploadPreview');
  const btnKaydet = document.getElementById('btnKaydetAni');
  
  placeholder.style.display = 'none';
  preview.style.display = 'grid';
  preview.innerHTML = '';
  
  selectedPhotos.forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      preview.innerHTML += `
        <div class="preview-item">
          <img src="${e.target.result}" alt="Preview ${index + 1}">
          <button class="preview-remove" onclick="removePreview(${index})">×</button>
        </div>
      `;
    };
    reader.readAsDataURL(file);
  });
  
  btnKaydet.disabled = false;
}

// Önizlemeden kaldır
function removePreview(index) {
  selectedPhotos.splice(index, 1);
  
  if (selectedPhotos.length === 0) {
    document.getElementById('uploadPlaceholder').style.display = 'flex';
    document.getElementById('uploadPreview').style.display = 'none';
    document.getElementById('btnKaydetAni').disabled = true;
  } else {
    // Yeniden render
    handleFiles(selectedPhotos);
  }
}

// Cloudinary'e yükle
async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
  formData.append('folder', 'ourhiddenverse');
  
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData
    }
  );
  
  if (!response.ok) {
    throw new Error('Yükleme başarısız!');
  }
  
  return await response.json();
}

// Anıyı kaydet
async function saveAni() {
  if (selectedPhotos.length === 0) {
    alert('Lütfen en az bir fotoğraf seçin!');
    return;
  }
  
  const baslik = document.getElementById('aniBaslik').value.trim() || 'İsimsiz Anı';
  const aciklama = document.getElementById('aniAciklama').value.trim();
  const tarih = document.getElementById('aniTarih').value;
  const kategori = document.getElementById('aniKategori').value;
  
  const progressDiv = document.getElementById('uploadProgress');
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');
  const btnKaydet = document.getElementById('btnKaydetAni');
  
  progressDiv.style.display = 'block';
  btnKaydet.disabled = true;
  btnKaydet.innerHTML = '<span class="spinner"></span> Yükleniyor...';
  
  try {
    const uploadedUrls = [];
    
    for (let i = 0; i < selectedPhotos.length; i++) {
      progressText.textContent = `Yükleniyor... (${i + 1}/${selectedPhotos.length})`;
      progressFill.style.width = `${((i + 1) / selectedPhotos.length) * 100}%`;
      
      const result = await uploadToCloudinary(selectedPhotos[i]);
      uploadedUrls.push({
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height
      });
    }
    
    // Firestore'a kaydet
    await waitForFirebase();
    const db = window.firebaseDb;
    
    const aniData = {
      baslik,
      aciklama,
      tarih,
      kategori,
      fotograflar: uploadedUrls,
      favori: false,
      createdAt: window.firestoreServerTimestamp()
    };
    
    await window.firestoreAddDoc(
      window.firestoreCollection(db, 'galeri'),
      aniData
    );
    
    progressText.textContent = '✅ Başarıyla kaydedildi!';
    
    setTimeout(() => {
      closeFotoModal();
      loadGaleriFromFirebase();
    }, 1000);
    
  } catch (error) {
    console.error('Yükleme hatası:', error);
    alert('Yükleme sırasında bir hata oluştu: ' + error.message);
    progressDiv.style.display = 'none';
    btnKaydet.disabled = false;
    btnKaydet.innerHTML = '💾 Anıyı Kaydet';
  }
}

// Firebase'den galeriyi yükle
async function loadGaleriFromFirebase() {
  await waitForFirebase();
  
  try {
    const db = window.firebaseDb;
    const galeriSnapshot = await window.firestoreGetDocs(
      window.firestoreQuery(
        window.firestoreCollection(db, 'galeri'),
        window.firestoreOrderBy('createdAt', 'desc')
      )
    );
    
    galeriCache = [];
    galeriSnapshot.forEach(doc => {
      galeriCache.push({ id: doc.id, ...doc.data() });
    });
    
    renderGaleri(galeriCache);
    console.log(`📸 Galeri yüklendi: ${galeriCache.length} anı`);
    
  } catch (error) {
    console.error('Galeri yüklenirken hata:', error);
  }
}

// Galeriyi render et
function renderGaleri(anilar) {
  const grid = document.getElementById('galeriGrid');
  const empty = document.getElementById('galeriEmpty');
  
  if (anilar.length === 0) {
    grid.style.display = 'none';
    empty.style.display = 'flex';
    return;
  }
  
  grid.style.display = 'grid';
  empty.style.display = 'none';
  
  grid.innerHTML = anilar.map((ani, index) => {
    const ilkFoto = ani.fotograflar?.[0];
    const tarihStr = ani.tarih ? new Date(ani.tarih).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }) : '';
    
    return `
      <div class="galeri-item" onclick="openLightbox(${index})">
        <div class="galeri-image">
          <img src="${ilkFoto?.url || ''}" alt="${ani.baslik}" loading="lazy">
          ${ani.fotograflar?.length > 1 ? `<span class="foto-count">+${ani.fotograflar.length - 1}</span>` : ''}
          ${ani.favori ? '<span class="favori-badge">❤️</span>' : ''}
        </div>
        <div class="galeri-info">
          <h4>${ani.baslik}</h4>
          <span class="galeri-date">${tarihStr}</span>
        </div>
      </div>
    `;
  }).join('');
}

// Filtrele
function filterGaleri(filter) {
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  
  let filtered = galeriCache;
  
  if (filter === 'favorites') {
    filtered = galeriCache.filter(ani => ani.favori);
  } else if (filter !== 'all') {
    filtered = galeriCache.filter(ani => ani.tarih?.startsWith(filter));
  }
  
  renderGaleri(filtered);
}

// Lightbox değişkenleri
let currentLightboxIndex = 0;
let currentPhotoIndex = 0;

// Lightbox aç
function openLightbox(index) {
  currentLightboxIndex = index;
  currentPhotoIndex = 0;
  
  const ani = galeriCache[index];
  if (!ani) return;
  
  const modal = document.getElementById('lightboxModal');
  const img = document.getElementById('lightboxImage');
  const title = document.getElementById('lightboxTitle');
  const desc = document.getElementById('lightboxDesc');
  const date = document.getElementById('lightboxDate');
  const favBtn = document.getElementById('btnFavorite');
  
  img.src = ani.fotograflar[currentPhotoIndex]?.url || '';
  title.textContent = ani.baslik;
  desc.textContent = ani.aciklama || '';
  date.textContent = ani.tarih ? new Date(ani.tarih).toLocaleDateString('tr-TR') : '';
  favBtn.textContent = ani.favori ? '❤️' : '🤍';
  
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

// Lightbox kapat
function closeLightbox(event) {
  if (event && event.target !== event.currentTarget) return;
  
  document.getElementById('lightboxModal').classList.remove('active');
  document.body.style.overflow = '';
}

// Lightbox navigasyon
function navigateLightbox(direction) {
  const ani = galeriCache[currentLightboxIndex];
  if (!ani) return;
  
  const totalPhotos = ani.fotograflar.length;
  currentPhotoIndex = (currentPhotoIndex + direction + totalPhotos) % totalPhotos;
  
  document.getElementById('lightboxImage').src = ani.fotograflar[currentPhotoIndex]?.url || '';
}

// Favori toggle
async function toggleFavorite() {
  const ani = galeriCache[currentLightboxIndex];
  if (!ani) return;
  
  await waitForFirebase();
  const db = window.firebaseDb;
  
  try {
    const newFavori = !ani.favori;
    
    await window.firestoreUpdateDoc(
      window.firestoreDoc(db, 'galeri', ani.id),
      { favori: newFavori }
    );
    
    galeriCache[currentLightboxIndex].favori = newFavori;
    document.getElementById('btnFavorite').textContent = newFavori ? '❤️' : '🤍';
    
    renderGaleri(galeriCache);
    
  } catch (error) {
    console.error('Favori güncellenirken hata:', error);
  }
}

// Anı sil
async function deleteAni() {
  const ani = galeriCache[currentLightboxIndex];
  if (!ani) return;
  
  if (!confirm(`"${ani.baslik}" anısını silmek istediğinize emin misiniz?`)) return;
  
  await waitForFirebase();
  const db = window.firebaseDb;
  
  try {
    await window.firestoreDeleteDoc(
      window.firestoreDoc(db, 'galeri', ani.id)
    );
    
    closeLightbox();
    await loadGaleriFromFirebase();
    
  } catch (error) {
    console.error('Anı silinirken hata:', error);
    alert('Silme işlemi başarısız!');
  }
}

// Modal aç/kapat
function openFotoModal() {
  // Reset form
  selectedPhotos = [];
  document.getElementById('fotoInput').value = '';
  document.getElementById('uploadPlaceholder').style.display = 'flex';
  document.getElementById('uploadPreview').style.display = 'none';
  document.getElementById('uploadProgress').style.display = 'none';
  document.getElementById('aniBaslik').value = '';
  document.getElementById('aniAciklama').value = '';
  document.getElementById('aniTarih').value = new Date().toISOString().split('T')[0];
  document.getElementById('aniKategori').value = 'genel';
  document.getElementById('btnKaydetAni').disabled = true;
  document.getElementById('btnKaydetAni').innerHTML = '💾 Anıyı Kaydet';
  
  document.getElementById('fotoModal').classList.add('active');
}

function closeFotoModal() {
  document.getElementById('fotoModal').classList.remove('active');
}

// Global fonksiyonlar
window.loadGaleriPage = loadGaleriPage;
window.openFotoModal = openFotoModal;
window.closeFotoModal = closeFotoModal;
window.handleFotoSelect = handleFotoSelect;
window.removePreview = removePreview;
window.saveAni = saveAni;
window.filterGaleri = filterGaleri;
window.openLightbox = openLightbox;
window.closeLightbox = closeLightbox;
window.navigateLightbox = navigateLightbox;
window.toggleFavorite = toggleFavorite;
window.deleteAni = deleteAni;
