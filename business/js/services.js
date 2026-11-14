//=====================================
// js/services.js
//=====================================

import {

db,
ref,
onValue

} from "./firebase.js";

const serviceGrid=document.getElementById("serviceGrid");

const searchService=document.getElementById("searchService");

let services=[];


//=====================================
// LOAD SERVICES
//=====================================

onValue(ref(db,"services"),(snapshot)=>{

services=[];

serviceGrid.innerHTML="";

if(!snapshot.exists()){

serviceGrid.innerHTML=`

<div class="serviceCard">

<i class="fa-solid fa-circle-info"></i>

<h3>No Services Available</h3>

<p>

Services added from the Admin Dashboard
will automatically appear here.

</p>

</div>

`;

return;

}

snapshot.forEach((item)=>{

services.push({

id:item.key,

...item.val()

});

});

displayServices(services);

});


//=====================================
// DISPLAY SERVICES
//=====================================

function displayServices(data){

serviceGrid.innerHTML="";

data.forEach(service=>{

serviceGrid.innerHTML+=`

<div class="serviceCard">

<i class="fa-solid fa-laptop-code"></i>

<h3>

${service.name}

</h3>

<p>

${service.description}

</p>

<div
style="margin-top:25px;
display:flex;
gap:12px;
flex-wrap:wrap;">

<a

href="https://wa.me/2348102341648?text=Hello,%20I%20would%20like%20to%20know%20more%20about%20${encodeURIComponent(service.name)}"

target="_blank"

class="btn">

Request Service

</a>

<button

class="btn2"

onclick="serviceInfo('${service.id}')">

Learn More

</button>

</div>

</div>

`;

});

}


//=====================================
// SEARCH SERVICES
//=====================================

searchService.addEventListener("keyup",()=>{

const keyword=searchService.value.toLowerCase();

const filtered=services.filter(service=>{

return(

service.name.toLowerCase().includes(keyword)

||

service.description.toLowerCase().includes(keyword)

);

});

displayServices(filtered);

});


//=====================================
// VIEW SERVICE DETAILS
//=====================================

window.serviceInfo=function(id){

const service=services.find(item=>item.id===id);

if(!service) return;

alert(

"Service\n\n"+

service.name+

"\n\n"+

service.description

);

};


//=====================================
// END services.js
//=====================================

