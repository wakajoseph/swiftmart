
class ProductUpload {
    constructor(id) {        
        this.elements = {};
        this.categories = []; 
        this.data = {
            sellerId: id,
            password: "development",
            name: null,
            description: null,
            category: null,
            categoryDescription: null,
            brand: null,
            brandDescription: null,
            price: null,
            basePrice: null,
            currency: "Kes",
            stock: null,
            shipping: {
               available: true,
               estimated_delivery: null,
               free_shipping: false,
               cost: 200,    
            },                        
            tags: [],
            properties: [],
            attributes: [],
            variants: []     
        }
        
        //State Management 
        this.props = [];
        this.variants = [];
        this.mainImageFile = [];
        this.variantImageFiles = {};
        this.extraProductImageFiles = [];
        this.currentAttribute = 1;
        this.currentTag = 1;
        this.currentPropValue = 0;        
        this.initialize();
        
    }
    
    
    
    getSel(s) {
        const el = document.querySelector(s);
        if (el) return el;
    }
    
    async initialize() {        
        let el = {
            container: this.getSel(".container"),
            // Product Information
            productName: this.getSel("#product-name"),
            productDescription: this.getSel("#product-description"),
            productImage: this.getSel('#mainImage'), 
            profilePreviewContainer: this.getSel(".profile"),            
            imageFeedback: this.getSel("#mainImageName"),
            overlay: this.getSel(".imageOverlay"),
            backButton: this.getSel('.prvheader .fas'),
            imgTitle: this.getSel('.imgTitle'),
            photoContainer: this.getSel('#photoContainer'),
            
            
            
            // Category Information
            categorySelect: this.getSel("#category"),
            categoryDescription: this.getSel("#categoryDsc"),
            
            // Brand Information
            brandName: this.getSel("#brand"),
            brandDescription: this.getSel("#brandDsc"),
            
            // Pricing Information
            currencySelect: this.getSel("#currency"),
            basePrice: this.getSel("#basePrice"),
            price: this.getSel("#price"),
            stock: this.getSel("#stock"),
            
            // Images
            imagesPreview: this.getSel("#imagesPreview"),
            addImages: this.getSel("#addImage input"),
            moreImageInput: this.getSel("#otherProductImages"),
            
            // Search Tags
            tagsContainer: this.getSel("#product-tags"),
            addTagButton: this.getSel("#nextTag"),
            
            // Attributes 
            attributesContainer: this.getSel("#product-attributes"),
            addAttributeButton: this.getSel("#nextAttribute"),
            
            // Delivery
            deliveryTime: this.getSel("#delivery-time"),
            
            // Product Variants
            propertyContainer: this.getSel("#property-container"),
            addPropertyButton: this.getSel("#add-property"),
            generateVariant: this.getSel("#generate-variants"),
            variantContainer:            this.getSel("#variant-container"),            
            variantSection: this.getSel("#variant-section"),
            propertySection: this.getSel("#property-section"),
            variantTableContainer: this.getSel("#variant-table-container"),
            variantTable: this.getSel("#variant-table"),
            saveProductButton: this.getSel("#save-product"),            
            // Submit Button
            submitButton: this.getSel(".submit-btn")
        };
        
        Object.values(el).forEach((element, index) => {
            if (!element) {
                console.log(`Missing element at index ${index} ${element}`);
            }
        });

        this.elements = { ...el };
        this.addListeners();
    }
    
    
    addListeners() {
      this.elements.submitButton.addEventListener('click', ()=> this.enrollProduct());
      this.elements.backButton.addEventListener('click', () => this.closeOvelay());
      this.elements.productImage.addEventListener('change', ()=> this.setMainImage(event));
      this.elements.moreImageInput.addEventListener('change', () => this.unpackImages(event));
      this.elements.addPropertyButton.addEventListener('click', () => this.addProperty());
       this.elements.generateVariant.addEventListener('click', () =>    this.generateVariants());
       this.elements.submitButton.addEventListener('click', () =>  this.saveItem(event));
       
this.elements.addTagButton.addEventListener('click', () => this.addTag());

this.elements.addAttributeButton.addEventListener('click', () =>  this.addAttribute());    
      
      this.getCategories()
   }
   
                  
   async getCategories() {
      try {
         
        const response = await  fetch("http://127.0.0.1:8000/api/v1/categoryList", {
        method: 'GET',
        headers: {
          'Content-Type': "application/ json"
        }});
        
        if (response.ok) {
          let data = await response.json();
          this.categories = [...data];
          this.populateCategory(data);
        } else {
            let e = await response.json().catch(()=> ({}));
            throw new Error(e.detail);
        }
        
      } catch(error) {
         toast("something went wrong");
         console.log(error)
      }
   }
   
