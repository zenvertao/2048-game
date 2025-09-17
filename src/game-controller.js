// 主游戏控制器 - 协调所有模块
import { GameConfig } from './modules/game-config.js';
import { GameLogic } from './modules/game-logic.js';
import { ThemeManager } from './themes/theme-manager.js';
import { CanvasRenderer } from './modules/canvas-renderer.js';
import { AnimationManager } from './modules/animation-manager.js';
import { EventManager } from './modules/event-manager.js';
import { UIManager } from './modules/ui-manager.js';
import { AudioManager } from './modules/audio-manager.js';

export class Game2048 {
    constructor() {
        // 初始化各个模块
        this.config = new GameConfig();
        this.gameLogic = new GameLogic(this.config);
        this.themeManager = new ThemeManager();
        this.uiManager = new UIManager();
        this.audioManager = new AudioManager();
        
        // 游戏状态
        this.gameStarted = false;

        // 获取Canvas元素
        this.canvas = document.getElementById('game-canvas');
        if (!this.canvas || !this.canvas.getContext) {
            throw new Error('Canvas not supported');
        }

        // 初始化渲染器和动画管理器
        this.renderer = new CanvasRenderer(this.canvas, this.config, this.themeManager);
        this.animationManager = new AnimationManager(this.config, this.renderer);

        // 初始化事件管理器
        this.eventManager = new EventManager(
            this.canvas,
            this.handleMove.bind(this),
            this.handleNewGame.bind(this),
            this.handleDifficultyChange.bind(this),
            this.handleThemeChange.bind(this)
        );

        // 设置窗口大小变化回调
        this.eventManager.setResizeCallback(this.handleResize.bind(this));

        // 初始化游戏
        this.initGame();
    }

    // 初始化游戏
    initGame() {
        // 获取游戏容器用于尺寸计算
        const gameContainer = document.querySelector('.game-container');
        this.config.initDimensions(this.canvas, gameContainer);

        // 同步UI设置
        this.syncUISettings();

        // 检查音频状态（仅在开发模式下显示）
        if (console && console.log) {
            const audioStatus = this.audioManager.getAudioStatus();
            console.log('🎵 Initial Audio Status:', audioStatus);
            if (audioStatus.supported && audioStatus.state === 'suspended') {
                console.log('🎵 Audio will start after user interaction (iOS Safari requirement)');
                console.log('🎵 Tip: Try touching the screen or pressing any key to activate audio');
            }
        }

        // 显示开始游戏遮罩层
        this.showStartOverlay();
        
        // 初始化游戏状态（但不开始）
        this.setupInitialState();
    }

    // 同步UI设置
    syncUISettings() {
        // 同步难度设置
        const currentDifficulty = this.uiManager.getCurrentDifficulty();
        this.gameLogic.setDifficulty(currentDifficulty);

        // 同步主题设置
        const savedTheme = this.themeManager.getCurrentThemeName();
        this.uiManager.setTheme(savedTheme);
    }

    // 开始新游戏
    async startNewGame() {
        // 尝试激活音频（针对iOS Safari）
        const audioActivated = await this.audioManager.tryResumeAudio();
        
        // 只有在音频成功激活后才播放开始音乐
        if (audioActivated || this.audioManager.isInitialized) {
            this.audioManager.playGameStart();
        }
        
        const gameState = this.gameLogic.startGame();
        this.gameStarted = true;

        // 设置动画管理器的游戏网格引用
        this.animationManager.setGameGrid(gameState.grid);

        // 更新UI
        this.uiManager.updateScore(gameState.score, this.gameLogic.bestScore);
        this.uiManager.clearMessage();
        
        // 隐藏开始遮罩层
        this.hideStartOverlay();

        // 渲染游戏
        this.renderer.renderGame(gameState.grid);
    }

