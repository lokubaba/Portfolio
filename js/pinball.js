/**
 * Lokesh Deswal - Product Manager Portfolio
 * 2D Pinball Arcade Engine & Particle Physics
 */

class PinballGame {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    // Virtual resolution
    this.width = 400;
    this.height = 500;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    // Game state
    this.score = 0;
    this.highScore = 0;
    this.combo = 1;
    this.comboTimer = null;
    this.lastMilestoneHit = null;

    // Physics parameters
    this.gravity = 0.22;
    this.friction = 0.995;

    // Ball
    this.ball = {
      x: 375,
      y: 430,
      vx: 0,
      vy: 0,
      radius: 7.5,
      inPlungerLane: true,
      active: true
    };

    // Plunger
    this.plunger = {
      pull: 0,
      maxPull: 32,
      isCharging: false,
      chargeRate: 1.2
    };

    // Flippers
    this.flippers = {
      left: {
        x: 125,
        y: 430,
        length: 54,
        angle: 0.45, // at rest pointing down-right
        restAngle: 0.45,
        activeAngle: -0.55,
        isPressed: false,
        angularVelocity: 0
      },
      right: {
        x: 275,
        y: 430,
        length: 54,
        angle: Math.PI - 0.45, // at rest pointing down-left
        restAngle: Math.PI - 0.45,
        activeAngle: Math.PI + 0.55,
        isPressed: false,
        angularVelocity: 0
      }
    };

    // Bumpers (Milestones)
    this.bumpers = [
      {
        id: 'discovery',
        name: 'USER DISCOVERY',
        sectionId: 'relata-case',
        x: 130,
        y: 135,
        radius: 26,
        points: 500,
        color: '#06b6d4',
        glow: 'rgba(6, 182, 212, 0.6)',
        hitTime: 0
      },
      {
        id: 'towers',
        name: '13+ TOWERS',
        sectionId: 'relata-case',
        x: 270,
        y: 135,
        radius: 26,
        points: 1000,
        color: '#a855f7',
        glow: 'rgba(168, 85, 247, 0.6)',
        hitTime: 0
      },
      {
        id: 'mvp',
        name: 'HIRANANDANI MVP',
        sectionId: 'relata-case',
        x: 200,
        y: 215,
        radius: 30,
        points: 1250,
        color: '#f59e0b',
        glow: 'rgba(245, 158, 11, 0.7)',
        hitTime: 0
      },
      {
        id: 'portal',
        name: 'CLIENT PORTAL',
        sectionId: 'internal-tools',
        x: 100,
        y: 295,
        radius: 20,
        points: 1500,
        color: '#10b981',
        glow: 'rgba(16, 185, 129, 0.6)',
        hitTime: 0
      },
      {
        id: 'zentra',
        name: 'AI WORKFLOW',
        sectionId: 'internal-tools',
        x: 300,
        y: 295,
        radius: 20,
        points: 1500,
        color: '#38bdf8',
        glow: 'rgba(56, 189, 248, 0.6)',
        hitTime: 0
      }
    ];

    // Slingshots (triangular kickers above flippers)
    this.slingshots = [
      {
        p1: { x: 75, y: 350 },
        p2: { x: 75, y: 405 },
        p3: { x: 105, y: 395 },
        color: '#f59e0b',
        hitTime: 0
      },
      {
        p1: { x: 325, y: 350 },
        p2: { x: 325, y: 405 },
        p3: { x: 295, y: 395 },
        color: '#f59e0b',
        hitTime: 0
      }
    ];

    // Static guide walls & arcs
    this.walls = this.generateWalls();

    // Particle FX
    this.particles = [];

    // Attach listeners
    this.setupControls();

