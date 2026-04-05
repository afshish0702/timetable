document.addEventListener("DOMContentLoaded", () => {
    openManualPage();
});

// ================= GLOBAL STATE =================

let manualData = {};
let teacherLoad = {};
let workAllotData = [];
window.classesData = classesData;

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
let periodsPerDay = 9;


// ================= AUTO LOAD =================

window.onload = function () {
    openManualPage();
};


// ================= PAGE LOAD =================

function openManualPage() {
    loadManualData();
}


// ================= LOAD DATA =================

async function loadManualData() {

    // work allot
    const res1 = await fetch("https://timetable-1j8i.onrender.com/api/workallot");
    workAllotData = await res1.json();

    // classes
    const res2 = await fetch("https://timetable-1j8i.onrender.com/api/classes");
    classesData = await res2.json();

    // teachers
    const res3 = await fetch("https://timetable-1j8i.onrender.com/api/teachers");
    teachersData = await res3.json();

    populateManualDropdowns();
    generateManualGrid();
}

// ================= CLASS DROPDOWN =================

function populateManualDropdowns() {

    const classSelect = document.getElementById("mClass");

    classSelect.innerHTML = `<option value="">Class</option>`;

    classesData.forEach(c => {

        classSelect.innerHTML += `
        <option value="${c.className}">
        ${c.className}
        </option>`;
    });
}


// ================= SECTION FILTER =================

function updateSections() {

    const cls = mClass.value;

    const sectionSelect = document.getElementById("mSection");
    sectionSelect.innerHTML = `<option value="">Section</option>`;

    const selectedClass = classesData.find(c =>
        c.className === cls
    );

    if (!selectedClass) {
        return;
    }

    selectedClass.sections.forEach(sec => {

        sectionSelect.innerHTML += `
        <option value="${sec}">
        ${sec}
        </option>`;

    });

    resetTeacherSubject();
    updateManualHeading();
}


// ================= TEACHER FILTER =================

function updateManualFilters() {

    const teacherSelect = document.getElementById("mTeacher");

    teacherSelect.innerHTML = `<option value="">Teacher</option>`;

    teachersData.forEach(t => {

        const name = t.teacher || t.name;

        teacherSelect.innerHTML += `
        <option value="${name}">
        ${name}
        </option>`;

    });

    resetSubject();
}
// ================= SUBJECT FILTER =================

function updateSubjects() {

    const cls = mClass.value;
    const sec = mSection.value;
    const teacher = mTeacher.value;

    const subjectSelect = document.getElementById("mSubject");
    subjectSelect.innerHTML = `<option value="">Subject</option>`;

    let allotSubjects = [];

    // check allot first
    workAllotData.forEach(t => {

        if (t.teacher != teacher) return;

        t.allotment.forEach(a => {

            if (a.class == cls && a.section == sec) {
                allotSubjects.push(a.subject);
            }

        });

    });

    // CASE 1: allot found → only allot subjects
    if (allotSubjects.length > 0) {

        [...new Set(allotSubjects)].forEach(s => {
            subjectSelect.innerHTML += `<option value="${s}">${s}</option>`;
        });

        return;
    }

    // CASE 2: no allot → show teacher subjects
    const teacherObj = teachersData.find(t => t.name == teacher);

    if (teacherObj && teacherObj.subjects) {

        teacherObj.subjects.forEach(s => {
            subjectSelect.innerHTML += `<option value="${s}">${s}</option>`;
        });

    }
}

// ================= GRID =================

function generateManualGrid() {

    let html = `<table class="manualTable">
    <thead>
    <tr>
    <th>Day</th>`;

    for (let i = 1; i <= periodsPerDay; i++) {
        html += `<th>P${i}</th>`;
    }

    html += `</tr></thead><tbody>`;

    days.forEach(day => {

        html += `<tr><td>${day}</td>`;

        for (let p = 1; p <= periodsPerDay; p++) {

            html += `
            <td onclick="assignCell('${day}',${p})"
            id="${day}-${p}"></td>`;
        }

        html += `</tr>`;
    });

    html += `</tbody></table>`;

    document.getElementById("manualGrid").innerHTML = html;
}



// ================= ASSIGN =================

