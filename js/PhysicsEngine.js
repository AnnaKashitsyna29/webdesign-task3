/**
 * Физический движок игры
 */
class PhysicsEngine {
  constructor() {
      this.gravity = Constants.GRAVITY;
      this.airResistance = Constants.AIR_FRICTION;
      this.groundFriction = Constants.FRICTION;
      this.maxFallSpeed = Constants.MAX_FALL_SPEED;
      
      // Отладка
      this.debug = false;
      this.collisionPoints = [];
  }

  /**
   * Обновление физики объекта
   * @param {Object} entity - игровая сущность
   * @param {number} deltaTime - время с прошлого кадра
   */
  updateEntity(entity, deltaTime) {
      // Применение гравитации
      if (!entity.isOnGround) {
          entity.velocity.y += this.gravity * deltaTime;
          
          // Ограничение скорости падения
          if (entity.velocity.y > this.maxFallSpeed) {
              entity.velocity.y = this.maxFallSpeed;
          }
      }
      
      // Применение сопротивления воздуха
      entity.velocity.x *= Math.pow(this.airResistance, deltaTime);
      
      // Применение трения на земле
      if (entity.isOnGround) {
          entity.velocity.x *= Math.pow(this.groundFriction, deltaTime);
          
          // Остановка при очень малой скорости
          if (Math.abs(entity.velocity.x) < 0.1) {
              entity.velocity.x = 0;
          }
      }
      
      // Обновление позиции
      entity.position.x += entity.velocity.x * deltaTime;
      entity.position.y += entity.velocity.y * deltaTime;
  }

  /**
   * Обработка коллизий между объектами
   * @param {Player} player - игрок
   * @param {Array} platforms - массив платформ
   * @param {CollisionSystem} collisionSystem - система коллизий
   */
  handleCollisions(player, platforms, collisionSystem) {
      let playerWasOnGround = player.isOnGround;
      player.isOnGround = false;
      
      // Проверка коллизий с каждой платформой
      for (const platform of platforms) {
          // Пропускаем разрушенные платформы
          if (platform.width === 0 || platform.height === 0) continue;
          
          const collision = collisionSystem.checkCollision(
              player.getCollisionRect(),
              platform.getCollisionRect()
          );
          
          if (collision.collided) {
              this.resolveCollision(player, platform, collision.side);
              
              // Специальные эффекты платформ
              this.handlePlatformEffects(player, platform, collision.side);
          }
      }
      
      // Эффект приземления
      if (!playerWasOnGround && player.isOnGround) {
          this.handleLanding(player);
      }
  }

  /**
   * Разрешение коллизии
   * @param {Player} player - игрок
   * @param {Platform} platform - платформа
   * @param {string} side - сторона коллизии
   */
  resolveCollision(player, platform, side) {
      switch (side) {
          case 'top':
              // Игрок приземлился на платформу
              player.position.y = platform.position.y - player.height;
              player.velocity.y = 0;
              player.isOnGround = true;
              player.isJumping = false;
              break;
              
          case 'bottom':
              // Игрок ударился головой
              player.position.y = platform.position.y + platform.height;
              player.velocity.y = 0;
              break;
              
          case 'left':
              // Игрок ударился слева
              player.position.x = platform.position.x - player.width;
              player.velocity.x = 0;
              break;
              
          case 'right':
              // Игрок ударился справа
              player.position.x = platform.position.x + platform.width;
              player.velocity.x = 0;
              break;
      }
      
      // Сохранение точки коллизии для отладки
      if (this.debug) {
          this.collisionPoints.push({
              x: player.position.x + player.width / 2,
              y: player.position.y + player.height / 2,
              side: side,
              timestamp: Date.now()
          });
          
          // Ограничение количества точек
          if (this.collisionPoints.length > 50) {
              this.collisionPoints.shift();
          }
      }
  }

