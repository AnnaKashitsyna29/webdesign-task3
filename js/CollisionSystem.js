/**
 * Система обнаружения и обработки коллизий
 */
class CollisionSystem {
  constructor() {
      // Режим отладки
      this.debug = false;
      this.collisionHistory = [];
      this.maxHistorySize = 100;
  }

  /**
   * Проверка коллизии между двумя прямоугольниками (AABB)
   * @param {Object} rect1 - первый прямоугольник {x, y, width, height}
   * @param {Object} rect2 - второй прямоугольник {x, y, width, height}
   * @returns {Object} информация о коллизии
   */
  checkCollision(rect1, rect2) {
      // Проверка пересечения по осям X и Y
      const collisionX = rect1.x < rect2.x + rect2.width &&
                        rect1.x + rect1.width > rect2.x;
      const collisionY = rect1.y < rect2.y + rect2.height &&
                        rect1.y + rect1.height > rect2.y;
      
      if (!collisionX || !collisionY) {
          return {
              collided: false,
              side: null,
              penetration: { x: 0, y: 0 }
          };
      }
      
      // Вычисление перекрытия по осям
      const overlapX = this.calculateOverlap(rect1.x, rect1.width, rect2.x, rect2.width);
      const overlapY = this.calculateOverlap(rect1.y, rect1.height, rect2.y, rect2.height);
      
      // Определение стороны коллизии (меньшее перекрытие определяет сторону)
      let side;
      if (Math.abs(overlapX) < Math.abs(overlapY)) {
          side = overlapX < 0 ? 'left' : 'right';
      } else {
          side = overlapY < 0 ? 'top' : 'bottom';
      }
      
      // Логирование для отладки
      if (this.debug) {
          this.logCollision(rect1, rect2, side, { x: overlapX, y: overlapY });
      }
      
      return {
          collided: true,
          side: side,
          penetration: { x: overlapX, y: overlapY },
          rect1: rect1,
          rect2: rect2
      };
  }

  /**
   * Вычисление перекрытия по одной оси
   * @param {number} pos1 - позиция первого объекта
   * @param {number} size1 - размер первого объекта
   * @param {number} pos2 - позиция второго объекта
   * @param {number} size2 - размер второго объекта
   * @returns {number} величина перекрытия (отрицательная = слева/сверху, положительная = справа/снизу)
   */
  calculateOverlap(pos1, size1, pos2, size2) {
      const center1 = pos1 + size1 / 2;
      const center2 = pos2 + size2 / 2;
      
      // Разность центров
      const diff = center2 - center1;
      
      // Минимальное расстояние без коллизии
      const minDistance = (size1 + size2) / 2;
      
      // Если объекты пересекаются, возвращаем величину перекрытия
      if (Math.abs(diff) < minDistance) {
          return diff > 0 ? minDistance - diff : -minDistance - diff;
      }
      
      return 0;
  }

  /**
   * Проверка коллизии между кругом и прямоугольником
   * @param {Object} circle - круг {x, y, radius}
   * @param {Object} rect - прямоугольник {x, y, width, height}
   * @returns {Object} информация о коллизии
   */
  checkCircleRectCollision(circle, rect) {
      // Находим ближайшую точку на прямоугольнике к центру круга
      const closestX = Helpers.clamp(circle.x, rect.x, rect.x + rect.width);
      const closestY = Helpers.clamp(circle.y, rect.y, rect.y + rect.height);
      
      // Вычисляем расстояние от центра круга до ближайшей точки
      const distanceX = circle.x - closestX;
      const distanceY = circle.y - closestY;
      const distanceSquared = distanceX * distanceX + distanceY * distanceY;
      
      // Проверяем пересечение
      if (distanceSquared > circle.radius * circle.radius) {
          return {
              collided: false,
              side: null,
              penetration: 0
          };
      }
      
      // Вычисляем сторону коллизии
      let side;
      const distance = Math.sqrt(distanceSquared);
      const penetration = circle.radius - distance;
      
      // Определяем сторону по ближайшей точке
      if (closestX === rect.x) side = 'left';
      else if (closestX === rect.x + rect.width) side = 'right';
      else if (closestY === rect.y) side = 'top';
      else if (closestY === rect.y + rect.height) side = 'bottom';
      else side = 'inside'; // Круг внутри прямоугольника
      
      return {
          collided: true,
          side: side,
          penetration: penetration,
          distance: distance,
          closestPoint: { x: closestX, y: closestY }
      };
  }

