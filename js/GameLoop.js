/**
 * Игровой цикл
 */
class GameLoop {
  constructor(game) {
      this.game = game;
      
      // Временные переменные
      this.lastTime = 0;
      this.accumulatedTime = 0;
      this.timeStep = 1000 / 60; // 60 FPS
      this.frameCount = 0;
      this.fps = 60;
      this.fpsTimer = 0;
      
      // Статистика
      this.stats = {
          frameTimes: [],
          updateTimes: [],
          drawTimes: [],
          maxFrameTime: 0,
          minFrameTime: Infinity,
          averageFrameTime: 0
      };
      
      // Состояние
      this.isRunning = false;
      this.isPaused = false;
      this.targetFPS = 60;
      
      // Отладка
      this.debug = false;
      
      // Привязка контекста
      this.loop = this.loop.bind(this);
  }

  /**
   * Запуск игрового цикла
   */
  start() {
      if (this.isRunning) return;
      
      this.isRunning = true;
      this.isPaused = false;
      this.lastTime = performance.now();
      
      // Запуск цикла
      requestAnimationFrame(this.loop);
      
      console.log('Game loop started');
  }

  /**
   * Остановка игрового цикла
   */
  stop() {
      this.isRunning = false;
      this.isPaused = false;
      console.log('Game loop stopped');
  }

  /**
   * Пауза игрового цикла
   */
  pause() {
      this.isPaused = true;
      console.log('Game loop paused');
  }

  /**
   * Возобновление игрового цикла
   */
  resume() {
      this.isPaused = false;
      this.lastTime = performance.now();
      console.log('Game loop resumed');
  }

  /**
   * Основной игровой цикл
   * @param {number} currentTime - текущее время
   */
  loop(currentTime) {
      if (!this.isRunning) return;
      
      // Запрашиваем следующий кадр
      requestAnimationFrame(this.loop);
      
      // Если игра на паузе, пропускаем обновление
      if (this.isPaused) return;
      
      // Вычисляем deltaTime
      const deltaTime = currentTime - this.lastTime;
      this.lastTime = currentTime;
      
      // Ограничение deltaTime для предотвращения "спирали смерти"
      const clampedDeltaTime = Math.min(deltaTime, 100);
      
      // Обновление FPS
      this.updateFPS(clampedDeltaTime);
      
      // Обновление статистики
      this.updateStats(clampedDeltaTime);
      
      // Накопление времени для фиксированного временного шага
      this.accumulatedTime += clampedDeltaTime;
      
      // Обновление игры с фиксированным временным шагом
      while (this.accumulatedTime >= this.timeStep) {
          // Обновление состояния игры
          const updateStart = performance.now();
          this.game.update(this.timeStep);
          const updateTime = performance.now() - updateStart;
          this.stats.updateTimes.push(updateTime);
          
          this.accumulatedTime -= this.timeStep;
      }
      
      // Отрисовка игры с интерполяцией
      const drawStart = performance.now();
      this.game.render();
      const drawTime = performance.now() - drawStart;
      this.stats.drawTimes.push(drawTime);
      
      // Отрисовка отладочной информации
      if (this.debug) {
          this.drawDebug();
      }
      
      // Увеличение счетчика кадров
      this.frameCount++;
  }

  /**
   * Обновление FPS
   * @param {number} deltaTime - время с прошлого кадра
   */
  updateFPS(deltaTime) {
      this.fpsTimer += deltaTime;
      
      if (this.fpsTimer >= 1000) {
          this.fps = this.frameCount;
          this.frameCount = 0;
          this.fpsTimer = 0;
      }
  }

  /**
   * Обновление статистики
   * @param {number} frameTime - время кадра
   */
  updateStats(frameTime) {
      // Добавление времени кадра
      this.stats.frameTimes.push(frameTime);
      
      // Ограничение истории
      if (this.stats.frameTimes.length > 100) {
          this.stats.frameTimes.shift();
      }
      if (this.stats.updateTimes.length > 100) {
          this.stats.updateTimes.shift();
      }
      if (this.stats.drawTimes.length > 100) {
          this.stats.drawTimes.shift();
      }
      
      // Обновление минимума и максимума
      this.stats.maxFrameTime = Math.max(this.stats.maxFrameTime, frameTime);
      this.stats.minFrameTime = Math.min(this.stats.minFrameTime, frameTime);
      
      // Вычисление среднего времени кадра
      const sum = this.stats.frameTimes.reduce((a, b) => a + b, 0);
      this.stats.averageFrameTime = sum / this.stats.frameTimes.length;
  }