   create(option) {
       return document.createElement(option);
   }
   
   populateCategory(data) {
       let container = this.elements.categorySelect;
       container.innerHTML = "";
       container.innerHTML = `<option value="" selected disabled>Select Category</option>`;
       data.forEach((op) => {
        if (!Number(op.name)) {
         let option = this.create('option');
         option.value = op.name;
         option.textContent = op.name;
         container.appendChild(option);
        }
       });
       
       container.addEventListener('change', ()=> this.updateCategory());
              
   }
   
   updateCategory() {
      
     let match =  this.categories.find(item => item["name"] === this.elements.categorySelect.value);
     if (match) {
        let name = match.name;
        let dsc = match.description;
        
        this.data.category = name;
        this.data.categoryDescription = dsc;
        this.elements.categoryDescription.textContent = dsc;
     }     
   }
   
   
   setMainImage(e) {
       
       let file = e.target.files[0];
       if (!file) return;
       
       this.mainImageFile[0] = file;
       this.elements.imageFeedback.textContent = file.name;
       this.previewMainImage(file);
       
   }
   
   
   
   previewMainImage(file) {
       let container = this.elements.profilePreviewContainer;
    
       let preview = this.create('div');
       preview.classList.add('previewField');
   
       let img = this.create('img');
       let imgURL = URL.createObjectURL(file);
       img.src = imgURL;
       let clonedImg = img.cloneNode(true);
    
       let clearBtn = this.create('div');
       clearBtn.textContent = '×';
       clearBtn.classList.add('remove');
    
       preview.appendChild(img);
       preview.appendChild(clearBtn);
       container.appendChild(preview);
    
       preview.addEventListener('click', () => this.previewImg(clonedImg, file.name));
    
       clearBtn.addEventListener('click', (e) => {
           e.stopPropagation(); 
           URL.revokeObjectURL(imgURL);
           preview.remove(); 
           this.mainImageFile = [];
        });
    }
    
    
    previewImg(img, name) {
      let el =  this.elements;
      el.photoContainer.innerHTML = "";
       
      el.photoContainer.appendChild(img);
      el.imgTitle.textContent = name;
      el.overlay.style.display = "flex"; 
      el.container.style.overflow = "hidden";
    }
    
    closeOvelay() {
    
       this.elements.container.style.overflow = "";
       this.elements.overlay.style.display = "none"; 
    }
   
   unpackImages(e) {
    
    let el =  this.elements;
    let container = el.imagesPreview;
    let files = [...e.target.files];
    files.forEach((f, i) => {  
     this.extraProductImageFiles.push(f);          
     let imgCont = this.create('div');
     imgCont.classList.add('previewSpace');
     let img = this.create('img');
     let clearBtn = this.create('div');
     clearBtn.classList.add('remove');      
     clearBtn.textContent = '×';    
     let url = URL.createObjectURL(f);
     let title = f.name;
     img.src = url;
     let imgClone = img.cloneNode(true);
     imgCont.appendChild(img);       
     imgCont.appendChild(clearBtn);
     container.appendChild(imgCont);      
     imgCont.addEventListener('click', () => this.previewImg(imgClone, f.name));
     clearBtn.addEventListener('click', (e) => {
      e.stopPropagation(); 
     this.extraProductImageFiles = this.extraProductImageFiles.filter(file => file !== f);
      container.removeChild(imgCont);
     });
    });                                
   }
   
   
       
   
   
