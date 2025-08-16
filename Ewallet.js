class EpayModel {
    constructor(id) {
        // Core properties
        this.userId = id;
        this.sessionKey = `epay_session_${id}`;
        this.userAccount = null;
        this.userData = {};
        this.currentInput = [];
        this.accessToken = null;      
        this.defaultPhone = null;
        this.maskedPhone = null;
        this.state = {
          isProcessing: false,
          activeForm: null,
          formData: {
            phoneNumber: null,
            amount: null,
            useDefaultNumber: true
          }
        }
        
        // State management
        this.isRegistering = false;
        this.newPin = null;
        this.pinTimeout = null;
        this.registrationStates = {
            NONE: 0,
            PHONE_ENTERED: 1,
            FIRST_PIN_SET: 2,
            CONFIRMING_PIN: 3,
            COMPLETE: 4
        };
        this.currentState = this.registrationStates.NONE;
        
        // UI elements cache
        this.elements = {};
        
        // Initialize
        this.initialize();
        this.restoreSession();
        this.getUserAccount();
    }

    // ======================
    // CORE METHODS
    // ======================

    initialize() {
        this.cacheElements();
        this.addEventListeners();
    }

        cacheElements() {
        const elements = {
            authForms: document.querySelector(".auth-forms"),
            accountDashboard: document.querySelector(".epay-container"),
            newForm: document.querySelector("#newAccount-form"),
            epayForm: document.querySelector("#epayLog"),
            phoneNumber: document.querySelector("#phoneNumber"),
            countryCode: document.querySelector("#selectedCode"),
            registerError: document.querySelector(".new-number-error"),
            pinValidation: document.querySelector("#pinFeedback"),
            submitNew: document.querySelector("#submitNew"),
            dialPad: document.querySelector("#dialPad"),
            passwordBoxes: document.querySelectorAll(".password-dot"),
            backButton: document.querySelector(".back-btn"),
            balance: document.querySelector(".balance-amount"),
            depositBtn: document.getElementById('depositBtn'),
            refundBtn: document.getElementById('refundBtn'),
            accountName: document.querySelector(".user-name"),
            eNumber: document.querySelector(".epay-number"),
            transactions: document.querySelector(".transaction-list"),
            viewAllTransactionBtn: document.querySelector(".view-all"),
            couponsContainer: document.querySelector(".couponsEarned"),
            settings: document.querySelectorAll('.settings-action'),                      
            loaderPage: document.querySelector('#rotatingCircle'),
            loaderMsg: document.querySelector('#loadFeedback'),
            
            
            
            formsContainer: document.querySelector('#deposit-withdraw-refund-forms'),
            
            forms: document.querySelectorAll('.fm'),
            formTitle: document.querySelector('#form-title'),            
            useDefaultNumber: document.getElementById('useDefaultNumber'),
      phoneNumberField: document.querySelector('.phoneNumber'),
      phoneError: document.getElementById('phoneError'),
      defaultNumberDisplay: document.getElementById('defaultNumberDisplay'),
      amountField: document.getElementById('amount'),
      amountError: document.getElementById('amountError'),
      agreeTerms: document.getElementById('agreeTerms'),
      termsError: document.getElementById('termsError'),
      submitButton: document.getElementById('depositButton'),
      buttonText: document.getElementById('buttonText'),
      spinner: document.getElementById('spinner'),
      depositForm: document.getElementById('depositForm'),
            
      // Response elements
      responseContainer: document.getElementById('responseContainer'),
      successResponse: document.getElementById('successResponse'),
      successTitle: document.getElementById('success-title'),
      successMessage: document.getElementById('success-message'),
      successButton: document.getElementById('successButton'),
      failedResponse: document.getElementById('failedResponse'),
      failedTitle: document.getElementById('failed-title'),
      failedMessage: document.getElementById('failed-message'),
      retryButton: document.getElementById('retryButton'),
      cancelFailedTransaction: document.getElementById('cancelFailedTransaction'),
      navigateBack: document.querySelector(".navigateBack"),
 
        };

        // Validate critical elements
        ['authForms', 'accountDashboard', 'newForm', 'epayForm'].forEach(key => {
            if (!elements[key]) throw new Error(`Critical element missing: ${key}`);
        });

        this.elements = elements;
    }
    
    
    renderForm(fm, message) {
        let e = this.elements;
        e.forms.forEach(f => f.style.display = "none");
        fm.style.display = "flex";
        e.formTitle.textContent = message;
        
        e.formsContainer.style.display = "block";
        setTimeout(()=> e.formsContainer.classList.add('active'),50);
        
    }
    
    hideForms() {
        let e = this.elements;
        e.forms.forEach(f => f.style.display = "none");        
        e.formTitle.textContent = "";
        
e.formsContainer.style.display = "none";        e.formsContainer.classList.remove('active');
    }
    
    

    addEventListeners() {
        const safeAddListener = (element, event, handler) => {
            element?.addEventListener(event, handler);
        };

        // Form events
        safeAddListener(this.elements.newForm, 'submit', (e) => this.handleNewAccountSubmit(e));
        safeAddListener(this.elements.epayForm, 'submit', (e) => this.handlePasswordSubmit(e));
        
        // Button events
        safeAddListener(this.elements.backButton, 'click', () => this.removeNumber());
        safeAddListener(this.elements.depositBtn, 'click', () => this.handleDeposit());
        safeAddListener(this.elements.refundBtn, 'click', () => this.handleRefund());
        
        // Dial pad events
        this.elements.dialPad?.querySelectorAll(".dial-btn").forEach(btn => {
            btn.addEventListener('click', (e) => this.appendNumber(e.currentTarget.dataset.id));
        });
        
        // Settings events
        this.elements.settings?.forEach(link => {
            link.addEventListener('click', (e) => this.handleSettingsClick(e));
        });
     
        const { 
      useDefaultNumber, phoneNumberField, amountField, agreeTerms,
      depositForm, retryButton, successButton, cancelFailedTransaction,
      navigateBack
    } = this.elements;
    
    // Form field listeners
    useDefaultNumber.addEventListener('change', (e) => {
      this.togglePhoneField(e.target.checked);
    });
    
    phoneNumberField.addEventListener('input', (e) => {
      this.validatePhoneNumber(e.target.value);
    });
    
    amountField.addEventListener('input', (e) => {
      this.validateAmount(e.target.value);
    });
    
    // Form submission
    depositForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
    
    // Response handlers
    successButton.addEventListener('click', () => this.closeResponse());
    retryButton.addEventListener('click', () => this.closeResponse(true));
    cancelFailedTransaction.addEventListener('click', () => this.closeResponse());
    navigateBack.addEventListener('click', () => this.hideForms());
    }

    // ======================
    // STATE MANAGEMENT
    // ======================

    setTemporaryPin(pin) {
        this.clearPinTimer();
        this.newPin = pin;
        this.pinTimeout = setTimeout(() => {
            this.newPin = null;
            console.log('PIN automatically cleared');
        }, 5 * 60 * 1000); // 5 minute timeout
    }

    clearPinTimer() {
        if (this.pinTimeout) {
            clearTimeout(this.pinTimeout);
            this.pinTimeout = null;
        }
    }

    advanceRegistrationState() {
        if (this.currentState < this.registrationStates.COMPLETE) {
            this.currentState++;
        }
    }

    resetRegistrationState() {
        this.currentState = this.registrationStates.NONE;
        this.newPin = null;
        this.clearPinTimer();
        this.resetInput();
    }

    // ======================
    // AUTHENTICATION FLOW
    // ======================

    async getUserAccount() {
        try {
        
            load();
            await new Promise(resolve => setTimeout(resolve, 50));
            feed("Getting address data...", 2099);
            const response = await fetch("http://localhost:8000/api/v1/user/wallet/status", {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0Iiwicm9sZSI6ImN1c3RvbWVyIiwiYWNjZXNzIjoicmVndWxhciIsImlhdCI6MTc1NDk4MTg3NiwiZXhwIjoxNzU0OTgyNzc2fQ.o3XgxrwNNCZMWdRDoVV0IiaoKqmXd8GfaA-XpgMfKDU` 
                },                
                credentials: 'include',
                
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.detail || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data === null) {
                this.userAccount = null;
                this.renderAuthForms();
                showAlert("Please create a payment account - it's free and only requires your number");
                return;
            }

            if (data.status !== "active") {
                throw new Error(`Wallet account is ${data.status}. Please contact support.`);
            }

            this.userAccount = { ...data };
            this.renderAuthForms();
            this.saveSession();
            
        } catch (error) {
            if (error.message.includes("Wallet not found")) {
                if (await showConfirm("You currently don't have a payment account! Would you like to create one?")) {
                    this.userAccount = null;
                    this.isRegistering = true;
                    this.renderAuthForms();
                } else {
                    showAlert("You cancelled the process and your connection has been closed successfully for your data security. Thank you!");
                     this.offline("connection closed!");                                        
                }
            } else {
                await feed("something went wrong!", 3000);
                this.offline("connection error!");
            }
        } finally {
            loaded();
        }
    }
    
    
    offline(status=null) {
            let container = document.querySelector(".offline-state");
            let feedback = document.querySelector(".msg");
            if (!status) {
                feedback.innerText = "";
                container.style.display = "none";
            } else {
               feedback.innerText = status;
                container.style.display = "flex";
            }
    }


    async handleNewAccountSubmit(e) {
        e.preventDefault();
        
        try {
            const rawPhone = this.elements.phoneNumber?.value?.trim();
            const phoneNumber = this.sanitizePhoneNumber(rawPhone);
            const countryCode = this.elements.countryCode?.value;

            this.userAccount = {       
                phone: phoneNumber,
                countryCode: countryCode
            };
            
            this.advanceRegistrationState();
            this.renderAuthForms();
            
        } catch (error) {
            this.handleError(error, 'handleNewAccountSubmit');
        }
    }

    async handlePasswordSubmit(e) {
        e.preventDefault();
        
        
        try {
            if (this.currentInput.length < 6) {
                throw new Error("Please enter a 6-digit password");
            }

            const password = this.currentInput.join("");
            
            if (this.isRegistering && this.newPin) {
                this.userAccount.pin = this.newPin;
                await this.registerNewUser(this.userAccount);
                this.isRegistering = false;
                this.resetRegistrationState();
            }
            
            load();
            await feed("logging in...", 2000);
            const response = await this.getUserAccountData(this.userId, password);
            
            if (!response.status) {
                throw new Error("Login failed. Please try again.");
            }
            
            this.resetInput();
            this.updateUi(response);
            this.showDashboard();
            this.saveSession();
            await feed("logged in successfully", 2000);
            document.querySelector(".new-number-error").textContent = "Enter Valid Number";
            
        } catch (error) {
            const errMsg = error.message.toLowerCase();
            
            if (errMsg.includes("incorrect")) {
                this.setPinValidation(errMsg);
                this.resetInput();
            } else {
document.querySelector(".new-number-error").textContent = errMsg;
                showAlert(errMsg);                                                                                                                                               this.resetRegistrationState();
                this.userAccount = null;
                this.renderAuthForms();            
            }
        } finally {
            loaded();
        }
    }

    // ======================
    // PIN ENTRY HANDLING
    // ======================

    appendNumber(num) {
        if (this.currentInput.length >= 6) return;
        
        this.clearPinValidation();
        this.currentInput.push(num);
        this.updatePasswordDisplay();
        
        if (this.currentInput.length === 6) {
            this.handleCompletePinEntry();
        }
    }
    
    handleCompletePinEntry() {
        const enteredPin = this.currentInput.join("");
        
        if (this.isRegistering && !this.newPin) {
            this.setTemporaryPin(enteredPin);
            this.resetInput();
            this.setPinValidation("Confirm your PIN");
            return;
        }
        
        if (this.isRegistering && this.newPin) {
            this.handlePinConfirmation(enteredPin);
            return;
        }
        
        this.triggerSubmit();
    }
    
    handlePinConfirmation(enteredPin) {
        if (enteredPin !== this.newPin) {
            this.setPinValidation("PINs don't match. Please try again.");
            this.resetRegistrationState();
            return;
        }
        
        this.triggerSubmit();
    }

    removeNumber() {
        if (this.currentInput.length > 0) {
            this.currentInput.pop();
            this.updatePasswordDisplay();
            this.clearPinValidation();
        }
    }

    // ======================
    // API COMMUNICATION
    // ======================

    async registerNewUser(userData) {
        if (!userData) {
            throw new Error("User data is required");
        }

        try {
        if (await showConfirm("By proceeding you confirm that you agreed to the terms and conditions of this page. Register?")) {
            
        
            load();
            await feed("please wait...", 3000);           
            const response = await fetch("http://localhost:8000/api/v1/wallet/register", {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0Iiwicm9sZSI6ImN1c3RvbWVyIiwiYWNjZXNzIjoicmVndWxhciIsImlhdCI6MTc1NDk4MTg3NiwiZXhwIjoxNzU0OTgyNzc2fQ.o3XgxrwNNCZMWdRDoVV0IiaoKqmXd8GfaA-XpgMfKDU`},
                credentials: 'include',
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || "Registration failed");
            }

            const data = await response.json();
            await feed(data?.message || "Registration successful!", 'success', 2000);
            return data;
            } else {
                throw new Error("cancelled ");
            }
        } catch (error) {
           throw error 
        } finally {
            loaded()
        }
    }

    async getUserAccountData(id, password) {
        try {
            this.setLoading(true);
            const response = await fetch("http://localhost:8000/user/wallet/login", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: id, pin: password })
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || "Login failed");
            }
            
            const data = await response.json();
            this.validateApiResponse(data, {
                status: 'boolean',
                data: 'object'
            });
            
            return data;
            
        } catch (error) {
            throw this.handleError(error, 'getUserAccountData');
        } finally {
            this.setLoading(false);
        }
    }

    // ======================
    // UI UPDATES
    // ======================

    renderAuthForms() {
        if (!this.userAccount) {
            this.showElement(this.elements.newForm);
            this.hideElement(this.elements.epayForm);
        } else {
            this.hideElement(this.elements.newForm);
            this.showElement(this.elements.epayForm);
            
            if (this.elements.pinValidation) {
                this.elements.pinValidation.textContent = this.isRegistering 
                    ? "Create a new payment Password" 
                    : "Enter your PIN to login";
            }
        }
    }

    showDashboard() {
        this.hideElement(this.elements.authForms);
        this.showElement(this.elements.accountDashboard);
    }

    async updateUi(data) {
        if (!this.validateApiResponse(data, { data: 'object' })) return;
        
        try {
            // Update balance
            if (data.data?.account) {
                this.elements.balance.textContent = 
                    `${data.data.account.currency} ${data.data.account.balance.toLocaleString()}`;
            }
           this.accessToken = data["access_token"]; 
           console.log(this.accessToken);
            // Update user info
            if (data.data?.phone) {
            
            let phone = this.formatKenyanNumber(data.data.phone);
                this.elements.eNumber.textContent = phone;
                this.defaultPhone = phone;
          this.maskedPhone = this.maskPhone(phone);
          this.elements.defaultNumberDisplay.textContent = this.maskedPhone;
          this.state.formData.phoneNumber = phone;      
            }
            
            if (data.data?.userName) {
                this.updateElementText(this.elements.accountName, data.data.userName);
            }
            
            // Update transactions and coupons
            this.renderTransactions(data.data.transactions || []);
            this.renderCoupons(data.data.coupons || []);
            
        } catch (error) {
            this.handleError(error, 'updateUi');
        }
    }
    
     // Mask phone number for display
  maskPhone(phone) {
    if (!phone) return '';
    return phone.replace(/(\d{3})\d{6}(\d{3})/, '$1******$2');
  }

    renderTransactions(transactions) {
        if (!this.elements.transactions) return;
        
        this.elements.transactions.innerHTML = transactions.length 
            ? transactions.map(t => this.createTransactionHtml(t)).join('')
            : `<div class="no-items">No Recent Transactions</div>`;
    }

    renderCoupons(coupons) {
        if (!this.elements.couponsContainer) return;
        
        this.elements.couponsContainer.innerHTML = coupons.length
            ? coupons.map(c => this.createCouponHtml(c)).join('')
            : `<div class="no-coupons">No active coupons</div>`;
    }

    // ======================
    // UTILITY METHODS
    // ======================

    validateApiResponse(response, schema) {
        try {
            for (const key in schema) {
                if (!(key in response)) {
                    throw new Error(`Missing required field: ${key}`);
                }
                
                const expectedType = schema[key];
                const actualValue = response[key];
                
                if (expectedType === 'array' && !Array.isArray(actualValue)) {
                    throw new Error(`Expected array for field: ${key}`);
                }
                
                if (expectedType === 'object' && (actualValue === null || typeof actualValue !== 'object')) {
                    throw new Error(`Expected object for field: ${key}`);
                }
            }
            return true;
        } catch (error) {
            this.handleError(error, 'response validation');
            return false;
        }
    }

    sanitizePhoneNumber(phone) {
        if (!phone) throw new Error("Phone number is required");
        
        const digits = phone.replace(/\D/g, '');
        const countryCode = this.elements.countryCode?.value;
        const minLength = countryCode === '+1' ? 10 : 9;
        
        if (digits.length < minLength) {
            throw new Error(`Phone number must be at least ${minLength} digits`);
        }
        
        return digits;
    }

    // ======================
    // SESSION MANAGEMENT
    // ======================

    saveSession() {
        if (this.userAccount) {
            localStorage.setItem(this.sessionKey, JSON.stringify({
                lastActive: new Date().toISOString(),
                phone: this.userAccount.phone,
                userId: this.userId
            }));
        }
    }

    clearSession() {
        localStorage.removeItem(this.sessionKey);
    }

    restoreSession() {
        try {
            const session = JSON.parse(localStorage.getItem(this.sessionKey));
            if (session && session.userId === this.userId && this.elements.phoneNumber) {
                this.elements.phoneNumber.value = session.phone || '';
            }
        } catch (e) {
            console.warn("Failed to restore session:", e);
        }
    }

    // ======================
    // ==|  UI HELPERS |=====
    // ======================
    // ======================

    setLoading(state, element = null) {
        const target = element || this.elements.loader;
        if (target) target.style.display = state ? 'block' : 'none';
        
        // Disable interactive elements during loading
        [this.elements.submitNew, this.elements.depositBtn, this.elements.refundBtn].forEach(btn => {
            if (btn) btn.disabled = state;
        });
    }
    

    handleError(error, context = '') {
        const message = error.message || 'An unexpected error occurred';
        
        
        return error; 
    }

    

    updatePasswordDisplay() {
        this.elements.passwordBoxes?.forEach((box, index) => {
            box.classList.toggle("filled", index < this.currentInput.length);
        });
    }

    resetInput() {
        this.currentInput = [];
        this.updatePasswordDisplay();
    }

    clearPinValidation() {
        if (this.elements.pinValidation) {
        this.elements.pinValidation.textContent = "";
        }
    }

    setPinValidation(message) {
        if (this.elements.pinValidation) {
            this.elements.pinValidation.textContent = message;
        }
    }

    triggerSubmit() {
        if (this.elements.epayForm) {
            const event = new Event('submit', { bubbles: true, cancelable: true });
            this.elements.epayForm.dispatchEvent(event);
            this.clearPinValidation();
        }
    }

