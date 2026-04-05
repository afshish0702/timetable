function toggleMenu(el){

let submenu = el.nextElementSibling;

document.querySelectorAll(".submenu").forEach(menu=>{
if(menu!==submenu) menu.style.display="none";
});

document.querySelectorAll(".menu-title").forEach(t=>{
if(t!==el) t.classList.remove("active-parent");
});

if(submenu.style.display==="block"){
submenu.style.display="none";
el.classList.remove("active-parent");
}else{
submenu.style.display="block";
el.classList.add("active-parent");
}

}



function showPage(pageId, el) {

    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    document.getElementById(pageId).classList.add("active");

    document.querySelectorAll(".menu-item, .submenu button")
        .forEach(btn => btn.classList.remove("active"));

    if (el) el.classList.add("active");

    // 🔥 LOAD VIEW TEACHERS ONLY HERE
    if (pageId === "viewTeachers") {
        setTimeout(() => {
            loadViewTeachers();
        }, 300);
    }
    if (pageId === "teachers") {
    setTimeout(() => {
        populateClassesSubjects();
    }, 200);
}
if (pageId === "teachers") {
    setTimeout(async () => {
        await populateClassesSubjects();
        loadTeacherForEdit();
    }, 300);
}
}