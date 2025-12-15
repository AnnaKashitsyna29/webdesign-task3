/**
 * Обработчик пользовательского ввода
 */
class InputHandler {
  constructor() {
      // Состояние клавиш
      this.keys = {};
      
      // Коды клавиш
      this.keyMap = {
          // Движение
          'ArrowLeft': 'left',
          'ArrowRight': 'right',
          'ArrowUp': 'up',
          'ArrowDown': 'down',
          'KeyA': 'left',
          'KeyD': 'right',
          'KeyW': 'up',
          'KeyS': 'down',
          
          // Действия
          'Space': 'jump',
          'ShiftLeft': 'run',
          'ShiftRight': 'run',
          
          // Управление игрой
          'KeyP': 'pause',
          'Escape': 'menu',
          'KeyR': 'restart',
          'KeyM': 'mute',
          'KeyF': 'fullscreen',
          'KeyH': 'help',
          'KeyC': 'debug'
      };
      
      // Состояние мыши/тача
      this.mouse = {
          x: 0,
          y: 0,
          isDown: false,
          isPressed: false,
          isReleased: false
      };
      
      // Сенсорное управление
      this.touch = {
          startX: 0,
          startY: 0,
          currentX: 0,
          currentY: 0,
          isTouching: false,
          swipeThreshold: 30
      };
      
      // История ввода
      this.inputHistory = [];
      this.maxHistorySize = 100;
      
      // Инициализация
      this.initialize();
  }

  /**
   * Инициализация обработчика ввода
   */
  initialize() {
      this.setupKeyboardListeners();
      this.setupMouseListeners();
      this.setupTouchListeners();
      
      // Инициализация всех ключей
      for (const key in this.keyMap) {
          this.keys[this.keyMap[key]] = false;
      }
      
      // Дополнительные состояния
      this.keys.jumpPressed = false;
      this.keys.jumpReleased = false;
  }

