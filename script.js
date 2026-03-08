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
});
