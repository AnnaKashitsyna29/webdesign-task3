/**
 * Основная точка входа игры
 */
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Pixel Jumper начал загрузку...');
  
  // Создание экземпляра игры
  window.game = new Game();
  
  // Добавление информации о разработке с AI
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                    Pixel Jumper v1.0                       ║
║                  Разработано с помощью AI                  ║
║                    (Cursor/DeepSeek)                       ║
║                                                            ║
║  Использованные AI-модули:                                 ║
║  • Физический движок (PhysicsEngine.js)                    ║
║  • Система коллизий (CollisionSystem.js)                   ║
║  • Игровой цикл (GameLoop.js)                              ║
║  • Менеджер уровней (LevelManager.js)                      ║
║  • UI менеджер (UIManager.js)                              ║
║  • Анимация и частицы                                      ║
║                                                            ║
║  Время разработки с AI: ~2-3 часа                          ║
║  Дата: ${new Date().toLocaleDateString()}                          ║
╚════════════════════════════════════════════════════════════╝
  `);
  
  try {
      // Ожидание полной загрузки страницы
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Инициализация игры
      await game.initialize();
      
      // Добавление глобальных хоткеев для отладки
      setupGlobalHotkeys();
      
      console.log('Pixel Jumper успешно загружен!');
      console.log('Управление: ← → или A/D - движение, Space/W - прыжок, P - пауза, R - рестарт');
      
      // Отображение приветственного сообщения
      showWelcomeMessage();
      
  } catch (error) {
      console.error('Ошибка при запуске игры:', error);
      game.showError('Не удалось запустить игру. Пожалуйста, проверьте консоль для подробностей.');
  }
});

/**
* Настройка глобальных горячих клавиш
*/
function setupGlobalHotkeys() {
  document.addEventListener('keydown', (event) => {
      // F1 - помощь
      if (event.key === 'F1') {
          event.preventDefault();
          showHelp();
      }
      
      // F2 - статистика
      if (event.key === 'F2') {
          event.preventDefault();
          showStats();
      }
      
      // F3 - переключение отладки
      if (event.key === 'F3') {
          event.preventDefault();
          if (window.game) {
              window.game.toggleDebug();
          }
      }
      
      // F5 - рестарт игры
      if (event.key === 'F5') {
          event.preventDefault();
          if (window.game && window.game.restart) {
              window.game.restart();
          }
      }
      
      // F11 - полноэкранный режим
      if (event.key === 'F11') {
          event.preventDefault();
          toggleFullscreen();
      }
      
      // Ctrl+D - информация о разработке
      if (event.ctrlKey && event.key === 'd') {
          event.preventDefault();
          showDevInfo();
      }
  });
}

/**
* Показать помощь
*/
function showHelp() {
  const helpText = `
=== Pixel Jumper - Помощь ===

Управление:
← → или A/D - Движение влево/вправо
Space, W или ↑ - Прыжок
P или Escape - Пауза/продолжить
R - Рестарт уровня
F - Полноэкранный режим
M - Включить/выключить звук

Горячие клавиши:
F1 - Эта справка
F2 - Показать статистику
F3 - Переключить режим отладки
F5 - Рестарт игры
F11 - Полноэкранный режим
Ctrl+D - Информация о разработке

Цель игры:
Собирайте монеты и достигайте конца каждого уровня.
Избегайте падения с платформ и следите за временем!

Удачи!
`;
  
  console.log(helpText);
  alert('Справка открыта в консоли (F12)');
}

/**
* Показать статистику
*/
function showStats() {
  if (!window.game) {
      console.log('Игра еще не загружена');
      return;
  }
  
  const stats = window.game.getStats();
  console.table(stats);
  
  // Показ статистики в UI
  const statsDiv = document.createElement('div');
  statsDiv.id = 'statsOverlay';
  statsDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 20px;
      border-radius: 10px;
      z-index: 10000;
      max-width: 80%;
      max-height: 80%;
      overflow: auto;
      font-family: monospace;
  `;
  
  let statsHTML = '<h3>Статистика игры</h3>';
  statsHTML += `<p>Состояние: ${stats.state}</p>`;
  statsHTML += `<p>Время игры: ${Math.round(stats.gameTime / 1000)}с</p>`;
  
  if (stats.player) {
      statsHTML += '<h4>Игрок:</h4>';
      statsHTML += `<p>Позиция: (${Math.round(stats.player.position.x)}, ${Math.round(stats.player.position.y)})</p>`;
      statsHTML += `<p>Жизни: ${stats.player.lives}</p>`;
      statsHTML += `<p>Счет: ${stats.player.score}</p>`;
  }
  
  if (stats.level) {
      statsHTML += '<h4>Уровень:</h4>';
      statsHTML += `<p>${stats.level.name} (${stats.level.difficulty})</p>`;
      statsHTML += `<p>Прогресс: ${stats.level.progress.percentage}%</p>`;
  }
  
  if (stats.performance) {
      statsHTML += '<h4>Производительность:</h4>';
      statsHTML += `<p>FPS: ${stats.performance.fps}</p>`;
      statsHTML += `<p>Время кадра: ${stats.performance.avgFrameTime.toFixed(2)}ms</p>`;
  }
  
  statsHTML += '<button onclick="document.getElementById(\'statsOverlay\').remove()" style="margin-top: 10px; padding: 5px 10px;">Закрыть</button>';
  
  statsDiv.innerHTML = statsHTML;
  document.body.appendChild(statsDiv);
}

