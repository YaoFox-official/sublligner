/**
 * 主應用程式入口
 * 組合所有模塊並綁定事件
 */

import { stateManager } from './state.js';
import { uiManager } from './ui.js';
import { subtitleManager } from './subtitleManager.js';
import { audioPlayer } from './audioPlayer.js';
import { dragAndRenderManager } from './dragAndRender.js';
import { fileManager } from './fileManager.js';

class Application {
  constructor() {
    this.init();
  }

  init() {
    // 初始化波形圖
    audioPlayer.initWaveform();
    
    // 重建隊列
    fileManager.rebuildQueue();
    
    // 綁定所有事件
    this.bindEvents();
  }

  bindEvents() {
    // ===== 文件輸入事件 =====
    uiManager.onMediaInputChange((file) => {
      fileManager.loadMediaFile(file);
    });

    uiManager.onTextInputChange((file) => {
      fileManager.loadTextFile(file);
    });

    // ===== 播放控制事件 =====
    uiManager.onButtonClick(uiManager.playPause, () => {
      audioPlayer.togglePlayPause();
    });

    uiManager.onButtonClick(uiManager.rewindBtn, () => {
      audioPlayer.rewind();
    });

    uiManager.onButtonClick(uiManager.reverseBtn, () => {
      audioPlayer.toggleReverse();
    });

    // ===== 縮放和速率控制事件 =====
    uiManager.onSliderInput(uiManager.zoomSlider, (e) => {
      if (!stateManager.wave) return;
      const pxPerSec = Math.max(1, Number(e.target.value));
      const currentTime = stateManager.wave.getCurrentTime() || 0;
      audioPlayer.applyZoom(pxPerSec);
      
      // 計算播放頭位置使其置中
      const pxPerSecNew = audioPlayer.getPxPerSec();
      const playheadPx = currentTime * pxPerSecNew;
      const viewportWidth = uiManager.getViewportWidth();
      const centerPos = playheadPx - viewportWidth / 2;
      const maxScroll = Math.max(0, uiManager.getViewportScrollWidth() - viewportWidth);
      const targetScroll = Math.max(0, Math.min(centerPos, maxScroll));
      
      uiManager.setViewportScrollLeft(targetScroll);
      audioPlayer.syncWaveScroll(targetScroll);
      audioPlayer.updateScrollControls();
    });

    uiManager.onButtonClick(uiManager.fitZoomBtn, () => {
      audioPlayer.bestFitZoom();
      dragAndRenderManager.renderSubtitleBlocks();
    });

    uiManager.onSelectChange(uiManager.rateSelect, (e) => {
      const rate = Number(e.target.value) || 1;
      audioPlayer.setPlaybackRate(rate);
    });

    // ===== 滾動控制事件 =====
    uiManager.onSliderInput(uiManager.scrollPos, (e) => {
      const ratio = Number(e.target.value) / 100;
      audioPlayer.applyScrollRatio(ratio);
    });

    uiManager.onButtonClick(uiManager.scrollLeftBtn, () => {
      audioPlayer.scrollByStep('left');
    });

    uiManager.onButtonClick(uiManager.scrollRightBtn, () => {
      audioPlayer.scrollByStep('right');
    });

    uiManager.onViewportScroll(() => {
      audioPlayer.updateScrollControls();
    });

    // ===== SRT 和隊列事件 =====
    uiManager.onButtonClick(uiManager.exportBtn, () => {
      fileManager.exportSrt();
    });

    uiManager.onButtonClick(uiManager.undoBtn, () => {
      fileManager.undo();
    });

    uiManager.onButtonClick(uiManager.resetSrtBtn, () => {
      fileManager.reset();
    });

    uiManager.onButtonClick(uiManager.resetQueueBtn, () => {
      fileManager.rebuildQueue();
    });

    // ===== 選項開關事件 =====
    uiManager.onToggleChange((e) => {
      stateManager.autoCenterPlayhead = e.target.checked;
      const status = stateManager.autoCenterPlayhead ? '已啟用播放頭置中' : '已禁用播放頭置中';
      uiManager.setStatus(status, 'ok');
    });

    // ===== 鍵盤快捷鍵 =====
    document.addEventListener('keydown', (e) => {
      if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        fileManager.insertSubtitle();
      }
    });

    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        fileManager.undo();
      }
    });
  }
}

// 應用啟動
const app = new Application();
