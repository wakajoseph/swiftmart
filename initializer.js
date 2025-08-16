class SwiftMart {
  constructor() {
    this.endpoints = [];
    this.mainProducts = [];
    this.limit = 2;
    this.noMoreProducts = false;
    this.skip = 0;
    this.isLogged = false;
    this.productRenderColumns = 2;
    this.maximumWidth = null;
    this.columnCount = null;
    this.fallbackContainer = ".container";
    this.columnGap = 5; //5px
    this.container = null; 
    this.setThemeColor()
    //Item interaction
    this.focusedItem  = null;
    
    
  }
  
  // Central utilities 
  getselector(sel) {
    try {
      if (!sel) {
        throw new Error("Invalid selector request");   
      }
      let s = document.querySelector(sel);
      if (s) return s;
      return null;
    } catch(error) {
      console.error(error);
      return null;
    }
    
    
  }
  
  setThemeColor(color = currentTheme) {
    let themeMeta = document.querySelector('meta[name="theme-color"]');
        
    if (!themeMeta) {
      themeMeta = document.createElement('meta');
      themeMeta.name = 'theme-color';
      document.head.appendChild(themeMeta);
    }
    
    themeMeta.setAttribute('content', color);
    
  }                    
  
  calculateWidth(selector) {
    if (!selector) selector = this.fallbackContainer;
    this.container = this.getselector(selector);
    if (!this.container) return;
    this.maximumWidth = this.container.clientWidth;
  }
  
  calculateColumns(width) {
    if (!width) width = this.maximumWidth;
    if (!width) return 2; 
    
    if (width <= 480) return 2;
    if (width <= 768) return 3;
    if (width <= 1024) return 4;
    if (width <= 1280) return 6;
    if (width <= 1600) return 8;
    if (width <= 1920) return 10;
    // For ultra wide screens
    return 12;
  }  
  
  createColumns(container, isHome = false) {  
  console.log(container); 
    if (!container) container = this.fallbackContainer;
    const cont = this.getselector(container);
    
    if (!cont) {
       console.log("missing container")
       return; 
    } 
    
    // Clear existing columns
    cont.innerHTML = '';
    
    this.columnCount = this.calculateColumns(this.maximumWidth);
    const columnWidth = (this.maximumWidth - (this.columnCount - 1) * this.columnGap) / this.columnCount;
    
    for (let i = 0; i < this.columnCount; i++) {
      const column = document.createElement('div');
      column.className = `col col${i + 1}`;
      column.style.width = `${columnWidth}px`;
      column.style.marginRight = `${this.columnGap}px`;
      column.style.float = 'left'; // Ensure columns align properly
      
      // Remove margin from last column
      if (i === this.columnCount - 1) {
        column.style.marginRight = '0';
      }
              
      if (i === 0 && isHome) {
        column.innerHTML = `
          <div class="main-container">
            <div class="carousel"></div>
            <div class="slideDots"></div>
          </div>
        `;
        console.log(10);
      }
              
      cont.appendChild(column);
    }
  }
  
  renderProductToCols(productsData, host, isHome = false) {
    if (!productsData || productsData.length < 1) return;
    if (!host) host = this.fallbackContainer;
    
    const container = this.getselector(host);
    if (!container) return;
          
    const columns = container.querySelectorAll(".col");
    
    // If no columns exist in host
    if (columns.length < 2) {
      this.calculateWidth(host);
      this.createColumns(host, isHome);
    }
    
    // Initialize columns array
    const totalCols = Array.from({ length: this.columnCount }, () => []);
        
    // Distribute products to columns
    productsData.forEach((item) => {
      let shortestColumn = 0;
      let minLength = totalCols[0].length;
      
      for (let i = 1; i < totalCols.length; i++) {
        if (totalCols[i].length < minLength) {
          minLength = totalCols[i].length;
          shortestColumn = i;
        }
      }
      totalCols[shortestColumn].push(item);
    });
           
    // Render products to columns
    totalCols.forEach((columnItems, index) => {
      const columnElement = container.querySelector(`.col${index + 1}`);
      if (!columnElement) return;
            
      columnItems.forEach((item, index) => {
        const productElement = this.unpackItem(item, index);
        if (productElement) {
          columnElement.appendChild(productElement);
          this.totalProductsRendered++;
        }
      });
    });
  }
    
  unpackItem(item) {
    const productElement = document.createElement('div');
        productElement.classList.add('colItem');

    const imageContainer = document.createElement('img');                
    imageContainer.src = item.profilePicture;
    const productInfo = document.createElement('div');
    productInfo.className = 'productInfo';        
    const name = document.createElement('div');
    name.classList.add('main-product-name');                            
    name.textContent = item.name;
    
    const category = document.createElement('div');
    category.innerContent = item.category;
    
    const priceParts = item.price.toFixed(2).split('.'); 
           
    const priceDiv = document.createElement('div');
    priceDiv.classList.add("pricing");
    priceDiv.innerHTML = `
      <span class="main-product-price">
        <small>KSh</small>${priceParts[0]}.<small class="floatAmount">${priceParts[1]}</small>
      </span>
      <span class="main-add-to-cart">
         <i class="bi bi-cart-plus"></i>
      </span>`;                      
    const addToCartBtn = priceDiv.querySelector('.main-add-to-cart');
addToCartBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const itemIndex = index;
      if (itemIndex || itemIndex === 0) {
        this.addItemToCart(itemIndex);
      } else {
        console.log("not found")     
      }
    });

    const rating = document.createElement('div');
    rating.innerHTML = `
      <div class="item-rating">
        <div class="stars">
          <i class="fas fa-star"></i>
          <i class="fas fa-star-half-alt"></i>      
          <i>rating...</i>                                                     
        </div>
        <div class="productRating">*</div>
      </div>
    `;

     productInfo.appendChild(name);
     productInfo.appendChild(category);
     productInfo.appendChild(rating);
     productInfo.appendChild(priceDiv);
        
        productElement.appendChild(imageContainer);
        productElement.appendChild(productInfo);

        productElement.addEventListener('click', () => {
            this.viewProduct(item);
        });
    
    return productElement;
  }
  
  showProduct(item) {
    console.log(JSON.stringify(item))
    if (!item) return; 
    
    const container = document.querySelector('.images');
                               
    let photoContainer = document.querySelector('.photoContainer');
    photoContainer.innerHTML = "";
    photoContainer.style.width = `${item.imagesUrl.length * 100}%`;
    
    let variantsImages = item.variants.flatMap(v => v.image ? [v.image] : []); 
    
    
    
    let imagesUrl = [
  ...(Array.isArray(item.profilePicture) ? item.profilePicture : [item.profilePicture]),
  ...variantsImages
];
    console.log(imagesUrl);
    
    imagesUrl.forEach((img) => {
      let image = document.createElement('img');
      image.style.width = `${container.clientWidth}px`;
      
      
      image.style.display = 'inline-block';
      image.src = img;
      photoContainer.appendChild(image);
      
      const dotsContainer = document.querySelector('.selectedProduct .dot-indicators');
      
      dotsContainer.innerHTML = "";

      imagesUrl.forEach((_, index) => {
       const dot = document.createElement('span');
       dot.classList.add('dot');
       if (index === 0)         dot.classList.add('active');
       dotsContainer.appendChild(dot);
    });

// Update active dot on scroll
container.addEventListener('scroll', () => {
  const scrollPosition = container.scrollLeft;
  const imageWidth = container.clientWidth;
  const activeIndex = Math.round(scrollPosition / imageWidth);
  
  document.querySelectorAll('.selectedProduct .dot').forEach((dot, index) => {
    dot.classList.toggle('active', index === activeIndex);
      });
    });
    
    document.querySelectorAll('.selectedProduct .dot').forEach((dot, index) => {
  dot.addEventListener('click', () => {
        container.scrollTo({
          left: index * container.clientWidth,
          behavior: 'smooth'
        });
      });
     });
     
   });

            document.querySelector('#new').textContent = `KSh ${item.price.toFixed(2)}`;
            document.querySelector('#old').textContent = `KSh${item.basePrice.toFixed(2)}`;

    let drop = item.basePrice - item.price;
    let dropPercent = (drop * 100) / item.basePrice;
            document.querySelector('#drop').textContent = `(-${Math.round(dropPercent)}%)`;

            document.querySelector('.details').textContent = `[${item.name}] ${item.description}`;
            document.querySelector('#rate').textContent = `${item.reviews.rating ?? 0}`;

    let stars = parseInt(item.reviews.rating);
    let starString = "⭐".repeat(stars);
            document.querySelector('#star').textContent = starString;
            document.querySelector('#review').textContent = `${item.reviews.rating ?? 0}`;

    let specs = document.querySelector(".specification");
     specs.innerHTML = "";

    let heading = document.createElement('div');
            heading.textContent = "specifications ";
    specs.appendChild(heading);

    for (let key in item.attributes) {
      let keys = document.createElement('div');
      keys.textContent = key;
      let value = document.createElement('div');
      value.textContent = item.attributes[key];
      specs.appendChild(keys);
      specs.appendChild(value);
    }                
  }
  
  //utility 
  viewProduct(item) {
     this.focusedItem = item;
     this.showProduct(item);
     setTimeout(()=> {
       navigateTo("products");   
     },0);     
  }
  
  async getProducts(searchId = false) {
    try {
      let url;
      let isQuery = false;
      
      if (searchId) {
        let queryId = Number(searchId);
        isQuery = true;  
        
        url = `${homeUrl}?skip=${this.skip}&limit=${this.limit}&id=${queryId}`;
        
      } else {
        isQuery = false;
        url = `${homeUrl}?skip=${this.skip}&limit=${this.limit}`;         
      }
      
      if(!url) {        
          return { 
            status: false,
            message:  "failed to construct query url"       
          }                              
      }
      
 //Terminate if all products were requested from server. (this.noMoreProducts) will resolve to (false) automatically via websoket if server update new products.
      
      if (!isQuery) {
          if(this.noMoreProducts) {
              return {
                status: true,             
                data: [],
                scope: "normal",                     
              }
          }
      }
      
  //  =====================================
 //   CONTINUE......
//=======================    
      let response = await fetch(url);
      
      if (!response.ok) {
        let err = await response.json().catch(() => ({}));
        throw new Error(err);
       }
       
       let dt = await response.json();
       
       if (!isQuery) {
          this.skip += this.limit;
          this.mainProducts = [...this.mainProducts, ...dt];
          if(dt.length < 1) {
              this.noMoreProducts = true;
          }
       }
     
    let requestScope = isQuery ? "query" : "normal";  
          
          return {
             status: true,             
             data: [...dt],
             scope: requestScope,             
          } 
                               
    } catch (error) {
       
      return { 
        status: false,
        message: "Failed to load products. check your internet connection and try again later" || error.detail,
      }          
    }    
  }
          
}
  
  

