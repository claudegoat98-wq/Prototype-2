/* ============================================
   NovaPulse Digital — Core JavaScript
   ============================================ */

// ========== Page Loader ==========
window.addEventListener('load', () => {
  const loader = document.querySelector('.page-loader');
  if (loader) {
    setTimeout(() => loader.classList.add('loaded'), 600);
  }
  initApp();
});

function initApp() {
  initNavbar();
  initScrollReveal();
  initParticles();
  initCounters();
  initTiltCards();
  initRippleButtons();
  initSmoothLinks();
  initGamification();
  initMobileMenu();
  initTextScramble();
}

// ========== Navbar Scroll Effect ==========
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  const handleScroll = () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

// ========== Scroll Reveal (Intersection Observer) ==========
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger-list');

  if (!revealElements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        // Don't unobserve if we want repeat animations
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -60px 0px'
  });

  revealElements.forEach(el => observer.observe(el));
}

// ========== Particle System (Canvas) ==========
function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let mouse = { x: null, y: null };
  let animationId;

  function resize() {
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;
  }

  resize();
  window.addEventListener('resize', resize);

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  canvas.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.5;
      this.speedY = (Math.random() - 0.5) * 0.5;
      this.opacity = Math.random() * 0.5 + 0.1;
      this.color = ['rgba(124, 58, 237,', 'rgba(6, 182, 212,', 'rgba(236, 72, 153,'][Math.floor(Math.random() * 3)];
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      // Mouse interaction
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) {
          const force = (120 - dist) / 120;
          this.x -= dx * force * 0.01;
          this.y -= dy * force * 0.01;
        }
      }

      // Wrap around
      if (this.x < 0) this.x = canvas.width;
      if (this.x > canvas.width) this.x = 0;
      if (this.y < 0) this.y = canvas.height;
      if (this.y > canvas.height) this.y = 0;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `${this.color}${this.opacity})`;
      ctx.fill();
    }
  }

  // Create particles
  const count = Math.min(80, Math.floor((canvas.width * canvas.height) / 12000));
  for (let i = 0; i < count; i++) {
    particles.push(new Particle());
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 150) {
          const opacity = (1 - dist / 150) * 0.15;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(124, 58, 237, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    drawConnections();
    animationId = requestAnimationFrame(animate);
  }

  animate();
}

// ========== Counter Animation ==========
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element) {
  const target = parseInt(element.dataset.count);
  const suffix = element.dataset.suffix || '';
  const prefix = element.dataset.prefix || '';
  const duration = 2000;
  const start = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(eased * target);

    element.textContent = prefix + current.toLocaleString() + suffix;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = prefix + target.toLocaleString() + suffix;
    }
  }

  requestAnimationFrame(update);
}

// ========== 3D Card Tilt ==========
function initTiltCards() {
  const cards = document.querySelectorAll('.tilt-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    });
  });
}

