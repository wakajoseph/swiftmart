class OrderModel {
  constructor() {
    this.orderItems = null;
    this.userWallet = null;
    this.userAddresses = [];
    this.els = {};    
    
    //state
    this.isTopping = false;
    this.isGettingAddress = false;
    this.currentLocation = [];
  }

  getEl(el) {
    let e = document.querySelector(el);
    if (e) return e;
  }

  initialize() {
    
    let els = {
      is_default: this.getEl("#address-holder"),
      addressPicker: this.getEl("#edit-address"),
      pickupAddress: this.getEl("#location"),
      userNumber: this.getEl("#holder-number"),
      walletBalance: this.getEl("#wallet-balance"),
      decimal: this.getEl(".decimal"),   
      topupButton: this.getEl(".btn-topup"),
      toppingContainer: this.getEl(".mpesa-topup"),
      walletNavigator: this.getEl(".navigateWallet"),
      topingNumber: this.getEl("#topupNumber"),
      topingAmount: this.getEl("#amount"),     
      invalidNumber: this.getEl(".number-error"),
      invalidAmount: this.getEl(".amount-error"),
      pushStkButton: this.getEl("#payWithMpesa"),      
      collapseTopping: this.getEl("#collapseTop-up"),
      swiftPoints: this.getEl("#swift-points"),
      pointsValue: this.getEl("#points-value"),
      couponValue: this.getEl("#couponDiscount"),     
      totalItems: this.getEl("#total-items"),
      orderItemsContainer: this.getEl(".order-items"),
      subTotalAmount: this.getEl("#sub-total"),
      totalDiscount: this.getEl("#totalDiscount"),
      shippingFee: this.getEl("#shipping-fee"), 
      availableWalletBalance: this.getEl("#available-balance"),
      remainingAfterPurchase: this.getEl("#remainingAfterPurchase"),
      totalPayable: this.getEl("#totalAmount"),
      moreMoneyLabel: this.getEl(".moreMoneyLabel"),
      placeOrder: this.getEl("#btn-place-order"),
      
    };
    
    let isValid = true;

    Object.entries(els).forEach(([k, v], i) => {
      if (v === undefined || v === null) {
                        
        let er = `⚠️${k} at index ${i}, not found!`;        
        console.log(er);
        isValid = false;
      }
    }); 
    
    if (isValid) {
        this.els = { ...els };        
        this.addEventListeners(els);
    }    
  }
  
  addEvent(el, e, handler) {
    if (el) {
      el.addEventListener(e, handler);    
    }
  }
  
  addEventListeners(e) {
     this.addEvent(e.topupButton, 'click', () => this.topupAmount())
     
    this.addEvent(e.collapseTopping, 'click', () => this.closeTopping());
    
    this.addEvent(e.addressPicker, 'click', ()=> this.manageAddress());
    
    this.addEvent(e.walletNavigator, 'click', ()=> this.manageWallet());
    
    this.addEvent(e.placeOrder, 'click', ()=> this.placeOrder());
    
    this.addEvent(e.pushStkButton, 'click', ()=> this.pushStkRequest());
    
    this.addEvent(this.els.topingNumber, 'input', ()=> this.validatePhone());
    
    this.addEvent(this.els.topingAmount, 'input', ()=> this.validateAmount());
          
  }
  

  on(data) {  
     if (!data) return;          
     this.orderItems = data;     
     this.getAddress();
     this.renderContent();
  }
  
   renderContent() {
      this.renderAddressData();
      this.renderWalletData();
      this.renderItemsData();
      this.renderDiscountData(); 
      navigateTo("order");      
  } 
        
  
  async getAddress() {            
     if (!admin) {
       alert("login or sign up"); 
       return; 
     }       
     const userResponse = await
      fetch("http://localhost:8000/user/addresses", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: admin})
      });

     if (!userResponse.ok) {
          let e = await userResponse.json().catch(() => ({}));
          console.log(e.detail);
          
          this.userAddresses = [];
     } else {
         this.userAddresses = await userResponse.json(); 
        
     }            
  }
  
  

 
 
  
  renderAddressData() {

    let e = this.els;    
    let userAddress = this.userAddresses.find(a => a.is_default === true) || null;
            

    if (!userAddress) {
      e.userNumber.textContent = "";
      e.pickupAddress.textContent = "No delivery address found for your account. Please set one before proceeding with payment.";
      e.is_default.textContent = "";
     
    } else {

    e.userNumber.textContent =     userAddress.phone;
    e.pickupAddress.textContent = [
      userAddress.street || "YOU",
      userAddress.county_name,
      userAddress.sub_county_name,
      userAddress.pickup_station_name
    ].filter(Boolean).join(", ");
    e.is_default.textContent = "DEFAULT ADDRESS";
    
    }        
  }
  
  
  
  
  
  
  
  renderItemsData() {  
    let itemsContainer = document.querySelector('.order-items');
    itemsContainer.innerHTML = "";
    
    this.orderItems.items.forEach(i => {
      let itemContainer = document.createElement('div');          
      let matchedProperty = null;
      let prop;
      const skuParts = i.sku.split('-');
      if (skuParts.length >= 2) {
        const skuValue = skuParts[skuParts.length - 1]; 
        matchedProperty = i.properties.find(prop => prop.value === skuValue);

        if (matchedProperty) {
           prop = `${matchedProperty["property"]}: ${matchedProperty["value"]}`;
        }
      } 
     itemContainer.classList.add("order-item");
     itemContainer.innerHTML = `
         <div class="product-store">
             <span><i class="fas fa-store"></i></span>
             <span class="storeName">${i.store_name}</span>
         </div>
         
         <div class="product-data">             
          <div class="fulfilment">
           <div class="fulfiler"><i class="fas fa-truck" style="margin-right: 5px;"></i></i>Fullfiled by swiftMart</div>
           <div class="shipping-infomation">Product will be safely packed in ${i.location} then delivered to your address in timely manner</div>
          </div>
         <div class="product">
           <div class="product-picture">
               <img src="${i.image}" alt="">
           </div>
           <div class="product-infomation">
             <div class="product-tittle-and-price">
               <div class="product-title">${i.product_name}</div>
               <div class="product-price">KSh ${i.price.toFixed(2)}</div>
             </div>
             <div class="product-properties-and-quantity">
               <div class="product-properties">${prop}</div>
               <div class="product-quantity">× ${i.requested_quantity}</div>
             </div>
           </div>         
          </div>            
         </div>                           
       </div>    
     `;
     itemsContainer.appendChild(itemContainer);  
    });             
  }
  
  
  


  
  
  
  renderWalletData() {
    
    let w =  this.orderItems["wallet"];
    let amn = w["available_balance"];
    let decimal = (amn % 1).toFixed(2).slice(1) || ".00";    
    this.els.walletBalance.innerText = `KSh ${parseInt(amn)}`;
    this.els.decimal.textContent = decimal;    
    this.els.topingNumber.value = this.fomartPhone(w.phone);
    this.els.topingAmount.value = this.orderItems.totals.more_money_required;
  }  
  
  
  renderDiscountData() {        
     const fmt = (n, type) => {
        if (type === "-") {
          if (n > 0) return `-KSh ${n.toFixed(2)}`;
          return `KSh ${n.toFixed(2)}`;
        } else {
           if (n > 0) return `+KSh ${n.toFixed(2)}`;
           return `KSh ${n.toFixed(2)}`; 
        }
      }
                    
      let e = this.els;
      let tt = this.orderItems.totals;      
    
      e.swiftPoints.textContent =  `${this.orderItems.wallet.coins} Coins`;
      
      e.pointsValue.textContent =  `(${fmt(tt.coins_value, "-")})`;
      
      e.couponValue.textContent = fmt(tt.total_coupon_value, "-");
      
      
      //:/*  */://:/*  */://
      //FINNAL SUMMARY ////
      ////////////////////
     e.totalItems.textContent = this.orderItems.items.length;
     
     e.subTotalAmount.textContent = `KSh ${tt.total_product_amount.toFixed(2)}`;
     
     e.shippingFee.textContent = fmt(tt.delivery_fee, "+");
     
     let totalDiscount = tt.total_coupon_value + tt.coins_value;
     
     e.totalDiscount.textContent = fmt(totalDiscount, "-");
     
     
     e.totalPayable.textContent = `KSh ${tt.amount_after_deductions.toFixed(2)}`;
     
     e.availableWalletBalance.textContent = `KSh ${tt.wallet_balance.toFixed(2)}`;
     
     if (tt.wallet_balance >= tt.amount_after_deductions) {
       e.remainingAfterPurchase.textContent =  `KSh ${tt.wallet_balance - tt.amount_after_deductions}`;
       
     } else {
         e.moreMoneyLabel.textContent = "More Money Requred:";
         e.remainingAfterPurchase.textContent = `KSh ${tt.more_money_required.toFixed(2)}`;
     }     
   }
  
  
  
  

  manageAddress() {  
     const userId = admin; 
     const baseUrl = "/index.html";
     const hash = "#mpesa-topup";
     const returnUrl = `${baseUrl}?id=${encodeURIComponent(userId)}${hash}`;
     const encodedReturnUrl = encodeURIComponent(returnUrl);        
     window.location.href = `/address.html?redirect=${encodedReturnUrl}`;            
  }
  
  manageWallet() {      
  }
  
  placeOrder() {      
  }
  
  pushStkRequest() {      
  }

