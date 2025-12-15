/**
 * Класс игрока
 */
class Player {
  /**
   * @param {number} x - начальная позиция X
   * @param {number} y - начальная позиция Y
   */
  constructor(x, y) {
      // Позиция и размеры
      this.position = new Vector2(x, y);
      this.width = Constants.PLAYER_WIDTH;
      this.height = Constants.PLAYER_HEIGHT;
      this.velocity = new Vector2(0, 0);
      this.acceleration = new Vector2(0, 0);
      
      // Состояние игрока
      this.isOnGround = false;
      this.isJumping = false;
      this.isFacingRight = true;
      this.isInvincible = false;
      this.invincibilityTimer = 0;
      this.lives = Constants.PLAYER_MAX_HEALTH;
      this.score = 0;
      
      // Анимация
      this.animationFrame = 0;
      this.animationTimer = 0;
      this.animationSpeed = 0.1;
      this.currentAnimation = 'idle';
      
      // Физические свойства
      this.speed = Constants.PLAYER_SPEED;
      this.jumpForce = Constants.PLAYER_JUMP_FORCE;
      this.gravity = Constants.GRAVITY;
      this.maxFallSpeed = Constants.MAX_FALL_SPEED;
      
      // Частицы
      this.particles = [];
      
      // Коллизии
      this.bounds = {
          top: this.position.y,
          bottom: this.position.y + this.height,
          left: this.position.x,
          right: this.position.x + this.width
      };
  }

  /**
   * Обновление игрока
   * @param {number} deltaTime - время с прошлого кадра
   * @param {InputHandler} input - обработчик ввода
   * @param {PhysicsEngine} physics - физический движок
   */
  update(deltaTime, input, physics) {
    // Обновление таймеров
    if (this.isInvincible) {
        this.invincibilityTimer -= deltaTime;
        if (this.invincibilityTimer <= 0) {
            this.isInvincible = false;
        }
    }
    
    // Обработка ввода
    this.handleInput(input);
    
    // Применение физики
    this.applyPhysics(deltaTime, physics);
    
    // Обновление анимации
    this.updateAnimation(deltaTime);
    
    // Обновление частиц
    Helpers.updateParticles(this.particles, deltaTime);
    
    // Обновление границ для коллизий
    this.updateBounds();
    
    // Ограничение минимальной высоты (предотвращение бесконечного падения)
    const minY = -100; // Небольшое значение выше уровня
    if (this.position.y < minY) {
        this.position.y = minY;
        this.velocity.y = 0;
    }
}

  /**
   * Обработка ввода игрока
   * @param {InputHandler} input - обработчик ввода
   */
  handleInput(input) {
      const horizontalInput = input.getHorizontalInput();
      
      // Движение по горизонтали
      if (horizontalInput !== 0) {
          this.velocity.x = horizontalInput * this.speed;
          this.isFacingRight = horizontalInput > 0;
          this.currentAnimation = 'run';
      } else {
          // Трение
          this.velocity.x *= Constants.FRICTION;
          if (Math.abs(this.velocity.x) < 0.1) {
              this.velocity.x = 0;
          }
          this.currentAnimation = 'idle';
      }
      
      // Прыжок
      if (input.isJumpPressed() && this.isOnGround) {
          this.jump();
      }
  }

  /**
   * Применение физики
   * @param {number} deltaTime - время с прошлого кадра
   * @param {PhysicsEngine} physics - физический движок
   */
  applyPhysics(deltaTime, physics) {
      // Применение гравитации
      if (!this.isOnGround) {
          this.velocity.y += this.gravity;
          this.velocity.y = Math.min(this.velocity.y, this.maxFallSpeed);
      } else {
          this.velocity.y = 0;
      }
      
      // Применение скорости
      this.position.x += this.velocity.x * deltaTime;
      this.position.y += this.velocity.y * deltaTime;
      
      // Сохранение на земле
      this.isOnGround = false;
  }

