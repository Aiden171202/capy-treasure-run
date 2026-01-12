/* =====================
   CANVAS SETUP (CRITICAL FIX)
===================== */
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

/* =====================
   UI ELEMENTS
===================== */
const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOver");
const finalScoreText = document.getElementById("finalScore");

document.getElementById("startBtn").onclick = startGame;
document.getElementById("restartBtn").onclick = startGame;

/* =====================
   GAME STATE
===================== */
let running = false;
let speed = 6;
let score = 0;
let animationId;

const lanes = [-1, 0, 1];
const laneWidth = 120;

/* =====================
   CAPY CHARACTER
===================== */
const capy = {
  lane: 0,
  y: 0,
  vy: 0,
  radius: 26,
  jumping: false,

  reset() {
    this.lane = 0;
    this.y = canvas.height * 0.75;
    this.vy = 0;
    this.jumping = false;
  },

  update() {
    this.y += this.vy;
    this.vy += 0.9;

    const ground = canvas.height * 0.75;
    if (this.y >= ground) {
      this.y = ground;
      this.vy = 0;
      this.jumping = false;
    }
  },

  draw() {
    const x = canvas.width / 2 + this.lane * laneWidth;

    // Glow
    ctx.shadowColor = "#7b5cff";
    ctx.shadowBlur = 18;

    // Body
    ctx.fillStyle = "#9c6b3d";
    ctx.beginPath();
    ctx.arc(x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Belly
    ctx.fillStyle = "#caa57a";
    ctx.beginPath();
    ctx.arc(x, this.y + 6, this.radius - 10, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(x - 6, this.y - 4, 3, 0, Math.PI * 2);
    ctx.arc(x + 6, this.y - 4, 3, 0, Math.PI * 2);
    ctx.fill();
  }
};

/* =====================
   OBSTACLES (NODES)
===================== */
const obstacles = [];

function spawnObstacle() {
  const type = Math.floor(Math.random() * 4);
  obstacles.push({
    lane: lanes[Math.floor(Math.random() * lanes.length)],
    y: -50,
    r: 22,
    type
  });
}

let spawnTimer = 0;

/* =====================
   INPUT
===================== */
window.addEventListener("keydown", e => {
  if (!running) return;

  if ((e.key === " " || e.key === "ArrowUp") && !capy.jumping) {
    capy.vy = -16;
    capy.jumping = true;
  }

  if (e.key === "ArrowLeft") {
    capy.lane = Math.max(-1, capy.lane - 1);
  }

  if (e.key === "ArrowRight") {
    capy.lane = Math.min(1, capy.lane + 1);
  }
});

/* =====================
   MAIN LOOP
===================== */
function gameLoop() {
  if (!running) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBackground();
  capy.update();
  capy.draw();

  spawnTimer++;
  if (spawnTimer > 70) {
    spawnObstacle();
    spawnTimer = 0;
  }

  obstacles.forEach(o => {
    o.y += speed;
    drawNode(o);

    const ox = canvas.width / 2 + o.lane * laneWidth;
    const dx = ox - (canvas.width / 2 + capy.lane * laneWidth);
    const dy = o.y - capy.y;

    if (Math.abs(dx) < 40 && Math.abs(dy) < 40) {
      endGame();
    }
  });

  score += 0.15;
  speed += 0.0007;

  drawHUD();

  animationId = requestAnimationFrame(gameLoop);
}

/* =====================
   DRAWING
===================== */
function drawBackground() {
  ctx.fillStyle = "#0b0b14";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(255,255,255,0.04)";
  for (let i = 0; i < canvas.width; i += 80) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, canvas.height);
    ctx.stroke();
  }
}

function drawNode(o) {
  const x = canvas.width / 2 + o.lane * laneWidth;
  const colors = ["#ff5c5c", "#5ce1ff", "#f4ff5c", "#7bff7b"];

  ctx.fillStyle = colors[o.type];
  ctx.beginPath();
  ctx.arc(x, o.y, o.r, 0, Math.PI * 2);
  ctx.fill();
}

function drawHUD() {
  ctx.fillStyle = "#fff";
  ctx.font = "16px monospace";
  ctx.fillText(`Requests Served: ${Math.floor(score)}`, 20, 30);
}

/* =====================
   GAME FLOW
===================== */
function startGame() {
  cancelAnimationFrame(animationId);

  startScreen.classList.add("hidden");
  gameOverScreen.classList.add("hidden");

  obstacles.length = 0;
  spawnTimer = 0;
  speed = 6;
  score = 0;

  capy.reset();
  running = true;

  gameLoop();
}

function endGame() {
  running = false;
  cancelAnimationFrame(animationId);

  finalScoreText.textContent =
    `Requests Served: ${Math.floor(score)}`;

  gameOverScreen.classList.remove("hidden");
}
