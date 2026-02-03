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

// Global fonksiyonlar - Hikayemiz
window.loadHikayemizPage = loadHikayemizPage;

// Global fonksiyonlar - Timeline
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
