/**
 * 狀態管理模塊
 * 管理應用程式的全局狀態和數據
 */

import { deepClone } from './utils.js';

export class StateManager {
  constructor() {
    // 波形圖和媒體相關
    this.wave = null;
    this.mediaDuration = 0;
    this.originalBuffer = null;
    this.reversedBuffer = null;
    this.isReversed = false;
    this.playbackRate = 1;
    this.currentPxPerSec = 1;
    this.autoCenterPlayhead = true;

    // 字幕相關
    this.subtitles = [];
    this.undoStack = [];

    // 文字稿隊列相關
    this.scriptQueue = [];
    this.queueIndex = 0;
    this.breakPending = false;

    // 拖拽狀態
    this.dragState = null;
  }

  // ===== 字幕相關方法 =====

  /**
   * 保存當前狀態到撤銷棧
   */
  saveUndo() {
    this.undoStack.push(deepClone(this.subtitles));
    if (this.undoStack.length > 50) {
      this.undoStack.shift();
    }
  }

  /**
   * 撤銷上一步操作
   * @returns {boolean} 是否成功撤銷
   */
  undo() {
    if (this.undoStack.length === 0) {
      return false;
    }
    this.subtitles = this.undoStack.pop();
    return true;
  }

  /**
   * 重置系統
   */
  resetSubtitles() {
    this.subtitles = [];
    this.undoStack = [];
  }

  /**
   * 新增字幕
   * @param {Object} segment - 字幕段落
   */
  addSubtitle(segment) {
    this.saveUndo();
    this.subtitles.push(segment);
  }

  /**
   * 更新字幕
   * @param {number} idx - 字幕索引
   * @param {Object} updates - 要更新的屬性
   */
  updateSubtitle(idx, updates) {
    if (idx >= 0 && idx < this.subtitles.length) {
      this.saveUndo();
      Object.assign(this.subtitles[idx], updates);
    }
  }

  /**
   * 取得字幕
   * @param {number} idx - 字幕索引
   * @returns {Object} 字幕段落
   */
  getSubtitle(idx) {
    return this.subtitles[idx];
  }

  // ===== 文字稿隊列相關方法 =====

  /**
   * 設置腳本隊列
   * @param {Array} queue - 新隊列
   */
  setScriptQueue(queue) {
    this.scriptQueue = queue;
    this.queueIndex = 0;
    this.breakPending = false;
  }

  /**
   * 取得目前的隊列項目
   * @returns {Object|null} 隊列項目
   */
  getCurrentQueueItem() {
    if (this.queueIndex >= this.scriptQueue.length) {
      return null;
    }
    return this.scriptQueue[this.queueIndex];
  }

  /**
   * 移到下一個隊列項目
   * @returns {boolean} 是否還有下一項
   */
  moveToNextQueueItem() {
    this.queueIndex += 1;
    return this.queueIndex < this.scriptQueue.length;
  }

  /**
   * 跳過連續空行的隊列項目
   */
  skipConsecutiveBreaks() {
    while (this.queueIndex < this.scriptQueue.length && this.scriptQueue[this.queueIndex].isBreak) {
      this.queueIndex += 1;
    }
  }

  /**
   * 判斷隊列是否已用完
   * @returns {boolean}
   */
  isQueueEmpty() {
    return this.queueIndex >= this.scriptQueue.length;
  }

  /**
   * 取得非空行隊列項的數量
   * @returns {number}
   */
  getNonBreakQueueCount() {
    return this.scriptQueue.filter(x => !x.isBreak).length;
  }

  // ===== 波形圖相關方法 =====

  /**
   * 設置波形圖實例
   * @param {Object} waveInstance - WaveSurfer 實例
   */
  setWave(waveInstance) {
    this.wave = waveInstance;
  }

  /**
   * 設置媒體時長
   * @param {number} duration - 時長（秒）
   */
  setMediaDuration(duration) {
    this.mediaDuration = duration;
  }

  /**
   * 設置音訊緩衝區
   * @param {Object} buffer - 原始緩衝區
   */
  setOriginalBuffer(buffer) {
    this.originalBuffer = buffer;
    this.reversedBuffer = null;
  }

  /**
   * 倒放相關內緩存
   */
  setIsReversed(reversed) {
    this.isReversed = reversed;
  }

  /**
   * 設置播放速率
   * @param {number} rate - 播放速率倍數
   */
  setPlaybackRate(rate) {
    this.playbackRate = rate;
  }

  /**
   * 設置縮放級別
   * @param {number} pxPerSec - 每秒像素數
   */
  setPxPerSec(pxPerSec) {
    this.currentPxPerSec = Math.max(1, pxPerSec);
  }

  /**
   * 取得縮放級別
   * @returns {number}
   */
  getPxPerSec() {
    return this.currentPxPerSec;
  }

  /**
   * 取得當前播放時間
   * @returns {number}
   */
  getCurrentTime() {
    return this.wave?.getCurrentTime() || 0;
  }

  /**
   * 判斷音訊是否正在播放
   * @returns {boolean}
   */
  isPlaying() {
    return this.wave?.isPlaying() || false;
  }

  /**
   * 設置拖拽狀態
   * @param {Object} state - 拖拽狀態
   */
  setDragState(state) {
    this.dragState = state;
  }

  /**
   * 清除拖拽狀態
   */
  clearDragState() {
    this.dragState = null;
  }
}

export const stateManager = new StateManager();
