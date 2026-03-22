/**
 * UI 層模塊
 * 管理所有 DOM 元素和 UI 狀態
 */

export class UIManager {
  constructor() {
    this.initElements();
    this.setupStyles();
  }

  initElements() {
    // 媒體和文件輸入
    this.mediaInput = document.getElementById('mediaInput');
    this.textInput = document.getElementById('textInput');
    
    // 播放控制
    this.playPause = document.getElementById('playPause');
    this.rewindBtn = document.getElementById('rewind');
    this.reverseBtn = document.getElementById('reverse');
    
    // 縮放和速率控制
    this.zoomSlider = document.getElementById('zoom');
    this.fitZoomBtn = document.getElementById('fitZoom');
    this.rateSelect = document.getElementById('rate');
    
    // 滾動控制
    this.laneViewport = document.getElementById('laneViewport');
    this.scrollLeftBtn = document.getElementById('scrollLeft');
    this.scrollRightBtn = document.getElementById('scrollRight');
    this.scrollPos = document.getElementById('scrollPos');
    
    // 重置按鈕
    this.resetSrtBtn = document.getElementById('resetSrt');
    this.resetQueueBtn = document.getElementById('resetQueue');
    
    // 顯示元素
    this.timeLabel = document.getElementById('timeLabel');
    this.statusEl = document.getElementById('status');
    this.fileNameEl = document.getElementById('fileName');
    
    // 文字稿和導出
    this.scriptBox = document.getElementById('scriptBox');
    this.exportBtn = document.getElementById('exportBtn');
    this.undoBtn = document.getElementById('undoBtn');
    
    // 表格和字幕區域
    this.srtTable = document.getElementById('srtTable');
    this.subtitleTrackInner = document.getElementById('subtitleTrackInner');
    this.waveframe = document.getElementById('waveframe');
    this.lane = document.getElementById('lane');
    this.laneViewport = document.getElementById('laneViewport');
    
    // 選項開關
    this.autoCenterToggle = document.getElementById('autoCenterToggle');
  }

  setupStyles() {
    // 樣式設置可以在這裡進行，但由於 CSS 已在 HTML 中，這裡不需要做什麼
  }

  // ===== 狀態更新方法 =====

  /**
   * 設置狀態消息
   * @param {string} msg - 消息內容
   * @param {string} tone - 消息類型 ('muted', 'ok', 'warn')
   */
  setStatus(msg, tone = 'muted') {
    this.statusEl.textContent = msg;
    const colorMap = {
      'warn': 'var(--danger)',
      'ok': 'var(--success)',
      'muted': 'var(--muted)',
    };
    this.statusEl.style.color = colorMap[tone] || colorMap['muted'];
  }

  /**
   * 設置時間標籤
   * @param {string} timeStr - 時間字串
   */
  setTimeLabel(timeStr) {
    this.timeLabel.textContent = timeStr;
  }

  /**
   * 設置檔案名稱顯示
   * @param {string} fileName - 檔案名稱
   */
  setFileName(fileName) {
    this.fileNameEl.textContent = fileName;
  }

  /**
   * 設置播放/暫停按鈕文本
   * @param {string} text - 按鈕文本
   */
  setPlayButtonText(text) {
    this.playPause.textContent = text;
  }

  /**
   * 啟用/禁用按鈕
   * @param {HTMLElement} btn - 按鈕元素
   * @param {boolean} disabled - 是否禁用
   */
  setButtonDisabled(btn, disabled) {
    btn.disabled = disabled;
  }

  /**
   * 批量啟用/禁用多個按鈕
   * @param {Array<HTMLElement>} buttons - 按鈕陣列
   * @param {boolean} disabled - 是否禁用
   */
  setButtonsDisabled(buttons, disabled) {
    buttons.forEach(btn => {
      btn.disabled = disabled;
    });
  }

