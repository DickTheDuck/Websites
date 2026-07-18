const canvas = document.getElementById("pond");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const settings = {
  size: 25,
  speed: 1,
  collisions: true,
  hunterMode: false,
};

const ui = {
  menuButton: document.getElementById("menuButton"),
  panel: document.getElementById("settings"),
  sizeSlider: document.getElementById("sizeSlider"),
  sizeValue: document.getElementById("sizeValue"),
  speedSlider: document.getElementById("speedSlider"),
  speedValue: document.getElementById("speedValue"),
  collisionToggle: document.getElementById("collisionToggle"),
  hunterToggle: document.getElementById("hunterToggle"),
  disintegrateButton: document.getElementById("disintegrateButton"),
};

let width = 0;
let height = 0;
let ducks = [];
let particles = [];
let isMouseDown = false;
let spawnTimer = 0;
let spawnPoint = { x: 0, y: 0 };
let lastFrameTime = performance.now();

const duckSprite = new Image();
duckSprite.src = "assets/duck.png";

const mouse = {
  x: -1000,
  y: -1000,
};

function resize() {
  const dpr = window.devicePixelRatio || 1;

  width = window.innerWidth;
  height = window.innerHeight;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function updateUI() {
  ui.sizeValue.textContent = settings.size;
  ui.speedValue.textContent = settings.speed;
}

function bindUI() {
  ui.menuButton.addEventListener("click", () => {
    ui.panel.classList.toggle("open");
  });

  ui.sizeSlider.addEventListener("input", () => {
    settings.size = Number(ui.sizeSlider.value);
    updateUI();
  });

  ui.speedSlider.addEventListener("input", () => {
    settings.speed = Number(ui.speedSlider.value);
    updateUI();
  });

  ui.collisionToggle.addEventListener("change", () => {
    settings.collisions = ui.collisionToggle.checked;
  });

  ui.hunterToggle.addEventListener("change", () => {
    settings.hunterMode = ui.hunterToggle.checked;
  });

  ui.disintegrateButton.addEventListener("click", () => {
    if (ducks.length === 0) {
      return;
    }

    const index = Math.floor(Math.random() * ducks.length);
    const duck = ducks[index];

    duck.disintegrate("heavy");
    ducks.splice(index, 1);
  });
}

// =====================
// Particle System
// =====================
class Particle {
  constructor(x, y, size, intensity = "normal") {
    this.x = x;
    this.y = y;
    this.size = size;
    this.vx = (Math.random() - 0.5) * (intensity === "heavy" ? 10 : 6);
    this.vy = (Math.random() - 0.5) * (intensity === "heavy" ? 10 : 6);
    this.life = 1;
    this.color = intensity === "heavy"
      ? ["#f5d76e", "#ffb347", "#ff6f61"][Math.floor(Math.random() * 3)]
      : "#f5d76e";
    this.isHeavy = intensity === "heavy";
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    this.vx *= this.isHeavy ? 0.94 : 0.96;
    this.vy *= this.isHeavy ? 0.94 : 0.96;

    this.life -= 0.025;
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.life;

    if (this.isHeavy) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 1.2, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = this.color;
      ctx.fill();
    } else {
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, this.size, this.size);
    }

    ctx.restore();
  }
}

// =====================
// Duck
// =====================
class Duck {
  constructor(x = null, y = null) {
    this.x = x ?? Math.random() * width;
    this.y = y ?? Math.random() * height;
    this.angle = Math.random() * Math.PI * 2;
    this.speedVariation = Math.random();
    this.sizeMultiplier = 0.7 + Math.random() * 0.6;
    this.size = settings.size * this.sizeMultiplier;
    this.turnSpeed = 0.05 + Math.random() * 0.05;
    this.currentSpeed = 0;
    this.targetSpeed = 0;
  }

  update() {
    this.size = settings.size * this.sizeMultiplier;

    const dx = this.x - mouse.x;
    const dy = this.y - mouse.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 150) {
      const targetAngle = Math.atan2(dy, dx);
      this.angle += (targetAngle - this.angle) * this.turnSpeed;
      this.targetSpeed = 5 * settings.speed;
    } else {
      this.targetSpeed = settings.speed * (0.5 + this.speedVariation);
    }

