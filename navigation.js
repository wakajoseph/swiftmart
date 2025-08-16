let isLoaded = false;
const navElements = {
  home: document.querySelector("#navHome"),
  category: document.querySelector("#navCategory"),
  cart: document.querySelector("#navCart"),
  me: document.querySelector("#navMe"),
  chat: document.querySelector("#navChat"),
  
};

let viewHistory = [];


Object.keys(navElements).forEach(key => {
  let element = navElements[key];
  let target = element.dataset.targeting;
  
  
  //Toggle selected tab///////////////
  let nv = document.querySelectorAll(".nv");
 
  const toggleNavigator = (e) => {
     nv.forEach(n => n.classList.remove('active'));
     e.classList.add('active');
  }
  // done ↑↑↑↑{{{{{}}}}}\\\\\\\\
  
  element.addEventListener('click', () => {
    navigateTo(target);
    toggleNavigator(element);
  });
});


const router = new Navigo("/", { hash: true });



function showView(id, isMain = null) {
  const views = document.querySelectorAll(".view");
  const target = document.getElementById(id);
  let footerBar = document.querySelector(".Mainfooter");
  
  if(!target) {
     console.warn("container Id not found");
     return; 
  }
    
  views.forEach(view => view.classList.remove("active"));
  if (!isMain) footerBar.classList.remove("active");
  
  if (isLoaded) {
    if (id === "home") {
      swift.setThemeColor(currentTheme);
    } else {
      swift.setThemeColor("#ffffff");  
    }  
  } 
  
  isLoaded = true;
  
  setTimeout(() => {
      target.classList.add("active");
      if (isMain) footerBar.classList.add("active");
  },50);
  

}

function navigateTo(route) {
  const currentHash = window.location.hash.replace("#", "");
  if (viewHistory.length === 0 || viewHistory[viewHistory.length - 1] !== currentHash) {
    viewHistory.push(currentHash);
  }
  
  router.navigate(route);
}

router
  .on({
    "index.html": () => showView("home", true),
    home: () => showView("home", true),
    cart: () => showView("cart", true),
    category: () => showView("category", true),
    user: () => showView("user", true),
    messages: () => showView("messages", true),
    order: () => showView("order"),
    products: () => showView("products"),
    store: () => showView("storeContainer"),
    search: () => showView("search"),
    auth: () => showView("authForms"),
    addresses: () => showView("addresses"),
    settings: () => showView("settings"),
  })
  .resolve();


//"""BACK"""
function navigateBackword() {
  let backBtns = document.querySelectorAll(".navigate-back");
  if(backBtns.length > 0) {
    backBtns.forEach(btn => {
       btn.addEventListener("click", () => {
       window.history.back();
       });
    })
  }
}

function navigateSearch() {
    navigateTo("search");    
}

function navigateStoreContainer() {
    navigateTo("store");    
}



//"""START"""
function startNavigator() {
  router.resolve();
  navigateBackword();
}




