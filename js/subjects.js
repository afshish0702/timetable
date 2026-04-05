document.addEventListener("DOMContentLoaded", function () {

let subjectsData = [];
let editIndex = null;
let table = null;

/* ===============================
   PREDEFINED COLORS
================================ */
const colors = [
"#FFCDD2","#F8BBD0","#E1BEE7","#D1C4E9","#C5CAE9",
"#BBDEFB","#B3E5FC","#B2EBF2","#B2DFDB","#C8E6C9",
"#DCEDC8","#F0F4C3","#FFF9C4","#FFECB3","#FFE0B2",
"#FFCCBC","#D7CCC8","#CFD8DC","#F48FB1","#CE93D8",
"#9FA8DA","#90CAF9","#80DEEA","#80CBC4","#A5D6A7",
"#E6EE9C","#FFF59D","#FFE082","#FFCC80","#FFAB91"
];


/* ===============================
   ELEMENTS
================================ */

const formPaletteDiv = document.getElementById("formColorPalette");
const formCustomColor = document.getElementById("formCustomColor");

const modalPaletteDiv = document.getElementById("modalColorPalette");
const modalCustomColor = document.getElementById("modalCustomColor");


/* ===============================
   FORM COLOR PALETTE
================================ */

colors.forEach(c => {
const box = document.createElement("div");
box.style.width = "25px";
box.style.height = "25px";
box.style.background = c;
box.style.cursor = "pointer";
box.style.border = "2px solid #fff";

box.addEventListener("click", () => {
formCustomColor.value = c;
Array.from(formPaletteDiv.children)
.forEach(b => b.style.border = "2px solid #fff");
box.style.border = "2px solid #000";
});

formPaletteDiv.appendChild(box);
});

formCustomColor.addEventListener("change", () => {
Array.from(formPaletteDiv.children)
.forEach(b => b.style.border = "2px solid #fff");
});


/* ===============================
   MODAL COLOR PALETTE
================================ */

colors.forEach(c => {
const box = document.createElement("div");
box.style.width = "25px";
box.style.height = "25px";
box.style.background = c;
box.style.cursor = "pointer";
box.style.border = "2px solid #fff";

box.addEventListener("click", () => {
modalCustomColor.value = c;
Array.from(modalPaletteDiv.children)
.forEach(b => b.style.border = "2px solid #fff");
box.style.border = "2px solid #000";
});

modalPaletteDiv.appendChild(box);
});

modalCustomColor.addEventListener("change", () => {
Array.from(modalPaletteDiv.children)
.forEach(b => b.style.border = "2px solid #fff");
});


/* ===============================
   ADD SUBJECT
================================ */

window.addSubject = function(){

let name = document.getElementById("subjectName").value.trim();
let shortName = document.getElementById("subjectShort").value.trim();
let color = formCustomColor.value || "#ffffff";

if(!name || !shortName){
alert("Fill both fields!");
return;
}

subjectsData.push({ name, shortName, color });

renderSubjects();

document.getElementById("subjectName").value = "";
document.getElementById("subjectShort").value = "";
formCustomColor.value = "#ffffff";

};


/* ===============================
   RENDER TABLE
================================ */

function renderSubjects(){

if ($.fn.DataTable.isDataTable('#subjectsTable')) {
$('#subjectsTable').DataTable().destroy();
}

let tbody = "";

subjectsData.forEach((sub,i)=>{

tbody += `
<tr>
<td>${i+1}</td>
<td>${sub.name}</td>
<td>${sub.shortName}</td>
<td style="background:${sub.color}; width:40px;"></td>
<td>
<button onclick="openEditSubject(${i})">Edit</button>
<button onclick="deleteSubject(${i})">Delete</button>
</td>
</tr>
`;

});

document.querySelector("#subjectsTable tbody").innerHTML = tbody;

table = $('#subjectsTable').DataTable();

}


/* ===============================
   EDIT
================================ */

window.openEditSubject = function(index){

editIndex = index;

let sub = subjectsData[index];

document.getElementById("editSubjectName").value = sub.name;
document.getElementById("editSubjectShort").value = sub.shortName;
modalCustomColor.value = sub.color;

document.getElementById("subjectEditModal").style.display = "flex";

}


/* ===============================
   APPLY EDIT
================================ */

window.applySubjectEdit = function(){

let name = document.getElementById("editSubjectName").value.trim();
let shortName = document.getElementById("editSubjectShort").value.trim();
let color = modalCustomColor.value || "#ffffff";

if(!name || !shortName){
alert("Fill both fields!");
return;
}

subjectsData[editIndex] = { name, shortName, color };

renderSubjects();
closeSubjectModal();

}


/* ===============================
   CLOSE MODAL
================================ */

window.closeSubjectModal = function(){
document.getElementById("subjectEditModal").style.display="none";
}


/* ===============================
   DELETE
================================ */

window.deleteSubject = function(index){

if(confirm("Delete this subject?")){
subjectsData.splice(index,1);
renderSubjects();
}

}


/* ===============================
   SAVE
================================ */

window.saveSubjects = function(){

fetch("https://timetable-1j8i.onrender.comapi/subjects",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body: JSON.stringify(subjectsData)
})
.then(res=>res.json())
.then(()=>{
document.getElementById("saveModal").style.display="flex";
})
.catch(()=>{
alert("Server not running");
});

}


/* ===============================
   CLOSE SAVE
================================ */

window.closeSaveModal = function(){
document.getElementById("saveModal").style.display="none";
}


/* ===============================
   LOAD FROM DB
================================ */

async function loadSubjects(){

try{

let res = await fetch("https://timetable-1j8i.onrender.com/api/subjects");
let data = await res.json();

if(data && data.length){
subjectsData = data;
renderSubjects();
}

}catch(err){
console.log("No saved subjects");
}

}

loadSubjects();

});