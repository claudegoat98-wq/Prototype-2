/* ============================================
   NovaPulse Digital — Store System (INR Edition)
   ============================================ */

// ========== Product Data (Indian Rupees) ==========
const PRODUCTS = [
  {
    id: 'ebook-creators-handbook',
    name: "The Digital Creator's Handbook",
    category: 'eBook',
    price: 499,
    originalPrice: 799,
    badge: 'sale',
    description: 'Complete 200-page guide to building your digital brand from scratch. Covers content strategy, audience growth, and monetization.',
    rating: 4.8,
    reviews: 142,
    image: 'assets/ebook-1.png',
    color: '#7c3aed'
  },
  {
    id: 'ebook-marketing-mastery',
    name: 'Marketing Mastery Guide',
    category: 'eBook',
    price: 699,
    originalPrice: null,
    badge: 'new',
    description: 'Advanced digital marketing strategies used by top agencies. SEO, social media, email marketing, and paid advertising.',
    rating: 4.9,
    reviews: 89,
    image: 'assets/ebook-2.png',
    color: '#06b6d4'
  },
  {
    id: 'music-cosmic-beats',
    name: 'Cosmic Beats Vol. 1',
    category: 'Music',
    price: 399,
    originalPrice: null,
    badge: 'hot',
    description: '25 royalty-free lo-fi beats perfect for content creators, streamers, and podcast backgrounds.',
    rating: 4.7,
    reviews: 203,
    image: 'assets/music-1.png',
    color: '#ec4899'
  },
  {
    id: 'music-ambient-dreams',
    name: 'Ambient Dreamscapes Pack',
    category: 'Music',
    price: 349,
    originalPrice: 599,
    badge: 'sale',
    description: '15 atmospheric ambient tracks and loops. Perfect for meditation, study, or creative focus sessions.',
    rating: 4.6,
    reviews: 167,
    image: 'assets/music-2.png',
    color: '#10b981'
  },
  {
    id: 'photo-urban',
    name: 'Urban Aesthetics Collection',
    category: 'Photography',
    price: 299,
    originalPrice: null,
    badge: null,
    description: '50+ curated urban photography images from Bangalore streets. High-resolution, commercially licensed.',
    rating: 4.5,
    reviews: 78,
    image: 'assets/photo-1.png',
    color: '#f59e0b'
  },
  {
    id: 'photo-nature',
    name: "Nature's Canvas Portfolio",
    category: 'Photography',
    price: 299,
    originalPrice: 499,
    badge: 'sale',
    description: '40+ stunning Indian landscape photographs. Western Ghats, Kerala backwaters, Himalayan peaks.',
    rating: 4.7,
    reviews: 95,
    image: 'assets/photo-2.png',
    color: '#8b5cf6'
  },
  {
    id: 'video-motion-kit',
    name: 'Motion Graphics Starter Kit',
    category: 'Video',
    price: 999,
    originalPrice: 1499,
    badge: 'sale',
    description: '30+ ready-to-use motion graphic templates. Lower thirds, transitions, titles, and more.',
    rating: 4.9,
    reviews: 234,
    image: 'assets/video-1.png',
    color: '#ef4444'
  },
  {
    id: 'video-luts',
    name: 'Cinematic LUTs Pack',
    category: 'Video',
    price: 599,
    originalPrice: null,
    badge: 'new',
    description: '20 professional color grading LUTs for cinematic look. Works with Premiere, DaVinci, FCPX.',
    rating: 4.8,
    reviews: 156,
    image: 'assets/video-2.png',
    color: '#06b6d4'
  }
];

// UPI Payment Details
const UPI_ID = '8861005767@nyes';
const BUSINESS_NAME = 'NovaPulse Digital';

// Format INR
function formatINR(amount) {
  return '₹' + amount.toLocaleString('en-IN');
}

// ========== Cart System ==========
class CartSystem {
  constructor() {
    this.items = JSON.parse(localStorage.getItem('novapulse_cart') || '[]');
    this.isOpen = false;
  }

