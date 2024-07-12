export default function openPopup(url: string): void {
  // 创建遮罩层和弹窗的 HTML 结构
  const overlay = document.createElement('div');
  overlay.innerHTML = `
    <div class="popup-overlay">
      <div class="popup-container">
        <div class="popup-iframe-container">
          <iframe src="${url}" class="popup-iframe" sandbox="allow-scripts allow-same-origin"></iframe>
        </div>
        <button class="popup-close-button" title="Close">&times;</button>
        <button class="popup-newtab-button" title="Open in new tab">
          <div class="popup-newtab-icon"></div>
        </button>
      </div>
    </div>
  `;

  // 添加样式
  const style = document.createElement('style');
  style.textContent = `
    .popup-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      // background-color: rgba(0, 0, 0, 0.8);
      background-image: linear-gradient(to top, #a8edea 0%, #fed6e3 100%);
      background-image: linear-gradient(to right, #434343 0%, black 100%);
      background-image: linear-gradient(to right, #eea2a2 0%, #bbc1bf 19%, #57c6e1 42%, #b49fda 79%, #7ac5d8 100%);
      background-image: linear-gradient(to top, #a8edea 0%, #fed6e3 100%);
      background-image: linear-gradient(to top, #fddb92 0%, #d1fdff 100%);
      z-index: 10000;
      display: flex;
      justify-content: center;
      align-items: center;
      transition: opacity 0.3s ease;
      opacity: 0;
    }
    .popup-container {
      position: relative;
      width: 80%;
      height: 80%;
      background-color: white;
      border-radius: 10px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
      transition: transform 0.3s ease;
      transform: scale(0.8);
    }
    .popup-iframe-container {
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
    .popup-iframe {
      width: 100%;
      height: 100%;
      border: none;
      border-radius: 10px 10px 0 0;
      overflow: hidden;
    }
    .popup-close-button, .popup-newtab-button {
      position: absolute;
      right: -40px;
      top: 0px;
      background-color: #ff5c5c;
      border: none;
      color: white;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 18px;
    }
    .popup-newtab-button {
      top: 40px;
      background-color: #5c5cff;
    }
    .popup-newtab-icon{
      width: 10px;
      height: 10px;
      border-radius: 50%;
      border: 2px solid white;
    }
  `;
  document.head.appendChild(style);

  // 关闭弹窗函数
  function closePopup(): void {
    const overlayElement = overlay.querySelector('.popup-overlay') as HTMLElement;
    const popupContainer = overlay.querySelector('.popup-container') as HTMLElement;
    overlayElement.style.opacity = '0';
    popupContainer.style.transform = 'scale(0.4)';
    setTimeout(() => {
      document.body.removeChild(overlay);
    }, 300);
  }

  // 事件监听
  const closeButton = overlay.querySelector('.popup-close-button') as HTMLButtonElement;
  const newTabButton = overlay.querySelector('.popup-newtab-button') as HTMLButtonElement;
  const popupOverlay = overlay.querySelector('.popup-overlay') as HTMLElement;
  const popupContainer = overlay.querySelector('.popup-container') as HTMLElement;
  const iframe = overlay.querySelector('.popup-iframe') as HTMLIFrameElement;

  closeButton.addEventListener('click', closePopup);
  popupOverlay.addEventListener('click', closePopup);
  newTabButton.addEventListener('click', () => {
    window.open(url, '_blank');
  });

  // 阻止点击弹窗内部关闭弹窗
  popupContainer.addEventListener('click', (event: MouseEvent) => {
    event.stopPropagation();
  });

  // 按下ESC关闭弹窗
  document.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      closePopup();
    }
  });

  // 将遮罩层添加到文档主体中
  document.body.appendChild(overlay);

  // 显示弹窗动画
  setTimeout(() => {
    const overlayElement = overlay.querySelector('.popup-overlay') as HTMLElement;
    const popupContainer = overlay.querySelector('.popup-container') as HTMLElement;
    overlayElement.style.opacity = '1';
    popupContainer.style.transform = 'scale(1)';
  }, 10);

  // 等待 iframe 加载完成后，动态添加滚动条样式
  iframe.addEventListener('load', () => {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (iframeDoc) {
      console.log(`🚀 ~ iframe.addEventListener ~ iframeDoc:`, iframeDoc);
      const iframeStyle = iframeDoc.createElement('style');
      iframeStyle.textContent = `
        ::-webkit-scrollbar {
          width: 12px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `;
      iframeDoc.head.appendChild(iframeStyle);
    }
  });
}