   addProperty() {
     let propertyContainer = this.elements.propertyContainer;
     this.data.name = this.elements.productName.value.trim();
     
     if(!this.data.name) {
         notice("Ensure Previous fields are filled up before proceeding to this step");
         setTimeout(()=> toast("Action Denied!"),3000);
         return;
     }
     
     const propertyId = Date.now();
     const propertyDiv = this.create('div');
     propertyDiv.className = 'property-row';
     propertyDiv.dataset.id = propertyId;        
     propertyDiv.innerHTML = `
          <div class="form-group">
            <label>Property Name</label>
            <input type="text" class="property-name" placeholder="e.g. Color, Size">
          </div>
          <label>Property Values</label>         
          <div class="values-container"></div>
          <div class="property-controls">
            <button class="add-value btn-outline">+ Add Value</button>
            <button class="remove-property btn-danger-outlined">Remove Property</button>
          </div>
        `;
                propertyContainer.appendChild(propertyDiv);
      propertyDiv.querySelector('.add-value').addEventListener('click', () => this.addValue(propertyId));
        propertyDiv.querySelector('.remove-property').addEventListener('click', (e) => {
          propertyContainer.removeChild(e.target.closest('.property-row'));
        });
        
        // Add first value by default
        this.addValue(propertyId);  
    }
    
    addValue(propertyId) {
        const propertyRow = document.querySelector(`.property-row[data-id="${propertyId}"]`);
        const valuesContainer = propertyRow.querySelector('.values-container');
        if (!valuesContainer) return;

        let lastV = valuesContainer.querySelector(`.propValue${this.currentPropValue}`);
        if (lastV && !lastV.querySelector('input').value.trim()) {
          toast("fill the previous field")
          return;    
        }

        this.currentPropValue += 1;
        const valueDiv = this.create('div');
        valueDiv.className = `value-input propValue${this.currentPropValue}`;
        valueDiv.innerHTML = `
            <input type="text" placeholder="Value (e.g. Red)" class="property-value">
            <button class="remove-value btn-danger"><i class="fas fa-trash"></i></button>
        `;
        valuesContainer.appendChild(valueDiv);

        // Add remove event
        valueDiv.querySelector('.remove-value').addEventListener('click', (e) => {
            valuesContainer.removeChild(e.target.closest('.value-input'));
        });
    }    

generateVariants() {
    // Collect all properties (original implementation)
    const allProperties = Array.from(document.querySelectorAll('.property-row')).map(row => {
        return {
            name: row.querySelector('.property-name').value.trim(),
            values: Array.from(row.querySelectorAll('.property-value')).reduce((acc, input) => {
                const value = input.value.trim();
                if (value) acc.push(value);
                return acc;
            }, []),            
        };
    }).filter(prop => prop.name && prop.values.length > 0 && prop.values.every(v => v));
    
    if (allProperties.length === 0) {
        alert('Please add at least one property with values');
        return;
    }
    
    // Generate all possible variants
    this.variants = this.cartesianProduct(allProperties.map(p => p.values));
    this.elements.variantContainer.innerHTML = '';
    
    // Initialize variantImageFiles if not exists
    this.variantImageFiles = this.variantImageFiles || {};
    
    // Create and display each variant
    this.variants.forEach((variant, i) => {
        const variantDiv = document.createElement('div');
        variantDiv.className = 'variant-row';
        let sku = this.generateSKU(variant);
        
        // Build the variant HTML (maintaining original structure)
        variantDiv.innerHTML = `
            <div class="form-group">
                <div class="sku-preview">${sku}</div>
                <div>
                    ${allProperties.map((prop, j) => `<strong>${prop.name}:</strong> ${variant[j]}`).join('<br>')}
                </div>
            </div>
            <div class="form-group">
                <label>Price</label>
                <input type="number" min="0" step="0.01" class="variant-price" placeholder="0.00">
            </div>
            <div class="form-group">
                <label>Quantity</label>
                <input type="number" min="0" class="variant-quantity" placeholder="0">
            </div>
            <div class="form-group">
                <label>Image URL</label>
                <div class="variant-image-container" data-sku="${sku}">
                    <input type="file" class="variant-image-input" accept="image/*"> 
                    <div class="add">
                        <i class="fas fa-camera"></i>
                    </div>
                    <div class="variant-image-preview"></div>                         
                </div>              
            </div>
            <button class="delete-variant-btn">Delete Variant</button>
        `;
        
        // Image handling (original implementation)
        const fileInput = variantDiv.querySelector('.variant-image-input');
        const imagePreview = variantDiv.querySelector('.variant-image-preview');
        
        fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const url = URL.createObjectURL(file);
                
                const removeBtn = document.createElement('button');
                removeBtn.className = "remove";        
                removeBtn.textContent = "×";
            
                const image = document.createElement('img');
                image.className = "variant-image";
                image.src = url;
                let clonedImg = image.cloneNode(true);
                let fileName = file.name;
                
                imagePreview.innerHTML = '';
                imagePreview.appendChild(removeBtn);
                imagePreview.appendChild(image);
                
                this.variantImageFiles[sku] = file;

                image.addEventListener('click', () => {
                    this.previewImg(clonedImg, fileName);
                });        
                removeBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    delete this.variantImageFiles[sku];
                    imagePreview.innerHTML = '';
                    fileInput.value = '';
                });                                      
            }                    
        });
        
        // Add delete functionality
        const deleteBtn = variantDiv.querySelector('.delete-variant-btn');
        deleteBtn.addEventListener('click', () => {
            // Remove from variants array
            this.variants = this.variants.filter((v, index) => index !== i);
            
            // Remove from DOM
            variantDiv.remove();
            
            // Clean up image if exists
            if (this.variantImageFiles[sku]) {
                delete this.variantImageFiles[sku];
            }
        });
        
        this.elements.variantContainer.appendChild(variantDiv);
    });
    
    this.elements.variantSection.style.display = 'block';        
}

