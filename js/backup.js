/* ============================================
   OURHIDDENVERSE - VERİ YEDEKLEME SİSTEMİ
   JSON olarak dışa aktar / içe aktar
   ============================================ */

// Tüm Firestore koleksiyonları
const KOLEKSIYONLAR = [
  'quizCevaplar',
  'quizPuanlar',
  'filmler',
  'izlenenFilmler',
  'diziler',
  'izlenenDiziler',
  'dateler',
  'istekDateler',
  'oyunlar',
  'kitaplar',
  'sehirler',
  'duygular',
  'ozelGunler',
  'bucketList',
  'sarkilar',
  'hikayeler',
  'mektuplar',
  'timeline',
  'calendar',
  'places',
  'restoranlar'
];

// Yedekleme Modal'ını Aç
function openBackupModal() {
  const modal = document.getElementById('backupModal');
  if (modal) {
    modal.classList.add('active');
  }
}

// Yedekleme Modal'ını Kapat
function closeBackupModal() {
  const modal = document.getElementById('backupModal');
  if (modal) {
    modal.classList.remove('active');
  }
}

// Tüm Verileri Dışa Aktar
async function exportAllData() {
  const exportBtn = document.getElementById('exportBtn');
  const statusDiv = document.getElementById('backupStatus');
  
  try {
    exportBtn.disabled = true;
    exportBtn.innerHTML = '<span class="spinner"></span> Yedekleniyor...';
    statusDiv.innerHTML = '<p class="status-info">📦 Veriler toplanıyor...</p>';
    
    await waitForFirebase();
    const db = window.firebaseDb;
    
    const yedek = {
      tarih: new Date().toISOString(),
      versiyon: '1.0',
      uygulama: 'OurHiddenVerse',
      veriler: {}
    };
    
    let toplamKayit = 0;
    
    for (const koleksiyon of KOLEKSIYONLAR) {
      try {
        const snapshot = await window.firestoreGetDocs(
          window.firestoreCollection(db, koleksiyon)
        );
        
        if (!snapshot.empty) {
          yedek.veriler[koleksiyon] = {};
          snapshot.forEach(doc => {
            yedek.veriler[koleksiyon][doc.id] = doc.data();
            toplamKayit++;
          });
        }
      } catch (e) {
        console.log(`${koleksiyon} koleksiyonu boş veya erişilemez`);
      }
    }
    
    // JSON dosyası olarak indir
    const jsonStr = JSON.stringify(yedek, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const tarihStr = new Date().toISOString().split('T')[0];
    const dosyaAdi = `ourhiddenverse-yedek-${tarihStr}.json`;
    
    const a = document.createElement('a');
    a.href = url;
    a.download = dosyaAdi;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    statusDiv.innerHTML = `<p class="status-success">✅ ${toplamKayit} kayıt başarıyla yedeklendi!</p>`;
    showToast(`${toplamKayit} kayıt yedeklendi! 💾`, 'success');
    
  } catch (error) {
    console.error('Yedekleme hatası:', error);
    statusDiv.innerHTML = '<p class="status-error">❌ Yedekleme sırasında hata oluştu!</p>';
    showToast('Yedekleme başarısız!', 'error');
  } finally {
    exportBtn.disabled = false;
    exportBtn.innerHTML = '💾 Yedeği İndir';
  }
}

// Dosya Seç
function selectBackupFile() {
  document.getElementById('backupFileInput').click();
}

// Yedekten Geri Yükle
async function importBackupFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const importBtn = document.getElementById('importBtn');
  const statusDiv = document.getElementById('backupStatus');
  
  try {
    importBtn.disabled = true;
    statusDiv.innerHTML = '<p class="status-info">📂 Dosya okunuyor...</p>';
    
    const text = await file.text();
    const yedek = JSON.parse(text);
    
    // Doğrulama
    if (!yedek.uygulama || yedek.uygulama !== 'OurHiddenVerse') {
      throw new Error('Geçersiz yedek dosyası!');
    }
    
    // Onay iste
    const yedekTarih = new Date(yedek.tarih).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const koleksiyonSayisi = Object.keys(yedek.veriler).length;
    let kayitSayisi = 0;
    for (const kol of Object.values(yedek.veriler)) {
      kayitSayisi += Object.keys(kol).length;
    }
    
    statusDiv.innerHTML = `
      <div class="import-preview">
        <p><strong>📅 Yedek Tarihi:</strong> ${yedekTarih}</p>
        <p><strong>📁 Koleksiyon:</strong> ${koleksiyonSayisi} adet</p>
        <p><strong>📝 Toplam Kayıt:</strong> ${kayitSayisi} adet</p>
        <p class="import-warning">⚠️ Bu işlem mevcut verilerin üzerine yazacak!</p>
        <button class="btn-confirm-import" onclick="confirmImport()">
          ✅ Geri Yüklemeyi Onayla
        </button>
      </div>
    `;
    
    // Yedek verisini geçici olarak sakla
    window.pendingBackup = yedek;
    
  } catch (error) {
    console.error('Dosya okuma hatası:', error);
    statusDiv.innerHTML = '<p class="status-error">❌ Geçersiz yedek dosyası!</p>';
    showToast('Dosya okunamadı!', 'error');
  } finally {
    importBtn.disabled = false;
    event.target.value = '';
  }
}

// Geri Yüklemeyi Onayla
async function confirmImport() {
  const statusDiv = document.getElementById('backupStatus');
  const yedek = window.pendingBackup;
  
  if (!yedek) {
    statusDiv.innerHTML = '<p class="status-error">❌ Yedek verisi bulunamadı!</p>';
    return;
  }
  
  try {
    statusDiv.innerHTML = '<p class="status-info">⏳ Veriler geri yükleniyor...</p>';
    
    await waitForFirebase();
    const db = window.firebaseDb;
    
    let yuklenenKayit = 0;
    
    for (const [koleksiyon, belgeler] of Object.entries(yedek.veriler)) {
      for (const [belgeId, veri] of Object.entries(belgeler)) {
        try {
          await window.firestoreSetDoc(
            window.firestoreDoc(db, koleksiyon, belgeId),
            veri
          );
          yuklenenKayit++;
        } catch (e) {
          console.error(`Hata: ${koleksiyon}/${belgeId}`, e);
        }
      }
    }
    
    statusDiv.innerHTML = `<p class="status-success">✅ ${yuklenenKayit} kayıt başarıyla geri yüklendi!</p>`;
    showToast(`${yuklenenKayit} kayıt geri yüklendi! 🎉`, 'success');
    
    window.pendingBackup = null;
    
    // 2 saniye sonra sayfayı yenile
    setTimeout(() => {
      location.reload();
    }, 2000);
    
  } catch (error) {
    console.error('Geri yükleme hatası:', error);
    statusDiv.innerHTML = '<p class="status-error">❌ Geri yükleme sırasında hata oluştu!</p>';
    showToast('Geri yükleme başarısız!', 'error');
  }
}

// Global scope'a ekle
window.openBackupModal = openBackupModal;
window.closeBackupModal = closeBackupModal;
window.exportAllData = exportAllData;
window.selectBackupFile = selectBackupFile;
window.importBackupFile = importBackupFile;
window.confirmImport = confirmImport;
