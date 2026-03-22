/**
 * 音頻播放模塊
 * 處理波形圖初始化、播放控制、倒放等功能
 */

import { formatTime } from './utils.js';
import { stateManager } from './state.js';
import { uiManager } from './ui.js';
import { dragAndRenderManager } from './dragAndRender.js';

export class AudioPlayer {
  /**
   * 初始化波形圖
   */
  initWaveform() {
    if (typeof WaveSurfer === 'undefined') {
      uiManager.setStatus('WaveSurfer 載入失敗，請檢查網路或 CDN', 'warn');
      return;
    }

    const wave = WaveSurfer.create({
      container: '#waveform',
      backend: 'WebAudio',
      waveColor: '#38bdf8',
      progressColor: '#22c55e',
      height: 150,
      normalize: true,
      barWidth: 0,
      fillParent: false,
      autoScroll: false,
      autoCenter: false,
      partialRender: true,
    });

    wave.on('error', (e) => {
      uiManager.setStatus(`Wave error: ${e}`, 'warn');
    });

    wave.on('ready', () => this.onWaveReady(wave));
    wave.on('audioprocess', () => this.onAudioProcess(wave));
    wave.on('finish', () => this.onPlayFinish());

    stateManager.setWave(wave);
  }

  /**
   * 波形圖準備完成的回調
   * @param {Object} wave - WaveSurfer 實例
   */
  onWaveReady(wave) {
    const dur = wave.getDuration();
    const backend = wave.backend;
    stateManager.setMediaDuration(dur);
    stateManager.setOriginalBuffer(backend && backend.buffer ? backend.buffer : null);
    
    const wrapper = wave?.drawer?.wrapper;
    if (wrapper) {
      wrapper.style.position = 'absolute';
      wrapper.style.left = '0';
      wrapper.style.top = '0';
    }

    this.updatePlayerUI();
    this.syncTrackWidth();
    this.bestFitZoom();
  }

  /**
   * 音頻處理的回調
   * @param {Object} wave - WaveSurfer 實例
   */
  onAudioProcess(wave) {
    const t = wave.getCurrentTime();
    uiManager.setTimeLabel(`${formatTime(t)}/${formatTime(stateManager.mediaDuration)}`);
    
    if (uiManager.isAutoCenterToggled() && wave.isPlaying()) {
      this.autoCenterPlayhead();
    }
  }

  /**
   * 播放完成的回調
   */
  onPlayFinish() {
    uiManager.setPlayButtonText('開始');
  }

  /**
   * 自動置中播放頭
   */
  autoCenterPlayhead() {
    const wave = stateManager.wave;
    if (!wave) return;

    const t = wave.getCurrentTime();
    const pxPerSec = stateManager.getPxPerSec();
    const playheadPx = t * pxPerSec;
    const viewportWidth = uiManager.getViewportWidth();
    const centerPos = playheadPx - viewportWidth / 2;
    const maxScroll = Math.max(0, uiManager.getViewportScrollWidth() - viewportWidth);
    const targetScroll = Math.max(0, Math.min(centerPos, maxScroll));
    
    uiManager.setViewportScrollLeft(targetScroll);
    this.syncWaveScroll(targetScroll);
    this.updateScrollControls();
  }

  /**
   * 更新播放器 UI
   */
  updatePlayerUI() {
    const wave = stateManager.wave;
    const hasBuffer = stateManager.originalBuffer;

    uiManager.setButtonDisabled(uiManager.playPause, false);
    uiManager.setButtonDisabled(uiManager.rewindBtn, false);
    uiManager.setButtonDisabled(uiManager.reverseBtn, !hasBuffer);
    uiManager.setButtonDisabled(uiManager.fitZoomBtn, false);
    uiManager.setTimeLabel(`${formatTime(0)}/${formatTime(stateManager.mediaDuration)}`);
    
    const statusMsg = hasBuffer
      ? '媒體已就緒，開始播放後按 T 插入字幕'
      : '媒體已就緒（若需倒放請改用較小檔案或重新載入）';
    uiManager.setStatus(statusMsg);
  }

  /**
   * 同步波形圖捲動位置
   * @param {number} left - 捲動距離
   */
  syncWaveScroll(left) {
    const wrapper = stateManager.wave?.drawer?.wrapper;
    if (wrapper) {
      wrapper.scrollLeft = left;
    }
  }

