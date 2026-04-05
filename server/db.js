const mongoose = require("mongoose");

const connectDB = async () => {
try {

await mongoose.connect(
"mongodb+srv://aftab:aftab0702@cluster0.8cs16pr.mongodb.net/timetable?retryWrites=true&w=majority",
{
useNewUrlParser: true,
useUnifiedTopology: true
}
);

console.log("MongoDB Atlas Connected");

} catch (error) {

console.log("DB Error:", error);
process.exit(1);

}
};

module.exports = connectDB;