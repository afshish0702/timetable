// ================= LOAD TIMETABLE =================
let filtersInitialized = false;
async function loadTimetable() {
    try {
        const res = await fetch("https://timetable-1j8i.onrender.com/api/timetable");
        const data = await res.json();

        const type = document.querySelector('input[name="viewType"]:checked').value;

        // ✅ sirf ek baar populate karo
        if (!filtersInitialized) {
            populateFilters(data);
            filtersInitialized = true;
        }

        if (type === "class") {
            renderClassWiseFiltered(data);
        } else {
            renderTeacherWiseSingleTable(data);
        }

    } catch (err) {
        console.error(err);
    }
}


// ================= CLASS WISE =================
function renderClassWise(data) {

    const container = document.getElementById("viewTimetableContainer");
    container.innerHTML = "";

    Object.keys(data)
        .sort((a, b) => {
            const [c1, s1] = a.split("-");
            const [c2, s2] = b.split("-");

            if (parseInt(c1) === parseInt(c2)) {
                return s1.localeCompare(s2); // A,B,C
            }
            return parseInt(c1) - parseInt(c2); // 1,2,3
        })
        .forEach(cls => {

            let html = `
            <div style="margin-bottom:40px;">
                <h2 style="text-align:center;">Class ${cls}</h2>

                <table style="width:100%; border-collapse:collapse; text-align:center;">
                    <thead>
                        <tr style="background:#333; color:#fff;">
                            <th style="padding:8px; border:1px solid #ccc;">Day</th>
        `;

            // 🔹 CHANGED: safe check for undefined before toLowerCase
            const totalPeriods = data[cls]?.[0]?.periods?.filter(p => p && p.subject && p.subject.toLowerCase() !== "break").length || 0;

            for (let i = 1; i <= totalPeriods; i++) {
                html += `<th style="padding:8px; border:1px solid #ccc;">P${i}</th>`;
            }

            html += `</tr></thead><tbody>`;

            data[cls].forEach(row => {

                html += `<tr><td style="border:1px solid #ccc; font-weight:bold;">${row.day}</td>`;

                row.periods.forEach(p => {
                    // 🔹 CHANGED: safe check for undefined
                    if (!p || !p.subject) return;
                    if (p.subject.toLowerCase() === "break") return; // skip Break if any

                    let subject = p.subjectShort || p.subject || "FREE";
                    let teacher = p.teacherShort || "";
                    let color = p.color || "#fff";

                    html += `
<td style="border:1px solid #ccc; background:${color}">
    <div style="font-weight:bold">${subject}</div>
    <div style="font-size:11px">${teacher}</div>
</td>`;
                });

                html += `</tr>`;
            });

            html += `</tbody></table></div>`;
            container.innerHTML += html;
        });
}
// ================= TEACHER WISE =================
// ================= TEACHER WISE GRID =================
function renderTeacherWise(data) {

    const container = document.getElementById("viewTimetableContainer");
    container.innerHTML = "";

    Object.keys(data).forEach(cls => {

        let html = `
            <div style="margin-bottom:40px;">
                <h2 style="text-align:center;">Class ${cls} (Teacher View)</h2>

                <table style="width:100%; border-collapse:collapse; text-align:center;">
                    <thead>
                        <tr style="background:#333; color:#fff;">
                            <th style="padding:8px; border:1px solid #ccc;">Day</th>
        `;

        // 🔹 CHANGED: safe check
        const totalPeriods = data[cls]?.[0]?.periods?.filter(p => p && p.subject && p.subject.toLowerCase() !== "break").length || 0;

        for (let i = 1; i <= totalPeriods; i++) {
            html += `<th style="padding:8px; border:1px solid #ccc;">P${i}</th>`;
        }

        html += `</tr></thead><tbody>`;

        data[cls].forEach(row => {

            html += `<tr><td style="border:1px solid #ccc; font-weight:bold;">${row.day}</td>`;

            row.periods.forEach(p => {
                // 🔹 CHANGED: safe check
                if (!p || !p.subject) return;
                if (p.subject.toLowerCase() === "break") return;

                let subject = p.subjectShort || p.subject || "FREE";
                let teacher = p.teacherShort || "";
                let color = p.color || "#fff";

                html += `
<td style="border:1px solid #ccc; background:${color}">
    <div style="font-weight:bold">${subject}</div>
    <div style="font-size:11px">${teacher}</div>
</td>`;;
            });

            html += `</tr>`;
        });

        html += `</tbody></table></div>`;
        container.innerHTML += html;
    });
}
// ================= PRINT =================
function printTimetable() {

    const content = document.getElementById("viewTimetableContainer").innerHTML;

    if (!content) {
        alert("Nothing to print ❌");
        return;
    }

    const win = window.open("", "", "width=900,height=700");

    win.document.write(`
        <html>
        <head>
            <title>Print Timetable</title>
        </head>
        <body>
            <h2 style="text-align:center;">School Timetable</h2>
            ${content}
        </body>
        </html>
    `);

    win.document.close();
    win.print();
}


