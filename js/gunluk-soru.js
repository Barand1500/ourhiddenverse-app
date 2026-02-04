/* ============================================
   OURHIDDENVERSE - SEVGİLİNİ NE KADAR TANIYORSUN?
   Bilgi yarışması - Doğru/Yanlış puanlama
   ============================================ */

// Soru Havuzu - Bilgi Soruları
const SORU_HAVUZU = [
  // 🍎 Yemek & İçecek
  { id: 1, kategori: 'yemek', soru: 'Sevgilinin en sevdiği meyve nedir?', emoji: '🍎' },
  { id: 2, kategori: 'yemek', soru: 'Sevgilinin en sevdiği yemek nedir?', emoji: '🍕' },
  { id: 3, kategori: 'yemek', soru: 'Sevgilinin en sevdiği içecek nedir?', emoji: '🥤' },
  { id: 4, kategori: 'yemek', soru: 'Sevgilinin en sevdiği tatlı nedir?', emoji: '🍰' },
  { id: 5, kategori: 'yemek', soru: 'Sevgilinin en nefret ettiği yemek nedir?', emoji: '🤢' },
  { id: 6, kategori: 'yemek', soru: 'Sevgilinin sabah kahvaltısında olmazsa olmazı nedir?', emoji: '🍳' },
  { id: 7, kategori: 'yemek', soru: 'Sevgilinin en sevdiği atıştırmalık nedir?', emoji: '🍿' },
  { id: 8, kategori: 'yemek', soru: 'Sevgilinin en sevdiği dondurma çeşidi nedir?', emoji: '🍦' },
  
  
  // 💫 Tercihler
  { id: 9, kategori: 'tercih', soru: 'Sevgilinin en sevdiği renk nedir?', emoji: '🎨' },
  { id: 10, kategori: 'tercih', soru: 'Sevgilinin en sevdiği mevsim hangisi?', emoji: '🌸' },
  { id: 11, kategori: 'tercih', soru: 'Sevgilinin en sevdiği hayvan nedir?', emoji: '🐾' },
  { id: 12, kategori: 'tercih', soru: 'Sevgilinin en sevdiği çiçek nedir?', emoji: '🌹' },
  { id: 13, kategori: 'tercih', soru: 'Sevgilinin en sevdiği koku nedir?', emoji: '👃' },
  { id: 14, kategori: 'tercih', soru: 'Sevgilinin en sevdiği gün hangisi?', emoji: '📅' },
  
  // 🎬 Eğlence
  { id: 15, kategori: 'eglence', soru: 'Sevgilinin en sevdiği film türü nedir?', emoji: '🎬' },
  { id: 16, kategori: 'eglence', soru: 'Sevgilinin en sevdiği şarkıcı kim?', emoji: '🎤' },
  { id: 17, kategori: 'eglence', soru: 'Sevgilinin en sevdiği dizi nedir?', emoji: '📺' },
  { id: 18, kategori: 'eglence', soru: 'Sevgilinin en sevdiği oyun nedir?', emoji: '🎮' },
  { id: 19, kategori: 'eglence', soru: 'Sevgilinin en sevdiği şarkı nedir?', emoji: '🎵' },
  { id: 20, kategori: 'eglence', soru: 'Sevgilinin en sevdiği film hangisi?', emoji: '🎥' },
  
  // 🧠 Kişilik
  { id: 21, kategori: 'kisilik', soru: 'Sevgilinin en büyük korkusu nedir?', emoji: '😨' },
  { id: 22, kategori: 'kisilik', soru: 'Sevgilinin en sinir olduğu şey nedir?', emoji: '😤' },
  { id: 23, kategori: 'kisilik', soru: 'Sevgili stresli olduğunda ne yapar?', emoji: '😰' },
  { id: 24, kategori: 'kisilik', soru: 'Sevgilinin en sevdiği hobi nedir?', emoji: '🎯' },
  { id: 25, kategori: 'kisilik', soru: 'Sevgilinin gizli yeteneği nedir?', emoji: '✨' },
  { id: 26, kategori: 'kisilik', soru: 'Sevgilinin en çok yaptığı hareket nedir?', emoji: '🤷' },
  
  // 🌟 Hayaller
  { id: 27, kategori: 'hayal', soru: 'Sevgilinin hayalindeki tatil yeri neresi?', emoji: '🏝️' },
  { id: 28, kategori: 'hayal', soru: 'Sevgilinin en büyük hayali nedir?', emoji: '💭' },
  { id: 29, kategori: 'hayal', soru: 'Sevgilinin ideal evi nasıl olmalı?', emoji: '🏠' },
  { id: 30, kategori: 'hayal', soru: 'Sevgilinin yapmak istediği çılgın şey nedir?', emoji: '🤪' },
  
  // 🔍 Detaylar
  { id: 31, kategori: 'detay', soru: 'Sevgilinin ayakkabı numarası kaç?', emoji: '👟' },
  { id: 32, kategori: 'detay', soru: 'Sevgilinin burcu ne?', emoji: '♈' },
  { id: 33, kategori: 'detay', soru: 'Sevgilinin göz rengi ne?', emoji: '👁️' },
  { id: 34, kategori: 'detay', soru: 'Sevgilinin en sevdiği parfüm hangisi?', emoji: '🧴' },
  { id: 35, kategori: 'detay', soru: 'Sevgilinin en yakın arkadaşının adı ne?', emoji: '👫' },
  { id: 36, kategori: 'detay', soru: 'Sevgilinin en sevdiği lakabı ne?', emoji: '💕' },
  
  // 💑 İlişki
  { id: 37, kategori: 'iliski', soru: 'İlk buluşmamızda ne giymiştim?', emoji: '👗' },
  { id: 38, kategori: 'iliski', soru: 'Sevgilinde ilk dikkatini çeken şey neydi?', emoji: '👀' },
  { id: 39, kategori: 'iliski', soru: 'Sevgilinin bende en sevdiği özellik ne?', emoji: '💖' },
  { id: 40, kategori: 'iliski', soru: 'Beraber yediğimiz ilk yemek neydi?', emoji: '🍽️' },
  
  // 🔥 Zor Sorular
  { id: 41, kategori: 'zor', soru: 'Sevgilinin çocukluk lakabı neydi?', emoji: '👶' },
  { id: 42, kategori: 'zor', soru: 'Sevgilinin ilk evcil hayvanının adı neydi?', emoji: '🐕' },
  { id: 43, kategori: 'zor', soru: 'Sevgilinin en utandığı anı nedir?', emoji: '🙈' },
  { id: 44, kategori: 'zor', soru: 'Sevgilinin küçükken olmak istediği meslek neydi?', emoji: '👨‍🚀' },
  { id: 45, kategori: 'zor', soru: 'Sevgilinin anneannesinin adı ne?', emoji: '👵' }
];