  /**
   * 同步軌道寬度
   */
  syncTrackWidth() {
    const wave = stateManager.wave;
    const mediaDuration = stateManager.mediaDuration;
    
    if (!wave || !mediaDuration) return;

    const pxPerSec = stateManager.getPxPerSec();
    const width = Math.max(mediaDuration * pxPerSec, uiManager.getViewportWidth());
    
    uiManager.subtitleTrackInner.style.width = `${width}px`;
    if (uiManager.waveframe) {
      uiManager.waveframe.style.width = `${width}px`;
    }

    const wrapper = wave?.drawer?.wrapper;
    if (wrapper) {
      wrapper.style.width = `${width}px`;
      wrapper.style.height = '150px';
    }

    this.updateScrollControls();
  }

  /**
   * 計算像素/秒
   * @returns {number}
   */
  getPxPerSec() {
    const wave = stateManager.wave;
    const mediaDuration = stateManager.mediaDuration;
    
    if (!wave || !mediaDuration) return 1;

    const byParam = wave.params?.minPxPerSec || 0;
    const byWidth = wave.drawer?.width ? wave.drawer.width / mediaDuration : 0;
    return Math.max(1, stateManager.getPxPerSec() || byParam || byWidth || 1);
  }

  /**
   * 應用縮放
   * @param {number} pxPerSec - 每秒像素數
   */
  applyZoom(pxPerSec) {
    const wave = stateManager.wave;
    const mediaDuration = stateManager.mediaDuration;
    
    if (!wave || !mediaDuration) return;

    const safePxPerSec = Math.max(1, pxPerSec);
    stateManager.setPxPerSec(safePxPerSec);
    wave.zoom(safePxPerSec);
    uiManager.setZoomValue(safePxPerSec);
    
    this.syncTrackWidth();
    dragAndRenderManager.renderSubtitleBlocks();
    this.updateScrollControls();
  }

  /**
   * 最佳適配縮放
   */
  bestFitZoom() {
    const wave = stateManager.wave;
    const mediaDuration = stateManager.mediaDuration;
    
    if (!wave || !mediaDuration || mediaDuration <= 0) return;

    const viewport = Math.max(1, uiManager.getViewportWidth() || 1);
    const pxPerSec = Math.max(1, viewport / mediaDuration);
    this.applyZoom(pxPerSec);
    uiManager.setViewportScrollLeft(0);
    this.syncWaveScroll(0);
    this.updateScrollControls();
  }

  /**
   * 更新捲動控制的狀態
   */
  updateScrollControls() {
    const maxScroll = Math.max(0, uiManager.getViewportScrollWidth() - uiManager.getViewportWidth());
    const scrollLeft = uiManager.getViewportScrollLeft();
    const atStart = scrollLeft <= 1;
    const atEnd = scrollLeft >= maxScroll - 1;

    uiManager.setButtonDisabled(uiManager.scrollLeftBtn, maxScroll === 0 || atStart);
    uiManager.setButtonDisabled(uiManager.scrollRightBtn, maxScroll === 0 || atEnd);
    uiManager.setButtonDisabled(uiManager.scrollPos, maxScroll === 0);
    
    const percentage = maxScroll === 0 ? 0 : Math.round((scrollLeft / maxScroll) * 100);
    uiManager.setScrollPosition(percentage);
    this.syncWaveScroll(scrollLeft);
  }

  /**
   * 播放/暫停切換
   */
  togglePlayPause() {
    const wave = stateManager.wave;
    if (!wave) return;

    wave.playPause();
    uiManager.setPlayButtonText(wave.isPlaying() ? '停止' : '開始');
  }

  /**
   * 重繞到開頭
   */
  rewind() {
    const wave = stateManager.wave;
    if (!wave) return;

    wave.pause();
    wave.seekTo(0);
    uiManager.setPlayButtonText('開始');
    uiManager.setViewportScrollLeft(0);
    this.updateScrollControls();
  }