  /**
   * Настройка обработчиков клавиатуры
   */
  setupKeyboardListeners() {
      // Обработка нажатия клавиш
      document.addEventListener('keydown', (event) => {
          const action = this.keyMap[event.code];
          if (action) {
              event.preventDefault();
              
              // Специальная обработка для прыжка
              if (action === 'jump') {
                  if (!this.keys.jump) {
                      this.keys.jumpPressed = true;
                  }
              }
              
              this.keys[action] = true;
              
              // Логирование для отладки
              this.logInput('keydown', event.code, action);
          }
      });

      // Обработка отпускания клавиш
      document.addEventListener('keyup', (event) => {
          const action = this.keyMap[event.code];
          if (action) {
              event.preventDefault();
              
              // Специальная обработка для прыжка
              if (action === 'jump') {
                  this.keys.jumpReleased = true;
              }
              
              this.keys[action] = false;
              
              // Логирование для отладки
              this.logInput('keyup', event.code, action);
          }
      });

      // Предотвращение стандартного поведения для некоторых клавиш
      document.addEventListener('keydown', (event) => {
          if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) {
              event.preventDefault();
          }
      });
  }

  /**
   * Настройка обработчиков мыши
   */
  setupMouseListeners() {
      const canvas = document.getElementById('gameCanvas');
      if (!canvas) return;

      // Движение мыши
      canvas.addEventListener('mousemove', (event) => {
          const rect = canvas.getBoundingClientRect();
          this.mouse.x = event.clientX - rect.left;
          this.mouse.y = event.clientY - rect.top;
      });

      // Нажатие мыши
      canvas.addEventListener('mousedown', (event) => {
          this.mouse.isDown = true;
          this.mouse.isPressed = true;
          event.preventDefault();
      });

      // Отпускание мыши
      canvas.addEventListener('mouseup', (event) => {
          this.mouse.isDown = false;
          this.mouse.isReleased = true;
          event.preventDefault();
      });

      // Выход за пределы canvas
      canvas.addEventListener('mouseleave', () => {
          this.mouse.isDown = false;
      });
  }

  /**
   * Настройка обработчиков сенсорного ввода
   */
  setupTouchListeners() {
      const canvas = document.getElementById('gameCanvas');
      if (!canvas) return;

      // Начало касания
      canvas.addEventListener('touchstart', (event) => {
          event.preventDefault();
          const touch = event.touches[0];
          const rect = canvas.getBoundingClientRect();
          
          this.touch.startX = touch.clientX - rect.left;
          this.touch.startY = touch.clientY - rect.top;
          this.touch.currentX = this.touch.startX;
          this.touch.currentY = this.touch.startY;
          this.touch.isTouching = true;
          
          // Симулируем нажатие мыши
          this.mouse.x = this.touch.currentX;
          this.mouse.y = this.touch.currentY;
          this.mouse.isDown = true;
          this.mouse.isPressed = true;
      });

      // Движение касания
      canvas.addEventListener('touchmove', (event) => {
          event.preventDefault();
          const touch = event.touches[0];
          const rect = canvas.getBoundingClientRect();
          
          this.touch.currentX = touch.clientX - rect.left;
          this.touch.currentY = touch.clientY - rect.top;
          
          // Обновление позиции мыши
          this.mouse.x = this.touch.currentX;
          this.mouse.y = this.touch.currentY;
          
          // Определение свайпа
          this.detectSwipe();
      });

      // Конец касания
      canvas.addEventListener('touchend', (event) => {
          event.preventDefault();
          this.touch.isTouching = false;
          
          // Симулируем отпускание мыши
          this.mouse.isDown = false;
          this.mouse.isReleased = true;
          
          // Сброс свайпа
          this.touch.startX = 0;
          this.touch.startY = 0;
      });
  }

  /**
   * Определение свайпа
   */
  detectSwipe() {
      if (!this.touch.isTouching) return;
      
      const dx = this.touch.currentX - this.touch.startX;
      const dy = this.touch.currentY - this.touch.startY;
      
      // Сброс предыдущих направлений
      this.keys.swipeLeft = false;
      this.keys.swipeRight = false;
      this.keys.swipeUp = false;
      this.keys.swipeDown = false;
      
      // Определение направления свайпа
      if (Math.abs(dx) > Math.abs(dy)) {
          // Горизонтальный свайп
          if (dx > this.touch.swipeThreshold) {
              this.keys.swipeRight = true;
              this.keys.right = true;
              this.keys.left = false;
          } else if (dx < -this.touch.swipeThreshold) {
              this.keys.swipeLeft = true;
              this.keys.left = true;
              this.keys.right = false;
          }
      } else {
          // Вертикальный свайп
          if (dy > this.touch.swipeThreshold) {
              this.keys.swipeDown = true;
              this.keys.down = true;
          } else if (dy < -this.touch.swipeThreshold) {
              this.keys.swipeUp = true;
              this.keys.up = true;
              this.keys.jump = true;
              this.keys.jumpPressed = true;
          }
      }
  }

  /**
   * Логирование ввода
   * @param {string} type - тип события
   * @param {string} code - код клавиши/события
   * @param {string} action - действие
   */
  logInput(type, code, action) {
      const entry = {
          timestamp: Date.now(),
          type: type,
          code: code,
          action: action
      };
      
      this.inputHistory.push(entry);
      
      // Ограничение размера истории
      if (this.inputHistory.length > this.maxHistorySize) {
          this.inputHistory.shift();
      }
  }

  /**
   * Обновление состояния ввода
   */
  update() {
      // Сброс одноразовых событий
      this.mouse.isPressed = false;
      this.mouse.isReleased = false;
      this.keys.jumpPressed = false;
      this.keys.jumpReleased = false;
      
      // Сброс свайпов
      this.keys.swipeLeft = false;
      this.keys.swipeRight = false;
      this.keys.swipeUp = false;
      this.keys.swipeDown = false;
  }

  /**
   * Получение горизонтального ввода
   * @returns {number} -1 (влево), 0 (нет), 1 (вправо)
   */
  getHorizontalInput() {
      if (this.keys.left || this.keys.swipeLeft) return -1;
      if (this.keys.right || this.keys.swipeRight) return 1;
      return 0;
  }

  /**
   * Получение вертикального ввода
   * @returns {number} -1 (вверх), 0 (нет), 1 (вниз)
   */
  getVerticalInput() {
      if (this.keys.up || this.keys.swipeUp) return -1;
      if (this.keys.down || this.keys.swipeDown) return 1;
      return 0;
  }

  /**
   * Проверка нажатия прыжка
   * @returns {boolean}
   */
  isJumpPressed() {
      return this.keys.jumpPressed || this.keys.swipeUp;
  }

  /**
   * Проверка удержания прыжка
   * @returns {boolean}
   */
  isJumpHeld() {
      return this.keys.jump || this.keys.up;
  }

  /**
   * Проверка отпускания прыжка
   * @returns {boolean}
   */
  isJumpReleased() {
      return this.keys.jumpReleased;
  }

  /**
   * Проверка нажатия паузы
   * @returns {boolean}
   */
  isPausePressed() {
      return this.keys.pause;
  }

  /**
   * Проверка нажатия меню
   * @returns {boolean}
   */
  isMenuPressed() {
      return this.keys.menu;
  }

  /**
   * Проверка нажатия рестарта
   * @returns {boolean}
   */
  isRestartPressed() {
      return this.keys.restart;
  }

  /**
   * Проверка нажатия бега
   * @returns {boolean}
   */
  isRunPressed() {
      return this.keys.run;
  }

  /**
   * Проверка нажатия отладки
   * @returns {boolean}
   */
  isDebugPressed() {
      return this.keys.debug;
  }

  /**
   * Получение состояния мыши
   * @returns {Object}
   */
  getMouseState() {
      return { ...this.mouse };
  }

  /**
   * Получение состояния касания
   * @returns {Object}
   */
  getTouchState() {
      return { ...this.touch };
  }

  /**
   * Получение общего состояния ввода
   * @returns {Object}
   */
  getInputState() {
      return {
          horizontal: this.getHorizontalInput(),
          vertical: this.getVerticalInput(),
          jump: this.isJumpPressed(),
          jumpHeld: this.isJumpHeld(),
          run: this.isRunPressed(),
          mouse: this.getMouseState(),
          touch: this.getTouchState()
      };
  }

  /**
   * Сброс всех состояний ввода
   */
  reset() {
      // Сброс всех клавиш
      for (const key in this.keys) {
          this.keys[key] = false;
      }
      
      // Сброс мыши
      this.mouse.isDown = false;
      this.mouse.isPressed = false;
      this.mouse.isReleased = false;
      
      // Сброс касания
      this.touch.isTouching = false;
      this.touch.startX = 0;
      this.touch.startY = 0;
      this.touch.currentX = 0;
      this.touch.currentY = 0;
      
      // Сброс истории
      this.inputHistory = [];
  }

  /**
   * Включение/выключение обработки ввода
   * @param {boolean} enabled - включена ли обработка
   */
  setEnabled(enabled) {
      if (enabled) {
          this.initialize();
      } else {
          // Отключение всех обработчиков
          // (В реальном проекте нужно сохранять ссылки на обработчики)
          this.reset();
      }
  }

  /**
   * Получение статистики ввода
   * @returns {Object}
   */
  getStats() {
      const keyPresses = {};
      const recentInputs = this.inputHistory.slice(-10);
      
      // Подсчет нажатий по действиям
      for (const entry of this.inputHistory) {
          if (entry.action) {
              keyPresses[entry.action] = (keyPresses[entry.action] || 0) + 1;
          }
      }
      
      return {
          totalInputs: this.inputHistory.length,
          keyPresses: keyPresses,
          recentInputs: recentInputs,
          currentState: this.getInputState()
      };
  }

  /**
   * Проверка поддержки сенсорного ввода
   * @returns {boolean}
   */
  isTouchSupported() {
      return 'ontouchstart' in window || 
             navigator.maxTouchPoints > 0 || 
             navigator.msMaxTouchPoints > 0;
  }

  /**
   * Настройка виртуального джойстика для мобильных устройств
   */
  setupVirtualJoystick() {
      if (!this.isTouchSupported() || !Helpers.isMobile()) return;
      
      const container = document.querySelector('.controls-panel');
      if (!container) return;
      
      // Показываем виртуальные кнопки
      container.style.display = 'flex';
      
      // Здесь можно добавить более сложную логику виртуального джойстика
      // Например, создание области для движения и отдельной кнопки для прыжка
  }
}