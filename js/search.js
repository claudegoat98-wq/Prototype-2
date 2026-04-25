/* ============================================
   NovaPulse Digital — Spotlight Search (⌘K)
   ============================================ */

const SearchEngine = {
  isOpen: false,
  selectedIndex: -1,
  results: [],

  // Searchable data
  pages: [
    { title: 'Home', url: 'index.html', type: 'page', icon: '🏠', desc: 'Landing page — hero, features, pricing' },
    { title: 'Store', url: 'store.html', type: 'page', icon: '🛒', desc: 'Browse and buy digital products' },
    { title: 'Blog', url: 'blog.html', type: 'page', icon: '📝', desc: 'Articles and creative insights' },
    { title: 'Dashboard', url: 'dashboard.html', type: 'page', icon: '📊', desc: 'Admin analytics dashboard' },
    { title: 'Contact', url: 'business-card.html', type: 'page', icon: '📇', desc: 'Business card & contact info' },
  ],

  blogs: [
    { title: 'The Rise of India\'s Creator Economy', type: 'blog', icon: '📰', desc: 'How Indian creators are building empires', url: 'blog.html#article-1' },
    { title: 'Lo-Fi Music Production Guide', type: 'blog', icon: '🎵', desc: 'Create your first lo-fi beat', url: 'blog.html#article-2' },
    { title: 'Bangalore Street Photography', type: 'blog', icon: '📸', desc: 'Capturing the essence of Namma Bengaluru', url: 'blog.html#article-3' },
    { title: 'Digital Marketing Strategies for India', type: 'blog', icon: '📈', desc: 'Growth hacks that work in the Indian market', url: 'blog.html#article-4' },
    { title: 'Video Production on a Budget', type: 'blog', icon: '🎬', desc: 'Professional videos with minimal gear', url: 'blog.html#article-5' },
    { title: 'Western Ghats Photography', type: 'blog', icon: '🏔️', desc: 'Nature photography in the Western Ghats', url: 'blog.html#article-6' },
    { title: 'UPI Payment Integration Guide', type: 'blog', icon: '💳', desc: 'Setting up UPI payments for your business', url: 'blog.html#article-7' },
  ],

  init() {
    this.createOverlay();
    this.bindKeys();
  },

  createOverlay() {
    if (document.getElementById('search-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'search-overlay';
    overlay.className = 'search-overlay';
    overlay.innerHTML = `
      <div class="search-modal">
        <div class="search-input-wrap">
          <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" class="search-input" id="search-input" placeholder="Search products, pages, blog..." autocomplete="off" />
          <kbd class="search-shortcut">ESC</kbd>
        </div>
        <div class="search-results" id="search-results">
          <div class="search-empty">
            <div style="font-size:2.5rem;margin-bottom:12px;">🔍</div>
            <p>Type to search across products, pages & blog</p>
            <div class="search-hints">
              <span><kbd>↑↓</kbd> Navigate</span>
              <span><kbd>↵</kbd> Open</span>
              <span><kbd>ESC</kbd> Close</span>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const input = document.getElementById('search-input');
    input.addEventListener('input', () => this.search(input.value));
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.close();
    });
  },

  bindKeys() {
    document.addEventListener('keydown', (e) => {
      // Ctrl+K or Cmd+K to open
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.isOpen ? this.close() : this.open();
      }

      if (!this.isOpen) return;

      // ESC to close
      if (e.key === 'Escape') {
        this.close();
      }

      // Arrow navigation
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.selectedIndex = Math.min(this.selectedIndex + 1, this.results.length - 1);
        this.highlightResult();
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
        this.highlightResult();
      }

      // Enter to navigate
      if (e.key === 'Enter' && this.results[this.selectedIndex]) {
        window.location.href = this.results[this.selectedIndex].url;
      }
    });
  },

  open() {
    const overlay = document.getElementById('search-overlay');
    if (!overlay) return;
    overlay.classList.add('active');
    this.isOpen = true;
    document.getElementById('search-input').focus();
    document.body.style.overflow = 'hidden';
  },

  close() {
    const overlay = document.getElementById('search-overlay');
    if (!overlay) return;
    overlay.classList.remove('active');
    this.isOpen = false;
    document.getElementById('search-input').value = '';
    this.selectedIndex = -1;
    document.body.style.overflow = '';
  },

  fuzzyMatch(query, text) {
    query = query.toLowerCase();
    text = text.toLowerCase();
    if (text.includes(query)) return true;
    let qi = 0;
    for (let ti = 0; ti < text.length && qi < query.length; ti++) {
      if (text[ti] === query[qi]) qi++;
    }
    return qi === query.length;
  },

  search(query) {
    const container = document.getElementById('search-results');
    if (!query.trim()) {
      container.innerHTML = `
        <div class="search-empty">
          <div style="font-size:2.5rem;margin-bottom:12px;">🔍</div>
          <p>Type to search across products, pages & blog</p>
          <div class="search-hints">
            <span><kbd>↑↓</kbd> Navigate</span>
            <span><kbd>↵</kbd> Open</span>
            <span><kbd>ESC</kbd> Close</span>
          </div>
        </div>`;
      this.results = [];
      return;
    }

    this.results = [];
    this.selectedIndex = 0;

    // Search products
    if (window.PRODUCTS) {
      const productResults = window.PRODUCTS.filter(p =>
        this.fuzzyMatch(query, p.name) || this.fuzzyMatch(query, p.category) || this.fuzzyMatch(query, p.description)
      ).map(p => ({
        title: p.name,
        desc: `${p.category} — ${window.formatINR ? formatINR(p.price) : '₹' + p.price}`,
        icon: p.category === 'eBook' ? '📖' : p.category === 'Music' ? '🎵' : p.category === 'Photography' ? '📸' : '🎬',
        type: 'product',
        url: 'store.html',
        color: p.color
      }));
      this.results.push(...productResults);
    }

    // Search pages
    const pageResults = this.pages.filter(p => this.fuzzyMatch(query, p.title) || this.fuzzyMatch(query, p.desc));
    this.results.push(...pageResults);

    // Search blogs
    const blogResults = this.blogs.filter(b => this.fuzzyMatch(query, b.title) || this.fuzzyMatch(query, b.desc));
    this.results.push(...blogResults);

    // Render
    if (this.results.length === 0) {
      container.innerHTML = `
        <div class="search-empty">
          <div style="font-size:2.5rem;margin-bottom:12px;">😔</div>
          <p>No results for "${query}"</p>
        </div>`;
      return;
    }

    const grouped = {};
    this.results.forEach(r => {
      if (!grouped[r.type]) grouped[r.type] = [];
      grouped[r.type].push(r);
    });

    const typeLabels = { product: '🛍️ Products', page: '📄 Pages', blog: '📰 Blog' };
    let html = '';
    let globalIdx = 0;

    for (const type of ['product', 'page', 'blog']) {
      if (!grouped[type]) continue;
      html += `<div class="search-group-label">${typeLabels[type]}</div>`;
      grouped[type].forEach(r => {
        html += `
          <a href="${r.url}" class="search-result-item ${globalIdx === this.selectedIndex ? 'selected' : ''}" data-index="${globalIdx}">
            <span class="search-result-icon" ${r.color ? `style="background:${r.color}22;color:${r.color}"` : ''}>${r.icon}</span>
            <div class="search-result-text">
              <div class="search-result-title">${this.highlightText(r.title, query)}</div>
              <div class="search-result-desc">${r.desc}</div>
            </div>
            <span class="search-result-arrow">↵</span>
          </a>`;
        globalIdx++;
      });
    }

    container.innerHTML = html;

    // Hover to select
    container.querySelectorAll('.search-result-item').forEach(item => {
      item.addEventListener('mouseenter', () => {
        this.selectedIndex = parseInt(item.dataset.index);
        this.highlightResult();
      });
    });
  },

  highlightText(text, query) {
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return text.slice(0, idx) + '<mark>' + text.slice(idx, idx + query.length) + '</mark>' + text.slice(idx + query.length);
  },

  highlightResult() {
    document.querySelectorAll('.search-result-item').forEach((item, i) => {
      item.classList.toggle('selected', i === this.selectedIndex);
    });
    // Scroll into view
    const selected = document.querySelector('.search-result-item.selected');
    if (selected) selected.scrollIntoView({ block: 'nearest' });
  }
};

document.addEventListener('DOMContentLoaded', () => SearchEngine.init());
window.SearchEngine = SearchEngine;
