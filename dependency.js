const apiPrefix = "api/v1";
const baseUrl = "http://localhost:8000";
const api = `${baseUrl}/${apiPrefix}`;
const urlObj = new URL(baseUrl);

//websoket & home
const wsProtocol = urlObj.protocol === "http:" ? "ws:" : "wss:";
const wsPort = urlObj.port ? `:${urlObj.port}` : "";
const wsUrl = `${wsProtocol}//${urlObj.hostname}${wsPort}/ws`;
const homeUrl = `${api}/home`;


//auth
const loginBaseUrl = `${api}/customer/login`;
const logoutUrl = `${api}/customer/logout`;
const refreshBaseUrl = `${api}/customer/refresh-token`;

//Cart
const addToCartUrl = `${api}/cart/add`;
const deleteCartItemsUrl = `${api}/cart/delete-items`;
const viewCartUrl = `${api}/cart/view`;
const quantityUpdateUrl = `${api}/cart/quantity/update`;

//ORDER URLS 
const orderItemReqUrl = `${api}/order/validate_items`;


//Addresses 
let swiftAddressUrl = `${api}/addresses`;
let customerAddressesUrl = `${api}/user/addresses`;
let addAddressUrl = `${api}/address/user/update`

//theme and color 
const currentTheme = "#ff7300";