const KATEGORI_BILGI = {
  'yemek': { isim: 'Yemek & İçecek', renk: '#f97316' },
  'tercih': { isim: 'Tercihler', renk: '#8b5cf6' },
  'eglence': { isim: 'Eğlence', renk: '#ec4899' },
  'kisilik': { isim: 'Kişilik', renk: '#14b8a6' },
  'hayal': { isim: 'Hayaller', renk: '#f59e0b' },
  'detay': { isim: 'Detaylar', renk: '#3b82f6' },
  'iliski': { isim: 'İlişki', renk: '#ef4444' },
  'zor': { isim: 'Zor Sorular', renk: '#dc2626' }
};

// Bugünün tarihini key olarak al
function getTarihKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// Tarih bazlı tutarlı soru seçimi
function getSoruByTarih() {
  const bugun = new Date();
  const seed = bugun.getFullYear() * 10000 + (bugun.getMonth() + 1) * 100 + bugun.getDate();
  return SORU_HAVUZU[seed % SORU_HAVUZU.length];
}

// Tarih formatla
function formatTarih(tarih) {
  const date = new Date(tarih);
  return date.toLocaleDateString('tr-TR', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric',
    weekday: 'long'
  });
}

// Cache
let cevaplarCache = {};
let puanlarCache = { baran: 0, bahar: 0 };

