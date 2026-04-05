let generatedTimetable = {};

function generateAutoTimetable() {
    const daysCount = parseInt(document.getElementById("daysType").value);
    const periodsPerDay = parseInt(document.getElementById("periodsPerDay").value);

    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].slice(0, daysCount);
    generatedTimetable = {};

    // 🔥 Teacher busy tracker
    let teacherBusy = {};

    // 🔥 Group data class-section wise
    let grouped = {};
    waAllData.forEach(item => {
        const key = item.class + "-" + item.section;
        if (!grouped[key]) grouped[key] = [];
        for (let i = 0; i < item.periods; i++) {
            const subjectObj = waSubjects.find(s => s.name === item.subject);
            const teacherObj = waTeachers.find(t => t.name === item.teacher);

            grouped[key].push({
                subject: item.subject,
                teacher: item.teacher,

                subjectShort: subjectObj?.short || subjectObj?.shortName || item.subject,
                teacherShort: teacherObj?.short || teacherObj?.shortName || "",

                color: subjectObj?.color || "#fff"
            });
        }
    });

    // 🔥 Shuffle helper
    const shuffle = arr => arr.sort(() => Math.random() - 0.5);

    // ================= GENERATION =================
    Object.keys(grouped).forEach(key => {
        let pool = shuffle(grouped[key].slice());
        generatedTimetable[key] = [];

        days.forEach(day => {
            let row = [];
            let prevTeacher = null;

            for (let p = 0; p < periodsPerDay; p++) {
                let assigned = false;

                for (let i = 0; i < pool.length; i++) {
                    const item = pool[i];

                    if (!teacherBusy[item.teacher]) teacherBusy[item.teacher] = {};
                    if (!teacherBusy[item.teacher][day]) teacherBusy[item.teacher][day] = {};

                    // 🔹 Teacher not busy today & not same as previous period
                    if (!teacherBusy[item.teacher][day][p] && item.teacher !== prevTeacher) {
                        row.push({
                            subject: item.subject,
                            teacher: item.teacher,
                            subjectShort: item.subjectShort,
                            teacherShort: item.teacherShort,
                            color: item.color
                        });

                        teacherBusy[item.teacher][day][p] = true;
                        prevTeacher = item.teacher;

                        pool.splice(i, 1);
                        assigned = true;
                        break;
                    }
                }

                if (!assigned) {
                    row.push({
                        subject: "Free",
                        teacher: "",
                        subjectShort: "FREE",
                        teacherShort: "",
                        color: "#f8d7da"
                    });
                    prevTeacher = null;
                }

                // 🔹 Refill pool if empty
                if (pool.length === 0) {
                    pool = shuffle(grouped[key].slice());
                }
            }

            generatedTimetable[key].push({ day, periods: row });
        });
    });

    console.log("🔥 FINAL TIMETABLE:", generatedTimetable);
    displayTimetable(generatedTimetable);
    renderGeneratedTimetable();

    document.getElementById("editBtn").style.display = "inline-block";
    loadEditDropdowns();

}

// ================= Display without Break =================
function displayTimetable(data) {
    const container = document.getElementById("timetableContainer");
    container.innerHTML = "";

    Object.keys(data).forEach(key => {
        const firstRow = data[key][0];
        const totalPeriods = firstRow.periods.length;

        let html = `
            <div style="margin-bottom:40px;">
                <h2 style="text-align:center; margin-bottom:10px;">
                    Timetable - Class ${key}
                </h2>

                <table style="
                    width:100%;
                    border-collapse:collapse;
                    text-align:center;
                    font-size:14px;
                ">
                    <thead>
                        <tr style="background:#333; color:white;">
                            <th style="padding:10px; border:1px solid #ccc;">Day</th>
        `;

        for (let i = 1; i <= totalPeriods; i++) {
            html += `<th style="padding:10px; border:1px solid #ccc;">P${i}</th>`;
        }

        html += `</tr></thead><tbody>`;

        data[key].forEach(row => {
            html += `<tr><td style="padding:8px; border:1px solid #ccc; font-weight:bold;">
                        ${row.day}
                     </td>`;

            row.periods.forEach(p => {
                let bg = p.subject === "Free"
                    ? "background:#f8d7da;"
                    : `background:${p.color};`;
                html += `<td style="padding:8px; border:1px solid #ccc; ${bg}">
                            <div style="font-weight:bold">${p.subjectShort}</div>
                            <div style="font-size:11px">${p.teacherShort}</div>
                         </td>`;
            });

            html += `</tr>`;
        });

        html += `</tbody></table></div>`;
        container.innerHTML += html;
    });
}

// ================= Preview table without BREAK =================
function renderGeneratedTimetable() {
    let html = "";

    Object.keys(generatedTimetable).forEach(cls => {
        html += `<h3>Class ${cls}</h3><table border="1"><tr><th>Day</th>`;

        const periods = generatedTimetable[cls][0].periods.length;
        for (let i = 1; i <= periods; i++) html += `<th>P${i}</th>`;
        html += `</tr>`;

        generatedTimetable[cls].forEach(row => {
            html += `<tr><td>${row.day}</td>`;
            row.periods.forEach(p => html += `<td>${p.subject}</td>`);
            html += `</tr>`;
        });

        html += `</table><br>`;
    });

    document.getElementById("view").innerHTML = html;
}

