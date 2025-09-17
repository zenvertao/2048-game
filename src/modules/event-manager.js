// 事件管理器模块
export class EventManager {
    constructor(canvas, onMove, onNewGame, onDifficultyChange, onThemeChange) {
        this.canvas = canvas;
        this.onMove = onMove;
        this.onNewGame = onNewGame;
        this.onDifficultyChange = onDifficultyChange;
        this.onThemeChange = onThemeChange;

        this.setupEventListeners();
    }

    // 设置事件监听器
    setupEventListeners() {
        // 键盘控制
        document.addEventListener('keydown', this.handleKeydown.bind(this));

        // 触摸控制
        this.setupTouchControls();

        // UI 控件事件
        this.setupUIControls();

        // 窗口大小变化
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    // 键盘事件处理
    handleKeydown(event) {
        const directionMap = {
            'ArrowUp': 0,
            'ArrowDown': 1,
            'ArrowLeft': 2,
            'ArrowRight': 3
        };

        if (directionMap.hasOwnProperty(event.key)) {
            event.preventDefault();
            this.onMove(directionMap[event.key]);
        }
    }

    // 设置触摸控制
    setupTouchControls() {
        let touchStartX, touchStartY;

        this.canvas.addEventListener('touchstart', (event) => {
            event.preventDefault();
            touchStartX = event.touches[0].clientX;
            touchStartY = event.touches[0].clientY;
        }, { passive: false });

        this.canvas.addEventListener('touchend', (event) => {
            if (!touchStartX || !touchStartY) return;

            const touchEndX = event.changedTouches[0].clientX;
            const touchEndY = event.changedTouches[0].clientY;

            const dx = touchEndX - touchStartX;
            const dy = touchEndY - touchStartY;

            if (Math.abs(dx) > 20 || Math.abs(dy) > 20) {
                if (Math.abs(dx) > Math.abs(dy)) {
                    this.onMove(dx > 0 ? 3 : 2); // 右 : 左
                } else {
                    this.onMove(dy > 0 ? 1 : 0); // 下 : 上
                }
            }

            touchStartX = null;
            touchStartY = null;
        });
    }

    // 设置UI控件事件
    setupUIControls() {
        // 开始游戏按钮
        const startGameButton = document.getElementById('start-game-button');
        if (startGameButton) {
            startGameButton.addEventListener('click', this.onNewGame);
        }

        // 重试按钮
        const retryButton = document.querySelector('.retry-button');
        if (retryButton) {
            retryButton.addEventListener('click', this.onNewGame);
        }

        // 难度选择
        const difficultySelect = document.getElementById('difficulty');
        if (difficultySelect) {
            difficultySelect.addEventListener('change', (event) => {
                this.onDifficultyChange(event.target.value);
            });
        }

        // 主题选择
        const themeSelect = document.getElementById('theme');
        if (themeSelect) {
            themeSelect.addEventListener('change', (event) => {
                this.onThemeChange(event.target.value);
            });
        }
    }

    // 窗口大小变化处理
    handleResize() {
        // 这个方法将由主游戏类实现
        if (this.onResize) {
            this.onResize();
        }
    }

    // 设置窗口大小变化回调
    setResizeCallback(callback) {
        this.onResize = callback;
    }
}