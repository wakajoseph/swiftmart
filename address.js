class AddressBook {
  constructor() {
    this.addresses = [];
    this.userAddresses = [];
    this.editingAddressId = null;
    this.currentCounty = null;
    this.container = document.querySelector(".user-address-container");
    this.initializer();
  }

  initializer() {
    this.elements = {
      addressForm: this.container.querySelector('#addressForm'),
      countySelect: this.container.querySelector('#county'),
      subcountySelect: this.container.querySelector('#subcounty'),
      pickupSel: this.container.querySelector('#pickupStation'),
      addressList: this.container.querySelector('#addressList'),
      emptyState: this.container.querySelector('#emptyState'),
      addressFormCard: this.container.querySelector('#addressFormCard'),
      addressListCard: this.container.querySelector('#addressListCard'),
      addAddressBtn: this.container.querySelector('#addAddressBtn'),
      addFirstAddressBtn: this.container.querySelector('#addFirstAddressBtn'),
      cancelBtn: this.container.querySelector('#user-address-btn'),
      setDefaultBtn: this.container.querySelector('#setDefaultBtn'),
      defaultAddressText: this.container.querySelector('#defaultAddressText'),
      defaultAddressCard: this.container.querySelector('#defaultAddressCard'),
      navigateToAddress: document.querySelector(".address--section")
    };

    // Verify all elements exist
    Object.keys(this.elements).forEach(key => {
      if (!this.elements[key]) {
        console.error(`Element not found: ${key}`);
      }
    });

    // Bind methods
    this.subCountySel = this.subCountySel.bind(this);
    this.pickUp = this.pickUp.bind(this);
    this.showAddForm = this.showAddForm.bind(this);
    this.hideForm = this.hideForm.bind(this);
    this.setDefaultAddress = this.setDefaultAddress.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.deleteAddress = this.deleteAddress.bind(this);
    this.updateUI = this.updateUI.bind(this);
    this.renderAddressList = this.renderAddressList.bind(this);
    this.countySel = this.countySel.bind(this);
    this.getData = this.getData.bind(this);

    this.setUpEventListeners();
  }

  setUpEventListeners() {
    this.elements.navigateToAddress.addEventListener('click', () => this.navigateAddresses());

    this.elements.countySelect.addEventListener('change', this.subCountySel);
    this.elements.subcountySelect.addEventListener('change', this.pickUp);
    this.elements.addAddressBtn.addEventListener('click', this.showAddForm);
    this.elements.addFirstAddressBtn.addEventListener('click', this.showAddForm);

    this.elements.cancelBtn.addEventListener('click', (e) => {
      console.log("Cancel button clicked");
      this.hideForm();
    });

    this.elements.setDefaultBtn.addEventListener('click', this.setDefaultAddress);
    this.elements.addressForm.addEventListener('submit', this.handleFormSubmit);
  }

  async getData() {
    try {
      const res = await fetch(swiftAddressUrl);
      if (!res.ok) throw new Error("Failed to fetch addresses");

      this.addresses = await res.json();
      this.countySel();      
    } catch {
    } finally {
      setTimeout(loaded, 1000);
    }
  }

  async fetchUserAddress() {
    load();
    feed("loading your data", 2000);
    try {
      const userResponse = await fetch(customerAddressesUrl, {
        method: 'POST',
        credentials: 'include',
      });

      if (!userResponse.ok) throw new Error("Failed to fetch user addresses");

      this.userAddresses = await userResponse.json();
      if (this.userAddresses.length < 1) {
        feed("you dont have addresses yet. please add one", 1000);
      }
    } catch (err){
      feed(err)
    } finally {
      this.updateUI();
      loaded(5000);
    }
  }

  showAddForm(addressId = null) {
    this.getData();
    
    this.editingAddressId = addressId ? parseInt(addressId) : null;

    const form = this.elements.addressForm;
    if (this.editingAddressId) {
      this.container.querySelector('#formTitle').textContent = 'Edit Address';
      const address = this.userAddresses.find(addr => addr.id === this.editingAddressId);

      if (address) {
        form.addressName.value = address.address_name || '';
        form.county.value = address.county_id;
        this.subCountySel();

        setTimeout(() => {
          form.subcounty.value = address.sub_county_id;
          this.pickUp();
        }, 0);

        setTimeout(() => {
          form.pickupStation.value = address.pickup_station_id;
        }, 0);

        form.street.value = address.street;
        form.building.value = address.building || '';
        form.phone.value = address.phone;
        form.setAsDefault.checked = address.is_default;
      }
    } else {
      this.container.querySelector('#formTitle').textContent = 'Add New Address';
      form.reset();
    }

    this.elements.addressListCard.style.display = 'none';
    this.elements.addressFormCard.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  hideForm() {
    console.log("Hiding form, editingAddressId:", this.editingAddressId);
    this.editingAddressId = null;
    this.elements.addressFormCard.style.display = 'none';
    this.elements.addressListCard.style.display = 'block';
    this.elements.addressForm.reset();
  }

  async handleFormSubmit(e) {
    e.preventDefault();
    if (!this.validateForm()) return;

    const address = {
      address_id: this.editingAddressId,
      street: this.container.querySelector('#street').value,
      building: this.container.querySelector('#building').value,
      county_id: parseInt(this.elements.countySelect.value),
      sub_county_id: parseInt(this.elements.subcountySelect.value),
      pickup_station_id: parseInt(this.elements.pickupSel.value),
      phone: this.container.querySelector('#phone').value,
      is_default: this.container.querySelector('#setAsDefault').checked,
      address_name: this.container.querySelector('#addressName').value,
    };

    try {
      load();
      await feed("processing please wait...", 2000);

      const response = await fetch(addAddressUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(address)
      });

      if (response.ok) {
        let msg = this.editingAddressId
          ? "Address has been updated successfully!"
          : "Your new address saved successfully!";
        await feed(msg, 5000);
        this.hideForm();
        this.redirectBack();
        this.getData();
      }
    } catch (error) {
      console.error(error);
      await feed("Oops, something went wrong!", 2000);
    } finally {
      setTimeout(loaded, 5000);
    }
  }

  validateForm() {
    let isValid = true;
    const required = ['addressName', 'county', 'subcounty', 'street', 'phone', 'pickupStation'];

    this.container.querySelectorAll('.form-control').forEach(el => el.classList.remove('is-invalid'));

    required.forEach(id => {
      const el = this.container.querySelector(`#${id}`);
      if (!el.value.trim()) {
        el.classList.add('is-invalid');
        isValid = false;
      }
    });

    const phone = this.container.querySelector('#phone');
    if (!/^[0-9]{9,12}$/.test(phone.value.trim())) {
      phone.classList.add('is-invalid');
      isValid = false;
    }

    return isValid;
  }

  updateUI() {
    const e = this.elements;

    if (this.userAddresses.length > 0) {
      e.emptyState.style.display = 'none';
      e.addressList.style.display = 'block';
      this.renderAddressList();
    } else {
      e.emptyState.style.display = 'block';
      e.addressList.style.display = 'none';
    }

    const defaultAddr = this.userAddresses.find(addr => addr.is_default);
    if (defaultAddr) {
      e.defaultAddressText.textContent =
        `${defaultAddr.address_name}: ${defaultAddr.street}, ${defaultAddr.sub_county_name}, ${defaultAddr.county_name}`;
      e.defaultAddressCard.classList.add('address-item-default');
      e.setDefaultBtn.disabled = true;
      e.setDefaultBtn.textContent = 'Default';
    } else {
      e.defaultAddressText.textContent = 'No default address set yet';
      e.defaultAddressCard.classList.remove('address-item-default');
      e.setDefaultBtn.disabled = this.userAddresses.length === 0;
      e.setDefaultBtn.textContent = 'Set Default';
    }
  }

  renderAddressList() {
    const list = this.elements.addressList;
    list.innerHTML = '';

    this.userAddresses.forEach(addr => {
      const li = document.createElement('li');
      li.className = `address-item ${addr.is_default ? 'address-item-default' : ''}`;
      li.innerHTML = `
        <div class="address-item-header">
          <div class="address-item-title">
            ${addr.address_name}
            ${addr.is_default ? '<span class="badge badge-default">Default</span>' : ''}
          </div>
          <div class="address-item-actions">
            <button class="action-btn edit-btn" data-id="${addr.id}">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="action-btn delete-btn" data-id="${addr.id}">
              <i class="fas fa-trash"></i> Delete
            </button>
          </div>
        </div>
        <div>
          <p>${addr.street}${addr.building ? ', ' + addr.building : ''}</p>
          <p>${addr.sub_county_name}, ${addr.county_name}</p>
          <p>Phone: ${addr.phone}</p>
          <p>Pickup: ${addr.pickup_station_name}</p>
        </div>
      `;

      list.appendChild(li);
    });

    list.querySelectorAll('.edit-btn').forEach(btn =>
      btn.addEventListener('click', e => this.showAddForm(e.currentTarget.dataset.id)));

    list.querySelectorAll('.delete-btn').forEach(btn =>
      btn.addEventListener('click', e => this.deleteAddress(e.currentTarget.dataset.id)));
  }

  async setDefaultAddress() {
    if (this.userAddresses.length === 0) return;

    const first = this.userAddresses[0];

    try {
      load();
      await feed("Setting default address...", 2000);

      const response = await fetch("http://localhost:8000/address/user/set-default", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address_id: first.id })
      });

      if (!response.ok) throw new Error("Failed to set default address");

      this.userAddresses.forEach(addr => addr.is_default = false);
      first.is_default = true;
      this.redirectBack();
      this.updateUI();
      await feed("Default address set successfully", 3000);
    } catch (err) {
      await feed("Could not set default address", 3000);
    } finally {
      loaded();
    }
  }

  async deleteAddress(id) {
    const request = {
      address_id: parseInt(id)
    };

    if (confirm('Are you sure you want to delete this address?')) {
      try {
        load();
        const response = await fetch("http://localhost:8000/address/user/delete", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request)
        });

        if (!response.ok) throw new Error((await response.json()).detail || `Error ${response.status}`);

        this.userAddresses = this.userAddresses.filter(addr => addr.id !== request.address_id);
        this.updateUI();
        await feed("Address deleted successfully", 4000);
      } catch (error) {
        await feed(error.message, 4000);
      } finally {
        loaded();
      }
    }
  }

  subCountySel() {
    const countyId = this.elements.countySelect.value;
    const subSelect = this.elements.subcountySelect;
    subSelect.innerHTML = `<option value="" disabled selected>select subcounty</option>`;

    const county = this.addresses.find(c => c.id == countyId);
    this.currentCounty = county;

    if (county) {
      county.subcounties.forEach(sub => {
        const option = document.createElement('option');
        option.value = sub.id;
        option.textContent = sub.name;
        subSelect.appendChild(option);
      });
    }
  }

  countySel() {
    const countySelect = this.elements.countySelect;
    countySelect.innerHTML = `<option value="" disabled selected>select county</option>`;

    this.addresses.forEach(county => {
      const option = document.createElement('option');
      option.value = county.id;
      option.textContent = county.name;
      countySelect.appendChild(option);
    });
  }

  pickUp() {
    const subId = this.elements.subcountySelect.value;
    const pickSelect = this.elements.pickupSel;
    pickSelect.innerHTML = `<option value="" disabled selected>pickup station</option>`;

    const sub = this.currentCounty?.subcounties.find(s => s.id == subId);
    if (sub) {
      sub.pickupstations?.forEach(st => {
        const option = document.createElement('option');
        option.value = st.id;
        option.textContent = st.name;
        pickSelect.appendChild(option);
      });
    }
  }
  
  navigateAddresses() {
     navigateTo('addresses');
     this.fetchUserAddress();
  }
}

let addressBook;

function startAddress() {
  addressBook = new AddressBook();  
}

