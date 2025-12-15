/**
 * Основной класс игры
 */
class Game {
  constructor() {
      // Canvas и контекст
      this.canvas = null;
      this.ctx = null;
      
      // Состояние игры
      this.state = Constants.GAME_STATES.MENU;
      this.previousState = null;
      
      // Игровые объекты
      this.player = null;
      this.platforms = [];
      this.coins = [];
      this.enemies = [];
      
      // Менеджеры
      this.levelManager = null;
      this.scoreManager = null;
      this.uiManager = null;
      
      // Системы
      this.inputHandler = null;
      this.physicsEngine = null;
      this.collisionSystem = null;
      this.gameLoop = null;
      
      // Время и таймеры
      this.gameTime = 0;
      this.levelStartTime = 0;
      this.transitionTimer = 0;
      
      // Камера
      this.camera = {
          x: 0,
          y: 0,
          width: Constants.CANVAS_WIDTH,
          height: Constants.CANVAS_HEIGHT,
          target: null,
          lerp: 0.1
      };
      
      // Параметры игры
      this.settings = {
          soundEnabled: true,
          particlesEnabled: true,
          debugMode: false
      };
      
      // Инициализация
      this.initialize();
  }

  /**
   * Инициализация игры
   */
  async initialize() {
      try {
          // Инициализация Canvas
          this.canvas = document.getElementById('gameCanvas');
          this.ctx = this.canvas.getContext('2d');
          
          // Проверка поддержки Canvas
          if (!this.canvas || !this.ctx) {
              throw new Error('Canvas не поддерживается');
          }
          
          // Создание систем
          this.inputHandler = new InputHandler();
          this.physicsEngine = new PhysicsEngine();
          this.collisionSystem = new CollisionSystem();
          
          // Создание менеджеров
          this.levelManager = new LevelManager();
          this.scoreManager = new ScoreManager();
          this.uiManager = new UIManager(this);
          
          // Инициализация менеджеров
          await this.levelManager.initialize();
          this.uiManager.initialize();
          
          // Создание игрового цикла
          this.gameLoop = new GameLoop(this);
          
          // Загрузка настроек
          this.loadSettings();
          
          // Установка обработчиков событий
          this.setupEventListeners();
          
          // Начальный экран
          this.uiManager.showScreen('start');
          
          console.log('Game initialized successfully');
          
      } catch (error) {
          console.error('Failed to initialize game:', error);
          this.showError('Ошибка инициализации игры. Пожалуйста, обновите страницу.');
      }
  }

  /**
   * Настройка обработчиков событий
   */
  setupEventListeners() {
      // Обработка изменения размера окна
      window.addEventListener('resize', () => this.handleResize());
      
      // Обработка потери фокуса
      window.addEventListener('blur', () => {
          if (this.state === Constants.GAME_STATES.PLAYING) {
              this.pause();
          }
      });
      
      // Обработка полноэкранного режима
      document.addEventListener('fullscreenchange', () => {
          this.handleResize();
      });
  }

  /**
   * Загрузка настроек
   */
  loadSettings() {
      this.settings.soundEnabled = Helpers.loadFromStorage(
          Constants.STORAGE_KEYS.SOUND_ENABLED,
          true
      );
      this.settings.particlesEnabled = Helpers.loadFromStorage(
          Constants.STORAGE_KEYS.PARTICLES_ENABLED,
          true
      );
      this.settings.debugMode = Helpers.loadFromStorage(
          'pixel_jumper_debug_mode',
          false
      );
      
      // Применение настроек
      this.physicsEngine.setDebug(this.settings.debugMode);
      this.collisionSystem.setDebug(this.settings.debugMode);
      this.gameLoop.setDebug(this.settings.debugMode);
  }