    this.currentSpeed += (this.targetSpeed - this.currentSpeed) * 0.05;

    this.x += Math.cos(this.angle) * this.currentSpeed;
    this.y += Math.sin(this.angle) * this.currentSpeed;

    const padding = this.size / 2;

    if (this.x < padding) {
      this.x = padding;
      this.angle = Math.PI - this.angle;
    }

    if (this.x > width - padding) {
      this.x = width - padding;
      this.angle = Math.PI - this.angle;
    }

    if (this.y < padding) {
      this.y = padding;
      this.angle = -this.angle;
    }

    if (this.y > height - padding) {
      this.y = height - padding;
      this.angle = -this.angle;
    }
  }

  collide(other) {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minimum = (this.size + other.size) / 2;

    if (distance < minimum && distance > 0) {
      const force = (minimum - distance) / distance;
      this.x += dx * force * 0.5;
      this.y += dy * force * 0.5;
    }
  }

  disintegrate(intensity = "normal") {
    const particleCount = intensity === "heavy" ? 40 : 30;
    const particleSize = intensity === "heavy" ? this.size / 4 : this.size / 6;

    for (let i = 0; i < particleCount; i += 1) {
      particles.push(new Particle(this.x, this.y, particleSize, intensity));
    }
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);

    if (Math.cos(this.angle) < 0) {
      ctx.scale(-1, 1);
    }

    ctx.drawImage(duckSprite, -this.size / 2, -this.size / 2, this.size, this.size);
    ctx.restore();
  }
}

// =====================
// Duck creation
// =====================
function spawnDucks(count = 200) {
  ducks = Array.from({ length: count }, () => new Duck());
}

function spawnDuckAtPointer(x, y) {
  ducks.push(new Duck(x, y));
}

canvas.addEventListener("mousedown", (event) => {
  if (event.button !== 0) {
    return;
  }

  isMouseDown = true;
  spawnPoint.x = event.clientX;
  spawnPoint.y = event.clientY;
  spawnDuckAtPointer(spawnPoint.x, spawnPoint.y);
});

canvas.addEventListener("mouseup", () => {
  isMouseDown = false;
  spawnTimer = 0;
});

canvas.addEventListener("mouseleave", () => {
  isMouseDown = false;
  spawnTimer = 0;
});

window.addEventListener("mousemove", (event) => {
  mouse.x = event.clientX;
  mouse.y = event.clientY;

  if (isMouseDown) {
    spawnPoint.x = event.clientX;
    spawnPoint.y = event.clientY;
  }
});

// =====================
// Animation
// =====================
function animate(timestamp = performance.now()) {
  const deltaTime = timestamp - lastFrameTime;
  lastFrameTime = timestamp;

  ctx.clearRect(0, 0, width, height);

  if (isMouseDown) {
    spawnTimer += deltaTime;

    if (spawnTimer >= 250) {
      spawnDuckAtPointer(spawnPoint.x, spawnPoint.y);
      spawnTimer = 0;
    }
  }

  ducks.forEach((duck) => {
    duck.update();
  });

  if (settings.collisions) {
    for (let i = 0; i < ducks.length; i += 1) {
      for (let j = i + 1; j < ducks.length; j += 1) {
        ducks[i].collide(ducks[j]);
      }
    }
  }

  if (settings.hunterMode) {
    ducks = ducks.filter((duck) => {
      const dx = duck.x - mouse.x;
      const dy = duck.y - mouse.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const hunterRadius = duck.size * 1.4;

      if (distance <= hunterRadius) {
        duck.disintegrate();
        return false;
      }

      return true;
    });
  }

  ducks.forEach((duck) => {
    duck.draw();
  });

  particles.forEach((particle) => {
    particle.update();
    particle.draw();
  });

  particles = particles.filter((particle) => particle.life > 0);

  requestAnimationFrame(animate);
}

resize();
updateUI();
bindUI();
spawnDucks();
window.addEventListener("resize", resize);
animate();
