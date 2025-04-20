interface MatChatColors {
  primary?: string;
  primaryDark?: string;
  secondary?: string;
  text?: string;
  lightText?: string;
  white?: string;
}

interface MatChatDimensions {
  width?: string;
  height?: string;
  avatarSize?: string;
  messageMaxWidth?: string;
}

interface WebhookConfig {
  method?: string;
  headers?: Record<string, string>;
}

interface MatChatOptions {
  container?: HTMLElement;
  position?: string;
  avatarUrl?: string;
  title?: string;
  welcomeMessage?: string | null;
  backgroundImage?: string;
  backgroundPattern?: string;
  icons?: {
    chat?: string;
    close?: string;
    send?: string;
  };
  theme?: 'default' | 'modern' | 'serene' | 'vibrant' | 'deep' | 'custom';
  messageBubbleStyle?: {
    bot?: {
      borderRadius?: string;
      minWidth?: string;
      padding?: string;
    };
    user?: {
      borderRadius?: string;
      minWidth?: string;
      padding?: string;
    };
  };
  colors?: MatChatColors;
  dimensions?: MatChatDimensions;
  messageLimit?: number;
  apiUrl?: string;
  webhookConfig?: WebhookConfig;
  positionOffset?: string;
  onMessageSend?: (message: string, callback: (response: string) => void) => void;
  onWidgetOpen?: () => void;
  onWidgetClose?: () => void;
}

export default class MatChat {
  private defaultOptions: MatChatOptions;
  private options: MatChatOptions;
  private isOpen: boolean;
  private isWaitingForResponse: boolean;
  private sessionId: string;
  private container!: HTMLElement;
  private chatButton!: HTMLButtonElement;
  private chatPopup!: HTMLElement & {
    querySelector<E extends Element = Element>(selectors: string): E;
  };
  private chatMessages!: HTMLDivElement;
  private chatInput!: HTMLInputElement;
  private sendButton!: HTMLButtonElement;
  private chatClose!: HTMLButtonElement;
  private isDestroyed = false;
  
  private boundHandlers = {
    chatButtonClick: () => this.handleChatButtonClick(),
    chatCloseClick: () => this.handleChatClose(),
    sendMessageClick: () => this.handleSendMessage(),
    inputKeyPress: (e: KeyboardEvent) => this.handleInputKeyPress(e),
    inputChange: () => this.handleInputChange()
  };

  constructor(options: MatChatOptions = {}) {
    this.defaultOptions = {
      container: document.body,
      position: 'bottom-right',
      avatarUrl: 'https://ui-avatars.com/api/?name=Matcha&background=4361ee&color=fff',
      title: 'Matcha',
      welcomeMessage: null,
      theme: 'serene',
      colors: {
        primary: 'var(--matchat-primary-color, #6c5ce7)',
        primaryDark: 'var(--matchat-primary-dark, #5649c0)',
        secondary: 'var(--matchat-secondary-color, #f9fafb)',
        text: 'var(--matchat-text-color, #1f2937)',
        lightText: 'var(--matchat-light-text, #6b7280)',
      },
      messageBubbleStyle: {
        bot: {
          borderRadius: '4px 18px 18px 18px'
        },
        user: {
          borderRadius: '18px 4px 18px 18px'
        }
      },
      dimensions: {
        width: '350px',
        height: '500px',
        avatarSize: '40px',
        messageMaxWidth: '240px'
      },
      messageLimit: 500,
      apiUrl: '',
      webhookConfig: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      },
      onMessageSend: undefined,
      onWidgetOpen: undefined,
      onWidgetClose: undefined
    };

