/**
 * 文件管理模塊
 * 處理媒體檔案、文字檔的載入和 SRT 匯出
 */

import { parseScript } from './utils.js';
import { stateManager } from './state.js';
import { uiManager } from './ui.js';
import { subtitleManager } from './subtitleManager.js';
import { audioPlayer } from './audioPlayer.js';

export class FileManager {
  /**
   * 載入媒體檔案
   * @param {File} file - 媒體檔案
   */
  loadMediaFile(file) {
    audioPlayer.loadMediaFile(file);
  }

  /**
   * 載入文字檔案
   * @param {File} file - 文字檔案
   */
  loadTextFile(file) {
    const reader = new FileReader();
    reader.onload = () => {
      uiManager.setScriptContent(reader.result);
      this.rebuildQueue();
    };
    reader.readAsText(file, 'utf-8');
    uiManager.setStatus(`載入文字檔：${file.name}`);
  }

  /**
   * 重新構建隊列
   */
  rebuildQueue() {
    const scriptContent = uiManager.getScriptContent();
    const queue = parseScript(scriptContent);
    stateManager.setScriptQueue(queue);
    
    const nonBreakCount = stateManager.getNonBreakQueueCount();
    uiManager.setStatus(`台詞佇列已重建，共 ${nonBreakCount} 段`);
  }

  /**
   * 插入字幕到 SRT
   */
  insertSubtitle() {
    const wave = stateManager.wave;
    if (!wave) return;

    if (stateManager.isQueueEmpty()) {
      uiManager.setStatus('佇列已用完', 'warn');
      return;
    }

    const currentItem = stateManager.getCurrentQueueItem();

    if (currentItem.isBreak) {
      // 遇到空行，結束前一個字幕塊
      if (stateManager.subtitles.length > 0) {
        const lastSub = stateManager.subtitles[stateManager.subtitles.length - 1];
        if (lastSub.end == null || lastSub.end <= lastSub.start) {
          stateManager.saveUndo();
          lastSub.end = wave.getCurrentTime();
          lastSub.discontinuous = true;
          subtitleManager.refreshTable();
          
          const timeStr = this.formatTime(wave.getCurrentTime());
          uiManager.setStatus(`字幕塊已結束（不連續間隔） @ ${timeStr}`, 'ok');
        }
      }

      // 跳過空行並設置標記
      stateManager.moveToNextQueueItem();
      stateManager.breakPending = true;
      stateManager.skipConsecutiveBreaks();

      if (stateManager.isQueueEmpty()) {
        uiManager.setStatus('已到佇列末尾，等待新台詞', 'warn');
        return;
      }

      uiManager.setStatus('空行已處理，按下一次 T 開始新段字幕', 'ok');
      return;
    }

    // 正常插入非空行字幕
    const now = wave.getCurrentTime();
    subtitleManager.insertSubtitle(now, currentItem.text, stateManager.breakPending);
    stateManager.breakPending = false;
    stateManager.moveToNextQueueItem();
    
    subtitleManager.refreshTable();
    audioPlayer.syncTrackWidth();
    audioPlayer.updateScrollControls();
    
    const timeStr = this.formatTime(now);
    uiManager.setStatus(`插入："${currentItem.text}" @ ${timeStr}`, 'ok');
  }

  /**
   * 格式化時間（簡化版本，可直接使用 utils 的 formatTime）
   * @param {number} t - 時間（秒）
   * @returns {string}
   */
  formatTime(t) {
    const clamped = Math.max(0, t || 0);
    const hours = Math.floor(clamped / 3600);
    const minutes = Math.floor((clamped % 3600) / 60);
    const seconds = Math.floor(clamped % 60);
    const cs = Math.round((clamped - Math.floor(clamped)) * 100);
    const pad = (n, len = 2) => String(n).padStart(len, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(cs, 2)}`;
  }

  /**
   * 匯出 SRT 檔案
   */
  exportSrt() {
    subtitleManager.exportSrt();
  }

  /**
   * 撤銷上一步操作
   */
  undo() {
    if (!stateManager.undo()) {
      uiManager.setStatus('沒有可撤銷的操作', 'warn');
      return;
    }

    uiManager.setButtonDisabled(uiManager.undoBtn, stateManager.undoStack.length === 0);
    uiManager.setButtonDisabled(uiManager.exportBtn, stateManager.subtitles.length === 0);
    subtitleManager.refreshTable();
    uiManager.setStatus('已撤銷', 'ok');
  }

  /**
   * 重置字幕
   */
  reset() {
    subtitleManager.reset();
  }
}

export const fileManager = new FileManager();