// Ana sayfa yükleme
async function loadGunlukSoruPage() {
  const container = document.getElementById('pageContent');
  if (!container) return;
  
  const soru = getSoruByTarih();
  const kategori = KATEGORI_BILGI[soru.kategori];
  
  container.innerHTML = `
    <div class="quiz-container">
      <!-- Header -->
      <div class="quiz-hero">
        <div class="quiz-hero-bg"></div>
        <div class="quiz-hero-content">
          <h1 class="quiz-title">
            <span class="title-emoji">💕</span>
            Sevgilini Ne Kadar Tanıyorsun?
          </h1>
          <p class="quiz-subtitle">${formatTarih(new Date())}</p>
        </div>
      </div>
      
      <!-- Skor Board -->
      <div class="quiz-scoreboard">
        <div class="score-card baran-score">
          <div class="score-avatar">
            <span>👨</span>
          </div>
          <div class="score-details">
            <span class="score-name">Baran</span>
            <span class="score-points" id="baran-puan">0</span>
          </div>
          <div class="score-badge">puan</div>
        </div>
        
        <div class="score-divider">
          <span class="heart-icon">💖</span>
          <span class="vs-text">VS</span>
        </div>
        
        <div class="score-card bahar-score">
          <div class="score-avatar">
            <span>👩</span>
          </div>
          <div class="score-details">
            <span class="score-name">Bahar</span>
            <span class="score-points" id="bahar-puan">0</span>
          </div>
          <div class="score-badge">puan</div>
        </div>
      </div>
      
      <!-- Günün Sorusu -->
      <div class="question-card">
        <div class="question-header">
          <div class="category-tag" style="--cat-color: ${kategori.renk}">
            <span class="cat-emoji">${soru.emoji}</span>
            <span class="cat-name">${kategori.isim}</span>
          </div>
        </div>
        <div class="question-body">
          <div class="question-icon">❓</div>
          <h2 class="question-text">${soru.soru}</h2>
        </div>
      </div>
      
      <!-- Cevap Alanı -->
      <div class="answers-section" id="answers-section">
        <div class="loading-state">
          <div class="loader"></div>
          <p>Yükleniyor...</p>
        </div>
      </div>
      
      <!-- Geçmiş -->
      <div class="history-section">
        <h3 class="history-title">
          <span class="history-icon">📜</span>
          Geçmiş Sorular
        </h3>
        <div class="history-list" id="history-list"></div>
      </div>
    </div>
  `;
  
  await loadPuanlar();
  await loadCevaplar();
  await loadGecmis();
}

// Puanları yükle
async function loadPuanlar() {
  try {
    await waitForFirebase();
    const db = window.firebaseDb;
    
    const doc = await window.firestoreGetDoc(
      window.firestoreDoc(db, 'quizPuanlar', 'toplam')
    );
    
    if (doc.exists()) {
      puanlarCache = doc.data();
    }
    
    document.getElementById('baran-puan').textContent = puanlarCache.baran || 0;
    document.getElementById('bahar-puan').textContent = puanlarCache.bahar || 0;
  } catch (error) {
    console.error('Puan yükleme hatası:', error);
  }
}

// Cevapları yükle
async function loadCevaplar() {
  const section = document.getElementById('answers-section');
  const tarih = getTarihKey();
  const soru = getSoruByTarih();
  
  try {
    await waitForFirebase();
    const db = window.firebaseDb;
    
    const doc = await window.firestoreGetDoc(
      window.firestoreDoc(db, 'quizCevaplar', tarih)
    );
    
    cevaplarCache = doc.exists() ? doc.data() : {};
    renderCevaplar(soru);
  } catch (error) {
    console.error('Cevap yükleme hatası:', error);
    section.innerHTML = '<p class="error-msg">Yüklenirken hata oluştu</p>';
  }
}

