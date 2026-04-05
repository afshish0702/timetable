let waTeachers = [];
let waClasses = [];
let waSubjects = [];
let waEditingIndex = null;
let waTeacher = null;
let waData = [];
let waAllData = [];     // DB saved data (Summary ke liye)


// ================= LOAD DATA ON PAGE LOAD =================
// ---------------- LOAD DATA ----------------
async function loadAllotedData() {
    try {

        const res = await fetch("https://timetable-1j8i.onrender.com/api/workallot");
        const allData = await res.json();

        waAllData = [];              // 🔥 DB data
        teacherSummaryData = [];

        allData.forEach((item, index) => {

            let assigned = 0;

            item.allotment.forEach(a => {

                assigned += a.periods;

                waAllData.push({
                    teacher: item.teacher,
                    class: a.class,
                    section: a.section,
                    subject: a.subject,
                    periods: a.periods
                });

            });

            teacherSummaryData.push({
                sr: index + 1,
                name: item.teacher,
                short: item.short,
                total: item.total,
                assigned: assigned,
                remaining: item.total - assigned
            });

        });

        renderTeacherSummaryTable();

    } catch (err) {
        console.error("Failed to load data:", err);
    }
}

// ---------------- SAVE WORK ----------------
async function saveWorkAllotment() {

    if (!waTeacher) {
        showModal("Select teacher")
        return
    }

    // ✅ Save to backend
    await fetch("https://timetable-1j8i.onrender.com/api/workallot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            teacher: waTeacher.name,
            short: waTeacher.shortName,
            total: waTeacher.periods,
            allotment: waData.filter(d => d.teacher === waTeacher.name)
        })
    })

    showModal("Saved successfully")

    // ✅ Reload summary data (3rd table)
    await loadAllotedData()


    // ================== 🔥 MAIN FIX ==================
    // 👉 Sirf current working table reset karo (NOT DB data)

    waTeacher = null
    waEditingIndex = null

    // 👉 IMPORTANT: sirf current temporary rows hatao
    waData = []   // 🔥 yahi missing tha properly use

    // ================== UI RESET ==================

    document.getElementById("waTeacherInput").value = ""
    document.getElementById("waShort").value = ""
    document.getElementById("waTotal").value = ""
    document.getElementById("waRemaining").value = ""
    document.getElementById("waPeriods").value = ""

    // 👉 Add rows table reset
    renderTable()

    // 👉 counts reset
    updateCounts()

    document.getElementById("waAssigned").innerText = "0"

}
// call on page load
window.addEventListener("DOMContentLoaded", loadAllotedData);

// Call on page load
window.addEventListener("DOMContentLoaded", loadAllotedData)

/* ================= INIT ================= */

window.addEventListener("DOMContentLoaded", async () => {

    await loadTeachers()
    await loadClasses()
    await loadSubjects()

    document
        .getElementById("waTeacherInput")
        .addEventListener("input", teacherSearch)

    document
        .getElementById("waClass")
        .addEventListener("change", updateSections)

})



/* ================= LOAD TEACHERS ================= */

async function loadTeachers() {

    const res =
        await fetch("https://timetable-1j8i.onrender.com/api/teachers")

    waTeachers = await res.json()

}



/* ================= LIVE SEARCH ================= */

function teacherSearch() {

    const val =
        document.getElementById("waTeacherInput")
            .value.toLowerCase()

    const box =
        document.getElementById("teacherDropdown")

    box.innerHTML = ""

    if (val === "") {
        box.style.display = "none"
        return
    }

    const filtered =
        waTeachers.filter(t =>
            t.name.toLowerCase().includes(val))

    filtered.forEach(t => {

        const div =
            document.createElement("div")

        div.innerText = t.name

        div.onclick = () => selectTeacher(t)

        box.appendChild(div)

    })

    box.style.display = "block"

}



/* ================= SELECT ================= */

function selectTeacher(t) {

    waTeacher = t
    waData = []

    document.getElementById("waTeacherInput").value = t.name
    document.getElementById("teacherDropdown").style.display = "none"

    document.getElementById("waShort").value = t.shortName
    document.getElementById("waTotal").value = t.periods

    // classes fill (number only)
    const cls = document.getElementById("waClass")
    cls.innerHTML = ""

    t.classes
        .filter(c => c !== "on")
        .forEach(c => {
            cls.innerHTML += `<option value="${c}">${c.replace("Class ", "")}</option>`
        })

    // 🔥 IMPORTANT DELAY
    setTimeout(updateSections, 0)

    // subjects
    const sub = document.getElementById("waSubject")
    sub.innerHTML = ""

    t.subjects.forEach(s => {
        sub.innerHTML += `<option value="${s}">${s}</option>`
    })

    updateCounts()
    renderTable()
}


