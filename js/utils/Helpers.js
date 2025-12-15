/**
 * Вспомогательные функции для игры
 */
class Helpers {
  /**
   * Генерация случайного числа в диапазоне
   * @param {number} min - минимальное значение
   * @param {number} max - максимальное значение
   * @returns {number}
   */
  static random(min, max) {
      return Math.random() * (max - min) + min;
  }

  /**
   * Генерация случайного целого числа в диапазоне
   * @param {number} min - минимальное значение
   * @param {number} max - максимальное значение
   * @returns {number}
   */
  static randomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Ограничение значения в диапазоне
   * @param {number} value - значение
   * @param {number} min - минимальное значение
   * @param {number} max - максимальное значение
   * @returns {number}
   */
  static clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
  }

  /**
   * Линейная интерполяция
   * @param {number} a - начальное значение
   * @param {number} b - конечное значение
   * @param {number} t - интерполяционный коэффициент (0-1)
   * @returns {number}
   */
  static lerp(a, b, t) {
      return a + (b - a) * t;
  }

  /**
   * Преобразование угла из градусов в радианы
   * @param {number} degrees - угол в градусах
   * @returns {number} угол в радианах
   */
  static degToRad(degrees) {
      return degrees * (Math.PI / 180);
  }

  /**
   * Преобразование угла из радиан в градусы
   * @param {number} radians - угол в радианах
   * @returns {number} угол в градусах
   */
  static radToDeg(radians) {
      return radians * (180 / Math.PI);
  }

  /**
   * Вычисление расстояния между двумя точками
   * @param {number} x1
   * @param {number} y1
   * @param {number} x2
   * @param {number} y2
   * @returns {number}
   */
  static distance(x1, y1, x2, y2) {
      const dx = x2 - x1;
      const dy = y2 - y1;
      return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Нормализация угла в диапазон 0-2π
   * @param {number} angle - угол в радианах
   * @returns {number} нормализованный угол
   */
  static normalizeAngle(angle) {
      while (angle < 0) angle += Math.PI * 2;
      while (angle >= Math.PI * 2) angle -= Math.PI * 2;
      return angle;
  }

  /**
   * Создание HSL цвета
   * @param {number} h - оттенок (0-360)
   * @param {number} s - насыщенность (0-100)
   * @param {number} l - светлота (0-100)
   * @returns {string} HSL строка
   */
  static hslColor(h, s, l) {
      return `hsl(${h}, ${s}%, ${l}%)`;
  }

  /**
   * Форматирование времени в MM:SS
   * @param {number} seconds - время в секундах
   * @returns {string} отформатированное время
   */
  static formatTime(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Форматирование числа с разделителями тысяч
   * @param {number} number
   * @returns {string}
   */
  static formatNumber(number) {
      return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  /**
   * Проверка на мобильное устройство
   * @returns {boolean}
   */
  static isMobile() {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  /**
   * Получение поддержки WebGL
   * @returns {boolean}
   */
  static hasWebGL() {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && 
                (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  }

  /**
   * Загрузка изображения
   * @param {string} src - путь к изображению
   * @returns {Promise<HTMLImageElement>}
   */
  static loadImage(src) {
      return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = src;
      });
  }

  /**
   * Загрузка JSON
   * @param {string} url - путь к JSON файлу
   * @returns {Promise<Object>}
   */
  static async loadJSON(url) {
      try {
          const response = await fetch(url);
          if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
          }
          return await response.json();
      } catch (error) {
          console.error('Error loading JSON:', error);
          return null;
      }
  }

  /**
   * Создание частиц
   * @param {number} x - позиция X
   * @param {number} y - позиция Y
   * @param {number} count - количество частиц
   * @param {string} color - цвет
   * @returns {Array} массив частиц
   */
  static createParticles(x, y, count, color) {
      const particles = [];
      for (let i = 0; i < count; i++) {
          particles.push({
              x: x,
              y: y,
              vx: Helpers.random(-5, 5),
              vy: Helpers.random(-5, 5),
              radius: Helpers.random(2, 6),
              color: color,
              life: 1.0,
              decay: Helpers.random(0.01, 0.03)
          });
      }
      return particles;
  }

  /**
   * Обновление частиц
   * @param {Array} particles - массив частиц
   * @param {number} deltaTime - время с прошлого кадра
   */
  static updateParticles(particles, deltaTime) {
      for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx * deltaTime;
          p.y += p.vy * deltaTime;
          p.life -= p.decay * deltaTime;
          
          if (p.life <= 0) {
              particles.splice(i, 1);
          }
      }
  }

  /**
   * Отрисовка частиц
   * @param {CanvasRenderingContext2D} ctx - контекст canvas
   * @param {Array} particles - массив частиц
   */
  static drawParticles(ctx, particles) {
      particles.forEach(p => {
          ctx.save();
          ctx.globalAlpha = p.life;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
      });
  }

  /**
   * Воспроизведение звука
   * @param {string} url - путь к звуковому файлу
   * @param {number} volume - громкость (0-1)
   * @returns {Promise<void>}
   */
  static async playSound(url, volume = 0.3) {
      try {
          const audio = new Audio(url);
          audio.volume = volume;
          await audio.play();
      } catch (error) {
          console.warn('Sound playback failed:', error);
      }
  }

  /**
   * Сохранение в LocalStorage
   * @param {string} key - ключ
   * @param {*} value - значение
   */
  static saveToStorage(key, value) {
      try {
          localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
          console.warn('Failed to save to localStorage:', error);
      }
  }

  /**
   * Загрузка из LocalStorage
   * @param {string} key - ключ
   * @param {*} defaultValue - значение по умолчанию
   * @returns {*}
   */
  static loadFromStorage(key, defaultValue = null) {
      try {
          const item = localStorage.getItem(key);
          return item ? JSON.parse(item) : defaultValue;
      } catch (error) {
          console.warn('Failed to load from localStorage:', error);
          return defaultValue;
      }
  }

  /**
   * Удаление из LocalStorage
   * @param {string} key - ключ
   */
  static removeFromStorage(key) {
      try {
          localStorage.removeItem(key);
      } catch (error) {
          console.warn('Failed to remove from localStorage:', error);
      }
  }

  /**
   * Дебаунс функция
   * @param {Function} func - функция для вызова
   * @param {number} wait - время ожидания в ms
   * @returns {Function}
   */
  static debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
          const later = () => {
              clearTimeout(timeout);
              func(...args);
          };
          clearTimeout(timeout);
          timeout = setTimeout(later, wait);
      };
  }

  /**
   * Троттлинг функция
   * @param {Function} func - функция для вызова
   * @param {number} limit - лимит времени в ms
   * @returns {Function}
   */
  static throttle(func, limit) {
      let inThrottle;
      return function executedFunction(...args) {
          if (!inThrottle) {
              func(...args);
              inThrottle = true;
              setTimeout(() => inThrottle = false, limit);
          }
      };
  }

  /**
   * Проверка пересечения прямоугольников (AABB)
   * @param {Object} rect1 - {x, y, width, height}
   * @param {Object} rect2 - {x, y, width, height}
   * @returns {boolean}
   */
  static rectIntersect(rect1, rect2) {
      return rect1.x < rect2.x + rect2.width &&
             rect1.x + rect1.width > rect2.x &&
             rect1.y < rect2.y + rect2.height &&
             rect1.y + rect1.height > rect2.y;
  }

  /**
   * Проверка пересечения круга и прямоугольника
   * @param {Object} circle - {x, y, radius}
   * @param {Object} rect - {x, y, width, height}
   * @returns {boolean}
   */
  static circleRectIntersect(circle, rect) {
      const closestX = Helpers.clamp(circle.x, rect.x, rect.x + rect.width);
      const closestY = Helpers.clamp(circle.y, rect.y, rect.y + rect.height);
      const distance = Helpers.distance(circle.x, circle.y, closestX, closestY);
      return distance <= circle.radius;
  }
}