// ======================
// UI ELEMENT HELPERS
// ======================

showElement(element) {
    if (element) {
        element.style.display = 'flex';
    }
}

hideElement(element) {
    if (element) {
        element.style.display = 'none';
    }
}

updateElementText(element, text) {
    if (element && text !== undefined) {
        element.textContent = text;
    }
}

// ======================
// TRANSACTION/Coupon UI HELPERS
// ======================

createTransactionHtml(transaction) {
    const typeClasses = {
        deposit: ['deposit', 'fa-arrow-down', '+'],
        purchase: ['payment', 'fa-shopping-cart', '-'],
        refund: ['refund', 'fa-undo', '']
    };
    
    const classes = typeClasses[transaction.type] || ['payment', 'fa-exchange-alt', ''];
    
    return `
        <li class="transaction-item">
            <div class="transaction-info">
                <div class="transaction-icon ${classes[0]}">
                    <i class="fas ${classes[1]}"></i>
                </div>
                <div class="transaction-details">
                    <h4>${transaction.tag || 'Transaction'}</h4>
                    <p>${transaction.date || ''}</p>
                </div>
            </div>
            <div class="transaction-amount ${classes[0]}">${classes[2]}${(transaction.amount || 0).toLocaleString()}</div>
        </li>
    `;
}