// Cevapları render et
function renderCevaplar(soru) {
  const section = document.getElementById('answers-section');
  const { baranCevap, baharCevap, baranOy, baharOy } = cevaplarCache;
  
  let html = '<div class="answer-cards">';
  
  // === BARAN KARTI ===
  html += `<div class="answer-card baran-card">
    <div class="card-header">
      <span class="card-avatar">👨</span>
      <span class="card-name">Baran</span>
    </div>
    <div class="card-body">`;
  
  if (!baranCevap) {
    html += `
      <div class="answer-input-area">
        <textarea id="baran-input" placeholder="Bahar hakkında cevabını yaz..."></textarea>
        <button class="btn-submit baran-btn" onclick="gonderCevap('baran')">
          ✓ Gönder
        </button>
      </div>`;
  } else {
    html += `<div class="answer-display"><p>"${baranCevap}"</p></div>`;
    
    // Bahar oylayacak
    if (baharCevap && baharOy === undefined) {
      html += `
        <div class="voting-area">
          <p class="voting-question">👩 Bahar, bu cevap doğru mu?</p>
          <div class="voting-buttons">
            <button class="btn-correct" onclick="oyVer('bahar', 'baran', true)">
              ✅ Doğru (+1 puan)
            </button>
            <button class="btn-wrong" onclick="oyVer('bahar', 'baran', false)">
              ❌ Yanlış
            </button>
          </div>
        </div>`;
    } else if (baharOy !== undefined) {
      html += `<div class="vote-result ${baharOy ? 'correct' : 'wrong'}">
        ${baharOy ? '✅ Doğru! +1 puan' : '❌ Yanlış cevap'}
      </div>`;
    }
  }
  
  html += `</div></div>`;
  
  // === BAHAR KARTI ===
  html += `<div class="answer-card bahar-card">
    <div class="card-header">
      <span class="card-avatar">👩</span>
      <span class="card-name">Bahar</span>
    </div>
    <div class="card-body">`;
  
  if (!baharCevap) {
    html += `
      <div class="answer-input-area">
        <textarea id="bahar-input" placeholder="Baran hakkında cevabını yaz..."></textarea>
        <button class="btn-submit bahar-btn" onclick="gonderCevap('bahar')">
          ✓ Gönder
        </button>
      </div>`;
  } else {
    html += `<div class="answer-display"><p>"${baharCevap}"</p></div>`;
    
    // Baran oylayacak
    if (baranCevap && baranOy === undefined) {
      html += `
        <div class="voting-area">
          <p class="voting-question">👨 Baran, bu cevap doğru mu?</p>
          <div class="voting-buttons">
            <button class="btn-correct" onclick="oyVer('baran', 'bahar', true)">
              ✅ Doğru (+1 puan)
            </button>
            <button class="btn-wrong" onclick="oyVer('baran', 'bahar', false)">
              ❌ Yanlış
            </button>
          </div>
        </div>`;
    } else if (baranOy !== undefined) {
      html += `<div class="vote-result ${baranOy ? 'correct' : 'wrong'}">
        ${baranOy ? '✅ Doğru! +1 puan' : '❌ Yanlış cevap'}
      </div>`;
    }
  }
  
  html += `</div></div></div>`;
  
  section.innerHTML = html;
}

// Cevap gönder
async function gonderCevap(kisi) {
  const input = document.getElementById(`${kisi}-input`);
  const cevap = input.value.trim();
  
  if (!cevap) {
    showToast('Lütfen bir cevap yaz!', 'warning');
    return;
  }
  
  const tarih = getTarihKey();
  const soru = getSoruByTarih();
  
  try {
    await waitForFirebase();
    const db = window.firebaseDb;
    
    const updateData = {
      [`${kisi}Cevap`]: cevap,
      soruId: soru.id,
      soru: soru.soru,
      tarih: tarih
    };
    
    await window.firestoreSetDoc(
      window.firestoreDoc(db, 'quizCevaplar', tarih),
      updateData,
      { merge: true }
    );
    
    cevaplarCache[`${kisi}Cevap`] = cevap;
    renderCevaplar(soru);
    showToast('Cevabın kaydedildi! 💕', 'success');
  } catch (error) {
    console.error('Cevap gönderme hatası:', error);
    showToast('Bir hata oluştu!', 'error');
  }
}

