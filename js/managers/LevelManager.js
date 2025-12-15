/**
 * Менеджер уровней
 */
class LevelManager {
  constructor() {
      this.levels = [];
      this.currentLevelIndex = 0;
      this.currentLevel = null;
      this.isLoading = false;
      
      // Прогресс игры
      this.progress = {
          totalCoins: 0,
          collectedCoins: 0,
          totalTime: 0,
          bestTime: 0,
          deaths: 0
      };
      
      // Загрузка сохраненного прогресса
      this.loadProgress();
  }

  /**
   * Инициализация менеджера уровней
   * @returns {Promise}
   */
  async initialize() {
      this.isLoading = true;
      
      try {
          // Пытаемся загрузить уровни из JSON файлов
          await this.loadLevelsFromJSON();
          
          // Если не удалось загрузить из JSON, создаем уровни по умолчанию
          if (this.levels.length === 0) {
              console.warn('Failed to load levels from JSON, creating default levels');
              await this.createDefaultLevels();
          }
          
          // Загружаем текущий уровень
          await this.loadLevel(this.currentLevelIndex);
          
          this.isLoading = false;
          return true;
      } catch (error) {
          console.error('Failed to initialize LevelManager:', error);
          
          // Создаем уровни по умолчанию в случае ошибки
          await this.createDefaultLevels();
          await this.loadLevel(this.currentLevelIndex);
          
          this.isLoading = false;
          return true;
      }
  }

  /**
   * Загрузка уровней из JSON файлов
   */
  async loadLevelsFromJSON() {
      try {
          const levelFiles = [
              'levels/level1.json',
              'levels/level2.json',
              'levels/level3.json'
          ];
          
          this.levels = [];
          
          for (const file of levelFiles) {
              try {
                  const response = await fetch(file);
                  if (!response.ok) {
                      throw new Error(`HTTP error! status: ${response.status}`);
                  }
                  
                  const levelData = await response.json();
                  
                  // Валидация данных уровня
                  if (this.validateLevelData(levelData)) {
                      this.levels.push(levelData);
                      console.log(`Level ${levelData.id} loaded from ${file}`);
                  } else {
                      console.warn(`Invalid level data in ${file}`);
                  }
              } catch (error) {
                  console.warn(`Failed to load ${file}:`, error.message);
                  throw error; // Пробрасываем ошибку дальше
              }
          }
          
          if (this.levels.length === 0) {
              throw new Error('No levels loaded from JSON files');
          }
          
          // Сортировка уровней по ID
          this.levels.sort((a, b) => a.id - b.id);
          
          console.log(`Successfully loaded ${this.levels.length} levels from JSON`);
          
      } catch (error) {
          console.error('Error loading levels from JSON:', error);
          this.levels = [];
          throw error;
      }
  }

  /**
   * Валидация данных уровня
   * @param {Object} levelData - данные уровня
   * @returns {boolean}
   */
  validateLevelData(levelData) {
      const requiredFields = [
          'id', 'name', 'difficulty', 'width', 'height',
          'startPosition', 'endPosition', 'platforms', 'coins',
          'timeLimit', 'description'
      ];
      
      // Проверка обязательных полей
      for (const field of requiredFields) {
          if (levelData[field] === undefined) {
              console.warn(`Missing required field: ${field}`);
              return false;
          }
      }
      
      // Проверка типов данных
      if (typeof levelData.id !== 'number' || levelData.id <= 0) {
          console.warn('Invalid level ID');
          return false;
      }
      
      if (typeof levelData.width !== 'number' || levelData.width <= 0) {
          console.warn('Invalid level width');
          return false;
      }
      
      if (typeof levelData.height !== 'number' || levelData.height <= 0) {
          console.warn('Invalid level height');
          return false;
      }
      
      // Проверка позиций
      if (!levelData.startPosition || typeof levelData.startPosition.x !== 'number' || typeof levelData.startPosition.y !== 'number') {
          console.warn('Invalid start position');
          return false;
      }
      
      if (!levelData.endPosition || typeof levelData.endPosition.x !== 'number' || levelData.endPosition.y !== 'number') {
          console.warn('Invalid end position');
          return false;
      }
      
      // Проверка массивов
      if (!Array.isArray(levelData.platforms)) {
          console.warn('Platforms must be an array');
          return false;
      }
      
      if (!Array.isArray(levelData.coins)) {
          console.warn('Coins must be an array');
          return false;
      }
      
      // Проверка врагов (если есть)
      if (levelData.enemies && !Array.isArray(levelData.enemies)) {
          console.warn('Enemies must be an array or null');
          return false;
      }
      
      return true;
  }

