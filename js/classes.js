let classesData = [];
let editIndex = null;

/* =============================
   GENERATE CLASSES
============================= */
function generateClasses(){

let count = document.getElementById("classCount").value;
let type = document.querySelector("input[name='sectionType']:checked").value;

classesData = [];

for(let i=1;i<=count;i++){

classesData.push({
className:"Class "+i,
sections: generateSections(2,type)
});

}

renderClasses();
}


/* =============================
   GENERATE SECTIONS
============================= */
function generateSections(count,type){

let arr=[];

for(let i=0;i<count;i++){

if(type==="alpha"){
arr.push(String.fromCharCode(65+i));
}else{
arr.push("A"+(i+1));
}

}

return arr;
}


/* =============================
   RENDER CLASSES
============================= */
function renderClasses(){

let html="";

classesData.forEach((cls,i)=>{

html+=`
<div class="class-box">

<div>
<b>${cls.className}</b>
<br>
${cls.sections.join(" , ")}
</div>

<button onclick="openEdit(${i})">
Edit
</button>

</div>
`;

});

document.getElementById("classList").innerHTML=html;

}


/* =============================
   EDIT MODAL
============================= */
function openEdit(index){

editIndex=index;

document.getElementById("editModal").style.display="flex";

document.getElementById("sectionCount").value =
classesData[index].sections.length;

}

function closeModal(){
document.getElementById("editModal").style.display="none";
}


/* =============================
   APPLY EDIT
============================= */
function applyEdit(){

let count=document.getElementById("sectionCount").value;
let type=document.getElementById("sectionFormat").value;

classesData[editIndex].sections =
generateSections(count,type);

renderClasses();
closeModal();

}


/* =============================
   SAVE MODAL
============================= */
function openSaveModal() {
document.getElementById("saveModal").style.display = "flex";
}

function closeSaveModal() {
document.getElementById("saveModal").style.display = "none";
}


/* =============================
   SAVE TO MONGODB SERVER
============================= */
function saveClasses(){

fetch("http://localhost:5000/api/classes",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body: JSON.stringify(classesData)
})
.then(res=>res.json())
.then(data=>{
openSaveModal();
})
.catch(()=>{
alert("Server not running!");
});

}


/* =============================
   LOAD FROM DATABASE
============================= */
async function loadClasses(){

try{

let res = await fetch("http://localhost:5000/api/classes");
let data = await res.json();

if(data && data.length){
classesData = data;
renderClasses();
}

}catch(err){
console.log("No saved classes");
}

}


/* =============================
   AUTO LOAD
============================= */
window.addEventListener("DOMContentLoaded", loadClasses);