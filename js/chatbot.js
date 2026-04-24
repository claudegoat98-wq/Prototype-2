/* ============================================
   NovaPulse Digital — Ollama Chatbot (Fast Mode)
   Uses llama3.2:1b for instant responses + streaming
   ============================================ */

const OLLAMA_URL = 'http://localhost:11434/api/chat';
const OLLAMA_MODEL = 'llama3.2:1b';

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

class ChatBot {
  constructor() {
    this.messages = [
      { role: 'system', content: SYSTEM_PROMPT }
    ];
    this.isOpen = false;
    this.isTyping = false;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    this.initialized = true;
    this.createWidget();
    this.bindEvents();
    this.addBotMessage("Hey! 👋 Welcome to NovaPulse Digital. I'm your AI assistant — ask me about our products, pricing, or anything else!");
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
            <span>Powered by Llama 3.2 • Fast Mode</span>
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

  // Creates an empty bot message that we can stream into
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
      const response = await this.callOllamaStreaming();
      this.messages.push({ role: 'assistant', content: response });

      if (window.GamificationSystem) {
        GamificationSystem.addPoints(5, 'Asked a question!');
      }
    } catch (error) {
      this.hideTyping();
      console.error('Ollama error:', error);
      this.addBotMessage("I'm having trouble connecting right now. Make sure Ollama is running (`ollama serve`) and try again! 🔧");
    }

    this.isTyping = false;
    this.sendBtn.disabled = false;
  }

  // Streaming response — shows text as it generates (feels instant!)
  async callOllamaStreaming() {
    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: this.messages.slice(-8), // Keep context small for speed
        stream: true,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          num_predict: 150,   // Shorter responses = faster
          num_ctx: 2048       // Smaller context window = faster
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama responded with ${response.status}`);
    }

    // Remove typing indicator, create streaming message
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