// index.js or timetable.js (frontend)
window.saveTimetable = async () => {
    try {
        const res = await fetch("https://timetable-1j8i.onrender.com/api/final", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(generatedTimetable)
        });

        let data;
        try {
            data = await res.json();
        } catch {
            const text = await res.text();
            console.error(text);
            alert("Payload too large or server error");
            return;
        }

        if (res.ok) {
            alert("Saved ✅");
        } else {
            alert(data.error);
        }

    } catch (err) {
        console.error(err);
    }
};


// ================= EDIT GENERATED =================

document.getElementById("editBtn").onclick = () => {
    document.getElementById("editPanel").style.display = "block";
    loadEditDropdowns();
};

// load class section dropdown
function loadEditDropdowns() {

    const classSet = new Set();
    const sectionSet = new Set();

    Object.keys(generatedTimetable).forEach(key => {
        const [cls, sec] = key.split("-");
        classSet.add(cls);
        sectionSet.add(sec);
    });

    editClass.innerHTML = "";
    editSection.innerHTML = "";

    classSet.forEach(c => {
        editClass.innerHTML += `<option value="${c}">${c}</option>`;
    });

    sectionSet.forEach(s => {
        editSection.innerHTML += `<option value="${s}">${s}</option>`;
    });

}


// dropdown change load editable
editClass.onchange = loadEditableTable;
editSection.onchange = loadEditableTable;


function loadEditableTable() {

    const key = editClass.value + "-" + editSection.value;

    const data = generatedTimetable[key];

    if (!data) return;

    renderEditableTable(data);
document.getElementById("finalSaveBtn").onclick = async () => {

const cls = editClass.value;
const sec = editSection.value;

const key = `${cls}-${sec}`;

const table = document.getElementById("dragTable");

let updated = [];

for(let r=1; r<table.rows.length; r++){

let row = {
day: table.rows[r].cells[0].innerText,
periods:[]
};

for(let c=1; c<table.rows[r].cells.length; c++){

const cell = table.rows[r].cells[c];

const subjectShort = cell.children[0].innerText;
const teacherShort = cell.children[1].innerText;

// 🔥 find matching original object
const original = generatedTimetable[key][r-1].periods.find(p =>
p.subjectShort === subjectShort &&
p.teacherShort === teacherShort
) || generatedTimetable[key][r-1].periods[c-1];

row.periods.push({
subject: original.subject,
teacher: original.teacher,
subjectShort: subjectShort,
teacherShort: teacherShort,
color: original.color
});

}

updated.push(row);
}

// 🔥 update only edited class-section
generatedTimetable[key] = updated;

// refresh UI
displayTimetable(generatedTimetable);

// 🔥 NOW save edited data
await saveTimetable();

alert("Edited timetable saved ✅");

};
}


// ================= DRAG DROP TABLE =================

function renderEditableTable(data){

let html = `<h3>Editing : ${editClass.value}-${editSection.value}</h3>`;

html += `<table id="dragTable" border="1" style="width:100%;text-align:center">`;

html += "<tr><th>Day</th>";

const periods = data[0].periods.length;

for(let i=1;i<=periods;i++){
html += `<th>P${i}</th>`;
}

html += "</tr>";

data.forEach((row,r)=>{

html += `<tr><td>${row.day}</td>`;

row.periods.forEach((p,c)=>{

html += `
<td draggable="true"
ondragstart="dragStart(event)"
ondrop="dropCell(event)"
ondragover="allowDrop(event)"
style="cursor:move;background:${p.color}"
>
<div>${p.subjectShort}</div>
<div style="font-size:11px">${p.teacherShort}</div>
</td>
`;

});

html += "</tr>";

});

html += "</table>";

editTable.innerHTML = html;

// 🔥 FORCE SHOW BUTTON
document.getElementById("finalSaveBtn").style.display = "inline-block";

}



// ================= DRAG DROP LOGIC =================

let dragItem = null;

function dragStart(e) {
    dragItem = e.target.closest("td");
}

function allowDrop(e) {
    e.preventDefault();
}

function dropCell(e) {
    e.preventDefault();

    const target = e.target.closest("td");

    if (!dragItem || !target) return;

    const temp = dragItem.innerHTML;
    const tempBg = dragItem.style.background;

    dragItem.innerHTML = target.innerHTML;
    dragItem.style.background = target.style.background;

    target.innerHTML = temp;
    target.style.background = tempBg;

}



// ================= FINAL SAVE EDITED =================

document.getElementById("finalSaveBtn").onclick = async () => {

    const cls = editClass.value;
    const sec = editSection.value;

    const table = document.getElementById("dragTable");

    let newData = [];

    for (let r = 1; r < table.rows.length; r++) {

        let row = {
            day: table.rows[r].cells[0].innerText,
            periods: []
        };

        for (let c = 1; c < table.rows[r].cells.length; c++) {

            const cell = table.rows[r].cells[c];

            const subject = cell.children[0].innerText;
            const teacher = cell.children[1].innerText;

            row.periods.push({
                subjectShort: subject,
                teacherShort: teacher,
                color: cell.style.background
            });

        }

        newData.push(row);

    }

    generatedTimetable[`${cls}-${sec}`] = newData;

    await saveTimetable();

    alert("Final Saved ✅");

};