  /**
   * Отрисовка отладочной информации
   */
  drawDebug() {
      const ctx = this.game.canvas.getContext('2d');
      const stats = this.getStats();
      
      ctx.save();
      ctx.font = '12px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      
      // Фон для текста
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(10, 10, 200, 120);
      
      // Текст статистики
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`FPS: ${this.fps}`, 20, 20);
      ctx.fillText(`Frame: ${this.frameCount}`, 20, 40);
      ctx.fillText(`Update: ${stats.updateTime.toFixed(2)}ms`, 20, 60);
      ctx.fillText(`Draw: ${stats.drawTime.toFixed(2)}ms`, 20, 80);
      ctx.fillText(`Avg: ${stats.avgFrameTime.toFixed(2)}ms`, 20, 100);
      ctx.fillText(`State: ${this.game.state}`, 20, 120);
      
      // График производительности
      this.drawPerformanceGraph(ctx, 220, 10, 200, 100);
      
      ctx.restore();
  }

  /**
   * Отрисовка графика производительности
   * @param {CanvasRenderingContext2D} ctx - контекст canvas
   * @param {number} x - позиция X
   * @param {number} y - позиция Y
   * @param {number} width - ширина
   * @param {number} height - высота
   */
  drawPerformanceGraph(ctx, x, y, width, height) {
      const times = this.stats.frameTimes;
      const maxTime = Math.max(...times, 32); // 32ms = 30 FPS
      
      // Фон графика
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(x, y, width, height);
      
      // Линия 60 FPS (16.67ms)
      ctx.strokeStyle = '#2ecc71';
      ctx.lineWidth = 1;
      const fps60Y = y + height - (16.67 / maxTime) * height;
      ctx.beginPath();
      ctx.moveTo(x, fps60Y);
      ctx.lineTo(x + width, fps60Y);
      ctx.stroke();
      
      // Линия 30 FPS (33.33ms)
      ctx.strokeStyle = '#e74c3c';
      const fps30Y = y + height - (33.33 / maxTime) * height;
      ctx.beginPath();
      ctx.moveTo(x, fps30Y);
      ctx.lineTo(x + width, fps30Y);
      ctx.stroke();
      
      // График времени кадров
      ctx.strokeStyle = '#3498db';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      for (let i = 0; i < times.length; i++) {
          const time = times[i];
          const graphX = x + (i / times.length) * width;
          const graphY = y + height - (time / maxTime) * height;
          
          if (i === 0) {
              ctx.moveTo(graphX, graphY);
          } else {
              ctx.lineTo(graphX, graphY);
          }
      }
      
      ctx.stroke();
  }

  /**
   * Получение статистики
   * @returns {Object}
   */
  getStats() {
      const avgUpdateTime = this.stats.updateTimes.length > 0
          ? this.stats.updateTimes.reduce((a, b) => a + b, 0) / this.stats.updateTimes.length
          : 0;
      
      const avgDrawTime = this.stats.drawTimes.length > 0
          ? this.stats.drawTimes.reduce((a, b) => a + b, 0) / this.stats.drawTimes.length
          : 0;
      
      return {
          fps: this.fps,
          frameCount: this.frameCount,
          updateTime: avgUpdateTime,
          drawTime: avgDrawTime,
          avgFrameTime: this.stats.averageFrameTime,
          maxFrameTime: this.stats.maxFrameTime,
          minFrameTime: this.stats.minFrameTime,
          isRunning: this.isRunning,
          isPaused: this.isPaused
      };
  }

  /**
   * Сброс статистики
   */
  resetStats() {
      this.stats = {
          frameTimes: [],
          updateTimes: [],
          drawTimes: [],
          maxFrameTime: 0,
          minFrameTime: Infinity,
          averageFrameTime: 0
      };
      
      this.frameCount = 0;
      this.fps = 60;
      this.fpsTimer = 0;
  }

  /**
   * Включение/выключение отладки
   * @param {boolean} enabled - включена ли отладка
   */
  setDebug(enabled) {
      this.debug = enabled;
  }

  /**
   * Установка целевого FPS
   * @param {number} fps - целевой FPS
   */
  setTargetFPS(fps) {
      this.targetFPS = fps;
      this.timeStep = 1000 / fps;
  }

  /**
   * Получение текущего FPS
   * @returns {number}
   */
  getFPS() {
      return this.fps;
  }

  /**
   * Проверка, работает ли игровой цикл
   * @returns {boolean}
   */
  isActive() {
      return this.isRunning && !this.isPaused;
  }

  /**
   * Получение времени с начала игры
   * @returns {number}
   */
  getGameTime() {
      return this.lastTime;
  }

  /**
   * Обработка изменения размера окна
   */
  handleResize() {
      // Сброс времени для предотвращения скачков
      this.lastTime = performance.now();
      this.accumulatedTime = 0;
  }
}