createCouponHtml(coupon) {
    return `
        <div class="coupon-card">
            <div class="coupon-details">
                <h4>${coupon.name || 'Coupon'}</h4>
                <p>Expires: ${coupon.expires ? new Date(coupon.expires).toLocaleDateString() : 'N/A'}</p>
            </div>
            <div class="coupon-code">${coupon.code || ''}</div>
        </div>
    `;
}

// ======================
// ACTION HANDLERS
// ======================

handleDeposit() {
  this.renderForm(this.elements.depositForm, "E-Pay Top-up");
}

handleRefund() {
    showAlert("Refund request form would open here");
}

    handleSettingsClick(e) {
        e.preventDefault();
        const settingName = e.currentTarget.closest('.settings-item')?.querySelector('.settings-name')?.textContent;
        if (settingName) {
            showAlert(`${settingName} settings would open here`);
        }
    }


    //FORM
  togglePhoneField(useDefault) {
    const { phoneNumberField } = this.elements;
    phoneNumberField.disabled = useDefault;
    
    if (useDefault) {
      phoneNumberField.value = this.defaultPhone;
      this.state.formData.phoneNumber = this.defaultPhone;
    } else {
        phoneNumberField.value = "";
    }
    
    this.state.formData.useDefaultNumber = useDefault;
  }
  
  // Validate phone number
  validatePhoneNumber(phone) {
    const { phoneError } = this.elements;
    const isValid = this.isValidPhone(phone);
    
    if (!isValid && phone) {
      phoneError.style.display = 'block';
      this.elements.phoneNumberField.classList.add('input-error');
    } else {
      phoneError.style.display = 'none';
      this.elements.phoneNumberField.classList.remove('input-error');
      this.state.formData.phoneNumber = phone;
    }
    
    return isValid;
  }
  
  // Phone validation helper
  isValidPhone(number) {
    if (!number) return false;
    const pattern = /^(07|01)[0-9]{8}$|^254(7|1)[0-9]{8}$/;
    return pattern.test(number);
  }
  
  // Validate amount
  validateAmount(amount) {
    const { amountError } = this.elements;
    const numAmount = parseFloat(amount);
    const isValid = !isNaN(numAmount) && numAmount >= 10;
    
    if (!isValid && amount) {
      amountError.style.display = 'block';
      this.elements.amountField.classList.add('input-error');
    } else {
      amountError.style.display = 'none';
      this.elements.amountField.classList.remove('input-error');
      this.state.formData.amount = isValid ? numAmount : null;
    }
    
    return isValid;
  }
  
  // Validate terms agreement
  validateTerms(agreed) {
    const { termsError } = this.elements;
    
    if (!agreed) {
      termsError.style.display = 'block';
    } else {
      termsError.style.display = 'none';
    }
    
    return agreed;
  }
  
  // Form submission handler
  async handleSubmit() {
    if (this.state.isProcessing) return;
    
    const { phoneNumber, amount, useDefaultNumber } = this.state.formData;
    const agreed = this.elements.agreeTerms.checked;
    
    // Validate all fields
    const isPhoneValid = useDefaultNumber || this.validatePhoneNumber(phoneNumber);
    const isAmountValid = this.validateAmount(amount);
    const isTermsValid = this.validateTerms(agreed);
    
    if (!isPhoneValid || !isAmountValid || !isTermsValid) {
      return;
    }
    
    let phone = useDefaultNumber ? this.defaultPhone : phoneNumber;
    let fomartedNo = this.formatKenyanNumber(phone);
    
    // Prepare transaction data
    const transactionData = {
      userId: this.userId,
      phoneNumber: fomartedNo,
      amount,
      timestamp: new Date().toISOString()
    };
    
    // Start processing
    this.setState({ isProcessing: true });
    this.showLoading(true);
    
    try {
      // Simulate API call
      const response = await this.simulateb2c(transactionData);
      
      if (response.success) {
        this.showSuccessResponse(response.message);
        this.resetForm();
      } else {
        this.showErrorResponse(response.message);
      }
    } catch (error) {
      this.showErrorResponse(error.message || 'An unexpected error occurred');
    } finally {
      this.setState({ isProcessing: false });
      this.showLoading(false);
    }
  }
  
  // Simulate API call (replace with actual API call in production)
  async simulateb2c(data) {
    try {
      let req = {
          "phoneNumber": data.phoneNumber,
          "amount": data.amount
      }
      
      let response = await fetch("http://localhost:8000/user/wallet/transaction/c2b", {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`
        },
        body: JSON.stringify(req)
      });
      
      if (!response.ok) {
        let e = await response.json().catch(() => ({}));
        throw new Error(e); 
        console.log(e); 
      }
      
      let dt = await response.json();
      console.log(JSON.stringify(dt));
      return {
        success: true,
        message: dt.message
      }
     
    } catch(error) {
       return {
        success: false,
        message: error || error.detail,
      }
      
    } 
    
    
  }
  
  // Show loading state
  showLoading(show) {
    const { buttonText, spinner } = this.elements;
    
    if (show) {
      buttonText.innerText = 'Please Wait';
      spinner.classList.add('active');
      this.elements.submitButton.disabled = true;
    } else {
      buttonText.innerText = 'Continue';
      spinner.classList.remove('active');
      this.elements.submitButton.disabled = false;
    }
  }
  
  // Show success response
  showSuccessResponse(message) {
    const { responseContainer, successResponse, successMessage } = this.elements;
    
    successMessage.textContent = message;
    responseContainer.style.display = 'flex';
    successResponse.classList.add('active');
  }
  
  // Show error response
  showErrorResponse(message) {
    const { responseContainer, failedResponse, failedMessage } = this.elements;
    
    failedMessage.textContent = message;
    console.log(JSON.stringify(message))
    responseContainer.style.display = 'flex';
    failedResponse.classList.add('active');
  }
  
  // Close response modal
  closeResponse(retry = false) {
    const { responseContainer, successResponse, failedResponse } = this.elements;
    
    successResponse.classList.remove('active');
    failedResponse.classList.remove('active');
    responseContainer.style.display = 'none';
    
    if (retry) {
      this.handleSubmit();
    }
  }
  
  // Handle back button
  handleBack() {
    // Implement navigation back logic
    console.log('Navigating back...');
  }
  
  // Reset form
  resetForm() {
    const { amountField, agreeTerms, useDefaultNumber } = this.elements;
    
    amountField.value = '';
    agreeTerms.checked = false;
    this.state.formData.amount = null;
  }
  
  // Update state
  setState(newState) {
    this.state = { ...this.state, ...newState };
  }
  
  formatKenyanNumber(input) {
      const digits = input.replace(/\D/g, '');

      if (digits.startsWith('0')) {
        return '254' + digits.slice(1);
      } else if (digits.startsWith('2540')) {
        return '254' + digits.slice(4);
      } else if (digits.startsWith('254')) {
        return digits.slice(0, 12);
      } else if (digits.startsWith('1') || digits.startsWith('7')) {
        return '254' + digits;
      }

      return null;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    try {
        
        
        
        let user = 4;                  
        new EpayModel(user); 
    } catch (error) {
        document.body.innerHTML = `
            <div class="error-container">
                <h2>Application Error</h2>
                <p>${error.message || 'Failed to initialize application'}</p>
                <button onclick="window.location.reload()">Refresh Page</button>
            </div>
        `;
        console.error('Initialization error:', error);
    }
 });   
   



