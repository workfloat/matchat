/**
 * @jest-environment jsdom
 */

import MatChat from './matchat';
import { waitFor } from '@testing-library/dom';

describe('MatChat', () => {
  let chatWidget: MatChat;
  let container: HTMLDivElement;

  beforeAll(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  beforeEach(() => {
    chatWidget = new MatChat({
      container,
      apiUrl: undefined
    });
  });

  afterEach(() => {
    chatWidget.destroy();
  });

  afterAll(() => {
    document.body.removeChild(container);
  });

  describe('Initialization', () => {
    it('should initialize with default options', () => {
      expect(chatWidget).toBeDefined();
      expect(chatWidget.options.title).toBe('Matcha');
      expect(chatWidget.options.messageLimit).toBe(500);
    });

    it('should merge provided options with defaults', () => {
      const customWidget = new MatChat({
        container,
        title: 'Custom Title'
      });
      expect(customWidget.options.title).toBe('Custom Title');
      expect(customWidget.options.messageLimit).toBe(500);
      customWidget.destroy();
    });

    it('should validate position options', () => {
      const invalidWidget = new MatChat({
        container,
        position: 'invalid-position'
      });
      expect(invalidWidget.options.position).toBe('bottom-right');
      invalidWidget.destroy();
    });

    it('should generate a session ID', () => {
      expect(chatWidget.sessionId).toBeDefined();
      expect(chatWidget.sessionId).toMatch(/^session_/);
    });
  });

  describe('DOM Interaction', () => {
    it('should create widget elements', () => {
      expect(container.querySelector('.matchat-container')).not.toBeNull();
      expect(container.querySelector('.chat-button')).not.toBeNull();
      expect(container.querySelector('.chat-popup')).not.toBeNull();
    });

    it('should toggle chat visibility', () => {
      expect(chatWidget.getIsOpen()).toBe(false);
      chatWidget.toggleChat();
      expect(chatWidget.getIsOpen()).toBe(true);
      chatWidget.toggleChat();
      expect(chatWidget.getIsOpen()).toBe(false);
    });

    it('should open and close chat', () => {
      expect(chatWidget.getIsOpen()).toBe(false);
      expect(container.querySelector('.chat-popup')?.classList.contains('active')).toBe(false);
      
      chatWidget.openChat();
      expect(chatWidget.getIsOpen()).toBe(true);
      expect(container.querySelector('.chat-popup')?.classList.contains('active')).toBe(true);
      
      chatWidget.closeChat();
      expect(chatWidget.getIsOpen()).toBe(false);
      expect(container.querySelector('.chat-popup')?.classList.contains('active')).toBe(false);
    });
  });

  describe('Message Handling', () => {
    it('should add messages to the chat', () => {
      const initialMessageCount = container.querySelectorAll('.message').length;
      chatWidget.addMessage('Test message', 'user');
      const messages = container.querySelectorAll('.message');
      expect(messages.length).toBe(initialMessageCount + 1);
      expect(messages[messages.length - 1].classList.contains('user-message')).toBe(true);
    });

    it('should format markdown in messages', () => {
      const formatted = (chatWidget as any).formatMessage('**bold** and *italic*');
      expect(formatted).toContain('&lt;strong&gt;bold&lt;/strong&gt;');
      expect(formatted).toContain('&lt;em&gt;italic&lt;/em&gt;');
    });

    it('should sanitize HTML in messages', () => {
      const sanitized = (chatWidget as any).sanitizeHtml('<script>alert("xss")</script>');
      expect(sanitized).not.toContain('<script>');
    });

    it('should show typing indicator', () => {
      (chatWidget as any).showTypingIndicator();
      expect(container.querySelector('#typingIndicator')).not.toBeNull();
      (chatWidget as any).removeTypingIndicator();
      expect(container.querySelector('#typingIndicator')).toBeNull();
    });
  });

  describe('Input Handling', () => {
    it('should disable input during processing', () => {
      const input = container.querySelector('.chat-input') as HTMLInputElement;
      const button = container.querySelector('.send-button') as HTMLButtonElement;
      
      (chatWidget as any).disableInput();
      expect((chatWidget as any).isWaitingForResponse).toBe(true);
      expect(input.disabled).toBe(true);
      expect(button.disabled).toBe(true);
      
      (chatWidget as any).enableInput();
      expect((chatWidget as any).isWaitingForResponse).toBe(false);
      expect(input.disabled).toBe(false);
      expect(button.disabled).toBe(false);
    });

    it('should update character count', () => {
      const input = container.querySelector('.chat-input') as HTMLInputElement;
      input.value = 'test';
      (chatWidget as any).updateCharacterCount();
      
      const counter = container.querySelector('.character-counter');
      expect(counter).not.toBeNull();
      expect(counter?.textContent).toBe('4/500');
    });
  });

  describe('API Interaction', () => {
    it('should handle custom onMessageSend callback', async () => {
      let callbackTriggered = false;
      
      const customWidget = new MatChat({
        container,
        apiUrl: undefined,
        onMessageSend: (message, callback) => {
          callbackTriggered = true;
          callback('Custom response');
        }
      });
  
      (customWidget as any).chatInput.value = 'Test';
      (customWidget as any).sendMessage();
      
      expect(callbackTriggered).toBe(true);
      
      await new Promise(resolve => setTimeout(resolve, 0));
      
      const messages = container.querySelectorAll('.message');
      expect(messages[messages.length - 1].textContent).toContain('Custom response');
      
      customWidget.destroy();
    });
  });
  
  describe('Cleanup', () => {
    it('should destroy widget and clean up DOM', () => {
      const testContainer = document.createElement('div');
      document.body.appendChild(testContainer);
      
      const testWidget = new MatChat({
        container: testContainer
      });
      
      const widgetContainer = testContainer.querySelector('.matchat-container');
      expect(widgetContainer).not.toBeNull();
      
      testWidget.destroy();
      
      expect(testContainer.querySelector('.matchat-container')).toBeNull();
      expect(testContainer.innerHTML).toBe('');
      
      document.body.removeChild(testContainer);
    });
  });
});