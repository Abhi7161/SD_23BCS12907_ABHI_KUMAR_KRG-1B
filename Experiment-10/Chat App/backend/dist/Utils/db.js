import mongoose from "mongoose";
async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Database Connected");
    }
    catch (error) {
        console.log("Database Error:", error);
        process.exit(1);
    }
}
export default connectDB;
//# sourceMappingURL=db.js.map