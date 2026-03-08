// Intersection Observer for fade-in animations.
document.addEventListener("DOMContentLoaded", () => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll(".fade-in").forEach((el) => observer.observe(el));

  // Tab switching for code examples.
  document.querySelectorAll(".code-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      const group = tab.closest(".code-example");
      group
        .querySelectorAll(".code-tab")
        .forEach((t) => t.classList.remove("active"));
      group
        .querySelectorAll(".code-panel")
        .forEach((p) => p.classList.remove("active"));
      tab.classList.add("active");
      const panel = group.querySelector(
        `[data-panel="${tab.dataset.tab}"]`
      );
      if (panel) panel.classList.add("active");
    });
  });

  // Smooth scrolling for nav links.
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  // Counter animation for stats
  function animateCounter(element, target, suffix) {
    suffix = suffix || "";
    const duration = 2000;
    const start = performance.now();
    const isNumber = !isNaN(parseFloat(target));

    if (!isNumber) {
      element.textContent = target;
      return;
    }

    const numTarget = parseFloat(target);

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic

      const current = Math.round(numTarget * eased);
      element.textContent = current.toLocaleString() + suffix;

      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  // Compression counter animation
  function animateCompression(element) {
    const stages = [
      { value: "10x", delay: 0 },
      { value: "100x", delay: 800 },
      { value: "1,000x", delay: 1600 },
    ];

    stages.forEach(function (stage) {
      setTimeout(function () {
        element.textContent = stage.value;
        element.style.transform = "scale(1.1)";
        setTimeout(function () {
          element.style.transform = "scale(1)";
        }, 200);
      }, stage.delay);
    });
  }

  // Observe stat counters
  const statObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !entry.target.dataset.animated) {
          entry.target.dataset.animated = "true";
          const target = entry.target.dataset.target;
          const suffix = entry.target.dataset.suffix || "";
          if (entry.target.classList.contains("viz-counter")) {
            animateCompression(entry.target);
          } else {
            entry.target.textContent = target + suffix;
          }
        }
      });
    },
    { threshold: 0.5 }
  );

  document.querySelectorAll(".stat-number, .viz-counter").forEach((el) => {
    statObserver.observe(el);
  });

  // Compression Visualizer - Raw data canvas
  function initCompressionViz() {
    const rawCanvas = document.getElementById("raw-canvas");
    const compCanvas = document.getElementById("compressed-canvas");

    if (!rawCanvas || !compCanvas) return;

    const rawCtx = rawCanvas.getContext("2d");
    const compCtx = compCanvas.getContext("2d");

    function resizeCanvas(canvas) {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    }

    resizeCanvas(rawCanvas);
    resizeCanvas(compCanvas);

    // Raw data: scattered dots appearing over time
    const rawDots = [];
    const maxRawDots = 200;
    let rawAnimId = null;

    function addRawDot() {
      if (rawDots.length < maxRawDots) {
        rawDots.push({
          x: Math.random() * rawCanvas.width,
          y: 30 + Math.random() * (rawCanvas.height - 40),
          r: 1.5 + Math.random() * 2,
          alpha: 0.3 + Math.random() * 0.5,
          color:
            Math.random() > 0.5
              ? "59, 130, 246"
              : "139, 92, 246",
        });
      }
    }

    function drawRaw() {
      rawCtx.clearRect(0, 0, rawCanvas.width, rawCanvas.height);

      // Add new dots periodically
      if (Math.random() > 0.6) addRawDot();
      if (Math.random() > 0.8) addRawDot();

      rawDots.forEach(function (dot) {
        rawCtx.beginPath();
        rawCtx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
        rawCtx.fillStyle =
          "rgba(" + dot.color + ", " + dot.alpha + ")";
        rawCtx.fill();
      });

      rawAnimId = requestAnimationFrame(drawRaw);
    }

    // Compressed data: segments (horizontal bars)
    const segments = [
      { y: 50, width: 0.7, color: "59, 130, 246" },
      { y: 80, width: 0.5, color: "139, 92, 246" },
      { y: 110, width: 0.85, color: "59, 130, 246" },
      { y: 140, width: 0.4, color: "139, 92, 246" },
      { y: 170, width: 0.6, color: "59, 130, 246" },
    ];

    let segmentProgress = 0;
    let compAnimId = null;

    function drawCompressed() {
      compCtx.clearRect(0, 0, compCanvas.width, compCanvas.height);

      segmentProgress = Math.min(segmentProgress + 0.005, 1);
      const eased = 1 - Math.pow(1 - segmentProgress, 3);

      segments.forEach(function (seg) {
        const w = seg.width * (compCanvas.width - 40) * eased;
        const barHeight = 12;

        // Glow effect
        compCtx.shadowColor = "rgba(" + seg.color + ", 0.4)";
        compCtx.shadowBlur = 8;

        // Bar
        compCtx.fillStyle = "rgba(" + seg.color + ", 0.6)";
        compCtx.beginPath();
        compCtx.roundRect(20, seg.y - barHeight / 2, w, barHeight, 4);
        compCtx.fill();

        // Reset shadow
        compCtx.shadowBlur = 0;

        // End cap glow
        if (eased > 0.5) {
          compCtx.beginPath();
          compCtx.arc(20 + w, seg.y, 4, 0, Math.PI * 2);
          compCtx.fillStyle = "rgba(" + seg.color + ", 0.8)";
          compCtx.fill();
        }
      });

      if (segmentProgress < 1) {
        compAnimId = requestAnimationFrame(drawCompressed);
      }
    }

    // Start animations when visible
    const vizObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !entry.target.dataset.vizStarted) {
            entry.target.dataset.vizStarted = "true";
            drawRaw();
            drawCompressed();
          }
        });
      },
      { threshold: 0.3 }
    );

    const vizSection = document.getElementById("compression");
    if (vizSection) {
      vizObserver.observe(vizSection);
    }

    // Handle resize
    window.addEventListener("resize", function () {
      resizeCanvas(rawCanvas);
      resizeCanvas(compCanvas);
      segmentProgress = 0;
    });
  }

  initCompressionViz();
});