// Original cartesianProduct implementation
cartesianProduct(arr) {
    return arr.reduce((a, b) =>
        a.flatMap(x => b.map(y => [...x, y])), [[]]);
}

// Original generateSKU implementation
generateSKU(values) {
    if (values.length === 0) return `${this.data.name.substring(0, 3).toUpperCase()}-001`;

    const cleanValues = values.map(v => {
        return v.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase();
    });

    return `${this.data.name.substring(0, 3).toUpperCase()}-${cleanValues.join('-')}`;
}
      
     saveItem() {
    // Show the variant table
    this.elements.variantTable.style.display = "block";
    
    // Collect all properties and update this.data
    this.data.properties = Array.from(document.querySelectorAll('.property-row')).map(row => {
        return {
            name: row.querySelector('.property-name').value.trim(),
            values: Array.from(row.querySelectorAll('.property-value')).map(input => input.value.trim()),
        };
    }).filter(prop => prop.name && prop.values.length > 0 && prop.values.every(v => v));
    
    // Update variants data
    const variantRows = document.querySelectorAll('.variant-row');
    this.data.variants = Array.from(variantRows).map((row, i) => {
        const variantValues = this.variants[i] || [];
        
        return {
            sku: this.generateSKU(variantValues),
            price: parseFloat(row.querySelector('.variant-price').value) || 0,
            quantity: parseInt(row.querySelector('.variant-quantity').value) || 0,           
            properties: this.data.properties.reduce((obj, prop, j) => {
                obj[prop.name] = variantValues[j];
                return obj;
            }, {}),              
        };
    });
    
    // Update table display
    this.elements.variantTable.innerHTML = '';
    this.data.variants.forEach(variant => {
        const row = document.createElement('tr');
        
        // Combine all properties for display
        const propertiesText = Object.entries(variant.properties)
            .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
            .join('<br>');
        
        row.innerHTML = `
            <td>${variant.sku}</td>
            <td>${propertiesText}</td>
            <td>$${variant.price.toFixed(2)}</td>
            <td>${variant.quantity}</td>
            <td>${variant.image ? `<img src="${variant.image}" class="variant-image-preview" onerror="this.style.display='none'">` : ''}</td>
        `;
        this.elements.variantTable.appendChild(row);
        
       });
       
this.elements.variantTableContainer.style.display = 'block';
  
    }
    
    addAttribute() {
        const container = this.elements?.attributesContainer;
        if (!container) {
            console.error('Attributes container not found');
            return;
        }
        
        const [attrEl, attrValueEl] = [`.attr${this.currentAttribute}`, `.attr-value${this.currentAttribute}`].map(a => this.getSel(a));

        if (!attrEl.value.trim()) {
          attrEl.classList.add("required");
          
          return;
        } else {
          attrEl.classList.remove("required");
        }

        if (!attrValueEl.value.trim()) {
          attrValueEl.classList.add("required");
          notice("fill the previous field first");
          return;
        } else {
          attrValueEl.classList.remove("required");
        }
       
 
        this.currentAttribute += 1;
        const id = this.currentAttribute;
        const width = container.clientWidth;
        
        // Create elements
        const idDiv = this.create('div');      
        const attr = this.create('input');
        const attrValue = this.create('input');
        
        // Configure elements
        attr.type = "text";
        attrValue.type = "text";
        
        // Calculate widths
        const idWidth = Math.floor((0.4 / 3) * width);
        const fieldWidth = Math.floor((1.3 / 3) * width);
        
        idDiv.style.width = `${idWidth}px`;
        attr.style.width = `${fieldWidth}px`;
        attrValue.style.width = `${fieldWidth}px`;
        
        // Set classes and attributes
        idDiv.className = `attr-id attr-id${id}`;
        attr.className = `attr attr${id}`;
        attrValue.className = `attr-value attr-value${id}`;
        
        attr.placeholder = "add specs";
        attrValue.placeholder = "specs value";
        
        idDiv.textContent = id;  
        idDiv.dataset.id = id;    
        attr.dataset.id = id;      
        attrValue.dataset.id = id;
        
        // Add elements to container
        container.append(idDiv, attr, attrValue);
        
        // Add event listener
        attr.addEventListener('input', () => {
            const val = attr.value.trim();
            if (!val) {
                container.removeChild(idDiv);
                container.removeChild(attr);
                container.removeChild(attrValue);
                this.renumberAttributes();
                this.currentAttribute = container.querySelectorAll('.attr-id').length;
            }
        });
    }

    renumberAttributes() {
        const container = this.elements.attributesContainer;
        const idDivs = container.querySelectorAll('.attr-id');
        const attrInputs = container.querySelectorAll('[class^="attr"]:not(.attr-id)');
        const attrValueInputs = container.querySelectorAll('[class^="attr-value"]');
        
        idDivs.forEach((div, index) => {
            const newId = index + 1;
            const oldId = div.dataset.originalId || div.dataset.id;
            
            // Update ID display
            div.textContent = newId;
            div.dataset.id = newId;
            
            // Update corresponding inputs
            attrInputs.forEach(input => {
                if (input.dataset.id === oldId) {
                    input.className = `attr attr${newId}`;
                    input.dataset.id = newId;
                }
            });
            
            attrValueInputs.forEach(input => {
                if (input.dataset.id === oldId) {
                    input.className = `attr-value attr-value${newId}`;
                    input.dataset.id = newId;
                }
            });
        });
    }
    
    addTag() {
    
      const container = this.elements.tagsContainer;
      
      let currentTag = container.querySelector(`.tag${this.currentTag}`);
      let val = currentTag.value.trim();
      if (!val) {
          currentTag.classList.add("required");
          notice("fill the previous field first");
          return;
      } else {
          currentTag.classList.remove("required");
      }
      
      let width = container.clientWidth;
      
      this.currentTag += 1;
      let id = this.currentTag;
      
      const idDiv = this.create('div');
      const tag = this.create('input');
      idDiv.textContent = id;   
      tag.type="text";
      
      idDiv.className = `tag-id tag-id${id}`;
      tag.className = `tagValue tag${id}`;
      
      idDiv.style.width = `${0.3/2*width -1}px`;
      tag.style.width = `${1.7/2*width -1}px`;
      tag.dataset.id = id;
      idDiv.dataset.id = id;
      
      tag.placeholder = "add tag"
      container.appendChild(idDiv);
      container.appendChild(tag);
      
      this.constructTags();
    }
    
    
    
    constructAttributes() {
      const container =         this.elements?.attributesContainer;
      const attributes = container.querySelectorAll(".attr");
      const values = container.querySelectorAll(".attr-value");
      let properties = [];

      if (attributes.length < 1) return;

      attributes.forEach(a => {
        let attrValue = a.value.trim();
        if (!attrValue) return;
        let index = a.dataset.id;
        let match = Array.from(values).find(b => b.dataset.id === index);
        let value = match ? match.value.trim() || "not Specified" : "not Specified";
        properties.push({ 
        "name": attrValue,
        "value": value });
      });

      this.data.attributes = properties;
    }
    
    constructTags() {
      const tags = Array.from(this.elements.tagsContainer.querySelectorAll(".tagValue"));
                
      this.data.tags = tags.map(t => t.value.trim()).filter(Boolean);
      
    }
    
    validate() {
              
        this.data.name = this.elements.productName.value.trim();
        this.data.description =  this.elements.productDescription.value.trim();
       this.data.brand = this.elements.brandName.value.trim();
       this.data.brandDescription = this.elements.brandDescription.value.trim();
       this.data.price = parseFloat(this.elements.price.value.trim());
       this.data.basePrice = parseFloat(this.elements.basePrice.value.trim());       
       this.data.stock = Number(this.elements.stock.value.trim());
       this.data.shipping.estimated_delivery = this.elements.deliveryTime.value.trim();
       
       this.constructAttributes();
       this.constructTags();
                           
   }
   
   validateProductData(data) {   
      const errors = [];
      this.validate();
    // Validate primitive fields
      const primitiveFields = [
        'sellerId', 'name', 'description', 'category', 'categoryDescription',
        'brand', 'brandDescription', 'price', 'basePrice', 'currency', 'stock'
    ];

      primitiveFields.forEach(field => {
        if (data[field] === null || data[field] === undefined || data[field] === '') {
            errors.push(`${field} is required`);
        }
      });

    // Validate shipping
      if (!data.shipping || typeof data.shipping !== 'object') {
        errors.push(`shipping object is missing`);
      } else {
        if (data.shipping.estimated_delivery === null || data.shipping.estimated_delivery === '') {
            errors.push(`shipping.estimated_delivery is required`);
        }
        if (typeof data.shipping.available !== 'boolean') {
            errors.push(`shipping.available must be true or false`);
        }
        if (typeof data.shipping.free_shipping !== 'boolean') {
            errors.push(`shipping.free_shipping must be true or false`);
        }
    }
    

    // Validate non-empty arrays
    ['tags', 'properties', 'attributes', 'variants'].forEach(arrField => {
        if (!Array.isArray(data[arrField]) || data[arrField].length === 0) {
            errors.push(`${arrField} must be a non-empty array`);
        }
    });

       return {
           valid: errors.length === 0,
           errors
       };
   }
  
  async enrollProduct() {    
    const result = this.validateProductData(this.data);
    if (!result.valid) {
        console.log("Validation errors:", result.errors);
        return;
    }

    const formData = new FormData();

    // Must match `product_data: str = Form(...)`
    formData.append("product_data", JSON.stringify(this.data));

    // Must match `main: UploadFile = File(...)`
    if (this.mainImageFile[0]) {
        formData.append("main", this.mainImageFile[0]);
    }

    // Must match `extraPhotos: List[UploadFile] = File(None)`
    this.extraProductImageFiles.forEach(file => {
        formData.append("extraPhotos", file);
    });

    // Must match dynamic `variantPhotos[SKU]` (name includes brackets)
    for (const [sku, file] of Object.entries(this.variantImageFiles)) {
        formData.append(`variantPhotos[${sku}]`, file);
    }

    this.backendProcess(formData);
  }
  
  async backendProcess(formData) {
    if (!(await showConfirm("Are you sure to proceed uploading your product?"))) {
       toast("cancelled")
       return; 
    }
    
    load();
    try {
        const response = await fetch("http://localhost:8000/api/v1/products/add", {
        method: "POST",
        body: formData
      });
      
      if (!response.ok) {
          let e = await response.json().catch(() => ({}));
          throw new Error(e);
      }
      
      data = await response.json();
      feed(data.message);
      
    } catch(error) {
        feed(error.detail || "something went wrong");
    } finally {
        loaded(2000);
        toast("process finished")
    }             
  }   
}


