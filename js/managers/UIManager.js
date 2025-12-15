/**
 * Менеджер пользовательского интерфейса
 */
class UIManager {
  constructor(game) {
      this.game = game;
      this.elements = {};
      this.isInitialized = false;
      
      // Состояние UI
      this.currentScreen = 'start';
      this.previousScreen = null;
      
      // Анимации
      this.animations = [];
      this.transitionInProgress = false;
      
      // Звук
      this.soundEnabled = true;
      this.particlesEnabled = true;
      
      // Загрузка настроек
      this.loadSettings();
  }

  /**
   * Инициализация UI
   */
  initialize() {
      this.cacheElements();
      this.setupEventListeners();
      this.updateUI();
      this.isInitialized = true;
  }

  /**
   * Кэширование DOM элементов
   */
  cacheElements() {
      // Основные элементы
      this.elements.canvas = document.getElementById('gameCanvas');
      this.elements.container = document.querySelector('.game-canvas-container');
      
      // Экраны
      this.elements.startScreen = document.getElementById('startScreen');
      this.elements.pauseScreen = document.getElementById('pauseScreen');
      this.elements.gameOverScreen = document.getElementById('gameOverScreen');
      this.elements.victoryScreen = document.getElementById('victoryScreen');
      this.elements.settingsModal = document.getElementById('settingsModal');
      
      // Кнопки
      this.elements.startButton = document.getElementById('startButton');
      this.elements.playBtn = document.getElementById('playBtn');
      this.elements.pauseButton = document.getElementById('pauseButton');
      this.elements.resumeBtn = document.getElementById('resumeBtn');
      this.elements.restartButton = document.getElementById('restartButton');
      this.elements.restartAfterGameOverBtn = document.getElementById('restartAfterGameOverBtn');
      this.elements.playAgainBtn = document.getElementById('playAgainBtn');
      this.elements.soundButton = document.getElementById('soundButton');
      this.elements.fullscreenButton = document.getElementById('fullscreenButton');
      this.elements.menuAfterGameOverBtn = document.getElementById('menuAfterGameOverBtn');
      this.elements.menuAfterVictoryBtn = document.getElementById('menuAfterVictoryBtn');
      this.elements.closeSettingsBtn = document.getElementById('closeSettingsBtn');
      
      // Контролы
      this.elements.leftBtn = document.getElementById('leftBtn');
      this.elements.rightBtn = document.getElementById('rightBtn');
      this.elements.upBtn = document.getElementById('upBtn');
      this.elements.downBtn = document.getElementById('downBtn');
      this.elements.jumpBtn = document.getElementById('jumpBtn');
      
      // Настройки
      this.elements.soundToggle = document.getElementById('soundToggle');
      this.elements.particlesToggle = document.getElementById('particlesToggle');
      
      // Значения
      this.elements.scoreValue = document.getElementById('scoreValue');
      this.elements.highScoreValue = document.getElementById('highScoreValue');
      this.elements.livesValue = document.getElementById('livesValue');
      this.elements.levelValue = document.getElementById('levelValue');
      this.elements.timeValue = document.getElementById('timeValue');
      
      // Финальные значения
      this.elements.finalScore = document.getElementById('finalScore');
      this.elements.finalLevel = document.getElementById('finalLevel');
      this.elements.finalHighScore = document.getElementById('finalHighScore');
      this.elements.victoryScore = document.getElementById('victoryScore');
      this.elements.coinsCollected = document.getElementById('coinsCollected');
  }