/* ================= CLASSES ================= */

async function loadClasses() {
    try {
        const res = await fetch("https://timetable-1j8i.onrender.com/api/classes")
        waClasses = await res.json()

        const clsDropdown = document.getElementById("waClass")
        clsDropdown.innerHTML = '<option value="">Select Class</option>'

        waClasses.forEach(c => {
            clsDropdown.innerHTML += `
                <option value="${c.className}">
                    ${c.className.replace("Class ", "")}
                </option>
            `
        })

        updateSections() // initially populate sections if first class selected
    } catch (err) {
        console.error("Error loading classes:", err)
    }
}


/* ================= SUBJECTS ================= */

async function loadSubjects() {

    const res =
        await fetch("https://timetable-1j8i.onrender.com/api/subjects")

    waSubjects = await res.json()

    const sub =
        document.getElementById("waSubject")

    sub.innerHTML = ""

    waSubjects.forEach(s => {

        sub.innerHTML += `
        <option value="${s.name}">
        ${s.name}
        </option>
        `

    })

}



/* ================= SECTION ================= */

function updateSections() {
    const classDropdown = document.getElementById("waClass")
    const sectionDropdown = document.getElementById("waSection")
    sectionDropdown.innerHTML = '<option value="">Select Section</option>'

    const selectedClassName = classDropdown.value
    if (!selectedClassName) return

    const selectedClass = waClasses.find(c => c.className === selectedClassName)
    if (!selectedClass) return

    selectedClass.sections.forEach(section => {
        const option = document.createElement("option")
        option.value = section
        option.text = section
        sectionDropdown.appendChild(option)
    })
}

// Event listener for class change
document.getElementById("waClass").addEventListener("change", updateSections)

// Call loadClasses on page load
window.addEventListener("DOMContentLoaded", loadClasses)

/* ================= ADD ================= */

function addAllotment() {

    if (!waTeacher) {
        showModal("Select teacher first")
        return
    }

    const cls = document.getElementById("waClass").value.replace("Class ", "")
    const sec = document.getElementById("waSection").value
    const sub = document.getElementById("waSubject").value
    const per = parseInt(document.getElementById("waPeriods").value)

    if (!per) {
        showModal("Enter periods")
        return
    }

    // Duplicate check (ignore the row being edited)
    const duplicateIndex = waData.findIndex((x, idx) =>
        x.class === cls && x.section === sec && x.subject === sub &&
        idx !== waEditingIndex
    )

    if (duplicateIndex !== -1) {
        showModal(`Duplicate entry at row ${duplicateIndex + 1}`)
        return
    }

    // Total periods check (subtract current row periods if editing)
    const totalAssigned = getAssigned() - (waEditingIndex !== null ? waData[waEditingIndex].periods : 0)
    if (totalAssigned + per > waTeacher.periods) {
        showModal("Total periods exceeded")
        return
    }

    const newRow = { class: cls, section: sec, subject: sub, periods: per }

    if (waEditingIndex !== null) {
        // Update the existing row
        waData[waEditingIndex] = newRow
        waEditingIndex = null
    } else {
        // Add new row
        waData.push(newRow)
    }

    // Clear input
    document.getElementById("waPeriods").value = ""

    renderTable()
    updateCounts()
}



/* ================= TABLE ================= */

function renderTable() {

    let html = "";

    // 🔥 sirf current working data (waData)
    waData.forEach((r, i) => {

        html += `
        <tr>
            <td>${r.class}</td>
            <td>${r.section}</td>
            <td>${r.subject}</td>
            <td>${r.periods}</td>
            <td>
                <button onclick="editRow(${i})">Edit</button>
                <button onclick="deleteRow(${i})">Delete</button>
            </td>
        </tr>`;
    });

    document.querySelector("#waTable tbody").innerHTML = html;
}



/* ================= DELETE ================= */

function deleteRow(i) {

    waData.splice(i, 1)

    renderTable()
    updateCounts()

}



/* ================= EDIT ================= */

function editRow(i) {

    const r = waData[i];

    // set class properly
    document.getElementById("waClass").value = "Class " + r.class
    updateSections()

    updateSections();

    setTimeout(() => {
        document.getElementById("waSection").value = r.section;
    }, 50);

    document.getElementById("waSubject").value = r.subject;
    document.getElementById("waPeriods").value = r.periods;

    waEditingIndex = i;
}
/* ================= COUNT ================= */

function getAssigned() {

    return waData.reduce((a, b) => a + b.periods, 0)

}

function updateCounts() {

    const assigned = getAssigned()

    const remaining =
        waTeacher ? waTeacher.periods - assigned : 0

    document.getElementById("waAssigned").innerText =
        assigned

    document.getElementById("waRemaining").value =
        remaining

}



/* ================= SAVE ================= */

