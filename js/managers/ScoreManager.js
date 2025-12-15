/**
 * Менеджер счета и рекордов
 */
class ScoreManager {
  constructor() {
      this.currentScore = 0;
      this.highScore = 0;
      this.multiplier = 1;
      this.combo = 0;
      this.maxCombo = 0;
      this.comboTimer = 0;
      this.comboDuration = 3000; // 3 секунды
      this.coinsCollected = 0;
      this.totalCoins = 0;
      
      // Достижения
      this.achievements = {
          firstCoin: false,
          firstCombo: false,
          perfectLevel: false,
          speedRunner: false,
          coinCollector: false
      };
      
      // Загрузка сохраненных данных
      this.loadScores();
  }

  /**
   * Добавление очков
   * @param {number} points - количество очков
   * @param {string} reason - причина начисления
   */
  addScore(points, reason = '') {
      // Учет множителя
      const actualPoints = Math.floor(points * this.multiplier);
      this.currentScore += actualPoints;
      
      // Обновление комбо
      this.updateCombo();
      
      // Проверка на новый рекорд
      if (this.currentScore > this.highScore) {
          this.highScore = this.currentScore;
          this.saveScores();
      }
      
      // Проверка достижений
      this.checkAchievements(reason);
      
      return actualPoints;
  }

  /**
   * Добавление монеты
   */
  addCoin() {
      this.coinsCollected++;
      const points = Constants.COIN_VALUE;
      return this.addScore(points, 'coin');
  }

  /**
   * Обновление комбо
   */
  updateCombo() {
      this.combo++;
      this.maxCombo = Math.max(this.maxCombo, this.combo);
      this.comboTimer = this.comboDuration;
      
      // Обновление множителя
      if (this.combo >= 10) {
          this.multiplier = 2;
      } else if (this.combo >= 5) {
          this.multiplier = 1.5;
      } else {
          this.multiplier = 1;
      }
      
      // Проверка достижения первого комбо
      if (this.combo >= 3 && !this.achievements.firstCombo) {
          this.achievements.firstCombo = true;
          this.unlockAchievement('firstCombo');
      }
  }

  /**
   * Обновление таймера комбо
   * @param {number} deltaTime - время с прошлого кадра
   */
  update(deltaTime) {
      if (this.combo > 0) {
          this.comboTimer -= deltaTime;
          if (this.comboTimer <= 0) {
              this.resetCombo();
          }
      }
  }

  /**
   * Сброс комбо
   */
  resetCombo() {
      this.combo = 0;
      this.multiplier = 1;
      this.comboTimer = 0;
  }

  /**
   * Получение бонуса за время
   * @param {number} remainingTime - оставшееся время
   * @param {number} totalTime - общее время уровня
   * @returns {number}
   */
  getTimeBonus(remainingTime, totalTime) {
      if (totalTime <= 0) return 0;
      
      const percentage = remainingTime / totalTime;
      const bonus = Math.floor(percentage * Constants.TIME_BONUS_MULTIPLIER * 100);
      
      // Проверка достижения speedRunner
      if (percentage >= 0.8 && !this.achievements.speedRunner) {
          this.achievements.speedRunner = true;
          this.unlockAchievement('speedRunner');
      }
      
      return bonus;
  }

  /**
   * Получение бонуса за сбор всех монет
   * @param {number} collectedCoins - собранные монеты
   * @param {number} totalCoins - общее количество монет
   * @returns {number}
   */
  getCoinBonus(collectedCoins, totalCoins) {
      if (totalCoins === 0) return 0;
      
      const percentage = collectedCoins / totalCoins;
      const bonus = Math.floor(percentage * 500);
      
      // Проверка достижения perfectLevel
      if (percentage === 1 && !this.achievements.perfectLevel) {
          this.achievements.perfectLevel = true;
          this.unlockAchievement('perfectLevel');
      }
      
      // Проверка достижения coinCollector
      if (this.coinsCollected >= 50 && !this.achievements.coinCollector) {
          this.achievements.coinCollector = true;
          this.unlockAchievement('coinCollector');
      }
      
      return bonus;
  }