  /**
   * Сохранение настроек
   */
  saveSettings() {
      Helpers.saveToStorage(
          Constants.STORAGE_KEYS.SOUND_ENABLED,
          this.settings.soundEnabled
      );
      Helpers.saveToStorage(
          Constants.STORAGE_KEYS.PARTICLES_ENABLED,
          this.settings.particlesEnabled
      );
      Helpers.saveToStorage(
          'pixel_jumper_debug_mode',
          this.settings.debugMode
      );
  }

  /**
   * Начало игры
   */
  async start() {
      if (this.state === Constants.GAME_STATES.PLAYING) return;
      
      try {
          // Сброс игры
          await this.resetGame();
          
          // Загрузка уровня
          await this.loadCurrentLevel();
          
          // Установка состояния
          this.setState(Constants.GAME_STATES.PLAYING);
          
          // Запуск игрового цикла
          this.gameLoop.start();
          
          // Обновление UI
          this.uiManager.showScreen('playing');
          
          console.log('Game started');
          
      } catch (error) {
          console.error('Failed to start game:', error);
          this.showError('Не удалось начать игру');
      }
  }

  /**
   * Пауза игры
   */
  pause() {
      if (this.state !== Constants.GAME_STATES.PLAYING) return;
      
      this.setState(Constants.GAME_STATES.PAUSED);
      this.gameLoop.pause();
      this.uiManager.showScreen('paused');
      
      console.log('Game paused');
  }

  /**
   * Возобновление игры
   */
  resume() {
      if (this.state !== Constants.GAME_STATES.PAUSED) return;
      
      this.setState(Constants.GAME_STATES.PLAYING);
      this.gameLoop.resume();
      this.uiManager.showScreen('playing');
      
      console.log('Game resumed');
  }

  /**
   * Переключение паузы
   */
  togglePause() {
      if (this.state === Constants.GAME_STATES.PLAYING) {
          this.pause();
      } else if (this.state === Constants.GAME_STATES.PAUSED) {
          this.resume();
      }
  }

  /**
   * Перезапуск игры
   */
  async restart() {
      try {
          // Сброс игры
          await this.resetGame();
          
          // Загрузка текущего уровня
          await this.loadCurrentLevel();
          
          // Установка состояния
          this.setState(Constants.GAME_STATES.PLAYING);
          
          // Обновление UI
          this.uiManager.showScreen('playing');
          
          console.log('Game restarted');
          
      } catch (error) {
          console.error('Failed to restart game:', error);
          this.showError('Не удалось перезапустить игру');
      }
  }

  /**
   * Сброс игры
   */
  async resetGame() {
      // Сброс игрока
      if (this.player) {
          const level = this.levelManager.getCurrentLevel();
          if (level) {
              this.player.reset(
                  level.startPosition.x,
                  level.startPosition.y
              );
          }
      }
      
      // Сброс счета
      this.scoreManager.resetCurrentScore();
      
      // Сброс уровня
      await this.levelManager.restartLevel();
      
      // Сброс времени
      this.gameTime = 0;
      this.levelStartTime = Date.now();
      
      // Сброс камеры
      this.camera.x = 0;
      this.camera.y = 0;
      
      console.log('Game reset');
  }

  /**
   * Загрузка текущего уровня
   */
  async loadCurrentLevel() {
      const level = this.levelManager.getCurrentLevel();
      if (!level) {
          throw new Error('No level loaded');
      }
      
      // Очистка предыдущих объектов
      this.platforms = [];
      this.coins = [];
      this.enemies = [];
      
      // Создание платформ
      for (const platformData of level.platforms) {
          const platform = new Platform(
              platformData.x,
              platformData.y,
              platformData.width || Constants.PLATFORM_WIDTH,
              platformData.height || Constants.PLATFORM_HEIGHT,
              platformData.type || 'normal'
          );
          this.platforms.push(platform);
      }
      
      // Создание монет
      for (const coinData of level.coins) {
          const coin = new Coin(coinData.x, coinData.y);
          this.coins.push(coin);
      }
      
      // Создание врагов (опционально)
      // TODO: Реализовать создание врагов
      
      // Создание игрока
      if (!this.player) {
          this.player = new Player(
              level.startPosition.x,
              level.startPosition.y
          );
      } else {
          this.player.reset(
              level.startPosition.x,
              level.startPosition.y
          );
      }
      
      // Установка камеры на игрока
      this.camera.target = this.player;
      
      console.log(`Level ${level.id} loaded: ${level.name}`);
  }

