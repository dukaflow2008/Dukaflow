// ===============================
// 🔥 DUKAFLOW FIRESTORE VERSION
// ===============================


// ===============================
// 🔥 FIREBASE IMPORTS
// ===============================

import { initializeApp }

from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";


import {

getAuth,
createUserWithEmailAndPassword,
signInWithEmailAndPassword,
signOut,
onAuthStateChanged

}

from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


import {

getFirestore,
collection,
addDoc,
getDocs,
deleteDoc,
doc,
updateDoc,
onSnapshot,
getDoc

}

from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ===============================
// 🔥 FIREBASE CONFIG
// ===============================

const firebaseConfig = {

apiKey:"AIzaSyBeWNOPH-CoksIlNE-V6wtBE1Um7gvgbG0",

authDomain:"dukaflow-21ec9.firebaseapp.com",

projectId:"dukaflow-21ec9",

storageBucket:"dukaflow-21ec9.firebasestorage.app",

messagingSenderId:"555776552379",

appId:"1:555776552379:web:4238c2c40709e8c980289e"

};


// ===============================
// 🔥 INIT FIREBASE
// ===============================

const app =
initializeApp(firebaseConfig);

const db =
getFirestore(app);

const auth =
getAuth(app);


// ===============================
// 🔥 EXPORT
// ===============================

export {

db,
auth

};



// ===============================
// 🔥 INIT FIREBASE
// ===============================

let visibleSuppliers = 5;
let currentSupplier = null;
let pressTimer;
let saleItems = [];
let totalPurchases = 0;
let totalProducts = 0;
let currentCustomer = null;
let customerSaleItems = [];
let payrollData = [];
// ===============================
// 🔥 REALTIME SUPPLIERS
// ===============================
onSnapshot(collection(db,"suppliers"), snap => {

  window.allSuppliers = [];

  snap.forEach(docSnap => {

    window.allSuppliers.push({
      id: docSnap.id,
      ...docSnap.data()
    });

  });

});


// ===============================
// 🔁 NAVIGATION
// ===============================

window.openSection = function(id){

  console.log("Button clicked:", id);

  // 🔥 Hisha dashboard na sections zose
  const allSections = document.querySelectorAll(".section, #dashboardTop");

  allSections.forEach(el => {
    el.style.display = "none";
    el.classList.remove("active");
  });


  const target = document.getElementById(id);

  if(target){
    target.style.display = "block";
    target.classList.add("active");
  } else {
    console.error("Section not found:", id);
  }

};


function goBack(){

  // 🔥 Garura dashboard
  const dashboard = document.getElementById("dashboardTop");

  if(dashboard){
    dashboard.style.display = "block";
  }

  // 🔥 Hisha sections zose
  document.querySelectorAll(".section").forEach(sec => {
    sec.style.display = "none";
    sec.classList.remove("active");
  });

}


function showMenu(){
  openSection("mainMenu");
}

// ===============================
// 📊 DASHBOARD
// ===============================
async function updateDashboard(){

let salesTotal = 0;

let expTotal = 0;

let employeePayroll = 0;

let supplierPayroll = 0;


// CHECK LOGIN
if(!auth.currentUser){

return;

}

const uid =
auth.currentUser.uid;


// 🧾 SALES (customer history)
const salesSnap =
await getDocs(

collection(
db,
"users",
uid,
"customerHistory"
)

);

salesSnap.forEach(d=>{

salesTotal +=
Number(
d.data().total || 0
);

});


// 💸 EXPENSES
const expSnap =
await getDocs(

collection(
db,
"users",
uid,
"expenses"
)

);

expSnap.forEach(d=>{

expTotal +=
Number(
d.data().amount || 0
);

});


// 👤 EMPLOYEE PAYROLL
const empSnap =
await getDocs(

collection(
db,
"users",
uid,
"employees"
)

);

empSnap.forEach(d=>{

employeePayroll +=
Number(
d.data().salary || 0
);

});


// 🚚 SUPPLIER PAYROLL
const supPaySnap =
await getDocs(

collection(
db,
"users",
uid,
"supplierHistory"
)

);

supPaySnap.forEach(d=>{

supplierPayroll +=
Number(
d.data().total || 0
);

});



// 💰 PROFIT
let profit =

salesTotal

-

(
expTotal
+
employeePayroll
+
supplierPayroll
);


// UI UPDATE

document
.getElementById(
"dashSales"
)
.innerText =

salesTotal
.toLocaleString();


document
.getElementById(
"dashExpenses"
)
.innerText =

expTotal
.toLocaleString();


document
.getElementById(
"dashEmpPayroll"
)
.innerText =

employeePayroll
.toLocaleString();


document
.getElementById(
"dashSupplierPayroll"
)
.innerText =

supplierPayroll
.toLocaleString();


document
.getElementById(
"dashProfit"
)
.innerText =

profit
.toLocaleString();

}

// ===============================
// 📦 PRODUCTS
// ===============================

async function saveProduct(){

// CHECK LOGIN
if(!auth.currentUser){
alert("Login First");
return;
}

const uid = auth.currentUser.uid;

// CATEGORY
let category = productCategory.value;

// FIELDS
let name = document.getElementById("pName")?.value || "";
let buy = document.getElementById("pBuy")?.value || 0;
let sell = document.getElementById("pSell")?.value || 0;
let qty = document.getElementById("pQty")?.value || 0;

// VALIDATION
if(!name){
alert("Enter product name");
return;
}

// SAVE
await addDoc(
collection(db,"users",uid,"products"),
{
category,
name,
buy:Number(buy),
sell:Number(sell),
qty:Number(qty),
createdAt:new Date()
}
);

alert("✅ Product Saved");

// REFRESH
loadProducts();
}


// ===============================
// CHANGE PRODUCT FIELDS
// ===============================
window.changeProductFields = function(){

let type = productCategory.value;

dynamicFields.innerHTML = "";

// INVENTORY
if(type === "inventory"){

dynamicFields.innerHTML = `
<input id="pName" placeholder="Product Name">
<input id="pBuy" type="number" placeholder="Buy Price">
<input id="pSell" type="number" placeholder="Sell Price">
<input id="pQty" type="number" placeholder="Quantity">
`;
}

// RAW
else if(type === "raw"){

dynamicFields.innerHTML = `
<input id="pName" placeholder="Raw Material Name">
<input id="pBuy" type="number" placeholder="Buy Price">
`;
}

// FINISHED
else if(type === "finished"){

dynamicFields.innerHTML = `
<input id="pName" placeholder="Finished Goods Name">
<input id="pSell" type="number" placeholder="Sell Price">
`;
}

};


let visibleProducts = 5;


// ===============================
// LOAD PRODUCTS
// ===============================
async function loadProducts(){

if(!auth.currentUser) return;

const uid = auth.currentUser.uid;

productList.innerHTML = "";

// GET
const snap = await getDocs(
collection(db,"users",uid,"products")
);

let products = [];

snap.forEach(docSnap=>{
products.push({
id: docSnap.id,
...docSnap.data()
});
});

products.reverse();

let visible = products.slice(0, visibleProducts);

visible.forEach(p=>{

productList.innerHTML += `
<div class="card" style="
display:flex;
justify-content:space-between;
align-items:center;
padding:12px;
border-radius:14px;
margin-bottom:8px;
">

<div class="productInfo"
data-id="${p.id}"
data-name="${p.name}"
data-buy="${p.buy||0}"
data-sell="${p.sell||0}"
data-qty="${p.qty||0}"
data-category="${p.category||''}"
style="flex:1;cursor:pointer;">

<div style="font-size:16px;font-weight:bold;color:#222;">
${p.name}
</div>

<div style="font-size:13px;color:gray;margin-top:3px;">
Qty: ${p.qty||0}
</div>

</div>

<button class="deleteBtn"
data-id="${p.id}"
style="padding:6px 10px;background:#ff4d4f;border:none;border-radius:8px;">
✕
</button>

</div>
`;
});


// SEE MORE
if(visibleProducts < products.length){

productList.innerHTML += `
<button onclick="showMoreProducts()" style="margin-top:10px;">
See More
</button>
`;
}


// EVENTS
document.querySelectorAll(".productInfo").forEach(item=>{
item.onclick = function(){
openProductView(
this.dataset.id,
this.dataset.name,
this.dataset.category,
this.dataset.buy,
this.dataset.sell,
this.dataset.qty
);
};
});

document.querySelectorAll(".deleteBtn").forEach(btn=>{
btn.onclick = async function(){

let id = this.dataset.id;

if(confirm("Delete Product?")){

const uid = auth.currentUser.uid;

await deleteDoc(
doc(db,"users",uid,"products",id)
);

loadProducts();
}
};
});

}

// ===============================
// 🔥 SHOW MORE PRODUCTS
// ===============================
window.showMoreProducts = function(){

  visibleProducts += 25;

  loadProducts();

};


// ===============================
// 🔍 PRODUCT VIEW
// ===============================
window.openProductView = function(
  id,
  name,
  type,
  buy,
  sell,
  qty
){

  openSection("productViewSection");

  productView.innerHTML = `

    <div class="card">

      <h2>${name}</h2>

      <br>

      📦 Type: ${type}<br><br>

      💰 Buy Price: ${buy}<br><br>

      🛒 Sell Price: ${sell}<br><br>

      📊 Quantity: ${qty}

    </div>

  `;
}

// ===============================
// 🚚 SUPPLIERS
// ===============================

window.openSuppliers = async function(){

  document.getElementById("suppliersSection").style.display = "block";

  await loadSuppliers();

};

window.openAddSupplier = function () {
  document.getElementById("addSupplierPopup").style.display = "block";
};

window.closeAddSupplier = function () {
  document.getElementById("addSupplierPopup").style.display = "none";
};

// =========================
// SAVE SUPPLIER
// =========================

window.saveSupplier = async function(){

const btn =
document.getElementById(
"saveSupplierBtn"
);

try{

if(!auth.currentUser){

alert("Login First");

return;

}

const uid =
auth.currentUser.uid;


// LOADING
btn.innerText =
"Saving...";

btn.disabled =
true;


let file =
sPhoto.files[0];


if(
!sName.value
||
!sPhone.value
){

alert(
"⚠️ Name and Phone are required"
);

return;

}


let supplierData = {

name:
sName.value,

phone:
sPhone.value,

location:
sLocation.value || "",

createdAt:
new Date()

};


const saveToDB =
async()=>{

await addDoc(

collection(
db,
"users",
uid,
"suppliers"
),

supplierData

);

await loadSuppliers();

closeAddSupplier();

clearSupplierForm();

alert(
"✔ Supplier saved successfully!"
);

};


// PHOTO
if(file){

let reader =
new FileReader();

reader.onload =
async function(){

supplierData.photo =
reader.result;

await saveToDB();

};

reader.readAsDataURL(
file
);

}

else{

supplierData.photo =
"";

await saveToDB();

}

}

catch(error){

console.error(
error
);

alert(
error.message
);

}

finally{

btn.innerText =
"💾 Save";

btn.disabled =
false;

}

};


