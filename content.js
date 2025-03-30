// 創建QR碼容器
function createQRContainer() {
  const container = document.createElement('div');
  container.className = 'qr-container';
  
  const qrDiv = document.createElement('div');
  qrDiv.id = 'qrcode';
  qrDiv.className = 'qr-code';
  
  const siteName = document.createElement('div');
  siteName.className = 'site-name';
  siteName.textContent = new URL(window.location.href).hostname;
  
  const pageTitle = document.createElement('div');
  pageTitle.className = 'page-title';
  pageTitle.textContent = document.title.substring(0, 15) + (document.title.length > 15 ? '...' : '');
  
  container.appendChild(qrDiv);
  container.appendChild(siteName);
  container.appendChild(pageTitle);
  document.body.appendChild(container);
  
  return qrDiv;
}

// 創建小圖標
function createQRIcon(faviconUrl) {
  const icon = document.createElement('img');
  icon.className = 'qr-icon';
  icon.src = faviconUrl;
  icon.alt = 'QR Code';
  document.body.appendChild(icon);
  return icon;
}

// 獲取網站favicon
async function getFavicon() {
  const favicon = document.querySelector('link[rel="icon"]') || 
                 document.querySelector('link[rel="shortcut icon"]');
  if (favicon) {
    return favicon.href;
  }
  return `${window.location.origin}/favicon.ico`;
}

// 下載QR碼圖片
function downloadQRCode(canvas, siteName, pageTitle) {
  try {
    // 創建新的canvas用於下載
    const downloadCanvas = document.createElement('canvas');
    const ctx = downloadCanvas.getContext('2d');
    
    // 設置canvas大小（包含文字區域）
    downloadCanvas.width = 256;
    downloadCanvas.height = 320;
    
    // 繪製白色背景
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, downloadCanvas.width, downloadCanvas.height);
    
    // 繪製QR碼
    ctx.drawImage(canvas, 0, 0);
    
    // 設置並繪製網站名稱
    ctx.font = '14px Arial';
    ctx.fillStyle = '#666';
    ctx.textAlign = 'center';
    ctx.fillText(siteName, downloadCanvas.width / 2, 280);
    
    // 設置並繪製頁面標題
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = '#333';
    ctx.fillText(pageTitle, downloadCanvas.width / 2, 300);
    
    // 創建並觸發下載
    const link = document.createElement('a');
    link.download = `qr-${siteName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
    link.href = downloadCanvas.toDataURL('image/png');
    link.click();
  } catch (error) {
    throw new Error('無法下載圖片');
  }
}

// 生成QR碼
async function generateQRCode() {
  const faviconUrl = await getFavicon();
  const qrDiv = createQRContainer();
  const icon = createQRIcon(faviconUrl);
  const container = qrDiv.parentElement;
  
  const currentUrl = window.location.href;
  const siteName = new URL(window.location.href).hostname;
  const pageTitle = document.title.substring(0, 15) + (document.title.length > 15 ? '...' : '');
  
  // 創建QR碼
  const qr = qrcode(0, 'L'); // 使用較低的錯誤修正級別以減少QR碼密度
  qr.addData(currentUrl);
  qr.make();
  
  // 創建並設置canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 256;
  canvas.height = 256;
  
  // 設置白色背景
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, 256, 256);
  
  // 生成並繪製QR碼
  const qrImage = new Image();
  qrImage.src = qr.createDataURL(6);
  
  // 等待QR碼圖片加載
  await new Promise((resolve) => {
    qrImage.onload = resolve;
  });
  
  // 繪製QR碼（留出邊距）
  const margin = 16;
  const qrSize = 256 - (margin * 2);
  ctx.drawImage(qrImage, margin, margin, qrSize, qrSize);
  
  // 加載網站logo
  const logo = new Image();
  logo.crossOrigin = 'anonymous';  // 添加這行來允許跨域訪問
  logo.src = faviconUrl;
  
  try {
    // 等待logo加載
    await new Promise((resolve, reject) => {
      logo.onload = resolve;
      logo.onerror = () => {
        // 如果加載失敗，使用純文字替代logo
        reject();
      };
    });
    
    // 在QR碼中心繪製logo
    const logoSize = 32;
    const logoX = (256 - logoSize) / 2;
    const logoY = (256 - logoSize) / 2;
    
    // 為logo繪製白色背景
    ctx.fillStyle = 'white';
    ctx.fillRect(logoX - 2, logoY - 2, logoSize + 4, logoSize + 4);
    
    // 繪製logo
    ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
  } catch (error) {
    // 如果logo加載失敗，繪製文字作為替代
    const firstLetter = siteName.charAt(0).toUpperCase();
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(firstLetter, 256/2, 256/2);
  }
  
  // 將完成的QR碼添加到頁面
  qrDiv.innerHTML = '';
  qrDiv.appendChild(canvas);

  // 添加右鍵下載功能
  canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    try {
      downloadQRCode(canvas, siteName, pageTitle);
    } catch (error) {
      // 如果下載失敗，提供備用方案
      alert('無法直接下載圖片。請使用螢幕截圖功能來保存QR碼。');
    }
  });

  // 點擊圖標顯示/隱藏QR碼
  icon.addEventListener('click', () => {
    const isVisible = container.style.display === 'block';
    container.style.display = isVisible ? 'none' : 'block';
  });

  // 點擊其他地方隱藏QR碼
  document.addEventListener('click', (e) => {
    if (!container.contains(e.target) && e.target !== icon) {
      container.style.display = 'none';
    }
  });
}

// 當頁面加載完成時生成QR碼
window.addEventListener('load', generateQRCode); 