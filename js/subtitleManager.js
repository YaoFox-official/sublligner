/**
 * 字幕管理模塊
 * 處理字幕的添加、修改、計算邏輯
 */

import { formatTime, computeEnd, Constants } from './utils.js';
import { stateManager } from './state.js';
import { uiManager } from './ui.js';
import { dragAndRenderManager } from './dragAndRender.js';

export class SubtitleManager {
  /**
   * 新增字幕
   * @param {number} currentTime - 當前播放時間
   * @param {string} text - 字幕文字
   * @param {boolean} discontinuous - 是否不連續
   */
  insertSubtitle(currentTime, text, discontinuous = false) {
    stateManager.saveUndo();
    
    // 設置前一個字幕的結束時間
    if (stateManager.subtitles.length > 0 && !discontinuous) {
      const prev = stateManager.subtitles[stateManager.subtitles.length - 1];
      prev.end = Math.max(prev.start, currentTime - 0.001);
    }
    
    const segment = {
      start: currentTime,
      end: null,
      text: text,
      discontinuous: discontinuous
    };
    
    stateManager.addSubtitle(segment);
  }

  /**
   * 編輯字幕文字
   * @param {number} idx - 字幕索引
   * @param {string} newText - 新文字
   */
  editSubtitleText(idx, newText) {
    const segment = stateManager.getSubtitle(idx);
    if (segment && segment.text !== newText) {
      stateManager.updateSubtitle(idx, { text: newText });
    }
  }

  /**
   * 拖動調整字幕時間
   * @param {number} idx - 字幕索引
   * @param {number} newStart - 新開始時間
   * @param {number} newEnd - 新結束時間
   */
  adjustSubtitleTime(idx, newStart, newEnd) {
    const segment = stateManager.getSubtitle(idx);
    if (segment) {
      stateManager.updateSubtitle(idx, {
        start: Math.max(0, newStart),
        end: Math.max(newStart + 0.001, newEnd)
      });
    }
  }

  /**
   * 調整字幕開始時間（左端拖拽）
   * @param {number} idx - 字幕索引
   * @param {number} newStart - 新開始時間
   */
  adjustSubtitleStart(idx, newStart) {
    const segment = stateManager.getSubtitle(idx);
    if (segment) {
      const end = computeEnd(segment, idx, stateManager.subtitles, stateManager.mediaDuration);
      const adjustedStart = Math.max(0, Math.min(newStart, end - 0.001));
      stateManager.updateSubtitle(idx, { start: adjustedStart });
    }
  }

  /**
   * 調整字幕結束時間（右端拖拽）
   * @param {number} idx - 字幕索引
   * @param {number} newEnd - 新結束時間
   */
  adjustSubtitleEnd(idx, newEnd) {
    const segment = stateManager.getSubtitle(idx);
    if (segment) {
      const adjustedEnd = Math.max(segment.start + 0.001, newEnd);
      stateManager.updateSubtitle(idx, { end: adjustedEnd });
    }
  }

  /**
   * 移動整個字幕
   * @param {number} idx - 字幕索引
   * @param {number} deltaTime - 時間偏移量
   */
  moveSubtitle(idx, deltaTime) {
    const segment = stateManager.getSubtitle(idx);
    if (segment) {
      const duration = (segment.end || 0) - segment.start;
      const newStart = Math.max(0, segment.start + deltaTime);
      stateManager.updateSubtitle(idx, {
        start: newStart,
        end: newStart + duration
      });
    }
  }

  /**
   * 計算字幕結束時間
   * @param {number} idx - 字幕索引
   * @returns {number} 結束時間
   */
  getSubtitleEnd(idx) {
    const segment = stateManager.getSubtitle(idx);
    if (!segment) return 0;
    return computeEnd(segment, idx, stateManager.subtitles, stateManager.mediaDuration);
  }

  /**
   * 重新渲染字幕表格
   */
  refreshTable() {
    uiManager.clearSrtTable();
    
    stateManager.subtitles.forEach((seg, idx) => {
      const end = this.getSubtitleEnd(idx);
      const startStr = seg.start != null ? formatTime(seg.start, true) : '—';
      const endStr = formatTime(end, true);
      
      uiManager.addSrtTableRow(
        idx + 1,
        startStr,
        endStr,
        seg.text,
        (newText) => {
          this.editSubtitleText(idx, newText);
          this.refreshTable();
        }
      );
    });

    uiManager.setButtonDisabled(uiManager.exportBtn, stateManager.subtitles.length === 0);
    uiManager.setButtonDisabled(uiManager.undoBtn, stateManager.undoStack.length === 0);
    dragAndRenderManager.renderSubtitleBlocks();
  }

  /**
   * 動態構建 SRT 行文本
   * @returns {Array} 行文本陣列
   */
  buildSrtLines() {
    const lines = [];
    const duration = stateManager.mediaDuration || (stateManager.subtitles[stateManager.subtitles.length - 1]?.start + Constants.DEFAULT_DURATION);

    stateManager.subtitles.forEach((seg, i) => {
      const end = this.getSubtitleEnd(i);
      
      lines.push(`${i + 1}`);
      lines.push(`${formatTime(seg.start, true)} --> ${formatTime(end, true)}`);
      lines.push(seg.text);
      lines.push('');
    });

    return lines;
  }

  /**
   * 導出 SRT 檔案
   */
  exportSrt() {
    const lines = this.buildSrtLines();
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'subtitles.srt';
    a.click();
    URL.revokeObjectURL(url);
    uiManager.setStatus('已匯出 SRT');
  }

  /**
   * 重置所有字幕
   */
  reset() {
    stateManager.resetSubtitles();
    uiManager.clearSrtTable();
    dragAndRenderManager.renderSubtitleBlocks();
    uiManager.setStatus('字幕已重置', 'ok');
  }
}

export const subtitleManager = new SubtitleManager();
