/* ============================================
   NovaPulse — Mega Upgrades JS
   All 15 features in one file
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initCustomCursor();
  initThemeToggle();
  initFlashSale();
  initSocialProof();
  initLiveVisitors();
  initTestimonialCarousel();
  initQuickView();
  initWishlist();
  initBadges();
  initPWA();
  initComparisonSliders();
  initRecommendations();
  upgradeHero();
});

/* ===== 1. CUSTOM CURSOR ===== */
function initCustomCursor() {
  if ('ontouchstart' in window) return;
  const dot = document.createElement('div'); dot.className = 'cursor-dot';
  const ring = document.createElement('div'); ring.className = 'cursor-ring';
  document.body.appendChild(dot); document.body.appendChild(ring);
  let mx = 0, my = 0, dx = 0, dy = 0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; dot.style.left = mx + 'px'; dot.style.top = my + 'px'; });
  function lerp() { dx += (mx - dx) * 0.15; dy += (my - dy) * 0.15; ring.style.left = dx + 'px'; ring.style.top = dy + 'px'; requestAnimationFrame(lerp); }
  lerp();
  document.querySelectorAll('a,button,.btn,.product-card,.tilt-card,.nav-cart,.music-btn').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
  });
}

/* ===== 2. THEME TOGGLE ===== */
function initThemeToggle() {
  const saved = localStorage.getItem('novapulse_theme');
  if (saved) document.documentElement.setAttribute('data-theme', saved);
  const toggle = document.createElement('div');
  toggle.className = 'theme-toggle';
  toggle.title = 'Toggle Dark/Light Mode';
  toggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('novapulse_theme', next);
  });
  const navActions = document.querySelector('.nav-actions');
  if (navActions) navActions.prepend(toggle);
}

/* ===== 3. FLASH SALE BANNER ===== */
function initFlashSale() {
  if (sessionStorage.getItem('sale_dismissed')) return;
  const bar = document.createElement('div');
  bar.className = 'flash-sale-bar';
  bar.innerHTML = `🔥 <strong>FLASH SALE</strong> — 40% OFF All Products! Ends in <span class="countdown"><span id="fs-h">00</span>:<span id="fs-m">00</span>:<span id="fs-s">00</span></span><button class="close-sale" id="close-sale">✕</button>`;
  document.body.prepend(bar);
  requestAnimationFrame(() => { bar.classList.add('visible'); document.body.classList.add('has-flash-sale'); });
  // Countdown: 6 hours from now
  let end = Date.now() + 6 * 3600000;
  const stored = sessionStorage.getItem('sale_end');
  if (stored) end = parseInt(stored); else sessionStorage.setItem('sale_end', end);
  function tick() {
    const left = Math.max(0, end - Date.now());
    const h = Math.floor(left / 3600000), m = Math.floor((left % 3600000) / 60000), s = Math.floor((left % 60000) / 1000);
    const eh = document.getElementById('fs-h'), em = document.getElementById('fs-m'), es = document.getElementById('fs-s');
    if (eh) eh.textContent = String(h).padStart(2, '0');
    if (em) em.textContent = String(m).padStart(2, '0');
    if (es) es.textContent = String(s).padStart(2, '0');
    if (left > 0) setTimeout(tick, 1000);
  }
  tick();
  document.getElementById('close-sale')?.addEventListener('click', () => {
    bar.classList.remove('visible'); document.body.classList.remove('has-flash-sale');
    sessionStorage.setItem('sale_dismissed', '1');
    setTimeout(() => bar.remove(), 500);
  });
}

