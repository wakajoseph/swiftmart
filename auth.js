class AuthManager {
  constructor({ loginUrl, refreshUrl }) {
    this.loginUrl = loginUrl;
    this.refreshUrl = refreshUrl;
    this.refreshTimer = null;
    this.connectOnline = false;
    
  }

  // Decode JWT to get expiry
  decodeJwt(token) {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  }

  // Schedule token refresh before it expires
  scheduleRefresh() {
        
    const refreshIn = 14 * 60 * 1000; //14m
    this.connectOnline = true;
    clearTimeout(this.refreshTimer);
    this.refreshTimer = setTimeout(() => this.refreshToken(), refreshIn);
  }

  // Login manually (force login)
  async login(credentials) {
    const res = await fetch(this.loginUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(credentials),
    });

    if (!res.ok) throw new Error('Login failed');

    const data = await res.json();
    this.setAccessToken();        
    return true;
  }

  // Set access token and schedule refresh
  setAccessToken() {        
    this.scheduleRefresh();    
    swift.isLogged = true;
    this.connectUser();
  }
  
  async connectUser() {
    if (!this.connectOnline) return;
    await connectWebSocket();
    this.connectOnline = false;
  }

  // Forcefully refresh access token
  async refreshToken() {
    try {
      const res = await fetch(this.refreshUrl, {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
       let e = await res.json().catch(()=> ({}));
       throw new Error(e);
      }
              
       const data = await res.json();
       
       if(data.message) {
         this.setAccessToken();
         this.updateAccountStatus(true);
         return true;  
       } 
        this.updateAccountStatus();
        return false;
                   
    } catch (err) {
      this.clear();
      this.updateAccountStatus();
      throw new Error(err);      
    }
  }

  // Get token for API calls

  // Call secured API
  async fetchWithAuth(url, options = {}) {
    const headers = {
      ...(options.headers || {}),
    };

    let res = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });

    if (res.status === 401) {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        return this.fetchWithAuth(url, options); // retry
      }
    }

    return res;
  }

  // Logout (clears token + optionally call logout endpoint)
  async logout(endpoint = null) {
    this.clear();
    if (endpoint) {
      await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
      });
    }
  }

  clear() {
    
    clearTimeout(this.refreshTimer);
  }
  
  updateAccountStatus(status=null) {
    let isLogged = document.querySelectorAll(".isLogged");
    let isGuest = document.querySelectorAll(".isGuest");
    
    if(status) {
      isLogged.forEach(s => {
         s.classList.add('active');                  
      });
      
      isGuest.forEach(s => {
         s.classList.remove('active')
      });
      
        
    } else {
      isLogged.forEach(s => {
         s.classList.remove('active');                  
      });
      
      isGuest.forEach(s => {
         s.classList.add('active')
      });
         authFormsUi.redirectLogin();        
    }
  }
    
}


// On login page


// For API requests

///////* /* ❤️❤️❤️❤️❤️❤️❤️❤️✝️✝️ */ */


class AuthFormsUI {
  constructor() {
    // DOM Elements
    this.elements = {
      loginTab: document.getElementById('auth-login-tab'),
      signupTab: document.getElementById('auth-signup-tab'),
      loginForm: document.getElementById('auth-login-form'),
      signupForm: document.getElementById('auth-signup-form'),
      showSignup: document.getElementById('auth-show-signup'),
      showLogin: document.getElementById('auth-show-login'),
      signupPassword: document.getElementById('auth-signup-password'),
      passwordStrength: document.querySelector('.auth__password-strength'),
      
      //external buttons 
      loginPrompt: document.querySelector(".login-prompt"),
      redirectAuth: document.querySelector(".redirectAuth"),
    };

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupPasswordToggles();
  }

  setupEventListeners() {
    // Tab switching
    this.elements.loginTab.addEventListener('click', () => this.switchForm(true));
    this.elements.signupTab.addEventListener('click', () => this.switchForm(false));
    this.elements.showSignup.addEventListener('click', (e) => {
      e.preventDefault();
      this.switchForm(false);
    });
    this.elements.showLogin.addEventListener('click', (e) => {
      e.preventDefault();
      this.switchForm(true);
    });

    // Form submissions
    this.elements.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    this.elements.signupForm.addEventListener('submit', (e) => this.handleSignup(e));

    //redirecting to forms from external buttons
    
this.elements.loginPrompt.addEventListener('click', () => this.redirectLogin());

this.elements.redirectAuth.addEventListener('click', () => this.redirectSignup());

    // Social logins
    document.querySelector(".auth__social-btn--google").addEventListener('click', () => this.handleSocialLogin('google'));
    document.querySelector(".auth__social-btn--apple").addEventListener('click', () => this.handleSocialLogin('apple'));

    // Password strength
    if (this.elements.signupPassword) {
      this.elements.signupPassword.addEventListener('input', () => this.checkPasswordStrength());
    }
  }

