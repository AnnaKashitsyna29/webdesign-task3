/**
 * Класс платформы
 */
class Platform {
  /**
   * @param {number} x - позиция X
   * @param {number} y - позиция Y
   * @param {number} width - ширина
   * @param {number} height - высота
   * @param {string} type - тип платформы
   */
  constructor(x, y, width = Constants.PLATFORM_WIDTH, height = Constants.PLATFORM_HEIGHT, type = 'normal') {
      this.position = new Vector2(x, y);
      this.width = width;
      this.height = height;
      this.type = type;
      
      // Для движущихся платформ
      this.isMoving = type === 'moving';
      this.moveSpeed = this.isMoving ? 2 : 0;
      this.moveDirection = 1;
      this.moveDistance = 100;
      this.originalX = x;
      
      // Для ломающихся платформ
      this.isBreakable = type === 'breakable';
      this.isBreaking = false;
      this.breakTimer = 0;
      this.breakDuration = 1000; // ms
      this.breakProgress = 0;
      
      // Для прыжковых платформ
      this.isJumpBoost = type === 'jumpBoost';
      this.jumpBoostForce = -18;
      
      // Анимация
      this.animationTimer = 0;
      this.animationSpeed = 0.05;
      this.color = this.getColorByType();
      
      // Коллизии
      this.bounds = {
          top: y,
          bottom: y + height,
          left: x,
          right: x + width
      };
  }

  /**
   * Получение цвета по типу платформы
   * @returns {string}
   */
  getColorByType() {
      switch (this.type) {
          case 'moving':
              return '#3498db'; // Синий
          case 'breakable':
              return '#e74c3c'; // Красный
          case 'jumpBoost':
              return '#2ecc71'; // Зеленый
          default:
              return '#95a5a6'; // Серый (обычная)
      }
  }

  /**
   * Обновление платформы
   * @param {number} deltaTime - время с прошлого кадра
   */
  update(deltaTime) {
      // Обновление анимации
      this.animationTimer += deltaTime;
      
      // Движение для движущихся платформ
      if (this.isMoving) {
          this.updateMovement(deltaTime);
      }
      
      // Обновление для ломающихся платформ
      if (this.isBreakable && this.isBreaking) {
          this.updateBreaking(deltaTime);
      }
      
      // Обновление границ
      this.updateBounds();
  }

  /**
   * Обновление движения платформы
   * @param {number} deltaTime - время с прошлого кадра
   */
  updateMovement(deltaTime) {
      this.position.x += this.moveSpeed * this.moveDirection * deltaTime;
      
      // Изменение направления при достижении границ
      if (this.position.x > this.originalX + this.moveDistance) {
          this.position.x = this.originalX + this.moveDistance;
          this.moveDirection = -1;
      } else if (this.position.x < this.originalX - this.moveDistance) {
          this.position.x = this.originalX - this.moveDistance;
          this.moveDirection = 1;
      }
  }

  /**
   * Обновление ломающейся платформы
   * @param {number} deltaTime - время с прошлого кадра
   */
  updateBreaking(deltaTime) {
      this.breakTimer += deltaTime;
      this.breakProgress = this.breakTimer / this.breakDuration;
      
      // Эффект тряски
      if (this.breakProgress < 1) {
          const shakeIntensity = 1 - this.breakProgress;
          const shakeX = Math.sin(Date.now() / 50) * 2 * shakeIntensity;
          this.position.x = this.originalX + shakeX;
      }
      
      // Удаление платформы
      if (this.breakProgress >= 1) {
          this.width = 0;
          this.height = 0;
      }
  }

  /**
   * Начало разрушения платформы
   */
  startBreaking() {
      if (this.isBreakable && !this.isBreaking) {
          this.isBreaking = true;
          this.originalX = this.position.x;
          this.breakTimer = 0;
          this.breakProgress = 0;
      }
  }

  /**
   * Обновление границ
   */
  updateBounds() {
      this.bounds.top = this.position.y;
      this.bounds.bottom = this.position.y + this.height;
      this.bounds.left = this.position.x;
      this.bounds.right = this.position.x + this.width;
  }

  /**
   * Отрисовка платформы
   * @param {CanvasRenderingContext2D} ctx - контекст canvas
   */
  draw(ctx) {
      // Пропуск отрисовки разрушенных платформ
      if (this.width === 0 || this.height === 0) return;
      
      // Основная платформа
      ctx.fillStyle = this.color;
      ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
      
      // Детали платформы
      this.drawDetails(ctx);
      
      // Контур
      ctx.strokeStyle = '#2c3e50';
      ctx.lineWidth = 2;
      ctx.strokeRect(this.position.x, this.position.y, this.width, this.height);
  }

