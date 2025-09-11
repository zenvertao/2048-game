// 2048游戏 - Canvas实现版本
class Game2048Canvas {
    constructor() {
        // 游戏配置
        this.size = 4; // 4x4网格
        this.tileSize = 0; // 方块大小，将根据屏幕大小动态计算
        this.gridSpacing = 0; // 网格间距
        this.gridRadius = 0; // 网格圆角
        this.containerPadding = 0; // 容器内边距
        
        // 难度设置（只定义一次）
        this.difficultySettings = {
            easy: {
                fourProbability: 0.1,    // 出现4的概率
                bonusMultiplier: 1.5,    // 分数加成
                mergeBonus: 1.2          // 合并加成（合并时单次加成）
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
        this.animationStartTime = 0;
        this.tilesInAnimation = []; // 正在动画中的方块（移动阶段）
        this.moveDuration = 140;    // 位移动画时长(ms)
        this.popDuration = 160;     // 合并弹跳动画时长(ms)
        this.popScale = 0.28;       // 合并弹跳的最大缩放幅度
        this.mergePops = [];        // 合并完成后的弹跳动画
        
        // DOM元素
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreDisplay = document.getElementById('score');
        this.bestScoreDisplay = document.getElementById('best-score');
        this.messageContainer = document.querySelector('.game-message');
        this.currentDifficulty = 'normal';
        this.difficultySelect = document.getElementById('difficulty');
        // 以界面选择为准
        if (this.difficultySelect) {
            this.currentDifficulty = this.difficultySelect.value || this.currentDifficulty;
        }

        // 主题：定义与初始化
        this.themes = {
            classic: {
                // 参考原版 2048 调色
                boardBg: '#bbada0', // 棋盘背景
                cellBg: '#cdc1b4',  // 空单元格
                textLight: '#f9f6f2',
                textDark: '#776e65',
                threshold: 4,
                tiles: {
                    2: '#eee4da', 4: '#ede0c8', 8: '#f2b179', 16: '#f59563', 32: '#f67c5f', 64: '#f65e3b',
                    128: '#edcf72', 256: '#edcc61', 512: '#edc850', 1024: '#edc53f', 2048: '#edc22e'
                }
            },
            dark: {
                boardBg: '#1A232B',
                cellBg: '#2A343D',
                textLight: '#ECEFF1',
                textDark: '#ECEFF1',
                threshold: 8,
                tiles: {
                    2: '#455A64', 4: '#546E7A', 8: '#26C6DA', 16: '#7E57C2', 32: '#FF7043', 64: '#FFA726',
                    128: '#26A69A', 256: '#AB47BC', 512: '#42A5F5', 1024: '#66BB6A', 2048: '#FFEE58'
                }
            },
            pastel: {
                boardBg: '#F9F7F7',
                cellBg: '#EAEAEA',
                textLight: '#5D5A5A',
                textDark: '#5D5A5A',
                threshold: 8,
                textMode: 'auto-contrast',
                tiles: {
                    2: '#FDE2E4', 4: '#E2ECE9', 8: '#E9F5DB', 16: '#FAD2E1', 32: '#BEE1E6', 64: '#CDE7BE',
                    128: '#FAF3DD', 256: '#D0F4DE', 512: '#D7E3FC', 1024: '#F1C0E8', 2048: '#FFF3B0'
                }
            },
            neon: {
                boardBg: '#0F1020',
                cellBg: '#1B1D36',
                textLight: '#FFFFFF',
                textDark: '#0F1020',
                threshold: 8,
                textMode: 'auto-contrast',
                tiles: {
                    2: '#39FF14', 4: '#14FFEC', 8: '#FCEE09', 16: '#FF2079', 32: '#00F0FF', 64: '#FF6B6B',
                    128: '#7CFFCB', 256: '#FFD93D', 512: '#B980F0', 1024: '#00E676', 2048: '#FFD700'
                }
            }
        };
        this.themeSelect = document.getElementById('theme');
        this.currentThemeName = localStorage.getItem('theme2048') || (this.themeSelect ? this.themeSelect.value : 'classic') || 'classic';
        if (this.themeSelect) this.themeSelect.value = this.currentThemeName;
        this.applyTheme();
        
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
        // 初始化最高分显示
        this.bestScoreDisplay.textContent = this.bestScore;
        
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
        const theme = this.themes[this.currentThemeName];
        this.ctx.fillStyle = theme.boardBg; // 游戏容器背景色
        this.roundRect(
            0, 
            0, 
            this.canvas.width, 
            this.canvas.height, 
            10 // 容器圆角
        );
        this.ctx.fill();
        
        // 绘制网格单元格
        this.ctx.fillStyle = theme.cellBg; // 网格单元格颜色
        
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
    drawTiles(excludeDestinations = null) {
        const padding = this.containerPadding;
        const spacing = this.gridSpacing;
        const tileSize = this.tileSize;
        const radius = this.gridRadius;

        const topLeft = (row, col) => ({
            x: padding + spacing + col * (tileSize + spacing),
            y: padding + spacing + row * (tileSize + spacing)
        });

        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const value = this.grid[row][col];
                if (value) {
                    // 在动画期间，避免绘制目标格子，防止和位移动画重复
                    if (excludeDestinations && excludeDestinations.has(`${row},${col}`)) continue;
                    const { x, y } = topLeft(row, col);

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
                    this.ctx.fillText(value.toString(), x + tileSize / 2, y + tileSize / 2);
                }
            }
        }
    }
    
    // 获取方块颜色
    getTileColor(value) {
        const theme = this.themes[this.currentThemeName];
        return theme.tiles[value] || '#E57373'; // 默认备用色
    }
    
    // 获取文字颜色
    getTextColor(value) {
        const theme = this.themes[this.currentThemeName];
        // 自动对比：根据方块背景亮度选择文字颜色
        if (theme.textMode === 'auto-contrast') {
            const color = this.getTileColor(value);
            const lum = this.getLuminance(color);
            return lum > 0.6 ? theme.textDark : theme.textLight;
        }
        // 默认：根据数值阈值切换
        return value <= theme.threshold ? theme.textDark : theme.textLight;
    }

    // 计算颜色相对亮度 (WCAG)
    getLuminance(hex) {
        const c = hex.replace('#','');
        const r = parseInt(c.substring(0,2), 16) / 255;
        const g = parseInt(c.substring(2,4), 16) / 255;
        const b = parseInt(c.substring(4,6), 16) / 255;
        const toLinear = v => (v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4));
        const R = toLinear(r), G = toLinear(g), B = toLinear(b);
        return 0.2126 * R + 0.7152 * G + 0.0722 * B;
    }

