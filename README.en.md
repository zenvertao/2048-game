# 2048 Game

<div align="center">
  <p>A modern 2048 web game implemented with Canvas</p>
  <p><a href="https://zenvertao.github.io/2048-game/">🎮 Live Demo</a></p>
  <p><a href="README.md">中文</a> | English</p>
</div>

## ✨ Key Features

- **Multiple Themes**: Four themes available - Classic, Dark, Pastel, and Neon
- **Difficulty System**: Easy, Normal, and Hard difficulty modes
- **Canvas Rendering**: Smooth animations and visual effects
- **Audio System**: Score-based layered incentive sound effects with iOS Safari support
- **Cross-Platform**: Supports keyboard, mouse, and touch controls
- **Responsive Design**: Perfect adaptation for desktop and mobile devices
- **Local Storage**: Automatically saves high score records
- **Modular Architecture**: ES6 modular design with clean and maintainable code structure

## 🎮 Game Rules

Use **arrow keys, mouse swipe, or touch gestures** to move tiles.
When two tiles with the same number touch, they merge into one!
The goal is to create the **2048** tile, then continue for higher scores.

## 📁 Project Structure

```
├── src/                     # Source code directory
│   ├── modules/             # Core modules
│   │   ├── animation-manager.js    # Animation manager
│   │   ├── audio-manager.js        # Audio effects manager
│   │   ├── canvas-renderer.js      # Canvas renderer
│   │   ├── event-manager.js        # Event manager
│   │   ├── game-config.js          # Game configuration
│   │   ├── game-logic.js           # Core game logic
│   │   └── ui-manager.js           # UI manager
│   ├── themes/              # Theme management
│   │   └── theme-manager.js        # Theme manager
│   ├── game-controller.js   # Main game controller
│   └── main.js              # Entry point
├── index.html            # Main page
├── style_canvas.css      # Stylesheet
└── README.md            # Project documentation
```

### Modular Architecture

The project adopts **ES6 modular design** with clear separation of responsibilities:

- **Game Controller** (`game-controller.js`): Coordinates all modules and manages game state
- **Game Logic** (`game-logic.js`): Core logic for tile movement, merging, and win/lose conditions
- **Renderer** (`canvas-renderer.js`): Canvas drawing logic for tiles, text, and backgrounds
- **Animation Manager** (`animation-manager.js`): Controls frame updates and transition effects
- **Event Manager** (`event-manager.js`): Unified handling of keyboard, mouse, and touch events
- **UI Manager** (`ui-manager.js`): Score display, message prompts, and other UI state management
- **Theme Manager** (`theme-manager.js`): Theme switching and color scheme management
- **Audio Manager** (`audio-manager.js`): Audio system implemented with Web Audio API

## 🚀 Getting Started

### Direct Run
Download the project files and open `index.html` directly to start playing.

### Local Server
```bash
# Clone repository
git clone <repository-url>
cd 2048-game

# Run with any HTTP server
python -m http.server
# or
npx serve
```

## 🎯 Game Highlights

- **Theme Switching**: Four carefully designed visual themes
- **Difficulty Adjustment**: Different difficulties affect tile spawn probability and score multipliers
- **Smooth Animations**: Fluid merge animations implemented with Canvas
- **Smart Adaptation**: Game area automatically adjusts based on screen size

---

<div align="center">
  <p>Made with ❤️ by Zenver</p>
</div>