  /**
   * Обработка эффектов платформ
   * @param {Player} player - игрок
   * @param {Platform} platform - платформа
   * @param {string} side - сторона коллизии
   */
  handlePlatformEffects(player, platform, side) {
      if (side === 'top') {
          // Эффект прыжковой платформы
          if (platform.isJumpBoost) {
              player.velocity.y = platform.jumpBoostForce;
              player.isOnGround = false;
              player.isJumping = true;
              
              // Создание эффекта прыжка
              this.createJumpEffect(player, platform);
          }
          
          // Запуск разрушения ломающейся платформы
          if (platform.isBreakable) {
              platform.startBreaking();
          }
      }
  }

  /**
   * Обработка приземления
   * @param {Player} player - игрок
   */
  handleLanding(player) {
      // Создание эффекта приземления
      this.createLandingEffect(player);
      
      // Сброс комбо при слишком долгом прыжке
      if (player.velocity.y > 10) {
          // Большое падение сбрасывает комбо
          player.game.scoreManager.resetCombo();
      }
  }

  /**
   * Создание эффекта прыжка
   * @param {Player} player - игрок
   * @param {Platform} platform - платформа
   */
  createJumpEffect(player, platform) {
      // Создание частиц
      const particleCount = 8;
      const centerX = player.position.x + player.width / 2;
      const centerY = player.position.y + player.height;
      
      for (let i = 0; i < particleCount; i++) {
          player.particles.push({
              x: centerX,
              y: centerY,
              vx: Helpers.random(-3, 3),
              vy: Helpers.random(-6, -2),
              radius: Helpers.random(2, 4),
              color: platform.color,
              life: 1.0,
              decay: Helpers.random(0.02, 0.05)
          });
      }
  }

  /**
   * Создание эффекта приземления
   * @param {Player} player - игрок
   */
  createLandingEffect(player) {
      // Создание частиц
      const particleCount = 6;
      const centerX = player.position.x + player.width / 2;
      const centerY = player.position.y + player.height;
      
      for (let i = 0; i < particleCount; i++) {
          player.particles.push({
              x: centerX + Helpers.random(-10, 10),
              y: centerY,
              vx: Helpers.random(-2, 2),
              vy: Helpers.random(-1, 1),
              radius: Helpers.random(2, 3),
              color: '#95a5a6',
              life: 0.8,
              decay: Helpers.random(0.03, 0.06)
          });
      }
  }

  /**
   * Проверка нахождения на земле
   * @param {Player} player - игрок
   * @param {Array} platforms - массив платформ
   * @param {CollisionSystem} collisionSystem - система коллизий
   * @returns {boolean}
   */
  checkGround(player, platforms, collisionSystem) {
      // Создание области под ногами игрока
      const feetCheck = {
          x: player.position.x,
          y: player.position.y + player.height,
          width: player.width,
          height: 2
      };
      
      // Проверка коллизии с платформами
      for (const platform of platforms) {
          if (platform.width === 0 || platform.height === 0) continue;
          
          if (collisionSystem.checkCollision(feetCheck, platform.getCollisionRect())) {
              return true;
          }
      }
      
      return false;
  }

  /**
   * Применение силы к объекту
   * @param {Object} entity - сущность
   * @param {Vector2} force - вектор силы
   * @param {number} deltaTime - время с прошлого кадра
   */
  applyForce(entity, force, deltaTime) {
      entity.velocity.x += force.x * deltaTime;
      entity.velocity.y += force.y * deltaTime;
  }

  /**
   * Применение импульса к объекту
   * @param {Object} entity - сущность
   * @param {Vector2} impulse - вектор импульса
   */
  applyImpulse(entity, impulse) {
      entity.velocity.x += impulse.x;
      entity.velocity.y += impulse.y;
  }

  /**
   * Ограничение скорости объекта
   * @param {Object} entity - сущность
   * @param {number} maxSpeed - максимальная скорость
   */
  limitSpeed(entity, maxSpeed) {
      const speed = entity.velocity.length();
      if (speed > maxSpeed) {
          entity.velocity.multiply(maxSpeed / speed);
      }
  }