  /**
   * 倒放切換
   */
  toggleReverse() {
    const wave = stateManager.wave;
    const originalBuffer = stateManager.originalBuffer;
    
    if (!wave || !originalBuffer) return;

    const currentTime = wave.getCurrentTime();
    const forwardDuration = stateManager.mediaDuration || wave.getDuration();
    const targetBuffer = stateManager.isReversed ? originalBuffer : this.ensureReversedBuffer();
    const newTime = stateManager.isReversed ? currentTime : Math.max(0, forwardDuration - currentTime);
    
    stateManager.setIsReversed(!stateManager.isReversed);
    wave.pause();
    wave.empty();

    const onReady = () => {
      stateManager.setMediaDuration(wave.getDuration());
      this.syncTrackWidth();
      this.updateScrollControls();
      
      const seekRatio = stateManager.mediaDuration ? Math.min(1, newTime / stateManager.mediaDuration) : 0;
      wave.seekTo(seekRatio);
      wave.setPlaybackRate(stateManager.playbackRate, true);
      uiManager.setPlayButtonText('停止');
      wave.play();
      uiManager.setStatus(stateManager.isReversed ? '倒放中' : '正放中');
      wave.un('ready', onReady);
    };

    wave.on('ready', onReady);
    wave.loadDecodedBuffer(targetBuffer);
  }

  /**
   * 確保倒放緩衝區存在
   * @returns {Object} 倒放緩衝區
   */
  ensureReversedBuffer() {
    if (stateManager.reversedBuffer || !stateManager.originalBuffer || !stateManager.wave?.backend?.ac) {
      return stateManager.reversedBuffer;
    }

    const src = stateManager.originalBuffer;
    const ac = stateManager.wave.backend.ac;
    const rev = ac.createBuffer(src.numberOfChannels, src.length, src.sampleRate);

    for (let ch = 0; ch < src.numberOfChannels; ch += 1) {
      const srcData = src.getChannelData(ch);
      const dstData = rev.getChannelData(ch);
      for (let i = 0, len = src.length; i < len; i += 1) {
        dstData[i] = srcData[len - i - 1];
      }
    }

    stateManager.reversedBuffer = rev;
    return stateManager.reversedBuffer;
  }

  /**
   * 設置播放速率
   * @param {number} rate - 播放速率倍數
   */
  setPlaybackRate(rate) {
    stateManager.setPlaybackRate(rate);
    const wave = stateManager.wave;
    if (wave) {
      wave.setPlaybackRate(rate, true);
    }
  }

  /**
   * 捲動指定步長
   * @param {string} direction - 捲動方向 ('left' 或 'right')
   */
  scrollByStep(direction) {
    const SCROLL_STEP_FACTOR = 0.25;
    const step = uiManager.getViewportWidth() * SCROLL_STEP_FACTOR;
    const maxScroll = Math.max(0, uiManager.getViewportScrollWidth() - uiManager.getViewportWidth());
    const currentScroll = uiManager.getViewportScrollLeft();
    const next = direction === 'left' ? currentScroll - step : currentScroll + step;
    const clamped = Math.min(maxScroll, Math.max(0, next));
    
    uiManager.setViewportScrollLeft(clamped);
    this.syncWaveScroll(clamped);
    this.updateScrollControls();
  }

  /**
   * 應用捲動位置比例
   * @param {number} ratio - 比例 (0-1)
   */
  applyScrollRatio(ratio) {
    const maxScroll = Math.max(0, uiManager.getViewportScrollWidth() - uiManager.getViewportWidth());
    const left = Math.min(maxScroll, Math.max(0, ratio * maxScroll));
    uiManager.setViewportScrollLeft(left);
    this.syncWaveScroll(left);
    this.updateScrollControls();
  }

  /**
   * 載入媒體檔案
   * @param {File} file - 媒體檔案
   */
  loadMediaFile(file) {
    const wave = stateManager.wave;
    if (!wave) {
      this.initWaveform();
      return this.loadMediaFile(file);
    }

    uiManager.setStatus('載入媒體中…');
    
    try {
      if (typeof wave.loadBlob === 'function') {
        wave.loadBlob(file);
      } else {
        const url = URL.createObjectURL(file);
        wave.load(url);
      }
    } catch (err) {
      const url = URL.createObjectURL(file);
      wave.load(url);
    }

    // 預先啟用控制項
    uiManager.setButtonDisabled(uiManager.playPause, false);
    uiManager.setButtonDisabled(uiManager.rewindBtn, false);
    uiManager.setButtonDisabled(uiManager.reverseBtn, false);
    uiManager.setButtonDisabled(uiManager.fitZoomBtn, false);
    
    stateManager.setOriginalBuffer(null);
    stateManager.setIsReversed(false);
    wave.setPlaybackRate(stateManager.playbackRate, true);
    uiManager.setFileName(file.name);
    uiManager.setPlayButtonText('開始');
  }
}

export const audioPlayer = new AudioPlayer();
