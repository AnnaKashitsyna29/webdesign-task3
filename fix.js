/**
 * Быстрые исправления для игры
 */

// Исправление бесконечного респавна
function fixRespawnBug() {
  if (!window.game) return;
  
  console.log('Применяем исправление респавна...');
  
  // Переопределяем проверку падения
  const originalUpdatePlaying = window.game.updatePlaying;
  window.game.updatePlaying = function(deltaTime) {
      // Вызываем оригинальный метод
      originalUpdatePlaying.call(this, deltaTime);
      
      // Дополнительная проверка для отладки
      if (this.player && this.levelManager?.currentLevel) {
          const level = this.levelManager.currentLevel;
          const playerY = this.player.position.y;
          const levelBottom = level.height;
          
          // Логируем только если игрок близко к низу
          if (playerY > levelBottom - 50) {
              console.log(`Игрок близко к низу: Y=${Math.round(playerY)}, Уровень=${levelBottom}`);
          }
          
          // Защита от слишком частого респавна
          if (this.lastRespawnTime && Date.now() - this.lastRespawnTime < 1000) {
              console.warn('Слишком частый респавн! Блокируем...');
              // Поднимаем игрока выше
              this.player.position.y = level.startPosition.y;
              this.player.velocity.y = 0;
          }
      }
  };
  
  // Добавляем таймер респавна
  window.game.lastRespawnTime = 0;
  
  console.log('Исправление применено');
}

// Исправление размера уровней
function fixLevelSizes() {
  console.log('Проверяем размеры уровней...');
  
  if (window.game?.levelManager?.levels) {
      window.game.levelManager.levels.forEach(level => {
          console.log(`Уровень ${level.id}: ${level.width}x${level.height}`);
          
          // Если уровень слишком большой, уменьшаем
          if (level.width > 1500 || level.height > 1000) {
              console.log(`Уровень ${level.id} слишком большой, уменьшаем...`);
              level.width = 1024;
              level.height = 576;
              
              // Также корректируем позиции объектов
              const scaleX = 1024 / level.width;
              const scaleY = 576 / level.height;
              
              // Масштабируем платформы
              if (level.platforms) {
                  level.platforms.forEach(platform => {
                      platform.x *= scaleX;
                      platform.y *= scaleY;
                      platform.width *= scaleX;
                  });
              }
              
              // Масштабируем монеты
              if (level.coins) {
                  level.coins.forEach(coin => {
                      coin.x *= scaleX;
                      coin.y *= scaleY;
                  });
              }
              
              // Масштабируем стартовую позицию
              if (level.startPosition) {
                  level.startPosition.x *= scaleX;
                  level.startPosition.y *= scaleY;
              }
              
              // Масштабируем конечную позицию
              if (level.endPosition) {
                  level.endPosition.x *= scaleX;
                  level.endPosition.y *= scaleY;
              }
              
              console.log(`Уровень ${level.id} уменьшен до 1024x576`);
          }
      });
  }
}

// Проверка гравитации
function checkPhysics() {
  console.log('Проверяем физику...');
  
  if (window.game?.physicsEngine) {
      console.log('Гравитация:', window.game.physicsEngine.gravity);
      console.log('Сопротивление воздуха:', window.game.physicsEngine.airResistance);
      console.log('Трение:', window.game.physicsEngine.groundFriction);
  }
  
  if (window.game?.player) {
      console.log('Скорость игрока:', window.game.player.velocity);
      console.log('На земле:', window.game.player.isOnGround);
  }
}

// Включить все исправления
function applyAllFixes() {
  console.log('=== ПРИМЕНЕНИЕ ВСЕХ ИСПРАВЛЕНИЙ ===');
  
  fixRespawnBug();
  fixLevelSizes();
  checkPhysics();
  
  // Добавляем кнопку для ручного исправления
  const fixButton = document.createElement('button');
  fixButton.textContent = 'Исправить игру';
  fixButton.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 10px 20px;
      background: #e74c3c;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      z-index: 9999;
  `;
  fixButton.onclick = function() {
      console.log('Ручное исправление...');
      if (window.game?.restart) {
          window.game.restart();
      }
  };
  document.body.appendChild(fixButton);
  
  console.log('Все исправления применены');
}

// Автоматически применяем при загрузке
window.addEventListener('load', () => {
  setTimeout(() => {
      if (window.game) {
          applyAllFixes();
      }
  }, 2000);
});

// Экспорт функций
window.fixGame = {
  fixRespawnBug,
  fixLevelSizes,
  checkPhysics,
  applyAllFixes
};