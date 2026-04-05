let teachersData = [];
let editTeacherId = null;

/* ===============================
   LOAD CLASSES + SUBJECTS
================================ */
async function populateClassesSubjects() {
    const classesDiv = document.getElementById("classesCheckboxes");
    const subjectsDiv = document.getElementById("subjectsCheckboxes");

    if (!classesDiv || !subjectsDiv) return;

    classesDiv.innerHTML = "";
    subjectsDiv.innerHTML = "";

    let classesData = [];
    let subjectsData = [];

    try {
        const res = await fetch("http://localhost:5000/api/classes");
        classesData = await res.json();
    } catch {}

    try {
        const res = await fetch("http://localhost:5000/api/subjects");
        subjectsData = await res.json();
    } catch {}

    // Classes
    classesDiv.innerHTML = `
        <label><input type="checkbox" id="selectAllClasses"> <b>Select All Classes</b></label>
    `;

    classesData.forEach(cls => {
        classesDiv.innerHTML += `
            <label><input type="checkbox" value="${cls.className}"> ${cls.className}</label>
        `;
    });

    // Subjects
    subjectsDiv.innerHTML = `
        <label><input type="checkbox" id="selectAllSubjects"> <b>Select All Subjects</b></label>
    `;

    subjectsData.forEach(sub => {
        subjectsDiv.innerHTML += `
            <label><input type="checkbox" value="${sub.name}"> ${sub.name}</label>
        `;
    });

    // Select all logic
    setTimeout(() => {
        document.getElementById("selectAllClasses").onclick = function () {
            document.querySelectorAll("#classesCheckboxes input[type=checkbox]:not(#selectAllClasses)")
                .forEach(c => c.checked = this.checked);
        };

        document.getElementById("selectAllSubjects").onclick = function () {
            document.querySelectorAll("#subjectsCheckboxes input[type=checkbox]:not(#selectAllSubjects)")
                .forEach(c => c.checked = this.checked);
        };
    }, 100);
}

/* ===============================
   ADD TEACHER
================================ */
async function addTeacher() {

    const name = document.getElementById("teacherName").value.trim();
    const shortName = document.getElementById("teacherShort").value.trim();
    const periods = parseInt(document.getElementById("teacherPeriods").value) || 0;

    const classes = Array.from(
        document.querySelectorAll("#classesCheckboxes input[type=checkbox]:checked:not(#selectAllClasses)")
    ).map(i => i.value);

    const subjects = Array.from(
        document.querySelectorAll("#subjectsCheckboxes input[type=checkbox]:checked:not(#selectAllSubjects)")
    ).map(i => i.value);

    if (!name || !shortName) {
        alert("Name & Short Name required");
        return;
    }

    const teacherData = { name, shortName, periods, classes, subjects };

    try {

        // 🔥 UPDATE MODE
        if (editTeacherId) {
            await fetch(`http://localhost:5000/api/teachers/${editTeacherId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(teacherData)
            });

            alert("Teacher updated!");
            editTeacherId = null;

        } else {
            // 🔥 ADD MODE
            await fetch("http://localhost:5000/api/teachers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(teacherData)
            });

            alert("Teacher added!");
        }

        clearMainForm();

    } catch (err) {
        console.error(err);
    }
}

/* ===============================
   CLEAR FORM
================================ */
function clearMainForm() {
    document.getElementById("teacherName").value = "";
    document.getElementById("teacherShort").value = "";
    document.getElementById("teacherPeriods").value = 0;

    document.querySelectorAll("#classesCheckboxes input, #subjectsCheckboxes input")
        .forEach(c => c.checked = false);
}

/* ===============================
   PAGE SWITCH (ONLY LOAD CHECKBOXES)
================================ */
function openPage(pageId) {

    document.querySelectorAll(".page").forEach(p => p.style.display = "none");

    document.getElementById(pageId).style.display = "block";

    if (pageId === "teachers") {
        populateClassesSubjects();
    }
}

document.addEventListener("DOMContentLoaded", () => {

    // agar teachers page already open ho
    if (document.getElementById("teachers").classList.contains("active")) {
        populateClassesSubjects();
    }

});