  /**
   * Прыжок игрока
   */
  jump() {
      this.velocity.y = this.jumpForce;
      this.isOnGround = false;
      this.isJumping = true;
      
      // Создание частиц при прыжке
      this.createJumpParticles();
      
      // Воспроизведение звука прыжка
      Helpers.playSound(Constants.SOUNDS.JUMP);
  }

  /**
   * Создание частиц при прыжке
   */
  createJumpParticles() {
      const particleCount = 10;
      const particleColor = '#3498db';
      
      for (let i = 0; i < particleCount; i++) {
          this.particles.push({
              x: this.position.x + this.width / 2,
              y: this.position.y + this.height,
              vx: Helpers.random(-3, 3),
              vy: Helpers.random(-8, -2),
              radius: Helpers.random(2, 4),
              color: particleColor,
              life: 1.0,
              decay: Helpers.random(0.02, 0.05)
          });
      }
  }

  /**
   * Нанесение урона игроку
   * @param {number} damage - количество урона
   * @returns {boolean} true если игрок умер
   */
  takeDamage(damage = 1) {
      if (this.isInvincible) return false;
      
      this.lives -= damage;
      this.isInvincible = true;
      this.invincibilityTimer = Constants.INVINCIBILITY_TIME;
      
      // Создание частиц при получении урона
      this.createDamageParticles();
      
      // Воспроизведение звука получения урона
      Helpers.playSound(Constants.SOUNDS.HIT);
      
      return this.lives <= 0;
  }

  /**
   * Создание частиц при получении урона
   */
  createDamageParticles() {
      const particleCount = 15;
      const particleColor = '#e74c3c';
      
      for (let i = 0; i < particleCount; i++) {
          this.particles.push({
              x: this.position.x + this.width / 2,
              y: this.position.y + this.height / 2,
              vx: Helpers.random(-5, 5),
              vy: Helpers.random(-5, 5),
              radius: Helpers.random(2, 5),
              color: particleColor,
              life: 1.0,
              decay: Helpers.random(0.02, 0.05)
          });
      }
  }

  /**
   * Добавление очков
   * @param {number} points - количество очков
   */
  addScore(points) {
      this.score += points;
      
      // Создание частиц при сборе очков
      this.createScoreParticles(points);
      
      // Воспроизведение звука сбора очков
      Helpers.playSound(Constants.SOUNDS.COIN);
  }

  /**
   * Создание частиц при сборе очков
   * @param {number} points - количество очков
   */
  createScoreParticles(points) {
      const particleCount = Math.min(points / 10, 20);
      const particleColor = '#f1c40f';
      
      for (let i = 0; i < particleCount; i++) {
          this.particles.push({
              x: this.position.x + this.width / 2,
              y: this.position.y + this.height / 2,
              vx: Helpers.random(-2, 2),
              vy: Helpers.random(-2, 2),
              radius: Helpers.random(3, 6),
              color: particleColor,
              life: 1.0,
              decay: Helpers.random(0.01, 0.03)
          });
      }
  }

  /**
   * Обновление анимации
   * @param {number} deltaTime - время с прошлого кадра
   */
  updateAnimation(deltaTime) {
      this.animationTimer += deltaTime;
      
      if (this.animationTimer >= this.animationSpeed) {
          this.animationTimer = 0;
          this.animationFrame++;
          
          const maxFrames = Constants.ANIMATION_FRAMES[`PLAYER_${this.currentAnimation.toUpperCase()}`];
          if (this.animationFrame >= maxFrames) {
              this.animationFrame = 0;
          }
      }
  }

  /**
   * Обновление границ для коллизий
   */
  updateBounds() {
      this.bounds.top = this.position.y;
      this.bounds.bottom = this.position.y + this.height;
      this.bounds.left = this.position.x;
      this.bounds.right = this.position.x + this.width;
  }

  /**
   * Получение центра игрока
   * @returns {Vector2}
   */
  getCenter() {
      return new Vector2(
          this.position.x + this.width / 2,
          this.position.y + this.height / 2
      );
  }