/* ===== 4. SOCIAL PROOF POPUPS ===== */
function initSocialProof() {
  const names = [
    { name: 'Priya', city: 'Delhi', product: 'Cosmic Beats Vol. 1', emoji: '🎵' },
    { name: 'Arjun', city: 'Mumbai', product: "Digital Creator's Handbook", emoji: '📖' },
    { name: 'Sneha', city: 'Pune', product: 'Urban Aesthetics Collection', emoji: '📸' },
    { name: 'Vikram', city: 'Chennai', product: 'Motion Graphics Kit', emoji: '🎬' },
    { name: 'Ananya', city: 'Kolkata', product: 'Marketing Mastery Guide', emoji: '📖' },
    { name: 'Rohit', city: 'Hyderabad', product: 'Cinematic LUTs Pack', emoji: '🎬' },
    { name: 'Meera', city: 'Jaipur', product: 'Ambient Dreamscapes', emoji: '🎵' },
    { name: 'Karthik', city: 'Bangalore', product: "Nature's Canvas Portfolio", emoji: '📸' },
  ];
  let popup = document.createElement('div');
  popup.className = 'social-proof';
  popup.innerHTML = `<div class="social-proof-avatar"></div><div class="social-proof-text"><div></div><div class="social-proof-time"></div></div>`;
  document.body.appendChild(popup);
  let idx = 0;
  function showProof() {
    const n = names[idx % names.length];
    const mins = Math.floor(Math.random() * 15) + 1;
    popup.querySelector('.social-proof-avatar').textContent = n.emoji;
    popup.querySelector('.social-proof-text div:first-child').innerHTML = `<strong>${n.name}</strong> from ${n.city} bought <strong>${n.product}</strong>`;
    popup.querySelector('.social-proof-time').textContent = `${mins} min ago`;
    popup.classList.add('visible');
    setTimeout(() => popup.classList.remove('visible'), 5000);
    idx++;
  }
  setTimeout(showProof, 8000);
  setInterval(showProof, 18000);
}

/* ===== 5. LIVE VISITORS ===== */
function initLiveVisitors() {
  const nav = document.querySelector('.navbar .container');
  if (!nav) return;
  const el = document.createElement('div');
  el.className = 'live-visitors';
  el.innerHTML = `<span class="live-dot"></span><span id="live-count">0</span> viewing`;
  const brand = nav.querySelector('.nav-brand');
  if (brand) brand.after(el);
  let count = 200 + Math.floor(Math.random() * 200);
  document.getElementById('live-count').textContent = count;
  setInterval(() => {
    count += Math.floor(Math.random() * 7) - 3;
    count = Math.max(150, Math.min(500, count));
    const el = document.getElementById('live-count');
    if (el) el.textContent = count;
  }, 5000);
}

/* ===== 6. TESTIMONIAL CAROUSEL ===== */
function initTestimonialCarousel() {
  const grid = document.querySelector('.testimonial-card')?.parentElement;
  if (!grid || grid.classList.contains('testimonial-carousel')) return;
  // Add more testimonials
  const extraTestimonials = [
    { text: 'The Ambient Dreamscapes pack is my go-to for focus sessions. Absolutely incredible quality. Already ordered Vol. 2!', name: 'Kavya Nair', role: 'Freelance Writer, Kochi', initials: 'KN' },
    { text: 'I built my entire brand using NovaPulse products. The eBooks gave me strategy, the music gave me vibes. 10/10 would recommend to any creator.', name: 'Dev Malhotra', role: 'Content Creator, Chandigarh', initials: 'DM' },
    { text: "Best investment for my video production agency. The LUTs pack alone saved us hours of color grading. The loyalty points are a nice bonus too!", name: 'Zara Khan', role: 'Video Producer, Lucknow', initials: 'ZK' },
  ];
  extraTestimonials.forEach(t => {
    const card = document.createElement('div');
    card.className = 'testimonial-card';
    card.innerHTML = `<div class="quote-icon">"</div><p class="testimonial-text">${t.text}</p><div class="testimonial-author"><div class="author-avatar">${t.initials}</div><div><div class="author-name">${t.name}</div><div class="author-role">${t.role}</div></div></div>`;
    grid.appendChild(card);
  });
  // Convert to carousel
  const cards = Array.from(grid.querySelectorAll('.testimonial-card'));
  grid.classList.add('testimonial-carousel');
  grid.classList.remove('grid', 'grid-3', 'stagger-list');
  const track = document.createElement('div');
  track.className = 'testimonial-track';
  cards.forEach(c => track.appendChild(c));
  grid.innerHTML = '';
  grid.appendChild(track);
  // Controls
  const controls = document.createElement('div');
  controls.className = 'carousel-controls';
  const perView = window.innerWidth > 1024 ? 3 : window.innerWidth > 640 ? 2 : 1;
  const maxSlide = Math.max(0, cards.length - perView);
  let current = 0;
  let dots = '';
  for (let i = 0; i <= maxSlide; i++) dots += `<button class="carousel-dot ${i === 0 ? 'active' : ''}" data-slide="${i}"></button>`;
  controls.innerHTML = `<button class="carousel-btn" id="car-prev">‹</button><div class="carousel-dots">${dots}</div><button class="carousel-btn" id="car-next">›</button>`;
  grid.appendChild(controls);
  function goTo(idx) {
    current = Math.max(0, Math.min(maxSlide, idx));
    const cardW = cards[0].offsetWidth + 16;
    track.style.transform = `translateX(-${current * cardW}px)`;
    controls.querySelectorAll('.carousel-dot').forEach((d, i) => d.classList.toggle('active', i === current));
  }
  controls.querySelector('#car-prev').addEventListener('click', () => goTo(current - 1));
  controls.querySelector('#car-next').addEventListener('click', () => goTo(current + 1));
  controls.querySelectorAll('.carousel-dot').forEach(d => d.addEventListener('click', () => goTo(parseInt(d.dataset.slide))));
  // Auto-scroll
  let autoTimer = setInterval(() => goTo(current >= maxSlide ? 0 : current + 1), 5000);
  grid.addEventListener('mouseenter', () => clearInterval(autoTimer));
  grid.addEventListener('mouseleave', () => { autoTimer = setInterval(() => goTo(current >= maxSlide ? 0 : current + 1), 5000); });
}

