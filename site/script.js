// VectorScaleDB — Site Interactions & Visualizations

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

const nav = document.getElementById('nav');
const hamburger = document.getElementById('nav-hamburger');
const mobileMenu = document.getElementById('mobile-menu');
const mobileClose = document.getElementById('mobile-menu-close');

window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
});

if (hamburger) {
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
}

if (mobileClose) {
  mobileClose.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  });
}

// Close mobile menu on link click
document.querySelectorAll('.mobile-menu-links a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// ---------------------------------------------------------------------------
// Smooth scrolling
// ---------------------------------------------------------------------------

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const href = anchor.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// ---------------------------------------------------------------------------
// Fade-in on scroll (Intersection Observer)
// ---------------------------------------------------------------------------

const fadeObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  },
  { threshold: 0.1 }
);

document.querySelectorAll('.fade-in').forEach(el => fadeObserver.observe(el));

// ---------------------------------------------------------------------------
// Code tabs
// ---------------------------------------------------------------------------

document.querySelectorAll('.code-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const parent = tab.closest('.code-example');
    parent.querySelectorAll('.code-tab').forEach(t => t.classList.remove('active'));
    parent.querySelectorAll('.code-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    parent.querySelector(`[data-panel="${tab.dataset.tab}"]`).classList.add('active');
  });
});

// ---------------------------------------------------------------------------
// Stat counter animation
// ---------------------------------------------------------------------------

function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const suffix = el.dataset.suffix || '';
  if (isNaN(target)) return;
  const duration = 2000;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(eased * target);
    el.textContent = current.toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

const statObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.animated) {
        entry.target.dataset.animated = 'true';
        animateCounter(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);

document.querySelectorAll('.stat-value[data-target]').forEach(el => statObserver.observe(el));

// ---------------------------------------------------------------------------
// Canvas utilities
// ---------------------------------------------------------------------------

function setupCanvas(canvas) {
  if (!canvas) return null;
  const parent = canvas.parentElement;
  const rect = parent.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = (canvas.classList.contains('demo-canvas') ? 300 : 200) * dpr;
  canvas.style.width = rect.width + 'px';
  canvas.style.height = (canvas.classList.contains('demo-canvas') ? 300 : 200) + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  return ctx;
}

// ---------------------------------------------------------------------------
// Compression Visualizer
// ---------------------------------------------------------------------------

const ENTITY_COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#22c55e', // green
  '#f59e0b', // amber
  '#ef4444', // red
];

let rawDots = [];
let segmentProgress = 0;
let compressionAnimated = false;