//◖⁠⚆⁠ᴥ⁠⚆⁠◗◖⁠⚆⁠ᴥ⁠⚆⁠◗◖⁠⚆⁠ᴥ⁠⚆⁠◗◖⁠⚆⁠ᴥ⁠⚆⁠◗◖⁠⚆⚆⁠◗◖⁠⚆⁠ᴥ⁠⚆⁠◗◖⁠⚆
let swift; // INITIALIZED ✅
//◖⁠⚆⁠ᴥ⁠⚆⁠◗◖⁠⚆⁠ᴥ⁠⚆⁠◗◖⁠⚆⁠ᴥ⁠⚆⁠◗◖⁠⚆⁠ᴥ⁠⚆⁠◗◖⁠⚆⁠ᴥ⁠⚆⁠◗◖⁠⚆⁠ᴥ⁠⚆⁠◗

class Swiftkey {
  constructor(key) {
    this.homeId = key;
    this.initialize();
  }
  
  initialize() {
  
    if(!this.homeId) {
      alert("no home selector!");
      return;
    }
      
    Swiftkey.getFooterHeight();
    this.start();
  }
  
  static getFooterHeight() {
    const footerBar =   document.querySelector(".Mainfooter");
    const views = document.querySelectorAll(".submain");
    if (footerBar) {
      const height = Math.floor(footerBar.clientHeight);
       views.forEach(view => {
       view.style.height = `calc(100% - ${height}px)`;
       });
     }    
  }
  