// =========================
// SEARCH SUPPLIERS
// =========================

window.searchSuppliers = async function () {

  // CHECK LOGIN
  if (!auth.currentUser) {

    alert("Login First");

    return;

  }

  const uid = auth.currentUser.uid;

  const q =
    document
      .getElementById("supplierSearch")
      .value
      .toLowerCase();

  const box =
    document.getElementById("supplierList");

  box.innerHTML = "Loading...";

  try {

    const snap =
      await getDocs(

        collection(
          db,
          "users",
          uid,
          "suppliers"
        )

      );

    box.innerHTML = "";

    let suppliers = [];

    snap.forEach(docSnap => {

      suppliers.push({

        id: docSnap.id,

        ...docSnap.data()

      });

    });

    suppliers.reverse();

    let filtered =
      suppliers.filter(s => {

        const name =
          (s.name || "")
          .toLowerCase();

        const location =
          (s.location || "")
          .toLowerCase();

        return (
          name.includes(q) ||
          location.includes(q)
        );

      });

    if (filtered.length === 0) {

      box.innerHTML = `

        <div style="
          text-align:center;
          color:#777;
          padding:15px;
        ">

          No suppliers found

        </div>

      `;

      return;

    }

    filtered.forEach(s => {

      box.innerHTML += `

        <div

          onclick="openSupplierView('${s.id}')"

          style="
            background:white;
            padding:10px;
            border-radius:8px;
            margin-bottom:8px;
            box-shadow:0 1px 4px rgba(0,0,0,.1);
            cursor:pointer;

            display:flex;

            justify-content:space-between;

            align-items:center;
          "

        >

          <b>

            ${s.name || ""}

          </b>

          <span style="
            color:#666;
            font-size:13px;
          ">

            📍 ${s.location || "No location"}

          </span>

        </div>

      `;

    });

  }

  catch (error) {

    console.error(error);

    box.innerHTML =
      "Error loading suppliers";

  }

};


// =========================
// LOAD SUPPLIERS
// =========================
async function loadSuppliers() {

  // CHECK LOGIN
  if (!auth.currentUser) {

    return;

  }

  const uid =
    auth.currentUser.uid;

  const box =
    document.getElementById(
      "supplierList"
    );

  box.innerHTML =
    "Loading...";

  try {

    const snap =
      await getDocs(

        collection(
          db,
          "users",
          uid,
          "suppliers"
        )

      );

    box.innerHTML = "";

    let suppliers = [];

    snap.forEach(docSnap => {

      suppliers.push({

        id:
          docSnap.id,

        ...docSnap.data()

      });

    });

    // NEWEST FIRST
    suppliers.reverse();

    let visible =
      suppliers.slice(
        0,
        visibleSuppliers
      );

    visible.forEach(s => {

      box.innerHTML += `

        <div

          onclick="openSupplierView('${s.id}')"

          style="
            background:white;
            padding:10px;
            border-radius:8px;
            margin-bottom:8px;
            box-shadow:0 1px 4px rgba(0,0,0,.1);
            cursor:pointer;

            display:flex;

            justify-content:space-between;

            align-items:center;
          "

        >

          <b>

            ${s.name || ""}

          </b>

          <span style="
            color:#666;
            font-size:13px;
          ">

            📍
            ${s.location || "No location"}

          </span>

        </div>

      `;

    });

    // SHOW MORE
    if (
      visibleSuppliers <
      suppliers.length
    ) {

      box.innerHTML += `

        <button

          onclick="showMoreSuppliers()"

          style="
            width:100%;
            padding:10px;
            border:none;
            background:#eee;
            border-radius:8px;
            margin-top:10px;
          "

        >

          See More

        </button>

      `;

    }

  }

  catch (error) {

    console.error(error);

    box.innerHTML =
      "Error loading suppliers";

  }

}


// =========================
// SHOW MORE
// =========================
window.showMoreSuppliers = function () {
  visibleSuppliers += 25;
  loadSuppliers();
};


// =========================
// OPEN SUPPLIER VIEW
// =========================

window.openSupplierView = async function (id) {

  // CHECK LOGIN
  if (!auth.currentUser) {

    alert("Login First");

    return;

  }

  const uid =
    auth.currentUser.uid;

  try {

    const snap =
      await getDoc(

        doc(
          db,
          "users",
          uid,
          "suppliers",
          id
        )

      );

    if (!snap.exists()) {

      alert(
        "Supplier not found"
      );

      return;

    }

    const s =
      snap.data();

    currentSupplier = {

      id,

      ...s

    };

    document
      .getElementById(
        "suppliersSection"
      )
      .style.display =
      "none";

    const profile =
      document.getElementById(
        "supplierProfile"
      );

    profile.style.display =
      "block";

    profile.innerHTML = `

<div style="
max-width:380px;
margin:auto;
padding:10px;
font-family:Arial;
position:relative;
">

<div style="
position:absolute;
top:10px;
right:10px;
display:flex;
gap:8px;
">

<button
onclick="menuEdit()"

style="
width:32px;
height:32px;
border:none;
border-radius:50%;
background:#4CAF50;
color:white;
cursor:pointer;
">

✏️

</button>

<button
onclick="menuDelete()"

style="
width:32px;
height:32px;
border:none;
border-radius:50%;
background:#f44336;
color:white;
cursor:pointer;
">

🗑

</button>

</div>


<div style="
background:#2196F3;
color:white;
padding:10px;
border-radius:10px;
text-align:center;
">

<h3 style="
margin:0;
font-size:16px;
">

${s.name || ""}

</h3>

</div>


<div style="
margin-top:10px;
display:flex;
flex-direction:column;
gap:8px;
">

<div style="
background:#f5f5f5;
padding:8px;
border-radius:8px;
">

📞
${s.phone || "No phone"}

</div>

<div style="
background:#f5f5f5;
padding:8px;
border-radius:8px;
">

📍
${s.location || "No location"}

</div>

</div>


<button

onclick="openSaleBuilder()"

style="
width:100%;
margin-top:15px;
padding:10px;
border:none;
border-radius:8px;
background:#FF9800;
color:white;
cursor:pointer;
">

💰 New Sale

</button>


<button

onclick="openSupplierHistory()"

style="
width:100%;
margin-top:10px;
padding:10px;
border:none;
border-radius:8px;
background:#673AB7;
color:white;
cursor:pointer;
">

📋 History

</button>

</div>

`;

  }

  catch (error) {

    console.error(error);

    alert(
      "Error loading supplier"
    );

  }

};


window.menuDelete = async function () {

  try {

    if (!auth.currentUser) {

      alert("Login First");

      return;

    }

    if (!currentSupplier || !currentSupplier.id) {

      alert("No supplier selected");

      return;

    }

    const uid =
      auth.currentUser.uid;

    let confirmDelete =
      confirm(
        "Are you sure you want to delete this supplier?"
      );

    if (!confirmDelete) return;

    await deleteDoc(

      doc(
        db,
        "users",
        uid,
        "suppliers",
        currentSupplier.id
      )

    );

    alert("Deleted successfully 🗑");

    document
      .getElementById("supplierProfile")
      .style.display = "none";

    document
      .getElementById("suppliersSection")
      .style.display = "block";

    loadSuppliers();

  }

  catch (err) {

    console.error(err);

    alert("Error deleting supplier ❌");

  }

};



window.menuEdit = async function () {

  try {

    if (!auth.currentUser) {

      alert("Login First");

      return;

    }

    if (!currentSupplier || !currentSupplier.id) {

      alert("No supplier selected");

      return;

    }

    const uid =
      auth.currentUser.uid;

    let newName =
      prompt(
        "Supplier Name",
        currentSupplier.name || ""
      );

    if (!newName) return;

    let newPhone =
      prompt(
        "Phone",
        currentSupplier.phone || ""
      );

    let newLocation =
      prompt(
        "Location",
        currentSupplier.location || ""
      );

    await updateDoc(

      doc(
        db,
        "users",
        uid,
        "suppliers",
        currentSupplier.id
      ),

      {
        name: newName,
        phone: newPhone,
        location: newLocation
      }

    );

    alert("Updated successfully ✅");

    // refresh view
    openSupplierView(currentSupplier.id);

  }

  catch (err) {

    console.error(err);

    alert("Error updating supplier ❌");

  }

};


window.openSaleBuilder = async function(){

  try{

    // CHECK LOGIN
    if(!auth.currentUser){
      alert("Login First");
      return;
    }

    const uid = auth.currentUser.uid;

    // RESET
    saleItems = [];

    document.getElementById(
      "saleItemsList"
    ).innerHTML = "";

    document.getElementById(
      "saleBuilder"
    ).style.display = "block";

    const select =
      document.getElementById(
        "saleProduct"
      );

    select.innerHTML = "";

    // GET USER PRODUCTS
    const snap =
      await getDocs(
        collection(
          db,
          "users",
          uid,
          "products"
        )
      );

    let found = false;

    snap.forEach(docSnap=>{

      const p =
        docSnap.data();

      const category =
        (
          p.category ||
          ""
        ).toLowerCase();

      // ONLY RAW + INVENTORY
      const allowed =
      [
        "raw",
        "raw material",
        "inventory"
      ];

      if(
        !allowed.includes(
          category
        )
      ){
        return;
      }

      found = true;

      select.innerHTML += `

        <option value="${docSnap.id}">

          ${p.name}
          (Qty:
          ${p.qty || 0})

        </option>

      `;

    });

    // EMPTY
    if(!found){

      select.innerHTML = `

        <option>

          No Products

        </option>

      `;

    }

  }

  catch(err){

    console.error(err);

    alert(
      "Failed to load products"
    );

  }

};


