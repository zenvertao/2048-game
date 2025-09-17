// 2048游戏音效管理器 - 简洁版
// 专门为2048游戏设计的音效系统，注重游戏体验的连贯性和愉悦感

const NOTE_FREQS = {
  'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
  'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
  'C6': 1046.50, 'D6': 1174.66, 'E6': 1318.51
};

// 重新设计的音效预设 - 基于分数增加的正向激励
const SFX_PRESETS = {
  // 基础移动音效 - 简单清脆的提示音
  move: { 
    name: '移动', 
    bpm: 300, 
    waveform: 'triangle', 
    score: 'G4/32' 
  },
  
  // 分数获得音效 - 根据分数增量设计不同层次的奖励音效
  // 小分数增加 (4, 8分)
  score_small: { 
    name: '小分数', 
    bpm: 280, 
    waveform: 'sine', 
    score: 'C5/16 E5/16' 
  },
  
  // 中等分数增加 (16, 32, 64分)
  score_medium: { 
    name: '中等分数', 
    bpm: 260, 
    waveform: 'triangle', 
    score: 'E5/16 G5/16 C6/16' 
  },
  
  // 大分数增加 (128, 256, 512分)
  score_large: { 
    name: '大分数', 
    bpm: 240, 
    waveform: 'triangle', 
    score: 'G5/16 B5/16 D6/16 G6/16' 
  },
  
  // 超大分数增加 (1024分以上)
  score_huge: { 
    name: '超大分数', 
    bpm: 220, 
    waveform: 'sine', 
    score: 'C5/16 E5/16 G5/16 C6/16 E6/16' 
  },
  
  // 胜利音效 - 达到2048的庆祝
  win: { 
    name: '胜利', 
    bpm: 180, 
    waveform: 'triangle', 
    score: 'C5/8 E5/8 G5/8 C6/4' 
  },
  
  // 游戏结束 - 简单的下降音效
  gameOver: { 
    name: '游戏结束', 
    bpm: 120, 
    waveform: 'sine', 
    score: 'G4/8 E4/8 C4/4' 
  },
  
  // 游戏开始 - 欢快的开场音乐
  gameStart: {
    name: '游戏开始',
    bpm: 180,
    waveform: 'triangle',
    score: 'C5/8 E5/8 G5/8 C6/8'
  },
  
  // 游戏结束音乐 - 略带忧伤的结束音乐
  gameEndMusic: {
    name: '游戏结束音乐',
    bpm: 100,
    waveform: 'sine', 
    score: 'A4/4 F4/4 D4/4 C4/2'
  }
};

export class AudioManager {
  constructor() {
    this.audioCtx = null;
    this.volume = 0.3; // 适当提高音量，让音效更明显
    this.lastPlayTime = 0;
    this.minInterval = 30; // 减少间隔，让音效更及时
    this.isInitialized = false; // 标记是否已初始化
    this.pendingInit = false; // 防止重复初始化
    
    this.initAudioContext();
    this.setupUserInteractionHandler();
  }

  // 初始化音频上下文
  initAudioContext() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext({
        latencyHint: 'interactive', // 优化为交互响应
        sampleRate: 22050 // 降低采样率减少延迟
      });
      
