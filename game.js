// 2048游戏 - Canvas实现版本
class Game2048Canvas {
    constructor() {
        // 游戏配置
        this.size = 4; // 4x4网格
        this.tileSize = 0; // 方块大小，将根据屏幕大小动态计算
        this.gridSpacing = 0; // 网格间距
        this.gridRadius = 0; // 网格圆角
        this.containerPadding = 0; // 容器内边距
        
        // 难度设置
        this.difficultySettings = {
            easy: {
                fourProbability: 0.1,    // 出现4的概率
                bonusMultiplier: 1.5,    // 分数加成
                mergeBonus: 1.2          // 合并加成
            },
            normal: {
                fourProbability: 0.2,
                bonusMultiplier: 1.0,
                mergeBonus: 1.0
            },
            hard: {
                fourProbability: 0.3,
                bonusMultiplier: 0.8,
                mergeBonus: 0.8
            }
        };
        
        // 游戏状态
        this.score = 0;
        this.bestScore = this.getBestScore();
        this.grid = [];
        this.gameOver = false;
        this.won = false;
        this.animating = false; // 是否正在动画中
        
        // 动画相关
        this.animationId = null;
        this.animationDuration = 200; // 动画持续时间(毫秒)
        this.animationStartTime = 0;
        this.tilesInAnimation = []; // 正在动画中的方块
        
        // DOM元素
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreDisplay = document.getElementById('score');
        this.bestScoreDisplay = document.getElementById('best-score');
        this.messageContainer = document.querySelector('.game-message');
        
        // 难度设置
        this.difficultySettings = {
            easy: {
                fourProbability: 0.1,    // 出现4的概率
                bonusMultiplier: 1.5,    // 分数加成
                mergeBonus: 1.2          // 合并加成
            },
            normal: {
                fourProbability: 0.2,
                bonusMultiplier: 1.0,
                mergeBonus: 1.0
            },
            hard: {
                fourProbability: 0.3,
                bonusMultiplier: 0.8,
                mergeBonus: 0.8
            }
        };
        
        this.currentDifficulty = 'normal';
        this.difficultySelect = document.getElementById('difficulty');
        
        // 初始化
        this.initDimensions();
        this.setupEventListeners();
        this.startGame();
    }
    
    // 初始化尺寸
    initDimensions() {
        // 根据屏幕大小计算游戏尺寸
        const gameContainer = document.querySelector('.game-container');
        const containerWidth = gameContainer.clientWidth - 20; // 减去内边距
        
        // 计算方块大小和间距
        this.containerPadding = Math.max(10, containerWidth * 0.03);
        this.gridSpacing = Math.max(8, containerWidth * 0.02);
        this.gridRadius = Math.max(6, containerWidth * 0.02);
        
        // 计算可用空间和方块大小
        const availableSpace = containerWidth - this.containerPadding * 2 - this.gridSpacing * (this.size + 1);
        this.tileSize = availableSpace / this.size;
        
        // 设置Canvas尺寸
        const canvasSize = containerWidth;
        this.canvas.width = canvasSize;
        this.canvas.height = canvasSize;
        
        // 更新已有方块的位置
        if (this.grid.length > 0) {
            this.renderAllTiles();
        }
    }
    
    // 初始化游戏
    startGame() {
        this.grid = this.createEmptyGrid();
        this.score = 0;
        this.gameOver = false;
        this.won = false;
        this.updateScore();
        this.clearMessage();
        
        // 添加初始的两个方块
        this.addRandomTile();
        this.addRandomTile();
        
        // 渲染游戏
        this.renderGame();
    }

    // 创建空网格
    createEmptyGrid() {
        const grid = [];
        for (let i = 0; i < this.size; i++) {
            grid[i] = [];
            for (let j = 0; j < this.size; j++) {
                grid[i][j] = null;
            }
        }
        return grid;
    }