async function saveWorkAllotment() {

    if (!waTeacher) {
        showModal("Select teacher");
        return;
    }

    await fetch("https://timetable-1j8i.onrender.com/api/workallot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            teacher: waTeacher.name,
            short: waTeacher.shortName,
            total: waTeacher.periods,
            allotment: waData
        })
    });

    showModal("Saved successfully");

    // 🔥 Reload summary data only
    await loadAllotedData();

    // ================= RESET FORM =================
    waTeacher = null;
    waEditingIndex = null;
    waData = [];   // 🔥 IMPORTANT (table clear)

    document.getElementById("waTeacherInput").value = "";
    document.getElementById("waShort").value = "";
    document.getElementById("waTotal").value = "";
    document.getElementById("waRemaining").value = "";
    document.getElementById("waPeriods").value = "";

    renderTable();      // 🔥 empty table
    updateCounts();
}


/* ================= MODAL ================= */

function showModal(msg) {

    document.getElementById("waModalText").innerText = msg
    document.getElementById("waModal").style.display = "flex"

}

function closeWAModal() {
    document.getElementById("waModal").style.display = "none"
}


// ================= GLOBAL =================
let teacherSummaryData = []; // store all teachers' allotment data

// ================= INIT =================
window.addEventListener("DOMContentLoaded", () => {
    document.getElementById("tsSearch").addEventListener("input", tsLiveSearch)
})

// ================= ADD ALLOTMENT =================
function addAllotment() {
    if (!waTeacher) {
        showModal("Select teacher first")
        return
    }

    const cls = document.getElementById("waClass").value.replace("Class ", "")
    const sec = document.getElementById("waSection").value
    const sub = document.getElementById("waSubject").value
    const per = parseInt(document.getElementById("waPeriods").value)

    if (!per) {
        showModal("Enter periods")
        return
    }

    // Duplicate check (ignore the row being edited)
    const exists = waData.find((x, idx) =>
        x.class === cls && x.section === sec && x.subject === sub &&
        idx !== waEditingIndex
    )

    if (exists) {
        showModal("Duplicate entry not allowed")
        return
    }

    // Total periods check (subtract current row periods if editing)
    const totalAssigned = getAssigned() - (waEditingIndex !== null ? waData[waEditingIndex].periods : 0)
    if (totalAssigned + per > waTeacher.periods) {
        showModal("Total periods exceeded")
        return
    }

    const newRow = { class: cls, section: sec, subject: sub, periods: per, teacher: waTeacher.name }

    if (waEditingIndex !== null) {
        // Update existing row
        waData[waEditingIndex] = newRow
        waEditingIndex = null
    } else {
        // Add new row
        waData.push(newRow)
    }

    // Clear input
    document.getElementById("waPeriods").value = ""

    renderTable()
    updateCounts()
    updateTeacherSummary()
}

// ================= RENDER WORK ALLOTMENT TABLE =================
function renderTable() {
    let html = ""
    waData.forEach((r, i) => {
        html += `
        <tr>
            <td>${r.class}</td>
            <td>${r.section}</td>
            <td>${r.subject}</td>
            <td>${r.periods}</td>
            <td>
                <button onclick="editRow(${i})">Edit</button>
                <button onclick="deleteRow(${i})">Delete</button>
            </td>
        </tr>
        `
    })
    document.querySelector("#waTable tbody").innerHTML = html
}

// ================= DELETE WORK ALLOTMENT ROW =================
function deleteRow(i) {
    waData.splice(i, 1)
    renderTable()
    updateCounts()
    updateTeacherSummary()
}

// ================= EDIT WORK ALLOTMENT ROW =================
function editRow(i) {
    const r = waData[i]
    document.getElementById("waClass").value = "Class " + r.class
    updateSections()
    document.getElementById("waSection").value = r.section
    document.getElementById("waSubject").value = r.subject
    document.getElementById("waPeriods").value = r.periods

    waEditingIndex = i
}

// ================= COUNT =================
function getAssigned() {
    return waData
        .filter(d => d.teacher === (waTeacher ? waTeacher.name : ""))
        .reduce((a, b) => a + b.periods, 0)
}

function updateCounts() {
    const assigned = getAssigned()
    const remaining = waTeacher ? waTeacher.periods - assigned : 0
    document.getElementById("waAssigned").innerText = assigned
    document.getElementById("waRemaining").value = remaining
}

// ================= SAVE =================
async function saveWorkAllotment() {
    if (!waTeacher) {
        showModal("Select teacher")
        return
    }

    await fetch("https://timetable-1j8i.onrender.com/api/workallot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            teacher: waTeacher.name,
            short: waTeacher.shortName,
            total: waTeacher.periods,
            allotment: waData.filter(d => d.teacher === waTeacher.name)
        })
    })

    showModal("Saved successfully")
    updateTeacherSummary()
}

