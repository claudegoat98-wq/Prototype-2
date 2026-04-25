/* ============================================
   NovaPulse Digital — Smart Chatbot
   Hybrid: Ollama AI (local) + Smart Fallback (universal)
   Works on any device — no API keys needed
   ============================================ */

const OLLAMA_URL = 'http://localhost:11434/api/chat';
const OLLAMA_MODEL = 'llama3.2:1b';
let ollamaAvailable = null; // null = not checked, true/false

const SYSTEM_PROMPT = `You are NovaPulse AI, the helpful assistant for NovaPulse Digital Studio — a premium creative digital agency based in Bangalore, India.

About Us:
- Tagline: "Ignite Your Digital Universe"
- Email: ecommercenoobs@gmail.com
- Phone: +91 8861005767
- Location: Bangalore, Karnataka, India
- UPI: 8861005767@nyes

Products (all prices in INR):
1. eBooks: "The Digital Creator's Handbook" (₹499), "Marketing Mastery Guide" (₹699)
2. Music: "Cosmic Beats Vol. 1" (₹399), "Ambient Dreamscapes Pack" (₹349)
3. Photography: "Urban Aesthetics Collection" (₹299), "Nature's Canvas Portfolio" (₹299)
4. Video: "Motion Graphics Starter Kit" (₹999), "Cinematic LUTs Pack" (₹599)

Subscription Plans:
- Starter: Free
- Creator: ₹299/mo — 2 free downloads, priority support
- Pro Studio: ₹799/mo — Unlimited downloads, exclusive content

Payment: UPI (GPay, PhonePe, Paytm), Net Banking, COD available.
30-day money-back guarantee. Instant digital delivery.
Loyalty points: Earn 1 point per ₹10 spent.

Rules: Be concise (2-3 sentences max). Be helpful and friendly. Recommend products when relevant. Use ₹ for prices. If asked about non-NovaPulse topics, politely redirect.`;

