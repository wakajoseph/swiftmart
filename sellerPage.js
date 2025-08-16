let storeData = null;


// Initial history state
window.addEventListener("DOMContentLoaded", () => {
    history.replaceState({ index: 0 }, '', location.href);
});


function navigateOvl(event) {
    event.stopPropagation();
    navigate(".overlay", "flex", event);
    loadStoreMessages();
} 

let storeDataTemplate = {
  "store": {
    "id": 1,
    "name": "PochiAfrica",
    "email": "wakajoseph2@gmail.com",
    "contact": "254114771230",
    "location": "Nairobi Kenya"
  },
  "conversations": [
    {
      "conversation_id": 1,
      "customer_name": "Joseph Waka",
      "messages": [
        {
          "message_id": 1,
          "sender_type": "customer",
          "sender_id": 1,
          "content": "hello",
          "status": "sent",
          "sent_at": "2025-05-01 09:19:13",
          "delivered_at": null,
          "read_at": null
        },
        {
          "message_id": 2,
          "sender_type": "customer",
          "sender_id": 1,
          "content": "whats the update on my order",
          "status": "sent",
          "sent_at": "2025-05-01 09:29:14",
          "delivered_at": null,
          "read_at": null
        }
      ]
    }
  ]
}


function getSeller() {
    let data = JSON.parse(localStorage.getItem('sellerLogin'));
    
    if (data) {
        storeData = {...data}
        conversations = [...data.conversations];
        console.log(JSON.stringify(storeData));
        feedStoreName();
        organizeChats();
    } else {
        window.location.href="/credentialsLogin.html?destination=storeLogin";
    }
} 




function selector(sel) {
    response = document.querySelector(sel);
    if (response) {        
        return response;
    } else {
        console.log(sel + ": not found");
        return;
    }
}

function feedStoreName() {
    selector('.storeName').textContent = storeData.store.name;
} 



function navigateAddProduct() {
   window.location.href="/addProduct.html";
}


    const [hamburger,
    notification,
    shopLogo,    
    dashboard,
    products,
    orders,
    shipping,
    analytics,
    payments,
    customers,
    discounts,
    settingss] = [
      ".navbar-toggler",
       ".user-menu", 
       ".user-avatar",
       ".fa-tachometer-alt",
       ".fa-box-open", 
       ".fa-shopping-bag", 
       ".fa-truck", 
       ".fa-chart-line", 
       ".fa-comment-dollar", 
       ".fa-users", 
       ".fa-tag", 
       ".fa-cog"  
    ].map(sl => selector(sl));

function addClick(selector,func) {
    return selector.addEventListener('click', func);
}

addClick(hamburger, () => {
    console.log('hi');
});




function loadStoreMessages() {
   try {
        // Reset chat state
        chatMode = null;
        cpg = "open";
      
        
       
        chatMode = new ChatManager(1, "store");
        chatMode.loadConversations();
        
    } catch (error) {
        console.error("Failed to resume chat:", error);
        showErrorToast("Could not load conversations. Please try again.");
    } 
}


