/* ============================================
   NovaPulse Digital — Admin Analytics Dashboard (INR)
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('dashboard-page')) return;

  initDashboardCharts();
  initDashboardCounters();
  animateMetricCards();
  initRecentOrders();
  initTopProducts();
});

// ========== Dashboard Data (INR) ==========
const dashboardData = {
  revenue: { total: 4052500, change: 12.5, data: [265000, 340000, 315000, 432000, 382000, 481000, 515000, 448000, 407000, 456000] },
  orders: { total: 1247, change: 8.3, data: [85, 92, 78, 105, 98, 115, 128, 110, 96, 108] },
  customers: { total: 3842, change: 15.2, data: [280, 310, 295, 340, 325, 365, 390, 355, 320, 362] },
  conversion: { total: 3.8, change: -2.1, data: [3.2, 3.5, 3.1, 4.0, 3.8, 4.2, 4.5, 4.1, 3.6, 3.8] }
};

const recentOrders = [
  { id: '#NP-2847', customer: 'Rahul Sharma', product: "Creator's Handbook", amount: 499, status: 'completed', time: '2 min ago' },
  { id: '#NP-2846', customer: 'Priya Patel', product: 'Cosmic Beats Vol. 1', amount: 399, status: 'completed', time: '15 min ago' },
  { id: '#NP-2845', customer: 'Arjun Reddy', product: 'Motion Graphics Kit', amount: 999, status: 'processing', time: '32 min ago' },
  { id: '#NP-2844', customer: 'Sneha Iyer', product: 'Marketing Mastery', amount: 699, status: 'completed', time: '1 hr ago' },
  { id: '#NP-2843', customer: 'Vikram Singh', product: 'Cinematic LUTs', amount: 599, status: 'completed', time: '2 hrs ago' },
  { id: '#NP-2842', customer: 'Ananya Gupta', product: 'Urban Aesthetics', amount: 299, status: 'refunded', time: '3 hrs ago' },
];

const topProducts = [
  { name: 'Motion Graphics Kit', sales: 234, revenue: 233766, growth: 24 },
  { name: 'Cosmic Beats Vol. 1', sales: 203, revenue: 80997, growth: 18 },
  { name: "Creator's Handbook", sales: 142, revenue: 70858, growth: 12 },
  { name: 'Cinematic LUTs Pack', sales: 156, revenue: 93444, growth: 15 },
  { name: 'Marketing Mastery', sales: 89, revenue: 62211, growth: 8 },
];

function formatINR(amount) {
  return '₹' + amount.toLocaleString('en-IN');
}

// ========== Canvas Charts ==========
function initDashboardCharts() {
  drawLineChart('revenue-chart', dashboardData.revenue.data, '#7c3aed');
  drawLineChart('orders-chart', dashboardData.orders.data, '#06b6d4');
  drawBarChart('products-chart');
  drawDoughnutChart('category-chart');
}

function drawLineChart(canvasId, data, color) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  canvas.style.width = rect.width + 'px';
  canvas.style.height = rect.height + 'px';
  ctx.scale(dpr, dpr);

  const w = rect.width;
  const h = rect.height;
  const padding = { top: 10, right: 10, bottom: 10, left: 10 };
  const chartW = w - padding.left - padding.right;
  const chartH = h - padding.top - padding.bottom;
  const max = Math.max(...data) * 1.1;
  const min = Math.min(...data) * 0.9;

  let progress = 0;
  const duration = 1500;
  const startTime = performance.now();

  function draw(timestamp) {
    const elapsed = timestamp - startTime;
    progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);

    ctx.clearRect(0, 0, w, h);

    const gradient = ctx.createLinearGradient(0, padding.top, 0, h);
    gradient.addColorStop(0, color + '30');
    gradient.addColorStop(1, color + '00');

    ctx.beginPath();
    ctx.moveTo(padding.left, h - padding.bottom);

    const pointsToDraw = Math.floor(data.length * eased);

    for (let i = 0; i <= pointsToDraw; i++) {
      const x = padding.left + (i / (data.length - 1)) * chartW;
      const y = padding.top + chartH - ((data[i] - min) / (max - min)) * chartH;
      if (i === 0) { ctx.lineTo(x, y); }
      else {
        const prevX = padding.left + ((i - 1) / (data.length - 1)) * chartW;
        const prevY = padding.top + chartH - ((data[i - 1] - min) / (max - min)) * chartH;
        const cpX = (prevX + x) / 2;
        ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
      }
    }

    const lastX = padding.left + (pointsToDraw / (data.length - 1)) * chartW;
    ctx.lineTo(lastX, h - padding.bottom);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.beginPath();
    for (let i = 0; i <= pointsToDraw; i++) {
      const x = padding.left + (i / (data.length - 1)) * chartW;
      const y = padding.top + chartH - ((data[i] - min) / (max - min)) * chartH;
      if (i === 0) { ctx.moveTo(x, y); }
      else {
        const prevX = padding.left + ((i - 1) / (data.length - 1)) * chartW;
        const prevY = padding.top + chartH - ((data[i - 1] - min) / (max - min)) * chartH;
        const cpX = (prevX + x) / 2;
        ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
      }
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    for (let i = 0; i <= pointsToDraw; i++) {
      const x = padding.left + (i / (data.length - 1)) * chartW;
      const y = padding.top + chartH - ((data[i] - min) / (max - min)) * chartH;
      ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
      ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
    }

    if (progress < 1) requestAnimationFrame(draw);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) { requestAnimationFrame(draw); observer.unobserve(entry.target); } });
  }, { threshold: 0.3 });
  observer.observe(canvas);
}

function drawBarChart(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  canvas.style.width = rect.width + 'px';
  canvas.style.height = rect.height + 'px';
  ctx.scale(dpr, dpr);

  const w = rect.width, h = rect.height;
  const padding = { top: 30, right: 20, bottom: 40, left: 50 };
  const categories = ['eBooks', 'Music', 'Photos', 'Video'];
  const values = [42, 28, 15, 15];
  const colors = ['#7c3aed', '#ec4899', '#f59e0b', '#06b6d4'];
  const barWidth = (w - padding.left - padding.right) / categories.length * 0.6;
  const gap = (w - padding.left - padding.right) / categories.length;
  const maxVal = Math.max(...values) * 1.2;

  let progress = 0;
  const duration = 1000;
  const startTime = performance.now();

  function draw(timestamp) {
    const elapsed = timestamp - startTime;
    progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    ctx.clearRect(0, 0, w, h);

    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (h - padding.top - padding.bottom) * (i / 4);
      ctx.beginPath(); ctx.moveTo(padding.left, y); ctx.lineTo(w - padding.right, y);
      ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1; ctx.stroke();
      const val = Math.round(maxVal * (1 - i / 4));
      ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '11px Inter, sans-serif'; ctx.textAlign = 'right';
      ctx.fillText(val + '%', padding.left - 8, y + 4);
    }

    categories.forEach((cat, i) => {
      const x = padding.left + i * gap + (gap - barWidth) / 2;
      const barH = ((values[i] / maxVal) * (h - padding.top - padding.bottom)) * eased;
      const y = h - padding.bottom - barH;
      const grad = ctx.createLinearGradient(x, y, x, h - padding.bottom);
      grad.addColorStop(0, colors[i]); grad.addColorStop(1, colors[i] + '40');
      const radius = 4;
      ctx.beginPath();
      ctx.moveTo(x + radius, y); ctx.lineTo(x + barWidth - radius, y);
      ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
      ctx.lineTo(x + barWidth, h - padding.bottom); ctx.lineTo(x, h - padding.bottom);
      ctx.lineTo(x, y + radius); ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.fillStyle = grad; ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '11px Inter, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(cat, x + barWidth / 2, h - padding.bottom + 20);
      if (eased > 0.5) { ctx.fillStyle = '#fff'; ctx.font = 'bold 12px Inter, sans-serif'; ctx.fillText(values[i] + '%', x + barWidth / 2, y - 8); }
    });

    if (progress < 1) requestAnimationFrame(draw);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) { requestAnimationFrame(draw); observer.unobserve(entry.target); } });
  }, { threshold: 0.3 });
  observer.observe(canvas);
}

function drawDoughnutChart(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width * dpr; canvas.height = rect.height * dpr;
  canvas.style.width = rect.width + 'px'; canvas.style.height = rect.height + 'px';
  ctx.scale(dpr, dpr);

  const w = rect.width, h = rect.height;
  const centerX = w / 2, centerY = h / 2;
  const radius = Math.min(w, h) / 2 - 20;
  const innerRadius = radius * 0.65;
  const segments = [
    { label: 'eBooks', value: 35, color: '#7c3aed' },
    { label: 'Music', value: 28, color: '#ec4899' },
    { label: 'Photos', value: 20, color: '#f59e0b' },
    { label: 'Video', value: 17, color: '#06b6d4' }
  ];
  const total = segments.reduce((s, seg) => s + seg.value, 0);

  let progress = 0;
  const duration = 1200;
  const startTime = performance.now();

  function draw(timestamp) {
    const elapsed = timestamp - startTime;
    progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    ctx.clearRect(0, 0, w, h);

    let startAngle = -Math.PI / 2;
    const endProgress = Math.PI * 2 * eased;

    segments.forEach((seg) => {
      const sliceAngle = (seg.value / total) * Math.PI * 2;
      const drawAngle = Math.min(sliceAngle, Math.max(0, endProgress - (startAngle + Math.PI / 2)));
      if (drawAngle > 0) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + drawAngle);
        ctx.arc(centerX, centerY, innerRadius, startAngle + drawAngle, startAngle, true);
        ctx.closePath(); ctx.fillStyle = seg.color; ctx.fill();
      }
      startAngle += sliceAngle;
    });

    if (eased > 0.5) {
      ctx.fillStyle = '#fff'; ctx.font = `bold ${Math.min(w, h) * 0.12}px 'Space Grotesk', sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('100%', centerX, centerY - 8);
      ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = `${Math.min(w, h) * 0.06}px Inter, sans-serif`;
      ctx.fillText('Total Sales', centerX, centerY + 16);
    }

    if (progress < 1) requestAnimationFrame(draw);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) { requestAnimationFrame(draw); observer.unobserve(entry.target); } });
  }, { threshold: 0.3 });
  observer.observe(canvas);
}

function animateMetricCards() {
  document.querySelectorAll('.metric-card').forEach((card, i) => { card.style.animationDelay = `${i * 0.1}s`; });
}

function initDashboardCounters() {
  document.querySelectorAll('[data-count]').forEach(counter => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => { if (entry.isIntersecting) { animateCounter(entry.target); observer.unobserve(entry.target); } });
    }, { threshold: 0.5 });
    observer.observe(counter);
  });
}

function animateCounter(element) {
  const target = parseFloat(element.dataset.count);
  const suffix = element.dataset.suffix || '';
  const prefix = element.dataset.prefix || '';
  const isDecimal = target % 1 !== 0;
  const duration = 2000;
  const start = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = eased * target;

    if (isDecimal) {
      element.textContent = prefix + current.toFixed(1) + suffix;
    } else {
      element.textContent = prefix + Math.floor(current).toLocaleString('en-IN') + suffix;
    }

    if (progress < 1) requestAnimationFrame(update);
    else {
      if (isDecimal) element.textContent = prefix + target.toFixed(1) + suffix;
      else element.textContent = prefix + target.toLocaleString('en-IN') + suffix;
    }
  }

  requestAnimationFrame(update);
}

function initRecentOrders() {
  const tbody = document.getElementById('orders-tbody');
  if (!tbody) return;

  const statusColors = { completed: 'var(--color-success)', processing: 'var(--color-warning)', refunded: 'var(--color-danger)' };

  tbody.innerHTML = recentOrders.map(order => `
    <tr>
      <td style="font-weight:600;color:var(--color-primary-light);">${order.id}</td>
      <td>${order.customer}</td>
      <td>${order.product}</td>
      <td style="font-weight:600;">${formatINR(order.amount)}</td>
      <td><span class="badge" style="background:${statusColors[order.status]}22;color:${statusColors[order.status]};">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span></td>
      <td style="color:var(--color-text-muted);">${order.time}</td>
    </tr>
  `).join('');
}

function initTopProducts() {
  const container = document.getElementById('top-products');
  if (!container) return;

  container.innerHTML = topProducts.map((product, i) => `
    <div style="display:flex;align-items:center;gap:var(--space-4);padding:var(--space-4) 0;border-bottom:1px solid rgba(255,255,255,0.03);">
      <div style="width:32px;height:32px;border-radius:var(--radius-md);background:var(--gradient-primary);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:var(--text-sm);color:#fff;">${i + 1}</div>
      <div style="flex:1;">
        <div style="font-size:var(--text-sm);font-weight:600;color:#fff;">${product.name}</div>
        <div style="font-size:var(--text-xs);color:var(--color-text-muted);">${product.sales} sales</div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:var(--text-sm);font-weight:600;color:#fff;">${formatINR(product.revenue)}</div>
        <div style="font-size:var(--text-xs);color:var(--color-success);">+${product.growth}%</div>
      </div>
    </div>
  `).join('');
}