/* ===== 7. QUICK-VIEW MODAL ===== */
function initQuickView() {
  document.addEventListener('click', e => {
    const card = e.target.closest('.product-card');
    if (!card || e.target.closest('.add-to-cart') || e.target.closest('.wishlist-btn')) return;
    const id = card.dataset.productId;
    if (!id || !window.PRODUCTS) return;
    const p = PRODUCTS.find(pr => pr.id === id);
    if (!p) return;
    const overlay = document.createElement('div');
    overlay.className = 'quickview-overlay';
    const stars = Array(5).fill('').map((_, i) => `<span style="color:${i < Math.floor(p.rating) ? '#fbbf24' : '#475569'}">★</span>`).join('');
    overlay.innerHTML = `
      <div class="quickview-modal">
        <div class="quickview-image"><button class="quickview-close">✕</button>
          <img src="${p.image}" alt="${p.name}" onerror="this.style.display='none'">
        </div>
        <div class="quickview-body">
          <div class="quickview-category">${p.category}</div>
          <div class="quickview-title">${p.name}</div>
          <div class="quickview-rating">${stars} <span style="color:var(--color-text-muted);font-size:12px">${p.rating} (${p.reviews} reviews)</span></div>
          <div class="quickview-desc">${p.description}</div>
          <div class="quickview-price">${window.formatINR ? formatINR(p.price) : '₹'+p.price}${p.originalPrice ? `<span class="og">${formatINR(p.originalPrice)}</span>` : ''}</div>
          <div class="quickview-actions">
            <button class="btn btn-primary ripple-effect" onclick="if(window.cart)cart.addItem('${p.id}');this.closest('.quickview-overlay').remove()">Add to Cart</button>
            <button class="btn btn-secondary" onclick="this.closest('.quickview-overlay').remove()">Close</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('active'));
    overlay.querySelector('.quickview-close').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  });
}

/* ===== 8. WISHLIST SYSTEM ===== */
function initWishlist() {
  window.WishlistSystem = {
    items: JSON.parse(localStorage.getItem('novapulse_wishlist') || '[]'),
    toggle(id) {
      const idx = this.items.indexOf(id);
      if (idx >= 0) { this.items.splice(idx, 1); showToast('Removed from wishlist', 'info'); }
      else { this.items.push(id); showToast('Added to wishlist! ❤️', 'success'); if (window.GamificationSystem) GamificationSystem.addPoints(5, 'Wishlisted a product!'); }
      localStorage.setItem('novapulse_wishlist', JSON.stringify(this.items));
      this.updateUI();
    },
    has(id) { return this.items.includes(id); },
    updateUI() {
      document.querySelectorAll('.wishlist-btn').forEach(btn => {
        const card = btn.closest('.product-card');
        if (!card) return;
        const id = card.dataset.productId;
        btn.classList.toggle('active', this.has(id));
      });
      const countEl = document.querySelector('.wishlist-count');
      if (countEl) { countEl.textContent = this.items.length; countEl.style.display = this.items.length > 0 ? 'flex' : 'none'; }
    }
  };
  // Add wishlist icon to nav
  const navActions = document.querySelector('.nav-actions');
  if (navActions && !document.querySelector('.nav-wishlist')) {
    const wl = document.createElement('div');
    wl.className = 'nav-wishlist';
    wl.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg><span class="wishlist-count" style="display:none">0</span>`;
    const cartEl = navActions.querySelector('.nav-cart');
    if (cartEl) cartEl.before(wl);
  }
  // Override wishlist button clicks
  document.addEventListener('click', e => {
    const btn = e.target.closest('.wishlist-btn');
    if (!btn) return;
    e.stopPropagation();
    const card = btn.closest('.product-card');
    if (card) WishlistSystem.toggle(card.dataset.productId);
  });
  setTimeout(() => WishlistSystem.updateUI(), 500);
}

/* ===== 9. BADGES & CONFETTI ===== */
function initBadges() {
  window.BadgeSystem = {
    defs: [
      { id: 'first_visit', icon: '👋', name: 'First Visit', desc: 'Welcome to NovaPulse!' },
      { id: 'explorer', icon: '🧭', name: 'Explorer', desc: 'Visit 3 pages' },
      { id: 'shopper', icon: '🛒', name: 'First Cart', desc: 'Add item to cart' },
      { id: 'chatter', icon: '💬', name: 'Chatty', desc: 'Use the AI chatbot' },
      { id: 'music_lover', icon: '🎧', name: 'Music Lover', desc: 'Play a music preview' },
      { id: 'searcher', icon: '🔍', name: 'Seeker', desc: 'Use spotlight search' },
      { id: 'feedback', icon: '⭐', name: 'Reviewer', desc: 'Submit feedback' },
      { id: 'loyal', icon: '🏆', name: 'Loyal Fan', desc: 'Reach 500 points' },
    ],
    earned: JSON.parse(localStorage.getItem('novapulse_badges') || '[]'),
    earn(id) {
      if (this.earned.includes(id)) return;
      this.earned.push(id);
      localStorage.setItem('novapulse_badges', JSON.stringify(this.earned));
      const badge = this.defs.find(b => b.id === id);
      if (badge) { showToast(`🏅 Badge Unlocked: ${badge.name}!`, 'success'); }
      this.renderStrip();
    },
    renderStrip() {
      let strip = document.querySelector('.badges-strip');
      if (!strip) {
        strip = document.createElement('div');
        strip.className = 'badges-strip';
        const bar = document.querySelector('.rewards-bar');
        if (bar) bar.appendChild(strip);
      }
      strip.innerHTML = this.defs.map(b => `<div class="badge-icon ${this.earned.includes(b.id) ? 'unlocked' : ''}" title="${b.name}: ${b.desc}">${b.icon}</div>`).join('');
    }
  };
  BadgeSystem.renderStrip();
  BadgeSystem.earn('first_visit');
  // Track pages visited
  const visited = JSON.parse(sessionStorage.getItem('pages_visited') || '[]');
  if (!visited.includes(location.pathname)) visited.push(location.pathname);
  sessionStorage.setItem('pages_visited', JSON.stringify(visited));
  if (visited.length >= 3) BadgeSystem.earn('explorer');

  // Override GamificationSystem level-up to show confetti
  const origAddPoints = GamificationSystem.addPoints.bind(GamificationSystem);
  GamificationSystem.addPoints = function(amount, reason) {
    const oldLevel = this.level;
    origAddPoints(amount, reason);
    if (this.level > oldLevel) showLevelUp(this.getLevelName(), this.level);
    if (this.points >= 500) BadgeSystem.earn('loyal');
  };
}

function showLevelUp(name, level) {
  const overlay = document.createElement('div');
  overlay.className = 'levelup-overlay';
  overlay.innerHTML = `<div class="levelup-card"><div style="font-size:4rem">🎉</div><h2>Level Up!</h2><p>You're now a <strong style="color:var(--color-primary-light)">${name}</strong> (Level ${level})</p><button class="btn btn-primary" style="margin-top:16px" onclick="this.closest('.levelup-overlay').remove()">Awesome!</button></div>`;
  document.body.appendChild(overlay);
  // Canvas confetti
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;z-index:10001;pointer-events:none';
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const particles = [];
  const colors = ['#7c3aed','#ec4899','#06b6d4','#f59e0b','#10b981','#ef4444'];
  for (let i = 0; i < 150; i++) {
    particles.push({ x: Math.random()*canvas.width, y: -20-Math.random()*200, vx: (Math.random()-.5)*6, vy: Math.random()*4+2, size: Math.random()*6+3, color: colors[Math.floor(Math.random()*colors.length)], rot: Math.random()*360, vr: (Math.random()-.5)*8 });
  }
  let frame = 0;
  function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.rot += p.vr;
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot*Math.PI/180);
      ctx.fillStyle = p.color; ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size);
      ctx.restore();
    });
    frame++;
    if (frame < 180) requestAnimationFrame(draw); else canvas.remove();
  }
  draw();
  setTimeout(() => overlay.remove(), 5000);
}