  setupPasswordToggles() {
    document.querySelectorAll('.auth__toggle-password').forEach(icon => {
      icon.addEventListener('click', (e) => {
        const targetId = e.currentTarget.getAttribute('data-target');
        const passwordInput = document.getElementById(targetId);
        this.togglePasswordVisibility(passwordInput, e.currentTarget);
      });
    });
  }

  switchForm(showLogin) {
    // Toggle active tab
    this.elements.loginTab.classList.toggle('auth__tab--active', showLogin);
    this.elements.signupTab.classList.toggle('auth__tab--active', !showLogin);
    
    // Toggle active form
    this.elements.loginForm.classList.toggle('auth__form--active', showLogin);
    this.elements.signupForm.classList.toggle('auth__form--active', !showLogin);
  }

  togglePasswordVisibility(inputElement, iconElement) {
    const isPassword = inputElement.type === 'password';
    inputElement.type = isPassword ? 'text' : 'password';
    iconElement.classList.toggle('fa-eye-slash', !isPassword);
    iconElement.classList.toggle('fa-eye', isPassword);
  }

  checkPasswordStrength() {
    const password = this.elements.signupPassword.value;
    let strength = 0;
    
    if (password.length > 0) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) strength++;
    
    // Update UI
    this.elements.passwordStrength.className = 'auth__password-strength';
    
    if (strength > 0) {
      const strengthClass = 
        strength === 1 ? 'auth__password-strength--weak' :
        strength === 2 ? 'auth__password-strength--medium' :
        'auth__password-strength--strong';
      
      this.elements.passwordStrength.classList.add(strengthClass);
      
      // Update text
      const strengthText = this.elements.passwordStrength.querySelector('.auth__strength-text');
      strengthText.textContent = 
        strength === 1 ? 'Weak' :
        strength === 2 ? 'Medium' : 'Strong';
    }
  }

  validateForm(formId) {
    let isValid = true;
    const form = document.getElementById(formId);
    
    form.querySelectorAll('[required]').forEach(field => {
      const group = field.closest('.auth__form-group');
      if (!field.value) {
        group.classList.add('auth__form-group--error');
        isValid = false;
      } else {
        group.classList.remove('auth__form-group--error');
      }
    });

    // Special validation for terms checkbox
    if (formId === 'auth-signup-form') {
      const termsGroup = document.getElementById('auth-terms').closest('.auth__form-group');
      if (!document.getElementById('auth-terms').checked) {
        termsGroup.classList.add('auth__form-group--error');
        isValid = false;
      } else {
        termsGroup.classList.remove('auth__form-group--error');
      }
    }

    return isValid;
  }

  async handleLogin(e) {
    e.preventDefault();
    
    if (this.validateForm('auth-login-form')) {
      const formData = {
        identifier: document.getElementById('auth-login-email').value,
        password: document.getElementById('auth-login-password').value,
        remember_me: document.querySelector("#auth-remember-me").checked,
      };
      
     let result = await auth.login(formData);
      if (result) {
       
       document.getElementById('auth-login-email').value = "";
       document.getElementById('auth-login-password').value = "";
       alert("Welcome Back");
       navigateBackword();               
      }
     
    }
  }

  handleSignup(e) {
    e.preventDefault();
    
    if (this.validateForm('auth-signup-form')) {
      const formData = {
        name: document.getElementById('auth-signup-name').value,
        email: document.getElementById('auth-signup-email').value,
        phone: document.getElementById('auth-signup-phone').value,
        password: document.getElementById('auth-signup-password').value
      };
      console.log('Signup submitted:', formData);
      
      alert("success");
      
      Object.keys(formData).forEach(key => {
          const element = document.getElementById(`auth-signup-${key}`);
          if (element) element.value = "";
    });
    this.checkPasswordStrength();
     
    }
  }

  handleSocialLogin(provider) {
    
    
     if (provider === 'google') this.initGoogleAuth();
     if (provider === 'apple') this.initAppleAuth();
  }
  
  initGoogleAuth() {
     alert("this feature is coming soon") 
  }
  
  initAppleAuth() {
    alert("this feature is coming soon")   
  }

  redirectLogin() {
    this.switchForm(true);
    navigateTo("auth");
  }
  
  redirectSignup() {
    this.switchForm(false);
    navigateTo("auth");  
  }   
}

// Initialize when DOM is loaded
let auth;
let authFormsUi;

function startAuthUtils() {
    auth = new AuthManager({
      loginUrl: loginBaseUrl,
      refreshUrl: refreshBaseUrl,
    });    
    authFormsUi = new AuthFormsUI()      
}


async function silentLogUser() {
   try {
       let response = await auth.refreshToken();
       if (response) {
          swift.isLogged = true;                 
           fetchUserData(); 
           loadMoreUserAssets();          
       } else {
          swift.isLogged = false;                             
       }              
   } catch (error) {
        console.log(error)
   }
}

      
