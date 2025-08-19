class ScrollLoader {
  constructor(containerSelector, loaderSelector, retrySelector, noContent) {
    this.container = document.querySelector(containerSelector);
    this.loader = document.querySelector(loaderSelector);
    this.retry = document.querySelector(retrySelector);
    this.isLoading = false;
    this.canTrigger = true;
    this.noContent = document.querySelector(noContent);    
    this.swiftHeader = document.querySelector(".header.homeRoot");
    this.promoPage = document.querySelector(".promoPage");
    this.searchBox = document.querySelector(".searchBox");
    this.navigation =  document.querySelectorAll(".header .navigate button");
    
    this.init();
  }

  init() {
  
    if (!this.container) return false;            
       this.container.addEventListener('scroll', () => this.handleScroll());

    if (this.retry) {
      this.retry.addEventListener('click', () => this.renderMoreItems());
    }
  }

  handleScroll() {
    const scrollTop = this.container.scrollTop;
    const clientHeight = this.container.clientHeight;
    const scrollHeight = this.container.scrollHeight;
      
    const heights= this.promoPage.clientHeight + this.swiftHeader.clientHeight;
    
    if (scrollTop >= heights) {
      this.changeHeaderBackground(true);
    } else {
      this.changeHeaderBackground(false);  
    }
           
    if (!this.canTrigger) {      
      if (scrollTop + clientHeight < scrollHeight) {
        this.canTrigger = true;
      }            
      return;
    }
    this.renderMoreItems();
  }

  async renderMoreItems() {
    if (this.isLoading) return;

    const scrollTop = this.container.scrollTop;
    const clientHeight = this.container.clientHeight;
    const scrollHeight = this.container.scrollHeight;

    if (scrollTop + clientHeight >= scrollHeight - 1) {
      this.isLoading = true;
      this.canTrigger = false;      
      this.queryData();            
    }
  }
  
  async queryData() {
      this.indicateLoading();      
      try {
        const response = await swift.getProducts();
        if(!response.status) {        
         throw new Error(response.message);
        }
     
        let data = response.data;
        if (data.length < 1) {
          this.retry?.classList.remove('active');
this.loader?.classList.remove('active');
          this.noContent?.classList.add("active");
          
        } else {      
        swift.renderProductToCols(data, this.homeId, false);
        this.successfullyLoadedItems();
        }
          
      } catch(error) {
        this.failedToLoadItems();
        toast(error); 
                                  
      } finally {
         this.isLoading = false; 
      }
  }

  indicateLoading() {
  this.noContent.classList.remove("active");
    this.loader?.classList.add('active');
    this.retry?.classList.remove('active');
  }

  failedToLoadItems() {
    this.loader?.classList.remove('active');
    this.noContent.classList.remove("active");
    this.retry?.classList.add('active');
  }

  successfullyLoadedItems() {
    this.loader?.classList.remove('active');
    this.noContent.classList.remove("active");
    this.retry?.classList.remove('active');
  }
  
  changeHeaderBackground(val) {
    if (val) {
     swift.setThemeColor("#ffffff");
     this.swiftHeader.classList.add('active');
     this.searchBox.classList.add('active');
     this.navigation.forEach(btn => {
       btn.classList.add('active');   
     })
       
    } else {
     swift.setThemeColor(currentTheme);
     this.swiftHeader.classList.remove('active');
     this.searchBox.classList.remove('active');
     
      this.navigation.forEach(btn => {
        btn.classList.remove('active');   
      });           
    }
    
    
  }
}

// initializer.js
function startAutoLoadModel() {    
    new ScrollLoader('.container .homeScreen', '#autoLoad .preloader', '.retryLoadingItems', '#autoLoad .noMoreContent');

}



    