  /**
   * Отрисовка деталей платформы
   * @param {CanvasRenderingContext2D} ctx - контекст canvas
   */
  drawDetails(ctx) {
      // Узор для обычной платформы
      if (this.type === 'normal') {
          ctx.fillStyle = '#7f8c8d';
          const tileSize = 16;
          for (let x = 0; x < this.width; x += tileSize) {
              for (let y = 0; y < this.height; y += tileSize) {
                  if ((x / tileSize + y / tileSize) % 2 === 0) {
                      ctx.fillRect(
                          this.position.x + x,
                          this.position.y + y,
                          tileSize,
                          tileSize
                      );
                  }
              }
          }
      }
      
      // Стрелки для движущейся платформы
      else if (this.type === 'moving') {
          ctx.fillStyle = '#ffffff';
          const arrowSize = 8;
          const arrowSpacing = 30;
          
          for (let i = 0; i < Math.floor(this.width / arrowSpacing); i++) {
              const arrowX = this.position.x + i * arrowSpacing + arrowSpacing / 2;
              const arrowY = this.position.y + this.height / 2;
              
              this.drawArrow(ctx, arrowX, arrowY, arrowSize, this.moveDirection > 0 ? 'right' : 'left');
          }
      }
      
      // Трещины для ломающейся платформы
      else if (this.type === 'breakable' && this.isBreaking) {
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 2;
          
          // Рисуем трещины
          for (let i = 0; i < 3; i++) {
              const startX = this.position.x + Math.random() * this.width;
              const startY = this.position.y + Math.random() * this.height;
              const endX = startX + (Math.random() - 0.5) * 40;
              const endY = startY + (Math.random() - 0.5) * 20;
              
              ctx.beginPath();
              ctx.moveTo(startX, startY);
              ctx.lineTo(endX, endY);
              ctx.stroke();
          }
      }
      
      // Пружины для прыжковой платформы
      else if (this.type === 'jumpBoost') {
          ctx.fillStyle = '#ffffff';
          const springWidth = 6;
          const springHeight = 4;
          const springSpacing = 20;
          
          for (let i = 0; i < Math.floor(this.width / springSpacing); i++) {
              const springX = this.position.x + i * springSpacing + (springSpacing - springWidth) / 2;
              const springY = this.position.y + this.height - springHeight;
              
              // Анимация пружины
              const bounce = Math.sin(this.animationTimer * 10) * 2;
              ctx.fillRect(springX, springY - bounce, springWidth, springHeight);
          }
      }
  }

  /**
   * Отрисовка стрелки
   * @param {CanvasRenderingContext2D} ctx - контекст canvas
   * @param {number} x - позиция X
   * @param {number} y - позиция Y
   * @param {number} size - размер
   * @param {string} direction - направление
   */
  drawArrow(ctx, x, y, size, direction) {
      ctx.save();
      ctx.translate(x, y);
      
      if (direction === 'left') {
          ctx.rotate(Math.PI);
      }
      
      ctx.beginPath();
      ctx.moveTo(-size, -size);
      ctx.lineTo(size, 0);
      ctx.lineTo(-size, size);
      ctx.closePath();
      ctx.fill();
      
      ctx.restore();
  }

  /**
   * Получение центра платформы
   * @returns {Vector2}
   */
  getCenter() {
      return new Vector2(
          this.position.x + this.width / 2,
          this.position.y + this.height / 2
      );
  }

  /**
   * Получение прямоугольника для коллизий
   * @returns {Object}
   */
  getCollisionRect() {
      return {
          x: this.position.x,
          y: this.position.y,
          width: this.width,
          height: this.height
      };
  }

  /**
   * Проверка видимости платформы
   * @param {number} cameraX - позиция камеры X
   * @param {number} cameraY - позиция камеры Y
   * @param {number} viewportWidth - ширина viewport
   * @param {number} viewportHeight - высота viewport
   * @returns {boolean}
   */
  isVisible(cameraX, cameraY, viewportWidth, viewportHeight) {
      return this.position.x < cameraX + viewportWidth &&
             this.position.x + this.width > cameraX &&
             this.position.y < cameraY + viewportHeight &&
             this.position.y + this.height > cameraY;
  }

  /**
   * Создание случайной платформы
   * @param {number} minX - минимальная позиция X
   * @param {number} maxX - максимальная позиция X
   * @param {number} y - позиция Y
   * @param {string} levelType - тип уровня
   * @returns {Platform}
   */
  static createRandom(minX, maxX, y, levelType = 'normal') {
      const types = ['normal'];
      
      // Добавляем специальные платформы в зависимости от уровня
      if (levelType !== 'easy') {
          types.push('moving', 'breakable');
      }
      if (levelType === 'hard') {
          types.push('jumpBoost');
      }
      
      const type = types[Math.floor(Math.random() * types.length)];
      const width = Helpers.randomInt(80, 160);
      const x = Helpers.randomInt(minX, maxX - width);
      
      return new Platform(x, y, width, Constants.PLATFORM_HEIGHT, type);
  }
}