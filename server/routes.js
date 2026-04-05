const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");


/* =========================
SCHEMAS
========================= */


// Admin schema
const adminSchema = new mongoose.Schema({
    username: String,
    password: String
}, { strict: false });

const Admin = mongoose.model("Admin", adminSchema);

// POST /api/admin/login
router.post("/admin/login", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password)
        return res.status(400).json({ message: "Enter username and password" });

    const admin = await Admin.findOne({ username });

    if (!admin) return res.status(401).json({ message: "Invalid username or password" });
    if (admin.password !== password)
        return res.status(401).json({ message: "Invalid username or password" });

    res.status(200).json({ message: "Login successful" });
});


const subjectSchema = new mongoose.Schema({}, { strict:false });
const classSchema = new mongoose.Schema({}, { strict:false });
const teacherSchema = new mongoose.Schema({}, { strict:false });
const workSchema = new mongoose.Schema({}, { strict:false });

const Subject = mongoose.model("Subject", subjectSchema);
const Class = mongoose.model("Class", classSchema);
const Teacher = mongoose.model("Teacher", teacherSchema);
const Work = mongoose.model("Work", workSchema);



/* =========================
SUBJECTS
========================= */

router.post("/subjects", async (req, res) => {

await Subject.deleteMany();
await Subject.insertMany(req.body);

res.json({ success: true });

});

router.get("/subjects", async (req, res) => {

const data = await Subject.find();
res.json(data);

});


/* =========================
CLASSES
========================= */

router.post("/classes", async (req, res) => {

await Class.deleteMany();
await Class.insertMany(req.body);

res.json({ success: true });

});

router.get("/classes", async (req, res) => {

const data = await Class.find();
res.json(data);

});


/* =========================
TEACHERS
========================= */
// POST /teachers
router.post("/teachers", async (req, res) => {
  try {
    const t = req.body; // single teacher object from frontend
    const exists = await Teacher.findOne({ name: t.name });

    if (exists) {
      return res.status(400).json({ error: "Teacher already exists" });
    }

    const newTeacher = await Teacher.create(t);
    res.json(newTeacher); // return the saved teacher
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /teachers (fetch all teachers)
router.get("/teachers", async (req, res) => {
  try {
    const teachers = await Teacher.find(); // fetch all teachers
    res.json(teachers); // return array
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
// PUT /teachers/:id - UPDATE
router.put("/teachers/:id", async (req, res) => {
  try {
    const teacherId = req.params.id;
    const updateData = req.body;
    
    const updatedTeacher = await Teacher.findByIdAndUpdate(
      teacherId, 
      updateData, 
      { new: true }
    );
    
    if (!updatedTeacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }
    
    res.json(updatedTeacher);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /teachers/:id
router.delete("/teachers/:id", async (req, res) => {
  try {
    const teacherId = req.params.id;
    
    const deletedTeacher = await Teacher.findByIdAndDelete(teacherId);
    
    if (!deletedTeacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


/* =========================
WORK ALLOTMENT
========================= */

router.post("/workallot", async (req, res) => {

    try {

        const teacher = req.body.teacher

        // remove only that teacher data
        await Work.deleteOne({ teacher: teacher })

        // insert new
        await Work.create(req.body)

        res.json({ success: true })

    } catch (err) {

        res.status(500).json({ error: "Save failed" })

    }

});


// ==========================WORK ALLOTMENT GET & DELETE==========================

router.get("/workallot", async (req, res) => {

    const data = await Work.find();
    res.json(data);

});


router.delete("/workallot/:teacher", async (req, res) => {

    try {

        const teacher = req.params.teacher

        await Work.deleteOne({ teacher: teacher })

        res.json({ success: true })

    } catch (err) {

        res.status(500).json({ error: "Delete failed" })

    }

});



/* =========================
TIMETABLE (FINAL)
========================= */

// Schema (table = final)
const finalSchema = new mongoose.Schema({
    timetable_data: { type: Object, required: true },
    created_at: { type: Date, default: Date.now }
});

const Final = mongoose.model("Final", finalSchema);

/* =========================
ROUTES
========================= */

// ✅ SAVE TIMETABLE
// POST /api/final
router.post("/final", async (req, res) => {
    try {
        const timetableData = req.body; // accept raw object from frontend
        if (!timetableData || Object.keys(timetableData).length === 0) {
            return res.status(400).json({ error: "No timetable data provided" });
        }

        // delete old data (optional)
        await Final.deleteMany();

        // save new timetable
        await Final.create({ timetable_data: timetableData });

        res.json({ success: true, message: "Timetable saved ✅" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Save failed ❌" });
    }
});

// ✅ GET TIMETABLE
// GET /api/timetable
router.get("/timetable", async (req, res) => {
    try {
        const data = await Final.findOne().sort({ created_at: -1 });
        if (!data) return res.json({});
        res.json(data.timetable_data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Fetch failed ❌" });
    }
});

// ✅ DELETE TIMETABLE
// DELETE /api/timetable
router.delete("/timetable", async (req, res) => {
    try {
        await Final.deleteMany();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Delete failed ❌" });
    }
});


// Manual Get Timetable (for manual page)
router.post("/workallot", async (req, res) => {
    try {
        const data = req.body;

        // 🔥 handle array or single object
        if (Array.isArray(data)) {
            await Work.insertMany(data);
        } else {
            await Work.create(data);
        }

        res.json({ success: true });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Save failed" });
    }
});

router.get("/workallot", async (req, res) => {
    try {
        const data = await Work.find();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: "Fetch failed" });
    }
});

router.delete("/workallot", async (req, res) => {
    try {
        await Work.deleteMany();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Delete failed" });
    }
});

router.delete("/workallot/:id", async (req, res) => {
    try {
        await Work.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Delete failed" });
    }
});

router.post("/manual-save", async (req,res)=>{

    const data = req.body;

    await WorkAllot.findOneAndUpdate(
        {
            name: data.name
        },
        data,
        {
            upsert:true
        }
    );

    res.send({success:true});

});


/* =========================
SUBSTITUTE TEACHER
========================= */

// POST /api/substitute
// Body: { day: "Mon", absentTeacher: "Mr. A" }
router.post("/substitute", async (req, res) => {
    try {
        const { day, absentTeacher } = req.body;

        if (!day || !absentTeacher) {
            return res.status(400).json({ error: "Day and Absent Teacher are required" });
        }

        // Fetch latest timetable
        const finalData = await Final.findOne().sort({ created_at: -1 });
        if (!finalData) return res.status(404).json({ error: "No timetable found" });

        const timetable = finalData.timetable_data;

        // Track teacher free periods per day
        const teacherFreeCount = {}; // { "Mr. B": 3, "Ms. C": 2 }

        Object.keys(timetable).forEach(cls => {
            timetable[cls].forEach(row => {
                if (row.day === day) {
                    row.periods.forEach(p => {
                        const teacher = p.teacher;
                        if (teacher && teacher !== absentTeacher) {
                            if (!teacherFreeCount[teacher]) teacherFreeCount[teacher] = 0;
                            if (!p.subject || p.subject === "Free") teacherFreeCount[teacher]++;
                        }
                    });
                }
            });
        });

        // Find teacher(s) with maximum free periods
        const maxFree = Math.max(...Object.values(teacherFreeCount));
        const substitutes = Object.keys(teacherFreeCount).filter(t => teacherFreeCount[t] === maxFree);

        res.json({ substitutes, maxFree });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;