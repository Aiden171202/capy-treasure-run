/* =====================
   Canvas Setup
===================== */
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

/* =====================
   Game State
===================== */
let running = false;
let speed = 6;
let score = 0;
let lanes = [-1, 0, 1];

const groundY = canvas.height * 0.75;

/* =====================
   Capy Character
===================== */
const capy = {
  lane: 0,
  y: groundY,
  vy: 0,
  jumping: false,
  sliding: false,
  radius: 28,
  hit() {
    endGame();
  },
  update() {
    this.y += this.vy;
    this.vy += 0.9;

    if (this.y >= groundY) {
      this.y = groundY;
      this.vy = 0;
      this.jumping = false;
    }
  },
  draw() {
    const x = canvas.width / 2 + this.lane * 120;

    // Glow
    ctx.shadowColor = "#7b5cff";
    ctx.shadowBlur = 20;

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
   Obstacles (Nodes)
===================== */
const obstacles = [];

function spawnObstacle() {
  const type = Math.floor(Math.random() * 4);
  obstacles.push({
    type,
    lane: lanes[Math.floor(Math.random() * 3)],
    y: -60,
    active: true
  });
}

setInterval(() => {
  if (running) spawnObstacle();
}, 1200);

/* =====================
   Update Loop
===================== */
function update() {
  if (!running) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBackground();
  capy.update();
  capy.draw();

  obstacles.forEach(o => {
    o.y += speed;

    drawNode(o);

    // Collision
    if (
      Math.abs(o.lane - capy.lane) < 0.1 &&
      Math.abs(o.y - capy.y) < 40
    ) {
      capy.hit();
    }
  });

  score += 0.1;
  speed += 0.0005;

  drawHUD();
  requestAnimationFrame(update);
}

/* =====================
   Drawing Helpers
===================== */
function drawBackground() {
  // Network grid
  ctx.strokeStyle = "rgba(255,255,255,0.05)";
  for (let i = 0; i < canvas.width; i += 80) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, canvas.height);
    ctx.stroke();
  }
}

function drawNode(o) {
  const x = canvas.width / 2 + o.lane * 120;

  ctx.fillStyle = ["#ff5c5c", "#5ce1ff", "#f4ff5c", "#7bff7b"][o.type];
  ctx.beginPath();
  ctx.arc(x, o.y, 24, 0, Math.PI * 2);
  ctx.fill();
}

function drawHUD() {
  ctx.fillStyle = "#fff";
  ctx.font = "16px monospace";
  ctx.fillText(`Requests Served: ${Math.floor(score)}`, 20, 30);
}

/* =====================
   Controls
===================== */
window.addEventListener("keydown", e => {
  if (!running) return;
  if ((e.key === " " || e.key === "ArrowUp") && !capy.jumping) {
    capy.vy = -16;
    capy.jumping = true;
  }
  if (e.key === "ArrowLeft") capy.lane = Math.max(-1, capy.lane - 1);
  if (e.key === "ArrowRight") capy.lane = Math.min(1, capy.lane + 1);
});

/* =====================
   Game Flow
===================== */
function startGame() {
  document.getElementById("startScreen").classList.add("hidden");
  document.getElementById("gameOver").classList.add("hidden");

  obstacles.length = 0;
  speed = 6;
  score = 0;
  capy.lane = 0;
  capy.y = groundY;
  running = true;

  update();
}

function endGame() {
  running = false;
  document.getElementById("gameOver").classList.remove("hidden");
  document.getElementById("finalScore").innerText =
    `Requests Served: ${Math.floor(score)}`;
}