  /**
   * Проверка коллизии между двумя кругами
   * @param {Object} circle1 - первый круг {x, y, radius}
   * @param {Object} circle2 - второй круг {x, y, radius}
   * @returns {Object} информация о коллизии
   */
  checkCircleCircleCollision(circle1, circle2) {
      const dx = circle2.x - circle1.x;
      const dy = circle2.y - circle1.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const radiusSum = circle1.radius + circle2.radius;
      
      if (distance > radiusSum) {
          return {
              collided: false,
              penetration: 0,
              normal: { x: 0, y: 0 }
          };
      }
      
      // Вычисляем нормаль коллизии
      const normal = distance > 0 
          ? { x: dx / distance, y: dy / distance }
          : { x: 1, y: 0 }; // Если круги в одной точке
      
      return {
          collided: true,
          penetration: radiusSum - distance,
          normal: normal,
          distance: distance
      };
  }

  /**
   * Проверка точки внутри прямоугольника
   * @param {number} x - координата X точки
   * @param {number} y - координата Y точки
   * @param {Object} rect - прямоугольник {x, y, width, height}
   * @returns {boolean}
   */
  isPointInRect(x, y, rect) {
      return x >= rect.x && 
             x <= rect.x + rect.width && 
             y >= rect.y && 
             y <= rect.y + rect.height;
  }

  /**
   * Проверка точки внутри круга
   * @param {number} x - координата X точки
   * @param {number} y - координата Y точки
   * @param {Object} circle - круг {x, y, radius}
   * @returns {boolean}
   */
  isPointInCircle(x, y, circle) {
      const dx = x - circle.x;
      const dy = y - circle.y;
      return dx * dx + dy * dy <= circle.radius * circle.radius;
  }

  /**
   * Проверка видимости между двумя точками (raycasting)
   * @param {number} x1 - начальная X
   * @param {number} y1 - начальная Y
   * @param {number} x2 - конечная X
   * @param {number} y2 - конечная Y
   * @param {Array} obstacles - массив препятствий
   * @returns {boolean} true если видно
   */
  checkLineOfSight(x1, y1, x2, y2, obstacles) {
      // Простая проверка - если нет препятствий, всегда видно
      if (obstacles.length === 0) return true;
      
      // Создаем луч
      const dx = x2 - x1;
      const dy = y2 - y1;
      const length = Math.sqrt(dx * dx + dy * dy);
      
      if (length === 0) return true;
      
      const stepX = dx / length;
      const stepY = dy / length;
      
      // Проверяем точки вдоль луча
      const steps = Math.ceil(length);
      for (let i = 0; i < steps; i++) {
          const checkX = x1 + stepX * i;
          const checkY = y1 + stepY * i;
          
          // Проверяем коллизию с каждым препятствием
          for (const obstacle of obstacles) {
              if (this.isPointInRect(checkX, checkY, obstacle)) {
                  return false;
              }
          }
      }
      
      return true;
  }

  /**
   * Разрешение коллизии между объектами
   * @param {Object} obj1 - первый объект
   * @param {Object} obj2 - второй объект
   * @param {Object} collisionInfo - информация о коллизии
   */
  resolveCollision(obj1, obj2, collisionInfo) {
      if (!collisionInfo.collided) return;
      
      // Разное разрешение в зависимости от типа объектов
      if (collisionInfo.side) {
          // Для прямоугольников
          this.resolveRectCollision(obj1, obj2, collisionInfo);
      } else if (collisionInfo.normal) {
          // Для кругов
          this.resolveCircleCollision(obj1, obj2, collisionInfo);
      }
  }

  /**
   * Разрешение коллизии прямоугольников
   * @param {Object} obj1 - первый объект
   * @param {Object} obj2 - второй объект
   * @param {Object} collisionInfo - информация о коллизии
   */
  resolveRectCollision(obj1, obj2, collisionInfo) {
      const { side, penetration } = collisionInfo;
      
      // Смещаем объект1 в зависимости от стороны коллизии
      switch (side) {
          case 'left':
              obj1.x -= penetration.x;
              if (obj1.velocity) obj1.velocity.x = 0;
              break;
          case 'right':
              obj1.x += penetration.x;
              if (obj1.velocity) obj1.velocity.x = 0;
              break;
          case 'top':
              obj1.y -= penetration.y;
              if (obj1.velocity) obj1.velocity.y = 0;
              break;
          case 'bottom':
              obj1.y += penetration.y;
              if (obj1.velocity) obj1.velocity.y = 0;
              break;
      }
  }

