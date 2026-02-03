/* ============================================
   OURHIDDENVERSE - UTILS
   PWA, Modal, Emoji Picker, Firebase yardımcı fonksiyonlar
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

/* ============================================
   FIREBASE YARDIMCI FONKSİYONLAR
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
   GLOBAL FONKSİYONLAR
   ============================================ */
window.installPWA = installPWA;
window.showConfirmModal = showConfirmModal;
window.closeConfirmModal = closeConfirmModal;
window.createEmojiPicker = createEmojiPicker;
window.toggleEmojiPicker = toggleEmojiPicker;
window.insertEmoji = insertEmoji;
window.waitForFirebase = waitForFirebase;

// Sayfa yüklendiğinde başlat
document.addEventListener('DOMContentLoaded', () => {
  initPWA();
});
