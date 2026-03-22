# 🎬 SRT Builder - 簡易字幕編輯器

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

一個強大而直觀的 **Web 字幕編輯工具**，支持實時波形顯示、精確時間軸調整和 SRT 格式導出。無需安裝，直接在瀏覽器中使用。

> **[在線試用](https://yaofox-official.github.io/sublligner/)** | **[查看截圖](#功能截圖)** | **[架構文檔](ARCHITECTURE.md)**

## ✨ 主要特性

- 🎵 **實時波形圖** - 基於 WaveSurfer.js 的高性能音頻波形顯示
- ⏱️ **精確時間軸** - 毫秒級精度的字幕時間調整
- 🎯 **直觀拖拽** - 在波形圖上直接拖拽調整字幕邊界和位置
- ⌨️ **快速輸入** - 按 **T** 鍵快速插入字幕
- 📝 **文本管理** - 支持批量導入文本，按空行自動分段
- 🔄 **撤銷系統** - 支持 50 步撤銷操作（Ctrl+Z）
- 📊 **實時預覽** - 在可編輯表格中預覽所有字幕
- 💾 **SRT 導出** - 一鍵導出標準 SRT 格式
- ⚡ **播放控制** - 支持播放、暫停、倒放和速率調整（1x - 3x）
- 🎬 **倒放功能** - 支持音頻倒放播放
- 📐 **縮放和滾動** - 靈活的時間軸視圖控制
- 🎨 **暗色主題** - 護眼的現代設計界面

## 🚀 快速開始

### 無需安裝
直接在瀏覽器中打開 `index.html` 即可使用，無需任何構建步驟。

```bash
# 克隆到本地
git clone https://github.com/YaoFox-official/sublligner.git
cd sublligner

# 用瀏覽器打開
open index.html  # macOS
# 或
start index.html  # Windows
# 或在瀏覽器中訪問文件路徑
```

### 快速步驟
1. **上傳媒體** - 點擊上傳按鈕選擇 MP3、MP4 等媒體文件
2. **導入文本** - 上傳包含台詞的 TXT 文件（每行一段，空行表示間隔）
3. **播放並插入** - 按下播放 ▶，在需要的地方按 **T** 鍵插入字幕
4. **調整時間** - 在波形圖上拖拽字幕邊界或整個字幕塊來調整時間
5. **導出** - 點擊「匯出 SRT」下載字幕檔案

## 📚 詳細使用指南

### 基本操作

#### 媒體載入
- **上傳影片/音訊** - 支持 MP3, MP4, WebM 等格式
- **上傳文字檔** - TXT 格式，每行一段台詞

#### 文本格式
```
第一句台詞
第二句台詞
第三句台詞

（空行表示這裡有間隔，新的一組字幕從下一行開始）

新組的第一句
新組的第二句
```

#### 播放控制
| 按鈕 | 功能 |
|------|------|
| **開始/停止** | 播放或暫停媒體 |
| **↺ 開頭** | 重新開始播放 |
| **倒放** | 切換倒放/正放模式 |
| **T 鍵** | 在當前時間插入或結束字幕 |
| **縮放滑塊** | 調整時間軸細節程度 |
| **最佳適配** | 自動調整縮放以顯示全部內容 |
| **倍速選擇** | 選擇播放速度（1.0x - 3.0x） |
| **◀/▶** | 滾動時間軸左右 |

#### 時間軸編輯
1. **拖動字幕塊** - 拖動字幕區塊以移動其位置
2. **調整左邊界** - 拖動字幕左邊的把手調整開始時間
3. **調整右邊界** - 拖動字幕右邊的把手調整結束時間
4. **編輯文本** - 在表格中點擊文字編輯字幕內容

#### 撤銷和重置
- **撤銷** - 點擊「↶ 撤銷」或按 **Ctrl+Z/Cmd+Z**（最多 50 步）
- **重置字幕** - 清除所有字幕並重新開始
- **重建佇列** - 根據文字欄重新構建導入隊列

#### 導出
- **匯出 SRT** - 下載標準 SRT 格式字幕檔案（包含編號、時間、文本）

### 進階技巧

#### 高效編輯流程
1. 使用 **最佳適配** 看清整個時間軸
2. 按 **T** 快速插入，不用手動調整精確時間
3. 導入完成後，用波形圖的細節提示調整邊界時間
4. 利用 **撤銷** 功能安心嘗試不同的時間分配

#### 播放頭置中
- 啟用 **播放頭置中** 開關（預設已啟用）
- 播放時會自動將播放頭居中顯示，便於觀看前後上下文

#### 大檔案處理
- 如果倒放功能不可用，說明檔案太大，輕量化後重新上傳
- 或直接禁用倒放功能進行編輯

## 🏗️ 項目結構

```
sublligner/
├── index.html                 # 主程序
├── README.md                  # 本文檔
├── LICENSE                    # MIT 許可
├── ARCHITECTURE.md            # 架構設計文檔
├── REFACTORING_SUMMARY.md     # 重構說明
└── js/                        # JavaScript 模塊
    ├── app.js                 # 應用主入口
    ├── state.js               # 狀態管理
    ├── ui.js                  # UI 層抽象
    ├── utils.js               # 工具函數
    ├── subtitleManager.js     # 字幕業務邏輯
    ├── audioPlayer.js         # 音頻和波形駕駛
    ├── dragAndRender.js       # 交互和渲染
    └── fileManager.js         # 文件操作
```

### 架構概述

該項目採用 **模塊化設計**，降低耦合度：

```
┌─────────────┐
│   app.js    │              （應用主入口）
└─────┬───────┘
      │
      ├─ state.js            （全局狀態管理）
      ├─ ui.js               （UI 操作抽象）
      ├─ utils.js            （工具函數）
      ├─ audioPlayer.js      （音頻播放）
      ├─ subtitleManager.js  （字幕管理）
      ├─ dragAndRender.js    （交互渲染）
      └─ fileManager.js      （文件操作）
```

**詳細請見** [ARCHITECTURE.md](ARCHITECTURE.md)

## 🎨 用戶界面

### 主要區域

1. **控制區**
   - 媒體上傳、播放控制、縮放調整
   - 時間標籤、文件名顯示
   - 快捷操作按鈕

2. **時間軸區**
   - 波形圖顯示
   - 字幕塊可視化
   - 可拖拽調整時間

3. **文本輸入區**
   - 粘貼或輸入台詞
   - 每行一段，空行表示間隔

4. **字幕表格**
   - 實時預覽所有字幕
   - 可直接編輯文本
   - 顯示開始/結束時間

5. **狀態提示**
   - 實時操作反饋
   - 錯誤和提示消息

## 🛠️ 技術棧

- **前端框架** - 純 JavaScript（ES6 模塊）
- **音頻處理** - [WaveSurfer.js v7](https://wavesurfer.xyz/)
- **UI 设计** - 現代 CSS3（Grid、Flexbox、Gradient）
- **存儲** - 客户端本地（localStorage 可選）
- **部署** - 靜態文件（無需後端）

## 🔧 開發指南

### 項目特點
- **零依賴構建** - 直接 HTML 文件，無 npm/webpack
- **模塊化代碼** - 8 個獨立模塊，易於擴展
- **易於參與** - 清晰的代碼結構和文件組織

### 添加新功能

#### 1. 簡單命令（如快捷鍵）
在 `js/app.js` 中的 `bindEvents()` 方法添加：

```javascript
document.addEventListener('keydown', (e) => {
  if (e.key === 'n' || e.key === 'N') {
    e.preventDefault();
    // 執行你的功能
  }
});
```

#### 2. 新按鈕或 UI 元素
1. 在 `index.html` 中添加 HTML 元素
2. 在 `js/ui.js` 的 `initElements()` 中引用它
3. 在 `js/app.js` 中綁定事件處理

#### 3. 新業務邏輯
在對應模塊（如 `js/subtitleManager.js`）中添加方法，然後從其他模塊調用。

### 調試技巧

```javascript
// 檢查狀態
console.log(stateManager.subtitles);

// 檢查 UI 狀態
console.log(uiManager.srtTable.innerHTML);

// 測試音頻
console.log(stateManager.wave.getDuration());
```

## 📋 SRT 格式說明

導出的 SRT 檔案格式示例：

```srt
1
00:00:01,500 --> 00:00:05,000
第一句字幕文本

2
00:00:07,000 --> 00:00:11,500
第二句字幕文本

3
00:00:13,000 --> 00:00:18,000
第三句字幕文本
```

## 🐛 已知限制

- 倒放功能需要瀏覽器支持 Web Audio API
- 大檔案可能無法倒放（需要將整個文件加載到內存）
- 依賴 WaveSurfer.js CDN（需要網絡連接）
- 不支持複雜的 SRT 特性（如樣式標籤、位置信息）

## 🚦 瀏覽器兼容性

| 瀏覽器 | 最低版本 | 狀態 |
|--------|--------|------|
| Chrome | 60+ | ✅ 完全支持 |
| Firefox | 55+ | ✅ 完全支持 |
| Safari | 14+ | ✅ 完全支持 |
| Edge | 79+ | ✅ 完全支持 |
| IE | - | ❌ 不支持 |

## 📄 許可証

本项目遵循 [MIT 許可證](LICENSE) - 自由使用、修改和分發

## 🙏 致謝

- [GitHub Copilot](https://github.com/features/copilot) - 模塊化架構設計和重構協助
- [WaveSurfer.js](https://wavesurfer.xyz/) - 音頻波形庫
- [Material Symbols](https://fonts.google.com/icons) - 圖標集合
- [Google Fonts](https://fonts.google.com/) - Space Grotesk 和 Courier Prime 字體

## 💡 反饋和貢獻

有建議或發現bug？歡迎提交 Issue 或 Pull Request！

- 📧 反饋：[開新 Issue](https://github.com/YaoFox-official/sublligner/issues)
- 🔧 貢獻：[提交 PR](https://github.com/YaoFox-official/sublligner/pulls)

## 📝 更新日誌

### v1.0.0 (2024)
- 🎉 首次發布
- ✨ 實現所有核心功能
- 🏗️ 完成模塊化重構
- 📚 完善檔案和文檔

## 🎯 未來計劃

- [ ] 支持 VTT 和 ASS 格式
- [ ] 拖拽上傳檔案
- [ ] 自動保存到本地
- [ ] 深色/淺色主題切換
- [ ] 國際化支持
- [ ] 實時協作編輯（via WebSocket）
- [ ] 鍵盤快捷鍵自訂
- [ ] 撤銷功能增強

**立即開始** - 無需安裝，打開 `index.html` 即可使用！

祝你字幕編輯愉快！🎬✨
