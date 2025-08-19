
class CategoryManager {
  constructor() {
    this.els = {};
    this.path;
    this.cache = [];
    this.initialize();
    
     
  }
  
  el(s) {
    if (!s) return null;
    const sel = document.querySelector(s);
    if (!sel) return null;
    return sel;
  }
  
  initialize() {
    let els = {
      categoryContent: this.el(".category-content"),
      categorySidebar: this.el(".category-sidebar"),
      pathDisplay: this.el(".pathDisplay"),
      categorySideItem: document.querySelectorAll(".category-nav__item"),
    }
    
    Object.keys(els).forEach((e, i) => {
      let element = els[e];
      if (!element) {
       alert(`el: ${e} , index: ${i} null`);
       return;
      } 
    });    
    
    this.els = {...els};
    this.getRootCategories(); 
    
  }
  
  
  async getRootCategories() {
    const data = await this.fetchCategories();    
    if (!data || data.length < 1) return;
 //_______________________________________    
    let container = this.els.categorySidebar;    
    container.innerHTML = "";
 //_______________________________________   
    const dom = (item) => {
      let div = document.createElement('div');
      div.className = "category-nav__item";
      div.innerHTML = `       
        <img src="${item.image_url}" class="category-nav__icon" loading="lazy">
        <span class="category-nav__name">${item.name}</span>    
      `;
      
      div.addEventListener('click', ()=>{ 
          this.els.categorySideItem.forEach(e => {
              e.classList.remove('active');
          });
          
          div.classList.add('active');                 
          this.unpackCategory(item);
                        
      });
      
      return div;
    }   
       
 //_______________________________________       
    data.forEach(category => {
      let response = dom(category);
      if (response) {
        container.appendChild(response); 
      }
    });  
    
    this.clickFirst();  
  }
  
  async unpackCategory(item) {
  
    
      
    if(!Boolean(item.has_children)) {
        this.filterProducts(item.id); 
     
        return;
    } 
    
      this.path = item.name;
      this.updatePath();
    
    let response = await this.fetchCategories(item.id);
    
    if(!response) return;
        
    this.expandCategory(response);
  }
  
//_______________________________________

  
   clickFirst() {
  document.querySelectorAll(".category-nav__item")?.[0]?.click();
  }
  
//_______________________________________

  
  async expandCategory(items) {
    let cont = this.els.categoryContent;
  
  //_______________________________________         
    
    let singleLiefs = []; 
         
    const dom = async(i) => {  
    
       if(!Boolean(i.has_children)) {
        singleLiefs.push(i);      
        return null; 
      }                
               
      let div = document.createElement('div');
      div.className = "category-section";     
      div.innerHTML = `
          <div class="category-section__header">
            <h2 class="category-section__title">${i.name}</h2>
            <a href="#" class="category-section__view-all">View All
              <i class="fas fa-angle-right"></i>
            </a>
          </div>                
         <div class="subcategory-grid">
         </div>
       `;                          
       //;;;;;;;;;;;;;;;;;;;;;;;;;;;
         div.querySelector(".category-section__view-all").addEventListener('click', ()=> {
        this.filterProducts(i.id);  
      });
      
      //;;;;;;;;;;;;;;;;;;;;;;;;;;;
                  
        let parentContainer = div.querySelector(".subcategory-grid");
        const children = await this.fetchCategories(i.id);
        if (children) {
          children.forEach(c => {
            let wrapper = document.createElement('div');
            wrapper.className = "subcategory-card";
            wrapper.innerHTML = `
              <img src="${c.image_url|| 'placeholder.jpg'}" alt="${c.name}" class="subcategory-card__image">
              <span class="subcategory-card__name">${c.name}</span>
            `;
            parentContainer.appendChild(wrapper);
            wrapper.addEventListener('click', ()=> {
              this.unpackCategory(c);
            });
          });  
        }                  
      //;;;;;;;;;;;;;;;;;;;;;;;;;;;      
      return div;          
    };
  //_______________________________________
  
    const domSingles = (list) => { 
    
      if(list.length < 1) return;
    
        let div = document.createElement('div');
        div.className = "category-section";     
        div.innerHTML = `
          <div class="category-section__header">
            <h2 class="category-section__title">More</h2>
            <a href="#" class="category-section__view-all">View All<i class="fas fa-angle-right"></i>
            </a>
          </div>                
          <div class="subcategory-grid"></div>
        `;
         
      let parentContainer = div.querySelector(".subcategory-grid");

                    
      //;;;;;;;;;;;;;;;;;;;;;;;;;;;
      
      for(let i of list) {
      
        let wrapper = document.createElement('div');
        wrapper.className = "subcategory-card";
        
        wrapper.innerHTML = `
          <img src="${i.image_url|| 'placeholder.jpg'}" alt="${i.name}" class="subcategory-card__image">
          <span class="subcategory-card__name">${i.name}</span>
        `;
            //;;;;;;;;;;;;;;;;;;;;;;;;;;;
        parentContainer.appendChild(wrapper);
        cont.appendChild(div);
        
         //;;;;;;;;;;;;;;;;;;;;;;;;;;;
         
        wrapper.addEventListener('click', ()=> {
          this.filterProducts(i.id);
        });                
      }
     
      //;;;;;;;;;;;;;;;;;;;;;;;;;;;
       div.querySelector(".category-section__view-all").addEventListener('click', ()=> {
        this.filterProducts(list[0].parent_id);  
      });
    } //end single
    
  //;;;;;;;;;;;;;;;;;;;;;;;;;;;
    cont.querySelectorAll(".category-section").forEach(c => c.remove());
  //_______________________________________
          
    
    for(const child of items) {
      const response = await dom(child);
      if (response) {            
        cont.appendChild(response);
      }
    }
    
   domSingles(singleLiefs);        
    
  //_______________________________________
  } 
//_______________________________________

  fetchCategories = async(id = null) => {
    if (id !== null && isNaN(Number(id))) return null;

    let url = id ? `${getCategoryUrl}?parent_id=${id}` : getCategoryUrl;

  // Trying cache first    
    const filteredArray = this.cache.filter(obj => obj.parent_id === id);
    if (filteredArray.length > 0) {
      return filteredArray;
    }

  // Otherwise fetching 
    try {
      const response = await fetch(url);
      if (!response.ok) {
        let e = await response.json().catch(()=> ({}));
        throw new Error(e);
      };
      const categories = await response.json();
   
      const newOnes = categories.data.filter(
        //caching 
        cat => !this.cache.some(existing => existing.id === cat.id)
      );

      this.cache.push(...newOnes);

      return categories.data;
    } catch (err) {
      if (err) showAlert("Failed! check your internet connection and try again later");
      if(err.detail) toast("something went wrong", err.detail);
      
      return null;
    }
  }
  
//____________________________ 

  async updatePath() {
    this.els.pathDisplay.innerText = `.../${this.path}`;
  }    
  
//____________________________
  
  async filterProducts(id) {
      showAlert("this feature will be ready soon");
  }      
}


let categoryModel;

function startCategories() {
   categoryModel = new CategoryManager();       
}