// ========== Ripple Effect ==========
function initRippleButtons() {
  const buttons = document.querySelectorAll('.ripple-effect');

  buttons.forEach(btn => {
    btn.addEventListener('click', function(e) {
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.classList.add('ripple');
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });
}

// ========== Smooth Internal Links ==========
function initSmoothLinks() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// ========== Gamification System ==========
const GamificationSystem = {
  points: parseInt(localStorage.getItem('novapulse_points') || '0'),
  level: 1,
  levelThresholds: [0, 100, 300, 600, 1000, 2000],
  levelNames: ['Newcomer', 'Explorer', 'Creator', 'Innovator', 'Visionary', 'Legend'],

  init() {
    this.calculateLevel();
    this.updateUI();
  },

  addPoints(amount, reason) {
    this.points += amount;
    localStorage.setItem('novapulse_points', this.points.toString());
    this.calculateLevel();
    this.updateUI();
    showToast(`+${amount} points! ${reason}`, 'success');
  },

  calculateLevel() {
    for (let i = this.levelThresholds.length - 1; i >= 0; i--) {
      if (this.points >= this.levelThresholds[i]) {
        this.level = i + 1;
        break;
      }
    }
  },

  getProgress() {
    const currentThreshold = this.levelThresholds[this.level - 1] || 0;
    const nextThreshold = this.levelThresholds[this.level] || this.levelThresholds[this.levelThresholds.length - 1];
    return ((this.points - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
  },

  getLevelName() {
    return this.levelNames[this.level - 1] || 'Legend';
  },

  updateUI() {
    const rewardsBar = document.querySelector('.rewards-bar');
    if (!rewardsBar) return;

    const pointsEl = rewardsBar.querySelector('.points-value');
    const progressEl = rewardsBar.querySelector('.progress-fill');
    const levelEl = rewardsBar.querySelector('.level-name');
    const nextRewardEl = rewardsBar.querySelector('.next-reward');

    if (pointsEl) pointsEl.textContent = this.points;
    if (progressEl) progressEl.style.width = `${Math.min(this.getProgress(), 100)}%`;
    if (levelEl) levelEl.textContent = this.getLevelName();
    if (nextRewardEl) {
      const nextThreshold = this.levelThresholds[this.level] || '∞';
      nextRewardEl.textContent = `${nextThreshold - this.points} pts to next level`;
    }

    if (this.points > 0) {
      rewardsBar.classList.add('visible');
    }
  }
};

function initGamification() {
  GamificationSystem.init();

  // Award points for page visit (once per session)
  if (!sessionStorage.getItem('visit_points')) {
    GamificationSystem.addPoints(10, 'Welcome back!');
    sessionStorage.setItem('visit_points', 'true');
  }
}

// ========== Toast Notifications ==========
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.classList.add('toast-container');
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.classList.add('toast', `toast-${type}`);

  const icons = { success: '✓', info: 'ℹ', warning: '⚠' };
  toast.innerHTML = `<span>${icons[type] || 'ℹ'}</span> ${message}`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100px)';
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

// ========== Mobile Menu ==========
function initMobileMenu() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    links.classList.toggle('open');
    toggle.classList.toggle('active');
  });

  // Close on link click
  links.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.classList.remove('active');
    });
  });
}

// ========== Text Scramble Effect ==========
function initTextScramble() {
  const elements = document.querySelectorAll('[data-scramble]');
  const chars = '!<>-_\\/[]{}—=+*^?#________';

  elements.forEach(el => {
    const originalText = el.textContent;
    let frame = 0;
    let running = false;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !running) {
          running = true;
          scramble(el, originalText);
        }
      });
    }, { threshold: 0.5 });

    observer.observe(el);
  });

  function scramble(el, target) {
    let frame = 0;
    const totalFrames = 30;

    function update() {
      let output = '';
      const progress = frame / totalFrames;

      for (let i = 0; i < target.length; i++) {
        if (i < target.length * progress) {
          output += target[i];
        } else {
          output += chars[Math.floor(Math.random() * chars.length)];
        }
      }

      el.textContent = output;
      frame++;

      if (frame <= totalFrames) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target;
      }
    }

    update();
  }
}

// ========== Parallax Effect ==========
window.addEventListener('scroll', () => {
  const parallaxElements = document.querySelectorAll('[data-parallax]');
  parallaxElements.forEach(el => {
    const speed = parseFloat(el.dataset.parallax) || 0.5;
    const rect = el.getBoundingClientRect();
    const scrolled = window.scrollY;
    el.style.transform = `translateY(${scrolled * speed * 0.1}px)`;
  });
}, { passive: true });

// ========== Utility: Generate SVG Icons ==========
const Icons = {
  cart: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="m1 1 4 0 2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61l1.6-8.39h-17"/></svg>`,
  chat: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>`,
  close: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  send: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>`,
  star: '★',
  heart: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  trash: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`,
  check: '✓',
  arrow: '→',
  play: '▶',
  menu: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`,
  search: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  download: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  music: '🎵',
  book: '📖',
  camera: '📸',
  sparkle: '✨',
  fire: '🔥',
  trophy: '🏆',
  crown: '👑',
  gem: '💎',
  rocket: '🚀',
  lightning: '⚡',
  palette: '🎨',
  globe: '🌐',
};

// Make available globally
window.showToast = showToast;
window.GamificationSystem = GamificationSystem;
window.Icons = Icons;