  /**
   * Обновление игры
   * @param {number} deltaTime - время с прошлого кадра
   */
  update(deltaTime) {
      // Обновление времени игры
      this.gameTime += deltaTime;
      
      // Обновление в зависимости от состояния
      switch (this.state) {
          case Constants.GAME_STATES.PLAYING:
              this.updatePlaying(deltaTime);
              break;
              
          case Constants.GAME_STATES.PAUSED:
              // Ничего не обновляем на паузе
              break;
              
          case Constants.GAME_STATES.GAME_OVER:
          case Constants.GAME_STATES.VICTORY:
              this.updateTransition(deltaTime);
              break;
      }
      
      // Обновление UI
      this.uiManager.updateUI();
  }

  /**
   /**
 * Обновление игрового процесса
 * @param {number} deltaTime - время с прошлого кадра
 */
updatePlaying(deltaTime) {
  // Обновление ввода
  this.inputHandler.update();
  
  // Обновление игрока
  if (this.player) {
      this.player.update(deltaTime, this.inputHandler, this.physicsEngine);
      
      // Проверка смерти игрока
      if (!this.player.isAlive()) {
          this.gameOver();
          return;
      }
      
      // Проверка падения за пределы - ОБНОВЛЕНО
      const level = this.levelManager.getCurrentLevel();
      if (level) {
          // Падение ниже уровня + небольшой запас
          const fallThreshold = level.height + 100;
          
          if (this.player.position.y > fallThreshold) {
              console.log('Игрок упал с уровня, наносим урон');
              const died = this.player.takeDamage(1);
              
              if (died) {
                  this.gameOver('Падение с платформы');
                  return;
              } else {
                  // Респавн игрока с небольшой неуязвимостью
                  this.player.reset(
                      level.startPosition.x,
                      level.startPosition.y
                  );
                  // Даем немного времени для восстановления
                  this.player.isInvincible = true;
                  this.player.invincibilityTimer = 2000; // 2 секунды
              }
          }
      }
  }
  
  // Обновление платформ
  for (const platform of this.platforms) {
      platform.update(deltaTime);
  }
  
  // Обновление монет
  for (let i = this.coins.length - 1; i >= 0; i--) {
      const coin = this.coins[i];
      coin.update(deltaTime);
      
      // Проверка сбора монеты
      if (!coin.isCollected && this.player) {
          const collision = this.collisionSystem.checkCircleRectCollision(
              coin.getCollisionCircle(),
              this.player.getCollisionRect()
          );
          
          if (collision.collided) {
              const points = coin.collect();
              this.scoreManager.addCoin();
              this.levelManager.collectCoin();
          }
      }
      
      // Удаление собранных монет
      if (coin.shouldRemove()) {
          this.coins.splice(i, 1);
      }
  }
  
  // Обновление физики и коллизий
  if (this.player) {
      this.physicsEngine.handleCollisions(
          this.player,
          this.platforms,
          this.collisionSystem
      );
  }
  
  // Обновление камеры
  this.updateCamera(deltaTime);
  
  // Обновление уровня
  this.levelManager.update(deltaTime);
  
  // Обновление счета
  this.scoreManager.update(deltaTime);
  
  // Проверка завершения уровня
  if (this.levelManager.isLevelComplete()) {
      this.completeLevel();
  }
  
  // Проверка истечения времени
  if (this.levelManager.isTimeExpired()) {
      this.gameOver('Время вышло!');
  }
}