/**
* Переключение полноэкранного режима
*/
function toggleFullscreen() {
  if (!document.fullscreenElement) {
      const canvas = document.getElementById('gameCanvas');
      if (canvas.requestFullscreen) {
          canvas.requestFullscreen();
      } else if (canvas.webkitRequestFullscreen) {
          canvas.webkitRequestFullscreen();
      } else if (canvas.msRequestFullscreen) {
          canvas.msRequestFullscreen();
      }
  } else {
      if (document.exitFullscreen) {
          document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
      }
  }
}

/**
* Показать информацию о разработке
*/
function showDevInfo() {
  const devInfo = `
=== Pixel Jumper - Информация о разработке ===

Технологии:
• HTML5 Canvas API
• Vanilla JavaScript (ES6+)
• CSS3 с анимациями
• LocalStorage для сохранения

Архитектура:
• Модульная система классов
• Разделение на системы (физика, коллизии, ввод)
• Менеджеры (уровни, счет, UI)
• Игровой цикл с фиксированным шагом

Разработка с AI:
• Основной инструмент: Cursor IDE с DeepSeek
• Время разработки: ~2-3 часа
• AI-модули: физика, коллизии, UI, анимация
• Оптимизация и отладка с помощью AI

Особенности:
• 3 уровня разной сложности
• Подвижные и разрушающиеся платформы
• Система комбо и множителей
• Эффекты частиц и анимации
• Сохранение прогресса

Автор: Разработано с использованием AI
Версия: 1.0
Дата: ${new Date().toLocaleDateString()}
`;
  
  console.log(devInfo);
  
  // Создание красивого сообщения
  const message = document.createElement('div');
  message.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(135deg, #3498db, #2ecc71);
      color: white;
      padding: 30px;
      border-radius: 15px;
      z-index: 10000;
      max-width: 600px;
      max-height: 80vh;
      overflow: auto;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  `;
  
  message.innerHTML = `
      <h2 style="margin-bottom: 20px;">Pixel Jumper</h2>
      <div style="background: rgba(255, 255, 255, 0.1); padding: 15px; border-radius: 10px; margin-bottom: 20px;">
          <p style="margin: 10px 0;">🎮 Классический 2D платформер</p>
          <p style="margin: 10px 0;">🤖 Разработан с помощью AI</p>
          <p style="margin: 10px 0;">⚡ Чистый JavaScript + Canvas API</p>
          <p style="margin: 10px 0;">🏆 3 уровня с разной сложностью</p>
      </div>
      <p style="font-size: 0.9em; opacity: 0.8; margin-bottom: 20px;">
          Управление: ← → A/D - движение, Space/W - прыжок<br>
          P - пауза, R - рестарт, F11 - полный экран
      </p>
      <button onclick="this.parentElement.remove()" style="
          background: white;
          color: #3498db;
          border: none;
          padding: 10px 30px;
          border-radius: 25px;
          cursor: pointer;
          font-weight: bold;
          transition: transform 0.2s;
      " onmouseover="this.style.transform='scale(1.05)'" 
      onmouseout="this.style.transform='scale(1)'">
          Начать игру!
      </button>
  `;
  
  document.body.appendChild(message);
  
  // Автоматическое закрытие через 10 секунд
  setTimeout(() => {
      if (message.parentElement) {
          message.remove();
      }
  }, 10000);
}

/**
* Показать приветственное сообщение
*/
function showWelcomeMessage() {
  // Проверяем, было ли уже показано приветствие
  const hasSeenWelcome = localStorage.getItem('pixel_jumper_welcome_seen');
  
  if (!hasSeenWelcome) {
      setTimeout(() => {
          showDevInfo();
          localStorage.setItem('pixel_jumper_welcome_seen', 'true');
      }, 1000);
  }
}

/**
* Глобальные вспомогательные функции
*/
window.toggleSound = function() {
  if (window.game && window.game.uiManager) {
      window.game.uiManager.toggleSound();
  }
};

window.toggleFullscreen = toggleFullscreen;

window.showGameStats = function() {
  if (window.game) {
      const stats = window.game.getStats();
      console.table(stats);
      return stats;
  }
  return null;
};

// Экспорт для отладки
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
      Game,
      Player,
      Platform,
      Coin,
      PhysicsEngine,
      CollisionSystem,
      InputHandler,
      GameLoop,
      LevelManager,
      ScoreManager,
      UIManager,
      Constants,
      Helpers,
      Vector2
  };
      /**
     * Применить исправления для респавна
     */
      applyRespawnFix() 
        if (!window.game) return;
        
        console.log('Применяем исправление респавна...');
        
        // Защита от слишком частого респавна
        let lastRespawn = 0;
        const minRespawnInterval = 2000; // 2 секунды между респавнами
        
        const originalMethod = window.game.updatePlaying;
        window.game.updatePlaying = function(deltaTime) {
            // Вызываем оригинальный метод
            const result = originalMethod.call(this, deltaTime);
            
            // Защита от частого респавна
            const now = Date.now();
            if (this.player && this.player.lives > 0) {
                const level = this.levelManager?.currentLevel;
                if (level && this.player.position.y > level.height) {
                    if (now - lastRespawn < minRespawnInterval) {
                        console.log('Слишком частый респавн, игнорируем...');
                        // Поднимаем игрока, но не наносим урон
                        this.player.position.y = level.startPosition.y;
                        this.player.velocity.y = 0;
                        return result;
                    }
                    lastRespawn = now;
                }
            }
            
            return result;
        };
        
        console.log('Исправление респавна применено');
    }