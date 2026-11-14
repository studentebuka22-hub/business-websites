//=====================================
// js/products.js
//=====================================

import {

db,
ref,
onValue

} from "./firebase.js";

const productGrid=document.getElementById("productGrid");

const search=document.getElementById("searchProduct");

let products=[];


//=====================================
// LOAD PRODUCTS
//=====================================

onValue(ref(db,"products"),(snapshot)=>{

products=[];

productGrid.innerHTML="";

if(!snapshot.exists()){

productGrid.innerHTML=`

<div class="serviceCard">

<h2>No Products Available</h2>

<p>

Products will appear here automatically
when added from the Admin Dashboard.

</p>

</div>

`;

return;

}

snapshot.forEach((item)=>{

products.push({

id:item.key,

...item.val()

});

});

displayProducts(products);

});


//=====================================
// DISPLAY PRODUCTS
//=====================================

function displayProducts(list){

productGrid.innerHTML="";

list.forEach(product=>{

productGrid.innerHTML+=`

<div class="productCard">

<img src="${product.image}">

<div class="productInfo">

<h3>

${product.name}

</h3>

<p>

${product.description}

</p>

<p>

<b>Category:</b>

${product.category}

</p>

<div class="price">

₦${Number(product.price).toLocaleString()}

</div>

<div
style="display:flex;
gap:10px;
flex-wrap:wrap;">

<a

href="https://wa.me/2348102341648?text=Hello,%20I'm%20interested%20in%20${encodeURIComponent(product.name)}"

target="_blank"

class="buyBtn">

Buy Now

</a>

<button

onclick="viewProduct('${product.id}')"

class="btn2">

View Details

</button>

</div>

</div>

</div>

`;

});

}


//=====================================
// SEARCH
//=====================================

search.addEventListener("keyup",()=>{

const keyword=search.value.toLowerCase();

const filtered=products.filter(product=>{

return(

product.name.toLowerCase().includes(keyword)

||

product.category.toLowerCase().includes(keyword)

||

product.description.toLowerCase().includes(keyword)

);

});

displayProducts(filtered);

});


//=====================================
// VIEW DETAILS
//=====================================

window.viewProduct=function(id){

const product=products.find(p=>p.id===id);

if(!product) return;

alert(

"Product: "+product.name+

"\n\nCategory: "+product.category+

"\n\nPrice: ₦"+Number(product.price).toLocaleString()+

"\n\nDescription:\n"+product.description

);

};


//=====================================
// END OF FILE
//=====================================