  /**
   * Обновление камеры
   * @param {number} deltaTime - время с прошлого кадра
   */
  updateCamera(deltaTime) {
      if (!this.camera.target || !this.player) return;
      
      const level = this.levelManager.getCurrentLevel();
      if (!level) return;
      
      // Целевая позиция камеры (центр на игроке)
      const targetX = this.player.position.x + this.player.width / 2 - this.camera.width / 2;
      const targetY = this.player.position.y + this.player.height / 2 - this.camera.height / 2;
      
      // Плавное движение камеры
      this.camera.x += (targetX - this.camera.x) * this.camera.lerp * deltaTime;
      this.camera.y += (targetY - this.camera.y) * this.camera.lerp * deltaTime;
      
      // Ограничение камеры границами уровня
      this.camera.x = Math.max(0, Math.min(this.camera.x, level.width - this.camera.width));
      this.camera.y = Math.max(0, Math.min(this.camera.y, level.height - this.camera.height));
  }

  /**
   * Обновление переходов
   * @param {number} deltaTime - время с прошлого кадра
   */
  updateTransition(deltaTime) {
      this.transitionTimer += deltaTime;
      
      // Автоматический переход после задержки
      if (this.transitionTimer > 3000) {
          if (this.state === Constants.GAME_STATES.GAME_OVER) {
              this.uiManager.showScreen('start');
          }
      }
  }

  /**
   * Отрисовка игры
   */
  render() {
      // Очистка canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      // Сохранение состояния контекста
      this.ctx.save();
      
      // Применение трансформации камеры
      this.ctx.translate(-this.camera.x, -this.camera.y);
      
      // Отрисовка в зависимости от состояния
      switch (this.state) {
          case Constants.GAME_STATES.PLAYING:
          case Constants.GAME_STATES.PAUSED:
              this.renderGameWorld();
              break;
              
          case Constants.GAME_STATES.GAME_OVER:
          case Constants.GAME_STATES.VICTORY:
              this.renderGameWorld();
              // Эффект затемнения
              this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
              this.ctx.fillRect(this.camera.x, this.camera.y, this.camera.width, this.camera.height);
              break;
      }
      
      // Восстановление состояния контекста
      this.ctx.restore();
      
      // Отрисовка UI поверх всего
      this.renderUI();
      
      // Отрисовка отладки
      if (this.settings.debugMode) {
          this.renderDebug();
      }
  }

  /**
   * Отрисовка игрового мира
   */
  renderGameWorld() {
      const level = this.levelManager.getCurrentLevel();
      if (!level) return;
      
      // Отрисовка фона
      this.renderBackground();
      
      // Отрисовка платформ
      for (const platform of this.platforms) {
          if (platform.isVisible(this.camera.x, this.camera.y, this.camera.width, this.camera.height)) {
              platform.draw(this.ctx);
          }
      }
      
      // Отрисовка монет
      for (const coin of this.coins) {
          if (coin.isVisible(this.camera.x, this.camera.y, this.camera.width, this.camera.height)) {
              coin.draw(this.ctx);
          }
      }
      
      // Отрисовка игрока
      if (this.player) {
          this.player.draw(this.ctx);
      }
      
      // Отрисовка врагов (опционально)
      // TODO: Реализовать отрисовку врагов
  }

  /**
   * Отрисовка фона
   */
  renderBackground() {
      const level = this.levelManager.getCurrentLevel();
      if (!level) return;
      
      // Градиентный фон
      const gradient = this.ctx.createLinearGradient(0, 0, 0, level.height);
      gradient.addColorStop(0, '#1a5276');
      gradient.addColorStop(1, '#0c3c5c');
      
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, 0, level.width, level.height);
      
