# 2048 Game

<div align="center">
  <p>一个 Canvas 实现的现代化 2048 网页游戏</p>
  <p><a href="https://zenvertao.github.io/2048-game/">🎮 在线演示</a></p>
  <p>中文 | <a href="README.en.md">English</a></p>
</div>

## ✨ 主要特点

- **多主题支持**：经典、暗色、马卡龙、霓虹四种主题可选
- **难度系统**：简单、普通、困难三种难度模式
- **Canvas 渲染**：流畅的动画效果和视觉体验
- **音效系统**：根据分数增加的分层激励音效，支持iOS Safari
- **全平台兼容**：支持键盘、鼠标和触摸操作
- **响应式设计**：完美适配桌面端和移动端
- **本地存储**：自动保存最高分记录
- **模块化架构**：ES6 模块化设计，代码结构清晰可维护

## 🎮 游戏规则

使用 **方向键、鼠标滑动或触摸滑动** 移动方块。
当两个相同数字的方块碰到一起时，它们会合并成为它们的和！
目标是合成 **2048**，之后也可继续挑战更高分。

## 📁 项目结构

```
├── src/                     # 源代码目录
│   ├── modules/             # 核心模块
│   │   ├── animation-manager.js    # 动画管理器
│   │   ├── audio-manager.js        # 音效管理器
│   │   ├── canvas-renderer.js      # Canvas渲染器
│   │   ├── event-manager.js        # 事件管理器
│   │   ├── game-config.js          # 游戏配置
│   │   ├── game-logic.js           # 游戏逻辑核心
│   │   └── ui-manager.js           # UI管理器
│   ├── themes/              # 主题管理
│   │   └── theme-manager.js        # 主题管理器
│   ├── game-controller.js   # 游戏主控制器
│   └── main.js              # 入口文件
├── index.html            # 主页面
├── style_canvas.css      # 样式文件
└── README.md            # 项目说明
```

### 模块化架构

项目采用 **ES6 模块化设计**，各功能模块责任分明：

- **游戏控制器** (`game-controller.js`): 协调各个模块，统一管理游戏状态
- **游戏逻辑** (`game-logic.js`): 方块移动、合并、胜负判断等核心逻辑
- **渲染器** (`canvas-renderer.js`): Canvas 绘图逻辑，负责方块、文字、背景的绘制
- **动画管理** (`animation-manager.js`): 控制帧更新和过渡动画效果
- **事件管理** (`event-manager.js`): 统一处理键盘、鼠标、触摸事件
- **UI管理** (`ui-manager.js`): 分数显示、消息提示等UI状态管理
- **主题管理** (`theme-manager.js`): 主题切换和颜色方案管理
- **音效管理** (`audio-manager.js`): Web Audio API 实现的音效系统

## 🚀 使用指南

### 直接运行
下载项目文件，直接打开 `index.html` 即可开始游戏。

### 本地服务器
```bash
# 克隆仓库
git clone <repository-url>
cd 2048-game

# 使用任意HTTP服务器运行
python -m http.server
# 或
npx serve
```

## 🎯 游戏特色

- **主题切换**：四种精心设计的视觉主题
- **难度调节**：不同难度影响新方块生成概率和分数加成
- **平滑动画**：Canvas 实现的流畅合并动画效果
- **智能适配**：根据屏幕尺寸自动调整游戏区域大小

---

<div align="center">
  <p>Made with ❤️ by Zenver</p>
</div>