      // 检查音频上下文状态
      if (this.audioCtx.state === 'suspended') {
        // iOS Safari需要用户交互才能启动
        this.isInitialized = false;
      } else {
        this.isInitialized = true;
      }
    } catch (e) {
      console.warn('Web Audio API not supported, audio disabled');
      this.audioCtx = null;
    }
  }

  // 设置用户交互处理器（用于iOS Safari）
  setupUserInteractionHandler() {
    if (!this.audioCtx) return;
    
    const resumeAudio = async () => {
      if (this.audioCtx && this.audioCtx.state === 'suspended' && !this.pendingInit) {
        this.pendingInit = true;
        try {
          await this.audioCtx.resume();
          this.isInitialized = true;
          console.log('🎵 Audio context resumed successfully');
          // 激活成功后移除事件监听器
          this.removeUserInteractionHandlers();
        } catch (e) {
          console.warn('Failed to resume audio context:', e);
        } finally {
          this.pendingInit = false;
        }
      }
    };

    // 保存处理器引用以便后续移除
    this.audioResumeHandler = resumeAudio;

    // 监听各种用户交互事件，包括捕获阶段
    const events = [
      { type: 'touchstart', useCapture: true },
      { type: 'touchend', useCapture: true }, 
      { type: 'mousedown', useCapture: false },
      { type: 'click', useCapture: false },
      { type: 'keydown', useCapture: false }
    ];
    
    events.forEach(({ type, useCapture }) => {
      document.addEventListener(type, this.audioResumeHandler, { 
        capture: useCapture, 
        passive: true 
      });
    });
    
    // 保存事件配置以便清理
    this.eventConfigs = events;
  }

  // 移除用户交互处理器
  removeUserInteractionHandlers() {
    if (this.audioResumeHandler && this.eventConfigs) {
      this.eventConfigs.forEach(({ type, useCapture }) => {
        document.removeEventListener(type, this.audioResumeHandler, { capture: useCapture });
      });
      this.audioResumeHandler = null;
      this.eventConfigs = null;
    }
  }

  // 解析音符序列
  parseScore(scoreText, bpm) {
    const quarterNoteDuration = 60 / bpm;
    const sequence = [];
    
    for (const noteString of scoreText.trim().split(/\s+/)) {
      const match = noteString.match(/^([A-G]#?)(\d)\/([\d]+)$/i);
      if (!match) continue;
      
      const [, noteName, octave, durationVal] = match;
      const freq = NOTE_FREQS[noteName.toUpperCase() + octave];
      if (!freq) continue;
      
      const duration = (4 / parseInt(durationVal)) * quarterNoteDuration;
      sequence.push({ freq, duration });
    }
    
    return sequence;
  }

  // 播放音效序列
  playScore(scoreData) {
    if (!this.audioCtx || !scoreData) return;
    
    // 如果音频上下文未初始化，尝试启动
    if (!this.isInitialized && this.audioCtx.state === 'suspended') {
      return; // 等待用户交互
    }

    // 防止过于频繁的音效播放
    const now = Date.now();
    if (now - this.lastPlayTime < this.minInterval) return;
    this.lastPlayTime = now;

    try {
      const sequence = this.parseScore(scoreData.score, scoreData.bpm);
      let currentTime = this.audioCtx.currentTime + 0.02;

      sequence.forEach(note => {
        const oscillator = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);
        
        oscillator.type = scoreData.waveform || 'sine';
        oscillator.frequency.setValueAtTime(note.freq, currentTime);
        
        // 使用更自然的音量包络
        gainNode.gain.setValueAtTime(0, currentTime);
        gainNode.gain.linearRampToValueAtTime(this.volume, currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + note.duration * 0.8);
        
        oscillator.start(currentTime);
        oscillator.stop(currentTime + note.duration);
        
        currentTime += note.duration;
      });
    } catch (e) {
      // 静默处理音频错误
    }
  }

  // 播放移动音效
  playMove() {
    this.playScore(SFX_PRESETS.move);
  }

  // 播放分数获得音效 - 根据分数增量选择合适的奖励音效
  playScoreGain(scoreIncrease) {
    if (scoreIncrease <= 0) return;
    
    let presetKey;
    
    if (scoreIncrease <= 8) {
      presetKey = 'score_small';
    } else if (scoreIncrease <= 64) {
      presetKey = 'score_medium';
    } else if (scoreIncrease <= 512) {
      presetKey = 'score_large';
    } else {
      presetKey = 'score_huge';
    }
    
    // 适当延迟播放分数音效，与移动音效形成层次感
    setTimeout(() => {
      this.playScore(SFX_PRESETS[presetKey]);
    }, 80);
  }

  // 播放胜利音效
  playWin() {
    this.playScore(SFX_PRESETS.win);
  }

  // 播放游戏结束音效
  playGameOver() {
    // 先播放简短的结束音乐，再播放结束音效
    this.playScore(SFX_PRESETS.gameEndMusic);
    setTimeout(() => {
      this.playScore(SFX_PRESETS.gameOver);
    }, 800);
  }
  
  // 播放游戏开始音乐
  playGameStart() {
    this.playScore(SFX_PRESETS.gameStart);
  }

  // 获取音频状态信息（用于调试）
  getAudioStatus() {
    if (!this.audioCtx) {
      return { supported: false, state: 'not-supported' };
    }
    return {
      supported: true,
      state: this.audioCtx.state,
      initialized: this.isInitialized,
      sampleRate: this.audioCtx.sampleRate,
      hasHandlers: !!this.audioResumeHandler
    };
  }

  // 手动尝试恢复音频上下文（用于调试）
  async tryResumeAudio() {
    if (!this.audioCtx) {
      console.log('🎵 No audio context available');
      return false;
    }
    
    console.log('🎵 Trying to resume audio, current state:', this.audioCtx.state);
    
    try {
      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
        this.isInitialized = true;
        console.log('🎵 Audio context manually resumed successfully');
        // 激活成功后移除事件监听器
        this.removeUserInteractionHandlers();
        return true;
      } else if (this.audioCtx.state === 'running') {
        this.isInitialized = true;
        console.log('🎵 Audio context is already running');
        return true;
      }
      return false;
    } catch (e) {
      console.error('🎵 Failed to resume audio context:', e);
      return false;
    }
  }
}