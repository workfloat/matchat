# MatChat - Simple Web Chat Widget

MatChat is a lightweight and customizable chat widget designed for seamless integration into any website. It supports custom themes, real-time messaging, and integration with external APIs or webhook endpoints like nodemation (n8n). Perfect for customer support, user engagement, or AI chatbot implementations.

## Demo

https://workfloat.github.io/matchat/

# Installation

## via cdn
```
<!-- Latest Version -->
<script src="https://cdn.jsdelivr.net/npm/@workfloat/matchat@latest/dist/matchat.umd.min.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@workfloat/matchat@latest/dist/matchat.min.css">

<!-- Specific Version (0.1.3) -->
<script src="https://cdn.jsdelivr.net/npm/@workfloat/matchat@0.1.3/dist/matchat.umd.min.js"></script>
```

### via npm

```
npm install @workfloat/matchat
```


## Quick Start

### 1. Include CSS/JS
Add these to your HTML's `<head>`:
```html
<link rel="stylesheet" href="https://cdn.yourdomain.com/matchat.css">
<script src="https://cdn.yourdomain.com/matchat.umd.js"></script>

<div id="chat-container"></div>

<script>
  const chat = new MatChat({
    container: document.getElementById('chat-container'),
    apiUrl: 'YOUR_WEBHOOK_ENDPOINT',
    position: 'bottom-right',
    title: 'Support Chat',
    welcomeMessage: 'Hello! How can we help you today?'
  });
</script>

```

## Advanced Configuration
### Webhook Setup Example
```js
const chat = new MatChat({
  apiUrl: 'https://your-n8n-webhook.com/webhook',
  webhookConfig: {
    method: 'POST',
    headers: {
      'X-Custom-Header': 'Chat-Session'
    }
  },
});
```


## 2. Vue.js Integration
```
npm install @workfloat/matchat
```

```js
// import
import MatChat from 'matchat'

// your other code
  data() {
    return {
      chat: null as MatChat | null,
    }
  },
  mounted() {
    this.chat = new MatChat({
      positionOffset: '20px',
      colors: {
        primary: '#3B82F6',
        text: '#1F2937'
      },
      dimensions: {
        width: '400px',
        messageMaxWidth: '280px'
      }
    });
  },
  beforeUnmount() {
    this.chat.destroy();
  }

```


## Customization Options
| Option               | Description                                      | Type    | Default                      |
|----------------------|--------------------------------------------------|---------|------------------------------|
| `position`           | Widget position (`bottom-right`, `top-left`, etc.) | string  | `bottom-right`               |
| `apiUrl`             | Your webhook endpoint URL                        | string  | -                            |
| `webhookConfig`      | Custom headers/method for webhook                | object  | `{method: 'POST'}`           |
| `theme`              | Color theme (`default`, `modern`, `serene`, etc.) | string  | `serene`                     |
| `colors`             | Custom color palette                             | object  | (See default color settings) |
| `messageLimit`       | Character limit per message                      | number  | 500                          |
| `avatarUrl`          | Chat bot avatar image URL                        | string  | Default avatar               |
| `welcomeMessage`     | Initial greeting message                         | string  | -                            |
| `title`              | Chat header title text                           | string  | `Matcha`                     |
| `backgroundImage`    | Background image URL for chat                    | string  | -                            |
| `messageBubbleStyle` | Custom styling for message bubbles               | object  | (See default styles)         |
| `dimensions`         | Custom width/height/sizing                       | object  | (See default sizes)          |
| `onWidgetOpen`       | Callback when chat opens                         | function| -                            |
| `onWidgetClose`      | Callback when chat closes                        | function| -                            |
| `onMessageSend`      | Custom message handler                           | function| -                            |


## Methods
```js
// Open chat programmatically
chat.openChat();

// Close chat
chat.closeChat();

// Add dynamic message
chat.addMessage('System update: 2pm maintenance', 'bot');

// Destroy instance
chat.destroy();
```


## Event Handlers
```js
new MatChat({
  onWidgetOpen: () => {
    console.log('Chat opened!');
  },
  onWidgetClose: () => {
    console.log('Chat closed!');
  },
  onMessageSend: (userMessage, callback) => {
    // Process message and send response
    callback('Thanks for your message!');
  }
});
```


## Styling & Theming
```css

:root {
    --matchat-primary-color: #6366F1;
    --matchat-primary-dark: #4F46E5;
    --matchat-secondary-color: #F9FAFB;
    --matchat-text-color: #1F2937;
    --matchat-light-text: #6B7280;
    --matchat-border-color: #E5E7EB;
    --matchat-bot-message-bg: #FFFFFF;
    --matchat-primary-rgb: 99, 102, 241;
}

```
