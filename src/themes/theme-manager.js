// 主题配置模块
export const themes = {
    classic: {
        boardBg: '#bbada0',
        cellBg: '#cdc1b4',
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

export class ThemeManager {
    constructor() {
        this.currentThemeName = localStorage.getItem('theme2048') || 'classic';
        this.applyTheme();
    }

    // 获取方块颜色
    getTileColor(value) {
        const theme = themes[this.currentThemeName];
        return theme.tiles[value] || '#E57373';
    }

    // 获取文字颜色
    getTextColor(value) {
        const theme = themes[this.currentThemeName];

        if (theme.textMode === 'auto-contrast') {
            const color = this.getTileColor(value);
            const lum = this.getLuminance(color);
            return lum > 0.6 ? theme.textDark : theme.textLight;
        }

        return value <= theme.threshold ? theme.textDark : theme.textLight;
    }

    // 计算颜色相对亮度 (WCAG)
    getLuminance(hex) {
        const c = hex.replace('#', '');
        const r = parseInt(c.substring(0, 2), 16) / 255;
        const g = parseInt(c.substring(2, 4), 16) / 255;
        const b = parseInt(c.substring(4, 6), 16) / 255;
        const toLinear = v => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
        const R = toLinear(r), G = toLinear(g), B = toLinear(b);
        return 0.2126 * R + 0.7152 * G + 0.0722 * B;
    }

    // Hex 颜色转 rgba 字符串
    hexToRgba(hex, alpha = 1) {
        const c = hex.replace('#', '');
        const r = parseInt(c.substring(0, 2), 16);
        const g = parseInt(c.substring(2, 4), 16);
        const b = parseInt(c.substring(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    // 应用主题到页面
    applyTheme() {
        const body = document.body;
        body.classList.remove('theme-dark', 'theme-pastel', 'theme-neon');
        if (this.currentThemeName !== 'classic') {
            body.classList.add(`theme-${this.currentThemeName}`);
        }
    }

    // 切换主题
    setTheme(themeName) {
        if (themes[themeName]) {
            this.currentThemeName = themeName;
            localStorage.setItem('theme2048', this.currentThemeName);
            this.applyTheme();
            return true;
        }
        return false;
    }

    // 获取当前主题
    getCurrentTheme() {
        return themes[this.currentThemeName];
    }

    // 获取当前主题名称
    getCurrentThemeName() {
        return this.currentThemeName;
    }
}