  /**
   * 更新縮放滑塊值
   * @param {number} value - 新值
   */
  setZoomValue(value) {
    const clamped = Math.max(
      Number(this.zoomSlider.min),
      Math.min(Number(this.zoomSlider.max), Math.round(value))
    );
    this.zoomSlider.value = clamped;
  }

  /**
   * 更新捲動位置滑塊
   * @param {number} percentage - 百分比 (0-100)
   */
  setScrollPosition(percentage) {
    this.scrollPos.value = percentage;
  }

  /**
   * 清空字幕表格
   */
  clearSrtTable() {
    this.srtTable.innerHTML = '';
  }

  /**
   * 清空字幕區域內容
   */
  clearSubtitleTrack() {
    this.subtitleTrackInner.innerHTML = '';
  }

  /**
   * 設置自動置中開關狀態
   * @param {boolean} checked - 是否選中
   */
  setAutoCenterToggle(checked) {
    this.autoCenterToggle.checked = checked;
  }

  /**
   * 獲得自動置中狀態
   * @returns {boolean}
   */
  isAutoCenterToggled() {
    return this.autoCenterToggle.checked;
  }

  /**
   * 取得文字稿內容
   * @returns {string}
   */
  getScriptContent() {
    return this.scriptBox.value;
  }

  /**
   * 設置文字稿內容
   * @param {string} content - 文字稿內容
   */
  setScriptContent(content) {
    this.scriptBox.value = content;
  }

  /**
   * 取得倍速選擇值
   * @returns {number}
   */
  getPlaybackRate() {
    return Number(this.rateSelect.value) || 1;
  }

  /**
   * 設置倍速選擇值
   * @param {number} rate - 倍速值
   */
  setPlaybackRate(rate) {
    this.rateSelect.value = rate;
  }

  /**
   * 取得縮放值
   * @returns {number}
   */
  getZoomValue() {
    return Number(this.zoomSlider.value);
  }

  /**
   * 取得捲動位置百分比
   * @returns {number}
   */
  getScrollPositionPercent() {
    return Number(this.scrollPos.value);
  }

  /**
   * 取得視口寬度
   * @returns {number}
   */
  getViewportWidth() {
    return this.laneViewport?.clientWidth || 0;
  }

  /**
   * 取得視口捲動寬度
   * @returns {number}
   */
  getViewportScrollWidth() {
    return this.laneViewport?.scrollWidth || 0;
  }

  /**
   * 取得視口當前捲動位置
   * @returns {number}
   */
  getViewportScrollLeft() {
    return this.laneViewport?.scrollLeft || 0;
  }

  /**
   * 設置視口捲動位置
   * @param {number} left - 捲動距離
   */
  setViewportScrollLeft(left) {
    if (this.laneViewport) {
      this.laneViewport.scrollLeft = left;
    }
  }

  // ===== 事件綁定方法 =====

