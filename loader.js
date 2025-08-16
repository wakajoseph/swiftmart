let loadingQueue = 0;
let currentMessage = '';
let messageTimeout;




function load() {
  const loader = document.querySelector(".loading");
  loadingQueue++;

  if (loadingQueue === 1) {
    loader.style.display = 'flex';
    loader.style.opacity = '1';
    loader.style.transition = 'none';
    
    const spinner = document.querySelector("#rotatingCircle");
    spinner.style.animation = 'spin 0.8s cubic-bezier(0.5, 0.1, 0.5, 0.9) infinite';
 
    setTimeout(() => {
      loader.style.transition = 'opacity 300ms ease-out';
    }, 10);
  }
}



function loaded(time = 1000) {
  if (loadingQueue > 0) loadingQueue--;
  
  if (loadingQueue === 0) {
    clearTimeout(messageTimeout);   
    const loader = document.querySelector(".loading");
    loader.style.transition = 'opacity 400ms ease-in';
    loader.style.opacity = '0';
    
    setTimeout(() => {
      if (loadingQueue === 0) {
        loader.style.display = 'none';
        document.querySelector("#loadFeedback").textContent = "loading...";
      }
    }, time);
  }
}

function feed(message, duration = 2000) {
  return new Promise(resolve => {
    const feedback = document.querySelector("#loadFeedback");
    
    // Immediate display without fade-in for first message
    if (currentMessage === '') {
      feedback.style.transition = 'none';
      feedback.textContent = message;
      feedback.style.opacity = '1';
      
      // Force reflow and enable transitions
      setTimeout(() => {
        feedback.style.transition = 'opacity 200ms ease';
      }, 10);
    } 
    // Standard fade transition for subsequent messages
    else {
      feedback.style.opacity = '0';
      
      setTimeout(() => {
        feedback.textContent = message;
        feedback.style.opacity = '1';
      }, 200); // Wait for fade out
    }
    
    currentMessage = message;
    clearTimeout(messageTimeout);
    
    if (duration > 0) {
      messageTimeout = setTimeout(() => {
        feedback.style.opacity = '0';
        resolve();
      }, duration);
    } else {
      resolve();
    }
  });
}


