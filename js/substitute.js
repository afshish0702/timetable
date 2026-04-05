// substitute.js (DB-based)
document.addEventListener("DOMContentLoaded", async () => {
    const teacherSelect = document.getElementById("absentTeacherSelect");
    teacherSelect.innerHTML = `<option value="">Select Absent Teacher</option>`;

    try {
        const res = await fetch("https://timetable-1j8i.onrender.com/api/teachers"); // DB API
        const teachers = await res.json(); // [{name, short, classes: [], subjects: []}]
        window.allTeachers = teachers;

        teachers.forEach(t => {
            const opt = document.createElement("option");
            opt.value = t.name;
            opt.innerText = t.name;
            teacherSelect.appendChild(opt);
        });

        console.log("Teachers loaded:", teachers);
    } catch (err) {
        console.error("Error fetching teachers:", err);
    }

    const subBtn = document.querySelector("button[onclick='getSubstituteTeacher()']");
    if (subBtn) subBtn.addEventListener("click", getSubstituteTeacher);
});

function getSubstituteTeacher() {
    const absentTeacherName = document.getElementById("absentTeacherSelect").value;
    if (!absentTeacherName || !window.allTeachers) {
        alert("Select teacher and ensure teachers loaded");
        return;
    }

    // 🔹 Find absent teacher data
    const absentTeacher = window.allTeachers.find(t => t.name === absentTeacherName);
    if (!absentTeacher) {
        alert("Absent teacher data not found!");
        return;
    }

    // 🔹 Compare with other teachers
    let bestSubstitute = null;
    let maxOverlap = -1;

    window.allTeachers.forEach(t => {
        if (t.name === absentTeacherName) return; // skip self

        // Count overlapping classes & subjects
        const classOverlap = t.classes.filter(c => absentTeacher.classes.includes(c)).length;
        const subjectOverlap = t.subjects.filter(s => absentTeacher.subjects.includes(s)).length;
        const totalOverlap = classOverlap + subjectOverlap;

        if (totalOverlap > maxOverlap) {
            maxOverlap = totalOverlap;
            bestSubstitute = t;
        }
    });

    // 🔹 Display
    const resDiv = document.getElementById("substituteResult");
    if (!bestSubstitute) {
        resDiv.innerHTML = `<h3>Substitute Teacher for ${absentTeacherName}:</h3><p>No similar substitute found.</p>`;
    } else {
        resDiv.innerHTML = `
            <h3>Substitute Teacher for ${absentTeacherName}:</h3>
            <table border="1" style="width:100%; text-align:center; margin-top:10px;">
                <tr><th>Teacher Name</th><th>Short Name</th></tr>
                <tr><td>${bestSubstitute.name}</td><td>${bestSubstitute.shortName}</td></tr>
            </table>
        `;
    }

    console.log("Selected substitute:", bestSubstitute);
}