window.filterSaleProducts = function(){

  try{

    const q =
      document
      .getElementById(
        "productSearch"
      )
      .value
      .toLowerCase()
      .trim();

    // CHECK ARRAY
    if(
      !window.allSupplierProducts
      ||
      !Array.isArray(
        allSupplierProducts
      )
    ){

      return;

    }

    const filtered =
      allSupplierProducts.filter(
        p =>

        (
          p.name ||
          ""
        )

        .toLowerCase()

        .includes(q)

      );

    // CHECK FUNCTION
    if(
      typeof
      renderSupplierProducts
      ===
      "function"
    ){

      renderSupplierProducts(
        filtered
      );

    }

  }

  catch(err){

    console.error(
      err
    );

  }

};


window.addSaleItem = async function(){

  try{

    // CHECK LOGIN
    if(!auth.currentUser){

      alert("Login First");

      return;

    }

    const uid =
      auth.currentUser.uid;

    // VALUES
    const productId =
      document
      .getElementById(
        "saleProduct"
      )
      .value;

    const qty =
      Number(
        document
        .getElementById(
          "saleQty"
        )
        .value
      );

    // VALIDATION
    if(
      !productId ||
      qty <= 0
    ){

      alert(
        "Select product and enter quantity"
      );

      return;

    }

    // GET PRODUCT
    const snap =
      await getDoc(

        doc(
          db,
          "users",
          uid,
          "products",
          productId
        )

      );

    if(
      !snap.exists()
    ){

      alert(
        "Product not found"
      );

      return;

    }

    const p =
      snap.data();

    // STOCK CHECK
    if(
      qty >
      Number(
        p.qty || 0
      )
    ){

      alert(
        "Quantity exceeds stock"
      );

      return;

    }

    // SAVE ITEM
    saleItems.push({

      id:
      snap.id,

      product:
      p.name,

      qty:
      qty,

      buy:
      Number(
        p.buy || 0
      ),

      sell:
      Number(
        p.sell || 0
      )

    });

    // REFRESH
    renderSaleItems();

    document
      .getElementById(
        "saleQty"
      )
      .value = "";

  }

  catch(err){

    console.error(
      err
    );

    alert(
      "Failed to add item"
    );

  }

};


function renderSaleItems(){

  const box =
    document.getElementById(
      "saleItemsList"
    );

  if(!box){
    return;
  }

  let html = "";

  let total = 0;

  // EMPTY
  if(
    !saleItems ||
    saleItems.length === 0
  ){

    box.innerHTML = `

      <div style="
        padding:10px;
        text-align:center;
        color:#777;
      ">

        No items added

      </div>

    `;

    return;

  }

  saleItems.forEach(item=>{

    const qty =
      Number(
        item.qty || 0
      );

    const buy =
      Number(
        item.buy || 0
      );

    const lineTotal =
      qty * buy;

    total += lineTotal;

    html += `

      <div style="
        padding:8px;
        margin-top:6px;
        background:#f5f5f5;
        border-radius:8px;
      ">

        ${item.product || "Unknown"}

        :

        ${qty}

        ×

        ${buy.toLocaleString()}

        =

        <b>

          ${lineTotal.toLocaleString()} BIF

        </b>

      </div>

    `;

  });

  html += `

    <div style="
      margin-top:10px;
      padding:10px;
      background:#E8F5E9;
      border-radius:8px;
      font-weight:bold;
    ">

      💰 Total:

      ${total.toLocaleString()} BIF

    </div>

  `;

  box.innerHTML =
    html;

}


window.finishSale = async function(){

  try{

    // CHECK LOGIN
    if(!auth.currentUser){

      alert("Login First");

      return;

    }

    const uid =
      auth.currentUser.uid;

    // CHECK SUPPLIER
    if(
      !currentSupplier
    ){

      alert(
        "Select supplier first"
      );

      return;

    }

    // CHECK ITEMS
    if(
      saleItems.length === 0
    ){

      alert(
        "Add products first"
      );

      return;

    }

    // TOTAL
    let total = 0;

    saleItems.forEach(
      item=>{

        total +=

        Number(
          item.buy || 0
        )

        *

        Number(
          item.qty || 0
        );

      }
    );

    // SAVE HISTORY
    await addDoc(

      collection(
        db,
        "supplierHistory"
      ),

      {

        supplierId:
        currentSupplier.id,

        supplierName:
        currentSupplier.name,

        items:
        saleItems,

        total:
        total,

        createdAt:
        new Date()

      }

    );

    // UPDATE STOCK
    for(
      const item
      of
      saleItems
    ){

      const ref =
      doc(

        db,

        "users",

        uid,

        "products",

        item.id

      );

      const snap =
      await getDoc(
        ref
      );

      if(
        snap.exists()
      ){

        const p =
        snap.data();

        const newQty =

          Number(
            p.qty || 0
          )

          +

          Number(
            item.qty || 0
          );

        await updateDoc(

          ref,

          {

            qty:
            newQty

          }

        );

      }

    }

    // RESET
    saleItems = [];

    document
    .getElementById(
      "saleItemsList"
    )
    .innerHTML = "";

    document
    .getElementById(
      "saleBuilder"
    )
    .style.display =
    "none";

    alert(
      "✅ Purchase saved + Stock updated"
    );

    loadProducts();

  }

  catch(err){

    console.error(
      err
    );

    alert(
      "Failed to finish sale"
    );

  }

};



window.openSupplierHistory = async function(){

  try{

    // CHECK
    if(
      !currentSupplier ||
      !currentSupplier.id
    ){

      alert(
        "No supplier selected"
      );

      return;

    }

    document.getElementById(
      "supplierProfile"
    ).style.display =
    "none";

    document.getElementById(
      "supplierHistorySection"
    ).style.display =
    "block";

    const box =
      document.getElementById(
        "supplierHistoryList"
      );

    box.innerHTML =
      "Loading...";

    let totalPurchases =
      0;

    let totalProducts =
      0;

    const snap =
      await getDocs(

        collection(
          db,
          "supplierHistory"
        )

      );

    let history = [];

    snap.forEach(
      docSnap=>{

        const h =
          docSnap.data();

        if(
          h.supplierId !==
          currentSupplier.id
        ){

          return;

        }

        history.push({

          id:
          docSnap.id,

          ...h

        });

      }

    );

    history.reverse();

    box.innerHTML =
      "";

    if(
      history.length === 0
    ){

      box.innerHTML = `

        <div style="
          text-align:center;
          padding:15px;
          color:#777;
        ">

          No history

        </div>

      `;

      return;

    }

    history.forEach(h=>{

      totalPurchases +=
      Number(
        h.total || 0
      );

      (
        h.items ||
        []
      ).forEach(
        item=>{

          totalProducts +=
          Number(
            item.qty || 0
          );

        }
      );

      let saleDate =
      "No Date";

      try{

        if(
          h.createdAt
        ){

          saleDate =

          h.createdAt

          .toDate()

          .toLocaleDateString();

        }

      }

      catch{}

      box.innerHTML += `

        <div

        onclick="openHistoryView('${h.id}')"

        style="
          background:white;
          padding:10px;
          border-radius:8px;
          margin-bottom:10px;
          box-shadow:0 1px 4px rgba(0,0,0,.1);
          position:relative;
          cursor:pointer;
        "

        >

        <button

        onclick="
        event.stopPropagation();

        deleteSupplierHistory(
        '${h.id}'
        )

        "

        style="
          position:absolute;
          top:10px;
          right:10px;
          width:28px;
          height:28px;
          border:none;
          border-radius:50%;
          background:#f44336;
          color:white;
        "

        >

        🗑

        </button>

        <div>

        📅

        ${saleDate}

        </div>

        <div style="
          margin-top:5px;
          color:#4CAF50;
          font-weight:bold;
        ">

        💰 Total:

        ${Number(
          h.total || 0
        ).toLocaleString()}

        BIF

        </div>

        </div>

      `;

    });

    box.innerHTML = `

      <div style="
        background:#f5f5f5;
        padding:10px;
        border-radius:10px;
        margin-bottom:15px;
      ">

      <div>

      💰 Total Purchases:

      ${totalPurchases.toLocaleString()}

      BIF

      </div>

      <div

      onclick="openSupplierProductsSummary()"

      style="
      margin-top:5px;
      color:#2196F3;
      cursor:pointer;
      font-weight:bold;
      "

      >

      📦 Total Products:

      ${totalProducts.toLocaleString()}

      </div>

      </div>

    `

    +

    box.innerHTML;

  }

  catch(err){

    console.error(
      err
    );

    alert(
      "Failed to load history"
    );

  }

};



window.openSupplierProductsSummary =
async function(){

try{

// CHECK
if(
!currentSupplier
||
!currentSupplier.id
){

alert(
"No supplier selected"
);

return;

}

const box =
document.getElementById(
"supplierHistoryList"
);

box.innerHTML =
"Loading...";

// SUMMARY
let summary = {};

// GET HISTORY
const snap =
await getDocs(

collection(
db,
"supplierHistory"
)

);

// LOOP
snap.forEach(
docSnap=>{

const h =
docSnap.data();

if(
h.supplierId
!==
currentSupplier.id
){

return;

}

// ITEMS
(
h.items
||
[]

).forEach(
item=>{

const product =
item.product
||
"Unknown";

if(
!summary[
product
]
){

summary[
product
] = {

qty:0,

amount:0

};

}

const qty =
Number(
item.qty
||
0
);

const buy =
Number(
item.buy
||
0
);

summary[
product
]
.qty
+=
qty;

summary[
product
]
.amount
+=
(
qty
*
buy
);

}

);

}

);

// HEADER
let html = `

<button

onclick="
openSupplierHistory()
"

style="
margin-bottom:10px;
padding:8px 12px;
border:none;
border-radius:6px;
background:#eee;
"

>

🔙 Back

</button>

<h3>

📦 Products Summary

</h3>

`;

// EMPTY
if(
Object.keys(
summary
).length
===
0
){

html += `

<div style="
padding:15px;
text-align:center;
color:#777;
">

No products

</div>

`;

box.innerHTML =
html;

return;

}

// RENDER
Object
.keys(
summary
)

.forEach(
product=>{

const p =
summary[
product
];

html += `

<div

style="
display:flex;
justify-content:space-between;
align-items:center;

background:#f5f5f5;

padding:10px;

border-radius:8px;

margin-bottom:8px;
"

>

<div
style="
flex:1;
">

<b>

${product}

</b>

</div>

<div
style="
min-width:60px;
text-align:center;
">

${Number(
p.qty
).toLocaleString()}

</div>

<div
style="
min-width:120px;
text-align:right;
color:#4CAF50;
font-weight:bold;
">

${Number(
p.amount
).toLocaleString()}

BIF

</div>

</div>

`;

}

);

box.innerHTML =
html;

}

catch(err){

console.error(
err
);

alert(
"Failed to load summary"
);

}

};



