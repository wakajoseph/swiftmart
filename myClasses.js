
class UserWallet {
    constructor(id = null) {
        this.userId = id;
        this.isWallet = false;
        this.balanceData = {};
        this.elements = {};

        this.navigateWallet = this.navigateWallet.bind(this);
        this.navigateCoinsBank = this.navigateCoinsBank.bind(this);

        this.initialize();
    }

    initialize() {
        const elements = {
            userName: document.querySelector(".accountHolder"),
            balanceBox: document.querySelector(".balance"),
            balance: document.querySelector("#balanceId"),
            coupon: document.querySelector("#coupon"),
            coins: document.querySelector("#coins"),
            earnCoins: document.querySelector("#earnCoin"),
        };

        const required = Object.values(elements);
        required.forEach((el, i) => {
            if (!el) alert(`Element at index ${i} not found`);
        });

        this.elements = { ...elements };
        this.logUser(this.userId);
    }

    async logUser(id) {
        if (!id) {           
            this.updateUi();
            return;
        }
        await this.getWallet(id);
    }

    async getWallet(id) {
        try {
    
            const response = await fetch(`http://localhost:8000/wallet/customer/balance?userId=${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }                
            });

            if (!response.ok) {
                const responseError = await response.json().catch(() => ({}));
                throw new Error(JSON.stringify(responseError));
            }

            const data = await response.json();
            this.balanceData = { ...data };
            this.isWallet = true;
            this.updateUi(data);

        } catch (error) {
            console.error("Wallet fetch error:", error.message || error);
            // Fallback to guest UI on error
            this.updateUi();
        }
    }

    updateUi(data = null) {
        const userName = data?.user?.name || "Guest";
        const currency = data?.currency?.toUpperCase() || "$";
        const balance = (data?.total_balance ?? 0).toLocaleString();
        const coupons = data?.coupons?.length ?? 0;
        const coins = data?.points ?? 0;

        this.elements.userName.textContent = userName;
        this.elements.balance.textContent = `${currency}${balance}`;
        this.elements.coupon.textContent = coupons;
        this.elements.coins.textContent = coins;

        this.addEventListeners();
    }

    addEventListeners() {
        this.elements.balanceBox.addEventListener('click', this.navigateWallet);
        this.elements.earnCoins.addEventListener('click', this.navigateCoinsBank);
    }

    navigateWallet() {
        if (this.isWallet) {
            // Redirect to real wallet
            console.log("Navigating to user wallet...");
        } else {
            // Guest version
            alert("Please log in to access your wallet.");
        }
    }

    navigateCoinsBank() {
        if (this.isWallet) {
            console.log("Navigating to earn coins page...");
        } else {
            alert("Login required to earn coins.");
        }
    }
}  

// const userWallet = new UserWallet();
         
let sampledata = {
  "wallet": {
    "id": 1,
    "phone": "0114771230",
    "full_phone": "+2540114771230",
    "currency": "KES",
    "available_balance": 0,
    "total_balance": 0,
    "status": "active",
    "tier": "standard",
    "points": 0,
    "security": {
      "two_factor_enabled": false,
      "verified": false
    },
    "payment_methods": []
  },
  "user": {
    "id": 1,
    "name": "Joseph Waka"
  },
  "coupons": []
}

    //==================
    //      LOADER     ]
    //==================
class Loader {
    constructor() {
        this.loadingQueue = 0;
        this.currentMessage = '';
        this.messageTimeout = null;
        this.loaderTimeout = null;
        this.elements = {};
        this.initialize();
    }
    
    initialize() {
        let e = {
            loader: document.querySelector(".loading"),                       
            feedback: document.querySelector("#loadFeedback"),   
        }
        
        this.elements = e;
    }
    
    load() {   
        this.loadingQueue++;
        if (this.loadingQueue === 1) {
            clearTimeout(this.loaderTimeout);
            this.elements.loader.style.display = 'flex';
            this.elements.loader.style.opacity = '1';
            this.elements.loader.style.transition = 'none';    
            
            setTimeout(() => {
                this.elements.loader.style.transition = 'opacity 300ms ease-out';
            }, 10);
        }
    }
    
    loaded(visibleTime = 1000, fadeOutTime = 400) {
        if (this.loadingQueue > 0) {
            this.loadingQueue--; 
        } 
        
        if (this.loadingQueue === 0) {
            clearTimeout(this.messageTimeout);   
            clearTimeout(this.loaderTimeout);
            
            // Wait for visibleTime before starting fade out
            this.loaderTimeout = setTimeout(() => {
                this.elements.loader.style.transition = `opacity ${fadeOutTime}ms ease-in`;
                this.elements.loader.style.opacity = '0';
                
                // After fade out completes, hide completely
                setTimeout(() => {
                    if (this.loadingQueue === 0) {
                        this.elements.loader.style.display = 'none';
                        this.elements.feedback.textContent = "loading...";
                        this.currentMessage = '';
                    }
                }, fadeOutTime);
            }, visibleTime);
        }
    }
    
    feed(message, duration = 1000) {
        return new Promise(resolve => {            
            if (this.currentMessage === '') {
                this.elements.feedback.style.transition = 'none';
                this.elements.feedback.textContent = message;
                this.elements.feedback.style.opacity = '1';
                
                setTimeout(() => {
                    this.elements.feedback.style.transition = 'opacity 200ms ease';
                }, 10);
            } else {
                this.elements.feedback.style.opacity = '0';
                
                setTimeout(() => {
                    this.elements.feedback.textContent = message;
                    this.elements.feedback.style.opacity = '1';
                }, 200); 
            }
            
            this.currentMessage = message;
            clearTimeout(this.messageTimeout);
            
            if (duration > 0) {
                this.messageTimeout = setTimeout(() => {
                    this.elements.feedback.style.opacity = '0';
                    resolve();
                }, duration);
            } else {
                resolve();
            }
        });
    }
    
    // Optional: Force hide immediately
    forceHide() {
        this.loadingQueue = 0;
        clearTimeout(this.messageTimeout);
        clearTimeout(this.loaderTimeout);
        this.elements.loader.style.display = 'none';
        this.elements.loader.style.opacity = '0';
        this.elements.feedback.textContent = "loading...";
        this.currentMessage = '';
    }
}

class Alerts {
    constructor() {
        this.resolvePromise = null;
        this.elements = {};
        this.initialize();
    }
    
    getSel(s) {
        const el = document.querySelector(s);
        if (el) return el;
    }
    
    initialize() {
        const el = {
            dialogContainer: this.getSel("#dialogContainer"),
            alertDialog: this.getSel("#alertDialog"),
            confirmDialog: this.getSel("#confirmDialog"),
            alertMessage: this.getSel("#alertMessage"),
            confirmMessage: this.getSel("#confirmMessage"),
            alertOkBtn: this.getSel("#alertOkBtn"),
            cancelBtn: this.getSel("#cancelBtn"),
            confirmBtn: this.getSel("#confirmBtn"),
            timedToast: this.getSel(".timedToast"),
            timedAlert: this.getSel(".timedAlert")
        };

        Object.values(el).forEach((element, index) => {
            if (!element) {
                console.log(`Missing element at index ${index}`);
            }
        });

        this.elements = { ...el };
        this.addListeners();
    }

    addListeners() {
        this.elements.alertOkBtn.addEventListener('click', () => this.hideDialog());
        this.elements.cancelBtn.addEventListener('click', () => this.resolveDialog(false));
        this.elements.confirmBtn.addEventListener('click', () => this.resolveDialog(true));
    }

    showAlert(message = "Default alert message") {
        const el = this.elements;
        el.alertMessage.textContent = message;
        el.alertDialog.style.display = "flex";
        el.confirmDialog.style.display = "none";
        el.dialogContainer.style.display = "flex";
        el.dialogContainer.style.opacity = '1';
        setTimeout(() => {
            el.dialogContainer.style.transition = 'opacity 300ms ease-out';
        }, 10);
    }

    showConfirm(message = "Proceed?") {
        const el = this.elements;
        el.confirmMessage.textContent = message;
        el.alertDialog.style.display = "none";
        el.confirmDialog.style.display = "flex";
        el.dialogContainer.style.display = "flex";
        el.dialogContainer.style.opacity = '1';
        setTimeout(() => {
            el.dialogContainer.style.transition = 'opacity 300ms ease-out';
        }, 10);

        return new Promise((resolve) => {
            this.resolvePromise = resolve;
        }).finally(() => {
            this.hideDialog();
            this.resolvePromise = null;
        });
    }

    hideDialog() {
        const el = this.elements;
        el.dialogContainer.style.transition = 'opacity 400ms ease-in';
        el.dialogContainer.style.opacity = '0';
        setTimeout(() => {
            el.dialogContainer.style.display = "none";
            el.alertDialog.style.display = "none";
            el.confirmDialog.style.display = "none";
        }, 500);
    }

    resolveDialog(result) {
        if (this.resolvePromise) {
            this.resolvePromise(result);
        }
        this.hideDialog();
    }
    
    showToast(msg, request) {
        if(!msg || !request) return;
        let toast;
        if (request === "toast") {
           toast = this.elements.timedToast;            
        } else {
           toast = this.elements.timedAlert;
        }
        

        toast.textContent = msg;
        toast.style.display = "block";
         
        requestAnimationFrame(() => {
        toast.classList.add('active'); 
        });

        if (this.toastTimeout)     clearTimeout(this.toastTimeout);

        this.toastTimeout = setTimeout(() => {
          toast.classList.remove('active');
          setTimeout(() => {
            toast.style.display = "none"; 
          }, 2000); 
        }, 3000);
    }        
}


let loader;
let load;
let feed;
let loaded;


let alerts;
let showAlert;
let showConfirm;
let toast;
let notice;

function updateAlertAndLoader() {
    loader = new Loader();
    load = () => loader.load();
    feed = (message) => loader.feed(message, 1000);
    loaded = (time=1000) => {
       setTimeout(() => {
        loader.loaded(time, 500);
       }, 1000); 
    } 
    

    alerts = new Alerts();
    showAlert = (message = null) => alerts.showAlert(message);
    showConfirm = (message = null) => alerts.showConfirm(message);
    toast = (message) => alerts.showToast(message, "toast");
    notice = (message) => alerts.showToast(message, "alert");
    
    
}