  /**
   * Создание уровней по умолчанию
   */
  async createDefaultLevels() {
      this.levels = [
          this.createLevel1(),
          this.createLevel2(),
          this.createLevel3()
      ];
  }

  /**
   * Создание первого уровня (обучение)
   * @returns {Object}
   */
  createLevel1() {
      return {
          id: 1,
          name: 'Начало пути',
          difficulty: 'easy',
          width: 2000,
          height: 1000,
          startPosition: { x: 100, y: 400 },
          endPosition: { x: 1800, y: 300 },
          platforms: [
              // Стартовая платформа
              { x: 50, y: 450, width: 200, height: 32, type: 'normal' },
              
              // Основные платформы
              { x: 300, y: 400, width: 150, height: 32, type: 'normal' },
              { x: 500, y: 350, width: 150, height: 32, type: 'normal' },
              { x: 700, y: 300, width: 150, height: 32, type: 'normal' },
              { x: 900, y: 250, width: 150, height: 32, type: 'normal' },
              { x: 1100, y: 200, width: 150, height: 32, type: 'normal' },
              
              // Большие платформы для отдыха
              { x: 1300, y: 250, width: 200, height: 32, type: 'normal' },
              { x: 1550, y: 300, width: 200, height: 32, type: 'normal' },
              { x: 1750, y: 300, width: 200, height: 32, type: 'normal' }
          ],
          coins: [
              { x: 350, y: 320 },
              { x: 550, y: 270 },
              { x: 750, y: 220 },
              { x: 950, y: 170 },
              { x: 1150, y: 120 },
              { x: 1350, y: 170 },
              { x: 1600, y: 220 },
              { x: 1800, y: 220 }
          ],
          enemies: [], // Нет врагов на первом уровне
          timeLimit: 120, // 2 минуты
          description: 'Изучите основы управления и соберите все монеты!'
      };
  }

  /**
   * Создание второго уровня (средней сложности)
   * @returns {Object}
   */
  createLevel2() {
      return {
          id: 2,
          name: 'Горный путь',
          difficulty: 'normal',
          width: 2500,
          height: 1200,
          startPosition: { x: 100, y: 500 },
          endPosition: { x: 2300, y: 200 },
          platforms: [
              // Старт
              { x: 50, y: 550, width: 200, height: 32, type: 'normal' },
              
              // Прыжковая секция
              { x: 300, y: 500, width: 100, height: 32, type: 'normal' },
              { x: 450, y: 450, width: 100, height: 32, type: 'normal' },
              { x: 600, y: 400, width: 100, height: 32, type: 'normal' },
              { x: 750, y: 350, width: 100, height: 32, type: 'normal' },
              
              // Движущиеся платформы
              { x: 900, y: 400, width: 150, height: 32, type: 'moving' },
              { x: 1150, y: 350, width: 150, height: 32, type: 'moving' },
              
              // Секция с разрывами
              { x: 1400, y: 300, width: 80, height: 32, type: 'breakable' },
              { x: 1520, y: 250, width: 80, height: 32, type: 'breakable' },
              { x: 1640, y: 200, width: 80, height: 32, type: 'breakable' },
              
              // Финальная секция
              { x: 1800, y: 250, width: 200, height: 32, type: 'normal' },
              { x: 2050, y: 200, width: 200, height: 32, type: 'normal' },
              { x: 2250, y: 200, width: 200, height: 32, type: 'normal' }
          ],
          coins: [
              { x: 325, y: 420 },
              { x: 475, y: 370 },
              { x: 625, y: 320 },
              { x: 775, y: 270 },
              { x: 950, y: 320 },
              { x: 1200, y: 270 },
              { x: 1440, y: 220 },
              { x: 1560, y: 170 },
              { x: 1680, y: 120 },
              { x: 1850, y: 170 },
              { x: 2100, y: 120 },
              { x: 2300, y: 120 }
          ],
          enemies: [
              { x: 1000, y: 300, type: 'patrol', patrolRange: 100 },
              { x: 1600, y: 100, type: 'patrol', patrolRange: 150 }
          ],
          timeLimit: 90, // 1.5 минуты
          description: 'Будьте осторожны с движущимися и ломающимися платформами!'
      };
  }

