/**
 * VectorScaleDB — Shared docs infrastructure
 * Provides sidebar, nav, footer, code blocks, endpoint cards, and search.
 */
const VsdbDocs = {

  /* --------------------------------------------------
     Sidebar navigation structure
     -------------------------------------------------- */
  _nav: [
    {
      section: 'Getting Started',
      links: [
        { label: 'Overview', href: 'docs/index.html' }
      ]
    },
    {
      section: 'API Reference',
      links: [
        { label: 'Overview',        href: 'docs/api.html' },
        { label: 'Core',            href: 'docs/api.html#core' },
        { label: 'Ingestion',       href: 'docs/api.html#ingestion' },
        { label: 'Queries',         href: 'docs/api.html#queries' },
        { label: 'Domain Queries',  href: 'docs/api.html#domain' },
        { label: 'Patterns',        href: 'docs/api.html#patterns' },
        { label: 'Gaussian / Scene', href: 'docs/api.html#gaussian' },
        { label: 'Streaming',       href: 'docs/api.html#streaming' },
        { label: 'Enterprise',      href: 'docs/api.html#enterprise' },
        { label: 'GraphQL',         href: 'docs/api.html#graphql' }
      ]
    },
    {
      section: 'SDKs',
      links: [
        { label: 'Python',  href: 'docs/sdks.html#python' },
        { label: 'Rust',    href: 'docs/sdks.html#rust' },
        { label: 'Node.js', href: 'docs/sdks.html#nodejs' }
      ]
    },
    {
      section: 'Reference',
      links: [
        { label: 'Entity Types',   href: 'docs/entity-types.html' },
        { label: 'Configuration',  href: 'docs/configuration.html' }
      ]
    },
    {
      section: 'Support',
      links: [
        { label: 'FAQ', href: 'docs/faq.html' }
      ]
    }
  ],

  /* --------------------------------------------------
     Path helpers
     -------------------------------------------------- */

  /**
   * Determine if we are inside the docs/ subdirectory by checking the URL path.
   * Returns '../' if inside docs/, '' if at site root.
   */
  _rootPrefix() {
    var path = window.location.pathname;
    // If the URL contains /docs/ we are one level deep
    if (path.indexOf('/docs/') !== -1 || path.endsWith('/docs')) {
      return '../';
    }
    return '';
  },

  /**
   * Resolve an href from the nav structure relative to current page depth.
   */
  _resolve(href) {
    var prefix = this._rootPrefix();
    return prefix + href;
  },

  /* --------------------------------------------------
     Sidebar
     -------------------------------------------------- */

  /**
   * Render the sidebar HTML into a container element.
   * @param {HTMLElement} container
   * @param {string} currentPage - identifier like 'docs/api.html'
   */
  renderSidebar(container, currentPage) {
    if (!container) return;

    var prefix = this._rootPrefix();

    var html = '';

    // Header
    html += '<div class="docs-sidebar-header">';
    html += '<a href="' + prefix + 'index.html">';
    html += '<img src="' + prefix + 'logo.svg" alt="VectorScaleDB">';
    html += '</a>';
    html += '<span>Docs</span>';
    html += '</div>';

    // Search
    html += '<div class="docs-search">';
    html += '<input type="text" id="docs-search-input" placeholder="Search docs..." autocomplete="off">';
    html += '</div>';

    // Nav sections
    html += '<nav class="docs-sidebar-nav">';

    for (var i = 0; i < this._nav.length; i++) {
      var group = this._nav[i];
      html += '<div class="docs-sidebar-section">' + group.section + '</div>';
      for (var j = 0; j < group.links.length; j++) {
        var link = group.links[j];
        var resolved = this._resolve(link.href);
        var isActive = this._isActive(link.href, currentPage);
        html += '<a class="docs-sidebar-link' + (isActive ? ' active' : '') + '" href="' + resolved + '">';
        html += link.label;
        html += '</a>';
      }
    }

    html += '</nav>';

    container.innerHTML = html;
  },

  /**
   * Check if a nav href matches the current page.
   */
  _isActive(href, currentPage) {
    if (!currentPage) return false;
    // Strip hash for page-level match
    var hrefPage = href.split('#')[0];
    var currentBase = currentPage.split('#')[0];
    // Exact match for non-hash links
    if (href === currentPage) return true;
    // If there is a hash in the URL, match against that
    if (window.location.hash && href.indexOf('#') !== -1) {
      return hrefPage === currentBase && href.split('#')[1] === window.location.hash.slice(1);
    }
    // Page-level match for links without hash when currentPage has no hash
    if (href.indexOf('#') === -1 && hrefPage === currentBase) return true;
    return false;
  },

  /* --------------------------------------------------
     Active link highlighting
     -------------------------------------------------- */

  setActiveLink() {
    var links = document.querySelectorAll('.docs-sidebar-link');
    var current = window.location.pathname + window.location.hash;

    links.forEach(function(link) {
      var href = link.getAttribute('href');
      // Normalize trailing slashes and compare
      var linkPath = link.href; // full URL
      var isCurrent = (window.location.href.split('?')[0] === linkPath.split('?')[0]);
      link.classList.toggle('active', isCurrent);
    });
  },

  /* --------------------------------------------------
     Sidebar toggle (mobile)
     -------------------------------------------------- */

  initSidebar() {
    var sidebar = document.querySelector('.docs-sidebar');
    var toggle = document.querySelector('.docs-sidebar-toggle');
    var overlay = document.querySelector('.docs-sidebar-overlay');

    if (!sidebar || !toggle) return;

    toggle.addEventListener('click', function() {
      var isOpen = sidebar.classList.toggle('open');
      if (overlay) overlay.classList.toggle('active', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    if (overlay) {
      overlay.addEventListener('click', function() {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
      });
    }

    // Close on link click (mobile)
    sidebar.addEventListener('click', function(e) {
      if (e.target.classList.contains('docs-sidebar-link')) {
        sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  },

  /* --------------------------------------------------
     Search
     -------------------------------------------------- */

  initSearch() {
    var input = document.getElementById('docs-search-input');
    if (!input) return;

    input.addEventListener('input', function() {
      var query = input.value.toLowerCase().trim();
      var links = document.querySelectorAll('.docs-sidebar-link');
      var sections = document.querySelectorAll('.docs-sidebar-section');

      links.forEach(function(link) {
        var text = link.textContent.toLowerCase();
        if (!query || text.indexOf(query) !== -1) {
          link.removeAttribute('hidden');
        } else {
          link.setAttribute('hidden', '');
        }
      });

      // Hide section headers if all their links are hidden
      sections.forEach(function(section) {
        var next = section.nextElementSibling;
        var anyVisible = false;
        while (next && !next.classList.contains('docs-sidebar-section')) {
          if (next.classList.contains('docs-sidebar-link') && !next.hasAttribute('hidden')) {
            anyVisible = true;
          }
          next = next.nextElementSibling;
        }
        section.style.display = anyVisible || !query ? '' : 'none';
      });
    });
  },

  /* --------------------------------------------------
     Nav bar (shared with main site)
     -------------------------------------------------- */

  renderNav(container) {
    if (!container) return;

    var prefix = this._rootPrefix();

    var html = '';
    html += '<nav class="nav" id="nav">';
    html += '<div class="nav-container">';
    html += '<a href="' + prefix + 'index.html" class="nav-logo-link"><img src="' + prefix + 'logo.svg" alt="VectorScaleDB" class="nav-logo"></a>';
    html += '<ul class="nav-links">';
    html += '<li><a href="' + prefix + 'index.html#capabilities">Capabilities</a></li>';
    html += '<li><a href="' + prefix + 'index.html#use-cases">Use Cases</a></li>';
    html += '<li><a href="' + prefix + 'index.html#architecture">Architecture</a></li>';
    html += '<li><a href="' + prefix + 'index.html#comparison">Compare</a></li>';
    html += '<li><a href="' + prefix + 'docs/index.html">Docs</a></li>';
    html += '</ul>';
    html += '<a href="mailto:demo@vectorscaledb.com?subject=VectorScaleDB%20Demo%20Request" class="nav-cta">';
    html += '<span class="nav-cta-full">Request Demo</span><span class="nav-cta-short">Demo</span>';
    html += '</a>';
    html += '<button class="nav-hamburger" id="nav-hamburger" aria-label="Open menu">';
    html += '<span></span><span></span><span></span>';
    html += '</button>';
    html += '</div>';
    html += '</nav>';

    // Mobile menu
    html += '<div class="mobile-menu" id="mobile-menu">';
    html += '<button class="mobile-menu-close" id="mobile-menu-close" aria-label="Close menu">&times;</button>';
    html += '<ul class="mobile-menu-links">';
    html += '<li><a href="' + prefix + 'index.html#capabilities">Capabilities</a></li>';
    html += '<li><a href="' + prefix + 'index.html#use-cases">Use Cases</a></li>';
    html += '<li><a href="' + prefix + 'index.html#architecture">Architecture</a></li>';
    html += '<li><a href="' + prefix + 'index.html#comparison">Compare</a></li>';
    html += '<li><a href="' + prefix + 'docs/index.html">Docs</a></li>';
    html += '</ul>';
    html += '<a href="mailto:demo@vectorscaledb.com?subject=VectorScaleDB%20Demo%20Request" class="nav-cta" style="margin-top: 2rem;">Request Demo</a>';
    html += '</div>';

    container.innerHTML = html;
  },

  /* --------------------------------------------------
     Footer (shared with main site)
     -------------------------------------------------- */

  renderFooter(container) {
    if (!container) return;

    var prefix = this._rootPrefix();

    var html = '';
    html += '<footer class="footer">';
    html += '<div class="container">';
    html += '<div class="footer-grid">';

    // Brand
    html += '<div class="footer-brand">';
    html += '<img src="' + prefix + 'logo.svg" alt="VectorScaleDB" class="nav-logo" style="margin-bottom: 1rem;">';
    html += '<p class="card-description">The temporal-semantic hybrid database. Built with Rust.</p>';
    html += '</div>';

    // Product
    html += '<div>';
    html += '<div class="footer-heading">Product</div>';
    html += '<ul class="footer-links">';
    html += '<li><a href="' + prefix + 'index.html#capabilities">Capabilities</a></li>';
    html += '<li><a href="' + prefix + 'docs/api.html">API Reference</a></li>';
    html += '<li><a href="' + prefix + 'index.html#comparison">Compare</a></li>';
    html += '<li><a href="' + prefix + 'index.html#roadmap">Roadmap</a></li>';
    html += '</ul>';
    html += '</div>';

    // Resources
    html += '<div>';
    html += '<div class="footer-heading">Resources</div>';
    html += '<ul class="footer-links">';
    html += '<li><a href="' + prefix + 'docs/index.html">Documentation</a></li>';
    html += '<li><a href="' + prefix + 'docs/api.html">API Reference</a></li>';
    html += '<li><a href="mailto:sales@vectorscaledb.com">Enterprise Inquiries</a></li>';
    html += '</ul>';
    html += '</div>';

    // Connect
    html += '<div>';
    html += '<div class="footer-heading">Connect</div>';
    html += '<ul class="footer-links">';
    html += '<li><a href="https://vectorscaledb.com">vectorscaledb.com</a></li>';
    html += '<li><a href="mailto:demo@vectorscaledb.com">Contact</a></li>';
    html += '</ul>';
    html += '</div>';

    html += '</div>'; // footer-grid

    // Bottom
    html += '<div class="footer-bottom">';
    html += '<span>&copy; 2025-2026 VectorScaleDB. All rights reserved.</span>';
    html += '<span class="patent-badge">Patent Pending</span>';
    html += '</div>';

    html += '</div>'; // container
    html += '</footer>';

    container.innerHTML = html;
  },

  /* --------------------------------------------------
     Code block renderer
     -------------------------------------------------- */

  /**
   * Render a code block with copy button.
   * @param {HTMLElement} container - Target element
   * @param {string} code - Raw code text
   * @param {string} language - Language label (e.g. 'bash', 'json', 'python')
   */
  /**
   * Lightweight syntax highlighter for JSON and bash code strings.
   * Returns HTML string with spans for keys, strings, numbers, comments.
   */
  _highlight(code, language) {
    // Strip any existing <span> tags (legacy data) to get plain text
    var plain = code.replace(/<span[^>]*>/g, '').replace(/<\/span>/g, '');
    // Escape HTML entities
    var escaped = plain.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    if (language === 'json') {
      return escaped
        .replace(/("(?:[^"\\]|\\.)*")\s*:/g, '<span class="k">$1</span>:')   // keys
        .replace(/:\s*("(?:[^"\\]|\\.)*")/g, ': <span class="s">$1</span>')   // string values
        .replace(/:\s*(\d+(?:\.\d+)?(?:e[+-]?\d+)?)/gi, ': <span class="n">$1</span>') // numbers
        .replace(/\[("(?:[^"\\]|\\.)*")/g, '[<span class="s">$1</span>')      // strings in arrays
        .replace(/,\s*("(?:[^"\\]|\\.)*")(?=\s*[,\]])/g, ', <span class="s">$1</span>');
    }
    if (language === 'bash' || language === 'curl') {
      return escaped
        .replace(/(#[^\n]*)/g, '<span class="c">$1</span>')                   // comments
        .replace(/("(?:[^"\\]|\\.)*")/g, '<span class="s">$1</span>')         // strings
        .replace(/('(?:[^'\\]|\\.)*')/g, '<span class="s">$1</span>');        // single-quote strings
    }
    return escaped;
  },

  renderCodeBlock(container, code, language) {
    if (!container) return;

    var el = document.createElement('div');
    el.className = 'docs-code-block';

    var header = document.createElement('div');
    header.className = 'docs-code-block-header';

    var lang = document.createElement('span');
    lang.className = 'docs-code-block-lang';
    lang.textContent = language || '';

    // Strip spans for clean clipboard text
    var plainCode = code.replace(/<span[^>]*>/g, '').replace(/<\/span>/g, '');
    var copyBtn = document.createElement('button');
    copyBtn.className = 'docs-code-block-copy';
    copyBtn.textContent = 'Copy';
    copyBtn.addEventListener('click', function() {
      VsdbComponents.copyToClipboard(plainCode, copyBtn);
    });

    header.appendChild(lang);
    header.appendChild(copyBtn);

    var pre = document.createElement('pre');
    var codeEl = document.createElement('code');
    codeEl.innerHTML = this._highlight(code, language);
    pre.appendChild(codeEl);

    el.appendChild(header);
    el.appendChild(pre);
    container.appendChild(el);
  },

  /* --------------------------------------------------
     Endpoint card renderer
     -------------------------------------------------- */

  /**
   * Render an endpoint card.
   * @param {HTMLElement} container
   * @param {Object} opts - { method, path, desc, request, response, curl }
   */
  renderEndpoint(container, opts) {
    if (!container) return;

    var method = (opts.method || 'GET').toUpperCase();
    var methodClass = 'docs-method docs-method--' + method.toLowerCase();

    var el = document.createElement('div');
    el.className = 'docs-endpoint';

    // Header
    var headerEl = document.createElement('div');
    headerEl.className = 'docs-endpoint-header';

    var badge = document.createElement('span');
    badge.className = methodClass;
    badge.textContent = method;

    var pathEl = document.createElement('span');
    pathEl.className = 'docs-endpoint-path';
    pathEl.textContent = opts.path || '';

    headerEl.appendChild(badge);
    headerEl.appendChild(pathEl);
    el.appendChild(headerEl);

    // Body
    var body = document.createElement('div');
    body.className = 'docs-endpoint-body';

    if (opts.desc) {
      var descEl = document.createElement('div');
      descEl.className = 'docs-endpoint-desc';
      descEl.textContent = opts.desc;
      body.appendChild(descEl);
    }

    // Request example
    if (opts.request) {
      var reqLabel = document.createElement('div');
      reqLabel.className = 'docs-endpoint-example-label';
      reqLabel.textContent = 'Request';
      body.appendChild(reqLabel);
      this.renderCodeBlock(body, opts.request, 'json');
    }

    // Response example
    if (opts.response) {
      var resLabel = document.createElement('div');
      resLabel.className = 'docs-endpoint-example-label';
      resLabel.textContent = 'Response';
      body.appendChild(resLabel);
      this.renderCodeBlock(body, opts.response, 'json');
    }

    // curl example
    if (opts.curl) {
      var curlLabel = document.createElement('div');
      curlLabel.className = 'docs-endpoint-example-label';
      curlLabel.textContent = 'curl';
      body.appendChild(curlLabel);
      this.renderCodeBlock(body, opts.curl, 'bash');
    }

    el.appendChild(body);
    container.appendChild(el);
  },

  /* --------------------------------------------------
     Endpoint group renderer
     -------------------------------------------------- */

  /**
   * Render a group of endpoints in a collapsible details element.
   * @param {HTMLElement} container
   * @param {Object} opts - { title, id, endpoints: [{method, path, desc, ...}], open }
   */
  renderEndpointGroup(container, opts) {
    if (!container) return;

    var details = document.createElement('details');
    details.className = 'docs-endpoint-group';
    if (opts.id) details.id = opts.id;
    if (opts.open) details.open = true;

    var summary = document.createElement('summary');
    summary.textContent = opts.title || '';
    details.appendChild(summary);

    var content = document.createElement('div');
    content.className = 'docs-endpoint-group-content';

    var endpoints = opts.endpoints || [];
    for (var i = 0; i < endpoints.length; i++) {
      this.renderEndpoint(content, endpoints[i]);
    }

    details.appendChild(content);
    container.appendChild(details);
  },

  /* --------------------------------------------------
     Parameter table renderer
     -------------------------------------------------- */

  /**
   * Render a parameter table.
   * @param {HTMLElement} container
   * @param {Array} params - [{name, type, default, desc}]
   */
  renderParamTable(container, params) {
    if (!container || !params || !params.length) return;

    var table = document.createElement('table');
    table.className = 'docs-param-table';

    var thead = document.createElement('thead');
    var headerRow = document.createElement('tr');
    var headers = ['Name', 'Type', 'Default', 'Description'];
    for (var h = 0; h < headers.length; h++) {
      var th = document.createElement('th');
      th.textContent = headers[h];
      headerRow.appendChild(th);
    }
    thead.appendChild(headerRow);
    table.appendChild(thead);

    var tbody = document.createElement('tbody');
    for (var i = 0; i < params.length; i++) {
      var p = params[i];
      var tr = document.createElement('tr');

      var tdName = document.createElement('td');
      tdName.textContent = p.name || '';
      tr.appendChild(tdName);

      var tdType = document.createElement('td');
      tdType.textContent = p.type || '';
      tr.appendChild(tdType);

      var tdDefault = document.createElement('td');
      tdDefault.textContent = p.default !== undefined ? p.default : '-';
      tr.appendChild(tdDefault);

      var tdDesc = document.createElement('td');
      tdDesc.textContent = p.desc || '';
      tr.appendChild(tdDesc);

      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    container.appendChild(table);
  },

  /* --------------------------------------------------
     Init
     -------------------------------------------------- */

  /**
   * Initialize all docs infrastructure.
   * @param {string} currentPage - e.g. 'docs/api.html' or 'docs/index.html'
   */
  init(currentPage) {
    this.renderNav(document.getElementById('docs-nav'));
    this.renderSidebar(document.getElementById('docs-sidebar'), currentPage);
    this.renderFooter(document.getElementById('docs-footer'));
    VsdbComponents.initNav();
    this.initSidebar();
    this.setActiveLink();
    this.initSearch();

    // Re-highlight active link on hash change
    var self = this;
    window.addEventListener('hashchange', function() {
      self.setActiveLink();
    });
  }
};
