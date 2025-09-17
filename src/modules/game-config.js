// 游戏配置模块
export class GameConfig {
    constructor() {
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

        // 动画配置
        this.animationConfig = {
            moveDuration: 140,    // 位移动画时长(ms)
            popDuration: 160,     // 合并弹跳动画时长(ms)
            popScale: 0.28        // 合并弹跳的最大缩放幅度
        };
    }

    // 根据屏幕大小计算游戏尺寸
    initDimensions(canvas, gameContainer) {
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
        canvas.width = canvasSize;
        canvas.height = canvasSize;
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
}