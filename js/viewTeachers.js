/* ===============================
   LOAD VIEW TEACHERS
================================ */
async function loadViewTeachers() {
    console.log("📥 Loading View Teachers...");

    try {
        const res = await fetch("https://timetable-1j8i.onrender.com/api/teachers");
        const data = await res.json();

        console.log("✅ Data:", data);

        renderViewTeachers(data);

    } catch (err) {
        console.error("❌ Error:", err);
    }
}

/* ===============================
   RENDER TABLE
================================ */
function renderViewTeachers(data) {

    const table = $("#viewTeachersTable");

    // Destroy old DataTable
    if ($.fn.DataTable.isDataTable("#viewTeachersTable")) {
        table.DataTable().clear().destroy();
    }

    const tbody = document.querySelector("#viewTeachersTable tbody");
    tbody.innerHTML = "";

    data.forEach((t, i) => {
        tbody.innerHTML += `
            <tr>
                <td>${i + 1}</td>
                <td>${t.name || ""}</td>
                <td>${t.shortName || ""}</td>
                <td>${(t.classes || [])
                .filter(c => c !== "on")
                .map(c => c.replace("Class ", ""))
                .join(", ")
            }</td>
                <td>${t.periods || 0}</td>
                <td>
                    <button onclick="editTeacherFromView('${t._id}')">Edit</button>
                    <button onclick="deleteTeacherFromView('${t._id}')">Delete</button>
                </td>
            </tr>
        `;
    });

    // Re-init DataTable
    setTimeout(() => {
        $("#viewTeachersTable").DataTable({
            pageLength: 10,
            searching: true,
            ordering: true,
            responsive: true,
            columnDefs: [
                { className: "dt-center", targets: "_all" }
            ]
        });
    }, 200);
}

/* ===============================
   DELETE TEACHER
================================ */
async function deleteTeacherFromView(id) {
    if (!confirm("Delete teacher?")) return;

    try {
        await fetch(`https://timetable-1j8i.onrender.com/api/teachers/${id}`, {
            method: "DELETE"
        });

        loadViewTeachers();

    } catch (err) {
        console.error("Delete error:", err);
    }
}

/* ===============================
   EDIT (TEMP)
================================ */
function editTeacherFromView(id) {
    alert("Edit teacher ID: " + id);
}

// Edit Function 
function editTeacherFromView(id) {

    // localStorage me data store
    localStorage.setItem("editTeacherId", id);

    // teachers page open karo
    showPage("teachers");
}
// pre fill logic
async function loadTeacherForEdit() {

    const id = localStorage.getItem("editTeacherId");
    if (!id) return;

    try {
        const res = await fetch("https://timetable-1j8i.onrender.com/api/teachers");
        const data = await res.json();

        const teacher = data.find(t => t._id === id);
        if (!teacher) return;

        editTeacherId = id;

        // 🔥 Fill form
        document.getElementById("teacherName").value = teacher.name || "";
        document.getElementById("teacherShort").value = teacher.shortName || "";
        document.getElementById("teacherPeriods").value = teacher.periods || 0;

        // Classes check
        document.querySelectorAll("#classesCheckboxes input[type=checkbox]")
            .forEach(chk => {
                chk.checked = teacher.classes?.includes(chk.value) || false;
            });

        // Subjects check
        document.querySelectorAll("#subjectsCheckboxes input[type=checkbox]")
            .forEach(chk => {
                chk.checked = teacher.subjects?.includes(chk.value) || false;
            });

        // clear storage
        localStorage.removeItem("editTeacherId");

    } catch (err) {
        console.error(err);
    }
}