// 动画管理器模块
export class AnimationManager {
    constructor(config, renderer) {
        this.config = config;
        this.renderer = renderer;
        this.animating = false;
        this.animationId = null;
        this.animationStartTime = 0;
        this.tilesInAnimation = [];
        this.mergePops = [];
    }

    // 检查是否正在动画
    isAnimating() {
        return this.animating;
    }

    // 开始位移动画
    startMoveAnimation(animations, onComplete) {
        this.animating = true;
        this.tilesInAnimation = animations;
        this.animationStartTime = performance.now();
        this.onAnimationComplete = onComplete;

        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.animationId = requestAnimationFrame(this.animateMove.bind(this));
    }

    // 位移动画帧
    animateMove(now) {
        const elapsed = now - this.animationStartTime;
        const t = Math.min(1, elapsed / this.config.animationConfig.moveDuration);
        const ease = 1 - Math.pow(1 - t, 3); // ease-out

        // 目标格集合，避免重复绘制
        const destSet = new Set(this.tilesInAnimation.map(a => `${a.toX},${a.toY}`));

        // 渲染背景和静态方块
        this.renderer.clear();
        this.renderer.drawGrid();
        this.renderer.drawTiles(this.gameGrid, destSet);

        // 绘制动画中的方块
        this.renderer.drawAnimatingTiles(this.tilesInAnimation, ease);

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
        const t = Math.min(1, elapsed / this.config.animationConfig.popDuration);
        const scale = 1 + this.config.animationConfig.popScale * Math.sin(t * Math.PI);

        // 渲染背景和静态方块
        this.renderer.clear();
        this.renderer.drawGrid();
        this.renderer.drawTiles(this.gameGrid);

        // 绘制弹跳中的合并块
        this.renderer.drawMergePops(this.mergePops, scale);

        if (t < 1) {
            this.animationId = requestAnimationFrame(this.animatePop.bind(this));
        } else {
            this.finishAnimationCycle();
        }
    }

    // 动画收尾
    finishAnimationCycle() {
        this.animating = false;
        this.mergePops = [];
        this.tilesInAnimation = [];

        if (this.onAnimationComplete) {
            this.onAnimationComplete();
        }
    }

    // 取消动画
    cancelAnimations() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.animating = false;
        this.tilesInAnimation = [];
        this.mergePops = [];
    }

    // 设置游戏网格引用（用于渲染）
    setGameGrid(grid) {
        this.gameGrid = grid;
    }
}