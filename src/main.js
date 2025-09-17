// 主入口文件
import { Game2048 } from './game-controller.js';

// 当页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.game = new Game2048();
        console.log('2048 Game initialized successfully');
    } catch (error) {
        console.error('Failed to initialize game:', error);
        alert('游戏初始化失败：' + error.message);
    }
});