function initCompressionViz() {
  const rawCanvas = document.getElementById('raw-canvas');
  const compCanvas = document.getElementById('compressed-canvas');
  if (!rawCanvas || !compCanvas) return;

  const rawCtx = setupCanvas(rawCanvas);
  const compCtx = setupCanvas(compCanvas);
  if (!rawCtx || !compCtx) return;

  const w = rawCanvas.width / (window.devicePixelRatio || 1);
  const h = rawCanvas.height / (window.devicePixelRatio || 1);

  // Generate raw dots by entity
  rawDots = [];
  for (let i = 0; i < 250; i++) {
    rawDots.push({
      x: Math.random() * w,
      y: Math.random() * h,
      color: ENTITY_COLORS[Math.floor(Math.random() * 5)],
      size: 1.5 + Math.random() * 2,
      alpha: 0,
      targetAlpha: 0.4 + Math.random() * 0.5,
      delay: i * 8,
    });
  }

  // Segments per track
  const tracks = ENTITY_COLORS.map((color, i) => ({
    color,
    y: 20 + i * 36,
    segments: [
      { width: 0.3 + Math.random() * 0.4, start: 0.02 },
      { width: 0.1 + Math.random() * 0.2, start: 0.35 + Math.random() * 0.1 },
      { width: 0.15 + Math.random() * 0.3, start: 0.6 + Math.random() * 0.1 },
    ],
  }));

  let frame = 0;
  const counterEl = document.getElementById('compression-counter');
  let counterStage = 0;

  function drawRaw() {
    rawCtx.clearRect(0, 0, w, h);
    frame++;

    for (const dot of rawDots) {
      if (frame * 16 > dot.delay) {
        dot.alpha = Math.min(dot.alpha + 0.03, dot.targetAlpha);
      }
      if (dot.alpha > 0) {
        rawCtx.globalAlpha = dot.alpha;
        rawCtx.fillStyle = dot.color;
        rawCtx.beginPath();
        rawCtx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
        rawCtx.fill();
      }
    }
    rawCtx.globalAlpha = 1;
  }

  function drawCompressed() {
    const cw = compCanvas.width / (window.devicePixelRatio || 1);
    compCtx.clearRect(0, 0, cw, h);

    segmentProgress = Math.min(segmentProgress + 0.005, 1);
    const eased = 1 - Math.pow(1 - segmentProgress, 3);

    for (const track of tracks) {
      for (const seg of track.segments) {
        const segW = seg.width * cw * eased;
        const x = seg.start * cw;
        if (segW < 1) continue;

        compCtx.fillStyle = track.color;
        compCtx.globalAlpha = 0.6;
        compCtx.beginPath();
        compCtx.roundRect(x, track.y, segW, 20, 10);
        compCtx.fill();

        // Active glow on last segment
        if (seg === track.segments[track.segments.length - 1] && eased > 0.8) {
          compCtx.globalAlpha = 0.15 + Math.sin(frame * 0.05) * 0.1;
          compCtx.shadowColor = track.color;
          compCtx.shadowBlur = 12;
          compCtx.beginPath();
          compCtx.roundRect(x, track.y, segW, 20, 10);
          compCtx.fill();
          compCtx.shadowBlur = 0;

          // End cap dot
          compCtx.globalAlpha = 0.9;
          compCtx.fillStyle = '#fff';
          compCtx.beginPath();
          compCtx.arc(x + segW - 4, track.y + 10, 3, 0, Math.PI * 2);
          compCtx.fill();
        }
      }
    }
    compCtx.globalAlpha = 1;

    // Counter animation
    if (counterEl && !compressionAnimated) {
      if (eased > 0.2 && counterStage === 0) {
        counterEl.textContent = '10x';
        counterEl.style.transform = 'scale(1.1)';
        setTimeout(() => { counterEl.style.transform = 'scale(1)'; }, 200);
        counterStage = 1;
      }
      if (eased > 0.5 && counterStage === 1) {
        counterEl.textContent = '100x';
        counterEl.style.transform = 'scale(1.1)';
        setTimeout(() => { counterEl.style.transform = 'scale(1)'; }, 200);
        counterStage = 2;
      }
      if (eased > 0.85 && counterStage === 2) {
        counterEl.textContent = '1,000x';
        counterEl.style.transform = 'scale(1.15)';
        setTimeout(() => { counterEl.style.transform = 'scale(1)'; }, 300);
        counterStage = 3;
        compressionAnimated = true;
      }
    }
  }

  function animate() {
    drawRaw();
    drawCompressed();
    requestAnimationFrame(animate);
  }

  // Start when visible
  const vizObserver = new IntersectionObserver(
    entries => {
      if (entries[0].isIntersecting) {
        animate();
        vizObserver.disconnect();
      }
    },
    { threshold: 0.2 }
  );
  vizObserver.observe(rawCanvas.closest('.demo-section') || rawCanvas);
}

// ---------------------------------------------------------------------------
// Temporal KNN Visualization
// ---------------------------------------------------------------------------

