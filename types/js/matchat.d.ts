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
    private defaultOptions;
    private options;
    private isOpen;
    private isWaitingForResponse;
    private sessionId;
    private container;
    private chatButton;
    private chatPopup;
    private chatMessages;
    private chatInput;
    private sendButton;
    private chatClose;
    private isDestroyed;
    private boundHandlers;
    constructor(options?: MatChatOptions);
    private validateOptions;
    private generateSessionId;
    private init;
    private createWidget;
    private createChatButton;
    private createChatPopup;
    private applyCustomStyles;
    private setupEventListeners;
    private handleChatButtonClick;
    private handleChatClose;
    private handleSendMessage;
    private handleInputKeyPress;
    private handleInputChange;
    toggleChat(): void;
    openChat(): void;
    closeChat(): void;
    sendMessage(): void;
    getIsOpen(): boolean;
    private handleDefaultResponse;
    private handleSendError;
    private sendToBackend;
    addMessage(text: string, sender: 'user' | 'bot'): void;
    private formatMessage;
    private escapeHtml;
    private markdownToHtml;
    private sanitizeHtml;
    private showTypingIndicator;
    private removeTypingIndicator;
    private disableInput;
    private enableInput;
    private updateCharacterCount;
    private scrollToBottom;
    private getCurrentTime;
    destroy(): void;
}
export {};