  /**
   * Настройка обработчиков событий
   */
  setupEventListeners() {
      // Кнопки управления игрой
      this.elements.startButton.addEventListener('click', () => this.game.start());
      this.elements.playBtn.addEventListener('click', () => this.game.start());
      this.elements.pauseButton.addEventListener('click', () => this.game.togglePause());
      this.elements.resumeBtn.addEventListener('click', () => this.game.togglePause());
      this.elements.restartButton.addEventListener('click', () => this.game.restart());
      this.elements.restartAfterGameOverBtn.addEventListener('click', () => this.game.restart());
      this.elements.playAgainBtn.addEventListener('click', () => this.game.restart());
      
      // Кнопки меню
      this.elements.menuAfterGameOverBtn.addEventListener('click', () => this.showScreen('start'));
      this.elements.menuAfterVictoryBtn.addEventListener('click', () => this.showScreen('start'));
      
      // Кнопки настроек
      this.elements.soundButton.addEventListener('click', () => this.toggleSound());
      this.elements.fullscreenButton.addEventListener('click', () => this.toggleFullscreen());
      
      // Настройки
      this.elements.soundToggle.addEventListener('change', (e) => {
          this.soundEnabled = e.target.checked;
          this.saveSettings();
      });
      
      this.elements.particlesToggle.addEventListener('change', (e) => {
          this.particlesEnabled = e.target.checked;
          this.saveSettings();
      });
      
      this.elements.closeSettingsBtn.addEventListener('click', () => {
          this.elements.settingsModal.style.display = 'none';
      });
      
      // Контролы для мобильных устройств
      this.setupTouchControls();
      
      // Обработка клавиши Escape
      document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
              if (this.currentScreen === 'playing') {
                  this.game.togglePause();
              } else if (this.currentScreen === 'paused') {
                  this.game.togglePause();
              } else if (this.currentScreen === 'gameOver' || this.currentScreen === 'victory') {
                  this.showScreen('start');
              }
          }
      });
  }

  /**
   * Настройка сенсорного управления
   */
  setupTouchControls() {
      if (!Helpers.isMobile()) {
          // Скрываем контролы на десктопе
          const controlsPanel = document.querySelector('.controls-panel');
          if (controlsPanel) {
              controlsPanel.style.display = 'none';
          }
          return;
      }
      
      // Настройка обработчиков для сенсорных кнопок
      const setupButton = (button, key, startEvent = 'touchstart', endEvent = 'touchend') => {
          button.addEventListener(startEvent, (e) => {
              e.preventDefault();
              this.game.inputHandler.keys[key] = true;
          });
          
          button.addEventListener(endEvent, (e) => {
              e.preventDefault();
              this.game.inputHandler.keys[key] = false;
          });
          
          // Для поддержки мыши на тач-устройствах
          button.addEventListener('mousedown', (e) => {
              e.preventDefault();
              this.game.inputHandler.keys[key] = true;
          });
          
          button.addEventListener('mouseup', (e) => {
              e.preventDefault();
              this.game.inputHandler.keys[key] = false;
          });
          
          button.addEventListener('mouseleave', (e) => {
              e.preventDefault();
              this.game.inputHandler.keys[key] = false;
          });
      };
      
      // Настройка кнопок направления
      setupButton(this.elements.leftBtn, 'left');
      setupButton(this.elements.rightBtn, 'right');
      setupButton(this.elements.upBtn, 'up');
      setupButton(this.elements.downBtn, 'down');
      setupButton(this.elements.jumpBtn, 'space');
  }

  /**
   * Переключение звука
   */
  toggleSound() {
      this.soundEnabled = !this.soundEnabled;
      this.elements.soundToggle.checked = this.soundEnabled;
      
      // Обновление иконки кнопки
      const icon = this.elements.soundButton.querySelector('i');
      icon.className = this.soundEnabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
      
      this.saveSettings();
  }

  /**
   * Переключение полноэкранного режима
   */
  toggleFullscreen() {
      if (!document.fullscreenElement) {
          if (this.elements.canvas.requestFullscreen) {
              this.elements.canvas.requestFullscreen();
          } else if (this.elements.canvas.webkitRequestFullscreen) {
              this.elements.canvas.webkitRequestFullscreen();
          } else if (this.elements.canvas.msRequestFullscreen) {
              this.elements.canvas.msRequestFullscreen();
          }
      } else {
          if (document.exitFullscreen) {
              document.exitFullscreen();
          } else if (document.webkitExitFullscreen) {
              document.webkitExitFullscreen();
          } else if (document.msExitFullscreen) {
              document.msExitFullscreen();
          }
      }
  }

  /**
   * Показать экран
   * @param {string} screenName - имя экрана
   */
  showScreen(screenName) {
      if (this.transitionInProgress) return;
      
      this.previousScreen = this.currentScreen;
      this.currentScreen = screenName;
      
      // Скрыть все экраны
      this.hideAllScreens();
      
      // Показать нужный экран
      switch (screenName) {
          case 'start':
              this.elements.startScreen.classList.add('active');
              break;
          case 'playing':
              // Игровой экран не имеет отдельного DOM элемента
              break;
          case 'paused':
              this.elements.pauseScreen.classList.add('active');
              break;
          case 'gameOver':
              this.updateGameOverScreen();
              this.elements.gameOverScreen.classList.add('active');
              break;
          case 'victory':
              this.updateVictoryScreen();
              this.elements.victoryScreen.classList.add('active');
              break;
      }
      
      // Анимация перехода
      this.animateTransition(screenName);
  }

  /**
   * Скрыть все экраны
   */
  hideAllScreens() {
      this.elements.startScreen.classList.remove('active');
      this.elements.pauseScreen.classList.remove('active');
      this.elements.gameOverScreen.classList.remove('active');
      this.elements.victoryScreen.classList.remove('active');
  }

  /**
   * Анимация перехода между экранами
   * @param {string} screenName - имя экрана
   */
  animateTransition(screenName) {
      this.transitionInProgress = true;
      
      // Простая анимация fade in
      setTimeout(() => {
          this.transitionInProgress = false;
      }, 300);
  }

  /**
   * Обновление UI
   */
  updateUI() {
      if (!this.isInitialized) return;
      
      const game = this.game;
      const scoreManager = game.scoreManager;
      const levelManager = game.levelManager;
      
      // Обновление значений
      this.elements.scoreValue.textContent = Helpers.formatNumber(scoreManager.currentScore);
      this.elements.highScoreValue.textContent = Helpers.formatNumber(scoreManager.highScore);
      this.elements.livesValue.textContent = game.player ? game.player.lives : 3;
      
      // Обновление уровня
      if (levelManager.currentLevel) {
          this.elements.levelValue.textContent = levelManager.currentLevel.id;
      }
      
      // Обновление времени
      if (levelManager.currentLevel) {
          const remainingTime = levelManager.getRemainingTime();
          this.elements.timeValue.textContent = Helpers.formatTime(remainingTime);
          
          // Мигание при низком времени
          if (remainingTime < 30) {
              this.elements.timeValue.classList.add('blink');
          } else {
              this.elements.timeValue.classList.remove('blink');
          }
      }
      
      // Обновление кнопки паузы
      const pauseIcon = this.elements.pauseButton.querySelector('i');
      if (game.state === Constants.GAME_STATES.PAUSED) {
          pauseIcon.className = 'fas fa-play';
      } else {
          pauseIcon.className = 'fas fa-pause';
      }
  }

  /**
   * Обновление экрана Game Over
   */
  updateGameOverScreen() {
      const game = this.game;
      const scoreManager = game.scoreManager;
      const levelManager = game.levelManager;
      
      this.elements.finalScore.textContent = Helpers.formatNumber(scoreManager.currentScore);
      this.elements.finalLevel.textContent = levelManager.currentLevel ? levelManager.currentLevel.id : 1;
      this.elements.finalHighScore.textContent = Helpers.formatNumber(scoreManager.highScore);
  }

  /**
   * Обновление экрана победы
   */
  updateVictoryScreen() {
      const game = this.game;
      const scoreManager = game.scoreManager;
      const levelManager = game.levelManager;
      
      const levelStats = levelManager.getLevelStats();
      const levelScore = scoreManager.calculateLevelScore(levelStats);
      
      this.elements.victoryScore.textContent = Helpers.formatNumber(levelScore.totalScore);
      this.elements.coinsCollected.textContent = `${levelStats.coinsCollected}/${levelStats.totalCoins}`;
  }

  /**
   * Загрузка настроек
   */
  loadSettings() {
      this.soundEnabled = Helpers.loadFromStorage(Constants.STORAGE_KEYS.SOUND_ENABLED, true);
      this.particlesEnabled = Helpers.loadFromStorage(Constants.STORAGE_KEYS.PARTICLES_ENABLED, true);
      
      // Применение настроек к UI
      if (this.elements.soundToggle) {
          this.elements.soundToggle.checked = this.soundEnabled;
      }
      if (this.elements.particlesToggle) {
          this.elements.particlesToggle.checked = this.particlesEnabled;
      }
      
      // Обновление иконки звука
      if (this.elements.soundButton) {
          const icon = this.elements.soundButton.querySelector('i');
          if (icon) {
              icon.className = this.soundEnabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
          }
      }
  }

  /**
   * Сохранение настроек
   */
  saveSettings() {
      Helpers.saveToStorage(Constants.STORAGE_KEYS.SOUND_ENABLED, this.soundEnabled);
      Helpers.saveToStorage(Constants.STORAGE_KEYS.PARTICLES_ENABLED, this.particlesEnabled);
  }

  /**
   * Показать сообщение
   * @param {string} message - текст сообщения
   * @param {string} type - тип сообщения (success, error, info)
   * @param {number} duration - продолжительность в ms
   */
  showMessage(message, type = 'info', duration = 3000) {
      // Создание элемента сообщения
      const messageElement = document.createElement('div');
      messageElement.className = `ui-message ui-message-${type}`;
      messageElement.textContent = message;
      
      // Стилизация
      messageElement.style.cssText = `
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: ${type === 'error' ? '#e74c3c' : type === 'success' ? '#2ecc71' : '#3498db'};
          color: white;
          padding: 15px 30px;
          border-radius: 10px;
          z-index: 1000;
          font-weight: bold;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
          animation: slideDown 0.3s ease;
      `;
      
      // Анимация
      const style = document.createElement('style');
      style.textContent = `
          @keyframes slideDown {
              from { transform: translate(-50%, -100%); opacity: 0; }
              to { transform: translate(-50%, 0); opacity: 1; }
          }
      `;
      document.head.appendChild(style);
      
      // Добавление в DOM
      document.body.appendChild(messageElement);
      
      // Удаление через указанное время
      setTimeout(() => {
          messageElement.style.animation = 'slideUp 0.3s ease';
          setTimeout(() => {
              document.body.removeChild(messageElement);
              document.head.removeChild(style);
          }, 300);
      }, duration);
  }

  /**
   * Получение текущего экрана
   * @returns {string}
   */
  getCurrentScreen() {
      return this.currentScreen;
  }

  /**
   * Проверка, активен ли игровой экран
   * @returns {boolean}
   */
  isGameScreenActive() {
      return this.currentScreen === 'playing' || this.currentScreen === 'paused';
  }

  /**
   * Обновление прогресс бара
   * @param {number} progress - прогресс (0-100)
   */
  updateProgressBar(progress) {
      // Создание или обновление прогресс бара
      let progressBar = document.querySelector('.progress-fill');
      if (!progressBar) {
          const bar = document.createElement('div');
          bar.className = 'progress-bar';
          bar.style.cssText = `
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 5px;
              background: #34495e;
              z-index: 1001;
          `;
          
          progressBar = document.createElement('div');
          progressBar.className = 'progress-fill';
          progressBar.style.cssText = `
              height: 100%;
              background: linear-gradient(90deg, #2ecc71, #3498db);
              width: ${progress}%;
              transition: width 0.3s ease;
          `;
          
          bar.appendChild(progressBar);
          document.body.appendChild(bar);
      } else {
          progressBar.style.width = `${progress}%`;
      }
  }

  /**
   * Удаление прогресс бара
   */
  removeProgressBar() {
      const progressBar = document.querySelector('.progress-bar');
      if (progressBar) {
          document.body.removeChild(progressBar);
      }
  }
}