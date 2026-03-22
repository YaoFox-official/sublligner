/**
 * 拖拽和渲染模塊
 * 處理字幕區塊的拖拽、選擇、渲染和交互
 */

import { computeEnd } from './utils.js';
import { stateManager } from './state.js';
import { uiManager } from './ui.js';
import { subtitleManager } from './subtitleManager.js';
import { audioPlayer } from './audioPlayer.js';

export class DragAndRenderManager {
  constructor() {
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
  }

  /**
   * 鼠標按下事件處理
   * @param {MouseEvent} e - 事件
   * @param {number} segIdx - 字幕索引
   * @param {string} dragType - 拖拽類型 ('block' 或 'handle')
   * @param {string} side - 邊側 ('left' 或 'right')
   */
  onMouseDown(e, segIdx, dragType, side = null) {
    const wave = stateManager.wave;
    if (!wave) return;

    e.preventDefault();
    e.stopPropagation();

    const seg = stateManager.getSubtitle(segIdx);
    const segEnd = computeEnd(seg, segIdx, stateManager.subtitles, stateManager.mediaDuration);
    const pxPerSec = audioPlayer.getPxPerSec();

    stateManager.setDragState({
      type: dragType,
      side,
      segIdx,
      startX: e.clientX,
      startScrollLeft: uiManager.getViewportScrollLeft(),
      segStart: seg.start,
      segEnd: segEnd,
      pxPerSec: pxPerSec
    });

    // 設置游標
    if (dragType === 'handle') {
      document.body.style.cursor = side === 'left' ? 'w-resize' : 'e-resize';
    } else {
      document.body.style.cursor = 'grabbing';
    }

    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  }

  /**
   * 鼠標移動事件處理
   * @param {MouseEvent} e - 事件
   */
  onMouseMove = (e) => {
    const dragState = stateManager.dragState;
    if (!dragState) return;

    const pxPerSec = dragState.pxPerSec;
    if (pxPerSec <= 0) return;

    const dx = e.clientX - dragState.startX;
    const dt = dx / pxPerSec;
    const seg = stateManager.getSubtitle(dragState.segIdx);

    if (dragState.type === 'handle') {
      // 調整邊界時間
      if (dragState.side === 'left') {
        subtitleManager.adjustSubtitleStart(
          dragState.segIdx,
          Math.max(0, Math.min(dragState.segStart + dt, dragState.segEnd - 0.001))
        );
      } else {
        subtitleManager.adjustSubtitleEnd(
          dragState.segIdx,
          Math.max(dragState.segStart + 0.001, dragState.segEnd + dt)
        );
      }
    } else {
      // 移動整個字幕
      subtitleManager.moveSubtitle(dragState.segIdx, dt);
    }

    this.renderSubtitleBlocks();
    subtitleManager.refreshTable();
  }

  /**
   * 鼠標抬起事件處理
   */
  onMouseUp = () => {
    const dragState = stateManager.dragState;
    if (dragState) {
      stateManager.saveUndo();
    }

    document.body.style.cursor = '';
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
    stateManager.clearDragState();
  }

  /**
   * 渲染所有字幕區塊
   */
  renderSubtitleBlocks() {
    if (!stateManager.wave || stateManager.subtitles.length === 0) {
      uiManager.clearSubtitleTrack();
      return;
    }

    const pxPerSec = audioPlayer.getPxPerSec();
    if (!pxPerSec) return;

    uiManager.clearSubtitleTrack();

    stateManager.subtitles.forEach((seg, idx) => {
      const end = computeEnd(seg, idx, stateManager.subtitles, stateManager.mediaDuration);
      const left = seg.start * pxPerSec;
      const baseDuration = Math.max(end - seg.start, 0.05);
      const width = baseDuration * pxPerSec;

      uiManager.addSubtitleBlock(
        idx,
        left,
        width,
        seg.text,
        // onBlockMouseDown
        (e) => {
          this.onMouseDown(e, idx, 'block');
        },
        // onLeftHandleMouseDown
        (e) => {
          this.onMouseDown(e, idx, 'handle', 'left');
        },
        // onRightHandleMouseDown
        (e) => {
          this.onMouseDown(e, idx, 'handle', 'right');
        }
      );
    });
  }
}

export const dragAndRenderManager = new DragAndRenderManager();
