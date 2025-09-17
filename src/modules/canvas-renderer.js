// Canvas 渲染器模块
export class CanvasRenderer {
    constructor(canvas, config, themeManager) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.config = config;
        this.themeManager = themeManager;
    }

    // 清除画布
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // 绘制背景网格
    drawGrid() {
        const padding = this.config.containerPadding;
        const spacing = this.config.gridSpacing;
        const tileSize = this.config.tileSize;
        const radius = this.config.gridRadius;

        // 绘制背景
        const theme = this.themeManager.getCurrentTheme();
        this.ctx.fillStyle = theme.boardBg;
        this.roundRect(0, 0, this.canvas.width, this.canvas.height, 10);
        this.ctx.fill();

        // 绘制网格单元格
        this.ctx.fillStyle = theme.cellBg;

        for (let i = 0; i < this.config.size; i++) {
            for (let j = 0; j < this.config.size; j++) {
                const x = padding + spacing + j * (tileSize + spacing);
                const y = padding + spacing + i * (tileSize + spacing);

                this.roundRect(x, y, tileSize, tileSize, radius);
                this.ctx.fill();
            }
        }
    }

    // 绘制方块
    drawTiles(grid, excludeDestinations = null) {
        const padding = this.config.containerPadding;
        const spacing = this.config.gridSpacing;
        const tileSize = this.config.tileSize;
        const radius = this.config.gridRadius;

        const topLeft = (row, col) => ({
            x: padding + spacing + col * (tileSize + spacing),
            y: padding + spacing + row * (tileSize + spacing)
        });

        for (let row = 0; row < this.config.size; row++) {
            for (let col = 0; col < this.config.size; col++) {
                const value = grid[row][col];
                if (value) {
                    if (excludeDestinations && excludeDestinations.has(`${row},${col}`)) continue;
                    const { x, y } = topLeft(row, col);

                    // 绘制方块背景
                    this.ctx.fillStyle = this.themeManager.getTileColor(value);
                    this.roundRect(x, y, tileSize, tileSize, radius);
                    this.ctx.fill();

                    // 绘制数字
                    this.drawTileText(value, x + tileSize / 2, y + tileSize / 2);
                }
            }
        }
    }

    // 绘制方块文字
    drawTileText(value, centerX, centerY) {
        const fontSize = this.config.getFontSize(value);
        this.ctx.fillStyle = this.themeManager.getTextColor(value);
        this.ctx.font = `bold ${fontSize}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(value.toString(), centerX, centerY);
    }

    // 绘制动画中的方块（位移）
    drawAnimatingTiles(animations, progress) {
        const padding = this.config.containerPadding;
        const spacing = this.config.gridSpacing;
        const tileSize = this.config.tileSize;
        const radius = this.config.gridRadius;

        const topLeft = (row, col) => ({
            x: padding + spacing + col * (tileSize + spacing),
            y: padding + spacing + row * (tileSize + spacing)
        });

        for (const anim of animations) {
            const from = topLeft(anim.fromX, anim.fromY);
            const to = topLeft(anim.toX, anim.toY);
            const x = from.x + (to.x - from.x) * progress;
            const y = from.y + (to.y - from.y) * progress;

            const value = anim.moveValue;
            this.ctx.fillStyle = this.themeManager.getTileColor(value);
            this.roundRect(x, y, tileSize, tileSize, radius);
            this.ctx.fill();

            this.drawTileText(value, x + tileSize / 2, y + tileSize / 2);
        }
    }

    // 绘制合并弹跳动画
    drawMergePops(mergePops, scale) {
        const padding = this.config.containerPadding;
        const spacing = this.config.gridSpacing;
        const tileSize = this.config.tileSize;
        const radius = this.config.gridRadius;

        const topLeft = (row, col) => ({
            x: padding + spacing + col * (tileSize + spacing),
            y: padding + spacing + row * (tileSize + spacing)
        });

        for (const p of mergePops) {
            const pos = topLeft(p.row, p.col);
            const cx = pos.x + tileSize / 2;
            const cy = pos.y + tileSize / 2;
            const w = tileSize * scale;
            const h = tileSize * scale;
            const x = cx - w / 2;
            const y = cy - h / 2;

            const fill = this.themeManager.getTileColor(p.value);
            this.ctx.fillStyle = fill;

            // 添加发光效果
            this.ctx.save();
            this.ctx.shadowColor = this.themeManager.hexToRgba(fill, 0.45);
            this.ctx.shadowBlur = 18;
            this.roundRect(x, y, w, h, radius);
            this.ctx.fill();
            this.ctx.restore();

            // 绘制文字
            const fontSize = this.config.getFontSize(p.value) * Math.min(1.1, scale + 0.02);
            this.ctx.fillStyle = this.themeManager.getTextColor(p.value);
            this.ctx.font = `bold ${fontSize}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(p.value.toString(), cx, cy);
        }
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

    // 渲染完整游戏场景
    renderGame(grid) {
        this.clear();
        this.drawGrid();
        this.drawTiles(grid);
    }
}