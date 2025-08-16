




const productData = {
  sellerId: userId,
  password: user.password,
  name: elementValues[0],
  description: elementValues[1],
  category: elementValues[2],
  categoryDescription: elementValues[3],
  brand: elementValues[4],
  brandDescription: elementValues[5],
  price: elementValues[6],
  basePrice: elementValues[7],
  currency: elementValues[8],
  stock: elementValues[9],
  attributes: productAttributes,
  shipping: {
    available: true,
    estimated_delivery: elementValues[10],
    free_shipping: true
  },
  ratings: {
    average: 0,
    count: 0
  },
  tags: productTags
};

elementValues[0]
elementValues[10]
const fieldIds = [
    "name",
    "description",
    "category",
    "categoryDsc",  // this is a div, not an input
    "brand",
    "brandDsc",
    "price",
    "basePrice",
    "currency",
    "stock",
    "delivery-time"
  ];




fetch("http://localhost:8000/products/add", {
  method: "POST",
  body: formData
})
.then(res => res.json())
.then(data => {
  console.log("Server response:", data);
})
.catch(err => {
  console.error("Upload failed:", err);
});