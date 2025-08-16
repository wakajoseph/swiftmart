class AnyChatClass {
  constructor() {
    // Initialize elements first
    this.elements = {
      sendButton: document.querySelector('.send-button'),
      messageInput: document.querySelector('.message-input')
    };
    
   
    this.boundHandleSend = this.handleSendMessage.bind(this);
    this.boundHandleKeyPress = this.handleKeyPress.bind(this);
    
   
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Remove existing listeners first to avoid duplicates
    this.removeEventListeners();
    
    // Add fresh listeners
    this.elements.sendButton.addEventListener('click', this.boundHandleSend);
    this.elements.messageInput.addEventListener('keypress', this.boundHandleKeyPress);
  }

  removeEventListeners() {
    // Safely remove listeners if elements exist
    if (this.elements.sendButton) {
      this.elements.sendButton.removeEventListener('click', this.boundHandleSend);
    }
    if (this.elements.messageInput) {
      this.elements.messageInput.removeEventListener('keypress', this.boundHandleKeyPress);
    }
  }

  handleKeyPress(e) {
    if (e.key === 'Enter') {
      this.handleSendMessage();
    }
  }

  handleSendMessage() {
    // Your send message implementation
    console.log('Message sent!');
  }

  // When destroying/removing the chat
  destroy() {
    this.removeEventListeners();
    // Clean up other resources...
  }
}

// Usage example:
const chat = new AnyChatClass();

// When you need to refresh listeners (like after DOM changes):
chat.setupEventListeners();

// When completely done with the chat:
chat.destroy();