    // 添加随机方块
    addRandomTile() {
        if (this.isGridFull()) return;
        
        let emptyCells = [];
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (!this.grid[i][j]) {
                    emptyCells.push({x: i, y: j});
                }
            }
        }
        
        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            const settings = this.difficultySettings[this.currentDifficulty];
            const value = Math.random() < settings.fourProbability ? 4 : 2;
            this.grid[randomCell.x][randomCell.y] = value;
        }
    }
    
    // 检查网格是否已满
    isGridFull() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (!this.grid[i][j]) {
                    return false;
                }
            }
        }
        return true;
    }
    
    // 渲染游戏
    renderGame() {
        // 清除画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制背景网格
        this.drawGrid();
        
        // 绘制方块
        this.drawTiles();
        
        // 如果游戏结束或胜利，显示消息
        if (this.gameOver || this.won) {
            this.showMessage(this.won);
        }
    }
    
    // 绘制背景网格
    drawGrid() {
        const padding = this.containerPadding;
        const spacing = this.gridSpacing;
        const tileSize = this.tileSize;
        const radius = this.gridRadius;
        
        // 绘制背景
        this.ctx.fillStyle = '#E0F7FA'; // 游戏容器背景色
        this.roundRect(
            0, 
            0, 
            this.canvas.width, 
            this.canvas.height, 
            10 // 容器圆角
        );
        this.ctx.fill();
        
        // 绘制网格单元格
        this.ctx.fillStyle = '#CFD8DC'; // 网格单元格颜色
        
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const x = padding + spacing + j * (tileSize + spacing);
                const y = padding + spacing + i * (tileSize + spacing);
                
                this.roundRect(x, y, tileSize, tileSize, radius);
                this.ctx.fill();
            }
        }
    }
    
    // 绘制方块
    drawTiles() {
        const padding = this.containerPadding;
        const spacing = this.gridSpacing;
        const tileSize = this.tileSize;
        const radius = this.gridRadius;

        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const value = this.grid[i][j];
                if (value) {
                    const x = padding + spacing * (i + 1) + tileSize * i;
                    const y = padding + spacing * (j + 1) + tileSize * j;

                    // 绘制方块背景
                    this.ctx.fillStyle = this.getTileColor(value);
                    this.roundRect(x, y, tileSize, tileSize, radius);
                    this.ctx.fill();

                    // 绘制数字
                    const fontSize = this.getFontSize(value);
                    this.ctx.fillStyle = this.getTextColor(value);
                    this.ctx.font = `bold ${fontSize}px Arial`;
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillText(
                        value.toString(),
                        x + tileSize / 2,
                        y + tileSize / 2
                    );
                }
            }
        }
    }
    
    // 获取方块颜色
    getTileColor(value) {
        const colors = {
            2: '#AED581',    // 浅绿色
            4: '#81C784',    // 绿色
            8: '#4FC3F7',    // 蓝色
            16: '#7986CB',   // 靛蓝色
            32: '#9575CD',   // 紫色
            64: '#FFB74D',   // 橙色
            128: '#FF8A65',  // 深橙色
            256: '#F06292',  // 粉红色
            512: '#BA68C8',  // 紫色
            1024: '#4DB6AC', // 青色
            2048: '#FFD54F'  // 金色
        };
        
        return colors[value] || '#E57373'; // 默认红色
    }
    
    // 获取文字颜色
    getTextColor(value) {
        return value <= 4 ? '#33691E' : '#FFFFFF';
    }
    
    // 获取字体大小
    getFontSize(value) {
        const baseSize = this.tileSize * 0.5;
        let size = baseSize;
        
        if (value >= 1000) {
            size = baseSize * 0.4;
        } else if (value >= 100) {
            size = baseSize * 0.5;
        } else if (value >= 10) {
            size = baseSize * 0.6;
        }
        
        return Math.max(10, Math.min(size, 36)); // 最小10px，最大36px
    }
    
    // 绘制圆角矩形
    roundRect(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
    }
    
    // 移动方块
    move(direction) {
        if (this.gameOver || this.won || this.animating) {
            return;
        }

        let moved = false;
        this.tilesInAnimation = []; // 清空动画方块列表

        // 创建网格副本用于移动前的状态保存
        const gridCopy = JSON.parse(JSON.stringify(this.grid));
        
        // 根据方向确定遍历顺序
        const traversals = this.buildTraversals(direction);
        
        traversals.x.forEach(x => {
            traversals.y.forEach(y => {
                const tile = this.grid[x][y];
                if (tile) {
                    const cell = { x: x, y: y };
                    const positions = this.findFarthestPosition(cell, direction);
                    const next = positions.next;

                    if (next && this.grid[next.x][next.y] === tile) {
                        // 合并
                        const merged = tile * 2;
                        this.grid[next.x][next.y] = merged;
                        this.grid[x][y] = null;
                        
                        // 添加动画
                        this.tilesInAnimation.push({
                            value: merged,
                            fromX: x,
                            fromY: y,
                            toX: next.x,
                            toY: next.y,
                            merged: true
                        });
                        
                        // 更新分数
                        const settings = this.difficultySettings[this.currentDifficulty];
                        this.updateScore(merged * settings.mergeBonus);
                        
                        moved = true;
                    } else {
                        const farthest = positions.farthest;
                        if (farthest.x !== x || farthest.y !== y) {
                            this.grid[farthest.x][farthest.y] = tile;
                            this.grid[x][y] = null;
                            
                            // 添加动画
                            this.tilesInAnimation.push({
                                value: tile,
                                fromX: x,
                                fromY: y,
                                toX: farthest.x,
                                toY: farthest.y,
                                merged: false
                            });
                            
                            moved = true;
                        }
                    }
                }
            });
        });

        if (moved) {
            this.addRandomTile();
            this.checkGameOver();
            this.renderGame();
        }
    }

    // 找到给定方向上的最远位置
    findFarthestPosition(cell, direction) {
        const vector = this.getVector(direction);
        let previous;
        let current = { x: cell.x, y: cell.y };

        do {
            previous = current;
            current = {
                x: previous.x + vector.x,
                y: previous.y + vector.y
            };
        } while (
            this.isWithinBounds(current) &&
            this.grid[current.x][current.y] === null
        );

        return {
            farthest: previous,
            next: this.isWithinBounds(current) ? current : null
        };
    }

    // 获取方向向量
    getVector(direction) {
        const vectors = [
            { x: 0, y: -1 },  // 上
            { x: 0, y: 1 },   // 下
            { x: -1, y: 0 },  // 左
            { x: 1, y: 0 }    // 右
        ];
        return vectors[direction];
    }

    // 检查坐标是否在边界内
    isWithinBounds(position) {
        return position.x >= 0 && position.x < this.size &&
               position.y >= 0 && position.y < this.size;
    }

    // 构建遍历顺序
    buildTraversals(direction) {
        const vector = this.getVector(direction);
        const traversals = {
            x: Array.from({ length: this.size }, (_, i) => i),
            y: Array.from({ length: this.size }, (_, i) => i)
        };

        if (vector.x === 1) traversals.x.reverse();
        if (vector.y === 1) traversals.y.reverse();

        return traversals;
    }
    
    // 获取下一个位置
    getNextPosition(cell, direction) {
        const directions = [
            {x: 0, y: -1},  // 左
            {x: 0, y: 1},   // 右
            {x: -1, y: 0},  // 上
            {x: 1, y: 0}    // 下
        ];
        
        const vector = directions[direction];
        const nextX = cell.x + vector.x;
        const nextY = cell.y + vector.y;
        
        if (nextX < 0 || nextX >= this.size || nextY < 0 || nextY >= this.size) {
            return null;
        }
        
        return {x: nextX, y: nextY};
    }
    
    // 获取下一个方块
    getNextTile(cell, direction) {
        const next = this.getNextPosition(cell, direction);
        if (!next) return null;
        
        return next;
    }
    
    // 检查是否有可能的移动
    hasPossibleMoves() {
        // 检查是否有空格
        if (!this.isGridFull()) return true;
        
        // 检查是否有可以合并的相邻方块
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const tile = this.grid[i][j];
                if (tile) {
                    // 检查右侧
                    if (j < this.size - 1 && this.grid[i][j + 1] && this.grid[i][j + 1].value === tile.value) {
                        return true;
                    }
                    
                    // 检查下方
                    if (i < this.size - 1 && this.grid[i + 1][j] && this.grid[i + 1][j].value === tile.value) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }
    
    // 检查游戏是否结束
    checkGameOver() {
        if (!this.hasPossibleMoves()) {
            this.gameOver = true;
        }
    }
    
    // 更新分数显示
    updateScore(addedScore) {
        if (addedScore) {
            const settings = this.difficultySettings[this.currentDifficulty];
            const bonus = Math.round(addedScore * settings.bonusMultiplier * settings.mergeBonus);
            this.score += bonus;
            
            // 移除旧的分数动画元素
            const oldBonus = document.querySelector('.score-addition');
            if (oldBonus) {
                oldBonus.remove();
            }
            
            // 显示新的分数动画
            const scoreBox = document.querySelector('.score-box');
            const bonusElement = document.createElement('div');
            bonusElement.className = 'score-addition';
            bonusElement.textContent = '+' + bonus;
            scoreBox.appendChild(bonusElement);
            
            // 动画结束后移除元素
            bonusElement.addEventListener('animationend', () => {
                bonusElement.remove();
            });
        }
        
        this.scoreDisplay.textContent = this.score;
        
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            this.bestScoreDisplay.textContent = this.bestScore;
            this.saveBestScore();
        }
    }
    
    // 保存最高分到本地存储
    saveBestScore() {
        localStorage.setItem('bestScore2048', this.bestScore);
    }
    
    // 获取本地存储的最高分
    getBestScore() {
        return parseInt(localStorage.getItem('bestScore2048')) || 0;
    }
    
    // 显示游戏结束或胜利消息
    showMessage(won) {
        this.clearMessage();
        this.messageContainer.style.display = 'block';
        
        if (won) {
            this.messageContainer.classList.add('game-won');
            this.messageContainer.querySelector('p').textContent = '恭喜你赢了！';
        } else {
            this.messageContainer.classList.add('game-over');
            this.messageContainer.querySelector('p').textContent = '游戏结束！';
        }
    }
    
    // 清除消息
    clearMessage() {
        this.messageContainer.style.display = 'none';
        this.messageContainer.classList.remove('game-won', 'game-over');
    }
    
    // 重新渲染所有方块
    renderAllTiles() {
        // 取消正在进行的动画
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.animating = false;
        this.tilesInAnimation = [];
        this.renderGame();
    }
    
    // 设置事件监听器
    setupEventListeners() {
        // 键盘控制
        document.addEventListener('keydown', event => {
            if (!this.gameOver && !this.animating) {
                switch(event.key) {
                    case 'ArrowUp': 
                        event.preventDefault();
                        this.move(0);
                        break;
                    case 'ArrowDown':
                        event.preventDefault();
                        this.move(1);
                        break;
                    case 'ArrowLeft':
                        event.preventDefault();
                        this.move(2);
                        break;
                    case 'ArrowRight':
                        event.preventDefault();
                        this.move(3);
                        break;
                }
            }
        });

        // 难度选择改变事件
        this.difficultySelect.addEventListener('change', () => {
            const newDifficulty = this.difficultySelect.value;
            if (newDifficulty !== this.currentDifficulty) {
                this.currentDifficulty = newDifficulty;
                if (confirm('更改难度需要重新开始游戏，是否继续？')) {
                    this.startGame();
                } else {
                    this.difficultySelect.value = this.currentDifficulty;
                }
            }
        });

        // 新游戏按钮
        document.getElementById('new-game-button').addEventListener('click', () => {
            this.startGame();
        });

        // 重试按钮
        document.querySelector('.retry-button').addEventListener('click', () => {
            this.startGame();
        });

        // 触摸控制
        let touchStartX, touchStartY;
        
        this.canvas.addEventListener('touchstart', event => {
            event.preventDefault();
            touchStartX = event.touches[0].clientX;
            touchStartY = event.touches[0].clientY;
        }, { passive: false });

        this.canvas.addEventListener('touchend', event => {
            if (!touchStartX || !touchStartY) return;

            const touchEndX = event.changedTouches[0].clientX;
            const touchEndY = event.changedTouches[0].clientY;
            
            const dx = touchEndX - touchStartX;
            const dy = touchEndY - touchStartY;
            
            if (Math.abs(dx) > 20 || Math.abs(dy) > 20) {
                if (Math.abs(dx) > Math.abs(dy)) {
                    this.move(dx > 0 ? 3 : 2);
                } else {
                    this.move(dy > 0 ? 1 : 0);
                }
            }
        });

        // 窗口大小变化时重新计算尺寸
        window.addEventListener('resize', () => {
            this.initDimensions();
        });
    }
}

// 当页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    if (canvas && canvas.getContext) {
        window.game = new Game2048Canvas();
    } else {
        alert('您的浏览器不支持Canvas，请使用现代浏览器访问。');
    }
});