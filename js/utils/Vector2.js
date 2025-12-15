/**
 * Класс для работы с 2D векторами
 */
class Vector2 {
  /**
   * @param {number} x - X координата
   * @param {number} y - Y координата
   */
  constructor(x = 0, y = 0) {
      this.x = x;
      this.y = y;
  }

  /**
   * Создает копию вектора
   * @returns {Vector2}
   */
  clone() {
      return new Vector2(this.x, this.y);
  }

  /**
   * Добавляет вектор
   * @param {Vector2} vector
   * @returns {Vector2}
   */
  add(vector) {
      this.x += vector.x;
      this.y += vector.y;
      return this;
  }

  /**
   * Вычитает вектор
   * @param {Vector2} vector
   * @returns {Vector2}
   */
  subtract(vector) {
      this.x -= vector.x;
      this.y -= vector.y;
      return this;
  }

  /**
   * Умножает на скаляр
   * @param {number} scalar
   * @returns {Vector2}
   */
  multiply(scalar) {
      this.x *= scalar;
      this.y *= scalar;
      return this;
  }

  /**
   * Делит на скаляр
   * @param {number} scalar
   * @returns {Vector2}
   */
  divide(scalar) {
      if (scalar !== 0) {
          this.x /= scalar;
          this.y /= scalar;
      }
      return this;
  }

  /**
   * Нормализует вектор
   * @returns {Vector2}
   */
  normalize() {
      const length = this.length();
      if (length > 0) {
          this.divide(length);
      }
      return this;
  }

  /**
   * Вычисляет длину вектора
   * @returns {number}
   */
  length() {
      return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  /**
   * Вычисляет квадрат длины вектора (более быстрая операция)
   * @returns {number}
   */
  lengthSquared() {
      return this.x * this.x + this.y * this.y;
  }

  /**
   * Ограничивает длину вектора
   * @param {number} maxLength
   * @returns {Vector2}
   */
  limit(maxLength) {
      const length = this.length();
      if (length > maxLength) {
          this.normalize();
          this.multiply(maxLength);
      }
      return this;
  }

  /**
   * Устанавливает длину вектора
   * @param {number} length
   * @returns {Vector2}
   */
  setLength(length) {
      this.normalize();
      this.multiply(length);
      return this;
  }

  /**
   * Вычисляет расстояние до другого вектора
   * @param {Vector2} vector
   * @returns {number}
   */
  distanceTo(vector) {
      const dx = this.x - vector.x;
      const dy = this.y - vector.y;
      return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Вычисляет скалярное произведение
   * @param {Vector2} vector
   * @returns {number}
   */
  dot(vector) {
      return this.x * vector.x + this.y * vector.y;
  }

  /**
   * Обнуляет вектор
   * @returns {Vector2}
   */
  zero() {
      this.x = 0;
      this.y = 0;
      return this;
  }

  /**
   * Проверяет равенство с другим вектором
   * @param {Vector2} vector
   * @returns {boolean}
   */
  equals(vector) {
      return this.x === vector.x && this.y === vector.y;
  }

  /**
   * Возвращает вектор как объект
   * @returns {Object}
   */
  toObject() {
      return { x: this.x, y: this.y };
  }

  /**
   * Возвращает строковое представление
   * @returns {string}
   */
  toString() {
      return `Vector2(${this.x}, ${this.y})`;
  }

  /**
   * Статический метод: создает вектор из угла
   * @param {number} angle - угол в радианах
   * @param {number} length - длина вектора
   * @returns {Vector2}
   */
  static fromAngle(angle, length = 1) {
      return new Vector2(
          Math.cos(angle) * length,
          Math.sin(angle) * length
      );
  }

  /**
   * Статический метод: вычисляет расстояние между двумя точками
   * @param {Vector2} v1
   * @param {Vector2} v2
   * @returns {number}
   */
  static distance(v1, v2) {
      return v1.distanceTo(v2);
  }

  /**
   * Статический метод: складывает два вектора
   * @param {Vector2} v1
   * @param {Vector2} v2
   * @returns {Vector2}
   */
  static add(v1, v2) {
      return new Vector2(v1.x + v2.x, v1.y + v2.y);
  }

  /**
   * Статический метод: вычитает два вектора
   * @param {Vector2} v1
   * @param {Vector2} v2
   * @returns {Vector2}
   */
  static subtract(v1, v2) {
      return new Vector2(v1.x - v2.x, v1.y - v2.y);
  }

  /**
   * Статический метод: умножает вектор на скаляр
   * @param {Vector2} vector
   * @param {number} scalar
   * @returns {Vector2}
   */
  static multiply(vector, scalar) {
      return new Vector2(vector.x * scalar, vector.y * scalar);
  }
}