  /**
   * Создание третьего уровня (сложный)
   * @returns {Object}
   */
  createLevel3() {
      return {
          id: 3,
          name: 'Небесный вызов',
          difficulty: 'hard',
          width: 3000,
          height: 1500,
          startPosition: { x: 100, y: 600 },
          endPosition: { x: 2800, y: 100 },
          platforms: [
              // Старт
              { x: 50, y: 650, width: 200, height: 32, type: 'normal' },
              
              // Прыжковая секция с маленькими платформами
              { x: 300, y: 600, width: 80, height: 32, type: 'jumpBoost' },
              { x: 450, y: 550, width: 80, height: 32, type: 'normal' },
              { x: 600, y: 500, width: 80, height: 32, type: 'jumpBoost' },
              { x: 750, y: 450, width: 80, height: 32, type: 'normal' },
              
              // Быстрые движущиеся платформы
              { x: 900, y: 400, width: 120, height: 32, type: 'moving', speed: 3 },
              { x: 1150, y: 350, width: 120, height: 32, type: 'moving', speed: 3 },
              { x: 1400, y: 300, width: 120, height: 32, type: 'moving', speed: 3 },
              
              // Лава-секция (опасная)
              { x: 1650, y: 400, width: 100, height: 32, type: 'breakable' },
              { x: 1800, y: 350, width: 100, height: 32, type: 'breakable' },
              { x: 1950, y: 300, width: 100, height: 32, type: 'breakable' },
              { x: 2100, y: 250, width: 100, height: 32, type: 'breakable' },
              
              // Финальный прыжок
              { x: 2300, y: 200, width: 150, height: 32, type: 'jumpBoost' },
              { x: 2500, y: 150, width: 150, height: 32, type: 'normal' },
              { x: 2700, y: 100, width: 200, height: 32, type: 'normal' }
          ],
          coins: [
              { x: 325, y: 520 },
              { x: 475, y: 470 },
              { x: 625, y: 420 },
              { x: 775, y: 370 },
              { x: 950, y: 320 },
              { x: 1200, y: 270 },
              { x: 1450, y: 220 },
              { x: 1700, y: 320 },
              { x: 1850, y: 270 },
              { x: 2000, y: 220 },
              { x: 2150, y: 170 },
              { x: 2350, y: 120 },
              { x: 2550, y: 70 },
              { x: 2750, y: 20 }
          ],
          enemies: [
              { x: 800, y: 350, type: 'patrol', patrolRange: 200 },
              { x: 1300, y: 200, type: 'patrol', patrolRange: 200 },
              { x: 1900, y: 250, type: 'patrol', patrolRange: 150 },
              { x: 2400, y: 100, type: 'patrol', patrolRange: 100 }
          ],
          timeLimit: 75, // 1 минута 15 секунд
          description: 'Испытайте свои навыки на самом сложном уровне!'
      };
  }

  /**
   * Загрузка уровня по индексу
   * @param {number} levelIndex - индекс уровня
   * @returns {Promise}
   */
  async loadLevel(levelIndex) {
      if (levelIndex < 0 || levelIndex >= this.levels.length) {
          throw new Error(`Invalid level index: ${levelIndex}`);
      }
      
      this.currentLevelIndex = levelIndex;
      this.currentLevel = this.levels[levelIndex];
      
      // Сброс прогресса уровня
      this.progress.collectedCoins = 0;
      this.progress.totalCoins = this.currentLevel.coins.length;
      this.progress.totalTime = 0;
      
      return this.currentLevel;
  }

  /**
   * Переход на следующий уровень
   * @returns {Promise<boolean>} true если есть следующий уровень
   */
  async nextLevel() {
      const nextIndex = this.currentLevelIndex + 1;
      
      if (nextIndex < this.levels.length) {
          await this.loadLevel(nextIndex);
          
          // Сохранение прогресса
          this.saveProgress();
          
          return true;
      }
      
      return false;
  }

  /**
   * Перезагрузка текущего уровня
   * @returns {Promise}
   */
  async restartLevel() {
      return this.loadLevel(this.currentLevelIndex);
  }

  /**
   * Получение текущего уровня
   * @returns {Object}
   */
  getCurrentLevel() {
      return this.currentLevel;
  }

  /**
   * Получение информации о текущем уровне
   * @returns {Object}
   */
  getLevelInfo() {
      if (!this.currentLevel) return null;
      
      return {
          id: this.currentLevel.id,
          name: this.currentLevel.name,
          difficulty: this.currentLevel.difficulty,
          timeLimit: this.currentLevel.timeLimit,
          description: this.currentLevel.description,
          progress: {
              coins: this.progress.collectedCoins,
              totalCoins: this.progress.totalCoins,
              percentage: this.progress.totalCoins > 0 
                  ? Math.round((this.progress.collectedCoins / this.progress.totalCoins) * 100)
                  : 0
          }
      };
  }

