// ===============================
// 🔥 DUKAFLOW FIRESTORE VERSION
// ===============================



// ===============================
// FIREBASE IMPORTS
// ===============================

import { initializeApp } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";


import {
getAuth,
createUserWithEmailAndPassword,
signInWithEmailAndPassword,
signOut,
onAuthStateChanged,
setPersistence,
browserLocalPersistence
} 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


import {

collection,
addDoc,
getDocs,
deleteDoc,
doc,
updateDoc,
onSnapshot,
getDoc,
query,
where,
initializeFirestore,
persistentLocalCache,
persistentMultipleTabManager

} 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";



// ===============================
// FIREBASE CONFIG
// ===============================

const firebaseConfig = {

apiKey: "AIzaSyBeWNOPH-CoksIlNE-V6wtBE1Um7gvgbG0",

authDomain: "dukaflow-21ec9.firebaseapp.com",

projectId: "dukaflow-21ec9",

storageBucket: "dukaflow-21ec9.firebasestorage.app",

messagingSenderId: "555776552379",

appId: "1:555776552379:web:4238c2c40709e8c980289e"

};



// ===============================
// INIT FIREBASE
// ===============================

const app = initializeApp(firebaseConfig);


const auth = getAuth(app);


// OFFLINE FIRESTORE
const db = initializeFirestore(app, {

localCache: persistentLocalCache({

tabManager: persistentMultipleTabManager()

})

});



await setPersistence(
auth,
browserLocalPersistence
);


// ===============================
// LOCAL STORAGE (SWITCH ACCOUNTS)
// ==============================

function saveAccount(user){

let accounts =
JSON.parse(
localStorage.getItem("df_accounts")
) || [];

let email =
user.email;

let existing =
accounts.find(
a=>a.email===email
);

if(existing){

existing.active =
true;

}else{

accounts.push({
email,
active:true
});

}

accounts.forEach(a=>{

a.active =
a.email===email;

});

localStorage.setItem(
"df_accounts",
JSON.stringify(accounts)
);

}
// ===============================
// PROFILE MENU
// ===============================

window.openProfile = function(){

document.getElementById(
"profileSection"
).style.display = "block";

document.getElementById(
"profileOverlay"
).style.display = "block";

};


window.closeProfile = function(){

document.getElementById(
"profileSection"
).style.display = "none";

document.getElementById(
"profileOverlay"
).style.display = "none";

};



// ===============================
// LOGIN
// ===============================

window.login = async function(){

let email = prompt("Email")?.trim();
let password = prompt("Password");

try{

let res = await signInWithEmailAndPassword(auth, email, password);

saveAccount(res.user);

alert("Login success");

renderAccounts();

}
catch(e){

console.log(
"CODE:",
e.code
);

console.log(
"MESSAGE:",
e.message
);

alert(
e.code
);

}
};

// ===============================
// SIGNUP
// ===============================

window.signup = async function(){

let email =
prompt("Email");

let password =
prompt("Password");

if(!email || !password)
return;

try{

const res =
await createUserWithEmailAndPassword(
auth,
email,
password
);

saveAccount(
res.user
);

alert("Account created");

}

catch(e){

alert(e.message);

}

};



// ===============================
// SWITCH ACCOUNT
// ===============================

window.openSwitch =
function(){

renderAccounts();

document.getElementById(
"switchModal"
).style.display =
"block";

};



window.closeSwitch =
function(){

document.getElementById(
"switchModal"
).style.display =
"none";

};


function migrateAccounts() {

let old = JSON.parse(localStorage.getItem("df_accounts")) || [];

if (old.length > 0 && typeof old[0] === "string") {

let newFormat = old.map(email => ({
email,
active: false
}));

localStorage.setItem("df_accounts", JSON.stringify(newFormat));

console.log("Migrated accounts to object format");

}

}

migrateAccounts();

window.renderAccounts =
function(){

let box =
document.getElementById(
"accountList"
);

if(!box)
return;

let accounts =
getAccounts();

box.innerHTML="";

if(accounts.length===0){

box.innerHTML =
"No saved accounts";

return;

}

accounts.forEach(acc=>{

let row =
document.createElement("div");

row.style=`
padding:14px;
border-bottom:1px solid #eee;
cursor:pointer;
`;

row.innerHTML=
`
${acc.active?"🟢":"👤"}
${acc.email}
`;

row.onclick=
()=>switchAccount(
acc.email
);

box.appendChild(row);

});

};


function getAccounts(){

return JSON.parse(
localStorage.getItem("df_accounts")
) || [];

}


async function switchAccount(email) {

try {

await signOut(auth);

// get account (demo simple login prompt fallback)
let password = prompt("Enter password for:\n" + email);

if (!password) return;

await signInWithEmailAndPassword(auth, email, password);

saveAccount(auth.currentUser);

alert("Switched to " + email);

renderAccounts();

} catch (e) {

alert(e.message);

}

}


function updateProfileUI(user){

const emailEl =
document.getElementById("profileUserEmail");

const nameEl =
document.getElementById("profileUserName");

const avatarEl =
document.getElementById("avatar");

if(!emailEl || !nameEl) return;

if(user){

const name = user.email.split("@")[0];

emailEl.innerText = user.email;
nameEl.innerText = name;

if(avatarEl){
avatarEl.src =
`https://ui-avatars.com/api/?name=${name}&background=0d6efd&color=fff`;
}

}else{

emailEl.innerText = "Not signed in";
nameEl.innerText = "Guest";

}
}




window.addAccount =
async function(){

const email =
prompt("Email")
?.trim();

const password =
prompt("Password");

if(!email || !password)
return;

try{

const res =
await signInWithEmailAndPassword(
auth,
email,
password
);

saveAccount(
res.user
);

alert(
"Account added"
);

renderAccounts();

}
catch(e){

console.log(
e.code
);

console.log(
e.message
);

alert(
e.code
);

}
};



// ===============================
// PROFILE PAGE
// ===============================

window.myProfile =
function(){

closeProfile();

document.getElementById(
"profilePage"
).style.display =
"block";

};



onAuthStateChanged(auth, (user) => {

const ui = {
  menuName: document.getElementById("menuUserName"),
  menuEmail: document.getElementById("menuUserEmail"),
  profileName: document.getElementById("profileUserName"),
  profileEmail: document.getElementById("profileUserEmail"),
  avatar: document.getElementById("userAvatar")
};

if (user) {

const name = user.email.split("@")[0];
const email = user.email;



// update UI
if (ui.menuName) ui.menuName.innerText = name;
if (ui.menuEmail) ui.menuEmail.innerText = email;

if (ui.profileName) ui.profileName.innerText = name;
if (ui.profileEmail) ui.profileEmail.innerText = email;

// avatar (Gmail style)
if (ui.avatar) {
ui.avatar.src =
`https://ui-avatars.com/api/?name=${name}&background=0d6efd&color=fff`;
}

updateProfileUI(user);

renderAccounts();
loadEmployees();
loadProducts();
saveAccount(user);
loadCustomers();
loadSuppliers();
loadExpenses();
updateDashboard();
checkLowStockAlert();


} else {

setGuestUI();

}

});

function setGuestUI() {

const elements = [
"menuUserName",
"menuUserEmail",
"profileUserName",
"profileUserEmail"
];

elements.forEach(id => {
const el = document.getElementById(id);
if (el) el.innerText = (id.includes("Name")) ? "Guest" : "Not signed in";
});

const avatar = document.getElementById("userAvatar");
if (avatar) {
avatar.src =
"https://ui-avatars.com/api/?name=Guest&background=ccc&color=fff";
}

}

// ===============================
// EDIT PROFILE
// ===============================

window.editProfile =
function(){

let newName =
prompt(
"Enter new name"
);

if(!newName)
return;


const profileName =
document.getElementById(
"profileUserName"
);

if(profileName){

profileName.innerText =
newName;

}

alert(
"Profile updated"
);

};

// ===============================
// LOGOUT
// ===============================

window.logout =
async function(){

try{

await signOut(
auth
);

const page =
document.getElementById(
"profilePage"
);

if(page){

page.style.display =
"none";

}

closeProfile();

alert(
"Logged out"
);

}

catch(e){

alert(
e.message
);

}

};

window.openDashboard = function(){

const dashboard =
document.getElementById(
"dashboardTop"
);

if(!dashboard)
return;

dashboard.style.display =
"block";

// funga profile page niba ifunguye
const profile =
document.getElementById(
"profilePage"
);

if(profile){

profile.style.display =
"none";

}

closeProfile();

};

window.closeDashboard =
function(){

document.getElementById(
"dashboardTop"
).style.display =
"none";

};



window.openDashboardSettings = function () {
  document.getElementById("dashboardSettings").style.display = "block";
};

window.closeDashboardSettings = function () {
  document.getElementById("dashboardSettings").style.display = "none";
};


window.setDashboardFilter = function () {

  const box = document.getElementById("dashboardPeriod");

  if(box){
    box.focus();
  }

};



// ===========================
// REPORT PERIOD
// ===========================
function inPeriod(date, period) {

  if (!date) return false;

  const d = date.toDate ? date.toDate() : new Date(date);
  const now = new Date();

  switch (period) {

    case "today":
      return d.toDateString() === now.toDateString();

    case "week":
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      return d >= weekAgo;

    case "month":
      return d.getMonth() === now.getMonth() &&
             d.getFullYear() === now.getFullYear();

    case "year":
      return d.getFullYear() === now.getFullYear();

    case "all":
      return true;

    default:
      return true;

  }

}


window.openDashboardCardsSettings = function(){

document.getElementById("cardSettings").style.display="block";


const cards = [

{
id:"dashSales",
name:"💰 Sales"
},

{
id:"dashExpenses",
name:"💸 Expenses"
},

{
id:"dashEmpPayroll",
name:"👨‍💼 Employee Payroll"
},

{
id:"dashSupplierPayroll",
name:"🚚 Supplier Payroll"
},

{
id:"dashProfit",
name:"📈 Profit"
}

];


let html="";


cards.forEach(card=>{


const hidden =
localStorage.getItem(card.id)==="hide";


html += `

<div style="
background:white;
padding:14px;
border-radius:12px;
margin-bottom:10px;
display:flex;
justify-content:space-between;
align-items:center;
">

<span>
${card.name}
</span>


<button
onclick="toggleDashboardCard('${card.id}')"
style="
border:none;
padding:8px 12px;
border-radius:8px;
background:${hidden ? '#f44336':'#4CAF50'};
color:white;
">

${hidden ? "Show":"Hide"}

</button>


</div>

`;

});


document.getElementById("cardOptions").innerHTML=html;


};



window.toggleDashboardCard=function(id){


const card =
document.getElementById(id).parentElement;


if(localStorage.getItem(id)==="hide"){


localStorage.removeItem(id);

card.style.display="flex";


}else{


localStorage.setItem(id,"hide");

card.style.display="none";

}


openDashboardCardsSettings();

};



window.closeCardSettings=function(){

document.getElementById("cardSettings").style.display="none";

};


window.updateDashboard = async function () {

  try {

    if (!auth.currentUser) return;

    const uid = auth.currentUser.uid;

    const period =
      document.getElementById("dashboardPeriod")?.value || "all";

    let sales = 0;
    let expenses = 0;
    let empPayroll = 0;
    let supplierPayroll = 0;



    // ======================
    // SALES
    // ======================
    const salesSnap = await getDocs(
      collection(db, "users", uid, "customerHistory")
    );

    salesSnap.forEach(docSnap => {

      const s = docSnap.data();

      if (!inPeriod(s.createdAt, period)) return;

      sales += Number(s.total || 0);

    });

    // ======================
    // EXPENSES
    // ======================
    const expenseSnap = await getDocs(
      collection(db, "users", uid, "expenses")
    );

    expenseSnap.forEach(docSnap => {

      const e = docSnap.data();

      if (!inPeriod(e.createdAt, period)) return;

      expenses += Number(e.amount || 0);

    });

    // ======================
    // EMPLOYEE PAYROLL
    // ======================
    const employeeSnap = await getDocs(
      collection(db, "users", uid, "employees")
    );

    employeeSnap.forEach(docSnap => {

      const e = docSnap.data();

      if (e.paymentType === "Monthly") {

        const salary = Number(e.salary || 0);
        const absent = Number(e.absent || 0);

        empPayroll += salary - (salary / 30 * absent);

      } else {

        empPayroll +=
          Number(e.dailyRate || 0) *
          Number(e.daysWorked || 0);

      }

    });

    // ======================
    // SUPPLIER PAYROLL
    // ======================
    const supplierSnap = await getDocs(
      collection(db, "users", uid, "supplierHistory")
    );

    supplierSnap.forEach(docSnap => {

      const s = docSnap.data();

      if (!inPeriod(s.createdAt, period)) return;

      supplierPayroll += Number(s.debt || 0);

    });

    // ======================
    // PROFIT
    // ======================
    const profit =
      sales -
      expenses -
      empPayroll -
      supplierPayroll;

    // ======================
    // SHOW
    // ======================
    document.getElementById("dashSales").textContent =
      sales.toLocaleString() + " BIF";

    document.getElementById("dashExpenses").textContent =
      expenses.toLocaleString() + " BIF";

    document.getElementById("dashEmpPayroll").textContent =
      empPayroll.toLocaleString() + " BIF";

    document.getElementById("dashSupplierPayroll").textContent =
      supplierPayroll.toLocaleString() + " BIF";

    document.getElementById("dashProfit").textContent =
      profit.toLocaleString() + " BIF";

// ======================
// SHOW / HIDE CARDS
// ======================

[
"dashSales",
"dashExpenses",
"dashEmpPayroll",
"dashSupplierPayroll",
"dashProfit"

].forEach(id=>{

const el = document.getElementById(id);

if(el){

el.parentElement.style.display =
localStorage.getItem(id)==="hide"
? "none"
: "flex";

}

});

  } catch (err) {

    console.error("Dashboard Error:", err);

  }

};



window.openSection=function(id){

document
.querySelectorAll(
".section"
)
.forEach(
s=>s.style.display="none"
);

let el=
document.getElementById(id);

if(el){

el.style.display=
"block";

}

};


window.openProducts = function(){

document.getElementById("dashboardTop").style.display = "none";
document.getElementById("productsSection").style.display = "block";

// 🔥 AUTO LOAD WHEN OPENING PAGE
loadProducts();

};