// ========== Smart Fallback Response Engine ==========
const FALLBACK_RESPONSES = {
  greeting: [
    "Hey there! 👋 Welcome to NovaPulse Digital. I can help you with products, pricing, payments, or anything else. What are you looking for?",
    "Hi! 😊 I'm the NovaPulse assistant. Ask me about our digital products, subscription plans, or how to get started!",
    "Hello! Welcome to NovaPulse Digital Studio — Bangalore's premium digital product hub. How can I help you today?"
  ],
  products: [
    "We've got 8 premium digital products across 4 categories:\n\n📖 **eBooks**: Creator's Handbook (₹499), Marketing Mastery (₹699)\n🎵 **Music**: Cosmic Beats (₹399), Ambient Dreamscapes (₹349)\n📸 **Photos**: Urban Aesthetics (₹299), Nature's Canvas (₹299)\n🎬 **Video**: Motion Graphics Kit (₹999), Cinematic LUTs (₹599)\n\nHead to our Store page to browse them all!",
  ],
  ebooks: [
    "We have 2 amazing eBooks:\n\n📖 **The Digital Creator's Handbook** — ₹499 (was ₹799!) — A complete 200-page guide to building your digital brand, content strategy, and monetization.\n\n📖 **Marketing Mastery Guide** — ₹699 — Advanced digital marketing strategies: SEO, social media, email marketing, and paid advertising.\n\nBoth are instant digital delivery! 🚀"
  ],
  music: [
    "Check out our music packs:\n\n🎵 **Cosmic Beats Vol. 1** — ₹399 — 25 royalty-free lo-fi beats for content creators, streamers, and podcasts. Our best seller! 🔥\n\n🎵 **Ambient Dreamscapes Pack** — ₹349 (was ₹599!) — 15 atmospheric ambient tracks perfect for meditation, study, or focus sessions.\n\nAll tracks are royalty-free for commercial use!"
  ],
  photography: [
    "Our photography collections:\n\n📸 **Urban Aesthetics Collection** — ₹299 — 50+ curated urban photos from Bangalore streets. High-res, commercially licensed.\n\n📸 **Nature's Canvas Portfolio** — ₹299 (was ₹499!) — 40+ stunning Indian landscapes — Western Ghats, Kerala backwaters, Himalayan peaks.\n\nPerfect for websites, social media, and presentations!"
  ],
  video: [
    "Our video production tools:\n\n🎬 **Motion Graphics Starter Kit** — ₹999 (was ₹1,499!) — 30+ ready-to-use motion graphics templates. Lower thirds, transitions, titles, and more.\n\n🎬 **Cinematic LUTs Pack** — ₹599 — 20 professional color grading LUTs. Works with Premiere, DaVinci, and FCPX.\n\nGreat for YouTubers and filmmakers! 🎥"
  ],
  pricing: [
    "Our subscription plans:\n\n🆓 **Starter** — Free — Access free blog content, community forums, AI chatbot (5 queries/day), earn loyalty points.\n\n⭐ **Creator** — ₹299/mo — Everything in Starter + 2 free downloads/month, priority support, exclusive creator tools, 2x loyalty points.\n\n🚀 **Pro Studio** — ₹799/mo — Everything in Creator + unlimited downloads, early access to new products, commercial license, admin dashboard, 5x loyalty points.\n\nAll plans include a 30-day money-back guarantee!"
  ],
  payment: [
    "We accept multiple payment methods:\n\n💳 **UPI** — GPay, PhonePe, Paytm, Navi (our UPI ID: 8861005767@nyes)\n🏦 **Net Banking** — All major banks supported\n💰 **COD** — Cash on Delivery available\n\nAll digital products are delivered instantly after payment. Just scan our QR code at checkout! 📱"
  ],
  upi: [
    "Our UPI payment details:\n\n💳 **UPI ID**: 8861005767@nyes\n👤 **Name**: Hemadri D Y Gowda\n📱 **Apps**: Works with GPay, PhonePe, Paytm, Navi, and all UPI apps\n\nYou can scan the QR code at checkout, or copy the UPI ID directly. Payments are instant! ⚡"
  ],
  contact: [
    "Here's how to reach us:\n\n📧 **Email**: ecommercenoobs@gmail.com\n📱 **Phone**: +91 8861005767\n💬 **WhatsApp**: wa.me/918861005767\n📍 **Location**: Bangalore, Karnataka, India\n💳 **UPI**: 8861005767@nyes\n\nWe typically respond within a few hours!"
  ],
  bestseller: [
    "Our top sellers right now:\n\n🔥 **Cosmic Beats Vol. 1** (₹399) — 203 reviews, 4.7★ — Our most popular music pack!\n📖 **The Digital Creator's Handbook** (₹499) — 142 reviews, 4.8★ — The go-to guide for creators\n🎬 **Motion Graphics Starter Kit** (₹999) — 234 reviews, 4.9★ — Highest rated product!\n\nAll three are must-haves for serious creators! 💪"
  ],
  refund: [
    "We offer a **30-day money-back guarantee** on all digital products! 🛡️\n\nIf you're not satisfied, just email us at ecommercenoobs@gmail.com within 30 days of purchase and we'll process a full refund — no questions asked.\n\nYour satisfaction is our priority! 💜"
  ],
  loyalty: [
    "Our loyalty rewards program:\n\n🏆 Earn **1 point per ₹10 spent** on any purchase\n⭐ Extra points for feedback, chatting, and engagement\n📈 Level up: Newcomer → Explorer → Creator → Expert → Legend\n🎁 Redeem points for discounts and exclusive content\n\nPro Studio subscribers earn **5x points** on everything! 🚀"
  ],
  delivery: [
    "All our products are **digital downloads** — you get them instantly! ⚡\n\nAfter payment is verified, you'll see download buttons right on the checkout screen. You can download your products immediately — eBooks as PDF, music as MP3/WAV, photos as ZIP (JPG), and video assets as ZIP (MP4/MOV).\n\nNo shipping, no waiting! 📦"
  ],
  about: [
    "**NovaPulse Digital Studio** is a premium digital product marketplace based in Bangalore, India 🇮🇳\n\nWe create and sell high-quality digital products for creators, marketers, and visionaries — from eBooks and music to photography and video tools.\n\nOur mission: **Ignite Your Digital Universe** ✨\n\nFounded by creators, for creators. We believe everyone deserves access to premium digital tools at fair prices."
  ],
  discount: [
    "Here are ways to save at NovaPulse:\n\n🏷️ Watch for **SALE** badges — some products are up to 40% off!\n📋 Submit feedback and get code **THANKS10** for 10% off\n⭐ **Creator plan** (₹299/mo) gets you 2 free downloads/month\n🚀 **Pro Studio** (₹799/mo) gives unlimited downloads\n🏆 Earn loyalty points and redeem for discounts\n\nBest value: The Pro Studio plan pays for itself with just 1-2 downloads! 💰"
  ],
  help: [
    "Here's what I can help you with:\n\n📦 **Products** — Browse our digital products\n💰 **Pricing** — Subscription plans & prices\n💳 **Payment** — UPI, payment methods\n📧 **Contact** — Email, phone, location\n🔥 **Best Sellers** — Our most popular items\n🔄 **Refunds** — 30-day money-back guarantee\n🏆 **Rewards** — Loyalty points program\n📥 **Delivery** — How downloads work\n\nJust ask about any of these topics!"
  ],
  thanks: [
    "You're welcome! 😊 Happy to help. Don't hesitate to reach out if you have more questions. Have an amazing day! 💜",
    "Glad I could help! 🙌 If you need anything else, I'm right here. Happy creating! ✨",
    "Anytime! 😄 Wishing you all the best with your creative projects. We're always here for you! 🚀"
  ],
  bye: [
    "Goodbye! 👋 Thanks for chatting with NovaPulse AI. Come back anytime! 💜",
    "See you later! 🎉 Don't forget to check out our Store for amazing digital products. Bye! ✨",
    "Take care! 😊 Remember — you can always reach us at ecommercenoobs@gmail.com. Happy creating! 🚀"
  ],
  fallback: [
    "I'm best at answering questions about NovaPulse products, pricing, and services! 😊 Try asking about our eBooks, music packs, photography collections, or video tools. Or type **help** to see everything I can assist with!",
    "Hmm, I'm not sure about that one! But I can help you with NovaPulse products, pricing plans, payment methods, or contact info. What would you like to know? 💡",
    "That's a great question! However, I specialize in NovaPulse Digital products and services. Ask me about our products, plans, or how to get started! 🚀"
  ]
};