    this.options = this.validateOptions({ ...this.defaultOptions, ...options });
    this.isOpen = false;
    this.isWaitingForResponse = false;
    this.sessionId = this.generateSessionId();
    this.init();
  }

  private validateOptions(options: MatChatOptions): MatChatOptions {
    const validPositions = ['bottom-right', 'bottom-left', 'top-right', 'top-left'];
    
    if (options.position && !validPositions.includes(options.position)) {
      console.warn(`Invalid position "${options.position}". Defaulting to "bottom-right".`);
      options.position = 'bottom-right';
    }

    if (options.messageLimit && (typeof options.messageLimit !== 'number' || options.messageLimit <= 0)) {
      console.warn('messageLimit must be a positive number. Using default value.');
      options.messageLimit = this.defaultOptions.messageLimit;
    }

    return options;
  }

  private generateSessionId(): string {
    const buffer = new Uint8Array(16);
    crypto.getRandomValues(buffer);
    return `session_${Array.from(buffer)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('')}_${Date.now().toString(36)}`;
  }

  private init(): void {
    try {
      this.createWidget();
      this.applyCustomStyles();
      this.setupEventListeners();

      if (this.options.welcomeMessage) {
        this.addMessage(this.options.welcomeMessage, 'bot');
      }
    } catch (error) {
      console.error('Failed to initialize MatChat:', error);
    }
  }

  private createWidget(): void {
    this.container = document.createElement('div');
    this.container.className = `matchat-container matchat-${this.options.position}`;
    this.container.setAttribute('aria-live', 'polite');
    (this.options.container as HTMLElement).appendChild(this.container);

    this.createChatButton();
    this.createChatPopup();
  }

  private createChatButton(): void {
    this.chatButton = document.createElement('button');
    this.chatButton.className = 'chat-button';
    this.chatButton.innerHTML = '<i aria-hidden="true"></i>';
    this.chatButton.setAttribute('aria-label', 'Open chat');
    this.chatButton.setAttribute('role', 'button');
    this.container.appendChild(this.chatButton);
  }

  private createChatPopup(): void {
    this.chatPopup = document.createElement('div');
    this.chatPopup.className = 'chat-popup';
    this.chatPopup.setAttribute('aria-modal', 'true');
    this.chatPopup.setAttribute('role', 'dialog');
    this.chatPopup.innerHTML = `
      <div class="chat-header">
        <div class="chat-header-content">
          <img src="${this.options.avatarUrl}" alt="Chat Avatar" class="chat-avatar">
          <h3 id="chat-title">${this.options.title}</h3>
        </div>
        <button class="chat-close" aria-label="Close chat">
          <i aria-hidden="true"></i>
        </button>
      </div>
      <div class="chat-messages" aria-labelledby="chat-title" aria-live="polite">
      </div>
      <div class="chat-input-container">
          <div class="input-wrapper">
              <input 
                  type="text" 
                  class="chat-input" 
                  placeholder="Type your message..." 
                  maxlength="${this.options.messageLimit}"
                  aria-label="Type your message"
              >
              <div class="character-counter"></div>
          </div>
          <button class="send-button" aria-label="Send message">
              <i aria-hidden="true"></i>
          </button>
      </div>
    `;

    this.container.appendChild(this.chatPopup);
    this.chatMessages = this.chatPopup.querySelector('.chat-messages') as HTMLDivElement;
    this.chatInput = this.chatPopup.querySelector('.chat-input') as HTMLInputElement;
    this.sendButton = this.chatPopup.querySelector('.send-button') as HTMLButtonElement;
    this.chatClose = this.chatPopup.querySelector('.chat-close') as HTMLButtonElement;
  }

  private applyCustomStyles(): void {
    const root = document.documentElement;
    const setStyle = (prop: string, value?: string) => 
        value && root.style.setProperty(`--matchat-${prop}`, value);

    if (this.options.theme) {
      this.container.setAttribute('data-theme', this.options.theme);
    }

    if(this.options.theme === 'custom' && this.options.colors) {
      setStyle('primary-color', this.options.colors.primary);
      setStyle('primary-dark', this.options.colors.primaryDark);
      setStyle('secondary-color', this.options.colors.secondary);
      setStyle('text-color', this.options.colors.text);
      setStyle('light-text', this.options.colors.lightText);
      return;
    }

    if(this.options.icons) {
      const setIcon = (element: HTMLElement, icon: string) => {
        element.style.backgroundImage = `url('${icon}')`;
      };
      
      if(this.options.icons.chat) {
          setIcon(this.chatButton.querySelector('i')!, this.options.icons.chat);
      }
      if(this.options.icons.close) {
          setIcon(this.chatClose.querySelector('i')!, this.options.icons.close);
      }
      if(this.options.icons.send) {
          setIcon(this.sendButton.querySelector('i')!, this.options.icons.send);
      }
    }

    setStyle('primary-color', this.options.colors?.primary);
    setStyle('primary-dark', this.options.colors?.primaryDark);
    setStyle('secondary-color', this.options.colors?.secondary);
    setStyle('text-color', this.options.colors?.text);
    setStyle('light-text', this.options.colors?.lightText);
    setStyle('white', this.options.colors?.white);
    setStyle('background-image', this.options.backgroundImage);
    setStyle('background-pattern', this.options.backgroundPattern);
    setStyle('width', this.options.dimensions?.width);
    setStyle('height', this.options.dimensions?.height);
    setStyle('avatar-size', this.options.dimensions?.avatarSize);
    setStyle('message-max-width', this.options.dimensions?.messageMaxWidth);
    setStyle('bot-message-border-radius', this.options.messageBubbleStyle?.bot?.borderRadius);
    setStyle('user-message-border-radius', this.options.messageBubbleStyle?.user?.borderRadius);
    setStyle('bot-message-min-width', this.options.messageBubbleStyle?.bot?.minWidth);
    setStyle('user-message-min-width', this.options.messageBubbleStyle?.user?.minWidth);
    setStyle('bot-message-padding', this.options.messageBubbleStyle?.bot?.padding);
    setStyle('user-message-padding', this.options.messageBubbleStyle?.user?.padding);
    setStyle('position-distance', this.options.positionOffset);
  }

  private setupEventListeners(): void {
    this.chatButton.addEventListener('click', this.boundHandlers.chatButtonClick);
    this.chatClose.addEventListener('click', this.boundHandlers.chatCloseClick);
    this.sendButton.addEventListener('click', this.boundHandlers.sendMessageClick);
    this.chatInput.addEventListener('keypress', this.boundHandlers.inputKeyPress);
    this.chatInput.addEventListener('input', this.boundHandlers.inputChange);
  }

  private handleChatButtonClick(): void {
    this.toggleChat();
    if (this.isOpen && typeof this.options.onWidgetOpen === 'function') {
      this.options.onWidgetOpen();
    }
  }

  private handleChatClose(): void {
    this.closeChat();
    if (typeof this.options.onWidgetClose === 'function') {
      this.options.onWidgetClose();
    }
  }

  private handleSendMessage(): void {
    this.sendMessage();
  }

  private handleInputKeyPress(e: KeyboardEvent): void {
    if (e.key === 'Enter') {
      this.sendMessage();
    }
  }

  private handleInputChange(): void {
    this.updateCharacterCount();
  }

  public toggleChat(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.openChat();
    } else {
      this.closeChat();
    }
  }

  public openChat(): void {
    this.isOpen = true;
    this.chatButton.classList.add('hidden');
    this.chatPopup.classList.add('active');
    this.chatInput.focus();
    this.chatPopup.setAttribute('aria-hidden', 'false');
    
    if (typeof this.options.onWidgetOpen === 'function') {
      this.options.onWidgetOpen();
    }
  }

  public closeChat(): void {
    this.isOpen = false;
    this.chatPopup.classList.remove('active');
    this.chatPopup.setAttribute('aria-hidden', 'true');
    
    setTimeout(() => {
      if (this.chatButton) {
        this.chatButton.classList.remove('hidden');
        this.chatButton.focus();
      }
    }, 300);
    
    if (typeof this.options.onWidgetClose === 'function') {
      this.options.onWidgetClose();
    }
  }

  public sendMessage(): void {
    const messageText = this.chatInput.value.trim();
    if (messageText === '' || this.isWaitingForResponse) return;
  
    this.addMessage(messageText, 'user');
    this.chatInput.value = '';
    this.updateCharacterCount();
  
    this.showTypingIndicator();
    this.disableInput();
    
    if (typeof this.options.onMessageSend === 'function') {
      try {
        this.options.onMessageSend(messageText, (response) => {
          this.removeTypingIndicator();
          this.enableInput();
          this.addMessage(response, 'bot');
        });
      } catch (error) {
        this.handleSendError();
      }
    } else if (this.options.apiUrl) {
      this.sendToBackend(messageText);
    } else {
      this.handleDefaultResponse();
    }
  }

  public getIsOpen(): boolean {
    return this.chatPopup?.classList.contains('active') ?? this.isOpen;
  }

  private handleDefaultResponse(): void {
    setTimeout(() => {
      this.removeTypingIndicator();
      this.enableInput();
      const botResponses = [
        "I understand your question. Let me check that for you.",
        "Thanks for reaching out! How can I assist you further?",
        "That's a great question. Here's what I can tell you...",
        "I'm here to help! Could you provide more details?"
      ];
      const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
      this.addMessage(randomResponse, 'bot');
    }, 1500);
  }

  private handleSendError(): void {
    this.removeTypingIndicator();
    this.enableInput();
    this.addMessage("Sorry, I'm having trouble connecting. Please try again later.", 'bot');
  }

  private async sendToBackend(message: string): Promise<void> {
    if (this.isDestroyed) return;
    try {
      const response = await fetch(this.options.apiUrl as string, {
        method: this.options.webhookConfig?.method || 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.options.webhookConfig?.headers || {})
        },
        body: JSON.stringify({
          message,
          sessionId: this.sessionId,
          timestamp: new Date().toISOString()
        })
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      this.removeTypingIndicator();
      this.enableInput();
      
      const reply = data.response || data.message || data.reply || 
        "Thanks for your message! We'll get back to you soon.";
      const formattedReply = data.formattedResponse ? 
        data.formattedResponse : 
        this.formatMessage(reply);
      
      this.addMessage(formattedReply, 'bot');
    } catch (error) {
      console.error('Error sending message:', error);
      if (!this.isDestroyed) {
        this.handleSendError();
      }
    }
  }

  public addMessage(text: string, sender: 'user' | 'bot'): void {
    if (this.isDestroyed || !this.chatMessages) return;

    try {
      const messageElement = document.createElement('div');
      messageElement.classList.add('message', `${sender}-message`);
      messageElement.setAttribute('aria-label', `${sender} message`);
      
      const messageContent = document.createElement('div');
      messageContent.className = 'message-content';
      
      const formattedText = this.formatMessage(text);
      messageContent.innerHTML = formattedText;
      
      messageElement.appendChild(messageContent);
  
      const timestamp = document.createElement('div');
      timestamp.classList.add('timestamp');
      timestamp.textContent = this.getCurrentTime();
      messageElement.appendChild(timestamp);
      
      this.chatMessages.appendChild(messageElement);
      this.scrollToBottom();
    } catch (error) {
      console.error('Failed to add message:', error);
    }
  }

  private formatMessage(text: string): string {
    if (typeof text !== 'string') return '';
    
    let html = this.markdownToHtml(text);
    html = html.replace(/\n/g, '<br>');
    return this.sanitizeHtml(html);
  }

  private markdownToHtml(text: string): string {
    return text
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>');
  }

  private sanitizeHtml(html: string): string {
    const temp = document.createElement('div');
    temp.textContent = html;
    return temp.innerHTML;
  }

  private showTypingIndicator(): void {
    this.removeTypingIndicator();
    
    const typingElement = document.createElement('div');
    typingElement.classList.add('typing-indicator');
    typingElement.id = 'typingIndicator';
    typingElement.setAttribute('aria-label', 'Bot is typing');
    
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('div');
      dot.classList.add('typing-dot');
      typingElement.appendChild(dot);
    }
    
    this.chatMessages.appendChild(typingElement);
    this.scrollToBottom();
  }

  private removeTypingIndicator(): void {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }

  private disableInput(): void {
    this.isWaitingForResponse = true;
    this.chatInput.disabled = true;
    this.sendButton.disabled = true;
    this.chatInput.setAttribute('aria-busy', 'true');
  }

  private enableInput(): void {
    this.isWaitingForResponse = false;
    this.chatInput.disabled = false;
    this.sendButton.disabled = false;
    this.chatInput.removeAttribute('aria-busy');
    this.chatInput.focus();
  }

  private updateCharacterCount(): void {
    const existingCounter = this.chatInput.parentElement?.querySelector('.character-counter');
    if (existingCounter) existingCounter.remove();

    const currentLength = this.chatInput.value.length;
    if (currentLength > 0 && this.chatInput.parentElement) {
      const counter = document.createElement('div');
      counter.className = 'character-counter';
      counter.textContent = `${currentLength}/${this.options.messageLimit}`;
      this.chatInput.parentElement.appendChild(counter);
    }
  }

  private scrollToBottom(): void {
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }

  private getCurrentTime(): string {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  public destroy(): void {
    this.isDestroyed = true;
    try {
      this.chatButton?.removeEventListener('click', this.boundHandlers.chatButtonClick);
      this.chatClose?.removeEventListener('click', this.boundHandlers.chatCloseClick);
      this.sendButton?.removeEventListener('click', this.boundHandlers.sendMessageClick);
      this.chatInput?.removeEventListener('keypress', this.boundHandlers.inputKeyPress);
      this.chatInput?.removeEventListener('input', this.boundHandlers.inputChange);

      this.boundHandlers = {} as any;

      if (this.container?.parentNode) {
        this.container.parentNode.removeChild(this.container);
      }

      this.container = null as unknown as HTMLElement;
      this.chatButton = null!;
      this.chatPopup = null!;
      this.chatMessages = null!;
      this.chatInput = null!;
      this.sendButton = null!;
      this.chatClose = null!;
    } catch (error) {
      console.error('Failed to destroy MatChat:', error);
    }
  }
}