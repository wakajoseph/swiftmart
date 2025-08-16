let chatMode = null;
let pressTimer;
let deleteMode = false;
let deleteMessages = [];
let selectAllMode = false;
let convId = null;
let client = "customer";
let activeUser = 1;

function startChat() {
    try {
        // Reset chat state
        chatMode = null;
        cpg = "open";
        
        // Validate required parameters
        if (!activeStoreId || !activeStoreName) {
            throw new Error("No active store selected");
        }
        
        // Initialize new chat
        chatMode = new StartRandomChat(activeUser, activeStoreId, activeStoreName, "customer");
        chatMode.showUI();
        
    } catch (error) {
        console.error("Failed to start chat:", error);
        showErrorToast("Could not start chat. Please try again.");
    }
}

/**
 * Resumes existing conversations for the user
 */
function resumeChat() {
    try {
        // Reset chat state
        chatMode = null;
        cpg = "open";
        
        // Navigate to chat interface
        renderToRoot(".subMain", ".chatContainer");
        
        // Initialize chat manager
        chatMode = new ChatManager(activeUser, "customer");
        chatMode.loadConversations();
        
    } catch (error) {
        console.error("Failed to resume chat:", error);
        showErrorToast("Could not load conversations. Please try again.");
    }
}


function showErrorToast(message) {
    const toast = document.createElement('div');
    toast.className = 'error-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}




class ChatBase {
  constructor(userId, recipientId, role) {
    this.userId = userId;
    this.recipientId = recipientId;
    this.role = role;
    this.boundSendHandler = this.handleSendMessage.bind(this);
    this.initializeElements();
    this.setupEventListeners();
  }

  initializeElements() {
    this.elements = {
      messageList: document.querySelector(".message-list"),
      chatContainer: document.querySelector("#chatContainer"),
      conversationHead: document.querySelector(".conversation-head"),
      senderName: document.querySelector(".sender-name"),
      messageInput: document.querySelector(".message-input"),
      sendButton: document.querySelector(".send-button"),
      sendButtonAlt: document.querySelector(".send-button-alt")
    };
  }

  setupEventListeners() {
    // Clean up existing listeners
    this.elements.sendButton?.replaceWith(this.elements.sendButton.cloneNode(true));
    this.elements.sendButtonAlt?.replaceWith(this.elements.sendButtonAlt.cloneNode(true));
    this.elements.messageInput?.replaceWith(this.elements.messageInput.cloneNode(true));
    
    // Reinitialize elements reference
    this.initializeElements();
    
    // Add new listeners
    this.elements.sendButton?.addEventListener('click', this.boundSendHandler);
    this.elements.sendButtonAlt?.addEventListener('click', this.boundSendHandler);
    this.elements.messageInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleSendMessage();
    });
  }

  formatTime(dateString) {
    const date = new Date(dateString.includes('T') ? dateString : dateString.replace(' ', 'T') + 'Z');
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: now.getFullYear() !== date.getFullYear() ? 'numeric' : undefined,
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).replace(',', '');
  }

 addMessageToUI(message) {
   

    const messageDiv =  document.createElement('div');
    messageDiv.className = "messageDiv";
     const marker = document.createElement('div');
    marker.className = `marker mark${message.message_id}`;
    marker.addEventListener('click', () => this.controlDelete(message));
    
    marker.addEventListener('touchstart', (event) => {
    event.stopPropagation();
  pressTimer = setTimeout(() => {
    console.log('Long press triggered');
    
    if (deleteMode) return;
    deleteMode = true;
    document.querySelector(`.mark${message.message_id}`).click();
    document.querySelector('.header-actions').style.display = 'flex'; 
  }, 800); 
});

marker.addEventListener('touchend', () => {
  clearTimeout(pressTimer);
});

marker.addEventListener('touchcancel', () => {
  clearTimeout(pressTimer);
});    
       status = message.status;
       
       const messageElement = document.createElement('div');                                    
       messageElement.className =  `message ${message.sender_type === "customer" ? "sent" : "received"}`;
      messageElement.innerHTML = `
      <div>${message.content}</div>
      <div class="message-time">
        ${this.formatTime(message.sent_at || new Date().toISOString())}
        ${message.sender_type === "customer" ? 
          `<i class="bi bi-check2-all message-status ${status}"></i>` : ''}
      </div>  
    `;

messageDiv.appendChild(marker);        
messageDiv.appendChild(messageElement);    this.elements.conversationHead.appendChild(messageDiv);
    this.elements.conversationHead.scrollTop = this.elements.conversationHead.scrollHeight;
  }
  
  controlDelete(message) {
      
      if (!deleteMode) return;
      let id = message.message_id;
      let selector = `.mark${id}`;
      let index;
      if(deleteMessages.indexOf(id) !== -1) {
         index = deleteMessages.indexOf(id);          
         deleteMessages.splice(index, 1);
  document.querySelector(selector).classList.remove('active');
  document.querySelector('.selectedMsg').textContent = deleteMessages.length;
  
         if (deleteMessages.length === 0) {
              deleteMode = false;
              document.querySelector('.header-actions').style.display = 'none'; 
          }
      } else {
          deleteMessages.push(id);
           document.querySelector(selector).classList.add('active');
       document.querySelector('.selectedMsg').textContent = deleteMessages.length; 
      }
  }

  showUI() {
    displayPage("#chatContainer");
    this.elements.senderName.textContent = this.storeName || 'New Chat';
    this.elements.messageInput.value = "";
    this.elements.conversationHead.innerHTML = "";
  }

  validateMessage(content) {
    if (!content.trim()) return "Message cannot be empty";
    if (content.length > 1000) return "Message is too long (max 1000 characters)";
    return null;
  }

  async handleSendMessage() {
    const content = this.elements.messageInput.value;
    const validationError = this.validateMessage(content);
    if (validationError) {
      return this.showToast(validationError);
    }

    const message = {
      user_id: this.userId,
      store_id: this.recipientId,
      sender_type: this.role,
      content: content
    };

    try {
      // Optimistic UI update
      this.addMessageToUI({
        ...message,
        sent_at: new Date().toISOString()
      });
      this.elements.messageInput.value = "";

      const response = await fetch("http://localhost:8000/messages/send", {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(message)
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const sentMessage = await response.json();
      this.updateMessageStatus(sentMessage.message_id, sentMessage.status);
    } catch (error) {
      console.error("Message send failed:", error);
      this.showToast("Failed to send message. Please try again.");
    }
  }

  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  updateMessageStatus(messageId, status) {
    const statusIcons = document.querySelectorAll('.message-status');
    statusIcons.forEach(icon => {
      if (icon.closest('.message').dataset.messageId === messageId) {
        icon.className = `bi bi-check2-all message-status ${status}`;
      }
    });
  }
}

class ChatManager extends ChatBase {
  constructor(userId, role) {
    super(userId, null, role);
    this.conversations = [];
    this.currentConversation = null;
    this.storeId = null;
    this.loadConversations();
  }

  async loadConversations() {
    try {
      if (!this.userId) return;
      
      const response = await fetch(`http://localhost:8000/user/messages`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ 
            user_id: this.userId,
            client: this.role
            })
      });

      if (!response.ok) {
        throw new Error(`Server Error: ${response.status}`);
      }

      this.conversations = await response.json();
      this.renderConversationList();
      
    } catch (error) {
     
      await feed("Failed to load conversations", 2000);
    }
  }

  renderConversationList() {
    if (this.conversations.length === 0) {
      this.elements.messageList.innerHTML = "<div class='no-conversations'>No conversations yet</div>";
      return;
    }

    this.elements.messageList.innerHTML = "";
    this.conversations.forEach(conversation => {
      const lastMessage = conversation.messages[conversation.messages.length - 1];
      const unreadCount = conversation.messages.filter(m => 
        m.sender_type !== "customer" && m.status !== "read"
      ).length;

      const conversationElement = document.createElement('div');
      conversationElement.className = 'message-item';
      conversationElement.innerHTML = `
        <div class="store-pic">
          <i class="fas fa-store"></i>
        </div>
        <div class="message-content">
          <div class="message-header">
            <span class="seller-name">${conversation.store_name}</span>
            <span class="message-date">${this.formatTime(lastMessage.sent_at)}</span>
          </div>
          <div class="message-preview">
            <span class="message-text">${lastMessage.content}</span>
            ${unreadCount > 0 ? 
              `<span class="message-counter">${unreadCount}</span>` : 
              `<span class="message-status">${lastMessage.status}</span>`}
          </div>
        </div>
      `;

      conversationElement.addEventListener('click', () => 
        this.openConversation(conversation)
      );
      this.elements.messageList.appendChild(conversationElement);
    });
    loaded();
  }

  async openConversation(conversation) {
    this.currentConversation = conversation;
    convId = conversation.conversation_id;
    this.storeId = conversation.store_id;
    this.storeName = conversation.store_name;
    this.recipientId = conversation.store_id;            
    this.showUI();
    this.elements.sendButton.style.display = "block";
    this.elements.sendButtonAlt.style.display = "none";
    this.renderMessages(conversation.messages);
    
    let messages = {
      "conversationId": conversation.conversation_id,
      "ids": conversation.messages.map(message => message.message_id),
      "client": client
    }
    
    console.log(JSON.stringify(messages))
    
    await this.markMessagesAsRead(messages);
  }

  renderMessages(messages) {
    this.elements.conversationHead.innerHTML = "";
    messages.forEach(message => {
      this.addMessageToUI(message);
    });
  }

  async markMessagesAsRead(messages) {
    try {
      await fetch("http://localhost:8000/messages/read", {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(messages)
      });
      console.log("marked as read");
    } catch (error) {
      console.error("Failed to mark messages as read:", error);
    }
  }
}

