# 模塊化架構說明

本項目已進行模塊化重構以降低耦合度。代碼現已分解為多個獨立的功能模塊，提高了代碼的可維護性和可擴展性。

## 架構設計

```
js/
├── app.js                  # 應用主入口，組合所有模塊
├── state.js                # 狀態管理
├── ui.js                   # UI 層抽象
├── utils.js                # 工具函數
├── subtitleManager.js      # 字幕管理業務邏輯
├── audioPlayer.js          # 音頻播放和波形圖
├── dragAndRender.js        # 拖拽和渲染交互
└── fileManager.js          # 文件加載和導出
```

## 模塊職責說明

### 1. **utils.js** - 工具函數模塊
- **責任**：提供通用工具和常數
- **導出**：
  - `Constants` - 應用常數
  - `formatTime(t, forSrt)` - 時間格式化
  - `parseScript(raw)` - 文字稿解析
  - `computeEnd(seg, idx, subtitles, duration)` - 計算字幕結束時間
  - `deepClone(obj)` - 深克隆物件

### 2. **state.js** - 狀態管理
- **責任**：集中管理應用全局狀態
- **核心概念**：單一數據源（Single Source of Truth）
- **管理的狀態**：
  - 字幕數據和撤銷棧
  - 文字稿隊列和索引
  - 波形圖和媒體信息
  - 拖拽狀態
- **好處**：降低模塊間的數據耦合，便於狀態追蹤和調試

### 3. **ui.js** - UI 層抽象
- **責任**：全部 DOM 操作入口，UI 狀態管理
- **特點**：
  - 所有 DOM 元素在初始化時獲取
  - 提供統一的 UI 更新 API
  - 隔離 DOM 操作，便於測試
- **導出方法**：
  - `setStatus()` - 設置狀態消息
  - `setTimeLabel()` - 更新時間標籤
  - `onButtonClick()` - 綁定事件
  - `addSubtitleBlock()` - 添加字幕區塊
  - 等等...

### 4. **subtitleManager.js** - 字幕管理業務邏輯
- **責任**：字幕相關的業務邏輯
- **提供功能**：
  - 插入字幕 `insertSubtitle()`
  - 編輯字幕文字 `editSubtitleText()`
  - 調整字幕時間 `adjustSubtitleTime()`
  - 刷新表格 `refreshTable()`
  - 導出 SRT `exportSrt()`
- **特點**：業務邏輯與 UI 分離

### 5. **audioPlayer.js** - 音頻播放模塊
- **責任**：波形圖初始化、播放控制、倒放
- **提供功能**：
  - `initWaveform()` - 初始化
  - `togglePlayPause()` - 播放/暫停
  - `applyZoom()` - 應用縮放
  - `bestFitZoom()` - 最佳適配縮放
  - `toggleReverse()` - 倒放切換
  - `loadMediaFile()` - 載入媒體
- **特點**：獨立管理波形圖相關邏輯

### 6. **dragAndRender.js** - 拖拽和渲染模塊
- **責任**：字幕區塊拖拽交互和渲染
- **提供功能**：
  - `renderSubtitleBlocks()` - 渲染字幕視覺區塊
  - 鼠標事件處理（按下、移動、抬起）
  - 邊界和塊的拖拽邏輯

### 7. **fileManager.js** - 文件管理模塊
- **責任**：文件相關操作和隊列管理
- **提供功能**：
  - `loadMediaFile()` - 載入媒體
  - `loadTextFile()` - 載入文字檔
  - `insertSubtitle()` - 插入字幕（協調多模塊）
  - `exportSrt()` - 導出 SRT
  - `rebuildQueue()` - 重建隊列
  - `undo()` - 撤銷操作

### 8. **app.js** - 應用主入口
- **責任**：組合所有模塊並綁定事件
- **特點**：
  - 集中管理所有事件綁定
  - 協調各模塊間的交互
  - 初始化應用

## 依賴關係圖

```
┌─────────────┐
│   app.js    │           （應用主入口）
└─────┬───────┘
      │
      ├─→ utils.js        （工具函數）
      ├─→ state.js        （狀態管理）
      ├─→ ui.js           （UI 層）
      ├─→ audioPlayer.js  （音頻播放）
      ├─→ dragAndRender.js（拖拽渲染）
      ├─→ subtitleManager.js（字幕業務）
      └─→ fileManager.js  （文件管理）

其他模塊間的關係：
- subtitleManager.js 依賴：utils, state, ui
- audioPlayer.js 依賴：utils, state, ui
- dragAndRender.js 依賴：utils, state, ui, subtitleManager, audioPlayer
- fileManager.js 依賴：utils, state, ui, subtitleManager, audioPlayer
```

## 耦合度降低的改進

### 之前（單一檔案）
- ❌ 全局變數混亂
- ❌ 事件處理代碼散落各地
- ❌ 逻辑相互糾纏難以理解
- ❌ 難以擴展和測試

### 之後（模塊化）
- ✅ 明確的模塊邊界
- ✅ 單一責任原則
- ✅ 狀態集中管理
- ✅ 易於測試和擴展
- ✅ 易於維護和調試

## 擴展指南

### 添加新功能
1. 判斷功能屬於哪個模塊（或創建新模塊）
2. 在該模塊中實現業務邏輯
3. 在 `app.js` 中綁定事件

### 示例：添加播放速率預設
```javascript
// 在 fileManager.js 中添加新方法
savePlayspeed(rate) {
  localStorage.setItem('lastPlayrate', rate);
}

// 在 app.js 中綁定
uiManager.onSelectChange(uiManager.rateSelect, (e) => {
  const rate = Number(e.target.value);
  fileManager.savePlayspeed(rate);
  audioPlayer.setPlaybackRate(rate);
});
```

## 模塊與原始代碼的映射

| 模塊 | 原始代碼中的對應部分 |
|------|----------------|
| state.js | 全局變數：`wave`, `subtitles`, `undoStack`, `scriptQueue` 等 |
| ui.js | DOM 元素選擇和事件綁定 |
| utils.js | `formatTime()`, `parseScript()`, `computeEnd()` 等函數 |
| audioPlayer.js | `buildWave()`, `togglePlayPause()`, `toggleReverse()` 等 |
| subtitleManager.js | `insertSubtitle()`, `renderSubtitleBlocks()`, `refreshTable()` 等 |
| dragAndRender.js | `createDragHandlers()`, 拖拽相關邏輯 |
| fileManager.js | `loadMediaFile()`, `exportSrt()`, `undo()` 等 |

## 未來改進方向

- 添加單元測試
- 創建事件訂閱系統替代直接函數調用
- 提取公共 UI 組件（如 Button, Modal）
- 實現撤銷/重做系統的完整模式
- 添加持久化存儲（localStorage）
- 國際化支持

---

通過這種模塊化架構，代碼變得更易於理解、維護和擴展。每個模塊都有明確的責任，模塊間的耦合度大大降低了。