window.saveProduct = async function () {

  try {

    if (!auth.currentUser) {
      alert("Login First");
      return;
    }

    const uid = auth.currentUser.uid;

    let category = document.getElementById("productCategory")?.value;

    let name = document.getElementById("pName")?.value.trim() || "";
    let buy = document.getElementById("pBuy")?.value || 0;
    let sell = document.getElementById("pSell")?.value || 0;
    let qty = document.getElementById("pQty")?.value || 0;

    if (!name) {
      alert("Enter product name");
      return;
    }

    // CHECK IF PRODUCT EXISTS
    const snap = await getDocs(
      collection(db, "users", uid, "products")
    );

    let exists = false;

    snap.forEach(doc => {
      const p = doc.data();

      if ((p.name || "").trim().toLowerCase() === name.toLowerCase()) {
        exists = true;
      }
    });

    if (exists) {
      alert("⚠️ Product already exists.");
      return;
    }

    // SAVE ONLY IF NOT FOUND
    await addDoc(
      collection(db, "users", uid, "products"),
      {
        category,
        name,
        buy: Number(buy),
        sell: Number(sell),
        qty: Number(qty),
        createdAt: new Date()
      }
    );

    alert("✅ Product Saved");

    loadProducts();

  } catch (e) {

    console.log("ERROR:", e);
    alert("Error: " + e.message);

  }

};

window.changeProductFields = function(){

let type = document.getElementById("productCategory")?.value;

let box = document.getElementById("dynamicFields");

if(!box) return;

box.innerHTML = "";

// INVENTORY
if(type === "inventory"){

box.innerHTML = `
<input id="pName" placeholder="Product Name">
<input id="pBuy" type="number" placeholder="Buy Price">
<input id="pSell" type="number" placeholder="Sell Price">
<input id="pQty" type="number" placeholder="Quantity">
`;
}

// RAW MATERIALS
else if(type === "raw"){

box.innerHTML = `
<input id="pName" placeholder="Raw Material Name">
<input id="pBuy" type="number" placeholder="Buy Price">
`;
}

// FINISHED GOODS
else if(type === "finished"){

box.innerHTML = `
<input id="pName" placeholder="Finished Product Name">
<input id="pSell" type="number" placeholder="Sell Price">
`;
}

};


window.closeProducts = function(){

document.getElementById("productsSection").style.display = "none";

};

window.searchProducts = function () {

  const keyword = document
    .getElementById("productSearch")
    .value
    .toLowerCase()
    .trim();

  document.querySelectorAll(".productItem").forEach(item => {

    const name = (item.dataset.name || "").toLowerCase();
    const category = (item.dataset.category || "").toLowerCase();

    if (
      name.includes(keyword) ||
      category.includes(keyword)
    ) {
      item.style.display = "flex";
    } else {
      item.style.display = "none";
    }

  });

};

window.toggleProductSearch = function () {

  const input = document.getElementById("productSearch");

  if (input.style.display === "none" || input.style.display === "") {
    input.style.display = "block";
    input.focus();
  } else {
    input.style.display = "none";
    input.value = "";
    searchProducts();
  }

};