window.deleteSupplierHistory = async function(id){

try{

// CHECK LOGIN
if(!auth.currentUser){
alert("Login First");
return;
}

const uid =
auth.currentUser.uid;


// CONFIRM
const ok =
confirm(
"Delete this sale history?"
);

if(!ok){
return;
}


// DELETE
await deleteDoc(

doc(
db,
"users",
uid,
"supplierHistory",
id
)

);


// REFRESH
await openSupplierHistory();

alert(
"🗑 History deleted"
);

}

catch(err){

console.error(err);

alert(
"Error deleting history ❌"
);

}

};



window.openHistoryView = async function(historyId){

  try{

    // CHECK LOGIN
    if(!auth.currentUser){
      alert("Login First");
      return;
    }

    const uid = auth.currentUser.uid;

    // GET DOC (USER-BASED PATH)
    const snap = await getDoc(
      doc(db,"users",uid,"supplierHistory",historyId)
    );

    if(!snap.exists()) return;

    const h = snap.data();

    let itemsHtml = "";

    (h.items || []).forEach(item => {

      const lineTotal =
        Number(item.qty || 0) *
        Number(item.buy || 0);

      itemsHtml += `
        <div style="
          display:flex;
          justify-content:space-between;
          align-items:center;
          background:#f5f5f5;
          padding:10px;
          border-radius:8px;
          margin-bottom:8px;
          font-size:14px;
        ">

          <div style="flex:1;">
            <b>${item.product}</b>
          </div>

          <div style="min-width:120px;text-align:center;">
            ${item.qty} × ${Number(item.buy || 0).toLocaleString()}
          </div>

          <b style="color:#4CAF50;min-width:120px;text-align:right;">
            ${lineTotal.toLocaleString()} BIF
          </b>

        </div>
      `;
    });

    document.getElementById("supplierHistoryList").innerHTML = `
      <button onclick="openSupplierHistory()" style="
        margin-bottom:10px;
        padding:8px 12px;
        border:none;
        border-radius:6px;
        background:#eee;
        cursor:pointer;
      ">
        🔙 Back
      </button>

      <div style="
        background:white;
        padding:10px;
        border-radius:10px;
        box-shadow:0 1px 4px rgba(0,0,0,0.1);
      ">

        <h3 style="margin-top:0;">📋 Sale Details</h3>

        ${itemsHtml}

        <hr>

        <div style="
          font-size:16px;
          font-weight:bold;
          color:#4CAF50;
          text-align:right;
        ">
          💰 Total: ${(h.total || 0).toLocaleString()} BIF
        </div>

      </div>
    `;

  } catch(err){
    console.error(err);
    alert("Error opening history ❌");
  }

};



window.openSupplierPayroll = async function(){

  try{

    // CHECK LOGIN
    if(!auth.currentUser){
      alert("Login First");
      return;
    }

    const uid = auth.currentUser.uid;

    document.getElementById("suppliersSection").style.display = "none";
    document.getElementById("supplierPayrollSection").style.display = "block";

    const totalBox = document.getElementById("supplierPayrollTotal");
    const listBox = document.getElementById("supplierPayrollList");

    totalBox.innerHTML = "";
    listBox.innerHTML = "";

    let grandTotal = 0;
    let suppliers = {};

    // 🔥 FIXED PATH (USER BASED)
    const snap = await getDocs(
      collection(db,"users",uid,"supplierHistory")
    );

    snap.forEach(docSnap => {

      const h = docSnap.data();

      const name = h.supplierName || "Unknown";
      const amount = Number(h.total || 0);

      grandTotal += amount;

      if(!suppliers[name]){
        suppliers[name] = 0;
      }

      suppliers[name] += amount;
    });

    totalBox.innerHTML = `
      <div style="
        background:#FFF3E0;
        padding:12px;
        border-radius:10px;
        margin-bottom:10px;
        font-weight:bold;
        text-align:center;
      ">
        💰 Total Payroll:
        ${grandTotal.toLocaleString()} BIF
      </div>
    `;

    Object.keys(suppliers).forEach(name => {

      listBox.innerHTML += `
        <div
          class="supplierPayrollCard"
          data-name="${name.toLowerCase()}"
          style="
            background:white;
            padding:10px;
            border-radius:8px;
            margin-bottom:8px;
            display:flex;
            justify-content:space-between;
            align-items:center;
          "
        >

          <div
            onclick="openSupplierPayrollHistory('${name}')"
            style="flex:1;cursor:pointer;"
          >
            <b style="font-size:14px;color:#2196F3;">
              ${name}
            </b>
          </div>

          <div style="
            text-align:right;
            color:#4CAF50;
            font-weight:bold;
            font-size:13px;
          ">
            ${suppliers[name].toLocaleString()} BIF
          </div>

        </div>
      `;
    });

  } catch(err){
    console.error(err);
    alert("Error loading payroll ❌");
  }

};


window.openSupplierPayrollHistory = async function(name){

  try{

    if(!auth.currentUser){
      alert("Login First");
      return;
    }

    const uid = auth.currentUser.uid;

    const listBox = document.getElementById("supplierPayrollList");
    listBox.innerHTML = "";

    let total = 0;
    let itemsHtml = "";

    const snap = await getDocs(
      collection(db,"users",uid,"supplierHistory")
    );

    snap.forEach(docSnap => {

      const h = docSnap.data();

      if(h.supplierName !== name) return;

      total += Number(h.total || 0);

      const date = h.createdAt
        ? h.createdAt.toDate().toLocaleDateString()
        : "No date";

      itemsHtml += `
        <div style="
          background:#f5f5f5;
          padding:10px;
          border-radius:8px;
          margin-bottom:8px;
        ">
          📅 ${date}
          <br>
          💰 ${Number(h.total || 0).toLocaleString()} BIF
        </div>
      `;
    });

    listBox.innerHTML = `
      <button onclick="openSupplierPayroll()" style="
        margin-bottom:10px;
        padding:8px 12px;
        border:none;
        border-radius:6px;
        background:#eee;
        cursor:pointer;
      ">
        🔙 Back
      </button>

      <div style="
        font-weight:bold;
        margin-bottom:10px;
      ">
        ${name} - Total: ${total.toLocaleString()} BIF
      </div>

      ${itemsHtml}
    `;

  } catch(err){
    console.error(err);
    alert("Error loading history ❌");
  }

};


window.searchSupplierPayroll = function(){

  const input = document.getElementById("supplierPayrollSearch");

  if(!input) return;

  const q = input.value.toLowerCase().trim();

  const cards = document.querySelectorAll(".supplierPayrollCard");

  cards.forEach(card => {

    const name = (card.dataset.name || "").toLowerCase();

    const match = name.includes(q);

    card.style.display = match ? "flex" : "none";

  });

};



window.closeSupplierPayroll = function(){

  const payroll = document.getElementById("supplierPayrollSection");
  const suppliers = document.getElementById("suppliersSection");

  if(payroll) payroll.style.display = "none";
  if(suppliers) suppliers.style.display = "block";

};


window.saveCustomer = async function(){

  try{

    // CHECK LOGIN
    if(!auth.currentUser){
      alert("Login First");
      return;
    }

    const uid = auth.currentUser.uid;

    const name =
      document.getElementById("cName").value.trim();

    const phone =
      document.getElementById("cPhone").value.trim();

    const location =
      document.getElementById("cLocation").value.trim();

    if(!name){
      alert("Enter customer name");
      return;
    }

    await addDoc(
      collection(db,"users",uid,"customers"),
      {
        name,
        phone,
        location,
        createdAt: new Date()
      }
    );

    document.getElementById("cName").value = "";
    document.getElementById("cPhone").value = "";
    document.getElementById("cLocation").value = "";

    document.getElementById("addCustomerPopup").style.display = "none";

    await loadCustomers();

    alert("✅ Customer Saved");

  }catch(err){
    console.error(err);
    alert("Error saving customer ❌");
  }

};


window.openAddCustomer = function(){

document.getElementById("addCustomerPopup").style.display = "block";

};


window.loadCustomers = async function () {

  const box = document.getElementById("customerList");

  // optional loading state
  box.innerHTML = "Loading...";

  const snap = await getDocs(
    collection(db, "customers")
  );

  box.innerHTML = "";

  snap.forEach(docSnap => {

    const c = docSnap.data();

    box.innerHTML += `
      <div
        onclick="openCustomerView('${docSnap.id}')"
        style="
          background:white;
          padding:10px;
          border-radius:8px;
          margin-bottom:8px;
          box-shadow:0 1px 4px rgba(0,0,0,.1);
          cursor:pointer;
          display:flex;
          justify-content:space-between;
          align-items:center;
        "
      >

        <b>
          ${c.name || ""}
        </b>

        <span style="
          color:#666;
          font-size:13px;
        ">
          📍 ${c.location || "No location"}
        </span>

      </div>
    `;
  });

};


window.closeCustomerPopup = function(){

  document.getElementById("addCustomerPopup").style.display = "none";

  document.getElementById("cName").value = "";
  document.getElementById("cPhone").value = "";
  document.getElementById("cLocation").value = "";

};



window.openCustomers = function(){

  document.getElementById("customersSection").style.display = "block";

  loadCustomers();

};


window.searchCustomers = async function () {

  const q = document
    .getElementById("customerSearch")
    .value
    .toLowerCase()
    .trim();

  const box = document.getElementById("customerList");

  const snap = await getDocs(
    collection(db, "customers")
  );

  box.innerHTML = "";

  let found = false;

  snap.forEach(docSnap => {

    const c = docSnap.data();

    const name = (c.name || "").toLowerCase();
    const location = (c.location || "").toLowerCase();

    // filter
    if (!name.includes(q) && !location.includes(q)) return;

    found = true;

    box.innerHTML += `
      <div
        onclick="openCustomerView('${docSnap.id}')"
        style="
          background:white;
          padding:10px;
          border-radius:8px;
          margin-bottom:8px;
          box-shadow:0 1px 4px rgba(0,0,0,.1);
          cursor:pointer;
          display:flex;
          justify-content:space-between;
          align-items:center;
        "
      >

        <b>${c.name || ""}</b>

        <span style="color:#666;font-size:13px;">
          📍 ${c.location || "No location"}
        </span>

      </div>
    `;
  });

  if (!found) {
    box.innerHTML = `
      <div style="
        text-align:center;
        color:#777;
        padding:15px;
      ">
        No customers found
      </div>
    `;
  }

};