/* ===== 10. PWA INSTALL ===== */
function initPWA() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    const btn = document.querySelector('.pwa-install-btn');
    if (btn) btn.classList.add('show');
  });
  // Add install button to nav
  const navActions = document.querySelector('.nav-actions');
  if (navActions) {
    const btn = document.createElement('button');
    btn.className = 'pwa-install-btn';
    btn.innerHTML = '📱 Install App';
    btn.addEventListener('click', async () => {
      if (deferredPrompt) { deferredPrompt.prompt(); const result = await deferredPrompt.userChoice; if (result.outcome === 'accepted') showToast('App installed! 🎉', 'success'); deferredPrompt = null; btn.classList.remove('show'); }
    });
    navActions.prepend(btn);
  }
}

/* ===== 11. COMPARISON SLIDERS ===== */
function initComparisonSliders() {
  document.querySelectorAll('.comparison-slider').forEach(slider => {
    const handle = slider.querySelector('.comparison-handle');
    const after = slider.querySelector('.comparison-after');
    if (!handle || !after) return;
    let dragging = false;
    function move(x) {
      const rect = slider.getBoundingClientRect();
      let pct = ((x - rect.left) / rect.width) * 100;
      pct = Math.max(5, Math.min(95, pct));
      after.style.width = pct + '%';
      handle.style.left = pct + '%';
    }
    handle.addEventListener('mousedown', () => dragging = true);
    document.addEventListener('mousemove', e => { if (dragging) move(e.clientX); });
    document.addEventListener('mouseup', () => dragging = false);
    handle.addEventListener('touchstart', () => dragging = true);
    document.addEventListener('touchmove', e => { if (dragging) move(e.touches[0].clientX); });
    document.addEventListener('touchend', () => dragging = false);
  });
}