window.loadProducts = async function(){

try{

if(!auth.currentUser) return;

const uid = auth.currentUser.uid;

const productList = document.getElementById("productList");

if(!productList){
return;
}

productList.innerHTML = "Loading...";


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


// SORT
products.sort((a,b)=>
a.name.localeCompare(b.name)
);


// TOTAL PRODUCTS
const total = document.getElementById("productTotal");

if(total){

total.innerHTML =
`📦 Total Products: ${products.length}`;

}


// LOW STOCK COUNT
let lowStock = 0;


products.forEach(p=>{

if(Number(p.qty || 0) <= 10){

lowStock++;

}

});


const lowStockBox =
document.getElementById("lowStockCount");


if(lowStockBox){

lowStockBox.textContent = lowStock;

}


// PRODUCT LIST

let html = "";


products.forEach(p=>{


html += `

<div class="productItem"

data-id="${p.id}"
data-name="${p.name}"
data-category="${p.category || ""}"
data-buy="${p.buy || 0}"
data-sell="${p.sell || 0}"
data-qty="${p.qty || 0}"

style="
display:flex;
justify-content:space-between;
align-items:center;
padding:14px;
margin-bottom:8px;
border-radius:12px;
background:#f5f5f5;
cursor:pointer;
">


<div style="font-weight:bold;">
${p.name}
</div>


<div style="
background:#0d6efd;
color:white;
padding:4px 10px;
border-radius:20px;
font-size:13px;
">

${p.qty || 0}

</div>


</div>

`;

});


productList.innerHTML =
html || "<p>No products</p>";



// VIEW CLICK

document.querySelectorAll(".productItem")
.forEach(item=>{


item.onclick=function(){


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


}catch(e){

console.log("LOAD ERROR:",e);

alert(e.message);

}

};


window.checkLowStockAlert = async function(){

if(!auth.currentUser){
return;
}

const uid = auth.currentUser.uid;


const snap = await getDocs(
collection(db,"users",uid,"products")
);


let lowProducts = [];


snap.forEach(docSnap=>{

const p = docSnap.data();

if(Number(p.qty || 0) <= 10){

lowProducts.push(
`${p.name} (${p.qty || 0})`
);

}

});


if(lowProducts.length > 0){

alert(
`⚠ Low Stock Alert\n\n${lowProducts.join("\n")}`
);

}

};


window.openLowStockProducts = async function(){

document.getElementById("lowStockView").style.display="block";


const list = document.getElementById("lowStockProductsList");

list.innerHTML="Loading...";


const uid = auth.currentUser.uid;


const snap = await getDocs(
collection(db,"users",uid,"products")
);


let html="";


snap.forEach(d=>{

const p=d.data();


if(Number(p.qty || 0) <= 10){


html += `

<div style="
background:white;
padding:14px;
border-radius:12px;
margin-bottom:10px;
display:flex;
justify-content:space-between;
box-shadow:0 2px 8px rgba(0,0,0,.08);
">

<b>
📦 ${p.name}
</b>


<span style="
color:#f44336;
font-weight:bold;
">
${p.qty || 0}
</span>


</div>

`;

}

});


list.innerHTML = html || `

<div style="
text-align:center;
padding:20px;
color:#777;
">
No Low Stock Products
</div>

`;

};



window.closeLowStockView = function(){

document.getElementById("lowStockView").style.display="none";

};


window.openProductView = function(id,name,category,buy,sell,qty){

document.getElementById("productsSection").style.display = "none";

let view = document.getElementById("productView");

view.innerHTML = `
<div style="padding:20px;">

<h2>${name}</h2>

<p>📂 Category: ${category}</p>
<p>📦 Quantity: ${qty}</p>
<p>💰 Buy: ${buy}</p>
<p>💵 Sell: ${sell}</p>

<!-- ACTION BUTTONS -->
<div style="margin-top:20px; display:flex; gap:10px;">

<button onclick="editProduct('${id}')" style="
flex:1;
padding:12px;
border:none;
background:#0d6efd;
color:white;
border-radius:10px;
">
✏️ Edit
</button>

<button onclick="deleteProduct('${id}')" style="
flex:1;
padding:12px;
border:none;
background:#ff4d4f;
color:white;
border-radius:10px;
">
🗑 Delete
</button>

</div>

<!-- CLOSE -->
<button onclick="closeProductView()" style="
margin-top:15px;
width:100%;
padding:12px;
border:none;
background:#ddd;
border-radius:10px;
">
Close
</button>

</div>
`;

document.getElementById("productViewSection").style.display = "block";

};


window.closeProductView = function(){

document.getElementById("productViewSection").style.display = "none";

document.getElementById("productsSection").style.display = "block";

};

window.deleteProduct = async function(id){

if(!confirm("Delete this product?")) return;

const uid = auth.currentUser.uid;

try{

await deleteDoc(
doc(db,"users",uid,"products",id)
);

alert("Deleted");

// refresh list
loadProducts();

// close view
closeProductView();

}catch(e){
alert(e.message);
}

};

window.editProduct = function(id){

let newName = prompt("New Product Name:");
let newQty = prompt("New Quantity:");

if(!newName || !newQty) return;

const uid = auth.currentUser.uid;

updateDoc(
doc(db,"users",uid,"products",id),
{
name: newName,
qty: Number(newQty)
}
).then(()=>{

alert("Updated");

loadProducts();
closeProductView();

});

};


// =========================
// SUPPLIERS PAGE
// =========================

window.openSuppliers = function () {

const page =
document.getElementById(
"suppliersSection"
);

if(page){

page.style.display =
"block";

}

};


window.closeSuppliers = function () {

const page =
document.getElementById(
"suppliersSection"
);

if(page){

page.style.display =
"none";

}

};




// =========================
// ADD SUPPLIER POPUP
// =========================

window.openAddSupplier =
function(){

const popup =
document.getElementById(
"addSupplierPopup"
);

if(popup){

popup.style.display =
"block";

}

};


window.closeAddSupplier =
function(){

const popup =
document.getElementById(
"addSupplierPopup"
);

if(popup){

popup.style.display =
"none";

}

};




// =========================
// SAVE SUPPLIER
// =========================

window.saveSupplier =
async function(){

try{

if(!auth.currentUser){

alert("Login First");
return;

}

const uid =
auth.currentUser.uid;


const name =
document
.getElementById("sName")
?.value
.trim();


const phone =
document
.getElementById("sPhone")
?.value
.trim();


const location =
document
.getElementById("sLocation")
?.value
.trim();



if(!name){

alert("Enter supplier name");
return;

}


// AUTO NUMBER
const supplierNumber =
await generateSupplierNumber();



await addDoc(

collection(
db,
"users",
uid,
"suppliers"
),

{

supplierNumber,

name,

phone,

location,

createdAt:new Date()

}

);



alert(
"✅ Supplier Saved\n"+supplierNumber
);



loadSuppliers();


closeAddSupplier();



document.getElementById("sName").value="";

document.getElementById("sPhone").value="";

document.getElementById("sLocation").value="";


}

catch(e){

console.log(e);

alert(
"Error: "+e.message
);

}

};


window.searchSuppliers =
function(){

const q =
document
.getElementById(
"supplierSearch"
)
.value
.toLowerCase()
.trim();

const cards =
document.querySelectorAll(
"#supplierList > div"
);

cards.forEach(
card=>{

const text =
card.innerText
.toLowerCase();

card.style.display =

text.includes(q)

?

"flex"

:

"none";

}

);

};


window.toggleSupplierSearch = function () {

  const input = document.getElementById("supplierSearch");

  if (input.style.display === "none" || input.style.display === "") {
    input.style.display = "block";
    input.focus();
  } else {
    input.style.display = "none";
    input.value = "";
    searchSuppliers();
  }

};


window.loadSuppliers = async function () {

  try {

    const list = document.getElementById("supplierList");

    if (!auth.currentUser) {

      list.innerHTML = `
      <div style="
      padding:30px;
      text-align:center;
      color:#888;
      ">
      🚚 Login first
      </div>
      `;

      return;
    }

    const uid = auth.currentUser.uid;

    list.innerHTML = `
    <div style="
    padding:20px;
    text-align:center;
    color:#666;
    ">
    Loading...
    </div>
    `;

    const snap = await getDocs(
      collection(db, "users", uid, "suppliers")
    );

    list.innerHTML = "";

    if (snap.empty) {

      list.innerHTML = `
      <div style="
      padding:30px;
      text-align:center;
      color:#888;
      ">
      🚚 No suppliers yet
      </div>
      `;

      return;
    }


    let suppliers = [];

    snap.forEach((doc) => {
      suppliers.push({
        id: doc.id,
        ...doc.data()
      });
    });

    suppliers.sort((a, b) =>
      (a.name || "").localeCompare(b.name || "", undefined, {
        sensitivity: "base"
      })
    );
    
const total = document.getElementById("supplierTotal");

if (total) {
  total.innerHTML = `🚚 Total Suppliers: ${suppliers.length}`;
}

    suppliers.forEach((s) => {

      list.insertAdjacentHTML(
"beforeend",
`
<div
onclick="openSupplierProfile('${s.id}')"
style="
display:flex;
justify-content:space-between;
align-items:center;
padding:14px;
margin-top:10px;
border-radius:14px;
background:white;
box-shadow:0 2px 10px rgba(0,0,0,.06);
cursor:pointer;
">

<div>

<div style="
font-size:11px;
color:#777;
margin-bottom:3px;
">
${s.supplierNumber || "No Number"}
</div>


<div style="
font-weight:700;
font-size:15px;
">
🚚 ${s.name || "-"}
</div>

</div>


<div style="
font-size:13px;
color:#777;
">
📍 ${s.location || "-"}
</div>


</div>
`
);

    });

  } catch (e) {

    console.log(e);

    document.getElementById("supplierList").innerHTML = `
    <div style="
    padding:20px;
    text-align:center;
    color:red;
    ">
    Failed loading suppliers
    </div>
    `;

  }

};


window.generateSupplierNumber = async function(){

  const uid = auth.currentUser.uid;

  const snap = await getDocs(
    collection(db,"users",uid,"suppliers")
  );


  let maxNumber = 100000;


  snap.forEach(docSnap=>{

    const s = docSnap.data();

    const num = Number(s.supplierNumber);

    if(num > maxNumber){

      maxNumber = num;

    }

  });


  return String(maxNumber + 1);

};

window.updateOldSupplierNumbers = async function(){

try{

if(!auth.currentUser){
alert("Login First");
return;
}


const uid = auth.currentUser.uid;


const snap = await getDocs(
collection(db,"users",uid,"suppliers")
);


let updated = 0;


for(const docSnap of snap.docs){

const s = docSnap.data();


if(s.supplierNumber){
continue;
}


const supplierNumber =
"SUP-" +
Math.floor(
100000 +
Math.random()*900000
);



await updateDoc(

doc(
db,
"users",
uid,
"suppliers",
docSnap.id
),

{

supplierNumber:supplierNumber

}

);


updated++;

}


alert(
"✅ Updated suppliers: "+updated
);


loadSuppliers();


}
catch(e){

console.error(e);

alert(
"Error: "+e.message
);

}

};
// =========================
// SUPPLIER PROFILE
// =========================

window.openSupplierProfile = async function(id){

// CHECK LOGIN
if(!auth.currentUser){

alert("Login First");
return;

}


const uid = auth.currentUser.uid;


try{


const snap = await getDoc(

doc(
db,
"users",
uid,
"suppliers",
id
)

);



if(!snap.exists()){

alert("Supplier not found");
return;

}



const s = snap.data();



currentSupplier = {

id,
...s

};



// CLOSE LIST
document.getElementById(
"suppliersSection"
).style.display="none";



// OPEN PROFILE
const profile =
document.getElementById(
"supplierProfile"
);


profile.style.display="block";



profile.innerHTML = `


<div style="
max-width:380px;
margin:auto;
padding:10px;
font-family:Arial;
">


<!-- TOP BAR -->

<div style="
display:flex;
justify-content:space-between;
align-items:center;
margin-bottom:12px;
">


<button
onclick="closeSupplierProfile()"
style="
width:36px;
height:36px;
border:none;
border-radius:50%;
background:white;
box-shadow:0 2px 8px rgba(0,0,0,.12);
font-size:16px;
">
🔙
</button>



<div style="
display:flex;
gap:8px;
">


<button
onclick="menuEdit()"
style="
width:36px;
height:36px;
border:none;
border-radius:50%;
background:#4CAF50;
color:white;
">
✏️
</button>



<button
onclick="menuDelete()"
style="
width:36px;
height:36px;
border:none;
border-radius:50%;
background:#f44336;
color:white;
">
🗑
</button>


</div>


</div>


<!-- SUPPLIER CARD -->

<div style="
background:white;
padding:14px;
border-radius:14px;
box-shadow:0 2px 8px rgba(0,0,0,.08);
text-align:center;
">


<div style="
font-size:12px;
color:#1565C0;
font-weight:bold;
">

🆔 ${s.supplierNumber || "No Number"}

</div>


<h3 style="
margin:6px 0;
font-size:18px;
color:#222;
">

${s.name || "-"}

</h3>


<div style="
font-size:11px;
color:#777;
">
🚚 Supplier
</div>


</div>



<!-- PHONE -->



📞 ${s.phone || "No phone"}

</div>



<!-- LOCATION -->

📍 ${s.location || "No location"}

</div>

</div>






<!-- ACTION BUTTONS -->

<div style="
display:flex;
gap:10px;
margin-top:15px;
">


<button
onclick="openSaleBuilder()"
style="
flex:1;
padding:10px;
border:none;
border-radius:10px;
background:#FF9800;
color:white;
font-size:13px;
font-weight:bold;
">

💰 New Purchase

</button>




<button
onclick="openSupplierHistory()"
style="
flex:1;
padding:10px;
border:none;
border-radius:10px;
background:#673AB7;
color:white;
font-size:13px;
font-weight:bold;
">

📋 History

</button>



</div>



</div>


`;



}

catch(error){

console.error(error);

alert(
"Error loading supplier"
);

}


};


window.closeSupplierProfile = function () {

  document.getElementById("supplierProfile").style.display = "none";
  document.getElementById("suppliersSection").style.display = "block";

};


window.gobacksuppliers =
function(){

document.getElementById(
"supplierProfile"
).style.display =
"none";

document.getElementById(
"suppliersSection"
).style.display =
"block";

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




window.menuEdit =
async function(){

try{

if(
!auth.currentUser
){

alert(
"Login First"
);

return;

}

if(
!currentSupplier
){

alert(
"No supplier selected"
);

return;

}


const old =
document.getElementById(
"supplierEditPopup"
);

if(old){

old.remove();

}


document.body
.insertAdjacentHTML(

"beforeend",

`

<div
id="supplierEditPopup"

style="
position:fixed;
inset:0;

background:
rgba(0,0,0,.45);

display:flex;

align-items:center;

justify-content:center;

z-index:99999;
">

<div style="
width:92%;
max-width:360px;

background:white;

border-radius:18px;

overflow:hidden;
">

<div style="
padding:14px;

background:
linear-gradient(
135deg,
#2196F3,
#1565C0
);

color:white;

font-size:18px;
">

✏️ Edit Supplier

</div>


<div style="
padding:14px;
">

<input
id="editSupplierName"

value="${currentSupplier.name||""}"

placeholder="Supplier Name"

style="
width:100%;
padding:12px;

margin-bottom:10px;

border:1px solid #ddd;

border-radius:10px;

box-sizing:border-box;
">


<input
id="editSupplierPhone"

value="${currentSupplier.phone||""}"

placeholder="Phone"

style="
width:100%;
padding:12px;

margin-bottom:10px;

border:1px solid #ddd;

border-radius:10px;

box-sizing:border-box;
">


<input
id="editSupplierLocation"

value="${currentSupplier.location||""}"

placeholder="Location"

style="
width:100%;
padding:12px;

border:1px solid #ddd;

border-radius:10px;

box-sizing:border-box;
">


<div style="
display:flex;
gap:10px;
margin-top:16px;
">

<button

onclick="
document
.getElementById(
'supplierEditPopup'
)
.remove()
"

style="
flex:1;

padding:12px;

border:none;

border-radius:10px;

background:#eee;
">

Cancel

</button>


<button

onclick="
saveSupplierEdit()
"

style="
flex:1;

padding:12px;

border:none;

border-radius:10px;

background:#4CAF50;

color:white;
">

Save

</button>

</div>

</div>

</div>

</div>

`

);

}

catch(e){

console.log(e);

}

};


window.saveSupplierEdit =
async function(){

try{

const uid =
auth.currentUser.uid;


const name =
document
.getElementById(
"editSupplierName"
)
.value
.trim();


const phone =
document
.getElementById(
"editSupplierPhone"
)
.value
.trim();


const location =
document
.getElementById(
"editSupplierLocation"
)
.value
.trim();


if(!name){

alert(
"Enter supplier name"
);

return;

}


await updateDoc(

doc(
db,
"users",
uid,
"suppliers",
currentSupplier.id
),

{

name,
phone,
location

}

);


currentSupplier = {

...currentSupplier,

name,
phone,
location

};


document
.getElementById(
"supplierEditPopup"
)
.remove();


alert(
"✅ Updated"
);


openSupplierProfile(
currentSupplier.id
);


loadSuppliers();

}
catch(e){

console.log(e);

alert(
"Update failed"
);

}

};

window.openSaleBuilder = async function () {

  if (!auth.currentUser) return;

  const uid = auth.currentUser.uid;

  supplierSaleItems = [];

  document.getElementById("supplierSaleBuilder").style.display = "block";
  document.getElementById("supplierSaleItemsList").innerHTML = "";

  const snap = await getDocs(
    collection(db, "users", uid, "products")
  );

  const products = [];

  snap.forEach(doc => {
    products.push({
      id: doc.id,
      ...doc.data()
    });
  });

  allSupplierProducts = products;

// Show products
renderSupplierProducts(allSupplierProducts);

};

window.allSupplierProducts = [];


window.filterSupplierProducts = function () {

  const box = document.getElementById("supplierProductSearch");

  if (!box) return;

  const search = box.value.toLowerCase().trim();

  if (search === "") {
    renderSupplierProducts(allSupplierProducts);
    return;
  }

  const products = allSupplierProducts.filter(p =>
    (p.name || "").toLowerCase().includes(search)
  );

  renderSupplierProducts(products);

};

window.renderSupplierProducts = function(products) {

  const box = document.getElementById("supplierProductsList");
  box.innerHTML = "";

  products.forEach(p => {

    box.innerHTML += `
      <div style="
        display:flex;
        justify-content:space-between;
        align-items:center;
        padding:10px;
        border-bottom:1px solid #eee;
      ">

        <div style="flex:1;">
          <b>${p.name}</b><br>
          <small>Stock: ${p.qty || 0}</small>
        </div>

        <input
          type="number"
          data-id="${p.id}"
          data-name="${p.name}"
          data-buy="${p.buy || 0}"
          placeholder="Qty"
          style="
            width:70px;
            padding:6px;
            border:1px solid #ddd;
            border-radius:6px;
          "
        >

      </div>
    `;

  });

};



window.closeSupplierSaleBuilder = function () {
  document.getElementById("supplierSaleBuilder").style.display = "none";
};

window.supplierSaleItems = [];


window.saveSupplierSelectedProducts = function () {

  document.querySelectorAll("#supplierProductsList input[type='number']").forEach(input => {

    const qty = Number(input.value);

    if (qty > 0) {

      const id = input.dataset.id;
      const existing = supplierSaleItems.find(item => item.id === id);

      if (existing) {

        existing.qty += qty;

      } else {

        supplierSaleItems.push({
          id: id,
          product: input.dataset.name,
          qty: qty,
          buy: Number(input.dataset.buy)
        });

      }

      input.value = "";

    }

  });

  renderSupplierSaleItems();

};


function renderSupplierSaleItems() {

const box = document.getElementById("supplierSaleItemsList");


if (supplierSaleItems.length === 0) {

box.innerHTML = `
<div style="
text-align:center;
color:#777;
">
No items added
</div>
`;

document.getElementById("supplierPurchaseTotal").innerHTML = "0 BIF";

return;

}


let total = 0;
let html = "";


supplierSaleItems.forEach((item,index)=>{


const line = item.qty * item.buy;

total += line;


html += `

<div style="
display:flex;
justify-content:space-between;
align-items:center;
padding:10px;
margin-top:6px;
background:#f5f5f5;
border-radius:8px;
">


<div>

<b>${item.product}</b><br>

${item.qty} × ${item.buy.toLocaleString()}
=
<b>${line.toLocaleString()} BIF</b>

</div>


<button
onclick="deleteSupplierSaleItem(${index})"
style="
border:none;
background:#f44336;
color:white;
width:34px;
height:34px;
border-radius:50%;
">

🗑

</button>


</div>

`;

});



html += `

<!-- PAYMENT -->

<div style="
background:white;
margin-top:15px;
padding:12px;
border-radius:12px;
box-shadow:0 2px 8px rgba(0,0,0,.08);
">




<input
id="supplierPaid"
type="number"
placeholder="💵 Amount Paid"
style="
width:100%;
padding:12px;
border:none;
background:#f5f5f5;
border-radius:10px;
box-sizing:border-box;
">


</div>


`;


box.innerHTML = html;


document.getElementById("supplierPurchaseTotal").innerHTML =
total.toLocaleString()+" BIF";


}

window.deleteSupplierSaleItem = function(index) {

  supplierSaleItems.splice(index, 1);

  renderSupplierSaleItems();

};



window.supplierSaleSaving = false;
window.finishSupplierSale = async function () {

  if (window.supplierSaleSaving) {
    alert("Saving already in progress...");
    return;
  }

  window.supplierSaleSaving = true;


  try {

    if (!auth.currentUser) {
      window.supplierSaleSaving = false;
      alert("Login First");
      return;
    }

    if (!currentSupplier) {
      window.supplierSaleSaving = false;
      alert("Select supplier first");
      return;
    }

    if (supplierSaleItems.length === 0) {
      window.supplierSaleSaving = false;
      alert("No products added");
      return;
    }


    const uid = auth.currentUser.uid;

    let total = 0;


    supplierSaleItems.forEach(item => {

      total +=
      Number(item.buy || 0) *
      Number(item.qty || 0);

    });


    // SAVE ONCE
    const paid =
Number(
document.getElementById("supplierPaid")?.value || 0
);


const debt = total - paid;



await addDoc(

collection(
db,
"users",
uid,
"supplierHistory"
),

{

supplierId: currentSupplier.id,

supplierNumber:
currentSupplier.supplierNumber || "",

supplierName:
currentSupplier.name,

items:
supplierSaleItems,


total:


total,


paid:


paid,


debt:


debt,


createdAt:
new Date()

}

);


    // UPDATE STOCK

    for (const item of supplierSaleItems) {


      const ref = doc(
        db,
        "users",
        uid,
        "products",
        item.id
      );


      const snap = await getDoc(ref);


      if(snap.exists()){

        const data = snap.data();


        await updateDoc(ref,{

          qty:
          Number(data.qty || 0)
          +
          Number(item.qty || 0)

        });

      }

    }


    supplierSaleItems = [];


// CLEAR PAYMENT
const paidInput =
document.getElementById("supplierPaid");

if(paidInput){
  paidInput.value="";
}


// CLEAR ITEMS
const itemsBox =
document.getElementById("supplierSaleItemsList");

if(itemsBox){
  itemsBox.innerHTML="";
}


const builder =
document.getElementById("supplierSaleBuilder");

if(builder){
  builder.style.display="none";
}


    await loadProducts();

    await updateDashboard();



    alert("✅ Purchase Saved Successfully");


  } catch(err){

    console.error(err);
    alert(err.message);


  } finally {


    window.supplierSaleSaving = false;


  }

};


window.openSupplierHistory =
async function(){

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


// OPEN PAGE
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



let totalPurchases = 0;

let totalProducts = 0;


const uid = auth.currentUser.uid;

const snap =
await getDocs(
  collection(
    db,
    "users",
    uid,
    "supplierHistory"
  )
);


const history = [];


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


// NEWEST FIRST
history.reverse();


box.innerHTML =
"";


// EMPTY
if(
history.length === 0
){

box.innerHTML =

`
<div style="
padding:30px;
text-align:center;
color:#777;
">

📋 No history

</div>
`;

return;

}


// BUILD CARDS
history.forEach(
h=>{

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


box.insertAdjacentHTML(

"beforeend",

`

<div

id="history-${h.id}"

onclick="
openHistoryView(
'${h.id}'
)
"

style="
background:white;

padding:12px;

border-radius:10px;

margin-bottom:10px;

box-shadow:
0 2px 8px
rgba(0,0,0,.08);

position:relative;

cursor:pointer;
">

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

width:30px;

height:30px;

border:none;

border-radius:50%;

background:#f44336;

color:white;
">

🗑

</button>


<div>

📅

${saleDate}

</div>


<div style="
margin-top:6px;

font-weight:bold;

color:#4CAF50;
">

💰

${Number(
h.total || 0
).toLocaleString()}

BIF

</div>

</div>

`

);

}

);


// SUMMARY
box.insertAdjacentHTML(

"afterbegin",

`

<div style="
background:#f5f5f5;

padding:12px;

border-radius:12px;

margin-bottom:14px;
">

<div>

💰 Total Purchases:

${totalPurchases.toLocaleString()}

BIF

</div>


<div

onclick="
openSupplierProductsSummary()
"

style="
margin-top:6px;

color:#2196F3;

font-weight:bold;

cursor:pointer;
">

📦 Total Products:

${totalProducts.toLocaleString()}

</div>

</div>

`

);

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


window.openSupplierProductsSummary = async function(){

try{

if(!currentSupplier?.id){
alert("No supplier selected");
return;
}

const uid = auth.currentUser.uid;

const box = document.getElementById("supplierHistoryList");

let summary = {};

const snap = await getDocs(
  collection(db,"users",uid,"supplierHistory")
);


snap.forEach(docSnap=>{

const h = docSnap.data();

if(h.supplierId !== currentSupplier.id) return;


(h.items || []).forEach(item=>{

const name = item.product || "Unknown";

if(!summary[name]){
summary[name] = {
qty:0,
amount:0
};
}


const qty = Number(item.qty || 0);
const buy = Number(item.buy || 0);


summary[name].qty += qty;
summary[name].amount += qty * buy;


});

});


let html = `

<button onclick="openSupplierHistory()"
style="
padding:8px 12px;
border:none;
border-radius:8px;
margin-bottom:10px;
">
🔙 Back
</button>

<h3>📦 Products</h3>

`;


if(Object.keys(summary).length === 0){

html += `
<div style="text-align:center;color:#777;padding:20px;">
No products
</div>
`;

}else{


Object.keys(summary).forEach(name=>{

const p = summary[name];

html += `

<div style="
background:#f5f5f5;
padding:10px;
border-radius:8px;
margin-bottom:8px;
display:flex;
justify-content:space-between;
">

<b>${name}</b>

<span>
${p.qty}
</span>

<span style="color:#4CAF50;font-weight:bold;">
${p.amount.toLocaleString()} BIF
</span>

</div>

`;

});

}


box.innerHTML = html;


}catch(err){

console.error(err);
alert("Failed");

}

};


window.deleteSupplierHistory = async function(id){

try{

if(!auth.currentUser){
alert("Login First");
return;
}

const ok = confirm(
"Delete this sale history?"
);

if(!ok){
return;
}

const uid = auth.currentUser.uid;


// DELETE REAL DOCUMENT
await deleteDoc(
  doc(
    db,
    "users",
    uid,
    "supplierHistory",
    id
  )
);


// REMOVE UI
document
.getElementById(`history-${id}`)
?.remove();


alert("🗑 History deleted");


await openSupplierHistory();


}
catch(err){

console.error(err);

alert(
"Delete failed"
);

}

};


window.openHistoryView = async function(id){

try{

if(!auth.currentUser){
alert("Login First");
return;
}

const uid = auth.currentUser.uid;

const snap = await getDoc(
doc(
db,
"users",
uid,
"supplierHistory",
id
)
);

if(!snap.exists()){
alert("History not found");
return;
}

const h = snap.data();

document.getElementById("supplierHistoryList").style.display="none";

let detail =
document.getElementById("historyDetail");

if(!detail){

document.getElementById(
"supplierHistorySection"
).insertAdjacentHTML(
"beforeend",
`<div id="historyDetail"></div>`
);

detail =
document.getElementById("historyDetail");

}

detail.style.display="block";

const date =
h.createdAt?.toDate
?
h.createdAt.toDate().toLocaleString()
:
"-";

detail.innerHTML = `

<button
onclick="closeHistoryView()"
style="
width:36px;
height:36px;
border:none;
border-radius:50%;
background:#f5f5f5;
margin-bottom:10px;
">
🔙
</button>

<div style="
background:white;
padding:15px;
border-radius:12px;
">

<h3 style="
margin:0 0 15px;
">
📋 Purchase Details
</h3>

<p><b>🆔 Number:</b> ${h.supplierNumber || "-"}</p>

<p><b>👤 Supplier:</b> ${h.supplierName || "-"}</p>

<p><b>📅 Date:</b> ${date}</p>

<p><b>💰 Total:</b>
${Number(h.total||0).toLocaleString()} BIF
</p>

<p><b>✅ Paid:</b>
${Number(h.paid||0).toLocaleString()} BIF
</p>

<p><b>🔴 Debt:</b>
${Number(h.debt||0).toLocaleString()} BIF
</p>

<hr>

<h4 style="margin-bottom:10px;">
📦 Products
</h4>

${(h.items||[]).map(i=>{

const amount =
Number(i.qty||0) *
Number(i.buy||0);

return `

<div style="
padding:10px 0;
border-bottom:1px solid #eee;
">

<div style="
display:flex;
justify-content:space-between;
font-weight:bold;
">

<span>
${i.product} (${i.qty})
</span>

<span>
${amount.toLocaleString()} BIF
</span>

</div>

<div style="
font-size:12px;
color:#666;
margin-top:3px;
">

Buy:
${Number(i.buy||0).toLocaleString()} BIF

</div>

</div>

`;

}).join("")}

<div style="
margin-top:10px;
padding-top:10px;
border-top:2px solid #ddd;
display:flex;
justify-content:space-between;
font-weight:bold;
">

<span>
📦 Total
</span>

<span>
${(h.items||[])
.reduce((sum,i)=>
sum + Number(i.qty||0)*Number(i.buy||0),0)
.toLocaleString()} BIF
</span>

</div>
</div>

`;

}catch(err){

console.error(err);

alert("Failed to open history");

}

};

window.closeHistoryView =
function(){

const detail =
document.getElementById(
"historyDetail"
);

if(
detail
){

detail.style.display =
"none";

}


document.getElementById(
"supplierHistoryList"
).style.display =
"block";

};



// =========================
// PAYROLL
// =========================

window.openSupplierPayroll = async function () {

  try {

    if (!auth.currentUser) {
      alert("Login First");
      return;
    }

    const uid = auth.currentUser.uid;

    document.getElementById("supplierPayrollSection").style.display = "block";

    const list = document.getElementById("supplierPayrollList");
    const totalBox = document.getElementById("supplierPayrollTotal");

    list.innerHTML = `<div style="padding:20px;text-align:center;">Loading...</div>`;

    // FILTERS
    const sort =
      document.getElementById("payrollSort")?.value || "high";

    const search =
      document.getElementById("supplierPayrollSearch")?.value
        .toLowerCase()
        .trim() || "";

    const dateFilter = getPayrollDate();

    const now = new Date();

    // Start & End of week
    const weekStart = new Date(now);
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(now.getDate() - now.getDay());

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    // LOAD DATA
    const suppliersSnap = await getDocs(
      collection(db, "users", uid, "suppliers")
    );

    const historySnap = await getDocs(
      collection(db, "users", uid, "supplierHistory")
    );

    let data = [];

    suppliersSnap.forEach(docSnap => {
      
      

      const s = docSnap.data();

      let total = 0;

      historySnap.forEach(hDoc => {

        const h = hDoc.data();

        if (h.supplierId !== docSnap.id) return;

        const date = h.createdAt?.toDate
          ? h.createdAt.toDate()
          : new Date();

        let include = true;

        switch (dateFilter) {

  case "today":
    include =
      date.toDateString() === now.toDateString();
    break;

  case "week":
    include =
      date >= weekStart &&
      date < weekEnd;
    break;

  case "month":
    include =
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();
    break;

  case "year":
    include =
      date.getFullYear() === now.getFullYear();
    break;

  case "custom":

    const start =
      document.getElementById("payrollStartDate")?.value;

    const end =
      document.getElementById("payrollEndDate")?.value;

    if (start && end) {

      const startDate = new Date(start);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(end);
      endDate.setHours(23, 59, 59, 999);

      include =
        date >= startDate &&
        date <= endDate;

    } else {

      include = false;

    }

    break;

  case "all":
  default:
    include = true;
    break;

}

        if (!include) return;

        total += Number(h.debt || 0);

      }); 

      if (total <= 0) return;

      const text = `
${s.supplierNumber || ""}
${s.name || ""}
${s.location || ""}
`
.toLowerCase()
.trim();

if (search && !text.includes(search)) return;

      data.push({
  id: docSnap.id,
  supplierNumber: s.supplierNumber || "-",
  name: s.name,
  location: s.location,
  total
});

    }); // <-- Funga suppliersSnap.forEach()

    // SORT
    if (sort === "high") {
      data.sort((a, b) => b.total - a.total);
    } else if (sort === "low") {
      data.sort((a, b) => a.total - b.total);
    } else if (sort === "az") {
      data.sort((a, b) => a.name.localeCompare(b.name));
    }

    list.innerHTML = "";

    let grandTotal = 0;

    if (data.length === 0) {

      list.innerHTML = `
        <div style="
          padding:20px;
          text-align:center;
          color:#777;
        ">
          No supplier found
        </div>
      `;

      totalBox.innerHTML = "";
      return;
    }

    data.forEach(s => {

  grandTotal += s.total;

  list.insertAdjacentHTML("beforeend",`

<div style="
background:white;
padding:12px;
margin-bottom:10px;
border-radius:12px;
display:flex;
justify-content:space-between;
align-items:center;
box-shadow:0 2px 8px rgba(0,0,0,.08);
">

<div>

<div style="
font-size:11px;
color:#2196F3;
font-weight:bold;
margin-bottom:2px;
">
🆔 ${s.supplierNumber}
</div>

<div style="
font-size:15px;
font-weight:bold;
">
🚚 ${s.name}
</div>

<div style="
font-size:12px;
color:#777;
">
📍 ${s.location || "-"}
</div>

</div>

<div style="
font-size:15px;
font-weight:bold;
color:#4CAF50;
">
${s.total.toLocaleString()} BIF
</div>

</div>

`);

});

// Save current list for printing
window.currentSupplierPayroll = [...data];
window.currentSupplierPayrollTotal = grandTotal;

window.currentSupplierPayrollFilter = {
  search: search,
  sort: sort,
  dateFilter: dateFilter
};


totalBox.innerHTML = `
<div style="
  background:linear-gradient(135deg,#4CAF50,#2E7D32);
  color:white;
  padding:10px;
  border-radius:10px;
  margin-bottom:10px;
  text-align:center;
">
  💰 Total Payroll: ${grandTotal.toLocaleString()} BIF
</div>
`;
  } catch (err) {

    console.error(err);
    alert(err.message);

  }

};

// LIVE SEARCH
window.searchSupplierPayroll = function () {
  openSupplierPayroll();
};

window.changePayrollFilter = function(){

  const value =
    document.getElementById("payrollDate").value;

  const custom =
    document.getElementById("payrollCustomFilter");

  if(value === "custom"){

    custom.style.display = "block";

  }else{

    custom.style.display = "none";

    openSupplierPayroll();

  }

};

window.closeSupplierPayroll =
function(){

document
.getElementById(
"supplierPayrollSection"
)
.style.display =
"none";

const suppliers =
document.getElementById(
"suppliersSection"
);

if(
suppliers
){

suppliers.style.display =
"block";

}

const search =
document.getElementById(
"supplierPayrollSearch"
);

if(
search
){

search.value =
"";

}



document.getElementById(
"supplierPayrollList"
)
.innerHTML =
"";

document.getElementById(
"supplierPayrollTotal"
)
.innerHTML =
"";

};


window.openPayrollSettings = function () {

  document.getElementById("payrollSettings").style.display = "flex";

};

window.closePayrollSettings = function () {

  document.getElementById("payrollSettings").style.display = "none";

};


window.printSupplierPayroll = function () {

  const data = window.currentSupplierPayroll || [];
  const totalPayroll = window.currentSupplierPayrollTotal || 0;



  if (data.length === 0) {
    alert("No supplier payroll to print.");
    return;
  }

  let rows = "";

  data.forEach(s => {

    rows += `
      <tr>
        <td>${s.name}</td>
        <td>${s.location || "-"}</td>
        <td>${s.total.toLocaleString()} BIF</td>
      </tr>
    `;

  });

  const savedFilter = window.currentSupplierPayrollFilter || {};

const filter = savedFilter.dateFilter || "All";

let sortText = "High Amount";

if(savedFilter.sort === "low"){
  sortText = "Low Amount";
}

if(savedFilter.sort === "az"){
  sortText = "A-Z";
}

const searchText = savedFilter.search || "";


  const win = window.open("", "_blank");

  win.document.write(`
<html>
<head>
<title>Supplier Payroll</title>

<style>

body{
font-family:Arial;
padding:20px;
}

h2{
text-align:center;
}

table{
width:100%;
border-collapse:collapse;
margin-top:20px;
}

th,td{
border:1px solid #ccc;
padding:10px;
text-align:center;
}

th{
background:#f2f2f2;
}

.total{
margin-top:20px;
text-align:right;
font-size:18px;
font-weight:bold;
}

</style>

</head>

<body>

<h2>🚚 DukaFlow Supplier Payroll</h2>

<p><b>Date:</b> ${new Date().toLocaleDateString()}</p>

<p><b>Filter:</b> ${filter}</p>
<p><b>Sort:</b> ${sortText}</p>
<p><b>Search:</b> ${searchText || "None"}</p>
<table>

<tr>
<th>Supplier</th>
<th>Location</th>
<th>Amount</th>
</tr>

${rows}

</table>

<div class="total">
💰 Total Payroll:
${totalPayroll.toLocaleString()} BIF
</div>

</body>
</html>
`);

  win.document.close();

  setTimeout(() => {
    win.focus();
    win.print();
  }, 500);

};


window.getPayrollSort = function () {

  const el = document.getElementById("payrollSort");

  return el ? el.value : "high";

};

// GET DATE FILTER
window.getPayrollDate = function () {

  const el = document.getElementById("payrollDate");

  return el ? el.value : "all";

};

window.openCustomers = function(){

document.getElementById(
"customersSection"
).style.display = "block";

document.getElementById(
"customerSearch"
).value = "";

loadCustomers();

};

window.closeCustomers = function(){

document.getElementById("customersSection").style.display = "none";

};

window.customerDebtData = [];

window.openCustomerDebt = async function(){

if(!auth.currentUser){
alert("Login First");
return;
}

document.getElementById("customerDebtSection").style.display="block";

const box=document.getElementById("customerDebtList");

box.innerHTML="Loading...";

try{

const uid=auth.currentUser.uid;

const snap=await getDocs(
collection(db,"users",uid,"customerHistory")
);

let debts={};

let totalDebt = 0;

snap.forEach(d=>{

const h=d.data();

const debt=Number(h.debt || 0);

if(debt>0){

if(!debts[h.customerName]){
debts[h.customerName]=0;
}

debts[h.customerName]+=debt;

totalDebt += debt;

}

});

window.customerDebtData = [];

Object.keys(debts).forEach(name=>{

  window.customerDebtData.push({
    name: name,
    debt: debts[name]
  });

});

renderCustomerDebt(window.customerDebtData);

}catch(err){

console.error(err);

alert(err.message);

}

};

window.renderCustomerDebt = function(data){

  const box =
    document.getElementById("customerDebtList");

  let total = 0;
  let html = "";

  data.forEach(item=>{

    total += item.debt;

    html += `
    <div
    class="debtCard"
    onclick="openCustomerDebtView('${item.name}')"
    style="
    background:white;
    padding:12px;
    border-radius:12px;
    margin-bottom:10px;
    display:flex;
    justify-content:space-between;
    align-items:center;
    box-shadow:0 2px 6px rgba(0,0,0,.08);
    cursor:pointer;
    ">

      <b>👤 ${item.name}</b>

      <span style="
      color:#f44336;
      font-weight:bold;
      ">
      ${item.debt.toLocaleString()} BIF
      </span>

    </div>
    `;

  });

  if(!html){

    html = `
    <div style="
    text-align:center;
    padding:20px;
    color:#777;
    ">
    No debts found
    </div>
    `;

  }

  box.innerHTML = `
  <div style="
  background:#ffebee;
  padding:12px;
  border-radius:12px;
  margin-bottom:12px;
  display:flex;
  justify-content:space-between;
  font-weight:bold;
  color:#f44336;
  ">
    <span>🧾 Total Debt</span>
    <span>${total.toLocaleString()} BIF</span>
  </div>

  ${html}
  `;

};
window.loadCustomerDebts = function(){

  const keyword =
    document.getElementById("customerDebtSearch")
    .value
    .toLowerCase()
    .trim();

  const filtered =
    window.customerDebtData.filter(c =>

      c.name.toLowerCase().includes(keyword)

    );

  renderCustomerDebt(filtered);

};


window.openCustomerDebtView = async function(name){

try{

const uid = auth.currentUser.uid;

const snap = await getDocs(
collection(db,"users",uid,"customerHistory")
);

let total = 0;
let paid = 0;
let debt = 0;

let html = "";

snap.forEach(d=>{

const h = d.data();

if(h.customerName !== name) return;

if(Number(h.debt || 0) <= 0) return;

total += Number(h.total || 0);
paid += Number(h.paid || 0);
debt += Number(h.debt || 0);

const date = h.createdAt
? h.createdAt.toDate().toLocaleDateString()
: "-";

html += `

<div
onclick="openCustomerHistoryView('${d.id}')"
style="
background:white;
padding:12px;
border-radius:10px;
margin-bottom:10px;
box-shadow:0 2px 6px rgba(0,0,0,.08);
cursor:pointer;
">

<div>📅 ${date}</div>

<div style="margin-top:6px;">
💰 ${Number(h.total).toLocaleString()} BIF
</div>

<div>
💵 Paid: ${Number(h.paid).toLocaleString()} BIF
</div>

<div style="color:#f44336;font-weight:bold;">
🧾 Debt: ${Number(h.debt).toLocaleString()} BIF
</div>

</div>

`;

});

document.getElementById("customerDebtList").innerHTML = `

<div style="
display:flex;
justify-content:space-between;
align-items:center;
margin-bottom:12px;
">

<button
onclick="openCustomerDebt()"
style="
border:none;
background:#eee;
padding:8px 12px;
border-radius:10px;
">
🔙 Back
</button>

<button
onclick="openCustomerPaymentHistory('${name}')"
style="
border:none;
background:#E3F2FD;
color:#1976D2;
padding:8px 12px;
border-radius:10px;
font-weight:bold;
">
📜 Payment History
</button>

</div>

<h2>👤 ${name}</h2>

<div style="
background:#ffebee;
padding:12px;
border-radius:12px;
margin-bottom:12px;
">

<div style="
display:flex;
justify-content:space-between;
align-items:flex-start;
gap:15px;
">

  <!-- LEFT -->
  <div>

    <div>
      <b>💰 Total:</b>
      ${total.toLocaleString()} BIF
    </div>

    <div style="margin-top:6px;">
      <b>💵 Paid:</b>
      ${paid.toLocaleString()} BIF
    </div>

    <div style="
    margin-top:6px;
    color:#f44336;
    ">
      <b>🧾 Debt:</b>
      ${debt.toLocaleString()} BIF
    </div>

  </div>

  <!-- RIGHT -->
  <div style="
  width:120px;
  ">

    <input
    id="debtPayment"
    type="number"
    placeholder="Amount"
    style="
    width:100%;
    padding:8px;
    border:1px solid #ddd;
    border-radius:8px;
    box-sizing:border-box;
    ">

    <button
    onclick="payCustomerDebt('${name}')"
    style="
    width:100%;
    margin-top:8px;
    padding:8px;
    border:none;
    border-radius:8px;
    background:#4CAF50;
    color:white;
    font-weight:bold;
    ">
    💵 Pay
    </button>

  </div>

</div>

</div>

${html || `
<div style="text-align:center;padding:20px;color:#777;">
No unpaid history
</div>
`}

`;

}catch(err){

console.error(err);
alert(err.message);

}

};

window.payCustomerDebt = async function(name){

try{

const input = document.getElementById("debtPayment");

const amount = Number(input?.value || 0);

if(amount<=0){
alert("Enter payment amount");
return;
}

const uid = auth.currentUser.uid;

const snap = await getDocs(
query(
collection(db,"users",uid,"customerHistory"),
where("customerName","==",name)
)
);

const docs = snap.docs.sort((a,b)=>{

const da = a.data().createdAt?.toMillis?.() || 0;
const db = b.data().createdAt?.toMillis?.() || 0;

return da - db;

});

let remaining = amount;

for(const d of docs){

if(remaining<=0) break;

const h = d.data();

let debt = Number(h.debt || 0);

if(debt<=0) continue;

let paid = Number(h.paid || 0);

const pay = Math.min(remaining,debt);

paid += pay;
debt -= pay;
remaining -= pay;

await addDoc(
collection(db,"users",uid,"customerPayments"),
{
customerName: name,
amount: pay,
createdAt: new Date()
}
);


await updateDoc(
doc(db,"users",uid,"customerHistory",d.id),
{
paid,
debt,
status: debt>0 ? "Unpaid" : "Paid"
}
);

}

input.value="";

if(remaining>0){

alert(
`Payment saved.\nUnused amount: ${remaining.toLocaleString()} BIF`
);

}else{

alert("Debt paid successfully.");

}

openCustomerDebtView(name);

}catch(err){

console.error(err);
alert(err.message);

}

};

window.closeCustomerDebt=function(){

document.getElementById("customerDebtSection").style.display="none";

};

window.openCustomerPaymentHistory = async function(name){

try{

const uid = auth.currentUser.uid;

const snap = await getDocs(
query(
collection(db,"users",uid,"customerPayments"),
where("customerName","==",name)
)
);

let html = `
<div style="
margin-bottom:15px;
font-size:18px;
font-weight:bold;
">
📜 Payment History
</div>
`;

if(snap.empty){

html += `
<div style="
text-align:center;
padding:20px;
color:#777;
">
No payment history
</div>
`;

}else{

snap.forEach(d=>{

const p = d.data();

const date = p.createdAt
? p.createdAt.toDate().toLocaleString()
: "-";

html += `
<div style="
background:white;
padding:12px;
border-radius:10px;
margin-bottom:10px;
box-shadow:0 2px 6px rgba(0,0,0,.08);
">

<div>📅 ${date}</div>

<div style="
margin-top:6px;
font-weight:bold;
color:#4CAF50;
">
💵 ${Number(p.amount || 0).toLocaleString()} BIF
</div>

</div>
`;

});

}

document.getElementById("customerDebtList").innerHTML = html;

}catch(err){

console.error(err);
alert(err.message);

}

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

window.closeCustomerPopup = function(){

  document.getElementById("addCustomerPopup").style.display = "none";

  document.getElementById("cName").value = "";
  document.getElementById("cPhone").value = "";
  document.getElementById("cLocation").value = "";

};


window.loadCustomers = async function () {

  try {

    if (!auth.currentUser) {

      document.getElementById("customerList").innerHTML = `
      <div style="padding:30px;text-align:center;color:#888;">
      👤 Login first
      </div>
      `;

      return;
    }

    const uid = auth.currentUser.uid;

    const list = document.getElementById("customerList");

    const search = document
      .getElementById("customerSearch")
      ?.value
      .toLowerCase()
      .trim() || "";

    const snap = await getDocs(
      collection(db, "users", uid, "customers")
    );

    list.innerHTML = "";

    if (snap.empty) {

      document.getElementById("customerTotal").innerHTML =
        "👤 Total Customers: 0";

      list.innerHTML = `
      <div style="padding:30px;text-align:center;color:#888;">
      👤 No customers yet
      </div>
      `;

      return;
    }

    // Save all customers
    let customers = [];

    snap.forEach(docSnap => {
      customers.push({
        id: docSnap.id,
        ...docSnap.data()
      });
    });

    // Sort A-Z
    customers.sort((a, b) =>
      (a.name || "").localeCompare(b.name || "", undefined, {
        sensitivity: "base"
      })
    );

    // Total
    document.getElementById("customerTotal").innerHTML =
      `👤 Total Customers: ${customers.length}`;

    let found = 0;

    customers.forEach(c => {

      const text =
        `${c.name || ""} ${c.location || ""}`.toLowerCase();

      if (!text.includes(search)) return;

      found++;

      list.insertAdjacentHTML(
        "beforeend",
        `
        <div
        onclick="openCustomerView('${c.id}')"
        style="
        display:flex;
        justify-content:space-between;
        align-items:center;
        padding:12px;
        margin-top:10px;
        border-radius:10px;
        background:white;
        box-shadow:0 2px 8px rgba(0,0,0,.08);
        cursor:pointer;
        ">

          <div style="font-weight:bold;">
          👤 ${c.name}
          </div>

          <div style="font-size:13px;color:#666;">
          📍 ${c.location || "-"}
          </div>

        </div>
        `
      );

    });

    if (found === 0) {

      list.innerHTML = `
      <div style="padding:30px;text-align:center;color:#888;">
      🔍 No customer found
      </div>
      `;

    }

  } catch (err) {

    console.log(err);
    alert("Failed to load customers");

  }

};


window.searchCustomers = function(){

loadCustomers();

};

window.toggleCustomerSearch = function () {

  const input = document.getElementById("customerSearch");

  if (input.style.display === "none" || input.style.display === "") {
    input.style.display = "block";
    input.focus();
  } else {
    input.style.display = "none";
    input.value = "";
    searchCustomers();
  }

};

window.openCustomerView = async function (id) {

try {

if (!auth.currentUser) {
alert("Login First");
return;
}

const uid = auth.currentUser.uid;

// 🔥 FIXED PATH
const snap = await getDoc(
doc(db, "users", uid, "customers", id)
);

if (!snap.exists()) {
alert("Customer not found");
return;
}

const c = snap.data();

window.currentCustomer = {
  id: id,
  name: c.name,
  phone: c.phone,
  location: c.location
};

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

<div style="max-width:360px;margin:auto;padding:12px;font-family:Arial;">  <!-- TOP BAR -->  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">  <button onclick="closeCustomerProfile()"  
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

</div>  <!-- CUSTOMER CARD -->  <div style="background:white;padding:12px;border-radius:12px;box-shadow:0 1px 4px rgba(0,0,0,.08);">  <h3 style="margin:0;font-size:17px;">  
${c.name || "No name"}  
</h3>  <div style="margin-top:10px;font-size:13px;color:#555;">  
📞 ${c.phone || "No phone"}  
</div>  <div style="margin-top:6px;font-size:13px;color:#555;">  
📍 ${c.location || "No location"}  
</div>  </div>  <!-- ACTIONS -->  <div style="display:flex;gap:8px;margin-top:12px;">  <button onclick="openCustomerSaleBuilder()"  
style="flex:1;border:none;border-radius:10px;padding:10px;background:#FF9800;color:white;">
💰 Sale
</button>

<button onclick="openCustomerHistory()"  
style="flex:1;border:none;border-radius:10px;padding:10px;background:#673AB7;color:white;">
📋 History
</button>

</div>  </div>  
`;  } catch (err) {
console.error(err);
alert("Error: " + err.message);
}

};


window.editCustomer = async function(id){

try{

if(!auth.currentUser){
alert("Login First");
return;
}

const uid = auth.currentUser.uid;

// GET CURRENT DATA
const snap = await getDoc(
doc(db, "users", uid, "customers", id)
);

if(!snap.exists()){
alert("Customer not found");
return;
}

const c = snap.data();

// INPUTS
let newName = prompt("Customer Name", c.name || "");
if(!newName) return;

let newPhone = prompt("Phone", c.phone || "");
let newLocation = prompt("Location", c.location || "");

// UPDATE
await updateDoc(
doc(db, "users", uid, "customers", id),
{
name: newName,
phone: newPhone,
location: newLocation
}
);

alert("✅ Customer updated");

// refresh view
openCustomerView(id);

}catch(err){
console.log(err);
alert("Failed to update customer");
}

};

window.deleteCustomer = async function(id){

try{

if(!auth.currentUser){
alert("Login First");
return;
}

const uid = auth.currentUser.uid;

// CONFIRM
const ok = confirm("Delete this customer?");
if(!ok) return;

// DELETE
await deleteDoc(
doc(db, "users", uid, "customers", id)
);

alert("🗑 Customer deleted");

// back to list
document.getElementById("customerProfile").style.display = "none";
document.getElementById("customersSection").style.display = "block";

loadCustomers();

}catch(err){
console.log(err);
alert("Failed to delete customer");
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

try {

if (!auth.currentUser) {
alert("Login First");
return;
}

const uid = auth.currentUser.uid;

customerSaleItems = [];

document.getElementById("customerSaleItemsList").innerHTML = "";

document.getElementById("customerSaleBuilder").style.display = "block";

const box = document.getElementById("customerProductsList");

box.innerHTML = "Loading...";

const snap = await getDocs(
collection(db, "users", uid, "products")
);

box.innerHTML = "";

let found = false;

snap.forEach(docSnap => {

  const p = docSnap.data();

  if (p.category === "raw") return;
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
        <small>
          Stock: ${p.qty || 0}
        </small>
      </div>

      <input
        type="number"
        min="0"
        max="${p.qty || 0}"
        placeholder="Qty"
        class="customerQty"
        data-id="${docSnap.id}"
        data-name="${p.name}"
        data-sell="${p.sell || 0}"
        data-stock="${p.qty || 0}"
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

}catch(err){
console.log(err);
alert("Failed to load products");
}

};


window.loadCustomerProducts = async function () {

const uid = auth.currentUser.uid;

const box = document.getElementById("customerProductsList");

box.innerHTML = "Loading...";

const snap = await getDocs(
collection(db, "users", uid, "products")
);

box.innerHTML = "";

snap.forEach(docSnap => {

  const p = docSnap.data();

  if (p.category === "raw") return;

  box.innerHTML += `
    <div style="
      display:flex;
      justify-content:space-between;
      padding:6px;
      font-size:13px;
    ">

      <span>
        ${p.name} (${p.qty})
      </span>

      <input
        type="number"
        class="customerQty"
        data-id="${docSnap.id}"
        data-name="${p.name}"
        data-sell="${p.sell || 0}"
        data-stock="${p.qty || 0}"
        placeholder="0"
        style="
          width:50px;
          text-align:center;
        ">
    </div>
  `;
});

};

window.closeCustomerSaleBuilder = function () {

  document.getElementById("customerSaleBuilder").style.display = "none";

  // optional cleanup (iba fresh next time)
  if (document.getElementById("customerProductsList")) {
    document.getElementById("customerProductsList").innerHTML = "";
  }

  if (document.getElementById("customerSaleItemsList")) {
    document.getElementById("customerSaleItemsList").innerHTML = "";
  }

  customerSaleItems = [];

};


window.filterCustomerSaleProducts = function () {

const q = document
.getElementById("customerProductSearch")
.value.toLowerCase();

document.querySelectorAll(".customerQty")
.forEach(input => {

const name = (input.dataset.name || "").toLowerCase();

const row = input.parentElement;

row.style.display = name.includes(q) ? "flex" : "none";

});

};

window.saveSelectedProducts = function () {

  const inputs = document.querySelectorAll(".customerQty");

  let added = 0;

  for (let input of inputs) {

    const qty = Number(input.value || 0);
    const stock = Number(input.dataset.stock || 0);

    if (qty <= 0) continue;

    if (stock > 0 && qty > stock) {
      alert(`${input.dataset.name} stock is only ${stock}`);
      return;
    }

    const existing = customerSaleItems.find(
      i => i.id === input.dataset.id
    );

    if (existing) {
      existing.qty += qty;
    } else {
      customerSaleItems.push({
        id: input.dataset.id,
        product: input.dataset.name,
        qty: qty,
        sell: Number(input.dataset.sell || 0)
      });
    }

    input.value = "";
    added++;
  }

  if (added === 0) {
    alert("No products selected");
    return;
  }

  renderCustomerSaleItems();

  document.getElementById("customerSaleItemsList")
    .scrollIntoView({ behavior: "smooth" });

};

window.addCustomerSaleItem = function () {

  const select = document.getElementById("customerSaleProduct");
  const product = select.value;
  const qty = Number(document.getElementById("customerSaleQty").value);

  if (!product || qty <= 0) {
    alert("Select product + quantity");
    return;
  }

  const option = select.options[select.selectedIndex];

  const id = option?.dataset?.id;
  const sell = Number(option?.dataset?.sell || 0);
  const stock = Number(option?.dataset?.stock || 0);

  if (stock > 0 && qty > stock) {
    alert(`Stock only available: ${stock}`);
    return;
  }

  const existing = customerSaleItems.find(i => i.id === id);

  if (existing) {
    existing.qty += qty;
  } else {
    customerSaleItems.push({
      id,
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

  if (!customerSaleItems.length) {
    box.innerHTML = `
      <div style="text-align:center;color:#777;padding:10px;">
        No items selected
      </div>
    `;
    return;
  }

  let total = 0;

  let html = customerSaleItems.map((item, index) => {

    const line = item.qty * item.sell;
    total += line;

    return `
      <div style="
        display:flex;
        justify-content:space-between;
        align-items:center;
        background:#f5f5f5;
        padding:10px;
        border-radius:8px;
        margin-bottom:8px;
      ">

        <div>
          ${item.product} (${item.qty})
        </div>

        <div style="color:#4CAF50;font-weight:bold;">
          ${line.toLocaleString()}
        </div>

        <button onclick="removeCustomerSaleItem(${index})"
          style="
            border:none;
            background:#ffebee;
            color:#f44336;
            width:28px;
            height:28px;
            border-radius:50%;
          ">
          🗑
        </button>

      </div>
    `;
  }).join("");

  html += `
  <div style="
    padding:10px;
    background:#E8F5E9;
    border-radius:8px;
    margin-top:10px;
  ">

    <div style="
      font-weight:bold;
      text-align:right;
      margin-bottom:10px;
    ">
      💰 Total: ${total.toLocaleString()} BIF
    </div>

    <input
      id="customerPaid"
      type="number"
      placeholder="💵 Amount Paid"
      style="
        width:100%;
        padding:12px;
        border:1px solid #ddd;
        border-radius:8px;
        box-sizing:border-box;
      "
    >

  </div>
`;

  box.innerHTML = html;
};

window.removeCustomerSaleItem = function (index) {
  customerSaleItems.splice(index, 1);
  renderCustomerSaleItems();
};


window.finishCustomerSale = async function () {

  if (!window.currentCustomer || !window.currentCustomer.id) {
    alert("No customer selected");
    return;
  }

  if (customerSaleItems.length === 0) {
    alert("No items added");
    return;
  }

  try {

    const uid = auth.currentUser.uid;

    const snap = await getDocs(
      collection(db, "users", uid, "products")
    );

    const productsMap = {};

    snap.forEach(docSnap => {
      productsMap[docSnap.id] = {
        id: docSnap.id,
        ...docSnap.data()
      };
    });

    let total = 0;

    // CHECK STOCK + UPDATE STOCK
    for (const item of customerSaleItems) {

      const p = productsMap[item.id];

      if (!p) continue;

      if (Number(p.qty || 0) < Number(item.qty || 0)) {
        alert(`${item.product} stock is not enough`);
        return;
      }

      await updateDoc(
        doc(db, "users", uid, "products", p.id),
        {
          qty: Number(p.qty || 0) - Number(item.qty || 0)
        }
      );

      total +=
        Number(p.sell || 0) *
        Number(item.qty || 0);

    }

    // PAYMENT
    const paid = Number(
      document.getElementById("customerPaid")?.value || 0
    );

    const debt = Math.max(0, total - paid);

    const status =
      debt > 0 ? "Unpaid" : "Paid";

  
    await addDoc(
      collection(db, "users", uid, "customerHistory"),
      {
        customerId: window.currentCustomer.id,
        customerName: window.currentCustomer.name,
        items: customerSaleItems,
        total: total,
        paid: paid,
        debt: debt,
        status: status,
        createdAt: new Date()
      }
    );

    // CLEAR
    customerSaleItems = [];

    document.getElementById("customerSaleItemsList").innerHTML = "";

    const input = document.getElementById("customerPaid");
    if (input) input.value = "";

    document.getElementById("customerSaleBuilder").style.display = "none";

    await loadProducts();
    await loadCustomers();
    await updateDashboard();

    alert("✅ Sale Saved Successfully");

  } catch (err) {

    console.error(err);
    alert(err.message);

  }

};



window.openCustomerHistory = async function () {

  if (!window.currentCustomer?.id) {
    alert("No customer selected");
    return;
  }

  const uid = auth.currentUser.uid;

  document.getElementById("customerHistorySection").style.display = "block";

  const box = document.getElementById("customerHistoryList");

  box.innerHTML = `
    <div style="text-align:center;padding:20px;color:#777;">
      Loading history...
    </div>
  `;

  try {

    const snap = await getDocs(
      query(
        collection(db, "users", uid, "customerHistory"),
        where("customerId", "==", window.currentCustomer.id)
      )
    );

    let totalSales = 0;
    let totalProducts = 0;
    let html = "";

    snap.forEach(d => {

  const h = d.data();

  totalSales += Number(h.total || 0);

  if (Array.isArray(h.items)) {
    totalProducts += h.items.length;
  }

  const value = Number(h.total || 0);
  const paid = Number(h.paid || 0);
  const debt = Number(h.debt || 0);
  const status = h.status || "Paid";

  const date = h.createdAt
    ? h.createdAt.toDate().toLocaleDateString()
    : "-";

  html += `
    <div
      onclick="openCustomerHistoryView('${d.id}')"
      style="
        background:white;
        padding:10px;
        border-radius:10px;
        margin-bottom:8px;
        box-shadow:0 1px 4px rgba(0,0,0,.08);
        cursor:pointer;
      ">

      <div style="display:flex;justify-content:space-between;align-items:flex-start;">

        <div>

          <div style="font-size:12px;color:#777;">
            📅 ${date}
          </div>

          <div style="font-size:14px;font-weight:bold;color:#2e7d32;">
            💰 Total: ${value.toLocaleString()} BIF
          </div>

          <div style="font-size:13px;color:#2196F3;">
            💵 Paid: ${paid.toLocaleString()} BIF
          </div>

          <div style="font-size:13px;color:#f44336;">
            🧾 Debt: ${debt.toLocaleString()} BIF
          </div>

          <div style="
            margin-top:4px;
            font-size:12px;
            font-weight:bold;
            color:${status==="Paid" ? "#4CAF50" : "#f44336"};
          ">
            ✅ ${status}
          </div>

        </div>

        <button
          onclick="event.stopPropagation();deleteCustomerHistory('${d.id}')"
          style="
            width:28px;
            height:28px;
            border:none;
            border-radius:50%;
            background:#f44336;
            color:white;
          ">
          🗑
        </button>

      </div>

    </div>
  `;

});
    if (!html) {
      html = `
        <div style="text-align:center;padding:20px;color:#777;">
          No history found
        </div>
      `;
    }

    box.innerHTML = `

  <div style="
    display:flex;
    flex-direction:column;
    gap:6px;
    margin-bottom:10px;
  ">

    <!-- TOTAL SALES -->
    <div style="
      display:flex;
      justify-content:space-between;
      align-items:center;
      background:#e3f2fd;
      padding:8px 10px;
      border-radius:8px;
      font-size:13px;
    ">
      <span>💰 Total Sales</span>
      <b>${totalSales.toLocaleString()} BIF</b>
    </div>

    <!-- TOTAL PRODUCTS -->
    <div
      onclick="openCustomerProductsView()"
      style="
        display:flex;
        justify-content:space-between;
        align-items:center;
        background:#fff3e0;
        padding:8px 10px;
        border-radius:8px;
        font-size:13px;
        cursor:pointer;
      ">
      <span>📦 Total Products</span>
      <b>${totalProducts}</b>
    </div>

  </div>

  ${html}
`;

  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};


window.deleteCustomerHistory = async function (id) {

  try {

    if (!auth.currentUser) {
      alert("Login First");
      return;
    }

    const ok = confirm("Delete this sale history?");

    if (!ok) return;

    const uid = auth.currentUser.uid;

    await deleteDoc(
      doc(
        db,
        "users",
        uid,
        "customerHistory",
        id
      )
    );

    // Refresh history
    await openCustomerHistory();

    if (typeof updateDashboard === "function") {
      await updateDashboard();
    }

    if (typeof showToast === "function") {
      showToast("🗑 History deleted", "#f44336");
    } else {
      alert("History deleted");
    }

  } catch (err) {

    console.error(err);
    alert(err.message);

  }

};


window.openCustomerProductsView = async function () {

  if (!window.currentCustomer?.id) return;

  const uid = auth.currentUser.uid;
  const box = document.getElementById("customerHistoryList");

  box.innerHTML = `
    <div style="text-align:center;padding:20px;color:#777;">
      Loading products...
    </div>
  `;

  try {

    const snap = await getDocs(
      query(
        collection(db, "users", uid, "customerHistory"),
        where("customerId", "==", window.currentCustomer.id)
      )
    );

    let products = [];

    snap.forEach(doc => {
      const h = doc.data();

      if (Array.isArray(h.items)) {
        products = products.concat(h.items);
      }
    });

    if (products.length === 0) {
      box.innerHTML = `
        <div style="text-align:center;padding:20px;color:#777;">
          No products found
        </div>
      `;
      return;
    }

    // Merge same products
    const grouped = {};

    products.forEach(item => {

      const key = item.id || item.product;

      if (!grouped[key]) {
        grouped[key] = {
          product: item.product,
          qty: 0,
          sell: Number(item.sell || 0)
        };
      }

      grouped[key].qty += Number(item.qty || 0);

    });

    let html = "";

    Object.values(grouped).forEach(item => {

      const total = item.qty * item.sell;

      html += `
        <div style="
          display:flex;
          justify-content:space-between;
          align-items:center;
          padding:10px;
          margin-bottom:8px;
          background:white;
          border-radius:10px;
          box-shadow:0 1px 4px rgba(0,0,0,.08);
        ">

          <div>
            <b>${item.product}</b><br>
            <small style="color:#777;">
              Qty: ${item.qty}
            </small>
          </div>

          <div style="
            font-weight:bold;
            color:#2e7d32;
          ">
            ${total.toLocaleString()} BIF
          </div>

        </div>
      `;

    });

    box.innerHTML = `
      <div style="
        background:#e3f2fd;
        padding:10px;
        border-radius:10px;
        margin-bottom:10px;
        font-weight:bold;
        text-align:center;
      ">
        📦 All Sold Products
      </div>

      ${html}
    `;

  } catch (err) {
    console.error(err);
    alert(err.message);
  }

};



window.openCustomerHistoryView = async function(id){

try{

const uid = auth.currentUser.uid;

const snap = await getDoc(
doc(db,"users",uid,"customerHistory",id)
);

if(!snap.exists()){
alert("History not found");
return;
}

const h = snap.data();

const paid = Number(h.paid || 0);
const debt = Number(h.debt || 0);
const status = h.status || "Paid";
let itemsHtml = "";

(h.items || []).forEach(item=>{

itemsHtml += `
<div style="
display:flex;
justify-content:space-between;
padding:10px 0;
border-bottom:1px solid #eee;
">

<div>
<b>${item.product}</b><br>
<small>
${item.qty} × ${Number(item.sell).toLocaleString()} BIF
</small>
</div>

<div style="
font-weight:bold;
color:#4CAF50;
">
${(item.qty*item.sell).toLocaleString()} BIF
</div>

</div>
`;

});

const date =
h.createdAt
? h.createdAt.toDate().toLocaleString()
: "-";

const box =
document.getElementById("customerHistoryView");

box.style.display="block";

box.innerHTML=`

<div style="
display:flex;
align-items:center;
justify-content:space-between;
margin-bottom:15px;
">

<button
onclick="closeCustomerHistoryView()"
style="
width:40px;
height:40px;
border:none;
border-radius:50%;
background:white;
font-size:18px;
">
🔙
</button>

<h3 style="margin:0;">
🧾 Sale Details
</h3>

<div style="width:40px;"></div>

</div>

<div style="
background:white;
padding:15px;
border-radius:14px;
box-shadow:0 2px 8px rgba(0,0,0,.08);
">

<div><b>👤 Customer:</b> ${h.customerName}</div>

<div style="margin-top:8px;">
<b>📅 Date:</b> ${date}
</div>

<hr style="margin:15px 0;">

${itemsHtml}

<hr style="margin:15px 0;">

<div style="
display:flex;
justify-content:space-between;
margin-bottom:8px;
">
<span>💰 Total</span>
<b>${Number(h.total || 0).toLocaleString()} BIF</b>
</div>

<div style="
display:flex;
justify-content:space-between;
margin-bottom:8px;
color:#2196F3;
">
<span>💵 Paid</span>
<b>${paid.toLocaleString()} BIF</b>
</div>

<div style="
display:flex;
justify-content:space-between;
margin-bottom:8px;
color:#f44336;
">
<span>🧾 Debt</span>
<b>${debt.toLocaleString()} BIF</b>
</div>

<div style="
display:flex;
justify-content:space-between;
font-weight:bold;
color:${status==="Paid" ? "#4CAF50" : "#f44336"};
">
<span>✅ Status</span>
<b>${status}</b>
</div>

</div>

`;

}catch(err){

console.log(err);

alert(err.message);

}

};


window.closeCustomerHistoryView = function(){

document.getElementById("customerHistoryView").style.display = "none";

document.getElementById("customerHistorySection").style.display = "block";

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

window.toggleEmployeeSearch = function () {

  const input = document.getElementById("employeeSearch");

  if (input.style.display === "none" || input.style.display === "") {
    input.style.display = "block";
    input.focus();
  } else {
    input.style.display = "none";
    input.value = "";
    searchEmployees();
  }

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
      
let employees = [];

snap.forEach(docSnap => {
  employees.push({
    id: docSnap.id,
    ...docSnap.data()
  });
});

// SHOW TOTAL
const totalBox = document.getElementById("employeeTotal");
if (totalBox) {
  totalBox.innerHTML = `👨‍💼 Total Employees: ${employees.length}`;
}

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


window.lastAttendanceEmployee = window.lastAttendanceEmployee || null;

window.markAbsent = async function(id){

  try{

    if(!auth.currentUser){
      alert("Login First");
      return;
    }

    // Ntukore attendance kabiri ku employee umwe ukurikirana
    if(window.lastAttendanceEmployee === id){
      alert("Please mark another employee before marking this employee again.");
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

    if(!snap.exists()){
      alert("Employee not found");
      return;
    }

    const e = snap.data();

    const ok = confirm(`${e.name} is absent?`);

    if(!ok) return;

    const penalty = Number(e.salary || 0) / 30;

    await updateDoc(ref,{

      absent: Number(e.absent || 0) + 1,

      monthlyPenalty:
      Number(e.monthlyPenalty || 0) + penalty

    });

    await addDoc(

      collection(
        db,
        "users",
        uid,
        "attendance"
      ),

      {

        employeeId: id,
        employeeName: e.name,
        date: new Date(),
        status: "absent"

      }

    );

    // Wibuke employee ya nyuma yakorewe attendance
    window.lastAttendanceEmployee = id;

    if(typeof showToast === "function"){

      showToast(
        `${e.name} marked ABSENT ❌`,
        "#f44336"
      );

    }

  }catch(err){

    console.error(err);
    alert(err.message);

  }

};


window.lastAttendanceEmployee = window.lastAttendanceEmployee || null;

window.markPresent = async function(id){

  try{

    if(!auth.currentUser){
      alert("Login First");
      return;
    }

    // Ntukore Present kabiri ku employee umwe ukurikirana
    if(window.lastAttendanceEmployee === id){
      alert("Please mark another employee before marking this employee again.");
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

    if(!snap.exists()){
      alert("Employee not found");
      return;
    }

    const e = snap.data();

    const ok = confirm(`${e.name} is present?`);

    if(!ok) return;

    const daily = Number(e.dailyRate || 0);

    await updateDoc(ref,{

      present: Number(e.present || 0) + 1,

      daysWorked: Number(e.daysWorked || 0) + 1,

      earnedDaily: Number(e.earnedDaily || 0) + daily

    });

    await addDoc(

      collection(
        db,
        "users",
        uid,
        "attendance"
      ),

      {

        employeeId: id,
        employeeName: e.name,
        date: new Date(),
        status: "present"

      }

    );

    // Wibuke employee ya nyuma yakorewe attendance
    window.lastAttendanceEmployee = id;

    if(typeof showToast === "function"){

      showToast(
        `${e.name} marked as PRESENT ✔`,
        "#4CAF50"
      );

    }

  }catch(err){

    console.error(err);
    alert(err.message);

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

  if (!auth.currentUser) {
    alert("Login First");
    return;
  }

  const uid = auth.currentUser.uid;

  const box = document.getElementById("payrollList");
  if (!box) return;

  box.innerHTML = `
    <div style="text-align:center;padding:20px;color:#777;">
      Loading payroll...
    </div>
  `;

  try {

    const snap = await getDocs(
      collection(db, "users", uid, "employees")
    );

    let grandTotal = 0;
    payrollData = [];

    snap.forEach(doc => {

      const e = doc.data();

      let total = 0;

      if (e.paymentType === "Monthly") {

  const salary = Number(e.salary || 0);
  const absent = Number(e.absent || 0);

  const penalty = salary / 30;

  total = salary - (absent * penalty);

  if(total < 0){
    total = 0;
  }

} else {

  total =
    Number(e.dailyRate || 0) *
    Number(e.daysWorked || 0);

}
      grandTotal += total;

      payrollData.push({
        id: doc.id,
        name: e.name || "",
        total
      });

    });

    renderPayroll(payrollData, grandTotal);

  } catch (err) {
    console.error(err);
    alert(err.message);
  }

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
        box-shadow:0 1px 4px rgba(0,0,0,.08);
      ">

        <b>${e.name}</b>

        <span style="
          color:#4CAF50;
          font-weight:bold;
        ">
          ${e.total.toLocaleString()} BIF
        </span>

      </div>
    `;

  });

  if (list.length === 0) {
    html += `
      <div style="
        text-align:center;
        padding:20px;
        color:#777;
      ">
        No employees found
      </div>
    `;
  }

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


window.openAttendance = async function(id){

  if(!auth.currentUser){
    alert("Login First");
    return;
  }

  const uid = auth.currentUser.uid;

  document.getElementById("employeeProfile").style.display = "none";
  document.getElementById("attendanceSection").style.display = "block";

  const box = document.getElementById("attendanceList");
  box.innerHTML = "";

  const snap = await getDocs(
    collection(db,"users",uid,"attendance")
  );

  let html = "";

  snap.forEach(docSnap => {

    const a = docSnap.data();

    if(a.employeeId !== id) return;

    const date = a.date?.toDate
      ? a.date.toDate().toLocaleString()
      : "-";

    html += `
      <div style="
        background:white;
        padding:12px;
        margin-bottom:10px;
        border-radius:10px;
      ">
        <b>${a.status === "present" ? "✔ Present" : "❌ Absent"}</b><br>
        <small>${date}</small>
      </div>
    `;

  });

  box.innerHTML = html || `
    <div style="
      text-align:center;
      padding:20px;
      color:#777;
    ">
      No attendance records
    </div>
  `;

};



window.closeEmployeeProfile = function () {

  const profile = document.getElementById("employeeProfile");
  if (!profile) return;

  profile.style.display = "none";

};



// =========================
// OPEN ADD EXPENSE FORM
// =========================
window.openAddExpense = function () {

  const form = document.getElementById("expenseForm");

  if (!form) return;

  form.style.display =
    form.style.display === "block"
      ? "none"
      : "block";
};

// =========================
// SAVE EXPENSE
// =========================
window.addExpense = async function () {

  try {

    if (!auth.currentUser) {
      alert("Login First");
      return;
    }

    const uid = auth.currentUser.uid;

    const title =
      document.getElementById("eTitle").value.trim();

    const amount =
      Number(document.getElementById("eAmount").value);

    if (!title) {
      alert("Enter expense name");
      return;
    }

    if (!amount || amount <= 0) {
      alert("Enter valid amount");
      return;
    }

    await addDoc(

      collection(
        db,
        "users",
        uid,
        "expenses"
      ),

      {
        name: title,
        amount: amount,
        createdAt: new Date()
      }

    );

    alert("✅ Expense Saved");

    document.getElementById("eTitle").value = "";
    document.getElementById("eAmount").value = "";

    closeExpenseForm();

    loadExpenses();

    if (typeof updateDashboard === "function") {
      updateDashboard();
    }

  } catch (e) {

    console.error(e);
    alert(e.message);

  }

};



window.closeExpenseForm = function () {

  document.getElementById("expenseForm").style.display = "none";

  document.getElementById("eTitle").value = "";
  document.getElementById("eAmount").value = "";

};

// =========================
// LOAD EXPENSES
// =========================

window.loadExpenses = async function () {

  if (!auth.currentUser) return;

  const uid = auth.currentUser.uid;

  const box = document.getElementById("expensesList");

  if (!box) return;

  box.innerHTML = "Loading...";

  const snap = await getDocs(
    collection(db, "users", uid, "expenses")
  );

  const filter =
    document.getElementById("expenseFilterType")?.value || "all";

  const search =
  document.getElementById("expenseSearch")?.value
  .toLowerCase()
  .trim() || "";
  
  
  const sort =
    document.getElementById("expenseFilterSort")?.value || "newest";

  const start =
    document.getElementById("expenseFilterStart")?.value;

  const end =
    document.getElementById("expenseFilterEnd")?.value;

  const now = new Date();

  const weekStart = new Date(now);
  weekStart.setHours(0,0,0,0);
  weekStart.setDate(now.getDate()-now.getDay());

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate()+7);

  let expenses = [];

  snap.forEach(docSnap=>{

    expenses.push({
      id:docSnap.id,
      ...docSnap.data()
    });

  });

  expenses = expenses.filter(e=>{

    if(
      search &&
      !(e.name || "")
      .toLowerCase()
      .includes(search)
    ){
      return false;
    }

    const date = e.createdAt?.toDate
      ? e.createdAt.toDate()
      : new Date();

    switch(filter){

      case "today":
        return date.toDateString() === now.toDateString();

      case "week":
        return date >= weekStart &&
               date < weekEnd;

      case "month":
        return date.getMonth() === now.getMonth() &&
               date.getFullYear() === now.getFullYear();

      case "year":
        return date.getFullYear() === now.getFullYear();

      case "custom":

        if(!start || !end) return false;

        const s = new Date(start);
        s.setHours(0,0,0,0);

        const en = new Date(end);
        en.setHours(23,59,59,999);

        return date >= s && date <= en;

      default:
        return true;

    }

  });

  switch(sort){

    case "highest":
      expenses.sort((a,b)=>
        Number(b.amount)-Number(a.amount));
      break;

    case "lowest":
      expenses.sort((a,b)=>
        Number(a.amount)-Number(b.amount));
      break;

    case "oldest":
      expenses.sort((a,b)=>
        (a.createdAt?.seconds||0)-
        (b.createdAt?.seconds||0));
      break;

    default:
      expenses.sort((a,b)=>
        (b.createdAt?.seconds||0)-
        (a.createdAt?.seconds||0));

  }

  let total = 0;
  let html = "";

  expenses.forEach(e=>{

    total += Number(e.amount || 0);

    const date =
      e.createdAt?.toDate
      ? e.createdAt.toDate().toLocaleDateString()
      : "";

    html += `
<div class="expenseCard"
onclick="openExpenseView('${e.id}')"
style="
display:flex;
justify-content:space-between;
align-items:center;
background:white;
padding:12px;
margin-bottom:10px;
border-radius:10px;
cursor:pointer;
">

<div>
<b>${e.name}</b><br>
<small>📅 ${date}</small>
</div>

<div style="
color:#f44336;
font-weight:bold;
">
${Number(e.amount).toLocaleString()} BIF
</div>

</div>
`;

  });

  box.innerHTML = `
<div
style="
background:#ffe0e0;
color:#b71c1c;
padding:12px;
margin-bottom:12px;
border-radius:10px;
text-align:center;
font-weight:bold;
">
💸 Total Expenses:
${total.toLocaleString()} BIF
</div>

${html || "<div style='padding:20px;text-align:center;'>No expenses found</div>"}
`;

};



window.openExpenseView = async function(id){

  if(!auth.currentUser){
    alert("Login First");
    return;
  }

  const uid = auth.currentUser.uid;

  const snap = await getDoc(
    doc(db,"users",uid,"expenses",id)
  );

  if(!snap.exists()){
    alert("Expense not found");
    return;
  }

  const e = snap.data();

  document.getElementById("expensesSection").style.display = "none";
  document.getElementById("expenseView").style.display = "block";

  document.getElementById("expenseView").innerHTML = `

  <div style="
    max-width:400px;
    margin:auto;
    padding:15px;
    font-family:Arial;
  ">

    <!-- TOP BAR -->
    <div style="
      display:flex;
      justify-content:space-between;
      align-items:center;
      margin-bottom:15px;
    ">

      <button
        onclick="closeExpenseView()"
        style="
          width:40px;
          height:40px;
          border:none;
          border-radius:50%;
          background:#eee;
          cursor:pointer;
        ">
        🔙
      </button>

      <div style="display:flex;gap:8px;">

        <button
          onclick="editExpense('${id}','${e.name}',${e.amount})"
          style="
            width:40px;
            height:40px;
            border:none;
            border-radius:50%;
            background:#2196F3;
            color:white;
            cursor:pointer;
          ">
          ✏️
        </button>

        <button
          onclick="deleteExpenseFromView('${id}')"
          style="
            width:40px;
            height:40px;
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

    <!-- CARD -->
    <div style="
      background:white;
      border-radius:16px;
      padding:20px;
      box-shadow:0 3px 12px rgba(0,0,0,.08);
      text-align:center;
    ">

      <div style="font-size:55px;">💸</div>

      <h2 style="
        margin:10px 0;
        color:#333;
      ">
        ${e.name}
      </h2>

      <div style="
        background:#f6f7fb;
        padding:12px;
        border-radius:10px;
        margin-top:15px;
      ">
        <b>💰 Amount</b><br><br>
        ${Number(e.amount).toLocaleString()} BIF
      </div>

      <div style="
        background:#f6f7fb;
        padding:12px;
        border-radius:10px;
        margin-top:12px;
      ">
        <b>📅 Date</b><br><br>
        ${
          e.createdAt?.toDate
          ? e.createdAt.toDate().toLocaleString()
          : "-"
        }
      </div>

    </div>

  </div>

  `;
};


window.closeExpenseView = function(){

  document.getElementById("expenseView").style.display = "none";
  document.getElementById("expensesSection").style.display = "block";

};


window.deleteExpenseFromView = async function(id){

  if(!confirm("Delete this expense?")) return;

  try{

    const uid = auth.currentUser.uid;

    await deleteDoc(
      doc(db,"users",uid,"expenses",id)
    );

    document.getElementById("expenseView").style.display = "none";
    document.getElementById("expensesSection").style.display = "block";

  loadExpenses();
    updateDashboard();

    alert("✅ Expense deleted");

  }catch(err){
    console.error(err);
    alert(err.message);
  }

};


// =========================
// CLOSE EXPENSES PAGE
// =========================
window.closeExpenses = function () {

  document.getElementById("expensesSection").style.display = "none";

  document.getElementById("dashboardTop").style.display = "block";

};


window.searchExpenses = function(){

  const q = document
    .getElementById("expenseSearch")
    .value
    .trim()
    .toLowerCase();

  let total = 0;
  let found = 0;

  document.querySelectorAll(".expenseCard").forEach(card=>{

    const name = card.dataset.name || "";
    const amount = Number(card.dataset.amount || 0);

    if(name.includes(q)){

      card.style.display = "flex";
      total += amount;
      found++;

    }else{

      card.style.display = "none";

    }

  });

  const totalCard =
    document.getElementById("totalExpensesCard");

  if(totalCard){

    totalCard.innerHTML =
      `💸 Total Expenses: ${total.toLocaleString()} BIF`;

  }

  if(found === 0 && q !== ""){

    document.getElementById("expensesList").insertAdjacentHTML(
      "beforeend",
      `
      <div id="expenseNotFound"
      style="
        text-align:center;
        color:#888;
        padding:20px;
      ">
        🔍 No expense found
      </div>
      `
    );

  }else{

    document.getElementById("expenseNotFound")?.remove();

  }

};


window.editExpense = async function(id, oldName, oldAmount){

  if(!auth.currentUser){
    alert("Login First");
    return;
  }

  const uid = auth.currentUser.uid;

  let name = prompt("Expense Name", oldName);

  if(name === null) return;

  name = name.trim();

  if(!name){
    alert("Enter expense name");
    return;
  }

  let amount = prompt("Amount", oldAmount);

  if(amount === null) return;

  amount = Number(amount);

  if(isNaN(amount) || amount <= 0){
    alert("Invalid amount");
    return;
  }

  await updateDoc(

    doc(db,"users",uid,"expenses",id),

    {
      name,
      amount
    }

  );

  loadExpenses();

  if(typeof updateDashboard==="function"){
    updateDashboard();
  }

  alert("✅ Expense Updated");

};

window.deleteExpense = async function(id){

  if(!auth.currentUser){
    alert("Login First");
    return;
  }

  const uid = auth.currentUser.uid;

  if(!confirm("Delete this expense?")){
    return;
  }

  try{

    await deleteDoc(
      doc(db,"users",uid,"expenses",id)
    );

    loadExpenses();

    if(typeof updateDashboard==="function"){
      updateDashboard();
    }

    if(typeof showToast==="function"){
      showToast("Expense deleted ✔","#f44336");
    }

  }catch(err){

    console.log(err);
    alert(err.message);

  }

};



// =========================
// OPEN EXPENSE SETTINGS
// =========================

window.openExpenseSettings = function(){

const box = document.getElementById("expenseSettings");

if(box){
box.style.display="block";
}

};


// =========================
// CLOSE EXPENSE SETTINGS
// =========================

window.closeExpenseSettings = function(){

const box = document.getElementById("expenseSettings");

if(box){
box.style.display="none";
}

};


// ===============================
// EXPENSE REPORT SYSTEM
// ===============================


window.openExpenseReports = function () {

  const section = document.getElementById("expenseReportSection");

  if (!section) {
    alert("expenseReportSection not found");
    return;
  }

  section.style.display = "block";

  if (typeof loadExpenseReport === "function") {
    loadExpenseReport();
  }

};

window.closeExpenseReports = function () {
  document.getElementById("expenseReportSection").style.display = "none";
};


window.loadExpenseReport = async function(){

try{

if(!auth.currentUser) return;


const uid = auth.currentUser.uid;


const snap = await getDocs(
 collection(db,"users",uid,"expenses")
);



const filter =
document.getElementById("expenseReportFilter")?.value || "all";


const search =
document.getElementById("expenseReportSearch")?.value
.toLowerCase()
.trim() || "";



const now = new Date();



let expenses=[];



snap.forEach(docSnap=>{


const e = docSnap.data();


const date =
e.createdAt?.toDate
?
e.createdAt.toDate()
:
new Date();



let include=true;



switch(filter){


case "today":

include =
date.toDateString()
===
now.toDateString();

break;



case "week":

const weekStart=new Date(now);

weekStart.setDate(
now.getDate()-now.getDay()
);


include =
date>=weekStart;

break;



case "month":

include =
date.getMonth()===now.getMonth()
&&
date.getFullYear()===now.getFullYear();

break;



case "year":

include =
date.getFullYear()
===
now.getFullYear();

break;



case "custom":

const start =
document.getElementById("expenseStartDate")?.value;


const end =
document.getElementById("expenseEndDate")?.value;



if(start && end){


let s=new Date(start);
s.setHours(0,0,0,0);


let en=new Date(end);
en.setHours(23,59,59,999);



include =
date>=s &&
date<=en;


}else{

include=false;

}

break;



case "all":

default:

include=true;

}



if(!include)return;



const text =
`${e.name||""} ${e.category||""}`
.toLowerCase();



if(!text.includes(search))
return;



expenses.push({

id:docSnap.id,

name:e.name || "-",

category:e.category || "Other",

amount:Number(e.amount||0),

date

});


});




// =================
// SUMMARY
// =================


let total=0;

let highest=0;



expenses.forEach(e=>{

total+=e.amount;


if(e.amount>highest)
highest=e.amount;


});



const count=expenses.length;


const average =
count?
total/count:
0;



document.getElementById("reportTotalExpense").innerHTML=
total.toLocaleString()+" BIF";


document.getElementById("reportCount").innerHTML=
count;


document.getElementById("reportAverage").innerHTML=
average.toLocaleString()+" BIF";


document.getElementById("reportHighest").innerHTML=
highest.toLocaleString()+" BIF";


window.currentExpenseReport=expenses;


loadExpenseCategories(expenses);

loadExpenseMonthly(expenses);

loadExpenseList(expenses);

loadExpenseBudget(total);

}catch(err){

console.error(err);

alert(err.message);

}


};

// ===============================
// CATEGORY REPORT
// ===============================

window.loadExpenseCategories = function(expenses){

const box = document.getElementById("expenseCategoryList");

if(!box) return;

if(expenses.length===0){

box.innerHTML="No Data";

return;

}

let categories={};

expenses.forEach(e=>{

categories[e.category]=(categories[e.category]||0)+e.amount;

});

let html="";

Object.keys(categories).forEach(cat=>{

html+=`
<div style="
display:flex;
justify-content:space-between;
padding:8px 0;
border-bottom:1px solid #eee;
font-size:12px;
">

<span>📂 ${cat}</span>

<b>
${categories[cat].toLocaleString()} BIF
</b>

</div>
`;

});

box.innerHTML=html;

};


// ===============================
// MONTHLY SUMMARY
// ===============================

window.loadExpenseMonthly = function(expenses){

const box=document.getElementById("expenseMonthlySummary");

if(!box) return;

if(expenses.length===0){

box.innerHTML="No Data";

return;

}

let months={};

expenses.forEach(e=>{

const key=
e.date.toLocaleString("default",{
month:"short",
year:"numeric"
});

months[key]=(months[key]||0)+e.amount;

});

let html="";

Object.keys(months).forEach(m=>{

html+=`

<div style="
display:flex;
justify-content:space-between;
padding:8px 0;
border-bottom:1px solid #eee;
font-size:12px;
">

<span>📅 ${m}</span>

<b>
${months[m].toLocaleString()} BIF
</b>

</div>

`;

});

box.innerHTML=html;

};


// ===============================
// RECENT LIST
// ===============================

window.loadExpenseList=function(expenses){

const box=document.getElementById("expenseReportList");

if(!box) return;

if(expenses.length===0){

box.innerHTML=`
<div style="
padding:20px;
text-align:center;
color:#777;
">
No expenses
</div>
`;

return;

}

expenses.sort((a,b)=>b.date-a.date);

let html="";

expenses.forEach(e=>{

html+=`

<div style="
background:#fafafa;
padding:10px;
margin-bottom:8px;
border-radius:10px;
display:flex;
justify-content:space-between;
align-items:center;
">

<div>

<div style="
font-size:13px;
font-weight:bold;
">
${e.name}
</div>

<div style="
font-size:11px;
color:#777;
">
${e.category}
•
${e.date.toLocaleDateString()}
</div>

</div>

<div style="
color:#f44336;
font-size:12px;
font-weight:bold;
">
${e.amount.toLocaleString()} BIF
</div>

</div>

`;

});

box.innerHTML=html;

};



window.loadExpenseBudget=function(total){

const budget=
Number(localStorage.getItem("expenseBudget")||0);

const info=
document.getElementById("expenseBudgetInfo");

const bar=
document.getElementById("expenseBudgetBar");

if(!info||!bar) return;

if(budget<=0){

info.innerHTML="No Budget";

bar.style.width="0%";

return;

}

const percent=
Math.min((total/budget)*100,100);

info.innerHTML=`
${total.toLocaleString()} /
${budget.toLocaleString()} BIF
`;

bar.style.width=percent+"%";

if(percent<60){

bar.style.background="#4CAF50";

}else if(percent<90){

bar.style.background="#FF9800";

}else{

bar.style.background="#F44336";

}

};

window.printExpenseReport = function(){

  const content =
    document.getElementById("expenseReportSection").innerHTML;

  const win = window.open("", "_blank");

  win.document.write(`
  <html>

  <head>

  <title>Expense Report</title>

  <style>

  body{
    font-family:Arial;
    padding:20px;
  }

  button,input,select{
    display:none;
  }

  </style>

  </head>

  <body>

  <h2>Expense Report</h2>

  ${content}

  </body>

  </html>
  `);

  win.document.close();

  setTimeout(()=>{
    win.print();
  },500);

};

window.exportExpenseReport = function(){

  const rows = [];

  rows.push([
    "Name",
    "Category",
    "Amount",
    "Date"
  ]);

  window.currentExpenseReport.forEach(e=>{

    rows.push([
      e.name,
      e.category,
      e.amount,
      e.date
    ]);

  });

  const csv =
    rows.map(r=>r.join(",")).join("\n");

  const blob = new Blob(
    [csv],
    {type:"text/csv"}
  );

  const url =
    URL.createObjectURL(blob);

  const a =
    document.createElement("a");

  a.href=url;

  a.download="Expense_Report.csv";

  a.click();

  URL.revokeObjectURL(url);

};




// =========================
// BUDGET
// =========================

window.openExpenseBudget = function(){

alert("💰 Expense Budget coming soon");

};



// =========================
// HISTORY
// =========================

window.openExpenseHistory = function(){

alert("🕒 Expense History coming soon");

};



// =========================
// ADVANCED
// =========================

window.openExpenseAdvanced = function(){

alert("⚙️ Advanced Expense Settings coming soon");

};







// =========================
// CUSTOM FILTER DATE
// =========================

window.toggleExpenseCustomDate = function(){

const filter =
document.getElementById("expenseReportFilter");


const custom =
document.getElementById("expenseCustomDate");


if(filter && custom){

if(filter.value==="custom"){

custom.style.display="block";

}else{

custom.style.display="none";

}

}

};

window.openExpenseFilters = function(){

document.getElementById(
"expenseFiltersSection"
).style.display = "block";

};

window.closeExpenseFilters = function(){

document.getElementById(
"expenseFiltersSection"
).style.display = "none";

};

window.toggleExpenseFilterCustom = function(){

const type =
document.getElementById("expenseFilterType").value;

document.getElementById(
"expenseFilterCustom"
).style.display =
type === "custom"
? "block"
: "none";

};

window.applyExpenseFilters = function(){


alert("Filters Applied");
loadExpenses();
closeExpenseFilters();


};

window.resetExpenseFilters = function(){

document.getElementById("expenseFilterType").value = "all";
document.getElementById("expenseFilterSort").value = "newest";
document.getElementById("expenseFilterSearch").value = "";
document.getElementById("expenseFilterStart").value = "";
document.getElementById("expenseFilterEnd").value = "";

toggleExpenseFilterCustom();

alert("Filters Reset");

};


window.updateNetworkStatus = function () {

  const status = document.getElementById("networkStatus");
  if (!status) return;

  if (navigator.onLine) {

    status.innerHTML = "🟢 Online";
    status.style.background = "transparent";
  } else {

    status.innerHTML = "🔴 Offline";
    status.style.background = "transparent";
  }

};


// FIRST CHECK
window.updateNetworkStatus();


// INTERNET CHANGE
window.addEventListener("online", () => {

  updateNetworkStatus();

  if (typeof showToast === "function") {
    showToast(
      "🟢 Online - Sync completed",
      "#4CAF50"
    );
  }

});


window.addEventListener("offline", () => {

  updateNetworkStatus();

  if (typeof showToast === "function") {
    showToast(
      "🔴 Offline Mode",
      "#f44336"
    );
  }

});



// SHOW SYNCING
window.showSyncing = function(){

  const status = document.getElementById("networkStatus");

  if(!status) return;

  status.innerHTML = "🔄 Syncing...";
  status.style.background = "#FF9800";

};


// SHOW ONLINE
window.showOnline = function(){

  const status = document.getElementById("networkStatus");

  if(!status) return;

  status.innerHTML = "🟢 Online";
  status.style.background = "#4CAF50";

};


// CHECK OFFLINE AT START
if(!navigator.onLine){

  if(typeof showToast === "function"){

    showToast(
      "📱 Saved offline. Will sync later.",
      "#FF9800"
    );

  }

}


// ===============================
// SETTINGS
// ===============================

window.settings =
function(){

alert(
"Settings"
);

};




// ===============================
// HELP
// ===============================

window.help =
function(){

alert(
"Help"
);

};







// ===============================
// EXTRA APP STATE
// ===============================

let visibleSuppliers = 5;
let currentSupplier = null;
let pressTimer = null;
let saleItems = [];
let totalPurchases = 0;
let totalProducts = 0;

let currentCustomer = null;
let customerSaleItems = [];
let payrollData = [];
let isFinishing = false;


// ===============================
// EXPORT
// ===============================

export { db, auth };