window.openCustomerView = async function (id) {

  try {

    const snap = await getDoc(doc(db, "customers", id));

    if (!snap.exists()) {
      alert("Customer not found");
      return;
    }

    const c = snap.data();

    window.currentCustomer = { id, ...c };

    document.getElementById("customersSection").style.display = "none";

    const profile = document.getElementById("customerProfile");

    profile.style.display = "block";
    profile.style.position = "fixed";
    profile.style.top = "0";
    profile.style.left = "0";
    profile.style.width = "100%";
    profile.style.height = "100%";
    profile.style.background = "#fafafa";
    profile.style.zIndex = "9999";
    profile.style.overflow = "auto";

    profile.innerHTML = `
      <div style="max-width:360px;margin:auto;padding:12px;font-family:Arial;">

        <!-- TOP BAR -->
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">

          <button onclick="closeCustomerProfile()"
            style="border:none;background:white;border-radius:8px;padding:6px 10px;">
            🔙
          </button>

          <button onclick="editCustomer('${id}')"
            style="border:none;background:#4CAF50;color:white;border-radius:8px;padding:6px 10px;">
            ✏️
          </button>

          <button onclick="deleteCustomer('${id}')"
            style="border:none;background:#f44336;color:white;border-radius:8px;padding:6px 10px;">
            🗑
          </button>

        </div>

        <!-- CUSTOMER CARD -->
        <div style="background:white;padding:12px;border-radius:12px;box-shadow:0 1px 4px rgba(0,0,0,.08);">

          <h3 style="margin:0;font-size:17px;">
            ${c.name || "No name"}
          </h3>

          <div style="margin-top:10px;font-size:13px;color:#555;">
            📞 ${c.phone || "No phone"}
          </div>

          <div style="margin-top:6px;font-size:13px;color:#555;">
            📍 ${c.location || "No location"}
          </div>

        </div>

        <!-- ACTIONS -->
        <div style="display:flex;gap:8px;margin-top:12px;">

          <button onclick="openCustomerSaleBuilder()"
            style="flex:1;border:none;border-radius:10px;padding:10px;background:#FF9800;color:white;">
            💰 Sale
          </button>

          <button onclick="openCustomerHistory()"
            style="flex:1;border:none;border-radius:10px;padding:10px;background:#673AB7;color:white;">
            📋 History
          </button>

        </div>

      </div>
    `;

  } catch (err) {
    console.error(err);
    alert("Error: " + err.message);
  }

};


window.deleteCustomer = async function () {

  if (!auth.currentUser) {
    alert("Please login first");
    return;
  }

  if (!currentCustomer?.id) {
    alert("No customer selected");
    return;
  }

  const confirmDelete = confirm("Delete this customer?");
  if (!confirmDelete) return;

  try {

    await deleteDoc(
      doc(
        db,
        "users",
        auth.currentUser.uid,
        "customers",
        currentCustomer.id
      )
    );

    alert("Customer deleted");

    closeCustomerProfile();

    loadCustomers();

  } catch (err) {
    console.error(err);
    alert(err.message);
  }

};


window.editCustomer = function () {

  if (!currentCustomer?.id) {
    alert("No customer selected");
    return;
  }

  const popup = document.getElementById("editCustomerPopup");
  const nameEl = document.getElementById("editName");
  const phoneEl = document.getElementById("editPhone");
  const locationEl = document.getElementById("editLocation");

  if (!popup || !nameEl || !phoneEl || !locationEl) {
    console.error("Edit popup elements missing in HTML");
    alert("UI error: missing edit form");
    return;
  }

  const c = currentCustomer;

  popup.style.display = "block";

  nameEl.value = c.name || "";
  phoneEl.value = c.phone || "";
  locationEl.value = c.location || "";

};


window.updateCustomer = async function () {

  if (!auth.currentUser) {
    alert("Please login first");
    return;
  }

  if (!currentCustomer?.id) return;

  const name = document.getElementById("editName").value;
  const phone = document.getElementById("editPhone").value;
  const location = document.getElementById("editLocation").value;

  if (!name) {
    alert("Name required");
    return;
  }

  try {

    await updateDoc(
      doc(
        db,
        "users",
        auth.currentUser.uid,
        "customers",
        currentCustomer.id
      ),
      {
        name,
        phone,
        location
      }
    );

    alert("Updated successfully");

    closeEditCustomer();

    openCustomerView(currentCustomer.id);

    loadCustomers();

  } catch (err) {
    console.error(err);
    alert(err.message);
  }

};


window.closeEditCustomer = function(){
  document.getElementById("editCustomerPopup").style.display = "none";
};

window.closeCustomerProfile = function(){
  document.getElementById("customerProfile").style.display = "none";
  document.getElementById("customersSection").style.display = "block";
};


window.openCustomerSaleBuilder = async function () {

  customerSaleItems = [];

  document.getElementById("customerSaleItemsList").innerHTML = "";

  document.getElementById("customerSaleBuilder").style.display = "block";

  const box = document.getElementById("customerProductsList");

  box.innerHTML = "Loading...";

  const snap = await getDocs(
    collection(db, "products")
  );

  box.innerHTML = "";

  let found = false;

  snap.forEach(docSnap => {

    const p = docSnap.data();
    found = true;

    box.innerHTML += `
      <div style="
        display:flex;
        justify-content:space-between;
        align-items:center;
        background:#f5f5f5;
        padding:10px;
        margin-bottom:8px;
        border-radius:8px;
      ">

        <div>
          <b>${p.name || ""}</b><br>
          <small>Stock: ${p.qty || 0}</small>
        </div>

        <input
          type="number"
          min="0"
          placeholder="Qty"
          class="customerQty"
          data-name="${p.name}"
          data-sell="${p.sell || 0}"
          style="
            width:70px;
            padding:6px;
            text-align:center;
          "
        >

      </div>
    `;
  });

  if (!found) {
    box.innerHTML = `
      <div style="text-align:center;color:#777;padding:10px;">
        No products available
      </div>
    `;
  }

};


window.loadCustomerProducts = async function () {

  const box = document.getElementById("customerProductsList");

  box.innerHTML = "Loading...";

  const snap = await getDocs(collection(db, "products"));

  box.innerHTML = "";

  let found = false;

  snap.forEach(docSnap => {

    const p = docSnap.data();
    found = true;

    box.innerHTML += `
      <div style="
        display:flex;
        align-items:center;
        justify-content:space-between;
        padding:3px 0;
        font-size:13px;
      ">

        <span>
          ${p.name || ""} (${p.qty || 0})
        </span>

        <input
          type="number"
          min="0"
          class="customerQty"
          data-name="${p.name}"
          data-sell="${p.sell || 0}"
          data-stock="${p.qty || 0}"
          placeholder="0"
          style="
            width:45px;
            padding:2px;
            text-align:center;
            border:1px solid #ddd;
            border-radius:3px;
            font-size:12px;
          "
        >

      </div>
    `;
  });

  if (!found) {
    box.innerHTML = `
      <div style="text-align:center;color:#777;padding:10px;">
        No products found
      </div>
    `;
  }
};


window.filterCustomerSaleProducts = function () {

  const input = document.getElementById("customerProductSearch");
  const list = document.getElementById("customerProductsList");

  if (!input || !list) return;

  const q = input.value.toLowerCase();

  list.querySelectorAll("div").forEach(item => {

    const text = (item.textContent || "").toLowerCase();

    item.style.display = text.includes(q) ? "flex" : "none";

  });

};


window.saveSelectedProducts = function () {

  const inputs = document.querySelectorAll(".customerQty");

  let added = 0;
  let hasError = false;

  inputs.forEach(input => {

    const qty = Number(input.value || 0);
    const stock = Number(input.dataset.stock || 0);

    if (qty <= 0) return;

    if (stock > 0 && qty > stock) {
      alert(`${input.dataset.name} stock is only ${stock}`);
      hasError = true;
      return;
    }

    // optional: prevent duplicates
    const existing = customerSaleItems.find(
      i => i.product === input.dataset.name
    );

    if (existing) {
      existing.qty += qty;
    } else {
      customerSaleItems.push({
        product: input.dataset.name,
        qty: qty,
        sell: Number(input.dataset.sell)
      });
    }

    input.value = "";
    added++;
  });

  if (hasError) return; // stop if stock issues

  if (added === 0) {
    alert("No products selected");
    return;
  }

  renderCustomerSaleItems();

  document.getElementById("customerSaleItemsList")
    .scrollIntoView({ behavior: "smooth" });

};


window.addCustomerSaleItem = function () {

  const product = document.getElementById("customerSaleProduct").value;
  const qty = Number(document.getElementById("customerSaleQty").value);

  if (!product || qty <= 0) {
    alert("Select product + quantity");
    return;
  }

  // get selected option (to access price/stock if stored)
  const selectedOption = document.querySelector(
    `#customerSaleProduct option[value="${product}"]`
  );

  const sell = Number(selectedOption?.dataset?.sell || 0);
  const stock = Number(selectedOption?.dataset?.stock || 0);

  if (stock > 0 && qty > stock) {
    alert(`Stock only available: ${stock}`);
    return;
  }

  // prevent duplicates
  const existing = customerSaleItems.find(i => i.product === product);

  if (existing) {
    existing.qty += qty;
  } else {
    customerSaleItems.push({
      product,
      qty,
      sell
    });
  }

  renderCustomerSaleItems();

  document.getElementById("customerSaleQty").value = "";
};


window.renderCustomerSaleItems = function () {

  const box = document.getElementById("customerSaleItemsList");

  if (!customerSaleItems || customerSaleItems.length === 0) {
    box.innerHTML = `
      <div style="text-align:center;color:#777;padding:10px;">
        No items selected
      </div>
    `;
    return;
  }

  let html = "";
  let grandTotal = 0;

  customerSaleItems.forEach((item, index) => {

    const qty = Number(item.qty || 0);
    const sell = Number(item.sell || 0);

    const lineTotal = qty * sell;
    grandTotal += lineTotal;

    html += `
      <div style="
        display:flex;
        justify-content:space-between;
        align-items:center;
        background:#f5f5f5;
        padding:10px;
        border-radius:8px;
        margin-bottom:8px;
        font-size:14px;
      ">

        <div style="flex:1;">
          ${item.product} (${qty})
        </div>

        <div style="
          width:90px;
          text-align:center;
          font-weight:bold;
          color:#4CAF50;
        ">
          ${lineTotal.toLocaleString()}
        </div>

        <button
          onclick="removeCustomerSaleItem(${index})"
          style="
            border:none;
            background:#ffebee;
            color:#f44336;
            width:28px;
            height:28px;
            border-radius:50%;
            cursor:pointer;
          ">
          🗑
        </button>

      </div>
    `;
  });

  html += `
    <div style="
      margin-top:10px;
      padding:10px;
      background:#E8F5E9;
      border-radius:8px;
      font-weight:bold;
      text-align:right;
    ">
      💰 Total: ${grandTotal.toLocaleString()} BIF
    </div>
  `;

  box.innerHTML = html;
};