  /**
   * Разрешение коллизии кругов
   * @param {Object} obj1 - первый объект
   * @param {Object} obj2 - второй объект
   * @param {Object} collisionInfo - информация о коллизии
   */
  resolveCircleCollision(obj1, obj2, collisionInfo) {
      const { penetration, normal } = collisionInfo;
      
      // Смещаем оба объекта в противоположных направлениях
      const move1 = penetration / 2;
      const move2 = penetration / 2;
      
      obj1.x -= normal.x * move1;
      obj1.y -= normal.y * move1;
      obj2.x += normal.x * move2;
      obj2.y += normal.y * move2;
      
      // Обмен импульсами (простая физика)
      if (obj1.velocity && obj2.velocity) {
          const relativeVelocity = {
              x: obj2.velocity.x - obj1.velocity.x,
              y: obj2.velocity.y - obj1.velocity.y
          };
          
          const velocityAlongNormal = relativeVelocity.x * normal.x + relativeVelocity.y * normal.y;
          
          // Если объекты удаляются друг от друга, не применяем импульс
          if (velocityAlongNormal > 0) return;
          
          // Коэффициент восстановления
          const restitution = 0.8;
          const impulse = -(1 + restitution) * velocityAlongNormal;
          
          // Применяем импульс
          const impulseScalar = impulse / 2; // Делим между двумя объектами
          
          obj1.velocity.x -= normal.x * impulseScalar;
          obj1.velocity.y -= normal.y * impulseScalar;
          obj2.velocity.x += normal.x * impulseScalar;
          obj2.velocity.y += normal.y * impulseScalar;
      }
  }

  /**
   * Логирование коллизии для отладки
   * @param {Object} rect1 - первый прямоугольник
   * @param {Object} rect2 - второй прямоугольник
   * @param {string} side - сторона коллизии
   * @param {Object} penetration - проникновение
   */
  logCollision(rect1, rect2, side, penetration) {
      const collision = {
          timestamp: Date.now(),
          rect1: { ...rect1 },
          rect2: { ...rect2 },
          side: side,
          penetration: { ...penetration }
      };
      
      this.collisionHistory.push(collision);
      
      // Ограничиваем размер истории
      if (this.collisionHistory.length > this.maxHistorySize) {
          this.collisionHistory.shift();
      }
  }

  /**
   * Отрисовка отладочной информации
   * @param {CanvasRenderingContext2D} ctx - контекст canvas
   */
  drawDebug(ctx) {
      if (!this.debug) return;
      
      // Отрисовка истории коллизий
      const now = Date.now();
      for (let i = this.collisionHistory.length - 1; i >= 0; i--) {
          const collision = this.collisionHistory[i];
          
          // Удаление старых записей
          if (now - collision.timestamp > 2000) {
              this.collisionHistory.splice(i, 1);
              continue;
          }
          
          // Прозрачность по времени
          const alpha = 1 - ((now - collision.timestamp) / 2000);
          
          // Отрисовка прямоугольников коллизии
          ctx.save();
          ctx.globalAlpha = alpha * 0.3;
          
          // Цвет в зависимости от стороны
          let color;
          switch (collision.side) {
              case 'top': color = '#2ecc71'; break;
              case 'bottom': color = '#e74c3c'; break;
              case 'left': color = '#3498db'; break;
              case 'right': color = '#f39c12'; break;
          }
          
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          
          // Отрисовка первого прямоугольника
          ctx.strokeRect(
              collision.rect1.x,
              collision.rect1.y,
              collision.rect1.width,
              collision.rect1.height
          );
          
          // Отрисовка второго прямоугольника
          ctx.strokeRect(
              collision.rect2.x,
              collision.rect2.y,
              collision.rect2.width,
              collision.rect2.height
          );
          
          // Отрисовка линии между центрами
          const center1 = {
              x: collision.rect1.x + collision.rect1.width / 2,
              y: collision.rect1.y + collision.rect1.height / 2
          };
          const center2 = {
              x: collision.rect2.x + collision.rect2.width / 2,
              y: collision.rect2.y + collision.rect2.height / 2
          };
          
          ctx.beginPath();
          ctx.moveTo(center1.x, center1.y);
          ctx.lineTo(center2.x, center2.y);
          ctx.stroke();
          
          ctx.restore();
      }
      
      // Отрисовка сетки для отладки позиционирования
      ctx.save();
      ctx.globalAlpha = 0.1;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      
      const gridSize = 50;
      const canvasWidth = ctx.canvas.width;
      const canvasHeight = ctx.canvas.height;
      
      // Вертикальные линии
      for (let x = 0; x <= canvasWidth; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvasHeight);
          ctx.stroke();
      }
      
      // Горизонтальные линии
      for (let y = 0; y <= canvasHeight; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvasWidth, y);
          ctx.stroke();
      }
      
      ctx.restore();
  }

  /**
   * Включение/выключение режима отладки
   * @param {boolean} enabled - включен ли режим отладки
   */
  setDebug(enabled) {
      this.debug = enabled;
      if (!enabled) {
          this.collisionHistory = [];
      }
  }

  /**
   * Получение статистики коллизий
   * @returns {Object}
   */
  getStats() {
      const sideCount = { top: 0, bottom: 0, left: 0, right: 0 };
      
      for (const collision of this.collisionHistory) {
          if (collision.side && sideCount[collision.side] !== undefined) {
              sideCount[collision.side]++;
          }
      }
      
      return {
          totalCollisions: this.collisionHistory.length,
          sideDistribution: sideCount,
          recentCollisions: this.collisionHistory.slice(-10)
      };
  }
}