/* ===== 12. RECOMMENDATIONS ===== */
function initRecommendations() {
  window.RecommendationEngine = {
    prefs: JSON.parse(localStorage.getItem('novapulse_prefs') || '{}'),
    trackView(category) {
      this.prefs[category] = (this.prefs[category] || 0) + 1;
      localStorage.setItem('novapulse_prefs', JSON.stringify(this.prefs));
    },
    getRecommended() {
      if (!window.PRODUCTS) return [];
      const sorted = Object.entries(this.prefs).sort((a, b) => b[1] - a[1]);
      if (sorted.length === 0) return PRODUCTS.filter(p => p.rating >= 4.8).slice(0, 4);
      const topCat = sorted[0][0];
      const recommended = PRODUCTS.filter(p => p.category === topCat).slice(0, 2);
      const others = PRODUCTS.filter(p => p.category !== topCat && p.rating >= 4.7).slice(0, 2);
      return [...recommended, ...others];
    }
  };
  // Track when products are viewed
  document.addEventListener('click', e => {
    const card = e.target.closest('.product-card');
    if (card) {
      const id = card.dataset.productId;
      const product = window.PRODUCTS?.find(p => p.id === id);
      if (product) RecommendationEngine.trackView(product.category);
    }
  });
}

/* ===== 13. SEARCH BUTTON IN NAV ===== */
document.addEventListener('DOMContentLoaded', () => {
  const navActions = document.querySelector('.nav-actions');
  if (navActions && !document.querySelector('.nav-search-btn')) {
    const btn = document.createElement('button');
    btn.className = 'nav-search-btn';
    btn.innerHTML = `🔍 Search <kbd>⌘K</kbd>`;
    btn.addEventListener('click', () => { if (window.SearchEngine) SearchEngine.open(); });
    const toggle = navActions.querySelector('.nav-toggle');
    if (toggle) toggle.before(btn); else navActions.appendChild(btn);
  }
});

/* ===== 14. HERO TEXT ROTATION ===== */
function upgradeHero() {
  const scrambleEl = document.querySelector('[data-scramble]');
  if (!scrambleEl) return;
  const words = ['Digital Universe', 'Creative Empire', 'Content Kingdom', 'Brand Legacy'];
  let wordIdx = 0;
  setInterval(() => {
    wordIdx = (wordIdx + 1) % words.length;
    const target = words[wordIdx];
    let frame = 0;
    const chars = '!<>-_\\/[]{}—=+*^?#________';
    function update() {
      let output = '';
      const progress = frame / 25;
      for (let i = 0; i < target.length; i++) {
        if (i < target.length * progress) output += target[i];
        else output += chars[Math.floor(Math.random() * chars.length)];
      }
      scrambleEl.textContent = output;
      frame++;
      if (frame <= 25) requestAnimationFrame(update);
      else scrambleEl.textContent = target;
    }
    update();
  }, 3500);
}
