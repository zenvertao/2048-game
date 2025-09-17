// 游戏逻辑核心模块
export class GameLogic {
    constructor(config) {
        this.config = config;
        this.grid = [];
        this.score = 0;
        this.bestScore = this.getBestScore();
        this.gameOver = false;
        this.won = false;
        this.currentDifficulty = 'normal';
    }

    // 创建空网格
    createEmptyGrid() {
        const grid = [];
        for (let i = 0; i < this.config.size; i++) {
            grid[i] = [];
            for (let j = 0; j < this.config.size; j++) {
                grid[i][j] = null;
            }
        }
        return grid;
    }

    // 初始化游戏
    startGame() {
        this.grid = this.createEmptyGrid();
        this.score = 0;
        this.gameOver = false;
        this.won = false;

        // 添加初始的两个方块
        this.addRandomTile();
        this.addRandomTile();

        return { grid: this.grid, score: this.score };
    }

    // 添加随机方块
    addRandomTile() {
        if (this.isGridFull()) return;

        let emptyCells = [];
        for (let i = 0; i < this.config.size; i++) {
            for (let j = 0; j < this.config.size; j++) {
                if (!this.grid[i][j]) {
                    emptyCells.push({ x: i, y: j });
                }
            }
        }

        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            const settings = this.config.difficultySettings[this.currentDifficulty];
            const value = Math.random() < settings.fourProbability ? 4 : 2;
            this.grid[randomCell.x][randomCell.y] = value;
        }
    }

    // 检查网格是否已满
    isGridFull() {
        for (let i = 0; i < this.config.size; i++) {
            for (let j = 0; j < this.config.size; j++) {
                if (!this.grid[i][j]) {
                    return false;
                }
            }
        }
        return true;
    }

    // 移动方块
    move(direction) {
        if (this.gameOver || this.won) {
            return null;
        }

        let moved = false;
        const animations = [];
        let totalAddedScore = 0; // 新增分数的累计

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

                        // 添加动画信息
                        animations.push({
                            moveValue: tile,
                            mergedValue: merged,
                            fromX: x,
                            fromY: y,
                            toX: next.x,
                            toY: next.y,
                            merged: true
                        });

                        // 更新分数
                        const addedScore = this.updateScore(merged);
                        totalAddedScore += addedScore;

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

                            // 添加动画信息
                            animations.push({
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
            return { moved: true, animations, score: this.score, addedScore: totalAddedScore };
        }

        return null;
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
            { x: -1, y: 0 },  // 上
            { x: 1, y: 0 },   // 下
            { x: 0, y: -1 },  // 左
            { x: 0, y: 1 }    // 右
        ];
        return vectors[direction];
    }

    // 检查坐标是否在边界内
    isWithinBounds(position) {
        return position.x >= 0 && position.x < this.config.size &&
            position.y >= 0 && position.y < this.config.size;
    }

    // 构建遍历顺序
    buildTraversals(direction) {
        const vector = this.getVector(direction);
        const traversals = {
            x: Array.from({ length: this.config.size }, (_, i) => i),
            y: Array.from({ length: this.config.size }, (_, i) => i)
        };

        if (vector.x === 1) traversals.x.reverse();
        if (vector.y === 1) traversals.y.reverse();

        return traversals;
    }

    // 检查是否有可能的移动
    hasPossibleMoves() {
        if (!this.isGridFull()) return true;

        for (let i = 0; i < this.config.size; i++) {
            for (let j = 0; j < this.config.size; j++) {
                const tile = this.grid[i][j];
                if (tile) {
                    // 检查右侧
                    if (j < this.config.size - 1 && this.grid[i][j + 1] && this.grid[i][j + 1] === tile) {
                        return true;
                    }

                    // 检查下方
                    if (i < this.config.size - 1 && this.grid[i + 1][j] && this.grid[i + 1][j] === tile) {
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
        return this.gameOver;
    }

    // 更新分数
    updateScore(addedScore) {
        if (addedScore) {
            const settings = this.config.difficultySettings[this.currentDifficulty];
            const bonus = Math.round(addedScore * settings.bonusMultiplier);
            this.score += bonus;

            if (this.score > this.bestScore) {
                this.bestScore = this.score;
                this.saveBestScore();
            }

            return bonus;
        }
        return 0;
    }

    // 保存最高分到本地存储
    saveBestScore() {
        localStorage.setItem('bestScore2048', this.bestScore);
    }

    // 获取本地存储的最高分
    getBestScore() {
        return parseInt(localStorage.getItem('bestScore2048')) || 0;
    }

    // 设置难度
    setDifficulty(difficulty) {
        this.currentDifficulty = difficulty;
    }
}