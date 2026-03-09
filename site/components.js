/**
 * VectorScaleDB — Shared UI components
 * Used across api.html, docs, cloud dashboard, etc.
 */
const VsdbComponents = {
  /**
   * Copy text to clipboard with visual feedback on a button.
   * @param {string} text - Text to copy
   * @param {HTMLElement} btn - Button element to show feedback on
   */
  copyToClipboard(text, btn) {
    navigator.clipboard.writeText(text).then(() => {
      btn.textContent = 'Copied!';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.textContent = 'Copy';
        btn.classList.remove('copied');
      }, 1500);
    });
  },

  /**
   * Copy code from a code block's sibling pre element.
   * Used as onclick handler on static code block copy buttons.
   * @param {HTMLElement} btn - The copy button element
   */
  copyCode(btn) {
    const block = btn.closest('.docs-code-block');
    if (!block) return;
    const code = block.querySelector('pre code') || block.querySelector('pre');
    if (!code) return;
    this.copyToClipboard(code.textContent, btn);
  },

  /**
   * Initialize nav scroll effect and mobile hamburger menu.
   * Call once on DOMContentLoaded or at end of body.
   */
  initNav() {
    const nav = document.getElementById('nav');
    if (nav) {
      window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 20);
      });
    }

    const hamburger = document.getElementById('nav-hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileClose = document.getElementById('mobile-menu-close');

    if (hamburger && mobileMenu) {
      hamburger.addEventListener('click', () => {
        mobileMenu.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    }
    if (mobileClose && mobileMenu) {
      mobileClose.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    }
    document.querySelectorAll('.mobile-menu-links a').forEach(link => {
      link.addEventListener('click', () => {
        if (mobileMenu) {
          mobileMenu.classList.remove('open');
          document.body.style.overflow = '';
        }
      });
    });
  }
};