  /**
   * Получение статистики уровня
   * @returns {Object}
   */
  getLevelStats() {
      return {
          timeRemaining: Math.max(0, this.currentLevel.timeLimit - this.progress.totalTime),
          coinsCollected: this.progress.collectedCoins,
          totalCoins: this.progress.totalCoins,
          deaths: this.progress.deaths
      };
  }

  /**
   * Обновление прогресса уровня
   * @param {number} deltaTime - время с прошлого кадра
   */
  update(deltaTime) {
      if (!this.currentLevel) return;
      
      this.progress.totalTime += deltaTime / 1000; // Конвертация в секунды
  }

  /**
   * Отметка монеты как собранной
   */
  collectCoin() {
      this.progress.collectedCoins++;
  }

  /**
   * Отметка смерти игрока
   */
  recordDeath() {
      this.progress.deaths++;
  }

  /**
   * Проверка завершения уровня
   * @returns {boolean}
   */
  isLevelComplete() {
      if (!this.currentLevel) return false;
      
      // Проверка сбора всех монет
      const allCoinsCollected = this.progress.collectedCoins >= this.progress.totalCoins;
      
      // Проверка времени (если есть ограничение)
      const timeRemaining = this.currentLevel.timeLimit - this.progress.totalTime;
      const timeNotExpired = this.currentLevel.timeLimit <= 0 || timeRemaining > 0;
      
      return allCoinsCollected && timeNotExpired;
  }

  /**
   * Проверка истекло ли время
   * @returns {boolean}
   */
  isTimeExpired() {
      if (!this.currentLevel || this.currentLevel.timeLimit <= 0) return false;
      
      return this.progress.totalTime >= this.currentLevel.timeLimit;
  }

  /**
   * Получение оставшегося времени
   * @returns {number}
   */
  getRemainingTime() {
      if (!this.currentLevel || this.currentLevel.timeLimit <= 0) {
          return Infinity;
      }
      
      return Math.max(0, this.currentLevel.timeLimit - this.progress.totalTime);
  }

  /**
   * Получение процента завершения уровня
   * @returns {number}
   */
  getCompletionPercentage() {
      if (!this.currentLevel || this.progress.totalCoins === 0) return 0;
      
      const coinPercentage = (this.progress.collectedCoins / this.progress.totalCoins) * 0.7; // 70% за монеты
      
      let timePercentage = 0.3; // 30% за время (максимум)
      if (this.currentLevel.timeLimit > 0) {
          const timeRemaining = this.getRemainingTime();
          timePercentage = (timeRemaining / this.currentLevel.timeLimit) * 0.3;
      }
      
      return Math.round((coinPercentage + timePercentage) * 100);
  }

  /**
   * Загрузка прогресса из LocalStorage
   */
  loadProgress() {
      const saved = Helpers.loadFromStorage(Constants.STORAGE_KEYS.LEVEL_PROGRESS, {
          currentLevel: 0,
          bestTimes: {},
          coinsCollected: {},
          deaths: 0
      });
      
      this.currentLevelIndex = saved.currentLevel || 0;
      this.progress.deaths = saved.deaths || 0;
      
      // Загрузка лучших времен
      if (saved.bestTimes) {
          this.bestTimes = saved.bestTimes;
      }
  }

  /**
   * Сохранение прогресса в LocalStorage
   */
  saveProgress() {
      const progress = {
          currentLevel: this.currentLevelIndex,
          bestTimes: this.bestTimes || {},
          coinsCollected: this.coinsCollected || {},
          deaths: this.progress.deaths
      };
      
      Helpers.saveToStorage(Constants.STORAGE_KEYS.LEVEL_PROGRESS, progress);
  }

  /**
   * Сброс прогресса
   */
  resetProgress() {
      this.currentLevelIndex = 0;
      this.progress = {
          totalCoins: 0,
          collectedCoins: 0,
          totalTime: 0,
          bestTime: 0,
          deaths: 0
      };
      
      Helpers.removeFromStorage(Constants.STORAGE_KEYS.LEVEL_PROGRESS);
  }

  /**
   * Получение общего количества уровней
   * @returns {number}
   */
  getTotalLevels() {
      return this.levels.length;
  }

  /**
   * Проверка, является ли уровень последним
   * @returns {boolean}
   */
  isLastLevel() {
      return this.currentLevelIndex >= this.levels.length - 1;
  }
}