  /**
   * Получение итогового счета за уровень
   * @param {Object} levelStats - статистика уровня
   * @returns {Object}
   */
  calculateLevelScore(levelStats) {
      const baseScore = this.currentScore;
      const timeBonus = this.getTimeBonus(levelStats.timeRemaining, levelStats.timeLimit);
      const coinBonus = this.getCoinBonus(levelStats.coinsCollected, levelStats.totalCoins);
      const comboBonus = this.maxCombo * 10;
      const perfectBonus = levelStats.coinsCollected === levelStats.totalCoins ? 1000 : 0;
      
      const totalScore = baseScore + timeBonus + coinBonus + comboBonus + perfectBonus;
      
      return {
          baseScore,
          timeBonus,
          coinBonus,
          comboBonus,
          perfectBonus,
          totalScore,
          multiplier: this.multiplier,
          maxCombo: this.maxCombo
      };
  }

  /**
   * Проверка достижений
   * @param {string} reason - причина начисления очков
   */
  checkAchievements(reason) {
      // Проверка первой монеты
      if (reason === 'coin' && this.coinsCollected === 1 && !this.achievements.firstCoin) {
          this.achievements.firstCoin = true;
          this.unlockAchievement('firstCoin');
      }
  }

  /**
   * Разблокировка достижения
   * @param {string} achievementId - ID достижения
   */
  unlockAchievement(achievementId) {
      console.log(`Достижение разблокировано: ${achievementId}`);
      // Здесь можно добавить уведомление пользователю
  }

  /**
   * Загрузка сохраненных счетов
   */
  loadScores() {
      const savedHighScore = Helpers.loadFromStorage(Constants.STORAGE_KEYS.HIGH_SCORE, 0);
      this.highScore = savedHighScore;
      
      const savedAchievements = Helpers.loadFromStorage('pixel_jumper_achievements', {});
      this.achievements = { ...this.achievements, ...savedAchievements };
  }

  /**
   * Сохранение счетов
   */
  saveScores() {
      Helpers.saveToStorage(Constants.STORAGE_KEYS.HIGH_SCORE, this.highScore);
      Helpers.saveToStorage('pixel_jumper_achievements', this.achievements);
  }

  /**
   * Сброс текущего счета
   */
  resetCurrentScore() {
      this.currentScore = 0;
      this.multiplier = 1;
      this.combo = 0;
      this.maxCombo = 0;
      this.comboTimer = 0;
      this.coinsCollected = 0;
  }

  /**
   * Получение статистики
   * @returns {Object}
   */
  getStats() {
      return {
          currentScore: this.currentScore,
          highScore: this.highScore,
          multiplier: this.multiplier,
          combo: this.combo,
          maxCombo: this.maxCombo,
          coinsCollected: this.coinsCollected,
          achievements: this.achievements
      };
  }

  /**
   * Форматирование счета
   * @param {number} score - счет
   * @returns {string}
   */
  formatScore(score) {
      return Helpers.formatNumber(score);
  }

  /**
   * Получение текста комбо
   * @returns {string}
   */
  getComboText() {
      if (this.combo <= 1) return '';
      
      let text = `COMBO x${this.combo}`;
      if (this.multiplier > 1) {
          text += ` (x${this.multiplier})`;
      }
      
      return text;
  }

  /**
   * Получение цвета комбо
   * @returns {string}
   */
  getComboColor() {
      if (this.combo >= 10) return '#e74c3c'; // Красный
      if (this.combo >= 5) return '#f39c12';  // Оранжевый
      return '#2ecc71'; // Зеленый
  }

  /**
   * Получение процента до следующего множителя
   * @returns {number}
   */
  getComboProgress() {
      if (this.combo >= 10) return 100;
      if (this.combo >= 5) return (this.combo - 5) / 5 * 100;
      return this.combo / 5 * 100;
  }
}