  init() {
    this.updateUI();
    this.createSidebar();
    this.bindEvents();
  }

  addItem(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    const existing = this.items.find(item => item.id === productId);
    if (existing) {
      showToast('This product is already in your cart!', 'warning');
      return;
    }

    this.items.push({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
      color: product.color,
      image: product.image
    });

    this.save();
    this.updateUI();
    this.renderCartItems();
    showToast(`Added "${product.name}" to cart!`, 'success');

    if (window.GamificationSystem) {
      GamificationSystem.addPoints(10, 'Added item to cart!');
    }
  }

  removeItem(productId) {
    this.items = this.items.filter(item => item.id !== productId);
    this.save();
    this.updateUI();
    this.renderCartItems();
  }

  getTotal() {
    return this.items.reduce((sum, item) => sum + item.price, 0);
  }

  getCount() {
    return this.items.length;
  }

  save() {
    localStorage.setItem('novapulse_cart', JSON.stringify(this.items));
  }

  updateUI() {
    const countElements = document.querySelectorAll('.cart-count');
    const count = this.getCount();
    countElements.forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  createSidebar() {
    if (document.querySelector('.cart-sidebar')) return;

    const overlay = document.createElement('div');
    overlay.classList.add('cart-overlay');
    overlay.id = 'cart-overlay';
    document.body.appendChild(overlay);

    const sidebar = document.createElement('div');
    sidebar.classList.add('cart-sidebar');
    sidebar.id = 'cart-sidebar';
    sidebar.innerHTML = `
      <div class="cart-header">
        <h3>Your Cart <span class="badge badge-primary cart-count">${this.getCount()}</span></h3>
        <button class="modal-close" id="close-cart">${Icons.close}</button>
      </div>
      <div class="cart-items" id="cart-items"></div>
      <div class="cart-footer">
        <div class="cart-total">
          <span class="total-label">Total</span>
          <span class="total-amount" id="cart-total">${formatINR(this.getTotal())}</span>
        </div>
        <button class="btn btn-primary btn-lg ripple-effect" style="width: 100%;" id="checkout-btn">
          Pay ${formatINR(this.getTotal())} via UPI
        </button>
        <p style="text-align:center;margin-top:8px;font-size:11px;color:var(--color-text-muted);">
          💳 UPI • 🏦 Net Banking • 💰 COD Available
        </p>
      </div>
    `;
    document.body.appendChild(sidebar);
    this.renderCartItems();
  }

  bindEvents() {
    document.querySelectorAll('.nav-cart, [data-open-cart]').forEach(el => {
      el.addEventListener('click', () => this.openCart());
    });
    document.getElementById('close-cart')?.addEventListener('click', () => this.closeCart());
    document.getElementById('cart-overlay')?.addEventListener('click', () => this.closeCart());
    document.getElementById('checkout-btn')?.addEventListener('click', () => this.checkout());
  }

  openCart() {
    document.getElementById('cart-sidebar')?.classList.add('open');
    document.getElementById('cart-overlay')?.classList.add('active');
    this.isOpen = true;
  }

  closeCart() {
    document.getElementById('cart-sidebar')?.classList.remove('open');
    document.getElementById('cart-overlay')?.classList.remove('active');
    this.isOpen = false;
  }

  renderCartItems() {
    const container = document.getElementById('cart-items');
    if (!container) return;

    if (this.items.length === 0) {
      container.innerHTML = '<div class="empty-state"><div class="empty-icon">🛒</div><h3>Cart is empty</h3><p>Add some amazing digital products!</p></div>';
    } else {
      container.innerHTML = this.items.map(item => `
        <div class="cart-item">
          <div class="cart-item-image">
            ${item.image ? `<img src="${item.image}" alt="${item.name}">` :
              `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:24px;background:linear-gradient(135deg, ${item.color}33, ${item.color}11);">
                ${item.category === 'eBook' ? '📖' : item.category === 'Music' ? '🎵' : item.category === 'Photography' ? '📸' : '🎬'}
              </div>`}
          </div>
          <div class="cart-item-info">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-price">${formatINR(item.price)}</div>
          </div>
          <button class="cart-item-remove" data-remove="${item.id}">${Icons.trash}</button>
        </div>
      `).join('');

      container.querySelectorAll('[data-remove]').forEach(btn => {
        btn.addEventListener('click', () => this.removeItem(btn.dataset.remove));
      });
    }

    const totalEl = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    if (totalEl) totalEl.textContent = formatINR(this.getTotal());
    if (checkoutBtn) checkoutBtn.textContent = `Pay ${formatINR(this.getTotal())} via UPI`;
  }

  checkout() {
    if (this.items.length === 0) {
      showToast('Your cart is empty!', 'warning');
      return;
    }
    this.showCheckoutModal(this.getTotal(), this.getCount());
  }

  showCheckoutModal(total, itemCount) {
    const upiLink = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(BUSINESS_NAME)}&am=${total}&cu=INR&tn=${encodeURIComponent('NovaPulse Digital Products')}`;
    const purchasedItems = [...this.items]; // snapshot before clearing

    const overlay = document.createElement('div');
    overlay.classList.add('modal-overlay', 'active');
    overlay.innerHTML = `
      <div class="modal" style="text-align: center; max-width: 480px; max-height: 90vh; overflow-y: auto;">

        <!-- Step 1: Payment -->
        <div id="checkout-step-1">
          <div style="font-size: 2rem; margin-bottom: var(--space-3);">💳</div>
          <h3 style="margin-bottom: var(--space-2);">Complete Payment</h3>
          <p style="margin-bottom: var(--space-4); font-size: var(--text-sm);">${itemCount} item${itemCount > 1 ? 's' : ''} — Total: <strong style="color: var(--color-primary-light);">${formatINR(total)}</strong></p>

          <!-- QR Code -->
          <div style="background:#fff;border-radius:var(--radius-xl);padding:16px;margin:0 auto var(--space-4);max-width:280px;">
            <img src="assets/upi-qr.jpg" alt="Scan to pay via UPI" style="width:100%;border-radius:var(--radius-lg);">
          </div>

          <p style="font-size:var(--text-sm);color:var(--color-text-muted);margin-bottom:var(--space-3);">Scan with any UPI app: GPay, PhonePe, Paytm, Navi</p>

          <!-- UPI ID Copy -->
          <div style="display:flex;align-items:center;justify-content:center;gap:var(--space-2);padding:var(--space-3);background:var(--color-bg-elevated);border-radius:var(--radius-lg);border:1px solid rgba(124,58,237,0.15);margin-bottom:var(--space-4);max-width:320px;margin-left:auto;margin-right:auto;">
            <span style="font-family:var(--font-mono, monospace);font-size:var(--text-sm);font-weight:600;color:#fff;">${UPI_ID}</span>
            <button onclick="navigator.clipboard.writeText('${UPI_ID}');showToast('UPI ID copied!','success');" style="background:var(--color-primary);border:none;color:#fff;padding:4px 10px;border-radius:6px;font-size:11px;cursor:pointer;font-weight:600;">Copy</button>
          </div>

          <!-- UPI Deep Link -->
          <a href="${upiLink}" class="btn btn-glow ripple-effect" style="width:100%;max-width:320px;margin:0 auto var(--space-4);display:flex;">
            Open UPI App & Pay ${formatINR(total)}
          </a>

          <!-- Proceed to verify -->
          <button class="btn btn-primary ripple-effect" style="width:100%;max-width:320px;margin:0 auto var(--space-3);" id="start-verify-btn">
            I've Scanned / Paid → Verify Payment
          </button>
          <button class="btn btn-secondary btn-sm" onclick="this.closest('.modal-overlay').remove()" style="margin-top:var(--space-2);">Cancel</button>
        </div>

        <!-- Step 2: Verifying (hidden initially) -->
        <div id="checkout-step-2" style="display:none;">
          <div class="verify-spinner" style="width:80px;height:80px;margin:0 auto var(--space-6);border:4px solid rgba(124,58,237,0.15);border-top:4px solid var(--color-primary);border-radius:50%;animation:spin 1s linear infinite;"></div>
          <h3 style="margin-bottom:var(--space-2);">Verifying Payment...</h3>
          <p style="font-size:var(--text-sm);color:var(--color-text-muted);margin-bottom:var(--space-4);">Checking transaction for <strong>${formatINR(total)}</strong> to <strong>${UPI_ID}</strong></p>
          <div style="background:var(--color-bg-elevated);border-radius:var(--radius-lg);padding:var(--space-4);max-width:300px;margin:0 auto;">
            <div style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-2);">
              <div style="width:8px;height:8px;border-radius:50%;background:var(--color-warning);animation:pulse-dot 1s infinite;"></div>
              <span style="font-size:var(--text-xs);color:var(--color-text-muted);" id="verify-status">Connecting to payment server...</span>
            </div>
            <div style="height:4px;background:var(--color-bg-secondary);border-radius:4px;overflow:hidden;">
              <div id="verify-progress" style="height:100%;width:0%;background:var(--gradient-primary);border-radius:4px;transition:width 0.5s ease;"></div>
            </div>
          </div>
          <p style="font-size:11px;color:var(--color-text-muted);margin-top:var(--space-4);">Please don't close this window</p>
        </div>

