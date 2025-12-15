/**
 * Константы игры
 */
class Constants {
  // Размеры игры
  static get CANVAS_WIDTH() { return 1024; }
  static get CANVAS_HEIGHT() { return 576; }
  static get TILE_SIZE() { return 64; }
  
  // Физика
  static get GRAVITY() { return 0.5; }
  static get PLAYER_SPEED() { return 5; }
  static get PLAYER_JUMP_FORCE() { return -15; }
  static get MAX_FALL_SPEED() { return 20; }
  static get FRICTION() { return 0.85; }
  static get AIR_FRICTION() { return 0.98; }
  
  // Игрок
  static get PLAYER_WIDTH() { return 32; }
  static get PLAYER_HEIGHT() { return 64; }
  static get PLAYER_MAX_HEALTH() { return 3; }
  static get INVINCIBILITY_TIME() { return 1000; } // ms
  
  // Платформы
  static get PLATFORM_WIDTH() { return 128; }
  static get PLATFORM_HEIGHT() { return 32; }
  
  // Монеты
  static get COIN_RADIUS() { return 16; }
  static get COIN_VALUE() { return 10; }
  static get COIN_ANIMATION_SPEED() { return 0.1; }
  
  // Время
  static get TIME_PER_LEVEL() { return 60; } // секунд
  static get TIME_BONUS_MULTIPLIER() { return 10; }
  
  // Цвета
  static get COLORS() {
      return {
          BACKGROUND: '#0c141c',
          PLAYER: '#3498db',
          PLATFORM: '#2ecc71',
          COIN: '#f1c40f',
          ENEMY: '#e74c3c',
          TEXT: '#ffffff',
          UI_BACKGROUND: 'rgba(0, 0, 0, 0.8)',
          UI_BORDER: '#3498db',
          SCORE: '#f1c40f',
          HEALTH: '#e74c3c',
          TIME: '#3498db'
      };
  }
  
  // Клавиши управления
  static get KEYS() {
      return {
          LEFT: ['ArrowLeft', 'KeyA'],
          RIGHT: ['ArrowRight', 'KeyD'],
          JUMP: ['Space', 'ArrowUp', 'KeyW'],
          PAUSE: ['KeyP', 'Escape'],
          RESTART: ['KeyR'],
          MENU: ['Escape']
      };
  }
  
  // Состояния игры
  static get GAME_STATES() {
      return {
          MENU: 'menu',
          PLAYING: 'playing',
          PAUSED: 'paused',
          GAME_OVER: 'gameOver',
          VICTORY: 'victory',
          LEVEL_COMPLETE: 'levelComplete'
      };
  }
  
  // Уровни сложности
  static get DIFFICULTY() {
      return {
          EASY: {
              platforms: 15,
              coins: 10,
              enemies: 0,
              time: 90
          },
          NORMAL: {
              platforms: 12,
              coins: 15,
              enemies: 2,
              time: 60
          },
          HARD: {
              platforms: 10,
              coins: 20,
              enemies: 4,
              time: 45
          }
      };
  }
  
  // Анимация
  static get ANIMATION_FRAMES() {
      return {
          PLAYER_IDLE: 2,
          PLAYER_RUN: 4,
          COIN_SPIN: 8
      };
  }
  
  // Звуки (пути к файлам)
  static get SOUNDS() {
      return {
          JUMP: 'assets/sounds/jump.mp3',
          COIN: 'assets/sounds/coin.mp3',
          HIT: 'assets/sounds/hit.mp3',
          VICTORY: 'assets/sounds/victory.mp3',
          GAME_OVER: 'assets/sounds/game_over.mp3',
          BACKGROUND: 'assets/sounds/background.mp3'
      };
  }
  
  // LocalStorage ключи
  static get STORAGE_KEYS() {
      return {
          HIGH_SCORE: 'pixel_jumper_high_score',
          SOUND_ENABLED: 'pixel_jumper_sound_enabled',
          PARTICLES_ENABLED: 'pixel_jumper_particles_enabled',
          LEVEL_PROGRESS: 'pixel_jumper_level_progress'
      };
  }
}