function initKnnViz() {
  const canvas = document.getElementById('knn-canvas');
  if (!canvas) return;
  const ctx = setupCanvas(canvas);
  if (!ctx) return;

  const w = canvas.width / (window.devicePixelRatio || 1);
  const h = 300;

  // Generate scattered points
  const points = [];
  for (let i = 0; i < 60; i++) {
    points.push({
      x: 40 + Math.random() * (w - 80),
      y: 30 + Math.random() * (h - 60),
      color: ENTITY_COLORS[Math.floor(Math.random() * 5)],
    });
  }

  // Query window slides
  const windowW = w * 0.25;
  const queryPoint = { x: 0, y: h * 0.45 };
  let frame = 0;
  let started = false;

  function draw() {
    if (!started) return;
    ctx.clearRect(0, 0, w, h);
    frame++;

    // Slide window
    const cycle = w + windowW * 0.5;
    const windowX = ((frame * 0.4) % cycle) - windowW * 0.25;
    queryPoint.x = windowX + windowW / 2;

    // Time axis
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, h - 20);
    ctx.lineTo(w - 20, h - 20);
    ctx.stroke();

    // Time label
    ctx.fillStyle = '#71717a';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText('time \u2192', w - 60, h - 6);

    // Query window
    ctx.fillStyle = 'rgba(37,99,235,0.08)';
    ctx.strokeStyle = 'rgba(37,99,235,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(windowX, 10, windowW, h - 40, 8);
    ctx.fill();
    ctx.stroke();

    // Find 3 nearest in window
    const inWindow = points.filter(
      p => p.x >= windowX && p.x <= windowX + windowW
    );
    const dists = inWindow.map(p => ({
      p,
      d: Math.hypot(p.x - queryPoint.x, p.y - queryPoint.y),
    }));
    dists.sort((a, b) => a.d - b.d);
    const nearest = dists.slice(0, 3);

    // Draw all points
    for (const p of points) {
      const inside = p.x >= windowX && p.x <= windowX + windowW;
      ctx.globalAlpha = inside ? 0.9 : 0.15;
      ctx.fillStyle = inside ? p.color : '#71717a';
      ctx.beginPath();
      ctx.arc(p.x, p.y, inside ? 5 : 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Draw connections to nearest
    for (const n of nearest) {
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(queryPoint.x, queryPoint.y);
      ctx.lineTo(n.p.x, n.p.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Highlight nearest
      ctx.globalAlpha = 1;
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(n.p.x, n.p.y, 8, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Query point
    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.arc(queryPoint.x, queryPoint.y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(queryPoint.x, queryPoint.y, 3, 0, Math.PI * 2);
    ctx.fill();

    requestAnimationFrame(draw);
  }

  const knnObserver = new IntersectionObserver(
    entries => {
      if (entries[0].isIntersecting && !started) {
        started = true;
        draw();
      }
    },
    { threshold: 0.2 }
  );
  knnObserver.observe(canvas);
}

// ---------------------------------------------------------------------------
// Scene Diff Visualization
// ---------------------------------------------------------------------------

function initSceneDiffViz() {
  const canvas = document.getElementById('scene-diff-canvas');
  if (!canvas) return;
  const ctx = setupCanvas(canvas);
  if (!ctx) return;

  const w = canvas.width / (window.devicePixelRatio || 1);
  const h = 300;
  const midX = w / 2;

  // Generate grid of "Gaussians"
  const cols = 8;
  const rows = 5;
  const spacingX = (midX - 60) / cols;
  const spacingY = (h - 60) / rows;

  const gaussians = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      gaussians.push({
        x: 30 + c * spacingX + spacingX / 2,
        y: 40 + r * spacingY + spacingY / 2,
        status: 'unchanged',
      });
    }
  }

  // Mark some as changed/added/removed
  [5, 12, 27].forEach(i => { if (gaussians[i]) gaussians[i].status = 'changed'; });
  [3, 19].forEach(i => { if (gaussians[i]) gaussians[i].status = 'added'; });
  [8, 31].forEach(i => { if (gaussians[i]) gaussians[i].status = 'removed'; });

  let progress = 0;
  let started = false;

  function draw() {
    if (!started) return;
    ctx.clearRect(0, 0, w, h);

    progress = Math.min(progress + 0.008, 1);
    const eased = 1 - Math.pow(1 - progress, 3);

    // Divider
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(midX, 10);
    ctx.lineTo(midX, h - 10);
    ctx.stroke();
    ctx.setLineDash([]);

    // Labels
    ctx.fillStyle = '#71717a';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Timestamp T\u2081', midX / 2, 24);
    ctx.fillText('Timestamp T\u2082', midX + midX / 2, 24);

    // Draw T1 side
    for (const g of gaussians) {
      let color = '#52525b';
      let alpha = 0.3;

      if (eased > 0.5 && g.status === 'removed') {
        color = '#ef4444';
        alpha = 0.8;
      }

      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(g.x, g.y, 8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw T2 side
    for (const g of gaussians) {
      if (g.status === 'removed') continue;

      const gx = g.x + midX;
      let color = '#52525b';
      let alpha = 0.3;

      if (eased > 0.5) {
        if (g.status === 'changed') { color = '#f59e0b'; alpha = 0.8; }
        if (g.status === 'added') { color = '#3b82f6'; alpha = 0.8; }
      }

      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(gx, g.y, 8, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;

    // Legend
    if (eased > 0.6) {
      const legendY = h - 16;
      const legendAlpha = Math.min(1, (eased - 0.6) * 5);
      ctx.globalAlpha = legendAlpha;
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'left';

      const items = [
        { color: '#52525b', label: 'Unchanged' },
        { color: '#f59e0b', label: 'Changed' },
        { color: '#3b82f6', label: 'Added' },
        { color: '#ef4444', label: 'Removed' },
      ];
      let lx = 20;
      for (const item of items) {
        ctx.fillStyle = item.color;
        ctx.beginPath();
        ctx.arc(lx, legendY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#71717a';
        ctx.fillText(item.label, lx + 10, legendY + 4);
        lx += ctx.measureText(item.label).width + 30;
      }
      ctx.globalAlpha = 1;
    }

    if (progress < 1) {
      requestAnimationFrame(draw);
    }
  }

  const diffObserver = new IntersectionObserver(
    entries => {
      if (entries[0].isIntersecting && !started) {
        started = true;
        draw();
      }
    },
    { threshold: 0.2 }
  );
  diffObserver.observe(canvas);
}

// ---------------------------------------------------------------------------
// Hero Canvas — Data flowing into compressed segments
// ---------------------------------------------------------------------------

function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = setupCanvas(canvas);
  if (!ctx) return;

  const w = canvas.width / (window.devicePixelRatio || 1);
  const h = canvas.height / (window.devicePixelRatio || 1);

  const particles = [];
  for (let i = 0; i < 80; i++) {
    particles.push({
      x: Math.random() * w * 0.4,
      y: Math.random() * h,
      vx: 0.3 + Math.random() * 0.5,
      vy: (Math.random() - 0.5) * 0.3,
      color: ENTITY_COLORS[Math.floor(Math.random() * 5)],
      size: 1.5 + Math.random() * 2,
      alpha: 0.3 + Math.random() * 0.5,
    });
  }

  // Output segments on right side
  const outputSegments = ENTITY_COLORS.map((color, i) => ({
    color,
    y: 20 + i * (h - 40) / 5,
    segH: (h - 40) / 5 - 8,
    width: 0,
    targetWidth: 60 + Math.random() * 80,
  }));

  function draw() {
    ctx.clearRect(0, 0, w, h);

    // Draw particles flowing right
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x > w * 0.55) {
        p.x = -5;
        p.y = Math.random() * h;
      }
      if (p.y < 0 || p.y > h) p.vy *= -1;

      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Convergence zone
    ctx.globalAlpha = 0.03;
    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.ellipse(w * 0.55, h / 2, 30, h * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Output segments
    const segX = w * 0.62;
    for (const seg of outputSegments) {
      seg.width = Math.min(seg.width + 0.3, seg.targetWidth);
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = seg.color;
      ctx.beginPath();
      ctx.roundRect(segX, seg.y, seg.width, seg.segH, 6);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  draw();
}

// ---------------------------------------------------------------------------
// Initialize all visualizations
// ---------------------------------------------------------------------------

window.addEventListener('DOMContentLoaded', () => {
  initHeroCanvas();
  initCompressionViz();
  initKnnViz();
  initSceneDiffViz();
});

// Handle resize
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    segmentProgress = 0;
    compressionAnimated = false;
    initCompressionViz();
    initKnnViz();
    initSceneDiffViz();
    initHeroCanvas();
  }, 250);
});
