function sl(selector) {
        return document.querySelector(selector);
    }

  function slAll(selector) {
        return document.querySelectorAll(selector);
    }

   function getElements() {
        let el = {
            header: this.sl(".header"),
            main: this.sl(".main"),
            footer: this.sl(".Mainfooter"),

            headerElements: {
                mainSearch: this.sl(".searchBox"),
                topNavigation: this.sl(".navigate"),
                navButtons: this.slAll(".navigate button"),
            },

            mainElements: {
                homeScreen: this.sl(".homeScreen"),
                displayImageContainer: this.sl(".displayImageContainer"),
                displayImage: this.sl(".displayImage"),
                banner: this.sl(".banner"),
                bannerText: this.sl(".bannerText"),
                bannerItems: this.sl(".bannerItems"),
                bannerItem: this.slAll(".bannerItems .items"),
                flashSale: this.sl(".flashSale"),
                flashSaleTitle: this.sl(".f__l"),
                timer: this.sl(".timer"),
                flashSaleItems: this.sl(".flashSaleItems"),
                flashSaleEachItem: this.slAll(".flashSaleItems .item"),
                homeProducts: this.sl(".homeProducts"),
                productsContainer: this.sl(".productsContainer"),
                categoryProducts: this.sl(".categoryProducts"),
            },

            cartElements: {
                container: this.sl(".cartContainer"),
                header: this.sl(".cartHeader"),
                navigationBack: this.sl(".navigationContainer span"),
                totalItems: this.sl(".totalItems"),
                editButton: this.sl(".cartHeader div:last-child"),
                cartMain: this.sl(".cartMain"),
                itemsContainer: this.sl(".itemsContainer"),
                shippingPolicy: this.sl(".shippingPolicy"),
                relatedItemsContainer: this.sl(".relatedItemsContainer"),
                cartFooter: this.sl(".cartFooter"),
                checkAllItems: this.sl("#checkAllItems"),
                totalPrice: this.sl(".totalPrice"),
                checkOut: this.sl(".checkOut"),
                totalCheckOut: this.sl("#totalCheckOut"),
            },
            

            chatElements: {
                container: this.sl(".chatContainer"),               
                headerBottom: this.sl(".header-bottom"),
                chatLabels: this.slAll(".chat-label"),
                logoIcons: this.slAll(".chat-label #logo i"),
                messageList: this.sl(".message-list"),
                loginPrompt: this.sl(".login-prompt"),
                loginLink: this.sl(".login-link"),
            },

            accountElements: {
                container: this.sl(".accountContainer"),
                header: this.sl(".accountContainer .accountHeader"),
              
                
            },

            footNavigation: {
                home: this.sl("#navHome"),
                category: this.sl("#navCategory"),
                chat: this.sl("#navChat"),
                cart: this.sl("#navCart"),
                me: this.sl("#navMe"),
                cartCounter: this.sl(".cartCounter"),
            },
        };
        
        let response = logElements(el, "elements");
        if(!response) return;
        return el;
    }

   function logElements(obj, path = "elements") {
        let isValid = false;
        for (let key in obj) {
            const value = obj[key];
            if (value instanceof Element || value instanceof NodeList || value === null) {
                if (!value || (value instanceof NodeList && value.length === 0)) {
                    console.warn(`❌ Missing: ${path}.${key}`);
                    isValid = false;
                    return;
                } else {
                    isValid = true;
                }
            } else if (typeof value === "object") {
                this.logElements(value, `${path}.${key}`);
            }
        }
        
        if (!isValid) {
            return false;
        } else {
            return true;
        }
}