function assignCell(day, period) {

    const cls = mClass.value;
    const sec = mSection.value;
    const teacher = mTeacher.value;
    const subject = mSubject.value;

    if (!cls || !sec || !teacher || !subject) {
        alert("Select all first");
        return;
    }

    const key = `${cls}-${sec}`;

    if (!manualData[key]) manualData[key] = {};
    if (!manualData[key][day]) manualData[key][day] = {};

    // already assigned
    if (manualData[key][day][period]) {
        alert("Already assigned");
        return;
    }

    // teacher clash
    for (let k in manualData) {
        if (manualData[k][day]?.[period]?.teacher === teacher) {
            alert("Teacher busy");
            return;
        }
    }


    // ================= SUBJECT ALLOT LIMIT =================

    let subjectMax = null;

    workAllotData.forEach(t => {

        if (t.teacher != teacher) return;

        t.allotment.forEach(a => {

            if (
                a.class == cls &&
                a.section == sec &&
                a.subject == subject
            ) {
                subjectMax = a.periods;
            }

        });

    });


    // count subject usage
    let subjectCount = 0;

    for (let k in manualData) {
        for (let d in manualData[k]) {
            for (let p in manualData[k][d]) {

                const cell = manualData[k][d][p];

                if (
                    cell.teacher == teacher &&
                    cell.subject == subject
                ) {
                    subjectCount++;
                }

            }
        }
    }

    if (subjectMax !== null && subjectCount >= subjectMax) {
        alert("Subject load exceeded");
        return;
    }


    // ================= TEACHER TOTAL LIMIT =================

    const teacherObj = teachersData.find(t => t.name == teacher);
    const teacherTotalMax = teacherObj ? teacherObj.periods : null;

    if (!teacherLoad[teacher]) teacherLoad[teacher] = 0;

    if (teacherTotalMax !== null && teacherLoad[teacher] >= teacherTotalMax) {
        alert("Teacher total load exceeded");
        return;
    }


    // ================= SAVE =================

    teacherLoad[teacher]++;

    manualData[key][day][period] = {
        teacher,
        subject
    };


    const tShort = teacher.substring(0,2).toUpperCase();
    const sShort = subject.substring(0,3).toUpperCase();

    document.getElementById(`${day}-${period}`).innerHTML = `
    <div>${sShort}</div>
    <div>${tShort}</div>
    `;
}


// ================= RESET =================

function resetTeacherSubject(){
mTeacher.innerHTML=`<option value="">Teacher</option>`;
resetSubject();
}

function resetSubject(){
mSubject.innerHTML=`<option value="">Subject</option>`;
}

function resetManualGrid(){
manualData={}
teacherLoad={}
generateManualGrid()
}

function updateManualHeading(){

    const cls = document.getElementById("mClass").value;
    const sec = document.getElementById("mSection").value;

    const heading = document.getElementById("manualHeading");

    if(!cls || !sec){
        heading.innerText = "Manual Timetable";
        return;
    }

    heading.innerText = `Manual Timetable - ${cls} (${sec})`;
}

function printManual(){

    const cls = mClass.value;
    const sec = mSection.value;

    const printWindow = window.open('', '', 'width=900,height=700');

    printWindow.document.write(`
    <html>
    <head>
    <title>Timetable</title>
    <style>
    table{border-collapse:collapse;width:100%}
    td,th{border:1px solid black;padding:8px;text-align:center}
    h2{text-align:center}
    </style>
    </head>
    <body>

    <h2>${cls} - ${sec} Timetable</h2>

    ${document.getElementById("manualGrid").innerHTML}

    </body>
    </html>
    `);

    printWindow.document.close();
    printWindow.print();
}

function exportManual(){

    const cls = mClass.value;
    const sec = mSection.value;

    const element = document.createElement("div");

    element.innerHTML = `
    <h2 style="text-align:center">${cls} - ${sec} Timetable</h2>
    ${manualGrid.innerHTML}
    `;

    html2pdf().from(element).save(`${cls}-${sec}-timetable.pdf`);
}

async function finalSaveManual(){

    const cls = mClass.value;
    const sec = mSection.value;

    if(!cls || !sec){
        alert("Select class & section");
        return;
    }

    const key = `${cls}-${sec}`;

    const payload = {
        name: `manualTimeTable${cls}-${sec}`,
        type: "manual",
        class: cls,
        section: sec,
        timetable: manualData[key]
    };

    await fetch("http://localhost:5000/api/workallot/manual-save", {
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body: JSON.stringify(payload)
    });

    alert("Manual timetable saved");

}