  async start() {    
    swift = new SwiftMart; 
    setTimeout(()=>{},10);
    swift.calculateWidth(this.homeId);
    swift.createColumns(this.homeId, true); 
    this.fetchData();     
  }
  
  async fetchData() {
    try {
      const response = await swift.getProducts();
      if(!response.status) {        
       throw new Error(response.message);
      }
     
      let data = response.data;    
      startCarousel();
      swift.renderProductToCols(data, this.homeId, true);
 
         
    } catch(error) {
       notice(error); 
    } finally {
     //start other functions
      this.startFunctions();   
    }    
  }
  
  startFunctions() { 
    startNavigator(); 
    getElements(); 
    activateCartModel();
    activateOrderModel();        
    startAuthUtils();
    silentLogUser();
     
    
  }                   
}


//get addresses and accounts;
function loadMoreUserAssets() {
    startAddress();
    
}






window.addEventListener('DOMContentLoaded', () => {
  updateAlertAndLoader();
  
  new Swiftkey(".homeProducts");
  
   
  //🛒🛒🛒🛒🛒🛒🛒🛒🛒🛒🛒🛒🛒
  window.addEventListener("resize", Swiftkey.getFooterHeight);
  //🛒🛒🛒🛒🛒🛒🛒🛒🛒🛒🛒🛒🛒
  window.addEventListener("load", Swiftkey.getFooterHeight);    
}); //END 🎊🎉🎊🎊🎊