// ================= EXPORT PDF =================
function exportPDF() {
    printTimetable(); // browser → Save as PDF
}

function toggleFilters() {

    const type = document.querySelector('input[name="viewType"]:checked').value;

    const classSelect = document.getElementById("classSelect");
    const sectionSelect = document.getElementById("sectionSelect");
    const teacherSelect = document.getElementById("teacherSelect");

    if (type === "class") {
        classSelect.style.display = "inline-block";
        sectionSelect.style.display = "inline-block";
        teacherSelect.style.display = "none";
    } else {
        classSelect.style.display = "none";
        sectionSelect.style.display = "none";
        teacherSelect.style.display = "inline-block";
    }

    loadTimetable(); // 🔥 reload after switch
}

function populateFilters(data) {

    const classSet = new Set();
    const sectionSet = new Set();
    const teacherSet = new Set();

    Object.keys(data).forEach(key => {
        const [cls, sec] = key.split("-");
        classSet.add(cls);
        sectionSet.add(sec);

        data[key].forEach(row => {
            row.periods.forEach(p => {
                if (p.teacher) teacherSet.add(p.teacher);
            });
        });
    });

    // Fill Class
    const classSelect = document.getElementById("classSelect");
    classSelect.innerHTML = '<option value="">Select Class</option>';
    [...classSet]
        .sort((a, b) => parseInt(a) - parseInt(b))
        .forEach(c => {
            classSelect.innerHTML += `<option value="${c}">${c}</option>`;
        });

    // Fill Section
    const sectionSelect = document.getElementById("sectionSelect");
    sectionSelect.innerHTML = '<option value="">Select Section</option>';
    sectionSet.forEach(s => {
        sectionSelect.innerHTML += `<option value="${s}">${s}</option>`;
    });

    // Fill Teacher
    const teacherSelect = document.getElementById("teacherSelect");
    teacherSelect.innerHTML = '<option value="">Select Teacher</option>';
    teacherSet.forEach(t => {
        teacherSelect.innerHTML += `<option value="${t}">${t}</option>`;
    });
}

function renderClassWiseFiltered(data) {

    const cls = document.getElementById("classSelect").value;
    const sec = document.getElementById("sectionSelect").value;

    let filtered = {};

    Object.keys(data)
    .sort((a, b) => {
        const [c1, s1] = a.split("-");
        const [c2, s2] = b.split("-");

        if (parseInt(c1) === parseInt(c2)) {
            return s1.localeCompare(s2);
        }
        return parseInt(c1) - parseInt(c2);
    })
    .forEach(key => {

        const [c, s] = key.split("-");

        if ((!cls || cls === c) && (!sec || sec === s)) {
            filtered[key] = data[key];
        }

    });

    renderClassWise(filtered);
}

function renderTeacherWiseSingleTable(data) {

const teacher = document.getElementById("teacherSelect").value;

const container = document.getElementById("viewTimetableContainer");
container.innerHTML = "";

if (!teacher) return;

const days = ["Mon","Tue","Wed","Thu","Fri","Sat"];

let periodsCount = 0;

// find max periods
Object.values(data).forEach(cls=>{
periodsCount = Math.max(periodsCount, cls[0].periods.length);
});

let table = {};

days.forEach(d=>{
table[d] = new Array(periodsCount).fill("FREE");
});

// loop all classes
Object.keys(data).forEach(key => {

data[key].forEach((row, r) => {

row.periods.forEach((p, c) => {

if (p.teacher === teacher) {
table[row.day][c] = key; // class-section
}

});

});

});


// render
let html = `
<h3 style="text-align:center">${teacher} - Teacher Timetable</h3>
<table border="1" style="width:100%;text-align:center">
<tr>
<th>Day</th>
`;

for(let i=1;i<=periodsCount;i++){
html += `<th>P${i}</th>`;
}

html += "</tr>";

days.forEach(day=>{

html += `<tr><td>${day}</td>`;

table[day].forEach(p=>{
html += `<td>${p}</td>`;
});

html += "</tr>";

});

html += "</table>";

container.innerHTML = html;

}
window.onload = function () {
    toggleFilters(); // 🔥 FIRST CALL (important)
};