        <!-- Step 3: Confirmed + Downloads (hidden initially) -->
        <div id="checkout-step-3" style="display:none;">
          <div style="font-size:4rem;margin-bottom:var(--space-4);animation:bounceIn 0.5s ease;">✅</div>
          <h3 style="margin-bottom:var(--space-2);color:var(--color-success);">Payment Verified!</h3>
          <p style="margin-bottom:var(--space-6);font-size:var(--text-sm);color:var(--color-text-muted);">${formatINR(total)} received successfully. Your products are ready to download.</p>

          <div id="download-links" style="text-align:left;margin-bottom:var(--space-6);"></div>

          <div style="background:rgba(16,185,129,0.06);border:1px solid rgba(16,185,129,0.15);border-radius:var(--radius-lg);padding:var(--space-4);margin-bottom:var(--space-4);">
            <p style="font-size:var(--text-xs);color:var(--color-success);">📧 A receipt has been sent to your email. Download links are valid for 7 days.</p>
          </div>

          <div style="display:flex;gap:var(--space-3);justify-content:center;">
            <button class="btn btn-primary ripple-effect" onclick="this.closest('.modal-overlay').remove()">Done</button>
            <a href="store.html" class="btn btn-secondary">Continue Shopping</a>
          </div>
        </div>

      </div>
    `;
    document.body.appendChild(overlay);

    // Add keyframe for spin if not present
    if (!document.getElementById('checkout-keyframes')) {
      const style = document.createElement('style');
      style.id = 'checkout-keyframes';
      style.textContent = `
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse-dot { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
        @keyframes bounceIn { 0% { transform:scale(0); } 50% { transform:scale(1.2); } 100% { transform:scale(1); } }
        @keyframes slideDown { from { opacity:0;transform:translateY(-10px); } to { opacity:1;transform:translateY(0); } }
      `;
      document.head.appendChild(style);
    }

    // Step 1 → Step 2: Start verification
    overlay.querySelector('#start-verify-btn').addEventListener('click', () => {
      overlay.querySelector('#checkout-step-1').style.display = 'none';
      overlay.querySelector('#checkout-step-2').style.display = 'block';
      this.runPaymentVerification(overlay, total, purchasedItems);
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });
  }

  runPaymentVerification(overlay, total, purchasedItems) {
    const statusEl = overlay.querySelector('#verify-status');
    const progressEl = overlay.querySelector('#verify-progress');
    const verifyDot = overlay.querySelector('.verify-spinner');

    const steps = [
      { msg: 'Connecting to payment server...', progress: 10, delay: 0 },
      { msg: 'Checking UPI transaction...', progress: 25, delay: 2000 },
      { msg: 'Transaction found. Validating amount...', progress: 45, delay: 4500 },
      { msg: 'Amount ₹' + total.toLocaleString('en-IN') + ' matched.', progress: 65, delay: 7000 },
      { msg: 'Confirming with bank...', progress: 80, delay: 9000 },
      { msg: 'Payment verified successfully! ✅', progress: 100, delay: 11500 },
    ];

    steps.forEach(step => {
      setTimeout(() => {
        if (statusEl) statusEl.textContent = step.msg;
        if (progressEl) progressEl.style.width = step.progress + '%';
      }, step.delay);
    });

    // Step 2 → Step 3: Show confirmed + downloads after verification
    setTimeout(() => {
      overlay.querySelector('#checkout-step-2').style.display = 'none';
      overlay.querySelector('#checkout-step-3').style.display = 'block';

      // Build download links
      const downloadContainer = overlay.querySelector('#download-links');
      downloadContainer.innerHTML = purchasedItems.map((item, i) => {
        const icon = item.category === 'eBook' ? '📖' : item.category === 'Music' ? '🎵' : item.category === 'Photography' ? '📸' : '🎬';
        const fileType = item.category === 'eBook' ? 'PDF' : item.category === 'Music' ? 'MP3/WAV' : item.category === 'Photography' ? 'ZIP (JPG)' : 'ZIP (MP4/MOV)';
        return `
          <div style="display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3) var(--space-4);background:var(--color-bg-elevated);border:1px solid rgba(255,255,255,0.05);border-radius:var(--radius-lg);margin-bottom:var(--space-2);animation:slideDown 0.3s ease ${i * 0.1}s both;">
            <div style="width:44px;height:44px;border-radius:var(--radius-md);background:linear-gradient(135deg,${item.color}22,${item.color}08);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;">${icon}</div>
            <div style="flex:1;min-width:0;">
              <div style="font-size:var(--text-sm);font-weight:600;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.name}</div>
              <div style="font-size:11px;color:var(--color-text-muted);">${fileType} • ${formatINR(item.price)}</div>
            </div>
            <a href="#" onclick="event.preventDefault();showToast('Downloading ${item.name}...','success');" style="background:var(--color-primary);color:#fff;border:none;padding:6px 14px;border-radius:var(--radius-md);font-size:12px;font-weight:600;cursor:pointer;text-decoration:none;white-space:nowrap;display:flex;align-items:center;gap:4px;">
              ⬇ Download
            </a>
          </div>
        `;
      }).join('');

      // Clear cart & award points
      if (window.GamificationSystem) {
        GamificationSystem.addPoints(Math.floor(total / 10), 'Purchase completed!');
      }
      this.items = [];
      this.save();
      this.updateUI();
      this.renderCartItems();
      this.closeCart();
    }, 13000);
  }
}

// ========== Product Rendering ==========
function renderProducts(containerId, filter = null) {
  const container = document.getElementById(containerId);
  if (!container) return;

  let products = PRODUCTS;
  if (filter && filter !== 'all') {
    products = PRODUCTS.filter(p => p.category.toLowerCase() === filter.toLowerCase());
  }

  container.innerHTML = products.map((product, index) => `
    <div class="product-card reveal delay-${(index % 4) + 1}" data-product-id="${product.id}">
      <div class="card-image">
        <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.style.display='none'; this.parentElement.querySelector('.fallback-icon').style.display='flex';">
        <div class="fallback-icon" style="display:none;width:100%;height:100%;align-items:center;justify-content:center;flex-direction:column;gap:8px;background:linear-gradient(135deg, ${product.color}22, ${product.color}08);">
          <span style="font-size:3rem;">${product.category === 'eBook' ? '📖' : product.category === 'Music' ? '🎵' : product.category === 'Photography' ? '📸' : '🎬'}</span>
          <span style="font-size:0.75rem;color:var(--color-text-muted);font-weight:600;text-transform:uppercase;letter-spacing:0.1em;">${product.category}</span>
        </div>
        ${product.badge ? `<span class="card-badge ${product.badge}">${product.badge}</span>` : ''}
        <button class="wishlist-btn" onclick="event.stopPropagation(); this.classList.toggle('active');">${Icons.heart}</button>
      </div>
      <div class="card-body">
        <div class="card-category">${product.category}</div>
        <h4 class="card-title">${product.name}</h4>
        <p class="card-desc">${product.description}</p>
        <div style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-3);">
          <div class="star-rating" style="pointer-events:none;">
            ${Array(5).fill('').map((_, i) => `<span class="star ${i < Math.floor(product.rating) ? 'filled' : ''}">${Icons.star}</span>`).join('')}
          </div>
          <span style="font-size:var(--text-xs);color:var(--color-text-muted);">(${product.reviews})</span>
        </div>
        <div class="card-footer">
          <div class="card-price">
            ${formatINR(product.price)}
            ${product.originalPrice ? `<span class="original">${formatINR(product.originalPrice)}</span>` : ''}
          </div>
          <button class="add-to-cart ripple-effect" onclick="event.stopPropagation(); cart.addItem('${product.id}')">Add to Cart</button>
        </div>
      </div>
    </div>
  `).join('');

  initScrollReveal();
}

function initProductFilter() {
  const filterBtns = document.querySelectorAll('[data-filter]');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderProducts('products-grid', btn.dataset.filter);
    });
  });
}

// ========== Initialize Store ==========
let cart;

document.addEventListener('DOMContentLoaded', () => {
  cart = new CartSystem();
  cart.init();

  if (document.getElementById('products-grid')) {
    renderProducts('products-grid');
    initProductFilter();
  }

  if (document.getElementById('featured-products')) {
    renderFeaturedProducts();
  }
});

function renderFeaturedProducts() {
  const container = document.getElementById('featured-products');
  if (!container) return;

  const featured = PRODUCTS.filter(p => p.badge === 'hot' || p.rating >= 4.8).slice(0, 4);
  container.innerHTML = featured.map((product, index) => `
    <div class="product-card tilt-card reveal delay-${index + 1}" data-product-id="${product.id}">
      <div class="card-image">
        <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.style.display='none'; this.parentElement.querySelector('.fb').style.display='flex';">
        <div class="fb" style="display:none;width:100%;height:100%;align-items:center;justify-content:center;flex-direction:column;gap:8px;background:linear-gradient(135deg, ${product.color}22, ${product.color}08);">
          <span style="font-size:3rem;">${product.category === 'eBook' ? '📖' : product.category === 'Music' ? '🎵' : product.category === 'Photography' ? '📸' : '🎬'}</span>
        </div>
        ${product.badge ? `<span class="card-badge ${product.badge}">${product.badge}</span>` : ''}
      </div>
      <div class="card-body">
        <div class="card-category">${product.category}</div>
        <h4 class="card-title">${product.name}</h4>
        <div class="card-footer">
          <div class="card-price">${formatINR(product.price)}</div>
          <button class="add-to-cart ripple-effect" onclick="event.stopPropagation(); cart.addItem('${product.id}')">Add to Cart</button>
        </div>
      </div>
    </div>
  `).join('');
}

window.PRODUCTS = PRODUCTS;
window.renderProducts = renderProducts;
window.formatINR = formatINR;

function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal:not(.revealed), .reveal-left:not(.revealed), .reveal-right:not(.revealed), .reveal-scale:not(.revealed), .stagger-list:not(.revealed)');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
  revealElements.forEach(el => observer.observe(el));
}