function getSmartResponse(userMessage) {
  const msg = userMessage.toLowerCase().trim();

  // Greeting patterns
  if (/^(hi|hello|hey|howdy|good\s*(morning|afternoon|evening)|sup|yo|hola|namaste)\b/i.test(msg)) {
    return pickRandom(FALLBACK_RESPONSES.greeting);
  }

  // Thanks
  if (/\b(thanks|thank\s*you|thx|ty|appreciate|grateful)\b/i.test(msg)) {
    return pickRandom(FALLBACK_RESPONSES.thanks);
  }

  // Goodbye
  if (/\b(bye|goodbye|see\s*you|later|cya|take\s*care|good\s*night)\b/i.test(msg)) {
    return pickRandom(FALLBACK_RESPONSES.bye);
  }

  // Help
  if (/^(help|what\s*can\s*you|menu|options|commands)\b/i.test(msg)) {
    return pickRandom(FALLBACK_RESPONSES.help);
  }

  // eBooks
  if (/\b(ebook|e-book|book|handbook|guide|read|marketing\s*mastery|creator.*handbook|pdf)\b/i.test(msg)) {
    return pickRandom(FALLBACK_RESPONSES.ebooks);
  }

  // Music
  if (/\b(music|beats|audio|lo-?fi|lofi|ambient|sound|track|song|cosmic|dreamscape)\b/i.test(msg)) {
    return pickRandom(FALLBACK_RESPONSES.music);
  }

  // Photography
  if (/\b(photo|photography|picture|image|urban|nature|landscape|wallpaper|stock\s*photo)\b/i.test(msg)) {
    return pickRandom(FALLBACK_RESPONSES.photography);
  }

  // Video
  if (/\b(video|motion|graphic|lut|luts|cinema|film|premiere|davinci|fcpx|template|transition)\b/i.test(msg)) {
    return pickRandom(FALLBACK_RESPONSES.video);
  }

  // Products (general)
  if (/\b(product|catalog|store|shop|buy|purchase|item|offer|sell|what\s*(do\s*you|have))\b/i.test(msg)) {
    return pickRandom(FALLBACK_RESPONSES.products);
  }

  // Pricing / Plans
  if (/\b(pric|plan|subscri|cost|how\s*much|rate|package|starter|creator\s*plan|pro\s*studio|free|month)\b/i.test(msg)) {
    return pickRandom(FALLBACK_RESPONSES.pricing);
  }

  // Payment / UPI
  if (/\b(upi|gpay|phonepe|paytm|navi|pay\s*via|upi\s*id|qr|scan)\b/i.test(msg)) {
    return pickRandom(FALLBACK_RESPONSES.upi);
  }
  if (/\b(pay|payment|checkout|transaction|bank|net\s*banking|cod|cash)\b/i.test(msg)) {
    return pickRandom(FALLBACK_RESPONSES.payment);
  }

  // Contact
  if (/\b(contact|email|phone|number|call|whatsapp|reach|location|address|bangalore|karnataka|india)\b/i.test(msg)) {
    return pickRandom(FALLBACK_RESPONSES.contact);
  }

  // Best sellers
  if (/\b(best|popular|top|recommend|suggest|hot|trending|favourite|favorite|best\s*seller)\b/i.test(msg)) {
    return pickRandom(FALLBACK_RESPONSES.bestseller);
  }

  // Refund
  if (/\b(refund|return|money\s*back|guarantee|cancel|dissatisfied|complaint)\b/i.test(msg)) {
    return pickRandom(FALLBACK_RESPONSES.refund);
  }

  // Loyalty / Rewards
  if (/\b(loyal|reward|point|gamif|level|rank|badge|redeem)\b/i.test(msg)) {
    return pickRandom(FALLBACK_RESPONSES.loyalty);
  }

  // Delivery / Download
  if (/\b(deliver|download|ship|receive|access|get\s*my|instant|how\s*do\s*i\s*get)\b/i.test(msg)) {
    return pickRandom(FALLBACK_RESPONSES.delivery);
  }

  // About
  if (/\b(about|who\s*(are|is)|company|team|founded|mission|story|novapulse|what\s*is)\b/i.test(msg)) {
    return pickRandom(FALLBACK_RESPONSES.about);
  }

  // Discount / Deals
  if (/\b(discount|coupon|code|deal|offer|sale|cheap|save|free|promo)\b/i.test(msg)) {
    return pickRandom(FALLBACK_RESPONSES.discount);
  }

  // Fallback
  return pickRandom(FALLBACK_RESPONSES.fallback);
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ========== Check Ollama availability ==========
async function checkOllama() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch('http://localhost:11434/api/tags', { signal: controller.signal });
    clearTimeout(timeout);
    ollamaAvailable = res.ok;
  } catch {
    ollamaAvailable = false;
  }
  return ollamaAvailable;
}

