let socket;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

async function connectWebSocket() {
  return new Promise((resolve, reject) => {
    const handleReconnect = () => {
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;        
        setTimeout(() => connectWebSocket(), 1000 * reconnectAttempts);
      } else {
        reject(new Error("Max reconnection attempts reached"));
      }
    };

    socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      reconnectAttempts = 0;             
      resolve(socket);
    };

    socket.onclose = (event) => {
      if (!event.wasClean) handleReconnect();
      
    };

    socket.onerror = (error) => {
      handleReconnect();
    };
    
    socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log("📩 WebSocket message:", data);

      switch (data.event) {
        case "welcome":
          alert(`${data.message}`);
          break;

        case "product_added":
          console.log("🆕 New product received:", data.product);
          addProductToUI(data.product);
          break;

        case "order_confirmed":
          alert(`🎉 Order #${data.order_id} confirmed!`);
          break;

        default:
          console.log("Unhandled event:", data.event);
      }
     } catch (error) {
      console.error("Failed to parse WebSocket message", error);
     }
   };
  });
}