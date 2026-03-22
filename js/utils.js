/**
 * 工具函數模塊
 * 提供通用的輔助函數、常數和工具
 */

export const Constants = {
  DEFAULT_DURATION: 2.5,  // seconds
  SCROLL_STEP_FACTOR: 0.25,
  UNDO_STACK_MAX_SIZE: 50,
};

/**
 * 格式化時間
 * @param {number} t - 時間（秒）
 * @param {boolean} forSrt - 是否用於 SRT 格式（逗號分隔符）
 * @returns {string} 格式化後的時間字串
 */
export function formatTime(t, forSrt = false) {
  const clamped = Math.max(0, t || 0);
  const hours = Math.floor(clamped / 3600);
  const minutes = Math.floor((clamped % 3600) / 60);
  const seconds = Math.floor(clamped % 60);
  const cs = Math.round((clamped - Math.floor(clamped)) * 100);
  const pad = (n, len = 2) => String(n).padStart(len, '0');
  const base = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  return forSrt ? `${base},${pad(cs, 2)}` : `${base}.${pad(cs, 2)}`;
}

/**
 * 解析文字稿，分割成字幕隊列
 * @param {string} raw - 原始文字內容
 * @returns {Array} 字幕隊列，含有 text 和 isBreak 屬性
 */
export function parseScript(raw) {
  const lines = raw.split(/\r?\n/);
  const queue = [];
  lines.forEach((ln) => {
    const trimmed = ln.trim();
    if (!trimmed) {
      queue.push({ isBreak: true });
    } else {
      queue.push({ text: trimmed, isBreak: false });
    }
  });
  return queue;
}

/**
 * 計算字幕的結束時間
 * @param {Object} seg - 字幕段落
 * @param {number} idx - 索引
 * @param {Array} subtitles - 所有字幕
 * @param {number} mediaDuration - 媒體總長度
 * @returns {number} 結束時間
 */
export function computeEnd(seg, idx, subtitles, mediaDuration) {
  const duration = mediaDuration || (subtitles[subtitles.length - 1]?.start + Constants.DEFAULT_DURATION);
  const nextStart = subtitles[idx + 1]?.start;
  let end = seg.end;
  if (end == null || end <= seg.start) {
    if (!seg.discontinuous && nextStart != null) {
      end = nextStart;
    } else {
      end = Math.min(duration, seg.start + Constants.DEFAULT_DURATION);
    }
  }
  return Math.max(end, seg.start + 0.001);
}

/**
 * 深克隆物件
 * @param {Object} obj - 要克隆的物件
 * @returns {Object} 克隆後的物件
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}