      // Облака или другие фоновые элементы
      this.renderBackgroundElements();
  }

  /**
   * Отрисовка фоновых элементов
   */
  renderBackgroundElements() {
      // Простые облака для фона
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      
      // Некоторые статические облака
      const clouds = [
          { x: 100, y: 50, width: 80, height: 30 },
          { x: 300, y: 80, width: 120, height: 40 },
          { x: 600, y: 40, width: 100, height: 35 },
          { x: 900, y: 70, width: 90, height: 30 }
      ];
      
      for (const cloud of clouds) {
          this.ctx.beginPath();
          this.ctx.ellipse(
              cloud.x, cloud.y,
              cloud.width / 2, cloud.height / 2,
              0, 0, Math.PI * 2
          );
          this.ctx.fill();
      }
  }

  /**
   * Отрисовка UI
   */
  renderUI() {
      // UI отрисовывается через DOM элементы
      // Здесь можно добавить Canvas-based UI элементы если нужно
  }

  /**
   * Отрисовка отладочной информации
   */
  renderDebug() {
      this.ctx.save();
      this.ctx.font = '12px monospace';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.textAlign = 'left';
      this.ctx.textBaseline = 'top';
      
      // Информация об игроке
      if (this.player) {
          this.ctx.fillText(`Player: (${Math.round(this.player.position.x)}, ${Math.round(this.player.position.y)})`, 10, 10);
          this.ctx.fillText(`Velocity: (${this.player.velocity.x.toFixed(1)}, ${this.player.velocity.y.toFixed(1)})`, 10, 30);
          this.ctx.fillText(`On Ground: ${this.player.isOnGround}`, 10, 50);
      }
      
      // Информация о камере
      this.ctx.fillText(`Camera: (${Math.round(this.camera.x)}, ${Math.round(this.camera.y)})`, 10, 70);
      
      // Информация об уровне
      const levelInfo = this.levelManager.getLevelInfo();
      if (levelInfo) {
          this.ctx.fillText(`Level: ${levelInfo.name} (${levelInfo.difficulty})`, 10, 90);
          this.ctx.fillText(`Coins: ${levelInfo.progress.coins}/${levelInfo.progress.totalCoins}`, 10, 110);
      }
      
      // FPS и статистика
      const stats = this.gameLoop.getStats();
      this.ctx.fillText(`FPS: ${stats.fps}`, 10, 130);
      this.ctx.fillText(`State: ${this.state}`, 10, 150);
      
      this.ctx.restore();
      
      // Отрисовка отладки физики и коллизий
      this.physicsEngine.drawDebug(this.ctx);
      this.collisionSystem.drawDebug(this.ctx);
  }

  /**
   * Завершение уровня
   */
  async completeLevel() {
      if (this.state !== Constants.GAME_STATES.PLAYING) return;
      
      this.setState(Constants.GAME_STATES.LEVEL_COMPLETE);
      
      // Вычисление очков за уровень
      const levelStats = this.levelManager.getLevelStats();
      const levelScore = this.scoreManager.calculateLevelScore(levelStats);
      
      // Обновление общего счета
      this.scoreManager.addScore(levelScore.totalScore, 'levelComplete');
      
      // Проверка на последний уровень
      if (this.levelManager.isLastLevel()) {
          this.victory();
          return;
      }
      
      // Переход на следующий уровень
      const hasNextLevel = await this.levelManager.nextLevel();
      
      if (hasNextLevel) {
          // Загрузка следующего уровня
          await this.loadCurrentLevel();
          
          // Возврат в игровой режим
          this.setState(Constants.GAME_STATES.PLAYING);
          
          // Показать сообщение о новом уровне
          this.uiManager.showMessage(`Уровень ${this.levelManager.currentLevelIndex + 1} загружен!`, 'success');
      } else {
          this.victory();
      }
  }

  /**
   * Конец игры
   * @param {string} reason - причина конца игры
   */
  gameOver(reason = '') {
      if (this.state === Constants.GAME_STATES.GAME_OVER) return;
      
      this.setState(Constants.GAME_STATES.GAME_OVER);
      this.gameLoop.pause();
      
      // Обновление экрана Game Over
      this.uiManager.updateGameOverScreen();
      this.uiManager.showScreen('gameOver');
      
      // Воспроизведение звука
      if (this.settings.soundEnabled) {
          Helpers.playSound(Constants.SOUNDS.GAME_OVER);
      }
      
      console.log(`Game Over: ${reason}`);
  }

  /**
   * Победа в игре
   */
  victory() {
      if (this.state === Constants.GAME_STATES.VICTORY) return;
      
      this.setState(Constants.GAME_STATES.VICTORY);
      this.gameLoop.pause();
      
      // Обновление экрана победы
      this.uiManager.updateVictoryScreen();
      this.uiManager.showScreen('victory');
      
      // Воспроизведение звука
      if (this.settings.soundEnabled) {
          Helpers.playSound(Constants.SOUNDS.VICTORY);
      }
      
      console.log('Victory!');
  }

  /**
   * Установка состояния игры
   * @param {string} newState - новое состояние
   */
  setState(newState) {
      this.previousState = this.state;
      this.state = newState;
      this.transitionTimer = 0;
      
      console.log(`Game state changed: ${this.previousState} -> ${newState}`);
  }

  /**
   * Обработка изменения размера окна
   */
  handleResize() {
      const container = this.canvas.parentElement;
      if (!container) return;
      
      // Сохранение соотношения сторон
      const aspectRatio = Constants.CANVAS_WIDTH / Constants.CANVAS_HEIGHT;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      
      let newWidth = containerWidth;
      let newHeight = containerWidth / aspectRatio;
      
      if (newHeight > containerHeight) {
          newHeight = containerHeight;
          newWidth = containerHeight * aspectRatio;
      }
      
      // Установка новых размеров canvas
      this.canvas.style.width = `${newWidth}px`;
      this.canvas.style.height = `${newHeight}px`;
      
      // Обновление размеров камеры
      this.camera.width = newWidth;
      this.camera.height = newHeight;
      
      // Обновление игрового цикла
      if (this.gameLoop) {
          this.gameLoop.handleResize();
      }
  }

  /**
   * Показать сообщение об ошибке
   * @param {string} message - сообщение об ошибке
   */
  showError(message) {
      console.error(message);
      
      // Можно добавить вывод ошибки в UI
      const errorDiv = document.createElement('div');
      errorDiv.style.cssText = `
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(231, 76, 60, 0.9);
          color: white;
          padding: 20px;
          border-radius: 10px;
          z-index: 10000;
          text-align: center;
          max-width: 80%;
      `;
      errorDiv.innerHTML = `
          <h3>Ошибка</h3>
          <p>${message}</p>
          <button onclick="location.reload()" style="
              background: white;
              color: #e74c3c;
              border: none;
              padding: 10px 20px;
              border-radius: 5px;
              cursor: pointer;
              margin-top: 10px;
          ">Перезагрузить</button>
      `;
      
      document.body.appendChild(errorDiv);
  }

  /**
   * Получение статистики игры
   * @returns {Object}
   */
  getStats() {
      return {
          state: this.state,
          gameTime: this.gameTime,
          player: this.player ? {
              position: this.player.position.toObject(),
              velocity: this.player.velocity.toObject(),
              lives: this.player.lives,
              score: this.player.score
          } : null,
          level: this.levelManager.getLevelInfo(),
          score: this.scoreManager.getStats(),
          performance: this.gameLoop ? this.gameLoop.getStats() : null
      };
  }

  /**
   * Переключение режима отладки
   */
  toggleDebug() {
      this.settings.debugMode = !this.settings.debugMode;
      
      // Применение режима отладки ко всем системам
      this.physicsEngine.setDebug(this.settings.debugMode);
      this.collisionSystem.setDebug(this.settings.debugMode);
      this.gameLoop.setDebug(this.settings.debugMode);
      
      // Сохранение настройки
      this.saveSettings();
      
      console.log(`Debug mode ${this.settings.debugMode ? 'enabled' : 'disabled'}`);
  }
}