// ========== ChatBot Class ==========
class ChatBot {
  constructor() {
    this.messages = [
      { role: 'system', content: SYSTEM_PROMPT }
    ];
    this.isOpen = false;
    this.isTyping = false;
    this.initialized = false;
    this.mode = 'checking'; // 'ollama', 'smart', 'checking'
  }

  init() {
    if (this.initialized) return;
    this.initialized = true;
    this.createWidget();
    this.bindEvents();
    this.addBotMessage("Hey! 👋 Welcome to NovaPulse Digital. I'm your AI assistant — ask me about our products, pricing, or anything else!");
    this.detectMode();
  }

  async detectMode() {
    const available = await checkOllama();
    this.mode = available ? 'ollama' : 'smart';
    this.updateStatusIndicator();
  }

  updateStatusIndicator() {
    const statusEl = this.windowEl?.querySelector('.bot-status span:last-child');
    if (!statusEl) return;
    if (this.mode === 'ollama') {
      statusEl.textContent = '🟢 AI Mode (Llama 3.2)';
    } else {
      statusEl.textContent = '🟢 Online • Smart Assistant';
    }
  }

  createWidget() {
    const toggle = document.createElement('button');
    toggle.classList.add('chatbot-toggle');
    toggle.id = 'chatbot-toggle';
    toggle.innerHTML = `
      <span class="chat-icon">${Icons.chat}</span>
      <span class="close-icon">${Icons.close}</span>
      <span class="notification-dot"></span>
    `;
    document.body.appendChild(toggle);

    const win = document.createElement('div');
    win.classList.add('chatbot-window');
    win.id = 'chatbot-window';
    win.innerHTML = `
      <div class="chatbot-header">
        <div class="bot-avatar">🤖</div>
        <div class="bot-info">
          <div class="bot-name">NovaPulse AI</div>
          <div class="bot-status">
            <span class="status-dot"></span>
            <span>Connecting...</span>
          </div>
        </div>
        <button class="clear-btn" title="Clear chat">🗑️</button>
      </div>
      <div class="chatbot-messages" id="chat-messages"></div>
      <div class="quick-actions" id="quick-actions">
        <button class="quick-action-btn" data-msg="What products do you offer?">📦 Products</button>
        <button class="quick-action-btn" data-msg="Tell me about pricing plans">💰 Pricing</button>
        <button class="quick-action-btn" data-msg="What's your best seller?">🔥 Best Sellers</button>
        <button class="quick-action-btn" data-msg="How can I pay?">💳 Payment</button>
      </div>
      <div class="chatbot-input">
        <textarea class="chat-textarea" id="chat-input" placeholder="Type your message..." rows="1"></textarea>
        <button class="send-btn" id="chat-send">${Icons.send}</button>
      </div>
    `;
    document.body.appendChild(win);

    this.toggleBtn = toggle;
    this.windowEl = win;
    this.messagesEl = document.getElementById('chat-messages');
    this.inputEl = document.getElementById('chat-input');
    this.sendBtn = document.getElementById('chat-send');
  }

