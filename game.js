const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Проверка запуска в Telegram WebApp
if (window.Telegram?.WebApp) {
  Telegram.WebApp.expand();
  Telegram.WebApp.enableClosingConfirmation();
  Telegram.WebApp.BackButton.show();
  Telegram.WebApp.BackButton.onClick(() => Telegram.WebApp.close());
}

const map = [
  [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
  [2,1,1,1,1,2,1,1,1,1,1,1,1,1,2,1,1,1,1,2],
  [2,1,2,2,1,2,1,2,2,2,2,2,2,1,2,1,2,2,1,2],
  [2,1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1,2],
  [2,1,2,1,2,2,2,2,2,1,1,2,2,2,2,2,1,2,1,2],
  [2,1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1,2],
  [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
  [2,1,2,1,1,1,1,2,1,1,1,1,2,1,1,1,1,2,1,2],
  [2,1,2,1,2,2,1,2,1,1,1,1,2,1,2,2,1,2,1,2],
  [2,1,2,1,1,1,1,2,1,1,1,1,2,1,1,1,1,2,1,2],
  [2,1,2,1,1,1,1,2,1,1,1,1,2,1,1,1,1,2,1,2],
  [2,1,2,1,2,2,1,2,1,1,1,1,2,1,2,2,1,2,1,2],
  [2,1,2,1,1,1,1,2,1,1,1,1,2,1,1,1,1,2,1,2],
  [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
  [2,1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1,2],
  [2,1,2,1,2,2,2,2,2,1,1,2,2,2,2,2,1,2,1,2],
  [2,1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1,2],
  [2,1,2,2,1,2,1,2,2,2,2,2,2,1,2,1,2,2,1,2],
  [2,1,1,1,1,2,1,1,1,1,1,1,1,1,2,1,1,1,1,2],
  [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
];

let score = 0;
let totalDots = 0;

const calculateTileSize = () => {
  const maxWidth = Math.min(window.innerWidth, 500); // Ограничиваем максимальную ширину
  return Math.floor(maxWidth / map[0].length);
};

let tileSize = calculateTileSize();

// Пересчитываем при изменении размера экрана
window.addEventListener('resize', () => {
  tileSize = calculateTileSize();
  canvas.width = tileSize * map[0].length;
  canvas.height = tileSize * map.length;
  drawGame();
});

// Инициализация canvas (заменяем старый код)
canvas.width = tileSize * map[0].length;
canvas.height = tileSize * map.length;

for (let y = 0; y < map.length; y++) {
  for (let x = 0; x < map[y].length; x++) {
    if (map[y][x] === 1) totalDots++;
  }
}

const pacman = {
  x: 1,
  y: 1,
  color: "yellow",
  dir: "right",
  mouthOpen: true
};

const ghost = {
  x: 10,
  y: 10,
  color: "red",
  path: []
};

function drawRoundedRect(x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
}

function drawGhost(x, y, size, color) {
  const cx = x * size + size / 2;
  const cy = y * size + size / 2;
  const radius = size / 2.2;

  // Рисуем полукруг (верхняя часть призрака)
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, Math.PI, 0, false);
  ctx.lineTo(cx + radius, cy + radius);
  ctx.lineTo(cx - radius, cy + radius);
  ctx.closePath();
  ctx.fill();

  // Рисуем глаза
  const eyeRadius = radius / 3;
  const eyeOffsetX = radius / 2.5;
  const eyeOffsetY = radius / 3;

  ctx.fillStyle = "white";
  // Левая глазница
  ctx.beginPath();
  ctx.ellipse(cx - eyeOffsetX, cy - eyeOffsetY, eyeRadius * 0.7, eyeRadius, 0, 0, 2 * Math.PI);
  ctx.fill();
  // Правая глазница
  ctx.beginPath();
  ctx.ellipse(cx + eyeOffsetX, cy - eyeOffsetY, eyeRadius * 0.7, eyeRadius, 0, 0, 2 * Math.PI);
  ctx.fill();

  // Зрачки, которые смотрят на пакмана
  ctx.fillStyle = "black";
  const pupilRadius = eyeRadius / 2;

  let dx = pacman.x - x;
  let dy = pacman.y - y;
  let angle = Math.atan2(dy, dx);
  const pupilOffset = eyeRadius / 3;

  ctx.beginPath();
  ctx.ellipse(
    cx - eyeOffsetX + pupilOffset * Math.cos(angle),
    cy - eyeOffsetY + pupilOffset * Math.sin(angle),
    pupilRadius * 0.8,
    pupilRadius,
    0,
    0,
    2 * Math.PI
  );
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(
    cx + eyeOffsetX + pupilOffset * Math.cos(angle),
    cy - eyeOffsetY + pupilOffset * Math.sin(angle),
    pupilRadius * 0.8,
    pupilRadius,
    0,
    0,
    2 * Math.PI
  );
  ctx.fill();
}

function drawGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Горизонтальные стены
  for (let y = 0; y < map.length; y++) {
    let x = 0;
    while (x < map[y].length) {
      if (map[y][x] === 2) {
        let startX = x;
        while (x < map[y].length && map[y][x] === 2) x++;
        let width = (x - startX) * tileSize;
        ctx.fillStyle = "blue";
        drawRoundedRect(startX * tileSize, y * tileSize, width, tileSize, tileSize / 4);
      } else {
        x++;}
    }
  }

  // Вертикальные стены
  for (let x = 0; x < map[0].length; x++) {
    let y = 0;
    while (y < map.length) {
      if (map[y][x] === 2) {
        let startY = y;
        while (y < map.length && map[y][x] === 2) y++;
        let height = (y - startY) * tileSize;
        ctx.fillStyle = "blue";
        drawRoundedRect(x * tileSize, startY * tileSize, tileSize, height, tileSize / 4);
      } else {
        y++;
      }
    }
  }

  // Точки (еда)
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      if (map[y][x] === 1) {
        ctx.fillStyle = "white";
        const dotSize = tileSize / 6;
        ctx.beginPath();
        ctx.arc(
          x * tileSize + tileSize / 2,
          y * tileSize + tileSize / 2,
          dotSize,
          0,
          2 * Math.PI
        );
        ctx.fill();
      }
    }
  }

  // Пакман с ртом
  const centerX = pacman.x * tileSize + tileSize / 2;
  const centerY = pacman.y * tileSize + tileSize / 2;
  const radius = tileSize / 2.2;

  let startAngle = 0;
  let endAngle = 2 * Math.PI;

  if (pacman.mouthOpen) {
    switch (pacman.dir) {
      case "right":
        startAngle = 0.25 * Math.PI;
        endAngle = 1.75 * Math.PI;
        break;
      case "left":
        startAngle = 1.25 * Math.PI;
        endAngle = 0.75 * Math.PI;
        break;
      case "up":
        startAngle = 1.75 * Math.PI;
        endAngle = 1.25 * Math.PI;
        break;
      case "down":
        startAngle = 0.75 * Math.PI;
        endAngle = 0.25 * Math.PI;
        break;
    }
  }

  ctx.fillStyle = pacman.color;
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.arc(centerX, centerY, radius, startAngle, endAngle, false);
  ctx.closePath();
  ctx.fill();

  // Рисуем призрака
  drawGhost(ghost.x, ghost.y, tileSize, ghost.color);
}