// ================= MODAL =================
function showModal(msg) {
    document.getElementById("waModalText").innerText = msg
    document.getElementById("waModal").style.display = "flex"
}

function closeWAModal() {
    document.getElementById("waModal").style.display = "none"
}

// ================= TEACHER SUMMARY TABLE =================
function updateTeacherSummary() {

    const allottedTeachers = waTeachers.filter(t =>
        waData.some(d => d.teacher === t.name)
    )

    teacherSummaryData = allottedTeachers.map((t, i) => {

        const assigned = waData
            .filter(d => d.teacher === t.name)
            .reduce((a, b) => a + b.periods, 0)

        return {
            sr: i + 1,
            name: t.name,
            short: t.shortName,
            total: t.periods,
            assigned: assigned,
            remaining: t.periods - assigned
        }
    })

    renderTeacherSummaryTable()
}
function updateTeacherSummary() {
    const allottedTeachers = waTeachers.filter(t =>
        waData.some(d => d.teacher === t.name)
    )

    teacherSummaryData = allottedTeachers.map((t, i) => {
        const assigned = waData
            .filter(d => d.teacher === t.name)
            .reduce((a, b) => a + b.periods, 0)
        return {
            sr: i + 1,
            name: t.name,
            short: t.shortName,
            total: t.periods,
            assigned: assigned,
            remaining: t.periods - assigned
        }
    })

    renderTeacherSummaryTable()
}

// ================= LIVE SEARCH =================
function tsLiveSearch() {

    const val =
        document.getElementById("tsSearch")
            .value.toLowerCase()

    const tbody =
        document.querySelector("#tsTable tbody")

    Array.from(tbody.rows).forEach(row => {

        const name =
            row.cells[1].innerText.toLowerCase()

        row.style.display =
            name.includes(val) ? "" : "none"

    })

}

// ================= SUMMARY EDIT =================
function tsEdit(name) {

    const teacher = waTeachers.find(t => t.name === name);
    if (!teacher) return;

    waTeacher = teacher;

    document.getElementById("waTeacherInput").value = teacher.name;
    document.getElementById("waShort").value = teacher.shortName;
    document.getElementById("waTotal").value = teacher.periods;

    // 🔥 ONLY that teacher data load
    waData = waAllData
        .filter(d => d.teacher === name)
        .map(d => ({ ...d }));

    renderTable()

    // reload sections properly
    setTimeout(() => {
        updateSections()
    }, 0)

    updateCounts();
}

// ================= SUMMARY DELETE =================
async function tsDelete(name) {

    document.getElementById("waModalText").innerHTML =
        `Delete allotment for <b>${name}</b>?`

    document.getElementById("waModal").style.display = "flex"

    const btn =
        document.querySelector(".wa-modal-actions button")

    btn.onclick = async () => {

        await fetch(
            "https://timetable-1j8i.onrender.com/api/workallot/" +
            encodeURIComponent(name),
            { method: "DELETE" }
        )

        await loadAllotedData()

        closeWAModal()

        btn.onclick = closeWAModal
    }
}

function renderTeacherSummaryTable() {

    const tbody = document.querySelector("#tsTable tbody")
    tbody.innerHTML = ""

    teacherSummaryData.forEach(t => {

        tbody.innerHTML += `
            <tr>
                <td>${t.sr}</td>
                <td>${t.name}</td>
                <td>${t.short}</td>
                <td>${t.total}</td>
                <td>${t.assigned}</td>
                <td>${t.remaining}</td>
                <td>
                    <button onclick="tsEdit('${t.name}')">Edit</button>
                    <button onclick="tsDelete('${t.name}')">Delete</button>
                </td>
            </tr>
        `
    })
    // Optional: DataTable refresh
    if ($.fn.DataTable.isDataTable('#allotedTable')) {
        $('#allotedTable').DataTable().destroy()
    }
    $('#allotedTable').DataTable()
}


document.getElementById("tsSearch").addEventListener("input", function () {
    const val = this.value.toLowerCase()
    const tbody = document.querySelector("#allotedTable tbody")
    Array.from(tbody.rows).forEach(row => {
        const name = row.cells[1].innerText.toLowerCase()
        row.style.display = name.includes(val) ? "" : "none"
    })
})

function resetWAForm() {
    waTeacher = null
    waEditingIndex = null

    document.getElementById("waTeacherInput").value = ""
    document.getElementById("waShort").value = ""
    document.getElementById("waTotal").value = ""
    document.getElementById("waRemaining").value = ""
    document.getElementById("waPeriods").value = ""

    document.querySelector("#waTable tbody").innerHTML = ""
    document.getElementById("waAssigned").innerText = "0"

    // dropdown reload (important)
    loadClasses()
    loadSubjects()
}