window.removeCustomerSaleItem = function(index){
  customerSaleItems.splice(index,1);
  renderCustomerSaleItems();
};



window.finishCustomerSale = async function () {

  if (!currentCustomer?.id) {
    alert("No customer selected");
    return;
  }

  if (!customerSaleItems.length) {
    alert("No items added");
    return;
  }

  try {

    let total = 0;

    // GET ALL PRODUCTS ONCE
    const snap = await getDocs(collection(db, "products"));

    const productsMap = {};

    snap.forEach(docSnap => {
      productsMap[docSnap.data().name] = {
        id: docSnap.id,
        ...docSnap.data()
      };
    });

    for (let item of customerSaleItems) {

      const p = productsMap[item.product];

      if (!p) continue;

      // 🚨 STOCK CHECK
      if ((p.qty || 0) < item.qty) {
        alert(`${item.product} stock is not enough`);
        return;
      }

      // UPDATE STOCK
      await updateDoc(doc(db, "products", p.id), {
        qty: (p.qty || 0) - item.qty
      });

      total += Number(p.sell || 0) * Number(item.qty);
    }

    // SAVE HISTORY
    await addDoc(collection(db, "customerHistory"), {
      customerId: currentCustomer.id,
      customerName: currentCustomer.name,
      items: customerSaleItems,
      total,
      createdAt: new Date()
    });

    customerSaleItems = [];

    document.getElementById("customerSaleBuilder").style.display = "none";

    loadCustomers();

    alert("Sale Saved Successfully ✔");

  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};


window.openCustomerHistory = async function () {

  if (!currentCustomer?.id) {
    alert("No customer selected");
    return;
  }

  document.getElementById("customerHistorySection").style.display = "block";

  const box = document.getElementById("customerHistoryList");
  box.innerHTML = "Loading...";

  const snap = await getDocs(collection(db, "customerHistory"));

  let total = 0;
  let html = "";

  snap.forEach(d => {

    const h = d.data();

    if (h.customerId !== currentCustomer.id) return;

    const value = Number(h.total || 0);
    total += value;

    const date = h.createdAt
      ? h.createdAt.toDate().toLocaleDateString()
      : "";

    html += `
      <div onclick="openCustomerHistoryView('${d.id}')"
        style="
          background:white;
          padding:10px;
          border-radius:10px;
          margin-bottom:8px;
          box-shadow:0 1px 4px rgba(0,0,0,.08);
          cursor:pointer;
        ">

        <div style="display:flex;justify-content:space-between;align-items:center;">

          <div>
            <div style="font-size:12px;color:#777;">
              📅 ${date}
            </div>

            <div style="
              font-size:14px;
              font-weight:bold;
              color:#2e7d32;
            ">
              ${value.toLocaleString()} BIF
            </div>
          </div>

          <button onclick="event.stopPropagation(); deleteCustomerHistory('${d.id}')"
            style="
              width:28px;
              height:28px;
              border:none;
              border-radius:50%;
              background:#f44336;
              color:white;
              cursor:pointer;
            ">
            🗑
          </button>

        </div>

      </div>
    `;
  });

  box.innerHTML = `
    <div style="
      background:#e8f5e9;
      padding:10px;
      border-radius:10px;
      margin-bottom:10px;
      font-weight:bold;
      text-align:right;
    ">
      💰 Total Sales: ${total.toLocaleString()} BIF
    </div>
  ` + html;

};


window.openCustomerHistoryView = async function (id) {

  const view = document.getElementById("customerHistoryView");
  const box = document.getElementById("customerHistoryItems");

  if (!view || !box) return;

  view.style.display = "block";
  box.innerHTML = "Loading...";

  const snap = await getDoc(doc(db, "customerHistory", id));

  if (!snap.exists()) {
    box.innerHTML = "<p>History not found</p>";
    return;
  }

  const h = snap.data();

  let total = 0;
  let html = "";

  (h.items || []).forEach(item => {

    const line = Number(item.qty || 0) * Number(item.sell || 0);
    total += line;

    html += `
      <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #eee;">
        <span>${item.product} (${item.qty})</span>
        <span>${line.toLocaleString()} BIF</span>
      </div>
    `;
  });

  const finalTotal = (typeof h.total === "number") ? h.total : total;

  box.innerHTML = html + `
    <div style="margin-top:10px;font-weight:bold;text-align:right;">
      💰 Total: ${finalTotal.toLocaleString()} BIF
    </div>
  `;
};


window.deleteCustomerHistory = async function (id) {

  if (!id) return;

  const ok = confirm("Delete this sale?");
  if (!ok) return;

  try {

    await deleteDoc(doc(db, "customerHistory", id));

    // refresh list properly
    await openCustomerHistory();

    alert("Deleted successfully");

  } catch (err) {
    console.error(err);
    alert(err.message);
  }

};

// ===============================
// 👨‍💼 EMPLOYEES
// ===============================

window.openEmployeeForm = function () {

  const form =
    document.getElementById("employeeForm");

  if (!form) return;

  form.style.display = "block";
};


// ========================
// PAYMENT TYPE
// ========================

window.openEmployeeForm = function(){
  document.getElementById("employeeForm").style.display = "block";
};



window.goDashboard = function () {

  // HIDE EMPLOYEES
  const employees =
    document.getElementById(
      "employeesSection"
    );

  if (employees) {
    employees.style.display = "none";
  }

  // SHOW DASHBOARD
  const dashboard =
    document.getElementById(
      "dashboardTop"
    );

  if (dashboard) {
    dashboard.style.display = "block";
  }

};


window.saveEmployee = async function () {

  try {

    // CHECK LOGIN
    if (!auth.currentUser) {
      alert("Login First");
      return;
    }

    const uid =
      auth.currentUser.uid;

    // FIELDS
    const name =
      document
      .getElementById("employeeName")
      .value
      .trim();

    const phone =
      document
      .getElementById("employeePhone")
      .value
      .trim();

    const role =
      document
      .getElementById("employeeRole")
      .value
      .trim();

    const type =
      document
      .getElementById("employeePaymentType")
      .value;

    const salary =
      Number(
        document
        .getElementById("employeeSalary")
        .value || 0
      );

    const daily =
      Number(
        document
        .getElementById("employeeDailyRate")
        .value || 0
      );

    // VALIDATION
    if (!name) {
      alert("Enter employee name");
      return;
    }

    // SAVE
    await addDoc(

      collection(
        db,
        "users",
        uid,
        "employees"
      ),

      {
        name,
        phone,
        role,

        paymentType: type,

        salary:
          type === "Monthly"
            ? salary
            : 0,

        dailyRate:
          type === "Daily"
            ? daily
            : 0,

        daysWorked: 0,

        earnedDaily: 0,

        monthlyBalance:
          type === "Monthly"
            ? salary
            : 0,

        createdAt:
          new Date()

      }

    );

    alert(
      "✅ Employee saved"
    );

    await loadEmployees();

  }

  catch(err){

    console.error(err);

    alert(
      err.message
    );

  }

};


window.closeEmployeeForm = function () {

  const form =
    document.getElementById(
      "employeeForm"
    );

  if (form) {
    form.style.display = "none";
  }

  const ids = [

    "employeeName",

    "employeePhone",

    "employeeRole",

    "employeeSalary",

    "employeeDailyRate"

  ];

  ids.forEach(id => {

    const el =
      document.getElementById(id);

    if (el) {
      el.value = "";
    }

  });

};


window.toggleEmployeePayment = function () {

  const type =
    document
      .getElementById("employeePaymentType")
      ?.value;

  const salary =
    document.getElementById(
      "employeeSalary"
    );

  const daily =
    document.getElementById(
      "employeeDailyRate"
    );

  if (!salary || !daily) {
    return;
  }

  salary.style.display =
    type === "Monthly"
      ? "block"
      : "none";

  daily.style.display =
    type === "Daily"
      ? "block"
      : "none";

};


window.loadEmployees = async function () {

  try {

    if (!auth.currentUser) {
      return;
    }

    const uid =
      auth.currentUser.uid;

    const box =
      document.getElementById(
        "employeeList"
      );

    if (!box) return;

    box.innerHTML = "";

    const snap =
      await getDocs(

        collection(
          db,
          "users",
          uid,
          "employees"
        )

      );

    snap.forEach(docSnap => {

      const e =
        docSnap.data();

      box.innerHTML += `

        <div
          class="employeeCard"

          data-name="${(e.name || "").toLowerCase()}"

          data-role="${(e.role || "").toLowerCase()}"

          style="
            padding:8px 0;
            margin-bottom:4px;
            display:flex;
            justify-content:space-between;
            align-items:center;
            font-size:13px;
            border-bottom:1px solid #eee;
          "
        >

          <!-- NAME -->
          <div

            onclick="openEmployeeView('${docSnap.id}')"

            style="
              flex:1;
              cursor:pointer;
              display:flex;
              justify-content:space-between;
              align-items:center;
            "

          >

            <div>

              <b style="
                font-size:16px;
                font-weight:600;
              ">
                ${e.name || ""}
              </b>

              <div
                style="
                  color:#666;
                  font-size:12px;
                "
              >
                ${e.role || ""}
              </div>

            </div>

          </div>


          <!-- ATTENDANCE -->
          <div
            style="
              display:flex;
              gap:6px;
            "
          >

            <button

              onclick="
                event.stopPropagation();
                markPresent('${docSnap.id}')
              "

              style="
                width:30px;
                height:30px;
                border:none;
                border-radius:50%;
                background:#4CAF50;
                color:white;
              "

            >

              ✔

            </button>


            <button

              onclick="
                event.stopPropagation();
                markAbsent('${docSnap.id}')
              "

              style="
                width:30px;
                height:30px;
                border:none;
                border-radius:50%;
                background:#f44336;
                color:white;
              "

            >

              ✖

            </button>

          </div>

        </div>

      `;

    });

  }

  catch(err){

    console.error(err);

    alert(
      err.message
    );

  }

};



window.searchEmployees = function () {

  const input =
    document.getElementById(
      "employeeSearch"
    );

  if (!input) return;

  const search =
    input.value
    .toLowerCase()
    .trim();

  const cards =
    document.querySelectorAll(
      ".employeeCard"
    );

  cards.forEach(card => {

    const name =
      (
        card.dataset.name ||
        ""
      ).toLowerCase();

    const role =
      (
        card.dataset.role ||
        ""
      ).toLowerCase();

    card.style.display =

      (
        name.includes(search) ||

        role.includes(search)

      )

      ? "flex"

      : "none";

  });

};


window.markAbsent = async function (id) {

  try {

    if (!auth.currentUser) {
      alert("Login First");
      return;
    }

    const uid =
      auth.currentUser.uid;

    const ref = doc(
      db,
      "users",
      uid,
      "employees",
      id
    );

    const snap =
      await getDoc(ref);

    if (!snap.exists()) {
      alert("Employee not found");
      return;
    }

    const e =
      snap.data();

    const ok =
      confirm(
        `${e.name} is absent?`
      );

    if (!ok) return;

    const monthly =
      Number(
        e.salary || 0
      );

    const penalty =
      monthly / 30;

    await updateDoc(
      ref,
      {

        absent:
          Number(
            e.absent || 0
          ) + 1,

        monthlyPenalty:

          Number(
            e.monthlyPenalty || 0
          ) +

          penalty

      }
    );

    await addDoc(

      collection(
        db,
        "users",
        uid,
        "attendance"
      ),

      {

        employeeId: id,

        employeeName:
          e.name,

        date:
          new Date(),

        status:
          "absent"

      }

    );

    if (
      typeof showToast ===
      "function"
    ) {

      showToast(
        `${e.name} marked as ABSENT ❌`,
        "#f44336"
      );

    }

    await loadEmployees();

  }

  catch(err){

    console.error(err);

    alert(
      err.message
    );

  }

};


window.markPresent = async function (id) {

  try {

    // CHECK LOGIN
    if (!auth.currentUser) {
      alert("Login First");
      return;
    }

    const uid =
      auth.currentUser.uid;

    const ref = doc(
      db,
      "users",
      uid,
      "employees",
      id
    );

    const snap =
      await getDoc(ref);

    if (!snap.exists()) {
      alert("Employee not found");
      return;
    }

    const e =
      snap.data();

    const ok =
      confirm(
        `${e.name} is present?`
      );

    if (!ok) return;

    const daily =
      Number(
        e.dailyRate || 0
      );

    await updateDoc(
      ref,
      {

        present:
          Number(
            e.present || 0
          ) + 1,

        daysWorked:
          Number(
            e.daysWorked || 0
          ) + 1,

        earnedDaily:

          Number(
            e.earnedDaily || 0
          ) +

          daily

      }
    );

    await addDoc(

      collection(
        db,
        "users",
        uid,
        "attendance"
      ),

      {

        employeeId:
          id,

        employeeName:
          e.name,

        date:
          new Date(),

        status:
          "present"

      }

    );

    if (
      typeof showToast ===
      "function"
    ) {

      showToast(
        `${e.name} marked as PRESENT ✔`
      );

    }

    await loadEmployees();

  }

  catch(err){

    console.error(err);

    alert(
      err.message
    );

  }

};




window.deleteEmployee = async function (id) {

  try {

    if (!auth.currentUser) {
      alert("Login First");
      return;
    }

    const uid = auth.currentUser.uid;

    const ok = confirm("Delete employee?");
    if (!ok) return;

    await deleteDoc(
      doc(db, "users", uid, "employees", id)
    );

    await loadEmployees();

    if (typeof showToast === "function") {
      showToast("Employee deleted 🗑");
    }

  } catch (err) {

    console.error(err);
    alert(err.message);

  }

};

window.editEmployee = async function (id) {

  try {

    if (!auth.currentUser) {
      alert("Login First");
      return;
    }

    const uid = auth.currentUser.uid;

    const ref = doc(
      db,
      "users",
      uid,
      "employees",
      id
    );

    const snap = await getDoc(ref);

    if (!snap.exists()) {
      alert("Employee not found");
      return;
    }

    const e = snap.data();

    const name = prompt("Name", e.name || "");
    const phone = prompt("Phone", e.phone || "");
    const role = prompt("Role", e.role || "");

    if (!name) return;

    await updateDoc(ref, {
      name,
      phone,
      role
    });

    await loadEmployees();

    if (typeof showToast === "function") {
      showToast("Employee updated ✏️");
    }

  } catch (err) {

    console.error(err);
    alert(err.message);

  }

};

window.openPayroll = async function () {

  const section =
    document.getElementById("payrollSection");

  if (!section) return;

  section.style.display = "block";

  if (typeof loadPayroll === "function") {
    await loadPayroll();
  }

};


window.closePayroll = function () {

  const section =
    document.getElementById("payrollSection");

  if (!section) return;

  section.style.display = "none";

};

window.loadPayroll = async function () {

  const box = document.getElementById("payrollList");
  if (!box) return;

  box.innerHTML = "";

  const snap = await getDocs(collection(db, "employees"));

  let grandTotal = 0;
  payrollData = [];

  snap.forEach(d => {

    const e = d.data();

    let total = 0;

    if (e.paymentType === "Monthly") {
      total = Number(e.salary || 0);
    } else {
      total =
        Number(e.dailyRate || 0) *
        Number(e.daysWorked || 0);
    }

    grandTotal += total;

    payrollData.push({
      name: e.name,
      total: total
    });

  });

  renderPayroll(payrollData, grandTotal);
};

function renderPayroll(list, grandTotal) {

  const box = document.getElementById("payrollList");
  if (!box) return;

  let html = `
    <div style="
      background:linear-gradient(135deg,#2196F3,#1976D2);
      color:white;
      padding:12px;
      border-radius:10px;
      margin-bottom:10px;
      font-weight:bold;
      text-align:center;
    ">
      💰 Total Payroll: ${grandTotal.toLocaleString()} BIF
    </div>
  `;

  list.forEach(e => {

    html += `
      <div style="
        background:white;
        padding:10px;
        margin-bottom:8px;
        border-radius:8px;
        display:flex;
        justify-content:space-between;
        align-items:center;
      ">
        <b>${e.name}</b>

        <span style="color:#4CAF50;font-weight:bold;">
          ${e.total.toLocaleString()} BIF
        </span>
      </div>
    `;
  });

  box.innerHTML = html;
}


window.searchPayroll = function () {

  const input = document.getElementById("payrollSearch");
  if (!input) return;

  const q = input.value.toLowerCase();

  const filtered = (payrollData || []).filter(e =>
    (e.name || "").toLowerCase().includes(q)
  );

  const newTotal = filtered.reduce(
    (sum, e) => sum + Number(e.total || 0),
    0
  );

  renderPayroll(filtered, newTotal);
};


window.openEmployeeView = async function (id) {

  try {

    if (!auth.currentUser) {
      alert("Login First");
      return;
    }

    const uid = auth.currentUser.uid;

    const profile =
      document.getElementById("employeeProfile");

    if (!profile) return;

    const snap = await getDoc(
      doc(db, "users", uid, "employees", id)
    );

    if (!snap.exists()) {
      alert("Employee not found");
      return;
    }

    const e = snap.data();

    profile.style.display = "block";

    const absentPenalty =
      (e.absent || 0) * ((e.salary || 0) / 30);

    const totalMonthly =
      (e.salary || 0) - absentPenalty;

    const totalDaily =
      (e.dailyRate || 0) * (e.daysWorked || 0);

    profile.innerHTML = `
      <div style="padding:12px;font-family:Arial;background:#f6f7fb;min-height:100%;">

        <!-- TOP BAR -->
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">

          <button onclick="closeEmployeeProfile()" style="width:38px;height:38px;border:none;border-radius:50%;background:white;">
            🔙
          </button>

          <h3 style="margin:0;font-size:18px;">
            👨‍💼 ${e.name}
          </h3>

          <div style="display:flex;gap:6px;">

            <button onclick="editEmployee('${id}')" style="width:36px;height:36px;border:none;border-radius:50%;background:#4CAF50;color:white;">✏️</button>

            <button onclick="deleteEmployee('${id}')" style="width:36px;height:36px;border:none;border-radius:50%;background:#f44336;color:white;">🗑</button>

          </div>

        </div>

        <!-- INFO -->
        <div style="background:white;padding:12px;border-radius:10px;margin-bottom:10px;">
          <b>${e.name}</b><br>
          <small>${e.role || ""}</small><br>
          📞 ${e.phone || ""}
        </div>

        <!-- ATTENDANCE -->
        <div onclick="openAttendance('${id}')" style="background:white;padding:12px;border-radius:10px;margin-bottom:10px;cursor:pointer;display:flex;justify-content:space-between;">
          <b>📅 Attendance</b>
          <span>
            ❌ ${e.absent || 0} &nbsp; ✔ ${e.present || 0}
          </span>
        </div>

        <!-- SALARY -->
        <div style="background:white;padding:14px;border-radius:10px;">

          <p style="margin:0;">
            💰 ${
              e.paymentType === "Monthly"
                ? `${(e.salary || 0).toLocaleString()} BIF (Monthly)`
                : `${(e.dailyRate || 0).toLocaleString()} BIF / Day`
            }
          </p>

          <hr>

          <div style="display:flex;justify-content:space-between;">
            <span>💵 Total</span>

            <b style="color:#2e7d32;">
              ${
                e.paymentType === "Monthly"
                  ? totalMonthly.toFixed(0)
                  : totalDaily.toLocaleString()
              } BIF
            </b>
          </div>

        </div>

      </div>
    `;

  } catch (err) {
    console.error(err);
    alert(err.message);
  }

};



window.openEmployeeView = async function(id) {
  
  try {
    
    if (!auth.currentUser) {
      alert("Login First");
      return;
    }
    
    const uid = auth.currentUser.uid;
    
    const profile =
      document.getElementById("employeeProfile");
    
    if (!profile) return;
    
    const snap = await getDoc(
      doc(db, "users", uid, "employees", id)
    );
    
    if (!snap.exists()) {
      alert("Employee not found");
      return;
    }
    
    const e = snap.data();
    
    profile.style.display = "block";
    
    const absentPenalty =
      (e.absent || 0) * ((e.salary || 0) / 30);
    
    const totalMonthly =
      (e.salary || 0) - absentPenalty;
    
    const totalDaily =
      (e.dailyRate || 0) * (e.daysWorked || 0);
    
    profile.innerHTML = `
      <div style="padding:12px;font-family:Arial;background:#f6f7fb;min-height:100%;">

        <!-- TOP BAR -->
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">

          <button onclick="closeEmployeeProfile()" style="width:38px;height:38px;border:none;border-radius:50%;background:white;">
            🔙
          </button>

          <h3 style="margin:0;font-size:18px;">
            👨‍💼 ${e.name}
          </h3>

          <div style="display:flex;gap:6px;">

            <button onclick="editEmployee('${id}')" style="width:36px;height:36px;border:none;border-radius:50%;background:#4CAF50;color:white;">✏️</button>

            <button onclick="deleteEmployee('${id}')" style="width:36px;height:36px;border:none;border-radius:50%;background:#f44336;color:white;">🗑</button>

          </div>

        </div>

        <!-- INFO -->
        <div style="background:white;padding:12px;border-radius:10px;margin-bottom:10px;">
          <b>${e.name}</b><br>
          <small>${e.role || ""}</small><br>
          📞 ${e.phone || ""}
        </div>

        <!-- ATTENDANCE -->
        <div onclick="openAttendance('${id}')" style="background:white;padding:12px;border-radius:10px;margin-bottom:10px;cursor:pointer;display:flex;justify-content:space-between;">
          <b>📅 Attendance</b>
          <span>
            ❌ ${e.absent || 0} &nbsp; ✔ ${e.present || 0}
          </span>
        </div>

        <!-- SALARY -->
        <div style="background:white;padding:14px;border-radius:10px;">

          <p style="margin:0;">
            💰 ${
              e.paymentType === "Monthly"
                ? `${(e.salary || 0).toLocaleString()} BIF (Monthly)`
                : `${(e.dailyRate || 0).toLocaleString()} BIF / Day`
            }
          </p>

          <hr>

          <div style="display:flex;justify-content:space-between;">
            <span>💵 Total</span>

            <b style="color:#2e7d32;">
              ${
                e.paymentType === "Monthly"
                  ? totalMonthly.toFixed(0)
                  : totalDaily.toLocaleString()
              } BIF
            </b>
          </div>

        </div>

      </div>
    `;
    
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
  
};


window.closeAttendanceView = function () {

  const view = document.getElementById("attendanceView");
  if (!view) return;

  view.style.display = "none";

};


window.closeEmployeeProfile = function () {

  const profile = document.getElementById("employeeProfile");
  if (!profile) return;

  profile.style.display = "none";

};



// ===============================
// 🧾 EXPENSES
// ===============================
// =========================
// ADD EXPENSE
// =========================


window.openAddExpense = function () {

  const form = document.getElementById("expenseForm");
  if (!form) return;

  const isHidden =
    window.getComputedStyle(form).display === "none";

  form.style.display = isHidden ? "block" : "none";
};

async function addExpense() {

  const title = document.getElementById("eTitle");
  const amount = document.getElementById("eAmount");

  if (!title || !amount) return;

  if (!title.value.trim()) {
    alert("Enter expense name");
    return;
  }

  if (!amount.value) {
    alert("Enter amount");
    return;
  }

  try {

    await addDoc(collection(db, "expenses"), {

      name: title.value.trim(),
      amount: Number(amount.value) || 0,
      createdAt: new Date()

    });

    alert("Expense added ✔");

    loadExpenses();
    updateDashboard();
    clearExpenseForm();

  } catch (error) {
    console.error(error);
    
  }
}


window.closeExpenses = function () {

  // Hisha expenses page (full screen overlay)
  const expensesSection = document.getElementById("expensesSection");
  if (expensesSection) {
    expensesSection.style.display = "none";
  }

  // Erekana dashboard
  const dashboard = document.getElementById("dashboardTop");
  if (dashboard) {
    dashboard.style.display = "block";
  }

};


window.closeExpenseForm = function () {

  const form = document.getElementById("expenseForm");
  if (form) {
    form.style.display = "none";
  }

  const title = document.getElementById("eTitle");
  const amount = document.getElementById("eAmount");

  if (title) title.value = "";
  if (amount) amount.value = "";

};

// =========================
// LOAD EXPENSES
// =========================

async function loadExpenses() {

  const box = document.getElementById("expensesList");

  if (!box) {
    console.log("expensesList not found");
    return;
  }

  const snap = await getDocs(collection(db, "expenses"));

  let totalExpenses = 0;
  let expenses = [];

  if (snap.empty) {
    box.innerHTML = `
      <div id="totalExpensesCard"
        style="
          background:#ffe0e0;
          padding:12px;
          border-radius:10px;
          text-align:center;
          font-weight:bold;
        ">
        💸 Total Expenses: 0 BIF
      </div>

      <div style="text-align:center;padding:20px;color:#777;">
        No expenses yet
      </div>
    `;
    return;
  }

  snap.forEach(docSnap => {

    const e = docSnap.data();

    const expense = {
      id: docSnap.id,
      name: e.name || "No name",
      amount: Number(e.amount || 0),
      date: e.createdAt?.toDate
        ? e.createdAt.toDate().toLocaleDateString()
        : "No date"
    };

    totalExpenses += expense.amount;
    expenses.push(expense);
  });

  box.innerHTML = `
    <div
      id="totalExpensesCard"
      style="
        background:#ffe0e0;
        padding:12px;
        border-radius:10px;
        margin-bottom:10px;
        font-weight:bold;
        text-align:center;
        color:#b71c1c;
      ">
      💸 Total Expenses: ${totalExpenses.toLocaleString()} BIF
    </div>
  `;

  expenses.forEach(e => {

    box.innerHTML += `
      <div
        class="expenseCard"
        data-name="${(e.name || "").toLowerCase()}"
        data-amount="${e.amount}"
        style="
          background:white;
          padding:10px;
          border-radius:8px;
          margin-bottom:8px;
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:10px;
        "
      >

        <div style="flex:1;">
          <b>${e.name}</b><br>
          <small style="color:#777;">
            📅 ${e.date}
          </small>
        </div>

        <div style="color:#f44336;font-weight:bold;">
          ${e.amount.toLocaleString()} BIF
        </div>

        <div style="display:flex;gap:6px;">

          <button
            onclick="editExpense('${e.id}','${e.name}',${e.amount})"
            style="
              width:28px;
              height:28px;
              border:none;
              border-radius:50%;
              background:#2196F3;
              color:white;
              cursor:pointer;
            ">
            ✏️
          </button>

          <button
            onclick="deleteExpense('${e.id}')"
            style="
              width:28px;
              height:28px;
              border:none;
              border-radius:50%;
              background:#f44336;
              color:white;
              cursor:pointer;
            ">
            🗑
          </button>

        </div>

      </div>
    `;
  });
}


window.closeExpenses = function () {

  const form = document.getElementById("expenseForm");
  if (form) form.style.display = "none";

  const expenses = document.getElementById("expensesSection");
  if (expenses) expenses.style.display = "block";

  const dashboard = document.getElementById("dashboardTop");
  if (dashboard) dashboard.style.display = "block";

};

window.searchExpenses = function () {

  const input = document.getElementById("expenseSearch");
  if (!input) return;

  const q = input.value.toLowerCase();

  const cards = document.querySelectorAll(".expenseCard");

  let filteredTotal = 0;

  cards.forEach(card => {

    const name = (card.dataset.name || "").toLowerCase();
    const amount = Number(card.dataset.amount || 0);

    if (name.includes(q)) {

      card.style.display = "flex";
      filteredTotal += amount;

    } else {
      card.style.display = "none";
    }

  });

  const totalCard = document.getElementById("totalExpensesCard");

  if (totalCard) {
    totalCard.innerHTML =
      `💸 Total Expenses: ${filteredTotal.toLocaleString()} BIF`;
  }

};

window.editExpense = async function (id, oldName, oldAmount) {

  let newName = prompt("Edit name:", oldName);

  if (newName === null) return;

  newName = newName.trim();

  if (!newName) {
    alert("Name cannot be empty");
    return;
  }

  let newAmount = prompt("Edit amount:", oldAmount);

  if (newAmount === null) return;

  newAmount = Number(newAmount);

  if (isNaN(newAmount) || newAmount <= 0) {
    alert("Invalid amount");
    return;
  }

  await updateDoc(doc(db, "expenses", id), {
    name: newName,
    amount: newAmount
  });

  alert("Expense updated ✔");

  loadExpenses();
  updateDashboard();
};


window.deleteExpense = async function (id) {

  if (!id) return;

  if (!confirm("Delete this expense?")) return;

  try {

    await deleteDoc(doc(db, "expenses", id));

    loadExpenses();
    updateDashboard();

    if (typeof showToast === "function") {
      showToast("Expense deleted ✔", "#f44336");
    }

  } catch (err) {
    console.error(err);
    alert("Error deleting expense ❌");
  }
};


window.login = async function(){

try{

const email =
document.getElementById("email").value;

const password =
document.getElementById("password").value;

await signInWithEmailAndPassword(
auth,
email,
password
);

document
.getElementById("authScreen")
.style.display="none";

document
.getElementById("dashboardTop")
.style.display="block";

loadProducts();

}
catch(e){

alert(e.message);

}

}

window.signup = async function(){

try{

await createUserWithEmailAndPassword(

auth,

document.getElementById("email").value,

document.getElementById("password").value

);

alert("Account Created");

}
catch(e){

alert(e.message);

}

}

if ("serviceWorker" in navigator) {

  navigator.serviceWorker
    .register("./service-worker.js")

    .then(() => {
      console.log("Service Worker Registered ✔");
    })

    .catch(err => {
      console.log(err);
    });

}



// ===============================
// 🚀 INIT APP
// ===============================.
async function loadAll(){
  await Promise.all([
    loadProducts(),
    loadSuppliers(),
    loadCustomers(),
    loadEmployees(),
    loadExpenses(),
    updateDashboard()
  ]);
}

loadAll();

// ===============================
// 🌍 GLOBAL EXPORTS (FIXED)
// ===============================

window.saveProduct = saveProduct;
window.loadProducts = loadProducts;
window.openProductView = openProductView;
window.showMoreProducts = showMoreProducts;

window.saveSupplier = saveSupplier;
window.loadSuppliers = loadSuppliers;
window.searchSuppliers = searchSuppliers;
window.showMoreSuppliers = showMoreSuppliers;

window.saveEmployee = saveEmployee;
window.loadEmployees = loadEmployees;

window.addExpense = addExpense;
window.loadExpenses = loadExpenses;

// navigation
window.openSection = openSection;
window.goBack = goBack;
window.showMenu = showMenu;