/* ============================================
   OURHIDDENVERSE - FOTOĞRAF YÜKLEME
   Cloudinary ile ortak fotoğraf yükleme modülü
   ============================================ */

// Cloudinary Ayarları
const CLOUDINARY_CONFIG = {
  cloudName: 'dwyyymb6u',
  uploadPreset: 'ourhiddenverse'
};

// Cloudinary'e fotoğraf yükle
async function uploadToCloudinary(file, folder = 'ourhiddenverse') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
  formData.append('folder', folder);
  
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
  
  const data = await response.json();
  return data.secure_url;
}

// Foto seçim input'u oluştur (modal içine eklenecek HTML döner)
function createFotoUploadHTML(inputId, previewId) {
  return `
    <div class="foto-upload-wrapper">
      <div class="foto-upload-box" id="${inputId}Box" onclick="document.getElementById('${inputId}').click()">
        <input type="file" id="${inputId}" accept="image/*" onchange="handleFotoPreview('${inputId}', '${previewId}')" style="display: none;">
        <div class="foto-upload-placeholder" id="${inputId}Placeholder">
          <span class="foto-upload-icon">📷</span>
          <span class="foto-upload-text">Fotoğraf Seç</span>
        </div>
        <div class="foto-upload-preview" id="${previewId}" style="display: none;">
          <img id="${previewId}Img" src="" alt="Önizleme">
          <button type="button" class="foto-remove-btn" onclick="removeFotoPreview('${inputId}', '${previewId}')">×</button>
        </div>
      </div>
      <div class="foto-upload-progress" id="${inputId}Progress" style="display: none;">
        <div class="foto-progress-bar">
          <div class="foto-progress-fill" id="${inputId}ProgressFill"></div>
        </div>
        <span class="foto-progress-text" id="${inputId}ProgressText">Yükleniyor...</span>
      </div>
    </div>
  `;
}

// Fotoğraf önizlemesi göster
function handleFotoPreview(inputId, previewId) {
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  const previewImg = document.getElementById(previewId + 'Img');
  const placeholder = document.getElementById(inputId + 'Placeholder');
  
  if (input.files && input.files[0]) {
    const file = input.files[0];
    
    if (!file.type.startsWith('image/')) {
      alert('Lütfen geçerli bir fotoğraf seçin!');
      input.value = '';
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImg.src = e.target.result;
      preview.style.display = 'block';
      placeholder.style.display = 'none';
    };
    reader.readAsDataURL(file);
  }
}

// Fotoğraf önizlemesini kaldır
function removeFotoPreview(inputId, previewId) {
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  const placeholder = document.getElementById(inputId + 'Placeholder');
  
  input.value = '';
  preview.style.display = 'none';
  placeholder.style.display = 'flex';
  
  event.stopPropagation();
}

// Fotoğrafı Cloudinary'e yükle ve URL döndür
async function uploadSelectedFoto(inputId, folder = 'ourhiddenverse') {
  const input = document.getElementById(inputId);
  const progressDiv = document.getElementById(inputId + 'Progress');
  const progressFill = document.getElementById(inputId + 'ProgressFill');
  const progressText = document.getElementById(inputId + 'ProgressText');
  
  if (!input.files || !input.files[0]) {
    return null; // Fotoğraf seçilmemiş
  }
  
  const file = input.files[0];
  
  // Progress göster
  if (progressDiv) {
    progressDiv.style.display = 'block';
    progressFill.style.width = '30%';
    progressText.textContent = 'Yükleniyor...';
  }
  
  try {
    progressFill.style.width = '60%';
    const url = await uploadToCloudinary(file, folder);
    
    progressFill.style.width = '100%';
    progressText.textContent = '✅ Yüklendi!';
    
    setTimeout(() => {
      if (progressDiv) progressDiv.style.display = 'none';
    }, 1000);
    
    return url;
    
  } catch (error) {
    console.error('Fotoğraf yüklenirken hata:', error);
    if (progressDiv) {
      progressText.textContent = '❌ Hata!';
      setTimeout(() => {
        progressDiv.style.display = 'none';
      }, 2000);
    }
    throw error;
  }
}

// Global fonksiyonlar
window.uploadToCloudinary = uploadToCloudinary;
window.createFotoUploadHTML = createFotoUploadHTML;
window.handleFotoPreview = handleFotoPreview;
window.removeFotoPreview = removeFotoPreview;
window.uploadSelectedFoto = uploadSelectedFoto;
