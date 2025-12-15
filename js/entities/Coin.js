/**
 * Класс монеты
 */
class Coin {
  /**
   * @param {number} x - позиция X
   * @param {number} y - позиция Y
   */
  constructor(x, y) {
      this.position = new Vector2(x, y);
      this.radius = Constants.COIN_RADIUS;
      this.value = Constants.COIN_VALUE;
      this.isCollected = false;
      this.collectionTime = 0;
      
      // Анимация
      this.rotation = 0;
      this.bobOffset = 0;
      this.bobSpeed = 0.05;
      this.bobAmount = 5;
      this.animationTimer = 0;
      this.animationSpeed = Constants.COIN_ANIMATION_SPEED;
      
      // Эффекты
      this.particles = [];
      this.sparkleTimer = 0;
      this.sparkleInterval = 500; // ms
      
      // Цвета
      this.colors = {
          outer: '#f1c40f',
          inner: '#f39c12',
          highlight: '#ffffff'
      };
  }

  /**
   * Обновление монеты
   * @param {number} deltaTime - время с прошлого кадра
   */
  update(deltaTime) {
      // Пропускаем обновление собранных монет
      if (this.isCollected) {
          this.collectionTime += deltaTime;
          
          // Обновление частиц при сборе
          Helpers.updateParticles(this.particles, deltaTime);
          return;
      }
      
      // Обновление анимации
      this.animationTimer += deltaTime;
      this.rotation += this.animationSpeed * deltaTime * 100;
      this.bobOffset = Math.sin(this.animationTimer * this.bobSpeed) * this.bobAmount;
      
      // Обновление блеска
      this.sparkleTimer += deltaTime;
      if (this.sparkleTimer >= this.sparkleInterval) {
          this.sparkleTimer = 0;
          this.createSparkle();
      }
      
      // Нормализация вращения
      if (this.rotation >= 360) {
          this.rotation -= 360;
      }
  }

  /**
   * Сбор монеты
   * @returns {number} количество очков
   */
  collect() {
      if (this.isCollected) return 0;
      
      this.isCollected = true;
      this.collectionTime = 0;
      
      // Создание частиц при сборе
      this.createCollectionParticles();
      
      return this.value;
  }

  /**
   * Создание частиц при сборе
   */
  createCollectionParticles() {
      const particleCount = 15;
      
      for (let i = 0; i < particleCount; i++) {
          const angle = (i / particleCount) * Math.PI * 2;
          const speed = Helpers.random(2, 5);
          const life = Helpers.random(0.5, 1.0);
          
          this.particles.push({
              x: this.position.x,
              y: this.position.y,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              radius: Helpers.random(2, 4),
              color: this.colors.outer,
              life: life,
              decay: Helpers.random(0.01, 0.03)
          });
      }
  }

  /**
   * Создание блеска
   */
  createSparkle() {
      const sparkleCount = 3;
      
      for (let i = 0; i < sparkleCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const distance = Math.random() * this.radius * 0.8;
          
          this.particles.push({
              x: this.position.x + Math.cos(angle) * distance,
              y: this.position.y + Math.sin(angle) * distance,
              vx: 0,
              vy: -1,
              radius: Helpers.random(1, 2),
              color: this.colors.highlight,
              life: 0.5,
              decay: 0.05
          });
      }
  }

  /**
   * Отрисовка монеты
   * @param {CanvasRenderingContext2D} ctx - контекст canvas
   */
  draw(ctx) {
      // Отрисовка частиц
      if (this.particles.length > 0) {
          Helpers.drawParticles(ctx, this.particles);
      }
      
      // Пропускаем отрисовку собранных монет
      if (this.isCollected) return;
      
      ctx.save();
      
      // Позиция с учетом анимации качания
      const drawY = this.position.y + this.bobOffset;
      
      // Вращение
      ctx.translate(this.position.x, drawY);
      ctx.rotate(Helpers.degToRad(this.rotation));
      
      // Внешний круг
      ctx.fillStyle = this.colors.outer;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Внутренний круг
      ctx.fillStyle = this.colors.inner;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 0.7, 0, Math.PI * 2);
      ctx.fill();
      
      // Блики
      ctx.fillStyle = this.colors.highlight;
      
      // Большой блик
      ctx.beginPath();
      ctx.arc(-this.radius * 0.3, -this.radius * 0.3, this.radius * 0.3, 0, Math.PI * 2);
      ctx.fill();
      
      // Малый блик
      ctx.beginPath();
      ctx.arc(this.radius * 0.2, -this.radius * 0.4, this.radius * 0.2, 0, Math.PI * 2);
      ctx.fill();
      
      // Буква "C"
      ctx.fillStyle = '#000000';
      ctx.font = `${this.radius * 0.8}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('C', 0, this.radius * 0.1);
      
      // Контур
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.restore();
  }

  /**
   * Получение центра монеты
   * @returns {Vector2}
   */
  getCenter() {
      return new Vector2(
          this.position.x,
          this.position.y + this.bobOffset
      );
  }

  /**
   * Получение круга для коллизий
   * @returns {Object}
   */
  getCollisionCircle() {
      return {
          x: this.position.x,
          y: this.position.y + this.bobOffset,
          radius: this.radius
      };
  }

  /**
   * Проверка, видна ли монета
   * @param {number} cameraX - позиция камеры X
   * @param {number} cameraY - позиция камеры Y
   * @param {number} viewportWidth - ширина viewport
   * @param {number} viewportHeight - высота viewport
   * @returns {boolean}
   */
  isVisible(cameraX, cameraY, viewportWidth, viewportHeight) {
      const center = this.getCenter();
      return center.x + this.radius > cameraX &&
             center.x - this.radius < cameraX + viewportWidth &&
             center.y + this.radius > cameraY &&
             center.y - this.radius < cameraY + viewportHeight;
  }

  /**
   * Проверка, должна ли монета быть удалена после сбора
   * @returns {boolean}
   */
  shouldRemove() {
      return this.isCollected && this.collectionTime > 1000 && this.particles.length === 0;
  }

  /**
   * Создание случайной монеты
   * @param {number} minX - минимальная позиция X
   * @param {number} maxX - максимальная позиция X
   * @param {number} minY - минимальная позиция Y
   * @param {number} maxY - максимальная позиция Y
   * @returns {Coin}
   */
  static createRandom(minX, maxX, minY, maxY) {
      const x = Helpers.randomInt(minX, maxX);
      const y = Helpers.randomInt(minY, maxY);
      return new Coin(x, y);
  }
}