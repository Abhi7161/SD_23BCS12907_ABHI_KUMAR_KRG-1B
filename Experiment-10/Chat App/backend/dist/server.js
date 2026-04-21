import "./Utils/dotenv.js";
import express from "express";
import connectDB from "./Utils/db.js";
const app = express();
const PORT = process.env.PORT || 5000;
/* Middleware */
app.use(express.json());
/* Connect Database */
connectDB();
/* Test Route */
app.get("/", (req, res) => {
    res.send("Server is running successfully");
});
/* Start Server */
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
//# sourceMappingURL=server.js.map