//#######################################// 
//              UTILITIES                //
//#######################################//
  
  topupAmount() {
     let cont = this.els.toppingContainer; 
     
     if (this.orderItems.totals.wallet_balance >= this.orderItems.totals.amount_after_deductions) {
       alert("YOU HAVE SUFFICIENT BALANCE FOR SHOPPING. YOU CAN PROCEED WITH ORDER WITHOUT ANY HESITATION 😊");
       return; 
     } 
      
     if (this.isTopping) {
       cont.classList.add("flash");
       setTimeout(() => {
        cont.classList.remove("flash")
        
       }, 2000); 
       
     }
     
     this.isTopping = true;     
     cont.classList.add('active');
  }
  
  closeTopping() {
     let cont = this.els.toppingContainer;
     cont.classList.remove('active');
     this.isTopping = false;
  }
    
  validatePhone() {
     let invalid = this.els.invalidNumber;
     let value = this.els.topingNumber.value;
     
     const pattern = /^(0?(7|1))[0-9]{8}$/;
     const tester = (no) => pattern.test(no);
     
     if (!tester(value)) {
       invalid.classList.add('active');
     } else {
       invalid.classList.remove('active');
       const formatted = this.fomartPhone(value);
       this.els.topingNumber.value = formatted;
     }
                    
  }
  
  fomartPhone(phone) {  
      const digits = phone.toString().replace(/\D/g, '');
      if (digits.length >= 12 && digits.startsWith('254')) {
        return digits.slice(-9);
      }

      if (digits.length === 10 && digits.startsWith('0')) {
        return digits.slice(1);
      }

      if (digits.length === 9 && /^[17]\d{8}$/.test(digits)) {
        return digits;
      }

    //return back original phone  if doesn't match our model
      return phone; 
  }
  
  validateAmount() {
     let invalid = this.els.invalidAmount;
     let value = this.els.topingAmount.value;
     const rj = [10, 300000];
     let digs = /^\d+$/;
     
     const tester = (d) => digs.test(d);
     let tested = tester(value);
     
   
     if(!value || value <rj[0] || value > rj[1] || !tested) {
       invalid.classList.add('active');  
     } else {
        invalid.classList.remove('active'); 
     }          
  }
  
   ////////////////     
  //""""END"""""//
 ////////////////
}


let orderModel;

function activateOrderModel() {
  orderModel = new OrderModel();
  orderModel.initialize();
}  