  bindEvents() {
    this.toggleBtn.addEventListener('click', () => this.toggle());
    this.sendBtn.addEventListener('click', () => this.sendMessage());

    this.inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    this.inputEl.addEventListener('input', () => {
      this.inputEl.style.height = 'auto';
      this.inputEl.style.height = Math.min(this.inputEl.scrollHeight, 100) + 'px';
    });

    document.querySelectorAll('.quick-action-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.inputEl.value = btn.dataset.msg;
        this.sendMessage();
      });
    });

    this.windowEl.querySelector('.clear-btn').addEventListener('click', () => {
      this.messages = [{ role: 'system', content: SYSTEM_PROMPT }];
      this.messagesEl.innerHTML = '';
      this.addBotMessage("Chat cleared! How can I help you?");
      const qa = document.getElementById('quick-actions');
      if (qa) qa.style.display = 'flex';
    });
  }

  toggle() {
    this.isOpen = !this.isOpen;
    this.toggleBtn.classList.toggle('active', this.isOpen);
    this.windowEl.classList.toggle('open', this.isOpen);

    if (this.isOpen) {
      this.inputEl.focus();
      if (!sessionStorage.getItem('chat_opened')) {
        sessionStorage.setItem('chat_opened', 'true');
        if (window.GamificationSystem) {
          GamificationSystem.addPoints(15, 'Started a conversation!');
        }
      }
    }
  }

  addBotMessage(text) {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const msgEl = document.createElement('div');
    msgEl.classList.add('chat-message', 'bot');
    msgEl.innerHTML = `
      <div class="message-avatar">🤖</div>
      <div class="message-content">
        ${this.formatMessage(text)}
        <span class="message-time">${time}</span>
      </div>
    `;
    this.messagesEl.appendChild(msgEl);
    this.scrollToBottom();
    return msgEl;
  }

  createStreamingMessage() {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const msgEl = document.createElement('div');
    msgEl.classList.add('chat-message', 'bot');
    msgEl.innerHTML = `
      <div class="message-avatar">🤖</div>
      <div class="message-content">
        <span class="stream-text"></span>
        <span class="message-time">${time}</span>
      </div>
    `;
    this.messagesEl.appendChild(msgEl);
    this.scrollToBottom();
    return msgEl.querySelector('.stream-text');
  }

  addUserMessage(text) {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const msgEl = document.createElement('div');
    msgEl.classList.add('chat-message', 'user');
    msgEl.innerHTML = `
      <div class="message-avatar">👤</div>
      <div class="message-content">
        ${this.escapeHtml(text)}
        <span class="message-time">${time}</span>
      </div>
    `;
    this.messagesEl.appendChild(msgEl);
    this.scrollToBottom();
  }

  showTyping() {
    const typing = document.createElement('div');
    typing.classList.add('typing-indicator');
    typing.id = 'typing-indicator';
    typing.innerHTML = `<div class="dot"></div><div class="dot"></div><div class="dot"></div>`;
    this.messagesEl.appendChild(typing);
    this.scrollToBottom();
  }

  hideTyping() {
    const typing = document.getElementById('typing-indicator');
    if (typing) typing.remove();
  }

  async sendMessage() {
    const text = this.inputEl.value.trim();
    if (!text || this.isTyping) return;

    this.addUserMessage(text);
    this.inputEl.value = '';
    this.inputEl.style.height = 'auto';

    const quickActions = document.getElementById('quick-actions');
    if (quickActions) quickActions.style.display = 'none';

    this.messages.push({ role: 'user', content: text });

    this.isTyping = true;
    this.sendBtn.disabled = true;
    this.showTyping();

    try {
      let response;

      // Try Ollama first if available
      if (this.mode === 'ollama') {
        try {
          response = await this.callOllamaStreaming();
        } catch {
          // Ollama failed — switch to smart mode permanently
          this.mode = 'smart';
          this.updateStatusIndicator();
          this.hideTyping();
          response = await this.callSmartFallback(text);
        }
      } else {
        // Smart fallback mode
        this.hideTyping();
        response = await this.callSmartFallback(text);
      }

      this.messages.push({ role: 'assistant', content: response });

      if (window.GamificationSystem) {
        GamificationSystem.addPoints(5, 'Asked a question!');
      }
    } catch (error) {
      this.hideTyping();
      console.error('Chat error:', error);
      this.addBotMessage("Oops, something went wrong! Try asking again, or reach us at ecommercenoobs@gmail.com 📧");
    }

    this.isTyping = false;
    this.sendBtn.disabled = false;
  }

  // Smart fallback — simulates typing delay for natural feel
  async callSmartFallback(userMessage) {
    const response = getSmartResponse(userMessage);

    // Simulate realistic typing delay (50-80ms per word)
    const wordCount = response.split(/\s+/).length;
    const delay = Math.min(Math.max(wordCount * 60, 400), 1500);

    return new Promise(resolve => {
      setTimeout(() => {
        this.hideTyping();
        this.addBotMessage(response);
        resolve(response);
      }, delay);
    });
  }

  // Streaming response from Ollama (local AI)
  async callOllamaStreaming() {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: this.messages.slice(-8),
        stream: true,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          num_predict: 150,
          num_ctx: 2048
        }
      })
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Ollama responded with ${response.status}`);
    }

    this.hideTyping();
    const streamTarget = this.createStreamingMessage();

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(line => line.trim());

      for (const line of lines) {
        try {
          const json = JSON.parse(line);
          if (json.message && json.message.content) {
            fullResponse += json.message.content;
            streamTarget.innerHTML = this.formatMessage(fullResponse);
            this.scrollToBottom();
          }
        } catch (e) {
          // Skip malformed JSON chunks
        }
      }
    }

    return fullResponse || "I couldn't generate a response. Please try again.";
  }

  formatMessage(text) {
    let formatted = this.escapeHtml(text);
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    formatted = formatted.replace(/\n/g, '<br>');
    return formatted;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  scrollToBottom() {
    setTimeout(() => {
      this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
    }, 30);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.chatbot = new ChatBot();
  window.chatbot.init();
});
