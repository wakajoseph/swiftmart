class CartManager {
    constructor() {
        this.isNew = true;        
        this.activeVariants = [];
        this.selectedVariant = null;
        this.userAddress = null;
        this.userLocation = null;
        this.cartId = null;
        this.cartItems = [];
        this.itemsChecked = [];        
        this.amount = [];             
        this.newCartItem = null;
        this.elements = {};
        this.trial = null;
        this.isDeleting = false;
        this.isEditing = false;
        this.trashItems = [];
        this.ready_check_out = [];
        
        this.dt = {
          price: null,
          quantity: null,
          mainImage: null,
          image: null,
          userAddress: null,
          storeId: null,
          storeLocation: null,
          customerLocation: null,
          estimatedDelivery: null
        };
        
        this.initializeElements();
    }
    
    

    finder(selector) {
        return document.querySelector(selector);
    }

    initializeElements() {
        const elements = {
            addItemToCart: this.finder("#addToCart"),           
            container: this.finder(".addToCartOverlay"),
            totalProducts: this.finder(".totalItems"),
            totalAmount: this.finder(".totalPrice"),
            cartContainer: this.finder(".itemsContainer"),
            relatedItemsContainer: this.finder(".relatedItemsContainer"),
            totalChecked: this.finder("#totalCheckOut"),            
            totalPriceElement: this.finder(".totalPrice"),
            sellectAllItems: this.finder("#checkAllItems"),
            cartCounter: document.querySelectorAll(".cartCounter"),
            buy: this.finder(".checkOut"),
            editor:  this.finder("#manageCartItems"),
            removeButton: this.finder("#deleteCartItems"),
            checkedOverview: this.finder("#checkOutOverview"),
            priceDisplay: this.finder(".v-price"),
            stockDisplay: this.finder(".v-stock"),
            photoDisplay: this.finder("#v-pic"),
            addressDisplay: this.finder(".shippingAddress"),
            addressNavigate: this.finder("#select-address"),
            storeIcon: this.finder(".sellerIcon"),
            storeType: this.finder(".sellerType"),
            storeLocation: this.finder(".storeLocation"),
            customerLocation: this.finder(".customerLocation"),
            estimatedDelivery: this.finder(".estimatedDelivery"),
            
            masterChecker: this.finder(".checkAll"),            
        };
        
   

        for (let [key, el] of Object.entries(elements)) {
            if (!el || (el instanceof NodeList && el.length === 0)) {
                console.warn(`Element "${key}" NOT found.`);
            }
        }
        
        this.elements = elements;
        this.addListeners();
        
    }
    
    
    addListeners() {
      this.elements.addItemToCart.addEventListener('click', () => this.prepareNewItem());
      this.elements.sellectAllItems.addEventListener('click', () => this.toggleAllCheckBox());
        this.elements.editor.addEventListener('click', () => this.editCartItems());
        this.elements.removeButton.addEventListener('click', () => this.clearTrashItems());
        
  //add to cart        
const container = this.elements.container;    
    container.querySelector("#btnAdd").addEventListener("click", () => this.addOverlayQuantity());
    container.querySelector("#btnMns").addEventListener("click", () => this.reduceOverlayQuantity());
    container.querySelector(".pushToCart").addEventListener("click", () => this.saveUserItem());

container.querySelector(".pushToOrder").addEventListener("click", () => this.pushToOrder());
 container.querySelector("#closeCart").addEventListener("click", () => this.closeCartOverlay());      
     
      
    
       
    }
    
   async getCartItems() {
       try {
        let response = await auth.fetchWithAuth(viewCartUrl, {
            method: 'POST',            
        })
        
        if (!response.ok) {
            let e = await response.json().catch(() => ({}));
            throw new Error(e);
                                    
        }
        
        this.cartItems = await response.json()
        
        } catch(error) {
            console.log(error || error.detail);
            notice("SOMETHING WENT WRONG! TRY AGAIN LATER")
        } finally {
            this.updateUi();                             
        }     
    }
    
    async updateUi() {
        
       const { cartContainer, totalProducts, totalPriceElement } = this.elements;
        cartContainer.innerHTML = "";
        
        if (!Array.isArray(swift.mainProducts)) {
    console.error("Product data is missing or invalid");
    return;
}

        if (!Array.isArray(this.cartItems.items) || this.cartItems.items.length === 0) {
            const msg = document.createElement('h3');
            msg.textContent = "Your Cart Is Empty";
            cartContainer.appendChild(msg);
            totalProducts.textContent = `Cart (0)`;
            totalPriceElement.innerText = `KSh 0`;
            this.elements.cartCounter.forEach((c) => {
                c.style.display = "none";                
            })
             this.elements.masterChecker.classList.remove('clicked');           
            return;
            
        }
        
        totalProducts.textContent = `Cart (${this.cartItems.items.length})`;
        
        this.elements.cartCounter.forEach((c) => {
                c.style.display = "flex";
                c.textContent = this.cartItems.items.length;
            });
            
        this.cartId = this.cartItems.cart_id;
        ;
        for (const item of this.cartItems.items) {
          let res = await swift.getProducts(item.productId);
                    
          if (!res.status) continue;
    
          let p = res.data[0];

          item.storeName = p.store.name;
          item.image = p.profilePicture;
          item.name = p.name;
          item.currentPrice = p.price;
          item.isChecked = false;

          this.itemsChecked.push(false);
      this.amount.push(item.priceWhenAdded);
       }    
        
       this.cartItems.items.forEach((item, index) => { 
       
       let variantId = item.variantId;
       let productId = item.productId       
       
          const cartHtml = document.createElement('div');
                                          cartHtml.classList.add("cart__item");
            cartHtml.innerHTML = `
                <div id="storeName">
                    <i class="fas fa-store"></i>
                    <span>${item.storeName}</span>
                </div>
                
                <div id="itemSection">
                    <div class="checkbox cb${index}" data-product="${productId}" data-variant="${variantId}">
                        <i class="fas fa-check"></i>
                    </div>
                    <div class="itemPic">
                        <img src="${item.image}" alt="${item.name}"/>
                    </div>
                    <div class="itemDetails">
                        <div class="name">${item.name.slice(0, 20)}...</div>
                        <div class="color">${item.color ?? ""}</div>                    
                        <div class="priceSection">
                            <div class="price">KSh ${item.currentPrice.toLocaleString()}</div>
                            <div class="quantity">
                                <button class="reduce" data-index="${index}">
                                    <i class="fas fa-angle-left"></i>
                                    </button>
                                <span id="quantity-${index}">${item.quantity}</span>
                                <button class="add" data-index="${index}">
                                    <i class="fas fa-angle-right"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            cartContainer.appendChild(cartHtml);
        });
       
       this.attachCartEvents();
       
        if (this.isNew) {
             this.resetCheckBox();
             this.isNew = false;                 
            }      
    }

    attachCartEvents() {
        const checkboxes = this.elements.cartContainer.querySelectorAll(".checkbox");
        checkboxes.forEach((cb, index) => {
            cb.addEventListener('click', () => this.check(index));
        });

        this.elements.cartContainer.querySelectorAll(".reduce").forEach(btn => {
            btn.addEventListener('click', () => this.reduceQuantity(+btn.dataset.index));
        });

        this.elements.cartContainer.querySelectorAll(".add").forEach(btn => {
            btn.addEventListener('click', () => this.addQuantity(+btn.dataset.index));
        });               
    }

    sumAmount() {

    let total = this.amount.reduce((sum, val) => sum + (parseFloat(val) || 0), 0);    
               this.elements.totalPriceElement.innerText = `KSh ${total.toLocaleString()}`;
    }

    check(index) {
                   
        const checkbox = document.querySelector(`.cb${index}`);
        if (!checkbox) return;
        
        let state = this.cartItems.items[index].isChecked;
        
        let itemId =  Number(checkbox.dataset.product);
        let typeId = Number(checkbox.dataset.variant);
              
        
        if (this.isEditing) {
               
           
           const existingIndex = this.trashItems.findIndex((item) =>
    item.productId === itemId && item.variantId === typeId
);
   
           
           if (existingIndex !== -1) {    
        this.trashItems.splice(existingIndex, 1);
        checkbox.classList.remove('clicked');
        this.elements.masterChecker.classList.remove('clicked');
           } else {
             
             let newTrash = {
                productId: itemId,
                variantId: typeId,  
             }
                          
          this.trashItems.push(newTrash);
          console.log(JSON.stringify(this.trashItems));
             checkbox.classList.add('clicked');
             }            
                             
           this.elements.removeButton.style.background = this.trashItems.length > 0 ? "#ff4a2b" :"#d0e3e3";
     
                                                
        } else {
        
    let found = this.ready_check_out.findIndex((item) =>
    item.productId === itemId && item.variantId === typeId);        
          
          if (state) {
          
            if (found !== -1) {
               this.ready_check_out.splice(found, 1)  
             } checkbox.classList.remove('clicked'); 
             this.elements.masterChecker.classList.remove('clicked');
                          
             
          } else {
             checkbox.classList.add('clicked'); 
            if (found === -1) {
               this.ready_check_out.push({
                productId: itemId,
                variantId: typeId,  
               });
             } 
             
      console.log(JSON.stringify(this.ready_check_out));
          } 
          
          this.cartItems.items[index].isChecked = !state; 
         this.totalCheckedItems(); 
        }
                 
                                 
    }
    
    resetCheckBox() {
      this.cartItems.items.forEach((item, index) => {        
          item.isChecked = false;
       });
      this.trashItems = [];
      
      let checkers = document.querySelectorAll(".checkbox");
      
      checkers.forEach(c => {
         c.classList.remove("clicked"); 
      });            
    }


    totalCheckedItems() { 
        this.amount = [];
        this.cartItems.items.forEach(item => {
            if (item.isChecked) {
               let totalAmount = item.currentPrice * item.quantity;
                this.amount.push(totalAmount);
            }
        })       
              

        const checkedLength = this.amount.length;

        const { buy, totalChecked } = this.elements;
        if (checkedLength > 0) {
            buy.classList.add('active');
            totalChecked.textContent = `(${checkedLength})`;
        } else {
            buy.classList.remove('active');
            totalChecked.textContent = "";
        }

        this.sumAmount();
        
    }
    
    

    toggleAllCheckBox() {
        if (this.cartItems.items.length < 1) return;
        
        let checkers = document.querySelectorAll(".checkbox");
                        
        let is_active = this.elements.masterChecker.classList.contains('clicked');
        
        
        if (this.isEditing)  {            
            this.trashItems = [];
            if (is_active) {                
             checkers.forEach(c => {
             c.classList.remove("clicked");                   
             });                
            } else {                             
             checkers.forEach(c => {                  
               let pId = c.dataset.product;
               let vId = c.dataset.variant;
               
               if(pId && vId) {
                this.trashItems.push({
                  productId: Number(pId),
                  variantId: Number(vId),
                });
               }
               c.classList.add("clicked");    
             });               
            }
                           this.elements.removeButton.style.background = this.trashItems.length > 0 ? "#ff4a2b" :"#d0e3e3";
            
        } else {
                
          this.cartItems.items.forEach((item, index) => {
        
          item.isChecked = is_active ? true : false;
                       
          this.check(index);                          
           });
           
           if (is_active) {
          this.elements.masterChecker.classList.remove("clicked");
          
          } else {
         this.elements.masterChecker.classList.add("clicked");
          }   
            
        }
                                  
        
    }

    reduceQuantity(index) {
        if (this.trial) return;
        this.trial = true;
               
        if (this.cartItems.items[index]. quantity > 1) {
            this.cartItems.items[index].quantity--;
          let newQuantity = this.cartItems.items[index].quantity;
     
          document.getElementById(`quantity-${index}`).innerText = newQuantity;
        
         let data = {
            "cartId": this.cartId,
            "productId": this.cartItems.items[index].productId,
            "variantId": this.cartItems.items[index].variantId,
            "quantity": newQuantity,
          }
                                 
          this.manageQuantity(data);     this.totalCheckedItems(parseInt(index));
          
          } else {
              notice('items quantity cannot be less than 1');
              this.trial = null;  
          }
        
              
    }

    addQuantity(index) {  
       
        if (this.trial) {            
            return;
        }        
        this.trial = true;
        this.cartItems.items[index].quantity++;
        
        let newQuantity = this.cartItems.items[index].quantity;
             
        
       let data = {
          "cartId": this.cartId,
          "productId": this.cartItems.items[index].productId,
          "variantId": this.cartItems.items[index].variantId,
          "quantity": newQuantity,
        }
        
      
        
        this.manageQuantity(data);
        
        document.getElementById(`quantity-${index}`).innerText = newQuantity;
        
        this.totalCheckedItems(index);
    }
    
    
    async manageQuantity(req) {
        
        try {                    
           
           let response = await auth.fetchWithAuth(quantityUpdateUrl, {
               method: 'POST',
               headers: {'Content-Type': 'application/json'},
               body: JSON.stringify(req),         
        })
           
            
           if (!response.ok) {
              let e = await response.json().catch(()=>({}));
              throw new Error(e.detail);
           }
           
           toast("Updated Successfully");
           setTimeout(()=> {
                this.getCartItems()
            }, 5000);          
           
        } catch (error) {
            showAlert(error || error.detail);
            toast("Failed To update!")
        } finally {
            this.trial = null;
            
            
        }
    }
    
    editCartItems() {
        this.resetCheckBox();
        if(this.isEditing) {           
           this.isEditing = false;
                       this.elements.removeButton.classList.remove("show");
           this.elements.checkedOverview.classList.add("show");
            this.elements.editor.textContent = "Edit";
                        
        } else {           
           this.isEditing = true;
           
; this.elements.removeButton.classList.add("show");
           this.elements.checkedOverview.classList.remove("show");
            this.elements.editor.textContent = "Done";
                         
        }
        this.trashItems = [];
        this.elements.removeButton.style.background = this.trashItems.length > 0 ? "#ff4a2b" :"#d0e3e3";
    }
    
    clearTrashItems() {   
        
        if (this.trashItems.length < 1 || this.isDeleting) {
            return;
        }
        
        this.isDeleting = true;
        
        let request = {
            "cartId": this.cartId,
            "trashItems": this.trashItems,
             }
             
    let required =  {
          "cartId": 0,
          "trashItems": [
            {
              "productId": 0,
              "variantId": 0
            }
          ]
        }
        
        
   console.log(JSON.stringify(request)); 
          this.removeFromCart(request)
    }
    
    
    async removeFromCart(req) {
       try {
               
          let response = await auth.fetchWithAuth(deleteCartItemsUrl, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(req),            
        }) 
        
          if (!response.ok) {
              let e = await response.json().catch(()=>({}));
              throw new Error(e.detail);
           }
           
           toast("Removed");
           
                      
       } catch (error) {
            notice("something went wrong" || error.detail);
       } finally {
          this.isDeleting = false;
          this.getCartItems();
          this.elements.removeButton.style.background = this.trashItems.length > 0 ? "#ff4a2b" :"#d0e3e3";       
       }
    }
    
   


    //NEW ITEM ADDING WORKOUT
    prepareNewItem() {
        let data = swift.focusedItem;
        this.newCartItem = {
           "productId": data.id,
           "variantId": data.variants[0].variantId,
           "quantity": 1,       
           "priceAddedAt": data.variants[0].price,
       }
       
       this.dt = {
          price: data.variants[0].price,
          quantity: data.variants[0].quantity,
          mainImage: data.profilePicture || "placeholder.jpg",
          image: data.variants[0].image,
          userAddress: this.userAddress,
          storeId: data.store.storeId,
          storeLocation: data.store.location,
          customerLocation: this.userLocation,
          estimatedDelivery: data.shipping.estimated_delivery || null,
        }; 
        
        
       this.openCartOverlay();
      
    }
               

   async openCartOverlay() {
    let container = this.elements.container;
    if (!swift.focusedItem) return;
    
    this.updateCartUi();
    
    this.activeVariants = swift.focusedItem.variants;
    
    const variants = this.activeVariants;
    const cont = document.querySelector(".available-variants");
    cont.innerHTML = ""; 
    const selectedProps = {};

    const allProps = new Set();
    variants.forEach(v => Object.keys(v.properties).forEach(p => allProps.add(p)));

    allProps.forEach(prop => {
        const groupDiv = document.createElement("div");
        groupDiv.classList.add("available-variant-property");
        groupDiv.setAttribute("data-group", prop);

        const label = document.createElement("div");
        label.classList.add("propertyName");
        label.textContent = prop;
        groupDiv.appendChild(label);

        const propValue = document.createElement("div");
        propValue.classList.add("propertyValue");

        const values = [...new Set(variants.map(v => v.properties[prop]).filter(Boolean))];

        values.forEach(value => {
            const matchingVariant = variants.find(v => v.properties[prop] === value);
            if (!matchingVariant) return;

            if (matchingVariant.image) {
                const vrnt = document.createElement("div");
                vrnt.classList.add("variant");
                vrnt.setAttribute("data-id", matchingVariant.variantId);
                vrnt.setAttribute("data-prop", prop);
                vrnt.setAttribute("data-value", value);
                vrnt.innerHTML = `
                    <img src="${matchingVariant.image}" alt="swift.jpg">
                    <div class="value">
                        <span class="propertyValue-name">${value}</span>
                    </div>
                `;
                propValue.appendChild(vrnt);
                vrnt.addEventListener("click", () => {
                    this.selectVariant(selectedProps, prop, groupDiv, vrnt, ".variant", variants, value);
                });
            } else {
                const btn = document.createElement("button");
                btn.textContent = value;
                btn.setAttribute("data-id", matchingVariant.variantId);
                btn.setAttribute("data-prop", prop);
                btn.setAttribute("data-value", value);
                propValue.appendChild(btn);
                btn.addEventListener("click", () => {
                    this.selectVariant(selectedProps, prop, groupDiv, btn, "button", variants, value);
                });
            }
        });

        groupDiv.appendChild(propValue);
        cont.appendChild(groupDiv);        
      });
      
      container.style.display = 'flex';
      setTimeout(()=> {
        container.classList.add('active'); 
      },50);
      
    }
    
    selectVariant(selectedProps, prop, groupDiv, req, type, variants, value) {
    // 1. Save selection
    selectedProps[prop] = value;

    // 2. Highlight selected
    [...groupDiv.querySelectorAll(type)].forEach(t => t.classList.remove("active"));
    req.classList.add("active");

    // 3. Try to find matching variant
    const match = variants.find(v =>
        Object.entries(selectedProps).every(
            ([k, val]) => v.properties[k] === val
        )
    );

    if (match) {
        this.selectedVariant = match.variantId;
        this.updateSelectedVariant();
     } else {
        this.selectedVariant = null;
     }
    }
    
    updateSelectedVariant() {
         const variant = this.activeVariants.find(v => v.variantId === this.selectedVariant);
         
         if (!variant) return;              
                       
        this.newCartItem["variantId"] = variant.variantId;                     
        this.newCartItem["priceAddedAt"] = variant.price;
               
          this.dt.price = variant.price;
                    
          this.dt.stock = variant.quantity > 1 ? variant.quantity : "null",         
          this.dt.image = variant.image ?? "null";
          
        this.updateCartUi();                                       
    }

    addOverlayQuantity() {
        this.newCartItem.quantity++
        document.querySelector("#quantity__display").textContent = this.newCartItem.quantity;
        
    }

    reduceOverlayQuantity() {
       if (this.newCartItem.quantity > 1) {
            this.newCartItem.quantity--;
             document.querySelector("#quantity__display").textContent = this.newCartItem.quantity;
               
        }
    }

    closeCartOverlay() {
        this.elements.container.classList.remove('active');
        document.querySelector(".available-variants").innerHTML = ""; 
        this.newCartItem = null;
    }
    
    updateCartUi() {
      const e = this.elements;
      const dt = this.dt;
      e.priceDisplay.innerText = `Ksh ${dt.price.toLocaleString()}` ?? `Ksh ${swift.focusedItem.price.toLocaleString()}`;
      
      e.stockDisplay.innerText = dt.quantity ?? "Out of Stock";
      e.photoDisplay.src = dt.image ?? dt.mainImage;
      e.addressDisplay.innerText = dt.userAddress ?? "Login Or Setup Your Delivery Address.";
      const isSwiftMart = dt.storeId === 1;
      e.storeIcon.innerHTML = isSwiftMart 
        ? `<i class="fas fa-user"></i>` 
        : `<i class="fas fa-store"></i>`;

      e.storeType.innerText = isSwiftMart ? "SwiftMart" : "Local Seller";
      e.storeLocation.innerText = dt.storeLocation ?? "Seller Location";
      e.customerLocation.innerText = dt.customerLocation ?? "Your preferred Location";
      e.estimatedDelivery.innerText = dt.estimatedDelivery ?? "Shotest period of time";
    }
    
    async saveUserItem() {
        
      try {        
        
        let response = await auth.fetchWithAuth(addToCartUrl, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(this.newCartItem),
        });
        
        
        if (!response.ok) {
            let e = await response.json().catch(() => ({}));
            throw new Error(e)
        }
        
        let data = await response.json();
        await this.getCartItems();
        await notice(data.message);
        
     } catch(error) {
         await notice(error || error.detail)
     } finally {
         this.closeCartOverlay();
     }                
   }
   
   async pushToOrder() {
     let dt = this.newCartItem;
      if (!dt.variantId) {
          alert("Select atleast one item");
          return;          
      }
      
      let requestBody = {
        "items": [
          {
            "product_id": dt.productId,
            "variant_id": dt.variantId,
            "quantity": dt.quantity
          }
        ]
      };
      
      try {
         console.log(JSON.stringify(requestBody));
       
         let response = await auth.fetchWithAuth(orderItemReqUrl, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(requestBody),            
        })
      
         if(!response.ok) {
            let e = await response.json().catch(() => ({}));
            throw new Error(e.detail);
         }
         
         let items = await response.json();
         
         this.closeCartOverlay();
         //Awake order class in orders.js
         orderModel.on(items);
         
      } catch(error) {
          if (error.message) {
              alert(error.message);
          } else {
              console.warn(error)
              console.log(JSON.stringify(error))
          }
      }
      
   }    
}


let cartManager;
function activateCartModel() {
   cartManager = new CartManager();
}

function fetchUserData() {
   cartManager.getCartItems() 
}

