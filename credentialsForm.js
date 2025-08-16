function selector(sel) {
    response = document.querySelector(sel);
    if (response) {        
        return response;
    } else {
        alert(sel + ": not found");
        return;
    }
}



function targetPage() {
    console.log("starting...")
    const pages = ["storeSignup", "userSignup", "userLogin", "storeLogin"];
    const params = new URLSearchParams(window.location.search);
    const param = params.get('destination');

    if (!param) return;

    pages.forEach((pg) => {
        const element = document.querySelector(`.${pg}`);
        if (!element) return; // Skip if element not found
        if (pg === param) {
            element.classList.remove('hide');
        } else {
            element.classList.add('hide');
        }
    });
}

targetPage();
  
const selectors = [
  ".name", ".location", ".contact", ".email", ".account", ".password", ".confirm", ".checker",
  "#nameField", "#locationField", "#contactField", "#emailField", "#accountField", "#passwordField", "#confirmField", "#checkField"
];

const [
  nameMsg, locationMsg, contactMsg, emailMsg, accountMsg, passwordMsg, confirmMsg, checkerMsg,
  nameField, locationField, contactField, emailField, accountField, passwordField, confirmField, checkField
] = selectors.map(sel => document.querySelector(sel));

function isValidName(name) {
  return /^[a-zA-Z\s]{2,50}$/.test(name);
}

function isValidContact(contact) {
  return /^\d{7,15}$/.test(contact);
}

function isValidPassword(pwd) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!]).{8,}$/.test(pwd);
}

async function submitSeller(e) {
  e.preventDefault();
  let valid = true;

  // Validate Store Name
  const nameValue = nameField?.value.trim() || "";
  if (!isValidName(nameValue)) {
    nameMsg.innerText = "Enter a valid name (letters only, 2-50 chars)";
    valid = false;
  } else {
    nameMsg.innerText = "";
  }

  // Validate Location
  const locationValue = locationField?.value.trim() || "";
  if (locationValue.length < 3) {
    locationMsg.innerText = "Location must be at least 3 characters";
    valid = false;
  } else {
    locationMsg.innerText = "";
  }

  // Validate Contact
  const contactValue = contactField?.value.trim() || "";
  if (!isValidContact(contactValue)) {
    contactMsg.innerText = "Enter a valid contact number (7-15 digits)";
    valid = false;
  } else {
    contactMsg.innerText = "";
  }
  
  // Validate Email
  const emailValue = emailField?.value.trim() || "";
  if (emailValue.length < 10) {
    emailMsg.innerText = "Enter a valid email";
    valid = false;
  } else {
    emailMsg.innerText = "";
  }

  // Validate Account Name
  const accountValue = accountField?.value.trim() || "";
  if (accountValue.length < 3) {
    accountMsg.innerText = "Account name must be at least 3 characters";
    valid = false;
  } else {
    accountMsg.innerText = "";
  }

  // Validate Password
  const passwordValue = passwordField?.value.trim() || "";
  if (!isValidPassword(passwordValue)) {
    passwordMsg.innerText = "Password must be 8+ chars with uppercase, lowercase, number, and symbol";
    valid = false;
  } else {
    passwordMsg.innerText = "";
  }

  // Confirm Password
  const confirmValue = confirmField?.value.trim() || "";
  if (confirmValue !== passwordValue) {
    confirmMsg.innerText = "Passwords do not match";
    valid = false;
  } else {
    confirmMsg.innerText = "";
  }

  // Terms Checkbox
  if (!checkField?.checked) {
    checkerMsg.innerText = "You must agree to the terms";
    valid = false;
  } else {
    checkerMsg.innerText = "";
  }

  // Submit if valid
  if (valid) {
    const seller = {
      name: nameValue,
      password: passwordValue,
      location: locationValue,
      contact: contactValue,
      email: emailValue,
      verified: false,
      account_number: accountValue,            
      rating: 0
    };
    console.log(JSON.stringify(seller));
    enrollSeller(seller);
            
    
  }
}

async function enrollSeller(seller) {
    try {
        const response = await fetch('http://localhost:8000/seller/enroll', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(seller)
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        alert("You have been enrolled successfully awaiting for verification:", data);
    
    } catch (error) {
        console.log("Enrollment failed:", error.message);
        alert("something went wrong try again later. if you keep getting this error kindly contact us in support page");
       
    }
}

async function handleSellerLogin(event) {
    event.preventDefault();
    
    const form = document.getElementById('seller-login-form');
    const store = {
        email: form.querySelector('#storeMail').value.trim(),
        password: form.querySelector('#storePassword').value.trim()
    };
    
    try {
        const response = await fetch("http://localhost:8000/store/login", {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(store)
        });
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        localStorage.setItem('sellerLogin', JSON.stringify(data));
        openSellerDashboard(data); // Call the redirection here

    } catch(error) {
        console.error(error.message);
        alert(error.message);
    }
}

function openSellerDashboard(data) {
    window.location.href = "/sellerPage.html";
}


async function handleUserLogin(event) {
    event.preventDefault();
    
    const form = document.getElementById('user-login-form');
    const user = {};

    user['email'] = form.querySelector('#userEmail').value.trim();
    user['password'] = form.querySelector('#userPassword').value.trim();
    
 
  try {
    const response = await fetch("http://localhost:8000/user/info", {
      method: 'POST',  // Changed to POST since we're sending credentials
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: user.email,
        password: user.password
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();  // Don't forget 'await' here!
    
    // Store only non-sensitive data
    const userDataToStore = {
      user_id: data.user_info?.user_id,
      name: data.user_info?.name,
      email: data.user_info?.email
      // Add other non-sensitive fields as needed
    };
    alert(`${data.user_info?.name} Welcome Again!`);
    
    localStorage.setItem('user', JSON.stringify(data.user_info));
    
    return data;
    
  } catch (error) {
    console.error('Fetch error:', error);
    alert(`Login failed: ${error.message}`);
    throw error;  // Re-throw if you want calling code to handle it
  }



    
    
    // TODO: Send to backend using fetch()
}

async function submitUser(e) {
    e.preventDefault();
    
    const [firstName, lastName, phone, email, userPassword, confirm] = ["firstName", "lastName", "phoneNumber", "userEmail", "userPassword", "passwordConfirm"].map(id => document.getElementById(id).value.trim());
   
    if (!firstName || !lastName || !phone || !email || !userPassword || !confirm) {
        return;
    }
    
    if (userPassword !== confirm) {
        alert("passwords don't match");
        return;
    }
        
    
    fullName = `${firstName} ${lastName}`;
    
    user = {
      "name": fullName,
      "phone": phone,
      "email": email,
      "password": userPassword
    }
    
    console.log(JSON.stringify(user));
    try {
        let response = await fetch("http://localhost:8000/user/new", {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        });
        
      if (response.ok) {
    const data = await response.json();
    alert(`Thank you ${user.name}, you are registered!`);
    window.location.href = '/index.html';
} else {
    const errorData = await response.json();
    alert(`Error: ${errorData.detail || response.statusText}`);
}
    } catch (error) {
        alert(`something went wrong😩: ${error.message}`);
    }
    
}




// Attach events
document.getElementById('seller-login-form').addEventListener('submit', handleSellerLogin);
document.getElementById('user-login-form').addEventListener('submit', handleUserLogin);