  /**
   * Отрисовка игрока
   * @param {CanvasRenderingContext2D} ctx - контекст canvas
   */
  draw(ctx) {
      // Отрисовка частиц
      if (this.particles.length > 0) {
          Helpers.drawParticles(ctx, this.particles);
      }
      
      // Сохранение состояния контекста
      ctx.save();
      
      // Отражение игрока при движении влево
      if (!this.isFacingRight) {
          ctx.translate(this.position.x + this.width / 2, 0);
          ctx.scale(-1, 1);
          ctx.translate(-(this.position.x + this.width / 2), 0);
      }
      
      // Мигание при неуязвимости
      if (this.isInvincible) {
          const alpha = Math.sin(Date.now() / 100) * 0.5 + 0.5;
          ctx.globalAlpha = alpha;
      }
      
      // Отрисовка тела игрока
      ctx.fillStyle = Constants.COLORS.PLAYER;
      ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
      
      // Отрисовка деталей игрока
      this.drawDetails(ctx);
      
      // Восстановление состояния контекста
      ctx.restore();
  }

  /**
   * Отрисовка деталей игрока
   * @param {CanvasRenderingContext2D} ctx - контекст canvas
   */
  drawDetails(ctx) {
      // Голова
      const headX = this.position.x + this.width / 2;
      const headY = this.position.y + 10;
      const headRadius = 10;
      
      ctx.fillStyle = '#2980b9';
      ctx.beginPath();
      ctx.arc(headX, headY, headRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Глаза
      const eyeOffset = this.isFacingRight ? 4 : -4;
      const eyeY = headY - 2;
      const eyeRadius = 2;
      
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(headX - eyeOffset, eyeY, eyeRadius, 0, Math.PI * 2);
      ctx.arc(headX + eyeOffset, eyeY, eyeRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Тело
      const bodyX = this.position.x + 5;
      const bodyY = headY + headRadius;
      const bodyWidth = this.width - 10;
      const bodyHeight = this.height - 30;
      
      ctx.fillStyle = '#2980b9';
      ctx.fillRect(bodyX, bodyY, bodyWidth, bodyHeight);
      
      // Ноги
      const legWidth = 8;
      const legHeight = 15;
      const legY = this.position.y + this.height - legHeight;
      
      // Анимация ног при беге
      let legOffset = 0;
      if (this.currentAnimation === 'run') {
          legOffset = Math.sin(this.animationFrame * 0.5) * 3;
      }
      
      ctx.fillStyle = '#21618c';
      ctx.fillRect(this.position.x + 6, legY + legOffset, legWidth, legHeight);
      ctx.fillRect(this.position.x + this.width - 6 - legWidth, legY - legOffset, legWidth, legHeight);
      
      // Руки
      const armWidth = 6;
      const armHeight = 25;
      const armY = bodyY + 5;
      
      let armOffset = 0;
      if (this.currentAnimation === 'run') {
          armOffset = Math.cos(this.animationFrame * 0.5) * 5;
      }
      
      ctx.fillStyle = '#21618c';
      ctx.fillRect(this.position.x - armWidth, armY + armOffset, armWidth, armHeight);
      ctx.fillRect(this.position.x + this.width, armY - armOffset, armWidth, armHeight);
      
      // Контуры
      ctx.strokeStyle = '#1a5276';
      ctx.lineWidth = 2;
      ctx.strokeRect(this.position.x, this.position.y, this.width, this.height);
  }

  /**
   * Сброс состояния игрока
   * @param {number} x - новая позиция X
   * @param {number} y - новая позиция Y
   */
  reset(x, y) {
      this.position.x = x;
      this.position.y = y;
      this.velocity.zero();
      this.lives = Constants.PLAYER_MAX_HEALTH;
      this.isOnGround = false;
      this.isJumping = false;
      this.isInvincible = false;
      this.invincibilityTimer = 0;
      this.particles = [];
      this.updateBounds();
  }

  /**
   * Проверка, жив ли игрок
   * @returns {boolean}
   */
  isAlive() {
      return this.lives > 0;
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
}