  /**
   * 綁定媒體輸入變更事件
   * @param {Function} handler - 事件處理函數
   */
  onMediaInputChange(handler) {
    this.mediaInput.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (file) handler(file);
    });
  }

  /**
   * 綁定文字輸入變更事件
   * @param {Function} handler - 事件處理函數
   */
  onTextInputChange(handler) {
    this.textInput.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (file) handler(file);
    });
  }

  /**
   * 綁定按鈕點擊事件
   * @param {HTMLElement} btn - 按鈕元素
   * @param {Function} handler - 事件處理函數
   */
  onButtonClick(btn, handler) {
    btn.addEventListener('click', handler);
  }

  /**
   * 綁定視口捲動事件
   * @param {Function} handler - 事件處理函數
   */
  onViewportScroll(handler) {
    this.laneViewport.addEventListener('scroll', handler);
  }

  /**
   * 綁定滑塊輸入事件
   * @param {HTMLElement} slider - 滑塊元素
   * @param {Function} handler - 事件處理函數
   */
  onSliderInput(slider, handler) {
    slider.addEventListener('input', handler);
  }

  /**
   * 綁定選擇框變更事件
   * @param {HTMLElement} select - 選擇框元素
   * @param {Function} handler - 事件處理函數
   */
  onSelectChange(select, handler) {
    select.addEventListener('change', handler);
  }

  /**
   * 綁定切換開關變更事件
   * @param {Function} handler - 事件處理函數
   */
  onToggleChange(handler) {
    this.autoCenterToggle.addEventListener('change', handler);
  }

  /**
   * 綁定文字區域失焦事件
   * @param {Function} handler - 事件處理函數 (text: string) => void
   */
  onScriptBoxBlur(handler) {
    this.scriptBox.addEventListener('blur', () => {
      handler(this.scriptBox.value);
    });
  }

  /**
   * 向 SRT 表格新增一列
   * @param {number} id - 字幕編號
   * @param {string} start - 開始時間
   * @param {string} end - 結束時間
   * @param {string} text - 字幕文字
   * @param {Function} onTextChange - 文字變更回調
   */
  addSrtTableRow(id, start, end, text, onTextChange) {
    const tr = document.createElement('tr');
    
    const idTd = document.createElement('td');
    idTd.textContent = id;
    
    const startTd = document.createElement('td');
    startTd.textContent = start;
    
    const endTd = document.createElement('td');
    endTd.textContent = end;
    
    const textTd = document.createElement('td');
    textTd.className = 'text-cell';
    textTd.contentEditable = 'true';
    textTd.textContent = text;
    textTd.addEventListener('blur', () => {
      const newText = textTd.textContent.trim();
      if (newText !== text) {
        onTextChange(newText);
      }
    });
    
    tr.append(idTd, startTd, endTd, textTd);
    this.srtTable.appendChild(tr);
  }

  /**
   * 新增字幕區塊
   * @param {number} idx - 字幕索引
   * @param {number} left - CSS left 值 (像素)
   * @param {number} width - CSS width 值 (像素)
   * @param {string} text - 字幕文字
   * @param {Function} onBlockMouseDown - 區塊點擊回調
   * @param {Function} onLeftHandleMouseDown - 左側拖手點擊回調
   * @param {Function} onRightHandleMouseDown - 右側拖手點擊回調
   */
  addSubtitleBlock(idx, left, width, text, onBlockMouseDown, onLeftHandleMouseDown, onRightHandleMouseDown) {
    const block = document.createElement('div');
    block.className = 'sub-block';
    block.style.left = `${left}px`;
    block.style.width = `${width}px`;
    block.setAttribute('data-seg-idx', idx);
    
    block.addEventListener('mousedown', (e) => {
      if (!e.target.classList.contains('sub-block-handle')) {
        onBlockMouseDown(e);
      }
    });

    const leftHandle = document.createElement('div');
    leftHandle.className = 'sub-block-handle left';
    leftHandle.setAttribute('data-side', 'left');
    leftHandle.style.cssText = 'width: 6px; min-width: 6px; height: 34px; background: rgba(56, 189, 248, 0.4); display: block; flex-shrink: 0; transition: all 0.2s;';
    leftHandle.addEventListener('mousedown', onLeftHandleMouseDown);

    const textSpan = document.createElement('span');
    textSpan.className = 'sub-block-text';
    textSpan.textContent = text;

    const rightHandle = document.createElement('div');
    rightHandle.className = 'sub-block-handle right';
    rightHandle.setAttribute('data-side', 'right');
    rightHandle.style.cssText = 'width: 6px; min-width: 6px; height: 34px; background: rgba(56, 189, 248, 0.4); display: block; flex-shrink: 0; transition: all 0.2s;';
    rightHandle.addEventListener('mousedown', onRightHandleMouseDown);

    block.appendChild(leftHandle);
    block.appendChild(textSpan);
    block.appendChild(rightHandle);
    this.subtitleTrackInner.appendChild(block);
  }
}

export const uiManager = new UIManager();