document.addEventListener('DOMContentLoaded', () => {
    new ProductUpload(1);
});

const sections = document.querySelectorAll('.section');
const container = document.querySelector('.container');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Check if the top of the section is near the top of the container
      const containerTop = container.getBoundingClientRect().top;
      const sectionTop = entry.boundingClientRect.top;

      // Only trigger if it's close to the top (within 5px)
      if (Math.abs(sectionTop - containerTop) < 5) {
        console.log(`🔹 Section ${entry.target.dataset.id} is at the top`);
        // You can update nav here
        document.querySelector('#sectionName').textContent = `Section ${entry.target.dataset.id}`;
      }
    }
  });
}, {
  root: container,
  threshold: 0,
  rootMargin: "-1px 0px -99% 0px" // Top padding only, forces "top-hit" behavior
});

sections.forEach(section => observer.observe(section));
 



//console.log(JSON.stringify(product));
//const formData = new FormData();
//formData.append("product_data", JSON.stringify(product));
//filesToUpload.forEach(file => {
//  formData.append("imageUri", file); 
//});

//sendToServer(formData);
//}





   
function updateVariantTable() {
    variantTable.innerHTML = '';
    
    productData.variants.forEach(variant => {
      const row = document.createElement('tr');
      row.className = 'fade-in';
      
      const allProps = {...variant.properties, ...variant.descriptive_properties};
      const propertiesText = Object.entries(allProps)
        .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
        .join('<br>');
      
      row.innerHTML = `
        <td>${variant.sku}</td>
        <td>${propertiesText}</td>
        <td>$${variant.price.toFixed(2)}</td>
        <td>${variant.quantity}</td>
        <td>${variant.image ? `<img src="${variant.image}" class="variant-image-preview" onerror="this.style.display='none'">` : ''}</td>
      `;
      variantTable.appendChild(row);
    });
  }

  
  
  
  
  //{"sellerId":1,"password":null,"name":"Infinix","description":"","category":null,"categoryDescription":null,"brand":"","brandDescription":"","price":"","basePrice":"","currency":"Kes","stock":"","shipping":{"available":true,"estimated_delivery":"24 hours","free_shipping":false},"ratings":{"average":0,"count":0},"tags":["Infinix","Latest smartPhone"],"properties":[{"name":"Color","values":["Blue","Gray"]}],"attributes":[{"Storage":"128gb"},{"Ram":"8gb"}],"variants":[{"sku":"INF-BLU","price":12,"quantity":554,"properties":{"Color":"Blue"}},{"sku":"INF-GRA","price":11,"quantity":555,"properties":{"Color":"Gray"}}]}