    // 处理移动
    handleMove(direction) {
        // 如果游戏还未开始，先开始游戏
        if (!this.gameStarted) {
            this.startNewGame();
            return;
        }
        
        if (this.gameLogic.gameOver || this.gameLogic.won || this.animationManager.isAnimating()) {
            return;
        }

        const moveResult = this.gameLogic.move(direction);

        if (moveResult && moveResult.moved) {
            // 播放移动音效
            this.audioManager.playMove();
            
            // 如果有分数增加，播放分数奖励音效
            if (moveResult.addedScore > 0) {
                this.audioManager.playScoreGain(moveResult.addedScore);
            }
            
            // 立即更新分数显示（包括动画）
            this.uiManager.updateScore(this.gameLogic.score, this.gameLogic.bestScore, moveResult.addedScore);
            
            // 开始动画
            this.animationManager.startMoveAnimation(
                moveResult.animations,
                this.onAnimationComplete.bind(this)
            );
        }
    }

    // 动画完成回调
    onAnimationComplete() {
        // 添加新方块
        this.gameLogic.addRandomTile();

        // 检查游戏状态
        const gameOver = this.gameLogic.checkGameOver();

        // 更新UI（不需要传递新增分数，因为分数已经在 GameLogic 中更新了）
        this.uiManager.updateScore(this.gameLogic.score, this.gameLogic.bestScore);

        // 渲染游戏
        this.renderer.renderGame(this.gameLogic.grid);

        // 显示游戏结束或胜利消息
        if (gameOver) {
            this.audioManager.playGameOver();
            this.uiManager.showMessage(false);
            // 游戏结束后不显示overlay，由game-message提供重新开始按钮
        } else if (this.gameLogic.won) {
            this.audioManager.playWin();
            this.uiManager.showMessage(true);
            // 胜利后也不显示overlay，由game-message处理
        }
    }

    // 处理新游戏
    async handleNewGame() {
        // 取消所有动画
        this.animationManager.cancelAnimations();
        
        // 清除游戏结束消息
        this.uiManager.clearMessage();

        // 开始新游戏
        await this.startNewGame();
    }

    // 处理难度变化
    async handleDifficultyChange(newDifficulty) {
        const currentDifficulty = this.gameLogic.currentDifficulty;

        if (newDifficulty !== currentDifficulty) {
            const confirmed = await this.uiManager.confirmDifficultyChange();
            if (confirmed) {
                this.gameLogic.setDifficulty(newDifficulty);
                await this.startNewGame();
            } else {
                // 恢复原来的设置
                this.uiManager.setDifficulty(currentDifficulty);
            }
        }
    }

    // 处理主题变化
    handleThemeChange(newTheme) {
        if (this.themeManager.setTheme(newTheme)) {
            // 重新渲染游戏
            this.renderer.renderGame(this.gameLogic.grid);
        }
    }

    // 处理窗口大小变化
    handleResize() {
        const gameContainer = document.querySelector('.game-container');
        this.config.initDimensions(this.canvas, gameContainer);

        // 取消动画并重新渲染
        this.animationManager.cancelAnimations();
        this.renderer.renderGame(this.gameLogic.grid);
    }

    // 显示开始游戏遮罩层
    showStartOverlay() {
        const overlay = document.getElementById('game-start-overlay');
        const button = document.getElementById('start-game-button');
        
        if (overlay && button) {
            // 只在游戏未开始时显示，游戏结束或胜利时不显示
            if (!this.gameStarted && !this.gameLogic.gameOver && !this.gameLogic.won) {
                button.textContent = '开始游戏';
                overlay.style.display = 'flex';
                
                // 绑定点击事件（确保只绑定一次）
                if (!button.hasAttribute('data-bound')) {
                    button.addEventListener('click', async () => {
                        await this.handleNewGame();
                    });
                    button.setAttribute('data-bound', 'true');
                }
            }
        }
    }

    // 隐藏开始游戏遮罩层
    hideStartOverlay() {
        const overlay = document.getElementById('game-start-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    // 设置初始游戏状态（不开始游戏）
    setupInitialState() {
        // 初始化空网格
        this.gameLogic.grid = this.gameLogic.createEmptyGrid();
        this.gameLogic.score = 0;
        this.gameLogic.gameOver = false;
        this.gameLogic.won = false;
        this.gameStarted = false;
        
        // 更新UI但不显示实际游戏内容
        this.uiManager.updateScore(0, this.gameLogic.bestScore);
        this.uiManager.clearMessage();
        
        // 渲染空网格
        this.renderer.renderGame(this.gameLogic.grid);
    }
}