function movePacman(dx, dy) {
  const newX = pacman.x + dx;
  const newY = pacman.y + dy;

  if (map[newY][newX] !== 2) {
    pacman.x = newX;
    pacman.y = newY;

    if (dx === 1) pacman.dir = "right";
    else if (dx === -1) pacman.dir = "left";
    else if (dy === -1) pacman.dir = "up";
    else if (dy === 1) pacman.dir = "down";

    pacman.mouthOpen = !pacman.mouthOpen;

    if (map[newY][newX] === 1) {
      map[newY][newX] = 0;
      score++;
      document.getElementById("scoreDisplay").textContent = `Счёт: ${score}`;

      if (score === totalDots) {
        setTimeout(() => {
          alert("🎉 Победа! Все точки съедены!");
        }, 100);
      }
    }

    drawGame();
  }
}

// Простое движение призрака к пакману, обходя стены
function moveGhost() {
  const dx = pacman.x - ghost.x;
  const dy = pacman.y - ghost.y;

  let stepX = 0;
  let stepY = 0;

  // Приоритет: сначала по оси с большим расстоянием
  if (Math.abs(dx) > Math.abs(dy)) {
    stepX = dx > 0 ? 1 : -1;
    if (map[ghost.y][ghost.x + stepX] === 2) { // стена
      // Попробовать двигаться по Y
      stepX = 0;
      stepY = dy > 0 ? 1 : -1;
      if (map[ghost.y + stepY][ghost.x] === 2) {
        // Оба направления заблокированы, не двигаемся
        stepY = 0;
      }
    }
  } else {
    stepY = dy > 0 ? 1 : -1;
    if (map[ghost.y + stepY] && map[ghost.y + stepY][ghost.x] === 2) { // стена
      // Попробовать двигаться по X
      stepY = 0;
      stepX = dx > 0 ? 1 : -1;
      if (map[ghost.y][ghost.x + stepX] === 2) {
        // Оба направления заблокированы, не двигаемся
        stepX = 0;
      }
    }
  }

  // Двигаемся если есть куда
  if (stepX !== 0 || stepY !== 0) {
    ghost.x += stepX;
    ghost.y += stepY;
  }
}

// Запускаем игру
document.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "ArrowUp": movePacman(0, -1); break;
    case "ArrowDown": movePacman(0, 1); break;
    case "ArrowLeft": movePacman(-1, 0); break;
    case "ArrowRight": movePacman(1, 0); break;
  }
});

// Кнопки управления для телефона
document.getElementById("up").addEventListener("click", () => movePacman(0, -1));
document.getElementById("down").addEventListener("click", () => movePacman(0, 1));
document.getElementById("left").addEventListener("click", () => movePacman(-1, 0));
document.getElementById("right").addEventListener("click", () => movePacman(1, 0));

drawGame();

// Двигаем призрака каждые 400 мс
setInterval(() => {
  moveGhost();

  // Проверка столкновения с Пакманом
  if (ghost.x === pacman.x && ghost.y === pacman.y) {
    alert("👻 Призрак поймал Пакмана! Игра окончена.");
    // Перезагрузить игру или сбросить положение
    pacman.x = 1;
    pacman.y = 1;
    ghost.x = 10;
    ghost.y = 10;
    score = 0;

    // Восстановить точки на карте
    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[y].length; x++) {
        if (map[y][x] === 0) map[y][x] = 1;
      }
    }

    document.getElementById("scoreDisplay").textContent = `Счёт: 0`;
  }

  drawGame();
}, 900);