    // Start Loop
    this.lastTime = performance.now();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  generateWalls() {
    return [
      // Left boundary
      { p1: { x: 25, y: 130 }, p2: { x: 25, y: 360 } },
      // Left lower angle guide toward flipper
      { p1: { x: 25, y: 360 }, p2: { x: 110, y: 435 } },
      
      // Plunger lane left dividing wall
      { p1: { x: 355, y: 130 }, p2: { x: 355, y: 470 } },
      // Right guide wall inside playfield
      { p1: { x: 355, y: 130 }, p2: { x: 355, y: 360 } },
      // Right lower angle guide toward flipper
      { p1: { x: 355, y: 360 }, p2: { x: 290, y: 435 } },

      // Outer right wall (plunger lane)
      { p1: { x: 395, y: 120 }, p2: { x: 395, y: 470 } },
      // Plunger bottom floor
      { p1: { x: 355, y: 470 }, p2: { x: 395, y: 470 } }
    ];
  }

  setupControls() {
    // Keyboard controls
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
        if (!this.flippers.left.isPressed) {
          this.flippers.left.isPressed = true;
          window.sfx.playFlipper();
        }
      }
      if (e.code === 'KeyD' || e.code === 'ArrowRight') {
        if (!this.flippers.right.isPressed) {
          this.flippers.right.isPressed = true;
          window.sfx.playFlipper();
        }
      }
      if (e.code === 'Space') {
        e.preventDefault();
        this.plunger.isCharging = true;
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
        this.flippers.left.isPressed = false;
      }
      if (e.code === 'KeyD' || e.code === 'ArrowRight') {
        this.flippers.right.isPressed = false;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        if (this.plunger.isCharging) {
          this.launchBall();
        }
      }
    });

    // On-screen UI buttons
    const btnLeft = document.getElementById('btnFlipperLeft');
    const btnRight = document.getElementById('btnFlipperRight');
    const btnLaunch = document.getElementById('btnLaunchBall');

    if (btnLeft) {
      const pressLeft = (e) => {
        e.preventDefault();
        this.flippers.left.isPressed = true;
        btnLeft.classList.add('active');
        window.sfx.playFlipper();
      };
      const releaseLeft = (e) => {
        e.preventDefault();
        this.flippers.left.isPressed = false;
        btnLeft.classList.remove('active');
      };
      btnLeft.addEventListener('mousedown', pressLeft);
      btnLeft.addEventListener('mouseup', releaseLeft);
      btnLeft.addEventListener('touchstart', pressLeft, { passive: false });
      btnLeft.addEventListener('touchend', releaseLeft, { passive: false });
    }

    if (btnRight) {
      const pressRight = (e) => {
        e.preventDefault();
        this.flippers.right.isPressed = true;
        btnRight.classList.add('active');
        window.sfx.playFlipper();
      };
      const releaseRight = (e) => {
        e.preventDefault();
        this.flippers.right.isPressed = false;
        btnRight.classList.remove('active');
      };
      btnRight.addEventListener('mousedown', pressRight);
      btnRight.addEventListener('mouseup', releaseRight);
      btnRight.addEventListener('touchstart', pressRight, { passive: false });
      btnRight.addEventListener('touchend', releaseRight, { passive: false });
    }

    if (btnLaunch) {
      btnLaunch.addEventListener('click', () => {
        this.plunger.pull = this.plunger.maxPull;
        this.launchBall();
      });
    }

    // Canvas click to quick launch if resting in lane
    this.canvas.addEventListener('click', () => {
      if (this.ball.inPlungerLane || this.ball.y > this.height) {
        this.plunger.pull = this.plunger.maxPull;
        this.launchBall();
      }
    });
  }

  launchBall() {
    this.plunger.isCharging = false;
    const force = Math.max(14, (this.plunger.pull / this.plunger.maxPull) * 22);
    this.plunger.pull = 0;

    if (this.ball.inPlungerLane || this.ball.y > this.height - 40) {
      this.ball.x = 375;
      this.ball.y = 440;
      this.ball.vx = (Math.random() - 0.5) * 1.5;
      this.ball.vy = -force;
      this.ball.inPlungerLane = true;
      window.sfx.playPlunger();
      this.triggerToast('BALL LAUNCHED! USE A / D TO FLIP');
    }
  }

  resetBall() {
    this.ball.x = 375;
    this.ball.y = 430;
    this.ball.vx = 0;
    this.ball.vy = 0;
    this.ball.inPlungerLane = true;
    window.sfx.playDrain();
    this.triggerToast('OUTHOLE: RELAUNCH READY!');
  }

  triggerToast(text) {
    const toast = document.getElementById('pinballToast');
    if (!toast) return;
    toast.textContent = text;
    toast.classList.add('show');
    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2400);
  }

  addScore(points, name = '', sectionId = null) {
    const pts = points * this.combo;
    this.score += pts;
    if (this.score > this.highScore) {
      this.highScore = this.score;
    }

    // Update HUD
    const hudVal = document.getElementById('hudScoreVal');
    if (hudVal) {
      hudVal.textContent = this.score.toLocaleString();
    }

    // Toast
    if (name) {
      this.triggerToast(`🎯 ${name} +${pts.toLocaleString()}!`);
    }

    // Sound
    window.sfx.playBumper();

    // Increment combo
    this.combo++;
    clearTimeout(this.comboTimer);
    this.comboTimer = setTimeout(() => {
      this.combo = 1;
    }, 3000);

    // Subtle highlight on page section
    if (sectionId) {
      const targetSec = document.getElementById(sectionId);
      if (targetSec) {
        targetSec.style.transition = 'outline 0.3s ease';
        targetSec.style.outline = '2px solid rgba(245, 158, 11, 0.6)';
        setTimeout(() => {
          targetSec.style.outline = 'none';
        }, 1200);
      }
    }
  }

  createSparks(x, y, color, count = 12) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4.5;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: 0.03 + Math.random() * 0.04,
        size: 2 + Math.random() * 2.5,
        color: color
      });
    }
  }

  updatePhysics() {
    // Plunger charging
    if (this.plunger.isCharging) {
      this.plunger.pull = Math.min(this.plunger.maxPull, this.plunger.pull + this.plunger.chargeRate);
    }

    // Flippers animation
    ['left', 'right'].forEach((side) => {
      const f = this.flippers[side];
      const targetAngle = f.isPressed ? f.activeAngle : f.restAngle;
      const delta = targetAngle - f.angle;
      f.angle += delta * 0.42;
    });

    // Apply gravity to ball
    this.ball.vy += this.gravity;
    this.ball.vx *= this.friction;
    this.ball.vy *= this.friction;

    // Cap velocity
    const speed = Math.hypot(this.ball.vx, this.ball.vy);
    const maxSpeed = 22;
    if (speed > maxSpeed) {
      this.ball.vx = (this.ball.vx / speed) * maxSpeed;
      this.ball.vy = (this.ball.vy / speed) * maxSpeed;
    }

    this.ball.x += this.ball.vx;
    this.ball.y += this.ball.vy;

    // Check top curved ceiling
    // Arch centered at (200, 140), radius 175
    const archCenterX = 200;
    const archCenterY = 175;
    const archRadius = 175;
    const distToArch = Math.hypot(this.ball.x - archCenterX, this.ball.y - archCenterY);

    if (this.ball.y < archCenterY && distToArch > archRadius - this.ball.radius) {
      // Collision with outer top arch
      const normalX = (archCenterX - this.ball.x) / distToArch;
      const normalY = (archCenterY - this.ball.y) / distToArch;
      
      const dot = this.ball.vx * normalX + this.ball.vy * normalY;
      if (dot < 0) {
        this.ball.vx -= 1.8 * dot * normalX;
        this.ball.vy -= 1.8 * dot * normalY;
        this.ball.x = archCenterX - normalX * (archRadius - this.ball.radius);
        this.ball.y = archCenterY - normalY * (archRadius - this.ball.radius);
        this.ball.inPlungerLane = false; // Exited plunger into main field
      }
    }

    // Check Wall Collisions
    this.walls.forEach(w => {
      this.checkLineCollision(w.p1, w.p2, 0.7);
    });

    // Check Bumper Collisions
    this.bumpers.forEach(b => {
      const dx = this.ball.x - b.x;
      const dy = this.ball.y - b.y;
      const dist = Math.hypot(dx, dy);
      const minDist = b.radius + this.ball.radius;

      if (dist < minDist) {
        // Impact
        const nx = dx / dist;
        const ny = dy / dist;
        const speed = Math.hypot(this.ball.vx, this.ball.vy);
        const impulse = Math.max(9, speed * 1.3);

        this.ball.vx = nx * impulse;
        this.ball.vy = ny * impulse;
        this.ball.x = b.x + nx * minDist;
        this.ball.y = b.y + ny * minDist;

        b.hitTime = performance.now();
        this.createSparks(b.x + nx * b.radius, b.y + ny * b.radius, b.color, 14);
        this.addScore(b.points, b.name, b.sectionId);
      }
    });

    // Check Flipper Collisions
    ['left', 'right'].forEach(side => {
      const f = this.flippers[side];
      const tipX = f.x + Math.cos(f.angle) * f.length;
      const tipY = f.y + Math.sin(f.angle) * f.length;
      
      const isFlipperMovingUp = f.isPressed;
      const boost = isFlipperMovingUp ? 7 : 0;
      this.checkFlipperLine(f.x, f.y, tipX, tipY, boost);
    });

    // Check Ball Drain
    if (this.ball.y > this.height + 30) {
      this.resetBall();
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  checkLineCollision(p1, p2, restitution = 0.75) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return;

    // Projection of ball onto line
    const t = Math.max(0, Math.min(1, ((this.ball.x - p1.x) * dx + (this.ball.y - p1.y) * dy) / lenSq));
    const closestX = p1.x + t * dx;
    const closestY = p1.y + t * dy;

    const distX = this.ball.x - closestX;
    const distY = this.ball.y - closestY;
    const dist = Math.hypot(distX, distY);

    if (dist < this.ball.radius) {
      const nx = dist === 0 ? 0 : distX / dist;
      const ny = dist === 0 ? -1 : distY / dist;

      const dot = this.ball.vx * nx + this.ball.vy * ny;
      if (dot < 0) {
        this.ball.vx -= (1 + restitution) * dot * nx;
        this.ball.vy -= (1 + restitution) * dot * ny;
        this.ball.x = closestX + nx * this.ball.radius;
        this.ball.y = closestY + ny * this.ball.radius;
      }
    }
  }

  checkFlipperLine(x1, y1, x2, y2, boost = 0) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return;

    const t = Math.max(0, Math.min(1, ((this.ball.x - x1) * dx + (this.ball.y - y1) * dy) / lenSq));
    const closestX = x1 + t * dx;
    const closestY = y1 + t * dy;

    const distX = this.ball.x - closestX;
    const distY = this.ball.y - closestY;
    const dist = Math.hypot(distX, distY);

    if (dist < this.ball.radius + 3) {
      const nx = dist === 0 ? 0 : distX / dist;
      const ny = dist === 0 ? -1 : distY / dist;

      // Normal must face upward to bounce off top of flipper
      const dot = this.ball.vx * nx + this.ball.vy * ny;
      if (dot < 0) {
        const bounce = 1.35;
        this.ball.vx = (this.ball.vx - (1 + bounce) * dot * nx) + (nx * boost);
        this.ball.vy = (this.ball.vy - (1 + bounce) * dot * ny) + (ny * (boost * 1.5)) - (boost * 0.8);
        this.ball.x = closestX + nx * (this.ball.radius + 3);
        this.ball.y = closestY + ny * (this.ball.radius + 3);

        this.createSparks(this.ball.x, this.ball.y, '#f59e0b', 6);
        window.sfx.playFlipper();
      }
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Playfield background aesthetics
    this.drawPlayfieldArt();

    // Top Arch
    this.ctx.beginPath();
    this.ctx.arc(200, 175, 175, Math.PI, 0, false);
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    this.ctx.lineWidth = 3;
    this.ctx.stroke();

    // Draw Static Walls
    this.ctx.beginPath();
    this.walls.forEach(w => {
      this.ctx.moveTo(w.p1.x, w.p1.y);
      this.ctx.lineTo(w.p2.x, w.p2.y);
    });
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    this.ctx.lineWidth = 3;
    this.ctx.stroke();

    // Draw Bumpers
    const now = performance.now();
    this.bumpers.forEach(b => {
      const isLit = (now - b.hitTime) < 250;
      
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);

      // Glow ring
      this.ctx.shadowColor = b.color;
      this.ctx.shadowBlur = isLit ? 30 : 12;
      this.ctx.fillStyle = isLit ? '#ffffff' : 'rgba(20, 26, 42, 0.9)';
      this.ctx.fill();

      this.ctx.lineWidth = isLit ? 4 : 2.5;
      this.ctx.strokeStyle = b.color;
      this.ctx.stroke();

      // Bumper Label
      this.ctx.shadowBlur = 0;
      this.ctx.font = 'bold 8px "JetBrains Mono", monospace';
      this.ctx.fillStyle = isLit ? '#000000' : '#f8fafc';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(b.name, b.x, b.y - 3);

      this.ctx.font = '7px "JetBrains Mono", monospace';
      this.ctx.fillStyle = isLit ? '#000000' : b.color;
      this.ctx.fillText(`+${b.points}`, b.x, b.y + 7);

      this.ctx.restore();
    });

    // Draw Flippers
    ['left', 'right'].forEach(side => {
      const f = this.flippers[side];
      const tipX = f.x + Math.cos(f.angle) * f.length;
      const tipY = f.y + Math.sin(f.angle) * f.length;

      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.moveTo(f.x, f.y);
      this.ctx.lineTo(tipX, tipY);
      this.ctx.lineCap = 'round';
      this.ctx.lineWidth = 11;
      this.ctx.strokeStyle = f.isPressed ? '#f59e0b' : '#fbbf24';
      this.ctx.shadowColor = '#f59e0b';
      this.ctx.shadowBlur = f.isPressed ? 18 : 6;
      this.ctx.stroke();

      // Pivot knob
      this.ctx.beginPath();
      this.ctx.arc(f.x, f.y, 6, 0, Math.PI * 2);
      this.ctx.fillStyle = '#1e293b';
      this.ctx.fill();
      this.ctx.strokeStyle = '#fff';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
      this.ctx.restore();
    });

    // Draw Plunger
    this.ctx.save();
    const plungerY = 470 - this.plunger.pull;
    this.ctx.fillStyle = '#ef4444';
    this.ctx.fillRect(362, plungerY, 26, 12);
    // Spring coils
    this.ctx.beginPath();
    this.ctx.moveTo(375, plungerY + 12);
    this.ctx.lineTo(375, 490);
    this.ctx.strokeStyle = '#64748b';
    this.ctx.lineWidth = 3;
    this.ctx.setLineDash([4, 4]);
    this.ctx.stroke();
    this.ctx.restore();

    // Draw Particles
    this.particles.forEach(p => {
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.life;
      this.ctx.shadowColor = p.color;
      this.ctx.shadowBlur = 10;
      this.ctx.fill();
      this.ctx.restore();
    });

    // Draw Ball (Chrome Steel Sphere)
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);

    const grad = this.ctx.createRadialGradient(
      this.ball.x - 2.5, this.ball.y - 2.5, 1,
      this.ball.x, this.ball.y, this.ball.radius
    );
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.3, '#e2e8f0');
    grad.addColorStop(0.7, '#94a3b8');
    grad.addColorStop(1, '#334155');

    this.ctx.fillStyle = grad;
    this.ctx.shadowColor = 'rgba(56, 189, 248, 0.5)';
    this.ctx.shadowBlur = 12;
    this.ctx.fill();
    this.ctx.restore();
  }

  drawPlayfieldArt() {
    // Subtle lane arrows and geometric runway
    this.ctx.save();
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    this.ctx.lineWidth = 1;

    // Outlane center chevron
    this.ctx.beginPath();
    this.ctx.moveTo(170, 360);
    this.ctx.lineTo(200, 390);
    this.ctx.lineTo(230, 360);
    this.ctx.stroke();

    // PM Track Text watermark
    this.ctx.font = '700 11px "Space Grotesk", sans-serif';
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('PRODUCT SPRINT ARCADE', 200, 70);
    this.ctx.fillText('DISCOVERY → MVP → IMPACT', 200, 88);

    this.ctx.restore();
  }

  animate() {
    this.updatePhysics();
    this.draw();
    requestAnimationFrame(this.animate);
  }
}

// Instantiate upon DOM load
document.addEventListener('DOMContentLoaded', () => {
  window.pinballInstance = new PinballGame('pinballCanvas');
});