  /**
   * Отрисовка отладочной информации
   * @param {CanvasRenderingContext2D} ctx - контекст canvas
   */
  drawDebug(ctx) {
      if (!this.debug) return;
      
      // Отрисовка точек коллизий
      const now = Date.now();
      for (let i = this.collisionPoints.length - 1; i >= 0; i--) {
          const point = this.collisionPoints[i];
          
          // Удаление старых точек
          if (now - point.timestamp > 1000) {
              this.collisionPoints.splice(i, 1);
              continue;
          }
          
          // Прозрачность по времени
          const alpha = 1 - ((now - point.timestamp) / 1000);
          
          // Цвет в зависимости от стороны
          let color;
          switch (point.side) {
              case 'top': color = '#2ecc71'; break; // Зеленый
              case 'bottom': color = '#e74c3c'; break; // Красный
              case 'left': color = '#3498db'; break; // Синий
              case 'right': color = '#f39c12'; break; // Оранжевый
          }
          
          // Отрисовка точки
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
      }
      
      // Отрисовка векторов скорости
      ctx.save();
      ctx.strokeStyle = '#f1c40f';
      ctx.lineWidth = 2;
      
      // Здесь можно добавить отрисовку векторов для всех объектов
      // Например, для игрока:
      // const player = game.player;
      // ctx.beginPath();
      // ctx.moveTo(player.position.x + player.width/2, player.position.y + player.height/2);
      // ctx.lineTo(
      //     player.position.x + player.width/2 + player.velocity.x * 10,
      //     player.position.y + player.height/2 + player.velocity.y * 10
      // );
      // ctx.stroke();
      
      ctx.restore();
  }

  /**
   * Включение/выключение режима отладки
   * @param {boolean} enabled - включен ли режим отладки
   */
  setDebug(enabled) {
      this.debug = enabled;
      if (!enabled) {
          this.collisionPoints = [];
      }
  }

  /**
   * Проверка выхода за границы
   * @param {Object} entity - сущность
   * @param {number} worldWidth - ширина мира
   * @param {number} worldHeight - высота мира
   * @returns {Object} информация о выходе за границы
   */
  checkBoundaries(entity, worldWidth, worldHeight) {
      const result = {
          left: false,
          right: false,
          top: false,
          bottom: false,
          outOfBounds: false
      };
      
      // Проверка левой границы
      if (entity.position.x < 0) {
          entity.position.x = 0;
          entity.velocity.x = 0;
          result.left = true;
      }
      
      // Проверка правой границы
      if (entity.position.x + entity.width > worldWidth) {
          entity.position.x = worldWidth - entity.width;
          entity.velocity.x = 0;
          result.right = true;
      }
      
      // Проверка верхней границы
      if (entity.position.y < 0) {
          entity.position.y = 0;
          entity.velocity.y = 0;
          result.top = true;
      }
      
      // Проверка нижней границы (падение)
      if (entity.position.y > worldHeight) {
          result.bottom = true;
          result.outOfBounds = true;
      }
      
      return result;
  }

  /**
   * Расчет траектории прыжка
   * @param {number} jumpForce - сила прыжка
   * @param {number} gravity - гравитация
   * @param {number} initialY - начальная высота
   * @returns {Object} информация о прыжке
   */
  calculateJumpTrajectory(jumpForce, gravity, initialY = 0) {
      // Время до достижения максимальной высоты
      const timeToPeak = -jumpForce / gravity;
      
      // Максимальная высота
      const peakHeight = initialY + jumpForce * timeToPeak + 0.5 * gravity * timeToPeak * timeToPeak;
      
      // Общее время прыжка
      const totalTime = timeToPeak * 2;
      
      return {
          timeToPeak,
          peakHeight,
          totalTime,
          maxHeight: Math.abs(peakHeight - initialY)
      };
  }
}