    // Hex 颜色转 rgba 字符串
    hexToRgba(hex, alpha = 1) {
        const c = hex.replace('#','');
        const r = parseInt(c.substring(0,2), 16);
        const g = parseInt(c.substring(2,4), 16);
        const b = parseInt(c.substring(4,6), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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
                            moveValue: tile,       // 移动阶段显示原值
                            mergedValue: merged,   // 合并后新值用于弹跳
                            fromX: x,
                            fromY: y,
                            toX: next.x,
                            toY: next.y,
                            merged: true
                        });
                        
                        // 更新分数（在 updateScore 内部统一加成）
                        this.updateScore(merged);

                        // 胜利判断
                        if (merged === 2048 && !this.won) {
                            this.won = true;
                        }
                        
                        moved = true;
                    } else {
                        const farthest = positions.farthest;
                        if (farthest.x !== x || farthest.y !== y) {
                            this.grid[farthest.x][farthest.y] = tile;
                            this.grid[x][y] = null;
                            
                            // 添加动画
                            this.tilesInAnimation.push({
                                moveValue: tile,
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
            // 开启动画，动画完成后再生成新方块
            this.startMoveAnimation();
        }
    }

    // 开始位移动画
    startMoveAnimation() {
        this.animating = true;
        this.animationStartTime = performance.now();
        if (this.animationId) cancelAnimationFrame(this.animationId);
        this.animationId = requestAnimationFrame(this.animateMove.bind(this));
    }

    // 位移动画帧
    animateMove(now) {
        const elapsed = now - this.animationStartTime;
        const t = Math.min(1, elapsed / this.moveDuration);
        // ease-out
        const ease = 1 - Math.pow(1 - t, 3);

        // 目标格集合，避免重复绘制
        const destSet = new Set(this.tilesInAnimation.map(a => `${a.toX},${a.toY}`));

        // 背景 + 静态
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawGrid();
        this.drawTiles(destSet);

        // 绘制动画中的方块
        this.drawAnimatingTiles(ease);

        if (t < 1) {
            this.animationId = requestAnimationFrame(this.animateMove.bind(this));
        } else {
            // 位移动画完成，准备合并弹跳
            this.prepareMergePops();
            if (this.mergePops.length > 0) {
                this.animationStartTime = performance.now();
                this.animationId = requestAnimationFrame(this.animatePop.bind(this));
            } else {
                this.finishAnimationCycle();
            }
        }
    }

    // 绘制动画中的方块（位移）
    drawAnimatingTiles(progress) {
        const padding = this.containerPadding;
        const spacing = this.gridSpacing;
        const tileSize = this.tileSize;
        const radius = this.gridRadius;
        const topLeft = (row, col) => ({
            x: padding + spacing + col * (tileSize + spacing),
            y: padding + spacing + row * (tileSize + spacing)
        });

        for (const anim of this.tilesInAnimation) {
            const from = topLeft(anim.fromX, anim.fromY);
            const to = topLeft(anim.toX, anim.toY);
            const x = from.x + (to.x - from.x) * progress;
            const y = from.y + (to.y - from.y) * progress;

            const value = anim.moveValue;
            this.ctx.fillStyle = this.getTileColor(value);
            this.roundRect(x, y, tileSize, tileSize, radius);
            this.ctx.fill();

            const fontSize = this.getFontSize(value);
            this.ctx.fillStyle = this.getTextColor(value);
            this.ctx.font = `bold ${fontSize}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(value.toString(), x + tileSize / 2, y + tileSize / 2);
        }
    }

    // 为合并准备弹跳动画数据
    prepareMergePops() {
        this.mergePops = [];
        for (const anim of this.tilesInAnimation) {
            if (anim.merged) {
                this.mergePops.push({
                    row: anim.toX,
                    col: anim.toY,
                    value: anim.mergedValue
                });
            }
        }
        this.tilesInAnimation = [];
    }

    // 合并弹跳动画帧
    animatePop(now) {
        const elapsed = now - this.animationStartTime;
        const t = Math.min(1, elapsed / this.popDuration);
        // scale ease: pop up then settle (sine up-down)
        const scale = 1 + this.popScale * Math.sin(t * Math.PI);

        // 背景 + 静态
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawGrid();
        this.drawTiles();

        // 绘制弹跳中的合并块
        const padding = this.containerPadding;
        const spacing = this.gridSpacing;
        const tileSize = this.tileSize;
        const radius = this.gridRadius;
        const topLeft = (row, col) => ({
            x: padding + spacing + col * (tileSize + spacing),
            y: padding + spacing + row * (tileSize + spacing)
        });

        for (const p of this.mergePops) {
            const pos = topLeft(p.row, p.col);
            const cx = pos.x + tileSize / 2;
            const cy = pos.y + tileSize / 2;
            const w = tileSize * scale;
            const h = tileSize * scale;
            const x = cx - w / 2;
            const y = cy - h / 2;

            const fill = this.getTileColor(p.value);
            this.ctx.fillStyle = fill;
            // pop 阶段增加发光，强调合并
            this.ctx.save();
            this.ctx.shadowColor = this.hexToRgba(fill, 0.45);
            this.ctx.shadowBlur = 18;
            this.roundRect(x, y, w, h, radius);
            this.ctx.fill();
            this.ctx.restore();

            const fontSize = this.getFontSize(p.value) * Math.min(1.1, scale + 0.02);
            this.ctx.fillStyle = this.getTextColor(p.value);
            this.ctx.font = `bold ${fontSize}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(p.value.toString(), cx, cy);
        }

        if (t < 1) {
            this.animationId = requestAnimationFrame(this.animatePop.bind(this));
        } else {
            this.finishAnimationCycle();
        }
    }

    // 动画收尾：添加新方块、检测结束并渲染
    finishAnimationCycle() {
        this.animating = false;
        this.mergePops = [];
        this.addRandomTile();
        this.checkGameOver();
        this.renderGame();
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
        // 以 grid[row(x)][col(y)] 约定：
        // 上: 行-1；下: 行+1；左: 列-1；右: 列+1
        const vectors = [
            { x: -1, y: 0 },  // 上
            { x: 1,  y: 0 },  // 下
            { x: 0,  y: -1 }, // 左
            { x: 0,  y: 1 }   // 右
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
    
    // 移除未使用的获取下一个位置方法，避免坐标语义混淆
    
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
                    if (j < this.size - 1 && this.grid[i][j + 1] && this.grid[i][j + 1] === tile) {
                        return true;
                    }
                    
                    // 检查下方
                    if (i < this.size - 1 && this.grid[i + 1][j] && this.grid[i + 1][j] === tile) {
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
            const bonus = Math.round(addedScore * settings.bonusMultiplier);
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

        // 主题切换
        if (this.themeSelect) {
            this.themeSelect.addEventListener('change', () => {
                const nextTheme = this.themeSelect.value;
                if (nextTheme !== this.currentThemeName) {
                    this.currentThemeName = nextTheme;
                    localStorage.setItem('theme2048', this.currentThemeName);
                    this.applyTheme();
                    this.renderAllTiles();
                }
            });
        }
    }

    // 应用主题到页面（CSS 以及 Canvas）
    applyTheme() {
        const body = document.body;
        body.classList.remove('theme-dark', 'theme-pastel', 'theme-neon');
        if (this.currentThemeName !== 'classic') {
            body.classList.add(`theme-${this.currentThemeName}`);
        }
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