// Oy ver (doğru/yanlış)
async function oyVer(oylayan, hedef, dogruMu) {
  const tarih = getTarihKey();
  const soru = getSoruByTarih();
  
  try {
    await waitForFirebase();
    const db = window.firebaseDb;
    
    // Oyu kaydet
    await window.firestoreSetDoc(
      window.firestoreDoc(db, 'quizCevaplar', tarih),
      { [`${oylayan}Oy`]: dogruMu },
      { merge: true }
    );
    
    cevaplarCache[`${oylayan}Oy`] = dogruMu;
    
    // Doğruysa puan ekle
    if (dogruMu) {
      const mevcutPuan = puanlarCache[hedef] || 0;
      puanlarCache[hedef] = mevcutPuan + 1;
      
      await window.firestoreSetDoc(
        window.firestoreDoc(db, 'quizPuanlar', 'toplam'),
        puanlarCache,
        { merge: true }
      );
      
      document.getElementById(`${hedef}-puan`).textContent = puanlarCache[hedef];
      showToast(`${hedef === 'baran' ? 'Baran' : 'Bahar'} +1 puan kazandı! 🎉`, 'success');
    } else {
      showToast('Yanlış olarak işaretlendi', 'info');
    }
    
    renderCevaplar(soru);
  } catch (error) {
    console.error('Oylama hatası:', error);
    showToast('Bir hata oluştu!', 'error');
  }
}

// Geçmiş yükle
async function loadGecmis() {
  const list = document.getElementById('history-list');
  
  try {
    await waitForFirebase();
    const db = window.firebaseDb;
    
    const snapshot = await window.firestoreGetDocs(
      window.firestoreQuery(
        window.firestoreCollection(db, 'quizCevaplar'),
        window.firestoreOrderBy('tarih', 'desc'),
        window.firestoreLimit(10)
      )
    );
    
    if (snapshot.empty) {
      list.innerHTML = '<p class="empty-msg">Henüz geçmiş soru yok</p>';
      return;
    }
    
    const bugun = getTarihKey();
    let html = '';
    
    snapshot.forEach(doc => {
      const data = doc.data();
      if (doc.id === bugun) return;
      
      const soru = SORU_HAVUZU.find(s => s.id === data.soruId) || { emoji: '❓', soru: data.soru };
      
      html += `
        <div class="history-item">
          <div class="history-header">
            <span class="history-emoji">${soru.emoji}</span>
            <span class="history-date">${formatTarih(data.tarih)}</span>
          </div>
          <p class="history-question">${soru.soru}</p>
          <div class="history-answers">
            <div class="history-answer">
              <span class="ha-name">👨 Baran:</span>
              <span class="ha-text">${data.baranCevap || '-'}</span>
              ${data.baharOy !== undefined ? `<span class="ha-result ${data.baharOy ? 'correct' : 'wrong'}">${data.baharOy ? '✅' : '❌'}</span>` : ''}
            </div>
            <div class="history-answer">
              <span class="ha-name">👩 Bahar:</span>
              <span class="ha-text">${data.baharCevap || '-'}</span>
              ${data.baranOy !== undefined ? `<span class="ha-result ${data.baranOy ? 'correct' : 'wrong'}">${data.baranOy ? '✅' : '❌'}</span>` : ''}
            </div>
          </div>
        </div>
      `;
    });
    
    list.innerHTML = html || '<p class="empty-msg">Henüz geçmiş soru yok</p>';
  } catch (error) {
    console.error('Geçmiş yükleme hatası:', error);
    list.innerHTML = '<p class="error-msg">Yüklenirken hata oluştu</p>';
  }
}

// Global scope'a ekle
window.loadGunlukSoruPage = loadGunlukSoruPage;
window.gonderCevap = gonderCevap;
window.oyVer = oyVer;