class StartRandomChat extends ChatBase {
  constructor(userId, storeId, storeName, role) {
    super(userId, storeId, role);
    this.storeName = storeName;
    this.showUI();
    this.elements.sendButton.style.display = "none";
    this.elements.sendButtonAlt.style.display = "block";
  }
}

// Global chat management
const ChatApp = {
  currentChat: null,
  
  startNewChat(userId, storeId, storeName, role = "customer") {
    this.cleanupCurrentChat();
    this.currentChat = new StartRandomChat(userId, storeId, storeName, role);
    return this.currentChat;
  },
  
  resumeChat(userId, role = "customer") {
    this.cleanupCurrentChat();
    this.currentChat = new ChatManager(userId, role);
    return this.currentChat;
  },
  
  cleanupCurrentChat() {
    if (this.currentChat) {
      // Cleanup any resources if needed
    }
  }
};

function checkAll() {
    if(!deleteMode) return 
    
    let selectors = document.querySelectorAll('.marker');
    if (selectors) {
        
        if (!selectAllMode) {
            deleteMessages = [];        
        }
        
        selectors.forEach((selector) => {
            selector.click();
            
        });
        
        selectAllMode = !selectAllMode;
        
        if (deleteMessages.length < 1) {
          deleteMode = false;
          document.querySelector('.header-actions').style.display = 'none';  
        }
    } 
}

function toast2() {
    
}

async function deleteMessage() {
    console.log(convId, client);

    if (!deleteMessages || deleteMessages.length < 1) return;
    if (!convId || !client) return;

    let msgs = {
        'client': client,
        'conversationId': convId,
        'deleteMessages': deleteMessages
    };

    try {
        let response = await fetch("http://localhost:8000/messages/message/delete", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(msgs)
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        let data = await response.json();
        alert(data.message);

    } catch (error) {
        console.log("Fetch error:", error.message);
    }
}
