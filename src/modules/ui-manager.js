// UI 管理器模块
export class UIManager {
    constructor() {
        this.scoreDisplay = document.getElementById('score');
        this.bestScoreDisplay = document.getElementById('best-score');
        this.messageContainer = document.querySelector('.game-message');
        this.difficultySelect = document.getElementById('difficulty');
        this.themeSelect = document.getElementById('theme');
    }

    // 更新分数显示
    updateScore(score, bestScore, addedScore = 0) {
        if (this.scoreDisplay) {
            this.scoreDisplay.textContent = score;
        }

        if (this.bestScoreDisplay) {
            this.bestScoreDisplay.textContent = bestScore;
        }

        // 显示分数动画
        if (addedScore > 0) {
            this.showScoreAnimation(addedScore);
        }
    }

    // 显示分数动画
    showScoreAnimation(addedScore) {
        // 移除旧的分数动画元素
        const oldBonus = document.querySelector('.score-addition');
        if (oldBonus) {
            oldBonus.remove();
        }

        // 显示新的分数动画
        const scoreBox = document.querySelector('.score-box');
        if (scoreBox) {
            const bonusElement = document.createElement('div');
            bonusElement.className = 'score-addition';
            bonusElement.textContent = '+' + addedScore;
            scoreBox.appendChild(bonusElement);

            // 动画结束后移除元素
            bonusElement.addEventListener('animationend', () => {
                bonusElement.remove();
            });
        }
    }

    // 显示游戏结束或胜利消息
    showMessage(won) {
        this.clearMessage();
        if (this.messageContainer) {
            this.messageContainer.style.display = 'block';

            if (won) {
                this.messageContainer.classList.add('game-won');
                const messageText = this.messageContainer.querySelector('p');
                if (messageText) {
                    messageText.textContent = '恭喜你赢了！';
                }
            } else {
                this.messageContainer.classList.add('game-over');
                const messageText = this.messageContainer.querySelector('p');
                if (messageText) {
                    messageText.textContent = '游戏结束！';
                }
            }
        }
    }

    // 清除消息
    clearMessage() {
        if (this.messageContainer) {
            this.messageContainer.style.display = 'none';
            this.messageContainer.classList.remove('game-won', 'game-over');
        }
    }

    // 获取当前难度设置
    getCurrentDifficulty() {
        return this.difficultySelect ? this.difficultySelect.value : 'normal';
    }

    // 设置难度选择器的值
    setDifficulty(difficulty) {
        if (this.difficultySelect) {
            this.difficultySelect.value = difficulty;
        }
    }

    // 获取当前主题设置
    getCurrentTheme() {
        return this.themeSelect ? this.themeSelect.value : 'classic';
    }

    // 设置主题选择器的值
    setTheme(theme) {
        if (this.themeSelect) {
            this.themeSelect.value = theme;
        }
    }

    // 显示难度确认对话框
    confirmDifficultyChange() {
        return new Promise((resolve) => {
            // 创建遮罩层
            const overlay = document.createElement('div');
            overlay.className = 'confirm-overlay';
            overlay.innerHTML = `
                <div class="confirm-dialog">
                    <div class="confirm-content">
                        <h3>确认更改难度</h3>
                        <p>更改难度需要重新开始游戏，是否继续？</p>
                        <div class="confirm-buttons">
                            <button class="confirm-btn confirm-cancel">取消</button>
                            <button class="confirm-btn confirm-ok">确定</button>
                        </div>
                    </div>
                </div>
            `;
            
            // 添加样式
            this.addConfirmStyles();
            
            // 添加到页面
            document.body.appendChild(overlay);
            
            // 绑定事件
            const cancelBtn = overlay.querySelector('.confirm-cancel');
            const okBtn = overlay.querySelector('.confirm-ok');
            
            const cleanup = () => {
                document.body.removeChild(overlay);
            };
            
            cancelBtn.onclick = () => {
                cleanup();
                resolve(false);
            };
            
            okBtn.onclick = () => {
                cleanup();
                resolve(true);
            };
            
            // 点击遮罩层背景关闭
            overlay.onclick = (e) => {
                if (e.target === overlay) {
                    cleanup();
                    resolve(false);
                }
            };
        });
    }
    
    // 添加确认框样式
    addConfirmStyles() {
        if (document.getElementById('confirm-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'confirm-styles';
        style.textContent = `
            .confirm-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
                backdrop-filter: blur(2px);
            }
            
            .confirm-dialog {
                background: white;
                border-radius: 12px;
                padding: 0;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                max-width: 400px;
                width: 90%;
                animation: confirmScale 0.2s ease;
            }
            
            .confirm-content {
                padding: 24px;
                text-align: center;
            }
            
            .confirm-content h3 {
                margin: 0 0 16px 0;
                color: #776e65;
                font-size: 20px;
            }
            
            .confirm-content p {
                margin: 0 0 24px 0;
                color: #666;
                line-height: 1.5;
            }
            
            .confirm-buttons {
                display: flex;
                gap: 12px;
                justify-content: center;
            }
            
            .confirm-btn {
                padding: 10px 20px;
                border: none;
                border-radius: 6px;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.2s ease;
                min-width: 80px;
            }
            
            .confirm-cancel {
                background: #f0f0f0;
                color: #666;
            }
            
            .confirm-cancel:hover {
                background: #e0e0e0;
            }
            
            .confirm-ok {
                background: #8f7a66;
                color: white;
            }
            
            .confirm-ok:hover {
                background: #7c6a59;
            }
            
            @keyframes confirmScale {
                0% { transform: scale(0.8); opacity: 0; }
                100% { transform: scale(1); opacity: 1; }
            }
            
            /* 暗色主题适配 */
            body.theme-dark .confirm-dialog {
                background: #111821;
                color: #E0E6ED;
            }
            
            body.theme-dark .confirm-content h3 {
                color: #E0E6ED;
            }
            
            body.theme-dark .confirm-content p {
                color: #ccc;
            }
            
            body.theme-dark .confirm-cancel {
                background: #333;
                color: #ccc;
            }
            
            body.theme-dark .confirm-cancel:hover {
                background: #444;
            }
            
            body.theme-dark .confirm-ok {
                background: #7C4DFF;
            }
            
            body.theme-dark .confirm-ok:hover {
                background: #6A3FF0;
            }
        `;
        
        document.head.appendChild(style);
    }
}